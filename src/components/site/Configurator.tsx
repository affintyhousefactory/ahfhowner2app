"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CONFIG, BRAND, PRICING } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useConfig, eur } from "./config-store";

type View = "exterieur" | "cuisine" | "chambre" | "interieur";

export function Configurator() {
  const c = useConfig();
  const [view, setView] = useState<View>("exterieur");

  const claddingObj = CONFIG.cladding.find((x) => x.id === c.cladding)!;
  const bedroomObj = CONFIG.bedroom.find((x) => x.id === c.bedroom)!;
  const interiorObj = CONFIG.interior.find((x) => x.id === c.interior)!;

  const interiorPreview = useMemo(() => {
    switch (view) {
      case "cuisine":
        return {
          src: "/assets/arko/interior/kitchen.jpg",
          alt: "ARKO — cuisine îlot",
          filter:
            c.facade === "clair"
              ? "brightness(1.16) contrast(0.93) saturate(0.92)"
              : "none",
          caption: `Îlot façade ${c.facade === "clair" ? "claire" : "foncée"} · ${c.bar === "avec" ? "avec barre" : "sans barre"}`,
        };
      case "chambre":
        return {
          src: "/assets/arko/interior/bedroom.jpg",
          alt: "ARKO — la chambre",
          filter: bedroomObj.filter,
          caption: `Chambre · ${bedroomObj.label.toLowerCase()}`,
        };
      case "interieur":
        return {
          src: "/assets/arko/interior/kitchen.jpg",
          alt: "ARKO — ambiance intérieure",
          filter: interiorObj.filter,
          caption: c.interior === "bois" ? "Parois bois clair" : "Parois ton clair",
        };
      default:
        return null;
    }
  }, [view, c.facade, c.bar, c.interior, bedroomObj, interiorObj]);

  const caption =
    view === "exterieur"
      ? `Bardage ${claddingObj.label.toLowerCase()}`
      : interiorPreview!.caption;
  const previewKey = `${view}-${c.facade}-${c.bar}-${c.bedroom}-${c.interior}`;

  return (
    <section id="configurer" className="bg-surface py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              007 — Configurer
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Devis indicatif
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 max-w-3xl text-balance text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:text-[5rem]">
            Faites-en la vôtre.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
            Vous choisissez l'essentiel, le total se calcule en direct.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* APERÇU */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-canvas">
              {/* initial={false} : le 1er aperçu s'affiche instantanément (jamais de
                  boîte vide au chargement). Pas de mode="wait" : les deux images se
                  chevauchent en fondu, donc aucun vide pendant un changement de peau. */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={view === "exterieur" ? `ext-${c.cladding}` : previewKey}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  {view === "exterieur" ? (
                    <Image
                      src={`/assets/arko/skins/skin-${c.cladding}.jpg`}
                      alt={`ARKO — bardage ${claddingObj.label}`}
                      fill
                      sizes="(max-width: 1024px) 92vw, 55vw"
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={interiorPreview!.src}
                      alt={interiorPreview!.alt}
                      fill
                      sizes="(max-width: 1024px) 92vw, 55vw"
                      className="object-cover"
                      style={{ filter: interiorPreview!.filter }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-3 left-3 z-10 rounded-full bg-canvas/90 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink backdrop-blur">
                {caption}
              </div>
              {/* Honnêteté : les intérieurs sont des ambiances (filtres), pas
                  des rendus exacts de chaque choix. L'extérieur, lui, est un
                  vrai rendu par bardage → pas de badge. */}
              {view !== "exterieur" && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-ink/80 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-canvas backdrop-blur">
                  Ambiance indicative
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["exterieur", "Extérieur"],
                  ["cuisine", "Cuisine"],
                  ["chambre", "Chambre"],
                  ["interieur", "Intérieur"],
                ] as [View, string][]
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs transition-colors",
                    view === v
                      ? "bg-ink text-canvas"
                      : "border border-line text-muted hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* CONTRÔLES + DEVIS */}
          <div className="flex flex-col gap-8">
            <Group label="Bardage — inclus">
              <div className="flex flex-wrap gap-2.5">
                {CONFIG.cladding.map((x) => (
                  <Swatch
                    key={x.id}
                    active={c.cladding === x.id}
                    hex={x.hex}
                    label={x.label}
                    onClick={() => {
                      c.setCladding(x.id);
                      setView("exterieur");
                    }}
                  />
                ))}
              </div>
            </Group>

            <Group label="Aménagements — inclus">
              <div className="flex flex-col gap-2.5">
                <Chips options={CONFIG.kitchen} value={c.facade} onChange={(v) => { c.setFacade(v); setView("cuisine"); }} />
                <Chips options={CONFIG.bar} value={c.bar} onChange={(v) => { c.setBar(v); setView("cuisine"); }} />
                <Chips options={CONFIG.bedroom} value={c.bedroom} onChange={(v) => { c.setBedroom(v); setView("chambre"); }} />
                <Chips options={CONFIG.interior} value={c.interior} onChange={(v) => { c.setInterior(v); setView("interieur"); }} />
              </div>
            </Group>

            <Group label="Options — en supplément">
              {/* Terrasse au m² */}
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <div>
                  <p className="text-sm text-ink">Terrasse bois</p>
                  <p className="font-mono text-[0.7rem] text-muted">
                    {PRICING.terrassePerM2} €/m²
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={c.terrasseM2 || ""}
                    onChange={(e) => c.setTerrasseM2(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="0"
                    className="w-20 rounded-lg border border-line bg-surface px-3 py-2 text-right text-sm outline-none focus:border-accent"
                  />
                  <span className="font-mono text-xs text-muted">m²</span>
                </div>
              </div>
              {/* Packs */}
              <div className="mt-3 flex flex-wrap gap-2.5">
                {PRICING.options.map((o) => {
                  const on = c.options.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      onClick={() => c.toggleOption(o.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
                        on
                          ? "border-accent bg-accent/5 text-ink"
                          : "border-line text-muted hover:border-ink/30 hover:text-ink",
                      )}
                    >
                      <span>{o.label}</span>
                      <span className="font-mono text-xs text-muted">
                        +{o.price.toLocaleString("fr-FR")} €
                      </span>
                    </button>
                  );
                })}
              </div>
            </Group>

            <Group label="Signature Arko — non modifiable">
              <div className="flex flex-wrap gap-2.5">
                <Locked label="Baies toute hauteur" />
                <Locked label="Angle vitré en retrait" />
                <Locked label={`Volume ${BRAND.footprint}`} />
              </div>
            </Group>

            <Devis />
          </div>
        </div>
      </div>
    </section>
  );
}

function Devis() {
  const c = useConfig();
  const selectedPacks = PRICING.options.filter((o) => c.options.includes(o.id));

  return (
    <div className="rounded-2xl border border-line bg-canvas p-6">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        Votre devis
      </p>

      {/* Couche 1 — la maison */}
      <div className="mt-4 space-y-2 text-sm">
        <Line k={`ARKO ${BRAND.area} — clé en main`} v={eur(PRICING.base)} />
        {c.terrasseM2 > 0 && (
          <Line
            k={`Terrasse bois — ${c.terrasseM2} m²`}
            v={"+ " + eur(c.terrasseM2 * PRICING.terrassePerM2)}
            sub
          />
        )}
        {selectedPacks.map((o) => (
          <Line key={o.id} k={o.label} v={"+ " + eur(o.price)} sub />
        ))}
        <div className="flex items-baseline justify-between border-t border-line pt-3 font-medium">
          <span>Votre Arko</span>
          <span className="font-mono">{eur(c.houseTotal)} TTC</span>
        </div>
      </div>

      {/* Couche 2 — livraison */}
      <div className="mt-5 border-t border-line pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-ink">Livraison & pose</p>
            <p className="font-mono text-[0.68rem] text-muted">
              {eur(PRICING.delivery.grutage)} + {PRICING.delivery.perKm.toString().replace(".", ",")} €/km · depuis {PRICING.delivery.origin}
            </p>
          </div>
          <span className="font-mono text-sm">
            {c.delivery != null ? eur(c.delivery) : "à estimer"}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={c.distanceKm ?? ""}
            onChange={(e) =>
              c.setDistanceKm(e.target.value === "" ? null : Math.max(0, Number(e.target.value)))
            }
            placeholder="distance depuis Bayonne"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <span className="font-mono text-xs text-muted">km</span>
        </div>
        <p className="mt-1.5 font-mono text-[0.65rem] text-muted">
          Auto-calculée depuis votre adresse via l'outil terrain.
        </p>
      </div>

      {/* Total */}
      <div className="mt-5 rounded-xl bg-ink p-4 text-canvas">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-canvas/70">Votre Arko</span>
          <span className="font-mono">{eur(c.houseTotal)} TTC</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-sm text-canvas/70">+ Livraison estimée</span>
          <span className="font-mono">
            {c.delivery != null ? eur(c.delivery) : "—"}
          </span>
        </div>
        {c.delivery != null && (
          <div className="mt-2 flex items-baseline justify-between border-t border-canvas/15 pt-2">
            <span className="font-medium">Total estimé</span>
            <span className="editorial text-xl">{eur(c.grandTotal)}</span>
          </div>
        )}
      </div>

      {/* Couche 3 — frais terrain, à part */}
      <div className="mt-5 border-t border-line pt-4">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
          À prévoir — frais de terrain (hors total)
        </p>
        <div className="mt-3 space-y-1.5 text-xs">
          {PRICING.landFees.map((f) => (
            <div key={f.label} className="flex items-baseline justify-between gap-4">
              <span className="text-muted">{f.label}</span>
              <span className="text-right font-mono text-ink/70">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      <Button href="#reserver" variant="accent" className="mt-6 w-full justify-center">
        Réserver cette configuration
        <Arrow />
      </Button>
      <p className="mt-3 font-mono text-[0.62rem] leading-relaxed text-muted">
        Estimation indicative — document non contractuel, devis définitif après
        visite. Validité 3 mois. TVA 20 %.
      </p>
    </div>
  );
}

function Line({ k, v, sub }: { k: string; v: string; sub?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className={sub ? "text-muted" : "text-ink"}>{k}</span>
      <span className="font-mono text-ink">{v}</span>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-5">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

function Swatch({ active, hex, label, onClick }: { active: boolean; hex: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition-all",
        active ? "border-accent bg-accent/5 text-ink" : "border-line text-muted hover:border-ink/30 hover:text-ink",
      )}
    >
      <span
        className={cn("h-6 w-6 rounded-full ring-1 ring-inset ring-black/10 transition-transform", active && "scale-105")}
        style={{ backgroundColor: hex }}
      />
      {label}
    </button>
  );
}

function Chips<T extends { id: string; label: string }>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition-all",
            value === o.id ? "border-accent bg-accent/5 text-ink" : "border-line text-muted hover:border-ink/30 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Locked({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 py-2 text-sm text-muted">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      {label}
    </span>
  );
}
