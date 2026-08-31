"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadGooglePlacesScript } from "@/shared/lib/google-places";
import {
  CIBLES_COMMERCIALES,
  CONSEILLERS,
  ISSUES_APPEL,
  SOURCINGS,
  cibleCommerciale,
  dateHeureFr,
  etatSuivi,
  issueAppel,
  sourcing,
} from "@/lib/crm";
import { RecapClientApercu } from "@/components/admin/RecapClientApercu";
import { AdresseAutocomplete, type ValeursAdresse } from "@/components/admin/AdresseAutocomplete";
import {
  emailMalForme,
  normaliserSiteWeb,
  sirenChiffres,
  sirenFormate,
  sirenValide,
} from "@/shared/lib/validation";

interface LeadIdentite {
  id: string;
  lead_number?: number | null;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  tel: string | null;
  produit: string | null;
  source: string | null;
  statut: string | null;
  pack_terrain: string | null;
  budget_terrain: number | null;
  total_estime: number | null;
  notes_ahf: string | null;
  adresse_postale_client: string | null;
  cp_client: string | null;
  ville_client: string | null;
  delai_projet: string | null;
  description_projet: string | null;
  // Suivi CRM — ADR-035 §1 et §2. Édités ici parce que ce sont les champs que
  // l'on corrige pendant l'appel : les séparer du reste imposerait deux
  // formulaires pour une seule conversation.
  responsable?: string | null;
  prochain_rappel_at?: string | null;
  dernier_appel_at?: string | null;
  statut_commercial?: string | null;
  /* Date du dernier récapitulatif envoyé au client. Optionnelle : la colonne
     arrive avec `20260826_recap_envoye_at.sql` et le code tourne avant comme
     après — sans elle, la mention « déjà envoyé le… » ne s'affiche simplement
     pas. */
  recap_envoye_at?: string | null;
  cible_commerciale?: string | null;
  derniere_issue?: string | null;
  multi_configuration?: boolean | null;
  sourcing?: string | null;
  /* Agence apporteuse (ADR-044 §5). Optionnelle : la colonne arrive avec
     `20260831_agents_immo.sql`, et le code tourne avant comme après. */
  agent_id?: string | null;
  raison_sociale?: string | null;
  siren?: string | null;
  site_web?: string | null;
  adresse_societe?: string | null;
  cp_societe?: string | null;
  ville_societe?: string | null;
  created_at?: string;
}

/** `datetime-local` attend une heure locale sans fuseau, pas un ISO UTC. */
function versChampLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function etatInitial(lead: LeadIdentite) {
  return {
    prenom: lead.prenom ?? "",
    nom: lead.nom ?? "",
    email: lead.email ?? "",
    tel: lead.tel ?? "",
    produit: lead.produit ?? "",
    source: lead.source ?? "",
    statut: lead.statut ?? "nouveau",
    pack_terrain: lead.pack_terrain ?? "",
    budget_terrain: lead.budget_terrain?.toString() ?? "",
    total_estime: lead.total_estime?.toString() ?? "",
    notes_ahf: lead.notes_ahf ?? "",
    adresse_postale_client: lead.adresse_postale_client ?? "",
    cp_client: lead.cp_client ?? "",
    ville_client: lead.ville_client ?? "",
    delai_projet: lead.delai_projet ?? "",
    description_projet: lead.description_projet ?? "",
    cible_commerciale: lead.cible_commerciale ?? "",
    derniere_issue: lead.derniere_issue ?? "",
    sourcing: lead.sourcing ?? "",
    agent_id: lead.agent_id ?? "",
    raison_sociale: lead.raison_sociale ?? "",
    siren: lead.siren ?? "",
    site_web: lead.site_web ?? "",
    adresse_societe: lead.adresse_societe ?? "",
    cp_societe: lead.cp_societe ?? "",
    ville_societe: lead.ville_societe ?? "",
    responsable: lead.responsable ?? "",
    prochain_rappel_at: versChampLocal(lead.prochain_rappel_at),
  };
}

const DELAIS_PROJET = [
  "Moins de 6 mois",
  "6 à 12 mois",
  "12 à 24 mois",
  "Plus de 24 mois",
  "Non défini",
];

const STATUTS = [
  "nouveau", "contacte", "devis_envoye", "signe", "annule",
  "qualifié", "affecté", "en_cours", "finalisé", "perdu",
];

