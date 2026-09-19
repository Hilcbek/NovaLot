// shared/src/validation/auction.validation.ts
import { z } from "zod";
import { isValidAuctionWindow, isValidBuyNowPrice } from "../auction";
const auctionImageSchema = z.object({
  fileId: z.string().min(1), // ImageKit file id
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
  const primaryCount = images.filter((img) => img.isPrimary).length;
  if (primaryCount !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["images"],
      message: "Exactly one image must be marked as primary.",
    });
  }
}

const auctionBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(5000),
  categoryId: z.string().uuid(),
  startingPrice: z.number().positive("Starting price must be greater than 0"),
  reservePrice: z.number().positive().optional(),
  buyNowPrice: z.number().positive().optional(),
  bidIncrement: z.number().positive("Bid increment must be greater than 0"),
  location: z.string().min(1).max(200),
  condition: z.string().min(1).max(200),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export const createAuctionSchema = auctionBaseSchema
  .extend({
    images: z
      .array(auctionImageSchema)
      .min(1, "At least one image is required.")
      .max(5, "A maximum of 5 images is allowed."),
  })
  .superRefine((data, ctx) => {
    if (!isValidAuctionWindow(data.startTime, data.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time.",
      });
    }
    if (!isValidBuyNowPrice(data.startingPrice, data.buyNowPrice)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buyNowPrice"],
        message: "Buy-now price must be greater than the starting price.",
      });
    }
    checkExactlyOnePrimary(data.images, ctx);
  });

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;

export const updateAuctionSchema = auctionBaseSchema
  .extend({
    images: z
      .array(auctionImageSchema)
      .max(5, "A maximum of 5 images is allowed.")
      .optional(),
  })
  .partial()
  .superRefine((data, ctx) => {
    // Only checkable here when BOTH fields are present in this specific
    // request — see the note below about why the route layer still needs
    // its own check against the stored record.
    if (
      data.startTime &&
      data.endTime &&
      !isValidAuctionWindow(data.startTime, data.endTime)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time.",
      });
    }
    if (
      data.startingPrice !== undefined &&
      data.buyNowPrice !== undefined &&
      !isValidBuyNowPrice(data.startingPrice, data.buyNowPrice)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buyNowPrice"],
        message: "Buy-now price must be greater than the starting price.",
      });
    }
    checkExactlyOnePrimary(data.images, ctx);
  });

export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>;
