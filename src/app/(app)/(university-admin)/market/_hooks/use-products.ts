"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api-client";
import { API_CONFIG } from "@/lib/api/config";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Product {
  public_id: string;
  name: string;
  description?: string;
  image: string | null;
  price_coins: number;
  stock_type: "UNLIMITED" | "LIMITED";
  stock_quantity: number | null;
  is_active: boolean;
  created_by_name?: string;
  created_by_public_id?: string;
  university_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProductListParams {
  search?: string;
  include_archived?: boolean;
  page?: number;
  page_size?: number;
}

export interface ProductListResponse {
  results: Product[];
  count: number;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useProducts(params: ProductListParams = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.include_archived) qs.set("include_archived", "true");
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const queryString = qs.toString();
  const url = queryString
    ? `${API_CONFIG.endpoints.market.products}?${queryString}`
    : String(API_CONFIG.endpoints.market.products);

  return useQuery<ProductListResponse>({
    queryKey: ["market-products", params],
    queryFn: async () => {
      const raw = await api.get<Product[] | ProductListResponse>(url);
      // Handle both array and paginated response
      if (Array.isArray(raw)) return { results: raw, count: raw.length };
      return raw;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.postFormData<Product>(String(API_CONFIG.endpoints.market.productCreate), formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["market-products"] }),
  });
}

export function useArchiveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      api.patch<Product>(API_CONFIG.endpoints.market.productArchive(publicId), {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["market-products"] }),
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, quantity }: { publicId: string; quantity: number }) =>
      api.patch<Product>(API_CONFIG.endpoints.market.productStock(publicId), { stock_quantity: quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["market-products"] }),
  });
}
