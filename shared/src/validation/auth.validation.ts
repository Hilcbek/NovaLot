import { z } from "zod";

const hasLowercase = /[a-z]/;
const hasUppercase = /[A-Z]/;
const hasDigit = /[0-9]/;
const hasSpecialChar = /[^a-zA-Z0-9]/;

const password = z
  .string({ error: "Password is required" })
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must be under 72 characters")
  .regex(hasLowercase, "Password must contain at least one lowercase letter")
  .regex(hasUppercase, "Password must contain at least one uppercase letter")
  .regex(hasDigit, "Password must contain at least one digit")
  .regex(
    hasSpecialChar,
    "Password must contain at least one special character",
  );

const email = z
  .string({ error: "Email is required" })
  .trim()
  .min(1, "Email is required")
  .max(255, "Email must be under 255 characters")
  .email("Enter a valid email address")
  .toLowerCase();

const firstName = z
  .string({ error: "First name is required" })
  .trim()
  .min(1, "First name is required")
  .max(50, "First name must be under 50 characters")
  .regex(
    /^[\p{L}\s'-]+$/u,
    "First name can only contain letters, spaces, hyphens, and apostrophes",
  );

const lastName = z
  .string({ error: "Last name is required" })
  .trim()
  .min(1, "Last name is required")
  .max(50, "Last name must be under 50 characters")
  .regex(
    /^[\p{L}\s'-]+$/u,
    "Last name can only contain letters, spaces, hyphens, and apostrophes",
  );

const tokenString = z
  .string({ error: "Token is required" })
  .trim()
  .min(1, "Token is required")
  .regex(/^[a-f0-9]{64}$/, "Invalid token format");

export const signupSchema = z
  .object({
    firstName,
    lastName,
    email,
    password,
    confirmPassword: z.string({ error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z.object({
  email,
});

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;

export const resetPasswordSchema = z
  .object({
    token: tokenString,
    password,
    confirmPassword: z.string({ error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: password,
    confirmNewPassword: z.string({ error: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const verifyEmailSchema = z.object({
  token: tokenString,
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const requestEmailChangeSchema = z.object({
  newEmail: email,
  password: z
    .string({ error: "Password is required to confirm this change" })
    .min(1, "Password is required to confirm this change"),
});

export type RequestEmailChangeInput = z.infer<typeof requestEmailChangeSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required" })
    .trim()
    .min(1, "Refresh token is required"),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
