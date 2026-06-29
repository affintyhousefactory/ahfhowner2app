"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { Magnetic } from "./Magnetic";

type Variant = "accent" | "outline" | "ghost";

const base =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.95rem] font-medium tracking-tight transition-colors duration-300 will-change-transform whitespace-nowrap";

const styles: Record<Variant, string> = {
  accent:
    "bg-accent text-white hover:bg-accent-ink shadow-[0_1px_0_rgba(0,0,0,0.04)]",
  outline:
    "border border-ink/15 text-ink hover:border-ink/40 bg-transparent",
  ghost: "text-ink hover:text-accent",
};

export function Button({
  children,
  href,
  variant = "accent",
  className,
  magnetic = true,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  magnetic?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <span className="relative z-10 inline-flex items-center gap-2.5">
      {children}
    </span>
  );

  const cls = cn(base, styles[variant], className);

  const el = href ? (
    <Link href={href} className={cls} onClick={onClick}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={cls} onClick={onClick}>
      {inner}
    </button>
  );

  return magnetic ? <Magnetic strength={0.25}>{el}</Magnetic> : el;
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(
        "transition-transform duration-300 group-hover:translate-x-0.5",
        className,
      )}
      aria-hidden
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
