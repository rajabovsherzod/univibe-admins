"use client";

import React from "react";
import Link from "next/link";
import { cx } from "@/utils/cx";

type SectionCardProps = {
  title: string;
  description?: string;
  hrefAll?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * Universal Section Card.
 * Header: bg-brand-solid BOTH in light AND dark mode (same as KPI cards).
 * Body: bg-primary (adaptive).
 */
export function SectionCard({
  title,
  description,
  hrefAll,
  headerRight,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cx(
        "overflow-hidden rounded-2xl shadow-sm ring-1 ring-secondary",
        className
      )}
    >
      {/* Header — brand-solid in BOTH light & dark */}
      <div className="flex items-center justify-between gap-4 bg-brand-solid px-5 py-3.5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white leading-snug">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-white/70 leading-snug">
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {headerRight}
          {hrefAll && (
            <Link
              href={hrefAll}
              className="text-xs font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline transition-colors whitespace-nowrap"
            >
              Hammasi
            </Link>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="bg-primary">{children}</div>
    </section>
  );
}
