import type { Metadata } from "next";
import Image from "next/image";
import { RechercheTerrainForm } from "@/components/site/RechercheTerrainForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Recherche de terrain personnalisée | Réseau Affinity · HOWNER",
  description:
    "Affinity vous met en relation avec un professionnel terrain spécialisé : terrains atypiques et résilients, PLU analysé, géorisques vérifiés. Dossier complet livré sous 48 h.",
  alternates: { canonical: "/rechercheterrain" },
  robots: { index: true, follow: true },
};

const ECUEILS = [
  {
    poste: "Étude géotechnique G2",
    responsable: "Client",
    detail: null,
    estimation: "dès 2 400 €",
  },
  {
    poste: "Micro-pieux (fourniture + pose)",
    responsable: "Client",
    detail: null,
    estimation: "selon étude",
  },
  {
    poste: "Raccordement eau potable",
    responsable: "Client",
    detail: null,
    estimation: "selon commune",
  },
  {
    poste: "Raccordement électricité (ENEDIS)",
    responsable: "Client",
    detail: null,
    estimation: "selon distance",
  },
  {
    poste: "Assainissement non collectif (micro-station)",
    responsable: "Client",
    detail: null,
    estimation: "dès 9 000 €",
  },
  {
    poste: "Terrassement et accès grue",
    responsable: "Client",
    detail: null,
    estimation: "sur étude",
  },
  {
    poste: "Permis de construire / DP",
    responsable: "Client",
    detail: "accompagnement AHF",
    estimation: "honoraires archi + taxe commune",
  },
  {
    poste: "Assurance dommages-ouvrage",
    responsable: "Client",
    detail: "obligatoire",
    estimation: "selon assureur",
  },
];

const LIVRABLES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
      </svg>
    ),
    titre: "Carte & parcelles candidates",
    desc: "Visualisation satellite et cadastrale de chaque terrain identifié dans vos zones — superficie, référence, localisation.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" fill="currentColor"/>
      </svg>
    ),
    titre: "Analyse PLU & constructibilité",
    desc: "Zonage (U, AU, A, N), STECAL et compatibilité confirmée avec les habitats légers, résilients et les nouvelles économies résidentielles.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z" fill="currentColor"/>
      </svg>
    ),
    titre: "DVF & valorisation foncière",
    desc: "Historique des ventes sur 5 ans (date, montant, lots) et dynamique de valorisation du foncier dans la zone étudiée.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>
      </svg>
    ),
    titre: "Note de qualification terrain",
    desc: "Synthèse experte du professionnel affilié Affinity : faisabilité, géorisques, pistes off-market et recommandation d'acquisition.",
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
                  Nous identifions les terrains adaptés à votre projet avec l'aide d'un
                  partenaire mandataire immobilier&nbsp;— y compris off-market&nbsp;—
                  et nous les qualifions en profondeur&nbsp;: constructibilité PLU,
                  compatibilité habitat léger, DVF et sécurisation juridique.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-canvas/50">
                  Précisez vos zones et votre budget. Votre dossier vous parvient par
                  email sous 48 h ouvrées.
                </p>
              </div>
              {/* Illustration */}
              <div className="relative w-full shrink-0 overflow-hidden border-t border-canvas/10 lg:w-[460px] lg:border-t-0 lg:border-l">
                <Image
                  src="/terrain-affinity.png"
                  alt="Recherche terrain — professionnel affilié Affinity"
                  width={920}
                  height={580}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </Reveal>

          {/* Mandataire strip */}
          <Reveal delay={0.12}>
            <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-accent/20 bg-accent/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-[0.7rem] font-semibold tracking-wider text-accent">
                  AF
                </span>
                <div>
                  <p className="text-sm font-medium text-canvas">Réseau Affinity - Partenaires affiliés</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-canvas/50">
                    Professionnel terrain spécialisé : parcelles atypiques, résilientes et nouvelles économies résidentielles
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Off-market", "PLU & STECAL", "DVF & valorisation", "Sécurisation juridique"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-canvas/15 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-canvas/45"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Livrables */}
          <Reveal delay={0.18}>
            <div className="mt-20 flex items-baseline justify-between border-t border-canvas/15 pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
                Votre dossier
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
                4 livrables experts
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <h2 className="editorial mt-10 text-pretty text-[2rem] leading-[1.05] text-canvas md:text-[2.6rem]">
              Un dossier complet constitué par un professionnel spécialisé dans l'habitat léger.
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

      {/* ── Écueils terrain ── */}
      <section className="bg-canvas py-20 md:py-28">
        <div className="container-page">
          <Reveal>
            <div className="rule flex items-baseline justify-between pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                Avant d'acheter
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                Travaux réservés au client
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="editorial mt-10 text-pretty text-[2rem] leading-[1.05] text-ink md:text-[3rem]">
              Votre terrain peut‑il accueillir un Arko&nbsp;?
            </h2>
            <p className="mt-6 text-[1.1rem] leading-relaxed text-muted md:text-[1.25rem]">
              Certains postes sont systématiquement à la charge du client, indépendamment de la construction.
              Les identifier avant l'achat évite les mauvaises surprises&nbsp;— c'est précisément ce que
              qualifie notre dossier terrain.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl border border-line">
              {/* En-tête */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-line bg-surface px-6 py-3 sm:grid-cols-[1fr_160px_200px]">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">Poste</span>
                <span className="hidden font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted sm:block">Responsable</span>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted text-right">Estimation indicative</span>
              </div>

              {/* Lignes */}
              {ECUEILS.map((row, i) => (
                <div
                  key={row.poste}
                  className={`grid grid-cols-[1fr_auto] gap-x-6 px-6 py-4 sm:grid-cols-[1fr_160px_200px] ${
                    i < ECUEILS.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-col justify-center gap-0.5">
                    <span className="text-sm font-medium leading-snug text-ink">{row.poste}</span>
                    {row.detail && (
                      <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-accent">
                        {row.detail}
                      </span>
                    )}
                  </div>
                  <span className="hidden items-center font-mono text-[0.75rem] text-muted sm:flex">
                    {row.responsable}
                  </span>
                  <span className="flex items-center justify-end font-mono text-[0.8rem] font-medium text-ink">
                    {row.estimation}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-6 rounded-xl border border-accent/20 bg-accent/[0.04] px-5 py-4 text-sm leading-relaxed text-muted">
              <span className="font-medium text-ink">Notre dossier terrain anticipe ces postes&nbsp;:</span>{" "}
              géotechnique, raccordements, assainissement et accès sont qualifiés par notre partenaire avant
              que vous n'engagiez la moindre dépense.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Formulaire ── */}
      <section className="bg-surface pt-12 pb-20 md:pt-14 md:pb-28">
        <div className="container-page">
          <Reveal>
            <div className="rule flex items-baseline justify-between pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                Votre demande
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                À partir de 4 900 € TTC
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="editorial mt-10 text-pretty text-[2rem] leading-[1.05] text-ink md:text-[3rem]">
              Choisissez Votre Pack Terrain.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Sélectionnez l'échelle de recherche adaptée à votre projet. Un conseiller AHF vous contacte sous 48 h ouvrées pour confirmer la mission et organiser le démarrage.
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
