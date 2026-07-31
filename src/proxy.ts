import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FEATURES } from "@/lib/features";

/**
 * Proxy (ex-Middleware, renommé en Next 16) — ADR-028.
 *
 * Pourquoi cette couche existe : les écrans admin du domaine mandataire sont
 * imbriqués sous `(admin)/admin/(protected)/layout.tsx`, qui est un composant
 * **client**. Une garde `notFound()` posée dans un layout serveur enfant
 * n'aboutit pas : le shell client commence à streamer, le statut 200 est figé,
 * et le payload RSC de la page part malgré tout — le contenu réel de l'écran
 * se retrouve dans le HTML servi, sous la page 404.
 *
 * Le proxy s'exécute **avant** tout rendu : il garantit le statut 404 et
 * empêche le composant serveur de la page (et donc ses requêtes Supabase) de
 * s'exécuter. Les gardes `guardMandataire()` restent en place dans les pages
 * et layouts en défense en profondeur.
 *
 * Les surfaces publiques et le portail mandataire ne passent pas par ici :
 * leurs layouts serveur n'ont pas de parent client, `notFound()` y produit un
 * vrai 404 avec la page d'erreur stylée — vérifié en production.
 */
const ADMIN_SUSPENDU = [
  "/admin/mandataires",
  "/admin/affectations",
  "/admin/ged",
  "/admin/terrains",
];

export function proxy(request: NextRequest) {
  if (FEATURES.mandataire) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const suspendu = ADMIN_SUSPENDU.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );

  if (suspendu) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/mandataires/:path*",
    "/admin/affectations/:path*",
    "/admin/ged/:path*",
    "/admin/terrains/:path*",
  ],
};
