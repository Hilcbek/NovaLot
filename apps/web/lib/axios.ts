// lib/api/http-client.ts
import axios from "axios";
import { attachToken } from "./request";
import { handleResponseError } from "./response";

export const httpClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_APP_URL}/api` as string,
  withCredentials: true,
});

httpClient.interceptors.request.use(attachToken);
httpClient.interceptors.response.use(
  (response) => response,
  handleResponseError(httpClient),
);
