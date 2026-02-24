import { Suspense } from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UniversityAdminDashboard } from "../../_components/dashboard/university-admin-dashboard";
import { UniversityStaffDashboard } from "../../_components/dashboard/university-staff-dashboard";
import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/utils/seo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";

export const metadata = constructMetadata({
  title: "Dashboard",
  description: "Universitet boshqaruv tizimi statistikasi va asosiy ko'rsatkichlari.",
  noIndex: true, // Keep it private
});


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "university_admin") {
    return (
      <Suspense fallback={<div className="p-4">Yuklanmoqda...</div>}>
        <UniversityAdminDashboard />
      </Suspense>
    );
  }

  if (role === "staff") {
    return (
      <Suspense fallback={<div className="p-4">Yuklanmoqda...</div>}>
        <UniversityStaffDashboard />
      </Suspense>
    );
  }

  return (
    <div className="p-4">
      Ruxsat etilmagan rol: {role}
    </div>
  );
}
