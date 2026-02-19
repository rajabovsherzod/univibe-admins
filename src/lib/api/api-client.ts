// lib/api/api-client.ts

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import { getSession, signOut } from 'next-auth/react';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  ValidationError,
  ErrorCode,
  NetworkError, // Assuming this exists or will be added, if not use AppError
} from './errors';
import { API_CONFIG } from './config';

interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
}

/**
 * Backend API bilan ishlash uchun markazlashtirilgan mijoz (Axios).
 * Avtomatik ravishda `next-auth` orqali tokenlarni boshqaradi va xatoliklarni qayta ishlaydi.
 */
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      // credentials: 'include', // Needed if using cookies, but we use Bearer token
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor: Attach Token
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Skip auth if explicitly requested (custom config property)
        // Note: Axios config type doesn't have skipAuth by default, casting or extension needed if strictly typed
        const customConfig = config as RequestOptions;

        if (!customConfig.skipAuth) {
          const session = await getSession();
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor: Error Handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          // TODO: Implement Refresh Logic if backend supports it
          // For now, logout on 401 as per previous decision
          console.log('Got 401, signing out...');
          await signOut({ redirect: true, callbackUrl: '/uz/login' });
          return Promise.reject(new AuthenticationError('Sessiya tugadi. Qayta kiring.'));
        }

        // Handle other errors
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): AppError {
    if (!error.response) {
      return new NetworkError('Tarmoqqa ulanishda xatolik yuz berdi');
    }

    const status = error.response.status;
    const data = error.response.data as Record<string, unknown> || {};
    const message = (data.detail as string) || (data.message as string) || 'So\'rov muvaffaqiyatsiz tugadi';

    switch (status) {
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError('So\'ralgan manba topilmadi');
      case 400:
        return new ValidationError(message, data);
      case 500:
        return new ServerError(message);
      default:
        return new AppError({
          code: ErrorCode.UNKNOWN_ERROR,
          message,
          statusCode: status,
          details: data
        });
    }
  }

  // --- Public Methods ---

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
      headers: {
        ...options.headers,
        'Content-Type': 'multipart/form-data',
      },
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
      headers: {
        ...options.headers,
        'Content-Type': 'multipart/form-data',
      },
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
      headers: {
        ...options.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, options);
    return response.data;
  }
}

export const api = new ApiClient();
