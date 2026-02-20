// app/(app)/_components/sidebar/app-sidebar.tsx
// 1:1 copy of pro-project OwnerSidebar, adapted for Univibe
"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemDividerType, NavItemType } from "@/components/application/app-navigation/config";
import { NavAccountCard } from "@/components/application/app-navigation/base-components/nav-account-card";
import {
  HomeLine,
  Settings01,
  Users01,
  Shield01,
  Grid01,
  PieChart03,
  Briefcase01,
} from "@untitledui/icons";

export function AppSidebar() {
  const pathname = usePathname();

  const navItems: (NavItemType | NavItemDividerType)[] = [
    { label: "Dashboard", href: "/dashboard", icon: HomeLine },
    { divider: true },
    { label: "Xodimlar", href: "/staff", icon: Users01 },
    { label: "Lavozimlar", href: "/job-positions", icon: Briefcase01 },
    { label: "Coins tizimi", href: "/coins-system", icon: Grid01 },
    { label: "Statistika", href: "/statistics", icon: PieChart03 },
    { divider: true },
    { label: "Tizim", href: "/system", icon: Shield01 },
    { label: "Sozlamalar", href: "/settings", icon: Settings01 },
  ];

  return (
    <div className="flex h-full flex-col rounded-xl border border-secondary/50 bg-primary shadow-md">
      {/* Logo */}
      <div className="flex items-center px-5 py-5 border-b border-secondary">
        <Image
          src="/sidebar.svg"
          alt="Univibe Admin"
          width={160}
          height={40}
          className="h-10 w-auto"
          unoptimized
        />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <NavList activeUrl={pathname} items={navItems} className="py-3" />
      </div>

      {/* Panel Label */}
      <div className="border-t border-secondary px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">
          Admin Panel
        </span>
      </div>

      {/* Account Card */}
      <div className="border-t border-secondary px-4 py-4">
        <NavAccountCard />
      </div>
    </div>
  );
}
