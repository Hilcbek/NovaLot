// apps/web/features/categories/hooks/use-category-mutations.ts
import { useMutation } from "@tanstack/react-query";
import { getQueryClient } from "@/components/providers/AppProvider";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@novalot/shared/category-validation"; // ← still unconfirmed
import { KEYS } from "@/lib";
import { createCategory, deleteCategory, updateCategory } from "@/api";

export function useCreateCategoryMutation() {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.categories.all() });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: UpdateCategoryInput }) =>
      updateCategory(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.categories.all() });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deleteCategory(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.categories.all() });
    },
  });
}