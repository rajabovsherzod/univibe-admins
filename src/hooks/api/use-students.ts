import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import type { Student, PaginatedResponse } from "@/lib/api/types";

const ENDPOINTS = API_CONFIG.endpoints.students;

async function apiFetch(url: string, token: string, options?: { method?: string; body?: any }) {
  try {
    const res = await axios({
      url,
      method: options?.method || "GET",
      data: options?.body ? options.body : undefined,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const msg = Object.values(errData).flat().join(" ") || `API Xatosi: ${error.response?.status || error.message}`;
    throw new Error(msg as string);
  }
}

interface StudentsParams {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export function useStudents(params: StudentsParams = {}) {
  const { data: session } = useSession();

  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set("status", params.status);
  if (params.search) queryParams.set("search", params.search);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.page_size) queryParams.set("page_size", params.page_size.toString());

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery<PaginatedResponse<Student>>({
    queryKey: ["students", params],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.list}${queryString}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken,
  });
}

interface UpdateStatusVariables {
  id: string;
  status: "approved" | "rejected";
}

export function useUpdateStudentStatus() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateStatusVariables) => {
      const res = await axios.patch(
        `${API_CONFIG.baseURL}${ENDPOINTS.updateStatus(id)}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["waited-students-count"] });
    },
    onError: (error: any) => {
      const errData = error.response?.data || {};
      const msg =
        Object.values(errData).flat().join(" ") ||
        `Status yangilash xatosi: ${error.response?.status || error.message}`;
      throw new Error(msg as string);
    },
  });
}

async function fetchStudentDetail(token: string, userId: string): Promise<Student> {
  try {
    const res = await axios.get<Student>(
      `${API_CONFIG.baseURL}${ENDPOINTS.detail(userId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const msg = Object.values(errData).flat().join(" ") || `API Xatosi: ${error.response?.status || error.message}`;
    throw new Error(msg as string);
  }
}

export function useStudentDetail(userId: string) {
  const { data: session } = useSession();
  return useQuery<Student>({
    queryKey: ["student-detail", userId],
    queryFn: () => fetchStudentDetail(session?.accessToken as string, userId),
    enabled: !!session?.accessToken && !!userId,
  });
}

export function useWaitedStudentsCount(options?: { enabled?: boolean }) {
  const { data: session } = useSession();

  return useQuery<{ waited_students_count: number; university_public_id: string }>({
    queryKey: ["waited-students-count"],
    queryFn: async () => {
      const res = await axios.get(
        `${API_CONFIG.baseURL}${ENDPOINTS.waitedCount}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      return res.data;
    },
    enabled: !!session?.accessToken && (options?.enabled ?? true),
    refetchInterval: 30000,
  });
}

// ── Update student profile ────────────────────────────────────────────────
export interface UpdateStudentInput {
  user_public_id: string;
  name?: string;
  surname?: string;
  middle_name?: string;
  date_of_birth?: string;
  university_student_id?: string;
  faculty_id?: string;
  degree_level_id?: string;
  year_level_id?: string;
  profile_photo?: File | null;
  contact_phone_number?: string;
}

async function updateStudentProfile(
  token: string,
  input: UpdateStudentInput
): Promise<void> {
  const form = new FormData();
  if (input.name) form.append("name", input.name);
  if (input.surname) form.append("surname", input.surname);
  if (input.middle_name) form.append("middle_name", input.middle_name);
  if (input.date_of_birth) form.append("date_of_birth", input.date_of_birth);
  if (input.university_student_id) form.append("university_student_id", input.university_student_id);
  if (input.faculty_id) form.append("faculty_id", input.faculty_id);
  if (input.degree_level_id) form.append("degree_level_id", input.degree_level_id);
  if (input.year_level_id) form.append("year_level_id", input.year_level_id);
  if (input.profile_photo instanceof File) {
    form.append("profile_photo", input.profile_photo);
  }
  if (input.contact_phone_number) form.append("contact_phone_number", input.contact_phone_number);

  try {
    await axios.put(
      `${API_CONFIG.baseURL}${ENDPOINTS.updateProfile(input.user_public_id)}`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    const errData = error.response?.data || {};
    const messages = Object.values(errData).flat().join(" ") || "Profilni yangilashda xatolik";
    throw new Error(messages as string);
  }
}

export function useUpdateStudentProfile() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStudentInput) =>
      updateStudentProfile(session?.accessToken as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student-detail"] });
    },
  });
}

// ── Delete student ───────────────────────────────────────────────────────
async function deleteStudent(token: string, id: string): Promise<void> {
  try {
    await axios.delete(
      `${API_CONFIG.baseURL}${ENDPOINTS.delete(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    const errData = error.response?.data || {};
    const message = Object.values(errData).flat().join(" ") || "Talabani o'chirishda xatolik";
    throw new Error(message as string);
  }
}

export function useDeleteStudent() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStudent(session?.accessToken as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
