// hooks/api/use-staff.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import type { CreateStaffInput } from "@/lib/validations/staff";
import type { JobPosition } from "@/lib/api/types";

// ── Fetch job positions ──────────────────────────────────────────────────────
async function fetchJobPositions(token: string): Promise<JobPosition[]> {
  const res = await fetch(
    `${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.jobPositions}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Lavozimlarni yuklashda xatolik");
  return res.json();
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

  const res = await fetch(
    `${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.create}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const messages = Object.values(err).flat().join(" ") || "Xodim yaratishda xatolik";
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
