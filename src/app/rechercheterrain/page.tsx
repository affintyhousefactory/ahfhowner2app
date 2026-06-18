import type { Metadata } from "next";
import { RechercheTerrainForm } from "@/components/site/RechercheTerrainForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Recherche personnalisée de terrain | HOWNER",
  description:
    "Vous cherchez un terrain pour poser votre Arko ? Précisez vos zones et votre budget : nous vous livrons une sélection de parcelles candidates avec données cadastrales, DVF et géorisques.",
  alternates: { canonical: "/rechercheterrain" },
  robots: { index: true, follow: true },
};

const LIVRABLES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
      </svg>
    ),
    titre: "Carte interactive",
    desc: "Parcelles candidates en mode carte et satellite — visualisez chaque bien dans son environnement immédiat.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
      </svg>
    ),
    titre: "Fiche par parcelle",
    desc: "Localisation, superficie, référence cadastrale, tarif estimé — une fiche complète par terrain candidat.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
      </svg>
    ),
    titre: "DVF — 5 ans",
    desc: "Demandes de Valeur Foncière : historique des ventes (date, montant, superficie, lots) sur les 5 dernières années.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
      </svg>
    ),
    titre: "Géorisques & PEB",
    desc: "Cartes de chaleur, zones isochrones et géorisques (inondation, sismicité, retrait-gonflement) par parcelle.",
  },
];

export default function RechercheTerrainPage() {
  return (
    <main className="pt-16 md:pt-[4.5rem]">

      {/* ── Hero ── */}
      <section className="bg-ink py-24 text-canvas md:py-36">
        <div className="container-page">
          <Reveal>
            <div className="flex items-baseline justify-between border-t border-canvas/15 pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
                Recherche personnalisée
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
                Rapport sous 48 h
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="editorial mt-12 text-pretty text-[2.4rem] leading-[1.02] text-canvas md:mt-16 md:text-[4.4rem]">
              Votre terrain idéal,<br className="hidden md:block" /> trouvé pour vous.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-canvas/70">
              Indiquez vos zones de recherche. Nous effectuons une analyse cadastrale complète et
              vous livrons un rapport détaillé : parcelles candidates, historique des ventes,
              géorisques et cartes isochrones — pour décider en connaissance de cause.
            </p>
          </Reveal>

          {/* Grille cadastrale décorative */}
          <Reveal delay={0.15}>
            <div className="mt-16 overflow-hidden rounded-2xl border border-canvas/10 bg-canvas/[0.02]">
              <CadastreSvg />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Ce que vous recevez ── */}
      <section className="bg-canvas py-20 md:py-28">
        <div className="container-page">
          <Reveal>
            <div className="rule flex items-baseline justify-between pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                Votre rapport
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                4 livrables
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="editorial mt-10 text-pretty text-[2rem] leading-[1.05] text-ink md:text-[3rem]">
              Un dossier complet pour chaque zone.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LIVRABLES.map((l, i) => (
              <Reveal key={l.titre} delay={i * 0.06}>
                <div className="rounded-2xl border border-line bg-surface p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {l.icon}
                  </span>
                  <p className="mt-4 font-medium tracking-tight text-ink">{l.titre}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{l.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Formulaire ── */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-page">
          <Reveal>
            <div className="rule flex items-baseline justify-between pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                Votre demande
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                Gratuit · sans engagement
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="editorial mt-10 text-pretty text-[2rem] leading-[1.05] text-ink md:text-[3rem]">
              Précisez vos zones de recherche.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              Jusqu'à 5 communes. Nous effectuons la recherche personnalisée et vous
              envoyons votre rapport par email sous 48 h ouvrées.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-12 max-w-2xl">
              <RechercheTerrainForm />
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}

function CadastreSvg() {
  const cells = Array.from({ length: 180 }, (_, i) => i);
  const highlighted = new Set([
    4, 5, 16, 17, 18, 28, 29, 30, 42, 43, 55, 56, 57,
    72, 85, 86, 99, 100, 112, 113, 114, 127, 140, 141,
  ]);
  const accent = new Set([17, 29, 56, 86, 100, 113]);

  return (
    <svg
      viewBox="0 0 900 260"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d141a" stopOpacity="1" />
          <stop offset="40%" stopColor="#0d141a" stopOpacity="0" />
          <stop offset="60%" stopColor="#0d141a" stopOpacity="0" />
          <stop offset="100%" stopColor="#0d141a" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Grille de parcelles */}
      {cells.map((i) => {
        const col = i % 20;
        const row = Math.floor(i / 20);
        const isHl = highlighted.has(i);
        const isAcc = accent.has(i);
        const w = 28 + (i % 7) * 4;
        const h = 22 + (i % 5) * 6;
        const x = col * 45 + 10;
        const y = row * 52 + 10;
        return (
          <rect
            key={i}
            x={x} y={y} width={w} height={h}
            rx="2"
            fill={isAcc ? "#3a5a86" : isHl ? "rgba(58,90,134,0.25)" : "rgba(255,255,255,0.04)"}
            stroke={isHl ? "rgba(58,90,134,0.5)" : "rgba(255,255,255,0.07)"}
            strokeWidth="0.5"
          />
        );
      })}

      {/* Légende */}
      <rect x="30" y="210" width="10" height="10" rx="1" fill="#3a5a86" />
      <text x="46" y="219" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="monospace">
        Parcelles candidates
      </text>
      <rect x="160" y="210" width="10" height="10" rx="1" fill="rgba(58,90,134,0.25)" stroke="rgba(58,90,134,0.5)" strokeWidth="0.5" />
      <text x="176" y="219" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="monospace">
        Zone étudiée
      </text>

      {/* Voile de fondu latéral */}
      <rect x="0" y="0" width="900" height="260" fill="url(#fade)" />
    </svg>
  );
}
