import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { API_CONFIG } from "@/lib/api/config";
import type { 
  EventsResponse, 
  EventDetail, 
  CreateEventPayload, 
  EventRegistration 
} from "@/types/events";
import { toast } from "sonner";

export function useAdminEvents(page = 1, pageSize = 20, status?: string) {
  return useQuery<EventsResponse>({
    queryKey: ['admin-events', page, pageSize, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (status && status !== 'ALL') {
        params.append('status', status);
      }
      return await api.get<EventsResponse>(
        `${API_CONFIG.endpoints.events.admin.list}?${params.toString()}`
      );
    },
    placeholderData: keepPreviousData,
    // Re-sync per-row `can_manage` (and fresh data) when the user returns to the
    // tab — so an admin's permission change reflects in the event UI promptly,
    // matching how the rest of the app reacts to permission updates.
    refetchOnWindowFocus: true,
  });
}

export function useAdminEventDetail(eventId: string) {
  return useQuery<EventDetail>({
    queryKey: ['admin-event-detail', eventId],
    queryFn: async () => {
      return await api.get<EventDetail>(
        API_CONFIG.endpoints.events.admin.detail(eventId)
      );
    },
    enabled: !!eventId,
  });
}

export function useAdminCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventPayload) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('start_time', data.start_time);
      formData.append('end_time', data.end_time);
      formData.append('coin_reward', data.coin_reward.toString());
      formData.append('status', data.status);
      
      if (data.location) formData.append('location', data.location);
      if (data.registration_start) formData.append('registration_start', data.registration_start);
      if (data.registration_end) formData.append('registration_end', data.registration_end);
      if (data.participant_limit !== undefined && data.participant_limit !== null) {
        formData.append('participant_limit', data.participant_limit.toString());
      }
      
      if (data.banner instanceof File) {
        formData.append('banner', data.banner);
      }

      return await api.postFormData<EventDetail>(
        API_CONFIG.endpoints.events.admin.create,
        formData
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success(`"${variables.title}" nomli tadbir muvaffaqiyatli yaratildi!`);
    },
    onError: (error: any) => {
      console.error("Create event error:", error, error.details);
      
      let errorMsg = error.response?.data?.detail || "Tadbiri yaratishda xatolik yuz berdi";
      
      if (error.details && typeof error.details === 'object') {
        const firstErrorKey = Object.keys(error.details)[0];
        if (firstErrorKey) {
          const firstErrorMsg = error.details[firstErrorKey];
          errorMsg = `${firstErrorKey}: ${Array.isArray(firstErrorMsg) ? firstErrorMsg[0] : firstErrorMsg}`;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    }
  });
}

export function useAdminUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: CreateEventPayload }) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('start_time', data.start_time);
      formData.append('end_time', data.end_time);
      formData.append('coin_reward', data.coin_reward.toString());
      formData.append('status', data.status);
      if (data.location !== undefined) formData.append('location', data.location ?? '');
      // Empty string clears the registration window on the backend.
      formData.append('registration_start', data.registration_start ?? '');
      formData.append('registration_end', data.registration_end ?? '');
      formData.append('participant_limit', data.participant_limit != null ? data.participant_limit.toString() : '');
      if (data.banner instanceof File) formData.append('banner', data.banner);

      return await api.patchFormData<EventDetail>(
        API_CONFIG.endpoints.events.admin.detail(eventId),
        formData
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-event-detail', variables.eventId] });
      toast.success("Tadbir muvaffaqiyatli yangilandi!");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.detail ||
        (error.details && typeof error.details === 'object'
          ? `${Object.keys(error.details)[0]}: ${Object.values(error.details)[0]}`
          : error.message) ||
        "Tadbirni yangilashda xatolik yuz berdi";
      toast.error(msg);
    },
  });
}

