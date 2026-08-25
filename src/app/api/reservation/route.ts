import { NextRequest, NextResponse } from "next/server";
import { sendBrevoTemplate, addBrevoContact } from "@/shared/lib/email";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { signalerPanne } from "@/shared/lib/panne";
import type { ParcelleData } from "@/shared/types/plu";

/* ⚠ `BREVO_TEMPLATE_RECAP` et `BREVO_TO_AHF` se lisent dans la fonction, pas
   ici : au niveau du module elles arrivaient vides en production et l'email
   partait dans le vide (constat du 2026-08-25, même défaut sur la route v2). */

const PACK_LABELS: Record<string, string> = {
  essentiel: "Pack Essentiel — 4 900 € TTC",
  etendu: "Pack Étendu — 7 300 € TTC",
  departement: "Pack Département — 11 200 € TTC",
};

const TYPEZONE_LABELS: Record<string, string> = {
  U: "Zone Urbaine (U) — constructible",
  AU: "Zone À Urbaniser (AU) — constructible",
  A: "Zone Agricole (A) — non constructible",
  N: "Zone Naturelle (N) — non constructible",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    prenom, nom, email, tel, slot,
    produit, surface, houseTotal, delivery,
    terrainMode, packTerrain,
    bardage, facade, bar, chambre, interieur,
    terrasseM2, optionsLabels, grandTotal,
    pluConsent, pluData, optIn,
  } = body as {
    prenom: string; nom: string; email: string; tel: string;
    slot: number | null; produit: string; surface: string;
    houseTotal: number; delivery: number | null;
    terrainMode: "have" | "pack" | null; packTerrain: string | null;
    bardage: string; facade: string; bar: string;
    chambre: string; interieur: string; terrasseM2: number;
    optionsLabels: string[]; grandTotal: number;
    pluConsent: boolean; pluData: ParcelleData | null;
    optIn?: boolean;
  };

  const plu = pluConsent && pluData?.found ? pluData : null;

  const terrainLabel =
    terrainMode === "pack" && packTerrain
      ? PACK_LABELS[packTerrain] ?? "Pack Terrain Affinity"
      : terrainMode === "have"
        ? "J'ai un terrain"
        : "Non renseigné";

  const livraisonLabel =
    terrainMode === "pack"
      ? "Via pack terrain"
      : delivery != null
        ? `${delivery.toLocaleString("fr-FR")} €`
        : "À estimer";

  const totalEstime =
    grandTotal > 0
      ? `${grandTotal.toLocaleString("fr-FR")} €`
      : `${houseTotal?.toLocaleString("fr-FR")} €`;

  // ── Supabase insert ──────────────────────────────────────────────
  // Non bloquant **par choix** : si le stockage tombe, l'email Brevo part
  // quand même et AHF reçoit la demande. Lever ici ferait perdre le lead.
  // Ce qui était fautif, ce n'est pas de continuer — c'est de continuer en
  // silence, en renvoyant `{ ok: true }` (cf. `shared/lib/panne.ts`).
  let persisted = true;
  try {
    await getSupabaseAdmin().from("leads").insert({
      prenom: prenom ?? "",
      nom: nom ?? "",
      email: email ?? "",
      tel: tel ?? null,
      slot: slot ?? null,
      produit: produit ?? null,
      surface: surface ?? null,
      house_total: houseTotal ?? null,
      delivery: delivery ?? null,
      grand_total: grandTotal > 0 ? grandTotal : houseTotal ?? null,
      terrain_mode: terrainMode ?? null,
      pack_terrain: packTerrain ?? null,
      options_labels: optionsLabels ?? [],
      config_json: { bardage, facade, bar, chambre, interieur, terrasseM2 },
      // PLU
      plu_consent: pluConsent ?? false,
      parcelle_idu: plu?.parcelle ?? null,
      plu_adresse: plu?.address_label ?? null,
      plu_zone: plu?.zone_urba ?? null,
      plu_libelong: plu?.libelong ?? null,
      plu_typezone: plu?.typezone ?? null,
      plu_typedoc: plu?.typedoc ?? null,
      plu_etat_doc: plu?.etat_doc ?? null,
      plu_datappro: plu?.datappro ?? null,
      plu_prescriptions: plu?.prescriptions ?? [],
      plu_lon: plu?.lon ?? null,
      plu_lat: plu?.lat ?? null,
      plu_servitudes: plu?.servitudes ?? [],
    });
  } catch (err) {
    persisted = false;
    signalerPanne("reservation/supabase", err);
  }

  // ── Email Brevo ──────────────────────────────────────────────────
  const pluZoneLabel = plu?.typezone
    ? (TYPEZONE_LABELS[plu.typezone.toUpperCase()] ?? plu.typezone)
    : "";

  /* ⚠ Aligné sur les paramètres du template `BREVO_TEMPLATE_RECAP`, mis à jour
     par Richard le 2026-08-22 pour le configurateur v2 — **un seul template
     pour les deux tunnels**. Laisser les anciens noms ici aurait vidé les
     montants de l'email v1 sans que rien ne le signale : le template ignore
     silencieusement un paramètre qu'il ne connaît pas.

     `MAISON_TTC` devient `STUDIO_TTC` à cette occasion (ADR-029) ; le
     renommage n'était possible qu'en touchant code et template ensemble, ce
     qui est le cas.

     Trois notions du v1 — façade, bar, chambre — n'ont plus de placeholder :
     le template v2 ne les affiche plus. L'information n'est pas perdue pour
     autant, elle reste dans `config_json` du lead. Le v1 disparaîtra avec la
     bascule vers `/configurer` (ADR-031). */
  const params = {
    // Contact
    PRENOM: prenom ?? "",
    NOM: nom ?? "",
    EMAIL: email ?? "",
    TEL: tel ?? "",
    ADRESSE: "",
    CP_VILLE: "",
    // Réservation
    NUMERO: slot ? String(slot).padStart(2, "0") : "",
    RESERVATION_TTC: "",
    SOUS_CONDITION: "",
    // Configuration
    MODELE: `${produit} ${surface}`,
    STUDIO_TTC: `${houseTotal?.toLocaleString("fr-FR")} €`,
    BARDAGE: bardage ?? "",
    INTERIEUR: interieur ?? "",
    TERRASSE: terrasseM2 > 0 ? `${terrasseM2} m²` : "",
    TERRASSE_TTC: "",
    OPTIONS_LABELS: (optionsLabels ?? []).join(", "),
    OPTIONS_TTC: "",
    LIVRAISON: livraisonLabel,
    TOTAL_ESTIME: totalEstime,
    GRILLE_VERSION: "",
    TERRAIN: terrainLabel,
    // Analyse PLU (vide si pas de consentement ou pas d'analyse)
    PLU_ADRESSE: plu?.address_label ?? "",
    PLU_PARCELLE: plu?.parcelle ?? "",
    PLU_ZONE: plu ? `${plu.zone_urba ?? ""} — ${pluZoneLabel}` : "",
    PLU_TYPEDOC: plu ? `${plu.typedoc ?? ""} ${plu.etat_doc ?? ""}`.trim() : "",
    PLU_DATAPPRO: plu?.datappro ? formatDate(plu.datappro) : "",
    PLU_PRESCRIPTIONS: plu?.prescriptions?.join(" · ") ?? "",
    PLU_SERVITUDES: plu?.servitudes?.join(" · ") ?? "",
  };

  const templateId = Number(process.env.BREVO_TEMPLATE_RECAP ?? 0);
  const toAhf = process.env.BREVO_TO_AHF ?? "";

  const recipients = [{ email, name: `${prenom} ${nom}`.trim() }];
  if (toAhf) recipients.push({ email: toAhf, name: "Howner" });

  /* L'appel était nu : `sendBrevoTemplate` lève désormais sur configuration
     manquante, et une 500 ici ferait réessayer un visiteur dont le lead est
     déjà enregistré. On signale, on n'interrompt pas. */
  let notified = true;
  try {
    await sendBrevoTemplate({ templateId, to: recipients, params });
  } catch (err) {
    notified = false;
    signalerPanne("reservation/brevo", err);
  }

  // Contact CRM Brevo : toujours créé (groupe Lead_Configurateur). Pas de flux double
  // opt-in (template DOI non actif côté Brevo) — inscription directe SUBSCRIBED (liste
  // prospects) si coché, sinon créé blocklisté, comme sur le formulaire de contact.
  const brevoAttrs = { PRENOM: prenom, NOM: nom, SMS: tel ?? undefined, HOWNER_GROUP: "Lead_Configurateur" };
  /* `await` : sans lui le fetch meurt avec la fonction, après le `return`. */
  await addBrevoContact(
    email,
    brevoAttrs,
    optIn ? [parseInt(process.env.BREVO_LIST_PROSPECTS ?? "8")] : [],
    { emailBlacklisted: !optIn },
  ).catch((err) => signalerPanne("reservation/brevo-contact", err));

  // `ok` reste vrai : du point de vue du visiteur la demande est bien partie.
  // `persisted` dit si le lead est en base, `notified` si l'email est parti —
  // ce dernier manquait, et son absence a laissé croire pendant trois jours
  // que les récapitulatifs partaient. Un `{ ok: true }` seul rendait la panne
  // indétectable, y compris pour une sonde externe.
  return NextResponse.json({ ok: true, persisted, notified });
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
