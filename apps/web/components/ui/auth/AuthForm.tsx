// features/auth/components/auth-form.tsx
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
import { useAuthMutation } from "@/hooks/auth/use-register-mutation";
import { loginSchema, signupSchema } from "@/valdiation/auth.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export type AuthMode = "signup" | "login";

type FormValues = {
  fullName?: string;
  email: string;
  password: string;
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
  signup: {
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
  return mode === "signup"
    ? signupSchema
    : loginSchema;
}

function defaultValuesFor(mode: AuthMode): FormValues {
  return mode === "signup"
    ? { fullName: "", email: "", password: "" }
    : { email: "", password: "" };
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [showPassword, setShowPassword] = useState(false);
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
    mutate(values as any, {
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
          ? error.response?.data?.message
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
        <p className="text-sm font-medium text-[#173A2C]">{copy.eyebrow}</p>
        <h1 className="font-serif text-4xl text-[#173A2C]">{copy.title}</h1>
        <p className="text-sm text-[#173A2C]/60">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          {mode === "signup" && (
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <Field data-invalid={!!errors.fullName}>
                  <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    {...field}
                  />
                  {errors.fullName && (
                    <FieldError>{errors.fullName.message}</FieldError>
                  )}
                </Field>
              )}
            />
          )}

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

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  {mode === "login" && (
                    <Link
                      href="/reset-password"
                      className="text-xs text-[#173A2C]/60 hover:text-[#173A2C]"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#173A2C]/50"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {mode === "signup" && (
                  <FieldDescription>
                    Must be at least 8 characters, include a number and a
                    letter.
                  </FieldDescription>
                )}
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
            )}
          />

          {errors.root && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#173A2C] hover:bg-[#173A2C]/90"
          >
            {isPending ? copy.submitPendingLabel : copy.submitLabel}
          </Button>
        </FieldGroup>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-[#173A2C]/50">or continue with</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button">
          <GoogleIcon className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
        <Button variant="outline" type="button">
          <AppleIcon className="mr-2 h-4 w-4" />
          Continue with Apple
        </Button>
      </div>

      <p className="text-center text-sm text-[#173A2C]/70">
        {copy.footerText}{" "}
        <Link
          href={copy.footerLinkHref}
          className="font-medium text-[#173A2C] underline"
        >
          {copy.footerLinkText}
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A10.99 10.99 0 0012 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 010-4.2V7.05H2.18a11 11 0 000 9.9l3.66-2.85z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.85c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.365 1.43c0 1.14-.462 2.16-1.213 2.94-.834.87-2.197 1.545-3.298 1.455-.135-1.11.42-2.28 1.2-3.03.87-.84 2.34-1.47 3.31-1.365zM20.94 17.79c-.51 1.17-.75 1.695-1.41 2.73-.93 1.44-2.235 3.24-3.87 3.255-1.44.015-1.815-.945-3.78-.93-1.965.015-2.37.945-3.825.93-1.635-.015-2.88-1.635-3.81-3.075C1.245 17.4.315 12.945 1.965 9.855c.9-1.65 2.505-2.7 4.26-2.715 1.5-.015 2.925.99 3.825.99.9 0 2.64-1.215 4.455-1.035.75.03 2.865.3 4.23 2.28-.105.06-2.52 1.47-2.49 4.395.03 3.51 3.15 4.68 3.195 4.695-.03.09-.51 1.62-1.5 3.32z" />
    </svg>
  );
}
