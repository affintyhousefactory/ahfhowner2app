import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { KpiCard } from "@/shared/components/admin/KpiCard";
import { AlertBadge } from "@/shared/components/admin/AlertBadge";
import { LeadsDonut } from "@/shared/components/admin/LeadsDonut";
import { DossiersDonut } from "@/shared/components/admin/DossiersDonut";
import { MandatairesBar } from "@/shared/components/admin/MandatairesBar";
import { Entonnoir } from "@/shared/components/admin/Entonnoir";

export const dynamic = "force-dynamic";

const GRILLE = {
  essentiel: { prix: 4900, remuneration: 3600, marge: 1300 },
  etendu:    { prix: 7300, remuneration: 5500, marge: 1800 },
  departement: { prix: 11200, remuneration: 8400, marge: 2800 },
};

export default async function AdminDashboard() {
  const supabase = getSupabaseAdmin();

  const [
    { data: leads },
    { data: dossiers },
    { data: mandataires },
  ] = await Promise.all([
    supabase.from("leads").select("id, statut, created_at, mandataire_id, affecte_at"),
    supabase.from("dossiers").select("id, statut, pack_prix_ttc, marge_ahf_ht, remuneration_mandataire_ht, acompte_client, mandataire_id, created_at"),
    supabase.from("mandataires").select("id, prenom, nom, statut"),
  ]);

  const now = Date.now();
  const h48 = 48 * 3600 * 1000;

  // KPIs financiers (dossiers finalisés)
  const dossiersFinaux = (dossiers ?? []).filter((d) => d.statut === "finalisé");
  const caBrut = dossiersFinaux.reduce((s, d) => s + (d.pack_prix_ttc ?? 0), 0);
  const revenusAhf = dossiersFinaux.reduce((s, d) => s + (d.marge_ahf_ht ?? 0) + (d.acompte_client ?? 0), 0);
  const remunerationsDues = dossiersFinaux.reduce((s, d) => s + (d.remuneration_mandataire_ht ?? 0), 0);

  // Alertes
  const leadsEnAttente = (leads ?? []).filter(
    (l) => !l.mandataire_id && l.statut !== "perdu" && (now - new Date(l.created_at).getTime()) > h48,
  ).length;
  const mandatairesEnAttente = (mandataires ?? []).filter((m) => m.statut === "en_attente").length;
  const dossiersAlerte = (dossiers ?? []).filter(
    (d) => d.statut === "proposé" && (now - new Date(d.created_at).getTime()) > h48,
  ).length;

  // Leads par statut
  const leadsByStatut = (leads ?? []).reduce<Record<string, number>>((acc, l) => {
    acc[l.statut ?? "nouveau"] = (acc[l.statut ?? "nouveau"] ?? 0) + 1;
    return acc;
  }, {});

  // Dossiers par statut
  const dossiersByStatut = (dossiers ?? []).reduce<Record<string, number>>((acc, d) => {
    acc[d.statut] = (acc[d.statut] ?? 0) + 1;
    return acc;
  }, {});

  // Performance mandataires
  const perfMap: Record<string, { nom: string; count: number; ca: number }> = {};
  for (const d of dossiersFinaux) {
    if (!d.mandataire_id) continue;
    const m = (mandataires ?? []).find((x) => x.id === d.mandataire_id);
    if (!m) continue;
    const key = d.mandataire_id;
    if (!perfMap[key]) perfMap[key] = { nom: `${m.prenom} ${m.nom}`, count: 0, ca: 0 };
    perfMap[key].count++;
    perfMap[key].ca += d.pack_prix_ttc ?? 0;
  }
  const perfData = Object.values(perfMap).sort((a, b) => b.ca - a.ca).slice(0, 8);

  // Entonnoir
  const totalLeads = (leads ?? []).length;
  const affectes = (leads ?? []).filter((l) => l.mandataire_id).length;
  const finalises = dossiersFinaux.length;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/40">Vue synthétique — Affinity House Factory</p>
        </div>
        <div className="flex gap-3">
          {leadsEnAttente > 0 && <AlertBadge label={`${leadsEnAttente} lead${leadsEnAttente > 1 ? "s" : ""} sans affectation > 48h`} color="orange" />}
          {mandatairesEnAttente > 0 && <AlertBadge label={`${mandatairesEnAttente} mandataire${mandatairesEnAttente > 1 ? "s" : ""} en attente`} color="violet" />}
          {dossiersAlerte > 0 && <AlertBadge label={`${dossiersAlerte} dossier${dossiersAlerte > 1 ? "s" : ""} sans réponse > 48h`} color="red" />}
        </div>
      </div>

      {/* KPIs financiers */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="CA brut" value={`${caBrut.toLocaleString("fr-FR")} €`} sub="dossiers finalisés" />
        <KpiCard label="Revenus AHF nets" value={`${revenusAhf.toLocaleString("fr-FR")} €`} sub="marge + acomptes" />
        <KpiCard label="Rémunérations dues" value={`${remunerationsDues.toLocaleString("fr-FR")} €`} sub="mandataires" />
        <KpiCard label="Dossiers finalisés" value={String(dossiersFinaux.length)} sub={`/ ${(dossiers ?? []).length} total`} />
      </div>

      {/* Graphiques */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <LeadsDonut data={leadsByStatut} />
        <DossiersDonut data={dossiersByStatut} />
        <Entonnoir total={totalLeads} affectes={affectes} finalises={finalises} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MandatairesBar data={perfData} />

        {/* Grille tarifaire de référence */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h3 className="mb-4 text-sm font-semibold text-white/70 uppercase tracking-wider">Grille article 4 — Contrat</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-white/30">
                <th className="pb-2 font-normal">Pack</th>
                <th className="pb-2 font-normal text-right">Prix TTC</th>
                <th className="pb-2 font-normal text-right">Rém. HT</th>
                <th className="pb-2 font-normal text-right">Marge AHF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.entries(GRILLE).map(([key, g]) => (
                <tr key={key}>
                  <td className="py-2 capitalize text-white/70">{key}</td>
                  <td className="py-2 text-right text-white">{g.prix.toLocaleString("fr-FR")} €</td>
                  <td className="py-2 text-right text-[#7469F4]">{g.remuneration.toLocaleString("fr-FR")} €</td>
                  <td className="py-2 text-right text-[#2d6b27]">~{g.marge.toLocaleString("fr-FR")} €</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] text-white/20">Acompte AHF retenu : 1 500 € — non reversé mandataire</p>
        </div>
      </div>
    </div>
  );
}
