"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { DataTableColumn } from "@/components/application/table/data-table";
import type { Student } from "@/lib/api/types";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Eye, CheckCircle, XCircle, ClockRefresh } from "@untitledui/icons";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { useUpdateStudentStatus } from "@/hooks/api/use-students";

// ── Row types ──────────────────────────────────────────────────────────────
export type ApprovedStudentRow = Student & { onIssueCoin?: () => void };
export type WaitedStudentRow = Student & { onSuccess?: () => void };
export type RejectedStudentRow = Student;

// ── Coin icon wrapper (matches Button's iconLeading FC<{className?:string}>) ──
function CoinIconBtn({ className }: { className?: string }) {
  return <CoinOutlineIcon className={className} size={16} strokeWidth={24} />;
}

// ── Shared: avatar + name cell ─────────────────────────────────────────────
function StudentCell({ row }: { row: Student }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        src={row.profile_photo_url || undefined}
        initials={(row.full_name || "T").substring(0, 2).toUpperCase()}
        size="sm"
      />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-primary truncate">
          {row.full_name || "Ism ko'rsatilmagan"}
        </span>
        {row.university_student_id && (
          <span className="text-xs text-tertiary">
            ID: {row.university_student_id}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Waited: inline approve / reject ───────────────────────────────────────
function WaitedActions({ row }: { row: WaitedStudentRow }) {
  const { mutateAsync: updateStatus } = useUpdateStudentStatus();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handle = async (status: "approved" | "rejected") => {
    const key = status === "approved" ? "approve" : "reject";
    try {
      setLoading(key);
      await updateStatus({ id: row.user_public_id, status });
      toast.success(
        status === "approved"
          ? "Talaba muvaffaqiyatli tasdiqlandi"
          : "Talaba arizasi rad etildi"
      );
      row.onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "Xatolik yuz berdi");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/students/${row.user_public_id}`}>
        <Button color="secondary" size="sm" iconLeading={Eye}
          className="ring-1 ring-secondary shadow-xs" aria-label="Ko'rish">
          Ko&apos;rish
        </Button>
      </Link>

      <Tooltip title="Tasdiqlash" delay={200} color="success">
        <button
          onClick={() => handle("approved")}
          disabled={loading !== null}
          className="rounded-full p-1.5 text-success-600 hover:bg-success-50 dark:hover:bg-success-500/10 transition-colors disabled:opacity-50 focus:outline-none"
          aria-label="Tasdiqlash"
        >
          <CheckCircle className="size-6" />
        </button>
      </Tooltip>

      <Tooltip title="Rad etish" delay={200} color="error">
        <button
          onClick={() => handle("rejected")}
          disabled={loading !== null}
          className="rounded-full p-1.5 text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors disabled:opacity-50 focus:outline-none"
          aria-label="Rad etish"
        >
          <XCircle className="size-6" />
        </button>
      </Tooltip>
    </div>
  );
}

// ── APPROVED columns ──────────────────────────────────────────────────────
export const approvedStudentColumns: DataTableColumn<ApprovedStudentRow>[] = [
  {
    id: "index",
    header: "№",
    headClassName: "w-[50px]",
    cell: (_, i) => <span className="text-sm tabular-nums text-tertiary">{(i ?? 0) + 1}</span>,
  },
  {
    id: "student",
    header: "Talaba",
    isRowHeader: true,
    cell: (row) => <StudentCell row={row} />,
  },
  {
    id: "actions",
    header: "",
    headClassName: "w-[220px]",
    cell: (row) => (
      <div className="flex items-center justify-end gap-2">
        <Link href={`/students/${row.user_public_id}`}>
          <Button color="secondary" size="sm" iconLeading={Eye}
            className="ring-1 ring-secondary shadow-xs">
            Ko&apos;rish
          </Button>
        </Link>
        <Button color="secondary" size="sm" iconLeading={CoinIconBtn}
          onClick={() => row.onIssueCoin?.()}
          className="ring-1 ring-secondary shadow-xs">
          Ball berish
        </Button>
        <Tooltip title="Tranzaksiyalar" delay={200} color="success">
          <Link href={`/students/${row.user_public_id}/transactions?name=${encodeURIComponent(row.full_name || [row.name, row.surname, row.middle_name].filter(Boolean).join(" "))}`} aria-label="Tranzaksiyalar">
            <button
              className="rounded-full p-1.5 text-success-600 hover:bg-success-50 dark:hover:bg-success-500/10 transition-colors focus:outline-none"
              aria-label="Tranzaksiyalar"
            >
              <ClockRefresh className="size-6" />
            </button>
          </Link>
        </Tooltip>
      </div>
    ),
  },
];

// ── WAITED columns ────────────────────────────────────────────────────────
export const waitedStudentColumns: DataTableColumn<WaitedStudentRow>[] = [
  {
    id: "index",
    header: "№",
    headClassName: "w-[50px]",
    cell: (_, i) => <span className="text-sm tabular-nums text-tertiary">{(i ?? 0) + 1}</span>,
  },
  {
    id: "student",
    header: "Talaba",
    isRowHeader: true,
    cell: (row) => <StudentCell row={row} />,
  },
  {
    id: "actions",
    header: "",
    headClassName: "w-[180px]",
    cell: (row) => <WaitedActions row={row} />,
  },
];

// ── REJECTED columns ──────────────────────────────────────────────────────
export const rejectedStudentColumns: DataTableColumn<RejectedStudentRow>[] = [
  {
    id: "index",
    header: "№",
    headClassName: "w-[50px]",
    cell: (_, i) => <span className="text-sm tabular-nums text-tertiary">{(i ?? 0) + 1}</span>,
  },
  {
    id: "student",
    header: "Talaba",
    isRowHeader: true,
    cell: (row) => <StudentCell row={row} />,
  },
  {
    id: "actions",
    header: "",
    headClassName: "w-[110px]",
    cell: (row) => (
      <div className="flex items-center justify-end">
        <Link href={`/students/${row.user_public_id}`}>
          <Button color="secondary" size="sm" iconLeading={Eye}
            className="ring-1 ring-secondary shadow-xs">
            Ko&apos;rish
          </Button>
        </Link>
      </div>
    ),
  },
];
