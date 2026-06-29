import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate, addBrevoContact } from "@/shared/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.mandataireId) {
    return NextResponse.json({ error: "mandataireId manquant." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: m, error } = await supabase
    .from("mandataires")
    .select("nom, prenom, email, siret, forme_juridique, adresse, reseau_carte_t, carte_t_numero, contrat_signe_at, contrat_data, statut")
    .eq("id", body.mandataireId)
    .single();

  if (error || !m) {
    return NextResponse.json({ error: "Mandataire introuvable." }, { status: 404 });
  }

  const dateSignature = m.contrat_signe_at
    ? new Date(m.contrat_signe_at).toLocaleDateString("fr-FR")
    : new Date().toLocaleDateString("fr-FR");

  const dpaEmail = m.contrat_data?.dpa_email ?? m.email;
  const dpanom = m.contrat_data?.dpa_nom_prenom ?? `${m.prenom} ${m.nom}`;

  const errors: string[] = [];

  // 1. Email admin AHF — template 11
  const adminEmail = process.env.BREVO_TO_AHF ?? "contact@affinityhousefactory.com";
  const adminTemplateId = parseInt(process.env.BREVO_TEMPLATE_MANDATAIRE_NEW ?? "11");

  try {
    await sendBrevoTemplate({
      templateId: adminTemplateId,
      to: [{ email: adminEmail, name: "AHF Admin" }],
      params: {
        NOM_RAISON_SOCIALE: m.nom,
        PRENOM: m.prenom,
        EMAIL: m.email,
        SIRET: m.siret ?? "",
        FORME_JURIDIQUE: m.forme_juridique ?? "",
        ADRESSE: m.adresse ?? "",
        RESEAU_CARTE_T: m.reseau_carte_t ?? "",
        CARTE_T_NUMERO: m.carte_t_numero ?? "",
        DPA_NOM: dpanom,
        DPA_EMAIL: dpaEmail,
        DATE_SIGNATURE: dateSignature,
        STATUT: "en_attente",
      },
    });
  } catch (e) {
    errors.push(`admin: ${e}`);
  }

  // 2. Email récap mandataire — template BREVO_TEMPLATE_MANDATAIRE_ONBOARDING
  const mandataireTemplateId = parseInt(
    process.env.BREVO_TEMPLATE_MANDATAIRE_ONBOARDING ?? "0",
  );

  if (mandataireTemplateId > 0) {
    const portalUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/mandataire`
      : "https://howner.fr/mandataire";

    try {
      await sendBrevoTemplate({
        templateId: mandataireTemplateId,
        to: [{ email: m.email, name: `${m.prenom} ${m.nom}` }],
        params: {
          PRENOM: m.prenom,
          NOM_RAISON_SOCIALE: m.nom,
          STATUT: "En attente de validation",
          DATE_SIGNATURE: dateSignature,
          RESEAU_CARTE_T: m.reseau_carte_t ?? "",
          LIEN_PORTAIL: portalUrl,
        },
      });
    } catch (e) {
      errors.push(`mandataire: ${e}`);
    }
  }

  // Ajout direct mandataire dans liste Brevo 7 (base contractuelle, pas DOI)
  addBrevoContact(
    m.email,
    {
      PRENOM: m.prenom,
      NOM: m.nom,
      STATUT_MANDATAIRE: "en_attente",
    },
    [parseInt(process.env.BREVO_LIST_MANDATAIRES ?? "7")],
  ).catch((err) => errors.push(`brevo_contact: ${err}`));

  return NextResponse.json({
    success: true,
    ...(errors.length ? { warnings: errors } : {}),
  });
}
