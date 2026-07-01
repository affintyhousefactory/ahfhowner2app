import { getSupabaseAdmin } from "@/shared/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUT_COLORS: Record<string, string> = {
  nouveau:   "bg-[#7469F4]/20 text-[#7469F4]",
  qualifié:  "bg-blue-500/20 text-blue-400",
  affecté:   "bg-[#e07b28]/20 text-[#e07b28]",
  en_cours:  "bg-yellow-500/20 text-yellow-400",
  finalisé:  "bg-[#2d6b27]/30 text-green-400",
  perdu:     "bg-white/10 text-white/30",
};

export default async function GedPage() {
  const supabase = getSupabaseAdmin();

  const { data: leads } = await supabase
    .from("leads")
    .select(`
      id, lead_number, prenom, nom, commune, statut, created_at,
      mandataires(prenom, nom),
      lead_documents(id)
    `)
    .order("lead_number", { ascending: false });

  const totalDocs = (leads ?? []).reduce(
    (acc, l) => acc + ((l.lead_documents as { id: string }[] | null)?.length ?? 0),
    0,
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">GED Dossiers</h1>
        <p className="mt-1 text-sm text-white/40">
          Gestion électronique des documents — {(leads ?? []).length} dossiers · {totalDocs} document{totalDocs > 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#252521]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/30">
              <th className="px-4 py-3 font-normal">Dossier</th>
              <th className="px-4 py-3 font-normal">Commune</th>
              <th className="px-4 py-3 font-normal">Mandataire</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal text-center">Documents</th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(leads ?? []).map((l) => {
              const docCount = (l.lead_documents as { id: string }[] | null)?.length ?? 0;
              const mandRaw = l.mandataires as unknown as { prenom: string; nom: string } | { prenom: string; nom: string }[] | null;
              const mandataire = Array.isArray(mandRaw) ? mandRaw[0] ?? null : mandRaw;
              return (
                <tr key={l.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-white/30 mr-2">
                      #{l.lead_number ?? "—"}
                    </span>
                    <span className="font-medium text-white">
                      {l.prenom} {l.nom}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50">{l.commune ?? "—"}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {mandataire ? `${mandataire.prenom} ${mandataire.nom}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUT_COLORS[l.statut ?? "nouveau"] ?? ""}`}>
                      {l.statut ?? "nouveau"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {docCount > 0 ? (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#7469F4]/20 px-2 py-0.5 text-[11px] font-semibold text-[#7469F4]">
                        {docCount}
                      </span>
                    ) : (
                      <span className="text-xs text-white/20">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/ged/${l.id}`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-[#7469F4]/50 hover:text-[#7469F4]"
                    >
                      Gérer →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {(leads ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-white/20">
                  Aucun dossier
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
