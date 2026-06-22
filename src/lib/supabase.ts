import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client service-role — serveur uniquement. Ne jamais importer côté client.
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
