import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { notFound } from "next/navigation";
import MandataireActions from "@/components/admin/MandataireActions";

export const dynamic = "force-dynamic";

export default async function MandataireFiche({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const [{ data: m }, { data: dossiers }] = await Promise.all([
    supabase.from("mandataires").select("*").eq("id", id).single(),
    supabase.from("dossiers").select("*, leads(prenom, nom)").eq("mandataire_id", id).order("created_at", { ascending: false }),
  ]);

  if (!m) notFound();

  const finalisés = (dossiers ?? []).filter((d) => d.statut === "finalisé");
  const caGenere = finalisés.reduce((s, d) => s + (d.pack_prix_ttc ?? 0), 0);
  const remuDues = finalisés.reduce((s, d) => s + (d.remuneration_mandataire_ht ?? 0), 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <a href="/admin/mandataires" className="text-sm text-white/30 hover:text-white">← Mandataires</a>
        <div className="mt-2 flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">{m.prenom} {m.nom}</h1>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${m.statut === "actif" ? "bg-[#2d6b27]/30 text-green-400" : m.statut === "en_attente" ? "bg-[#e07b28]/20 text-[#e07b28]" : "bg-white/10 text-white/30"}`}>
            {m.statut}
          </span>
        </div>
        <p className="text-sm text-white/40">{m.email} · {m.tel}</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-4">
          <p className="text-[11px] uppercase tracking-wider text-white/30">Dossiers finalisés</p>
          <p className="mt-1 text-2xl font-semibold text-white">{finalisés.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-4">
          <p className="text-[11px] uppercase tracking-wider text-white/30">CA généré</p>
          <p className="mt-1 text-2xl font-semibold text-white">{caGenere.toLocaleString("fr-FR")} €</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-4">
          <p className="text-[11px] uppercase tracking-wider text-white/30">Rémunérations dues</p>
          <p className="mt-1 text-2xl font-semibold text-[#7469F4]">{remuDues.toLocaleString("fr-FR")} €</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identité */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Identité</h2>
          <dl className="space-y-2 text-sm">
            {[
              ["SIRET", m.siret],
              ["Forme juridique", m.forme_juridique],
              ["Adresse", m.adresse],
              ["Réseau carte T", m.reseau_carte_t],
              ["N° carte T", m.carte_t_numero],
              ["Contrat signé", m.contrat_signe_at ? new Date(m.contrat_signe_at).toLocaleDateString("fr-FR") : null],
            ].map(([label, value]) => value ? (
              <div key={label as string} className="flex justify-between">
                <dt className="text-white/40">{label}</dt>
                <dd className="text-white">{value}</dd>
              </div>
            ) : null)}
          </dl>

          {/* Actions admin */}
          <div className="mt-6">
            <MandataireActions mandataireId={m.id} currentStatut={m.statut as "invite" | "en_attente" | "actif" | "suspendu"} />
          </div>
        </div>

        {/* Dossiers */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Dossiers ({(dossiers ?? []).length})</h2>
          {(dossiers ?? []).length === 0 ? (
            <p className="text-sm text-white/20">Aucun dossier affecté</p>
          ) : (
            <div className="space-y-2">
              {(dossiers ?? []).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 text-sm">
                  <span className="text-white/70">{(d.leads as { prenom: string; nom: string } | null)?.prenom} {(d.leads as { prenom: string; nom: string } | null)?.nom}</span>
                  <span className="text-xs text-white/30">{d.statut}</span>
                  <span className="text-[#7469F4] text-xs">{d.pack_prix_ttc?.toLocaleString("fr-FR")} €</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
