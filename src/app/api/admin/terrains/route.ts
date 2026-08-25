import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  const off = mandataireDisabled();
  if (off) return off;
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;


  const auth = await checkAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const statut_admin = searchParams.get("statut_admin");
  const mandataire_id = searchParams.get("mandataire_id");

  let query = getSupabaseAdmin()
    .from("fiches_terrain")
    .select("*, mandataires(id, prenom, nom, email)")
    .order("created_at", { ascending: false });

  if (statut_admin) query = query.eq("statut_admin", statut_admin);
  if (mandataire_id) query = query.eq("mandataire_id", mandataire_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
