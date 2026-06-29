import { NextRequest, NextResponse } from "next/server";
import { sendBrevoTemplate } from "@/shared/lib/email";

type PackId = "essentiel" | "etendu" | "departement";

const PACK_LABELS: Record<PackId, string> = {
  essentiel: "Pack Essentiel — communes ciblées",
  etendu: "Pack Étendu — zones élargies",
  departement: "Pack Département",
};

type Payload = {
  nom: string;
  telephone: string;
  email: string;
  modele?: string | null;
  pack: PackId;
  source?: "rechercheterrain" | "configurateur" | null;
  // essentiel
  villes?: string[];
  // etendu
  zones?: string[];
  // departement
  departement?: string;
  taif_zone?: string | null;
  budget?: string | null;
  accepte_cgv: boolean;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;

  const { nom, telephone, email, modele, pack, source, villes, zones, departement, taif_zone, accepte_cgv } = body;

  if (!nom || !telephone || !email || !pack || !accepte_cgv) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  if (pack === "essentiel" && !villes?.length) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  if (pack === "etendu" && !zones?.length) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  if (pack === "departement" && !departement) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    console.warn("[recherche-terrain] Supabase non configuré — lead non persisté.");
    return NextResponse.json({ success: true, persisted: false });
  }

  // zones JSONB stocke l'ensemble des données géographiques (pack + détail)
  const zonesJson = {
    pack,
    villes: villes ?? null,
    regions: zones ?? null,
    departement: departement ?? null,
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/recherche_terrain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnon,
      Authorization: `Bearer ${supabaseAnon}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      nom,
      telephone,
      email,
      modele: modele ?? null,
      source: source ?? "rechercheterrain",
      zones: zonesJson,
      accepte_cgv,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[recherche-terrain] Supabase error:", err);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Envoi email Brevo (fire-and-forget — n'impacte pas la réponse HTTP)
  const templateId = parseInt(process.env.BREVO_TEMPLATE_RECAP ?? "0");
  const toAhf = process.env.BREVO_TO_AHF ?? "";
  const zonesFlat = villes ?? zones ?? (departement ? [departement] : null);

  sendBrevoTemplate({
    templateId,
    to: [
      { email, name: nom },
      ...(toAhf ? [{ email: toAhf, name: "Affinity House Factory" }] : []),
    ],
    params: {
      // Identité
      PRENOM: "",
      NOM: nom,
      EMAIL: email,
      TEL: telephone ?? "",
      // Configuration (conditionnel sur MODELE)
      MODELE: modele ?? "",
      // Terrain (conditionnel sur PACK_LABEL)
      PACK_LABEL: PACK_LABELS[pack] ?? pack,
      ZONES: zonesFlat?.join(", ") ?? "",
      BUDGET: body.budget ?? "",
    },
  }).catch((err) => console.error("[recherche-terrain] Brevo error:", err));

  return NextResponse.json({ success: true, persisted: true });
}
