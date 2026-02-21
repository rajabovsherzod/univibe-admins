// hooks/api/use-job-positions.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import type { JobPosition } from "@/lib/api/types";

const ENDPOINTS = API_CONFIG.endpoints.staff;

async function apiFetch(url: string, token: string, options?: { method?: string; body?: string }) {
  try {
    const res = await axios({
      url,
      method: options?.method || "GET",
      data: options?.body ? JSON.parse(options.body) : undefined,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const msg = Object.values(errData).flat().join(" ") || `Xatolik: ${error.response?.status || error.message}`;
    throw new Error(msg as string);
  }
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
