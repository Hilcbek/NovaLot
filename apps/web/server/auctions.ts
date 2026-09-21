// apps/web/server/auctions.ts
import {
  buildAuctionListWhere,
  canCancelAuction,
  canEditAuction,
  isValidAuctionWindow,
  isValidBuyNowPrice,
  resolveEffectiveStatus,
  type EffectiveStatusFilter,
} from "@novalot/shared/auction";
import type {
  CreateAuctionInput,
  UpdateAuctionInput,
} from "@novalot/shared/auction-validation";
import {
  getCategoryIdsWithDescendants,
  slugify,
} from "@novalot/shared/category";
import {
  auctionImages,
  auctions,
  auctionSettings,
  categories,
  type Auction,
} from "@novalot/shared/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import "server-only";
import type { AuthContext } from "./auth-context";
import { db } from "./db";

export type AuctionSort = "ending-soon" | "newest" | "price-asc" | "price-desc";

export interface ListAuctionsParams {
  page: number;
  limit: number;
  categoryId?: string;
  status?: EffectiveStatusFilter;
  search?: string;
  sort: AuctionSort;
}

function sortToOrderBy(sort: AuctionSort) {
  switch (sort) {
    case "ending-soon":
      return asc(auctions.endTime);
    case "price-asc":
      return asc(auctions.currentPrice);
    case "price-desc":
      return desc(auctions.currentPrice);
    case "newest":
    default:
      return desc(auctions.createdAt);
  }
}

