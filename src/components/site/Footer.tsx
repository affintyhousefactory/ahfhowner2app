import Link from "next/link";
import {
  BRAND,
  COMPANY,
  COMPANY_ADDRESS_LINE,
  CONTACT,
  NAV,
  INFO_NAV,
  PRODUCT_LIST,
  reserverHref,
} from "@/lib/site";
import { pagesDeFamille } from "@/lib/pages/registry";
import { FEATURES } from "@/lib/features";

export function Footer() {
  const usages = pagesDeFamille("usage");
  return (
    <footer className="bg-ink text-canvas">
      <div className="container-page">
        {/* Carte de fin éditoriale */}
        <div className="flex flex-col gap-10 py-20 md:py-28">
          <div className="flex items-baseline justify-between border-b border-canvas/15 pb-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
              {BRAND.madeIn}
            </span>
            <Link
              href={reserverHref()}
              className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55 transition-colors hover:text-canvas"
            >
              Réserver →
            </Link>
          </div>

          {/* Typo décorative de fin de page : reprend mot pour mot le <h1> du
              Hero. En <h2> elle dupliquait le titre principal dans le plan. */}
          <p className="editorial text-balance text-[3rem] leading-[0.98] text-canvas md:text-[7rem]">
            {BRAND.baseline}
          </p>
        </div>

        {/* Colonnes */}
        <div className="grid gap-10 border-t border-canvas/15 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-medium tracking-tight text-canvas">
                {BRAND.maker}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-canvas/60">
              Deux studios de jardin d'architecte, conçus avec notre architecte
              intégrée et livrés prêts à vivre. Fabriqués au Pays-Basque.
            </p>
          </div>

          <nav className="flex flex-col gap-2.5">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
              Modèles & parcours
            </p>
            {PRODUCT_LIST.map((p) => (
              <Link
                key={p.key}
                href={p.slug}
                className="text-sm text-canvas/65 transition-colors hover:text-canvas"
              >
                {p.name}
              </Link>
            ))}
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-sm text-canvas/65 transition-colors hover:text-canvas"
              >
                {n.label}
              </Link>
            ))}
            {/* Recherche terrain + Accès Mandataire — masqués tant que le
                domaine mandataire est suspendu (ADR-028). */}
            {FEATURES.mandataire && (
              <>
                <Link
                  href="/rechercheterrain"
                  className="text-sm text-canvas/65 transition-colors hover:text-canvas"
                >
                  Recherche terrain
                </Link>
                <Link
                  href="/mandataire"
                  className="text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300"
                >
                  Accès Mandataire
                </Link>
              </>
            )}
          </nav>

          {/* Usages — dérivée du registre (ADR-038). Le pied de page est servi
              sur toutes les pages publiques : c'est ce qui donne à chaque page
              éditoriale un lien entrant depuis l'ensemble du site. Sans lui,
              une page au sitemap mais sans lien entrant est orpheline, et un
              moteur la traite comme telle.

              La colonne ne rend rien tant qu'aucune page d'usage n'est
              publiée, et s'étoffe d'elle-même à chaque lot mis en ligne. */}
          {usages.length > 0 && (
            <nav className="flex flex-col gap-2.5">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
                Usages
              </p>
              {usages.map((u) => (
                <Link
                  key={u.route}
                  href={u.route}
                  className="text-sm text-canvas/65 transition-colors hover:text-canvas"
                >
                  {u.libelle}
                </Link>
              ))}
            </nav>
          )}

          <nav className="flex flex-col gap-2.5">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
              Informations
            </p>
            {INFO_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-sm text-canvas/65 transition-colors hover:text-canvas"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Identification & contact (NAP) — nom, adresse, téléphone.
            <address> et non <div> : l'élément désigne précisément les
            coordonnées de l'entité à qui appartient le document, ce que
            lisent les moteurs comme les lecteurs d'écran. Il est en italique
            par défaut, d'où `not-italic`.

            Rendu sur **toutes** les pages publiques, le pied de page étant
            porté par le layout `(public)` : c'est aussi la bonne pratique NAP
            — une adresse qui n'apparaît que sur l'accueil affaiblit le signal.

            Aucune valeur écrite ici : `COMPANY` et `CONTACT` (site.ts) sont
            les sources, les mêmes que celles dont dérive le JSON-LD
            `Organization`. Le numéro reste surchargeable par
            `NEXT_PUBLIC_CONTACT_PHONE`.

            `PhoneLink` n'est pas réutilisé : il est stylé pour fond clair
            (`text-ink/70`, infobulle sombre) et serait illisible ici. */}
        <address className="flex flex-col gap-x-3 gap-y-2 border-t border-canvas/15 py-6 text-center not-italic sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/75">
            {COMPANY.displayName}
          </span>
          <span aria-hidden="true" className="hidden text-canvas/25 sm:inline">
            ·
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
            {COMPANY_ADDRESS_LINE}
          </span>
          <span aria-hidden="true" className="hidden text-canvas/25 sm:inline">
            ·
          </span>
          {/* Numéro cliquable : sur mobile c'est le geste le plus court, et un
              `tel:` est le format que les moteurs rattachent à la fiche. */}
          <a
            href={`tel:${CONTACT.phoneTel}`}
            aria-label={`${CONTACT.phoneLabel} au ${CONTACT.phone}`}
            className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/75 underline decoration-canvas/25 underline-offset-4 transition-colors hover:text-canvas hover:decoration-canvas/60"
          >
            Tél. : {CONTACT.phone}
          </a>
        </address>

        <p className="border-t border-canvas/15 py-6 text-center font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
          {BRAND.maker} · Arko One · Arko Max · {BRAND.madeIn} — Conçu avec
          notre architecte intégrée
        </p>

        <div className="flex flex-col gap-3 border-t border-canvas/15 py-7 text-xs text-canvas/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.maker}. Tous droits réservés.</p>
          <p className="font-mono">Renders d'intention — visuels non contractuels.</p>
        </div>
      </div>
    </footer>
  );
}
