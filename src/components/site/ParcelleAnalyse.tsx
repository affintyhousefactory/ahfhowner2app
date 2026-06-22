"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ParcelleData } from "@/app/api/parcelle/route";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";
const TEST_KEYS = ["1x00000000000000000000AA", "2x00000000000000000000AB", "3x00000000000000000000FF"];
const CAPTCHA_REQUIRED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !TEST_KEYS.includes(SITE_KEY);

const STEPS = [
  "Vérification de la référence parcellaire",
  "Consultation du Géoportail de l'Urbanisme",
  "Lecture du document d'urbanisme (PLU / CC)",
  "Extraction des prescriptions et servitudes",
];

const ZONE_META: Record<string, { label: string; note: string; feu: "green" | "amber" | "red" }> = {
  U:  { label: "Zone Urbaine",      note: "Généralement constructible — à confirmer avec notre architecte intégrée.", feu: "green"  },
  AU: { label: "Zone À Urbaniser",  note: "Constructible sous conditions d'OAP — à valider avec notre architecte.",  feu: "amber"  },
  A:  { label: "Zone Agricole",     note: "Constructibilité très limitée — projet difficile en l'état.",              feu: "red"    },
  N:  { label: "Zone Naturelle",    note: "Non constructible en principe — exceptions réglementaires possibles.",      feu: "red"    },
};

const ETAT_LABELS: Record<string, string> = {
  opposable: "Opposable",
  approuve: "Approuvé",
  en_revision: "En révision",
  annule: "Annulé",
  abroge: "Abrogé",
};

export type { ParcelleData };

type Props = {
  mode: "full" | "compact";
  initialParcelle?: string;
};

