// apps/web/api/categories.api.ts
import { httpClient } from "@/lib/axios";
import type { CategoryNode } from "@novalot/shared/category";
import type { Category } from "@novalot/shared/db/schema";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@novalot/shared/category-validation"; // ← still unconfirmed export path

export interface CategoryWithChildren {
  category: Category;
  children: Category[];
}

export async function fetchCategoryTree(): Promise<CategoryNode[]> {
  const { data } = await httpClient.get<{ categories: CategoryNode[] }>(
    "/categories",
  );
  return data.categories;
}

export async function fetchCategoryBySlug(slug: string): Promise<CategoryWithChildren> {
  const { data } = await httpClient.get<CategoryWithChildren>(
    `/categories/${slug}`,
  );
  return data;
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const { data } = await httpClient.post<{ category: Category }>(
    "/admin/categories",
    input,
  );
  return data.category;
}

export async function updateCategory(
  slug: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const { data } = await httpClient.patch<{ category: Category }>(
    `/admin/categories/${slug}`,
    input,
  );
  return data.category;
}

export async function deleteCategory(slug: string): Promise<void> {
  await httpClient.delete(`/admin/categories/${slug}`);
}