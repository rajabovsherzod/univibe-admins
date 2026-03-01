"use client";

import Image from "next/image";
import type { DataTableColumn } from "@/components/application/table/data-table";
import type { StaffListResponseItem } from "@/lib/api/types";
import { Button } from "@/components/base/buttons/button";
import { Edit05, Trash01 } from "@untitledui/icons";
import { Tooltip } from "@/components/base/tooltip/tooltip";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function StaffAvatar({ src, name }: { src?: string | null; name: string }) {
  if (src) {
    return (
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-secondary">
        <Image src={src} alt={name} fill className="object-cover" sizes="40px" unoptimized />
      </div>
    );
  }
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-solid/10 ring-2 ring-brand-solid/20">
      <span className="text-xs font-bold text-brand-solid">{getInitials(name)}</span>
    </div>
  );
}

export function getStaffColumns(opts?: {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}): DataTableColumn<StaffListResponseItem>[] {
  return [
    // ── № tartib raqami ──
    {
      id: "index",
      header: "№",
      headClassName: "w-[52px]",
      cellClassName: "py-3",
      cell: (_row, index) => (
        <span className="text-sm font-medium text-tertiary tabular-nums">
          {(index ?? 0) + 1}
        </span>
      ),
    },

    // ── Avatar + Full name ──
    {
      id: "staff",
      header: "Xodim",
      isRowHeader: true,
      headClassName: "min-w-[240px]",
      cellClassName: "py-3",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <StaffAvatar src={row.profile_photo_url} name={row.full_name} />
          <span className="truncate text-sm font-semibold text-primary">{row.full_name}</span>
        </div>
      ),
    },

    // ── Job position ──
    {
      id: "job_position",
      header: "Lavozim",
      headClassName: "min-w-[180px]",
      cellClassName: "py-3",
      cell: (row) => (
        <span className="text-sm text-secondary">{row.job_position || "—"}</span>
      ),
    },

    // ── Email ──
    {
      id: "email",
      header: "Email",
      headClassName: "min-w-[200px]",
      cellClassName: "py-3",
      cell: (row) => (
        <a
          href={`mailto:${row.email}`}
          className="text-sm text-brand-secondary hover:text-brand-solid hover:underline underline-offset-2 transition-colors"
        >
          {row.email}
        </a>
      ),
    },

    // ── Row actions ──
    {
      id: "actions",
      header: "",
      headClassName: "w-[100px]",
      cellClassName: "px-3 py-3",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            color="tertiary"
            size="sm"
            iconLeading={Edit05}
            onClick={() => opts?.onEdit?.(row.user_public_id)}
            aria-label="Tahrirlash"
          />
          <Button
            color="tertiary-destructive"
            size="sm"
            iconLeading={Trash01}
            onClick={() => opts?.onDelete?.(row.user_public_id)}
            aria-label="O'chirish"
          />
        </div>
      ),
    },
  ];
}
