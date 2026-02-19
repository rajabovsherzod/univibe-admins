"use client";

import { Edit01, Trash01, User01, Eye } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import type { DataTableColumn } from "@/components/application/table/data-table";
import type { StaffListResponseItem } from "@/lib/api/types";
import Image from "next/image";

interface StaffColumnsOptions {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function getStaffColumns(options: StaffColumnsOptions): DataTableColumn<StaffListResponseItem>[] {
  const { onEdit, onDelete, onView } = options;

  return [
    {
      id: "index",
      header: "№",
      headClassName: "w-[60px]",
      cellClassName: "py-3",
      cell: (_c, index) => (
        <span className="text-sm font-medium text-tertiary">
          {index + 1}
        </span>
      ),
    },

    {
      id: "full_name",
      header: "F.I.SH",
      isRowHeader: true,
      allowsSorting: true,
      headClassName: "w-[280px] min-w-[220px]",
      cellClassName: "py-3",
      sortValue: (c) => c.full_name,
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-secondary shadow-xs bg-primary overflow-hidden">
            {c.profile_photo_url ? (
              // Use unoptimized for external URLs or local development if domain not allowed
              <Image
                src={c.profile_photo_url}
                alt={c.full_name}
                width={40}
                height={40}
                className="size-10 object-cover"
                unoptimized
              />
            ) : (
              <User01 className="size-5 text-tertiary" />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-primary">{c.full_name}</p>
            <p className="text-xs text-tertiary">{c.email}</p>
          </div>
        </div>
      ),
    },

    {
      id: "job_position",
      header: "Lavozim",
      allowsSorting: true,
      headClassName: "min-w-[150px]",
      sortValue: (c) => c.job_position || "",
      cell: (c) => (
        <span className="text-sm text-tertiary">
          {c.job_position || "—"}
        </span>
      ),
    },

    {
      id: "actions",
      header: "",
      headClassName: "w-[120px]",
      cellClassName: "px-4",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          {/* <ButtonUtility
            size="sm"
            color="tertiary"
            tooltip="Ko'rish"
            icon={Eye}
            onClick={() => onView(c.user_public_id)}
          /> */}
          <ButtonUtility
            size="sm"
            color="tertiary"
            tooltip="Tahrirlash"
            icon={Edit01}
            onClick={() => onEdit(c.user_public_id)}
          />
          <ButtonUtility
            size="sm"
            color="tertiary"
            tooltip="O'chirish"
            icon={Trash01}
            className="hover:text-error hover:bg-error/10 transition-colors"
            onClick={() => onDelete(c.user_public_id)}
          />
        </div>
      ),
    },
  ];
}
