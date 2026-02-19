"use client";

import * as React from "react";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";
import { Button } from "@/components/base/buttons/button";
import { Plus } from "@untitledui/icons";
import Link from "next/link";

type AdminRole = "superadmin" | "admin";
type AdminStatus = "active" | "invited" | "blocked";

export type AdminRow = {
  id: number; // №
  fullName: string;
  email: string;
  department: string; // Yo‘nalish
  role: AdminRole;
  status: AdminStatus;
  lastLogin?: string | null;
  createdAt: string;
};

function isoDateOnly(input?: string | null) {
  if (!input) return "—";
  return input.length >= 10 ? input.slice(0, 10) : input;
}

function RoleLabel({ role }: { role: AdminRole }) {
  const label = role === "superadmin" ? "Superadmin" : "Admin";
  return <span className="text-sm font-medium text-secondary">{label}</span>;
}

function StatusPill({ status }: { status: AdminStatus }) {
  const label =
    status === "active" ? "Faol" : status === "invited" ? "Taklif qilingan" : "Bloklangan";

  // ✅ kamalak yo‘q: neutral pill
  return (
    <span className="inline-flex items-center rounded-md bg-secondary_subtle px-2.5 py-1 text-xs font-semibold text-tertiary ring-1 ring-secondary ring-inset">
      {label}
    </span>
  );
}

export function AdminsTable({
  items,
  title = "Adminlar",
  subtitle = "Adminlar ro‘yxatini ko‘rish va boshqarish.",
  createHref = "/admins/create",
}: {
  items: AdminRow[];
  title?: string;
  subtitle?: string;
  createHref?: string;
}) {
  return (
    <TableCard.Root className="w-full overflow-hidden rounded-2xl bg-card-primary shadow-xs-skeumorphic ring-1 ring-primary ring-inset">
      <TableCard.Header
        title={title}
        description={subtitle}
        badge={
          <span className="rounded-full bg-secondary_subtle px-2.5 py-1 text-xs font-semibold text-tertiary ring-1 ring-secondary ring-inset">
            {items.length} ta
          </span>
        }
        contentTrailing={
          <div className="flex items-center gap-3">
            <Link
              href={createHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset transition hover:bg-brand-solid_hover"
            >
              <Plus className="size-4" />
              Yangi admin qo‘shish
            </Link>
          </div>
        }
      />

      {/* ✅ Full width + overflow-x-auto: columnlar tiqilib qolmaydi */}
      <div className="w-full overflow-x-auto">
        <Table aria-label="Admins table" selectionMode="multiple" className="w-full min-w-full">
          {/* Header row */}
          <Table.Header className="bg-primary">
            <Table.Head id="no" label="№" className="w-[72px]" />
            <Table.Head id="admin" label="Admin" isRowHeader className="min-w-[360px]" />
            <Table.Head id="department" label="Yo‘nalish" className="min-w-[240px]" />
            <Table.Head id="role" label="Role" className="w-[180px]" />
            <Table.Head id="status" label="Holat" className="w-[180px]" />
            <Table.Head id="lastLogin" label="Oxirgi kirish" className="w-[160px]" />
            <Table.Head id="createdAt" label="Yaratilgan" className="w-[160px]" />
            <Table.Head id="actions" label="" className="w-[72px]" />
          </Table.Header>

          <Table.Body items={items}>
            {(a) => (
              <Table.Row
                id={String(a.id)}
                // ✅ alternating fills (professional zebra)
                className="odd:bg-secondary_subtle"
              >
                {/* № */}
                <Table.Cell className="whitespace-nowrap">
                  <span className="text-sm font-medium text-tertiary">{a.id}</span>
                </Table.Cell>

                {/* Admin (name + email) */}
                <Table.Cell>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">{a.fullName}</p>
                    <p className="truncate text-sm text-tertiary">{a.email}</p>
                  </div>
                </Table.Cell>

                {/* Yo‘nalish */}
                <Table.Cell className="whitespace-nowrap">
                  <span className="text-sm font-medium text-secondary">{a.department}</span>
                </Table.Cell>

                {/* Role */}
                <Table.Cell className="whitespace-nowrap">
                  <RoleLabel role={a.role} />
                </Table.Cell>

                {/* Status */}
                <Table.Cell className="whitespace-nowrap">
                  <StatusPill status={a.status} />
                </Table.Cell>

                {/* Last login */}
                <Table.Cell className="whitespace-nowrap">
                  <span className="text-sm text-tertiary">{isoDateOnly(a.lastLogin)}</span>
                </Table.Cell>

                {/* Created */}
                <Table.Cell className="whitespace-nowrap">
                  <span className="text-sm text-tertiary">{isoDateOnly(a.createdAt)}</span>
                </Table.Cell>

                {/* Actions */}
                <Table.Cell className="px-4">
                  <div className="flex items-center justify-end">
                    <TableRowActionsDropdown />
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </TableCard.Root>
  );
}

/** ✅ Mock data (xohlasang page’dan ham yuborasiz) */
export const adminMock: AdminRow[] = [
  {
    id: 1,
    fullName: "Sherzod Rajabov",
    email: "sherzod@univibe.uz",
    department: "Ma’naviyat bo‘limi",
    role: "superadmin",
    status: "active",
    lastLogin: "2026-02-01",
    createdAt: "2025-12-10",
  },
  {
    id: 2,
    fullName: "Aziza Karimova",
    email: "aziza@univibe.uz",
    department: "Yoshlar ittifoqi bo‘limi",
    role: "admin",
    status: "active",
    lastLogin: "2026-01-31",
    createdAt: "2026-01-10",
  },
  {
    id: 3,
    fullName: "Javohir Abdullayev",
    email: "javohir@univibe.uz",
    department: "IT & Hackathon bo‘limi",
    role: "admin",
    status: "invited",
    lastLogin: null,
    createdAt: "2026-01-28",
  },
  {
    id: 4,
    fullName: "Malika Islomova",
    email: "malika@univibe.uz",
    department: "Tadbirlar bo‘limi",
    role: "admin",
    status: "blocked",
    lastLogin: "2026-01-12",
    createdAt: "2025-11-20",
  },
];
