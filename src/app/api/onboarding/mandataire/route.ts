import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";

async function getByToken(token: string) {
  const { data } = await getSupabaseAdmin()
    .from("mandataires")
    .select("id, prenom, nom, email, tel, statut, invitation_expires_at, zone_activite")
    .eq("invitation_token", token)
    .single();
  return data;
}

// Valider le token et retourner les données pré-remplies
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 });

  const m = await getByToken(token);
  if (!m) return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });
  if (m.statut !== "invite") return NextResponse.json({ error: "Invitation déjà utilisée" }, { status: 409 });

  const expires = m.invitation_expires_at ? new Date(m.invitation_expires_at) : null;
  if (expires && expires < new Date()) {
    return NextResponse.json({ error: "Lien expiré" }, { status: 410 });
  }

  return NextResponse.json({
    prenom: m.prenom,
    nom: m.nom,
    email: m.email,
    tel: m.tel,
    zone_activite: m.zone_activite ?? [],
  });
}

// Compléter l'inscription
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    token?: string;
    siret?: string;
    forme_juridique?: string;
    adresse?: string;
    reseau_carte_t?: string;
    carte_t_numero?: string;
    zone_activite?: string[];
    description?: string;
  };

  const { token } = body;
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 });

  const m = await getByToken(token);
  if (!m) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  if (m.statut !== "invite") return NextResponse.json({ error: "Invitation déjà utilisée" }, { status: 409 });

  const expires = m.invitation_expires_at ? new Date(m.invitation_expires_at) : null;
  if (expires && expires < new Date()) {
    return NextResponse.json({ error: "Lien expiré" }, { status: 410 });
  }

  const { error } = await getSupabaseAdmin()
    .from("mandataires")
    .update({
      siret: body.siret || null,
      forme_juridique: body.forme_juridique || null,
      adresse: body.adresse || null,
      reseau_carte_t: body.reseau_carte_t || null,
      carte_t_numero: body.carte_t_numero || null,
      zone_activite: body.zone_activite ?? [],
      description: body.description || null,
      statut: "en_attente",
      invitation_token: null,
      invitation_expires_at: null,
    })
    .eq("id", m.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notifier AHF
  const templateId = parseInt(process.env.BREVO_TEMPLATE_NOUVEAU_MANDATAIRE ?? "0", 10);
  try {
    await sendBrevoTemplate({
      templateId,
      to: [{ email: process.env.AHF_NOTIFICATION_EMAIL ?? "contact@affinityhome.fr" }],
      params: { PRENOM: m.prenom, NOM: m.nom, EMAIL: m.email },
    });
  } catch {
    // fire-and-forget
  }

  return NextResponse.json({ ok: true });
}