export default function LeadEditIdentite({
  lead,
  /** Nom de l'agence apporteuse, résolu par la page (ADR-044 §5). */
  agenceApporteuse = null,
}: {
  lead: LeadIdentite;
  agenceApporteuse?: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  /* Agences apporteuses (ADR-044 §5) — chargées quand le sourcing les réclame,
     pas à l'ouverture de la fiche : huit sourcings sur neuf n'en ont pas besoin. */
  const [agences, setAgences] = useState<{ id: string; agence: string; commune: string | null }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef    = useRef<HTMLDivElement>(null);
  const placeElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  const [form, setForm] = useState(() => etatInitial(lead));

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

  const suivi = etatSuivi({
    statut_commercial: lead.statut_commercial,
    created_at: lead.created_at ?? new Date().toISOString(),
    dernier_appel_at: lead.dernier_appel_at,
    prochain_rappel_at: lead.prochain_rappel_at,
  });

  // Init Google Places autocomplete quand on entre en mode édition
  useEffect(() => {
    if (!editing || !apiKey) return;

    loadGooglePlacesScript(apiKey).then(() => {
      if (!containerRef.current || placeElementRef.current) return;
      const element = new window.google.maps.places.PlaceAutocompleteElement({
        includedRegionCodes:  ["fr"],
        includedPrimaryTypes: ["street_address", "route"],
      });
      containerRef.current.appendChild(element);
      placeElementRef.current = element;

      element.addEventListener("gmp-select", async (event) => {
        const place = event.placePrediction.toPlace();
        await place.fetchFields({ fields: ["formattedAddress", "addressComponents"] });
        let cp = ""; let ville = "";
        for (const comp of place.addressComponents ?? []) {
          if (comp.types.includes("postal_code")) cp = comp.longText ?? "";
          if (comp.types.includes("locality"))    ville = comp.longText ?? "";
        }
        setForm((prev) => ({
          ...prev,
          adresse_postale_client: place.formattedAddress ?? prev.adresse_postale_client,
          cp_client:   cp    || prev.cp_client,
          ville_client: ville || prev.ville_client,
        }));
      });
    });

    return () => {
      placeElementRef.current?.remove();
      placeElementRef.current = null;
    };
  }, [editing, apiKey]);

  const handleCancel = useCallback(() => {
    setForm(etatInitial(lead));
    setError(null);
    setEditing(false);
  }, [lead]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget_terrain: form.budget_terrain ? Number(form.budget_terrain) : null,
          /* ⚠ La chaîne vide n'est pas `null` pour Postgres : le `check` de
             `cible_commerciale` accepte l'absence de valeur, jamais `''`. Sans
             cette conversion, vider le champ ferait échouer tout
             l'enregistrement de la fiche. */
          /* ⚠ Vidé, le champ envoie `""`, pas `null`. Depuis que la colonne est
             nullable (2026-08-27), une chaîne vide s'enregistrerait telle quelle
             et passerait les tests `lead.email ?` un peu partout : l'écran
             croirait à une adresse, l'envoi échouerait chez Brevo. */
          email: form.email || null,
          /* Mêmes règles qu'à la création : le SIREN perd ses espaces, le site
             gagne son schéma. Deux écritures d'un même numéro ne se
             rapprocheraient pas d'un fichier de prospection, et une URL sans
             schéma devient un lien relatif au back-office. */
          raison_sociale: form.raison_sociale || null,
          siren: sirenChiffres(form.siren) || null,
          site_web: normaliserSiteWeb(form.site_web),
          adresse_societe: form.adresse_societe || null,
          cp_societe: form.cp_societe || null,
          ville_societe: form.ville_societe || null,
          cible_commerciale: form.cible_commerciale || null,
          derniere_issue: form.derniere_issue || null,
          sourcing: form.sourcing || null,
          /* Rattaché seulement si le sourcing le dit : un `agent_id` laissé
             derrière un changement d'avis attribuerait une commission à qui
             n'a rien apporté. */
          agent_id: form.sourcing === "partenaire" ? form.agent_id || null : null,
          total_estime: form.total_estime ? Number(form.total_estime) : null,
          responsable: form.responsable || null,
          // Horodate la prise en charge, et seulement quand elle change : sinon
          // chaque enregistrement rajeunirait une affectation ancienne.
          ...(form.responsable !== (lead.responsable ?? "")
            ? { responsable_at: form.responsable ? new Date().toISOString() : null }
            : {}),
          prochain_rappel_at: form.prochain_rappel_at
            ? new Date(form.prochain_rappel_at).toISOString()
            : null,
        }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur serveur");
      }
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4]";
  const labelCls = "block text-xs text-white/40 mb-1";

  if (!editing) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Identité &amp; projet
            </h2>
            {lead.lead_number && (
              <span className="font-mono text-[10px] text-[#7469F4]/70">#{lead.lead_number}</span>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-3 py-1 text-xs text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            Modifier
          </button>
        </div>

        <dl className="space-y-2 text-sm">
          {([
            /* La cible n'est saisissable qu'à la création : elle décrit l'appel
               qui a eu lieu, pas l'état du dossier. La relire ici évite qu'une
               donnée obligatoire à la saisie devienne invisible ensuite. */
            ["Raison sociale", lead.raison_sociale],
            ["SIREN", lead.siren ? sirenFormate(lead.siren) : null],
            ["Site web", lead.site_web],
            ["Adresse société", [lead.adresse_societe, lead.cp_societe, lead.ville_societe].filter(Boolean).join(" · ") || null],
            ["Cible commerciale", cibleCommerciale(lead.cible_commerciale)?.label ?? null],
            ["Sourcing", sourcing(lead.sourcing)?.label ?? null],
            /* Résolu par la page, pas stocké sur le lead : le nom d'une agence
               change, son identifiant non. Même règle que les libellés de
               configuration (ADR-035 §4) — stocker un libellé, c'est le figer. */
            ["Agence apporteuse", agenceApporteuse],
            /* Affiché seulement quand c'est vrai : « non » n'apprend rien, et la
               liste ne rend que les valeurs non nulles. */
            ["Configuration", lead.multi_configuration ? "Multi-Configuration — à arbitrer" : null],
            ["Dernier appel — issue", issueAppel(lead.derniere_issue)?.label ?? null],
            ["Modèle", lead.produit],
            ["Pack", lead.pack_terrain],
            ["Budget terrain", lead.budget_terrain ? `${Number(lead.budget_terrain).toLocaleString("fr-FR")} €` : null],
            ["Total estimé", lead.total_estime ? `${Number(lead.total_estime).toLocaleString("fr-FR")} €` : null],
            ["Source", lead.source],
            ["Statut", lead.statut],
            ["Délai projet", lead.delai_projet],
            ["Description", lead.description_projet],
          ] as [string, string | null][]).map(([label, value]) =>
            value ? (
              <div key={label} className="flex justify-between">
                <dt className="text-white/40">{label}</dt>
                <dd className="text-white">{value}</dd>
              </div>
            ) : null,
          )}
        </dl>

        {/* Suivi commercial — ADR-035 §1 et §2 */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm">
          <div>
            <p className="text-[11px] text-white/30">Conseiller</p>
            <p className="mt-0.5 text-white">
              {lead.responsable ?? <span className="text-white/20">non attribué</span>}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/30">Dernier appel</p>
            <p className={`mt-0.5 ${suivi.silencieux ? "text-orange-400" : "text-white"}`}>
              {suivi.jamaisAppele ? "jamais" : dateHeureFr(lead.dernier_appel_at)}
              <span className="ml-1 text-[11px] text-white/30">
                {suivi.clos ? "" : `· ${suivi.joursSansContact} j`}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/30">Prochain rappel</p>
            <p className={`mt-0.5 ${suivi.rappelDepasse ? "text-red-400" : "text-white"}`}>
              {lead.prochain_rappel_at ? dateHeureFr(lead.prochain_rappel_at) : <span className="text-white/20">—</span>}
              {suivi.rappelDepasse && (
                <span className="ml-1 text-[11px]">dépassé de {suivi.joursRetardRappel} j</span>
              )}
            </p>
          </div>
        </div>

        {(lead.adresse_postale_client || lead.cp_client || lead.ville_client) && (
          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm">
            <p className="text-xs text-white/30 mb-1">Adresse client</p>
            {lead.adresse_postale_client && <p className="text-white">{lead.adresse_postale_client}</p>}
            {(lead.cp_client || lead.ville_client) && (
              <p className="text-white/60">{[lead.cp_client, lead.ville_client].filter(Boolean).join(" ")}</p>
            )}
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs text-white/40 mb-1">Notes AHF</p>
          <p className="text-sm text-white/60 whitespace-pre-wrap">
            {lead.notes_ahf || <span className="italic text-white/20">Aucune note</span>}
          </p>
        </div>

        {/* ⚠ Ce bouton envoyait autrefois le récapitulatif d'un seul clic, sans
            que personne ait vu ce qui partait. Il passe par la relecture :
            ce qui part porte un prix, une distance et un nom. */}
        <div className="mt-4">
          <RecapClientApercu
            leadId={lead.id}
            email={lead.email}
            dejaEnvoyeLe={lead.recap_envoye_at ?? null}
            /* Les trois champs qui décident du modèle d'email et de son objet :
               la cible sectorise la présentation, la Multi-Configuration dit
               qu'il n'y a rien à chiffrer, la raison sociale ouvre l'objet. */
            multiConfiguration={lead.multi_configuration}
            cibleCommerciale={lead.cible_commerciale}
            raisonSociale={lead.raison_sociale}
            onEnvoye={() => router.refresh()}
          />
        </div>
      </>
    );
  }

  // ── Mode édition ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Identité &amp; projet
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="rounded-lg px-3 py-1 text-xs text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#7469F4] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Prénom</label>
            <input className={inputCls} value={form.prenom} onChange={set("prenom")} />
          </div>
          <div>
            <label className={labelCls}>Nom</label>
            <input className={inputCls} value={form.nom} onChange={set("nom")} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input className={inputCls} type="email" value={form.email} onChange={set("email")} />
          {/* Facultatif depuis le 2026-08-27, mais s'il est rempli il doit
              pouvoir fonctionner : une adresse mal formée ne se découvre
              autrement qu'au retour Brevo. */}
          {emailMalForme(form.email) && (
            <p className="mt-1 text-[11px] text-[#E2555A]">
              Cette adresse ne peut pas fonctionner — vérifiez l&apos;arobase et le domaine.
            </p>
          )}
        </div>

        {/* Société — la personne morale, distincte du contact ci-dessus. */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Raison sociale</label>
            <input className={inputCls} value={form.raison_sociale} onChange={set("raison_sociale")} />
          </div>
          <div>
            <label className={labelCls}>SIREN</label>
            <input className={inputCls} value={form.siren} onChange={set("siren")} inputMode="numeric" />
            {sirenChiffres(form.siren).length === 9 && !sirenValide(form.siren) && (
              <p className="mt-1 text-[11px] text-[#E2A03F]/80">
                Clé de contrôle inhabituelle — certains organismes publics font exception.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls}>Site web</label>
          <input className={inputCls} value={form.site_web} onChange={set("site_web")} placeholder="camping-des-pins.fr" />
        </div>

        <AdresseAutocomplete
          id="fiche-societe"
          libelle="Adresse de la société"
          valeurs={{
            adresse: form.adresse_societe,
            cp: form.cp_societe,
            ville: form.ville_societe,
          }}
          onChange={(v: ValeursAdresse) =>
            setForm((prev) => ({
              ...prev,
              adresse_societe: v.adresse,
              cp_societe: v.cp,
              ville_societe: v.ville,
            }))
          }
        />

        <div>
          <label className={labelCls}>Téléphone</label>
          <input className={inputCls} type="tel" value={form.tel} onChange={set("tel")} />
        </div>

        {/* Adresse postale client (Google Places) */}
        <div className="pt-1 border-t border-white/5">
          <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Adresse postale client</p>
          <div>
            <label className={labelCls}>Adresse (autocomplete)</label>
            <div ref={containerRef} className="gmap-autocomplete" />
            {form.adresse_postale_client && (
              <p className="mt-1 text-[11px] text-[#7469F4]/80">✓ {form.adresse_postale_client}</p>
            )}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Code postal</label>
              <input className={inputCls} value={form.cp_client} onChange={set("cp_client")} />
            </div>
            <div>
              <label className={labelCls}>Ville</label>
              <input className={inputCls} value={form.ville_client} onChange={set("ville_client")} />
            </div>
          </div>
        </div>

        {/* Suivi commercial — ADR-035. Ce sont les champs que l'on corrige
            pendant l'appel : ils vivent dans le même formulaire que le reste. */}
        <div className="pt-1 border-t border-white/5">
          <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Suivi commercial</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Conseiller</label>
              <select className={inputCls} value={form.responsable} onChange={set("responsable")}>
                <option value="">Non attribué</option>
                {[...new Set([...CONSEILLERS, form.responsable].filter(Boolean))].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Prochain rappel</label>
              <input
                className={inputCls}
                type="datetime-local"
                value={form.prochain_rappel_at}
                onChange={set("prochain_rappel_at")}
              />
            </div>
          </div>
          <p className="mt-1 text-[11px] text-white/25">
            Vider le rappel efface l&apos;alerte. Le dernier appel se met à jour depuis le journal.
          </p>
        </div>

        {/* Projet */}
        <div className="pt-1 border-t border-white/5">
          <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Projet</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Modèle</label>
              <select className={inputCls} value={form.produit} onChange={set("produit")}>
                <option value="">—</option>
                <option value="Arko One">Arko One</option>
                <option value="Arko Max">Arko Max</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <select className={inputCls} value={form.statut} onChange={set("statut")}>
                {STATUTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2">
            <label className={labelCls}>Source</label>
            <input className={inputCls} value={form.source} onChange={set("source")} />
          </div>

          <div className="mt-2">
            <label className={labelCls}>Pack terrain</label>
            <input className={inputCls} value={form.pack_terrain} onChange={set("pack_terrain")} />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Budget terrain (€)</label>
              <input className={inputCls} type="number" value={form.budget_terrain} onChange={set("budget_terrain")} />
            </div>
            <div>
              <label className={labelCls}>Total estimé (€)</label>
              <input className={inputCls} type="number" value={form.total_estime} onChange={set("total_estime")} />
            </div>
          </div>
        </div>

        {/* Vue mandataire (anonymisée) */}
        <div className="pt-1 border-t border-white/5">
          <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Vue mandataire (anonymisée)</p>
          <div className="mb-2">
            <label className={labelCls}>Description du projet (vue mandataire)</label>
            <input className={inputCls} value={form.description_projet}
              onChange={set("description_projet")} placeholder="Ex: Studio indépendant dans jardin" />
          </div>
          <div>
            <label className={labelCls}>Délai envisagé</label>
            <select className={inputCls} value={form.delai_projet} onChange={set("delai_projet")}>
              <option value="">—</option>
              {DELAIS_PROJET.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* ⚠ Corrigeable, contrairement à ce que laissait croire la première
            version : une cible se choisit au premier appel, et c'est justement
            le moment où l'on se trompe — le « gérant de camping » annoncé par
            le standard tient en fait un domaine. La liste déroulante suffit
            ici : les radios détaillées avec codes NAF servent à choisir avant
            l'appel, corriger après ne demande que de retrouver le bon libellé.

            « — Non renseignée » est proposé pour les leads nés sur le site
            public, qui n'en ont pas : ne pas l'offrir obligerait à inventer une
            cible pour pouvoir enregistrer la moindre autre correction. */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Cible commerciale</label>
            <select className={inputCls} value={form.cible_commerciale} onChange={set("cible_commerciale")}>
              <option value="">— Non renseignée</option>
              {CIBLES_COMMERCIALES.map((c) => (
                <option key={c.id} value={c.id}>{c.numero}. {c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Sourcing / Origine</label>
            <select
              className={inputCls}
              value={form.sourcing}
              onChange={(e) => {
                const choix = e.target.value;
                setForm((f) => ({ ...f, sourcing: choix }));
                if (choix === "partenaire" && agences.length === 0) {
                  fetch("/api/admin/agents")
                    .then((r) => (r.ok ? r.json() : { agents: [] }))
                    .then((b) => setAgences(b.agents ?? []))
                    .catch(() => {
                      /* Une liste indisponible ne bloque pas l'enregistrement :
                         le champ reste vide, le reste de la fiche s'écrit. */
                    });
                }
              }}
            >
              <option value="">— Non renseignée</option>
              {SOURCINGS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* ⚠ N'apparaît que sur « Partenaire ». Ce rattachement est l'assiette
              d'une future commission d'apporteur (ADR-044 §5) : reconstituer
              après coup qui a présenté qui serait impossible. */}
          {form.sourcing === "partenaire" && (
            <div>
              <label className={labelCls}>Agence apporteuse</label>
              <select className={inputCls} value={form.agent_id} onChange={set("agent_id")}>
                <option value="">
                  {agences.length ? "— À rattacher plus tard" : "Chargement…"}
                </option>
                {agences.map((a) => (
                  <option key={a.id} value={a.id}>
                    {[a.agence, a.commune].filter(Boolean).join(" — ")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ⚠ Rattrapage, pas source. Le trigger repose cette valeur depuis
              `lead_appels` au prochain appel journalisé : corriger ici règle
              l'affichage du jour, journaliser l'appel règle l'historique. */}
          <div>
            <label className={labelCls}>Dernier appel — issue</label>
            <select className={inputCls} value={form.derniere_issue} onChange={set("derniere_issue")}>
              <option value="">— Jamais appelé</option>
              {ISSUES_APPEL.map((i) => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes AHF</label>
          <textarea
            className={inputCls}
            rows={4}
            value={form.notes_ahf}
            onChange={set("notes_ahf")}
            placeholder="Notes internes…"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </>
  );
}
