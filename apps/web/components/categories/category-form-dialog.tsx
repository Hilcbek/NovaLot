// features/categories/components/category-form-dialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // ← confirm this exists in your shadcn setup
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // ← confirm this exists
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { slugify, type CategoryNode } from "@novalot/shared/category";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@novalot/shared/category-validation"; // ← still unconfirmed export path
import type { Category } from "@novalot/shared/db/schema";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";

interface FlatOption {
  id: string;
  name: string;
  depth: number;
}

function flattenTree(nodes: CategoryNode[], depth = 0): FlatOption[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, depth },
    ...flattenTree(node.children, depth + 1),
  ]);
}

function getDescendantIds(node: CategoryNode): string[] {
  return node.children.flatMap((child) => [
    child.id,
    ...getDescendantIds(child),
  ]);
}

function findNode(nodes: CategoryNode[], id: string): CategoryNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return undefined;
}

type FormValues = {
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  imageUrl: string;
  displayOrder: number;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  tree,
  category, // undefined = create mode, Category = edit mode
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tree: CategoryNode[];
  category?: Category;
}) {
  const isEdit = !!category;
  const { mutate: create, isPending: isCreating } = useCreateCategoryMutation();
  const { mutate: update, isPending: isUpdating } = useUpdateCategoryMutation();
  const isPending = isCreating || isUpdating;

  const [slugTouched, setSlugTouched] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    // zodResolver can produce a resolver type that is not perfectly compatible with
    // the expected generic Resolver<FormValues>. Cast to Resolver<FormValues> to
    // satisfy TypeScript here.
    resolver: zodResolver(
      isEdit ? updateCategorySchema : createCategorySchema,
    ) as unknown as Resolver<FormValues>,
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      parentId: category?.parentId ?? null,
      description: category?.description ?? "",
      imageUrl: category?.imageUrl ?? "",
      displayOrder: category?.displayOrder ?? 0,
    },
  });

  useEffect(() => {
    reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      parentId: category?.parentId ?? null,
      description: category?.description ?? "",
      imageUrl: category?.imageUrl ?? "",
      displayOrder: category?.displayOrder ?? 0,
    });
    setSlugTouched(false);
  }, [category, open, reset]);

  const name = watch("name");
  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(name || ""));
    }
  }, [name, slugTouched, setValue]);

  const excludedIds = useMemo(() => {
    if (!isEdit || !category) return new Set<string>();
    const node = findNode(tree, category.id);
    if (!node) return new Set([category.id]);
    return new Set([category.id, ...getDescendantIds(node)]);
  }, [tree, category, isEdit]);

  const parentOptions = useMemo(
    () => flattenTree(tree).filter((opt) => !excludedIds.has(opt.id)),
    [tree, excludedIds],
  );

  function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      parentId: values.parentId || null,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
    };

    const onError = (error: unknown) => {
      const message = isAxiosError(error)
        ? (error.response?.data?.error ?? error.response?.data?.message)
        : undefined;
      setError("root", {
        message: message ?? "Something went wrong. Please try again.",
      });
    };

    if (isEdit && category) {
      update(
        { slug: category.slug, input: payload as UpdateCategoryInput },
        { onSuccess: () => onOpenChange(false), onError },
      );
    } else {
      create(payload as CreateCategoryInput, {
        onSuccess: () => onOpenChange(false),
        onError,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" {...field} />
                  {errors.name && (
                    <FieldError>{errors.name.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="slug"
              render={({ field }) => (
                <Field data-invalid={!!errors.slug}>
                  <FieldLabel htmlFor="slug">Slug</FieldLabel>
                  <Input
                    id="slug"
                    {...field}
                    onChange={(e) => {
                      setSlugTouched(true);
                      field.onChange(e);
                    }}
                  />
                  <FieldDescription>
                    Auto-generated from the name — edit if you need something
                    different.
                  </FieldDescription>
                  {errors.slug && (
                    <FieldError>{errors.slug.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                <Field data-invalid={!!errors.parentId}>
                  <FieldLabel htmlFor="parentId">Parent category</FieldLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? null : v)
                    }
                  >
                    <SelectTrigger id="parentId">
                      <SelectValue placeholder="No parent (top-level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        No parent (top-level)
                      </SelectItem>
                      {parentOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {"—".repeat(opt.depth)} {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.parentId && (
                    <FieldError>{errors.parentId.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Input id="description" {...field} />
                  {errors.description && (
                    <FieldError>{errors.description.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <Field data-invalid={!!errors.imageUrl}>
                  <FieldLabel htmlFor="imageUrl">Image URL</FieldLabel>
                  <Input id="imageUrl" {...field} />
                  {errors.imageUrl && (
                    <FieldError>{errors.imageUrl.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="displayOrder"
              render={({ field }) => (
                <Field data-invalid={!!errors.displayOrder}>
                  <FieldLabel htmlFor="displayOrder">Display order</FieldLabel>
                  <Input
                    id="displayOrder"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {errors.displayOrder && (
                    <FieldError>{errors.displayOrder.message}</FieldError>
                  )}
                </Field>
              )}
            />

            {errors.root && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.root.message}
              </p>
            )}
          </FieldGroup>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
