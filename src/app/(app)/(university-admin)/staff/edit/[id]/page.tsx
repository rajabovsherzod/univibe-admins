import { requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { API_CONFIG } from "@/lib/api/config";
import { ssrFetch } from "@/lib/api/ssr-fetch";
import StaffEditPageClient from "./staff-edit-client";

// Fetch ONE staff member's full profile directly by id (dedicated detail
// endpoint) — no more fetching the whole list and filtering. Resilient to
// transient dev-server hiccups via ssrFetch (retries 404/5xx). A genuine 404
// (staff really gone) sends the admin back to the list rather than erroring.
async function fetchStaffDetail(token: string, id: string) {
  const res = await ssrFetch(
    `${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.updateProfile(id)}`,
    token
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Xodim ma'lumotlarini yuklashda xatolik: ${res.status}`);
  }
  return res.json();
}

// Fetch job positions — same resilience.
async function fetchJobPositions(token: string) {
  const res = await ssrFetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.jobPositions}`, token);
  if (!res.ok) throw new Error(`Lavozimlarni yuklashda xatolik: ${res.status}`);
  return res.json();
}

export default async function StaffEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Unwrap params
  const session = await requireSession();

  // Fetch the specific staff member and job positions in parallel.
  const [staff, jobPositions] = await Promise.all([
    fetchStaffDetail(session.accessToken, id),
    fetchJobPositions(session.accessToken),
  ]);

  if (!staff) {
    redirect("/staff");
  }

  return (
    <StaffEditPageClient
      staffData={{
        user_public_id: staff.user_public_id ?? id,
        name: staff.name ?? "",
        surname: staff.surname ?? "",
        email: staff.email,
        job_position_public_id: staff.job_position_public_id || "",
        profile_photo_url: staff.profile_photo_url,
        full_name: staff.full_name,
        permissions: staff.permissions || [],
      }}
      jobPositions={jobPositions}
    />
  );
}
