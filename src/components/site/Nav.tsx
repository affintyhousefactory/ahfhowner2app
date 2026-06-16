"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV, BRAND } from "@/lib/site";
import { Button, Arrow } from "@/components/ui/Button";
import { Gauge } from "@/components/ui/Gauge";
import { cn } from "@/lib/cn";

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid || open
          ? "border-b border-line bg-canvas/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between md:h-[4.5rem]">
        <Link href="#top" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">
            {BRAND.maker}
          </span>
          <span className="font-mono text-[0.7rem] tracking-[0.2em] text-muted">
            / {BRAND.model}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="group relative text-sm text-ink/70 transition-colors hover:text-ink"
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Gauge
            reserved={BRAND.reserved}
            total={BRAND.total}
            variant="mini"
            className="hidden sm:flex"
          />
          <Button
            href="#reserver"
            variant="accent"
            className="hidden px-5 py-2.5 text-sm sm:inline-flex"
          >
            Réserver
            <Arrow />
          </Button>

          {/* Burger mobile */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center md:hidden"
          >
            <span className="relative block h-3 w-5">
              <span
                className={cn(
                  "absolute left-0 block h-px w-5 bg-ink transition-all duration-300",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 block h-px w-5 bg-ink transition-all duration-300",
                  open ? "-rotate-45" : "",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-px w-5 bg-ink transition-all duration-300",
                  open ? "top-1.5 opacity-0" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Overlay menu mobile */}
      <div
        className={cn(
          "overflow-hidden border-t border-line bg-canvas md:hidden",
          "transition-[max-height,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)]",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="container-page flex flex-col gap-1 py-6">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-4 text-2xl font-medium tracking-tight"
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-6 flex items-center justify-between">
            <Gauge reserved={BRAND.reserved} total={BRAND.total} variant="mini" />
            <Button
              href="#reserver"
              variant="accent"
              magnetic={false}
              onClick={() => setOpen(false)}
            >
              Réserver
              <Arrow />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
