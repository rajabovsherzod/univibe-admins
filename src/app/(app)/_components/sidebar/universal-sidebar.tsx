"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchLg } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";

import { MobileNavigationHeader } from "@/components/application/app-navigation/base-components/mobile-header";
import { NavAccountCard } from "@/components/application/app-navigation/base-components/nav-account-card";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";

import type {
  NavItemDividerType,
  NavItemType,
} from "@/components/application/app-navigation/config";

type BrandProps = {
  /** Left mark/logo node (SVG component, img, etc.) */
  mark?: React.ReactNode;
  /** Brand text */
  name?: string;
  /** Click goes here (optional) */
  href?: string;
};

export type UniversalSidebarProps = {
  /** Sidebar nav items (Untitled config type) */
  items: (NavItemType | NavItemDividerType)[];

  /** Optional override active url; default = usePathname() */
  activeUrl?: string;

  /** Width on desktop */
  width?: number;

  /** Brand row props */
  brand?: BrandProps;

  /** Search input */
  showSearch?: boolean;
  searchPlaceholder?: string;

  /** Bottom slot (default = NavAccountCard) */
  footer?: React.ReactNode;

  /** Extra className for aside */
  className?: string;
};

export function UniversalSidebar({
  items,
  activeUrl,
  width = 292,
  brand = { name: "Inventrix", href: "/" },
  showSearch = true,
  searchPlaceholder = "Search",
  footer,
  className = "",
}: UniversalSidebarProps) {
  const pathname = usePathname();
  const currentUrl = activeUrl ?? pathname;

  const content = (
    <aside
      style={{ ["--width" as any]: `${width}px` } as React.CSSProperties}
      className={[
        // same “feel” as Untitled sidebar
        "flex h-full w-full max-w-full flex-col justify-between overflow-auto",
        "bg-primary pt-4 shadow-xs",
        "md:border-r md:border-secondary",
        "lg:w-(--width) lg:rounded-xl lg:border lg:border-secondary lg:pt-5",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col gap-5 px-4 lg:px-5">
        {/* Brand row */}
        <div className="flex items-center gap-3">
          {brand.href ? (
            <Link href={brand.href} className="flex items-center gap-3">
              {brand.mark ? <span className="grid place-items-center">{brand.mark}</span> : null}
              {brand.name ? (
                <span className="text-[22px] font-semibold tracking-tight text-primary transition hover:opacity-90">
                  {brand.name}
                </span>
              ) : null}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {brand.mark ? <span className="grid place-items-center">{brand.mark}</span> : null}
              {brand.name ? (
                <span className="text-[22px] font-semibold tracking-tight text-primary">
                  {brand.name}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Search */}
        {showSearch ? (
          <Input
            shortcut
            size="sm"
            aria-label="Search"
            placeholder={searchPlaceholder}
            icon={SearchLg}
          />
        ) : null}
      </div>

      {/* Nav */}
      <NavList activeUrl={currentUrl} items={items} className="mt-5" />

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-5 px-2 py-4 lg:gap-6 lg:px-4 lg:py-4">
        {footer ?? <NavAccountCard />}
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile header navigation */}
      <MobileNavigationHeader>{content}</MobileNavigationHeader>

      {/* Desktop sidebar navigation (fixed) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:py-1 lg:pl-1">
        {content}
      </div>

      {/* Placeholder space for content (because sidebar is fixed) */}
      <div
        style={{ paddingLeft: width + 4 }}
        className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block"
      />
    </>
  );
}
