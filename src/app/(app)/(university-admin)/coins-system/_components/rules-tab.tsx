"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Edit05, Trash01, Coins02 } from "@untitledui/icons";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";

import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { useCoinRules, useToggleRuleStatus } from "@/hooks/api/use-coins";
import type { CoinRule } from "@/lib/api/types";
import { cx } from "@/utils/cx";
import { useDebounce } from "@/hooks/use-debounce";

import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";

import { CreateRuleModal } from "./create-rule-modal";
import { EditRuleModal } from "./edit-rule-modal";

const STATUS_ITEMS = [
  { id: "active", label: "Faollari" },
  { id: "archived", label: "Arxivlanganlar" },
];

export function RulesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active");
  const [modal, setModal] = useState<"create" | { type: "edit"; item: CoinRule } | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useCoinRules({
    page,
    page_size: 10,
    search: debouncedSearch || undefined,
    status: statusFilter,
  });
  console.log("Kelayotgan data: ", data)

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
          {(page - 1) * 10 + (i ?? 0) + 1}
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
        <div className="flex items-center gap-1.5 text-brand-solid">
          <span className="text-sm font-semibold">{row.coin_amount}</span>
          <CoinOutlineIcon size={18} color="currentColor" strokeWidth={22} />
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
          <Button
            color="tertiary"
            size="sm"
            iconLeading={Edit05}
            onClick={() => setModal({ type: "edit", item: row })}
            aria-label="Tahrirlash"
          />
          <Button
            color="tertiary-destructive"
            size="sm"
            iconLeading={Trash01}
            onClick={() => handleToggleStatus(row)}
            isDisabled={toggleStatus.isPending}
            aria-label={row.status === "ACTIVE" ? "Arxivlash" : "Faollashtirish"}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={(v) => {
              setSearch(v as string);
              setPage(1); // Reset page to 1 when searching
            }}
            className="w-full sm:w-[250px]"
          />
          <Select
            selectedKey={statusFilter}
            onSelectionChange={(key) => {
              setStatusFilter(key as "active" | "archived");
              setPage(1); // Reset page to 1 when changing status
            }}
            items={STATUS_ITEMS}
            placeholder="Holati"
          >
            {(item) => <Select.Item id={item.id} label={item.label} />}
          </Select>
        </div>

        <Button
          color="primary"
          size="md"
          iconLeading={Plus}
          onClick={() => setModal("create")}
        >
          Yangi qoida
        </Button>
      </div>

      {/* ── Table ── */}
      <DataTable
        ariaLabel="Coin qoidalari"
        data={data?.results || []}
        columns={columns}
        rowKey="public_id"
        isLoading={isLoading || !data}
        emptyTitle="Qoidalar topilmadi"
        emptyDescription="Hozircha hech qanday coin qoidasi kiritilmagan."
        pagination={{
          page: page,
          total: Math.ceil((data?.count || 0) / 10) || 1,
          onPageChange: setPage,
        }}
      />

      {/* ── Modals ── */}
      {modal === "create" && <CreateRuleModal onClose={() => setModal(null)} />}
      {typeof modal === "object" && modal !== null && modal.type === "edit" && (
        <EditRuleModal item={modal.item} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