export async function listAuctions(params: ListAuctionsParams) {
  let categoryIds: string[] | undefined;

  if (params.categoryId) {
    const allCategories = await db.select().from(categories);
    categoryIds = getCategoryIdsWithDescendants(
      allCategories,
      params.categoryId,
    );
  }

  const where = buildAuctionListWhere({
    categoryIds,
    status: params.status,
    search: params.search,
  });

  const offset = (params.page - 1) * params.limit;

  const [rows, totalResult] = await Promise.all([
    db.query.auctions.findMany({
      where,
      orderBy: sortToOrderBy(params.sort),
      limit: params.limit,
      offset,
      with: {
        category: { columns: { id: true, name: true, slug: true } },
        images: {
          where: eq(auctionImages.isPrimary, true),
          limit: 1,
        },
      },
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(auctions)
      .where(where),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    data: rows.map((auction) => ({
      id: auction.id,
      slug: auction.slug,
      title: auction.title,
      startingPrice: Number(auction.startingPrice),
      currentPrice: Number(auction.currentPrice),
      startTime: auction.startTime,
      endTime: auction.endTime,
      effectiveStatus: resolveEffectiveStatus(auction),
      category: auction.category,
      primaryImage: auction.images[0] ?? null,
    })),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

export async function getAuctionBySlug(slug: string) {
  const auction = await db.query.auctions.findFirst({
    where: eq(auctions.slug, slug),
    with: {
      category: { columns: { id: true, name: true, slug: true } },
      seller: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          avatar_url: true,
        },
      },
      images: true,
      settings: true,
    },
  });

  if (!auction) return null;
  if (auction.status === "draft") return null; // never expose a draft, even by direct slug

  return {
    ...auction,
    startingPrice: Number(auction.startingPrice),
    currentPrice: Number(auction.currentPrice),
    reservePrice: auction.reservePrice ? Number(auction.reservePrice) : null,
    buyNowPrice: auction.buyNowPrice ? Number(auction.buyNowPrice) : null,
    bidIncrement: Number(auction.bidIncrement),
    effectiveStatus: resolveEffectiveStatus(auction),
    images: [...auction.images].sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

// apps/web/server/auctions.ts — add to the file from step 4

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 0;

  while (true) {
    const existing = await db.query.auctions.findFirst({
      where: eq(auctions.slug, slug),
    });
    if (!existing) return slug;
    suffix++;
    slug = `${baseSlug}-${suffix}`;
  }
}

export async function createAuction(
  input: CreateAuctionInput,
  sellerId: string,
) {
  const slug = await ensureUniqueSlug(slugify(input.title));

  return db.transaction(async (tx) => {
    const [auction] = await tx
      .insert(auctions)
      .values({
        title: input.title,
        slug,
        description: input.description,
        categoryId: input.categoryId,
        sellerId,
        startingPrice: input.startingPrice.toString(),
        currentPrice: input.startingPrice.toString(), // no bids yet — current == starting
        reservePrice: input.reservePrice?.toString(),
        buyNowPrice: input.buyNowPrice?.toString(),
        bidIncrement: input.bidIncrement.toString(),
        
        condition: input.condition,
        status: "scheduled", // immediate publish, per your earlier decision — no draft/approval step yet
        startTime: input.startTime,
        endTime: input.endTime,
      })
      .returning();

    await tx.insert(auctionImages).values(
      input.images.map((img, index) => ({
        auctionId: auction.id,
        fileId: img.fileId,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
        displayOrder: img.displayOrder ?? index,
        isPrimary: img.isPrimary,
      })),
    );

    // Create auction_settings record
    await tx.insert(auctionSettings).values({
      auctionId: auction.id,
      autoExtendEnabled: input.autoExtendEnabled ?? false,
      autoExtendMinutes: input.autoExtendMinutes,
      maxBidsPerUser: input.maxBidsPerUser,
      requireVerifiedBidder: input.requireVerifiedBidder ?? false,
      customRules: input.customRules,
    });

    return auction;
  });
}

type UpdateOutcome =
  | { auction: Auction }
  | { error: "not-found" | "forbidden" | "invalid-window" | "invalid-buy-now" };

export async function updateAuction(
  auctionId: string,
  input: UpdateAuctionInput,
  user: AuthContext,
): Promise<UpdateOutcome> {
  const existing = await db.query.auctions.findFirst({
    where: eq(auctions.id, auctionId),
  });
  if (!existing) return { error: "not-found" };

  if (!canEditAuction(existing, user)) {
    return { error: "forbidden" };
  }

  // Merge the patch onto the existing row before re-checking cross-field
  // rules — a partial PATCH might only send one of the two fields a rule
  // compares, so we must validate against the RESULTING state, not just
  // whatever happens to be present in this one request.
  const mergedStartTime = input.startTime ?? existing.startTime;
  const mergedEndTime = input.endTime ?? existing.endTime;
  const mergedStartingPrice =
    input.startingPrice ?? Number(existing.startingPrice);
  const mergedBuyNowPrice =
    input.buyNowPrice ??
    (existing.buyNowPrice ? Number(existing.buyNowPrice) : undefined);

  if (!isValidAuctionWindow(mergedStartTime, mergedEndTime)) {
    return { error: "invalid-window" };
  }
  if (!isValidBuyNowPrice(mergedStartingPrice, mergedBuyNowPrice)) {
    return { error: "invalid-buy-now" };
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(auctions)
      .set({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.startingPrice !== undefined && {
          startingPrice: input.startingPrice.toString(),
        }),
        ...(input.reservePrice !== undefined && {
          reservePrice: input.reservePrice.toString(),
        }),
        ...(input.buyNowPrice !== undefined && {
          buyNowPrice: input.buyNowPrice.toString(),
        }),
        ...(input.bidIncrement !== undefined && {
          bidIncrement: input.bidIncrement.toString(),
        }),
        
        ...(input.condition !== undefined && { condition: input.condition }),
        ...(input.startTime !== undefined && { startTime: input.startTime }),
        ...(input.endTime !== undefined && { endTime: input.endTime }),
      })
      .where(eq(auctions.id, auctionId))
      .returning();

    // Images, when sent, are a full replace — not a diff/patch. The client
    // resends the complete 1–5 image array, not just the ones that changed.
    if (input.images) {
      await tx
        .delete(auctionImages)
        .where(eq(auctionImages.auctionId, auctionId));
      await tx.insert(auctionImages).values(
        input.images.map((img, index) => ({
          auctionId,
          fileId: img.fileId,
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          displayOrder: img.displayOrder ?? index,
          isPrimary: img.isPrimary,
        })),
      );
    }

    // Update auction_settings if any settings fields are provided
    const settingsUpdate: Record<string, unknown> = {};
    if (input.autoExtendEnabled !== undefined) settingsUpdate.autoExtendEnabled = input.autoExtendEnabled;
    if (input.autoExtendMinutes !== undefined) settingsUpdate.autoExtendMinutes = input.autoExtendMinutes;
    if (input.maxBidsPerUser !== undefined) settingsUpdate.maxBidsPerUser = input.maxBidsPerUser;
    if (input.requireVerifiedBidder !== undefined) settingsUpdate.requireVerifiedBidder = input.requireVerifiedBidder;
    if (input.customRules !== undefined) settingsUpdate.customRules = input.customRules;

    if (Object.keys(settingsUpdate).length > 0) {
      await tx
        .update(auctionSettings)
        .set(settingsUpdate)
        .where(eq(auctionSettings.auctionId, auctionId));
    }

    return row;
  });

  return { auction: updated };
}

type DeleteOutcome =
  | { success: true }
  | { error: "not-found" | "forbidden" | "not-draft" };

export async function deleteAuctionDraft(
  auctionSlug: string,
  user: AuthContext,
): Promise<DeleteOutcome> {
  const existing = await db.query.auctions.findFirst({
    where: eq(auctions.slug, auctionSlug),
  });
  if (!existing) return { error: "not-found" };
  if (existing.sellerId !== user.id) return { error: "forbidden" };

  if (resolveEffectiveStatus(existing) !== "draft") {
    return { error: "not-draft" };
  }

  // auction_images has onDelete: "cascade" — no need to delete images manually.
  // auction_settings also has onDelete: "cascade" — no need to delete settings manually.
  await db.delete(auctions).where(eq(auctions.slug, auctionSlug));
  return { success: true };
}

type CancelOutcome =
  | { auction: Auction }
  | { error: "forbidden" | "not-found" };

export async function cancelAuction(
  auctionId: string,
  user: AuthContext,
): Promise<CancelOutcome> {
  const existing = await db.query.auctions.findFirst({
    where: eq(auctions.id, auctionId),
  });
  if (!existing) return { error: "not-found" };

  if (!canCancelAuction(existing, user)) {
    return { error: "forbidden" };
  }

  const [updated] = await db
    .update(auctions)
    .set({ status: "cancelled" })
    .where(eq(auctions.id, auctionId))
    .returning();

  return { auction: updated };
}
// apps/web/server/auctions.ts — add this alongside getAuctionForOwner
export async function getPublicAuctionBySlug(slug: string) {
  const auction = await db.query.auctions.findFirst({
    where: eq(auctions.slug, slug),
    with: {
      images: true,
      category: true,
      seller: { columns: { id: true, firstName: true, lastName: true } },
      settings: true,
    },
  });

  if (!auction || auction.status === "draft") return null;

  return {
    ...auction,
    startingPrice: Number(auction.startingPrice),
    currentPrice: Number(auction.currentPrice),
    reservePrice: auction.reservePrice ? Number(auction.reservePrice) : null,
    buyNowPrice: auction.buyNowPrice ? Number(auction.buyNowPrice) : null,
    bidIncrement: Number(auction.bidIncrement),
    images: [...auction.images].sort((a, b) => a.displayOrder - b.displayOrder),
    seller: {
      id: auction.seller.id,
      fullName: `${auction.seller.firstName} ${auction.seller.lastName}`,
    },
  };
}

// apps/web/server/auctions.ts — add
export async function getAuctionForOwner(slug: string, sellerId: string) {
  const auction = await db.query.auctions.findFirst({
    where: eq(auctions.slug, slug), // was auctions.id
    with: { images: true },
  });

  if (!auction || auction.sellerId !== sellerId) return null;

  return {
    ...auction,
    startingPrice: Number(auction.startingPrice),
    currentPrice: Number(auction.currentPrice),
    reservePrice: auction.reservePrice ? Number(auction.reservePrice) : null,
    buyNowPrice: auction.buyNowPrice ? Number(auction.buyNowPrice) : null,
    bidIncrement: Number(auction.bidIncrement),
    images: [...auction.images].sort((a, b) => a.displayOrder - b.displayOrder),
  };
}
// apps/web/server/auctions.ts — add
export async function listMyAuctions(sellerId: string) {
  const rows = await db.query.auctions.findMany({
    where: eq(auctions.sellerId, sellerId),
    orderBy: desc(auctions.createdAt),
    with: {
      category: { columns: { id: true, name: true, slug: true } },
      images: { where: eq(auctionImages.isPrimary, true), limit: 1 },
    },
  });

  return rows.map((auction) => ({
    id: auction.id,
    slug: auction.slug,
    title: auction.title,
    currentPrice: Number(auction.currentPrice),
    startTime: auction.startTime,
    endTime: auction.endTime,
    status: auction.status,
    effectiveStatus: resolveEffectiveStatus(auction),
    category: auction.category,
    primaryImage: auction.images[0] ?? null,
    sellerId: auction.sellerId,
  }));
}
