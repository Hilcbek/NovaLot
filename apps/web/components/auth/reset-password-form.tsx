// features/auth/components/reset-password-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@novalot/shared/auth-validation";
import { isAxiosError } from "axios";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

export function ResetPasswordForm({ token }: { token: string }) {
  const { mutate, isPending } = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  function onSubmit(values: ResetPasswordInput) {
    mutate(values, {
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
          Set a new password.
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account.
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
                <Input id="password" type="password" {...field} />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm new password
                </FieldLabel>
                <Input id="confirmPassword" type="password" {...field} />
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
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
            {isPending ? "Resetting..." : "Reset password"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/sign-in" className="font-medium text-foreground underline">
          Log in
        </Link>
      </p>
    </div>
  );
}