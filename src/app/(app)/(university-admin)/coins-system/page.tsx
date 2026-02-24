import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { constructMetadata } from "@/lib/utils/seo";

import { AdminCoinsClient } from "./_components/admin-coins-client";
import { StaffCoinsClient } from "./_components/staff-coins-client";

export const metadata = constructMetadata({
  title: "Ballar tizimi",
  description: "Talabalar uchun ballarni va qoidalarni boshqarish.",
});

export default async function CoinsSystemPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || "staff";

  if (role === "staff") {
    return <StaffCoinsClient />;
  }

  return <AdminCoinsClient />;
}