import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { notFound } from "next/navigation";
import AssignMandataire from "@/components/admin/AssignMandataire";
import LeadMapClient from "@/components/admin/LeadMapClient";
import LeadEditIdentite from "@/components/admin/LeadEditIdentite";
import LeadEditLocalisation from "@/components/admin/LeadEditLocalisation";
import LeadDocuments from "@/components/admin/LeadDocuments";

export const dynamic = "force-dynamic";

export default async function LeadFiche({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const [{ data: lead }, { data: mandataires }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase.from("mandataires").select("id, prenom, nom, zone_activite").eq("statut", "actif"),
  ]);

  if (!lead) notFound();

  const mandataireActuel = lead.mandataire_id
    ? (mandataires?.find((m) => m.id === lead.mandataire_id) ?? null)
    : null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <a href="/admin/leads" className="text-sm text-white/30 hover:text-white">← Leads</a>
        <h1 className="mt-2 text-xl font-semibold text-white">
          {lead.prenom} {lead.nom}
        </h1>
        <p className="text-sm text-white/40">{lead.email} · {lead.tel}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Zone 1 — Identité & Projet (éditable) */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <LeadEditIdentite lead={lead} />
        </div>

        {/* Zone 2 — Localisation (éditable) */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <LeadEditLocalisation lead={lead} />

          {/* Carte parcelle PLU */}
          {lead.plu_lat && lead.plu_lon && (
            <LeadMapClient
              lon={Number(lead.plu_lon)}
              lat={Number(lead.plu_lat)}
              label={lead.plu_adresse ?? undefined}
            />
          )}

          {/* Données PLU */}
          {lead.plu_adresse && (
            <>
              <h2 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Données PLU
              </h2>
              <dl className="space-y-2 text-sm">
                {([
                  ["Parcelle", lead.plu_parcelle ?? lead.parcelle_idu],
                  ["Adresse", lead.plu_adresse],
                  ["Zone", lead.plu_zone],
                  ["Type doc", lead.plu_typedoc],
                  ["Approuvé le", lead.plu_datappro],
                  ["Libellé", lead.plu_libelong],
                ] as [string, string | null][]).map(([label, value]) =>
                  value ? (
                    <div key={label} className="flex justify-between">
                      <dt className="text-white/40">{label}</dt>
                      <dd className="text-white text-xs">{value}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </>
          )}
        </div>

        {/* Zone 3 — Affectation mandataire */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Affectation mandataire
          </h2>

          {mandataireActuel ? (
            <div className="mb-4 rounded-xl bg-[#7469F4]/10 px-4 py-3 text-sm">
              <p className="text-white/60 text-xs mb-1">Mandataire actuel</p>
              <p className="font-medium text-[#7469F4]">
                {mandataireActuel.prenom} {mandataireActuel.nom}
              </p>
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

        {/* Zone 4 — Documents & Dossiers */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <LeadDocuments
            leadId={id}
            currentMandataireId={lead.mandataire_id ?? null}
            mandataires={mandataires ?? []}
          />
        </div>
      </div>
    </div>
  );
}
