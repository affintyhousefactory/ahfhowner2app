import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";
import type { ContratData } from "@/shared/components/mandataire/ContratCanvas";

async function getByToken(token: string) {
  const { data } = await getSupabaseAdmin()
    .from("mandataires")
    .select("id, prenom, nom, email, statut, invitation_expires_at")
    .eq("invitation_token", token)
    .single();
  return data;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    token?: string;
    contratData?: ContratData;
    pdfBase64?: string | null;
  };

  const { token, contratData, pdfBase64 } = body;
  if (!token || !contratData) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const m = await getByToken(token);
  if (!m) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  if (m.statut !== "invite") return NextResponse.json({ error: "Invitation déjà utilisée" }, { status: 409 });

  const expires = m.invitation_expires_at ? new Date(m.invitation_expires_at) : null;
  if (expires && expires < new Date()) {
    return NextResponse.json({ error: "Lien expiré" }, { status: 410 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();

  // Upload PDF
  let contratUrl: string | null = null;
  if (pdfBase64) {
    try {
      const pdfBuffer = Buffer.from(pdfBase64, "base64");
      const fileName = `${m.id}/contrat-${now.toISOString().slice(0, 10)}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("mandataires-documents")
        .upload(fileName, pdfBuffer, { contentType: "application/pdf", upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("mandataires-documents")
          .getPublicUrl(fileName);
        contratUrl = urlData?.publicUrl ?? null;
      }
    } catch {
      // non-bloquant
    }
  }

  // Sauvegarder tous les champs + signer le contrat
  const { error: dbError } = await supabase
    .from("mandataires")
    .update({
      contrat_signe_at:     now.toISOString(),
      contrat_data:         contratData,
      contrat_url:          contratUrl,
      // Identité
      tel:                  contratData.tel || null,
      email:                contratData.email || null,
      // Entreprise & Carte T
      siret:                contratData.siret || null,
      forme_juridique:      contratData.forme_juridique || null,
      adresse:              contratData.adresse || null,
      reseau_carte_t:       contratData.reseau_carte_t || null,
      carte_t_numero:       contratData.carte_t_numero || null,
      // Statut professionnel
      statut_professionnel: contratData.statut_professionnel || null,
      reseau_type:          contratData.reseau_type || null,
      // Adresse principale + géoloc
      adresse_principale:   contratData.adresse_principale || null,
      cp_principal:         contratData.cp_principal || null,
      ville_principale:     contratData.ville_principale || null,
      lat:                  contratData.lat ?? null,
      lon:                  contratData.lon ?? null,
      // Profil d'intervention
      rayon_intervention:   contratData.rayon_intervention || null,
      delai_rappel:         contratData.delai_rappel || null,
      specialites:          contratData.specialites.length > 0 ? contratData.specialites : null,
      // Fermer l'invitation
      statut:               "en_attente",
      invitation_token:     null,
      invitation_expires_at: null,
    })
    .eq("id", m.id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  // Notifier AHF
  const templateId = parseInt(process.env.BREVO_TEMPLATE_MANDATAIRE_NEW ?? "0", 10);
  sendBrevoTemplate({
    templateId,
    to: [{ email: process.env.AHF_NOTIFICATION_EMAIL ?? "contact@affinityhousefactory.com" }],
    params: { PRENOM: m.prenom, NOM: m.nom, EMAIL: m.email },
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
