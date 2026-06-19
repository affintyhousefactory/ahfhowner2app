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

      {/* ── Hero + Livrables fusionnés ── */}
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

          {/* Card hero : texte à gauche, illustration à droite */}
          <Reveal delay={0.05}>
            <div className="mt-12 flex flex-col overflow-hidden rounded-2xl border border-canvas/10 bg-canvas/[0.02] lg:flex-row md:mt-16">
              {/* Texte */}
              <div className="flex flex-col justify-center p-8 md:p-12 lg:flex-1">
                <h1 className="editorial text-pretty text-[2.4rem] leading-[1.02] text-canvas md:text-[4rem]">
                  Votre terrain idéal,<br className="hidden md:block" /> trouvé pour vous.
                </h1>
                <p className="mt-6 text-[1.05rem] leading-relaxed text-canvas/70">
                  Indiquez vos zones de recherche. Nous effectuons une analyse cadastrale
                  complète et vous livrons un rapport détaillé : parcelles candidates,
                  historique des ventes, géorisques et cartes isochrones — pour décider
                  en connaissance de cause.
                </p>
              </div>
              {/* Illustration */}
              <div className="w-full shrink-0 border-t border-canvas/10 lg:w-[460px] lg:border-t-0 lg:border-l overflow-hidden">
                <ZoneRechercheSvg />
              </div>
            </div>
          </Reveal>

          {/* Livrables */}
          <Reveal delay={0.18}>
            <div className="mt-20 flex items-baseline justify-between border-t border-canvas/15 pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
                Votre rapport
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
                4 livrables
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <h2 className="editorial mt-10 text-pretty text-[2rem] leading-[1.05] text-canvas md:text-[3rem]">
              Un dossier complet.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LIVRABLES.map((l, i) => (
              <Reveal key={l.titre} delay={0.22 + i * 0.06}>
                <div className="rounded-2xl border border-canvas/10 bg-canvas/[0.04] p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                    {l.icon}
                  </span>
                  <p className="mt-4 font-medium tracking-tight text-canvas">{l.titre}</p>
                  <p className="mt-2 text-sm leading-relaxed text-canvas/60">{l.desc}</p>
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
            <div className="mt-12">
              <RechercheTerrainForm />
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}

function ZoneRechercheSvg() {
  const cx = 450;
  const cy = 148;

  type ParcelleType = "candidate" | "zone" | "dim" | "dimplus";

  const parcelles: [number, number, number, number, ParcelleType][] = [
    // Inside zone — candidates
    [376, 96,  36, 26, "candidate"],
    [428, 84,  28, 20, "candidate"],
    [492, 114, 32, 24, "candidate"],
    [472, 162, 30, 22, "candidate"],
    [396, 196, 34, 22, "candidate"],
    // Inside zone — zone
    [354, 136, 44, 30, "zone"],
    [418, 166, 38, 26, "zone"],
    [500, 178, 34, 26, "zone"],
    [336, 168, 28, 22, "dimplus"],
    // Outside — dim
    [190, 74,  40, 28, "dim"],
    [252, 56,  32, 22, "dim"],
    [274, 106, 44, 28, "dim"],
    [214, 146, 36, 30, "dim"],
    [154, 126, 28, 20, "dim"],
    [236, 188, 34, 26, "dim"],
    [298, 208, 40, 26, "dim"],
    [158, 200, 36, 26, "dim"],
    [110, 96,  36, 26, "dim"],
    [80,  160, 28, 22, "dim"],
    [620, 74,  38, 28, "dim"],
    [680, 56,  32, 22, "dim"],
    [664, 108, 44, 26, "dim"],
    [706, 148, 36, 30, "dim"],
    [744, 124, 28, 20, "dim"],
    [622, 188, 34, 26, "dim"],
    [682, 208, 40, 26, "dim"],
    [762, 196, 36, 26, "dim"],
    [800, 88,  36, 26, "dim"],
    [852, 148, 28, 22, "dim"],
    [520, 228, 36, 22, "dim"],
    [400, 238, 44, 26, "dim"],
    [318, 228, 32, 20, "dim"],
  ];

  const fillColor = (t: ParcelleType) => {
    if (t === "candidate") return "#3a5a86";
    if (t === "zone")      return "rgba(58,90,134,0.28)";
    if (t === "dimplus")   return "rgba(255,255,255,0.08)";
    return "rgba(255,255,255,0.04)";
  };
  const strokeColor = (t: ParcelleType) => {
    if (t === "candidate") return "rgba(58,90,134,0.8)";
    if (t === "zone")      return "rgba(58,90,134,0.45)";
    if (t === "dimplus")   return "rgba(255,255,255,0.12)";
    return "rgba(255,255,255,0.07)";
  };

  return (
    <svg
      viewBox="0 0 900 290"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="zr-fadeH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0d141a" stopOpacity="1" />
          <stop offset="16%"  stopColor="#0d141a" stopOpacity="0" />
          <stop offset="84%"  stopColor="#0d141a" stopOpacity="0" />
          <stop offset="100%" stopColor="#0d141a" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="zr-fadeV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0d141a" stopOpacity="0.75" />
          <stop offset="18%"  stopColor="#0d141a" stopOpacity="0" />
          <stop offset="82%"  stopColor="#0d141a" stopOpacity="0" />
          <stop offset="100%" stopColor="#0d141a" stopOpacity="0.75" />
        </linearGradient>
        <radialGradient id="zr-zoneFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#3a5a86" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#3a5a86" stopOpacity="0.03" />
        </radialGradient>
        <radialGradient id="zr-pinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#3a5a86" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3a5a86" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dot grid */}
      {Array.from({ length: 19 }, (_, row) =>
        Array.from({ length: 57 }, (_, col) => (
          <circle
            key={`d${row}-${col}`}
            cx={col * 16 + 8}
            cy={row * 16 + 8}
            r="0.55"
            fill="rgba(255,255,255,0.055)"
          />
        ))
      )}

      {/* Parcelles */}
      {parcelles.map(([x, y, w, h, t], i) => (
        <rect
          key={i}
          x={x} y={y} width={w} height={h}
          rx="2"
          fill={fillColor(t)}
          stroke={strokeColor(t)}
          strokeWidth="0.5"
        />
      ))}

      {/* Outer pulse rings */}
      <circle cx={cx} cy={cy} r="152" fill="none" stroke="rgba(58,90,134,0.07)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="122" fill="none" stroke="rgba(58,90,134,0.11)" strokeWidth="0.75" />

      {/* Search zone circle */}
      <circle
        cx={cx} cy={cy} r="96"
        fill="url(#zr-zoneFill)"
        stroke="#3a5a86"
        strokeWidth="1.5"
        strokeDasharray="9 5"
      />

      {/* Pin glow */}
      <ellipse cx={cx} cy={cy - 52} rx="38" ry="38" fill="url(#zr-pinGlow)" />

      {/* Location pin — tip at (cx, cy+10), circle center at (cx, cy-52) r=26 */}
      {/* Pin body */}
      <path
        d={`M${cx} ${cy + 10} C${cx - 10} ${cy - 2} ${cx - 26} ${cy - 32} ${cx - 26} ${cy - 52} A26 26 0 1 1 ${cx + 26} ${cy - 52} C${cx + 26} ${cy - 32} ${cx + 10} ${cy - 2} ${cx} ${cy + 10} Z`}
        fill="#3a5a86"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
      />

      {/* House inside pin (center at cx, cy-52) */}
      {/* Roof */}
      <path
        d={`M${cx} ${cy - 68} L${cx - 14} ${cy - 56} L${cx + 14} ${cy - 56} Z`}
        fill="rgba(255,255,255,0.92)"
      />
      {/* Body */}
      <rect
        x={cx - 10} y={cy - 56}
        width="20" height="14"
        rx="0.5"
        fill="rgba(255,255,255,0.92)"
      />
      {/* Door */}
      <rect
        x={cx - 4} y={cy - 48}
        width="8" height="6"
        rx="0.5"
        fill="#3a5a86"
      />
      {/* Window left */}
      <rect
        x={cx - 8} y={cy - 54}
        width="4" height="4"
        rx="0.5"
        fill="rgba(255,255,255,0.4)"
      />
      {/* Window right */}
      <rect
        x={cx + 4} y={cy - 54}
        width="4" height="4"
        rx="0.5"
        fill="rgba(255,255,255,0.4)"
      />

      {/* Legend */}
      <rect x="332" y="262" width="10" height="10" rx="1" fill="#3a5a86" />
      <text x="348" y="271" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">
        Parcelles candidates
      </text>
      <rect
        x="462" y="262" width="10" height="10" rx="1"
        fill="rgba(58,90,134,0.28)"
        stroke="rgba(58,90,134,0.5)"
        strokeWidth="0.5"
      />
      <text x="478" y="271" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">
        Zone étudiée
      </text>

      {/* Horizontal fade */}
      <rect x="0" y="0" width="900" height="290" fill="url(#zr-fadeH)" />
      {/* Vertical fade */}
      <rect x="0" y="0" width="900" height="290" fill="url(#zr-fadeV)" />
    </svg>
  );
}
