"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";
import { ContratCanvas, type ContratData } from "@/shared/components/mandataire/ContratCanvas";
import { generateContratPdf } from "@/shared/lib/contrat-pdf";

type MandatairePrefill = {
  prenom?: string;
  nom?: string;
  email?: string;
  tel?: string;
  siret?: string;
  forme_juridique?: string;
  adresse?: string;
  reseau_carte_t?: string;
  carte_t_numero?: string;
};

export default function ContratPage() {
  const router = useRouter();
  const [mandataireId, setMandataireId] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<MandatairePrefill>({});
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
        .select("id, contrat_signe_at, prenom, nom, email, tel, siret, forme_juridique, adresse, reseau_carte_t, carte_t_numero")
        .eq("user_id", session.user.id)
        .single();

      if (data?.contrat_signe_at) {
        setAlreadySigned(true);
      } else if (data?.id) {
        setMandataireId(data.id);
        setPrefill({
          prenom:         data.prenom         ?? undefined,
          nom:            data.nom            ?? undefined,
          email:          data.email          ?? session.user.email ?? undefined,
          tel:            data.tel            ?? undefined,
          siret:          data.siret          ?? undefined,
          forme_juridique: data.forme_juridique ?? undefined,
          adresse:        data.adresse        ?? undefined,
          reseau_carte_t: data.reseau_carte_t ?? undefined,
          carte_t_numero: data.carte_t_numero ?? undefined,
        });
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
        contrat_signe_at:    now.toISOString(),
        contrat_data:        contratData,
        contrat_url:         contratUrl,
        // Identité
        tel:                 contratData.tel || null,
        // Entreprise & Carte T
        reseau_carte_t:      contratData.reseau_carte_t || null,
        carte_t_numero:      contratData.carte_t_numero || null,
        siret:               contratData.siret || null,
        forme_juridique:     contratData.forme_juridique || null,
        adresse:             contratData.adresse || null,
        // Statut professionnel
        statut_professionnel: contratData.statut_professionnel || null,
        reseau_type:          contratData.reseau_type || null,
        // Adresse principale + géoloc
        adresse_principale:  contratData.adresse_principale || null,
        cp_principal:        contratData.cp_principal || null,
        ville_principale:    contratData.ville_principale || null,
        lat:                 contratData.lat ?? null,
        lon:                 contratData.lon ?? null,
        // Profil d'intervention
        rayon_intervention:  contratData.rayon_intervention || null,
        delai_rappel:        contratData.delai_rappel || null,
        specialites:         contratData.specialites.length > 0 ? contratData.specialites : null,
      })
      .eq("id", mandataireId);

    if (dbError) {
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
      setSaving(false);
      return;
    }

    // 3. Notifications email (non bloquantes)
    fetch("/api/mandataire/notify-contrat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mandataireId }),
    }).catch(() => null);

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
          onClick={() => router.push("/mandataire/dashboard")}
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
          prefill={prefill}
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
