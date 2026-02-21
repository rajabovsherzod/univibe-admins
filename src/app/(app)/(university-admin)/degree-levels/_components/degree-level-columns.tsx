"use client";

import type { DataTableColumn } from "@/components/application/table/data-table";
import type { DegreeLevel } from "@/lib/api/types";
import { Button } from "@/components/base/buttons/button";
import { Edit05, Trash01, GraduationHat01 } from "@untitledui/icons";

export function getDegreeLevelColumns({
  page,
  pageSize,
  onEdit,
  onDelete,
}: {
  page: number;
  pageSize: number;
  onEdit: (item: DegreeLevel) => void;
  onDelete: (item: DegreeLevel) => void;
}): DataTableColumn<DegreeLevel>[] {
  return [
    {
      id: "index",
      header: "№",
      headClassName: "w-[52px]",
      cellClassName: "py-3.5",
      cell: (_row, i) => (
        <span className="text-sm font-medium text-tertiary tabular-nums">
          {(page - 1) * pageSize + (i ?? 0) + 1}
        </span>
      ),
    },
    {
      id: "name",
      header: "Daraja nomi",
      isRowHeader: true,
      headClassName: "min-w-[280px]",
      cellClassName: "py-3.5",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-solid/10">
            <GraduationHat01 className="size-4 text-brand-solid" />
          </div>
          <span className="text-sm font-semibold text-primary">{row.name}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      headClassName: "w-[100px]",
      cellClassName: "px-3 py-3.5",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            color="tertiary"
            size="sm"
            iconLeading={Edit05}
            onClick={() => onEdit(row)}
            aria-label="Tahrirlash"
          />
          <Button
            color="tertiary-destructive"
            size="sm"
            iconLeading={Trash01}
            onClick={() => onDelete(row)}
            aria-label="O'chirish"
          />
        </div>
      ),
    },
  ];
}
