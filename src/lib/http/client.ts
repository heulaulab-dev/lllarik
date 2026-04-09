import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { useDashboardAuthStore } from "@/lib/dashboardStore";
import { normalizeApiError } from "@/lib/http/errors";

const getBaseUrl = () => process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim() ?? "http://localhost:8080";

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let pendingResolvers: Array<(token: string | null) => void> = [];

function resolvePending(token: string | null) {
  pendingResolvers.forEach((resolve) => resolve(token));
  pendingResolvers = [];
}

async function requestRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${getBaseUrl()}/api/v1/auth/refresh`,
    { refreshToken },
    { timeout: 15000 },
  );
  return response.data;
}

function handleSessionExpired() {
  useDashboardAuthStore.getState().clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useDashboardAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      throw normalizeApiError(error);
    }

    const { refreshToken, setTokens } = useDashboardAuthStore.getState();
    if (!refreshToken) {
      handleSessionExpired();
      throw normalizeApiError(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => {
        pendingResolvers.push(resolve);
      });
      if (!token) {
        throw normalizeApiError(error);
      }
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    }

    isRefreshing = true;
    try {
      const refreshed = await requestRefreshToken(refreshToken);
      setTokens(refreshed);
      resolvePending(refreshed.accessToken);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      resolvePending(null);
      handleSessionExpired();
      throw normalizeApiError(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
