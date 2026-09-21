// server/create-socket.server.ts
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import type http from "http";
import type { SocketConfig } from "@/config";
import type { RedisOptions } from "ioredis";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "@novalot/shared/events";

export type IoServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export interface SocketServerDeps {
  httpServer: http.Server;
  config: SocketConfig;
  redisOptions: RedisOptions;
}

export function createSocketServer({
  httpServer,
  config,
  redisOptions,
}: SocketServerDeps): { io: IoServer; pubClient: Redis; subClient: Redis } {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
    // Prefer WebSocket; fall back to polling only when necessary
    transports: ["websocket", "polling"],
  });

  const pubClient = new Redis(redisOptions);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  return { io, pubClient, subClient };
}
