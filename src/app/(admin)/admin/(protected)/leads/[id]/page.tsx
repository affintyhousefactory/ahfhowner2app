import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import AssignMandataire from "@/components/admin/AssignMandataire";

const LeadMap = dynamic(() => import("@/components/admin/LeadMap"), { ssr: false });

export const dynamic = "force-dynamic";

export default async function LeadFiche({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const [{ data: lead }, { data: dossiers }, { data: mandataires }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase.from("dossiers").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("mandataires").select("id, prenom, nom, zone_activite").eq("statut", "actif"),
  ]);

  if (!lead) notFound();

  const mandataireActuel = lead.mandataire_id
    ? mandataires?.find((m) => m.id === lead.mandataire_id) ?? null
    : null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <a href="/admin/leads" className="text-sm text-white/30 hover:text-white">← Leads</a>
        <h1 className="mt-2 text-xl font-semibold text-white">{lead.prenom} {lead.nom}</h1>
        <p className="text-sm text-white/40">{lead.email} · {lead.tel}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Zone 1 — Identité */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Identité & projet</h2>
          <dl className="space-y-2 text-sm">
            {([
              ["Modèle", lead.produit],
              ["Pack", lead.pack_terrain],
              ["Budget terrain", lead.budget_terrain ? `${Number(lead.budget_terrain).toLocaleString("fr-FR")} €` : null],
              ["Total estimé", lead.total_estime ? `${Number(lead.total_estime).toLocaleString("fr-FR")} €` : null],
              ["Source", lead.source],
              ["Statut", lead.statut],
            ] as [string, string | null][]).map(([label, value]) => value ? (
              <div key={label} className="flex justify-between">
                <dt className="text-white/40">{label}</dt>
                <dd className="text-white">{value}</dd>
              </div>
            ) : null)}
          </dl>

          <div className="mt-4">
            <label className="text-xs text-white/40">Notes AHF</label>
            <textarea
              defaultValue={lead.notes_ahf ?? ""}
              rows={4}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4]"
              placeholder="Notes internes…"
            />
          </div>
        </div>

        {/* Zone 2 — Localisation */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Localisation</h2>
          <dl className="space-y-2 text-sm">
            {([
              ["Adresse recherche", lead.adresse_recherche],
              ["Commune", lead.commune],
              ["Code postal", lead.code_postal],
              ["Département", lead.departement],
            ] as [string, string | null][]).map(([label, value]) => value ? (
              <div key={label} className="flex justify-between">
                <dt className="text-white/40">{label}</dt>
                <dd className="text-white">{value}</dd>
              </div>
            ) : null)}
          </dl>

          {/* Carte parcelle */}
          {lead.plu_lat && lead.plu_lon && (
            <LeadMap lon={Number(lead.plu_lon)} lat={Number(lead.plu_lat)} label={lead.plu_adresse ?? undefined} />
          )}

          {/* Zone PLU */}
          {lead.plu_adresse && (
            <>
              <h2 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Données PLU</h2>
              <dl className="space-y-2 text-sm">
                {([
                  ["Parcelle", lead.plu_parcelle ?? lead.parcelle_idu],
                  ["Adresse", lead.plu_adresse],
                  ["Zone", lead.plu_zone],
                  ["Type doc", lead.plu_typedoc],
                  ["Approuvé le", lead.plu_datappro],
                  ["Libellé", lead.plu_libelong],
                ] as [string, string | null][]).map(([label, value]) => value ? (
                  <div key={label} className="flex justify-between">
                    <dt className="text-white/40">{label}</dt>
                    <dd className="text-white text-xs">{value}</dd>
                  </div>
                ) : null)}
              </dl>
            </>
          )}
        </div>

        {/* Zone 3 — Affectation mandataire */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Affectation mandataire</h2>

          {mandataireActuel ? (
            <div className="mb-4 rounded-xl bg-[#7469F4]/10 px-4 py-3 text-sm">
              <p className="text-white/60 text-xs mb-1">Mandataire actuel</p>
              <p className="font-medium text-[#7469F4]">{mandataireActuel.prenom} {mandataireActuel.nom}</p>
              {lead.affecte_at && (
                <p className="mt-0.5 text-xs text-white/30">
                  Affecté le {new Date(lead.affecte_at).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          ) : (
            <p className="mb-3 text-sm text-white/30">Aucun mandataire affecté.</p>
          )}

          <AssignMandataire
            leadId={id}
            currentMandataireId={lead.mandataire_id ?? null}
            mandataires={mandataires ?? []}
            leadCommune={lead.commune ?? null}
          />
        </div>

        {/* Zone 4 — Dossiers */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Dossiers associés</h2>
          {(dossiers ?? []).length === 0 ? (
            <p className="text-sm text-white/20">Aucun dossier — affectez un mandataire depuis la page Affectations.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/30">
                  <th className="pb-2 font-normal">Statut</th>
                  <th className="pb-2 font-normal">Pack</th>
                  <th className="pb-2 font-normal text-right">Prix TTC</th>
                  <th className="pb-2 font-normal text-right">Rém.</th>
                  <th className="pb-2 font-normal text-right">Marge</th>
                  <th className="pb-2 font-normal">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(dossiers ?? []).map((d) => (
                  <tr key={d.id}>
                    <td className="py-2 text-white/70">{d.statut}</td>
                    <td className="py-2 text-white/50">{d.pack_label ?? "—"}</td>
                    <td className="py-2 text-right text-white">{d.pack_prix_ttc?.toLocaleString("fr-FR")} €</td>
                    <td className="py-2 text-right text-[#7469F4]">{d.remuneration_mandataire_ht?.toLocaleString("fr-FR")} €</td>
                    <td className="py-2 text-right text-green-400">{d.marge_ahf_ht?.toLocaleString("fr-FR")} €</td>
                    <td className="py-2 text-white/30 text-xs">{new Date(d.created_at).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
