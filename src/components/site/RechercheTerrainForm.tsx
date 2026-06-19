"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Arrow } from "@/components/ui/Button";

const MAX_ZONES = 5;

export function RechercheTerrainForm() {
  const router = useRouter();
  const [zones, setZones] = useState<string[]>([""]);
  const [budget, setBudget] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [cgv, setCgv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addZone() {
    if (zones.length < MAX_ZONES) setZones((z) => [...z, ""]);
  }

  function removeZone(i: number) {
    setZones((z) => z.filter((_, idx) => idx !== i));
  }

  function updateZone(i: number, value: string) {
    setZones((z) => z.map((z2, idx) => (idx === i ? value : z2)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validZones = zones.filter((z) => z.trim());
    if (!validZones.length) {
      setError("Indiquez au moins une zone de recherche.");
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/recherche-terrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, telephone, email, budget, zones: validZones, accepte_cgv: cgv }),
      });
    } catch {
      // fallback silencieux — on redirige quand même
    }
    router.push("/contact");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Zones de recherche */}
      <div>
        <p className="mb-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
          Vos zones de recherche <span className="text-accent">·</span> max {MAX_ZONES}
        </p>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {zones.map((z, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="w-5 shrink-0 font-mono text-[0.7rem] text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <input
                  value={z}
                  onChange={(e) => updateZone(i, e.target.value)}
                  placeholder="Zone (ville ou code postal)"
                  required={i === 0}
                  className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-accent"
                />
                {zones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeZone(i)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-red-400 hover:text-red-500"
                    aria-label="Supprimer cette zone"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {zones.length < MAX_ZONES && (
          <button
            type="button"
            onClick={addZone}
            className="mt-3 flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent/40 text-base leading-none">
              +
            </span>
            Ajouter une zone
          </button>
        )}
      </div>

      {/* Budget terrain */}
      <div>
        <p className="mb-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
          Budget terrain
        </p>
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="ex : 80 000 €"
          className="w-full rounded-full border border-line bg-surface px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-accent"
        />
      </div>

      {/* Séparateur */}
      <div className="border-t border-line" />

      {/* Coordonnées */}
      <div>
        <p className="mb-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
          Vos coordonnées
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            placeholder="Nom et prénom"
            className="rounded-full border border-line bg-surface px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-accent"
          />
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            required
            type="tel"
            placeholder="Téléphone"
            className="rounded-full border border-line bg-surface px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-accent"
          />
        </div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          placeholder="Adresse email — le rapport vous sera envoyé ici"
          className="mt-3 w-full rounded-full border border-line bg-surface px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-accent"
        />
      </div>

      {/* CGV */}
      <label className="flex cursor-pointer items-start gap-3">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            required
            checked={cgv}
            onChange={(e) => setCgv(e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-5 w-5 rounded border border-line bg-surface transition-colors peer-checked:border-accent peer-checked:bg-accent" />
          <svg
            className="pointer-events-none absolute inset-0 m-auto opacity-0 transition-opacity peer-checked:opacity-100"
            width="11" height="9" viewBox="0 0 11 9" fill="none"
          >
            <path d="M1 4.5l3 3L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-sm leading-relaxed text-muted">
          J'ai lu et j'accepte les{" "}
          <a href="/mentions-legales" className="text-ink underline underline-offset-2 hover:text-accent">
            mentions légales
          </a>{" "}
          et les{" "}
          <a href="/cgv" className="text-ink underline underline-offset-2 hover:text-accent">
            CGV
          </a>
          .
        </span>
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !cgv}
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-7 py-4 text-[0.95rem] font-medium tracking-tight text-white shadow-sm transition-colors hover:bg-accent-ink disabled:opacity-50"
      >
        {loading ? "Envoi en cours…" : "Je valide ma demande"}
        {!loading && <Arrow />}
      </button>

      <p className="text-center font-mono text-[0.68rem] leading-relaxed text-muted">
        Votre rapport personnalisé vous sera transmis par email sous 48 h ouvrées.
      </p>
    </form>
  );
}
