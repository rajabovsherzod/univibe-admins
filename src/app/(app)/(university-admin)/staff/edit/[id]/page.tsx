import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { API_CONFIG } from "@/lib/api/config";
import StaffEditPageClient from "./staff-edit-client";

// Fetch staff list
async function fetchStaffList(token: string) {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.list}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Xodim ma'lumotlarini yuklashda xatolik: ${res.status}`);
  }
  return res.json();
}

// Fetch job positions
async function fetchJobPositions(token: string) {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.jobPositions}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Lavozimlarni yuklashda xatolik");
  return res.json();
}

export default async function StaffEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Unwrap params
  const session = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    redirect("/login");
  }

  try {
    // Fetch both staff data and job positions in parallel
    const [staffData, jobPositions] = await Promise.all([
      fetchStaffList(session.accessToken),
      fetchJobPositions(session.accessToken),
    ]);

    // Find the specific staff member
    const staff = staffData.find((s: any) => s.user_public_id === id);
    
    if (!staff) {
      redirect("/staff");
    }

    // Split full_name into name and surname
    const nameParts = staff.full_name?.trim().split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || ''; // Handle multiple words in surname

    return (
      <StaffEditPageClient
        staffData={{
          user_public_id: staff.user_public_id,
          name: firstName,
          surname: lastName,
          email: staff.email,
          job_position_public_id: staff.job_position_public_id || "",
          profile_photo_url: staff.profile_photo_url,
          full_name: staff.full_name,
        }}
        jobPositions={jobPositions}
      />
    );
  } catch (error: unknown) {
    throw error;
  }
}
