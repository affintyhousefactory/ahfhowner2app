import { NextRequest, NextResponse } from "next/server";
import { sendBrevoTemplate } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase";
import type { ParcelleData } from "@/app/api/parcelle/route";

const TEMPLATE_ID = Number(process.env.BREVO_TEMPLATE_RECAP ?? 0);
const TO_AHF = process.env.BREVO_TO_AHF ?? "";

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
    pluConsent, pluData,
  } = body as {
    prenom: string; nom: string; email: string; tel: string;
    slot: number | null; produit: string; surface: string;
    houseTotal: number; delivery: number | null;
    terrainMode: "have" | "pack" | null; packTerrain: string | null;
    bardage: string; facade: string; bar: string;
    chambre: string; interieur: string; terrasseM2: number;
    optionsLabels: string[]; grandTotal: number;
    pluConsent: boolean; pluData: ParcelleData | null;
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
  try {
    await supabaseAdmin.from("leads").insert({
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
      plu_servitudes: plu?.servitudes ?? [],
    });
  } catch (err) {
    // Non bloquant — l'email est envoyé même si le stockage échoue
    console.error("[reservation] Supabase insert error:", err);
  }

  // ── Email Brevo ──────────────────────────────────────────────────
  const pluZoneLabel = plu?.typezone
    ? (TYPEZONE_LABELS[plu.typezone.toUpperCase()] ?? plu.typezone)
    : "";

  const params = {
    // Identité
    PRENOM: prenom ?? "",
    NOM: nom ?? "",
    EMAIL: email ?? "",
    TEL: tel ?? "",
    // Réservation
    NUMERO: slot ? String(slot).padStart(2, "0") : "",
    PRODUIT: `${produit} ${surface}`,
    MAISON_TTC: `${houseTotal?.toLocaleString("fr-FR")} €`,
    LIVRAISON: livraisonLabel,
    TERRAIN: terrainLabel,
    // Configuration
    MODELE: `${produit} ${surface}`,
    BARDAGE: bardage ?? "",
    FACADE: facade ?? "",
    BAR: bar ?? "",
    CHAMBRE: chambre ?? "",
    INTERIEUR: interieur ?? "",
    TERRASSE_M2: terrasseM2 > 0 ? `${terrasseM2} m²` : "",
    OPTIONS_LABELS: (optionsLabels ?? []).join(", "),
    TOTAL_ESTIME: totalEstime,
    // Analyse PLU (vide si pas de consentement ou pas d'analyse)
    PLU_PARCELLE: plu?.parcelle ?? "",
    PLU_ADRESSE: plu?.address_label ?? "",
    PLU_ZONE: plu ? `${plu.zone_urba ?? ""} — ${pluZoneLabel}` : "",
    PLU_TYPEDOC: plu ? `${plu.typedoc ?? ""} ${plu.etat_doc ?? ""}`.trim() : "",
    PLU_DATAPPRO: plu?.datappro ? formatDate(plu.datappro) : "",
    PLU_PRESCRIPTIONS: plu?.prescriptions?.join(" · ") ?? "",
    PLU_SERVITUDES: plu?.servitudes?.join(" · ") ?? "",
    PLU_LIBELONG: plu?.libelong ?? "",
  };

  const recipients = [{ email, name: `${prenom} ${nom}`.trim() }];
  if (TO_AHF) recipients.push({ email: TO_AHF, name: "Howner" });

  await sendBrevoTemplate({ templateId: TEMPLATE_ID, to: recipients, params });

  return NextResponse.json({ ok: true });
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
