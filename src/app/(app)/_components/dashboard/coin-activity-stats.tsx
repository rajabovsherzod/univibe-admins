"use client";

import { useActivityStats } from "@/hooks/api/use-activity-stats";
import { CoinsStacked01, Trophy01, ArrowUpRight, ArrowDownLeft, RefreshCcw01, ClockRefresh, Users01, Settings01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { format } from "date-fns";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";

const CARD_SHADOW = "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)]";
const TAG_CLIP = "polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%)";

type Accent = "brand" | "success" | "warning" | "error";

const ICON_COLOR: Record<Accent, string> = {
  brand:   "text-brand-400/80 dark:text-brand-500/70",
  success: "text-success-400/80 dark:text-success-500/70",
  warning: "text-warning-400/85 dark:text-warning-500/70",
  error:   "text-error-400/80 dark:text-error-500/70",
};

function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  accent,
  isPositive,
  percentageChange,
  isLoading,
  isComingSoon,
}: {
  label: string;
  value?: React.ReactNode;
  caption: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; "aria-hidden"?: boolean }>;
  accent: Accent;
  isPositive?: boolean;
  percentageChange?: string;
  isLoading?: boolean;
  isComingSoon?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative flex flex-col overflow-hidden rounded-xl border border-secondary bg-primary min-h-[160px]",
        CARD_SHADOW
      )}
    >
      <div className="flex z-10 w-fit">
        <div
          className="bg-brand-600 dark:bg-brand-700 pl-4 pr-7 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white inline-flex"
          style={{ clipPath: TAG_CLIP }}
        >
          {label}
        </div>
      </div>

      <Icon
        className={cx(
          "pointer-events-none absolute right-4 top-4 size-14 transition-transform duration-300 opacity-30",
          ICON_COLOR[accent]
        )}
        style={{ transform: "rotate(15deg)" }}
        aria-hidden
      />

      <div className="flex flex-1 flex-col justify-between gap-4 px-5 pb-5 pt-6 z-10">
        {isComingSoon ? (
          <div className="flex flex-1 flex-col items-center justify-center h-full">
            <span className="text-xs font-semibold text-tertiary bg-secondary px-2.5 py-1 rounded-md uppercase tracking-wider">Tez orada</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              {isLoading ? (
                <div className="h-10 w-24 rounded-lg skeleton-shimmer" />
              ) : (
                <div className="text-4xl font-bold tabular-nums tracking-tight leading-none text-brand-700 dark:text-brand-300 flex items-center gap-2">
                  {value}
                </div>
              )}
              <span className="text-xs font-medium text-tertiary mt-1">{caption}</span>
            </div>

            {(percentageChange !== undefined) && (
              <div className="flex items-center gap-2 mt-auto">
                {isLoading ? (
                  <div className="h-4 w-32 rounded skeleton-shimmer" />
                ) : (
                  <>
                    <span className={cx("text-sm font-bold", isPositive ? "text-success-600" : "text-error-600")}>
                      {isPositive ? "+" : ""}{percentageChange}%
                    </span>
                    <span className="text-xs text-tertiary">oldingi oyga nisbatan</span>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function CoinActivityStats() {
  const { data, isLoading, error } = useActivityStats();

  if (error) {
    return (
      <div className="rounded-2xl border border-error-soft bg-error-50 p-6 text-error-primary">
        Statistikalarni yuklashda xatolik yuz berdi.
      </div>
    );
  }

  const this_month = data?.this_month;
  const top_students = data?.top_students || [];
  const recent_transactions = data?.recent_transactions || [];

  const currentMonthCoins = this_month?.total_coins_issued || 0;
  const lastMonthCoins = this_month?.total_coins_last_month || 0;

  let percentageChange = 0;
  if (lastMonthCoins > 0) {
    percentageChange = ((currentMonthCoins - lastMonthCoins) / lastMonthCoins) * 100;
  } else if (currentMonthCoins > 0) {
    percentageChange = 100; // infinite growth
  }

  const isPositive = percentageChange >= 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Shu oy berilgan ballar"
          value={
            <>
              {currentMonthCoins.toLocaleString()}
              <CoinOutlineIcon className="text-brand-500" size={28} strokeWidth={24} />
            </>
          }
          caption="Universitet bo'yicha jami"
          icon={CoinsStacked01}
          accent="brand"
          isPositive={isPositive}
          percentageChange={percentageChange.toFixed(1)}
          isLoading={isLoading}
        />
        
        {/* TODO: wire to real endpoints; static values until the API lands */}
        <StatCard
          label="Faol talabalar"
          value={<>36</>}
          caption="So'nggi 30 kunda faollik ko'rsatganlar"
          icon={Users01}
          accent="success"
          isPositive
          percentageChange="12.5"
          isLoading={isLoading}
        />
        <StatCard
          label="Ishlatilgan qoidalar"
          value={<>8</>}
          caption="Jami qoidalar kesimida"
          icon={Settings01}
          accent="warning"
          isPositive
          percentageChange="4.2"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top 5 Students */}
        <div className={cx("relative flex flex-col overflow-hidden rounded-xl border border-secondary bg-primary col-span-1 lg:col-span-1", CARD_SHADOW)}>
          <div className="flex z-10 w-fit">
            <div
              className="bg-brand-600 dark:bg-brand-700 pl-4 pr-7 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white inline-flex"
              style={{ clipPath: TAG_CLIP }}
            >
              ENG FAOL TALABALAR
            </div>
          </div>

          <div className="p-2 pt-4 flex-1 z-10 relative flex flex-col justify-start mt-2">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="size-8 rounded-full skeleton-shimmer shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 skeleton-shimmer rounded" />
                      <div className="h-2 w-1/2 skeleton-shimmer rounded" />
                    </div>
                    <div className="h-4 w-12 skeleton-shimmer rounded shrink-0" />
                  </div>
                ))}
              </div>
            ) : top_students.length === 0 ? (
              <div className="p-8 text-sm text-tertiary text-center">Hech qanday ma'lumot yo'q.</div>
            ) : (
              <ul className="flex flex-col gap-1">
                {top_students.map((student, idx) => (
                  <li key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {idx === 0 ? (
                        <img src="/places/1st-place.png" alt="1-o'rin" className="w-8 h-8 object-contain shrink-0 drop-shadow-sm" title="1-o'rin" />
                      ) : idx === 1 ? (
                        <img src="/places/2nd-place.png" alt="2-o'rin" className="w-8 h-8 object-contain shrink-0 drop-shadow-sm" title="2-o'rin" />
                      ) : idx === 2 ? (
                        <img src="/places/3rd-place.png" alt="3-o'rin" className="w-8 h-8 object-contain shrink-0 drop-shadow-sm" title="3-o'rin" />
                      ) : (
                        <div className="size-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-secondary text-secondary">
                          {student.rank || idx + 1}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-primary truncate">{student.full_name}</span>
                        <span className="text-xs text-tertiary truncate">{student.faculty || "Fakultet yo'q"}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-brand-solid flex items-center gap-1 tabular-nums shrink-0">
                      {student.total_coins.toLocaleString()}
                      <CoinOutlineIcon size={14} strokeWidth={24} color="currentColor" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={cx("relative flex flex-col overflow-hidden rounded-xl border border-secondary bg-primary col-span-1 lg:col-span-2", CARD_SHADOW)}>
          <div className="flex z-10 w-fit">
            <div
              className="bg-brand-600 dark:bg-brand-700 pl-4 pr-7 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white inline-flex"
              style={{ clipPath: TAG_CLIP }}
            >
              SO'NGGI AMALIYOTLAR
            </div>
          </div>

          <div className="p-0 overflow-x-auto flex-1 z-10 relative pt-4 flex flex-col justify-start mt-2">
            {isLoading ? (
              <div className="p-4 flex flex-col gap-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-8 w-32 skeleton-shimmer rounded" />
                    </div>
                    <div className="h-6 w-8 skeleton-shimmer rounded-full shrink-0" />
                    <div className="h-6 w-16 skeleton-shimmer rounded shrink-0" />
                    <div className="h-4 w-20 skeleton-shimmer rounded shrink-0 hidden sm:block" />
                  </div>
                ))}
              </div>
            ) : recent_transactions.length === 0 ? (
              <div className="p-8 text-sm text-tertiary text-center">Tranzaksiyalar mavjud emas.</div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-secondary/50 text-tertiary border-b border-secondary">
                  <tr>
                    <th className="px-5 py-3 font-medium">Talaba</th>
                    <th className="px-5 py-3 font-medium">Amal</th>
                    <th className="px-5 py-3 font-medium">Miqdor</th>
                    <th className="px-5 py-3 font-medium">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {recent_transactions.map((tx) => {
                    let Icon = ArrowUpRight;
                    let colorClass = "text-success-primary bg-success-soft";
                    if (tx.transaction_type === "DEDUCTION" || tx.transaction_type === "REDEMPTION") {
                      Icon = ArrowDownLeft;
                      colorClass = "text-error-primary bg-error-soft";
                    } else if (tx.transaction_type === "TRANSFER") {
                      Icon = RefreshCcw01;
                      colorClass = "text-warning-primary bg-warning-soft";
                    }
                    const isPositive = tx.amount > 0;

                    return (
                      <tr key={tx.transaction_public_id} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-medium text-primary block">{tx.student_name}</span>
                          <span className="text-xs text-tertiary block truncate max-w-[200px]" title={tx.coin_rule_name || ""}>{tx.coin_rule_name || "—"}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className={cx("inline-flex p-1.5 rounded-full", colorClass)}>
                            <Icon className="size-3.5" />
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cx("inline-flex items-center gap-1 font-bold tabular-nums", isPositive ? "text-success-solid" : "text-error-solid")}>
                            {isPositive ? "+" : "-"}{Math.abs(tx.amount).toLocaleString()}
                            <CoinOutlineIcon size={12} color="currentColor" strokeWidth={24} />
                          </span>
                        </td>
                        <td className="px-5 py-3 text-tertiary">
                          {format(new Date(tx.created_at), "dd.MM.yy HH:mm")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
