"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND, CONFIG } from "@/lib/site";
import { Gauge } from "@/components/ui/Gauge";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useConfig, eur } from "./config-store";
import { CountdownBanner } from "./CountdownBanner";

export function Reservation() {
  const c = useConfig();
  const { name } = c.active;
  const reserved = c.activeReserved;
  const total = c.active.total;
  const deposit = BRAND.deposit;
  const soldOut = reserved >= total;
  const [slot, setSlot] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sent) {
      c.incrementReserved(c.product); // FOMO démo : jauge bouge avant confirmation
    }
    setSent(true); // Phase 1 : aucune transaction réelle, aucun backend.
  };

  return (
    <section id="reserver" className="bg-surface py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              011 — Réserver
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

                <form onSubmit={submit} className="mt-7 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field name="prenom" placeholder="Prénom" />
                    <Field name="nom" placeholder="Nom" />
                  </div>
                  <Field name="email" type="email" placeholder="Email" required />
                  <Field name="tel" type="tel" placeholder="Téléphone" />

                  <Button
                    variant="accent"
                    magnetic={false}
                    className="mt-2 w-full justify-center disabled:opacity-40"
                  >
                    {slot
                      ? `Réserver le n°${String(slot).padStart(2, "0")} et payer ${deposit.toLocaleString("fr-FR")} €`
                      : "Choisissez un numéro ci-dessus"}
                    <Arrow />
                  </Button>

                  {/* Réducteur de risque au point de clic */}
                  <p className="mt-3 text-center text-xs leading-relaxed text-muted">
                    Remboursable. Sans engagement de construction.
                    <br className="hidden sm:block" /> Prochaine étape : 30 min
                    avec notre architecte intégrée.
                  </p>
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
  const claddingLabel =
    CONFIG.cladding.find((x) => x.id === c.cladding)?.label ?? "";
  const packs = c.active.pricing.options
    .filter((o) => c.options.includes(o.id))
    .map((o) => o.label);
  const extras = [
    c.terrasseM2 > 0 ? `terrasse ${c.terrasseM2} m²` : null,
    ...packs,
  ].filter(Boolean);

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
      <p className="mt-3 text-sm leading-relaxed text-ink">
        {c.active.name} {c.active.area} · bardage {claddingLabel.toLowerCase()}
        {extras.length ? ` · ${extras.join(" · ")}` : ""}
      </p>
      <div className="mt-4 space-y-1.5 border-t border-line pt-3 font-mono text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-muted">Votre Arko</span>
          <span className="text-ink">{eur(c.houseTotal)} TTC</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-muted">Livraison estimée</span>
          <span className="text-ink">
            {c.delivery != null ? eur(c.delivery) : "à estimer"}
          </span>
        </div>
        {c.delivery != null && (
          <div className="flex items-baseline justify-between border-t border-line pt-2">
            <span className="font-medium text-ink">Total estimé</span>
            <span className="text-ink">{eur(c.grandTotal)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  name,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-full border border-line bg-surface px-5 py-3.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
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
      </a>{" "}
      (en cours de validation juridique).
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
