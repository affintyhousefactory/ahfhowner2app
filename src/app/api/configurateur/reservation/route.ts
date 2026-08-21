import { NextRequest, NextResponse } from "next/server";
import { sendBrevoTemplate, addBrevoContact } from "@/shared/lib/email";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { signalerPanne } from "@/shared/lib/panne";
import { loadConfig, getModele, paliersPourModele, prixOption, optionsPourModele, type ModeleId } from "@/lib/configurateur/config";
import { SERIE_TOTAL } from "@/lib/site";
import type { ParcelleData } from "@/shared/types/plu";

/**
 * Soumission de la demande de numéro — ADR-031.
 *
 * Route distincte de `/api/reservation`, qui sert le tunnel v1 : deux formats
 * de charge utile dans une même route obligeraient à distinguer l'appelant à
 * chaque évolution. Le v1 disparaîtra avec la bascule, sa route avec lui.
 *
 * Trois principes tiennent tout le fichier :
 *
 * 1. **Le conflit de numéro n'est pas une panne.** Si le numéro vient d'être
 *    confirmé par un autre client, c'est une réponse métier — 409, avec les
 *    numéros encore libres. On n'envoie alors aucun email : le visiteur doit
 *    rechoisir, et un récapitulatif portant un numéro perdu l'embrouillerait.
 *
 * 2. **Toute autre défaillance de stockage est non bloquante mais jamais
 *    silencieuse** (`shared/lib/panne.ts`) : l'email part quand même, AHF
 *    reçoit la demande, et `persisted: false` dit l'autre moitié de la vérité.
 *
 * 3. **Les prix sont recalculés côté serveur**, jamais repris du client. Un
 *    total envoyé par le navigateur est une valeur qu'on ne contrôle pas ; ici
 *    il ne sert qu'à détecter un désaccord, signalé sans bloquer.
 */

const TEMPLATE_ID = Number(process.env.BREVO_TEMPLATE_RECAP ?? 0);
const TO_AHF = process.env.BREVO_TO_AHF ?? "";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Statuts où le numéro est réellement pris (ADR-035, ADR-031 §2). */
const STATUTS_CONFIRMES = ["paiement_reserve", "signe"];

