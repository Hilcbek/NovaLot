// shared/src/validation/auction.validation.ts
import { z } from "zod";
import { isValidAuctionWindow } from "../auction";

const auctionImageSchema = z.object({
  fileId: z.string().min(1),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().default(false),
});

function checkExactlyOnePrimary(
  images: z.infer<typeof auctionImageSchema>[] | undefined,
  ctx: z.RefinementCtx,
) {
  if (!images || images.length === 0) return;
  if (images.filter((img) => img.isPrimary).length !== 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["images"], message: "Exactly one image must be marked as primary." });
  }
}

const auctionBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(5000),
  categoryId: z.string().uuid(),
  condition: z.string().min(1).max(200),
  startingPrice: z.number().positive("Starting price must be greater than 0"),
  reservePrice: z.number().positive().optional(),
  buyNowPrice: z.number().positive().optional(),
  bidIncrement: z.number().positive("Bid increment must be greater than 0"),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  // Auction settings (optional, with defaults)
  autoExtendEnabled: z.boolean().default(false),
  autoExtendMinutes: z.number().int().positive().optional(),
  maxBidsPerUser: z.number().int().positive().optional(),
  requireVerifiedBidder: z.boolean().default(false),
  customRules: z.string().max(1000).optional(),
});

export const createAuctionSchema = auctionBaseSchema
  .extend({
    images: z.array(auctionImageSchema).min(1).max(5, "A maximum of 5 images is allowed."),
  })
  .superRefine((data, ctx) => {
    if (!isValidAuctionWindow(data.startTime, data.endTime)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endTime"], message: "End time must be after start time." });
    }
    checkExactlyOnePrimary(data.images, ctx);
    
    // Validate buyNowPrice must be greater than startingPrice
    if (data.buyNowPrice && data.buyNowPrice <= data.startingPrice) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        path: ["buyNowPrice"], 
        message: "Buy now price must be greater than starting price." 
      });
    }
    
    // Validate reservePrice if provided
    if (data.reservePrice && data.reservePrice < data.startingPrice) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        path: ["reservePrice"], 
        message: "Reserve price should not be less than starting price." 
      });
    }
    
    // If autoExtendEnabled, autoExtendMinutes must be provided
    if (data.autoExtendEnabled && !data.autoExtendMinutes) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        path: ["autoExtendMinutes"], 
        message: "Auto-extend minutes required when auto-extend is enabled." 
      });
    }
  });

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;

export const updateAuctionSchema = auctionBaseSchema
  .extend({ images: z.array(auctionImageSchema).max(5).optional() })
  .partial()
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime && !isValidAuctionWindow(data.startTime, data.endTime)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endTime"], message: "End time must be after start time." });
    }
    checkExactlyOnePrimary(data.images, ctx);
    
    // Note: For updates, we can't validate cross-field rules without the existing data,
    // so buyNowPrice/reservePrice validation will be done server-side in the update handler
    
    // If autoExtendEnabled is being set to true, autoExtendMinutes must be provided
    if (data.autoExtendEnabled === true && !data.autoExtendMinutes) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        path: ["autoExtendMinutes"], 
        message: "Auto-extend minutes required when auto-extend is enabled." 
      });
    }
  });

export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>;