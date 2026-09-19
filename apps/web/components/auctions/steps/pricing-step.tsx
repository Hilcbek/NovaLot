// features/auctions/components/steps/pricing-step.tsx
"use client";

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useFormContext } from "react-hook-form";
import { AuctionFormValues } from "../form-types";

function PriceInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number | undefined;
  onChange: (val: number | undefined) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        type="number"
        step="0.01"
        min="0"
        className="pl-6"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
      />
    </div>
  );
}

export function PricingStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AuctionFormValues>();

  return (
    <FieldGroup>
      <Controller
        control={control}
        name="startingPrice"
        render={({ field }) => (
          <Field data-invalid={!!errors.startingPrice}>
            <FieldLabel htmlFor="startingPrice">Starting price</FieldLabel>
            <PriceInput id="startingPrice" value={field.value} onChange={field.onChange} />
            {errors.startingPrice && (
              <FieldError>{errors.startingPrice.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="bidIncrement"
        render={({ field }) => (
          <Field data-invalid={!!errors.bidIncrement}>
            <FieldLabel htmlFor="bidIncrement">Bid increment</FieldLabel>
            <PriceInput id="bidIncrement" value={field.value} onChange={field.onChange} />
            <FieldDescription>
              The minimum amount each new bid must exceed the current bid by.
            </FieldDescription>
            {errors.bidIncrement && (
              <FieldError>{errors.bidIncrement.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="reservePrice"
        render={({ field }) => (
          <Field data-invalid={!!errors.reservePrice}>
            <FieldLabel htmlFor="reservePrice">Reserve price (optional)</FieldLabel>
            <PriceInput id="reservePrice" value={field.value} onChange={field.onChange} />
            <FieldDescription>
              The minimum price you're willing to accept. Hidden from bidders.
            </FieldDescription>
            {errors.reservePrice && (
              <FieldError>{errors.reservePrice.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="buyNowPrice"
        render={({ field }) => (
          <Field data-invalid={!!errors.buyNowPrice}>
            <FieldLabel htmlFor="buyNowPrice">Buy-now price (optional)</FieldLabel>
            <PriceInput id="buyNowPrice" value={field.value} onChange={field.onChange} />
            <FieldDescription>
              Let a bidder purchase the item instantly at this price.
            </FieldDescription>
            {errors.buyNowPrice && (
              <FieldError>{errors.buyNowPrice.message}</FieldError>
            )}
          </Field>
        )}
      />
    </FieldGroup>
  );
}