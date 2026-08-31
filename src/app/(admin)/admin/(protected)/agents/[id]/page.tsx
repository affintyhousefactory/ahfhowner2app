/**
 * Fiche d'un agent immobilier partenaire — ADR-044 §9.
 *
 * Mêmes compartiments que la fiche lead, et pour la même raison : le journal
 * d'appels est l'écran qu'on ouvre le plus souvent, il ne doit pas être en bas
 * d'une colonne. `LeadOnglets` est réemployé tel quel — il ne connaît rien des
 * leads malgré son nom, il n'affiche que ce qu'on lui passe.
 *
 * L'onglet « Emails » lit l'historique Brevo en direct (lot 3) : ce qui est
 * parti, ce qui a été délivré, ouvert, rejeté — et permet d'envoyer la
 * présentation partenaire après un aperçu.
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { estAdmin } from "@/shared/lib/supabase-server";
import { LeadOnglets } from "@/components/admin/LeadOnglets";
import JournalAppels from "@/components/admin/JournalAppels";
import AgentIdentite, { type AgentFiche } from "@/components/admin/AgentIdentite";
import AgentEmails from "@/components/admin/AgentEmails";
import { TelephoneLien } from "@/shared/components/admin/TelephoneLien";
import { dateFr, etatSuivi, issueAppel, statutCommercial } from "@/lib/crm";
import { STATUTS_PARTENARIAT, statutPartenariat } from "@/lib/agents";

export const dynamic = "force-dynamic";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await estAdmin())) redirect("/admin/auth/signin");

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.from("agents_immo").select("*").eq("id", id).single();
  if (error || !data) notFound();

  const agent = data as unknown as AgentFiche & {
    id: string;
    agent_number: number | null;
    statut_partenariat: string | null;
    dernier_appel_at: string | null;
    derniere_issue: string | null;
    created_at: string;
    dernier_email_at: string | null;
  };

  /* Deux requêtes de comptage plutôt qu'une jointure : le compteur d'onglet ne
     doit pas faire remonter les lignes elles-mêmes. */
  const [{ count: nbAppels }, { data: leadsApportes }] = await Promise.all([
    supabase.from("agent_appels").select("id", { count: "exact", head: true }).eq("agent_id", id),
    supabase
      .from("leads")
      .select("id, lead_number, prenom, nom, commune, statut_commercial, created_at")
      .eq("agent_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const leads = (leadsApportes ?? []) as unknown as {
    id: string;
    lead_number: number | null;
    prenom: string | null;
    nom: string | null;
    commune: string | null;
    statut_commercial: string | null;
    created_at: string;
  }[];

  const st = statutPartenariat(agent.statut_partenariat);
  const suivi = etatSuivi({
    statut_commercial: st.actif ? "nouveau" : "signe",
    created_at: agent.created_at,
    dernier_appel_at: agent.dernier_appel_at,
    prochain_rappel_at: agent.prochain_rappel_at,
  });

  return (
    <div className="p-8">
      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {agent.agent_number && (
              <span className="font-mono text-sm text-white/30">#{agent.agent_number}</span>
            )}
            <h1 className="text-xl font-semibold text-white">{agent.agence}</h1>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${st.badge}`}>
              {st.label}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/35">
            <span>
              <TelephoneLien tel={agent.tel_fixe ?? agent.tel} vide="aucun numéro" />
            </span>
            <span>{agent.email}</span>
            {agent.responsable && <span>conseiller : {agent.responsable}</span>}
            <span className={suivi.silencieux ? "text-orange-400" : undefined}>
              {agent.dernier_appel_at
                ? `dernier appel il y a ${suivi.joursSansContact} j`
                : `jamais appelée (créée il y a ${suivi.joursSansContact} j)`}
            </span>
            {issueAppel(agent.derniere_issue) && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${issueAppel(agent.derniere_issue)!.badge}`}>
                {issueAppel(agent.derniere_issue)!.label}
              </span>
            )}
            {agent.prochain_rappel_at && (
              <span className={suivi.rappelDepasse ? "text-red-400" : undefined}>
                rappel : {dateFr(agent.prochain_rappel_at)}
                {suivi.rappelDepasse && ` (+${suivi.joursRetardRappel} j)`}
              </span>
            )}
          </div>
        </div>
        <Link
          href="/admin/agents"
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10"
        >
          ← Agences
        </Link>
      </div>

      <LeadOnglets
        onglets={[
          {
            id: "identite",
            titre: "Identité & suivi",
            contenu: (
              <div className="max-w-3xl rounded-2xl border border-white/10 bg-[#252521] p-6">
                <AgentIdentite agent={agent} />
              </div>
            ),
          },
          {
            id: "appels",
            titre: "Appels",
            compte: nbAppels ?? 0,
            contenu: (
              <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
                <JournalAppels
                  endpoint={`/api/admin/agents/${id}/appels`}
                  tel={agent.tel_fixe ?? agent.tel ?? null}
                  responsable={agent.responsable ?? null}
                  statuts={STATUTS_PARTENARIAT}
                  statutActuel={agent.statut_partenariat}
                  statutChamp="statut_partenariat"
                />
              </div>
            ),
          },
          {
            id: "emails",
            titre: "Emails",
            contenu: (
              <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
                <AgentEmails agentId={id} />
              </div>
            ),
          },
          {
            id: "leads",
            titre: "Leads apportés",
            compte: leads.length,
            contenu: (
              <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Leads apportés
                </h2>
                {/* La seule mesure qui dira si un contrat d'apporteur vaut
                    d'être signé. Elle se remplit depuis l'écran de
                    pré-qualification, au lot 4. */}
                <p className="mt-1 text-xs text-white/25">
                  Les prospects présentés par cette agence. Le rattachement se fait à la
                  création du lead, en choisissant le sourcing « Partenaire ».
                </p>

                {leads.length === 0 ? (
                  <p className="mt-4 text-sm text-white/20">Aucun lead apporté à ce jour.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-white/5">
                    {leads.map((l) => (
                      <li key={l.id} className="flex flex-wrap items-center gap-3 py-2.5">
                        {l.lead_number && (
                          <span className="font-mono text-[11px] text-white/30">#{l.lead_number}</span>
                        )}
                        <Link href={`/admin/leads/${l.id}`} className="text-sm text-white hover:text-[#7469F4]">
                          {`${l.prenom ?? ""} ${l.nom ?? ""}`.trim() || "Sans nom"}
                        </Link>
                        {l.commune && <span className="text-[11px] text-white/30">{l.commune}</span>}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statutCommercial(l.statut_commercial).badge}`}
                        >
                          {statutCommercial(l.statut_commercial).label}
                        </span>
                        <span className="ml-auto text-[11px] text-white/25">{dateFr(l.created_at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
