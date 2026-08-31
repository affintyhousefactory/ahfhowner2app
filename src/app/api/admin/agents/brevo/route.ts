/**
 * Vivier Brevo — les contacts de la liste « Agents » pas encore suivis.
 *
 * La lecture vit dans `@/shared/lib/brevo-agents` : la page du vivier l'appelle
 * directement côté serveur, cette route sert le rafraîchissement sans
 * rechargement. Une seule implémentation, deux portes.
 */

import { NextResponse } from "next/server";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { lireVivierBrevo } from "@/shared/lib/brevo-agents";

export async function GET() {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const resultat = await lireVivierBrevo();
  if ("error" in resultat) {
    return NextResponse.json({ error: resultat.error }, { status: 502 });
  }
  return NextResponse.json(resultat);
}
