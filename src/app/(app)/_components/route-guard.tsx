"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { resolveRoutePolicy } from "./sidebar/nav-permissions";

/** Client-side, session-driven access gate for the whole app content area.
 *
 * It reads the LIVE permission set (see usePermissions — refetched on mount /
 * focus / interval), so it reacts the moment access changes:
 *   • Permission granted  → the page's controls appear (handled per-component);
 *     nothing to do here, the guard already allows the route.
 *   • Permission revoked / whole feature turned off → as soon as the live sync
 *     notices, the guard smoothly redirects the staff to /dashboard instead of
 *     dropping a 403 wall under their feet. The sidebar drops the item in the
 *     same tick (it reads the same live set).
 *
 * Admins pass through everything. We only ever redirect a CONFIRMED staff who
 * lacks the current route's permission, and never while the session is still
 * loading — so a transient state can never bounce someone by mistake. */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, role, canAny, isLoading, permissionsSynced } = usePermissions();

  const allowed = useMemo(() => {
    if (isAdmin || role !== "staff") return true;

    const policy = resolveRoutePolicy(pathname);
    if (policy.mode === "allow") return true;
    if (policy.mode === "admin-only") return false;
    return canAny(...policy.codes);
  }, [isAdmin, role, canAny, pathname]);

  // Only redirect once the live permission set is server-confirmed, so a
  // just-granted permission that isn't in the stale session seed yet can't
  // wrongly bounce the staff before the sync lands.
  const shouldRedirect = !isLoading && permissionsSynced && !allowed;

  useEffect(() => {
    if (shouldRedirect) {
      // Smooth exit — no 403 flash, straight to a page they can always see.
      router.replace("/dashboard");
    }
  }, [shouldRedirect, router]);

  // Render nothing only while actually redirecting (confirmed denial). Until
  // the sync confirms, we keep rendering — a page they legitimately hold access
  // to never blanks, and a just-revoked one is pulled the instant sync lands.
  if (shouldRedirect) return null;

  return <>{children}</>;
}
