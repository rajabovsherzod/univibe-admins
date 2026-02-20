"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Edit05, Trash01, Coins02 } from "@untitledui/icons";

import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { useCoinRules, useToggleRuleStatus } from "@/hooks/api/use-coins";
import type { CoinRule } from "@/lib/api/types";
import { cx } from "@/utils/cx";

// Modals imported later
import { CreateRuleModal } from "./create-rule-modal";
import { EditRuleModal } from "./edit-rule-modal";

export function RulesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active");
  const [modal, setModal] = useState<"create" | { type: "edit"; item: CoinRule } | null>(null);

  const { data, isLoading } = useCoinRules({
    page,
    page_size: 20,
    search: search || undefined,
    status: statusFilter,
  });

  const toggleStatus = useToggleRuleStatus();

  const handleToggleStatus = async (item: CoinRule) => {
    try {
      const action = item.status === "ACTIVE" ? "archive" : "activate";
      await toggleStatus.mutateAsync({ id: item.public_id, action });
      toast.success(
        `Qoida muvaffaqiyatli ${action === "activate" ? "faollashtirildi" : "arxivlandi"}`
      );
    } catch (e: any) {
      toast.error("Xatolik", { description: e.message });
    }
  };

  const columns: DataTableColumn<CoinRule>[] = [
    {
      id: "index",
      header: "№",
      headClassName: "w-[50px]",
      cell: (row, i) => (
        <span className="text-sm tabular-nums text-tertiary">
          {(page - 1) * 20 + (i ?? 0) + 1}
        </span>
      ),
    },
    {
      id: "name",
      header: "Qoida nomi",
      isRowHeader: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{row.name}</span>
          <span className="text-xs text-tertiary truncate max-w-[200px]">
            {row.description}
          </span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Miqdori",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Coins02 className="size-4 text-warning-solid" />
          <span className="text-sm font-semibold text-warning-solid">{row.coin_amount}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Holati",
      cell: (row) => (
        <span
          className={cx(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            row.status === "ACTIVE"
              ? "bg-success-soft text-success-primary"
              : "bg-error-soft text-error-primary"
          )}
        >
          {row.status === "ACTIVE" ? "Faol" : "Arxivlangan"}
        </span>
      ),
    },
    {
      id: "usage",
      header: "Foydalanilgan",
      cell: (row) => (
        <span className="text-sm text-secondary">{row.usage_count} marta</span>
      ),
    },
    {
      id: "actions",
      header: "",
      headClassName: "w-[120px]",
      cellClassName: "px-3",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setModal({ type: "edit", item: row })}
            className="rounded-lg p-1.5 text-tertiary transition hover:bg-secondary hover:text-primary"
            title="Tahrirlash"
          >
            <Edit05 className="size-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            disabled={toggleStatus.isPending}
            className="rounded-lg p-1.5 text-tertiary transition hover:bg-error-soft hover:text-error-primary disabled:opacity-50"
            title={row.status === "ACTIVE" ? "Arxivlash" : "Faollashtirish"}
          >
            <Trash01 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[250px] rounded-lg bg-primary px-3 py-2 text-sm text-primary placeholder:text-placeholder outline-none ring-1 ring-inset ring-secondary focus:ring-2 focus:ring-brand-solid"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "active" | "archived")}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-primary outline-none ring-1 ring-inset ring-secondary focus:ring-2 focus:ring-brand-solid"
          >
            <option value="active">Faollari</option>
            <option value="archived">Arxivlanganlar</option>
          </select>
        </div>

        <button
          onClick={() => setModal("create")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover"
        >
          <Plus className="size-4" />
          Yangi qoida
        </button>
      </div>

      {/* ── Table ── */}
      <DataTable
        ariaLabel="Coin qoidalari"
        data={data?.results || []}
        columns={columns}
        rowKey="public_id"
        isLoading={isLoading}
        emptyTitle="Qoidalar topilmadi"
        emptyDescription="Hozircha hech qanday coin qoidasi kiritilmagan."
      />

      {/* Pagination controls can be added here using data?.count */}

      {/* ── Modals ── */}
      {modal === "create" && <CreateRuleModal onClose={() => setModal(null)} />}
      {typeof modal === "object" && modal !== null && modal.type === "edit" && (
        <EditRuleModal item={modal.item} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
