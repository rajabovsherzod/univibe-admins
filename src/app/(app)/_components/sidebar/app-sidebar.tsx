// app/(app)/_components/sidebar/app-sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemDividerType, NavItemType } from "@/components/application/app-navigation/config";
import { NavAccountCard } from "@/components/application/app-navigation/base-components/nav-account-card";
import {
  HomeLine,
  Users01,
  Grid01,
  Briefcase01,
  Building03,
  LayersThree01,
  ShoppingBag02,
  Share04, // Marketing icon
  GraduationHat01, // Graduation icon
} from "@untitledui/icons";

import { useWaitedStudentsCount } from "@/hooks/api/use-students";
import { useAdminOrders } from "@/app/(app)/(university-admin)/market/orders/_hooks/use-orders-admin";
import { Badge } from "@/components/base/badges/badges";

export function AppSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  
  // Only fetch waited students count for staff role (skip entirely for admin)
  const { data: waitedData } = useWaitedStudentsCount(
    role === "staff" ? { enabled: true } : undefined
  );
  
  // Only fetch pending orders for admin role (skip entirely for staff)
  const { data: pendingOrdersData } = useAdminOrders(
    role === "admin" ? { status: 'PENDING', page_size: 1 } : undefined
  );

  const pendingOrderCount = pendingOrdersData?.count ?? 0;

  // Only show badge for staff
  const badgeContent = (role === "staff" && waitedData?.waited_students_count) ? (
    <Badge color="brand" size="sm" className="!bg-brand-solid !text-white !ring-brand-solid shadow-sm">
      +{waitedData.waited_students_count}
    </Badge>
  ) : undefined;

  // Only show pending order badge for admin
  const pendingOrderBadge = (role === "admin" && pendingOrderCount > 0) ? (
    <Badge color="brand" size="sm" className="!bg-brand-solid !text-white !ring-brand-solid shadow-sm">
      +{pendingOrderCount}
    </Badge>
  ) : undefined;

  // Base items for everyone
  const dashboardItem: NavItemType = { label: "Dashboard", href: "/dashboard", icon: HomeLine };

  // Specific Staff Items
  const staffItems: (NavItemType | NavItemDividerType)[] = [
    dashboardItem,
    { divider: true },
    { label: "Talabalar", href: "/students", icon: Users01, badge: badgeContent },
    { label: "Ballar tizimi", href: "/coins-system", icon: Grid01 },
    {
      label: "Market",
      href: "/market",
      icon: ShoppingBag02,
      badge: pendingOrderBadge,
      items: [
        { label: "Mukofotlar", href: "/market" },
        { label: "Buyurtmalar", href: "/market/orders", badge: pendingOrderBadge },
      ],
    },
  ];

  // Specific Admin Items
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
    {
      label: "Market",
      href: "/market/orders",
      icon: ShoppingBag02,
      badge: pendingOrderBadge,
      items: [
        { label: "Mukofotlar", href: "/market" },
        { label: "Buyurtmalar", href: "/market/orders", badge: pendingOrderBadge },
        { label: "Audit", href: "/market/audit" },
      ],
    },
    {
      label: "Marketing",
      href: "/banners",
      icon: Share04,
      items: [
        { label: "Bannerlar", href: "/banners" },
      ],
    },
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
