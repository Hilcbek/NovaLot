// namespaces/index.ts
import type { IoServer } from "@/server";
import type { Logger } from "@novalot/shared/logger";
import type { BidService } from "@/services";
import type { NotificationService } from "@/services";
import { registerAuctionNamespace } from "./auctions";
import { registerNotificationNamespace } from "./notifications";
import { registerPublicNamespace } from "./public";

export interface RegisterNamespacesDeps {
  io: IoServer;
  bidService: BidService;
  notificationService: NotificationService;
  logger: Logger;
}

export function registerNamespaces(deps: RegisterNamespacesDeps): void {
  // Public namespace has no auth — register before the auth-required ones
  // so it is clearly separated in the call order.
  registerPublicNamespace({
    io: deps.io,
    logger: deps.logger,
  });

  registerAuctionNamespace({
    io: deps.io,
    bidService: deps.bidService,
    logger: deps.logger,
  });

  registerNotificationNamespace({
    io: deps.io,
    notificationService: deps.notificationService,
    logger: deps.logger,
  });
}
