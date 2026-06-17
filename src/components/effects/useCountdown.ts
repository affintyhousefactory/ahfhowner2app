"use client";

/* Countdown vers une date ISO cible. SSR-safe : valeurs `0` côté serveur,
   hydratation client au mount → pas de mismatch React. Interval 1s avec
   cleanup propre ; `done = true` quand la cible est passée. */
import { useEffect, useState } from "react";

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
  ready: boolean;
};

function compute(targetMs: number): Omit<Countdown, "ready"> {
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: false };
}

export function useCountdown(targetISO: string): Countdown {
  const targetMs = new Date(targetISO).getTime();
  const [state, setState] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    done: false,
    ready: false,
  });

  useEffect(() => {
    setState({ ...compute(targetMs), ready: true });
    const id = setInterval(() => {
      setState({ ...compute(targetMs), ready: true });
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return state;
}
