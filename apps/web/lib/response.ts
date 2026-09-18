// lib/api/handle-response-error.ts
import { getQueryClient } from "@/components/providers/AppProvider"; // use the singleton, not makeQueryClient
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { setAccessToken } from "./token";
import { KEYS } from "./keys";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function handleResponseError(api: ReturnType<typeof axios.create>) {
  return async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    if (!originalRequest) return Promise.reject(error);

    const isUnauthorized = error.response?.status === 401;
    const isAuthEndpoint = originalRequest.url?.includes("/auth/");

    if (!isUnauthorized || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const queryClient = getQueryClient();

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${import.meta.env.NEXT_PUBLIC_APP_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      setAccessToken(data.accessToken);
      originalRequest.headers.set(
        "Authorization",
        `Bearer ${data.accessToken}`,
      );
      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      queryClient.setQueryData(KEYS.auth.session(), { isAuthenticated: false });
      queryClient.clear();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  };
}
