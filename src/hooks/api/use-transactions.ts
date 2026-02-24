import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { API_CONFIG } from "@/lib/api/config";
import type { PaginatedResponse } from "@/lib/api/types";

const ENDPOINTS = API_CONFIG.endpoints.coins;

// Default API Fetcher with Auth
async function apiFetch(url: string, token: string, options?: { method?: string; body?: any }) {
  try {
    const res = await axios({
      url,
      method: options?.method || "GET",
      data: options?.body ? options.body : undefined,
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

// ── 1. Coin Transactions (Staff & Admin) ──────────────────────────────────

export interface Transaction {
  transaction_public_id: string;
  staff_member_name: string;
  staff_member_public_id: string;
  coin_rule_name: string;
  coin_rule_public_id: string;
  transaction_type: "ISSUANCE" | "DEDUCTION" | "TRANSFER";
  amount: number;
  comment?: string;
  created_at: string;
}

interface TransactionsParams {
  user_public_id: string; // Required for listing user's transactions
  page?: number;
  page_size?: number;
}

export function useTransactions(params: TransactionsParams) {
  const { data: session } = useSession();

  const queryParams = new URLSearchParams();
  queryParams.set("user_public_id", params.user_public_id);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.page_size) queryParams.set("page_size", params.page_size.toString());

  const queryString = `?${queryParams.toString()}`;

  return useQuery<PaginatedResponse<Transaction>>({
    queryKey: ["coin-transactions", params],
    queryFn: () =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.transactions}${queryString}`,
        session?.accessToken as string
      ),
    enabled: !!session?.accessToken && !!params.user_public_id,
  });
}

// ── 2. Issue Coins (Staff) ────────────────────────────────────────────────

export interface IssueCoinInput {
  student_public_id: string;
  coin_rule_public_id: string;
  comment?: string;
}

export function useIssueCoins() {
  const { data: session } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: IssueCoinInput) =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.transactionIssue}`,
        session?.accessToken as string,
        { method: "POST", body: data }
      ),
    onSuccess: (_, variables) => {
      // Refresh transactions for this specific student
      qc.invalidateQueries({
        queryKey: ["coin-transactions", { user_public_id: variables.student_public_id }],
      });
      // Also potentially refresh audits
      qc.invalidateQueries({ queryKey: ["audit-transactions"] });
    },
  });
}

// ── 3. Delete Transaction (Staff) ─────────────────────────────────────────

export interface DeleteTransactionInput {
  transaction_public_id: string;
  deletion_reason: string;
}

export function useDeleteTransaction() {
  const { data: session } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteTransactionInput) =>
      apiFetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.transactionDelete(data.transaction_public_id)}`,
        session?.accessToken as string,
        { method: "POST", body: { deletion_reason: data.deletion_reason } } // Passing reasoning
      ),
    onSuccess: () => {
      // Invalidate all transaction streams to ensure accurate coin balances
      qc.invalidateQueries({ queryKey: ["coin-transactions"] });
      qc.invalidateQueries({ queryKey: ["deletion-audits"] });
      qc.invalidateQueries({ queryKey: ["audit-transactions"] });
    },
  });
}
