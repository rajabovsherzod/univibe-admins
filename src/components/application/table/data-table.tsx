"use client";

import React, { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { SortDescriptor } from "react-aria-components";
import { FolderX } from "@untitledui/icons";

import { cx } from "@/utils/cx";
import { Table, TableCard } from "@/components/application/table/table";
import { PaginationPageMinimalCenter } from "@/components/application/pagination/pagination";
import { PremiumTableSkeleton } from "@/components/application/skeleton/premium-table-skeleton";

type Primitive = string | number | boolean | null | undefined | Date;

export type DataTableColumn<T extends object> = {
  id: string;
  header: string;

  /** Header cell width/alignment */
  headClassName?: string;

  /** Body cell width/alignment */
  cellClassName?: string;

  /** Sort toggle */
  allowsSorting?: boolean;

  /** For accessibility: first column row header */
  isRowHeader?: boolean;

  /** Tooltip in header (Table.Head supports it) */
  tooltip?: string;

  /** If you want default display (without cell renderer) */
  accessor?: keyof T;

  /** Custom cell renderer (client-side) */
  cell?: (row: T, index: number) => ReactNode;

  /** Sorting value for this column */
  sortValue?: (row: T) => Primitive;
};

export type DataTablePagination = {
  page: number;
  total: number;
  onPageChange?: (page: number) => void;
  className?: string;
};

export type DataTableProps<T extends object> = {
  ariaLabel: string;
  data: T[];
  columns: DataTableColumn<T>[];

  /** ✅ Function emas, field nomi */
  rowKey: keyof T;

  selectionMode?: "none" | "single" | "multiple";
  size?: "sm" | "md";

  initialSort?: SortDescriptor;

  /** Loading state */
  isLoading?: boolean;

  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;

  pagination?: DataTablePagination;

  className?: string;
};

function normalizeForSort(v: Primitive): Primitive {
  if (v instanceof Date) return v.getTime();
  return v;
}

function compareValues(a: Primitive, b: Primitive) {
  const av = normalizeForSort(a);
  const bv = normalizeForSort(b);

  if (av == null && bv == null) return 0;
  if (av == null) return 1; // null/undefined pastga
  if (bv == null) return -1;

  if (typeof av === "number" && typeof bv === "number") return av - bv;
  if (typeof av === "boolean" && typeof bv === "boolean") return Number(av) - Number(bv);

  return String(av).localeCompare(String(bv));
}

// --------------- Row Skeleton ---------------
function RowSkeleton({ columns }: { columns: number }) {
  return (
    <div className="flex gap-4 border-b border-200 px-4 py-4 md:px-6">
      {Array.from({ length: columns }).map((_, colIdx) => (
        <div
          key={colIdx}
          className={cx(
            "h-4 animate-pulse rounded bg-200",
            colIdx === 0 ? "w-10" : "flex-1"
          )}
          style={{ animationDelay: `${colIdx * 100}ms` }}
        />
      ))}
    </div>
  );
}

// --------------- Empty State ---------------
function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-secondary">
        {icon || <FolderX className="size-7 text-tertiary" />}
      </div>
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-tertiary">{description}</p>
    </div>
  );
}

// --------------- DataTable ---------------
export function DataTable<T extends object>({
  ariaLabel,
  data,
  columns,
  rowKey,
  selectionMode = "none",
  size = "md",
  initialSort,
  isLoading = false,
  emptyTitle = "Ma'lumot topilmadi",
  emptyDescription = "Hozircha jadvalda hech qanday ma'lumot yo'q.",
  emptyIcon,
  pagination,
  className,
}: DataTableProps<T>) {
  const firstSortable = columns.find((c) => c.allowsSorting)?.id;

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>(() => {
    if (initialSort) return initialSort;
    if (firstSortable) return { column: firstSortable, direction: "ascending" };
    return undefined;
  });

  const sortedData = useMemo(() => {
    if (!sortDescriptor?.column) return data;

    const col = columns.find((c) => c.id === sortDescriptor.column);
    if (!col) return data;

    const dir = sortDescriptor.direction === "descending" ? -1 : 1;

    const getVal = (row: T): Primitive => {
      if (col.sortValue) return col.sortValue(row);

      if (col.accessor) {
        const v = (row as any)[col.accessor as string] as Primitive;
        return v;
      }

      // fallback: try id as accessor
      const v = (row as any)[col.id] as Primitive;
      return v;
    };

    return [...data].sort((a, b) => dir * compareValues(getVal(a), getVal(b)));
  }, [data, columns, sortDescriptor]);

  // Table header component (reusable)
  // MODIFICATION: Using bg-brand-solid for header background and white text for brand look
  const TableHeader = () => (
    <Table.Header className="bg-brand-solid text-white sticky top-0 z-10">
      {columns.map((col) => (
        <Table.Head
          key={col.id}
          id={col.id}
          label={col.header}
          allowsSorting={Boolean(col.allowsSorting)}
          isRowHeader={Boolean(col.isRowHeader)}
          tooltip={col.tooltip}
          className={cx("text-white hover:text-white/90 font-medium", col.headClassName)}
        />
      ))}
    </Table.Header>
  );

  // Loading state - shows premium skeleton
  if (isLoading) {
    return (
      <PremiumTableSkeleton
        columns={columns.length}
        rows={5}
        showPagination={!!pagination}
      />
    );
  }

  // Empty state - shows header + empty message
  if (sortedData.length === 0) {
    return (
      <TableCard.Root className={cx("overflow-hidden", className)} size={size}>
        <Table
          aria-label={ariaLabel}
          selectionMode="none"
          size={size}
        >
          <TableHeader />
          <Table.Body items={[]}>
            {() => null}
          </Table.Body>
        </Table>
        <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />
      </TableCard.Root>
    );
  }

  const items = sortedData as unknown as Iterable<object>;

  return (
    <TableCard.Root className={cx("overflow-hidden", className)} size={size}>
      <Table
        aria-label={ariaLabel}
        selectionMode={selectionMode}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor as any}
        size={size}
      >
        <TableHeader />

        <Table.Body items={items}>
          {(obj) => {
            const row = obj as T;
            const id = (row as any)[rowKey as string];
            const rowIndex = sortedData.indexOf(row);

            return (
              <Table.Row id={String(id ?? "")}>
                {columns.map((col) => {
                  const content =
                    col.cell?.(row, rowIndex) ??
                    (col.accessor ? (row as any)[col.accessor as string] : (row as any)[col.id]);

                  return (
                    <Table.Cell key={col.id} className={col.cellClassName}>
                      {content}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          }}
        </Table.Body>
      </Table>

      {pagination && pagination.total > 1 && (
        <PaginationPageMinimalCenter
          page={pagination.page}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
          className={cx("border-t border-200 px-4 py-3 md:px-6", pagination.className)}
        />
      )}
    </TableCard.Root>
  );
}