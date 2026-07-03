"use client";

import { useMemo, useState } from "react";
import { Trophy01 } from "@untitledui/icons";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { useLeaderboard } from "@/hooks/api/use-leaderboard";
import type { LeaderboardEntry } from "@/hooks/api/use-leaderboard";
import { Avatar } from "@/components/base/avatar/avatar";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { useFaculties } from "@/hooks/api/use-faculty";
import { useYearLevels } from "@/hooks/api/use-year-level";
import { useAdminClubs } from "@/hooks/api/use-clubs-admin";

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

export default function CoinsLeaderboardPage() {
  const now = new Date();
  const [page, setPage] = useState(1);
  const [periodType, setPeriodType] = useState<"ALL_TIME" | "YEARLY" | "MONTHLY">("ALL_TIME");
  const [facultyId, setFacultyId] = useState<string>("");
  const [yearLevelId, setYearLevelId] = useState<string>("");
  const [clubId, setClubId] = useState<string>("");
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const { data: faculties } = useFaculties();
  const { data: yearLevels } = useYearLevels();
  const { data: clubsData } = useAdminClubs("", "ACTIVE", 1, 100);
  const clubs = clubsData?.results ?? [];

  // Academic-year start for YEARLY; calendar month for MONTHLY.
  const periodYear =
    periodType === "MONTHLY" ? year
    : periodType === "YEARLY" ? (now.getMonth() + 1 >= 9 ? now.getFullYear() : now.getFullYear() - 1)
    : undefined;

  const { data } = useLeaderboard({
    page,
    page_size: 20,
    period_type: periodType,
    period_year: periodYear,
    period_month: periodType === "MONTHLY" ? month : undefined,
    faculty_public_id: facultyId || undefined,
    year_level_public_id: yearLevelId || undefined,
    club_public_id: clubId || undefined,
  });

  const columns = useMemo<DataTableColumn<LeaderboardEntry>[]>(() => [
    {
      id: "rank",
      header: "O'rin",
      headClassName: "w-[80px]",
      cell: (row) => {
        if (row.rank === 1) return <img src="/places/1st-place.png" alt="1-o'rin" className="w-8 h-8 object-contain shrink-0 drop-shadow-sm" title="1-o'rin" />;
        if (row.rank === 2) return <img src="/places/2nd-place.png" alt="2-o'rin" className="w-8 h-8 object-contain shrink-0 drop-shadow-sm" title="2-o'rin" />;
        if (row.rank === 3) return <img src="/places/3rd-place.png" alt="3-o'rin" className="w-8 h-8 object-contain shrink-0 drop-shadow-sm" title="3-o'rin" />;

        return (
          <span className="tabular-nums text-tertiary font-bold pl-1">
            #{row.rank || "—"}
          </span>
        );
      },
    },
    {
      id: "student",
      header: "Talaba",
      isRowHeader: true,
      cell: (row) => {
        // Fallback to initials if no profile photo.
        // We can get initials from the first 2 words of full_name.
        const nameParts = (row.full_name || "").split(" ");
        const initials = nameParts.length >= 2 
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : (nameParts[0]?.[0] || "").toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar 
              src={row.profile_photo} 
              initials={initials}
              size="sm"
            />
            <span className="text-sm font-semibold text-primary">
              {row.full_name || "—"}
            </span>
          </div>
        );
      },
    },
    {
      id: "faculty",
      header: "Fakultet",
      cell: (row) => (
        <span className="text-sm text-secondary truncate max-w-[200px] block">
          {row.faculty || "—"}
        </span>
      ),
    },
    {
      id: "year",
      header: "Kurs",
      cell: (row) => (
        <span className="text-sm text-secondary">
          {row.year_level || "—"}
        </span>
      ),
    },
    {
      id: "coins",
      header: "Jami Ballar",
      cell: (row) => (
        <span className="text-sm font-bold text-brand-solid tabular-nums flex items-center gap-1">
          {row.total_coins.toLocaleString()}
          <CoinOutlineIcon size={16} strokeWidth={24} className="text-brand-500" />
        </span>
      ),
    },
  ], []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reytinglar" },
        ]}
        title="Talabalar Reytingi"
        subtitle="Universitet miqyosida talabalar faolligi reytingi"
        icon={Trophy01}
      />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="flex flex-col gap-3 border-b border-secondary px-5 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg self-start">
              {([
                { id: "ALL_TIME", label: "Barcha vaqt" },
                { id: "YEARLY", label: "Yillik" },
                { id: "MONTHLY", label: "Oylik" },
              ] as const).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPeriodType(p.id); setPage(1); }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${periodType === p.id ? "bg-brand-solid text-white shadow-sm" : "text-tertiary hover:text-secondary"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <div className="w-full sm:w-52">
                <Select
                  aria-label="Fakultet filteri"
                  placeholder="Fakultet"
                  selectedKey={facultyId || "all"}
                  onSelectionChange={(k) => { setFacultyId(k === "all" ? "" : (k as string)); setPage(1); }}
                  items={[
                    { id: "all", label: "Fakultet: Barchasi" },
                    ...(faculties?.map((f: any) => ({ id: f.public_id, label: f.name })) || []),
                  ]}
                >
                  {(f) => <SelectItem id={f.id}>{f.label}</SelectItem>}
                </Select>
              </div>
              <div className="w-full sm:w-44">
                <Select
                  aria-label="Kurs filteri"
                  placeholder="Kurs"
                  selectedKey={yearLevelId || "all"}
                  onSelectionChange={(k) => { setYearLevelId(k === "all" ? "" : (k as string)); setPage(1); }}
                  items={[
                    { id: "all", label: "Kurs: Barchasi" },
                    ...(yearLevels?.map((yl: any) => ({ id: yl.public_id, label: yl.name })) || []),
                  ]}
                >
                  {(yl) => <SelectItem id={yl.id}>{yl.label}</SelectItem>}
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select
                  aria-label="Klub filteri"
                  placeholder="Klub"
                  selectedKey={clubId || "all"}
                  onSelectionChange={(k) => { setClubId(k === "all" ? "" : (k as string)); setPage(1); }}
                  items={[
                    { id: "all", label: "Klub: Barchasi" },
                    ...clubs.map((c: any) => ({ id: c.public_id, label: c.name })),
                  ]}
                >
                  {(c) => <SelectItem id={c.id}>{c.label}</SelectItem>}
                </Select>
              </div>
            </div>
          </div>

          {/* Month/year picker — only for the monthly leaderboard */}
          {periodType === "MONTHLY" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">Oy:</span>
              <div className="w-full sm:w-40">
                <Select
                  aria-label="Oy"
                  selectedKey={String(month)}
                  onSelectionChange={(k) => { setMonth(Number(k)); setPage(1); }}
                  items={MONTHS.map((m, i) => ({ id: String(i + 1), label: m }))}
                >
                  {(m) => <SelectItem id={m.id}>{m.label}</SelectItem>}
                </Select>
              </div>
              <div className="w-full sm:w-32">
                <Select
                  aria-label="Yil"
                  selectedKey={String(year)}
                  onSelectionChange={(k) => { setYear(Number(k)); setPage(1); }}
                  items={Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map((y) => ({ id: String(y), label: String(y) }))}
                >
                  {(y) => <SelectItem id={y.id}>{y.label}</SelectItem>}
                </Select>
              </div>
            </div>
          )}
        </div>
        <div className="p-5">
          <DataTable
            ariaLabel="Reytinglar"
            data={data?.results || []}
            columns={columns}
            rowKey="student_public_id"
            isLoading={data === undefined}
            emptyTitle="Reyting bo'sh"
            emptyDescription="Hali hech kim ball yig'madi."
            pagination={{
              page: page,
              total: Math.ceil((data?.count ?? data?.pagination?.total_items ?? 0) / 20) || 1,
              onPageChange: setPage,
              showRange: true,
              totalItems: data?.count ?? data?.pagination?.total_items ?? 0,
              pageSize: 20,
            }}
          />
        </div>
      </div>
    </div>
  );
}
