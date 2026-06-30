"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ContratCanvas, type ContratData } from "@/shared/components/mandataire/ContratCanvas";
import { generateContratPdf } from "@/shared/lib/contrat-pdf";

interface PrefillData {
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
    let pdfBase64: string | null = null;
    try {
      const pdfBlob = await generateContratPdf(contratData);
      const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      pdfBase64 = btoa(binary);
    } catch {
      // non-bloquant
    }

    // 2. Sauvegarder via endpoint token-authentifié
    try {
      const res = await fetch("/api/onboarding/mandataire/contrat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, contratData, pdfBase64 }),
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
          <p className="text-sm text-white/50">
            Merci {prefill?.prenom}. Votre contrat-cadre est enregistré. L'équipe Affinity House Factory
            validera votre compte et vous contactera très prochainement.
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
