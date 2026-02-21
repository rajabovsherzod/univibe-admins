// hooks/api/use-staff.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import type { CreateStaffInput } from "@/lib/validations/staff";
import type { JobPosition } from "@/lib/api/types";

// ── Fetch job positions ──────────────────────────────────────────────────────
async function fetchJobPositions(token: string): Promise<JobPosition[]> {
  try {
    const res = await axios.get<JobPosition[]>(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.jobPositions}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Lavozimlarni yuklashda xatolik");
  }
}

export function useJobPositions() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["job-positions"],
    queryFn: () => fetchJobPositions(session?.accessToken as string),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

// ── Create staff mutation ────────────────────────────────────────────────────
async function createStaff(
  token: string,
  input: CreateStaffInput
): Promise<void> {
  const form = new FormData();
  form.append("name", input.name);
  form.append("surname", input.surname);
  form.append("email", input.email);
  form.append("job_position_public_id", input.job_position_public_id);
  if (input.password) form.append("password", input.password);
  if (input.profile_photo instanceof File) {
    form.append("profile_photo", input.profile_photo);
  }

  try {
    await axios.post(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.create}`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    const errData = error.response?.data || {};
    const messages = Object.values(errData).flat().join(" ") || "Xodim yaratishda xatolik";
    throw new Error(messages as string);
  }
}

export function useCreateStaff() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStaffInput) =>
      createStaff(session?.accessToken as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
    },
  });
}

// ── Delete staff ─────────────────────────────────────────────────────────────
async function deleteStaff(token: string, id: string): Promise<void> {
  try {
    await axios.delete(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.delete(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Xodimni o'chirishda xatolik";
    throw new Error(message as string);
  }
}

export function useDeleteStaff() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStaff(session?.accessToken as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
    },
  });
}
