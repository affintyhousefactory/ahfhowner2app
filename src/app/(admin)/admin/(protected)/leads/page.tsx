/**
 * Liste des leads — ADR-035 §6.
 *
 * `?vue=` est lu **côté serveur** et passé en propriété : `useSearchParams`
 * impose une frontière Suspense et fait échouer le prerender de production
 * (leçon d'ADR-030, § « ?produit= lu côté serveur »).
 */

import Link from "next/link";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { signalerPanne } from "@/shared/lib/panne";
import LeadsVue, { type LeadListe } from "@/components/admin/LeadsVue";
import { ErreurRequete } from "@/components/admin/ErreurRequete";
import { estAdmin } from "@/shared/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  /* ADR-039 — défense en profondeur. Le proxy garde déjà cette route ; cette
     seconde vérification protège le jour où le matcher change ou qu'une page
     naît hors de son périmètre. Une page admin ne lit jamais en `service_role`
     sans avoir prouvé l'identité de qui la demande. */
  if (!(await estAdmin())) redirect("/admin/auth/signin");

  const { vue } = await searchParams;

  // ADR-028/035 — la jointure `mandataires` alimentait la colonne « Mandataire »
  // et la colonne « Affectation » ; les deux sont retirées de la liste. Une
  // seule requête suffit désormais.
  // `error` est lu, et pas seulement `data` : cette requête nomme explicitement
  // `responsable`, `cfg_*` et `dernier_appel_at`. Tant que la migration
  // `20260804_crm_leads` n'est pas appliquée sur l'environnement, PostgREST la
  // rejette en bloc (`42703`) — `data` vaut alors `null`, et `data ?? []`
  // affichait sereinement « aucun lead ». C'est arrivé en production.
  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .select(
      "id, lead_number, prenom, nom, email, tel, statut, statut_commercial, responsable, produit, commune, created_at, dernier_appel_at, prochain_rappel_at, cfg_modele, cfg_total, slot",
    )
    .order("created_at", { ascending: false });

  if (error) signalerPanne("admin/leads", error.message);

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

      {error ? (
        <ErreurRequete titre="Leads illisibles" message={error.message} />
      ) : (
        <LeadsVue
          leads={(data ?? []) as LeadListe[]}
          vue={vue === "kanban" ? "kanban" : "tableau"}
        />
      )}
    </div>
  );
}
