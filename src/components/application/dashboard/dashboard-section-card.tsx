"use client";

import React from "react";
import Link from "next/link";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type DashboardSectionCardProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  hrefAll?: string; // "Hammasi" linki
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
        "rounded-2xl bg-card-primary p-4 md:p-6",
        "shadow-xs-skeumorphic ring-1 ring-primary ring-inset",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-tertiary">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          {right}
          {hrefAll ? (
            <Link
              href={hrefAll}
              className="rounded-lg bg-secondary_subtle px-3 py-2 text-xs font-semibold text-secondary ring-1 ring-secondary ring-inset hover:bg-primary_hover"
            >
              Hammasi
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}
