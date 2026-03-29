import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { API_CONFIG } from "@/lib/api/config";
import type { BannersResponse } from "@/types/banners";

/**
 * useBanners - Admin/Staff dashboard uchun banner hook
 * GET /api/v1/banners/dashboard/
 */
export function useBanners(page = 1, pageSize = 10) {
  return useQuery<BannersResponse>({
    queryKey: ['banners-dashboard', page, pageSize],
    queryFn: async () => {
      const response = await api.get<BannersResponse>(
        `${API_CONFIG.endpoints.banners.dashboard}?page=${page}&page_size=${pageSize}`
      );
      return response;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
