"use client";

import { useState } from "react";
import type { ParcelleData } from "@/shared/types/plu";

export type { ParcelleData };

const STEPS = [
  "Géocodage de l'adresse",
  "Identification de la parcelle cadastrale",
  "Consultation du Géoportail de l'Urbanisme",
  "Extraction des prescriptions et servitudes",
];

interface AdminPluAnalyserProps {
  initialAddress?: string;
  onResult: (data: ParcelleData) => void;
}

export default function AdminPluAnalyser({ initialAddress = "", onResult }: AdminPluAnalyserProps) {
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ParcelleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleAnalyse() {
    const value = address.trim();
    if (value.length < 5) {
      setError("Saisissez une adresse complète (numéro + rue + ville).");
      return;
    }
    setLoading(true);
    setStep(0);
    setResult(null);
    setError(null);
    setApplied(false);

    const tick = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length)), 700);

    try {
      const res = await fetch("/api/admin/plu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: value }),
      });

      clearInterval(tick);
      setStep(STEPS.length);
      setLoading(false);

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Erreur lors de l'analyse GPU");
        return;
      }

      const data = (await res.json()) as ParcelleData;
      setResult(data);
    } catch {
      clearInterval(tick);
      setLoading(false);
      setError("Connexion impossible — réessayez.");
    }
  }

  function handleApply() {
    if (!result) return;
    onResult(result);
    setApplied(true);
  }

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-xs uppercase tracking-wider text-white/30">
        Recalculer les données PLU
      </p>

      <div className="flex gap-2">
        <input
          value={address}
          onChange={(e) => { setAddress(e.target.value); setError(null); setResult(null); setApplied(false); }}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleAnalyse()}
          placeholder="Ex : 4 Avenue Jacques Loeb, 64100 Bayonne"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4] disabled:opacity-50"
          disabled={loading}
        />
        <button
          onClick={handleAnalyse}
          disabled={loading || !address.trim()}
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          {loading ? "Analyse…" : "Analyser"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {/* Étapes chargement */}
      {loading && (
        <ul className="mt-3 space-y-1.5">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-2 font-mono text-[11px] transition-colors ${
                i < step ? "text-white/60" : "text-white/20"
              }`}
            >
              <span
                className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${
                  i < step ? "border-[#7469F4] bg-[#7469F4]" : "border-white/20"
                }`}
              >
                {i < step && (
                  <svg width="7" height="7" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5l3 3L13 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {s}
            </li>
          ))}
        </ul>
      )}

      {/* Résultat */}
      {!loading && result && (
        <div className="mt-3">
          {result.found ? (
            <>
              <div className="rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2.5">
                {result.address_label && (
                  <p className="mb-1.5 text-xs text-white/50">{result.address_label}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[11px]">
                  {result.parcelle && (
                    <span className="text-white/50">
                      Parcelle · <span className="text-white">{result.parcelle}</span>
                    </span>
                  )}
                  {result.zone_urba && (
                    <span className="text-white/50">
                      Zone · <span className="text-white">{result.zone_urba}</span>
                    </span>
                  )}
                  {result.typedoc && (
                    <span className="text-white/50">
                      Doc · <span className="text-white">{result.typedoc}</span>
                    </span>
                  )}
                  {result.datappro && (
                    <span className="text-white/50">
                      Approuvé · <span className="text-white">{result.datappro}</span>
                    </span>
                  )}
                </div>
                {result.libelong && (
                  <p className="mt-1 text-[11px] text-white/40">{result.libelong}</p>
                )}
              </div>

              {applied ? (
                <p className="mt-2 text-center text-xs text-green-400">
                  ✓ Données PLU appliquées — cliquez sur Enregistrer pour sauvegarder
                </p>
              ) : (
                <button
                  onClick={handleApply}
                  className="mt-2 w-full rounded-xl border border-[#7469F4]/30 bg-[#7469F4]/15 py-2 text-sm text-[#7469F4] transition-colors hover:bg-[#7469F4]/25"
                >
                  Appliquer ces données PLU au dossier
                </button>
              )}
            </>
          ) : (
            <p className="text-xs text-amber-400">
              Parcelle non trouvée dans le Géoportail de l&apos;Urbanisme — vérifiez l&apos;adresse.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
