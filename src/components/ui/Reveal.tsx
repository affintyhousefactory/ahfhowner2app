"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/cn";

/* Révélation staggered au scroll (clip-path + translate).
 *
 * L'état masqué vit dans `globals.css` sous `.js-motion`, et non dans un style
 * inline : le HTML rendu par le serveur reste visible, donc indexable. Ici on
 * ne fait qu'observer l'entrée dans le viewport pour poser `is-in`.
 * `prefers-reduced-motion` est traité en CSS (media query), plus en JS.
 */

/* Marges de viewport reprises telles quelles de l'implémentation framer-motion. */
const REVEAL_MARGIN = "-12% 0px -10% 0px";
const GROUP_MARGIN = "-10% -10% -10% -10%";

const DELAY_CHILDREN = 0.05;
const STAGGER_CHILDREN = 0.08;

/* Pose `is-in` au premier passage dans le viewport, puis cesse d'observer. */
function observeOnce(el: Element, rootMargin: string) {
  if (typeof IntersectionObserver === "undefined") {
    el.classList.add("is-in");
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span" | "li" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return observeOnce(ref.current, REVEAL_MARGIN);
  }, []);

  const Tag = as as "div";

  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      style={
        delay
          ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </Tag>
  );
}

/* Bloc stagger pour enfants <StaggerItem> */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Décalage posé côté client uniquement : les enfants doivent rester nus
       dans le HTML du serveur. */
    Array.from(el.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty(
        "--reveal-delay",
        `${DELAY_CHILDREN + i * STAGGER_CHILDREN}s`,
      );
    });

    return observeOnce(el, GROUP_MARGIN);
  }, []);

  return (
    <div ref={ref} className={cn("reveal-group", className)}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("reveal-item", className)}>{children}</div>;
}
