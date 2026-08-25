import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { notFound } from "next/navigation";
import TerrainAdminActions from "@/components/admin/TerrainAdminActions";
import { guardMandataire } from "@/shared/lib/feature-guard";
import { estAdmin } from "@/shared/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const STATUT_ADMIN_COLORS: Record<string, string> = {
  en_attente: "bg-amber-500/20 text-amber-400",
  valide:     "bg-[#7469F4]/20 text-[#7469F4]",
  refuse:     "bg-red-500/20 text-red-400",
  publie:     "bg-green-500/20 text-green-400",
};

const STATUT_ADMIN_LABELS: Record<string, string> = {
  en_attente: "En attente",
  valide:     "Validé",
  refuse:     "Refusé",
  publie:     "Publié",
};

const COMPAT_LABELS: Record<string, string> = {
  precompatible:  "Précompatible",
  a_confirmer:    "À confirmer",
  non_compatible: "Non compatible",
};

const MODELE_LABELS: Record<string, string> = {
  one:  "Arko One",
  max:  "Arko Max",
  both: "One + Max",
};

const CONTACT_ROLE_LABELS: Record<string, string> = {
  proprietaire: "Propriétaire",
  notaire: "Notaire",
  agence_partenaire: "Agence partenaire",
  autre_mandataire: "Mandataire indépendant",
  autre: "Contact",
};

type FicheTerrainFull = {
  id: string;
  commune: string;
  secteur: string | null;
  prix: number | null;
  surface: number | null;
  zonage: string | null;
  urbanisme_detail: string | null;
  acces_grue: string | null;
  pente_pct: number | null;
  reseaux: string | null;
  assainissement: string | null;
  compatibilite_arko: string | null;
  modele_arko: string | null;
  statut: string;
  statut_admin: string;
  admin_commentaire: string | null;
  description_publique: string | null;
  titre: string | null;
  publie_at: string | null;
  afficher_statut_mandataire: boolean | null;
  photos: { url: string; nom: string }[];
  notes: string | null;
  reserves: string[];
  created_at: string;
  updated_at: string;
  contact_nom: string | null;
  contact_prenom: string | null;
  contact_telephone: string | null;
  contact_role: string | null;
  contact_role_detail: string | null;
  mandataires: { id: string; prenom: string; nom: string; email: string } | null;
};

