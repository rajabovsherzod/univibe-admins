"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw01 } from "@untitledui/icons";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { useAuditTransactions } from "@/hooks/api/use-coins";
import type { AuditTransaction } from "@/lib/api/types";
import { cx } from "@/utils/cx";
import { Select } from "@/components/base/select/select";
import type { Key } from "react-aria-components";

export function TransactionsTab() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useAuditTransactions({
    page,
    page_size: 20,
    transaction_type: typeFilter || undefined,
  });

  const columns: DataTableColumn<AuditTransaction>[] = [
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

        if (row.transaction_type === "REDEMPTION") {
          Icon = ArrowDownLeft;
          color = "text-error-primary bg-error-soft";
          label = "Sarfladi";
        } else if (row.transaction_type === "REVERSAL") {
          Icon = RefreshCcw01;
          color = "text-warning-primary bg-warning-soft";
          label = "Qaytarildi";
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
          <img src="/blue-coin-org.png" alt="Coin" className="size-5 drop-shadow-sm" />
        </div>
      ),
    },
    {
      id: "staff",
      header: "Kim berdi (Xodim)",
      cell: (row) => (
        <span className="text-sm text-secondary">{row.staff_member_name || "—"}</span>
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
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Select
          items={[
            { id: "", label: "Barchasi" },
            { id: "ISSUANCE", label: "Berilgan (Issuance)" },
            { id: "REDEMPTION", label: "Sarflangan (Redemption)" },
            { id: "REVERSAL", label: "Qaytarilgan (Reversal)" },
          ]}
          selectedKey={typeFilter || null}
          onSelectionChange={(k) => setTypeFilter(String(k))}
          placeholder="Tranzaksiya turi"
          className="w-full sm:w-[250px]"
        >
          {(item) => <Select.Item id={item.id} label={item.label} />}
        </Select>
        {/* Additional filters (date_from, etc) can go here */}
      </div>

      <DataTable
        ariaLabel="Tranzaksiyalar auditi"
        data={data?.results || []}
        columns={columns}
        rowKey="transaction_public_id"
        isLoading={isLoading || !data}
        emptyTitle="Tranzaksiyalar yo'q"
        emptyDescription="Hozircha hech qanday coin amaliyoti bajarilmagan."
      />
    </div>
  );
}
