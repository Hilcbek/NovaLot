// features/auth/components/forgot-password-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForgotPasswordMutation } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordResetSchema } from "@novalot/shared/auth-validation";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

type FormValues = { email: string };

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const { mutate, isPending } = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: FormValues) {
    mutate(values, {
      onSuccess: () => setSubmitted(true),
      onError: (error: unknown) => {
        const message = isAxiosError(error)
          ? (error.response?.data?.error ?? error.response?.data?.message)
          : undefined;
        setError("root", {
          message: message ?? "Something went wrong. Please try again.",
        });
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Reset Password</p>
        <h1 className="font-serif text-4xl text-brand-accent">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the email on your account and we&apos;ll send you a link to
          reset your password.
        </p>
      </div>

      {submitted ? (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          If that email is registered, you&apos;ll receive a password reset
          link shortly. Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>
              )}
            />

            {errors.root && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Sending..." : "Send reset link"}
            </Button>
          </FieldGroup>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/sign-in" className="font-medium text-foreground underline">
          Log in
        </Link>
      </p>
    </div>
  );
}