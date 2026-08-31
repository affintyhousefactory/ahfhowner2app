/**
 * Journal d'appels d'un agent partenaire — ADR-044 §8.
 *
 * Jumeau de `api/admin/leads/[id]/appels`, sur `agent_appels`. Le clonage est
 * assumé : rendre `lead_appels.lead_id` nullable et réécrire un trigger qui
 * tourne en production pour accueillir une seconde population aurait été un
 * mauvais échange (ADR-044 §8).
 *
 * `agents_immo.dernier_appel_at` et `derniere_issue` sont maintenus par trigger
 * et ne sont **jamais** écrits ici : deux écrivains sur la même valeur finissent
 * toujours par diverger. L'échéance courante de rappel, elle, appartient à la
 * fiche — la route l'y écrit quand l'appel en planifie une.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { STATUTS_PARTENARIAT } from "@/lib/agents";

const SENS = ["entrant", "sortant", "note"] as const;
const ISSUES = ["joint", "repondeur", "pas_de_reponse", "rappel_demande", "refus"] as const;
const STATUTS = STATUTS_PARTENARIAT.map((s) => s.id) as readonly string[];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("agent_appels")
    .select("*")
    .eq("agent_id", id)
    .order("occurred_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

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
  /* Une note n'a pas d'issue d'appel : la forcer à null évite une ligne
     « Note — Pas de réponse » qui ne veut rien dire. */
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
    .from("agent_appels")
    .insert({
      agent_id: id,
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

  /* Retombées sur la fiche — `prochain_rappel_at` seulement si la clé est
     présente (une valeur nulle explicite EFFACE l'échéance, une clé absente la
     laisse intacte), le statut seulement si l'écran l'a fait varier. */
  const patch: Record<string, unknown> = {};
  if ("prochain_rappel_at" in body) {
    patch.prochain_rappel_at = (body.prochain_rappel_at as string) || null;
  }
  if (body.statut_partenariat) {
    const statut = String(body.statut_partenariat);
    /* Même raison que dans le PATCH de la fiche : la base ne porte pas de CHECK
       sur ce champ, la contrainte doit donc vivre à chaque porte d'entrée. */
    if (!STATUTS.includes(statut)) {
      return NextResponse.json({ error: "Statut de partenariat inconnu." }, { status: 400 });
    }
    patch.statut_partenariat = statut;
  }

  if (Object.keys(patch).length > 0) {
    const { error: agentError } = await supabase.from("agents_immo").update(patch).eq("id", id);
    if (agentError) return NextResponse.json({ error: agentError.message }, { status: 500 });
  }

  /* ⚠ Le changement de statut passé par le journal ne remonte PAS chez Brevo,
     contrairement à celui du Kanban. Ce n'est pas un oubli : la remontée
     comprend une désinscription irréversible côté Brevo pour « Ne pas
     recontacter », et l'écran d'appel ne l'annonce pas. Un effet de bord de
     cette portée doit être déclenché là où il est expliqué — la fiche et le
     Kanban le confirment tous deux avant d'agir. */
  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const { appelId } = (await req.json()) as { appelId?: string };
  if (!appelId) return NextResponse.json({ error: "appelId requis" }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("agent_appels")
    .delete()
    .eq("id", appelId)
    /* Le second filtre n'est pas décoratif : sans lui, un `appelId` deviné
       supprimerait l'entrée d'une autre fiche. */
    .eq("agent_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
