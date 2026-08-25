/**
 * Signalement des pannes non bloquantes.
 *
 * ── Pourquoi ce fichier existe ──────────────────────────────────────────────
 *
 * Le 2026-08-18, la base de production était en pause depuis une date inconnue.
 * Personne ne l'a su, parce que trois surfaces mentaient chacune à sa manière :
 *
 *   - `/api/reservation` renvoyait `{ ok: true }` alors que l'insert avait
 *     échoué (« Non bloquant — l'email est envoyé même si le stockage
 *     échoue ») ;
 *   - `/api/contact` faisait de même ;
 *   - `/admin/leads` faisait `const { data } = await …` sans lire `error`,
 *     donc affichait « aucun lead » sur une requête en échec.
 *
 * Ce n'étaient pas trois bugs mais **un défaut de conception** : une panne
 * était traitée comme un non-événement. Les erreurs runtime Vercel sur 7 jours
 * en portaient la preuve — **aucune**, alors que tout était cassé.
 *
 * ── La règle ────────────────────────────────────────────────────────────────
 *
 * Une opération qui échoue sans bloquer doit laisser **trois** traces :
 *   1. un journal repérable (ici) ;
 *   2. une réponse qui ne prétend pas au succès de ce qui a échoué
 *      (`persisted: false`, et non `ok: true` tout court) ;
 *   3. un écran qui distingue « rien à afficher » de « je n'ai pas pu lire ».
 *
 * ── Pourquoi ne pas simplement lever l'erreur ───────────────────────────────
 *
 * Parce que le repli a du sens : si le stockage tombe, l'email Brevo part
 * quand même et AHF reçoit la demande. Lever ferait perdre le lead pour de
 * bon. Le défaut n'était pas de continuer — c'était de continuer **en
 * silence**.
 *
 * ── Pourquoi un préfixe, et pas un `console.error` nu ───────────────────────
 *
 * `console.error` n'ouvre **pas** de grappe d'erreurs côté Vercel : il finit
 * dans les journaux d'exécution, que personne ne relit. Un préfixe constant
 * les rend filtrables (`get_runtime_logs`, recherche `[PANNE]`), et surtout
 * repérables quand on les cherche enfin.
 *
 * ── Limite connue, à lever ──────────────────────────────────────────────────
 *
 * Le canal qu'un humain lit vraiment, c'est l'email de notification AHF. On
 * ne peut pas y porter l'alerte aujourd'hui : `sendBrevoTemplate` envoie **un
 * seul** message, avec les **mêmes paramètres**, au client *et* à AHF — un
 * avertissement y serait donc affiché au client. Le porter proprement demande
 * un paramètre dédié (`ALERTE_STOCKAGE`) ajouté au template dans le tableau de
 * bord Brevo, puis une ligne ici. Tant que le paramètre n'existe pas côté
 * Brevo, l'envoyer ne produirait rien — d'où l'abstention plutôt qu'une
 * fausse sécurité.
 */

/** Contexte d'appel — sert de préfixe de recherche dans les journaux. */
export type SourcePanne =
  | "reservation/supabase"
  | "contact/supabase"
  | "contact/brevo"
  | "admin/leads"
  | "admin/dashboard"
  /* Soumission du configurateur v2 — ADR-031. Le type est fermé à dessein :
     une source non déclarée ne compile pas, ce qui empêche un journal de
     panne d'apparaître sous un nom improvisé et de devenir infiltrable. */
  | "configurateur/reservation/supabase"
  | "configurateur/reservation/brevo"
  | "configurateur/reservation/brevo-contact"
  | "configurateur/reservation/numeros-libres"
  | "configurateur/reservation/total-divergent"
  /* Tunnel v1 (`/api/reservation`) — ses deux appels Brevo étaient nus ou
     rendus muets par un `console.error`. Déclarés ici pour qu'ils remontent
     comme les autres. Le v1 disparaîtra avec la bascule sur `/configurer`. */
  | "reservation/brevo"
  | "reservation/brevo-contact";

/**
 * Journalise une panne non bloquante de façon repérable.
 *
 * Ne lève jamais : appelée depuis un `catch`, elle ne doit pas transformer une
 * panne rattrapée en panne fatale.
 */
export function signalerPanne(source: SourcePanne, detail: unknown): void {
  const message =
    detail instanceof Error
      ? detail.message
      : typeof detail === "string"
        ? detail
        : JSON.stringify(detail);

  console.error(`[PANNE][${source}] ${message}`);
}