export function ParcelleAnalyse({ mode, initialParcelle = "" }: Props) {
  const [parcelle, setParcelle] = useState(initialParcelle);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ParcelleData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const pendingRef = useRef<string | null>(null);

  const isDark = mode === "full";

  function handleTurnstileSuccess(token: string) {
    setCaptchaToken(token);
    if (pendingRef.current !== null) {
      const p = pendingRef.current;
      pendingRef.current = null;
      doAnalyse(p, token);
    }
  }

  function handleTurnstileError() {
    pendingRef.current = null;
    setLoading(false);
    setErrorMsg("Vérification de sécurité échouée — réessayez.");
    turnstileRef.current?.reset();
    setCaptchaToken(null);
  }

  async function doAnalyse(val: string, token: string | null) {
    setLoading(true);
    setStep(0);
    setResult(null);
    setErrorMsg(null);

    const tick = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length)), 700);

    try {
      const res = await fetch("/api/parcelle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelle: val, turnstileToken: token }),
      });

      clearInterval(tick);
      setStep(STEPS.length);
      setLoading(false);

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (body.error === "invalid_parcelle") {
          setErrorMsg("Format non reconnu — vérifiez le numéro (ex : 6400530000A0123).");
        } else if (body.error === "captcha_required" || body.error === "captcha_failed") {
          setErrorMsg("Vérification de sécurité échouée — réessayez.");
          turnstileRef.current?.reset();
          setCaptchaToken(null);
        } else if (res.status === 503) {
          setErrorMsg("Le Géoportail de l'Urbanisme est temporairement indisponible.");
        } else {
          setErrorMsg("Erreur lors de l'analyse — réessayez.");
        }
        return;
      }

      const data = (await res.json()) as ParcelleData;
      setResult(data);
    } catch {
      clearInterval(tick);
      setLoading(false);
      setErrorMsg("Connexion impossible — vérifiez votre connexion et réessayez.");
    }
  }

  function handleAnalyse() {
    const val = parcelle.trim().toUpperCase().replace(/\s/g, "");
    if (val.length < 10) {
      setErrorMsg("Saisissez un numéro de parcelle cadastrale (ex : 6400530000A0123).");
      return;
    }
    setErrorMsg(null);
    setResult(null);

    if (CAPTCHA_REQUIRED && !captchaToken) {
      pendingRef.current = val;
      setLoading(true);
      turnstileRef.current?.execute();
    } else {
      doAnalyse(val, captchaToken);
    }
  }

  const inputCls = isDark
    ? "w-full rounded-full border border-canvas/20 bg-transparent px-5 py-3.5 text-sm text-canvas placeholder:text-canvas/35 outline-none focus:border-canvas/50 disabled:opacity-50"
    : "w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent placeholder:text-muted/50 disabled:opacity-50";

  const btnCls = cn(
    "shrink-0 inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-medium transition-colors disabled:opacity-50",
    isDark ? "bg-accent py-3.5 text-white hover:bg-accent/90" : "bg-accent py-2.5 text-white hover:bg-accent/90",
  );

  const resultPanelCls = isDark
    ? "mt-5 rounded-xl border border-canvas/15 bg-canvas/[0.04] p-5"
    : "mt-3 rounded-xl border border-line bg-surface/60 p-4";

  return (
    <div>
      {/* Saisie */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={parcelle}
          onChange={(e) => { setParcelle(e.target.value.toUpperCase()); setErrorMsg(null); }}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleAnalyse()}
          placeholder="Ex : 6400530000A0123"
          className={inputCls}
          disabled={loading}
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
        />
        <button onClick={handleAnalyse} disabled={loading} className={btnCls}>
          {loading ? "Analyse…" : "Pré‑analyser"}
          {!loading && <Arrow />}
        </button>
      </div>

      {/* Hint format */}
      <p className={cn("mt-2 font-mono text-[0.65rem]", isDark ? "text-canvas/45" : "text-muted/70")}>
        Référence cadastrale française — département + commune + préfixe + section + n°
      </p>

      {/* Turnstile invisible */}
      <Turnstile
        ref={turnstileRef}
        siteKey={SITE_KEY}
        onSuccess={handleTurnstileSuccess}
        onError={handleTurnstileError}
        onExpire={() => { setCaptchaToken(null); pendingRef.current = null; setLoading(false); }}
        options={{ theme: isDark ? "dark" : "light", size: "invisible", execution: "execute" }}
        className="mt-1"
      />

      {/* Message d'erreur */}
      {errorMsg && (
        <p className={cn("mt-3 text-xs", isDark ? "text-red-400" : "text-red-500")}>
          {errorMsg}
        </p>
      )}

      <AnimatePresence mode="wait">
        {/* Étapes chargement */}
        {loading && (
          <motion.ul
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5 space-y-2.5"
          >
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={cn(
                  "flex items-center gap-3 font-mono text-xs transition-colors",
                  i < step
                    ? isDark ? "text-canvas" : "text-ink"
                    : isDark ? "text-canvas/30" : "text-muted/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    i < step
                      ? "border-accent bg-accent text-ink"
                      : isDark ? "border-canvas/25" : "border-line",
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

        {/* Résultat */}
        {!loading && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={resultPanelCls}
          >
            {result.found ? (
              <FoundResult result={result} mode={mode} isDark={isDark} />
            ) : (
              <NotFoundResult parcelle={result.parcelle} isDark={isDark} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Résultat trouvé ────────────────────────────────────────────── */

function FoundResult({ result, mode, isDark }: { result: ParcelleData; mode: "full" | "compact"; isDark: boolean }) {
  const meta = result.typezone ? (ZONE_META[result.typezone] ?? null) : null;
  const dotCls =
    meta?.feu === "green" ? "bg-green-400" :
    meta?.feu === "amber" ? "bg-amber-400" :
    meta?.feu === "red"   ? "bg-red-500" :
                            "bg-amber-400";

  const textMuted = isDark ? "text-canvas/55" : "text-muted";
  const textBase  = isDark ? "text-canvas"    : "text-ink";

  if (mode === "compact") {
    return (
      <div>
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full shrink-0", dotCls)} />
          <span className={cn("text-sm font-medium", textBase)}>
            {result.zone_urba ?? "—"}
            {meta && <span className={cn("ml-1 font-normal", textMuted)}>· {meta.label}</span>}
          </span>
        </div>
        <p className={cn("mt-1.5 text-xs leading-relaxed", textMuted)}>
          {result.typedoc && <span>{result.typedoc}</span>}
          {result.etat_doc && <span> · {ETAT_LABELS[result.etat_doc] ?? result.etat_doc}</span>}
          {result.datappro && <span> · approuvé le {formatDate(result.datappro)}</span>}
        </p>
        <p className={cn("mt-1 font-mono text-[0.65rem]", textMuted)}>Pré-analyse indicative — à confirmer.</p>
      </div>
    );
  }

  // mode === "full"
  return (
    <div>
      {/* En-tête zone */}
      <div className="flex items-start gap-3">
        <span className={cn("mt-1 h-2.5 w-2.5 rounded-full shrink-0", dotCls)} />
        <div>
          <p className={cn("font-medium", textBase)}>
            {result.zone_urba ?? "Zone inconnue"}
            {result.typezone && <span className={cn("ml-2 font-mono text-sm font-normal", textMuted)}>({result.typezone})</span>}
          </p>
          {meta && <p className={cn("mt-0.5 text-sm", textMuted)}>{meta.label}</p>}
        </div>
      </div>

      {/* Référence et état du document */}
      <div className={cn("mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t pt-4 font-mono text-xs", isDark ? "border-canvas/15" : "border-line")}>
        <span className={textMuted}>
          Parcelle · <span className={textBase}>{result.parcelle}</span>
        </span>
        {result.typedoc && (
          <span className={textMuted}>
            Document · <span className={textBase}>{result.typedoc}</span>
          </span>
        )}
        {result.etat_doc && (
          <span className={textMuted}>
            État · <span className={textBase}>{ETAT_LABELS[result.etat_doc] ?? result.etat_doc}</span>
          </span>
        )}
        {result.datappro && (
          <span className={textMuted}>
            Approuvé le · <span className={textBase}>{formatDate(result.datappro)}</span>
          </span>
        )}
      </div>

      {/* Libellé long */}
      {result.libelle_long && (
        <p className={cn("mt-3 text-sm leading-relaxed", textMuted)}>{result.libelle_long}</p>
      )}

      {/* Note constructibilité */}
      {meta && (
        <p className={cn("mt-3 text-sm", meta.feu === "green" ? "text-green-400" : meta.feu === "amber" ? "text-amber-400" : "text-red-400")}>
          {meta.note}
        </p>
      )}

      {/* Prescriptions */}
      {result.prescriptions && result.prescriptions.length > 0 && (
        <div className={cn("mt-4 border-t pt-4", isDark ? "border-canvas/15" : "border-line")}>
          <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.12em]", textMuted)}>
            Prescriptions ({result.prescriptions.length})
          </p>
          <ul className={cn("mt-2 space-y-1 text-xs", textMuted)}>
            {result.prescriptions.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Servitudes */}
      {result.servitudes && result.servitudes.length > 0 && (
        <div className={cn("mt-4 border-t pt-4", isDark ? "border-canvas/15" : "border-line")}>
          <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.12em]", textMuted)}>
            Servitudes d&apos;utilité publique ({result.servitudes.length})
          </p>
          <ul className={cn("mt-2 space-y-1 text-xs", textMuted)}>
            {result.servitudes.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0">·</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA full uniquement */}
      <div className={cn("mt-5 border-t pt-4", isDark ? "border-canvas/15" : "border-line")}>
        <a
          href={`/configurer?parcelle=${encodeURIComponent(result.parcelle)}`}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Configurer mon Arko avec cette parcelle
          <Arrow />
        </a>
        <p className={cn("mt-3 font-mono text-[0.65rem] leading-relaxed", isDark ? "text-canvas/40" : "text-muted/60")}>
          Données Géoportail de l&apos;Urbanisme (GPU) — pré-analyse indicative. Constructibilité définitive validée par notre architecte intégrée.
        </p>
      </div>
    </div>
  );
}

/* ── Parcelle non trouvée ───────────────────────────────────────── */

function NotFoundResult({ parcelle, isDark }: { parcelle: string; isDark: boolean }) {
  const textMuted = isDark ? "text-canvas/55" : "text-muted";
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
        <p className={cn("font-medium", isDark ? "text-canvas" : "text-ink")}>Parcelle introuvable</p>
      </div>
      <p className={cn("mt-2 text-sm leading-relaxed", textMuted)}>
        Le numéro <span className="font-mono">{parcelle}</span> n&apos;est pas référencé dans le Géoportail de l&apos;Urbanisme.
      </p>
      <ul className={cn("mt-2 space-y-1 text-xs", textMuted)}>
        <li>· Vérifiez le numéro sur <a href="https://cadastre.gouv.fr" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">cadastre.gouv.fr</a></li>
        <li>· Le document d&apos;urbanisme de cette commune n&apos;est peut-être pas encore numérisé</li>
        <li>· Contactez-nous pour une analyse manuelle avec notre architecte intégrée</li>
      </ul>
    </div>
  );
}

/* ── Utilitaire ─────────────────────────────────────────────────── */

function formatDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}
