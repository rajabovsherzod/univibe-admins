"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, AlertTriangle, InfoCircle, CheckCircle } from "@untitledui/icons";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AttentionItem = {
  id: string;
  title: string;       // "12 ta ro'yxatdan o'tish tasdiq kutyapti"
  hint?: string;       // "Hackathon 2026"
  href: string;
  tone?: "danger" | "warning" | "info" | "success";
  rightLabel?: string; // "Bugun", "3 kun"
};

function toneIcon(tone?: AttentionItem["tone"]) {
  if (tone === "danger") return AlertTriangle;
  if (tone === "warning") return AlertTriangle;
  if (tone === "success") return CheckCircle;
  return InfoCircle;
}

function toneIconClass(tone?: AttentionItem["tone"]) {
  if (tone === "danger") return "text-error-primary";
  if (tone === "warning") return "text-warning-primary";
  if (tone === "success") return "text-success-primary";
  return "text-fg-brand-secondary";
}

function toneDotClass(tone?: AttentionItem["tone"]) {
  if (tone === "danger") return "bg-error-primary";
  if (tone === "warning") return "bg-warning-primary";
  if (tone === "success") return "bg-success-primary";
  return "bg-fg-brand-secondary";
}

function IconBox({ tone = "info" }: { tone?: AttentionItem["tone"] }) {
  const Icon = toneIcon(tone);

  return (
    <span
      className={cx(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-secondary_subtle",
        "shadow-xs ring-1 ring-secondary ring-inset"
      )}
    >
      <Icon className={cx("size-5", toneIconClass(tone))} />
    </span>
  );
}

function Row({ it }: { it: AttentionItem }) {
  return (
    <div
      className={cx(
        "group flex items-center justify-between gap-3 rounded-xl bg-primary px-3.5 py-3",
        "shadow-xs ring-1 ring-secondary ring-inset transition",
        "hover:bg-primary_hover"
      )}
    >
      {/* LEFT: icon + text (vertikal markaz) */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <IconBox tone={it.tone} />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-secondary">{it.title}</p>
          {it.hint ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-tertiary">{it.hint}</p>
          ) : null}
        </div>
      </div>

      {/* RIGHT: label + hover icon */}
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          {it.rightLabel ? (
            <div className="flex items-center gap-2">
              <span className={cx("inline-block size-2 rounded-full", toneDotClass(it.tone))} />
              <span className="text-xs font-medium text-tertiary">{it.rightLabel}</span>
            </div>
          ) : null}

          <span
            className={cx(
              "grid size-9 place-items-center rounded-lg",
              "text-fg-quaternary ring-1 ring-transparent ring-inset",
              "opacity-0 transition group-hover:opacity-100",
              "hover:bg-secondary_subtle hover:text-tertiary"
            )}
            aria-hidden="true"
          >
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function DashboardAttentionQueue({ items }: { items: AttentionItem[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-xl bg-primary px-4 py-8 text-center ring-1 ring-secondary ring-inset">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary_subtle ring-1 ring-secondary ring-inset">
          <InfoCircle className="size-6 text-tertiary" />
        </div>
        <p className="mt-3 text-sm font-semibold text-secondary">Hozircha navbat yo‘q.</p>
        <p className="mt-1 text-sm text-tertiary">Tasdiq kutayotgan ishlar paydo bo‘lsa shu yerda chiqadi.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => (
        <Link key={it.id} href={it.href} className="block">
          <Row it={it} />
        </Link>
      ))}
    </div>
  );
}
