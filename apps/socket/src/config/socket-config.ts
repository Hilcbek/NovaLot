// config/socket-config.ts
import { env } from "@novalot/shared/env";

export interface SocketConfig {
  port: number;
  corsOrigin: string | string[];
  /** JWT secret used to verify access tokens in the auth middleware */
  jwtAccessSecret: string;
}

export function buildSocketConfig(): SocketConfig {
  return {
    port: env.SOCKET_PORT,
    corsOrigin: env.CORS_ORIGIN,
    jwtAccessSecret: env.JWT_ACCESS_SECRET,
  };
}
