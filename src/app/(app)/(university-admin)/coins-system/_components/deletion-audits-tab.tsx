"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Shield01 } from "@untitledui/icons";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { useDeletionAudits } from "@/hooks/api/use-coins";
import type { DeletionAudit } from "@/lib/api/types";

export function DeletionAuditsTab() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useDeletionAudits({
    page,
    page_size: 20,
  });

  const columns: DataTableColumn<DeletionAudit>[] = [
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
      id: "student",
      header: "Talaba",
      cell: (row) => (
        <span className="text-sm font-medium text-primary">
          {row.student_name || "—"}
        </span>
      ),
    },
    {
      id: "staff",
      header: "Xodim (Bekor qilgan)",
      cell: (row) => (
        <span className="text-sm text-secondary">
          {row.staff_member_name || "—"}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Miqdor",
      cell: (row) => (
        <span className="text-sm font-semibold text-error-solid">
          -{row.transaction_amount}
        </span>
      ),
    },
    {
      id: "reason",
      header: "O'chirish sababi",
      cell: (row) => (
        <span className="text-sm text-tertiary max-w-[300px] truncate block" title={row.deletion_reason}>
          {row.deletion_reason}
        </span>
      ),
    },
    {
      id: "date",
      header: "O'chirilgan sana",
      cell: (row) => (
        <span className="text-sm text-tertiary tabular-nums">
          {row.deleted_at ? format(new Date(row.deleted_at), "dd.MM.yyyy HH:mm") : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Simple header info */}
      <div className="flex items-center gap-2 rounded-lg bg-brand-soft p-3 text-brand-solid">
        <Shield01 className="size-5" />
        <span className="text-sm font-medium">
          Bu yerda faqat bekor qilingan (o'chirilgan) tranzaksiyalar auditi ko'rsatiladi.
        </span>
      </div>

      <DataTable
        ariaLabel="O'chirilgan tranzaksiyalar"
        data={data?.results || []}
        columns={columns}
        rowKey="public_id"
        isLoading={isLoading}
        emptyTitle="O'chirilganlar yo'q"
        emptyDescription="Hozircha hech qanday tranzaksiya bekor qilinmagan."
      />
    </div>
  );
}
