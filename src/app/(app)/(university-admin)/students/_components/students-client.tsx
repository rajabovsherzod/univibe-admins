"use client";

import { Fragment, useState, useEffect } from "react";
import { toast } from "sonner";
import { Users01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

import { DataTable } from "@/components/application/table/data-table";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { IssueCoinModal } from "../../coins-system/_components/issue-coin-modal";

import {
  approvedStudentColumns,
  waitedStudentColumns,
  rejectedStudentColumns,
  type ApprovedStudentRow,
  type WaitedStudentRow,
} from "./student-columns";
import { useStudents, useWaitedStudentsCount } from "@/hooks/api/use-students";
import { useDebounce } from "@/hooks/use-debounce";
import { useSession } from "next-auth/react";

// ── Tab config ─────────────────────────────────────────────────────────────
type TabId = "approved" | "waited" | "rejected";

const TABS: { id: TabId; label: string }[] = [
  { id: "approved",  label: "Tasdiqlangan"  },
  { id: "waited",    label: "Kutilmoqda"    },
  { id: "rejected",  label: "Rad qilingan"  },
];

// ── Component ─────────────────────────────────────────────────────────────
export function StudentsClient() {
  const { status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("approved");
  const [page, setPage]           = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [issueCoinStudent, setIssueCoinStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: waitedMeta } = useWaitedStudentsCount();

  const { data, isLoading, isError, refetch } = useStudents({
    page,
    page_size: 10,
    search: debouncedSearch,
    status: activeTab,
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
  };

  // ── Build rows per active tab
  const approvedRows: ApprovedStudentRow[] =
    activeTab === "approved"
      ? (data?.results || []).map((s) => ({
          ...s,
          onIssueCoin: () =>
            setIssueCoinStudent({ id: s.user_public_id, name: s.full_name || "Ism yo'q" }),
        }))
      : [];

  const waitedRows: WaitedStudentRow[] =
    activeTab === "waited"
      ? (data?.results || []).map((s) => ({ ...s, onSuccess: refetch }))
      : [];

  const rejectedRows = activeTab === "rejected" ? data?.results || [] : [];

  const currentColumns =
    activeTab === "approved"  ? approvedStudentColumns  :
    activeTab === "waited"    ? waitedStudentColumns     :
                                rejectedStudentColumns;

  const currentData =
    activeTab === "approved"  ? approvedRows  :
    activeTab === "waited"    ? waitedRows    :
                                rejectedRows;

  const waitedCount = waitedMeta?.count ?? 0;

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
        showSearch
        searchValue={searchTerm}
        onSearch={(val) => { setSearchTerm(val); setPage(1); }}
        searchPlaceholder="Ism yoki talaba ID bo'yicha qidiring..."
      />

      {/* ── Tabli karta ────────────────────────────────────────────────── */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">

        {/* Tab strip */}
        <div className="border-b border-secondary bg-primary px-5 pt-4">
          <div className="flex w-max items-center gap-4">
            {TABS.map((tab, idx) => (
              <Fragment key={tab.id}>
                <button
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cx(
                    "flex items-center gap-1.5 pb-3 text-sm transition-all duration-200 outline-none border-b-2",
                    activeTab === tab.id
                      ? "border-brand-solid font-bold text-brand-solid"
                      : "border-transparent font-medium text-secondary hover:border-border-secondary hover:text-primary"
                  )}
                >
                  {tab.label}
                  {tab.id === "waited" && waitedCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warning-solid px-1.5 text-xs font-semibold text-white">
                      {waitedCount}
                    </span>
                  )}
                </button>
                {idx < TABS.length - 1 && (
                  <div className="mb-3 h-4 w-px bg-secondary" />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="p-5">
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
            pagination={{
              page,
              total: Math.ceil((data?.count || 0) / 10) || 1,
              onPageChange: setPage,
            }}
          />
        </div>
      </div>

      {/* Ball berish modali */}
      {issueCoinStudent && (
        <IssueCoinModal
          isOpen={!!issueCoinStudent}
          onClose={() => setIssueCoinStudent(null)}
          preselectedStudent={issueCoinStudent}
        />
      )}
    </div>
  );
}
