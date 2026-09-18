import type { InternalAxiosRequestConfig } from "axios";
import { getAccessToken } from "./token";

export function attachToken(config: InternalAxiosRequestConfig) {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
}
