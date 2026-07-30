import { NextRequest, NextResponse } from "next/server";
import { sendBrevoTemplate, addBrevoContact } from "@/shared/lib/email";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
// ADR-028 — domaine « Mandataire & Terrain » suspendu : 404 tant que le flag est off.
import { mandataireDisabled } from "@/shared/lib/feature-guard";

type Commune = { nom: string; cp: string };

type Payload = {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  modele?: string | null;
  communes?: Commune[];
  source?: "rechercheterrain" | "configurateur" | null;
  accepte_cgv: boolean;
  optIn?: boolean;
};

export async function POST(req: NextRequest) {
  const off = mandataireDisabled();
  if (off) return off;

  const body = (await req.json()) as Payload;
  const { prenom, nom, telephone, email, modele, communes, source, accepte_cgv, optIn } = body;

  if (!nom || !telephone || !email || !accepte_cgv) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const communesJson = communes?.length ? communes : null;
  const communesLabel = communes?.map((c) => `${c.nom}${c.cp ? ` (${c.cp})` : ""}`).join(", ") ?? "";

  // ── Supabase — recherche_terrain table ──────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnon) {
    const res = await fetch(`${supabaseUrl}/rest/v1/recherche_terrain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnon,
        Authorization: `Bearer ${supabaseAnon}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        nom: `${prenom} ${nom}`.trim(),
        telephone,
        email,
        modele: modele ?? null,
        source: source ?? "configurateur",
        zones: { communes: communesJson },
        accepte_cgv,
      }),
    });
    if (!res.ok) console.error("[recherche-terrain] recherche_terrain error:", await res.text());
  }

  // ── Supabase — leads table (pour visibilité admin) ──────────────────
  try {
    await getSupabaseAdmin().from("leads").insert({
      prenom: prenom ?? "",
      nom: nom ?? "",
      email: email ?? "",
      tel: telephone ?? null,
      produit: modele ?? null,
      terrain_mode: "pack",
      config_json: { communes: communesJson },
      options_labels: [],
    });
  } catch (err) {
    console.error("[recherche-terrain] leads insert error:", err);
  }

  // ── Email Brevo ─────────────────────────────────────────────────────
  const templateId = parseInt(process.env.BREVO_TEMPLATE_RECAP ?? "0");
  const toAhf = process.env.BREVO_TO_AHF ?? "";

  sendBrevoTemplate({
    templateId,
    to: [
      { email, name: `${prenom} ${nom}`.trim() },
      ...(toAhf ? [{ email: toAhf, name: "Affinity House Factory" }] : []),
    ],
    params: {
      PRENOM: prenom ?? "",
      NOM: nom ?? "",
      EMAIL: email,
      TEL: telephone ?? "",
      MODELE: modele ?? "",
      TERRAIN: "Recherche terrain — mandataire Affinity",
      ZONES: communesLabel,
      PACK_LABEL: "Recherche terrain — communes sélectionnées",
      BUDGET: "",
    },
  }).catch((err) => console.error("[recherche-terrain] Brevo error:", err));

  // Contact CRM Brevo : toujours créé (groupe Lead_Configurateur), inscription directe
  // SUBSCRIBED (liste prospects) si opt-in coché, sinon créé blocklisté.
  addBrevoContact(
    email,
    { PRENOM: prenom, NOM: nom, SMS: telephone ?? undefined, HOWNER_GROUP: "Lead_Configurateur" },
    optIn ? [parseInt(process.env.BREVO_LIST_PROSPECTS ?? "8")] : [],
    { emailBlacklisted: !optIn },
  ).catch((err) => console.error("[recherche-terrain] Brevo contact error:", err));

  return NextResponse.json({ success: true });
}
