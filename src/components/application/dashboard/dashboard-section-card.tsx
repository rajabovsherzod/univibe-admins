"use client";

import React from "react";
import Link from "next/link";
import { cx } from "@/utils/cx";

type DashboardSectionCardProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  hrefAll?: string;
  children: React.ReactNode;
  className?: string;
};

export function DashboardSectionCard({
  title,
  subtitle,
  right,
  hrefAll,
  children,
  className,
}: DashboardSectionCardProps) {
  return (
    <section
      className={cx(
        "overflow-hidden rounded-2xl shadow-md ring-1 ring-secondary",
        className
      )}
    >
      {/* Brand header — same in dark & light */}
      <div className="flex items-start justify-between gap-4 bg-brand-solid px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-white/80">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {right}
          {hrefAll ? (
            <Link
              href={hrefAll}
              className="rounded-lg bg-white/20 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/30 ring-inset hover:bg-white/30 transition-colors"
            >
              Hammasi
            </Link>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="bg-primary p-4 md:p-6">{children}</div>
    </section>
  );
}
