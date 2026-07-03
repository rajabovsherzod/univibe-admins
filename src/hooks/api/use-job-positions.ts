// hooks/api/use-job-positions.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import { apiFetch } from "@/lib/api/query-fetch";
import type { JobPosition } from "@/lib/api/types";

const ENDPOINTS = API_CONFIG.endpoints.staff;

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
    mutationFn: ({ name }: { name: string }) =>
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
    mutationFn: ({ id, ...data }: { id: string; name?: string }) =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.jobPositionUpdate(id)}`,
        session?.accessToken as string,
        { method: "PATCH", body: JSON.stringify(data) }
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
