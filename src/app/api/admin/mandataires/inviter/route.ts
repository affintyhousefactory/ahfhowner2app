import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";
import { getSiteUrl } from "@/shared/lib/site-url";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    prenom?: string;
    nom?: string;
    email?: string;
    tel?: string;
    zone_activite?: string[];
  };

  const { prenom, nom, email } = body;
  if (!prenom || !nom || !email) {
    return NextResponse.json({ error: "Champs requis : prénom, nom, email" }, { status: 400 });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  const { data, error } = await getSupabaseAdmin()
    .from("mandataires")
    .insert({
      prenom,
      nom,
      email,
      tel: body.tel || null,
      zone_activite: body.zone_activite ?? [],
      statut: "invite",
      invitation_token: token,
      invitation_expires_at: expires.toISOString(),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const invitationUrl = `${getSiteUrl(req)}/onboarding/mandataire?token=${token}`;

  const templateId = parseInt(process.env.BREVO_TEMPLATE_INVITATION_MANDATAIRE ?? "0", 10);
  try {
    await sendBrevoTemplate({
      templateId,
      to: [{ email, name: `${prenom} ${nom}` }],
      params: {
        PRENOM: prenom,
        NOM: nom,
        INVITATION_URL: invitationUrl,
        EXPIRES_DATE: expires.toLocaleDateString("fr-FR"),
      },
    });
  } catch (e) {
    console.error("[inviter] email non envoyé:", e);
  }

  return NextResponse.json({ id: data.id, invitation_url: invitationUrl });
}
