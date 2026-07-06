"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";
import { type FicheTerrain } from "@/components/mandataire/TerrainForm";

function StatutBadge({ statut }: { statut: FicheTerrain["statut"] }) {
  const map: Record<FicheTerrain["statut"], string> = {
    disponible: "bg-green-100 text-green-700",
    compromis: "bg-yellow-100 text-yellow-700",
    retire: "bg-gray-100 text-gray-500",
    vendu: "bg-red-100 text-red-700",
  };
  const labels: Record<FicheTerrain["statut"], string> = {
    disponible: "Disponible",
    compromis: "Compromis",
    retire: "Retiré",
    vendu: "Vendu",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[statut]}`}>
      {labels[statut]}
    </span>
  );
}

function CompatBadge({ compat }: { compat: FicheTerrain["compatibilite_arko"] }) {
  if (!compat) return null;
  const map = {
    precompatible: { label: "✅ Précompatible", cls: "text-green-700 bg-green-50" },
    a_confirmer: { label: "⚠️ À confirmer", cls: "text-yellow-700 bg-yellow-50" },
    non_compatible: { label: "❌ Non compatible", cls: "text-red-700 bg-red-50" },
  };
  const { label, cls } = map[compat];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span>;
}

export default function TerrainsPage() {
  const router = useRouter();
  const [fiches, setFiches] = useState<FicheTerrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setToken(session.access_token);

      const res = await fetch("/api/mandataire/terrains", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setFiches(await res.json());
      setLoading(false);
    };
    load();
  }, []);

  const actives = fiches.filter((f) => f.statut === "disponible" || f.statut === "compromis");
  const nbActives = actives.length;
  const badgeColor =
    nbActives >= 10 ? "bg-green-500" : nbActives >= 8 ? "bg-orange-400" : "bg-red-500";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
            Portail Mandataire
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">Mes Terrains</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${badgeColor}`}>
              {nbActives}
            </span>
            <span className="text-sm text-gray-600">/ 10 fiches publiées</span>
            <span className="text-xs text-gray-400">(minimum 8 actives pour exclusivité)</span>
          </div>
        </div>
        <Link
          href="/mandataire/terrains/nouveau"
          className="flex-shrink-0 rounded-xl bg-[#7469F4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5a54d4] transition-colors"
        >
          + Nouvelle fiche
        </Link>
      </div>

      {/* Empty state */}
      {fiches.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7469F4]/10">
            <span className="text-2xl">🗺️</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Aucune fiche terrain</h2>
          <p className="mt-1 text-sm text-gray-500">
            Publiez vos terrains compatibles ARKO pour recevoir des prospects qualifiés.
          </p>
          <Link
            href="/mandataire/terrains/nouveau"
            className="mt-5 inline-flex items-center gap-1 rounded-xl bg-[#7469F4] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5a54d4] transition-colors"
          >
            Publier ma première fiche terrain →
          </Link>
        </div>
      )}

      {/* Grid */}
      {fiches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fiches.map((fiche) => (
            <Link
              key={fiche.id}
              href={`/mandataire/terrains/${fiche.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-[#7469F4]/40 hover:shadow-sm transition-all"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{fiche.commune}</p>
                  {fiche.secteur && (
                    <p className="text-xs text-gray-400">{fiche.secteur}</p>
                  )}
                </div>
                <StatutBadge statut={fiche.statut} />
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {fiche.prix && (
                  <span className="text-sm font-medium text-gray-700">
                    {fiche.prix.toLocaleString("fr-FR")} €
                  </span>
                )}
                {fiche.surface && (
                  <span className="text-sm text-gray-500">{fiche.surface} m²</span>
                )}
              </div>

              {fiche.compatibilite_arko && (
                <div className="mb-3">
                  <CompatBadge compat={fiche.compatibilite_arko} />
                </div>
              )}

              {fiche.date_derniere_verif && (
                <p className="text-xs text-gray-400">
                  Vérifié le {new Date(fiche.date_derniere_verif).toLocaleDateString("fr-FR")}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
