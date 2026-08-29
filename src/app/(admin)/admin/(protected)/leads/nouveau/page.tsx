"use client";

/**
 * Création d'un lead — refaite sur les grilles du configurateur v2 (ADR-035 §6).
 *
 * L'écran suit l'appel : on note qui est au bout du fil, ce qu'il veut, où se
 * trouve son terrain, et quand le rappeler. Les grilles viennent toutes de
 * `loadConfig()` (ADR-030) — aucun prix, aucun palier, aucune option n'est
 * écrit ici.
 *
 * Le mode « Pack terrain » relève du domaine mandataire suspendu (ADR-028) : il
 * n'apparaît que si le drapeau est levé.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { FEATURES } from "@/lib/features";
import {
  CIBLES_COMMERCIALES,
  CONSEILLERS,
  ISSUES_APPEL,
  SOURCINGS,
  STATUTS_COMMERCIAUX,
  eur,
  type CibleCommercialeId,
  type IssueAppel,
  type SourcingId,
} from "@/lib/crm";
import { RecapClientApercu } from "@/components/admin/RecapClientApercu";
import { RechercheIdentite } from "@/components/admin/RechercheIdentite";
import { AdresseAutocomplete } from "@/components/admin/AdresseAutocomplete";
import {
  emailMalForme,
  normaliserSiteWeb,
  sirenChiffres,
  sirenValide,
  siteWebPlausible,
} from "@/shared/lib/validation";
import { TRANSPORT } from "@/lib/site";
import {
  distanceAtelierKm,
  loadConfig,
  optionsPourModele,
  paliersPourModele,
  prixOption,
  transportEur,
  transportPerKm,
  type ModeleId,
} from "@/lib/configurateur/config";
import type { ParcelleData } from "@/shared/types/plu";

type TerrainMode = "none" | "own" | "pack";

const PACK_LABELS: Record<string, string> = {
  essentiel: "Pack Essentiel · 4 900 €",
  etendu: "Pack Étendu · 7 300 €",
  departement: "Pack Département · 11 200 €",
};

export default function NouveauLeadPage() {
  const router = useRouter();
  const cfg = useMemo(() => loadConfig(), []);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* Le lead créé n'envoie plus le conseiller ailleurs tout de suite : l'écran
     bascule sur la relecture du récapitulatif. Rediriger d'abord aurait fait
     perdre le fil de l'appel — le conseiller vient de raccrocher, c'est
     maintenant qu'il sait si ce qui part est juste. */
  const [leadCree, setLeadCree] = useState<string | null>(null);

  /* ⚠ **Étapes librement navigables**, pas un tunnel. Richard a retenu le
     parcours par étapes ; le risque signalé — un prospect qui parle dans le
     désordre — se neutralise en laissant cliquer n'importe quelle étape à tout
     moment. La barre guide, elle n'enferme pas. Et « Créer le lead » reste
     accessible de partout dès que le minimum est saisi : on ne force personne à
     traverser cinq écrans pour enregistrer un nom et un numéro. */
  const [etape, setEtape] = useState(0);

  /* Origine commerciale — d'où vient ce prospect. À ne pas confondre avec
     `leads.source`, canal technique de création. */
  const [sourcingLead, setSourcingLead] = useState<SourcingId | "">("");

  /* Premier appel : la fiche naît d'un échange qui vient d'avoir lieu. */
  const [appelIssue, setAppelIssue] = useState<IssueAppel | "">("");
  const [appelNote, setAppelNote] = useState("");

  /* Cible commerciale — obligatoire. Voir le bloc de saisie plus bas pour le
     motif : elle dit avec quelle trame d'appel le contact a été mené. */
  const [cible, setCible] = useState<CibleCommercialeId | "">("");

  // Identité
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");

  /* Société — tous facultatifs. Quatre des cinq cibles sont des personnes
     morales, mais la cinquième (investisseurs particuliers) n'a ni raison
     sociale ni SIREN, et un premier appel se termine rarement avec le SIREN
     sous la main. */
  const [raisonSociale, setRaisonSociale] = useState("");
  const [siren, setSiren] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [adresseSociete, setAdresseSociete] = useState({ adresse: "", cp: "", ville: "" });

  // Suivi
  const [responsable, setResponsable] = useState("");
  const [statutCommercial, setStatutCommercial] = useState("nouveau");
  const [prochainRappel, setProchainRappel] = useState("");

  // Configuration v2
  const [usage, setUsage] = useState("");
  /* ⚠ Plus de champ de saisie (décision de Richard, 2026-08-29) : il ne servait
     à rien — le total ne multipliait pas par la quantité — et un projet à
     plusieurs unités relève désormais de la Multi-Configuration, qui refuse
     justement de chiffrer. La valeur reste envoyée à 1 : `cfg_quantite` existe
     en base et porte l'historique des leads antérieurs. */
  const quantite = "1";
  const [modele, setModele] = useState<ModeleId>("one");
  /* Le prospect hésite entre plusieurs modèles : la qualification n'a pas
     tranché. Rien n'est chiffrable, et le récapitulatif part en présentation. */
  const [multiConfig, setMultiConfig] = useState(false);
  const [ambiance, setAmbiance] = useState(cfg.ambiances[0].id);
  const [terrasse, setTerrasse] = useState("sans");
  const [options, setOptions] = useState<string[]>([]);
  const [transport, setTransport] = useState("");
  const [slot, setSlot] = useState("");

  // Terrain
  const [terrainMode, setTerrainMode] = useState<TerrainMode>("none");
  const [packTerrain, setPackTerrain] = useState("essentiel");
  const [adresseRecherche, setAdresseRecherche] = useState("");
  const [commune, setCommune] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [departement, setDepartement] = useState("");
  const [parcelle, setParcelle] = useState("");
  const [pluData, setPluData] = useState<ParcelleData | null>(null);
  const [pluLoading, setPluLoading] = useState(false);
  const [pluError, setPluError] = useState<string | null>(null);

  // Notes
  const [notes, setNotes] = useState("");

  /* Distance atelier → terrain, dès que le PLU a rendu des coordonnées.

     Le conseiller ne calcule plus le transport de tête pendant l'appel : la
     seule chose qu'il ait à faire est de dicter l'adresse. Tant qu'aucune
     parcelle n'est identifiée, la distance vaut `null` — et l'écran le dit,
     plutôt que d'afficher un zéro qui passerait pour une livraison offerte. */
  const distanceKm = useMemo(
    () => distanceAtelierKm(pluData?.lat ?? null, pluData?.lon ?? null),
    [pluData],
  );

  /* Les prix suivent la grille, jamais la saisie. */
  const calcul = useMemo(() => {
    const m = cfg.modeles.find((x) => x.id === modele) ?? cfg.modeles[0];
    const paliers = paliersPourModele(cfg, m.id);
    const dispo = optionsPourModele(cfg, m.id);
    const base = m.prixBaseTtc;
    const prixTerrasse = paliers.find((p) => p.id === terrasse)?.prixTtc ?? 0;
    const prixOptions = dispo
      .filter((o) => options.includes(o.id))
      .reduce((s, o) => s + prixOption(o, m.id), 0);

    /* Le transport calculé sert de valeur par défaut ; la saisie du conseiller
       ne fait que le **surcharger**. Pré-remplir le champ aurait été plus
       simple à écrire et plus faux à l'usage : au moindre changement de modèle
       le poids change, donc le prix aussi, et une correction saisie deux
       minutes plus tôt serait écrasée sans que personne le voie. Ici le calcul
       reste vivant, et une valeur tapée reste une décision. */
    const transportAuto = transportEur(distanceKm, m);
    const transportEffectif = transport !== "" ? Number(transport) : (transportAuto ?? 0);

    return {
      m, paliers, dispo, base, prixTerrasse, prixOptions,
      transportAuto,
      transport: transportEffectif,
      total: base + prixTerrasse + prixOptions + transportEffectif,
    };
  }, [cfg, modele, terrasse, options, transport, distanceKm]);

  const usageDef = cfg.usages.find((u) => u.id === usage);
  const brancheFermee = usageDef ? !usageDef.eligible : false;

  function changerModele(m: ModeleId) {
    const dispo = optionsPourModele(cfg, m).map((o) => o.id);
    setModele(m);
    setOptions((prev) => prev.filter((id) => dispo.includes(id)));
    if (!paliersPourModele(cfg, m).some((p) => p.id === terrasse)) setTerrasse("sans");
  }

  function toggleOption(id: string) {
    setOptions((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));
  }

  async function searchPlu() {
    if (!adresseRecherche.trim()) return;
    setPluLoading(true);
    setPluError(null);
    setPluData(null);
    try {
      const res = await fetch("/api/admin/plu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: adresseRecherche }),
      });
      const data = (await res.json()) as ParcelleData & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur PLU");
      setPluData(data);
      if (data.address_label && !commune) {
        // Extraire commune / code postal du libellé BAN
        const parts = data.address_label.split(",").map((s) => s.trim());
        const last = parts[parts.length - 1] ?? "";
        const cpMatch = last.match(/(\d{5})\s+(.+)/);
        if (cpMatch) {
          setCodePostal(cpMatch[1]);
          setCommune(cpMatch[2]);
          setDepartement(cpMatch[1].slice(0, 2));
        }
      }
    } catch (e) {
      setPluError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPluLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    /* ⚠ L'email n'est plus exigé. Au téléphone, tout le monde ne donne pas son
       adresse ; l'imposer revenait à en faire inventer une, ou à perdre l'appel. */
    if (!prenom || !nom) return;

    /* ⚠ Une adresse mal formée est refusée, une adresse absente ne l'est pas.
       Laisser passer « jean.dupont@gmail » revient à croire qu'on pourra
       recontacter ce prospect, et à ne s'en apercevoir qu'au retour Brevo. */
    if (emailMalForme(email)) {
      setSubmitError("L'adresse email est mal formée. Corrigez-la, ou laissez le champ vide.");
      return;
    }

    /* Garde-fou en plus du `required` du champ : la soumission peut venir d'un
       navigateur qui ne valide pas, et surtout le message natif (« Veuillez
       sélectionner un élément ») n'apprend rien à qui ne sait pas de quoi il
       s'agit. */
    if (!cible) {
      setSubmitError("Sélectionnez la cible commerciale : elle dit avec quelle trame l'appel a été mené.");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    const q = Math.max(1, Number(quantite) || 1);

    // Instantané fidèle + colonnes plates : voir ADR-035 §4.
    const config_v2 = multiConfig ? {
      version: cfg.version,
      multi_configuration: true,
      usage: usage || null,
      quantite: q,
      saisi_par: "admin",
    } : {
      version: cfg.version,
      usage: usage || null,
      quantite: q,
      modele,
      ambiance,
      terrasse,
      options,
      /* Même clé que `/api/configurateur/reservation` : la distance vit dans
         l'instantané JSON, pas en colonne. Elle fige ce qui a servi au calcul
         le jour de l'appel — recalculer plus tard donnerait un autre chiffre
         le jour où les coordonnées de l'atelier seront affinées. */
      distance_km: distanceKm,
      prix: {
        base: calcul.base,
        terrasse: calcul.prixTerrasse,
        options: calcul.prixOptions,
        transport: calcul.transport,
        transport_auto: calcul.transportAuto,
        transport_surcharge: transport !== "" ? Number(transport) : null,
        total: calcul.total,
      },
      slot: slot ? Number(slot) : null,
      saisi_par: "admin",
    };

    /* ⚠ En Multi-Configuration, les colonnes de modèle et de prix restent
       **nulles** plutôt que de porter une valeur par défaut. Un décompte par
       modèle, une moyenne ou un chiffre d'affaires prévisionnel ne doivent pas
       ramasser une configuration que personne n'a arrêtée. */
    const body = {
      prenom, nom, email, tel: tel || null,

      /* Société. `sirenChiffres` retire les espaces de la dictée : deux
         écritures d'un même numéro ne se rapprocheraient pas d'un fichier de
         prospection. `normaliserSiteWeb` préfixe `https://` — sans schéma, le
         lien deviendrait relatif au back-office. */
      raison_sociale: raisonSociale.trim() || null,
      siren: sirenChiffres(siren) || null,
      site_web: normaliserSiteWeb(siteWeb),
      adresse_societe: adresseSociete.adresse.trim() || null,
      cp_societe: adresseSociete.cp.trim() || null,
      ville_societe: adresseSociete.ville.trim() || null,
      produit: multiConfig ? "Multi-Configuration — à arbitrer" : calcul.m.nom,
      multi_configuration: multiConfig,

      // Suivi CRM
      cible_commerciale: cible,
      sourcing: sourcingLead || null,

      /* Le premier appel devient une entrée du journal, pas une note perdue :
         le trigger remonte alors l'issue et la date sur le lead, et le compteur
         de silence part du contact plutôt que de la création. La date n'est pas
         demandée — c'est maintenant. */
      premier_appel: (appelIssue || appelNote.trim())
        ? {
            issue: appelIssue || null,
            note: appelNote.trim() || null,
            prochain_rappel_at: prochainRappel ? new Date(prochainRappel).toISOString() : null,
          }
        : null,
      responsable: responsable || null,
      statut_commercial: statutCommercial,
      prochain_rappel_at: prochainRappel ? new Date(prochainRappel).toISOString() : null,

      // Configuration v2
      config_v2,
      cfg_version: cfg.version,
      cfg_usage: usage || null,
      cfg_quantite: q,
      cfg_modele: multiConfig ? null : modele,
      cfg_ambiance: multiConfig ? null : ambiance,
      cfg_terrasse: multiConfig ? null : terrasse,
      cfg_options: multiConfig ? [] : options,
      cfg_prix_base: multiConfig ? null : calcul.base,
      cfg_prix_terrasse: multiConfig ? null : calcul.prixTerrasse,
      cfg_prix_options: multiConfig ? null : calcul.prixOptions,
      cfg_transport: multiConfig ? null : calcul.transport,
      cfg_total: multiConfig ? null : calcul.total,
      slot: slot ? Number(slot) : null,

      // Terrain
      pack_terrain: terrainMode === "pack" ? packTerrain : null,
      terrain_mode: terrainMode === "none" ? null : terrainMode === "own" ? "have" : "pack",
      adresse_recherche: terrainMode !== "none" ? adresseRecherche || null : null,
      commune: commune || null,
      code_postal: codePostal || null,
      departement: departement || null,
      parcelle_idu: parcelle || null,

      // PLU
      plu_consent: terrainMode === "own" && !!pluData?.found,
      plu_adresse: pluData?.address_label ?? null,
      plu_zone: pluData?.zone_urba ?? null,
      plu_libelong: pluData?.libelong ?? null,
      plu_typezone: pluData?.typezone ?? null,
      plu_typedoc: pluData?.typedoc ?? null,
      plu_etat_doc: pluData?.etat_doc ?? null,
      plu_datappro: pluData?.datappro ?? null,
      plu_prescriptions: pluData?.prescriptions ?? [],
      plu_servitudes: pluData?.servitudes ?? [],
      plu_lon: pluData?.lon ?? null,
      plu_lat: pluData?.lat ?? null,

      notes_ahf: notes || null,
    };

    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      if (!data.id) throw new Error("Lead créé sans identifiant renvoyé");
      setLeadCree(data.id);
      setLoading(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  const modesTerrain: { value: TerrainMode; label: string; desc: string }[] = [
    { value: "none", label: "Pas encore de terrain", desc: "Le client n'a pas identifié de parcelle" },
    { value: "own", label: "Terrain identifié — analyse PLU", desc: "Adresse dictée au téléphone : zonage et constructibilité" },
    ...(FEATURES.mandataire
      ? [{ value: "pack" as TerrainMode, label: "Proposition de Pack Terrain", desc: "Pack Affinity : Essentiel / Étendu / Département" }]
      : []),
  ];

  /* Lead enregistré : l'écran passe à la relecture. Le formulaire disparaît —
     le laisser visible aurait invité à « corriger vite fait » un lead déjà en
     base, alors que la fiche est faite pour ça et qu'elle, elle enregistre. */
  if (leadCree) {
    return (
      <div className="max-w-3xl p-8">
        <h1 className="text-xl font-semibold text-white">Lead enregistré</h1>
        <p className="mt-2 text-sm text-white/40">
          {email ? (
            <>
              L&apos;appel est consigné. Relisez le récapitulatif avant de l&apos;envoyer à{" "}
              <span className="text-white/60">{email}</span> — c&apos;est le premier document
              que ce client recevra de nous.
            </>
          ) : (
            <>
              L&apos;appel est consigné. Ce lead n&apos;a pas d&apos;adresse email : aucun
              récapitulatif ne peut partir. Complétez-la depuis sa fiche dès que vous
              l&apos;obtenez, l&apos;envoi restera possible.
            </>
          )}
        </p>

        <div className="mt-6">
          <RecapClientApercu leadId={leadCree} email={email} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/leads/${leadCree}`)}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs text-white/60 transition-colors hover:border-white/25 hover:text-white"
          >
            Ouvrir la fiche du lead
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/leads/nouveau")}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs text-white/40 transition-colors hover:border-white/25 hover:text-white"
          >
            Saisir un autre appel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl p-6 sm:p-8">
      <Link href="/admin/leads" className="text-sm text-white/30 hover:text-white">← Leads</Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold text-white">Pré-qualification lead</h1>

      {/* Barre d'étapes — cliquable de bout en bout. Elle dit où l'on est et ce
          qui reste, sans interdire d'aller ailleurs : au téléphone, le prospect
          donne son terrain avant son nom aussi souvent que l'inverse. */}
      <nav aria-label="Étapes de la saisie" className="mb-5 flex flex-wrap gap-1.5">
        {ETAPES.map((e, i) => {
          const courante = etape === i;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setEtape(i)}
              aria-current={courante ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors",
                courante
                  ? "border-[#7469F4] bg-[#7469F4]/15 text-white"
                  : "border-white/10 bg-white/5 text-white/45 hover:border-white/25 hover:text-white/70",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  courante ? "bg-[#7469F4] text-white" : "bg-white/10 text-white/40",
                )}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{e.titre}</span>
              {e.obligatoire && <span className="text-[#E2A03F]">*</span>}
            </button>
          );
        })}
      </nav>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── 0. Cible commerciale ───────────────────────────────────────
            En tête, avant l'identité : c'est la question qu'on se pose avant
            de composer le numéro, pas après avoir raccroché. Chaque cible a
            sa trame d'appel — accroche, punch lines, objections propres — et
            renseigner la cible, c'est enregistrer avec quelle trame le contact
            a été mené. Un lead sans cible est un appel dont on ignore ce qui
            a été dit. */}
        {etape === 0 && (
        <Section title="Cible commerciale *">
          <div className="grid gap-2">
            {CIBLES_COMMERCIALES.map((c) => {
              const choisie = cible === c.id;
              return (
                <label
                  key={c.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    choisie
                      ? "border-[#7469F4]/60 bg-[#7469F4]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25",
                  )}
                >
                  <input
                    type="radio"
                    name="cible_commerciale"
                    value={c.id}
                    checked={choisie}
                    onChange={() => setCible(c.id)}
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#7469F4]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", c.badge)}>
                        {c.numero}
                      </span>
                      <span className="text-sm text-white/80">{c.label}</span>
                    </span>

                    {/* Les codes NAF ne sont pas décoratifs : ce sont eux qui
                        relient le lead aux fichiers de prospection. Les
                        afficher sous la cible évite d'avoir à les chercher
                        ailleurs pendant l'appel. */}
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      {c.naf.map((n) => (
                        <span key={n.code} className="text-[11px] text-white/30" title={n.libelle}>
                          <span className="font-mono text-white/45">{n.code}</span> {n.libelle}
                        </span>
                      ))}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <p className="mt-2 text-[11px] text-white/25">
            Codes NAF rév. 2 — ceux que portent les entreprises jusqu&apos;au passage à la
            NAF 2025, le 1<sup>er</sup> janvier 2027. Ils orientent, ils ne tranchent pas :
            un camping exploité en société civile peut porter un code immobilier.
          </p>
        </Section>
        )}

        {/* ── 1. Identité ─────────────────────────────────────────────── */}
        {etape === 1 && (
        <Section title="Identité">
          {/* Avant la saisie, pas après : une fiche déjà existante doit se voir
              pendant que ça sonne, quand le conseiller peut encore changer de
              chemin. Découverte au moment d'enregistrer, elle arriverait trop
              tard — le doublon serait déjà écrit. */}
          <div className="mb-4">
            <RechercheIdentite
              onRemplir={({ prenom, nom, email, tel }) => {
                setPrenom(prenom);
                setNom(nom);
                setEmail(email);
                setTel(tel);
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom *" value={prenom} onChange={setPrenom} required />
            <Field label="Nom *" value={nom} onChange={setNom} required />
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Téléphone" value={tel} onChange={setTel} />
          </div>

          {/* Avertir, jamais bloquer. Un nom d'établissement et une note valent
              mieux qu'un appel perdu, et l'adresse se complète au rappel — mais
              une fiche sans aucun moyen de reprise ne sert personne, et ça ne se
              voit qu'au moment où on veut rappeler. */}
          {!email && !tel && (
            <p className="mt-2 text-[11px] leading-relaxed text-[#E2A03F]/80">
              Ni email ni téléphone — ce lead ne pourra pas être recontacté. Vous pouvez
              l&apos;enregistrer tel quel et compléter plus tard depuis sa fiche.
            </p>
          )}
          {!email && tel && (
            <p className="mt-2 text-[11px] leading-relaxed text-white/40">
              Sans adresse email, aucun récapitulatif ne pourra être envoyé à ce prospect.
              Le suivi se fera par téléphone.
            </p>
          )}

          {/* Contrôle à la saisie, pas seulement à l'envoi : corriger une faute
              de frappe pendant l'appel coûte une seconde, s'en apercevoir au
              retour Brevo coûte le prospect. */}
          {emailMalForme(email) && (
            <p className="mt-2 text-[11px] leading-relaxed text-[#E2555A]">
              Cette adresse ne peut pas fonctionner — vérifiez l&apos;arobase et le domaine.
            </p>
          )}
        </Section>
        )}

        {/* ── 1 bis. Société ──────────────────────────────────────────────
            Quatre des cinq cibles sont des personnes morales. La raison sociale
            se retrouvait jusqu'ici dans les notes d'appel, d'où l'on ne peut ni
            trier ni rapprocher des fichiers de prospection.

            Tout est facultatif : la cinquième cible — investisseurs particuliers
            — n'a ni raison sociale ni SIREN, et un premier appel se termine
            rarement avec le SIREN sous la main. */}
        {etape === 1 && (
        <Section title="Société (facultatif)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Raison sociale" value={raisonSociale} onChange={setRaisonSociale} />
            <div>
              <label className="mb-1.5 block text-xs text-white/40">SIREN</label>
              <input
                value={siren}
                onChange={(e) => setSiren(e.target.value)}
                placeholder="812 345 678"
                inputMode="numeric"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
              />
              {/* ⚠ Avertissement, jamais blocage : La Poste porte le 356 000 000,
                  qui ne respecte pas la clé de contrôle, et l'INSEE l'admet.
                  Refuser la saisie ferait perdre les huit autres chiffres pour
                  un seul mal entendu au téléphone. */}
              {sirenChiffres(siren).length > 0 && sirenChiffres(siren).length !== 9 && (
                <p className="mt-1.5 text-[11px] text-[#E2A03F]/80">
                  Un SIREN compte 9 chiffres — {sirenChiffres(siren).length} saisi
                  {sirenChiffres(siren).length > 1 ? "s" : ""}.
                </p>
              )}
              {sirenChiffres(siren).length === 9 && !sirenValide(siren) && (
                <p className="mt-1.5 text-[11px] text-[#E2A03F]/80">
                  Clé de contrôle inhabituelle — vérifiez le numéro. Certains organismes
                  publics font exception, la saisie reste possible.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs text-white/40">Site web</label>
            <input
              value={siteWeb}
              onChange={(e) => setSiteWeb(e.target.value)}
              placeholder="camping-des-pins.fr"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
            />
            {siteWeb.trim() && !siteWebPlausible(siteWeb) && (
              <p className="mt-1.5 text-[11px] text-[#E2A03F]/80">
                Adresse de site inhabituelle — il manque peut-être l&apos;extension (.fr, .com).
              </p>
            )}
          </div>

          <div className="mt-4">
            <AdresseAutocomplete
              id="societe"
              libelle="Adresse de la société"
              valeurs={adresseSociete}
              onChange={setAdresseSociete}
            />
            <p className="mt-1.5 text-[11px] text-white/25">
              C&apos;est cette adresse qui reçoit le studio, et non le domicile du contact —
              renseigné plus haut. Les deux diffèrent souvent.
            </p>
          </div>
        </Section>
        )}

        {/* ── 2. Suivi ────────────────────────────────────────────────── */}
        {etape === 4 && (
        <>
        <Section title="Suivi commercial">
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Conseiller"
              value={responsable}
              onChange={setResponsable}
              options={[{ value: "", label: "Non attribué" }, ...CONSEILLERS.map((c) => ({ value: c, label: c }))]}
            />
            <Select
              label="Statut"
              value={statutCommercial}
              onChange={setStatutCommercial}
              options={STATUTS_COMMERCIAUX.map((s) => ({ value: s.id, label: s.label }))}
            />
            {/* ⚠ Sourcing ≠ `source`. Celui-ci dit **comment le prospect est
                arrivé jusqu'à nous** — fichier de prospection, salon,
                recommandation ; `source` garde le canal technique de création
                (`admin`, `configurateur_v2`). Les confondre reviendrait à ne
                plus pouvoir dire si la prospection téléphonique paie. */}
            <Select
              label="Sourcing / Origine"
              value={sourcingLead}
              onChange={(v) => setSourcingLead(v as SourcingId | "")}
              options={[
                { value: "", label: "Non renseignée" },
                ...SOURCINGS.map((o) => ({
                  value: o.id,
                  label: o.detail ? `${o.label} — ${o.detail}` : o.label,
                })),
              ]}
            />
          </div>
        </Section>

        {/* ── 5 bis. Premier appel ────────────────────────────────────────
            La fiche naît d'un échange qui vient d'avoir lieu. Le consigner ici
            plutôt qu'en note libre a trois effets qu'une note n'a pas : l'issue
            et la date remontent sur le lead par le trigger, le compteur de
            silence part du **contact** et non de la création, et l'échange
            rejoint l'historique que le conseiller suivant lira.

            ⚠ **Deux dates devenaient une.** L'ancienne rubrique demandait un
            « prochain rappel » sans jamais demander quand l'appel avait eu lieu
            — si bien que le journal, lui, restait vide jusqu'à la première
            modification. La date de cet appel-ci n'est pas demandée : c'est
            maintenant. Ne reste que celle du prochain, à sa vraie place — au
            bout du compte rendu, là où on la décide. */}
        <Section title="Premier appel">
          <p className="mb-4 text-[11px] leading-relaxed text-white/35">
            Vous venez de raccrocher. Ce qui est noté ici entre au journal d&apos;appels du lead,
            horodaté à maintenant — pas besoin de saisir la date. Laissez vide si vous créez la
            fiche sans avoir eu personne au téléphone.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Issue de l'appel"
              value={appelIssue}
              onChange={(v) => setAppelIssue(v as IssueAppel | "")}
              options={[
                { value: "", label: "Aucun appel passé" },
                ...ISSUES_APPEL.map((i) => ({ value: i.id, label: i.label })),
              ]}
            />
            <div>
              <label className="mb-1.5 block text-xs text-white/40">
                Prochain rappel
                {(appelIssue === "rappel_demande" || appelIssue === "repondeur") && (
                  <span className="ml-2 text-[#E2A03F]">à planifier</span>
                )}
              </label>
              <input
                type="datetime-local"
                value={prochainRappel}
                onChange={(e) => setProchainRappel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs text-white/40">Compte rendu de l&apos;appel</label>
            <textarea
              value={appelNote}
              onChange={(e) => setAppelNote(e.target.value)}
              rows={4}
              placeholder="Ce qui a été dit, ce qui reste à arbitrer, les options évoquées…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
            />
          </div>

          {/* Un rappel demandé sans date, c'est un rappel qui n'aura pas lieu. */}
          {appelIssue === "rappel_demande" && !prochainRappel && (
            <p className="mt-2 text-[11px] leading-relaxed text-[#E2A03F]/80">
              Le prospect a demandé à être rappelé, mais aucune date n&apos;est fixée — ce lead ne
              remontera dans aucune alerte.
            </p>
          )}
        </Section>
        </>
        )}

        {/* ── 3. Configuration ────────────────────────────────────────── */}
        {etape === 2 && (
        <Section title="Configuration">
          <div className="mb-4">
            <Select
              label="Usage"
              value={usage}
              onChange={setUsage}
              options={[
                { value: "", label: "—" },
                ...cfg.usages.map((u) => ({
                  value: u.id,
                  label: u.libelle + (u.eligible ? "" : " (hors cadre de vente)"),
                })),
              ]}
            />
            {brancheFermee && (
              <p className="mt-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-400/80">
                Cet usage n&apos;est pas ouvert à la vente (ADR-029) : la configuration ci-dessous
                est enregistrée pour mémoire, aucun prix ne doit être communiqué au client.
              </p>
            )}
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs text-white/40">Modèle</p>
            <div className="flex flex-wrap gap-2">
              {cfg.modeles.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setMultiConfig(false); changerModele(m.id); }}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                    !multiConfig && modele === m.id
                      ? "border-[#7469F4] bg-[#7469F4]/15 text-[#7469F4]"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
                  )}
                >
                  {m.nom}
                  <span className="ml-1.5 text-xs opacity-60">{m.surface} m²</span>
                </button>
              ))}

              {/* Troisième choix, à parité avec les deux modèles : au téléphone,
                  « je veux voir les deux » est une réponse aussi fréquente que
                  l'une ou l'autre. La reléguer à une case à cocher plus bas
                  reviendrait à demander au conseiller de trancher d'abord, puis
                  de se dédire.

                  ⚠ Il couvre **deux** situations, pas une seule : le prospect
                  hésite entre plusieurs modèles, **ou** il demande des options
                  et services personnalisés qui sortent de la grille. Les deux
                  ont la même conséquence — rien n'est chiffrable en l'état — et
                  c'est cette conséquence, pas la cause, qui décide de l'email
                  envoyé. */}
              <button
                type="button"
                onClick={() => setMultiConfig(true)}
                className={cn(
                  "flex-1 basis-full rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors md:basis-0",
                  multiConfig
                    ? "border-[#E2A03F] bg-[#E2A03F]/15 text-[#E2A03F]"
                    : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
                )}
              >
                Multi-Configuration
                <span className="mt-0.5 block text-xs font-normal leading-snug opacity-60">
                  Plusieurs modèles, ou options et services personnalisés assujettis à devis
                  préalables complémentaires
                </span>
              </button>
            </div>

            {multiConfig && (
              <div className="mt-3 rounded-xl border border-[#E2A03F]/25 bg-[#E2A03F]/5 px-3 py-2.5">
                <p className="text-xs leading-relaxed text-[#E2A03F]/90">
                  <span className="font-semibold">Aucun prix ne sera calculé ni envoyé.</span> Soit
                  la qualification n&apos;a pas tranché entre les modèles, soit la demande sort de
                  la grille — options ou services personnalisés, <span className="font-semibold">
                  assujettis à devis préalables complémentaires</span>. Dans les deux cas, chiffrer
                  ici reviendrait à communiquer un prix qu&apos;on ne pourrait plus reprendre.
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
                  Le client recevra la présentation Howner accompagnée de la plaquette, et non le
                  récapitulatif chiffré. Notez dans les notes d&apos;appel les modèles évoqués, les
                  options demandées et ce qui reste à arbitrer — c&apos;est de là que partira le
                  devis complémentaire.
                </p>
              </div>
            )}
          </div>

          {/* ⚠ Toute la configuration chiffrée disparaît en Multi-Configuration.
              La griser ou la laisser visible aurait invité à la remplir « pour
              information », et un total affiché finit toujours par être lu à voix
              haute au téléphone. Ce qui n'a pas été arrêté ne doit pas être
              chiffré. Les modèles évoqués se notent dans les notes d'appel. */}
          {!multiConfig && (
          <>
          <div className="mb-4">
            <p className="mb-2 text-xs text-white/40">Ambiance</p>
            <div className="flex flex-wrap gap-2">
              {cfg.ambiances.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAmbiance(a.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors",
                    ambiance === a.id
                      ? "border-[#7469F4] bg-[#7469F4]/15 text-white"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
                  )}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: a.teinte }} />
                  {a.nom}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Terrasse"
              value={terrasse}
              onChange={setTerrasse}
              options={calcul.paliers.map((p) => ({
                value: p.id,
                label: p.prixTtc > 0 ? `${p.nom} — ${eur(p.prixTtc)}` : p.nom,
              }))}
            />
            <Select
              label="Numéro de série"
              value={slot}
              onChange={setSlot}
              options={[
                { value: "", label: "Aucun" },
                ...Array.from({ length: cfg.serie.unites }, (_, i) => ({
                  value: String(i + 1),
                  label: `n° ${i + 1}`,
                })),
              ]}
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs text-white/40">
              Options <span className="text-white/25">— filtrées selon la maison</span>
            </p>
            <div className="space-y-1.5">
              {calcul.dispo.map((o) => (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={options.includes(o.id)}
                    onChange={() => toggleOption(o.id)}
                    className="accent-[#7469F4]"
                  />
                  <span className="flex-1 text-sm text-white">
                    {o.nom}
                    {o.detail && <span className="text-white/30"> — {o.detail}</span>}
                    {o.structurelle && (
                      <span className="ml-2 rounded-full bg-[#e07b28]/15 px-1.5 py-0.5 text-[10px] text-[#e07b28]">
                        structurelle
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-white/30">{eur(prixOption(o, modele))}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-white/40">
                Transport (€ TTC)
                {calcul.transportAuto != null && (
                  <span className="ml-2 text-[#7469F4]">calculé automatiquement</span>
                )}
              </label>
              <input
                type="number"
                min={0}
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                placeholder={
                  calcul.transportAuto != null
                    ? `${calcul.transportAuto} — laisser vide pour garder le calcul`
                    : "à estimer une fois le terrain connu"
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
              />

              {/* Le détail du calcul est affiché, pas seulement son résultat :
                  un conseiller qui annonce un prix au téléphone doit pouvoir
                  dire d'où il sort si le client le lui demande. */}
              {distanceKm != null ? (
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
                  <span className="text-white/60">{distanceKm} km</span> depuis l&apos;atelier de
                  Bayonne · grutage {eur(TRANSPORT.grutageEur)} + {distanceKm} km ×{" "}
                  {transportPerKm(calcul.m).toFixed(2)} €/km ({calcul.m.poidsTonnes} t) ={" "}
                  <span className="text-white/60">{eur(calcul.transportAuto ?? 0)}</span>
                  {transport !== "" && (
                    <span className="text-[#E2A03F]"> — surchargé à {eur(Number(transport))}</span>
                  )}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#E2A03F]/80">
                  Terrain non identifié — le transport ne peut pas être calculé maintenant.
                  Analyser le PLU d&apos;une adresse pour l&apos;obtenir, ou le chiffrer plus tard.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-[11px] text-white/30">Total TTC — grille {cfg.version}</p>
              <p className="mt-0.5 text-lg font-semibold text-white">{eur(calcul.total)}</p>
            </div>
          </div>
          </>
          )}
        </Section>
        )}

        {/* ── 4. Terrain ──────────────────────────────────────────────── */}
        {etape === 3 && (
        <Section title="Situation terrain">
          <div className="mb-4 space-y-2">
            {modesTerrain.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  terrainMode === opt.value
                    ? "border-[#7469F4]/50 bg-[#7469F4]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                <input
                  type="radio"
                  name="terrainMode"
                  value={opt.value}
                  checked={terrainMode === opt.value}
                  onChange={() => setTerrainMode(opt.value)}
                  className="mt-0.5 accent-[#7469F4]"
                />
                <div>
                  <p className="text-sm font-medium text-white">{opt.label}</p>
                  <p className="text-xs text-white/40">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {terrainMode === "own" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-white/40">Adresse du terrain</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adresseRecherche}
                    onChange={(e) => { setAdresseRecherche(e.target.value); setPluData(null); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchPlu())}
                    placeholder="ex: 12 chemin des Fougères, 64500 Saint-Jean-de-Luz"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
                  />
                  <button
                    type="button"
                    onClick={searchPlu}
                    disabled={pluLoading || !adresseRecherche.trim()}
                    className="rounded-xl bg-[#7469F4]/20 px-4 py-2.5 text-sm text-[#7469F4] transition-opacity hover:bg-[#7469F4]/30 disabled:opacity-40"
                  >
                    {pluLoading ? "…" : "Analyser PLU"}
                  </button>
                </div>
                {pluError && <p className="mt-1 text-xs text-red-400">{pluError}</p>}
              </div>

              {pluData && (
                <div className={cn(
                  "rounded-xl border p-4 text-sm",
                  pluData.found ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/5",
                )}>
                  {pluData.found ? (
                    <>
                      <p className="mb-2 font-medium text-white">
                        Zone {pluData.typezone} — {pluData.zone_urba}
                      </p>
                      <dl className="space-y-1 text-xs">
                        {pluData.address_label && (
                          <div className="flex justify-between">
                            <dt className="text-white/40">Adresse BAN</dt>
                            <dd className="max-w-xs truncate text-right text-white">{pluData.address_label}</dd>
                          </div>
                        )}
                        {pluData.typedoc && (
                          <div className="flex justify-between">
                            <dt className="text-white/40">Document</dt>
                            <dd className="text-white">{pluData.typedoc} — {pluData.etat_doc}</dd>
                          </div>
                        )}
                        {pluData.libelong && (
                          <div className="flex justify-between">
                            <dt className="text-white/40">Destination</dt>
                            <dd className="max-w-xs text-right text-white">{pluData.libelong}</dd>
                          </div>
                        )}
                        {!!pluData.prescriptions?.length && (
                          <div className="flex justify-between">
                            <dt className="text-white/40">Prescriptions</dt>
                            <dd className="text-white">{pluData.prescriptions.length}</dd>
                          </div>
                        )}
                      </dl>
                    </>
                  ) : (
                    <p className="text-white/40">Aucun document d&apos;urbanisme trouvé pour cette adresse.</p>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Code postal" value={codePostal} onChange={setCodePostal} />
                <Field label="Commune" value={commune} onChange={setCommune} />
                <Field label="Département" value={departement} onChange={setDepartement} />
                <Field label="Parcelle (IDU)" value={parcelle} onChange={setParcelle} />
              </div>
            </div>
          )}

          {terrainMode === "pack" && FEATURES.mandataire && (
            <div className="space-y-4">
              <Select
                label="Pack terrain"
                value={packTerrain}
                onChange={setPackTerrain}
                options={Object.entries(PACK_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              />
              <div>
                <p className="mb-2 text-xs text-white/40">Zone de recherche</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Code postal" value={codePostal} onChange={setCodePostal} />
                  <Field label="Commune" value={commune} onChange={setCommune} />
                  <Field label="Département" value={departement} onChange={setDepartement} />
                </div>
              </div>
            </div>
          )}
        </Section>
        )}

        {/* ── 5. Notes ────────────────────────────────────────────────── */}
        {etape === 4 && (
        <Section title="Notes internes AHF">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Contexte, source, remarques…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
          />
        </Section>
        )}

        {submitError && <p className="text-sm text-red-400">{submitError}</p>}

        {/* Pied de navigation. « Créer le lead » y figure à **toutes** les
            étapes, actif dès que le minimum est saisi : la structure guide, elle
            ne retient pas en otage. Le total reste visible avec lui — c'est le
            chiffre qu'on relit avant d'enregistrer. */}
        <div className="sticky bottom-0 -mx-8 flex flex-wrap items-center gap-3 border-t border-white/10 bg-[#1a1a18]/95 px-8 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setEtape((v) => Math.max(0, v - 1))}
            disabled={etape === 0}
            className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/10 disabled:opacity-30"
          >
            ← Précédent
          </button>

          {etape < ETAPES.length - 1 && (
            <button
              type="button"
              onClick={() => setEtape((v) => Math.min(ETAPES.length - 1, v + 1))}
              className="rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/15"
            >
              Suivant →
            </button>
          )}

          {!multiConfig && (
            <span className="ml-auto text-xs text-white/30">
              Total TTC <span className="ml-1 text-sm font-semibold text-white">{eur(calcul.total)}</span>
            </span>
          )}

          <div className={cn("flex gap-3", multiConfig && "ml-auto")}>
            <Link
              href="/admin/leads"
              className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/10"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading || !prenom || !nom || !cible}
              className="rounded-xl bg-[#7469F4] px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
            >
              {loading ? "Création…" : "Créer le lead"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── Sous-composants ─────────────────────────────────────────────────────── */

/**
 * Les cinq étapes de la saisie, dans l'ordre où un appel se déroule le plus
 * souvent — sans que cet ordre soit imposé (la barre est cliquable).
 *
 * « Notes internes » rejoint « Appel & suivi » : les deux disent la même chose
 * du même moment, et les séparer obligeait à écrire l'échange à deux endroits.
 */
const ETAPES = [
  { id: "cible",   titre: "Cible",           obligatoire: true },
  { id: "contact", titre: "Contact",         obligatoire: true },
  { id: "projet",  titre: "Configuration",   obligatoire: false },
  { id: "terrain", titre: "Terrain",         obligatoire: false },
  { id: "appel",   titre: "Appel & suivi",   obligatoire: false },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
