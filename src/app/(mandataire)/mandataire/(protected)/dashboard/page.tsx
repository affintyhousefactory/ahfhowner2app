"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

type MandataireProfile = {
  id: string;
  statut: string;
  nom: string;
  prenom: string;
  contrat_signe_at: string | null;
};

type FicheStatut = "disponible" | "compromis" | "retire";

export default function MandataireDashboard() {
  const [profile, setProfile] = useState<MandataireProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [nbTerrainsActifs, setNbTerrainsActifs] = useState(0);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("mandataires")
        .select("id, statut, nom, prenom, contrat_signe_at")
        .eq("user_id", session.user.id)
        .single();

      setProfile(data);

      // Charger le nombre de terrains actifs
      try {
        const res = await fetch("/api/mandataire/terrains", {
          headers: { authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const fiches: { statut: FicheStatut }[] = await res.json();
          const actifs = fiches.filter((f) => f.statut === "disponible" || f.statut === "compromis");
          setNbTerrainsActifs(actifs.length);
        }
      } catch {
        // non bloquant
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
      </div>
    );
  }

  const isEnAttente = profile?.statut === "en_attente";
  const contratNonSigne = !profile?.contrat_signe_at;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
          Portail Mandataire
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">
          Bonjour{profile?.prenom ? `, ${profile.prenom}` : ""} 👋
        </h1>
      </div>

      {/* Alerte statut en attente */}
      {isEnAttente && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <p className="font-semibold text-orange-800">Compte en attente de validation</p>
          <p className="mt-1 text-sm text-orange-700">
            Votre inscription est en cours de traitement par AHF. Vous recevrez un email dès que
            votre compte sera activé.
          </p>
        </div>
      )}

      {/* Alerte contrat non signé */}
      {contratNonSigne && !isEnAttente && (
        <div className="rounded-xl border border-[#7469F4]/30 bg-[#7469F4]/5 p-5">
          <p className="font-semibold text-[#7469F4]">Contrat à signer</p>
          <p className="mt-1 text-sm text-gray-600">
            Pour activer votre accès et commencer à recevoir des prospects qualifiés, veuillez signer votre contrat-cadre de
            partenariat AHF.
          </p>
          <Link
            href="/mandataire/contrat"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#7469F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a54d4] transition-colors"
          >
            Signer le contrat →
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Dossiers actifs" value="0" sublabel="En cours de traitement" />
        <KpiCard label="Dossiers finalisés" value="0" sublabel="Acte notarié signé" />
        <KpiCard label="CA généré" value="0 €" sublabel="Rémunérations versées" />
      </div>

      {/* Card Mes Terrains */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-900">Mes Terrains</h2>
            <p className="mt-1 text-sm text-gray-500">
              Référencez vos terrains compatibles Arko pour recevoir des prospects qualifiés.
            </p>
          </div>
          <Link
            href="/mandataire/terrains"
            className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Fiches actives</span>
            <span className={`font-semibold ${nbTerrainsActifs >= 10 ? "text-green-600" : nbTerrainsActifs >= 8 ? "text-orange-500" : "text-red-500"}`}>
              {nbTerrainsActifs} / 10
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${nbTerrainsActifs >= 10 ? "bg-green-500" : nbTerrainsActifs >= 8 ? "bg-orange-400" : "bg-[#7469F4]"}`}
              style={{ width: `${Math.min(100, (nbTerrainsActifs / 10) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {nbTerrainsActifs >= 10
              ? "✅ Objectif atteint — exclusivité territoriale active"
              : nbTerrainsActifs >= 8
              ? "⚠️ Proche de l'objectif — encore quelques fiches à publier"
              : "Publiez au moins 10 fiches terrain pour activer votre exclusivité territoriale"}
          </p>
        </div>

        {nbTerrainsActifs === 0 && (
          <Link
            href="/mandataire/terrains/nouveau"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#7469F4] hover:underline"
          >
            Publier ma première fiche →
          </Link>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{sublabel}</p>
    </div>
  );
}
