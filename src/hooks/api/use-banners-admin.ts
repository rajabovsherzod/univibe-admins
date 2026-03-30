import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { API_CONFIG } from "@/lib/api/config";
import type {
  BannerManagement,
  CreateBannerInput,
  UpdateBannerInput,
  BannersListResponse,
} from "@/types/admins/banners";

/**
 * useBannerDetail - Get single banner details (management)
 * GET /api/v1/banners/manage/{publicId}/
 */
export function useBannerDetail(publicId: string) {
  return useQuery<BannerManagement>({
    queryKey: ['banner-detail', publicId],
    queryFn: async () => {
      const response = await api.get<BannerManagement>(
        API_CONFIG.endpoints.banners.manage.detail(publicId)
      );
      return response;
    },
    enabled: !!publicId,
  });
}

/**
 * useBannersList - Get all banners for management (university_admin only)
 * Uses /api/v1/banners/manage/ endpoint
 */
export function useBannersList(page = 1, pageSize = 20) {
  return useQuery<BannersListResponse>({
    queryKey: ['banners-management', page, pageSize],
    queryFn: async () => {
      const response = await api.get<BannersListResponse>(
        `${API_CONFIG.endpoints.banners.manage.list}?page=${page}&page_size=${pageSize}`
      );
      return response;
    },
  });
}

/**
 * useCreateBanner - Create new university banner
 * POST /api/v1/banners/manage/create/
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBannerInput) => {
      const formData = new FormData();
      
      // Append text fields
      formData.append('title', data.title);
      if (data.subtitle) formData.append('subtitle', data.subtitle);
      if (data.cta_text) formData.append('cta_text', data.cta_text);
      if (data.cta_link) formData.append('cta_link', data.cta_link);
      // scope is forced to UNIVERSITY by server
      if (data.status) formData.append('status', data.status);
      if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
      if (data.display_order !== undefined) formData.append('display_order', data.display_order.toString());
      if (data.start_at) formData.append('start_at', data.start_at);
      if (data.end_at) formData.append('end_at', data.end_at);
      
      // Append image files
      formData.append('image', data.image);
      if (data.mobile_image) formData.append('mobile_image', data.mobile_image);
      
      const response = await api.post<BannerManagement>(
        API_CONFIG.endpoints.banners.manage.create,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-management'] });
      queryClient.invalidateQueries({ queryKey: ['banners-dashboard'] });
    },
  });
}

/**
 * useUpdateBanner - Update existing university banner
 * PATCH /api/v1/banners/manage/{publicId}/
 */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ publicId, data }: { publicId: string; data: UpdateBannerInput }) => {
      const formData = new FormData();
      
      // Append only provided fields
      if (data.title) formData.append('title', data.title);
      if (data.subtitle) formData.append('subtitle', data.subtitle);
      if (data.image) formData.append('image', data.image);
      if (data.mobile_image !== undefined) {
        if (data.mobile_image) {
          formData.append('mobile_image', data.mobile_image);
        } else {
          formData.append('mobile_image', ''); // Clear mobile image
        }
      }
      if (data.cta_text) formData.append('cta_text', data.cta_text);
      if (data.cta_link) formData.append('cta_link', data.cta_link);
      if (data.status) formData.append('status', data.status);
      if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
      if (data.display_order !== undefined) formData.append('display_order', data.display_order.toString());
      if (data.start_at) formData.append('start_at', data.start_at);
      if (data.end_at) formData.append('end_at', data.end_at);
      
      const response = await api.patch<BannerManagement>(
        API_CONFIG.endpoints.banners.manage.update(publicId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-management'] });
      queryClient.invalidateQueries({ queryKey: ['banners-dashboard'] });
    },
  });
}

/**
 * useDeleteBanner - Soft delete banner
 * DELETE /api/v1/banners/manage/{publicId}/
 */
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicId: string) => {
      await api.delete(API_CONFIG.endpoints.banners.manage.delete(publicId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-management'] });
      queryClient.invalidateQueries({ queryKey: ['banners-dashboard'] });
    },
  });
}

/**
 * useChangeBannerStatus - Change banner status (DRAFT/PUBLISHED/ARCHIVED)
 * POST /api/v1/banners/manage/{publicId}/status/
 */
export function useChangeBannerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ publicId, status }: { publicId: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }) => {
      const response = await api.post<BannerManagement>(
        API_CONFIG.endpoints.banners.manage.changeStatus(publicId),
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-management'] });
      queryClient.invalidateQueries({ queryKey: ['banners-dashboard'] });
    },
  });
}
