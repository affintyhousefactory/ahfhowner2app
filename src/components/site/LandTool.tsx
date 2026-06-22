"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ParcelleAnalyse } from "./ParcelleAnalyse";

type Branch = "have" | "search";

export function LandTool() {
  const [branch, setBranch] = useState<Branch>("have");

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
                onClick={() => setBranch(b)}
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
            <ParcelleAnalyse mode="full" />
          ) : (
            <SearchBranch />
          )}

          <p className="mt-5 font-mono text-[0.68rem] leading-relaxed text-canvas/60">
            Données Géoportail de l&apos;Urbanisme (GPU) — pré-analyse indicative,
            constructibilité définitive validée avec notre architecte intégrée.
          </p>
        </div>
      </div>
    </section>
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
