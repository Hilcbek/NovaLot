// features/auctions/components/form-types.ts
import type { CreateAuctionInput } from "@novalot/shared/auction-validation";

export type AuctionFormValues = CreateAuctionInput;

export const STEP_LABELS = ["Details", "Pricing", "Settings", "Schedule", "Images"];

export const STEP_FIELDS: (keyof AuctionFormValues)[][] = [
  ["title", "description", "categoryId", "condition"],
  ["startingPrice", "reservePrice", "buyNowPrice", "bidIncrement"],
  ["autoExtendEnabled", "autoExtendMinutes", "maxBidsPerUser", "requireVerifiedBidder", "customRules"],
  ["startTime", "endTime"],
  ["images"],
];