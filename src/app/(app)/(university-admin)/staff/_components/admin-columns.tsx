"use client";

import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Edit05, Trash01 } from "@untitledui/icons";
import type { DataTableColumn } from "@/components/application/table/data-table";
import type { AdminRow } from "@/types/admins/admin";

// --- Yordamchi funksiyalar ---

function isoDateOnly(input?: string | null) {
  if (!input) return "—";
  return input.length >= 10 ? input.slice(0, 10) : input;
}

// --- Ustunlar (Columns) ---

export const adminColumns: DataTableColumn<AdminRow>[] = [
  {
    id: "id",
    header: "№",
    headClassName: "w-[72px]",
    cellClassName: "py-3",
    cell: (row) => <span className="text-sm font-medium text-tertiary">{row.id}</span>,
  },
  {
    id: "admin",
    header: "Admin",
    isRowHeader: true,
    headClassName: "min-w-[360px]",
    cellClassName: "py-3",
    cell: (row) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-primary">{row.fullName}</p>
        <p className="truncate text-sm text-tertiary">{row.email}</p>
      </div>
    ),
  },
  {
    id: "department",
    header: "Yo‘nalish",
    accessor: "department",
    headClassName: "min-w-[240px]",
    cellClassName: "whitespace-nowrap py-3",
  },
  {
    id: "role",
    header: "Role",
    accessor: "role",
    headClassName: "w-[180px]",
    cellClassName: "whitespace-nowrap py-3 capitalize",
  },
  {
    id: "status",
    header: "Holat",
    headClassName: "w-[180px]",
    cellClassName: "whitespace-nowrap py-3",
    cell: (row) => {
      const isActive = row.status === "active";
      return (
        <Badge
          size="sm"
          // Standart rangni o'chirish uchun "gray" beramiz, lekin className bilan ustidan yozamiz
          color="gray"
          className={
            isActive
              ? "bg-success-solid text-white" // Faol: yashil fon, oq matn
              : "bg-brand-solid text-white" // Taklif qilingan: brand fon, oq matn
          }
        >
          {isActive ? "Faol" : "Taklif qilingan"}
        </Badge>
      );
    },
  },
  {
    id: "lastLogin",
    header: "Oxirgi kirish",
    headClassName: "w-[160px]",
    cellClassName: "whitespace-nowrap py-3",
    cell: (row) => <span className="text-sm text-tertiary">{isoDateOnly(row.lastLogin)}</span>,
  },
  {
    id: "createdAt",
    header: "Yaratilgan",
    headClassName: "w-[160px]",
    cellClassName: "whitespace-nowrap py-3",
    cell: (row) => <span className="text-sm text-tertiary">{isoDateOnly(row.createdAt)}</span>,
  },
  {
    id: "actions",
    header: "",
    headClassName: "w-[72px]",
    cellClassName: "px-4 py-3",
    cell: () => (
      <div className="flex items-center justify-end gap-1">
        <Button
          color="tertiary"
          size="sm"
          iconLeading={Edit05}
          aria-label="Tahrirlash"
        />
        <Button
          color="tertiary-destructive"
          size="sm"
          iconLeading={Trash01}
          aria-label="O'chirish"
        />
      </div>
    ),
  },
];