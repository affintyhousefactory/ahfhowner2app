"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CONFIG, PRODUCT_LIST } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { cn } from "@/shared/lib/cn";
import { useConfig, eur } from "./config-store";
import { CountdownBanner } from "./CountdownBanner";
import { ParcelleAnalyse } from "@/shared/components/plu/ParcelleAnalyse";

const PACK_TERRAIN = [
  { id: "essentiel", label: "Essentiel", prix: "4 900 € TTC" },
  { id: "etendu", label: "Étendu", prix: "7 300 € TTC" },
  { id: "departement", label: "Département", prix: "11 200 € TTC" },
] as const;

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
              Configurer · {c.active.name}
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Devis indicatif
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="editorial mt-12 max-w-4xl text-balance text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:text-[5rem]">
            Configurer votre {c.active.name}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 text-sm leading-relaxed text-muted md:whitespace-nowrap">
            Choisissez votre modèle, puis l'essentiel : le total se calcule en direct.
          </p>
        </Reveal>

        {/* Sélecteur de produit (ADR-020) — affiche reserved/total par produit (FOMO) */}
        <Reveal delay={0.12}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Choix du modèle"
              className="inline-flex rounded-full border border-line bg-canvas p-1"
            >
              {PRODUCT_LIST.map((p) => {
                const on = c.product === p.key;
                const reserved = c.reservedByProduct[p.key];
                const total = p.total;
                return (
                  <button
                    key={p.key}
                    role="tab"
                    aria-selected={on}
                    onClick={() => c.setProduct(p.key)}
                    className={cn(
                      "flex flex-col items-start rounded-full px-5 py-2 text-sm transition-colors",
                      on ? "bg-ink text-canvas" : "text-muted hover:text-ink",
                    )}
                  >
                    <span className="flex items-baseline gap-2">
                      {p.name}
                      <span
                        className={cn(
                          "font-mono text-[0.7rem]",
                          on ? "text-canvas/70" : "opacity-70",
                        )}
                      >
                        {p.area}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[0.65rem] tabular-nums",
                        on ? "text-canvas/70" : "text-muted/80",
                      )}
                    >
                      {reserved}/{total} réservés
                    </span>
                  </button>
                );
              })}
            </div>
            <CountdownBanner variant="compact" />
          </div>
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
                    {c.active.pricing.terrassePerM2} €/m²
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
                {c.active.pricing.options.map((o) => {
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
                <Locked label={`Volume ${c.active.footprint}`} />
              </div>
            </Group>

            <Suspense>
              <Devis />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

function Devis() {
  const c = useConfig();
  const p = c.active.pricing;
  const searchParams = useSearchParams();
  const selectedPacks = p.options.filter((o) => c.options.includes(o.id));

  const initPack = searchParams.get("pack") as "essentiel" | "etendu" | "departement" | null;
  const initParcelle = searchParams.get("parcelle") ?? "";
  const packObj = PACK_TERRAIN.find((pt) => pt.id === c.packTerrain);
  const [cgv, setCgv] = useState(false);
  const [cgvError, setCgvError] = useState(false);
  const [acceptCgv, setAcceptCgv] = useState(false);
  const [acceptCgvError, setAcceptCgvError] = useState(false);

  // Initialiser depuis les query params au premier rendu
  useState(() => {
    if (initPack) {
      c.setTerrainMode("pack");
      c.setPackTerrain(initPack);
    }
    if (initParcelle) {
      c.setTerrainMode("have");
    }
  });

  function handleReserver() {
    let blocked = false;
    if (!cgv) { setCgvError(true); blocked = true; } else { setCgvError(false); }
    if (!acceptCgv) { setAcceptCgvError(true); blocked = true; } else { setAcceptCgvError(false); }
    if (blocked) return;
    window.location.href = "/configurer#reserver";
  }

  return (
    <div className="rounded-2xl border border-line bg-canvas p-6">
      {/* Bande FOMO — countdown + jauge product-aware */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
            {c.active.name}
          </span>
          <span className="font-mono text-xs tabular-nums text-ink">
            {c.activeReserved}/{c.active.total} · {c.activeRemaining} restants
          </span>
        </div>
        <CountdownBanner variant="compact" />
      </div>

      <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        Votre devis
      </p>

      {/* Couche 1 — la maison */}
      <div className="mt-4 space-y-2 text-sm">
        <Line k={`${c.active.name} ${c.active.area} — clé en main`} v={eur(p.base)} />
        {c.terrasseM2 > 0 && (
          <Line
            k={`Terrasse bois — ${c.terrasseM2} m²`}
            v={"+ " + eur(c.terrasseM2 * p.terrassePerM2)}
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

      {/* Votre situation terrain — avant l'encadré total */}
      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-3 text-sm font-semibold text-ink">Votre situation terrain</p>
        <div className="flex gap-2">
          <button
            onClick={() => c.setTerrainMode("have")}
            className={cn(
              "flex-1 rounded-full border px-3 py-2 text-center text-xs transition-all",
              c.terrainMode === "have"
                ? "border-accent bg-accent/5 text-ink"
                : "border-line text-muted hover:border-ink/30 hover:text-ink",
            )}
          >
            J'ai un terrain
          </button>
          <button
            onClick={() => c.setTerrainMode("pack")}
            className={cn(
              "flex-1 rounded-full border px-3 py-2 text-center text-xs transition-all",
              c.terrainMode === "pack"
                ? "border-accent bg-accent/5 text-ink"
                : "border-line text-muted hover:border-ink/30 hover:text-ink",
            )}
          >
            Pack Terrain Affinity
          </button>
        </div>

        {c.terrainMode === "have" && (
          <div className="mt-3">
            <ParcelleAnalyse mode="compact" initialParcelle={initParcelle} />
          </div>
        )}

        {c.terrainMode === "pack" && (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {PACK_TERRAIN.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => c.setPackTerrain(pt.id)}
                  className={cn(
                    "flex flex-col rounded-xl border px-3 py-2 text-left text-xs transition-all",
                    c.packTerrain === pt.id
                      ? "border-accent bg-accent/5"
                      : "border-line text-muted hover:border-ink/30",
                  )}
                >
                  <span className={cn("font-mono text-[0.6rem] uppercase tracking-wider", c.packTerrain === pt.id ? "text-accent" : "text-muted/60")}>
                    {pt.label}
                  </span>
                  <span className="mt-0.5 font-semibold text-ink">{pt.prix}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 font-mono text-[0.63rem] leading-relaxed text-muted">
              Livraison auto-calculée si la recherche est fructueuse.{" "}
              <a href="/rechercheterrain" className="text-accent underline underline-offset-2">
                En savoir plus sur les packs terrain →
              </a>
            </p>
            {c.packTerrain && (
              <PackTerrainContactForm pack={c.packTerrain as PackId} />
            )}
          </>
        )}
      </div>

      {/* Total */}
      <div className="mt-5 rounded-xl bg-ink p-4 text-canvas">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-canvas/70">Votre Arko</span>
          <span className="font-mono">{eur(c.houseTotal)} TTC</span>
        </div>
        {c.terrainMode === "pack" && packObj && (
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm text-canvas/70">Pack Terrain {packObj.label}</span>
            <span className="font-mono">{packObj.prix}</span>
          </div>
        )}
        {c.terrainMode === "have" && c.delivery != null && (
          <>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm text-canvas/70">+ Livraison estimée</span>
              <span className="font-mono">{eur(c.delivery)}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-canvas/15 pt-2">
              <span className="font-medium">Total estimé</span>
              <span className="editorial text-xl">{eur(c.grandTotal)}</span>
            </div>
          </>
        )}
      </div>

      {/* Couche 3 — frais complémentaires hors proposition */}
      <div className="mt-5 border-t border-line pt-4">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
          Frais complémentaires Hors proposition (hors total)
        </p>
        <div className="mt-3 space-y-1.5 text-xs">
          {p.landFees.map((f) => (
            <div key={f.label} className="flex items-baseline justify-between gap-4">
              <span className="text-muted">{f.label}</span>
              <span className="text-right font-mono text-ink/70">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      <label className="mt-5 flex items-start gap-2">
        <input
          type="checkbox"
          checked={cgv}
          onChange={(e) => {
            setCgv(e.target.checked);
            if (e.target.checked) setCgvError(false);
          }}
          className="mt-0.5 shrink-0 accent-accent"
        />
        <span className="font-mono text-[0.63rem] leading-relaxed text-muted">
          J'accepte d'être recontacté par Affinity Home Factory dans le cadre de ma
          recherche de terrain. Données traitées conformément à notre{" "}
          <a href="/confidentialite" className="text-accent underline underline-offset-2">
            politique de confidentialité
          </a>
          .
        </span>
      </label>
      {cgvError && (
        <p className="mt-1 font-mono text-[0.63rem] text-red-500">
          Veuillez accepter la politique de confidentialité pour continuer.
        </p>
      )}

      <label className="mt-3 flex items-start gap-2">
        <input
          type="checkbox"
          checked={acceptCgv}
          onChange={(e) => { setAcceptCgv(e.target.checked); if (e.target.checked) setAcceptCgvError(false); }}
          className="mt-0.5 shrink-0 accent-accent"
        />
        <span className="font-mono text-[0.63rem] leading-relaxed text-muted">
          J'accepte les{" "}
          <a href="/cgv" target="_blank" className="text-accent underline underline-offset-2">
            CGV
          </a>{" "}
          et la politique de confidentialité.
        </span>
      </label>
      {acceptCgvError && (
        <p className="mt-1 font-mono text-[0.63rem] text-red-500">
          Veuillez accepter les CGV pour continuer.
        </p>
      )}

      <Button
        onClick={handleReserver}
        variant="accent"
        className="mt-4 w-full justify-center"
        magnetic={false}
      >
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

type PackId = "essentiel" | "etendu" | "departement";

const PACK_LABELS: Record<PackId, string> = {
  essentiel: "1 à 5 villes ciblées",
  etendu: "Zone de recherche (intercommunalité, bassin de vie…)",
  departement: "Département complet",
};

function PackTerrainContactForm({ pack }: { pack: PackId }) {
  const [villes, setVilles] = useState("");
  const [zones, setZones] = useState("");
  const [departement, setDepartement] = useState("");

  // Expose les zones au formulaire de réservation via sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("pack_terrain_zones", JSON.stringify({ pack, villes, zones, departement }));
    } catch {}
  }, [pack, villes, zones, departement]);

  const inputCls =
    "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent placeholder:text-muted/50";

  return (
    <div className="mt-4 space-y-2.5">
      {pack === "essentiel" && (
        <div>
          <p className="mb-1 font-mono text-[0.63rem] text-muted">
            {PACK_LABELS.essentiel} — séparées par une virgule
          </p>
          <textarea
            rows={2}
            value={villes}
            onChange={(e) => setVilles(e.target.value)}
            placeholder="Ex : Lyon, Bordeaux, Nantes, Rennes, Montpellier"
            className={cn(inputCls, "resize-none")}
          />
        </div>
      )}
      {pack === "etendu" && (
        <div>
          <p className="mb-1 font-mono text-[0.63rem] text-muted">
            {PACK_LABELS.etendu}
          </p>
          <textarea
            rows={2}
            value={zones}
            onChange={(e) => setZones(e.target.value)}
            placeholder="Ex : Bretagne, Auvergne-Rhône-Alpes, Grand Est"
            className={cn(inputCls, "resize-none")}
          />
        </div>
      )}
      {pack === "departement" && (
        <div>
          <p className="mb-1 font-mono text-[0.63rem] text-muted">
            {PACK_LABELS.departement}
          </p>
          <input
            type="text"
            value={departement}
            onChange={(e) => setDepartement(e.target.value)}
            placeholder="Ex : 69 — Rhône, 33 — Gironde, 44 — Loire-Atlantique"
            className={inputCls}
          />
        </div>
      )}
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
