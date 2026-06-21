import { NextRequest, NextResponse } from "next/server";
import { sendBrevoTemplate } from "@/lib/email";

const TEMPLATE_ID = Number(process.env.BREVO_TEMPLATE_RECAP ?? 0);
const TO_AHF = process.env.BREVO_TO_AHF ?? "";

const PACK_LABELS: Record<string, string> = {
  essentiel: "Pack Essentiel — 4 900 € TTC",
  etendu: "Pack Étendu — 7 300 € TTC",
  departement: "Pack Département — 11 200 € TTC",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    prenom, nom, email, tel, slot,
    produit, surface, houseTotal, delivery,
    terrainMode, packTerrain,
    bardage, facade, bar, chambre, interieur,
    terrasseM2, optionsLabels, grandTotal,
  } = body as {
    prenom: string; nom: string; email: string; tel: string;
    slot: number | null; produit: string; surface: string;
    houseTotal: number; delivery: number | null;
    terrainMode: "have" | "pack" | null; packTerrain: string | null;
    bardage: string; facade: string; bar: string;
    chambre: string; interieur: string; terrasseM2: number;
    optionsLabels: string[]; grandTotal: number;
  };

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

  const params = {
    // Identité
    PRENOM: prenom ?? "",
    NOM: nom ?? "",
    EMAIL: email ?? "",
    TEL: tel ?? "",
    // Réservation (section conditionnelle sur NUMERO)
    NUMERO: slot ? String(slot).padStart(2, "0") : "",
    PRODUIT: `${produit} ${surface}`,
    MAISON_TTC: `${houseTotal?.toLocaleString("fr-FR")} €`,
    LIVRAISON: livraisonLabel,
    TERRAIN: terrainLabel,
    // Configuration (section conditionnelle sur MODELE)
    MODELE: `${produit} ${surface}`,
    BARDAGE: bardage ?? "",
    FACADE: facade ?? "",
    BAR: bar ?? "",
    CHAMBRE: chambre ?? "",
    INTERIEUR: interieur ?? "",
    TERRASSE_M2: terrasseM2 > 0 ? `${terrasseM2} m²` : "",
    OPTIONS_LABELS: (optionsLabels ?? []).join(", "),
    TOTAL_ESTIME: totalEstime,
  };

  const recipients = [{ email, name: `${prenom} ${nom}`.trim() }];
  if (TO_AHF) recipients.push({ email: TO_AHF, name: "Howner" });

  await sendBrevoTemplate({ templateId: TEMPLATE_ID, to: recipients, params });

  return NextResponse.json({ ok: true });
}
