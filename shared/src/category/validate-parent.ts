// shared/src/category/validate-parent.ts
import type { Category } from "../db/schema";

const DEFAULT_MAX_DEPTH = 1; // 0 = top-level, 1 = subcategory — two levels total

type ValidationResult =
  | { valid: true }
  | { valid: false; reason: "self-parent" | "cycle" | "max-depth"; message: string };

function getAncestorChain(categories: Category[], id: string): string[] {
  const chain: string[] = [];
  let current = categories.find((c) => c.id === id);
  let hops = 0;

  while (current) {
    chain.push(current.id);
    if (!current.parentId) break;
    current = categories.find((c) => c.id === current!.parentId);
    hops++;
    if (hops > categories.length) {
      // Existing data already has a cycle — stop instead of looping forever.
      break;
    }
  }

  return chain;
}

function depthOf(categories: Category[], id: string): number {
  // Number of ancestors above this category. A top-level category is 0.
  return Math.max(getAncestorChain(categories, id).length - 1, 0);
}

export function validateCategoryParent(
  categories: Category[],
  params: { categoryId: string; newParentId: string | null; maxDepth?: number },
): ValidationResult {
  const { categoryId, newParentId, maxDepth = DEFAULT_MAX_DEPTH } = params;

  if (newParentId === null) {
    return { valid: true }; // moving to top level is always safe
  }

  if (newParentId === categoryId) {
    return {
      valid: false,
      reason: "self-parent",
      message: "A category cannot be its own parent.",
    };
  }

  const ancestorsOfNewParent = getAncestorChain(categories, newParentId);
  if (ancestorsOfNewParent.includes(categoryId)) {
    return {
      valid: false,
      reason: "cycle",
      message: "Cannot set a descendant as this category's parent.",
    };
  }

  const newDepth = depthOf(categories, newParentId) + 1;
  const hasChildren = categories.some((c) => c.parentId === categoryId);
  const deepestResultingDepth = hasChildren ? newDepth + 1 : newDepth;

  if (deepestResultingDepth > maxDepth) {
    return {
      valid: false,
      reason: "max-depth",
      message: hasChildren
        ? "This category has subcategories, so it can't be moved under another category."
        : "Categories can only be nested one level deep.",
    };
  }

  return { valid: true };
}