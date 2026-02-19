"use client";

import React from "react";
import Link from "next/link";
import type { ElementType } from "react";
import { Calendar } from "@untitledui/icons";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type UpcomingEventItem = {
  id: string;
  title: string;
  dateLabel: string; // "10-fev, 14:00"
  location?: string;

  // bular badge emas — faqat text sifatida ishlatamiz
  registrationLabel?: string; // "Ro'yxat: 3 kun qoldi"
  capacityLabel?: string; // "48/80"

  status?: "open" | "closing" | "soon" | "live";
  href?: string;

  icon?: ElementType;
};

function IconBox({
  Icon,
  iconClassName,
}: {
  Icon: ElementType;
  iconClassName?: string;
}) {
  return (
    <span
      className={cx(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-secondary_subtle",
        "shadow-xs ring-1 ring-secondary ring-inset"
      )}
    >
      <Icon className={cx("size-5", iconClassName ?? "text-tertiary")} />
    </span>
  );
}

function statusText(status?: UpcomingEventItem["status"]) {
  if (!status) return "";
  if (status === "open") return "Ochiq";
  if (status === "closing") return "Yopilmoqda";
  if (status === "soon") return "Yaqin";
  return "Live";
}

function joinMeta(parts: Array<string | undefined | null | false>) {
  const clean = parts.map((p) => (p ? String(p).trim() : "")).filter(Boolean);
  return clean.join(" • ");
}

export function DashboardUpcomingEvents({ items }: { items: UpcomingEventItem[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-xl bg-primary px-4 py-8 text-center ring-1 ring-secondary ring-inset">
        <p className="text-sm font-semibold text-secondary">Yaqin eventlar yo‘q.</p>
        <p className="mt-1 text-sm text-tertiary">Yangi tadbirlar yaratilsa shu yerda chiqadi.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((e) => {
        const Icon = e.icon ?? Calendar;

        // ✅ faqat Calendar bo‘lsa brand rang beramiz
        const isCalendar = Icon === Calendar;

        const meta = joinMeta([e.location, e.registrationLabel, statusText(e.status)]);

        const row = (
          <div
            className={cx(
              "group flex items-center justify-between gap-3 rounded-xl bg-primary px-3.5 py-3",
              "shadow-xs ring-1 ring-secondary ring-inset transition",
              "hover:bg-primary_hover"
            )}
          >
            {/* LEFT */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <IconBox
                Icon={Icon}
                iconClassName={cx(
                  isCalendar ? "text-fg-brand-secondary" : "text-tertiary",
                  "transition"
                )}
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-secondary">{e.title}</p>
                {meta ? (
                  <p className="mt-0.5 truncate text-sm text-tertiary">{meta}</p>
                ) : (
                  <p className="mt-0.5 truncate text-sm text-tertiary">—</p>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-tertiary">{e.dateLabel}</p>
              {e.capacityLabel ? (
                <p className="mt-1 text-xs font-medium text-tertiary">{e.capacityLabel}</p>
              ) : null}
            </div>
          </div>
        );

        return e.href ? (
          <Link key={e.id} href={e.href} className="block">
            {row}
          </Link>
        ) : (
          <div key={e.id}>{row}</div>
        );
      })}
    </div>
  );
}
