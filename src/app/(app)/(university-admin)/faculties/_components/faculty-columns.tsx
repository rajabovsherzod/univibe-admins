"use client";

import type { DataTableColumn } from "@/components/application/table/data-table";
import type { Faculty } from "@/lib/api/types";
import { Button } from "@/components/base/buttons/button";
import { Edit05, Trash01 } from "@untitledui/icons";

export function getFacultyColumns(opts?: {
  onEdit?: (id: string, name: string) => void;
  onDelete?: (id: string, name: string) => void;
}): DataTableColumn<Faculty>[] {
  return [
    {
      id: "index",
      header: "№",
      headClassName: "w-[52px]",
      cellClassName: "py-3 text-sm font-medium text-tertiary tabular-nums",
      cell: (_row, index) => (index ?? 0) + 1,
    },
    {
      id: "name",
      header: "Fakultet Nomi",
      isRowHeader: true,
      headClassName: "min-w-[200px]",
      cellClassName: "py-3",
      cell: (row) => (
        <span className="text-sm font-semibold text-primary">
          {row.name}
        </span>
      ),
    },
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
            onClick={() => opts?.onEdit?.(row.public_id, row.name)}
            aria-label="Tahrirlash"
          />
          <Button
            color="tertiary-destructive"
            size="sm"
            iconLeading={Trash01}
            onClick={() => opts?.onDelete?.(row.public_id, row.name)}
            aria-label="O'chirish"
          />
        </div>
      ),
    },
  ];
}
