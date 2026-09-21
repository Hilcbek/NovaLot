// namespaces/auctions/auctions.namespace.ts
import type { IoServer } from "@/server";
import type { Logger } from "@novalot/shared/logger";
import type { BidService } from "@/services";
import { registerAuctionHandlers } from "./auctions.handlers";
import type { AuctionSocket } from "./auctions.handlers";
import type { AuctionNamespace } from "./auctions.rooms";

export interface AuctionNamespaceDeps {
  io: IoServer;
  bidService: BidService;
  logger: Logger;
}

export function registerAuctionNamespace(deps: AuctionNamespaceDeps): void {
  const { io, bidService, logger } = deps;

  const ns = io.of("/auctions") as unknown as AuctionNamespace;

  ns.on("connection", (socket) => {
    logger.info("Auction namespace: client connected", {
      socketId: socket.id,
      userId: socket.data.sub,
    });

    registerAuctionHandlers(socket as AuctionSocket, { ns, bidService, logger });

    socket.on("disconnect", (reason) => {
      logger.info("Auction namespace: client disconnected", {
        socketId: socket.id,
        reason,
      });
    });
  });
}
