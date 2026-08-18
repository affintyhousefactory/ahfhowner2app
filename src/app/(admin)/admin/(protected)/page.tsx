/**
 * Dashboard CRM — ADR-035 §6.
 *
 * Reconstruit autour d'une seule question : quel lead dois-je traiter
 * maintenant ? Les indicateurs financiers et l'entonnoir dérivent tous des
 * `dossiers`, qui n'existent qu'à travers le réseau mandataire (ADR-028) : ils
 * restent derrière `FEATURES.mandataire` plutôt que d'afficher des zéros, qui
 * seraient trompeurs.
 */

import Link from "next/link";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { KpiCard } from "@/shared/components/admin/KpiCard";
import { AlertBadge } from "@/shared/components/admin/AlertBadge";
import { LeadsDonut } from "@/shared/components/admin/LeadsDonut";
import { DossiersDonut } from "@/shared/components/admin/DossiersDonut";
import { MandatairesBar } from "@/shared/components/admin/MandatairesBar";
import { Entonnoir } from "@/shared/components/admin/Entonnoir";
import { StatutsCommerciauxDonut } from "@/shared/components/admin/StatutsCommerciauxDonut";
import { ConseillersBar, type ChargeConseiller } from "@/shared/components/admin/ConseillersBar";
import { FEATURES } from "@/lib/features";
import {
  STATUTS_COMMERCIAUX,
  statutCommercial,
  etatSuivi,
  urgence,
  joursDepuis,
  SLA_JOURS,
  dateFr,
} from "@/lib/crm";

export const dynamic = "force-dynamic";

type Dossier = {
  id: string;
  statut: string;
  pack_prix_ttc: number | null;
  marge_ahf_ht: number | null;
  acte_notarie_at: string | null;
  acompte_client: number | null;
  mandataire_id: string | null;
  created_at: string;
};
type Mandataire = { id: string; prenom: string; nom: string; statut: string };

type LeadRow = {
  id: string;
  lead_number: number | null;
  prenom: string | null;
  nom: string | null;
  statut: string | null;
  statut_commercial: string | null;
  responsable: string | null;
  created_at: string;
  dernier_appel_at: string | null;
  prochain_rappel_at: string | null;
  produit: string | null;
  cfg_modele: string | null;
  cfg_total: number | null;
  mandataire_id: string | null;
};

const SANS_CONSEILLER = "Non attribué";

