// app/(app)/layout.tsx — Server component (metadata + shell)
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppLayoutClient } from "./_components/app-layout-client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: "Univibe Admin",
  },
  alternates: {
    canonical: `${APP_URL}/dashboard`,
  },
};

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role || "staff";

  return <AppLayoutClient role={role}>{children}</AppLayoutClient>;
}
