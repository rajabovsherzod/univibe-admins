// app/(app)/(university-admin)/job-positions/layout.tsx
import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";

export const metadata: Metadata = {
  title: "Lavozimlar",
  description:
    "Univibe — universitet xodimlari lavozimlarini boshqarish. Lavozimlarni yaratish, o'zgartirish va o'chirish.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: `${APP_URL}/job-positions` },
  openGraph: {
    title: "Lavozimlar | Univibe Admin",
    description:
      "Univibe — universitet xodimlari lavozimlarini boshqarish.",
    url: `${APP_URL}/job-positions`,
    locale: "uz_UZ",
    type: "website",
    siteName: "Univibe Admin",
  },
};

export default function JobPositionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
