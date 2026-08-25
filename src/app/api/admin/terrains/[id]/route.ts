import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
// ADR-028 — domaine « Mandataire & Terrain » suspendu : 404 tant que le flag est off.
import { mandataireDisabled } from "@/shared/lib/feature-guard";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";

async function checkAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { ok: false, error: "Non autorisé", status: 401 };
  if (user.app_metadata?.role !== "admin") return { ok: false, error: "Accès refusé", status: 403 };
  return { ok: true, error: null, status: 200 };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const off = mandataireDisabled();
  if (off) return off;
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;


  const auth = await checkAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ("statut_admin" in body) update.statut_admin = body.statut_admin;
  if ("admin_commentaire" in body) update.admin_commentaire = body.admin_commentaire;
  if ("description_publique" in body) update.description_publique = body.description_publique;
  if ("titre" in body) update.titre = body.titre;
  if ("afficher_statut_mandataire" in body) update.afficher_statut_mandataire = body.afficher_statut_mandataire;

  // Auto-set publie_at when publishing
  if (body.statut_admin === "publie") {
    update.publie_at = new Date().toISOString();
  }

  const { data, error } = await getSupabaseAdmin()
    .from("fiches_terrain")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invalide le cache ISR si statut_admin change
  if ("statut_admin" in body) {
    revalidatePath("/terrains");
  }

  return NextResponse.json(data);
}
