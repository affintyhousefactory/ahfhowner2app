"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NAV, BRAND, PRODUCT_LIST } from "@/lib/site";
import { Button, Arrow } from "@/components/ui/Button";
import { cn } from "@/shared/lib/cn";

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false); // burger mobile
  const [menu, setMenu] = useState(false); // méga-menu Produits (desktop)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Méga-menu : ouverture au survol/focus, fermeture différée (anti-flicker)
  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(false), 120);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-8 z-50 transition-all duration-500",
        solid || open || menu
          ? "border-b border-line bg-canvas/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between md:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/howner-logo.png"
            alt="Howner logo"
            width={28}
            height={28}
            className="h-7 w-auto"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">
            {BRAND.maker}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {/* Produits — déclencheur du méga-menu */}
          <div
            className="relative"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <button
              aria-haspopup="true"
              aria-expanded={menu}
              onFocus={openMenu}
              onClick={() => setMenu((v) => !v)}
              className="group relative text-sm text-ink/70 transition-colors hover:text-ink"
            >
              Maisons
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300",
                  menu ? "w-full" : "w-0 group-hover:w-full",
                )}
              />
            </button>
          </div>

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
          <Link
            href="/mandataire"
            className="rounded-full bg-orange-400 px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-orange-500"
          >
            Accès Mandataire
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Compteur cumulé 12 + 5 exemplaires */}
          <Link
            href="/configurer"
            aria-label={`${PRODUCT_LIST.map((p) => `${p.name} ${p.total} exemplaires`).join(", ")}`}
            className="hidden items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-ink sm:flex"
          >
            <span className="h-2 w-2 rounded-full bg-accent" />
            {PRODUCT_LIST.map((p) => p.total).join(" + ")}
            <span className="text-muted/70">exemplaires</span>
          </Link>
          <Button
            href="/configurer"
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

      {/* Méga-menu Produits (desktop) — panneau survolant type Tesla */}
      <div
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        className={cn(
          "absolute inset-x-0 top-full hidden border-t border-line bg-canvas/95 backdrop-blur-md md:block",
          "transition-[opacity,transform] duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
          menu
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="container-page grid grid-cols-2 gap-6 py-10">
          {PRODUCT_LIST.map((p) => (
            <div
              key={p.key}
              className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6"
            >
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="editorial text-2xl text-ink">{p.name}</h3>
                  <span className="font-mono text-xs text-muted">
                    {p.area} · {p.total} ex.
                  </span>
                </div>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                  {p.tagline}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href={p.slug}
                  variant="outline"
                  className="px-4 py-2 text-sm"
                  magnetic={false}
                  onClick={() => setMenu(false)}
                >
                  Découvrir
                </Button>
                <Button
                  href={`/configurer?produit=${p.key}`}
                  variant="accent"
                  className="px-4 py-2 text-sm"
                  magnetic={false}
                  onClick={() => setMenu(false)}
                >
                  Réserver
                  <Arrow />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay menu mobile */}
      <div
        className={cn(
          "overflow-hidden border-t border-line bg-canvas md:hidden",
          "transition-[max-height,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)]",
          open ? "max-h-[90vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="container-page flex flex-col gap-1 py-6">
          {/* Maisons — déplié */}
          <p className="pt-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Maisons
          </p>
          {PRODUCT_LIST.map((p) => (
            <div key={p.key} className="border-b border-line py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-medium tracking-tight">
                  {p.name}
                </span>
                <span className="font-mono text-xs text-muted">
                  {p.area} · {p.total} ex.
                </span>
              </div>
              <div className="mt-3 flex gap-3">
                <Link
                  href={p.slug}
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-line px-4 py-1.5 text-sm"
                >
                  Découvrir
                </Link>
                <Link
                  href={`/configurer?produit=${p.key}`}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-accent px-4 py-1.5 text-sm text-white"
                >
                  Réserver
                </Link>
              </div>
            </div>
          ))}

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

          <Link
            href="/mandataire"
            onClick={() => setOpen(false)}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-orange-400 px-4 py-3 text-base font-bold text-white"
          >
            Accès Mandataire
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs text-muted">
              {PRODUCT_LIST.map((p) => p.total).join(" + ")} exemplaires
            </span>
            <Button
              href="/configurer"
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
