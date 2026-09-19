// shared/src/validation/category.validation.ts
import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const categoryBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(SLUG_REGEX, "Slug must be lowercase letters, numbers, and hyphens only")
    .optional(), // omit to auto-derive from name at the route layer
  parentId: z.uuid().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  imageUrl: z.url().nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const createCategorySchema = categoryBaseSchema;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = categoryBaseSchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;