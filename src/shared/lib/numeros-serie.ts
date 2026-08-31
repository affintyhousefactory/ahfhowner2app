/**
 * Numéros de la série encore libres — une seule définition pour tout le site.
 *
 * ⚠ **Ce comptage sort désormais du tunnel public.** Il y vivait en fonction
 * privée de `/api/configurateur/reservation` ; le récapitulatif sectoriel
 * destiné aux investisseurs annonce lui aussi combien de numéros restent, et
 * deux définitions de « numéro pris » auraient fini par diverger — l'une
 * refusant un numéro que l'autre annonce libre dans un email. La rareté est un
 * argument commercial : elle se compte à un seul endroit.
 *
 * ⚠ **`null` veut dire « on ne sait pas », et ce n'est pas zéro.** Une base
 * injoignable qui renverrait 0 ferait annoncer une série épuisée à un prospect,
 * ou un numéro déjà pris à un acheteur. Les appelants tranchent ce qu'ils font
 * de l'ignorance — le tunnel ne propose rien, le récapitulatif refuse de partir.
 */

import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { SERIE_TOTAL } from "@/lib/site";

/**
 * Statuts où le numéro est réellement pris (ADR-035, ADR-031 §2).
 *
 * Une demande n'immobilise pas un numéro : seuls le versement encaissé et la
 * signature le font. C'est la règle du code — ⚠ `leads_slot_unique` la
 * contredit encore en base (ADR-035 § Amendement, point 3).
 */
export const STATUTS_CONFIRMES = ["paiement_reserve", "signe"];

/** Les numéros qu'aucun lead confirmé ne détient. `null` si la base n'a pas répondu. */
export async function numerosLibres(): Promise<number[] | null> {
  const tous = Array.from({ length: SERIE_TOTAL }, (_, i) => i + 1);
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("leads")
      .select("slot")
      .in("statut_commercial", STATUTS_CONFIRMES)
      .not("slot", "is", null);
    if (error) throw error;
    const pris = new Set((data ?? []).map((l) => l.slot as number));
    return tous.filter((n) => !pris.has(n));
  } catch {
    return null;
  }
}

/** Combien de numéros restent. `null` si la base n'a pas répondu. */
export async function compterNumerosLibres(): Promise<number | null> {
  const libres = await numerosLibres();
  return libres === null ? null : libres.length;
}
