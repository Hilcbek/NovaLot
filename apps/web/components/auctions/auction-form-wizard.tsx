// features/auctions/components/auction-form-wizard.tsx
"use client";

import { Stepper } from "@/components/auctions/stepper";
import { Button } from "@/components/ui/button";
import { useCreateAuctionMutation, useUpdateAuctionMutation } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAuctionSchema } from "@novalot/shared/auction-validation";
import { isAxiosError } from "axios";
import { useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { AuctionFormValues, STEP_FIELDS, STEP_LABELS } from "./form-types";
import { DetailsStep } from "./steps/details-step";
import { ImagesStep } from "./steps/images-step";
import { PricingStep } from "./steps/pricing-step";
import { ScheduleStep } from "./steps/schedule-step";
import { SettingsStep } from "./steps/settings-step";

interface AuctionFormWizardProps {
  mode: "create" | "edit";
  auctionId?: string;
  defaultValues?: Partial<AuctionFormValues>;
}

export function AuctionFormWizard({
  mode,
  auctionId,
  defaultValues,
}: AuctionFormWizardProps) {
  const [step, setStep] = useState(0);

  const form = useForm<AuctionFormValues>({
    resolver: zodResolver(
      createAuctionSchema,
    ) as unknown as Resolver<AuctionFormValues>,
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      condition: "",
      startingPrice: 0,
      bidIncrement: 10,
      autoExtendEnabled: false,
      requireVerifiedBidder: false,
      images: [],
      ...defaultValues,
    },
  });

  const createMutation = useCreateAuctionMutation();
  const updateMutation = useUpdateAuctionMutation(auctionId ?? "");
  const mutation = mode === "create" ? createMutation : updateMutation;

  async function goNext() {
    const fieldsToValidate = STEP_FIELDS[step];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function onSubmit(values: AuctionFormValues) {
    mutation.mutate(values, {
      onError: (error: unknown) => {
        const message = isAxiosError(error)
          ? (error.response?.data?.error ?? error.response?.data?.message)
          : undefined;
        form.setError("root", {
          message: message ?? "Something went wrong. Please try again.",
        });
      },
    });
  }

  const isLastStep = step === STEP_LABELS.length - 1;

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div>
          <p className="text-sm font-medium text-foreground">
            {mode === "create" ? "Create Auction" : "Edit Auction"}
          </p>
          <h1 className="font-serif text-3xl text-brand-accent">
            {mode === "create" ? "List a new item." : "Update your listing."}
          </h1>
        </div>

        <Stepper steps={STEP_LABELS} currentStep={step} />

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 0 && <DetailsStep />}
          {step === 1 && <PricingStep />}
          {step === 2 && <SettingsStep />}
          {step === 3 && <ScheduleStep />}
          {step === 4 && <ImagesStep />}

          {form.formState.errors.root && (
            <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 0}
            >
              Back
            </Button>

            {isLastStep ? (
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? "Saving..."
                  : mode === "create"
                    ? "Publish Auction"
                    : "Save Changes"}
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Next
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
