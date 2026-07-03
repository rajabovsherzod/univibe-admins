import { requireSession } from "@/lib/auth";
import { API_CONFIG } from "@/lib/api/config";
import { ssrFetch } from "@/lib/api/ssr-fetch";
import { constructMetadata } from "@/lib/utils/seo";
import BannerEditClient from "./banner-edit-client";
import type { BannerManagement } from "@/types/admins/banners";

export const metadata = constructMetadata({
  title: "Banner tahrirlash",
  description: "Banner ma'lumotlarini o'zgartiring.",
});

/** SSR: Fetch banner detail by publicId. On any failure it returns null (not a
 * throw) — the client component then fetches on its own, so a transient blip
 * here never crashes the page. ssrFetch already retries transient statuses. */
async function fetchBannerDetail(
  publicId: string,
  token: string
): Promise<BannerManagement | null> {
  try {
    const res = await ssrFetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.banners.manage.detail(publicId)}`,
      token
    );
    if (!res.ok) return null;
    return (await res.json()) as BannerManagement;
  } catch {
    // Network error — return null, client will handle fetching.
    return null;
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();

  // SSR attempt — if fails, pass null and let client fetch
  const banner = await fetchBannerDetail(id, session.accessToken);

  return <BannerEditClient publicId={id} initialBanner={banner} />;
}
