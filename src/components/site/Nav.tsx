"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NAV, BRAND, PRODUCT_LIST, SERIE_COUNT, SERIE_TOTAL, reserverHref } from "@/lib/site";
import { Button, Arrow } from "@/components/ui/Button";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { cn } from "@/shared/lib/cn";

export function Nav() {
  const [open, setOpen] = useState(false); // burger mobile
  const [menu, setMenu] = useState(false); // méga-menu Produits (desktop)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      /* Positionnement : la barre n'est plus fixée elle-même. Elle est
         empilée sous le bandeau de compte à rebours dans la barre d'en-tête du
         layout `(public)`, seule à être `fixed`.

         Motif — la Nav portait `top-8`, une réserve de 2 rem pour le bandeau.
         Ce bandeau **disparaît quand la série est échue** (`done` →
         `return null`, échéance du 2026-07-17 dépassée) : la réserve, elle,
         restait, et laissait défiler le contenu de la page dans une bande vide
         au-dessus du menu. Deux composants devaient s'accorder sur un chiffre,
         et l'un des deux pouvait s'effacer sans prévenir l'autre.

         Empilés, ils n'ont plus rien à s'accorder : le bandeau présent pousse
         le menu, absent il ne pousse rien. Aucune valeur à maintenir, et pas
         de saut au chargement — ce qu'une correction pilotée par `done` aurait
         produit, `done` étant faux au rendu serveur.

         Fond clair **en permanence** — décision de Richard, 2026-08-20.
         La barre était transparente tant que la page n'avait pas défilé de
         24 px, et ne prenait son fond clair qu'ensuite. Le parti tenait tant
         que toutes les pages ouvraient sur un fond clair : l'accueil et les
         pages produit posent leur hero sur `canvas`.

         Les pages éditoriales d'ADR-038 ouvrent sur un hero `ink`. Sur fond
         sombre, une barre transparente laissait ses libellés en `text-ink/70`
         — du texte sombre sur du sombre : le nom de la marque, « Nos Studios »,
         « À propos » et « Contact » étaient purement invisibles au chargement,
         et ne réapparaissaient qu'au défilement.

         Corrigé à la source plutôt que page par page : la barre ne dépend plus
         de ce qu'il y a derrière elle. C'est aussi ce qui évite que la prochaine
         page à hero sombre reproduise le défaut. */
      className="relative border-b border-line bg-canvas/80 backdrop-blur-md transition-all duration-500"
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
              Nos Studios
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
        </div>

        <div className="flex items-center gap-4">
          {/* Ligne d'appel — visible à toutes les largeurs, y compris à côté
              du burger : sur mobile, appeler est le geste le plus direct. Le
              numéro n'apparaît qu'à partir de `lg`, où la barre a la place. */}
          <PhoneLink />

          {/* Compteur de rareté — deux séries, pool commun de 12 numéros */}
          <Link
            href={reserverHref()}
            aria-label={`${SERIE_COUNT} séries, ${SERIE_TOTAL} exemplaires au total — Arko One + Arko Max`}
            className="hidden items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-ink sm:flex"
          >
            <span className="h-2 w-2 rounded-full bg-accent" />
            {SERIE_COUNT}
            <span className="text-muted/70">séries</span>
            <span className="text-muted/40">·</span>
            {SERIE_TOTAL}
            <span className="text-muted/70">exemplaires</span>
          </Link>
          <Button
            href={reserverHref()}
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
                  {/* Libellé de menu, pas un titre de contenu : un <h3> ici
                      précèderait le <h1> de la page et casserait le plan. */}
                  <p className="editorial text-2xl text-ink">{p.name}</p>
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
                {/* Entrée dans le tunnel v2 : le studio choisi ici est
                    présélectionné côté serveur (ADR-030). */}
                <Button
                  href={reserverHref(p.key)}
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
          {/* Nos Studios — déplié */}
          <p className="pt-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Nos Studios
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
                  href={reserverHref(p.key)}
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

          {/* Numéro en clair dans le menu déplié : sur écran tactile
              l'infobulle ne se déclenche jamais, l'icône seule de la barre ne
              dit donc pas quel numéro on appelle. */}
          <PhoneLink full className="mt-5 self-start" />

          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs text-muted">
              {SERIE_COUNT} séries · {SERIE_TOTAL} exemplaires
            </span>
            <Button
              href={reserverHref()}
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
