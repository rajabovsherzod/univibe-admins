"use client";

import type { ReactNode, ChangeEvent, FC, HTMLAttributes } from "react";
import { cx } from "@/utils/cx";
import { SearchMd, ChevronRight, HomeLine } from "@untitledui/icons";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

type PageHeaderProProps = {
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (e: ChangeEvent<HTMLInputElement>) => void;
  countPosition?: "title" | "right";
  icon?: FC<HTMLAttributes<HTMLOrSVGElement>>;
  className?: string;
};

/**
 * Premium Page Header.
 *
 * Breadcrumbs are rendered as a brand-solid parallelogram "tag" shape:
 * - Left/top/bottom edges are straight
 * - Right edge cuts diagonally ("/") at ~42° from the bottom-right corner
 *   up toward the top — so the tab is wider at the top, narrower at the bottom
 * - Width is content-driven (min 250px), grows with breadcrumb text
 * - The diagonal is CSS clip-path polygon — no JS, no absolute positioning tricks
 *
 * The rest of the header (title, desc, search, actions) is fully adaptive
 * bg-primary dark/light and is NOT affected by the breadcrumb tab width.
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

  return (
    <div
      className={cx(
        "overflow-hidden rounded-xl shadow-sm ring-1 ring-secondary bg-primary",
        className
      )}
    >
      {/* ── Breadcrumb Parallelogram Tab ──────────────────────────────────
          Shape: left/top/bottom straight; right edge diagonal "/" at 42°.
          - The element is inline-flex so it auto-sizes to content (min 250px).
          - paddingRight: 52px = 40px diagonal zone + 12px breathing room.
          - clipPath polygon:
              top-left  (0,0)  →  top-right (100%,0)   [full width at top]
              →  bottom-right (calc(100%−40px), 100%)   [40px shorter at bottom]
              →  bottom-left  (0,100%)
            This creates the "/" diagonal on the right edge.
          ──────────────────────────────────────────────────────────────── */}
      {hasBreadcrumbs && (
        <div className="overflow-hidden" aria-label="breadcrumb-strip">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-1.5 h-9 pl-5 bg-brand-solid text-white whitespace-nowrap"
            style={{
              minWidth: "250px",
              paddingRight: "52px",
              clipPath:
                "polygon(0 0, 100% 0, calc(100% - 40px) 100%, 0 100%)",
            }}
          >
            {/* Home */}
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
                  <span className="text-xs font-semibold text-white">
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>
      )}

      {/* ── Main content row — adaptive bg-primary (dark/light) ── */}
      <div className="relative px-4 py-4 sm:px-5">
        {/* Decorative icon — very subtle watermark, right side */}
        {Icon && (
          <div className="pointer-events-none select-none absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block">
            <Icon
              className="size-20 lg:size-24 text-brand-solid/[.07] dark:text-brand-solid/[.04] rotate-[15deg]"
            />
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage:
                  "linear-gradient(60deg, transparent 25%, black 50%, transparent 75%)",
                maskImage:
                  "linear-gradient(60deg, transparent 25%, black 50%, transparent 75%)",
                WebkitMaskSize: "300% 100%",
                maskSize: "300% 100%",
                animation: "phHeaderShimmer 5s ease-in-out infinite",
              }}
            >
              <Icon
                className="size-20 lg:size-24 text-brand-solid/20 dark:text-brand-solid/10 rotate-[15deg]"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Title & Subtitle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-primary sm:text-2xl">
                {title}
              </h1>
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

          {/* Right: Count + Search + Actions — NOT affected by breadcrumb tab */}
          <div className="flex items-center gap-2.5 z-10 shrink-0 flex-wrap">
            {typeof count === "number" && countPosition === "right" && (
              <div className="flex items-center gap-3 pr-3 border-r border-secondary">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-tertiary">
                    {countLabel}
                  </span>
                  <span className="text-lg font-bold text-primary leading-none tabular-nums">
                    {new Intl.NumberFormat("uz-UZ").format(count)}
                  </span>
                </div>
              </div>
            )}

            {showSearch && (
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchMd className="size-4 text-quaternary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={onSearch}
                  className="block w-full sm:w-56 rounded-lg border-0 bg-secondary py-2 pl-9 pr-3 text-sm text-primary shadow-xs ring-1 ring-inset ring-secondary placeholder:text-placeholder focus:ring-2 focus:ring-inset focus:ring-brand-solid outline-none transition-all"
                />
              </div>
            )}

            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes phHeaderShimmer {
          0%   { mask-position: 200% 0; -webkit-mask-position: 200% 0; }
          100% { mask-position: -200% 0; -webkit-mask-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
