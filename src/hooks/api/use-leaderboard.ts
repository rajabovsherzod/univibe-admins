import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import { apiFetch } from "@/lib/api/query-fetch";
import type { PaginatedResponse } from "@/lib/api/types";

const ENDPOINTS = API_CONFIG.endpoints.coins;

export interface LeaderboardEntry {
  student_public_id: string;
  full_name: string;
  profile_photo?: string | null;
  faculty: string | null;
  year_level: string | null;
  total_coins: number;
  rank: number;
  last_refreshed_at: string | null;
}

interface LeaderboardParams {
  period_type?: "ALL_TIME" | "YEARLY" | "MONTHLY";
  period_year?: number;
  period_month?: number;
  faculty_public_id?: string;
  year_level_public_id?: string;
  club_public_id?: string;
  page?: number;
  page_size?: number;
}

export function useLeaderboard(params: LeaderboardParams) {
  const { data: session } = useSession();

  const queryParams = new URLSearchParams();
  if (params.period_type) queryParams.set("period_type", params.period_type);
  if (params.period_year) queryParams.set("period_year", params.period_year.toString());
  if (params.period_month) queryParams.set("period_month", params.period_month.toString());
  if (params.faculty_public_id) queryParams.set("faculty_public_id", params.faculty_public_id);
  if (params.year_level_public_id) queryParams.set("year_level_public_id", params.year_level_public_id);
  if (params.club_public_id) queryParams.set("club_public_id", params.club_public_id);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.page_size) queryParams.set("page_size", params.page_size.toString());

  const queryString = `?${queryParams.toString()}`;

  return useQuery<PaginatedResponse<LeaderboardEntry>>({
    queryKey: ["leaderboard", params],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.leaderboard}${queryString}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken,
    placeholderData: keepPreviousData,
  });
}
