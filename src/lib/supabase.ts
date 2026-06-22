import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Initialisation paresseuse : le client n'est créé qu'au premier appel runtime,
// pas au module-load (évite le crash build quand les env vars ne sont pas encore injectées).
let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("[supabase] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
    }
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}
