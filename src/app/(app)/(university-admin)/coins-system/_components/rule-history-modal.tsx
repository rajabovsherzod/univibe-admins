"use client";

import { format } from "date-fns";
import { ClockRefresh } from "@untitledui/icons";
import { useCoinRuleHistory } from "@/hooks/api/use-coins";
import type { CoinRule } from "@/lib/api/types";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Button } from "@/components/base/buttons/button";

interface RuleHistoryModalProps {
  item: CoinRule;
  onClose: () => void;
}

export function RuleHistoryModal({ item, onClose }: RuleHistoryModalProps) {
  const { data: history, isLoading } = useCoinRuleHistory(item.public_id);

  const getActionLabel = (action: string) => {
    switch (action) {
      case "CREATE":
        return "Yaratildi";
      case "UPDATE":
        return "Tahrirlandi";
      case "ARCHIVE":
        return "Arxivlandi";
      case "ACTIVATE":
        return "Aktivlashtirildi";
      default:
        return action;
    }
  };

  const getRoleLabel = (role: string) => {
    return role === "university_admin" ? "Admin" : "Xodim";
  };

  const renderChanges = (changes: Record<string, { old: any; new: any }>, action: string) => {
    if (!changes || Object.keys(changes).length === 0) return null;

    return (
      <div className="mt-2 rounded-lg bg-secondary/30 p-2.5 text-xs text-secondary flex flex-col gap-1.5 border border-secondary">
        {Object.entries(changes).map(([key, val]) => {
          let fieldName = key;
          if (key === "name") fieldName = "Nomi";
          else if (key === "description") fieldName = "Izoh";
          else if (key === "coin_amount") fieldName = "Ball miqdori";
          else if (key === "status") fieldName = "Holati";
          else if (key === "allowed_job_positions") fieldName = "Ruxsat etilgan lavozimlar";

          const oldVal = Array.isArray(val.old) ? val.old.join(", ") : String(val.old);
          const newVal = Array.isArray(val.new) ? val.new.join(", ") : String(val.new);

          if (action === "CREATE") {
            return (
              <div key={key} className="flex flex-wrap items-center gap-1">
                <span className="font-semibold text-primary">{fieldName}:</span>
                <span className="text-brand-solid font-medium">{newVal || "bo'sh"}</span>
              </div>
            );
          }

          return (
            <div key={key} className="flex flex-wrap items-center gap-1">
              <span className="font-semibold text-primary">{fieldName}:</span>
              <span className="line-through text-tertiary px-1 bg-secondary/50 rounded">{oldVal || "bo'sh"}</span>
              <span className="text-secondary">&rarr;</span>
              <span className="text-brand-solid font-medium px-1 bg-brand-soft/20 rounded">{newVal || "bo'sh"}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Qoida o'zgarishlar tarixi"
      description={`"${item.name}" qoidasi bo'yicha amalga oshirilgan barcha o'zgarishlar tarixi.`}
      icon={ClockRefresh}
      iconBgClassName="bg-brand-soft"
      iconClassName="text-brand-solid"
      size="md"
      footer={
        <div className="flex w-full items-center justify-end">
          <Button color="secondary" size="md" onClick={onClose}>
            Yopish
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-brand-solid border-t-transparent" />
            <span className="text-sm text-secondary">Tarix yuklanmoqda...</span>
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-8 text-sm text-tertiary">
            Ushbu qoida uchun o'zgarishlar tarixi topilmadi.
          </div>
        ) : (
          <div className="relative border-l border-secondary pl-5 ml-2.5 flex flex-col gap-6 my-2">
            {history.map((entry) => {
              let markerColor = "bg-brand-solid ring-brand-solid/20";
              if (entry.action === "ARCHIVE") markerColor = "bg-error-500 ring-error-500/20";
              if (entry.action === "ACTIVATE") markerColor = "bg-success-500 ring-success-500/20";

              return (
                <div key={entry.public_id} className="relative">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[25px] top-1.5 size-2.5 rounded-full ring-4 ${markerColor}`}
                  />

                  {/* Log Content */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-primary">
                        {getActionLabel(entry.action)}
                      </span>
                      <span className="text-xs text-tertiary tabular-nums">
                        {format(new Date(entry.created_at), "dd.MM.yyyy HH:mm")}
                      </span>
                    </div>

                    <span className="text-xs text-secondary mt-0.5">
                      Tomonidan:{" "}
                      <strong className="text-primary font-medium">
                        {entry.user_name}
                      </strong>{" "}
                      ({getRoleLabel(entry.user_role)})
                    </span>

                    {renderChanges(entry.changes, entry.action)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PremiumFormModal>
  );
}
