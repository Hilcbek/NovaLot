// features/auth/components/reset-password-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

type FormValues = { email: string };

export function ResetPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "" } });

  function onSubmit(values: FormValues) {
    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <Mail className="h-10 w-10 text-brand-panel" strokeWidth={1.5} />

        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-4xl text-brand-panel">Check your inbox.</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to
            <br />
            <span className="font-medium text-foreground">{sentTo}.</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="text-sm font-medium text-brand-panel underline"
        >
          Didn&apos;t get it? Resend link.
        </button>

        <Link
          href="/login"
          className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-brand-panel"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to log in
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl text-brand-panel">Reset your password.</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll send a link to your email address to help you create a new
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="you@example.com" {...field} />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>
            )}
          />

          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}