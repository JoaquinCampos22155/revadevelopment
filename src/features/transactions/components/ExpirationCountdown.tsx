"use client";

import { useEffect, useState } from "react";

export function ExpirationCountdown({ expiresAt }: Readonly<{ expiresAt: string }>) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (remaining === null) return <span>Calculando expiración…</span>;
  if (remaining <= 0) return <span className="font-semibold text-rose-800">Expirada</span>;
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return <span aria-live="off" className="tabular-nums">{hours} h {String(minutes).padStart(2, "0")} min {String(seconds).padStart(2, "0")} s</span>;
}
