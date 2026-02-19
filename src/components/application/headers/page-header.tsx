"use client";

import React from "react";
import Link from "next/link";
import { SearchLg, Plus } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { ThemeSwitcher } from "@/components/application/theme/theme-switcher";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PrimaryAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ElementType;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;

  breadcrumbs?: BreadcrumbItem[];

  primaryAction?: PrimaryAction;

  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;

  right?: React.ReactNode;

  showThemeSwitcher?: boolean;

  meta?: React.ReactNode;

  sticky?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  showSearch = true,
  searchPlaceholder = "Qidirish…",
  onSearchChange,
  right,
  showThemeSwitcher = true,
  meta,
  sticky = false,
}: PageHeaderProps) {
  const [q, setQ] = React.useState("");
  const PrimaryIcon = primaryAction?.icon ?? Plus;

  return (
    <div
      className={cx(
        sticky && "sticky top-6 z-20",
        "rounded-2xl bg-card-primary p-4 md:p-6",
        "shadow-xs-skeumorphic ring-1 ring-primary ring-inset"
      )}
    >
      {/* ✅ HAR DOIM VERTIKAL MARKAZ */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* LEFT */}
        <div className="min-w-0 flex flex-col gap-2">

          {/* Title + meta */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="truncate text-display-sm font-semibold text-primary md:text-display-md">
              {title}
            </h1>

            {meta ? (
              <div className="shrink-0 rounded-full bg-secondary_subtle px-2.5 py-1 text-xs font-semibold text-tertiary ring-1 ring-secondary ring-inset">
                {meta}
              </div>
            ) : null}
          </div>

          {subtitle ? <p className="text-md text-tertiary">{subtitle}</p> : null}
        </div>

        {/* RIGHT (✅ vertikal markaz, har qanday holatda) */}
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
          {/* Search */}
          {showSearch ? (
            <div className="w-full md:w-[320px]">
              <Input
                size="sm"
                aria-label="Search"
                placeholder={searchPlaceholder}
                icon={SearchLg}
                value={q}
                onChange={(arg: any) => {
                  const v =
                    typeof arg === "string"
                      ? arg
                      : typeof arg?.value === "string"
                      ? arg.value
                      : arg?.target?.value ?? "";

                  setQ(v);
                  onSearchChange?.(v);
                }}
              />

            </div>
          ) : null}

          {/* Custom right slot */}
          {right ? <div className="flex items-center gap-2">{right}</div> : null}

          {/* Primary action */}
          {primaryAction ? (
            primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className={cx(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold",
                  "bg-brand-solid text-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset",
                  "hover:bg-brand-solid_hover"
                )}
              >
                <PrimaryIcon className="size-4" />
                {primaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className={cx(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold",
                  "bg-brand-solid text-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset",
                  "hover:bg-brand-solid_hover"
                )}
              >
                <PrimaryIcon className="size-4" />
                {primaryAction.label}
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
