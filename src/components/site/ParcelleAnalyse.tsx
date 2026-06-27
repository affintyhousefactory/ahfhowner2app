"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ParcelleData } from "@/app/api/parcelle/route";

export type { ParcelleData };

/* ── Turnstile ──────────────────────────────────────────────────── */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";
const TEST_KEYS = ["1x00000000000000000000AA", "2x00000000000000000000AB", "3x00000000000000000000FF"];
const CAPTCHA_REQUIRED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !TEST_KEYS.includes(SITE_KEY);

/* ── Étapes chargement ─────────────────────────────────────────── */

const STEPS_ADDRESS = [
  "Géocodage de l'adresse",
  "Identification de la parcelle cadastrale",
  "Consultation du Géoportail de l'Urbanisme",
  "Extraction des prescriptions et servitudes",
];

const STEPS_PARCELLE = [
  "Vérification de la référence parcellaire",
  "Consultation du Géoportail de l'Urbanisme",
  "Lecture du document d'urbanisme (PLU / CC)",
  "Extraction des prescriptions et servitudes",
];

/* ── Métadonnées zonage ─────────────────────────────────────────── */

const ZONE_META: Record<string, { label: string; feu: "green" | "amber" | "red" }> = {
  U:  { label: "Zone Urbaine",      feu: "green" },
  AU: { label: "Zone À Urbaniser",  feu: "amber" },
  A:  { label: "Zone Agricole",     feu: "red"   },
  N:  { label: "Zone Naturelle",    feu: "red"   },
};

const ETAT_LABELS: Record<string, string> = {
  opposable:   "Opposable",
  approuve:    "Approuvé",
  en_revision: "En révision",
  annule:      "Annulé",
  abroge:      "Abrogé",
};

/* ── Critères à confirmer terrain (hors GPU) ────────────────────── */

const CRITERIA_TO_VERIFY = [
  { label: "Accès voirie ≥ 3,5 m", detail: "passage camion-grue requis le jour de la pose" },
  { label: "Pente terrain ≤ 10 %", detail: "confirmée par étude géotechnique G2" },
  { label: "Réseaux eau + électricité", detail: "accessibles ou raccordement possible" },
  { label: "Assainissement", detail: "réseau collectif ou micro-station ANC (avis SPANC)" },
  { label: "Surface utile ≥ 200 m² (Arko One) · ≥ 300 m² (Arko Max)", detail: "selon règles de prospect du PLU" },
  { label: "Orientation sud / sud-ouest", detail: "baies toute hauteur — performance RE2020" },
  { label: "Nature du sol", detail: "sans roche affleurante, remblai non contrôlé ou ancienne décharge" },
  { label: "Absence de CU négatif", detail: "certificat d'urbanisme" },
];

/* ── Éligibilité ────────────────────────────────────────────────── */

type Verdict = "eligible" | "conditioned" | "ineligible";

type Eligibility = {
  verdict: Verdict;
  confirmedCriteria: string[];
  flags: { label: string; detail: string }[];
};

function computeEligibility(result: ParcelleData): Eligibility {
  const { typezone, prescriptions = [], servitudes = [] } = result;
  const allText = [...prescriptions, ...servitudes].join(" ").toLowerCase();

  if (typezone && !["U", "AU"].includes(typezone.toUpperCase())) {
    return { verdict: "ineligible", confirmedCriteria: [], flags: [] };
  }

  const confirmedCriteria: string[] = [];
  if (typezone) {
    confirmedCriteria.push(
      typezone === "U"
        ? "Zonage constructible — Zone Urbaine (U)"
        : "Zonage constructible — Zone À Urbaniser (AU)",
    );
  }
  confirmedCriteria.push("Autorisation urbanisme adaptée — DP (Arko One) ou PC (Arko Max)");
  if (result.typedoc && result.etat_doc) {
    confirmedCriteria.push(
      `${result.typedoc} ${ETAT_LABELS[result.etat_doc] ?? result.etat_doc}${result.datappro ? " — " + formatDate(result.datappro) : ""}`,
    );
  }

  const flags: { label: string; detail: string }[] = [];

  if (/ppri|risque inondation|plan de pr[eé]vention|zone inondable|crues/.test(allText)) {
    flags.push({
      label: "PPRI — Risque inondation",
      detail: "La constructibilité peut être restreinte ou conditionnée à des mesures parasismiques/hydrauliques.",
    });
  }
  if (/natura 2000|n2000|znieff/.test(allText)) {
    flags.push({
      label: "Natura 2000 / ZNIEFF",
      detail: "Zone de protection environnementale — impact à évaluer selon le type de protection.",
    });
  }
  if (/abf|architecte des b[aâ]timents|site patrimonial|monument historique|avap|spr|p[eé]rim[eè]tre de protection/.test(allText)) {
    flags.push({
      label: "Périmètre ABF — Architecte des Bâtiments de France",
      detail: "Les projets en périmètre ABF sont soumis à avis conforme ou simple. Peut conditionner le bardage.",
    });
  }

  return {
    verdict: flags.length > 0 ? "conditioned" : "eligible",
    confirmedCriteria,
    flags,
  };
}

