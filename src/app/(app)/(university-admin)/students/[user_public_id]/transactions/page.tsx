"use client";

import { useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw01, Trash01, ClockRefresh } from "@untitledui/icons";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { Button } from "@/components/base/buttons/button";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { useTransactions } from "@/hooks/api/use-transactions";
import type { Transaction } from "@/hooks/api/use-transactions";
import { useStudentDetail } from "@/hooks/api/use-students";
import { useSession } from "next-auth/react";
import { IssueCoinModal } from "../../../coins-system/_components/issue-coin-modal";
import { DeleteTransactionModal } from "../../../coins-system/_components/delete-transaction-modal";
import { cx } from "@/utils/cx";

function CoinIconBtn({ className }: { className?: string }) {
  return <CoinOutlineIcon className={className} size={16} strokeWidth={24} />;
}

interface Props {
  params: Promise<{ user_public_id: string }>;
}

export default function StudentTransactionsPage({ params }: Props) {
  const { user_public_id } = use(params);
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isStaff = session?.user?.role === "staff";

  const [page, setPage] = useState(1);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; amount: number } | null>(null);

  const { data: student } = useStudentDetail(user_public_id);
  const { data, isLoading } = useTransactions({ user_public_id, page, page_size: 10 });

  // full_name is optional in Student type — fallback to name+surname, then URL param
  const paramName = searchParams.get("name") || "";
  const resolvedName = student
    ? (student.full_name || [student.name, student.surname, student.middle_name].filter(Boolean).join(" ") || "Talaba")
    : paramName;

  const studentName = resolvedName;
  const pageTitle = resolvedName
    ? `${resolvedName} tranzaksiyalari`
    : <div className="h-7 w-52 rounded-md skeleton-shimmer" />;

  const columns: DataTableColumn<Transaction>[] = [
    {
      id: "index",
      header: "№",
      headClassName: "w-[50px]",
      cell: (_, i) => (
        <span className="text-sm tabular-nums text-tertiary">{(page - 1) * 10 + (i ?? 0) + 1}</span>
      ),
    },
    {
      id: "type",
      header: "Turi",
      isRowHeader: true,
      cell: (row) => {
        let Icon = ArrowUpRight;
        let colorClass = "text-success-primary bg-success-soft";
        let label = "Berildi";
        if (row.transaction_type === "DEDUCTION") {
          Icon = ArrowDownLeft;
          colorClass = "text-error-primary bg-error-soft";
          label = "Olib tashlandi";
        } else if (row.transaction_type === "TRANSFER") {
          Icon = RefreshCcw01;
          colorClass = "text-warning-primary bg-warning-soft";
          label = "O'tkazma";
        }
        return (
          <div className="flex items-center gap-2">
            <div className={cx("flex p-1.5 rounded-full", colorClass)}>
              <Icon className="size-3.5" />
            </div>
            <span className="text-sm font-medium text-primary">{label}</span>
          </div>
        );
      },
    },
    {
      id: "amount",
      header: "Miqdori",
      cell: (row) => {
        const isPositive = row.transaction_type === "ISSUANCE";
        return (
          <span className={cx("inline-flex items-center gap-1 text-sm font-bold tabular-nums", isPositive ? "text-success-solid" : "text-error-solid")}>
            {isPositive ? "+" : "-"}{row.amount.toLocaleString()}
            <CoinOutlineIcon size={13} color="currentColor" strokeWidth={24} />
          </span>
        );
      },
    },
    {
      id: "rule",
      header: "Qoida",
      cell: (row) => (
        <span className="text-sm text-secondary truncate block max-w-[200px]" title={row.coin_rule_name}>
          {row.coin_rule_name || "—"}
        </span>
      ),
    },
    {
      id: "staff",
      header: "Xodim",
      cell: (row) => (
        <span className="text-sm text-secondary">{row.staff_member_name || "—"}</span>
      ),
    },
    {
      id: "date",
      header: "Sana",
      cell: (row) => (
        <span className="text-sm text-tertiary tabular-nums whitespace-nowrap">
          {format(new Date(row.created_at), "dd.MM.yyyy HH:mm")}
        </span>
      ),
    },
    ...(isStaff ? [{
      id: "actions",
      header: "",
      headClassName: "w-12",
      cellClassName: "w-12",
      cell: (row: Transaction) => {
        if (row.transaction_type !== "ISSUANCE") return null;
        return (
          <button
            className="rounded-lg p-1.5 text-tertiary hover:bg-error-soft hover:text-error-primary transition-colors"
            onClick={() => setDeleteTarget({ id: row.transaction_public_id, amount: row.amount })}
            title="Bekor qilish"
          >
            <Trash01 className="size-4" />
          </button>
        );
      },
    } as DataTableColumn<Transaction>] : []),
  ];

  const preselectedStudent = { id: user_public_id, name: studentName || "Talaba" };

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Talabalar", href: "/students" },
          { label: resolvedName || "...", href: `/students/${user_public_id}` },
          { label: "Tranzaksiyalar" },
        ]}
        title={pageTitle}
        subtitle="Ball operatsiyalari tarixi"
        icon={ClockRefresh}
        actions={
          isStaff ? (
            <Button iconLeading={CoinIconBtn} onClick={() => setIsIssueModalOpen(true)}>
              Ball berish
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
        {data && (
          <div className="flex items-center justify-end border-b border-secondary px-5 py-3">
            <span className="text-sm text-tertiary tabular-nums">
              Jami: {data.count} ta tranzaksiya
            </span>
          </div>
        )}
        <div className="p-5">
          <DataTable
            ariaLabel="Tranzaksiyalar"
            data={data?.results || []}
            columns={columns}
            rowKey="transaction_public_id"
            isLoading={isLoading}
            emptyTitle="Tranzaksiyalar yo'q"
            emptyDescription="Bu talabaga hali hech qanday ball amali bajarilmagan."
            pagination={
              data && data.count > 10
                ? { page, total: Math.ceil(data.count / 10), onPageChange: setPage }
                : undefined
            }
          />
        </div>
      </div>

      {isIssueModalOpen && (
        <IssueCoinModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          preselectedStudent={preselectedStudent}
        />
      )}

      {deleteTarget && (
        <DeleteTransactionModal
          isOpen
          onClose={() => setDeleteTarget(null)}
          transactionPublicId={deleteTarget.id}
          amount={deleteTarget.amount}
          studentName={studentName || "Talaba"}
        />
      )}
    </div>
  );
}
