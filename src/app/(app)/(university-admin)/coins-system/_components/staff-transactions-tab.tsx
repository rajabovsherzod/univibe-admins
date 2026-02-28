"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw01, Plus } from "@untitledui/icons";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { useTransactions } from "@/hooks/api/use-transactions";
import type { Transaction } from "@/hooks/api/use-transactions";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/buttons/button";
import { useSession } from "next-auth/react";
import { IssueCoinModal } from "./issue-coin-modal";

export function StaffTransactionsTab() {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // In a real scenario, the staff might select a student first.
  // We'll map the UI to allow selecting a student, or if none selected, empty state.
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const { data, isLoading } = useTransactions({
    user_public_id: selectedStudentId,
    page,
    page_size: 20,
  });

  const columns: DataTableColumn<Transaction>[] = [
    {
      id: "index",
      header: "№",
      headClassName: "w-[50px]",
      cell: (row, i) => (
        <span className="text-sm tabular-nums text-tertiary">
          {(page - 1) * 20 + (i ?? 0) + 1}
        </span>
      ),
    },
    {
      id: "type",
      header: "Turi",
      isRowHeader: true,
      cell: (row) => {
        let Icon = ArrowUpRight;
        let color = "text-success-primary bg-success-soft";
        let label = "Berildi";

        if (row.transaction_type === "DEDUCTION") {
          Icon = ArrowDownLeft;
          color = "text-error-primary bg-error-soft";
          label = "Olib tashlandi";
        } else if (row.transaction_type === "TRANSFER") {
          Icon = RefreshCcw01;
          color = "text-warning-primary bg-warning-soft";
          label = "O'tkazma";
        }

        return (
          <div className="flex items-center gap-2">
            <div className={cx("flex p-1.5 rounded-full", color)}>
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
      cell: (row) => (
        <div className="flex w-max items-center justify-end gap-1.5 align-middle">
          <span
            className={cx(
              "text-sm font-bold",
              row.transaction_type === "ISSUANCE" ? "text-success-solid" : "text-error-solid"
            )}
          >
            {row.transaction_type === "ISSUANCE" ? "+" : "-"}
            {row.amount}
          </span>
          <CoinOutlineIcon size={18} color="#D97706" strokeWidth={22} />
        </div>
      ),
    },
    {
      id: "rule",
      header: "Qoida",
      cell: (row) => (
        <span className="text-sm text-secondary max-w-[200px] truncate block" title={row.coin_rule_name}>
          {row.coin_rule_name || "—"}
        </span>
      ),
    },
    {
      id: "date",
      header: "Sana",
      cell: (row) => (
        <span className="text-sm text-tertiary tabular-nums">
          {format(new Date(row.created_at), "dd.MM.yyyy HH:mm")}
        </span>
      ),
    },
    // We can add delete action here mapped to `useDeleteTransaction` later if desired.
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center p-4 bg-secondary/30 rounded-xl border border-secondary">
        <div>
          <h3 className="text-base font-semibold text-primary">Jonli Tranzaksiyalar</h3>
          <p className="text-sm text-tertiary">Talabalarga Coin yozish yoki ularning tarixini ko'rish</p>
        </div>
        <Button onClick={() => setIsIssueModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 size-5" /> Coin Berish (Issue)
        </Button>
      </div>

      <div className="space-y-4">
        {/* Placeholder for Student Selector - if we want Staff to select a specific student to see history */}
        <DataTable
          ariaLabel="Staff Tranzaksiyalari"
          data={selectedStudentId ? (data?.results || []) : []}
          columns={columns}
          rowKey="transaction_public_id"
          isLoading={selectedStudentId ? (isLoading || !data) : false}
          emptyTitle={selectedStudentId ? "Tranzaksiyalar yo'q" : "Talaba tanlanmagan"}
          emptyDescription={selectedStudentId ? "Bu talabaga hali Coin berilmagan." : "Tranzaksiyalar tarixini ko'rish uchun talaba tanlang (Kelgusi yangilanishda Qo'shiladi) yoki yangi Coin bering."}
        />
      </div>

      {isIssueModalOpen && (
        <IssueCoinModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
        />
      )}
    </div>
  );
}
