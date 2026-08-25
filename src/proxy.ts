import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { FEATURES } from "@/lib/features";

/**
 * Proxy (ex-Middleware, renommé en Next 16) — ADR-028 puis ADR-039.
 *
 * Pourquoi cette couche existe : les écrans admin sont imbriqués sous
 * `(admin)/admin/(protected)/layout.tsx`, qui est un composant **client**. Une
 * garde posée dans un layout serveur enfant n'aboutit pas : le shell client
 * commence à streamer, le statut 200 est figé, et le payload RSC de la page
 * part malgré tout — le contenu réel de l'écran se retrouve dans le HTML servi.
 *
 * Le proxy s'exécute **avant** tout rendu : il garantit le statut et empêche le
 * composant serveur de la page (et donc ses requêtes Supabase) de s'exécuter.
 *
 * Il porte désormais deux gardes distinctes :
 *
 * 1. **ADR-028** — les écrans du domaine « Mandataire & Terrain » suspendu
 *    répondent 404 tant que le flag est baissé.
 *
 * 2. **ADR-039** — tout `/admin/*` et tout `/api/admin/*` exigent une session
 *    portant le rôle admin. Avant cette garde, `/admin/leads` servait noms,
 *    emails et téléphones des prospects à qui les demandait, et 17 routes
 *    `/api/admin/*` sur 19 répondaient sans aucune vérification — constaté en
 *    production le 2026-08-25. La seule barrière était un `useEffect` qui
 *    redirigeait l'affichage une fois les données déjà envoyées.
 */

/** Écrans admin du domaine suspendu (ADR-028). */
const ADMIN_SUSPENDU = [
  "/admin/mandataires",
  "/admin/affectations",
  "/admin/ged",
  "/admin/terrains",
];

/** Surfaces d'authentification : accessibles sans session, par définition. */
const ADMIN_PUBLIC = ["/admin/auth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── ADR-028 — domaine suspendu ─────────────────────────────────── */
  if (!FEATURES.mandataire) {
    const suspendu = ADMIN_SUSPENDU.some(
      (base) => pathname === base || pathname.startsWith(`${base}/`),
    );
    if (suspendu) return new NextResponse(null, { status: 404 });
  }

  /* ── ADR-039 — authentification admin ───────────────────────────── */
  const estSurfaceAuth = ADMIN_PUBLIC.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
  if (estSurfaceAuth) return NextResponse.next();

  const protege = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!protege) return NextResponse.next();

  /* La réponse est créée d'abord : `createServerClient` y écrit les cookies
     rafraîchis. Un client construit sur une réponse qu'on jette ensuite
     déconnecte l'utilisateur au bout d'une heure, sans que rien ne le dise. */
  let reponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* Configuration absente : on refuse. Un défaut de configuration ne doit
     jamais ouvrir la porte — c'est la leçon de `templateId manquant`, où une
     variable vide avait rendu un envoi silencieux au lieu de bruyant. */
  if (!url || !key) {
    console.error("[proxy] variables Supabase absentes — accès admin refusé par défaut.");
    return refuser(request, pathname);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (aPoser) => {
        aPoser.forEach(({ name, value }) => request.cookies.set(name, value));
        reponse = NextResponse.next({ request });
        aPoser.forEach(({ name, value, options }) => reponse.cookies.set(name, value, options));
      },
    },
  });

  /* `getUser()` et non `getSession()` : le second relit le cookie que le
     navigateur contrôle, le premier fait valider le jeton par Supabase. */
  const { data, error } = await supabase.auth.getUser();
  const user = error ? null : data.user;

  if (!user || user.app_metadata?.role !== "admin") {
    return refuser(request, pathname);
  }

  return reponse;
}

/**
 * Refus.
 *
 * Une page renvoie vers l'écran de connexion — un humain doit pouvoir se
 * connecter. Une route d'API renvoie un 401 en JSON : rediriger un `fetch`
 * vers une page HTML produit une erreur d'analyse illisible côté écran.
 */
function refuser(request: NextRequest, pathname: string) {
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const cible = new URL("/admin/auth/signin", request.url);
  return NextResponse.redirect(cible);
}

export const config = {
  /* Strictement limité aux surfaces admin : ADR-006 interdit d'alourdir les
     pages publiques, qui tiennent Lighthouse 100 et un LCP sous 0,8 s. */
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
