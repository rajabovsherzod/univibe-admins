"use client";

import { useState } from "react";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { useCoinRules } from "@/hooks/api/use-coins";
import type { CoinRule } from "@/lib/api/types";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";

export function StaffCoinsClient() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCoinRules({
    page,
    page_size: 10,
    search: undefined,
    status: "active",
  });

  const columns: DataTableColumn<CoinRule>[] = [
    {
      id: "index",
      header: "№",
      headClassName: "w-[50px]",
      cell: (row, i) => (
        <span className="text-sm tabular-nums text-tertiary">
          {(page - 1) * 10 + (i ?? 0) + 1}
        </span>
      ),
    },
    {
      id: "name",
      header: "Qoida nomi",
      isRowHeader: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{row.name}</span>
          <span className="text-xs text-tertiary truncate max-w-[200px]">
            {row.description}
          </span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Miqdori",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-brand-solid">{row.coin_amount}</span>
          <img src="/blue-coin-org.png" alt="Coin" className="size-5 drop-shadow-sm" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ballar tizimi" },
        ]}
        title="Ballar tizimi"
        subtitle="Siz amalga oshirishingiz mumkin bo'lgan mavjud ball berish qoidalari."
        icon={CoinOutlineIcon}
      />

      <DataTable
        ariaLabel="Coin qoidalari"
        data={data?.results || []}
        columns={columns}
        rowKey="public_id"
        isLoading={isLoading || !data}
        emptyTitle="Qoidalar topilmadi"
        emptyDescription="Hozircha hech qanday coin qoidasi mavjud emas."
        pagination={{
          page: page,
          total: Math.ceil((data?.count || 0) / 10) || 1,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