type Charge = {
  contact: {
    prenom: string;
    nom: string;
    email: string;
    tel: string;
    adresse: string;
    cp: string;
    ville: string;
  };
  numero: number | null;
  modele: ModeleId;
  usage: string | null;
  quantite: number;
  ambiance: string;
  ambianceInterieure: string;
  terrasse: string;
  options: string[];
  /** Total affiché au visiteur — sert de contrôle, pas de source. */
  totalAffiche: number;
  transport: number | null;
  distanceKm: number | null;
  pluConsent: boolean;
  pluData: ParcelleData | null;
  optIn: boolean;
  captchaToken?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Charge>;
  const c = body.contact;

  /* Validation minimale mais réelle : la route est publique, et le contrôle
     côté navigateur ne protège de rien — il informe. */
  if (!c?.prenom?.trim() || !c?.nom?.trim() || !c?.email?.trim()) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(c.email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (body.numero == null || body.numero < 1 || body.numero > SERIE_TOTAL) {
    return NextResponse.json({ error: "invalid_numero" }, { status: 400 });
  }

  // ── Turnstile ────────────────────────────────────────────────────
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!body.captchaToken) {
      return NextResponse.json({ error: "captcha_required" }, { status: 400 });
    }
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: turnstileSecret, response: body.captchaToken }),
    });
    const result = (await check.json()) as { success: boolean };
    if (!result.success) {
      return NextResponse.json({ error: "captcha_failed" }, { status: 400 });
    }
  }

  // ── Prix recalculés depuis la grille serveur ─────────────────────
  const cfg = loadConfig();
  const modeleId = (body.modele ?? "max") as ModeleId;
  const modele = getModele(cfg, modeleId);
  const palier = paliersPourModele(cfg, modeleId).find((p) => p.id === body.terrasse);
  const optionsDispo = optionsPourModele(cfg, modeleId);
  const optionsRetenues = optionsDispo.filter((o) => (body.options ?? []).includes(o.id));

  const prixBase = modele.prixBaseTtc;
  const prixTerrasse = palier?.prixTtc ?? 0;
  const prixOptions = optionsRetenues.reduce((s, o) => s + prixOption(o, modeleId), 0);
  const transport = body.transport ?? null;
  const total = prixBase + prixTerrasse + prixOptions + (transport ?? 0);

  /* Un écart entre le total affiché et le total recalculé signale une grille
     qui a bougé pendant la session, ou une charge utile forgée. Ni l'un ni
     l'autre ne justifie de refuser la demande — mais le conseiller doit le
     savoir avant de rappeler. */
  if (body.totalAffiche != null && Math.abs(body.totalAffiche - total) > 1) {
    signalerPanne(
      "configurateur/reservation/total-divergent",
      new Error(`affiché ${body.totalAffiche} ≠ recalculé ${total}`),
    );
  }

  const plu = body.pluConsent && body.pluData?.found ? body.pluData : null;

  // ── Insertion ────────────────────────────────────────────────────
  let persisted = true;
  let conflit = false;

  try {
    const { error } = await getSupabaseAdmin()
      .from("leads")
      .insert({
        prenom: c.prenom.trim(),
        nom: c.nom.trim(),
        email: c.email.trim(),
        tel: c.tel?.trim() || null,
        adresse_postale_client: c.adresse?.trim() || null,
        cp_client: c.cp?.trim() || null,
        ville_client: c.ville?.trim() || null,
        slot: body.numero,
        statut: "nouveau",
        statut_commercial: "nouveau",
        source: "configurateur_v2",
        // Configuration — colonnes plates pour le tri et l'agrégat du CRM…
        cfg_version: cfg.version,
        cfg_usage: body.usage ?? null,
        cfg_quantite: body.quantite ?? 1,
        cfg_modele: modeleId,
        cfg_ambiance: body.ambiance ?? null,
        cfg_ambiance_interieure: body.ambianceInterieure ?? null,
        cfg_terrasse: body.terrasse ?? null,
        cfg_options: body.options ?? [],
        cfg_prix_base: prixBase,
        cfg_prix_terrasse: prixTerrasse,
        cfg_prix_options: prixOptions,
        cfg_transport: transport,
        cfg_total: total,
        // …et le jsonb pour la fidélité, avec la version de grille (ADR-035 §4).
        config_v2: {
          version: cfg.version,
          usage: body.usage ?? null,
          quantite: body.quantite ?? 1,
          modele: modeleId,
          ambiance: body.ambiance ?? null,
          ambiance_interieure: body.ambianceInterieure ?? null,
          terrasse: body.terrasse ?? null,
          options: body.options ?? [],
          distance_km: body.distanceKm ?? null,
          total_affiche: body.totalAffiche ?? null,
        },
        grand_total: total,
        // Terrain — vide si le visiteur n'a pas testé sa parcelle. C'est ce
        // vide qui dit au CRM que la réservation est « sous condition » : un
        // booléen dédié créerait une seconde vérité à tenir d'accord.
        plu_consent: body.pluConsent ?? false,
        parcelle_idu: plu?.parcelle ?? null,
        plu_adresse: plu?.address_label ?? null,
        plu_zone: plu?.zone_urba ?? null,
        plu_libelong: plu?.libelong ?? null,
        plu_typezone: plu?.typezone ?? null,
        plu_typedoc: plu?.typedoc ?? null,
        plu_etat_doc: plu?.etat_doc ?? null,
        plu_datappro: plu?.datappro ?? null,
        plu_prescriptions: plu?.prescriptions ?? [],
        plu_servitudes: plu?.servitudes ?? [],
        plu_lon: plu?.lon ?? null,
        plu_lat: plu?.lat ?? null,
      });

    if (error) {
      /* 23505 sur l'index partiel : le numéro vient d'être confirmé par
         quelqu'un d'autre. Ce n'est pas une panne, c'est une course perdue —
         et elle a une réponse utile. */
      if (error.code === "23505") conflit = true;
      else throw error;
    }
  } catch (err) {
    persisted = false;
    signalerPanne("configurateur/reservation/supabase", err);
  }

  if (conflit) {
    return NextResponse.json(
      { error: "numero_indisponible", numero: body.numero, disponibles: await numerosLibres() },
      { status: 409 },
    );
  }

  // ── Emails ───────────────────────────────────────────────────────
  /* ⚠ Le template `BREVO_TEMPLATE_RECAP` a été écrit pour le tunnel v1 : ses
     placeholders portent des noms de la v1 (`MAISON_TTC`, `FACADE`, `BAR`,
     `CHAMBRE`). On les remplit avec les valeurs v2 correspondantes plutôt que
     de les renommer — renommer ici sans toucher au template viderait l'email.
     Un template dédié demande une action dans le tableau de bord Brevo, hors
     périmètre de cet ADR. Les champs sans équivalent restent vides. */
  const nomComplet = `${c.prenom} ${c.nom}`.trim();
  const params = {
    PRENOM: c.prenom,
    NOM: c.nom,
    EMAIL: c.email,
    TEL: c.tel ?? "",
    NUMERO: String(body.numero).padStart(2, "0"),
    PRODUIT: `${modele.nom} ${modele.surface} m²`,
    MODELE: `${modele.nom} ${modele.surface} m²`,
    MAISON_TTC: `${prixBase.toLocaleString("fr-FR")} €`,
    LIVRAISON: transport != null ? `${transport.toLocaleString("fr-FR")} €` : "À estimer",
    TERRAIN: plu ? (plu.address_label ?? "Terrain analysé") : "Terrain non testé",
    BARDAGE: cfg.ambiances.find((a) => a.id === body.ambiance)?.nom ?? "",
    INTERIEUR: cfg.ambiancesInterieures.find((a) => a.id === body.ambianceInterieure)?.nom ?? "",
    FACADE: "",
    BAR: "",
    CHAMBRE: "",
    TERRASSE_M2: palier && palier.prixTtc > 0 ? palier.nom : "",
    OPTIONS_LABELS: optionsRetenues.map((o) => o.nom).join(", "),
    TOTAL_ESTIME: `${total.toLocaleString("fr-FR")} €`,
    PLU_PARCELLE: plu?.parcelle ?? "",
    PLU_ADRESSE: plu?.address_label ?? "",
    PLU_ZONE: plu?.zone_urba ?? "",
    PLU_TYPEDOC: plu ? `${plu.typedoc ?? ""} ${plu.etat_doc ?? ""}`.trim() : "",
    PLU_DATAPPRO: plu?.datappro ?? "",
    PLU_PRESCRIPTIONS: plu?.prescriptions?.join(" · ") ?? "",
    PLU_SERVITUDES: plu?.servitudes?.join(" · ") ?? "",
    PLU_LIBELONG: plu?.libelong ?? "",
  };

  const destinataires = [{ email: c.email, name: nomComplet }];
  if (TO_AHF) destinataires.push({ email: TO_AHF, name: "Howner" });

  let notified = true;
  try {
    await sendBrevoTemplate({ templateId: TEMPLATE_ID, to: destinataires, params });
  } catch (err) {
    notified = false;
    signalerPanne("configurateur/reservation/brevo", err);
  }

  addBrevoContact(
    c.email,
    { PRENOM: c.prenom, NOM: c.nom, SMS: c.tel || undefined, HOWNER_GROUP: "Lead_Configurateur_v2" },
    body.optIn ? [parseInt(process.env.BREVO_LIST_PROSPECTS ?? "8")] : [],
    { emailBlacklisted: !body.optIn },
  ).catch((err) => signalerPanne("configurateur/reservation/brevo-contact", err));

  /* Trois faits distincts, trois champs — la leçon du 2026-08-18. `ok` dit que
     la demande a été reçue et validée ; `persisted` qu'elle est en base ;
     `notified` que l'email est parti. Les confondre est ce qui a rendu une base
     en pause invisible pendant des semaines. */
  return NextResponse.json({ ok: true, persisted, notified });
}

/**
 * Numéros encore libres — ceux qu'aucun lead confirmé ne détient.
 *
 * Interrogé au moment du conflit seulement : le compteur public reste servi
 * par `chargerNumeros()` tant qu'ADR-009 n'a pas branché le temps réel.
 */
async function numerosLibres(): Promise<number[]> {
  const tous = Array.from({ length: SERIE_TOTAL }, (_, i) => i + 1);
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("leads")
      .select("slot")
      .in("statut_commercial", STATUTS_CONFIRMES)
      .not("slot", "is", null);
    if (error) throw error;
    const pris = new Set((data ?? []).map((l) => l.slot as number));
    return tous.filter((n) => !pris.has(n));
  } catch (err) {
    signalerPanne("configurateur/reservation/numeros-libres", err);
    /* On ne sait pas : mieux vaut ne rien proposer que proposer un numéro
       peut-être déjà pris — le visiteur reverrait la même erreur. */
    return [];
  }
}
