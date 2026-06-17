"use client";

/* Tilt 3D suivi-souris (spring). Respecte reduced-motion (no-op).
   Adapté depuis landing-sections-lab — perf-safe, framer only. */
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import type { MouseEvent } from "react";

export function useTilt(max = 8) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 200, damping: 18, mass: 0.4 });
  const rotateY = useSpring(ry, { stiffness: 200, damping: 18, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const b = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width - 0.5;
    const py = (e.clientY - b.top) / b.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return { rotateX, rotateY, onMove, onLeave };
}
