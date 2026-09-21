// features/auctions/components/steps/details-step.tsx
"use client";

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useFormContext } from "react-hook-form";
import { AuctionFormValues } from "../form-types";
import { useCategories } from "@/hooks";
import type { CategoryNode } from "@novalot/shared/category";

const CONDITIONS = [
  "New",
  "Like New",
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "For Parts",
];

// Flattens the category tree into a flat list with a `depth` field, so
// subcategories render indented under their parent in the Select.
function flattenCategories(
  nodes: CategoryNode[],
  depth = 0,
): { id: string; name: string; depth: number }[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, depth },
    ...flattenCategories(node.children, depth + 1),
  ]);
}

export function DetailsStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AuctionFormValues>();

  const { data: categoryTree } = useCategories();
  const flatCategories = categoryTree ? flattenCategories(categoryTree) : [];

  return (
    <FieldGroup>
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" placeholder="1960 Rolex Submariner" {...field} />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              rows={6}
              placeholder="Describe the item's history, provenance, and notable details..."
              {...field}
            />
            {errors.description && (
              <FieldError>{errors.description.message}</FieldError>
            )}
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Field data-invalid={!!errors.categoryId}>
              <FieldLabel>Category</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {"\u00A0\u00A0".repeat(cat.depth)}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <FieldError>{errors.categoryId.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="condition"
          render={({ field }) => (
            <Field data-invalid={!!errors.condition}>
              <FieldLabel>Condition</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.condition && (
                <FieldError>{errors.condition.message}</FieldError>
              )}
            </Field>
          )}
        />
      </div>
    </FieldGroup>
  );
}
