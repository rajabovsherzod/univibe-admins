"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Edit05, Trash01, ClockRefresh, RefreshCcw01, QrCode01 } from "@untitledui/icons";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";

import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { useCoinRules, useToggleRuleStatus } from "@/hooks/api/use-coins";
import { usePermissions } from "@/hooks/use-permissions";
import type { CoinRule } from "@/lib/api/types";
import { cx } from "@/utils/cx";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";

import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";

import { CreateRuleModal } from "./create-rule-modal";
import { EditRuleModal } from "./edit-rule-modal";
import { RuleHistoryModal } from "./rule-history-modal";

import { Tooltip } from "@/components/base/tooltip/tooltip";
import { PermissionsTab } from "./permissions-tab";
import { QrIssueModal } from "./qr-issue-modal";
import { QrRequestsTab } from "./qr-requests-tab";

export function RulesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "reward" | "penalty" | "archived" | "permissions" | "qr">("all");
  const debouncedSearch = useDebounce(search, 500);
  const router = useRouter();

  const { can, isAdmin } = usePermissions();
  const canCreate = can("coins.rule.create");
  const canQr = can("coins.qr_award");
  // Per-row edit/archive visibility comes from each rule's `can_manage` flag
  // (backend: admin, manage-all, or create+own).

  const { data, isLoading } = useCoinRules({
    page,
    page_size: 10,
    search: debouncedSearch || undefined,
    rule_type: activeTab === "reward" ? "reward" : activeTab === "penalty" ? "penalty" : undefined,
    status: activeTab === "archived" ? "archived" : "active",
  });

  const toggleStatusMutation = useToggleRuleStatus();

  const handleToggleStatus = async (rule: CoinRule) => {
    const isCurrentlyActive = rule.status?.toUpperCase() === "ACTIVE";
    const nextAction = isCurrentlyActive ? "archive" : "activate";
    try {
      await toggleStatusMutation.mutateAsync({ id: rule.public_id, action: nextAction });
      toast.success(
        isCurrentlyActive
          ? "Qoida muvaffaqiyatli arxivlandi"
          : "Qoida muvaffaqiyatli aktivlashtirildi"
      );
    } catch (e: any) {
      toast.error("Xatolik yuz berdi", { description: e.message });
    }
  };

  const [modal, setModal] = useState<
    | { type: "create"; ruleType: "reward" | "penalty" }
    | { type: "edit"; item: CoinRule }
    | { type: "history"; item: CoinRule }
    | { type: "qr"; item: CoinRule }
    | null
  >(null);

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
          <span className="text-xs text-tertiary truncate max-w-[200px]" title={row.description}>
            {row.description}
          </span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Miqdori",
      cell: (row) => {
        const isPenalty = row.coin_amount < 0;
        const colorClass = isPenalty ? "text-error-500" : "text-brand-solid";
        return (
          <div className={cx("flex items-center gap-1.5", colorClass)}>
            <span className="text-sm font-semibold">{row.coin_amount > 0 ? `+${row.coin_amount}` : row.coin_amount}</span>
            <CoinOutlineIcon size={18} color="currentColor" strokeWidth={22} />
          </div>
        );
      },
    },
    {
      id: "created_by",
      header: "Yaratuvchi",
      cell: (row) => {
        const roleLabel = row.created_by_role === "university_admin" ? "Admin" : "Xodim";
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary">{row.created_by_name || "—"}</span>
            <span className="text-xs text-tertiary">{roleLabel}</span>
          </div>
        );
      },
    },
    {
      id: "usage",
      header: "Birinchi ishlatilgan",
      cell: (row) => (
        <span className="text-sm text-secondary">
          {row.first_used_at ? format(new Date(row.first_used_at), "dd.MM.yyyy") : "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Holati",
      cell: (row) => {
        const isActive = row.status?.toUpperCase() === "ACTIVE";
        return (
          <span
            className={cx(
              "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
              isActive
                ? "bg-success-solid text-white ring-success-solid"
                : "bg-secondary text-secondary ring-border-secondary"
            )}
          >
            {isActive ? "Faol" : "Arxivlangan"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      headClassName: "w-[140px]",
      cellClassName: "px-3",
      cell: (row) => {
        const isActive = row.status?.toUpperCase() === "ACTIVE";
        const isToggling = toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === row.public_id;
        return (
          <div className="flex items-center justify-end gap-1">
            {canQr && isActive && (
              <Tooltip title="QR orqali berish" delay={0}>
                <Button
                  color="tertiary"
                  size="sm"
                  iconLeading={QrCode01}
                  onClick={() => setModal({ type: "qr", item: row })}
                  aria-label="QR orqali berish"
                />
              </Tooltip>
            )}
            <Tooltip title="Tarix" delay={0}>
              <Button
                color="tertiary"
                size="sm"
                iconLeading={ClockRefresh}
                onClick={() => router.push(`/coins-system/rules/${row.public_id}/history`)}
                aria-label="Tarix"
              />
            </Tooltip>
            {row.can_manage && (
              <>
                <Tooltip title="Tahrirlash" delay={0}>
                  <Button
                    color="tertiary"
                    size="sm"
                    iconLeading={Edit05}
                    onClick={() => setModal({ type: "edit", item: row })}
                    aria-label="Tahrirlash"
                    isDisabled={!isActive}
                  />
                </Tooltip>
                <Tooltip title={isActive ? "Arxivlash" : "Faollashtirish"} delay={0}>
                  <Button
                    color={isActive ? "tertiary-destructive" : "tertiary"}
                    size="sm"
                    iconLeading={isActive ? Trash01 : RefreshCcw01}
                    onClick={() => handleToggleStatus(row)}
                    aria-label={isActive ? "Arxivlash" : "Faollashtirish"}
                    isLoading={isToggling}
                  />
                </Tooltip>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
            <button
              className={cx("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", activeTab === "all" ? "bg-brand-solid text-white shadow-sm" : "text-tertiary hover:text-secondary")}
              onClick={() => { setActiveTab("all"); setPage(1); }}
            >
              Barchasi
            </button>
            <button
              className={cx("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", activeTab === "reward" ? "bg-brand-solid text-white shadow-sm" : "text-tertiary hover:text-secondary")}
              onClick={() => { setActiveTab("reward"); setPage(1); }}
            >
              Rag'batlantirish
            </button>
            <button
              className={cx("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", activeTab === "penalty" ? "bg-brand-solid text-white shadow-sm" : "text-tertiary hover:text-secondary")}
              onClick={() => { setActiveTab("penalty"); setPage(1); }}
            >
              Jarimalar
            </button>
            <button
              className={cx("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", activeTab === "archived" ? "bg-brand-solid text-white shadow-sm" : "text-tertiary hover:text-secondary")}
              onClick={() => { setActiveTab("archived"); setPage(1); }}
            >
              Arxivlangan
            </button>
            {canQr && (
              <button
                className={cx("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", activeTab === "qr" ? "bg-brand-solid text-white shadow-sm" : "text-tertiary hover:text-secondary")}
                onClick={() => { setActiveTab("qr"); setPage(1); }}
              >
                QR so&apos;rovlar
              </button>
            )}
            {isAdmin && (
              <button
                className={cx("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", activeTab === "permissions" ? "bg-brand-solid text-white shadow-sm" : "text-tertiary hover:text-secondary")}
                onClick={() => { setActiveTab("permissions"); setPage(1); }}
              >
                Ruxsatlar
              </button>
            )}
          </div>

          {activeTab !== "permissions" && activeTab !== "qr" && (
            <Input
              placeholder="Qidirish..."
              value={search}
              onChange={(v) => {
                setSearch(v as string);
                setPage(1); // Reset page to 1 when searching
              }}
              className="w-full sm:w-[200px]"
            />
          )}
        </div>

        {activeTab !== "archived" && activeTab !== "permissions" && activeTab !== "qr" && canCreate && (
          <div className="flex items-center gap-2">
            <Button
              color="primary"
              size="md"
              iconLeading={Plus}
              onClick={() => setModal({ type: "create", ruleType: "reward" })}
            >
              Rag&apos;bat
            </Button>
            <Button
              color="primary-destructive"
              size="md"
              iconLeading={Plus}
              className="ring-1 ring-error-300 dark:ring-error-700 shadow-xs"
              onClick={() => setModal({ type: "create", ruleType: "penalty" })}
            >
              Jarima
            </Button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      {activeTab === "permissions" ? (
        <PermissionsTab />
      ) : activeTab === "qr" ? (
        <QrRequestsTab />
      ) : (
        <DataTable
          ariaLabel="Ball qoidalari"
          data={data?.results || []}
          columns={columns}
          rowKey="public_id"
          isLoading={isLoading || !data}
          emptyTitle="Ball qoidalari yo'q"
          emptyDescription="Hozircha tizimda hech qanday qoida yaratilmagan."
          pagination={{
            page: page,
            total: Math.ceil((data?.count ?? data?.pagination?.total_items ?? 0) / 20) || 1,
            onPageChange: setPage,
            showRange: true,
            totalItems: data?.count ?? data?.pagination?.total_items ?? 0,
            pageSize: 20,
          }}
        />
      )}

      {/* ── Modals ── */}
      {modal?.type === "create" && <CreateRuleModal onClose={() => setModal(null)} ruleType={modal.ruleType} />}
      {modal?.type === "edit" && <EditRuleModal item={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === "history" && <RuleHistoryModal item={modal.item} onClose={() => setModal(null)} />}
      <QrIssueModal isOpen={modal?.type === "qr"} rule={modal?.type === "qr" ? modal.item : null} onClose={() => setModal(null)} />
    </div>
  );
}
