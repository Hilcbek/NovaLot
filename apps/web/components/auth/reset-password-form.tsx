// features/auth/components/reset-password-form.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@novalot/shared/auth-validation";
import { isAxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { mutate, isPending } = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  useEffect(() => {
    setValue("token", token);
  }, [token, setValue]);

  function onSubmit(values: ResetPasswordInput) {
    if (!token) {
      setError("root", { message: "This reset link is missing or invalid." });
      return;
    }

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

  if (!token) {
    return (
      <p className="text-sm text-destructive">
        This reset link is missing or invalid. Please request a new one.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <Input id="password" type="password" {...field} />
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
  );
}