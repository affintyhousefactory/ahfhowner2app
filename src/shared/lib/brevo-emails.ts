/**
 * Ce que Brevo a envoyé, et ce qu'il en est advenu — ADR-044 §4.
 *
 * Deux routes de l'API, parce qu'aucune ne suffit seule (vérifié le 2026-08-31
 * sur les envois réels) :
 *
 * - `/v3/smtp/emails?email=` dit **ce qui est parti** : objet, date, template,
 *   identifiant de message. Elle exige au moins un filtre — `email`,
 *   `messageId` ou `templateId` — et refuse un appel nu.
 * - `/v3/smtp/statistics/events` dit **ce qui s'est passé** : `requests`,
 *   `delivered`, `opened`, `clicks`, rejets. Un message y porte plusieurs
 *   lignes ; c'est `messageId` qui les recoud.
 *
 * ⚠ `GET /v3/contacts/{email}` porte bien un champ `statistics`, mais il ne se
 * remplit qu'avec les **campagnes**. Il était vide le 2026-08-31, aucune n'ayant
 * jamais été envoyée. Il faudra y revenir quand la première partira sur la
 * liste 9 — l'historique transactionnel ci-dessous ne la verra pas.
 *
 * ⚠ **Rien n'est stocké ici.** La fiche lit en direct ; seules les colonnes
 * `dernier_email_*` sont dénormalisées, et par un appel global, pas un par
 * agence (167 appels pour afficher un tableau).
 */

import { etatEmailDominant, type EtatEmailId } from "@/lib/agents";
import { signalerPanne } from "@/shared/lib/panne";

const API = "https://api.brevo.com/v3";

export type EmailEnvoye = {
  messageId: string;
  uuid: string | null;
  sujet: string;
  date: string;
  templateId: number | null;
  /** État le plus fort observé — un rejet l'emporte sur un « envoyé ». */
  etat: EtatEmailId | null;
  /** Tous les événements, du plus récent au plus ancien. */
  evenements: { event: string; date: string }[];
};

type BrevoEvenement = {
  email: string;
  date: string;
  messageId: string;
  event: string;
  subject?: string;
  templateId?: number;
};

function entetes(apiKey: string) {
  return { "api-key": apiKey };
}

/**
 * Historique complet pour une adresse — l'onglet « Emails » de la fiche.
 *
 * Les deux appels partent ensemble : ils sont indépendants, et les enchaîner
 * doublerait l'attente pour rien.
 */
export async function historiqueEmails(
  email: string,
  limite = 50,
): Promise<{ emails: EmailEnvoye[] } | { error: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { error: "BREVO_API_KEY absente de cet environnement." };

  const adresse = encodeURIComponent(email);

  try {
    const [resEmails, resEvents] = await Promise.all([
      fetch(`${API}/smtp/emails?email=${adresse}&limit=${limite}`, {
        headers: entetes(apiKey),
        cache: "no-store",
      }),
      fetch(`${API}/smtp/statistics/events?email=${adresse}&limit=${limite * 6}`, {
        headers: entetes(apiKey),
        cache: "no-store",
      }),
    ]);

    if (!resEmails.ok) {
      const detail = await resEmails.text();
      signalerPanne("admin/agents/brevo", `smtp/emails ${resEmails.status}: ${detail}`);
      return { error: `Brevo a refusé la lecture des envois (${resEmails.status}).` };
    }

    const envois = ((await resEmails.json()) as {
      transactionalEmails?: {
        messageId: string;
        uuid?: string;
        subject?: string;
        date: string;
        templateId?: number;
      }[];
    }).transactionalEmails ?? [];

    /* Les événements sont facultatifs : sans eux on sait ce qui est parti, on
       ignore juste ce qu'il est devenu. Perdre l'état vaut mieux que perdre
       l'historique. */
    const evenements: BrevoEvenement[] = resEvents.ok
      ? ((await resEvents.json()) as { events?: BrevoEvenement[] }).events ?? []
      : [];

    const parMessage = new Map<string, BrevoEvenement[]>();
    for (const ev of evenements) {
      const liste = parMessage.get(ev.messageId);
      if (liste) liste.push(ev);
      else parMessage.set(ev.messageId, [ev]);
    }

    const emails: EmailEnvoye[] = envois.map((e) => {
      const evs = (parMessage.get(e.messageId) ?? []).sort((a, b) => b.date.localeCompare(a.date));
      return {
        messageId: e.messageId,
        uuid: e.uuid ?? null,
        sujet: e.subject ?? "(sans objet)",
        date: e.date,
        templateId: e.templateId ?? null,
        etat: etatEmailDominant(evs.map((x) => x.event)),
        evenements: evs.map((x) => ({ event: x.event, date: x.date })),
      };
    });

    return { emails };
  } catch (e) {
    signalerPanne("admin/agents/brevo", e);
    return { error: "Brevo est injoignable." };
  }
}

