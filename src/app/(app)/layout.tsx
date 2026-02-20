// app/(app)/layout.tsx — Server component (metadata + shell)
import type { Metadata } from "next";
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
