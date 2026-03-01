"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw01, Plus, Trash01 } from "@untitledui/icons";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { useTransactions } from "@/hooks/api/use-transactions";
import type { Transaction } from "@/hooks/api/use-transactions";
import { useStudents } from "@/hooks/api/use-students";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { IssueCoinModal } from "./issue-coin-modal";
import { DeleteTransactionModal } from "./delete-transaction-modal";

export function StaffTransactionsTab() {
  const [page, setPage] = useState(1);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; amount: number } | null>(null);

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");

  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    search: studentSearch,
    page_size: 10,
  });

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
      cell: (_, i) => (
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
        <span className="text-sm text-secondary max-w-[200px] truncate block" title={row.coin_rule_name}>
          {row.coin_rule_name || "—"}
        </span>
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
    {
      id: "actions",
      header: "",
      headClassName: "w-12",
      cellClassName: "w-12",
      cell: (row) => {
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
    },
  ];

  const studentItems = studentsData?.results?.map((s) => ({
    id: s.user_public_id,
    label: `${s.name} ${s.surname}`,
  })) || [];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center rounded-xl border border-secondary bg-secondary/30 p-4">
        <div>
          <h3 className="text-base font-semibold text-primary">Tranzaksiyalar</h3>
          <p className="text-sm text-tertiary">Talabani tanlang va uning ball tarixini ko&apos;ring yoki yangi ball bering</p>
        </div>
        <Button iconLeading={Plus} onClick={() => setIsIssueModalOpen(true)} className="w-full sm:w-auto">
          Ball berish
        </Button>
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
        {/* Student search */}
        <div className="flex flex-col gap-3 border-b border-secondary p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Talaba qidirish"
              placeholder="Ism bo'yicha qidirish..."
              value={studentSearch}
              onChange={(val) => {
                setStudentSearch(val);
                setSelectedStudentId("");
                setSelectedStudentName("");
                setPage(1);
              }}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Talabani tanlang"
              items={studentItems}
              selectedKey={selectedStudentId || null}
              onSelectionChange={(key) => {
                const id = String(key);
                const found = studentsData?.results?.find((s) => s.user_public_id === id);
                setSelectedStudentId(id);
                setSelectedStudentName(found ? `${found.name} ${found.surname}` : "");
                setPage(1);
              }}
              placeholder={studentsLoading ? "Yuklanmoqda..." : "Ro'yxatdan tanlang"}
              isDisabled={studentsLoading}
            >
              {(item) => <Select.Item id={item.id} label={item.label} />}
            </Select>
          </div>
        </div>

        <DataTable
          ariaLabel="Tranzaksiyalar"
          data={selectedStudentId ? (data?.results || []) : []}
          columns={columns}
          rowKey="transaction_public_id"
          isLoading={!!selectedStudentId && (isLoading || !data)}
          emptyTitle={selectedStudentId ? "Tranzaksiyalar yo'q" : "Talaba tanlanmagan"}
          emptyDescription={
            selectedStudentId
              ? "Bu talabaga hali hech qanday ball amali bajarilmagan."
              : "Tranzaksiyalarni ko'rish uchun yuqoridan talaba tanlang."
          }
        />

        {data && data.count > 20 && selectedStudentId && (
          <div className="flex items-center justify-between border-t border-secondary px-5 py-3">
            <span className="text-sm text-tertiary">Jami: {data.count} ta</span>
            <div className="flex items-center gap-2">
              <Button size="sm" color="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1}>←</Button>
              <span className="text-sm text-secondary tabular-nums px-1">{page}</span>
              <Button size="sm" color="secondary" onClick={() => setPage((p) => p + 1)} isDisabled={page * 20 >= data.count}>→</Button>
            </div>
          </div>
        )}
      </div>

      {isIssueModalOpen && (
        <IssueCoinModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          preselectedStudent={
            selectedStudentId && selectedStudentName
              ? { id: selectedStudentId, name: selectedStudentName }
              : undefined
          }
        />
      )}

      {deleteTarget && (
        <DeleteTransactionModal
          isOpen
          onClose={() => setDeleteTarget(null)}
          transactionPublicId={deleteTarget.id}
          amount={deleteTarget.amount}
          studentName={selectedStudentName}
        />
      )}
    </div>
  );
}
