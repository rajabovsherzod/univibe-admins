// hooks/api/use-job-positions.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import type { JobPosition } from "@/lib/api/types";

const ENDPOINTS = API_CONFIG.endpoints.staff;

async function apiFetch(url: string, token: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg =
      Object.values(err).flat().join(" ") || `Xatolik: ${res.status}`;
    throw new Error(msg as string);
  }
  return res.status === 204 ? null : res.json();
}

// ── LIST ──────────────────────────────────────────────────────────────────
export function useJobPositions() {
  const { data: session } = useSession();
  return useQuery<JobPosition[]>({
    queryKey: ["job-positions"],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.jobPositions}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

// ── CREATE ────────────────────────────────────────────────────────────────
export function useCreateJobPosition() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.jobPositionCreate}`,
        session?.accessToken as string,
        { method: "POST", body: JSON.stringify({ name }) }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-positions"] }),
  });
}

// ── UPDATE ────────────────────────────────────────────────────────────────
export function useUpdateJobPosition() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.jobPositionUpdate(id)}`,
        session?.accessToken as string,
        { method: "PATCH", body: JSON.stringify({ name }) }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-positions"] }),
  });
}

// ── DELETE ────────────────────────────────────────────────────────────────
export function useDeleteJobPosition() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.jobPositionDelete(id)}`,
        session?.accessToken as string,
        { method: "DELETE" }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-positions"] }),
  });
}
