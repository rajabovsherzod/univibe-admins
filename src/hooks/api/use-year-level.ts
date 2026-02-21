import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import type { YearLevel } from "@/lib/api/types";
import type { CreateYearLevelInput, UpdateYearLevelInput } from "@/lib/validations/year-level";

// ── Fetch year levels ────────────────────────────────────────────────────────
async function fetchYearLevels(token: string): Promise<YearLevel[]> {
  try {
    const res = await axios.get<YearLevel[]>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.yearLevels}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Kurslarni yuklashda xatolik");
  }
}

export function useYearLevels() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["year-levels"],
    queryFn: () => fetchYearLevels(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });
}

// ── Retrieve Single year level ───────────────────────────────────────────────
async function fetchYearLevelDetail(token: string, id: string): Promise<YearLevel> {
  try {
    const res = await axios.get<YearLevel>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.yearLevelDetail(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Kurs ma'lumotini yuklashda xatolik");
  }
}

export function useYearLevelDetail(id: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["year-level-detail", id],
    queryFn: () => fetchYearLevelDetail(session?.accessToken as string, id),
    enabled: !!session?.accessToken && !!id,
  });
}

// ── Create year level ────────────────────────────────────────────────────────
async function createYearLevel(
  token: string,
  input: CreateYearLevelInput
): Promise<YearLevel> {
  try {
    const res = await axios.post<YearLevel>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.yearLevelCreate}`,
      input,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Kurs yaratishda xatolik";
    throw new Error(message);
  }
}

export function useCreateYearLevel() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateYearLevelInput) =>
      createYearLevel(session?.accessToken as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["year-levels"] });
    },
  });
}

// ── Update year level ────────────────────────────────────────────────────────
async function updateYearLevel(
  token: string,
  id: string,
  input: UpdateYearLevelInput
): Promise<YearLevel> {
  try {
    const res = await axios.patch<YearLevel>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.yearLevelUpdate(id)}`,
      input,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Kursni yangilashda xatolik";
    throw new Error(message);
  }
}

export function useUpdateYearLevel() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateYearLevelInput }) =>
      updateYearLevel(session?.accessToken as string, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["year-levels"] });
    },
  });
}

// ── Delete year level ────────────────────────────────────────────────────────
async function deleteYearLevel(token: string, id: string): Promise<void> {
  try {
    await axios.delete(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.yearLevelDelete(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Kursni o'chirishda xatolik qilib bo'lmadi";
    throw new Error(message);
  }
}

export function useDeleteYearLevel() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteYearLevel(session?.accessToken as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["year-levels"] });
    },
  });
}
