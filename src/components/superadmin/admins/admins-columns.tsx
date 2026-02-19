"use client";

import React from "react";
import { Edit01, Trash01 } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import type { DataTableColumn } from "@/components/application/table/data-table";

/** Admin type (mock / keyin APIga moslab ketasan) */
export type AdminRow = {
  id: number;
  full_name: string;
  email: string;
  role: "superadmin" | "admin";
  status: "active" | "invited" | "blocked";
  last_login_at?: string | null;
  created_at: string;
};

function isoDateOnly(input?: string | null) {
  if (!input) return "—";
  return input.length >= 10 ? input.slice(0, 10) : input;
}

function roleLabel(role: AdminRow["role"]) {
  return role === "superadmin" ? "Superadmin" : "Admin";
}

function statusLabel(status: AdminRow["status"]) {
  if (status === "active") return "Faol";
  if (status === "invited") return "Taklif qilingan";
  return "Bloklangan";
}

/** ✅ Badge yo‘q. Faqat text. Juda minimal rang (backgroundsiz). */
function StatusText({ status }: { status: AdminRow["status"] }) {
  const cls =
    status === "active"
      ? "text-secondary"
      : status === "invited"
      ? "text-tertiary"
      : "text-tertiary";

  return <span className={`text-sm font-medium ${cls}`}>{statusLabel(status)}</span>;
}

function Avatar({ name }: { name: string }) {
  const letter = (name?.trim()?.[0] ?? "A").toUpperCase();
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-lg ring-1 ring-secondary ring-inset bg-secondary_subtle">
      <span className="text-sm font-semibold text-secondary">{letter}</span>
    </div>
  );
}

export const adminsColumns: DataTableColumn<AdminRow>[] = [
  {
    id: "id",
    header: "№",
    allowsSorting: true,
    sortValue: (r) => r.id,
    headClassName: "w-[70px]",
    cellClassName: "py-3",
    cell: (r) => <span className="text-sm font-medium text-tertiary">{r.id}</span>,
  },

  {
    id: "admin",
    header: "Admin",
    isRowHeader: true,
    allowsSorting: true,
    // ✅ bu column “kengayib” qolgan joyni to‘ldirsin
    headClassName: "min-w-[360px] w-full",
    cellClassName: "py-3",
    sortValue: (r) => r.full_name,
    cell: (r) => (
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={r.full_name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-primary">{r.full_name}</p>
          <p className="truncate text-sm text-tertiary">{r.email}</p>
        </div>
      </div>
    ),
  },

  {
    id: "role",
    header: "Role",
    allowsSorting: true,
    headClassName: "w-[180px]",
    cellClassName: "whitespace-nowrap",
    sortValue: (r) => r.role,
    cell: (r) => <span className="text-sm font-medium text-secondary">{roleLabel(r.role)}</span>,
  },

  {
    id: "status",
    header: "Holat",
    allowsSorting: true,
    headClassName: "w-[170px]",
    cellClassName: "whitespace-nowrap",
    sortValue: (r) => r.status,
    cell: (r) => <StatusText status={r.status} />,
  },

  {
    id: "last_login_at",
    header: "Oxirgi kirish",
    allowsSorting: true,
    headClassName: "w-[160px] whitespace-nowrap",
    cellClassName: "whitespace-nowrap",
    sortValue: (r) => r.last_login_at ?? "",
    cell: (r) => <span className="text-sm text-tertiary">{isoDateOnly(r.last_login_at)}</span>,
  },

  {
    id: "created_at",
    header: "Yaratilgan",
    allowsSorting: true,
    headClassName: "w-[140px] text-right whitespace-nowrap",
    cellClassName: "text-right whitespace-nowrap",
    sortValue: (r) => r.created_at,
    cell: (r) => <span className="text-sm text-tertiary">{isoDateOnly(r.created_at)}</span>,
  },

  {
    id: "actions",
    header: "",
    headClassName: "w-[110px]",
    cellClassName: "px-4",
    cell: (r) => (
      <div className="flex justify-end gap-1">
        <ButtonUtility
          size="sm"
          color="tertiary"
          tooltip="Tahrirlash"
          icon={Edit01}
          onClick={() => console.log("edit", r.id)}
        />
        <ButtonUtility
          size="sm"
          color="tertiary"
          tooltip="O‘chirish"
          icon={Trash01}
          className="hover:text-error hover:bg-error/10 transition-colors"
          onClick={() => console.log("delete", r.id)}
        />
      </div>
    ),
  },
];
