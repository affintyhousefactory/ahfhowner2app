"use client";

/**
 * Liste des leads — tableau et Kanban sur le même jeu de données (ADR-035 §6).
 *
 * La colonne « Affectation » (champ `statut`, cycle de vie hérité du modèle
 * mandataire) est retirée : le domaine est suspendu (ADR-028) et le pilotage
 * quotidien passe par `statut_commercial`. Le champ reste en base et éditable
 * depuis la fiche — retiré de la vue, pas supprimé.
 *
 * Le Kanban utilise le glisser-déposer natif du navigateur : huit colonnes ne
 * justifient pas d'alourdir le bundle admin d'une bibliothèque. HTML5 DnD ne
 * couvrant pas le tactile, chaque carte porte aussi un sélecteur de statut —
 * ce n'est pas un repli dégradé, c'est le chemin principal sur mobile.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import {
  STATUTS_COMMERCIAUX,
  statutCommercial,
  etatSuivi,
  urgence,
  SLA_JOURS,
  dateFr,
  eur,
  type StatutCommercialId,
} from "@/lib/crm";

export type LeadListe = {
  id: string;
  lead_number: number | null;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  tel: string | null;
  statut: string | null;
  statut_commercial: string | null;
  responsable: string | null;
  produit: string | null;
  commune: string | null;
  created_at: string;
  dernier_appel_at: string | null;
  prochain_rappel_at: string | null;
  cfg_modele: string | null;
  cfg_total: number | null;
};

type Vue = "tableau" | "kanban";

const MODELES: Record<string, string> = { one: "Arko One", max: "Arko Max" };

/** Le lead v2 porte `cfg_modele` ; les leads antérieurs, le texte `produit`. */
function modeleLabel(l: LeadListe): string {
  if (l.cfg_modele) return MODELES[l.cfg_modele] ?? l.cfg_modele;
  return l.produit ?? "—";
}