/* ── Props ──────────────────────────────────────────────────────── */

type InputMode = "address" | "parcelle";

type Props = {
  mode: "full" | "compact";
  initialParcelle?: string;
};

/* ── Composant principal ────────────────────────────────────────── */

export function ParcelleAnalyse({ mode, initialParcelle = "" }: Props) {
  // Si un numéro de parcelle est pré-rempli (depuis le configurateur), partir en mode parcelle
  const defaultMode: InputMode = initialParcelle ? "parcelle" : "address";

  const [inputMode, setInputMode] = useState<InputMode>(defaultMode);
  const [inputValue, setInputValue] = useState(initialParcelle);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ParcelleData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const pendingRef = useRef<{ mode: InputMode; value: string } | null>(null);

  const isDark = mode === "full";
  const steps = inputMode === "address" ? STEPS_ADDRESS : STEPS_PARCELLE;

  function handleTurnstileSuccess(token: string) {
    setCaptchaToken(token);
    if (pendingRef.current) {
      const { mode: m, value: v } = pendingRef.current;
      pendingRef.current = null;
      doAnalyse(m, v, token);
    }
  }

  function handleTurnstileError() {
    pendingRef.current = null;
    setLoading(false);
    setErrorMsg("Vérification de sécurité échouée — réessayez.");
    turnstileRef.current?.reset();
    setCaptchaToken(null);
  }

  async function doAnalyse(iMode: InputMode, value: string, token: string | null) {
    setLoading(true);
    setStep(0);
    setResult(null);
    setErrorMsg(null);

    const activeSteps = iMode === "address" ? STEPS_ADDRESS : STEPS_PARCELLE;
    const tick = setInterval(() => setStep((s) => Math.min(s + 1, activeSteps.length)), 700);

    try {
      const payload =
        iMode === "address"
          ? { address: value, turnstileToken: token }
          : { parcelle: value, turnstileToken: token };

      const res = await fetch("/api/parcelle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(tick);
      setStep(activeSteps.length);
      setLoading(false);

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        const errCode = body.error;
        if (errCode === "invalid_input" || errCode === "invalid_parcelle") {
          setErrorMsg(
            iMode === "address"
              ? "Adresse non reconnue — saisissez une adresse plus précise (numéro + rue + ville)."
              : "Format non reconnu — vérifiez le numéro (ex : 6400530000A0123).",
          );
        } else if (errCode === "address_not_found") {
          setErrorMsg("Adresse introuvable — vérifiez la saisie ou essayez le numéro de parcelle directement.");
        } else if (errCode === "parcelle_not_found") {
          setErrorMsg("Aucune parcelle cadastrale trouvée à cette adresse. Essayez le numéro de parcelle directement.");
        } else if (errCode === "captcha_required" || errCode === "captcha_failed") {
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
      // Persiste pour le formulaire de réservation (compact mode = configurateur)
      if (mode === "compact" && data.found) {
        try { sessionStorage.setItem("plu_result", JSON.stringify(data)); } catch {}
      }
    } catch {
      clearInterval(tick);
      setLoading(false);
      setErrorMsg("Connexion impossible — vérifiez votre connexion et réessayez.");
    }
  }

  function handleAnalyse() {
    const value = inputValue.trim();
    if (!value) {
      setErrorMsg(
        inputMode === "address"
          ? "Saisissez l'adresse du terrain (numéro, rue, ville)."
          : "Saisissez un numéro de parcelle cadastrale (ex : 6400530000A0123).",
      );
      return;
    }
    if (inputMode === "address" && value.length < 5) {
      setErrorMsg("Adresse trop courte — saisissez une adresse plus précise.");
      return;
    }
    if (inputMode === "parcelle" && value.replace(/\s/g, "").length < 10) {
      setErrorMsg("Format non reconnu — vérifiez le numéro (ex : 6400530000A0123).");
      return;
    }

    setErrorMsg(null);
    setResult(null);

    if (CAPTCHA_REQUIRED && !captchaToken) {
      pendingRef.current = { mode: inputMode, value };
      setLoading(true);
      turnstileRef.current?.execute();
    } else {
      doAnalyse(inputMode, value, captchaToken);
    }
  }

  function switchMode(m: InputMode) {
    setInputMode(m);
    setInputValue("");
    setResult(null);
    setErrorMsg(null);
  }

  const inputCls = isDark
    ? "w-full rounded-full border border-canvas/20 bg-transparent px-5 py-3.5 text-sm text-canvas placeholder:text-canvas/35 outline-none focus:border-canvas/50 disabled:opacity-50"
    : "w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent placeholder:text-muted/50 disabled:opacity-50";

  const btnCls = cn(
    "shrink-0 inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-medium transition-colors disabled:opacity-50",
    isDark ? "bg-accent py-3.5 text-white hover:bg-accent/90" : "bg-accent py-2.5 text-white hover:bg-accent/90",
  );

  const resultPanelCls = isDark
    ? "mt-5 rounded-xl border border-canvas/15 bg-canvas/[0.04] p-5 md:p-6"
    : "mt-3 rounded-xl border border-line bg-surface/60 p-4";

  const placeholder =
    inputMode === "address"
      ? "Ex : 12 rue de la Paix, 64100 Bayonne"
      : "Ex : 6400530000A0123";

  return (
    <div>
      {/* Saisie */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={inputValue}
          onChange={(e) => {
            setInputValue(inputMode === "parcelle" ? e.target.value.toUpperCase() : e.target.value);
            setErrorMsg(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleAnalyse()}
          placeholder={placeholder}
          className={inputCls}
          disabled={loading}
          maxLength={inputMode === "address" ? 120 : 20}
          autoComplete={inputMode === "address" ? "street-address" : "off"}
          spellCheck={false}
          type="text"
          inputMode={inputMode === "address" ? "text" : "url"}
        />
        <button onClick={handleAnalyse} disabled={loading} className={btnCls}>
          {loading ? "Analyse…" : "Pré‑analyser"}
          {!loading && <Arrow />}
        </button>
      </div>

      {/* Bascule de mode */}
      <div className={cn("mt-2 flex items-center gap-1 font-mono text-[0.63rem]", isDark ? "text-canvas/40" : "text-muted/60")}>
        {inputMode === "address" ? (
          <>
            Saisie par adresse postale ·{" "}
            <button
              onClick={() => switchMode("parcelle")}
              className={cn("underline underline-offset-2 transition-opacity hover:opacity-80", isDark ? "text-canvas/60" : "text-muted/80")}
            >
              Saisir un numéro de parcelle
            </button>
          </>
        ) : (
          <>
            Saisie par numéro de parcelle ·{" "}
            <button
              onClick={() => switchMode("address")}
              className={cn("underline underline-offset-2 transition-opacity hover:opacity-80", isDark ? "text-canvas/60" : "text-muted/80")}
            >
              Revenir à la saisie par adresse
            </button>
          </>
        )}
      </div>

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

      {errorMsg && (
        <p className={cn("mt-3 text-xs", isDark ? "text-red-400" : "text-red-500")}>
          {errorMsg}
        </p>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.ul
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5 space-y-2.5"
          >
            {steps.map((s, i) => (
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

function FoundResult({
  result,
  mode,
  isDark,
}: {
  result: ParcelleData;
  mode: "full" | "compact";
  isDark: boolean;
}) {
  const eli = computeEligibility(result);
  const meta = result.typezone ? (ZONE_META[result.typezone.toUpperCase()] ?? null) : null;

  const textMuted = isDark ? "text-canvas/55" : "text-muted";
  const textBase  = isDark ? "text-canvas"    : "text-ink";
  const divider   = isDark ? "border-canvas/15" : "border-line";

  /* ── Mode compact (Configurateur) ── */
  if (mode === "compact") {
    const dot =
      eli.verdict === "eligible"    ? "bg-green-400" :
      eli.verdict === "conditioned" ? "bg-amber-400" :
                                      "bg-red-500";
    const label =
      eli.verdict === "eligible"    ? "Éligible" :
      eli.verdict === "conditioned" ? "Éligible avec conditions" :
                                      "Non constructible";
    return (
      <div>
        {result.address_label && (
          <p className={cn("mb-1.5 text-xs", textMuted)}>{result.address_label}</p>
        )}
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} />
          <span className={cn("text-sm font-medium", textBase)}>{label}</span>
        </div>
        <p className={cn("mt-1 text-xs leading-relaxed", textMuted)}>
          {result.zone_urba && <span>{result.zone_urba}</span>}
          {meta && <span> · {meta.label}</span>}
          {result.typedoc && <span> · {result.typedoc}</span>}
          {result.etat_doc && <span> {ETAT_LABELS[result.etat_doc] ?? result.etat_doc}</span>}
        </p>
        {eli.flags.length > 0 && (
          <p className={cn("mt-1 text-xs", isDark ? "text-amber-400" : "text-amber-600")}>
            ⚠ {eli.flags.map((f) => f.label).join(" · ")}
          </p>
        )}
        <p className={cn("mt-1 font-mono text-[0.6rem]", textMuted)}>
          Parcelle {result.parcelle} · Pré-analyse indicative
        </p>
      </div>
    );
  }

  /* ── Mode full (page terrain) — inéligible ── */
  if (eli.verdict === "ineligible") {
    return <IneligibleResult result={result} meta={meta} isDark={isDark} textBase={textBase} textMuted={textMuted} divider={divider} />;
  }

  /* ── Mode full — éligible / conditionné ── */
  return (
    <div>
      <EligibleHeader verdict={eli.verdict} isDark={isDark} />

      {/* Adresse géocodée + référence parcelle */}
      <div className={cn("mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t pt-4 font-mono text-xs", divider)}>
        {result.address_label && (
          <span className={textMuted}>
            Adresse · <span className={textBase}>{result.address_label}</span>
          </span>
        )}
        <span className={textMuted}>
          Parcelle · <span className={textBase}>{result.parcelle}</span>
        </span>
        {result.zone_urba && (
          <span className={textMuted}>
            Zone · <span className={textBase}>{result.zone_urba}{meta && ` (${result.typezone})`}</span>
          </span>
        )}
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
            Approuvé · <span className={textBase}>{formatDate(result.datappro)}</span>
          </span>
        )}
      </div>

      {/* Critères confirmés GPU */}
      <div className={cn("mt-5 border-t pt-4", divider)}>
        <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.12em]", textMuted)}>
          ✓ Critères vérifiés depuis le PLU
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {eli.confirmedCriteria.map((c, i) => (
            <li key={i} className={cn("flex items-start gap-2 text-xs", textBase)}>
              <span className="mt-0.5 shrink-0 text-green-400">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Points de vigilance */}
      {eli.flags.length > 0 && (
        <div className={cn("mt-5 border-t pt-4", divider)}>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-amber-400">
            ⚠ Points d&apos;attention identifiés
          </p>
          <ul className="mt-2.5 space-y-3">
            {eli.flags.map((f, i) => (
              <li key={i} className="text-xs">
                <span className="font-medium text-amber-400">{f.label}</span>
                <p className={cn("mt-0.5 leading-relaxed", textMuted)}>{f.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prescriptions GPU brutes */}
      {result.prescriptions && result.prescriptions.length > 0 && (
        <div className={cn("mt-5 border-t pt-4", divider)}>
          <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.12em]", textMuted)}>
            Prescriptions PLU ({result.prescriptions.length})
          </p>
          <ul className={cn("mt-2 space-y-1 text-xs", textMuted)}>
            {result.prescriptions.map((p, i) => (
              <li key={i} className="flex gap-2"><span className="shrink-0">·</span><span>{p}</span></li>
            ))}
          </ul>
        </div>
      )}

      {/* Servitudes GPU brutes */}
      {result.servitudes && result.servitudes.length > 0 && (
        <div className={cn("mt-5 border-t pt-4", divider)}>
          <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.12em]", textMuted)}>
            Servitudes d&apos;utilité publique ({result.servitudes.length})
          </p>
          <ul className={cn("mt-2 space-y-1 text-xs", textMuted)}>
            {result.servitudes.map((s, i) => (
              <li key={i} className="flex gap-2"><span className="shrink-0">·</span><span>{s}</span></li>
            ))}
          </ul>
        </div>
      )}

      {/* Critères à confirmer */}
      <div className={cn("mt-5 border-t pt-4", divider)}>
        <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.12em]", textMuted)}>
          À confirmer avec notre Mandataire Affinity
        </p>
        <ul className="mt-2.5 space-y-2">
          {CRITERIA_TO_VERIFY.map((c, i) => (
            <li key={i} className={cn("flex items-start gap-2 text-xs", textMuted)}>
              <span className="mt-0.5 shrink-0">◦</span>
              <span>
                <span className={isDark ? "text-canvas/80" : "text-ink/80"}>{c.label}</span>
                <span className="ml-1 text-[0.65rem]">— {c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <MandatairePitch verdict={eli.verdict} parcelle={result.parcelle} isDark={isDark} divider={divider} />
    </div>
  );
}

/* ── En-tête verdict ────────────────────────────────────────────── */

function EligibleHeader({ verdict, isDark }: { verdict: "eligible" | "conditioned"; isDark: boolean }) {
  if (verdict === "eligible") {
    return (
      <div className={cn("rounded-xl p-4", isDark ? "bg-green-400/10 border border-green-400/25" : "bg-green-50 border border-green-200")}>
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🎉</span>
          <p className={cn("font-semibold tracking-tight", isDark ? "text-green-300" : "text-green-700")}>
            Votre terrain est éligible à l&apos;Arko&nbsp;!
          </p>
        </div>
        <p className={cn("mt-2 text-sm leading-relaxed", isDark ? "text-canvas/70" : "text-green-800/80")}>
          Cette parcelle répond au critère fondamental : la zone PLU est constructible.
          Vous êtes éligible à l&apos;étude technique avec notre Mandataire Affinity.
        </p>
      </div>
    );
  }
  return (
    <div className={cn("rounded-xl p-4", isDark ? "bg-amber-400/10 border border-amber-400/25" : "bg-amber-50 border border-amber-200")}>
      <div className="flex items-center gap-2.5">
        <span className="text-lg">⚠️</span>
        <p className={cn("font-semibold tracking-tight", isDark ? "text-amber-300" : "text-amber-700")}>
          Zone constructible — points de vigilance
        </p>
      </div>
      <p className={cn("mt-2 text-sm leading-relaxed", isDark ? "text-canvas/70" : "text-amber-800/80")}>
        La zone PLU est constructible, mais des prescriptions identifiées méritent une analyse
        approfondie. Notre Mandataire Affinity peut évaluer leur impact réel sous 48 h.
      </p>
    </div>
  );
}

/* ── Pitch Mandataire + CTA ─────────────────────────────────────── */

function MandatairePitch({
  verdict,
  parcelle,
  isDark,
  divider,
}: {
  verdict: "eligible" | "conditioned";
  parcelle: string;
  isDark: boolean;
  divider: string;
}) {
  const textMuted = isDark ? "text-canvas/55" : "text-muted";
  const textBase  = isDark ? "text-canvas"    : "text-ink";

  return (
    <div className={cn("mt-5 border-t pt-4", divider)}>
      <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.12em]", textMuted)}>
        Votre Mandataire Partenaire Howner-Affinity
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {[
          "Qualification complète du terrain en 48 h (voirie, réseaux, sol, orientation)",
          "Accompagnement du dépôt de permis jusqu'à la réception",
          "Titulaire de la carte T — mandataire indépendant certifié",
          "Coordonne l'étude géotechnique G2 et la pose des micro-pieux",
          "Interlocuteur unique du terrain à la livraison",
        ].map((item, i) => (
          <li key={i} className={cn("flex items-start gap-2 text-xs", textBase)}>
            <span className="mt-0.5 shrink-0 text-accent">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className={cn("mt-4 rounded-lg p-3.5", isDark ? "bg-accent/10 border border-accent/25" : "bg-accent/5 border border-accent/20")}>
        <p className={cn("text-sm font-medium leading-snug", isDark ? "text-canvas" : "text-ink")}>
          {verdict === "eligible"
            ? "Votre terrain est prêt. Configurez votre Arko — votre Mandataire Affinity prend le relais."
            : "Les conditions sont analysables. Configurez votre Arko — votre Mandataire Affinity évalue les risques sous 48 h."}
        </p>
        <p className={cn("mt-1 text-xs", textMuted)}>
          Gratuit et sans engagement jusqu'à la signature du contrat de construction.
        </p>
      </div>

      <div className="mt-4">
        <a
          href={`/configurer?parcelle=${encodeURIComponent(parcelle)}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Configurer mon Arko avec cette parcelle
          <Arrow />
        </a>
      </div>
    </div>
  );
}

/* ── Zone non constructible ─────────────────────────────────────── */

function IneligibleResult({
  result,
  meta,
  isDark,
  textBase,
  textMuted,
  divider,
}: {
  result: ParcelleData;
  meta: { label: string; feu: "green" | "amber" | "red" } | null;
  isDark: boolean;
  textBase: string;
  textMuted: string;
  divider: string;
}) {
  return (
    <div>
      <div className={cn("rounded-xl p-4", isDark ? "bg-red-500/10 border border-red-500/25" : "bg-red-50 border border-red-200")}>
        <div className="flex items-center gap-2.5">
          <span className="text-lg">❌</span>
          <p className={cn("font-semibold tracking-tight", isDark ? "text-red-400" : "text-red-700")}>
            Zone non constructible en l&apos;état
          </p>
        </div>
        <p className={cn("mt-2 text-sm leading-relaxed", isDark ? "text-canvas/70" : "text-red-800/80")}>
          {result.address_label && <span className="block mb-1">{result.address_label}</span>}
          Cette parcelle est classée{" "}
          <strong>{result.zone_urba ?? result.typezone}</strong>
          {meta && ` — ${meta.label}`}.
          La construction d&apos;une maison neuve y est très limitée, voire interdite, en l&apos;état du document d&apos;urbanisme.
        </p>
      </div>

      <div className={cn("mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t pt-4 font-mono text-xs", divider)}>
        <span className={textMuted}>Parcelle · <span className={textBase}>{result.parcelle}</span></span>
        {result.typedoc && <span className={textMuted}>Document · <span className={textBase}>{result.typedoc}</span></span>}
        {result.etat_doc && <span className={textMuted}>État · <span className={textBase}>{ETAT_LABELS[result.etat_doc] ?? result.etat_doc}</span></span>}
      </div>

      <div className={cn("mt-4 border-t pt-4", divider)}>
        <p className={cn("text-sm leading-relaxed", textMuted)}>
          Si vous cherchez un terrain compatible Arko, notre{" "}
          <strong className={isDark ? "text-canvas" : "text-ink"}>Pack Recherche Terrain</strong>{" "}
          confie la mission à un Mandataire Partenaire Affinity qualifié — off-market inclus.
        </p>
        <a
          href="/terrain#search"
          className={cn(
            "mt-4 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors",
            isDark
              ? "border-canvas/25 text-canvas hover:border-canvas/60"
              : "border-line text-ink hover:border-ink/40",
          )}
        >
          Lancer ma recherche de terrain
          <Arrow />
        </a>
      </div>
    </div>
  );
}

/* ── Parcelle introuvable dans le GPU ───────────────────────────── */

function NotFoundResult({ parcelle, isDark }: { parcelle: string; isDark: boolean }) {
  const textMuted = isDark ? "text-canvas/55" : "text-muted";
  return (
    <div>
      <div className={cn("rounded-xl p-4", isDark ? "bg-red-500/10 border border-red-500/25" : "bg-red-50 border border-red-200")}>
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🔍</span>
          <p className={cn("font-semibold tracking-tight", isDark ? "text-red-400" : "text-red-700")}>
            Parcelle non référencée dans le GPU
          </p>
        </div>
        <p className={cn("mt-2 text-sm leading-relaxed", isDark ? "text-canvas/70" : "text-red-800/80")}>
          Le numéro <span className="font-mono">{parcelle}</span> n&apos;est pas trouvé dans le
          Géoportail de l&apos;Urbanisme. Le document d&apos;urbanisme de cette commune n&apos;est
          peut-être pas encore numérisé.
        </p>
      </div>
      <ul className={cn("mt-3 space-y-1 text-xs", textMuted)}>
        <li>· Vérifiez le numéro sur <a href="https://cadastre.gouv.fr" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">cadastre.gouv.fr</a></li>
        <li>· Consultez le PLU de la commune directement en mairie</li>
        <li>· Contactez-nous : notre architecte intégrée analyse votre terrain manuellement</li>
      </ul>
    </div>
  );
}

/* ── Utilitaire ─────────────────────────────────────────────────── */

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}