export default async function AdminDashboard() {
  const supabase = getSupabaseAdmin();

  const [{ data: leadsRaw }, { data: dossiers }, { data: mandataires }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id, lead_number, prenom, nom, statut, statut_commercial, responsable, created_at, dernier_appel_at, prochain_rappel_at, produit, cfg_modele, cfg_total, mandataire_id",
      )
      .order("created_at", { ascending: false }),
    FEATURES.mandataire
      ? supabase.from("dossiers").select("id, statut, pack_prix_ttc, marge_ahf_ht, acte_notarie_at, acompte_client, mandataire_id, created_at")
      : Promise.resolve({ data: [] as Dossier[] }),
    FEATURES.mandataire
      ? supabase.from("mandataires").select("id, prenom, nom, statut")
      : Promise.resolve({ data: [] as Mandataire[] }),
  ]);

  const leads = (leadsRaw ?? []) as LeadRow[];

  /* ── Suivi : l'état est calculé une fois, puis réutilisé partout ───────── */
  const suivis = leads.map((l) => ({ lead: l, etat: etatSuivi(l) }));

  const rappelsDepasses = suivis.filter((s) => s.etat.rappelDepasse);
  const silencieux = suivis.filter((s) => s.etat.silencieux && !s.etat.rappelDepasse);
  const aTraiter = leads.filter((l) => (l.statut_commercial ?? "nouveau") === "nouveau");
  const nonAttribues = suivis.filter((s) => !s.etat.clos && !s.lead.responsable);

  /* ── À traiter en priorité : rappel dépassé d'abord, silence ensuite ───── */
  const prioritaires = suivis
    .filter((s) => !s.etat.clos && (s.etat.rappelDepasse || s.etat.silencieux))
    .sort((a, b) => urgence(b.etat) - urgence(a.etat))
    .slice(0, 12);

  /* ── Répartitions ──────────────────────────────────────────────────────── */
  const parStatutCommercial = leads.reduce<Record<string, number>>((acc, l) => {
    const id = statutCommercial(l.statut_commercial).id;
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});

  const chargeMap = new Map<string, ChargeConseiller>();
  for (const l of leads) {
    const key = l.responsable || SANS_CONSEILLER;
    let row = chargeMap.get(key);
    if (!row) {
      row = { conseiller: key, total: 0 };
      for (const s of STATUTS_COMMERCIAUX) row[s.id] = 0;
      chargeMap.set(key, row);
    }
    const st = statutCommercial(l.statut_commercial).id;
    row[st] = Number(row[st] ?? 0) + 1;
    row.total += 1;
  }
  const charge = [...chargeMap.values()].sort((a, b) => b.total - a.total);

  /* ── Volet mandataire — inchangé, suspendu (ADR-028) ───────────────────── */
  const dossiersFinaux = (dossiers ?? []).filter((d) => d.acte_notarie_at);
  const caBrut = dossiersFinaux.reduce((s, d) => s + (d.pack_prix_ttc ?? 0), 0);
  const revenusAhf = dossiersFinaux.reduce((s, d) => s + (d.marge_ahf_ht ?? 0) + (d.acompte_client ?? 0), 0);
  const mandatairesEnAttente = (mandataires ?? []).filter((m) => m.statut === "en_attente").length;
  const dossiersAlerte = (dossiers ?? []).filter(
    (d) => d.statut === "proposé" && (joursDepuis(d.created_at) ?? 0) >= 2,
  ).length;
  const leadsByStatut = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.statut ?? "nouveau"] = (acc[l.statut ?? "nouveau"] ?? 0) + 1;
    return acc;
  }, {});
  const dossiersByStatut = (dossiers ?? []).reduce<Record<string, number>>((acc, d) => {
    acc[d.statut] = (acc[d.statut] ?? 0) + 1;
    return acc;
  }, {});
  const perfMap: Record<string, { nom: string; count: number; ca: number }> = {};
  for (const d of dossiersFinaux) {
    if (!d.mandataire_id) continue;
    const m = (mandataires ?? []).find((x) => x.id === d.mandataire_id);
    if (!m) continue;
    if (!perfMap[d.mandataire_id]) perfMap[d.mandataire_id] = { nom: `${m.prenom} ${m.nom}`, count: 0, ca: 0 };
    perfMap[d.mandataire_id].count++;
    perfMap[d.mandataire_id].ca += d.pack_prix_ttc ?? 0;
  }
  const perfData = Object.values(perfMap).sort((a, b) => b.ca - a.ca).slice(0, 8);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/40">Suivi commercial des leads — Affinity House Factory</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {rappelsDepasses.length > 0 && (
            <AlertBadge
              label={`${rappelsDepasses.length} rappel${rappelsDepasses.length > 1 ? "s" : ""} dépassé${rappelsDepasses.length > 1 ? "s" : ""}`}
              color="red"
            />
          )}
          {silencieux.length > 0 && (
            <AlertBadge label={`${silencieux.length} sans nouvelle > ${SLA_JOURS} j`} color="orange" />
          )}
          {FEATURES.mandataire && mandatairesEnAttente > 0 && (
            <AlertBadge label={`${mandatairesEnAttente} mandataire${mandatairesEnAttente > 1 ? "s" : ""} en attente`} color="violet" />
          )}
          {FEATURES.mandataire && dossiersAlerte > 0 && (
            <AlertBadge label={`${dossiersAlerte} dossier${dossiersAlerte > 1 ? "s" : ""} sans réponse > 48h`} color="red" />
          )}
        </div>
      </div>

      {/* ── Indicateurs de suivi ─────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Leads" value={String(leads.length)} sub="tous statuts confondus" />
        <KpiCard label="À traiter" value={String(aTraiter.length)} sub="statut « nouveau »" />
        <KpiCard
          label="Rappels dépassés"
          value={String(rappelsDepasses.length)}
          sub="échéance de rappel passée"
        />
        <KpiCard
          label={`Sans nouvelle > ${SLA_JOURS} j`}
          value={String(silencieux.length)}
          sub="leads actifs, aucun contact"
        />
        <KpiCard label="Non attribués" value={String(nonAttribues.length)} sub="sans conseiller" />
      </div>

      {/* ── À traiter en priorité ────────────────────────────────────────── */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#252521]">
        <div className="flex items-baseline justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            À traiter en priorité
          </h3>
          <Link href="/admin/leads" className="text-xs text-[#7469F4] hover:underline">
            Tous les leads →
          </Link>
        </div>

        {prioritaires.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-white/20">
            Aucun retard — tous les leads actifs ont été contactés dans les {SLA_JOURS} derniers jours.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-white/30">
                <th className="px-6 py-2.5 font-normal">Dossier</th>
                <th className="px-4 py-2.5 font-normal">Statut</th>
                <th className="px-4 py-2.5 font-normal">Conseiller</th>
                <th className="px-4 py-2.5 font-normal">Dernier appel</th>
                <th className="px-4 py-2.5 font-normal">Rappel prévu</th>
                <th className="px-4 py-2.5 font-normal">Alerte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {prioritaires.map(({ lead, etat }) => {
                const st = statutCommercial(lead.statut_commercial);
                return (
                  <tr key={lead.id} className="hover:bg-white/5">
                    <td className="px-6 py-3">
                      <Link href={`/admin/leads/${lead.id}`} className="text-white hover:text-[#7469F4]">
                        {lead.lead_number && (
                          <span className="mr-2 font-mono text-[11px] text-white/30">#{lead.lead_number}</span>
                        )}
                        {lead.prenom} {lead.nom}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.badge}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{lead.responsable ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {etat.jamaisAppele
                        ? `jamais — créé il y a ${etat.joursSansContact} j`
                        : `${dateFr(lead.dernier_appel_at)} · ${etat.joursSansContact} j`}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">{dateFr(lead.prochain_rappel_at)}</td>
                    <td className="px-4 py-3">
                      {etat.rappelDepasse ? (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-400">
                          Rappel dépassé de {etat.joursRetardRappel} j
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[11px] font-medium text-orange-400">
                          Sans nouvelle {etat.joursSansContact} j
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Répartitions ─────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatutsCommerciauxDonut data={parStatutCommercial} />
        <ConseillersBar data={charge} />
      </div>

      {/* ── Volet mandataire — suspendu (ADR-028) ────────────────────────── */}
      {FEATURES.mandataire && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard label="CA brut" value={`${caBrut.toLocaleString("fr-FR")} €`} sub="dossiers finalisés" />
            <KpiCard label="Revenus AHF nets" value={`${revenusAhf.toLocaleString("fr-FR")} €`} sub="marge + acomptes" />
            <KpiCard
              label="Dossiers finalisés"
              value={String(dossiersFinaux.length)}
              sub={`/ ${(dossiers ?? []).length} total — acte notarié signé`}
            />
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <LeadsDonut data={leadsByStatut} />
            <DossiersDonut data={dossiersByStatut} />
            <Entonnoir
              total={leads.length}
              affectes={leads.filter((l) => l.mandataire_id).length}
              finalises={dossiersFinaux.length}
            />
          </div>
          <MandatairesBar data={perfData} />
        </>
      )}
    </div>
  );
}
