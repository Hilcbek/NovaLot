// features/auth/components/set-new-password-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";

type FormValues = { password: string; confirmPassword: string };

export function SetNewPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit() {
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-accent">
          <Check className="h-6 w-6 text-brand-accent" strokeWidth={2.5} />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-4xl text-brand-accent">Password updated.</h1>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully changed.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/sign-in">Log in.</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/sign-in"
        className="flex items-center gap-1.5 text-sm text-brand-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to log in
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl text-brand-accent">Set a new password.</h1>
        <p className="text-sm text-muted-foreground">
          This will sign you out of your other devices for security.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a new password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldDescription>
                  Must be at least 8 characters, include a number and a letter.
                </FieldDescription>
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Button type="submit" className="w-full">
            Reset password
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}