// app/verify-email/page.tsx
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center font-sans">
        <h1 className="mb-3 font-serif text-2xl text-[#14231C]">
          Verification failed
        </h1>
        <p className="mb-6 text-sm text-[#8A9089]">
          Missing verification token.
        </p>
        <Link
          href="/login"
          className="rounded-md bg-[#1F5D48] px-6 py-3 font-semibold text-white"
        >
          Back to login
        </Link>
      </main>
    );
  }

  return <VerifyEmailForm token={token} />;
}
