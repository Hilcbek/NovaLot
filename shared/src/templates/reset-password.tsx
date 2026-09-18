// emails/reset-password.tsx
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
import { formatExpiry } from "../email";

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

export interface ResetPasswordEmailProps {
  recipientName?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export default function ResetPasswordEmail({
  recipientName,
  resetUrl,
  expiresInMinutes = 30,
}: ResetPasswordEmailProps) {
  const expiryLabel = formatExpiry(expiresInMinutes);

  return (
    <Html>
      <Head />
      <Preview>Reset your NovaLot password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>NovaLot</Text>
          </Section>

          <Section style={card}>
            <Heading style={heading}>Reset your password</Heading>

            <Text style={paragraph}>
              {recipientName ? `Hi ${recipientName},` : "Hi there,"}
            </Text>
            <Text style={paragraph}>
              We received a request to reset your NovaLot password. Click the
              button below to choose a new one. This link expires in{" "}
              {expiryLabel}.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset password
              </Button>
            </Section>

            <Text style={fallbackLabel}>
              Or paste this link into your browser:
            </Text>
            <Text style={linkText}>{resetUrl}</Text>

            <Hr style={hr} />

            <Text style={mutedText}>
              If you didn&apos;t request a password reset, you can safely
              ignore this email — your password won&apos;t be changed.
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

ResetPasswordEmail.PreviewProps = {
  recipientName: "Beki",
  resetUrl: "https://novalot.app/reset-password?token=sample-token-abc123",
  expiresInMinutes: 30,
} satisfies ResetPasswordEmailProps;

const main: React.CSSProperties = { backgroundColor: colors.canvas, fontFamily: fontBody, padding: "32px 0" };
const container: React.CSSProperties = { maxWidth: "480px", margin: "0 auto", padding: "0 16px" };
const logoSection: React.CSSProperties = { textAlign: "center", marginBottom: "24px" };
const logoText: React.CSSProperties = { fontFamily: fontDisplay, fontSize: "22px", fontWeight: 600, color: colors.ink, letterSpacing: "0.5px" };
const card: React.CSSProperties = { backgroundColor: colors.surface, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "40px 32px" };
const heading: React.CSSProperties = { fontFamily: fontDisplay, fontSize: "24px", fontWeight: 600, color: colors.ink, margin: "0 0 16px" };
const paragraph: React.CSSProperties = { fontFamily: fontBody, fontSize: "15px", lineHeight: "24px", color: colors.ink, margin: "0 0 16px" };
const buttonContainer: React.CSSProperties = { textAlign: "center", margin: "32px 0" };
const button: React.CSSProperties = { backgroundColor: colors.green, borderRadius: "6px", color: "#FFFFFF", fontFamily: fontBody, fontSize: "15px", fontWeight: 600, textDecoration: "none", display: "inline-block", padding: "14px 28px" };
const fallbackLabel: React.CSSProperties = { fontFamily: fontBody, fontSize: "13px", color: colors.muted, margin: "0 0 4px" };
const linkText: React.CSSProperties = { fontFamily: fontBody, fontSize: "13px", color: colors.green, wordBreak: "break-all", margin: "0 0 8px" };
const hr: React.CSSProperties = { borderColor: colors.border, margin: "24px 0" };
const mutedText: React.CSSProperties = { fontFamily: fontBody, fontSize: "13px", color: colors.muted, margin: 0 };
const footerText: React.CSSProperties = { fontFamily: fontBody, fontSize: "12px", color: colors.muted, textAlign: "center", marginTop: "24px" };