import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { getSiteUrl } from "@/shared/lib/site-url";

const VALID_STATUTS = ["en_attente", "actif", "suspendu"] as const;
type Statut = (typeof VALID_STATUTS)[number];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { statut } = (await req.json()) as { statut?: string };

  if (!statut || !VALID_STATUTS.includes(statut as Statut)) {
    return NextResponse.json({ error: "statut invalide" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: mandataire } = await supabase
    .from("mandataires")
    .select("id, email, user_id")
    .eq("id", id)
    .single();

  if (!mandataire) return NextResponse.json({ error: "Mandataire non trouvé" }, { status: 404 });

  // Activation → créer le compte auth si pas encore fait + envoyer l'invitation
  if (statut === "actif" && !mandataire.user_id && mandataire.email) {
    const { data: inviteData, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(
      mandataire.email,
      {
        data: { role: "mandataire" },
        redirectTo: `${getSiteUrl(req)}/mandataire/auth/reset-password`,
      },
    );

    if (inviteErr) {
      return NextResponse.json(
        { error: `Impossible de créer le compte : ${inviteErr.message}` },
        { status: 500 },
      );
    }

    if (inviteData?.user?.id) {
      await supabase
        .from("mandataires")
        .update({ user_id: inviteData.user.id })
        .eq("id", id);
    }
  }

  const { error } = await supabase
    .from("mandataires")
    .update({ statut })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, statut });
}
