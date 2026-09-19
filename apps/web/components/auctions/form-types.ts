// features/auctions/components/form-types.ts
import type { CreateAuctionInput } from "@novalot/shared/auction-validation";

export type AuctionFormValues = CreateAuctionInput;

export const STEP_LABELS = ["Details", "Pricing", "Schedule", "Images"];

export const STEP_FIELDS: (keyof AuctionFormValues)[][] = [
  ["title", "description", "categoryId", "condition", "location"],
  ["startingPrice", "reservePrice", "buyNowPrice", "bidIncrement"],
  ["startTime", "endTime"],
  ["images"],
];