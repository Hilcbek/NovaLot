// app/(auth)/reset-password/page.tsx
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <p className="text-sm text-destructive">
        This reset link is missing or invalid. Please request a new one.
      </p>
    );
  }

  return <ResetPasswordForm token={token} />;
}