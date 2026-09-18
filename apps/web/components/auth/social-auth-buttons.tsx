// features/auth/components/social-auth-buttons.tsx
"use client";

import { Button } from "@/components/ui/button";

interface SocialAuthButtonsProps {
  onGoogleClick?: () => void;
  onAppleClick?: () => void;
  disabled?: boolean;
}

export function SocialAuthButtons({
  onGoogleClick,
  onAppleClick,
  disabled,
}: SocialAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        type="button"
        onClick={onGoogleClick}
        disabled={disabled}
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        type="button"
        onClick={onAppleClick}
        disabled={disabled}
      >
        <AppleIcon className="mr-2 h-4 w-4" />
        Continue with Apple
      </Button>
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
    <svg viewBox="0 0 24 24" className={className}>
      <path
        className="fill-foreground"
        d="M16.365 1.43c0 1.14-.462 2.16-1.213 2.94-.834.87-2.197 1.545-3.298 1.455-.135-1.11.42-2.28 1.2-3.03.87-.84 2.34-1.47 3.31-1.365zM20.94 17.79c-.51 1.17-.75 1.695-1.41 2.73-.93 1.44-2.235 3.24-3.87 3.255-1.44.015-1.815-.945-3.78-.93-1.965.015-2.37.945-3.825.93-1.635-.015-2.88-1.635-3.81-3.075C1.245 17.4.315 12.945 1.965 9.855c.9-1.65 2.505-2.7 4.26-2.715 1.5-.015 2.925.99 3.825.99.9 0 2.64-1.215 4.455-1.035.75.03 2.865.3 4.23 2.28-.105.06-2.52 1.47-2.49 4.395.03 3.51 3.15 4.68 3.195 4.695-.03.09-.51 1.62-1.5 3.32z"
      />
    </svg>
  );
}