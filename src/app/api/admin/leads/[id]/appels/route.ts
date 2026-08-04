/**
 * Journal d'appels et de notes d'un lead — ADR-035 §3.
 *
 * Une entrée = un appel entrant, un appel sortant, ou une note libre.
 * `leads.dernier_appel_at` est maintenu par trigger (migration
 * `20260804_crm_leads.sql`) et n'est jamais écrit ici : deux écrivains sur la
 * même valeur finissent toujours par diverger.
 *
 * L'échéance COURANTE de rappel, elle, appartient au lead — la route l'y écrit
 * quand l'appel en planifie une. Le journal en garde la trace historique.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

const SENS = ["entrant", "sortant", "note"] as const;
const ISSUES = ["joint", "repondeur", "pas_de_reponse", "rappel_demande", "refus"] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("lead_appels")
    .select("*")
    .eq("lead_id", id)
    .order("occurred_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const sens = String(body.sens ?? "sortant");
  if (!(SENS as readonly string[]).includes(sens)) {
    return NextResponse.json({ error: "Sens invalide" }, { status: 400 });
  }

  const issueRaw = body.issue ? String(body.issue) : null;
  if (issueRaw && !(ISSUES as readonly string[]).includes(issueRaw)) {
    return NextResponse.json({ error: "Issue invalide" }, { status: 400 });
  }
  // Une note n'a pas d'issue d'appel : la forcer à null évite une ligne
  // « Note — Pas de réponse » qui ne veut rien dire.
  const issue = sens === "note" ? null : issueRaw;

  const note = body.note ? String(body.note).trim() : null;
  if (!note && !issue) {
    return NextResponse.json(
      { error: "Renseigner au moins une issue ou une note" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("lead_appels")
    .insert({
      lead_id: id,
      sens,
      issue,
      note,
      duree_min: body.duree_min != null && body.duree_min !== "" ? Number(body.duree_min) : null,
      auteur: body.auteur ? String(body.auteur) : null,
      prochain_rappel_at: (body.prochain_rappel_at as string) || null,
      occurred_at: (body.occurred_at as string) || new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Retombées sur le lead — `prochain_rappel_at` seulement si la clé est
  // présente (une valeur nulle explicite efface l'échéance, une clé absente la
  // laisse intacte), `statut_commercial` seulement si l'écran l'a fait varier.
  const patch: Record<string, unknown> = {};
  if ("prochain_rappel_at" in body) {
    patch.prochain_rappel_at = (body.prochain_rappel_at as string) || null;
  }
  if (body.statut_commercial) patch.statut_commercial = String(body.statut_commercial);

  if (Object.keys(patch).length > 0) {
    const { error: leadError } = await supabase.from("leads").update(patch).eq("id", id);
    if (leadError) return NextResponse.json({ error: leadError.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { appelId } = (await req.json()) as { appelId?: string };
  if (!appelId) return NextResponse.json({ error: "appelId requis" }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("lead_appels")
    .delete()
    .eq("id", appelId)
    .eq("lead_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
