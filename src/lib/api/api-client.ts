import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  ValidationError,
  ErrorCode,
  NetworkError,
} from "./errors";
import { API_CONFIG } from "./config";

interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
}

/**
 * Backend API bilan ishlash uchun markazlashtirilgan mijoz (Axios).
 * Avtomatik ravishda `next-auth` orqali tokenlarni boshqaradi va xatoliklarni qayta ishlaydi.
 *
 * 401 javobi kelganda:
 *  1. getSession() chaqiriladi — bu JWT callback'ni ishga tushiradi va access token yangilanadi
 *  2. Yangi token bilan so'rov qayta yuboriladi
 *  3. Agar yangilash ham muvaffaqiyatsiz bo'lsa → signOut
 */
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: 30_000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // ── Request: Attach Bearer Token ──────────────────────────────────────
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const customConfig = config as RequestOptions;
        if (!customConfig.skipAuth) {
          const session = await getSession();
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ── Response: Error Handling & 401 Refresh ────────────────────────────
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // getSession() calls /api/auth/session which triggers the JWT callback.
            // The JWT callback will try to refresh the expired access token.
            const session = await getSession();

            if (session?.accessToken && !session.error) {
              originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch {
            // Session fetch failed — fall through to signOut
          }

          // Refresh failed or session has error — log out
          if (typeof window !== "undefined") {
            document.cookie = "user_data=;path=/;max-age=0;SameSite=Lax";
            localStorage.removeItem("univibe-profile");
            localStorage.removeItem("user-storage");
            localStorage.removeItem("user-profile-storage");
            sessionStorage.clear();
            signOut({ redirect: true, callbackUrl: "/login" });
          }

          return Promise.reject(new AuthenticationError("Sessiya tugadi. Qayta kiring."));
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): AppError {
    if (!error.response) {
      return new NetworkError("Tarmoqqa ulanishda xatolik yuz berdi");
    }

    const status = error.response.status;
    const data = (error.response.data as Record<string, unknown>) || {};
    const message =
      (data.detail as string) ||
      (data.message as string) ||
      "So'rov muvaffaqiyatsiz tugadi";

    switch (status) {
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError("So'ralgan manba topilmadi");
      case 400:
        return new ValidationError(message, data);
      case 500:
        return new ServerError(message);
      default:
        return new AppError({
          code: ErrorCode.UNKNOWN_ERROR,
          message,
          statusCode: status,
          details: data,
        });
    }
  }

  // ── Public Methods ────────────────────────────────────────────────────────

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, options);
    return response.data;
  }

  async post<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, options);
    return response.data;
  }

  async postFormData<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, formData, {
      ...options,
      headers: { ...options.headers, "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async put<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data, options);
    return response.data;
  }

  async putFormData<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, formData, {
      ...options,
      headers: { ...options.headers, "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async patch<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data, options);
    return response.data;
  }

  async patchFormData<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, formData, {
      ...options,
      headers: { ...options.headers, "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, options);
    return response.data;
  }
}

export const api = new ApiClient();
