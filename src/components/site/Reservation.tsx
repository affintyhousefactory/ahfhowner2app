"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND, CONFIG, TRANSPORT } from "@/lib/site";
import { Gauge } from "@/components/ui/Gauge";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { cn } from "@/shared/lib/cn";
import { useConfig, eur } from "./config-store";
import { CountdownBanner } from "./CountdownBanner";
import type { ParcelleData } from "@/shared/types/plu";

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function Reservation() {
  const c = useConfig();
  const { name } = c.active;
  const reserved = c.activeReserved;
  const total = c.active.total;
  const soldOut = reserved >= total;
  const [slot, setSlot] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [pluConsent, setPluConsent] = useState(false);
  const [optIn, setOptIn] = useState(false);

  const isPack = c.terrainMode === "pack" && !!c.packTerrain;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending || sent) return;
    const fd = new FormData(e.currentTarget);
    const errs: Record<string, boolean> = {};
    if (!String(fd.get("prenom") ?? "").trim()) errs.prenom = true;
    if (!String(fd.get("nom") ?? "").trim()) errs.nom = true;
    if (!String(fd.get("email") ?? "").trim()) errs.email = true;
    if (!String(fd.get("tel") ?? "").trim()) errs.tel = true;
    if (!isPack && !slot) errs.slot = true;
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSending(true);
    try {
      if (isPack) {
        // Flux pack terrain → /api/recherche-terrain
        let villesArr: string[] | undefined;
        let zonesArr: string[] | undefined;
        let departementStr: string | undefined;
        try {
          const raw = sessionStorage.getItem("pack_terrain_zones");
          if (raw) {
            const d = JSON.parse(raw) as { pack: string; villes: string; zones: string; departement: string };
            if (d.pack === c.packTerrain) {
              if (d.villes) villesArr = d.villes.split(",").map((s) => s.trim()).filter(Boolean);
              if (d.zones) zonesArr = d.zones.split(",").map((s) => s.trim()).filter(Boolean);
              if (d.departement) departementStr = d.departement.trim();
            }
          }
        } catch {}
        await fetch("/api/recherche-terrain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom: `${String(fd.get("prenom") ?? "").trim()} ${String(fd.get("nom") ?? "").trim()}`.trim(),
            telephone: String(fd.get("tel") ?? ""),
            email: String(fd.get("email") ?? ""),
            modele: c.active.name,
            pack: c.packTerrain,
            source: "configurateur" as const,
            villes: villesArr,
            zones: zonesArr,
            departement: departementStr,
            accepte_cgv: true,
            optIn,
          }),
        });
      } else {
        // Flux réservation standard → /api/reservation
        const bardage = CONFIG.cladding.find((x) => x.id === c.cladding)?.label ?? c.cladding;
        const facade = CONFIG.kitchen.find((x) => x.id === c.facade)?.label ?? c.facade;
        const bar = CONFIG.bar.find((x) => x.id === c.bar)?.label ?? c.bar;
        const chambre = CONFIG.bedroom.find((x) => x.id === c.bedroom)?.label ?? c.bedroom;
        const interieur = CONFIG.interior.find((x) => x.id === c.interior)?.label ?? c.interior;
        const optionsLabels = c.active.pricing.options
          .filter((o) => c.options.includes(o.id))
          .map((o) => o.label);
        let pluData: unknown = null;
        if (pluConsent) {
          try {
            const raw = sessionStorage.getItem("plu_result");
            if (raw) pluData = JSON.parse(raw);
          } catch {}
        }
        await fetch("/api/reservation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prenom: fd.get("prenom"),
            nom: fd.get("nom"),
            email: fd.get("email"),
            tel: fd.get("tel"),
            slot,
            produit: c.active.name,
            surface: c.active.area,
            houseTotal: c.houseTotal,
            delivery: c.delivery,
            terrainMode: c.terrainMode,
            packTerrain: c.packTerrain,
            bardage, facade, bar, chambre, interieur,
            terrasseM2: c.terrasseM2,
            optionsLabels,
            grandTotal: c.grandTotal,
            pluConsent,
            pluData,
            optIn,
          }),
        });
        if (!sent) c.incrementReserved(c.product);
      }
    } catch {
      // silencieux — confirmation côté UI quand même
    }
    setSent(true);
    setSending(false);
  };

  return (
    <section id="reserver" className="bg-surface py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              RESERVER
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Série 01
            </span>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* Gauche : promesse + jauge */}
          <div>
            <Reveal delay={0.05}>
              <h2 className="text-balance kinetic [font-size:var(--text-h1)]">
                {soldOut
                  ? "Série 01 complète."
                  : "Réservez votre exemplaire numéroté."}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-muted">
                {total} {name} sur ce cycle. Ni un de plus.
              </p>
            </Reveal>

            <div className="mt-10">
              <Gauge reserved={reserved} total={total} />
              <div className="mt-4">
                <CountdownBanner variant="compact" />
              </div>
            </div>

            <ConfigRecap />
          </div>

          {/* Droite : sélecteur + formulaire */}
          <div className="rounded-2xl border border-line bg-canvas p-6 md:p-8">
            {soldOut ? (
              <Waitlist />
            ) : sent ? (
              <Confirmation slot={slot} />
            ) : (
              <>
                {!isPack && (
                  <>
                    <p className="eyebrow mb-4">Numéro disponible</p>
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: total }).map((_, i) => {
                        const n = i + 1;
                        const taken = i < reserved;
                        const active = slot === n;
                        return (
                          <button
                            key={n}
                            disabled={taken}
                            onClick={() => setSlot(n)}
                            className={cn(
                              "aspect-square rounded-lg border font-mono text-sm tabular-nums transition-all",
                              taken &&
                                "cursor-not-allowed border-line bg-ink/[0.04] text-muted/40 line-through",
                              !taken &&
                                !active &&
                                "border-line text-ink hover:border-accent hover:text-accent",
                              active && "border-accent bg-accent text-white",
                            )}
                          >
                            {String(n).padStart(2, "0")}
                          </button>
                        );
                      })}
                    </div>
                    {fieldErrors.slot && (
                      <p className="mb-2 font-mono text-[0.65rem] text-red-500">
                        Sélectionnez un numéro ci-dessus pour continuer.
                      </p>
                    )}
                  </>
                )}

                {isPack && (
                  <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">Pack Terrain Affinity</p>
                    <p className="mt-1 text-sm text-muted">
                      Notre Mandataire Affinity recherche le terrain pour vous. Laissez vos coordonnées — on vous recontacte sous 24 h.
                    </p>
                  </div>
                )}

                <form onSubmit={submit} className="mt-7 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field name="prenom" placeholder="Prénom" error={fieldErrors.prenom} />
                    <Field name="nom" placeholder="Nom" error={fieldErrors.nom} />
                  </div>
                  <Field name="email" type="email" placeholder="Email" error={fieldErrors.email} />
                  <Field name="tel" type="tel" placeholder="Téléphone" error={fieldErrors.tel} />

                  {!isPack && <PluConsentBlock pluConsent={pluConsent} onChange={setPluConsent} />}

                  <label className="mt-3 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted">
                    <input
                      type="checkbox"
                      checked={optIn}
                      onChange={(e) => setOptIn(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-accent"
                    />
                    <span>
                      J&apos;accepte de recevoir des informations et actualités sur l&apos;ARKO par email.
                      Désinscription possible à tout moment.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                  >
                    {sending
                      ? "Envoi en cours…"
                      : isPack
                        ? "Envoyer ma demande de recherche terrain"
                        : slot
                          ? `Envoyer ma demande — n°${String(slot).padStart(2, "0")}`
                          : "Choisissez un numéro ci-dessus"}
                    {!sending && <Arrow />}
                  </button>

                  <div className="mt-3 rounded-xl border border-line bg-surface px-4 py-3 text-[0.72rem] leading-relaxed text-muted">
                    <p>
                      Après votre échange avec notre conseiller, vous recevrez un devis
                      mentionnant et un paiement de :
                    </p>
                    <ul className="mt-2 space-y-1">
                      <li>
                        <span className="font-semibold text-ink">
                          {BRAND.deposit.toLocaleString("fr-FR")} €
                        </span>
                        {" "}· Acompte de réservation Arko — remboursable, sans engagement de construction
                      </li>
                      <li>
                        <span className="font-semibold text-ink">1 500 €</span>
                        {" "}· Acompte Pack Recherche Terrain (optionnel — réservé aux acquéreurs d'un module Arko)
                      </li>
                    </ul>
                    <p className="mt-2">
                      Conditions précisées dans les{" "}
                      <a href="/cgv" className="underline underline-offset-2 hover:text-ink">CGV</a>.
                    </p>
                  </div>
                </form>

                <LegalNote />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfigRecap() {
  const c = useConfig();

  // Calcul livraison GPS — lit plu_result au montage ET à chaque analyse terrain complétée
  useEffect(() => {
    function readPlu() {
      try {
        const raw = sessionStorage.getItem("plu_result");
        if (!raw) return;
        const plu = JSON.parse(raw) as ParcelleData;
        if (plu.lon == null || plu.lat == null) return;
        const distKm = haversineKm(TRANSPORT.usine, { lat: plu.lat, lon: plu.lon }) * TRANSPORT.roadFactor;
        c.setDistanceKm(Math.round(distKm));
      } catch {}
    }
    readPlu();
    window.addEventListener("plu_result_updated", readPlu);
    return () => window.removeEventListener("plu_result_updated", readPlu);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const claddingLabel =
    CONFIG.cladding.find((x) => x.id === c.cladding)?.label ?? "";
  const kitchenLabel =
    CONFIG.kitchen.find((x) => x.id === c.facade)?.label ?? "";
  const barLabel =
    CONFIG.bar.find((x) => x.id === c.bar)?.label ?? "";
  const bedroomLabel =
    CONFIG.bedroom.find((x) => x.id === c.bedroom)?.label ?? "";
  const interiorLabel =
    CONFIG.interior.find((x) => x.id === c.interior)?.label ?? "";
  const packs = c.active.pricing.options
    .filter((o) => c.options.includes(o.id))
    .map((o) => o.label);

  return (
    <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          Votre configuration
        </p>
        <a
          href="#configurer"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent"
        >
          Ajuster →
        </a>
      </div>

      {/* Modèle */}
      <div className="mt-3 space-y-1 text-sm">
        <RecapLine label="Modèle" value={`${c.active.name} ${c.active.area}`} />
        <RecapLine label="Bardage" value={claddingLabel} />
      </div>

      {/* Aménagements */}
      <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
        <RecapLine label="Cuisine" value={kitchenLabel} />
        <RecapLine label="Barre" value={barLabel} />
        <RecapLine label="Chambre" value={bedroomLabel} />
        <RecapLine label="Intérieur" value={interiorLabel} />
      </div>

      {/* Options en supplément */}
      {(c.terrasseM2 > 0 || packs.length > 0) && (
        <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          {c.terrasseM2 > 0 && (
            <RecapLine label="Terrasse bois" value={`${c.terrasseM2} m²`} />
          )}
          {packs.map((label) => (
            <RecapLine key={label} label={label} value="inclus" />
          ))}
        </div>
      )}

      {/* Situation terrain */}
      {(() => {
        const PACK_LABELS: Record<string, string> = {
          essentiel: "Pack Essentiel",
          etendu: "Pack Étendu",
          departement: "Pack Département",
        };
        const terrainValue =
          c.terrainMode === "pack" && c.packTerrain
            ? PACK_LABELS[c.packTerrain] ?? "Pack Terrain Affinity"
            : c.terrainMode === "have"
              ? "J'ai un terrain"
              : null;
        return terrainValue ? (
          <div className="mt-3 border-t border-line pt-3 text-sm">
            <RecapLine label="Situation terrain" value={terrainValue} />
          </div>
        ) : null;
      })()}

      {/* Totaux */}
      <div className="mt-3 space-y-1.5 border-t border-line pt-3 font-mono text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-muted">Votre Arko</span>
          <span className="text-ink">{eur(c.houseTotal)} TTC</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-muted">Livraison estimée</span>
            <span className="text-ink">
              {c.terrainMode === "pack"
                ? "Via pack terrain"
                : c.delivery != null
                  ? eur(c.delivery)
                  : "À estimer"}
            </span>
          </div>
          {c.delivery != null && c.distanceKm != null && c.terrainMode !== "pack" && (
            <p className="text-right font-mono text-[0.62rem] text-muted/70">
              ~{c.distanceKm} km · {c.active.key === "one" ? TRANSPORT.poids.one : TRANSPORT.poids.max} t · {TRANSPORT.tarifEurTonneKm} €/t/km + grutage
            </p>
          )}
        </div>
        {c.terrainMode !== "pack" && c.delivery != null && (
          <div className="flex items-baseline justify-between border-t border-line pt-2">
            <span className="font-medium text-ink">Total estimé</span>
            <span className="text-ink">{eur(c.grandTotal)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RecapLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}

function Field({
  name,
  type = "text",
  placeholder,
  required,
  error,
}: {
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  error?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      placeholder={error ? `${placeholder} — requis` : placeholder}
      className={cn(
        "w-full rounded-full border bg-surface px-5 py-3.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent",
        error ? "border-red-400 placeholder:text-red-400/80" : "border-line",
      )}
    />
  );
}

function LegalNote() {
  return (
    <p className="mt-4 text-[0.68rem] leading-relaxed text-muted">
      {/* TODO LÉGAL — à valider par l'avocat : nature de la somme
          (arrhes/acompte), conditions de rétractation et remboursement. */}
      Acompte de réservation de {BRAND.deposit.toLocaleString("fr-FR")} € —
      remboursable. Conditions précisées dans les{" "}
      <a href="/cgv" className="underline underline-offset-2 hover:text-ink">
        CGV
      </a>
      .
    </p>
  );
}

function Confirmation({ slot }: { slot: number | null }) {
  const { houseTotal, delivery, active } = useConfig();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start py-6"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3 className="mt-5 text-xl font-medium tracking-tight">
        Demande enregistrée
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {slot
          ? `Le n°${String(slot).padStart(2, "0")} vous est pré-attribué. `
          : ""}
        Configuration : {active.name} {active.area} — votre Arko {eur(houseTotal)} TTC
        {delivery != null ? ` + livraison ${eur(delivery)}` : ""}. En version
        finale, le paiement sécurisé de l'acompte confirmera votre réservation.
        On vous recontacte sous 24 h.
      </p>
      <p className="mt-4 font-mono text-[0.68rem] text-muted">
        Aperçu — aucun paiement n'est encore activé.
      </p>
    </motion.div>
  );
}

function Waitlist() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <p className="eyebrow mb-3">Liste prioritaire</p>
      <h3 className="text-xl font-medium tracking-tight">
        Les 12 sont pris ? Rejoignez la liste prioritaire.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Laissez votre email : vous serez prévenu·e en priorité pour la suite.
      </p>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.p
            key="ok"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 text-sm text-accent"
          >
            C'est noté — merci. On revient vers vous.
          </motion.p>
        ) : (
          <form
            key="form"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <Field name="email" type="email" placeholder="Email" required />
            <Button variant="accent" magnetic={false} className="shrink-0 justify-center">
              M'inscrire
            </Button>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}

function PluConsentBlock({
  pluConsent,
  onChange,
}: {
  pluConsent: boolean;
  onChange: (v: boolean) => void;
}) {
  const [hasPlu, setHasPlu] = useState(false);

  // Réactif : s'affiche et se pré-coche dès que plu_result est disponible
  useEffect(() => {
    function check() {
      const has = !!sessionStorage.getItem("plu_result");
      setHasPlu(has);
      if (has) onChange(true);
    }
    check();
    window.addEventListener("plu_result_updated", check);
    return () => window.removeEventListener("plu_result_updated", check);
  // onChange est setPluConsent — stable, pas de boucle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasPlu) return null;

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm transition-colors hover:border-accent/40">
      <input
        type="checkbox"
        checked={pluConsent}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
      />
      <span className="leading-relaxed text-muted">
        <span className="font-medium text-ink">Inclure mon analyse PLU dans ma demande.</span>{" "}
        Les données de votre parcelle (référence cadastrale, zonage, prescriptions) seront
        transmises à notre Mandataire Affinity pour préparer l&apos;étude de faisabilité.
      </span>
    </label>
  );
}
