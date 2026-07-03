import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import { apiFetch } from "@/lib/api/query-fetch";

export interface StatisticsData {
  kpi: {
    total_coins: number;
    total_penalties: number;
    active_students: number;
  };
  time_series: {
    date: string;
    coins: number;
    penalties: number;
  }[];
  faculty_distribution: {
    name: string;
    coins: number;
  }[];
  top_students: {
    name: string;
    coins: number;
  }[];
}

export function useStatistics() {
  const { data: session } = useSession();

  return useQuery<StatisticsData>({
    queryKey: ["statistics-dashboard"],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.coins.statistics}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken,
  });
}
