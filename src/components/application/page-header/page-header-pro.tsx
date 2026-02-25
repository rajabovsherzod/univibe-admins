"use client";

import type { ReactNode, ChangeEvent, FC, HTMLAttributes } from "react";
import { cx } from "@/utils/cx";
import { SearchMd, ChevronRight, HomeLine } from "@untitledui/icons";
import Link from "next/link";
import { Input } from "@/components/base/input/input";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

type PageHeaderProProps = {
  title: ReactNode;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  countPosition?: "title" | "right";
  /** Icon shown ONLY when actions is absent. Brand colored. Vertically centered in RIGHT column. */
  icon?: FC<HTMLAttributes<HTMLOrSVGElement>>;
  className?: string;
};

/**
 * Layout:
 * ┌────────────────────────────────────────────────────────┐
 * │ LEFT (flex-col)                │ RIGHT (items-center)  │
 * │  [Breadcrumb parallelogram]    │                        │
 * │  [Title + Subtitle]  (px-5 py-4)  │  [Icon OR search+btn] │
 * └────────────────────────────────────────────────────────┘
 *
 * RIGHT column is a flex container — vertically centered
 * over the FULL card height (both breadcrumb + body rows).
 */
export function PageHeaderPro({
  title,
  subtitle,
  count,
  countLabel = "Jami",
  breadcrumbs,
  actions,
  showSearch,
  searchPlaceholder = "Qidirish...",
  searchValue,
  onSearch,
  countPosition = "title",
  icon: Icon,
  className,
}: PageHeaderProProps) {
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;
  const showIcon = !!(Icon && !actions);

  return (
    <div
      className={cx(
        "overflow-hidden rounded-xl bg-primary",
        "shadow-[0_4px_20px_-2px_rgba(16,24,40,0.14),0_2px_6px_-2px_rgba(16,24,40,0.08)]",
        "dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45),0_2px_6px_-2px_rgba(0,0,0,0.28)]",
        "ring-1 ring-secondary",
        className
      )}
    >
      {/* Two-column layout — RIGHT spans full card height so icon/actions center correctly */}
      <div className="flex items-stretch min-h-[80px]">

        {/* ── LEFT: breadcrumb tab + title/desc (takes remaining width) ── */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Breadcrumb parallelogram tab */}
          {hasBreadcrumbs && (
            <div className="overflow-hidden">
              <nav
                aria-label="Breadcrumb"
                className="inline-flex items-center gap-1.5 h-9 pl-5 bg-brand-solid text-white whitespace-nowrap"
                style={{
                  minWidth: "220px",
                  paddingRight: "52px",
                  clipPath: "polygon(0 0, 100% 0, calc(100% - 38px) 100%, 0 100%)",
                }}
              >
                <Link
                  href="/dashboard"
                  className="flex items-center text-white/70 hover:text-white transition-colors"
                >
                  <HomeLine className="size-3.5" />
                </Link>
                {breadcrumbs!.map((item, index) => (
                  <span key={index} className="inline-flex items-center gap-1.5">
                    <ChevronRight className="size-3 text-white/40" />
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-xs font-medium text-white/70 hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-white">{item.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            </div>
          )}

          {/* Title + subtitle */}
          <div className="flex-1 px-5 py-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-primary sm:text-2xl">{title}</h1>
              {typeof count === "number" && countPosition === "title" && (
                <span className="inline-flex items-center rounded-full bg-brand-solid px-2.5 py-0.5 text-xs font-semibold text-white tabular-nums">
                  {countLabel}: {new Intl.NumberFormat("uz-UZ").format(count)}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-sm text-tertiary max-w-xl">{subtitle}</p>
            )}
          </div>
        </div>

        {/* ── RIGHT: search + actions OR decorative icon — vertically centered in full card height ── */}
        <div className="flex items-center justify-end gap-2.5 px-5 shrink-0">
          {typeof count === "number" && countPosition === "right" && (
            <div className="flex flex-col items-end pr-3 border-r border-secondary">
              <span className="text-xs font-medium text-tertiary">{countLabel}</span>
              <span className="text-lg font-bold text-primary leading-none tabular-nums">
                {new Intl.NumberFormat("uz-UZ").format(count)}
              </span>
            </div>
          )}

          {showSearch && (
            <div className="w-56 sm:w-72">
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearch}
                icon={SearchMd}
              />
            </div>
          )}

          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}

          {/* Decorative icon — brand solid, shown only without actions */}
          {showIcon && Icon && (
            <Icon
              className="size-20 sm:size-28 shrink-0 text-[#006ab0] opacity-40 rotate-[12deg]"
              color="#006ab0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
