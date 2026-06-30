import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { raison } = (await req.json()) as { raison?: string };

  if (!raison?.trim()) {
    return NextResponse.json({ error: "La raison de suspension est obligatoire" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Récupérer les dossiers actifs (proposé ou accepté) liés à ce mandataire
  const { data: dossiers } = await supabase
    .from("dossiers")
    .select("id, lead_id, statut")
    .eq("mandataire_id", id)
    .in("statut", ["proposé", "accepté"]);

  const activeDossiers = dossiers ?? [];

  // 1. Suspendre le mandataire
  const { error: mandataireErr } = await supabase
    .from("mandataires")
    .update({ statut: "suspendu", suspension_raison: raison.trim() })
    .eq("id", id);

  if (mandataireErr) {
    return NextResponse.json({ error: mandataireErr.message }, { status: 500 });
  }

  // 2. Pour chaque dossier actif : suspendre le dossier + remettre le lead disponible
  if (activeDossiers.length > 0) {
    const dossierIds = activeDossiers.map((d) => d.id);
    const leadIds    = activeDossiers.map((d) => d.lead_id).filter(Boolean) as string[];

    await supabase
      .from("dossiers")
      .update({ statut: "suspendu", suspension_raison: raison.trim() })
      .in("id", dossierIds);

    if (leadIds.length > 0) {
      await supabase
        .from("leads")
        .update({ statut: "qualifié", mandataire_id: null, affecte_at: null })
        .in("id", leadIds);
    }
  }

  return NextResponse.json({ ok: true, dossiersReset: activeDossiers.length });
}
