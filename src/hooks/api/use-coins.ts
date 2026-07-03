import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import { apiFetch } from "@/lib/api/query-fetch";
import type {
  CoinRule,
  CoinRuleHistory,
  AuditTransaction,
  DeletionAudit,
  PaginatedResponse
} from "@/lib/api/types";
import type { CreateCoinRuleInput, UpdateCoinRuleInput } from "@/lib/validations/coins";

const ENDPOINTS = API_CONFIG.endpoints.coins;

// ── 1. Coin Rules Hooks ──────────────────────────────────────────────────

interface RulesParams {
  status?: "active" | "archived";
  search?: string;
  rule_type?: "reward" | "penalty";
  page?: number;
  page_size?: number;
}

export function useCoinRules(params: RulesParams = {}) {
  const { data: session } = useSession();

  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set("status", params.status);
  if (params.search) queryParams.set("search", params.search);
  if (params.rule_type) queryParams.set("rule_type", params.rule_type);
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
    placeholderData: keepPreviousData,
  });
}

export function useCoinRuleDetail(id: string) {
  const { data: session } = useSession();

  return useQuery<CoinRule>({
    queryKey: ["coin-rule-detail", id],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.ruleDetail(id)}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken && !!id,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coin-rules"] });
      qc.invalidateQueries({ queryKey: ["coin-rule-history"] });
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coin-rules"] });
      qc.invalidateQueries({ queryKey: ["coin-rule-history"] });
    },
  });
}

export function useCoinRuleHistory(id: string) {
  const { data: session } = useSession();

  return useQuery<CoinRuleHistory[]>({
    queryKey: ["coin-rule-history", id],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.ruleHistory(id)}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken && !!id,
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
