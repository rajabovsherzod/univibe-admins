import { useQuery } from '@tanstack/react-query';
import { API_CONFIG } from '@/lib/api/config';
import { api } from '@/lib/api/api-client';

export interface RedemptionAuditLog {
  order_public_id: string;
  actor_name: string;
  actor_public_id: string;
  action: 'CREATED' | 'FULFILLED' | 'CANCELED' | 'RETURNED';
  delta_coins: number;
  before_balance: number;
  after_balance: number;
  note: string | null;
  created_at: string;
}

export interface RedemptionAuditResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RedemptionAuditLog[];
}

export interface RedemptionAuditFilters {
  page?: number;
  page_size?: number;
  action?: 'CREATED' | 'FULFILLED' | 'CANCELED' | 'RETURNED' | '';
  order_public_id?: string;
}

export function useRedemptionAudit(filters: RedemptionAuditFilters = {}) {
  return useQuery<RedemptionAuditResponse>({
    queryKey: ['market-redemption-audit', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.page) sp.set('page', String(filters.page));
      if (filters.page_size) sp.set('page_size', String(filters.page_size));
      if (filters.action) sp.set('action', filters.action);
      if (filters.order_public_id) sp.set('order_public_id', filters.order_public_id);

      const qs = sp.toString();
      const data = await api.get<RedemptionAuditResponse>(
        `${API_CONFIG.endpoints.market.auditRedemptions}${qs ? `?${qs}` : ''}`
      );
      return data;
    },
  });
}
