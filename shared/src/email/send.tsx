import { render } from "@react-email/render";
import type { ComponentType } from "react";
import { Resend } from "resend";
import { env } from "../env/env.server";
import { createLogger } from "../utils/logger";
import {
  templateComponents,
  templateSubjects,
  type SendEmailInput,
  type SendResult,
  type TemplateName,
  type TemplateParamsMap,
} from "./templates";

const logger = createLogger("email");

let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendEmail<K extends TemplateName>(
  input: SendEmailInput<K>,
): Promise<SendResult> {
  const Component = templateComponents[input.template] as ComponentType<
    TemplateParamsMap[K]
  >;
  const html = await render(<Component {...input.params} />);

  const subjectEntry = templateSubjects[input.template];
  const subject =
    input.subject ??
    (typeof subjectEntry === "function"
      ? subjectEntry(input.params)
      : subjectEntry);

  try {
    const { data, error } = await getResendClient().emails.send(
      { from: env.EMAIL_FROM, to: input.to, subject, html },
      input.idempotencyKey
        ? { idempotencyKey: input.idempotencyKey }
        : undefined,
    );
    if (error) {
      logger.error(`[resend] "${input.template}" failed`, { error });
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    logger.error(`[resend] "${input.template}" threw`, { error: err });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}