// Staff table columns — API response shape:
// { full_name, user_public_id, profile_photo_url, job_position, job_position_public_id, email }
"use client";

import Image from "next/image";
import type { DataTableColumn } from "@/components/application/table/data-table";
import type { StaffListResponseItem } from "@/lib/api/types";
import { TableRowActionsDropdown } from "@/components/application/table/table";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function StaffAvatar({ src, name }: { src?: string | null; name: string }) {
  if (src) {
    return (
      <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-secondary">
        <Image src={src} alt={name} fill className="object-cover" sizes="36px" unoptimized />
      </div>
    );
  }
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-solid/10 ring-2 ring-brand-solid/20">
      <span className="text-xs font-semibold text-brand-solid">{getInitials(name)}</span>
    </div>
  );
}

export function getStaffColumns(opts?: {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}): DataTableColumn<StaffListResponseItem>[] {
  return [
    {
      id: "staff",
      header: "Xodim",
      isRowHeader: true,
      headClassName: "min-w-[260px]",
      cellClassName: "py-3",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <StaffAvatar src={row.profile_photo_url} name={row.full_name} />
          <p className="truncate text-sm font-semibold text-primary">{row.full_name}</p>
        </div>
      ),
    },
    {
      id: "job_position",
      header: "Lavozim",
      headClassName: "min-w-[200px]",
      cellClassName: "py-3",
      cell: (row) => (
        <span className="text-sm text-secondary">{row.job_position || "—"}</span>
      ),
    },
    {
      id: "email",
      header: "Email",
      headClassName: "min-w-[220px]",
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
    {
      id: "actions",
      header: "",
      headClassName: "w-[56px]",
      cellClassName: "px-3 py-3",
      cell: () => (
        <div className="flex items-center justify-end">
          <TableRowActionsDropdown />
        </div>
      ),
    },
  ];
}
