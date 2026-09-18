// components/verify-email-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { httpClient } from "@/lib";

const REDIRECT_SECONDS = 5;

type Status = "verifying" | "success" | "error";

export function VerifyEmailForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    async function verify() {
      try {
        await httpClient.post("/auth/verify-email", { token });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        if (err instanceof AxiosError) {
          setErrorMessage(err.response?.data?.error ?? "Verification failed.");
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
      }
    }

    verify();
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;
    if (secondsLeft <= 0) {
      router.push("/sign-in");
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, secondsLeft, router]);

  if (status === "verifying") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center font-sans">
        <p className="text-sm text-[#8A9089]">Verifying your email…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center font-sans">
        <h1 className="mb-3 font-serif text-2xl text-[#14231C]">
          Verification failed
        </h1>
        <p className="mb-6 text-sm text-[#8A9089]">{errorMessage}</p>
        <Link
          href="/sign-in"
          className="rounded-md bg-[#1F5D48] px-6 py-3 font-semibold text-white"
        >
          Back to login
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center font-sans">
      <h1 className="mb-3 font-serif text-2xl text-[#14231C]">Email verified</h1>
      <p className="mb-6 text-sm text-[#8A9089]">
        Your account is verified. Redirecting to login in {secondsLeft}s…
      </p>
      <Link
        href="/sign-in"
        className="rounded-md bg-[#1F5D48] px-6 py-3 font-semibold text-white"
      >
        Back to login
      </Link>
    </main>
  );
}