"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw01, ClockRefresh } from "@untitledui/icons";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { useAdminTransactions } from "@/hooks/api/use-transactions";
import type { Transaction } from "@/hooks/api/use-transactions";
import { cx } from "@/utils/cx";
import { useSession } from "next-auth/react";

export default function CoinsHistoryPage() {
  const [page, setPage] = useState(1);
  const { data: session } = useSession();

  const { data } = useAdminTransactions({ page, page_size: 20 });

  const columns: DataTableColumn<Transaction>[] = [
    {
      id: "index",
      header: "№",
      headClassName: "w-[50px]",
      cell: (_, i) => (
        <span className="text-sm tabular-nums text-tertiary">{(page - 1) * 20 + (i ?? 0) + 1}</span>
      ),
    },
    {
      id: "student",
      header: "Talaba",
      isRowHeader: true,
      cell: (row: any) => (
        <span className="text-sm font-medium text-primary">
          {row.student_name || "—"}
        </span>
      ),
    },
    {
      id: "type",
      header: "Turi",
      cell: (row) => {
        let Icon = ArrowUpRight;
        let colorClass = "text-success-primary bg-success-soft";
        let label = "Berildi";
        if (row.transaction_type === "DEDUCTION" || row.transaction_type === "REDEMPTION") {
          Icon = ArrowDownLeft;
          colorClass = "text-error-primary bg-error-soft";
          label = "Yechildi";
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
        const isPositive = row.amount > 0;
        const absAmount = Math.abs(row.amount);
        return (
          <span className={cx("inline-flex items-center gap-1 text-sm font-bold tabular-nums", isPositive ? "text-success-solid" : "text-error-solid")}>
            {isPositive ? "+" : "-"}{absAmount.toLocaleString()}
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
            <span className="text-sm text-secondary truncate block max-w-[200px]">
              {row.coin_rule_name || "—"}
            </span>
          </TooltipTrigger>
        </Tooltip>
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
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ball tarixi" },
        ]}
        title="Ball tarixi"
        subtitle="Universitet bo'ylab barcha ball operatsiyalari"
        icon={ClockRefresh}
      />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)] ring-1 ring-secondary">
        <div className="p-5">
          <DataTable
            ariaLabel="Ball tarixi"
            data={data?.results || []}
            columns={columns}
            rowKey="transaction_public_id"
            isLoading={data === undefined}
            emptyTitle="Tranzaksiyalar yo'q"
            emptyDescription="Hali hech qanday ball amali bajarilmagan."
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
