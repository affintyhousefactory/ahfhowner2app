"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { PRICING } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useConfig, eur } from "./config-store";

type Branch = "have" | "search";
type Phase = "idle" | "loading" | "done" | "error";
type Feu = "green" | "amber" | "red";

// Origine livraison : Bayonne (lat, lon)
const BAYONNE = { lat: 43.4929, lon: -1.4748 };

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const STEPS = [
  "Localisation de l'adresse (BAN)",
  "Calcul de la distance de livraison",
  "Repérage de la commune",
  "Zonage & constructibilité — confirmés avec l'architecte",
];

type Result = {
  feu: Feu;
  title: string;
  label: string;
  km: number | null;
  delivery: number | null;
  zone: string;
  note: string;
};

export function LandTool() {
  const c = useConfig();
  const [branch, setBranch] = useState<Branch>("have");
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  async function analyse() {
    if (!value.trim()) return;
    setPhase("loading");
    setStep(0);
    setResult(null);

    // animation des étapes
    const tick = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length)), 600);

    try {
      // Géocodage BAN (réel, public, sans clé)
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=1`,
      );
      const data = await res.json();
      const f = data?.features?.[0];
      clearInterval(tick);
      setStep(STEPS.length);

      if (!f) {
        setResult({
          feu: "red",
          title: "Adresse introuvable",
          label: value,
          km: null,
          delivery: null,
          zone: "—",
          note: "Précisez l'adresse (numéro, rue, commune) pour la pré-analyse.",
        });
        setPhase("done");
        return;
      }

      const [lon, lat] = f.geometry.coordinates as [number, number];
      const p = f.properties as {
        label: string;
        type: string;
        score: number;
        city?: string;
        postcode?: string;
      };
      const km = Math.round(haversineKm(BAYONNE.lat, BAYONNE.lon, lat, lon) * 1.3);
      const delivery = Math.round(
        PRICING.delivery.grutage + km * PRICING.delivery.perKm,
      );

      // Distance -> auto-remplit le champ km du devis
      c.setDistanceKm(km);

      // Honnêteté : tant que le zonage réel (GPU/IGN) n'est pas branché, on ne
      // délivre AUCUN feu vert « constructible ». La distance est réelle ; la
      // constructibilité reste explicitement à confirmer avec l'architecte.
      const precise = p.type === "housenumber" || p.type === "street";

      setResult({
        feu: "amber",
        title: "Distance estimée",
        label: p.label,
        km,
        delivery,
        zone: "Constructibilité à confirmer avec notre architecte intégrée.",
        note: precise
          ? "Le zonage (U/AU vs A/N), l'ABF/SPR et les servitudes sont vérifiés avec vous avant tout engagement."
          : "Adresse localisée au niveau commune — précisez la parcelle pour affiner la distance.",
      });
      setPhase("done");
    } catch {
      clearInterval(tick);
      setPhase("done");
      setResult({
        feu: "amber",
        title: "Service indisponible",
        label: value,
        km: null,
        delivery: null,
        zone: "Service de géocodage indisponible.",
        note: "Réessayez, ou réservons une visio de 30 min pour étudier votre terrain.",
      });
    }
  }

  return (
    <section id="terrain" className="bg-ink py-24 text-canvas md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="flex items-baseline justify-between border-t border-canvas/15 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
              008 — Votre terrain
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
              Pré-analyse
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="editorial mt-12 text-[2.4rem] leading-[1.02] text-canvas md:mt-16 md:whitespace-nowrap md:text-[3rem]">
            Votre terrain peut&#x2011;il accueillir un Arko&nbsp;?
          </h1>
        </Reveal>

        {/* Branches */}
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap gap-2">
            {(
              [
                ["have", "J'ai un terrain"],
                ["search", "Je cherche un terrain"],
              ] as [Branch, string][]
            ).map(([b, label]) => (
              <button
                key={b}
                onClick={() => {
                  setBranch(b);
                  setPhase("idle");
                  setResult(null);
                }}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm transition-colors",
                  branch === b
                    ? "bg-canvas text-ink"
                    : "border border-canvas/25 text-canvas/65 hover:text-canvas",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 rounded-2xl border border-canvas/15 bg-canvas/[0.03] p-6 md:p-8">
          {branch === "have" ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setPhase("idle");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && analyse()}
                  placeholder="12 chemin des Pins, 33000 Bordeaux"
                  className="w-full rounded-full border border-canvas/20 bg-transparent px-5 py-3.5 text-sm text-canvas placeholder:text-canvas/35 outline-none focus:border-canvas/50"
                />
                <Button onClick={analyse} variant="accent" className="shrink-0 whitespace-nowrap">
                  Pré&#x2011;analyser
                  <Arrow />
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {phase === "loading" && (
                  <motion.ul
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 space-y-2.5"
                  >
                    {STEPS.map((s, i) => (
                      <li
                        key={s}
                        className={cn(
                          "flex items-center gap-3 font-mono text-xs transition-colors",
                          i < step ? "text-canvas" : "text-canvas/35",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border",
                            i < step ? "border-accent bg-accent text-ink" : "border-canvas/25",
                          )}
                        >
                          {i < step && (
                            <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8.5l3 3L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {s}
                      </li>
                    ))}
                  </motion.ul>
                )}

                {phase === "done" && result && (
                  <ResultPanel result={result} />
                )}
              </AnimatePresence>
            </>
          ) : (
            <SearchBranch />
          )}

          <p className="mt-5 font-mono text-[0.68rem] leading-relaxed text-canvas/60">
            Pré-analyse indicative — validation finale avec notre architecte
            intégrée.
          </p>
        </div>
      </div>
    </section>
  );
}

function ResultPanel({ result }: { result: Result }) {
  const dot =
    result.feu === "green"
      ? "bg-accent"
      : result.feu === "amber"
        ? "bg-amber-400"
        : "bg-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 rounded-xl border border-canvas/15 bg-canvas/[0.04] p-5"
    >
      <div className="flex items-center gap-3">
        <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
        <p className="font-medium">{result.title}</p>
      </div>
      <p className="mt-2 text-sm text-canvas/75">{result.label}</p>
      <p className="mt-1 text-sm leading-relaxed text-canvas/55">{result.zone}</p>

      {result.km != null && (
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 border-t border-canvas/15 pt-4 font-mono text-xs">
          <span className="text-canvas/55">
            Distance depuis Bayonne ·{" "}
            <span className="text-canvas">~{result.km} km</span>
          </span>
          <span className="text-canvas/55">
            Livraison estimée ·{" "}
            <span className="text-canvas">{eur(result.delivery!)}</span>
          </span>
        </div>
      )}
      {result.km != null && (
        <p className="mt-2 font-mono text-[0.68rem] text-accent">
          ✓ Distance reportée dans votre devis.
        </p>
      )}

      <p className="mt-3 text-xs leading-relaxed text-canvas/60">{result.note}</p>

      <div className="mt-4">
        {result.km != null ? (
          <Button href="#configurer" variant="accent">
            Configurer mon ARKO
            <Arrow />
          </Button>
        ) : (
          <Button
            href="#reserver"
            variant="outline"
            className="border-canvas/25 text-canvas hover:border-canvas/60"
          >
            Réserver une visio de 30 min
            <Arrow />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

const PACKS_MINI = [
  { label: "Essentiel", scope: "1–5 villes", prix: "4 900 €" },
  { label: "Étendu", scope: "Zones élargies", prix: "7 300 €" },
  { label: "Département", scope: "Couverture dép.", prix: "11 200 €" },
] as const;

function SearchBranch() {
  return (
    <div className="space-y-6">
      {/* Vignette + headline */}
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-canvas/15">
          <Image
            src="/terrain-affinity.png"
            alt="Réseau Affinity"
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <p className="text-[1.1rem] font-medium leading-snug text-canvas">
          <span className="text-accent">Réseau Affinity - Mandataires —</span>{" "}
          Le bon terrain existe. Laissez-nous le trouver pour vous.
        </p>
      </div>

      <p className="text-sm leading-relaxed text-canvas/65">
        Notre mandataire immobilier affilié Affinity prospecte pour vous&nbsp;—
        y compris off-market&nbsp;— et vous livre un dossier complet sous 48 h&nbsp;:
        parcelles candidates, constructibilité PLU, DVF 5 ans et note de qualification terrain.
      </p>

      {/* Packs terrain */}
      <div>
        <p className="mb-2.5 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-canvas/40">
          Packs terrain — tarifs indicatifs selon zone
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {PACKS_MINI.map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-canvas/15 bg-canvas/[0.04] px-3.5 py-3"
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-canvas/40">
                {p.label}
              </p>
              <p className="mt-1 font-mono text-[0.82rem] font-semibold text-canvas">
                À partir de {p.prix} TTC
              </p>
              <p className="mt-0.5 text-[0.7rem] text-canvas/40">{p.scope}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {["Off-market", "PLU & STECAL", "DVF · 5 ans", "Géorisques"].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-canvas/20 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-canvas/45"
          >
            {tag}
          </span>
        ))}
      </div>

      <Button
        href="/rechercheterrain"
        variant="accent"
        magnetic={false}
        className="w-full justify-center py-4 text-[1rem]"
      >
        Lancer ma recherche personnalisée
        <Arrow />
      </Button>
    </div>
  );
}
