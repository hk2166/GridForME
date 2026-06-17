"use client";

import { useCallback, useEffect, useState } from "react";

export function useCooldown() {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;

    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [remaining]);

  const start = useCallback((seconds: number) => {
    setRemaining(seconds);
  }, []);

  const reset = useCallback(() => {
    setRemaining(0);
  }, []);

  return {
    remaining,
    isCoolingDown: remaining > 0,
    start,
    reset
  };
}

