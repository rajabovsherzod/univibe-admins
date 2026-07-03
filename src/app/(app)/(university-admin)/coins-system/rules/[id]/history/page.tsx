"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ClockRefresh, ArrowLeft } from "@untitledui/icons";
import { useCoinRuleHistory, useCoinRuleDetail } from "@/hooks/api/use-coins";
import { Button } from "@/components/base/buttons/button";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Skeleton } from "@/components/ui/skeleton";

export default function RuleHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: rule, isLoading: ruleLoading } = useCoinRuleDetail(id);
  const { data: history, isLoading: historyLoading } = useCoinRuleHistory(id);

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
      <div className="mt-2 rounded-lg bg-secondary/30 p-3 text-sm text-secondary flex flex-col gap-2 border border-secondary w-full max-w-2xl">
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
              <div key={key} className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-primary">{fieldName}:</span>
                <span className="text-brand-solid font-medium">{newVal || "bo'sh"}</span>
              </div>
            );
          }

          return (
            <div key={key} className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-primary">{fieldName}:</span>
              <span className="line-through text-tertiary px-1.5 bg-secondary/50 rounded">{oldVal || "bo'sh"}</span>
              <span className="text-secondary">&rarr;</span>
              <span className="text-brand-solid font-medium px-1.5 bg-brand-soft/20 rounded">{newVal || "bo'sh"}</span>
            </div>
          );
        })}
      </div>
    );
  };

const HistorySkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 w-full">
      <div className="relative flex items-center justify-center">
        <div className="absolute size-10 rounded-full border-[3px] border-secondary/30"></div>
        <div className="size-10 rounded-full border-[3px] border-transparent border-t-brand-solid animate-spin"></div>
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h3 className="text-base font-medium text-primary">Tarix yuklanmoqda</h3>
        <p className="text-sm text-tertiary max-w-[250px]">
          Iltimos kuting, qoida o'zgarishlari tarixi bazadan olinmoqda...
        </p>
      </div>
    </div>
  );
};

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ballar tizimi", href: "/coins-system" },
          { label: "Qoida tarixi" },
        ]}
        title="Qoida tarixi"
        subtitle={
          ruleLoading
            ? "Qoida ma'lumotlari yuklanmoqda..."
            : rule
            ? `"${rule.name}" qoidasi bo'yicha amalga oshirilgan barcha o'zgarishlar tarixi.`
            : "Qoida topilmadi"
        }
        icon={ClockRefresh}
      />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary p-6">
        {ruleLoading || historyLoading ? (
          <HistorySkeleton />
        ) : !rule ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-tertiary">Qoida topilmadi</p>
            <Button onClick={() => router.push("/coins-system")}>Ortga qaytish</Button>
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-12 text-sm text-tertiary">
            Ushbu qoida uchun o'zgarishlar tarixi topilmadi.
          </div>
        ) : (
          <div className="relative border-l-2 border-secondary pl-6 ml-3 flex flex-col gap-8 my-4">
            {history.map((entry) => {
              let markerColor = "bg-brand-solid ring-brand-solid/20";
              if (entry.action === "ARCHIVE") markerColor = "bg-error-500 ring-error-500/20";
              if (entry.action === "ACTIVATE") markerColor = "bg-success-500 ring-success-500/20";

              return (
                <div key={entry.public_id} className="relative">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[31px] top-1.5 size-3.5 rounded-full ring-4 ${markerColor}`}
                  />

                  {/* Log Content */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                      <span className="text-base font-semibold text-primary">
                        {getActionLabel(entry.action)}
                      </span>
                      <span className="text-sm text-tertiary tabular-nums bg-secondary/50 px-2 py-0.5 rounded-md">
                        {format(new Date(entry.created_at), "dd.MM.yyyy HH:mm")}
                      </span>
                    </div>

                    <span className="text-sm text-secondary mt-1">
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
    </div>
  );
}
