// app/(app)/_components/sidebar/nav-permissions.ts
// Shared between the desktop (app-sidebar.tsx) and mobile (mobile-sidebar.tsx)
// navigation so their staff-visible items and permission gates never drift.

/** Staff nav items → required permission code(s). Items not listed are always
 * visible (dashboard, leaderboard). Any-of semantics for arrays. Sub-items
 * inside a group (e.g. Market's "Buyurtmalar") are checked individually too. */
export const STAFF_NAV_PERMS: Record<string, string | string[]> = {
  "/students": "students.view",
  "/applications": "students.applications.review",
  "/coins/statistics": "coins.analytics.view",
  "/coins/history": "coins.audit.view",
  "/coins-system": "coins.rule.view",
  "/market": "market.product.view",
  "/market/orders": "market.order.view",
  "/market/audit": "market.audit.view",
  "/banners": "banners.view",
  "/clubs": "clubs.view",
  "/events": "events.view",
  "/faculties": "org.faculties.manage",
  "/degree-levels": "org.degree_levels.manage",
  "/year-levels": "org.year_levels.manage",
  // NOTE: "/job-positions" intentionally has NO entry here and is never
  // added to staffItems below — job positions are a pure admin function
  // (staff never manage or even view them, no matter what's granted).
};

/** Areas only a university admin may open. Staff reaching these (only possible
 * by typing the URL — they're never in the staff nav) get the ForbiddenState. */
const ADMIN_ONLY_PREFIXES = ["/staff", "/job-positions"];

export type RoutePolicy =
  | { mode: "allow" }
  | { mode: "admin-only" }
  | { mode: "perm"; codes: string[] };

/** Resolve a staff member's access policy for a pathname, reusing the exact
 * same permission map that hides/shows sidebar links — so "visible in sidebar"
 * and "reachable by URL" can never disagree. Longest matching prefix wins, so
 * `/market/orders` resolves to its own permission, not `/market`'s. Unmapped
 * routes default to `allow` (the backend still enforces), which keeps the
 * guard from ever throwing a false ForbiddenState on a page we didn't list. */
export function resolveRoutePolicy(pathname: string): RoutePolicy {
  const matchesPrefix = (base: string) =>
    pathname === base || pathname.startsWith(base + "/");

  if (ADMIN_ONLY_PREFIXES.some(matchesPrefix)) return { mode: "admin-only" };

  let best: { base: string; need: string | string[] } | null = null;
  for (const [base, need] of Object.entries(STAFF_NAV_PERMS)) {
    if (matchesPrefix(base) && (!best || base.length > best.base.length)) {
      best = { base, need };
    }
  }
  if (best) {
    return { mode: "perm", codes: Array.isArray(best.need) ? best.need : [best.need] };
  }
  return { mode: "allow" };
}

interface GenericNavItem {
  href?: string;
  items?: { href: string }[];
  divider?: boolean;
}

/** True if a staff member holding `can(code)` may see a nav item with this href. */
export function isStaffNavAllowed(can: (code: string) => boolean, href?: string): boolean {
  if (!href) return true;
  const need = STAFF_NAV_PERMS[href];
  if (!need) return true;
  return Array.isArray(need) ? need.some((c) => can(c)) : can(need);
}

/** Filters a staff nav list by granted permissions. Groups (items with
 * sub-links) are kept if at least one sub-link is allowed, with disallowed
 * sub-links dropped too — a staff member never sees a link that 403s on
 * click. Trailing dividers left empty by filtering are removed. */
export function filterStaffNavItems<T extends GenericNavItem>(items: T[], can: (code: string) => boolean): T[] {
  const filterOne = (item: T): T | null => {
    if (item.divider) return item;
    if (item.items?.length) {
      const visibleSubItems = item.items.filter((sub) => isStaffNavAllowed(can, sub.href));
      return visibleSubItems.length > 0 ? { ...item, items: visibleSubItems } : null;
    }
    return isStaffNavAllowed(can, item.href) ? item : null;
  };

  return items
    .map(filterOne)
    .filter((item): item is T => item !== null)
    .filter((item, i, arr) => !item.divider || i < arr.length - 1);
}
