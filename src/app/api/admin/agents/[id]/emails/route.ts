/**
 * Historique Brevo d'une agence — ADR-044 §4.
 *
 * Lecture en direct, rien n'est stocké : Brevo est la source. Les colonnes
 * `dernier_email_*` de la fiche ne servent qu'à trier la liste, et se
 * rafraîchissent par un appel global (`/api/admin/agents/sync-emails`).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { historiqueEmails } from "@/shared/lib/brevo-emails";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;

  const { data } = await getSupabaseAdmin()
    .from("agents_immo")
    .select("email")
    .eq("id", id)
    .single();

  const adresse = (data as { email?: string } | null)?.email;
  if (!adresse) return NextResponse.json({ error: "Agence introuvable" }, { status: 404 });

  const resultat = await historiqueEmails(adresse);
  if ("error" in resultat) return NextResponse.json({ error: resultat.error }, { status: 502 });

  return NextResponse.json(resultat);
}
