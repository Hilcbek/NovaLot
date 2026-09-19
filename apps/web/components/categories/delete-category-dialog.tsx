// features/categories/components/delete-category-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isAxiosError } from "axios";
import type { Category } from "@novalot/shared/db/schema";
import { useDeleteCategoryMutation } from "@/hooks";

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}) {
  const { mutate, isPending } = useDeleteCategoryMutation();
  const [blockerMessage, setBlockerMessage] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) setBlockerMessage(null);
    onOpenChange(next);
  }

  function handleConfirm() {
    if (!category) return;

    mutate(category.slug, {
      onSuccess: () => onOpenChange(false),
      onError: (error: unknown) => {
        const message = isAxiosError(error) ? error.response?.data?.error : undefined;
        setBlockerMessage(message ?? "Something went wrong. Please try again.");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete category</DialogTitle>
          <DialogDescription>
            {category ? `Delete "${category.name}"? This can't be undone.` : ""}
          </DialogDescription>
        </DialogHeader>

        {blockerMessage && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {blockerMessage}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}