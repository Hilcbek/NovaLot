// server/create-http-server.ts
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import http from "http";
import type { SocketConfig } from "@/config";

export function createHttpServer(config: SocketConfig): http.Server {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());

  // Health check — used by load balancers / Docker HEALTHCHECK
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", ts: new Date().toISOString() });
  });

  return http.createServer(app);
}
