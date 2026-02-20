import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UniversityAdminDashboard } from "../../_components/dashboard/university-admin-dashboard";
import { UniversityStaffDashboard } from "../../_components/dashboard/university-staff-dashboard";
import { redirect } from "next/navigation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Univibe boshqaruv paneli — tizim statistikasi va faoliyatini kuzating.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: `${APP_URL}/dashboard` },
  openGraph: {
    title: "Dashboard | Univibe Admin",
    description: "Univibe boshqaruv paneli — tizim statistikasi va faoliyatini kuzating.",
    url: `${APP_URL}/dashboard`,
    locale: "uz_UZ",
    type: "website",
    siteName: "Univibe Admin",
  },
};


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "university_admin") {
    return <UniversityAdminDashboard />;
  }

  if (role === "staff") {
    return <UniversityStaffDashboard />;
  }

  return (
    <div className="p-4">
      Ruxsat etilmagan rol: {role}
    </div>
  );
}
