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

interface RefreshQueueItem {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

/**
 * Backend API bilan ishlash uchun markazlashtirilgan mijoz (Axios).
 *
 * Token yangilash strategiyasi:
 *  1. Har bir request'da getSession() orqali joriy access token olinadi.
 *  2. 401 kelganda /api/auth/refresh endpoint'i chaqiriladi — bu expiresAt
 *     tekshirmasdan to'g'ridan-to'g'ri backend'ga refresh so'rov yuboradi
 *     va JWT cookie'ni yangilaydi.
 *  3. Bir vaqtda kelgan bir nechta 401 uchun FAQAT bitta refresh so'rov
 *     yuboriladi (isRefreshing lock). Qolgan requestlar navbatga (queue)
 *     qo'yiladi va refresh tugagandan keyin yangi token bilan qayta yuboriladi.
 *  4. Refresh muvaffaqiyatsiz tugasa → signOut.
 */
class ApiClient {
  private axiosInstance: AxiosInstance;

  // Bir vaqtda faqat bitta refresh so'rovi yuborilishini ta'minlovchi lock
  private isRefreshing = false;

  // 401 olgan, refresh tugashini kutayotgan requestlar navbati
  private refreshQueue: RefreshQueueItem[] = [];

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

  // Navbatdagi barcha requestlarni yakunlash (token yoki xato bilan)
  private processQueue(error: Error | null, token: string | null) {
    this.refreshQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token!);
    });
    this.refreshQueue = [];
  }

  /**
   * /api/auth/refresh endpoint'ini chaqiradi.
   * Bu endpoint expiresAt tekshirmasdan har doim backend'ga refresh so'rov yuboradi
   * va muvaffaqiyatli bo'lsa JWT cookie'ni yangilaydi.
   */
  private async callRefreshEndpoint(): Promise<string> {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();
    if (!data?.access) throw new Error("Invalid refresh response");
    return data.access as string;
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

    // ── Response: 401 Refresh bilan qayta urinish ─────────────────────────
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          // Agar refresh allaqachon ketayotgan bo'lsa — navbatga qo'sh va kut
          if (this.isRefreshing) {
            return new Promise<string>((resolve, reject) => {
              this.refreshQueue.push({ resolve, reject });
            })
              .then((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.callRefreshEndpoint();

            // Navbatdagi barcha requestlarga yangi token berish
            this.processQueue(null, newToken);
            this.isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch {
            this.isRefreshing = false;
            const authError = new AuthenticationError("Sessiya tugadi. Qayta kiring.");
            this.processQueue(authError, null);

            // Sessiya ma'lumotlarini tozalash va login sahifasiga yo'naltirish
            if (typeof window !== "undefined") {
              document.cookie = "user_data=;path=/;max-age=0;SameSite=Lax";
              localStorage.removeItem("univibe-profile");
              localStorage.removeItem("user-storage");
              localStorage.removeItem("user-profile-storage");
              sessionStorage.clear();
              signOut({ redirect: true, callbackUrl: "/login" });
            }

            return Promise.reject(authError);
          }
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
