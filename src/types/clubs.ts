export type ClubStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type ClubVisibility = 'PUBLIC' | 'PRIVATE';

export interface ClubCategory {
  public_id: string;
  name: string;
  description: string;
}

export interface ClubBase {
  public_id: string;
  name: string;
  slug: string;
  short_description: string;
  logo: string | null;
  banner: string | null;
  status: ClubStatus;
  visibility: ClubVisibility;
  followers_count: number;
  members_count: number;
  category: ClubCategory | null;
  created_at: string;
}

export interface ClubList extends ClubBase {
  owner: { public_id: string; full_name: string } | null;
}

export interface ClubDetail extends ClubBase {
  owner?: { public_id: string; full_name: string } | null;
  description: string;
  is_following: boolean;
  is_member: boolean;
  updated_at: string;
}

export interface ClubsResponse {
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
  };
  results: ClubList[];
}

export interface CreateClubPayload {
  name: string;
  slug?: string;
  description: string;
  short_description: string;
  category_id?: string | null;
  visibility: ClubVisibility;
  logo?: File | string | null;
  banner?: File | string | null;
}

export interface UpdateClubStatusPayload {
  status: ClubStatus;
}

export interface AssignClubOwnerPayload {
  student_id: string;
}

export interface ClubMembership {
  public_id: string;
  student_public_id: string;
  student_name: string;
  role_public_id: string;
  role_name: string;
  role_code: string;
  status: 'ACTIVE' | 'REMOVED';
  joined_at: string;
  removed_at: string | null;
  assigned_by_public_id: string | null;
  assigned_by_name: string | null;
  created_at: string;
  updated_at: string;
}
