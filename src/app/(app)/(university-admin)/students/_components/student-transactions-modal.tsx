"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw01, Trash01, Coins01, ShoppingBag02 } from "@untitledui/icons";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { Button } from "@/components/base/buttons/button";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { useTransactions } from "@/hooks/api/use-transactions";
import type { Transaction } from "@/hooks/api/use-transactions";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { IssueCoinModal } from "../../coins-system/_components/issue-coin-modal";
import { DeleteTransactionModal } from "../../coins-system/_components/delete-transaction-modal";
import { cx } from "@/utils/cx";
import { usePermissions } from "@/hooks/use-permissions";

interface StudentTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: { id: string; name: string };
}

export function StudentTransactionsModal({ isOpen, onClose, student }: StudentTransactionsModalProps) {
  const { can } = usePermissions();
  const canAward = can("coins.award");
  const canPenalty = can("coins.penalty");
  const canDeleteTransaction = can("coins.transaction.delete");

  const [page, setPage] = useState(1);
  const [issueModalState, setIssueModalState] = useState<{ isOpen: boolean; type: "reward" | "penalty" }>({ isOpen: false, type: "reward" });
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
        if (row.transaction_type === "ISSUANCE") {
          Icon = ArrowUpRight;
          colorClass = "text-success-primary bg-success-soft";
          label = "Berildi";
        } else if (row.transaction_type === "DEDUCTION") {
          Icon = ArrowDownLeft;
          colorClass = "text-error-primary bg-error-soft";
          label = "Jarima";
        } else if (row.transaction_type === "REDEMPTION") {
          Icon = ShoppingBag02;
          colorClass = "text-warning-primary bg-warning-soft";
          label = "Xarid";
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
        const isPositive = row.transaction_type === "ISSUANCE" || row.transaction_type === "TRANSFER";
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
        <Tooltip title={row.coin_rule_name || ""} delay={200}>
          <TooltipTrigger className="text-left">
            <span className="text-sm text-secondary truncate block max-w-[160px]">
              {row.coin_rule_name || "—"}
            </span>
          </TooltipTrigger>
        </Tooltip>
      ),
    },
    {
      id: "staff",
      header: "Mas'ul",
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
    ...(canDeleteTransaction ? [{
      id: "actions",
      header: "",
      headClassName: "w-12",
      cellClassName: "w-12",
      cell: (row: Transaction) => {
        if (row.transaction_type !== "ISSUANCE" && row.transaction_type !== "DEDUCTION") return null;
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
              {(data?.count !== undefined || data?.pagination?.total_items !== undefined) ? `Jami: ${data.count ?? data.pagination?.total_items} ta` : ""}
            </span>
            <div className="flex items-center gap-2">
              {(data?.count !== undefined || data?.pagination?.total_items !== undefined) && (
                <>
                  <Button size="sm" color="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1}>←</Button>
                  <span className="text-sm text-secondary tabular-nums px-1">{page}</span>
                  <Button size="sm" color="secondary" onClick={() => setPage((p) => p + 1)} isDisabled={page * 10 >= (data.count ?? data.pagination?.total_items ?? 0)}>→</Button>
                </>
              )}
              {canAward && (
                <Button iconLeading={Coins01} onClick={() => setIssueModalState({ isOpen: true, type: "reward" })}>
                  Ball berish
                </Button>
              )}
              {canPenalty && (
                <Button color="primary-destructive" className="ring-1 ring-error-300 dark:ring-error-700 shadow-xs" iconLeading={Coins01} onClick={() => setIssueModalState({ isOpen: true, type: "penalty" })}>
                  Jarima
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

      {issueModalState.isOpen && (
        <IssueCoinModal
          isOpen={issueModalState.isOpen}
          onClose={() => setIssueModalState({ isOpen: false, type: "reward" })}
          preselectedStudent={student}
          ruleType={issueModalState.type}
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
