import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

// ── NovaLot design tokens ────────────────────────────────────────────────
// Note: most email clients (Gmail, Outlook desktop) strip custom @font-face
// declarations, so Fraunces/Sora will only render in clients that honor
// web fonts (Apple Mail, some webmail). The fallback stacks below are what
// most recipients will actually see — pick fallbacks deliberately, don't
// treat them as an afterthought.
const colors = {
  ink: "#14231C",
  canvas: "#F6F5F0",
  surface: "#FFFFFF",
  border: "#E7E4DA",
  green: "#1F5D48",
  muted: "#8A9089",
} as const;

const fontDisplay = "Fraunces, Georgia, 'Times New Roman', serif";
const fontBody =
  "Sora, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

export interface VerifyEmailProps {
  /** Recipient's display name. Falls back to a neutral greeting if omitted. */
  recipientName?: string;
  /** Full verification URL, e.g. https://novalot.app/verify-email?token=... */
  verifyUrl: string;
  /** Token lifetime, shown to the user. Defaults to 30. */
  expiresInMinutes?: number;
}

// Converts a raw minute count into the most natural unit for display —
// e.g. 1440 minutes -> "1 day" instead of "1440 minutes".
function formatExpiry(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  const hours = minutes / 60;
  if (hours < 24) {
    const rounded = Math.round(hours);
    return `${rounded} hour${rounded === 1 ? "" : "s"}`;
  }

  const days = hours / 24;
  const rounded = Math.round(days);
  return `${rounded} day${rounded === 1 ? "" : "s"}`;
}

export default function VerifyEmail({
  recipientName,
  verifyUrl,
  expiresInMinutes = 30,
}: VerifyEmailProps) {
  const expiryLabel = formatExpiry(expiresInMinutes);

  return (
    <Html>
      <Head />
      <Preview>Confirm your email to finish setting up your NovaLot account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>NovaLot</Text>
          </Section>

          <Section style={card}>
            <Heading style={heading}>Confirm your email</Heading>

            <Text style={paragraph}>
              {recipientName ? `Hi ${recipientName},` : "Hi there,"}
            </Text>
            <Text style={paragraph}>
              Click the button below to verify your email address and finish
              setting up your NovaLot account. This link expires in{" "}
              {expiryLabel}.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={verifyUrl}>
                Verify email address
              </Button>
            </Section>

            <Text style={fallbackLabel}>
              Or paste this link into your browser:
            </Text>
            <Text style={linkText}>{verifyUrl}</Text>

            <Hr style={hr} />

            <Text style={mutedText}>
              If you didn&apos;t create a NovaLot account, you can safely
              ignore this email.
            </Text>
          </Section>

          <Text style={footerText}>
            © {new Date().getFullYear()} NovaLot. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Local dev preview data — used by `react-email dev` / the Studio preview.
VerifyEmail.PreviewProps = {
  recipientName: "Beki",
  verifyUrl: "https://novalot.app/verify-email?token=sample-token-abc123",
  expiresInMinutes: 30,
} satisfies VerifyEmailProps;

// ── Styles ────────────────────────────────────────────────────────────────
const main: React.CSSProperties = {
  backgroundColor: colors.canvas,
  fontFamily: fontBody,
  padding: "32px 0",
};

const container: React.CSSProperties = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "0 16px",
};

const logoSection: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const logoText: React.CSSProperties = {
  fontFamily: fontDisplay,
  fontSize: "22px",
  fontWeight: 600,
  color: colors.ink,
  letterSpacing: "0.5px",
};

const card: React.CSSProperties = {
  backgroundColor: colors.surface,
  borderRadius: "12px",
  border: `1px solid ${colors.border}`,
  padding: "40px 32px",
};

const heading: React.CSSProperties = {
  fontFamily: fontDisplay,
  fontSize: "24px",
  fontWeight: 600,
  color: colors.ink,
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontFamily: fontBody,
  fontSize: "15px",
  lineHeight: "24px",
  color: colors.ink,
  margin: "0 0 16px",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0",
};

const button: React.CSSProperties = {
  backgroundColor: colors.green,
  borderRadius: "6px",
  color: "#FFFFFF",
  fontFamily: fontBody,
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
  padding: "14px 28px",
};

const fallbackLabel: React.CSSProperties = {
  fontFamily: fontBody,
  fontSize: "13px",
  color: colors.muted,
  margin: "0 0 4px",
};

const linkText: React.CSSProperties = {
  fontFamily: fontBody,
  fontSize: "13px",
  color: colors.green,
  wordBreak: "break-all",
  margin: "0 0 8px",
};

const hr: React.CSSProperties = {
  borderColor: colors.border,
  margin: "24px 0",
};

const mutedText: React.CSSProperties = {
  fontFamily: fontBody,
  fontSize: "13px",
  color: colors.muted,
  margin: 0,
};

const footerText: React.CSSProperties = {
  fontFamily: fontBody,
  fontSize: "12px",
  color: colors.muted,
  textAlign: "center",
  marginTop: "24px",
};