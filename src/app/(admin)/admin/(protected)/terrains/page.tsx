import { getSupabaseAdmin } from "@/shared/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUT_ADMIN_COLORS: Record<string, string> = {
  en_attente: "bg-amber-500/20 text-amber-400",
  valide:     "bg-[#7469F4]/20 text-[#7469F4]",
  refuse:     "bg-red-500/20 text-red-400",
  publie:     "bg-green-500/20 text-green-400",
};

const STATUT_ADMIN_LABELS: Record<string, string> = {
  en_attente: "En attente",
  valide:     "Validé",
  refuse:     "Refusé",
  publie:     "Publié",
};

type FicheWithMandataire = {
  id: string;
  commune: string;
  statut_admin: string;
  photos: { url: string; nom: string }[] | null;
  created_at: string;
  mandataires: { id: string; prenom: string; nom: string; email: string } | null;
};

export default async function TerrainsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("fiches_terrain")
    .select("id, commune, secteur, statut_admin, photos, created_at, mandataires(id, prenom, nom, email)")
    .order("created_at", { ascending: false });

  if (statut) query = query.eq("statut_admin", statut);

  const { data: fiches } = await query;

  // Stats
  const { data: stats } = await supabase
    .from("fiches_terrain")
    .select("statut_admin");

  const counts = {
    total:      (stats ?? []).length,
    en_attente: (stats ?? []).filter((f) => f.statut_admin === "en_attente").length,
    valide:     (stats ?? []).filter((f) => f.statut_admin === "valide").length,
    publie:     (stats ?? []).filter((f) => f.statut_admin === "publie").length,
    refuse:     (stats ?? []).filter((f) => f.statut_admin === "refuse").length,
  };

  const TABS = [
    { value: "",           label: "Tous",        count: counts.total },
    { value: "en_attente", label: "En attente",  count: counts.en_attente },
    { value: "valide",     label: "Validés",     count: counts.valide },
    { value: "publie",     label: "Publiés",     count: counts.publie },
    { value: "refuse",     label: "Refusés",     count: counts.refuse },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Terrains</h1>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-4">
          <p className="text-[11px] uppercase tracking-wider text-white/30">Total</p>
          <p className="mt-1 text-2xl font-semibold text-white">{counts.total}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-4">
          <p className="text-[11px] uppercase tracking-wider text-white/30">En attente</p>
          <p className="mt-1 text-2xl font-semibold text-amber-400">{counts.en_attente}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-4">
          <p className="text-[11px] uppercase tracking-wider text-white/30">Publiés</p>
          <p className="mt-1 text-2xl font-semibold text-green-400">{counts.publie}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-4">
          <p className="text-[11px] uppercase tracking-wider text-white/30">Refusés</p>
          <p className="mt-1 text-2xl font-semibold text-red-400">{counts.refuse}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 flex-wrap">
        {TABS.map(({ value, label, count }) => (
          <Link
            key={value}
            href={value ? `/admin/terrains?statut=${value}` : "/admin/terrains"}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              (statut ?? "") === value
                ? "bg-[#7469F4]/15 text-[#7469F4]"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            {label}
            <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">{count}</span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#252521]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/30">
              <th className="px-4 py-3 font-normal">Commune</th>
              <th className="px-4 py-3 font-normal">Mandataire</th>
              <th className="px-4 py-3 font-normal">Statut admin</th>
              <th className="px-4 py-3 font-normal">Photos</th>
              <th className="px-4 py-3 font-normal">Déposé le</th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {((fiches ?? []) as unknown as FicheWithMandataire[]).map((f) => (
              <tr key={f.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white font-medium">{f.commune}</td>
                <td className="px-4 py-3 text-white/50 text-xs">
                  {f.mandataires
                    ? `${f.mandataires.prenom} ${f.mandataires.nom}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUT_ADMIN_COLORS[f.statut_admin] ?? "text-white/30"}`}>
                    {STATUT_ADMIN_LABELS[f.statut_admin] ?? f.statut_admin}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {(f.photos ?? []).length}
                </td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {new Date(f.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/terrains/${f.id}`} className="text-[#7469F4] hover:underline text-xs">
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
            {(fiches ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-white/20">
                  Aucune fiche terrain
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
