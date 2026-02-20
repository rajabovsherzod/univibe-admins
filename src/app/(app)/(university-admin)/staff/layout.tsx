// app/(app)/(university-admin)/staff/layout.tsx
import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";

export const metadata: Metadata = {
  title: "Xodimlar",
  description:
    "Univibe — universitet xodimlari ro'yxatini boshqarish. Xodimlarni qo'shish, tahrirlash va o'chirish.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: `${APP_URL}/staff` },
  openGraph: {
    title: "Xodimlar | Univibe Admin",
    description:
      "Univibe — universitet xodimlari ro'yxatini boshqarish.",
    url: `${APP_URL}/staff`,
    locale: "uz_UZ",
    type: "website",
    siteName: "Univibe Admin",
  },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
