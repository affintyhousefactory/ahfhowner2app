"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
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
  // Niveau 2 uniquement
  prenom?: string;
  nom?: string;
  tel?: string;
  email?: string;
  adresse_postale_client?: string;
  cp_client?: string;
  ville_client?: string;
  notes_ahf?: string;
  plu_adresse?: string;
  plu_zone?: string;
  plu_libelong?: string;
  plu_typezone?: string;
  plu_typedoc?: string;
  plu_datappro?: string;
};

type Document = { nom: string; signedUrl: string | null; taille_ko: number | null; created_at: string };

type DossierDetail = {
  dossier: { id: string; statut: string; pack_label: string | null; remuneration_mandataire_ht: number | null; notes: string | null; created_at: string; accepted_at: string | null };
  lead: LeadAnon | null;
  documents: Document[];
  niveau: 1 | 2;
};

export default function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [detail, setDetail]   = useState<DossierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [token, setToken]     = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setToken(session.access_token);

      const res = await fetch(`/api/mandataire/dossiers/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setDetail(await res.json() as DossierDetail);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`/api/mandataire/dossiers/${id}/accepter`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur");
      }
      // Recharger pour afficher Niveau 2
      const res2 = await fetch(`/api/mandataire/dossiers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res2.ok) setDetail(await res2.json() as DossierDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-16 text-center text-gray-500">Dossier introuvable.</div>
    );
  }

  const { dossier, lead, documents, niveau } = detail;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-700">← Mes dossiers</button>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">
            Lead HOWNER {lead?.lead_number ? `#${lead.lead_number}` : ""}
          </h1>
          <StatutBadge statut={dossier.statut} />
        </div>
        <p className="text-sm text-gray-400">
          Affecté le {new Date(dossier.created_at).toLocaleDateString("fr-FR")}
          {dossier.accepted_at ? ` · Accepté le ${new Date(dossier.accepted_at).toLocaleDateString("fr-FR")}` : ""}
        </p>
      </div>

      {/* Niveau 1 — Infos anonymisées */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
          Aperçu du lead
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <AnonRow label="Secteur"   value={lead?.commune ?? "—"} />
          <AnonRow label="Projet"    value={lead?.description_projet ?? lead?.produit ?? "—"} />
          <AnonRow label="Terrain"   value={terrainLabel(lead?.terrain_mode, lead?.pack_terrain)} />
          <AnonRow label="Budget"    value={lead?.total_estime ? budgetRange(lead.total_estime) : "—"} />
          <AnonRow label="Échéance"  value={lead?.delai_projet ?? "—"} />
          {lead?.statut && <AnonRow label="Statut" value={lead.statut} />}
        </dl>
      </div>

      {/* Niveau 1 — Bouton d'acceptation */}
      {niveau === 1 && (
        <div className="rounded-2xl border border-[#7469F4]/20 bg-[#7469F4]/5 p-6">
          <h2 className="font-semibold text-gray-900">Accepter ce lead</h2>
          <p className="mt-1 text-sm text-gray-600">
            En acceptant, vous obtenez immédiatement : prénom du prospect, téléphone, email, adresse,
            notes du projet, données PLU et tous les documents du dossier.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Rappel : vous vous engagez à contacter ce prospect sous le délai indiqué.
          </p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="mt-4 rounded-xl bg-[#7469F4] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5a54d4] disabled:opacity-50 transition-colors"
          >
            {accepting ? "Acceptation…" : "Accepter ce lead →"}
          </button>
        </div>
      )}

      {/* Niveau 2 — Informations complètes */}
      {niveau === 2 && lead && (
        <>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-blue-600/70">
              Contact du prospect
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-xl font-semibold text-gray-900">{lead.prenom} {lead.nom}</p>
              {lead.tel && (
                <a href={`tel:${lead.tel}`} className="flex items-center gap-2 text-[#7469F4] hover:underline">
                  <span>📞</span> {lead.tel}
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-[#7469F4] hover:underline">
                  <span>✉</span> {lead.email}
                </a>
              )}
              {(lead.adresse_postale_client || lead.cp_client) && (
                <p className="text-gray-600">
                  {lead.adresse_postale_client}
                  {(lead.cp_client || lead.ville_client) && (
                    <span className="block text-xs text-gray-400">
                      {[lead.cp_client, lead.ville_client].filter(Boolean).join(" ")}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {lead.notes_ahf && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-gray-400">Notes projet</p>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{lead.notes_ahf}</p>
            </div>
          )}

          {lead.plu_adresse && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-gray-400">Données PLU</p>
              <dl className="mt-3 space-y-2 text-sm">
                {([
                  ["Adresse",   lead.plu_adresse],
                  ["Zone",      lead.plu_zone],
                  ["Type doc",  lead.plu_typedoc],
                  ["Approuvé",  lead.plu_datappro],
                  ["Libellé",   lead.plu_libelong],
                ] as [string, string | undefined][]).map(([label, value]) =>
                  value ? (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-gray-400">{label}</dt>
                      <dd className="text-right text-gray-700 text-xs">{value}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </div>
          )}

          {documents.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-gray-400 mb-4">
                Documents ({documents.length})
              </p>
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span>📄</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.nom}</p>
                        {doc.taille_ko && <p className="text-xs text-gray-400">{doc.taille_ko} Ko</p>}
                      </div>
                    </div>
                    {doc.signedUrl ? (
                      <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer"
                        className="rounded-lg bg-[#7469F4]/10 px-3 py-1.5 text-xs font-medium text-[#7469F4] hover:bg-[#7469F4]/20 transition-colors">
                        Télécharger
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">Indisponible</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">Les liens de téléchargement sont valables 1 heure.</p>
            </div>
          )}
        </>
      )}

      {/* Pack & rémunération (toujours visible si renseigné) */}
      {dossier.pack_label && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-gray-400">Pack &amp; rémunération</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="font-medium text-gray-900">{dossier.pack_label}</p>
            {dossier.remuneration_mandataire_ht && (
              <p className="font-semibold text-[#7469F4]">
                {dossier.remuneration_mandataire_ht.toLocaleString("fr-FR")} € HT
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    proposé:  "bg-[#7469F4]/10 text-[#7469F4]",
    accepté:  "bg-blue-100 text-blue-700",
    en_cours: "bg-orange-100 text-orange-700",
    finalisé: "bg-green-100 text-green-700",
  };
  const labels: Record<string, string> = {
    proposé: "Nouveau", accepté: "Accepté", en_cours: "En cours", finalisé: "Finalisé",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${map[statut] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[statut] ?? statut}
    </span>
  );
}

function AnonRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-24 shrink-0 font-medium text-gray-500">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  );
}

function terrainLabel(mode: string | null | undefined, pack: string | null | undefined): string {
  if (!mode && !pack) return "—";
  if (mode === "owned" || pack === "Sans recherche terrain") return "Déjà détenu";
  if (mode === "search" || pack) return "À rechercher";
  return pack ?? mode ?? "—";
}

function budgetRange(total: number): string {
  const k  = Math.round(total / 1000);
  const lo = Math.floor(k / 10) * 10;
  return `${lo}–${lo + 20} k€`;
}
