// lib/api/query-fetch.ts
import axios from "axios";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ErrorCode,
  NotFoundError,
  ServerError,
  ValidationError,
} from "./errors";

function errorForStatus(status: number | undefined, message: string): AppError {
  switch (status) {
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(message);
    case 400:
      return new ValidationError(message);
    default:
      if (status && status >= 500) return new ServerError(message);
      return new AppError({ code: ErrorCode.UNKNOWN_ERROR, message, statusCode: status });
  }
}

/** Shared TanStack Query fetcher used across the `hooks/api/use-*` files.
 * Throws a typed `AppError` subclass (statusCode preserved) instead of a bare
 * `Error`, so callers — and the global 403 → <ForbiddenState /> wiring in
 * particular — can branch on `.statusCode` instead of parsing the message. */
export async function apiFetch(
  url: string,
  token: string,
  options?: { method?: string; body?: unknown }
) {
  try {
    const res = await axios({
      url,
      method: options?.method || "GET",
      data: options?.body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error: any) {
    const errData = error.response?.data || {};
    const msg =
      Object.values(errData).flat().join(" ") ||
      `API Xatosi: ${error.response?.status || error.message}`;
    throw errorForStatus(error.response?.status, msg as string);
  }
}
