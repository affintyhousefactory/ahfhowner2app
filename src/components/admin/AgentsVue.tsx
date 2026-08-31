"use client";

/**
 * Liste des agents immobiliers partenaires — tableau et Kanban (ADR-044 §9).
 *
 * Calquée sur `LeadsVue` à dessein : c'est le même geste, sur une autre
 * population. Ce qui est commun aux deux domaines — issues d'appel, calcul du
 * retard, seuil de silence — vient de `src/lib/crm.ts` et n'est pas recopié ;
 * ce qui est propre au partenariat vient de `src/lib/agents.ts`.
 *
 * ⚠ Ce n'est pas un Kanban de vente. Les colonnes décrivent un **cycle de
 * partenariat** (À contacter → … → Sous contrat), pas un entonnoir : aucun
 * montant, aucun numéro de série, aucune notion de devis.
 *
 * Le glisser-déposer est natif — sept colonnes ne justifient pas d'alourdir le
 * bundle admin. HTML5 DnD ignorant le tactile, chaque carte porte aussi un
 * sélecteur : chemin principal sur mobile, pas repli dégradé.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { TelephoneLien } from "@/shared/components/admin/TelephoneLien";
import { ISSUES_APPEL, issueAppel, etatSuivi, urgence, SLA_JOURS, dateFr } from "@/lib/crm";
import {
  STATUTS_PARTENARIAT,
  STATUTS_PARTENARIAT_KANBAN,
  horsKanbanAgent,
  statutPartenariat,
  etatEmail,
  type StatutPartenariatId,
} from "@/lib/agents";

export type AgentListe = {
  id: string;
  agent_number: number | null;
  agence: string;
  prenom: string | null;
  nom: string | null;
  email: string;
  tel: string | null;
  tel_fixe: string | null;
  commune: string | null;
  departement: string | null;
  statut_partenariat: string | null;
  responsable: string | null;
  created_at: string;
  dernier_appel_at: string | null;
  derniere_issue: string | null;
  prochain_rappel_at: string | null;
  dernier_email_at: string | null;
  dernier_email_sujet: string | null;
  dernier_email_etat: string | null;
  /** Nombre de leads apportés — l'assiette de la future commission (§5). */
  leads_apportes: number;
};

type Vue = "tableau" | "kanban";

/**
 * `etatSuivi()` attend la forme d'un lead. Un agent porte les mêmes notions
 * sous d'autres noms de statut — on lui passe donc ce qu'il lit, en neutralisant
 * `statut_commercial` : la clôture du partenariat se décide ici, pas là-bas.
 */
function suivi(a: AgentListe) {
  return etatSuivi({
    statut_commercial: statutPartenariat(a.statut_partenariat).actif ? "nouveau" : "signe",
    created_at: a.created_at,
    dernier_appel_at: a.dernier_appel_at,
    prochain_rappel_at: a.prochain_rappel_at,
  });
}

function nomContact(a: AgentListe): string {
  return `${a.prenom ?? ""} ${a.nom ?? ""}`.trim();
}

