import { getSupabaseAdmin } from "@/shared/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUT_COLORS: Record<string, string> = {
  invite: "bg-[#7469F4]/20 text-[#7469F4]",
  en_attente: "bg-[#e07b28]/20 text-[#e07b28]",
  actif: "bg-[#2d6b27]/30 text-green-400",
  suspendu: "bg-white/10 text-white/30",
};

const RAYONS: Record<string, string> = {
  "20km": "20 km", "50km": "50 km", "80km": "80 km",
  "département": "Département", "région": "Région",
};

type SortKey = "nom" | "statut" | "zone_activite" | "rayon_intervention" | "created_at";

type Mandataire = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  statut: string | null;
  reseau_carte_t: string | null;
  carte_t_numero: string | null;
  contrat_signe_at: string | null;
  created_at: string;
  zone_activite: string[] | null;
  rayon_intervention: string | null;
};

const RAYON_ORDER = ["20km", "50km", "80km", "département", "région"];

function sortMandataires(mandataires: Mandataire[], sort: SortKey, order: "asc" | "desc") {
  const sorted = [...mandataires].sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "nom":
        cmp = `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`);
        break;
      case "statut":
        cmp = (a.statut ?? "").localeCompare(b.statut ?? "");
        break;
      case "zone_activite":
        cmp = (a.zone_activite?.[0] ?? "").localeCompare(b.zone_activite?.[0] ?? "");
        break;
      case "rayon_intervention":
        cmp = RAYON_ORDER.indexOf(a.rayon_intervention ?? "") - RAYON_ORDER.indexOf(b.rayon_intervention ?? "");
        break;
      case "created_at":
      default:
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    return order === "asc" ? cmp : -cmp;
  });
  return sorted;
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentOrder,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentOrder: "asc" | "desc";
}) {
  const isActive = currentSort === sortKey;
  const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
  return (
    <Link
      href={`/admin/mandataires?sort=${sortKey}&order=${nextOrder}`}
      className={`flex items-center gap-1 font-normal transition-colors ${
        isActive ? "text-white" : "text-white/30 hover:text-white/60"
      }`}
    >
      {label}
      <span className="text-[10px]">{isActive ? (currentOrder === "asc" ? "▲" : "▼") : ""}</span>
    </Link>
  );
}

export default async function MandatairesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; order?: string }>;
}) {
  const { sort, order } = await searchParams;
  const currentSort = (["nom", "statut", "zone_activite", "rayon_intervention", "created_at"].includes(sort ?? "")
    ? sort
    : "created_at") as SortKey;
  const currentOrder: "asc" | "desc" = order === "asc" ? "asc" : "desc";

  const { data } = await getSupabaseAdmin()
    .from("mandataires")
    .select("id, prenom, nom, email, statut, reseau_carte_t, carte_t_numero, contrat_signe_at, created_at, zone_activite, rayon_intervention");

  const mandataires = sortMandataires((data ?? []) as Mandataire[], currentSort, currentOrder);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Mandataires</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/mandataires/inviter"
            className="rounded-xl border border-[#7469F4]/40 px-4 py-2 text-sm text-[#7469F4] hover:bg-[#7469F4]/10 transition-colors"
          >
            Inviter par email
          </Link>
          <Link
            href="/admin/mandataires/nouveau"
            className="rounded-xl bg-[#7469F4] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            + Créer manuellement
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#252521]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/30">
              <th className="px-4 py-3 font-normal">
                <SortableHeader label="Nom" sortKey="nom" currentSort={currentSort} currentOrder={currentOrder} />
              </th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Réseau carte T</th>
              <th className="px-4 py-3 font-normal">
                <SortableHeader label="Zones d'intervention" sortKey="zone_activite" currentSort={currentSort} currentOrder={currentOrder} />
              </th>
              <th className="px-4 py-3 font-normal">
                <SortableHeader label="Rayon d'action" sortKey="rayon_intervention" currentSort={currentSort} currentOrder={currentOrder} />
              </th>
              <th className="px-4 py-3 font-normal">
                <SortableHeader label="Statut" sortKey="statut" currentSort={currentSort} currentOrder={currentOrder} />
              </th>
              <th className="px-4 py-3 font-normal">Contrat signé</th>
              <th className="px-4 py-3 font-normal">
                <SortableHeader label="Inscrit le" sortKey="created_at" currentSort={currentSort} currentOrder={currentOrder} />
              </th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mandataires.map((m) => (
              <tr key={m.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white">{m.prenom} {m.nom}</td>
                <td className="px-4 py-3 text-white/50">{m.email}</td>
                <td className="px-4 py-3 text-white/50">{m.reseau_carte_t ?? "—"}</td>
                <td className="px-4 py-3 text-white/50 text-xs">
                  {m.zone_activite?.length ? m.zone_activite.slice(0, 3).join(", ") + (m.zone_activite.length > 3 ? "…" : "") : "—"}
                </td>
                <td className="px-4 py-3 text-white/50 text-xs">
                  {m.rayon_intervention ? RAYONS[m.rayon_intervention] ?? m.rayon_intervention : "—"}
                </td>
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
            {mandataires.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-white/20">
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
