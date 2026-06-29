"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";
import { ContratCanvas, type ContratData } from "@/shared/components/mandataire/ContratCanvas";
import { generateContratPdf } from "@/shared/lib/contrat-pdf";

export default function ContratPage() {
  const router = useRouter();
  const [mandataireId, setMandataireId] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("mandataires")
        .select("id, contrat_signe_at")
        .eq("user_id", session.user.id)
        .single();

      if (data?.contrat_signe_at) {
        setAlreadySigned(true);
      } else if (data?.id) {
        setMandataireId(data.id);
      }
      setLoading(false);
    };

    load();
  }, []);

  const handleComplete = async (contratData: ContratData) => {
    if (!mandataireId) return;
    setSaving(true);
    setError("");

    const supabase = getSupabaseBrowser();
    const now = new Date();
    const fileName = `${mandataireId}/contrat-${now.toISOString().slice(0, 10)}.pdf`;

    // 1. Générer le PDF
    let contratUrl: string | null = null;
    try {
      const pdfBlob = await generateContratPdf(contratData);
      const { error: uploadError } = await supabase.storage
        .from("mandataires-documents")
        .upload(fileName, pdfBlob, { contentType: "application/pdf", upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("mandataires-documents")
          .getPublicUrl(fileName);
        contratUrl = urlData?.publicUrl ?? null;
      }
    } catch {
      // PDF non bloquant — on continue sans URL
    }

    // 2. Mettre à jour le profil
    const { error: dbError } = await supabase
      .from("mandataires")
      .update({
        contrat_signe_at: now.toISOString(),
        contrat_data: contratData,
        contrat_url: contratUrl,
        reseau_carte_t: contratData.reseau_carte_t || null,
        carte_t_numero: contratData.carte_t_numero || null,
        siret: contratData.siret,
        forme_juridique: contratData.forme_juridique,
        adresse: contratData.adresse,
      })
      .eq("id", mandataireId);

    if (dbError) {
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
      setSaving(false);
      return;
    }

    router.push("/mandataire/documents");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
      </div>
    );
  }

  if (alreadySigned) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="text-2xl">✓</p>
        <h1 className="mt-3 text-xl font-semibold text-gray-900">Contrat déjà signé</h1>
        <p className="mt-2 text-sm text-gray-500">Votre contrat-cadre AHF est enregistré.</p>
        <button
          onClick={() => router.push("/mandataire")}
          className="mt-6 rounded-xl bg-[#7469F4] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5a54d4] transition-colors"
        >
          Retour au dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
          Contrat-cadre
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Signer votre contrat</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complétez et signez votre contrat-cadre de sous-traitance AHF pour activer votre compte.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <ContratCanvas
          onComplete={handleComplete}
          className={saving ? "pointer-events-none opacity-60" : ""}
        />
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
