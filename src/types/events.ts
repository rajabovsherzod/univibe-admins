// src/types/events.ts

export interface EventDetail {
  public_id: string;
  title: string;
  slug: string;
  description: string;
  banner: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  registration_start: string | null;
  registration_end: string | null;
  participant_limit: number | null;
  coin_reward: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  organizer_club_name: string | null;
  organizer_staff_name: string | null;
  registered_count: number;
  created_at: string;
  collaborators?: EventCollaborator[];
  /** True when the current user may edit/delete this event (admin, manage-all,
   * or the organizer of this specific event). Drives the edit action's visibility. */
  can_manage?: boolean;
  /** Reason shown to the club leader when their event was rejected. */
  rejection_reason?: string;
}

export interface EventsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EventDetail[];
}

export interface EventRegistration {
  public_id: string;
  student: {
    public_id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    get_full_name: string;
    profile_photo_url?: string | null;
    is_active: boolean;
  };
  status: 'REGISTERED' | 'CANCELLED' | 'ATTENDED' | 'MISSED';
  registered_at: string;
  attended_at: string | null;
  /** Signed per-registration QR payload (for the attendance PDF). */
  attendance_token?: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  registration_start?: string;
  registration_end?: string;
  participant_limit?: number | null;
  coin_reward: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED';
  banner?: File | null;
}

export interface EventCollaborator {
  public_id: string;
  user: {
    public_id: string;
    first_name: string;
    last_name: string;
    email: string;
    get_full_name: string;
  };
  role: 'CO_ORGANIZER' | 'SCANNER';
  added_at: string;
}