export default async function TerrainFicheAdmin({ params }: { params: Promise<{ id: string }> }) {
  /* ADR-039 — défense en profondeur. Le proxy garde déjà cette route ; cette
     seconde vérification protège le jour où le matcher change ou qu'une page
     naît hors de son périmètre. Une page admin ne lit jamais en `service_role`
     sans avoir prouvé l'identité de qui la demande. */
  if (!(await estAdmin())) redirect("/admin/auth/signin");

  // ADR-028 — défense en profondeur derrière le proxy : empêche la
  // requête Supabase si la page était atteinte par un autre chemin.
  guardMandataire();

  const { id } = await params;
  const { data: fiche } = await getSupabaseAdmin()
    .from("fiches_terrain")
    .select("*, mandataires(id, prenom, nom, email)")
    .eq("id", id)
    .single();

  if (!fiche) notFound();

  const f = fiche as unknown as FicheTerrainFull;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <a href="/admin/terrains" className="text-sm text-white/30 hover:text-white">← Terrains</a>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-white">{f.commune}{f.secteur ? ` — ${f.secteur}` : ""}</h1>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUT_ADMIN_COLORS[f.statut_admin] ?? "text-white/30"}`}>
            {STATUT_ADMIN_LABELS[f.statut_admin] ?? f.statut_admin}
          </span>
        </div>
        {f.mandataires && (
          <p className="text-sm text-white/40">
            Déposé par{" "}
            <a href={`/admin/mandataires/${f.mandataires.id}`} className="text-[#7469F4] hover:underline">
              {f.mandataires.prenom} {f.mandataires.nom}
            </a>
            {" — "}{f.mandataires.email}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Localisation & Prix */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Localisation & Prix</h2>
          <dl className="space-y-2 text-sm">
            {([
              ["Commune",  f.commune],
              ["Secteur",  f.secteur],
              ["Prix",     f.prix ? `${f.prix.toLocaleString("fr-FR")} €` : null],
              ["Surface",  f.surface ? `${f.surface.toLocaleString("fr-FR")} m²` : null],
            ] as [string, string | null][]).map(([label, value]) =>
              value ? (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">{label}</dt>
                  <dd className="text-right text-white text-xs">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </div>

        {/* Urbanisme */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Urbanisme</h2>
          <dl className="space-y-2 text-sm">
            {([
              ["Zonage",           f.zonage],
              ["Détail urbanisme", f.urbanisme_detail],
            ] as [string, string | null][]).map(([label, value]) =>
              value ? (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">{label}</dt>
                  <dd className="text-right text-white text-xs">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </div>

        {/* Accès & Réseaux */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Accès & Réseaux</h2>
          <dl className="space-y-2 text-sm">
            {([
              ["Accès grue",     f.acces_grue],
              ["Pente",          f.pente_pct != null ? `${f.pente_pct}%` : null],
              ["Réseaux",        f.reseaux],
              ["Assainissement", f.assainissement],
            ] as [string, string | null][]).map(([label, value]) =>
              value ? (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">{label}</dt>
                  <dd className="text-right text-white text-xs">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </div>

        {/* Compatibilité ARKO */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Compatibilité ARKO</h2>
          <dl className="space-y-2 text-sm">
            {([
              ["Compatibilité", f.compatibilite_arko ? COMPAT_LABELS[f.compatibilite_arko] ?? f.compatibilite_arko : null],
              ["Modèle",        f.modele_arko ? MODELE_LABELS[f.modele_arko] ?? f.modele_arko : null],
              ["Statut fiche",  f.statut],
            ] as [string, string | null][]).map(([label, value]) =>
              value ? (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-white/40">{label}</dt>
                  <dd className="text-right text-white text-xs">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </div>

        {/* Point de contact */}
        {(f.contact_nom || f.contact_telephone) && (
          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Point de contact
            </h2>
            <dl className="space-y-2 text-sm">
              {([
                ["Nom",     [f.contact_prenom, f.contact_nom].filter(Boolean).join(" ") || null],
                ["Téléphone", f.contact_telephone],
                ["Rôle",    f.contact_role ? (CONTACT_ROLE_LABELS[f.contact_role] ?? f.contact_role) : null],
                ["Agence / structure", f.contact_role_detail],
              ] as [string, string | null][]).map(([label, value]) =>
                value ? (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="shrink-0 text-white/40">{label}</dt>
                    <dd className="text-right text-white text-xs">{value}</dd>
                  </div>
                ) : null,
              )}
            </dl>
          </div>
        )}

        {/* Notes & Réserves */}
        {(f.notes || (f.reserves ?? []).length > 0) && (
          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6 lg:col-span-2">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Notes & Réserves</h2>
            {f.notes && <p className="mb-3 text-sm text-white/70">{f.notes}</p>}
            {(f.reserves ?? []).length > 0 && (
              <ul className="space-y-1">
                {f.reserves.map((r, i) => (
                  <li key={i} className="text-sm text-amber-300 before:mr-2 before:content-['⚠']">{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Photos */}
        {(f.photos ?? []).length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#252521] p-6 lg:col-span-2">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Photos ({f.photos.length})
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {f.photos.map((photo) => (
                <div key={photo.url} className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#1a1a18]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.nom}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Décision admin */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6 lg:col-span-2">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">Décision admin</h2>
          <p className="mb-4 text-xs text-white/20">
            Statut actuel :{" "}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUT_ADMIN_COLORS[f.statut_admin] ?? ""}`}>
              {STATUT_ADMIN_LABELS[f.statut_admin] ?? f.statut_admin}
            </span>
            {f.publie_at && (
              <span className="ml-2 text-white/30">
                Publié le {new Date(f.publie_at).toLocaleDateString("fr-FR")}
              </span>
            )}
          </p>
          <TerrainAdminActions
            ficheId={f.id}
            currentStatutAdmin={f.statut_admin}
            currentTitre={f.titre}
            currentDescriptionPublique={f.description_publique}
            currentAdminCommentaire={f.admin_commentaire}
            currentAfficherStatutMandataire={f.afficher_statut_mandataire ?? false}
          />
        </div>
      </div>
    </div>
  );
}
