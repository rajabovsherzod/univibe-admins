import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import type {
  CoinRule,
  AuditTransaction,
  DeletionAudit,
  PaginatedResponse
} from "@/lib/api/types";
import type { CreateCoinRuleInput, UpdateCoinRuleInput } from "@/lib/validations/coins";

const ENDPOINTS = API_CONFIG.endpoints.coins;

// Default API Fetcher with Auth
async function apiFetch(url: string, token: string, options?: { method?: string; body?: string }) {
  try {
    const res = await axios({
      url,
      method: options?.method || "GET",
      data: options?.body ? JSON.parse(options.body) : undefined,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const msg = Object.values(errData).flat().join(" ") || `API Xatosi: ${error.response?.status || error.message}`;
    throw new Error(msg as string);
  }
}

// ── 1. Coin Rules Hooks ──────────────────────────────────────────────────

interface RulesParams {
  status?: "active" | "archived";
  search?: string;
  page?: number;
  page_size?: number;
}

export function useCoinRules(params: RulesParams = {}) {
  const { data: session } = useSession();

  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set("status", params.status);
  if (params.search) queryParams.set("search", params.search);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.page_size) queryParams.set("page_size", params.page_size.toString());

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery<PaginatedResponse<CoinRule>>({
    queryKey: ["coin-rules", params],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.rules}${queryString}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken,
  });
}

export function useCreateCoinRule() {
  const { data: session } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCoinRuleInput) =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.ruleCreate}`,
        session?.accessToken as string,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coin-rules"] }),
  });
}

export function useUpdateCoinRule() {
  const { data: session } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCoinRuleInput }) =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.ruleUpdate(id)}`,
        session?.accessToken as string,
        { method: "PATCH", body: JSON.stringify(data) }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coin-rules"] }),
  });
}

export function useToggleRuleStatus() {
  const { data: session } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "activate" | "archive" }) =>
      apiFetch(
        `${API_CONFIG.baseURL}${action === "activate" ? ENDPOINTS.ruleActivate(id) : ENDPOINTS.ruleArchive(id)}`,
        session?.accessToken as string,
        { method: "PATCH" }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coin-rules"] }),
  });
}

// ── 2. Admin Transactions Audit Hooks ────────────────────────────────────

interface AuditTransactionsParams {
  transaction_type?: string;
  is_deleted?: string;
  staff_public_id?: string;
  student_public_id?: string;
  coin_rule_public_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export function useAuditTransactions(params: AuditTransactionsParams = {}) {
  const { data: session } = useSession();

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.set(key, String(value));
    }
  });

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery<PaginatedResponse<AuditTransaction>>({
    queryKey: ["audit-transactions", params],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.auditTransactions}${queryString}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken,
  });
}

// ── 3. Deletion Audits Hooks ──────────────────────────────────────────────

interface DeletionAuditsParams {
  page?: number;
  page_size?: number;
}

export function useDeletionAudits(params: DeletionAuditsParams = {}) {
  const { data: session } = useSession();

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.page_size) queryParams.set("page_size", params.page_size.toString());

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery<PaginatedResponse<DeletionAudit>>({
    queryKey: ["deletion-audits", params],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.deletionAudits}${queryString}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken,
  });
}
