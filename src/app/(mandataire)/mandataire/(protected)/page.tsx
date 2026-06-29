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

export default function MandataireDashboard() {
  const [profile, setProfile] = useState<MandataireProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
            Pour commencer à recevoir des dossiers, veuillez signer votre contrat-cadre de
            sous-traitance AHF.
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

      {/* Grille de rémunération */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Grille de rémunération</h2>
        <p className="mt-1 text-sm text-gray-500">
          100 % success fee — aucun frais fixe. Rémunération déclenchée après acte notarié +
          encaissement AHF.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">Pack</th>
                <th className="px-4 py-3 text-right font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">Prix client TTC</th>
                <th className="px-4 py-3 text-right font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[#7469F4]/70">Votre rémunération HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { pack: "Essentiel", prix: "4 900 €", remun: "3 600 €" },
                { pack: "Étendu", prix: "7 300 €", remun: "5 500 €" },
                { pack: "Département", prix: "11 200 €", remun: "8 400 €" },
              ].map((row) => (
                <tr key={row.pack} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.pack}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{row.prix}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#7469F4]">{row.remun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Acompte 1 500 € retenu par AHF non reversé · Facturation mandataire sous 15j acte · Règlement
          sous 30j réception facture
        </p>
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
