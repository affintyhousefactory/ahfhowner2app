/**
 * Liste des leads — ADR-035 §6.
 *
 * `?vue=` est lu **côté serveur** et passé en propriété : `useSearchParams`
 * impose une frontière Suspense et fait échouer le prerender de production
 * (leçon d'ADR-030, § « ?produit= lu côté serveur »).
 */

import Link from "next/link";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import LeadsVue, { type LeadListe } from "@/components/admin/LeadsVue";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const { vue } = await searchParams;

  // ADR-028/035 — la jointure `mandataires` alimentait la colonne « Mandataire »
  // et la colonne « Affectation » ; les deux sont retirées de la liste. Une
  // seule requête suffit désormais.
  const { data } = await getSupabaseAdmin()
    .from("leads")
    .select(
      "id, lead_number, prenom, nom, email, tel, statut, statut_commercial, responsable, produit, commune, created_at, dernier_appel_at, prochain_rappel_at, cfg_modele, cfg_total",
    )
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

      <LeadsVue
        leads={(data ?? []) as LeadListe[]}
        vue={vue === "kanban" ? "kanban" : "tableau"}
      />
    </div>
  );
}
