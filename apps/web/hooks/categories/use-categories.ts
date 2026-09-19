// apps/web/features/categories/hooks/use-categories.ts
import { useQuery } from "@tanstack/react-query";
import { fetchCategoryTree } from "@/api/categories.api";
import { CATEGORIES_STALE_TIME } from "@novalot/shared/constants";
import { KEYS } from "@/lib";

 // 30 min — categories change rarely

export function useCategories() {
  return useQuery({
    queryKey: KEYS.categories.tree(),
    queryFn: fetchCategoryTree,
    staleTime: CATEGORIES_STALE_TIME,
  });
}