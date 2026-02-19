import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UniversityAdminDashboard } from "../../_components/dashboard/university-admin-dashboard";
import { UniversityStaffDashboard } from "../../_components/dashboard/university-staff-dashboard";
import { redirect } from "next/navigation";

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
