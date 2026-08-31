/**
 * Liste des agents immobiliers partenaires — ADR-044 §9.
 *
 * `?vue=` est lu **côté serveur** et passé en propriété : `useSearchParams`
 * impose une frontière Suspense et fait échouer le prerender de production
 * (leçon d'ADR-030, reprise par la liste des leads).
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { estAdmin } from "@/shared/lib/supabase-server";
import { signalerPanne } from "@/shared/lib/panne";
import { ErreurRequete } from "@/components/admin/ErreurRequete";
import AgentsVue, { type AgentListe } from "@/components/admin/AgentsVue";

export const dynamic = "force-dynamic";

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  /* ADR-039 — défense en profondeur : le proxy garde déjà cette route, cette
     vérification protège le jour où le matcher change. Une page admin ne lit
     jamais en `service_role` sans avoir prouvé l'identité de qui la demande. */
  if (!(await estAdmin())) redirect("/admin/auth/signin");

  const { vue } = await searchParams;
  const supabase = getSupabaseAdmin();

  /* `error` est lu, et pas seulement `data` : cette requête nomme des colonnes
     que seule la migration `20260831_agents_immo` crée. Tant qu'elle n'est pas
     appliquée, PostgREST rejette la requête en bloc (`42703`) et `data ?? []`
     afficherait sereinement « aucune agence » — c'est arrivé en production sur
     les leads. */
  const { data, error } = await supabase
    .from("agents_immo")
    .select(
      "id, agent_number, agence, prenom, nom, email, tel, tel_fixe, commune, departement, " +
        "statut_partenariat, responsable, created_at, dernier_appel_at, derniere_issue, " +
        "prochain_rappel_at, dernier_email_at, dernier_email_sujet, dernier_email_etat",
    )
    .order("created_at", { ascending: false });

  if (error) signalerPanne("admin/agents", error.message);

  /* Les leads apportés se comptent en une requête, pas une par agence.
     `agent_id` est nullable et l'immense majorité des leads n'en portent pas :
     on ne remonte donc que les lignes qui en ont une, et on agrège en mémoire.
     Un `count` par ligne aurait produit N requêtes pour une information qui
     tient dans une seule. */
  const { data: apports } = await supabase
    .from("leads")
    .select("agent_id")
    .not("agent_id", "is", null);

  const parAgent = new Map<string, number>();
  for (const l of (apports ?? []) as unknown as { agent_id: string | null }[]) {
    if (l.agent_id) parAgent.set(l.agent_id, (parAgent.get(l.agent_id) ?? 0) + 1);
  }

  /* `as unknown as` — même convention que les écrans Terrains et GED : les
     types du client Supabase sont générés depuis le schéma déployé, et
     `agents_immo` n'y figurera qu'une fois la migration appliquée. La forme
     réelle est celle du `select` ci-dessus. */
  const lignes = (data ?? []) as unknown as Omit<AgentListe, "leads_apportes">[];
  const agents: AgentListe[] = lignes.map((a) => ({
    ...a,
    leads_apportes: parAgent.get(a.id) ?? 0,
  }));

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Agents immobiliers</h1>
          {/* Dire ce qu'est cette population évite la confusion qui a motivé
              l'ADR : ce ne sont ni des prospects, ni des mandataires. */}
          <p className="mt-1 text-xs text-white/30">
            Partenaires apporteurs d&apos;affaires — ils ne réservent pas un studio, ils nous
            présentent leurs clients.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/admin/agents/vivier"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10"
          >
            Vivier Brevo
          </Link>
          <Link
            href="/admin/agents/nouveau"
            className="rounded-xl bg-[#7469F4] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            + Nouvelle agence
          </Link>
        </div>
      </div>

      {error ? (
        <ErreurRequete titre="Agences illisibles" message={error.message} />
      ) : (
        <AgentsVue agents={agents} vue={vue === "kanban" ? "kanban" : "tableau"} />
      )}
    </div>
  );
}
