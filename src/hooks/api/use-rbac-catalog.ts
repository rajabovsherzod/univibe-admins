// hooks/api/use-rbac-catalog.ts
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import type { RbacCatalog } from "@/lib/api/types";

export function useRbacCatalog() {
  const { data: session } = useSession();
  return useQuery<RbacCatalog>({
    queryKey: ["rbac-catalog"],
    queryFn: async () => {
      const res = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.rbac.catalog}`, {
        headers: { Authorization: `Bearer ${session?.accessToken as string}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken,
    staleTime: 30 * 60 * 1000, // catalog rarely changes
  });
}
