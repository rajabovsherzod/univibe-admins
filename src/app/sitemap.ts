import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.univibe.uz";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // Only the login page is publicly crawlable
      url: `${APP_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];
}
