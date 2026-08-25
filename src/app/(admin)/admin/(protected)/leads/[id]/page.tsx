/**
 * Fiche lead — organisation d'ADR-027, complétée par ADR-035 §6.
 *
 * Colonne de gauche : identification du projet, configuration, journal d'appels,
 * GED Client. Colonne de droite : zone de recherche terrain, PLU et carte —
 * conservées à l'identique, ainsi que les sous-sections mandataire, toujours
 * masquées derrière `FEATURES.mandataire` (ADR-028).
 */

import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { notFound } from "next/navigation";
import AssignMandataire from "@/components/admin/AssignMandataire";
import LeadMapClient from "@/components/admin/LeadMapClient";
import LeadEditIdentite from "@/components/admin/LeadEditIdentite";
import LeadEditLocalisation from "@/components/admin/LeadEditLocalisation";
import LeadDocuments from "@/components/admin/LeadDocuments";
import LeadClientDocuments from "@/components/admin/LeadClientDocuments";
import LeadStatutCommercial from "@/components/admin/LeadStatutCommercial";
import LeadConfiguration from "@/components/admin/LeadConfiguration";
import LeadAppels from "@/components/admin/LeadAppels";
import { FEATURES } from "@/lib/features";
import { etatSuivi, dateHeureFr } from "@/lib/crm";
import { estAdmin } from "@/shared/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type MandataireActif = {
  id: string;
  prenom: string;
  nom: string;
  zone_activite: string | null;
  lat: number | null;
  lon: number | null;
  rayon_intervention: number | null;
};

export default async function LeadFiche({ params }: { params: Promise<{ id: string }> }) {
  /* ADR-039 — défense en profondeur. Le proxy garde déjà cette route ; cette
     seconde vérification protège le jour où le matcher change ou qu'une page
     naît hors de son périmètre. Une page admin ne lit jamais en `service_role`
     sans avoir prouvé l'identité de qui la demande. */
  if (!(await estAdmin())) redirect("/admin/auth/signin");

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  // ADR-028 — les lectures `mandataires` / `fiches_terrain` n'alimentent que
  // les sous-sections d'affectation, masquées quand le domaine est suspendu :
  // on ne les interroge pas inutilement.
  const [{ data: lead }, { data: mandatairesActifs }, { data: fichesActives }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    FEATURES.mandataire
      ? supabase.from("mandataires").select("id, prenom, nom, zone_activite, lat, lon, rayon_intervention").eq("statut", "actif")
      : Promise.resolve({ data: [] as MandataireActif[] }),
    FEATURES.mandataire
      ? supabase.from("fiches_terrain").select("mandataire_id, statut").in("statut", ["disponible", "compromis"])
      : Promise.resolve({ data: [] as { mandataire_id: string; statut: string }[] }),
  ]);

  if (!lead) notFound();

  // Exclusivité territoriale (ADR-026/CGU) : ≥10 fiches terrain actives publiées
  const nbActivesParMandataire = new Map<string, number>();
  for (const f of fichesActives ?? []) {
    nbActivesParMandataire.set(f.mandataire_id, (nbActivesParMandataire.get(f.mandataire_id) ?? 0) + 1);
  }
  const mandataires = (mandatairesActifs ?? []).map((m) => ({
    ...m,
    exclusif: (nbActivesParMandataire.get(m.id) ?? 0) >= 10,
  }));

  const mandataireActuel = lead.mandataire_id
    ? (mandataires.find((m) => m.id === lead.mandataire_id) ?? null)
    : null;

  const identifier = `#${lead.lead_number ?? "—"} — ${lead.prenom} ${lead.nom}`;
  const suivi = etatSuivi(lead);

  return (
    <div className="p-8">
      {/* ── En-tête — identification du projet ─────────────────────────── */}
      <div className="mb-6">
        <a href="/admin/leads" className="text-sm text-white/30 hover:text-white">← Leads</a>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-white">{identifier}</h1>
          <LeadStatutCommercial
            leadId={id}
            current={(lead.statut_commercial as string | null) as Parameters<typeof LeadStatutCommercial>[0]["current"]}
          />
          {suivi.rappelDepasse && (
            <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-medium text-red-400">
              Rappel dépassé de {suivi.joursRetardRappel} j
            </span>
          )}
          {!suivi.rappelDepasse && suivi.silencieux && (
            <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[11px] font-medium text-orange-400">
              {suivi.joursSansContact} j sans contact
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-white/40">
          {lead.email} · {lead.tel}
          {lead.responsable && <span className="text-white/25"> · suivi par {lead.responsable}</span>}
          {lead.prochain_rappel_at && (
            <span className="text-white/25"> · rappel {dateHeureFr(lead.prochain_rappel_at)}</span>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Colonne 1 — projet, configuration, appels, GED Client ─────── */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
            <LeadEditIdentite lead={lead} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
            <LeadConfiguration lead={lead} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
            <LeadAppels
              leadId={id}
              tel={lead.tel ?? null}
              responsable={lead.responsable ?? null}
              statutCommercialActuel={lead.statut_commercial ?? null}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                GED Client
              </h2>
              <p className="mt-1 text-xs text-white/25">
                Pièces du dossier client — celles que nous déposons et celles que le client dépose.
              </p>
            </div>
            <LeadClientDocuments leadId={id} />
          </div>
        </div>

        {/* ── Colonne 2 — zone de recherche terrain (inchangée) ─────────── */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <LeadEditLocalisation lead={lead} />

          {lead.plu_lat && lead.plu_lon && (
            <LeadMapClient
              lon={Number(lead.plu_lon)}
              lat={Number(lead.plu_lat)}
              label={lead.plu_adresse ?? undefined}
            />
          )}

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

          {/* Sous-sections Affectation + Dossier mandataire — masquées tant que
              le domaine mandataire est suspendu (ADR-028). La GED Client
              ci-dessus reste active : elle ne dépend pas du mandataire. */}
          {FEATURES.mandataire && (
          <>
          {/* Sous-section — Affectation mandataire (matching géo 200 km) */}
          <div className="mt-6 border-t border-white/10 pt-6">
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
              mandataires={mandataires}
              leadLat={lead.plu_lat != null ? Number(lead.plu_lat) : null}
              leadLon={lead.plu_lon != null ? Number(lead.plu_lon) : null}
            />
          </div>

          {/* Sous-section — Dossier mandataire (documents partagés) */}
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Dossier mandataire
              </h2>
              <p className="mt-1 text-xs text-white/25">
                Documents techniques, pré-contractuels et commerciaux à partager avec le mandataire affecté.
              </p>
            </div>
            <LeadDocuments
              leadId={id}
              currentMandataireId={lead.mandataire_id ?? null}
            />
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
