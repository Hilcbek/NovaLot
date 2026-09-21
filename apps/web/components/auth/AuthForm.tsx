"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuthMutation } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@novalot/shared/auth-validation";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SocialAuthButtons } from "./social-auth-buttons";

export type AuthMode = "sign-up" | "login";

type FormValues = {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

const COPY: Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    submitLabel: string;
    submitPendingLabel: string;
    footerText: string;
    footerLinkText: string;
    footerLinkHref: string;
  }
> = {
  "sign-up": {
    eyebrow: "Sign Up",
    title: "Create your account.",
    subtitle:
      "Join NovaLot to bid on exceptional items, save your favorites, and be the first to know about upcoming auctions.",
    submitLabel: "Create account",
    submitPendingLabel: "Creating account...",
    footerText: "Already have an account?",
    footerLinkText: "Log in",
    footerLinkHref: "/sign-in",
  },
  login: {
    eyebrow: "Log In",
    title: "Welcome back.",
    subtitle:
      "Sign in to your account to start bidding, manage your watchlist, and more.",
    submitLabel: "Log in",
    submitPendingLabel: "Logging in...",
    footerText: "New here?",
    footerLinkText: "Create an account",
    footerLinkHref: "/sign-up",
  },
};

function schemaFor(mode: AuthMode) {
  return mode === "sign-up" ? signupSchema : loginSchema;
}

function defaultValuesFor(mode: AuthMode): FormValues {
  return mode === "sign-up"
    ? {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      }
    : { email: "", password: "" };
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate, isPending } = useAuthMutation(mode);
  const copy = COPY[mode];

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schemaFor(mode)),
    defaultValues: defaultValuesFor(mode),
  });

  function onSubmit(values: FormValues) {
    // The zod resolver for this mode has already validated `values` against
    // signupSchema or loginSchema before onSubmit ever runs, so the fields
    // required by whichever schema was active are guaranteed present here —
    // this branch just gives TypeScript the same narrowing the runtime
    // validation already enforced, instead of casting past the mismatch.
    const payload: SignupInput | LoginInput =
      mode === "sign-up"
        ? {
            firstName: values.firstName!,
            lastName: values.lastName!,
            email: values.email,
            password: values.password,
            confirmPassword: values.confirmPassword!,
          }
        : { email: values.email, password: values.password };

    mutate(payload, {
      onError: (error: unknown) => {
        if (isAxiosError(error) && error.response?.data?.errors) {
          const fieldErrors = error.response.data.errors as Record<
            string,
            string | string[]
          >;
          Object.entries(fieldErrors).forEach(([field, message]) => {
            setError(field as keyof FormValues, {
              message: Array.isArray(message) ? message[0] : message,
            });
          });
          return;
        }

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
        <p className="text-sm font-medium text-foreground">{copy.eyebrow}</p>
        <h1 className="font-serif text-4xl text-brand-accent">{copy.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          {mode === "sign-up" && (
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <Field data-invalid={!!errors.firstName}>
                    <FieldLabel htmlFor="firstName">First name</FieldLabel>
                    <Input id="firstName" placeholder="Jane" {...field} />
                    {errors.firstName && (
                      <FieldError>{errors.firstName.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <Field data-invalid={!!errors.lastName}>
                    <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                    <Input id="lastName" placeholder="Doe" {...field} />
                    {errors.lastName && (
                      <FieldError>{errors.lastName.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </div>
          )}

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

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  {mode === "login" && (
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Create a password"
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {mode === "sign-up" && (
                  <FieldDescription>
                    Must be at least 8 characters, include a number and a letter.
                  </FieldDescription>
                )}
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
              </Field>
            )}
          />

          {mode === "sign-up" && (
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      placeholder="Re-enter your password"
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                </Field>
              )}
            />
          )}

          {errors.root && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? copy.submitPendingLabel : copy.submitLabel}
          </Button>
        </FieldGroup>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <Separator className="flex-1" />
      </div>

      <SocialAuthButtons disabled={isPending} />

      <p className="text-center text-sm text-muted-foreground">
        {copy.footerText}{" "}
        <Link
          href={copy.footerLinkHref}
          className="font-medium text-foreground underline"
        >
          {copy.footerLinkText}
        </Link>
      </p>
    </div>
  );
}
