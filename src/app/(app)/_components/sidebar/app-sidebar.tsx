// app/(app)/_components/sidebar/app-sidebar.tsx
"use client";

import { memo, useMemo } from "react";
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
  Trophy01,
  ClockRefresh,
  BarChartSquare02,
  FileCheck02,
} from "@untitledui/icons";

import { useWaitedStudentsCount } from "@/hooks/api/use-students";
import { useAdminOrders } from "@/app/(app)/(university-admin)/market/orders/_hooks/use-orders-admin";
import { useAdminPendingEventsCount } from "@/hooks/api/use-events-admin";
import { Badge } from "@/components/base/badges/badges";
import { usePermissions } from "@/hooks/use-permissions";
import { filterStaffNavItems } from "./nav-permissions";

function AppSidebarComponent({ role }: { role: string }) {
  const pathname = usePathname();
  // Permissions come from the session (seeded server-side), so they're present
  // on the very first render — the filtered nav is correct immediately, with
  // no loading window and no skeleton flash on refresh.
  const { can } = usePermissions();

  // Gate the badge queries by the SAME permission that gates their nav item.
  // If a user can't see the item, we never fetch its count — so a staff member
  // without `market.order.view` never fires the orders request (which would
  // 403), and admins (who hold every permission) get both badges.
  const canViewOrders = can("market.order.view");
  const canReviewApplications = can("students.applications.review");
  const canPublishEvents = can("events.publish");

  // "Yangi talabalar" badge — staff only, and only when they can see it.
  const { data: waitedData } = useWaitedStudentsCount({
    enabled: role === "staff" && canReviewApplications,
  });

  // Pending-orders badge — anyone who may view orders (admin or permitted staff).
  const { data: pendingOrdersData } = useAdminOrders(
    { status: "PENDING", page_size: 1 },
    { enabled: canViewOrders }
  );

  // Pending event-approval requests badge — only for approvers.
  const { data: pendingEventsCount = 0 } = useAdminPendingEventsCount({
    enabled: canPublishEvents,
  });

  const pendingOrderCount = pendingOrdersData?.count ?? 0;
  const waitedCount = waitedData?.waited_students_count ?? 0;

  // The nav tree is rebuilt only when the inputs that actually shape it change
  // (role, granted permissions, badge counts) — not on every route change, so
  // navigation stays snappy. `can` is stable per session (memoised in the hook).
  const navItems = useMemo(() => {
    // The queries above only run when permitted, so the counts are already 0
    // for anyone who shouldn't see a badge — no extra role guard needed here.
    const badgeContent = waitedCount ? (
      <Badge color="brand" size="sm" className="!bg-brand-solid !text-white !ring-brand-solid shadow-sm">
        +{waitedCount}
      </Badge>
    ) : undefined;

    const pendingOrderBadge = pendingOrderCount > 0 ? (
      <Badge color="brand" size="sm" className="!bg-brand-solid !text-white !ring-brand-solid shadow-sm">
        +{pendingOrderCount}
      </Badge>
    ) : undefined;

    const pendingEventsBadge = pendingEventsCount > 0 ? (
      <Badge color="brand" size="sm" className="!bg-brand-solid !text-white !ring-brand-solid shadow-sm">
        +{pendingEventsCount}
      </Badge>
    ) : undefined;

  // Base items for everyone
  const dashboardItem: NavItemType = { label: "Dashboard", href: "/dashboard", icon: HomeLine };

  // Specific Staff Items
  const staffItems: (NavItemType | NavItemDividerType)[] = [
    dashboardItem,
    { divider: true },
    { label: "Talabalar", href: "/students", icon: Users01 },
    { label: "Yangi talabalar", href: "/applications", icon: FileCheck02, badge: badgeContent },
    { label: "Statistika", href: "/coins/statistics", icon: BarChartSquare02 },
    { label: "Reytinglar", href: "/coins/leaderboard", icon: Trophy01 },
    { label: "Ball tarixi", href: "/coins/history", icon: ClockRefresh },
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
    {
      label: "Ijtimoiy",
      href: "/clubs",
      icon: Users01,
      badge: pendingEventsBadge,
      items: [
        { label: "Klublar", href: "/clubs" },
        { label: "Tadbirlar", href: "/events", badge: pendingEventsBadge },
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
    { divider: true },
    { label: "Fakultetlar", href: "/faculties", icon: Building03 },
    { label: "Kurslar", href: "/year-levels", icon: LayersThree01 },
    { label: "Darajalar", href: "/degree-levels", icon: GraduationHat01 },
    // NOTE: "Lavozimlar" (/job-positions) intentionally NOT included — job
    // positions are a pure admin function, never staff-reachable.
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
    { label: "Talabalar", href: "/students", icon: Users01 },
    { label: "Yangi talabalar", href: "/applications", icon: FileCheck02 },
    { label: "Statistika", href: "/coins/statistics", icon: BarChartSquare02 },
    { label: "Reytinglar", href: "/coins/leaderboard", icon: Trophy01 },
    { label: "Ball tarixi", href: "/coins/history", icon: ClockRefresh },
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
      label: "Ijtimoiy",
      href: "/clubs",
      icon: Users01,
      badge: pendingEventsBadge,
      items: [
        { label: "Klublar", href: "/clubs" },
        { label: "Tadbirlar", href: "/events", badge: pendingEventsBadge },
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

    // Staff nav is filtered by granted permissions; admins see everything.
    // Groups (items with sub-links, e.g. "Market") are kept if at least one of
    // their sub-links is allowed, with the disallowed sub-links dropped too —
    // so a staff member never sees a link that will just 403 on click.
    return role === "staff" ? filterStaffNavItems(staffItems, can) : adminItems;
  }, [role, can, waitedCount, pendingOrderCount, pendingEventsCount]);

  const panelLabel = role === "staff" ? "Xodim Paneli" : "Admin Panel";

  const CARD_SHADOW = 'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)]';

  return (
    <div className={`flex h-full flex-col rounded-2xl border border-secondary bg-primary ${CARD_SHADOW} overflow-hidden`}>
      {/* Brand line at the very top */}
      <div className="h-1.5 w-full bg-brand-solid shrink-0" />
      
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

// Memoised: only re-renders when `role` changes (route changes are picked up
// internally via usePathname), so unrelated parent re-renders (e.g. toggling
// the mobile menu) don't re-render the whole sidebar tree.
export const AppSidebar = memo(AppSidebarComponent);
