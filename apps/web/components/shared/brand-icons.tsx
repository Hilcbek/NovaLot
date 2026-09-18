// components/icons/brand-icons.tsx
import * as React from "react";

export function ColumnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 4h16M5 4v2h14V4M6.5 6l-1 13h13l-1-13M9 9v7M12 9v7M15 9v7M4 21h16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M18.9 2h3.3l-7.2 8.2L23.6 22h-6.9l-5.4-7.1L5.1 22H1.8l7.7-8.8L1 2h7l4.9 6.5L18.9 2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6.94 8.5H4V20h2.94V8.5zM5.47 6.5a1.7 1.7 0 100-3.4 1.7 1.7 0 000 3.4zM20 20v-6.35c0-3.4-1.81-4.99-4.23-4.99-1.95 0-2.82 1.07-3.31 1.82V8.5H9.5c.04.9 0 11.5 0 11.5h2.96v-6.42c0-.34.02-.68.12-.92.28-.68.9-1.38 1.96-1.38 1.38 0 1.93 1.05 1.93 2.6V20H20z"
        fill="currentColor"
      />
    </svg>
  );
}