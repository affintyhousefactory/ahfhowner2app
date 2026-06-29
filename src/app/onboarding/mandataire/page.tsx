"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/cn";

const RESEAUX_CARTE_T = [
  "Réseau indépendant (carte T propre)",
  "FNAIM",
  "Century 21",
  "IAD",
  "Megagence",
  "3G Immo",
  "Safti",
  "Capifrance",
  "Optimhome",
  "Autre réseau",
];

interface PrefillData {
  prenom: string;
  nom: string;
  email: string;
  tel?: string;
  zone_activite?: string[];
}

interface PappersResult {
  nom_entreprise: string;
  forme_juridique: string;
  adresse: string;
  siren: string;
  cessee: boolean;
  dirigeant: { prenom: string; nom: string; qualite: string } | null;
}

function OnboardingForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "ready" | "invalid" | "done">("loading");
  const [tokenError, setTokenError] = useState("");
  const [prefill, setPrefill] = useState<PrefillData | null>(null);

  // Form state
  const [siret, setSiret] = useState("");
  const [formeJuridique, setFormeJuridique] = useState("");
  const [adresse, setAdresse] = useState("");
  const [pappersLoading, setPappersLoading] = useState(false);
  const [pappersError, setPappersError] = useState<string | null>(null);
  const [pappersResult, setPappersResult] = useState<PappersResult | null>(null);
  const [reseauCarteT, setReseauCarteT] = useState("");
  const [carteTNumero, setCarteTNumero] = useState("");
  const [zones, setZones] = useState<string[]>([]);
  const [zoneInput, setZoneInput] = useState("");
  const zoneRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setStatus("invalid"); setTokenError("Lien invalide."); return; }
    fetch(`/api/onboarding/mandataire?token=${token}`)
      .then((r) => r.json())
      .then((data: PrefillData & { error?: string }) => {
        if (data.error) { setStatus("invalid"); setTokenError(data.error); return; }
        setPrefill(data);
        setZones(data.zone_activite ?? []);
        setStatus("ready");
      })
      .catch(() => { setStatus("invalid"); setTokenError("Erreur réseau."); });
  }, [token]);

  async function lookupPappers() {
    const siren = siret.replace(/\s/g, "").slice(0, 9);
    if (siren.length !== 9) { setPappersError("SIREN = 9 premiers chiffres du SIRET"); return; }
    setPappersLoading(true); setPappersError(null); setPappersResult(null);
    try {
      const res = await fetch(`/api/admin/pappers?siren=${siren}`);
      const data = (await res.json()) as PappersResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur Pappers");
      setPappersResult(data);
      if (data.forme_juridique && !formeJuridique) setFormeJuridique(data.forme_juridique);
      if (data.adresse && !adresse) setAdresse(data.adresse);
    } catch (e) {
      setPappersError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPappersLoading(false);
    }
  }

  function addZone(value: string) {
    const v = value.trim();
    if (v && !zones.includes(v)) setZones((z) => [...z, v]);
    setZoneInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setSubmitError(null);
    try {
      const res = await fetch("/api/onboarding/mandataire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, siret: siret || null, forme_juridique: formeJuridique || null,
          adresse: adresse || null, reseau_carte_t: reseauCarteT || null,
          carte_t_numero: carteTNumero || null, zone_activite: zones,
          description: description || null,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      setStatus("done");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a18]">
        <p className="text-sm text-white/40">Vérification du lien…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a18] p-6">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-white mb-2">Lien invalide</p>
          <p className="text-sm text-white/40">{tokenError}</p>
          <p className="mt-4 text-xs text-white/20">
            Si vous pensez que c'est une erreur, contactez{" "}
            <a href="mailto:contact@affinityhome.fr" className="text-[#7469F4] underline">
              contact@affinityhome.fr
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a18] p-6">
        <div className="max-w-md text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#2d6b27]/30">
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-white mb-2">Profil soumis</p>
          <p className="text-sm text-white/50">
            Merci {prefill?.prenom}. Votre dossier est en cours de validation par l'équipe Affinity House Factory.
            Vous recevrez un email dès que votre compte est activé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a18] py-12 px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7469F4] mb-2">HOWNER · Affinity House Factory</p>
          <h1 className="text-2xl font-semibold text-white">Complétez votre profil mandataire</h1>
          <p className="mt-2 text-sm text-white/40">
            Bonjour {prefill?.prenom}, renseignez les informations ci-dessous pour finaliser votre inscription.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identité — pré-remplie, lecture seule */}
          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Identité (pré-remplie)</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ReadField label="Prénom" value={prefill?.prenom ?? ""} />
              <ReadField label="Nom" value={prefill?.nom ?? ""} />
              <ReadField label="Email" value={prefill?.email ?? ""} className="col-span-2" />
            </div>
          </div>

          {/* Entreprise + Pappers */}
          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Entreprise</h2>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-white/40">SIRET</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={siret}
                  onChange={(e) => { setSiret(e.target.value); setPappersResult(null); }}
                  placeholder="xxx xxx xxx xxxxx"
                  maxLength={17}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4] font-mono"
                />
                <button type="button" onClick={lookupPappers}
                  disabled={pappersLoading || siret.replace(/\s/g, "").length < 9}
                  className="rounded-xl bg-[#7469F4]/20 px-4 py-2.5 text-sm text-[#7469F4] hover:bg-[#7469F4]/30 disabled:opacity-40 whitespace-nowrap">
                  {pappersLoading ? "…" : "Vérifier"}
                </button>
              </div>
              {pappersError && <p className="mt-1 text-xs text-red-400">{pappersError}</p>}
            </div>
            {pappersResult && (
              <div className={cn("mb-4 rounded-xl border p-3 text-sm",
                pappersResult.cessee ? "border-red-500/30 bg-red-500/5" : "border-[#7469F4]/30 bg-[#7469F4]/5")}>
                <p className="font-medium text-white">{pappersResult.nom_entreprise}</p>
                <p className="text-xs text-white/50 mt-0.5">{pappersResult.forme_juridique} · SIREN {pappersResult.siren}</p>
                {pappersResult.adresse && <p className="text-xs text-white/40 mt-1">{pappersResult.adresse}</p>}
                {pappersResult.cessee && <p className="mt-1 text-xs font-medium text-red-400">⚠ Entreprise cessée</p>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <EditField label="Forme juridique" value={formeJuridique} onChange={setFormeJuridique} />
              <div className="col-span-2">
                <EditField label="Adresse siège" value={adresse} onChange={setAdresse} />
              </div>
            </div>
          </div>

          {/* Carte T + Zone — 2 colonnes */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Carte T</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-white/40">Réseau / détenteur</label>
                  <select value={reseauCarteT} onChange={(e) => setReseauCarteT(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4]">
                    <option value="">— Sélectionner —</option>
                    {RESEAUX_CARTE_T.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <EditField label="Numéro carte T" value={carteTNumero} onChange={setCarteTNumero} placeholder="CPI 75 2025 000 XXX" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Zone d'activité</h2>
              <p className="mb-2 text-xs text-white/30">Entrée ou virgule pour ajouter.</p>
              {zones.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {zones.map((z) => (
                    <span key={z} className="flex items-center gap-1.5 rounded-full bg-[#7469F4]/20 px-3 py-1 text-xs text-[#7469F4]">
                      {z}
                      <button type="button" onClick={() => setZones((prev) => prev.filter((x) => x !== z))} className="opacity-60 hover:opacity-100">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input ref={zoneRef} type="text" value={zoneInput}
                  onChange={(e) => setZoneInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addZone(zoneInput); } }}
                  placeholder="ex: 64, Bayonne…"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4]" />
                <button type="button" onClick={() => addZone(zoneInput)} disabled={!zoneInput.trim()}
                  className="rounded-xl bg-white/10 px-3 py-2.5 text-sm text-white/60 hover:bg-white/15 disabled:opacity-40">+</button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">À propos (optionnel)</h2>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="Votre profil, vos spécialités, zones de prédilection…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] placeholder:text-white/20" />
          </div>

          {submitError && <p className="text-sm text-red-400">{submitError}</p>}

          <button type="submit" disabled={submitting}
            className="w-full rounded-xl bg-[#7469F4] py-3 text-sm font-medium text-white transition-opacity disabled:opacity-40">
            {submitting ? "Envoi en cours…" : "Soumettre mon profil"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ReadField({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1 text-xs text-white/30">{label}</p>
      <p className="rounded-xl border border-white/5 bg-white/5 px-3 py-2.5 text-sm text-white/60">{value || "—"}</p>
    </div>
  );
}

function EditField({ label, value, onChange, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4]" />
    </div>
  );
}

export default function OnboardingMandatairePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a18]">
        <p className="text-sm text-white/40">Chargement…</p>
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  );
}
