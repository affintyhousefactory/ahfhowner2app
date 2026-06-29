import { getSupabaseAdmin } from "@/shared/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUT_COLORS: Record<string, string> = {
  en_attente: "bg-[#e07b28]/20 text-[#e07b28]",
  actif: "bg-[#2d6b27]/30 text-green-400",
  suspendu: "bg-white/10 text-white/30",
};

export default async function MandatairesPage() {
  const { data: mandataires } = await getSupabaseAdmin()
    .from("mandataires")
    .select("id, prenom, nom, email, statut, reseau_carte_t, carte_t_numero, contrat_signe_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Mandataires</h1>
        <Link
          href="/admin/mandataires/nouveau"
          className="rounded-xl bg-[#7469F4] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nouveau mandataire
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#252521]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/30">
              <th className="px-4 py-3 font-normal">Nom</th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Réseau carte T</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal">Contrat signé</th>
              <th className="px-4 py-3 font-normal">Inscrit le</th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(mandataires ?? []).map((m) => (
              <tr key={m.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white">{m.prenom} {m.nom}</td>
                <td className="px-4 py-3 text-white/50">{m.email}</td>
                <td className="px-4 py-3 text-white/50">{m.reseau_carte_t ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUT_COLORS[m.statut ?? "en_attente"] ?? ""}`}>
                    {m.statut ?? "en_attente"}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {m.contrat_signe_at ? new Date(m.contrat_signe_at).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {new Date(m.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/mandataires/${m.id}`} className="text-[#7469F4] hover:underline text-xs">
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
            {(mandataires ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-white/20">
                  Aucun mandataire
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
