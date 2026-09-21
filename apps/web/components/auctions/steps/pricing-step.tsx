// features/auctions/components/steps/pricing-step.tsx
"use client";

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useFormContext } from "react-hook-form";
import { AuctionFormValues } from "../form-types";

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
            <FieldLabel htmlFor="startingPrice">Starting price *</FieldLabel>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="startingPrice"
                type="number"
                step="0.01"
                min="0"
                className="pl-6"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
              />
            </div>
            <FieldDescription>
              The initial price bidders will see when the auction starts.
            </FieldDescription>
            {errors.startingPrice && <FieldError>{errors.startingPrice.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="bidIncrement"
        render={({ field }) => (
          <Field data-invalid={!!errors.bidIncrement}>
            <FieldLabel htmlFor="bidIncrement">Minimum bid increment *</FieldLabel>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="bidIncrement"
                type="number"
                step="0.01"
                min="0"
                className="pl-6"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
              />
            </div>
            <FieldDescription>
              The minimum amount each new bid must exceed the current highest bid.
            </FieldDescription>
            {errors.bidIncrement && <FieldError>{errors.bidIncrement.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="reservePrice"
        render={({ field }) => (
          <Field data-invalid={!!errors.reservePrice}>
            <FieldLabel htmlFor="reservePrice">Reserve price (optional)</FieldLabel>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="reservePrice"
                type="number"
                step="0.01"
                min="0"
                className="pl-6"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
              />
            </div>
            <FieldDescription>
              Hidden minimum price. If not met, the item won&apos;t sell even if there are bids.
            </FieldDescription>
            {errors.reservePrice && <FieldError>{errors.reservePrice.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="buyNowPrice"
        render={({ field }) => (
          <Field data-invalid={!!errors.buyNowPrice}>
            <FieldLabel htmlFor="buyNowPrice">Buy now price (optional)</FieldLabel>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="buyNowPrice"
                type="number"
                step="0.01"
                min="0"
                className="pl-6"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
              />
            </div>
            <FieldDescription>
              Allow buyers to purchase immediately at this price, skipping the auction.
            </FieldDescription>
            {errors.buyNowPrice && <FieldError>{errors.buyNowPrice.message}</FieldError>}
          </Field>
        )}
      />
    </FieldGroup>
  );
}