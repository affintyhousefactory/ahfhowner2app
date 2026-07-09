import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { KpiCard } from "@/shared/components/admin/KpiCard";
import { AlertBadge } from "@/shared/components/admin/AlertBadge";
import { LeadsDonut } from "@/shared/components/admin/LeadsDonut";
import { DossiersDonut } from "@/shared/components/admin/DossiersDonut";
import { MandatairesBar } from "@/shared/components/admin/MandatairesBar";
import { Entonnoir } from "@/shared/components/admin/Entonnoir";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = getSupabaseAdmin();

  const [
    { data: leads },
    { data: dossiers },
    { data: mandataires },
  ] = await Promise.all([
    supabase.from("leads").select("id, statut, created_at, mandataire_id, affecte_at"),
    supabase.from("dossiers").select("id, statut, pack_prix_ttc, marge_ahf_ht, acte_notarie_at, acompte_client, mandataire_id, created_at"),
    supabase.from("mandataires").select("id, prenom, nom, statut"),
  ]);

  const now = Date.now();
  const h48 = 48 * 3600 * 1000;

  // KPIs financiers (dossiers avec acte notarié signé — seule preuve fiable de finalisation)
  const dossiersFinaux = (dossiers ?? []).filter((d) => d.acte_notarie_at);
  const caBrut = dossiersFinaux.reduce((s, d) => s + (d.pack_prix_ttc ?? 0), 0);
  const revenusAhf = dossiersFinaux.reduce((s, d) => s + (d.marge_ahf_ht ?? 0) + (d.acompte_client ?? 0), 0);

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
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="CA brut" value={`${caBrut.toLocaleString("fr-FR")} €`} sub="dossiers finalisés" />
        <KpiCard label="Revenus AHF nets" value={`${revenusAhf.toLocaleString("fr-FR")} €`} sub="marge + acomptes" />
        <KpiCard label="Dossiers finalisés" value={String(dossiersFinaux.length)} sub={`/ ${(dossiers ?? []).length} total — acte notarié signé`} />
      </div>

      {/* Graphiques */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <LeadsDonut data={leadsByStatut} />
        <DossiersDonut data={dossiersByStatut} />
        <Entonnoir total={totalLeads} affectes={affectes} finalises={finalises} />
      </div>

      <MandatairesBar data={perfData} />
    </div>
  );
}
