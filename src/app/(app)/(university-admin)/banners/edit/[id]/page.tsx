import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { API_CONFIG } from "@/lib/api/config";
import { constructMetadata } from "@/lib/utils/seo";
import BannerEditClient from "./banner-edit-client";
import type { BannerManagement } from "@/types/admins/banners";

export const metadata = constructMetadata({
  title: "Banner tahrirlash",
  description: "Banner ma'lumotlarini o'zgartiring.",
});

/** SSR: Fetch banner detail by publicId */
async function fetchBannerDetail(
  publicId: string,
  token: string
): Promise<BannerManagement | null> {
  try {
    const res = await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.banners.manage.detail(publicId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    console.log(`[SSR] Fetching Banner ${publicId} - Status:`, res.status);
    
    // Log the raw text for debugging
    const rawText = await res.text();
    console.log(`[SSR] Raw Response for ${publicId}:`, rawText.substring(0, 300));

    if (!res.ok) {
      if (res.status === 404) {
        console.warn(`[SSR] Banner ${publicId} not found (404)`);
        return null;
      }
      console.error(`[SSR] Backend Error (${res.status}):`, rawText);
      return null;
    }

    return JSON.parse(rawText);
  } catch (error) {
    // Network error — return null, client will handle fetching
    console.error(`[SSR] Network/Fetch Error for ${publicId}:`, error);
    return null;
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    redirect("/login");
  }

  // SSR attempt — if fails, pass null and let client fetch
  const banner = await fetchBannerDetail(id, session.accessToken);

  return <BannerEditClient publicId={id} initialBanner={banner} />;
}
