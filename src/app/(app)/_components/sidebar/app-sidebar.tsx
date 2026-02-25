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
  GraduationHat01,
  Building03,
  LayersThree01,
} from "@untitledui/icons";

import { useWaitedStudentsCount } from "@/hooks/api/use-students";

export function AppSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { data: waitedData } = useWaitedStudentsCount();

  const badgeContent = waitedData?.count ? (
    <span className="flex h-5 items-center justify-center rounded-full bg-success-solid px-2 text-xs font-semibold text-white">
      +{waitedData.count}
    </span>
  ) : undefined;

  // Base items for everyone
  const dashboardItem: NavItemType = { label: "Dashboard", href: "/dashboard", icon: HomeLine };

  // Specific Staff Items — talabalar bitta tabli sahifada
  const staffItems: (NavItemType | NavItemDividerType)[] = [
    dashboardItem,
    { divider: true },
    { label: "Talabalar", href: "/students", icon: Users01, badge: badgeContent },
    { label: "Ballar tizimi", href: "/coins-system", icon: Grid01 },
    { divider: true },
    { label: "Sozlamalar", href: "/settings", icon: Settings01 },
  ];

  // Specific Admin Items — talabalar admin uchun yo'q
  const adminItems: (NavItemType | NavItemDividerType)[] = [
    dashboardItem,
    { divider: true },
    { label: "Xodimlar", href: "/staff", icon: Users01 },
    { label: "Fakultetlar", href: "/faculties", icon: Building03 },
    { label: "Kurslar", href: "/year-levels", icon: LayersThree01 },
    { label: "Lavozimlar", href: "/job-positions", icon: Briefcase01 },
    { label: "Darajalar", href: "/degree-levels", icon: GraduationHat01 },
    { divider: true },
    { label: "Ballar tizimi", href: "/coins-system", icon: Grid01 },
    { label: "Statistika", href: "/statistics", icon: PieChart03 },
    { divider: true },
    { label: "Tizim", href: "/system", icon: Shield01 },
    { label: "Sozlamalar", href: "/settings", icon: Settings01 },
  ];

  const navItems = role === "staff" ? staffItems : adminItems;
  const panelLabel = role === "staff" ? "Xodim Paneli" : "Admin Panel";

  return (
    <div className="flex h-full flex-col rounded-xl border border-secondary/50 bg-primary shadow-md">
      {/* Logo */}
      <div className="relative z-10 flex items-center px-5 py-5 border-b border-secondary shadow-sm">
        <Image
          src="/sidebar.svg"
          alt="Univibe Admin"
          width={160}
          height={40}
          priority
          className="h-10 w-40"
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
          {panelLabel}
        </span>
      </div>

      {/* Account Card */}
      <div className="border-t border-secondary px-4 py-4">
        <NavAccountCard />
      </div>
    </div>
  );
}
