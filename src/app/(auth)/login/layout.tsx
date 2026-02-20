// app/(auth)/login/layout.tsx — thin server wrapper for login page metadata
import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";
const TITLE = "Kirish";
const DESCRIPTION =
  "Univibe Admin paneliga kirish. Universitetingizni boshqarish uchun tizimga kiring.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  alternates: {
    canonical: `${APP_URL}/login`,
  },
  openGraph: {
    title: `${TITLE} | Univibe Admin`,
    description: DESCRIPTION,
    url: `${APP_URL}/login`,
    siteName: "Univibe Admin",
    locale: "uz_UZ",
    type: "website",
    images: [
      {
        url: `${APP_URL}/og-login.png`,
        width: 1200,
        height: 630,
        alt: "Univibe Admin — Kirish",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@univibe_uz",
    title: `${TITLE} | Univibe Admin`,
    description: DESCRIPTION,
    images: [`${APP_URL}/og-login.png`],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
