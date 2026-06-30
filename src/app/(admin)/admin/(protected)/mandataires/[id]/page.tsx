import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { notFound } from "next/navigation";
import MandataireActions from "@/components/admin/MandataireActions";
import MandataireEditContact from "@/components/admin/MandataireEditContact";

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
  const caGenere   = finalisés.reduce((s, d) => s + (d.pack_prix_ttc ?? 0), 0);
  const remuDues   = finalisés.reduce((s, d) => s + (d.remuneration_mandataire_ht ?? 0), 0);

  const RAYONS: Record<string, string> = {
    "20km": "20 km", "50km": "50 km", "80km": "80 km",
    "département": "Département", "région": "Région",
  };
  const DELAIS: Record<string, string> = {
    "moins_2h": "< 2h", "moins_24h": "< 24h", "48h": "48h",
  };
  const SPECS: Record<string, string> = {
    terrain: "Terrain", maison_individuelle: "Maison individuelle",
    investissement: "Investissement", residence_secondaire: "Résidence secondaire",
    division_parcellaire: "Division parcellaire", locatif: "Locatif",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <a href="/admin/mandataires" className="text-sm text-white/30 hover:text-white">← Mandataires</a>
        <div className="mt-2 flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">{m.prenom} {m.nom}</h1>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            m.statut === "actif"       ? "bg-[#2d6b27]/30 text-green-400"   :
            m.statut === "en_attente"  ? "bg-[#e07b28]/20 text-[#e07b28]"  :
            "bg-white/10 text-white/30"
          }`}>
            {m.statut}
          </span>
          {m.contrat_signe_at && (
            <span className="rounded-full bg-[#7469F4]/10 px-2.5 py-1 text-xs text-[#7469F4]">
              Contrat signé le {new Date(m.contrat_signe_at).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
        <p className="text-sm text-white/40">{m.email}{m.tel ? ` · ${m.tel}` : ""}</p>
      </div>

      {/* KPIs */}
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
        {/* Contact & Profil — éditable */}
        <MandataireEditContact m={{
          id:                   m.id,
          prenom:               m.prenom,
          nom:                  m.nom,
          email:                m.email,
          tel:                  m.tel,
          statut_professionnel: m.statut_professionnel,
          reseau_type:          m.reseau_type,
          adresse_principale:   m.adresse_principale,
          cp_principal:         m.cp_principal,
          ville_principale:     m.ville_principale,
          rayon_intervention:   m.rayon_intervention,
          delai_rappel:         m.delai_rappel,
          specialites:          m.specialites,
        }} />

        {/* Entreprise & Contrat — lecture seule */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Entreprise &amp; Contrat
          </h2>
          <dl className="space-y-2 text-sm">
            {([
              ["SIRET",          m.siret],
              ["Forme juridique", m.forme_juridique],
              ["Adresse siège",  m.adresse],
              ["Réseau carte T", m.reseau_carte_t],
              ["N° carte T",     m.carte_t_numero],
            ] as [string, string | null][]).map(([label, value]) =>
              value ? (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">{label}</dt>
                  <dd className="text-right text-white">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>

          {m.contrat_url && (
            <a href={m.contrat_url} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#7469F4] hover:underline">
              Télécharger le contrat signé ↗
            </a>
          )}

          {/* Actions statut */}
          <div className="mt-6 border-t border-white/5 pt-4">
            <MandataireActions
              mandataireId={m.id}
              currentStatut={m.statut as "invite" | "en_attente" | "actif" | "suspendu"}
            />
          </div>
        </div>

        {/* Zone d'intervention */}
        {(m.adresse_principale || m.rayon_intervention || (m.specialites ?? []).length > 0) && (
          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Zone d'intervention
            </h2>
            <dl className="space-y-2 text-sm">
              {m.adresse_principale && (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">Adresse principale</dt>
                  <dd className="text-right text-white">
                    {m.adresse_principale}
                    {(m.cp_principal || m.ville_principale) && (
                      <span className="block text-xs text-white/40">
                        {[m.cp_principal, m.ville_principale].filter(Boolean).join(" ")}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {m.rayon_intervention && (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">Rayon</dt>
                  <dd className="text-white">{RAYONS[m.rayon_intervention] ?? m.rayon_intervention}</dd>
                </div>
              )}
              {m.delai_rappel && (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">Délai rappel</dt>
                  <dd className="text-white">{DELAIS[m.delai_rappel] ?? m.delai_rappel}</dd>
                </div>
              )}
              {(m.specialites ?? []).length > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">Spécialités</dt>
                  <dd className="text-right text-white/70">
                    {(m.specialites as string[]).map((s) => SPECS[s] ?? s).join(", ")}
                  </dd>
                </div>
              )}
              {m.lat && m.lon && (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">Géolocalisation</dt>
                  <dd className="font-mono text-xs text-white/40">
                    {Number(m.lat).toFixed(4)}, {Number(m.lon).toFixed(4)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Dossiers */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Dossiers ({(dossiers ?? []).length})
          </h2>
          {(dossiers ?? []).length === 0 ? (
            <p className="text-sm text-white/20">Aucun dossier affecté</p>
          ) : (
            <div className="space-y-2">
              {(dossiers ?? []).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 text-sm">
                  <span className="text-white/70">
                    {(d.leads as { prenom: string; nom: string } | null)?.prenom}{" "}
                    {(d.leads as { prenom: string; nom: string } | null)?.nom}
                  </span>
                  <span className="text-xs text-white/30">{d.statut}</span>
                  <span className="text-xs text-[#7469F4]">{d.pack_prix_ttc?.toLocaleString("fr-FR")} €</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
