import { getSupabaseAdmin } from "@/shared/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUT_COLORS: Record<string, string> = {
  nouveau: "bg-[#7469F4]/20 text-[#7469F4]",
  qualifié: "bg-blue-500/20 text-blue-400",
  affecté: "bg-[#e07b28]/20 text-[#e07b28]",
  en_cours: "bg-yellow-500/20 text-yellow-400",
  finalisé: "bg-[#2d6b27]/30 text-green-400",
  perdu: "bg-white/10 text-white/30",
};

export default async function LeadsPage() {
  const { data: leads } = await getSupabaseAdmin()
    .from("leads")
    .select("id, lead_number, prenom, nom, email, statut, pack_terrain, produit, commune, created_at, mandataires(prenom, nom)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Leads</h1>
        <Link
          href="/admin/leads/nouveau"
          className="rounded-xl bg-[#7469F4] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nouveau lead
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#252521]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/30">
              <th className="px-4 py-3 font-normal">Dossier</th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Pack / Modèle</th>
              <th className="px-4 py-3 font-normal">Commune</th>
              <th className="px-4 py-3 font-normal">Mandataire</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(leads ?? []).map((l) => (
              <tr key={l.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  {l.lead_number && (
                    <span className="mr-2 font-mono text-[11px] text-white/30">#{l.lead_number}</span>
                  )}
                  <span className="text-white">{l.prenom} {l.nom}</span>
                </td>
                <td className="px-4 py-3 text-white/50">{l.email}</td>
                <td className="px-4 py-3 text-white/50">{l.pack_terrain ?? l.produit ?? "—"}</td>
                <td className="px-4 py-3 text-white/50">{l.commune ?? "—"}</td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {(() => {
                    const raw = l.mandataires as unknown as { prenom: string; nom: string } | { prenom: string; nom: string }[] | null;
                    const m = Array.isArray(raw) ? raw[0] ?? null : raw;
                    return m ? `${m.prenom} ${m.nom}` : "—";
                  })()}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUT_COLORS[l.statut ?? "nouveau"] ?? ""}`}>
                    {l.statut ?? "nouveau"}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {new Date(l.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${l.id}`} className="text-[#7469F4] hover:underline text-xs">
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
            {(leads ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-white/20">
                  Aucun lead pour l&apos;instant
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
