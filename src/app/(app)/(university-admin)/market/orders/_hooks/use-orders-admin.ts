import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/lib/api/api-client';
import { API_CONFIG } from '@/lib/api/config';

// ── Types ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'FULFILLED' | 'CANCELED' | 'RETURNED';

export interface OrderItemSnapshot {
  product_public_id: string;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total_snapshot: number;
}

export interface AdminOrder {
  public_id: string;
  student_name: string;
  student_public_id: string;
  status: OrderStatus;
  total_coins: number;
  item_count?: string;
  items?: OrderItemSnapshot[]; // Only in detail view
  returned_reason?: string;
  processed_by_name?: string;
  processed_by_public_id?: string;
  created_at: string;
  updated_at?: string;
  fulfilled_at: string | null;
  returned_at: string | null;
}

export interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminOrder[];
}

export interface OrdersFilters {
  page?: number;
  page_size?: number;
  status?: OrderStatus | '';
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  returned_reason?: string;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useAdminOrders(
  filters: OrdersFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery<OrdersResponse>({
    queryKey: ['market-orders-admin', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.page) sp.set('page', String(filters.page));
      if (filters.page_size) sp.set('page_size', String(filters.page_size));
      if (filters.status) sp.set('status', filters.status);

      const qs = sp.toString();
      const data = await api.get<OrdersResponse>(
        `${API_CONFIG.endpoints.market.ordersList}${qs ? `?${qs}` : ''}`
      );
      return data;
    },
    // Callers that lack `market.order.view` (e.g. the sidebar badge for a staff
    // member without that grant) pass `enabled: false` so the request is never
    // fired — no needless 403, no toast, no crash. Defaults to on for the
    // orders page itself, which is already permission-gated by the route.
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

export function useAdminOrderDetail(public_id: string) {
  return useQuery<AdminOrder>({
    queryKey: ['market-orders-admin-detail', public_id],
    queryFn: async () => {
      const data = await api.get<AdminOrder>(
        API_CONFIG.endpoints.market.orderDetail(public_id)
      );
      return data;
    },
    enabled: !!public_id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderStatusInput }) => {
      const response = await api.patch<AdminOrder>(
        API_CONFIG.endpoints.market.orderStatus(id),
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-orders-admin'] });
      queryClient.invalidateQueries({ queryKey: ['market-redemption-audit'] });
    },
  });
}
