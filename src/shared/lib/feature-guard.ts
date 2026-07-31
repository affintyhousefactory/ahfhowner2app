import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { FEATURES } from "@/lib/features";

/**
 * Garde de page / layout serveur — ADR-028.
 *
 * Rend un 404 tant que le domaine « Mandataire & Terrain » est suspendu.
 * À appeler en première instruction du composant, avant toute requête
 * Supabase : une page suspendue ne doit rien lire ni rien écrire.
 */
export function guardMandataire(): void {
  if (!FEATURES.mandataire) notFound();
}

/**
 * Garde de route API — ADR-028.
 *
 * Renvoie une réponse 404 si le domaine est suspendu, `null` sinon. À placer
 * en première ligne du handler, avant la lecture de la session ou du body :
 *
 * ```ts
 * export async function POST(req: NextRequest) {
 *   const off = mandataireDisabled();
 *   if (off) return off;
 *   …
 * }
 * ```
 *
 * 404 (et non 403) : côté client, une fonctionnalité suspendue doit être
 * indiscernable d'une fonctionnalité inexistante.
 */
export function mandataireDisabled(): NextResponse | null {
  if (FEATURES.mandataire) return null;
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
