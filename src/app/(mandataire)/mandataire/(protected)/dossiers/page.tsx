"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

type LeadAnon = {
  lead_number: number | null;
  commune: string | null;
  description_projet: string | null;
  produit: string | null;
  terrain_mode: string | null;
  pack_terrain: string | null;
  total_estime: number | null;
  delai_projet: string | null;
  statut: string | null;
};

type Dossier = {
  id: string;
  statut: string;
  pack_label: string | null;
  remuneration_mandataire_ht: number | null;
  created_at: string;
  accepted_at: string | null;
  leads: LeadAnon | null;
};

const STATUT_DOSSIER: Record<string, { label: string; cls: string }> = {
  proposé:   { label: "Nouveau",  cls: "bg-[#7469F4]/10 text-[#7469F4]" },
  accepté:   { label: "Accepté",  cls: "bg-blue-500/10 text-blue-600" },
  en_cours:  { label: "En cours", cls: "bg-orange-100 text-orange-700" },
  finalisé:  { label: "Finalisé", cls: "bg-green-100 text-green-700" },
};

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/mandataire/dossiers", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setDossiers(await res.json() as Dossier[]);
      setLoading(false);
    };
    load();
  }, []);

  const actifs    = dossiers.filter((d) => ["proposé", "accepté", "en_cours"].includes(d.statut));
  const finalisés = dossiers.filter((d) => d.statut === "finalisé");
  const caTotal   = finalisés.reduce((s, d) => s + (d.remuneration_mandataire_ht ?? 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">Portail Mandataire</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Mes dossiers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Chaque dossier correspond à un lead qualifié par HOWNER. Acceptez un lead pour accéder à toutes ses informations.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Dossiers actifs"   value={String(actifs.length)}   sub="En attente ou en cours" />
        <KpiCard label="Finalisés"          value={String(finalisés.length)} sub="Acte notarié signé" />
        <KpiCard label="CA généré"          value={`${caTotal.toLocaleString("fr-FR")} €`} sub="Rémunérations HT" accent />
      </div>

      {/* Liste */}
      {dossiers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-4xl">📂</p>
          <p className="mt-3 font-medium text-gray-700">Aucun dossier pour l'instant</p>
          <p className="mt-1 text-sm text-gray-400">
            HOWNER vous enverra un email dès qu'un lead vous est affecté.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {dossiers.map((d) => {
            const l      = d.leads;
            const badge  = STATUT_DOSSIER[d.statut] ?? { label: d.statut, cls: "bg-gray-100 text-gray-500" };
            const isNew  = d.statut === "proposé";
            return (
              <Link key={d.id} href={`/mandataire/dossiers/${d.id}`}
                className={`group block rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md ${isNew ? "border-[#7469F4]/30" : "border-gray-200"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-gray-400">
                      Lead HOWNER {l?.lead_number ? `#${l.lead_number}` : ""}
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {l?.commune ?? "Zone confidentielle"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                <dl className="mt-3 space-y-1.5 text-sm">
                  {l?.description_projet && (
                    <Row label="Projet" value={l.description_projet} />
                  )}
                  {!l?.description_projet && l?.produit && (
                    <Row label="Projet" value={l.produit} />
                  )}
                  {(l?.terrain_mode || l?.pack_terrain) && (
                    <Row label="Terrain" value={terrainLabel(l.terrain_mode, l.pack_terrain)} />
                  )}
                  {l?.total_estime && (
                    <Row label="Budget" value={budgetRange(l.total_estime)} />
                  )}
                  {l?.delai_projet && (
                    <Row label="Échéance" value={l.delai_projet} />
                  )}
                </dl>

                {isNew && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-[#7469F4]">Cliquez pour voir et accepter ce lead →</p>
                  </div>
                )}
                {d.remuneration_mandataire_ht && d.statut === "finalisé" && (
                  <p className="mt-3 text-right font-semibold text-[#7469F4]">
                    {d.remuneration_mandataire_ht.toLocaleString("fr-FR")} € HT
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-gray-400">{label}</dt>
      <dd className="text-gray-700">{value}</dd>
    </div>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? "text-[#7469F4]" : "text-gray-900"}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{sub}</p>
    </div>
  );
}

function terrainLabel(mode: string | null, pack: string | null): string {
  if (mode === "owned" || pack === "Sans recherche terrain") return "Déjà détenu";
  if (mode === "search" || pack) return "À rechercher";
  return pack ?? mode ?? "—";
}

function budgetRange(total: number): string {
  const k = Math.round(total / 1000);
  const lo = Math.floor(k / 10) * 10;
  return `${lo}–${lo + 20} k€`;
}
