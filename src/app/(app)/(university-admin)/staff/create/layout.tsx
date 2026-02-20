// app/(app)/(university-admin)/staff/create/layout.tsx
import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";

export const metadata: Metadata = {
  title: "Yangi xodim qo'shish",
  description:
    "Yangi xodim ma'lumotlarini kiriting: ism, familiya, email, lavozim va profil rasmi.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: `${APP_URL}/staff/create` },
  openGraph: {
    title: "Yangi xodim qo'shish | Univibe Admin",
    description:
      "Yangi xodim ma'lumotlarini kiriting: ism, familiya, email, lavozim va profil rasmi.",
    url: `${APP_URL}/staff/create`,
    locale: "uz_UZ",
    type: "website",
    siteName: "Univibe Admin",
  },
};

export default function StaffCreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