export default function AgentsVue({ agents: initial, vue }: { agents: AgentListe[]; vue: Vue }) {
  const router = useRouter();
  const [agents, setAgents] = useState(initial);
  const [q, setQ] = useState("");
  const [departement, setDepartement] = useState("");
  const [conseiller, setConseiller] = useState("");
  const [issue, setIssue] = useState("");
  const [retardSeul, setRetardSeul] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [sync, setSync] = useState<{ etat: "idle" | "encours"; message: string | null }>({
    etat: "idle",
    message: null,
  });

  /* Le département est le filtre du terrain : les zones de livraison sont 33,
     40 et 64, et une campagne de phoning se mène département par département. */
  const departements = useMemo(
    () => [...new Set(agents.map((a) => a.departement).filter(Boolean))].sort() as string[],
    [agents],
  );

  const conseillersPresents = useMemo(
    () => [...new Set(agents.map((a) => a.responsable).filter(Boolean))].sort() as string[],
    [agents],
  );

  const filtres = useMemo(() => {
    const terme = q.trim().toLowerCase();
    return agents.filter((a) => {
      if (departement && a.departement !== departement) return false;
      if (conseiller === "__aucun__" ? Boolean(a.responsable) : conseiller && a.responsable !== conseiller) {
        return false;
      }
      if (issue && (a.derniere_issue ?? "") !== issue) return false;
      if (retardSeul) {
        const e = suivi(a);
        if (!e.rappelDepasse && !e.silencieux) return false;
      }
      if (!terme) return true;
      return [a.agence, a.prenom, a.nom, a.email, a.commune, a.responsable, String(a.agent_number ?? "")]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(terme));
    });
  }, [agents, q, departement, conseiller, issue, retardSeul]);

  const rebutes = useMemo(
    () => filtres.filter((a) => horsKanbanAgent(a.statut_partenariat)).length,
    [filtres],
  );

  /** Déplacement Kanban — optimiste, annulé si la route refuse. */
  async function changerStatut(agentId: string, statut: StatutPartenariatId) {
    const avant = agents.find((a) => a.id === agentId)?.statut_partenariat ?? null;
    if (avant === statut) return;

    /* Deux passages demandent une confirmation, pour des raisons opposées.

       Le rebut, parce que la carte va disparaître sous les yeux de celui qui la
       déplace — une disparition sans préavis se lit comme une suppression.

       « Ne pas recontacter », parce que le geste **sort de l'écran** : il
       blackliste l'adresse chez Brevo, donc sur toutes les campagnes à venir
       (ADR-044 §6). Un effet qui dépasse la base doit être annoncé avant, pas
       découvert après. */
    if (horsKanbanAgent(statut)) {
      const ok = window.confirm(
        `${agents.find((a) => a.id === agentId)?.agence ?? "Cette agence"} va passer en « Erreur / Test / Doublon ».\n\n` +
          `Elle disparaîtra du Kanban : ce statut n'a pas de colonne, pour ne pas fausser les compteurs.\n\n` +
          `Elle n'est pas supprimée — vous la retrouverez dans la vue Tableau.`,
      );
      if (!ok) return;
    } else if (statut === "ne_pas_contacter") {
      const ok = window.confirm(
        `${agents.find((a) => a.id === agentId)?.agence ?? "Cette agence"} va passer en « Ne pas recontacter ».\n\n` +
          `Son adresse sera désinscrite chez Brevo : elle ne recevra plus aucune campagne, et ce retrait vaut pour toutes les listes.\n\n` +
          `C'est réversible depuis Brevo, pas depuis cet écran.`,
      );
      if (!ok) return;
    }

    setErreur(null);
    setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, statut_partenariat: statut } : a)));
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut_partenariat: statut }),
      });
      if (!res.ok) throw new Error("Enregistrement refusé");
      router.refresh();
    } catch (e) {
      setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, statut_partenariat: avant } : a)));
      setErreur(e instanceof Error ? e.message : "Erreur");
    }
  }

  /**
   * Rafraîchit la colonne « dernier email » — **un seul appel Brevo pour toutes
   * les agences**. Lire l'historique agence par agence ferait autant de requêtes
   * que de lignes ; c'est la raison d'être de la dénormalisation (§4).
   */
  async function rafraichirEmails() {
    setSync({ etat: "encours", message: null });
    try {
      const res = await fetch("/api/admin/agents/sync-emails", { method: "POST" });
      const body = (await res.json()) as {
        error?: string;
        misAJour?: number;
        adressesVuesChezBrevo?: number;
      };
      if (!res.ok) throw new Error(body.error ?? "Rafraîchissement refusé");
      setSync({
        etat: "idle",
        message: `${body.misAJour ?? 0} fiche(s) mise(s) à jour — ${body.adressesVuesChezBrevo ?? 0} adresse(s) vue(s) chez Brevo.`,
      });
      router.refresh();
    } catch (e) {
      setSync({ etat: "idle", message: null });
      setErreur(e instanceof Error ? e.message : "Erreur");
    }
  }

  const href = (v: Vue) => (v === "tableau" ? "/admin/agents" : "/admin/agents?vue=kanban");

  return (
    <div>
      {/* ── Barre d'outils ─────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher — agence, contact, email, commune"
          className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
        />

        <select
          value={departement}
          onChange={(e) => setDepartement(e.target.value)}
          aria-label="Filtrer par département"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
        >
          <option value="">Tous les départements</option>
          {departements.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={conseiller}
          onChange={(e) => setConseiller(e.target.value)}
          aria-label="Filtrer par conseiller"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
        >
          <option value="">Tous les conseillers</option>
          <option value="__aucun__">Non attribués</option>
          {conseillersPresents.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          aria-label="Filtrer par issue du dernier appel"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
        >
          <option value="">Toutes les issues</option>
          {ISSUES_APPEL.map((i) => (
            <option key={i.id} value={i.id}>{i.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setRetardSeul((v) => !v)}
          className={cn(
            "rounded-xl border px-3 py-2 text-sm transition-colors",
            retardSeul
              ? "border-red-400/40 bg-red-500/15 text-red-300"
              : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
          )}
        >
          En retard
        </button>

        <button
          type="button"
          onClick={rafraichirEmails}
          disabled={sync.etat === "encours"}
          title="Relit chez Brevo le dernier email reçu par chaque agence"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/10 disabled:opacity-40"
        >
          {sync.etat === "encours" ? "Lecture…" : "↻ Emails"}
        </button>

        <div className="flex overflow-hidden rounded-xl border border-white/10">
          {(["tableau", "kanban"] as Vue[]).map((v) => (
            <Link
              key={v}
              href={href(v)}
              className={cn(
                "px-3 py-2 text-sm capitalize transition-colors",
                vue === v ? "bg-[#7469F4] text-white" : "bg-white/5 text-white/40 hover:bg-white/10",
              )}
            >
              {v}
            </Link>
          ))}
        </div>
      </div>

      <p className="mb-3 text-xs text-white/25">
        {filtres.length} agence{filtres.length > 1 ? "s" : ""} affichée{filtres.length > 1 ? "s" : ""}
        {filtres.length !== agents.length && ` sur ${agents.length}`}
        {" · "}silence signalé au-delà de {SLA_JOURS} jours
      </p>

      {sync.message && <p className="mb-3 text-xs text-white/40">{sync.message}</p>}
      {erreur && <p className="mb-3 text-sm text-red-400">{erreur}</p>}

      {vue === "kanban" ? (
        <>
          <Kanban agents={filtres} onMove={changerStatut} />
          {rebutes > 0 && (
            <p className="mt-3 text-[11px] text-white/30">
              {rebutes} agence{rebutes > 1 ? "s" : ""} en « Erreur / Test / Doublon » — hors Kanban
              pour ne pas fausser les compteurs.{" "}
              <Link href="/admin/agents" className="text-white/50 underline underline-offset-2 hover:text-white">
                Visible{rebutes > 1 ? "s" : ""} dans la vue Tableau
              </Link>
              .
            </p>
          )}
        </>
      ) : (
        <Tableau agents={filtres} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Tableau                                                                     */
/* ══════════════════════════════════════════════════════════════════════════ */

function Tableau({ agents }: { agents: AgentListe[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#252521]">
      <table className="w-full min-w-[1100px] text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs text-white/30">
            <th className="px-4 py-3 font-normal">Agence</th>
            <th className="px-4 py-3 font-normal">Contact</th>
            <th className="px-4 py-3 font-normal">Téléphones</th>
            <th className="px-4 py-3 font-normal">Secteur</th>
            <th className="px-4 py-3 font-normal">Conseiller</th>
            <th className="px-4 py-3 font-normal">Dernier appel</th>
            <th className="px-4 py-3 font-normal">Dernier email</th>
            <th className="px-4 py-3 font-normal">Rappel</th>
            <th className="px-4 py-3 font-normal">Leads</th>
            <th className="px-4 py-3 font-normal">Partenariat</th>
            <th className="px-4 py-3 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {agents.map((a) => {
            const st = statutPartenariat(a.statut_partenariat);
            const e = suivi(a);
            const em = etatEmail(a.dernier_email_etat);
            return (
              <tr key={a.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  {a.agent_number && (
                    <span className="mr-2 font-mono text-[11px] text-white/30">#{a.agent_number}</span>
                  )}
                  <span className="text-white">{a.agence}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-white/70">{nomContact(a) || "—"}</span>
                  <span className="block truncate text-[11px] text-white/30">{a.email}</span>
                </td>
                {/* Les numéros figurent dans la liste, pas seulement sur la
                    fiche : c'est cette page que l'extension Allo lit pour
                    remplir la file du Power Dialer (ADR-043). Le fixe passe en
                    premier — une agence se joint sur sa ligne d'accueil. */}
                <td className="px-4 py-3 text-white/60">
                  <TelephoneLien tel={a.tel_fixe} />
                  {a.tel && (
                    <span className="block text-[11px]">
                      <TelephoneLien tel={a.tel} />
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/50">
                  {a.commune ?? "—"}
                  {a.departement && <span className="ml-1 text-white/25">({a.departement})</span>}
                </td>
                <td className="px-4 py-3">
                  {a.responsable ? (
                    <span className="text-white/60">{a.responsable}</span>
                  ) : (
                    <span className="text-white/20">non attribué</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {a.dernier_appel_at ? (
                    <>
                      <span className="text-white/50">{dateFr(a.dernier_appel_at)}</span>
                      <span
                        className={cn(
                          "block text-[11px]",
                          e.silencieux ? "text-orange-400" : "text-white/25",
                        )}
                      >
                        il y a {e.joursSansContact} j
                      </span>
                    </>
                  ) : (
                    <span className={cn("text-[11px]", e.silencieux ? "text-orange-400" : "text-white/20")}>
                      jamais appelée
                    </span>
                  )}
                  {issueAppel(a.derniere_issue) && (
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${issueAppel(a.derniere_issue)!.badge}`}
                    >
                      {issueAppel(a.derniere_issue)!.label}
                    </span>
                  )}
                </td>
                {/* Lu chez Brevo, recopié ici pour le tri (§4). Un tiret dit
                    « jamais écrit », pas « pas encore synchronisé » — c'est le
                    bandeau de l'écran qui porte la date de rafraîchissement. */}
                <td className="px-4 py-3">
                  {a.dernier_email_at ? (
                    <>
                      <span className="text-white/50">{dateFr(a.dernier_email_at)}</span>
                      {em && (
                        <span className={`mt-1 block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${em.badge}`}>
                          {em.label}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-white/20">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {a.prochain_rappel_at ? (
                    <span className={e.rappelDepasse ? "text-red-400" : "text-white/50"}>
                      {dateFr(a.prochain_rappel_at)}
                      {e.rappelDepasse && (
                        <span className="block text-[11px]">+{e.joursRetardRappel} j</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-white/20">—</span>
                  )}
                </td>
                {/* Ce que le partenariat a produit. C'est la seule mesure qui
                    dira si un contrat d'apporteur vaut d'être signé. */}
                <td className="px-4 py-3">
                  {a.leads_apportes > 0 ? (
                    <span className="rounded-full bg-[#7469F4]/20 px-2 py-0.5 text-[11px] font-medium text-[#7469F4]">
                      {a.leads_apportes}
                    </span>
                  ) : (
                    <span className="text-white/20">0</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${st.badge}`}>
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/agents/${a.id}`}
                    className="text-[#7469F4] transition-opacity hover:opacity-70"
                  >
                    Ouvrir
                  </Link>
                </td>
              </tr>
            );
          })}
          {agents.length === 0 && (
            <tr>
              <td colSpan={11} className="px-4 py-10 text-center text-sm text-white/25">
                Aucune agence suivie.{" "}
                <Link href="/admin/agents/vivier" className="text-[#7469F4] underline underline-offset-2">
                  Piocher dans la liste Brevo
                </Link>
                .
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Kanban                                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */

function Kanban({
  agents,
  onMove,
}: {
  agents: AgentListe[];
  onMove: (id: string, statut: StatutPartenariatId) => void;
}) {
  const [survole, setSurvole] = useState<string | null>(null);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STATUTS_PARTENARIAT_KANBAN.map((s) => {
        const colonne = agents
          .filter((a) => statutPartenariat(a.statut_partenariat).id === s.id)
          .sort((x, y) => urgence(suivi(y)) - urgence(suivi(x)));

        return (
          <div
            key={s.id}
            onDragOver={(e) => { e.preventDefault(); setSurvole(s.id); }}
            onDragLeave={() => setSurvole((v) => (v === s.id ? null : v))}
            onDrop={(e) => {
              e.preventDefault();
              setSurvole(null);
              const id = e.dataTransfer.getData("text/plain");
              if (id) onMove(id, s.id);
            }}
            className={cn(
              "flex w-[260px] shrink-0 flex-col rounded-2xl border bg-[#252521] transition-colors",
              survole === s.id ? "border-[#7469F4]/60 bg-[#7469F4]/5" : "border-white/10",
            )}
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              <span className="text-xs font-semibold text-white/70">{s.label}</span>
              <span className="ml-auto text-[11px] text-white/30">{colonne.length}</span>
            </div>

            <div className="flex-1 space-y-2 p-2">
              {colonne.map((a) => (
                <Carte key={a.id} agent={a} onMove={onMove} />
              ))}
              {colonne.length === 0 && (
                <p className="px-2 py-6 text-center text-[11px] text-white/15">—</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Carte({
  agent,
  onMove,
}: {
  agent: AgentListe;
  onMove: (id: string, statut: StatutPartenariatId) => void;
}) {
  const e = suivi(agent);
  const em = etatEmail(agent.dernier_email_etat);

  return (
    <div
      draggable
      onDragStart={(ev) => {
        ev.dataTransfer.setData("text/plain", agent.id);
        ev.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-white/15 active:cursor-grabbing"
    >
      <Link href={`/admin/agents/${agent.id}`} className="block">
        <p className="truncate text-sm text-white hover:text-[#7469F4]">
          {agent.agent_number && (
            <span className="mr-1.5 font-mono text-[10px] text-white/30">#{agent.agent_number}</span>
          )}
          {agent.agence}
        </p>
        {nomContact(agent) && (
          <p className="mt-0.5 truncate text-[11px] text-white/35">{nomContact(agent)}</p>
        )}
        {agent.commune && (
          <p className="truncate text-[11px] text-white/25">
            {agent.commune}
            {agent.departement && ` (${agent.departement})`}
          </p>
        )}
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {agent.leads_apportes > 0 && (
          <span className="rounded-full bg-[#7469F4]/20 px-2 py-0.5 text-[10px] font-medium text-[#7469F4]">
            {agent.leads_apportes} lead{agent.leads_apportes > 1 ? "s" : ""}
          </span>
        )}
        {issueAppel(agent.derniere_issue) && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${issueAppel(agent.derniere_issue)!.badge}`}
          >
            {issueAppel(agent.derniere_issue)!.label}
          </span>
        )}
        {em && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${em.badge}`}>
            {em.label}
          </span>
        )}
        {e.rappelDepasse && (
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
            rappel +{e.joursRetardRappel} j
          </span>
        )}
        {!e.rappelDepasse && e.silencieux && (
          <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-medium text-orange-400">
            {e.joursSansContact} j sans contact
          </span>
        )}
        {agent.responsable ? (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">
            {agent.responsable}
          </span>
        ) : (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/20">
            non attribué
          </span>
        )}
      </div>

      {/* Chemin principal sur tactile — le glisser-déposer HTML5 n'y répond pas. */}
      <select
        value={statutPartenariat(agent.statut_partenariat).id}
        onChange={(ev) => onMove(agent.id, ev.target.value as StatutPartenariatId)}
        aria-label={`Statut de partenariat de ${agent.agence}`}
        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60 outline-none focus:border-[#7469F4] [color-scheme:dark]"
      >
        {STATUTS_PARTENARIAT.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
