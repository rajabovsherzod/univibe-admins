"use client";

import Image from "next/image";
import { toHttps } from "@/utils/cx";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import type { Product } from "../_hooks/use-products";
import { Tooltip } from "@/components/base/tooltip/tooltip";

export const productColumns: DataTableColumn<Product>[] = [
  {
    id: "image",
    header: "Rasm",
    headClassName: "w-16",
    cellClassName: "w-16",
    cell: (row) => (
      <div className="size-10 rounded-lg overflow-hidden bg-secondary shrink-0">
        {row.image ? (
          <Image src={toHttps(row.image)!} alt={row.name} width={40} height={40} className="size-full object-cover" unoptimized />
        ) : (
          <div className="size-full flex items-center justify-center text-tertiary text-xs">—</div>
        )}
      </div>
    ),
  },
  {
    id: "name",
    header: "Nomi",
    isRowHeader: true,
    allowsSorting: true,
    accessor: "name",
    cell: (row) => (
      <div>
        <p className="font-medium text-primary truncate max-w-[200px]">{row.name}</p>
        {row.description && <p className="text-xs text-tertiary truncate max-w-[200px] mt-0.5">{row.description}</p>}
      </div>
    ),
  },
  {
    id: "price_coins",
    header: "Narx",
    allowsSorting: true,
    headClassName: "",
    cellClassName: "",
    accessor: "price_coins",
    cell: (row) => (
      <span className="inline-flex items-center gap-1.5 font-semibold text-sm text-brand-solid">
        {row.price_coins.toLocaleString()}
        <CoinOutlineIcon size={16} color="currentColor" strokeWidth={22} />
      </span>
    ),
  },
  {
    id: "stock_type",
    header: "Ombor",
    headClassName: "",
    cellClassName: "",
    cell: (row) => {
      if (row.stock_type === "UNLIMITED") {
        return <span className="text-xs font-medium text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-600/10 px-2 py-0.5 rounded-full">Cheksiz</span>;
      }
      return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${(row.stock_quantity ?? 0) > 0
          ? "text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-600/10"
          : "text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-600/10"
          }`}>
          {row.stock_quantity ?? 0} dona
        </span>
      );
    },
  },
  {
    id: "is_active",
    header: "Holat",
    headClassName: "",
    cellClassName: "",
    cell: (row) => (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${row.is_active
        ? "text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-600/10"
        : "text-tertiary bg-secondary"
        }`}>
        {row.is_active ? "Faol" : "Arxiv"}
      </span>
    ),
  },
];
