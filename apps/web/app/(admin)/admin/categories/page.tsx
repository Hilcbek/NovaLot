// app/(admin)/admin/categories/page.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@novalot/shared/db/schema";
import { useCategories } from "@/hooks";
import { CategoryTreeView } from "@/components/categories/category-tree-view";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog";

export default function AdminCategoriesPage() {
  const { data: tree = [], isLoading } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  function openCreate() {
    setEditingCategory(undefined);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  function openDelete(category: Category) {
    setDeletingCategory(category);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Categories</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New category
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <CategoryTreeView tree={tree} onEdit={openEdit} onDelete={openDelete} />
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tree={tree}
        category={editingCategory}
      />

      <DeleteCategoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={deletingCategory}
      />
    </div>
  );
}