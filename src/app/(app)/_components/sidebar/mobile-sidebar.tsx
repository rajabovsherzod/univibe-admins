// app/(app)/_components/sidebar/mobile-sidebar.tsx
// CSS-only animation version — no framer-motion required
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronRight } from "@untitledui/icons";
import Image from "next/image";
import Link from "next/link";
import { NavAccountCard } from "@/components/application/app-navigation/base-components/nav-account-card";
import { cx } from "@/utils/cx";
import {
  HomeLine,
  Settings01,
  Users01,
  Shield01,
  Grid01,
  FileCheck02,
  PieChart03,
  GraduationHat01,
  Building03,
  LayersThree01,
} from "@untitledui/icons";

import { useWaitedStudentsCount } from "@/hooks/api/use-students";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  badge?: React.ReactNode;
  divider?: never;
}

interface NavDivider {
  divider: true;
  label?: never;
  href?: never;
  icon?: never;
  badge?: never;
}

type NavItemOrDivider = NavItem | NavDivider;

export function MobileSidebar({ isOpen, onClose, role }: MobileSidebarProps) {
  const pathname = usePathname();
  const { data: waitedData } = useWaitedStudentsCount();

  const badgeContent = waitedData?.count ? (
    <span className="flex h-5 items-center justify-center rounded-full bg-success-solid px-2 text-xs font-semibold text-white">
      +{waitedData.count}
    </span>
  ) : undefined;

  // Specific Staff Items
  const staffItems: NavItemOrDivider[] = [
    { label: "Dashboard", href: "/dashboard", icon: HomeLine },
    { divider: true },
    { label: "Talabalar ro'yxati", href: "/students", icon: Users01 },
    { label: "Yangi talabalar", href: "/applications", icon: FileCheck02, badge: badgeContent },
    { label: "Ballar tizimi", href: "/coins-system", icon: Grid01 },
    { divider: true },
    { label: "Sozlamalar", href: "/settings", icon: Settings01 },
  ];

  // Specific Admin Items
  const adminItems: NavItemOrDivider[] = [
    { label: "Dashboard", href: "/dashboard", icon: HomeLine },
    { divider: true },
    { label: "Xodimlar", href: "/staff", icon: Users01 },
    { label: "Fakultetlar", href: "/faculties", icon: Building03 },
    { label: "Kurslar", href: "/year-levels", icon: LayersThree01 },
    { label: "Darajalar", href: "/degree-levels", icon: GraduationHat01 },
    { divider: true },
    { label: "Talabalar ro'yxati", href: "/students", icon: Users01 },
    { label: "Yangi talabalar", href: "/applications", icon: FileCheck02, badge: badgeContent },
    { label: "Ballar tizimi", href: "/coins-system", icon: Grid01 },
    { label: "Statistika", href: "/statistics", icon: PieChart03 },
    { divider: true },
    { label: "Tizim", href: "/system", icon: Shield01 },
    { label: "Sozlamalar", href: "/settings", icon: Settings01 },
  ];

  const navItems = role === "staff" ? staffItems : adminItems;
  const panelLabel = role === "staff" ? "Xodim Paneli" : "Admin Panel";

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div
      className={cx(
        "fixed inset-0 z-50 md:hidden transition-[visibility] duration-300",
        isOpen ? "visible" : "invisible"
      )}
    >
      {/* Backdrop */}
      <div
        className={cx(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel — slides from RIGHT */}
      <div
        className={cx(
          "absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-primary shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-secondary px-5 py-4 shadow-sm">
            <div className="flex items-center">
              <Image
                src="/sidebar.svg"
                alt="Univibe Admin"
                width={140}
                height={32}
                className="h-8 w-auto"
                unoptimized
              />
            </div>
            <button
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-secondary active:bg-tertiary"
              aria-label="Menyuni yopish"
            >
              <X className="size-5 text-secondary" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-1">
              {navItems.map((item, index) => {
                if (item.divider) {
                  return (
                    <li key={`divider-${index}`} className="my-2 px-2">
                      <hr className="h-px border-none bg-border-secondary" />
                    </li>
                  );
                }

                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cx(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold",
                        active
                          ? "bg-brand-solid text-white shadow-sm"
                          : "text-secondary hover:bg-brand-solid/10 hover:text-brand-solid"
                      )}
                    >
                      <Icon
                        className={cx(
                          "size-5 shrink-0",
                          active ? "text-white" : "text-tertiary"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && <span className="shrink-0">{item.badge}</span>}
                      {active && <ChevronRight className="size-4 text-white/70" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Panel Label */}
          <div className="border-t border-secondary px-5 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">
              {panelLabel}
            </span>
          </div>

          {/* Account Card */}
          <div className="border-t border-secondary px-4 py-4">
            <NavAccountCard />
          </div>
        </div>
      </div>
    </div>
  );
}
