// shared/src/category/descendants.ts
import type { Category } from "../db/schema";

/** Returns the given category's id plus every descendant id, flattened. */
export function getCategoryIdsWithDescendants(
  categories: Category[],
  categoryId: string,
): string[] {
  const childrenByParent = new Map<string, string[]>();
  categories.forEach((c) => {
    if (c.parentId) {
      const list = childrenByParent.get(c.parentId) ?? [];
      list.push(c.id);
      childrenByParent.set(c.parentId, list);
    }
  });

  const result: string[] = [categoryId];
  const queue = [categoryId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = childrenByParent.get(current) ?? [];
    children.forEach((childId) => {
      result.push(childId);
      queue.push(childId);
    });
  }

  return result;
}