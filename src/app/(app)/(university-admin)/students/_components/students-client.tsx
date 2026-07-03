"use client";

import { Fragment, useState, useEffect } from "react";
import { toast } from "sonner";
import { Users01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

import { DataTable } from "@/components/application/table/data-table";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { IssueCoinModal } from "../../coins-system/_components/issue-coin-modal";
import { Badge } from "@/components/base/badges/badges";

import {
  approvedStudentColumns,
  waitedStudentColumns,
  rejectedStudentColumns,
  type ApprovedStudentRow,
  type WaitedStudentRow,
} from "./student-columns";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { SearchSm } from "@untitledui/icons";
import { useFaculties } from "@/hooks/api/use-faculty";
import { usePermissions } from "@/hooks/use-permissions";
import { useYearLevels } from "@/hooks/api/use-year-level";
import { useStudents, useWaitedStudentsCount } from "@/hooks/api/use-students";
import { useDebounce } from "@/hooks/use-debounce";
import { useSession } from "next-auth/react";

// ── Tab config ─────────────────────────────────────────────────────────────
type TabId = "approved" | "waited" | "rejected";

const TABS: { id: TabId; label: string }[] = [
  { id: "approved", label: "Tasdiqlangan" },
  { id: "waited", label: "Kutilmoqda" },
  { id: "rejected", label: "Rad qilingan" },
];

// ── Component ─────────────────────────────────────────────────────────────
export function StudentsClient() {
  const { status: sessionStatus } = useSession();
  const { can } = usePermissions();
  const canAward = can("coins.award");
  const canPenalty = can("coins.penalty");
  const [activeTab, setActiveTab] = useState<TabId>("approved");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyId, setFacultyId] = useState<string>("");
  const [yearLevelId, setYearLevelId] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [issueCoinStudent, setIssueCoinStudent] = useState<{ student: { id: string; name: string; balance?: number }, type: "reward" | "penalty" } | null>(null);

  const { data: waitedMeta } = useWaitedStudentsCount();
  const { data: faculties } = useFaculties();
  const { data: yearLevels } = useYearLevels();

  const { data, isLoading, isError, refetch } = useStudents({
    page,
    page_size: 50,  // Backend default limit - 50 tadan
    search: debouncedSearch,
    status: activeTab,
    faculty_id: facultyId || undefined,
    year_level_id: yearLevelId || undefined,
    gender: gender || undefined,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Talabalarni yuklashda xatolik", {
        description: "Ma'lumotlar yuklanmadi. Sahifani yangilang.",
      });
    }
  }, [isError]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setPage(1);
    setSearchTerm("");
    setFacultyId("");
    setYearLevelId("");
    setGender("");
  };

  // ── Build rows per active tab
  const approvedRows: ApprovedStudentRow[] =
    activeTab === "approved"
      ? (data?.results || []).map((s) => ({
        ...s,
        canAward,
        canPenalty,
        onIssueCoin: () => setIssueCoinStudent({ student: { id: s.user_public_id, name: s.full_name || "Ism yo'q", balance: s.coins_balance }, type: "reward" }),
        onIssuePenalty: () => setIssueCoinStudent({ student: { id: s.user_public_id, name: s.full_name || "Ism yo'q", balance: s.coins_balance }, type: "penalty" }),
      }))
      : [];

  const waitedRows: WaitedStudentRow[] =
    activeTab === "waited"
      ? (data?.results || []).map((s) => ({ ...s, onSuccess: refetch }))
      : [];

  const rejectedRows = activeTab === "rejected" ? data?.results || [] : [];

  const currentColumns =
    activeTab === "approved" ? approvedStudentColumns :
      activeTab === "waited" ? waitedStudentColumns :
        rejectedStudentColumns;

  const currentData =
    activeTab === "approved" ? approvedRows :
      activeTab === "waited" ? waitedRows :
        rejectedRows;

  const waitedCount = waitedMeta?.waited_students_count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Talabalar" },
        ]}
        title="Talabalar"
        subtitle="Universitetdagi barcha talabalarni boshqarish va ko'rish paneli."
        icon={Users01}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-full sm:w-72">
          <Input
            icon={SearchSm}
            placeholder="Ism yoki talaba ID bo'yicha qidiring..."
            value={searchTerm}
            onChange={(val) => { setSearchTerm(val); setPage(1); }}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            aria-label="Fakultet filteri"
            placeholder="Fakultet"
            selectedKey={facultyId || "all"}
            onSelectionChange={(k) => { setFacultyId(k === "all" ? "" : k as string); setPage(1); }}
            items={[
              { id: "all", label: "Fakultet: Barchasi" },
              ...(faculties?.map((f) => ({ id: f.public_id, label: f.name })) || []),
            ]}
          >
            {(f) => <SelectItem id={f.id}>{f.label}</SelectItem>}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select
            aria-label="Kurs filteri"
            placeholder="Kurs"
            selectedKey={yearLevelId || "all"}
            onSelectionChange={(k) => { setYearLevelId(k === "all" ? "" : k as string); setPage(1); }}
            items={[
              { id: "all", label: "Kurs: Barchasi" },
              ...(yearLevels?.map((yl) => ({ id: yl.public_id, label: yl.name })) || []),
            ]}
          >
            {(yl) => <SelectItem id={yl.id}>{yl.label}</SelectItem>}
          </Select>
        </div>
        <div className="w-full sm:w-40">
          <Select
            aria-label="Jins filteri"
            placeholder="Jins"
            selectedKey={gender || "all"}
            onSelectionChange={(k) => { setGender(k === "all" ? "" : k as string); setPage(1); }}
            items={[{ id: "all", label: "Jins: Barchasi" }, { id: "male", label: "Erkak" }, { id: "female", label: "Ayol" }]}
          >
            {(g) => <SelectItem id={g.id}>{g.label}</SelectItem>}
          </Select>
        </div>
        {(searchTerm || facultyId || yearLevelId || gender) && (
          <Button
            color="primary"
            onClick={() => { setSearchTerm(""); setFacultyId(""); setYearLevelId(""); setGender(""); setPage(1); }}
          >
            Tozalash
          </Button>
        )}
      </div>

      {/* ── Tabli karta ────────────────────────────────────────────────── */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary p-5">

        {/* Tab strip */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg overflow-x-auto w-full sm:w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cx(
                  "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex-1 sm:flex-none flex items-center justify-center gap-1.5",
                  activeTab === tab.id
                    ? "bg-brand-solid text-white shadow-sm"
                    : "text-tertiary hover:text-secondary"
                )}
              >
                {tab.label}
                {tab.id === "waited" && waitedCount > 0 && (
                  <Badge color={activeTab === "waited" ? "gray" : "brand"} size="sm" className={cx(
                    activeTab === "waited" ? "!bg-white/20 !text-white !ring-transparent" : "!bg-brand-solid !text-white !ring-brand-solid",
                    "shadow-sm ml-1"
                  )}>
                    +{waitedCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <DataTable
            ariaLabel="Talabalar ro'yxati"
            data={currentData as any}
            columns={currentColumns as any}
            rowKey="user_public_id"
            isLoading={sessionStatus === "loading" || isLoading}
            emptyTitle={
              searchTerm
                ? "Talaba topilmadi"
                : activeTab === "approved"
                  ? "Tasdiqlangan talabalar yo'q"
                  : activeTab === "waited"
                    ? "Kutilayotgan arizalar yo'q"
                    : "Rad qilingan talabalar yo'q"
            }
            emptyDescription={
              searchTerm
                ? "Boshqa kalit so'z bilan qidiring."
                : activeTab === "waited"
                  ? "Yangi arizalar kelib tushganda bu yerda ko'rinadi."
                  : undefined
            }
            pagination={
              data && data.pagination
                ? {
                    page,
                    total: data.pagination.total_pages || 1,
                    onPageChange: setPage,
                    showRange: true,
                    totalItems: data.pagination.total_items,
                    pageSize: data.pagination.page_size,
                  }
                : undefined
            }

          />
      </div>

      {issueCoinStudent && (
        <IssueCoinModal
          isOpen={!!issueCoinStudent}
          onClose={() => setIssueCoinStudent(null)}
          preselectedStudent={issueCoinStudent.student}
          ruleType={issueCoinStudent.type}
        />
      )}


    </div>
  );
}
