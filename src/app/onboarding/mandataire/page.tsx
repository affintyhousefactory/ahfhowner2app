"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ContratCanvas, type ContratData } from "@/shared/components/mandataire/ContratCanvas";
import { generateContratPdf } from "@/shared/lib/contrat-pdf";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

interface PrefillData {
  mandataire_id: string;
  prenom: string;
  nom: string;
  email: string;
  tel?: string;
}

function OnboardingForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [status, setStatus]       = useState<"loading" | "ready" | "invalid" | "done">("loading");
  const [tokenError, setTokenError] = useState("");
  const [prefill, setPrefill]     = useState<PrefillData | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!token) { setStatus("invalid"); setTokenError("Lien invalide."); return; }
    fetch(`/api/onboarding/mandataire?token=${token}`)
      .then((r) => r.json())
      .then((data: PrefillData & { error?: string }) => {
        if (data.error) { setStatus("invalid"); setTokenError(data.error); return; }
        setPrefill(data);
        setStatus("ready");
      })
      .catch(() => { setStatus("invalid"); setTokenError("Erreur réseau."); });
  }, [token]);

  const handleComplete = async (contratData: ContratData) => {
    setSaving(true);
    setError("");

    // 1. Générer le PDF côté client
    let pdfStoragePath: string | null = null;
    try {
      const pdfBlob = await generateContratPdf(contratData);
      const date = new Date().toISOString().slice(0, 10);
      const filePath = `${prefill!.mandataire_id}/contrat-${date}.pdf`;
      const supabase = getSupabaseBrowser();
      const { error: uploadErr } = await supabase.storage
        .from("mandataires-documents")
        .upload(filePath, pdfBlob, { contentType: "application/pdf", upsert: true });
      if (!uploadErr) pdfStoragePath = filePath;
    } catch {
      // non-bloquant
    }

    // 2. Sauvegarder via endpoint token-authentifié
    try {
      const res = await fetch("/api/onboarding/mandataire/contrat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, contratData, pdfStoragePath }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Erreur serveur");
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  /* ── États de navigation ─────────────────────────────────────────────── */

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
            <a href="mailto:contact@affinityhousefactory.com" className="text-[#7469F4] underline">
              contact@affinityhousefactory.com
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
          <p className="text-lg font-semibold text-white mb-2">Contrat signé — dossier soumis</p>
          <p className="text-sm text-white/50 mb-6">
            Merci {prefill?.prenom}. Votre contrat-cadre est enregistré et votre dossier est en cours de validation par l'équipe Affinity House Factory.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Prochaines étapes</p>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7469F4]/20 text-[10px] font-bold text-[#7469F4]">1</span>
              <p className="text-sm text-white/60">L'équipe AHF valide votre dossier (sous 48h ouvrées).</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7469F4]/20 text-[10px] font-bold text-[#7469F4]">2</span>
              <p className="text-sm text-white/60">Vous recevez un email à <span className="text-white">{prefill?.email}</span> avec un lien pour créer votre mot de passe.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7469F4]/20 text-[10px] font-bold text-[#7469F4]">3</span>
              <p className="text-sm text-white/60">Vous accédez à votre espace mandataire pour suivre vos dossiers.</p>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/20">
            Une question ?{" "}
            <a href="mailto:contact@affinityhousefactory.com" className="text-[#7469F4] underline">
              contact@affinityhousefactory.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  /* ── Formulaire ContratCanvas ────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[#f4f4f0] py-12 px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7469F4] mb-2">
            HOWNER · Affinity House Factory
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">Signez votre contrat-cadre</h1>
          <p className="mt-2 text-sm text-gray-500">
            Bonjour {prefill?.prenom}, complétez et signez votre contrat pour finaliser votre inscription.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <ContratCanvas
            onComplete={handleComplete}
            prefill={prefill ?? undefined}
            className={saving ? "pointer-events-none opacity-60" : ""}
          />
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
        </div>
      </div>
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
