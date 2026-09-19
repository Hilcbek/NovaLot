// features/auctions/hooks/use-countdown.ts
"use client";

import { useEffect, useState } from "react";

export function useCountdown(endTime: string | Date) {
  const target = new Date(endTime).getTime();
  const [msLeft, setMsLeft] = useState(() => target - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setMsLeft(target - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const ended = msLeft <= 0;
  const totalSeconds = Math.max(Math.floor(msLeft / 1000), 0);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const label = ended
    ? "Ended"
    : days > 0
      ? `${days}d ${hours}h left`
      : hours > 0
        ? `${hours}h ${minutes}m left`
        : `${minutes}m ${seconds}s left`;

  return { ended, days, hours, minutes, seconds, label };
}