import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/providers/app-provider";
import { Theme } from "@/providers/theme";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";
import { Toaster } from "sonner";
import { NProgressProvider } from "@/providers/nprogress-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";
const APP_NAME = "Univibe Admin";
const APP_DESCRIPTION =
  "Univibe — universitetlar uchun zamonaviy boshqaruv tizimi. Xodimlar, talabalar, coins va statistikani bitta platformada boshqaring.";

export const metadata: Metadata = {
  // ── Title template ──────────────────────────────────────────────────────
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,

  // ── Application info ────────────────────────────────────────────────────
  applicationName: APP_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Univibe", url: "https://univibe.uz" }],
  creator: "Univibe",
  publisher: "Univibe",
  keywords: [
    "univibe",
    "admin panel",
    "university management",
    "boshqaruv tizimi",
    "universitet",
  ],

  // ── Robots — admin panel must not be indexed ────────────────────────────
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },

  // ── Canonical & alternates ──────────────────────────────────────────────
  alternates: {
    canonical: APP_URL,
    languages: { "uz-UZ": `${APP_URL}/uz` },
  },

  // ── OpenGraph defaults ──────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — Boshqaruv Tizimi`,
        type: "image/png",
      },
    ],
  },

  // ── Twitter Card ────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@univibe_uz",
    creator: "@univibe_uz",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
  },

  // ── PWA / Icons ─────────────────────────────────────────────────────────
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/icon.svg",
  },

  // ── Other ────────────────────────────────────────────────────────────────
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7f56d9" },
    { media: "(prefers-color-scheme: dark)", color: "#6941c6" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for API */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL ?? "https://api.univibe.uz"} />
      </head>
      <body className={cx(inter.variable, "bg-primary antialiased")}>
        <AppProvider>
          <NProgressProvider options={{ color: "#006ab0" }} />
          <Theme>
            <Toaster position="top-right" richColors closeButton />
            <div id="app-shell" className="min-h-dvh">
              {children}
            </div>
          </Theme>
        </AppProvider>
      </body>
    </html>
  );
}
