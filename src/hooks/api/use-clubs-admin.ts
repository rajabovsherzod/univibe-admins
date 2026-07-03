import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { API_CONFIG } from "@/lib/api/config";
import type { 
  ClubsResponse, 
  ClubDetail, 
  CreateClubPayload, 
  UpdateClubStatusPayload, 
  AssignClubOwnerPayload,
  ClubMembership
} from "@/types/clubs";
import { toast } from "sonner";

/**
 * Hook to fetch clubs list
 */
export function useAdminClubs(search = '', status = '', page = 1, pageSize = 20) {
  return useQuery<ClubsResponse>({
    queryKey: ['admin-clubs', search, status, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await api.get<ClubsResponse>(
        `${API_CONFIG.endpoints.clubs.admin.list}?${params.toString()}`
      );
      return response;
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook to create a new club
 */
export function useAdminCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClubPayload) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('short_description', data.short_description);
      formData.append('visibility', data.visibility);
      
      if (data.slug) formData.append('slug', data.slug);
      if (data.category_id) formData.append('category_id', data.category_id);
      
      if (data.logo instanceof File) {
        formData.append('logo', data.logo);
      }
      if (data.banner instanceof File) {
        formData.append('banner', data.banner);
      }

      const response = await api.post<ClubDetail>(
        API_CONFIG.endpoints.clubs.admin.create,
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
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      toast.success("Klub muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Klub yaratishda xatolik yuz berdi");
    }
  });
}

/**
 * Hook to get club detail
 */
export function useAdminClubDetail(clubId: string) {
  return useQuery<ClubDetail>({
    queryKey: ['admin-club-detail', clubId],
    queryFn: async () => {
      const response = await api.get<ClubDetail>(
        API_CONFIG.endpoints.clubs.admin.detail(clubId)
      );
      return response;
    },
    enabled: !!clubId,
  });
}

/**
 * Hook to change club status
 */
export function useAdminUpdateClubStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clubId, data }: { clubId: string; data: UpdateClubStatusPayload }) => {
      const response = await api.patch<ClubDetail>(
        API_CONFIG.endpoints.clubs.admin.status(clubId),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-club-detail', variables.clubId] });
      toast.success("Klub holati o'zgartirildi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    }
  });
}

/**
 * Hook to assign club owner
 */
export function useAdminAssignClubOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clubId, data }: { clubId: string; data: AssignClubOwnerPayload }) => {
      const response = await api.post<ClubMembership>(
        API_CONFIG.endpoints.clubs.admin.owner(clubId),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-club-detail', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['admin-club-members', variables.clubId] });
      toast.success("Klub rahbari muvaffaqiyatli tayinlandi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    }
  });
}
/**
 * Hook to update a club
 */
export function useAdminUpdateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clubId, data }: { clubId: string; data: Partial<CreateClubPayload> }) => {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.short_description) formData.append('short_description', data.short_description);
      if (data.visibility) formData.append('visibility', data.visibility);
      
      if (data.slug) formData.append('slug', data.slug);
      if (data.category_id) formData.append('category_id', data.category_id);
      
      if (data.logo instanceof File) {
        formData.append('logo', data.logo);
      }
      if (data.banner instanceof File) {
        formData.append('banner', data.banner);
      }

      const response = await api.patch<ClubDetail>(
        API_CONFIG.endpoints.clubs.admin.detail(clubId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-club-detail', variables.clubId] });
      toast.success("Klub muvaffaqiyatli tahrirlandi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Klub tahrirlashda xatolik yuz berdi");
    }
  });
}

/**
 * Hook to get club members
 */
export function useAdminClubMembers(clubId: string, page = 1, pageSize = 20) {
  return useQuery<{ pagination: any; results: ClubMembership[] }>({
    queryKey: ['admin-club-members', clubId, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      const response = await api.get<{ pagination: any; results: ClubMembership[] }>(
        `${API_CONFIG.endpoints.clubs.admin.detail(clubId)}members/?${params.toString()}`
      );
      return response;
    },
    enabled: !!clubId,
  });
}
