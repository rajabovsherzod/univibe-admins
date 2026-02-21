import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import type { DegreeLevel } from "@/lib/api/types";
import type { CreateDegreeLevelInput, UpdateDegreeLevelInput } from "@/lib/validations/degree-level";

// ── Fetch degree levels ──────────────────────────────────────────────────────
async function fetchDegreeLevels(token: string): Promise<DegreeLevel[]> {
  try {
    const res = await axios.get<DegreeLevel[]>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.degreeLevels}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Darajalarni yuklashda xatolik");
  }
}

export function useDegreeLevels() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["degree-levels"],
    queryFn: () => fetchDegreeLevels(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });
}

// ── Retrieve Single degree level ─────────────────────────────────────────────
async function fetchDegreeLevelDetail(token: string, id: string): Promise<DegreeLevel> {
  try {
    const res = await axios.get<DegreeLevel>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.degreeLevelDetail(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Daraja ma'lumotini yuklashda xatolik");
  }
}

export function useDegreeLevelDetail(id: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["degree-level-detail", id],
    queryFn: () => fetchDegreeLevelDetail(session?.accessToken as string, id),
    enabled: !!session?.accessToken && !!id,
  });
}

// ── Create degree level ──────────────────────────────────────────────────────
async function createDegreeLevel(
  token: string,
  input: CreateDegreeLevelInput
): Promise<DegreeLevel> {
  try {
    const res = await axios.post<DegreeLevel>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.degreeLevelCreate}`,
      input,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Daraja yaratishda xatolik";
    throw new Error(message);
  }
}

export function useCreateDegreeLevel() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDegreeLevelInput) =>
      createDegreeLevel(session?.accessToken as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degree-levels"] });
    },
  });
}

// ── Update degree level ──────────────────────────────────────────────────────
async function updateDegreeLevel(
  token: string,
  id: string,
  input: UpdateDegreeLevelInput
): Promise<DegreeLevel> {
  try {
    const res = await axios.patch<DegreeLevel>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.degreeLevelUpdate(id)}`,
      input,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Darajani yangilashda xatolik";
    throw new Error(message);
  }
}

export function useUpdateDegreeLevel() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDegreeLevelInput }) =>
      updateDegreeLevel(session?.accessToken as string, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degree-levels"] });
    },
  });
}

// ── Delete degree level ──────────────────────────────────────────────────────
async function deleteDegreeLevel(token: string, id: string): Promise<void> {
  try {
    await axios.delete(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.degreeLevelDelete(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Darajani o'chirishda xatolik qilib bo'lmadi";
    throw new Error(message);
  }
}

export function useDeleteDegreeLevel() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDegreeLevel(session?.accessToken as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degree-levels"] });
    },
  });
}
