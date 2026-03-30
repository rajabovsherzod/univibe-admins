// Banner Management Types for Univibe Admin Panel

export type BannerStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type BannerScope = 'GLOBAL' | 'UNIVERSITY';

export interface BannerManagement {
  public_id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobile_image?: string | null;
  cta_text?: string;
  cta_link?: string;
  scope: BannerScope;
  university_name?: string | null;
  created_by_name?: string | null;
  status: BannerStatus;
  is_active: boolean;
  display_order: number;
  start_at?: string | null;
  end_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  scope: BannerScope;
  university_name?: string;
  status?: BannerStatus;
  is_active?: boolean;
  display_order?: number;
  start_at?: string;
  end_at?: string;
  image: File;
  mobile_image?: File | null;
}

export interface UpdateBannerInput {
  title?: string;
  subtitle?: string;
  image?: File;
  mobile_image?: File | null;
  cta_text?: string;
  cta_link?: string;
  scope?: BannerScope;
  university_name?: string;
  status?: BannerStatus;
  is_active?: boolean;
  display_order?: number;
  start_at?: string;
  end_at?: string;
}

export interface BannersListResponse {
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
  };
  results: BannerManagement[];
}