export function useAdminEventParticipants(eventId: string) {
  return useQuery<EventRegistration[]>({
    queryKey: ['admin-event-participants', eventId],
    queryFn: async () => {
      return await api.get<EventRegistration[]>(
        API_CONFIG.endpoints.events.admin.participants(eventId)
      );
    },
    enabled: !!eventId,
    // Poll while the organizer is on this tab so a student's self-confirmation
    // flips "Kutilmoqda" → "Qatnashdi" within a few seconds, and refresh on
    // focus for an instant update when the organizer returns to the screen.
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, studentId }: { eventId: string; studentId: string }) => {
      return await api.post<{ detail: string; coins_awarded: boolean }>(
        API_CONFIG.endpoints.events.admin.attendance(eventId, studentId),
        undefined
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-participants', variables.eventId] });
      toast.success(`Davomat muvaffaqiyatli belgilandi${data.coins_awarded ? " (Ball berildi!)" : ""}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.response?.data?.detail || "Davomatni belgilashda xatolik yuz berdi");
    }
  });
}

export interface ScanQrResult {
  detail: string;
  coins_awarded: boolean;
  student_name: string;
}

/** Mark attendance from a scanned QR. Sends the signed `token` embedded in the
 * student's per-registration QR (secure path); falls back to a raw
 * `studentPublicId` for manual entry. Toast is opt-out via `silent` so a
 * continuous scanner can show its own inline feedback instead. */
export function useAdminScanQrCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, token, studentPublicId }: {
      eventId: string; token?: string; studentPublicId?: string; silent?: boolean;
    }) => {
      return await api.post<ScanQrResult>(
        API_CONFIG.endpoints.events.admin.scanQr(eventId),
        token ? { token } : { student_public_id: studentPublicId }
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-participants', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-event-detail', variables.eventId] });
      if (!variables.silent) {
        toast.success(`${data.student_name}: Davomat QR orqali belgilandi!`);
      }
    },
    onError: (error: any, variables) => {
      if (!variables.silent) {
        toast.error(error.response?.data?.error || "QR kodni skanerlashda xatolik yuz berdi");
      }
    }
  });
}

export function useAdminChangeEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      return await api.post<{ detail: string }>(
        API_CONFIG.endpoints.events.admin.changeStatus(eventId),
        { status }
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-detail', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success("Status muvaffaqiyatli o'zgartirildi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Status o'zgartirishda xatolik yuz berdi");
    }
  });
}

/** Approve a club-leader's pending event → PUBLISHED. */
export function useAdminApproveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) =>
      api.post<{ detail: string; status: string }>(
        API_CONFIG.endpoints.events.admin.approve(eventId),
        undefined
      ),
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-detail', eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events-pending-count'] });
      toast.success("Tadbir tasdiqlandi va e'lon qilindi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Tadbirni tasdiqlashda xatolik yuz berdi");
    },
  });
}

/** Reject a club-leader's pending event → REJECTED, with an optional reason
 * that reaches the club leader who submitted it. */
export function useAdminRejectEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, reason }: { eventId: string; reason?: string }) =>
      api.post<{ detail: string; status: string }>(
        API_CONFIG.endpoints.events.admin.reject(eventId),
        { reason: reason ?? '' }
      ),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-detail', eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events-pending-count'] });
      toast.success("Tadbir rad etildi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Tadbirni rad etishda xatolik yuz berdi");
    },
  });
}

/** Count of events awaiting approval — powers the sidebar "requests" badge.
 * Only fetched when the caller passes enabled (i.e. the user holds
 * events.publish), so staff who can't approve never fire it. */
export function useAdminPendingEventsCount(options?: { enabled?: boolean }) {
  return useQuery<number>({
    queryKey: ['admin-events-pending-count'],
    queryFn: async () => {
      const res = await api.get<EventsResponse>(
        `${API_CONFIG.endpoints.events.admin.list}?status=PENDING_APPROVAL&page_size=1`
      );
      return res.count ?? 0;
    },
    enabled: options?.enabled ?? true,
    refetchInterval: 30_000,
  });
}

export function useAdminAddCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, user_public_id, role }: { eventId: string; user_public_id: string; role: string }) => {
      return await api.post<{ detail: string; id: string }>(
        API_CONFIG.endpoints.events.admin.addCollaborator(eventId),
        { user_public_id, role }
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-detail', variables.eventId] });
      toast.success("Yordamchi muvaffaqiyatli qo'shildi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Yordamchi qo'shishda xatolik yuz berdi");
    }
  });
}

export function useAdminRemoveCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, collabId }: { eventId: string; collabId: string }) => {
      return await api.post<{ detail: string }>(
        API_CONFIG.endpoints.events.admin.removeCollaborator(eventId, collabId),
        undefined
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-detail', variables.eventId] });
      toast.success("Yordamchi o'chirildi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "O'chirishda xatolik yuz berdi");
    }
  });
}
