// hooks/use-permissions.ts
"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { API_CONFIG } from "@/lib/api/config";

/** Live-fetch the current staff member's granted permission codes. */
async function fetchMyPermissions(token: string): Promise<string[]> {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.me}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`permission sync failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.permissions) ? (data.permissions as string[]) : [];
}

/**
 * Central client-side permission check with LIVE sync.
 *
 * University admins always pass. Staff are checked against a granted set that
 * is kept fresh in near-real-time:
 *   • seeded instantly from the session (no first-paint flicker),
 *   • refetched from `/me/` on every mount (so a plain refresh is always
 *     current), on window focus (switch back to the tab → instant), and on a
 *     short interval while the tab is active.
 *
 * The upshot: the moment an admin grants or revokes a permission, the staff's
 * UI adds/removes the matching controls on the next refresh, tab focus, or
 * within the poll window — no re-login, no stale buttons. React Query dedupes
 * the `["my-permissions"]` query, so every `usePermissions()` caller shares a
 * single background poll.
 */
export function usePermissions() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === "university_admin";
  const token = session?.accessToken;
  const sessionPerms = session?.user?.permissions;

  const isStaff = role === "staff";

  const { data: livePerms, isFetched } = useQuery({
    queryKey: ["my-permissions"],
    queryFn: () => fetchMyPermissions(token as string),
    enabled: isStaff && !!token,
    // Seed from the session so the very first render is already correct.
    initialData: isStaff ? (sessionPerms ?? []) : undefined,
    // Always re-check on mount (covers hard refresh) and on tab focus.
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Keep it fresh while the staff is actively working.
    refetchInterval: 15_000,
    staleTime: 0,
    // A transient sync failure shouldn't spam — the next interval retries.
    retry: false,
  });

  const granted = useMemo(
    () => new Set(isStaff ? (livePerms ?? sessionPerms ?? []) : []),
    [isStaff, livePerms, sessionPerms],
  );

  // True once the granted set is server-confirmed (not just the session seed).
  // Non-staff need no sync. Guards use this so they only ACT on a confirmed
  // denial — never bounce someone on a momentarily-stale seed.
  const permissionsSynced = !isStaff || isFetched;

  return useMemo(() => {
    const can = (code: string): boolean => {
      if (isAdmin) return true;
      if (!isStaff) return false;
      return granted.has(code);
    };
    const canAny = (...codes: string[]): boolean => codes.some((c) => can(c));
    const canAll = (...codes: string[]): boolean => codes.every((c) => can(c));

    return {
      isAdmin,
      role,
      isLoading: status === "loading",
      permissionsSynced,
      can,
      canAny,
      canAll,
    };
  }, [isAdmin, isStaff, role, granted, status, permissionsSynced]);
}
