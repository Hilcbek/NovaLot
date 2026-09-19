// shared/src/category/index.ts
export { slugify } from "./slugify";
export { buildCategoryTree, type CategoryNode } from "./tree";
export { validateCategoryParent } from "./validate-parent";
// shared/src/category/index.ts — add this export alongside the existing three
export { getCategoryIdsWithDescendants } from "./descendants";