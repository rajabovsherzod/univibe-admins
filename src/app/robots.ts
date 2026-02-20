import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // ── Public bots: only allow login page ─────────────────────────
        userAgent: "*",
        allow: ["/login"],
        disallow: [
          "/",
          "/dashboard",
          "/staff",
          "/job-positions",
          "/coins-system",
          "/statistics",
          "/system",
          "/settings",
          "/api/",
        ],
        crawlDelay: 10,
      },
      {
        // ── Aggressive SEO bots: fully blocked ─────────────────────────
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
          "BLEXBot",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
