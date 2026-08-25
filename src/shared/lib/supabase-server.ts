import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Identité côté serveur — ADR-039.
 *
 * Deux fonctions, une seule règle : **personne ne lit une donnée admin sans
 * avoir prouvé son identité au serveur**. Avant ADR-039, les pages et les
 * routes `/api/admin/*` interrogeaient Supabase avec la clé `service_role`,
 * qui contourne la RLS par construction, sans jamais regarder qui demandait.
 *
 * La session vit désormais dans un cookie (`supabase-browser.ts`), donc elle
 * accompagne la requête et se vérifie ici.
 *
 * ⚠ `getUser()` et non `getSession()` : le second se contente de relire le
 * cookie, que le navigateur contrôle ; le premier fait valider le jeton par
 * Supabase. Une garde qui croit un jeton sur parole ne garde rien.
 */

/** Client Supabase portant l'identité du visiteur (RLS appliquée). */
export async function getSupabaseServeur() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("[supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant");
  }

  const store = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (aPoser) => {
        /* Un composant serveur n'a pas le droit d'écrire un cookie : Next lève.
           Le rafraîchissement du jeton est fait par le proxy, qui, lui, en a le
           droit — d'où ce silence volontaire plutôt qu'un try/catch décoratif. */
        try {
          aPoser.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* appelé depuis un composant serveur : le proxy s'en charge */
        }
      },
    },
  });
}

/**
 * L'utilisateur courant, ou `null`.
 *
 * Ne lève jamais : une session absente est un cas normal (visiteur non
 * connecté), pas une panne.
 */
export async function utilisateurCourant() {
  try {
    const supabase = await getSupabaseServeur();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  } catch {
    return null;
  }
}

/** Vrai si la session courante porte le rôle admin. */
export async function estAdmin(): Promise<boolean> {
  const user = await utilisateurCourant();
  return user?.app_metadata?.role === "admin";
}

/**
 * Garde des routes `/api/admin/*`.
 *
 * Renvoie une réponse à retourner tel quel si l'accès est refusé, `null` si
 * l'appelant est bien administrateur. Le motif reprend celui de
 * `mandataireDisabled()` (ADR-028) : la garde produit la réponse, l'appelant se
 * contente de la relayer — impossible d'oublier le `return`.
 *
 *     const refus = await refuserSiPasAdmin();
 *     if (refus) return refus;
 */
export async function refuserSiPasAdmin(): Promise<NextResponse | null> {
  const user = await utilisateurCourant();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  return null;
}
