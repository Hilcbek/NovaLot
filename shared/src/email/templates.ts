import type { ComponentType } from "react";
import ResetPasswordEmail, {
  ResetPasswordEmailProps,
} from "../templates/reset-password";
import VerifyEmail, { VerifyEmailProps } from "../templates/verify-email";
// import { ResetPasswordEmail, type ResetPasswordEmailProps } from "../templates";

export interface TemplateParamsMap {
  verifyEmail: VerifyEmailProps;
  resetPassword: ResetPasswordEmailProps;
  // resetPassword: ResetPasswordEmailProps;
}
export type TemplateName = keyof TemplateParamsMap;

export const templateComponents: {
  [K in TemplateName]: ComponentType<TemplateParamsMap[K]>;
} = {
  verifyEmail: VerifyEmail,
  resetPassword: ResetPasswordEmail,
};

export const templateSubjects: {
  [K in TemplateName]: string | ((p: TemplateParamsMap[K]) => string);
} = {
  verifyEmail: "Confirm your email — NovaLot",
  resetPassword: "Reset your password - NovaLot",
};

export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

export type SendEmailInput<K extends TemplateName> = {
  template: K;
  params: TemplateParamsMap[K];
  to: string;
  subject?: string;
  idempotencyKey?: string;
};
