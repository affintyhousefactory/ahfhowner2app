import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import ConfigurateurRecap from "../../../../emails/configurateur-recap";
import { sendEmail } from "@/lib/email";

type PackId = "essentiel" | "etendu" | "departement";

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
      pack,
      source: source ?? "rechercheterrain",
      villes: villes ?? null,
      zones: zones ?? null,
      departement: departement ?? null,
      taif_zone: taif_zone ?? null,
      accepte_cgv,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[recherche-terrain] Supabase error:", err);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Envoi email Brevo (fire-and-forget — n'impacte pas la réponse HTTP)
  const toAhf = process.env.EMAIL_TO_AHF ?? "";
  const recipients = [email, ...(toAhf ? [toAhf] : [])].filter(Boolean);
  const zonesFlat = villes ?? zones ?? (departement ? [departement] : null);

  sendEmail({
    to: recipients,
    subject: "Récapitulatif de votre demande ARKO — Affinity House Factory",
    template: createElement(ConfigurateurRecap, {
      nom,
      email,
      tel: telephone ?? null,
      modele: modele ?? null,
      pack: pack ?? null,
      zones: zonesFlat ?? null,
      budget: body.budget ?? null,
    }),
  }).catch((err) => console.error("[recherche-terrain] Brevo error:", err));

  return NextResponse.json({ success: true, persisted: true });
}
