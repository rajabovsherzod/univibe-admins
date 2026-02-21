import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import type { Faculty } from "@/lib/api/types";
import type { CreateFacultyInput, UpdateFacultyInput } from "@/lib/validations/faculty";

// ── Fetch faculties ──────────────────────────────────────────────────────────
async function fetchFaculties(token: string): Promise<Faculty[]> {
  try {
    const res = await axios.get<Faculty[]>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.faculties}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Fakultetlarni yuklashda xatolik");
  }
}

export function useFaculties() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["faculties"],
    queryFn: () => fetchFaculties(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });
}

// ── Retrieve Single faculty ──────────────────────────────────────────────────
async function fetchFacultyDetail(token: string, id: string): Promise<Faculty> {
  try {
    const res = await axios.get<Faculty>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.facultyDetail(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Fakultet ma'lumotini yuklashda xatolik");
  }
}

export function useFacultyDetail(id: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["faculty-detail", id],
    queryFn: () => fetchFacultyDetail(session?.accessToken as string, id),
    enabled: !!session?.accessToken && !!id,
  });
}

// ── Create faculty ───────────────────────────────────────────────────────────
async function createFaculty(
  token: string,
  input: CreateFacultyInput
): Promise<Faculty> {
  try {
    const res = await axios.post<Faculty>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.facultyCreate}`,
      input,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Fakultet yaratishda xatolik";
    throw new Error(message);
  }
}

export function useCreateFaculty() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFacultyInput) =>
      createFaculty(session?.accessToken as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}

// ── Update faculty ───────────────────────────────────────────────────────────
async function updateFaculty(
  token: string,
  id: string,
  input: UpdateFacultyInput
): Promise<Faculty> {
  try {
    const res = await axios.patch<Faculty>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.facultyUpdate(id)}`,
      input,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Fakultetni yangilashda xatolik";
    throw new Error(message);
  }
}

export function useUpdateFaculty() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFacultyInput }) =>
      updateFaculty(session?.accessToken as string, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}

// ── Delete faculty ───────────────────────────────────────────────────────────
async function deleteFaculty(token: string, id: string): Promise<void> {
  try {
    await axios.delete(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.facultyDelete(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Fakultetni o'chirishda xatolik qilib bo'lmadi";
    throw new Error(message);
  }
}

export function useDeleteFaculty() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFaculty(session?.accessToken as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}
