import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import { apiFetch } from "@/lib/api/query-fetch";

const ENDPOINTS = API_CONFIG.endpoints.coins;

export interface ActivityStats {
  this_month: {
    total_coins_issued: number;
    total_coins_last_month: number;
  };
  top_students: {
    id: string;
    full_name: string;
    faculty: string | null;
    total_coins: number;
    rank: number;
  }[];
  recent_transactions: {
    transaction_public_id: string;
    student_name: string;
    staff_name: string | null;
    amount: number;
    transaction_type: string;
    coin_rule_name: string | null;
    created_at: string;
  }[];
}

export function useActivityStats() {
  const { data: session } = useSession();

  return useQuery<ActivityStats>({
    queryKey: ["coin-activity-stats"],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.activityStats}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken,
  });
}
