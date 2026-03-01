"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw01, Trash01, Coins01 } from "@untitledui/icons";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { Button } from "@/components/base/buttons/button";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { useTransactions } from "@/hooks/api/use-transactions";
import type { Transaction } from "@/hooks/api/use-transactions";
import { useSession } from "next-auth/react";
import { IssueCoinModal } from "../../coins-system/_components/issue-coin-modal";
import { DeleteTransactionModal } from "../../coins-system/_components/delete-transaction-modal";
import { cx } from "@/utils/cx";

interface StudentTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: { id: string; name: string };
}

export function StudentTransactionsModal({ isOpen, onClose, student }: StudentTransactionsModalProps) {
  const { data: session } = useSession();
  const isStaff = session?.user?.role === "staff";

  const [page, setPage] = useState(1);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; amount: number } | null>(null);

  const { data, isLoading } = useTransactions({
    user_public_id: student.id,
    page,
    page_size: 10,
  });

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
        <span className="text-sm text-secondary truncate block max-w-[160px]" title={row.coin_rule_name}>
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

  return (
    <>
      <PremiumFormModal
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) onClose(); }}
        title={`${student.name} — Tranzaksiyalar`}
        description="Talabaning barcha ball operatsiyalari tarixi."
        icon={Coins01}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-sm text-tertiary tabular-nums">
              {data ? `Jami: ${data.count} ta` : ""}
            </span>
            <div className="flex items-center gap-2">
              {data && data.count > 10 && (
                <>
                  <Button size="sm" color="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1}>←</Button>
                  <span className="text-sm text-secondary tabular-nums px-1">{page}</span>
                  <Button size="sm" color="secondary" onClick={() => setPage((p) => p + 1)} isDisabled={page * 10 >= data.count}>→</Button>
                </>
              )}
              {isStaff && (
                <Button iconLeading={Coins01} onClick={() => setIsIssueModalOpen(true)}>
                  Ball berish
                </Button>
              )}
              <Button color="secondary" onClick={onClose}>Yopish</Button>
            </div>
          </div>
        }
      >
        <DataTable
          ariaLabel="Tranzaksiyalar"
          data={data?.results || []}
          columns={columns}
          rowKey="transaction_public_id"
          isLoading={isLoading}
          emptyTitle="Tranzaksiyalar yo'q"
          emptyDescription="Bu talabaga hali hech qanday ball amali bajarilmagan."
        />
      </PremiumFormModal>

      {isIssueModalOpen && (
        <IssueCoinModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          preselectedStudent={student}
        />
      )}

      {deleteTarget && (
        <DeleteTransactionModal
          isOpen
          onClose={() => setDeleteTarget(null)}
          transactionPublicId={deleteTarget.id}
          amount={deleteTarget.amount}
          studentName={student.name}
        />
      )}
    </>
  );
}
