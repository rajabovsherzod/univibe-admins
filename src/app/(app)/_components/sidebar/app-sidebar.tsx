"use client";

import * as React from "react";
import { UniversalSidebar } from "./universal-sidebar";
import type { NavItemDividerType, NavItemType } from "@/components/application/app-navigation/config";

// Untitled icons (xohlaganingni qo'yasan)
import {
  HomeLine,
  Settings01,
  Users01,
  Shield01,
  Grid01,
  PieChart03,
} from "@untitledui/icons";

type Role = "admin" | "superadmin" | "user";

function withBase(
  basePath: string,
  items: (NavItemType | NavItemDividerType)[]
): (NavItemType | NavItemDividerType)[] {
  const isExternal = (href: string) => href.startsWith("http://") || href.startsWith("https://");

  const mapItem = (it: any): any => {
    if (it.divider) return it;

    const next = { ...it };
    if (typeof next.href === "string" && !isExternal(next.href)) {
      next.href = basePath + (next.href.startsWith("/") ? next.href : `/${next.href}`);
    }
    if (Array.isArray(next.items)) next.items = next.items.map(mapItem);
    return next;
  };

  return items.map(mapItem);
}

function buildItems(role: Role) {
  // ⚠️ URLlarni sen o'zing final qilasan — bu faqat namuna
  const common: (NavItemType | NavItemDividerType)[] = [
    { label: "Dashboard", href: "/dashboard", icon: HomeLine },
    { label: "Settings", href: "/settings", icon: Settings01 },
    { divider: true },
  ];

  const adminOnly: (NavItemType | NavItemDividerType)[] = [
    { label: "Users", href: "/users", icon: Users01 },
    { label: "Reports", href: "/reports", icon: PieChart03 },
  ];

  const superAdminOnly: (NavItemType | NavItemDividerType)[] = [
    { label: "Adminlar", href: "/admins", icon: Users01 },
    { label: "Coins tizimi", href: "/coins-system", icon: Grid01 },
    { label: "System", href: "/system", icon: Shield01 },
  ];

  if (role === "superadmin") return [...common, ...superAdminOnly];
  if (role === "admin") return [...common, ...adminOnly];
  return common;
}

export function AppSidebar({
  role,
  basePath = "",
}: {
  role: Role;
  /** xohlasang: "/owner" "/admin" kabi prefix */
  basePath?: string;
}) {
  const itemsRaw = buildItems(role);
  const items = basePath ? withBase(basePath, itemsRaw) : itemsRaw;

  return (
    <UniversalSidebar
      items={items}
      width={292}
      brand={{
        name: "Inventrix",
        href: "/dashboard",
      }}
      showSearch
      searchPlaceholder="Search"
    />
  );
}
