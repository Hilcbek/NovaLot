// api/auctions.api.ts
import { httpClient } from "@/lib";
import type {
  CreateAuctionInput,
  UpdateAuctionInput,
} from "@novalot/shared/auction-validation";

export interface AuctionListFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: "scheduled" | "active" | "ended" | "cancelled";
  search?: string;
  sort?: "ending-soon" | "newest" | "price-asc" | "price-desc";
}

export interface AuctionListItem {
  id: string;
  slug: string;
  title: string;
  startingPrice: number;
  currentPrice: number;
  startTime: string;
  endTime: string;
  effectiveStatus: string;
  category: { id: string; name: string; slug: string };
  primaryImage: { url: string; thumbnailUrl?: string } | null;
}

export interface AuctionListResponse {
  data: AuctionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchMyAuctions() {
  const { data } = await httpClient.get("/auctions/me");
  return data.data;
}

export async function fetchAuctions(
  filters: AuctionListFilters,
): Promise<AuctionListResponse> {
  const { data } = await httpClient.get("/auctions", { params: filters });
  return data;
}

export async function fetchAuctionBySlug(slug: string) {
  const { data } = await httpClient.get(`/auctions/${slug}`);
  return data.auction;
}

export async function createAuction(input: CreateAuctionInput) {
  const { data } = await httpClient.post("/auctions", input);
  return data.auction;
}

export async function fetchAuctionForEdit(slug: string) {
  const { data } = await httpClient.get(`/auctions/${slug}/manage`);
  return data.auction;
}

export async function updateAuction(slug: string, input: UpdateAuctionInput) {
  const { data } = await httpClient.patch(`/auctions/${slug}/manage`, input);
  return data.auction;
}

export async function cancelAuction(slug: string) {
  const { data } = await httpClient.patch(`/auctions/${slug}/manage/cancel`);
  return data.auction;
}
