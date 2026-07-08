"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X as XIcon, QrCode01 } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { useQrRequests, useDecideQrRequest, type QrIssueRequest } from "@/hooks/api/use-coins";
import { toHttps } from "@/utils/cx";
import { cx } from "@/utils/cx";

const STATUS_TABS = [
  { key: "PENDING", label: "Kutilmoqda" },
  { key: "APPROVED", label: "Tasdiqlangan" },
  { key: "REJECTED", label: "Rad etilgan" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  APPROVED: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
  REJECTED: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400",
};

/** Persistent queue of QR claims — even after the QR modal is closed the staff
 * can approve/reject anything still waiting here. */
export function QrRequestsTab() {
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]["key"]>("PENDING");
  const { data = [], isLoading } = useQrRequests({
    status,
    refetchInterval: status === "PENDING" ? 4000 : undefined,
  });
  const { mutateAsync: decide, isPending: deciding } = useDecideQrRequest();

  async function decideRow(r: QrIssueRequest, action: "approve" | "reject") {
    try {
      await decide({ id: r.public_id, action });
      if (action === "approve") toast.success("Ball berildi", { description: r.student_name });
      else toast("Rad etildi", { description: r.student_name });
    } catch (e: any) {
      toast.error("Amaliyotda xatolik", { description: e?.message });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 rounded-lg bg-secondary p-1 w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={cx(
              "rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors",
              status === t.key ? "bg-primary text-primary shadow-sm" : "text-tertiary hover:text-secondary"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl skeleton-shimmer bg-secondary" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-secondary py-14 text-center">
          <QrCode01 className="mx-auto mb-3 size-10 text-fg-quaternary" />
          <p className="text-sm text-tertiary">
            {status === "PENDING" ? "Kutilayotgan so'rovlar yo'q — qoida yonidagi QR tugmasini oching" : "Hozircha bo'sh"}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((r) => (
            <li key={r.public_id} className="flex items-center gap-3 rounded-xl border border-secondary bg-primary px-4 py-3">
              <Avatar size="md" src={toHttps(r.student_photo_url)} initials={(r.student_name || "T").slice(0, 2).toUpperCase()} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-primary">{r.student_name}</p>
                <p className="truncate text-xs text-tertiary">
                  {r.rule_name} · {new Date(r.created_at).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={cx("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", r.coin_amount < 0 ? "bg-error-50 text-error-700" : "bg-brand-solid/10 text-brand-solid")}>
                {r.coin_amount > 0 ? "+" : ""}{r.coin_amount}
              </span>
              <span className={cx("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_BADGE[r.status])}>
                {STATUS_TABS.find((t) => t.key === r.status)?.label ?? r.status}
              </span>
              {r.status === "PENDING" && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button color="primary" size="sm" iconLeading={Check} isDisabled={deciding} onClick={() => decideRow(r, "approve")}>
                    Tasdiqlash
                  </Button>
                  <Button color="tertiary-destructive" size="sm" iconLeading={XIcon} isDisabled={deciding} onClick={() => decideRow(r, "reject")} aria-label="Rad etish" />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
