import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { API_CONFIG } from "@/lib/api/config";
import StudentEditClient from "./student-edit-client";

// Fetch student detail
async function fetchStudentDetail(token: string, userId: string) {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.students.detail(userId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  
  if (!res.ok) {
    throw new Error(`Talaba ma'lumotlarini yuklashda xatolik: ${res.status}`);
  }
  
  return res.json();
}

// Fetch faculties
async function fetchFaculties(token: string, universityId: string) {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.faculties}?university_id=${universityId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  
  if (!res.ok) {
    throw new Error("Fakultetlarni yuklashda xatolik");
  }
  
  return res.json();
}

// Fetch degree levels
async function fetchDegreeLevels(token: string, universityId: string) {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.degreeLevels}?university_id=${universityId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  
  if (!res.ok) {
    throw new Error("Ta'lim darajalarini yuklashda xatolik");
  }
  
  return res.json();
}

// Fetch year levels
async function fetchYearLevels(token: string, universityId: string) {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.university.yearLevels}?university_id=${universityId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  
  if (!res.ok) {
    throw new Error("Kurslarni yuklashda xatolik");
  }
  
  return res.json();
}

export default async function StudentEditPage({ params }: { params: Promise<{ user_public_id: string }> }) {
  const { user_public_id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    redirect("/login");
  }

  try {
    // Fetch all data in parallel
    const [student, faculties, degreeLevels, yearLevels] = await Promise.all([
      fetchStudentDetail(session.accessToken, user_public_id),
      fetchFaculties(session.accessToken, session.user.university_id),
      fetchDegreeLevels(session.accessToken, session.user.university_id),
      fetchYearLevels(session.accessToken, session.user.university_id),
    ]);

    return (
      <StudentEditClient
        studentData={student}
        faculties={faculties}
        degreeLevels={degreeLevels}
        yearLevels={yearLevels}
      />
    );
  } catch (error: unknown) {
    console.error('Error loading edit page:', error instanceof Error ? error.message : error);
    redirect(`/students/${user_public_id}`);
  }
}
