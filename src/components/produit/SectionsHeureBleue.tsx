import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { reserverHref, type ProductKey } from "@/lib/site";
import { contenuProduit, numerosLibres } from "@/lib/produits/heure-bleue";
import { Button, Arrow } from "@/components/ui/Button";
import { BandeVisite } from "./BandeVisite";

/**
 * Corps des pages produit — direction « Heure bleue » (ADR-040).
 *
 * Tout est **composant serveur** : ces sections ne portent aucun état. Le
 * mouvement d'entrée vient de `Reveal`, dont l'état masqué vit dans le CSS et
 * non en style inline — le HTML servi reste donc lisible, et indexable, sans JS.
 *
 * Seuls quatre îlots sont clients, chacun pour une raison précise : le hero
 * (orchestration), les chiffres (compteur), la barre d'action mobile
 * (révélation au défilement) et la bande de visite (commandes de bureau et
 * état début/fin de course).
 */

/* ── Bandeau de série ─────────────────────────────────────────────────── */

export function BandeauSerie({ produit }: { produit: ProductKey }) {
  const libres = numerosLibres(produit);
  /* ⚠ Le pool est **commun** aux deux modèles : ce n'est pas 6 + 6. Les deux
     pages annoncent donc le même compte — exact, et assumé (2026-08-25). */
  const total = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div className="border-b border-white/[.06] bg-[#141c21]">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#7d8b95]">
          Édition Arko — 6 unités
        </span>
        <ul className="flex items-center gap-2">
          {total.map((n) => (
            <li
              key={n}
              className="inline-flex h-11 w-11 items-center justify-center border border-[#e8c9a0]/[.34] font-display text-[0.8rem] text-[#e8c9a0] md:h-9 md:w-9"
            >
              {String(n).padStart(2, "0")}
            </li>
          ))}
        </ul>
        <span className="text-sm text-[#93a1ab]">
          {libres} numéro{libres > 1 ? "s" : ""} encore libre{libres > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

/* ── La tension ───────────────────────────────────────────────────────── */

export function SectionTension({ produit }: { produit: ProductKey }) {
  const { tension } = contenuProduit(produit);
  return (
    <section className="border-b border-white/[.06]">
      <Reveal className="container-page grid gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
        <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] font-normal leading-[1.12] tracking-[-0.025em] text-[#f4f6f8]">
          {tension.titre}
        </h2>
        <div className="flex flex-col gap-5 text-[1.0625rem] font-light leading-relaxed text-[#a9b5be]">
          {tension.paragraphes.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ── Trois étapes ─────────────────────────────────────────────────────── */

export function SectionEtapes({ produit }: { produit: ProductKey }) {
  const { etapes } = contenuProduit(produit);
  return (
    <section className="border-b border-white/[.06]">
      <Reveal className="container-page py-20 md:py-24">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#e8c9a0]">
          Comment ça se passe
        </p>
        <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.35rem)] font-normal tracking-[-0.02em] text-[#f4f6f8]">
          Trois étapes, aucun chantier chez vous.
        </h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-11">
          {etapes.map((e) => (
            <li key={e.n} className="flex flex-col gap-4">
              <span aria-hidden className="h-px w-full bg-[#e8c9a0]" />
              <span className="font-display text-[0.8rem] tracking-[0.2em] text-[#e8c9a0]">
                {e.n}
              </span>
              <h3 className="font-display text-[1.3rem] font-normal leading-tight text-[#f4f6f8]">
                {e.titre}
              </h3>
              <p className="text-[0.95rem] leading-relaxed text-[#94a2ac]">{e.texte}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}

/* ── La visite ────────────────────────────────────────────────────────── */

export function SectionVisite({ produit }: { produit: ProductKey }) {
  const { visite } = contenuProduit(produit);
  /* Le rail est un îlot client : il porte les commandes de bureau et l'état
     début/fin de course. Le reste de la page n'a pas d'état à tenir. */
  return (
    <section className="border-t border-white/[.06] py-20 md:py-24">
      <Reveal>
        <BandeVisite titre={visite.titre} vues={visite.vues} />
      </Reveal>
    </section>
  );
}

/* ── L'atelier ────────────────────────────────────────────────────────── */

export function SectionAtelier({ produit }: { produit: ProductKey }) {
  const { atelier } = contenuProduit(produit);
  return (
    <section className="grid border-t border-white/[.06] md:grid-cols-[1.05fr_1fr]">
      <Reveal className="flex flex-col justify-center gap-6 px-[clamp(1.25rem,4vw,4rem)] py-20 md:py-24">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#e8c9a0]">
          L&apos;atelier
        </p>
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.35rem)] font-normal leading-[1.14] tracking-[-0.025em] text-[#f4f6f8]">
          {atelier.titre[0]}
          <br className="hidden md:inline" /> {atelier.titre[1]}
        </h2>
        <p className="max-w-[46ch] text-base font-light leading-relaxed text-[#a9b5be]">
          {atelier.texte}
        </p>
        <Link
          href="/a-propos#acier-leger"
          className="mt-1 inline-flex items-center gap-2.5 self-start border-b border-[#e8c9a0]/50 pb-1.5 text-sm text-[#e8c9a0] transition-colors hover:border-[#e8c9a0]"
        >
          Comment nous fabriquons
          <Arrow />
        </Link>
      </Reveal>
      <Image
        src={atelier.image.src}
        alt={atelier.image.alt}
        width={2000}
        height={1116}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="h-64 w-full object-cover brightness-[.86] saturate-[1.05] md:h-full md:min-h-[28rem]"
      />
    </section>
  );
}

/* ── Ce qui reste ─────────────────────────────────────────────────────── */

export function SectionDurable({ produit }: { produit: ProductKey }) {
  const { durable } = contenuProduit(produit);
  return (
    <section className="border-t border-white/[.06]">
      <Reveal className="container-page py-20 md:py-24">
        <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3 pb-11">
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.35rem)] font-normal tracking-[-0.02em] text-[#f4f6f8]">
            {durable.titre}
          </h2>
          <span className="text-sm text-[#7d8b95]">Quatre faits, pas quatre promesses</span>
        </div>
        <ul className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {durable.faits.map((f) => (
            <li key={f.titre} className="flex flex-col gap-3">
              <Goutte />
              <span className="font-display text-base text-[#f4f6f8]">{f.titre}</span>
              <p className="text-[0.88rem] leading-relaxed text-[#94a2ac]">{f.texte}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/* ── Clôture ──────────────────────────────────────────────────────────── */

export function SectionCloture({ produit }: { produit: ProductKey }) {
  const { cloture } = contenuProduit(produit);
  return (
    <section className="border-t border-white/[.06] bg-[#141c21]">
      <Reveal className="container-page py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-2 md:items-end md:gap-16">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[#f7f9fa]">
              {cloture.titre[0]}
              <br />
              {cloture.titre[1]}
            </h2>
            <p className="max-w-[42ch] text-base font-light leading-relaxed text-[#a9b5be]">
              {cloture.texte}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <Button href={reserverHref(produit)} variant="lumiere">
              Configurer mon {produit === "one" ? "Arko One" : "Arko Max"}
              <Arrow />
            </Button>
            <span className="text-sm text-[#7d8b95]">
              Sans rendez-vous · prix affiché à chaque choix
            </span>
          </div>
        </div>

        <div className="mt-16 flex items-center gap-5">
          <span aria-hidden className="h-px flex-grow bg-white/[.09]" />
          <span className="text-center font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#6f7d87]">
            Dessiné par notre architecte intégrée · Fabriqué au Pays-Basque
          </span>
        </div>
      </Reveal>
    </section>
  );
}

function Goutte() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#e8c9a0"
      strokeWidth="1.2"
      aria-hidden
    >
      <path
        d="M12 21c-4.5-2.6-7-6.1-7-9.7A7 7 0 0 1 12 4a7 7 0 0 1 7 7.3c0 3.6-2.5 7.1-7 9.7Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
