import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase du navigateur — ADR-039.
 *
 * ⚠ Ce fichier utilisait `createClient` de `@supabase/supabase-js`, qui range
 * la session dans le `localStorage`. Un `localStorage` ne quitte jamais la
 * machine : le serveur ne voyait donc **aucune** session lors d'une navigation,
 * et ne pouvait pas refuser une page avant de la rendre. Les écrans admin
 * étaient servis à tout le monde, la seule barrière étant un `useEffect` qui
 * redirigeait l'affichage **après** que les données soient parties.
 *
 * `createBrowserClient` range la même session dans des **cookies**, qui
 * accompagnent chaque requête. C'est ce qui rend possible la garde du proxy et
 * les gardes serveur — voir `supabase-server.ts` et `src/proxy.ts`.
 *
 * Rien ne change pour l'utilisateur : même écran de connexion, mêmes
 * identifiants. Seules les sessions déjà ouvertes avant la bascule sont
 * perdues, puisqu'elles vivaient dans l'ancien emplacement.
 */
let _client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("[supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant");
    }
    _client = createBrowserClient(url, key);
  }
  return _client;
}