export default function LeadsVue({ leads: initial, vue }: { leads: LeadListe[]; vue: Vue }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initial);
  const [q, setQ] = useState("");
  const [conseiller, setConseiller] = useState("");
  const [retardSeul, setRetardSeul] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const conseillersPresents = useMemo(
    () => [...new Set(leads.map((l) => l.responsable).filter(Boolean))].sort() as string[],
    [leads],
  );

  const filtres = useMemo(() => {
    const terme = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (conseiller === "__aucun__" ? Boolean(l.responsable) : conseiller && l.responsable !== conseiller) {
        return false;
      }
      if (retardSeul) {
        const e = etatSuivi(l);
        if (!e.rappelDepasse && !e.silencieux) return false;
      }
      if (!terme) return true;
      return [l.prenom, l.nom, l.email, l.commune, l.responsable, String(l.lead_number ?? "")]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(terme));
    });
  }, [leads, q, conseiller, retardSeul]);

  /** Déplacement Kanban — optimiste, annulé si la route refuse. */
  async function changerStatut(leadId: string, statut: StatutCommercialId) {
    const avant = leads.find((l) => l.id === leadId)?.statut_commercial ?? null;
    if (avant === statut) return;
    setErreur(null);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, statut_commercial: statut } : l)));
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut_commercial: statut }),
      });
      if (!res.ok) throw new Error("Enregistrement refusé");
      router.refresh();
    } catch (e) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, statut_commercial: avant } : l)));
      setErreur(e instanceof Error ? e.message : "Erreur");
    }
  }

  const href = (v: Vue) => (v === "tableau" ? "/admin/leads" : "/admin/leads?vue=kanban");

  return (
    <div>
      {/* ── Barre d'outils ─────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher — nom, email, commune, #numéro"
          className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
        />

        <select
          value={conseiller}
          onChange={(e) => setConseiller(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
        >
          <option value="">Tous les conseillers</option>
          <option value="__aucun__">Non attribués</option>
          {conseillersPresents.map((c) => (
            <option key={c} value={c}>{c}</option>
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
        {filtres.length} lead{filtres.length > 1 ? "s" : ""} affiché{filtres.length > 1 ? "s" : ""}
        {filtres.length !== leads.length && ` sur ${leads.length}`}
        {" · "}silence signalé au-delà de {SLA_JOURS} jours
      </p>

      {erreur && <p className="mb-3 text-sm text-red-400">{erreur}</p>}

      {vue === "kanban" ? (
        <Kanban leads={filtres} onMove={changerStatut} />
      ) : (
        <Tableau leads={filtres} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Tableau                                                                     */
/* ══════════════════════════════════════════════════════════════════════════ */

function Tableau({ leads }: { leads: LeadListe[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#252521]">
      <table className="w-full min-w-[1000px] text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs text-white/30">
            <th className="px-4 py-3 font-normal">Dossier</th>
            <th className="px-4 py-3 font-normal">Email</th>
            <th className="px-4 py-3 font-normal">Maison</th>
            <th className="px-4 py-3 font-normal">Total</th>
            <th className="px-4 py-3 font-normal">Commune</th>
            <th className="px-4 py-3 font-normal">Conseiller</th>
            <th className="px-4 py-3 font-normal">Dernier appel</th>
            <th className="px-4 py-3 font-normal">Rappel</th>
            <th className="px-4 py-3 font-normal">Commercial</th>
            <th className="px-4 py-3 font-normal">Créé</th>
            <th className="px-4 py-3 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {leads.map((l) => {
            const st = statutCommercial(l.statut_commercial);
            const e = etatSuivi(l);
            return (
              <tr key={l.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  {l.lead_number && (
                    <span className="mr-2 font-mono text-[11px] text-white/30">#{l.lead_number}</span>
                  )}
                  <span className="text-white">{l.prenom} {l.nom}</span>
                </td>
                <td className="px-4 py-3 text-white/50">{l.email}</td>
                <td className="px-4 py-3 text-white/50">{modeleLabel(l)}</td>
                <td className="px-4 py-3 text-white/50">{l.cfg_total ? eur(l.cfg_total) : "—"}</td>
                <td className="px-4 py-3 text-white/50">{l.commune ?? "—"}</td>
                <td className="px-4 py-3 text-white/50">
                  {l.responsable ?? <span className="text-white/20">non attribué</span>}
                </td>
                <td className="px-4 py-3 text-xs">
                  <SilenceBadge etat={e} date={l.dernier_appel_at} />
                </td>
                <td className="px-4 py-3 text-xs">
                  <RappelBadge etat={e} date={l.prochain_rappel_at} />
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.badge}`}>
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/30">{dateFr(l.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${l.id}`} className="text-xs text-[#7469F4] hover:underline">
                    Voir →
                  </Link>
                </td>
              </tr>
            );
          })}
          {leads.length === 0 && (
            <tr>
              <td colSpan={11} className="px-4 py-12 text-center text-sm text-white/20">
                Aucun lead ne correspond
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SilenceBadge({ etat, date }: { etat: ReturnType<typeof etatSuivi>; date: string | null }) {
  if (etat.clos) return <span className="text-white/20">—</span>;
  const cls = etat.silencieux ? "text-orange-400" : "text-white/40";
  return (
    <span className={cls} title={etat.jamaisAppele ? "Jamais appelé — compté depuis la création" : dateFr(date)}>
      {etat.jamaisAppele ? `jamais · ${etat.joursSansContact} j` : `${etat.joursSansContact} j`}
    </span>
  );
}

function RappelBadge({ etat, date }: { etat: ReturnType<typeof etatSuivi>; date: string | null }) {
  if (!date) return <span className="text-white/20">—</span>;
  if (etat.rappelDepasse) {
    return (
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-medium text-red-400">
        {dateFr(date)} · +{etat.joursRetardRappel} j
      </span>
    );
  }
  return <span className="text-white/40">{dateFr(date)}</span>;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Kanban                                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */

function Kanban({
  leads,
  onMove,
}: {
  leads: LeadListe[];
  onMove: (id: string, statut: StatutCommercialId) => void;
}) {
  const [survole, setSurvole] = useState<string | null>(null);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STATUTS_COMMERCIAUX.map((s) => {
        const colonne = leads
          .filter((l) => statutCommercial(l.statut_commercial).id === s.id)
          .sort((a, b) => urgence(etatSuivi(b)) - urgence(etatSuivi(a)));

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
              {colonne.map((l) => (
                <Carte key={l.id} lead={l} onMove={onMove} />
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
  lead,
  onMove,
}: {
  lead: LeadListe;
  onMove: (id: string, statut: StatutCommercialId) => void;
}) {
  const e = etatSuivi(lead);

  return (
    <div
      draggable
      onDragStart={(ev) => {
        ev.dataTransfer.setData("text/plain", lead.id);
        ev.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-white/15 active:cursor-grabbing"
    >
      <Link href={`/admin/leads/${lead.id}`} className="block">
        <p className="truncate text-sm text-white hover:text-[#7469F4]">
          {lead.lead_number && (
            <span className="mr-1.5 font-mono text-[10px] text-white/30">#{lead.lead_number}</span>
          )}
          {lead.prenom} {lead.nom}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-white/35">
          {modeleLabel(lead)}
          {lead.cfg_total ? ` · ${eur(lead.cfg_total)}` : ""}
        </p>
        {lead.commune && <p className="truncate text-[11px] text-white/25">{lead.commune}</p>}
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
        {lead.responsable ? (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">
            {lead.responsable}
          </span>
        ) : (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/20">
            non attribué
          </span>
        )}
      </div>

      {/* Chemin principal sur tactile — le glisser-déposer HTML5 n'y répond pas. */}
      <select
        value={statutCommercial(lead.statut_commercial).id}
        onChange={(ev) => onMove(lead.id, ev.target.value as StatutCommercialId)}
        aria-label={`Statut commercial de ${lead.prenom} ${lead.nom}`}
        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60 outline-none focus:border-[#7469F4] [color-scheme:dark]"
      >
        {STATUTS_COMMERCIAUX.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
