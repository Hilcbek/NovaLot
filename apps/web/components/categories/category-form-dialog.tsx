// features/categories/components/category-form-dialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "@/components/ui/select";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { slugify, type CategoryNode } from "@novalot/shared/category";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@novalot/shared/category-validation";
import type { Category } from "@novalot/shared/db/schema";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";

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
  return node.children.flatMap((child) => [child.id, ...getDescendantIds(child)]);
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

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tree: CategoryNode[];
  category?: Category; // undefined = create mode, Category = edit mode
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  tree,
  category,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-2xl">
        {/*
          Rendering the form only while open, keyed by which category (or
          "new") it's for, means React fully unmounts and remounts it every
          time the dialog opens — a fresh component instance with fresh
          initial state (useForm defaultValues, slugTouched) computed once,
          up front. No effect is needed to "reset" anything on open, because
          there's nothing stale left over to reset: the previous instance is
          gone.
        */}
        {open && (
          <CategoryFormContent
            key={category?.id ?? "new"}
            tree={tree}
            category={category}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryFormContent({
  tree,
  category,
  onOpenChange,
}: {
  tree: CategoryNode[];
  category?: Category;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!category;
  const { mutate: create, isPending: isCreating } = useCreateCategoryMutation();
  const { mutate: update, isPending: isUpdating } = useUpdateCategoryMutation();
  const isPending = isCreating || isUpdating;

  // No reset effect needed — this whole component remounts fresh per open,
  // so this initial value is only ever computed once per dialog session.
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
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

  const name = useWatch({ control, name: "name" });
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
    <>
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
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
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
                  Auto-generated from the name — edit if you need something different.
                </FieldDescription>
                {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
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
                  onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="No parent (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent (top-level)</SelectItem>
                    {parentOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {"—".repeat(opt.depth)} {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parentId && <FieldError>{errors.parentId.message}</FieldError>}
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
                {errors.imageUrl && <FieldError>{errors.imageUrl.message}</FieldError>}
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEdit ? "Save changes" : "Create category"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}