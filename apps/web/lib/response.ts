// lib/api/response.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { setAccessToken } from "./token";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const NON_RETRIABLE_AUTH_PATHS = ["/auth/sign-in", "/auth/sign-up", "/auth/refresh"];

export function handleResponseError(api: ReturnType<typeof axios.create>) {
  return async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    if (!originalRequest) return Promise.reject(error);

    const isUnauthorized = error.response?.status === 401;
    const isNonRetriableAuthEndpoint = NON_RETRIABLE_AUTH_PATHS.some((path) =>
      originalRequest.url?.includes(path),
    );

    if (!isUnauthorized || isNonRetriableAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/refresh`,
        {},
        { withCredentials: true },
      );

      setAccessToken(data.accessToken);
      originalRequest.headers.set("Authorization", `Bearer ${data.accessToken}`);
      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      return Promise.reject(refreshError);
    }
  };
}