export type DernierEmail = {
  email: string;
  date: string;
  sujet: string;
  etat: EtatEmailId | null;
};

/**
 * Le dernier email de **chaque** adresse, en un seul appel — c'est ce qui rend
 * la colonne triable de la liste sans 167 requêtes.
 *
 * ⚠ On lit les événements globaux, pas les envois : `/smtp/emails` exige un
 * filtre et ne sait donc pas répondre « pour tout le monde ». Les événements,
 * eux, se paginent par date. On remonte `depuisJours` en arrière : au-delà, un
 * email si ancien n'informe plus une relance.
 *
 * ⚠ Le résultat couvre **les adresses qui ont reçu quelque chose**. Une agence
 * absente du retour n'a rien reçu dans la fenêtre — ce n'est pas la même chose
 * que « rien reçu jamais », et l'appelant ne doit pas effacer une valeur
 * existante sur cette base.
 */
export async function derniersEmailsParAdresse(
  depuisJours = 180,
): Promise<Map<string, DernierEmail> | { error: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { error: "BREVO_API_KEY absente de cet environnement." };

  const depuis = new Date(Date.now() - depuisJours * 86_400_000).toISOString().slice(0, 10);
  const fin = new Date().toISOString().slice(0, 10);

  const PAGE = 1000;
  const PAGES_MAX = 20;
  const evenements: BrevoEvenement[] = [];

  try {
    for (let page = 0; page < PAGES_MAX; page++) {
      const url =
        `${API}/smtp/statistics/events?limit=${PAGE}&offset=${page * PAGE}` +
        `&startDate=${depuis}&endDate=${fin}`;
      const res = await fetch(url, { headers: entetes(apiKey), cache: "no-store" });
      if (!res.ok) {
        signalerPanne("admin/agents/brevo", `events ${res.status}: ${await res.text()}`);
        if (evenements.length === 0) return { error: `Brevo a refusé la requête (${res.status}).` };
        break;
      }
      const lot = ((await res.json()) as { events?: BrevoEvenement[] }).events ?? [];
      evenements.push(...lot);
      if (lot.length < PAGE) break;
    }
  } catch (e) {
    signalerPanne("admin/agents/brevo", e);
    if (evenements.length === 0) return { error: "Brevo est injoignable." };
  }

  /* Regroupement par adresse puis par message : l'état retenu est celui du
     message le plus récent, tous ses événements confondus. Prendre l'événement
     le plus récent tout court aurait donné « ouvert » pour un vieux message
     rouvert hier, alors que le dernier envoi a rebondi. */
  const parAdresse = new Map<string, { date: string; sujet: string; messageId: string; events: string[] }>();

  for (const ev of evenements) {
    const adresse = (ev.email ?? "").toLowerCase();
    if (!adresse) continue;
    const courant = parAdresse.get(adresse);
    if (!courant || ev.date > courant.date) {
      /* Message plus récent : on repart de ses seuls événements. */
      if (!courant || ev.messageId !== courant.messageId) {
        parAdresse.set(adresse, {
          date: ev.date,
          sujet: ev.subject ?? "(sans objet)",
          messageId: ev.messageId,
          events: [ev.event],
        });
      } else {
        courant.date = ev.date;
        courant.events.push(ev.event);
      }
    } else if (courant.messageId === ev.messageId) {
      courant.events.push(ev.event);
    }
  }

  const resultat = new Map<string, DernierEmail>();
  for (const [adresse, v] of parAdresse) {
    resultat.set(adresse, {
      email: adresse,
      date: v.date,
      sujet: v.sujet,
      etat: etatEmailDominant(v.events),
    });
  }
  return resultat;
}
