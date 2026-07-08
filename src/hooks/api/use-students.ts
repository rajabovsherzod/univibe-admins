import { useQuery, useInfiniteQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import { apiFetch } from "@/lib/api/query-fetch";
import type { Student, PaginatedResponse } from "@/lib/api/types";

const ENDPOINTS = API_CONFIG.endpoints.students;

interface StudentsParams {
  status?: string;
  search?: string;
  faculty_id?: string;
  year_level_id?: string;
  gender?: string;
  page?: number;
  page_size?: number;
}

export function useStudents(params: StudentsParams = {}) {
  const { data: session } = useSession();

  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set("status", params.status);
  if (params.search) queryParams.set("search", params.search);
  if (params.faculty_id) queryParams.set("faculty_id", params.faculty_id);
  if (params.year_level_id) queryParams.set("year_level_id", params.year_level_id);
  if (params.gender) queryParams.set("gender", params.gender);
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
    placeholderData: keepPreviousData,
  });
}

export function useInfiniteStudents(params: StudentsParams = {}) {
  const { data: session } = useSession();

  return useInfiniteQuery<PaginatedResponse<Student>>({
    queryKey: ["infinite-students", params],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.set("status", params.status);
      if (params.search) queryParams.set("search", params.search);
      if (params.faculty_id) queryParams.set("faculty_id", params.faculty_id);
      if (params.year_level_id) queryParams.set("year_level_id", params.year_level_id);
      if (params.gender) queryParams.set("gender", params.gender);
      if (params.page_size) queryParams.set("page_size", params.page_size.toString());
      queryParams.set("page", (pageParam as number).toString());

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      
      return apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.list}${queryString}`,
        session?.accessToken as string
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      // Assuming lastPage.pagination exists if there's more, or lastPage.next is a URL
      if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.total_pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!session?.accessToken,
    initialPageParam: 1,
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
    enabled: !!session?.accessToken && (options?.enabled ?? false),
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


// ── Archive / unarchive (graduated, academic leave, dropped out …) ─────────

export function useArchiveStudent() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason, note }: { id: string; reason: string; note?: string }) => {
      const res = await axios.post(
        `${API_CONFIG.baseURL}${ENDPOINTS.archive(id)}`,
        { reason, note },
        { headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: any) => {
      const errData = error.response?.data || {};
      const msg = Object.values(errData).flat().join(" ") || `Arxivlash xatosi: ${error.response?.status || error.message}`;
      throw new Error(msg as string);
    },
  });
}

export function useUnarchiveStudent() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post(
        `${API_CONFIG.baseURL}${ENDPOINTS.unarchive(id)}`,
        {},
        { headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: any) => {
      const errData = error.response?.data || {};
      const msg = Object.values(errData).flat().join(" ") || `Tiklash xatosi: ${error.response?.status || error.message}`;
      throw new Error(msg as string);
    },
  });
}
