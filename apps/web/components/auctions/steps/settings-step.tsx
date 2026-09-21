// features/auctions/components/steps/settings-step.tsx
"use client";

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { AuctionFormValues } from "../form-types";

export function SettingsStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AuctionFormValues>();

  const autoExtendEnabled = useWatch({ control, name: "autoExtendEnabled" });

  return (
    <FieldGroup>
      <Controller
        control={control}
        name="autoExtendEnabled"
        render={({ field }) => (
          <Field>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <FieldLabel htmlFor="autoExtendEnabled">Auto-extend auction</FieldLabel>
                <FieldDescription>
                  Prevent sniping by extending the end time when bids are placed near the deadline.
                </FieldDescription>
              </div>
              <Switch
                id="autoExtendEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          </Field>
        )}
      />

      {autoExtendEnabled && (
        <Controller
          control={control}
          name="autoExtendMinutes"
          render={({ field }) => (
            <Field data-invalid={!!errors.autoExtendMinutes}>
              <FieldLabel htmlFor="autoExtendMinutes">Auto-extend window (minutes) *</FieldLabel>
              <Input
                id="autoExtendMinutes"
                type="number"
                step="1"
                min="1"
                max="60"
                placeholder="e.g., 5"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
              />
              <FieldDescription>
                If a bid is placed within this many minutes before the end, extend by this duration.
              </FieldDescription>
              {errors.autoExtendMinutes && <FieldError>{errors.autoExtendMinutes.message}</FieldError>}
            </Field>
          )}
        />
      )}

      <Controller
        control={control}
        name="maxBidsPerUser"
        render={({ field }) => (
          <Field data-invalid={!!errors.maxBidsPerUser}>
            <FieldLabel htmlFor="maxBidsPerUser">Max bids per user (optional)</FieldLabel>
            <Input
              id="maxBidsPerUser"
              type="number"
              step="1"
              min="1"
              placeholder="No limit"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            />
            <FieldDescription>
              Limit how many times a single user can bid on this auction.
            </FieldDescription>
            {errors.maxBidsPerUser && <FieldError>{errors.maxBidsPerUser.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="requireVerifiedBidder"
        render={({ field }) => (
          <Field>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <FieldLabel htmlFor="requireVerifiedBidder">Require verified bidders</FieldLabel>
                <FieldDescription>
                  Only users with verified email can place bids on this auction.
                </FieldDescription>
              </div>
              <Switch
                id="requireVerifiedBidder"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="customRules"
        render={({ field }) => (
          <Field data-invalid={!!errors.customRules}>
            <FieldLabel htmlFor="customRules">Custom rules (optional)</FieldLabel>
            <Textarea
              id="customRules"
              placeholder="Any additional rules or terms for this auction..."
              rows={4}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
            <FieldDescription>
              Free-form text for any special conditions or requirements.
            </FieldDescription>
            {errors.customRules && <FieldError>{errors.customRules.message}</FieldError>}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
