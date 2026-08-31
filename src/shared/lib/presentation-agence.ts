/**
 * Présentation partenaire — source unique des paramètres, comme
 * `recap-client.ts` l'est pour le récapitulatif (ADR-044 §3).
 *
 * ⚠ **L'aperçu et l'envoi consomment le même jeu.** Deux constructions pour un
 * même email, c'est un écran qui finit par montrer autre chose que ce qui part.
 * La leçon est celle d'ADR-035 ; elle vaut ici où l'email promet une commission.
 *
 * ⚠ **Le template 23, pas le 24.** Le 23 est transactionnel : il lit
 * `params.*`, il s'envoie à une agence nommée, après un appel. Le 24 est une
 * campagne — il lit `contact.AGENCE_OU_ENSEIGNE` et se lance depuis Brevo, sur
 * la liste entière. Les intervertir enverrait un email aux variables vides.
 */

import { PLAQUETTE, SITE_URL } from "@/lib/site";
import type { ParamsBrevo } from "@/shared/lib/brevo-render";

export const SELECT_PRESENTATION =
  "id, agence, prenom, nom, email, statut_partenariat, dernier_email_at";

export type AgentPresentation = {
  id: string;
  agence: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  statut_partenariat: string | null;
  dernier_email_at: string | null;
};

/** Le template et sa variable — lus à l'appel, jamais à l'import. */
export function templatePresentation(): { id: number; variable: string } {
  /* ⚠ Au niveau du module, cet identifiant arrivait vide en production
     (constat du 2026-08-25 sur les récapitulatifs). Il se lit donc ici.
     Aucun repli : un identifiant deviné enverrait le mauvais email à un
     partenaire, et une promesse de commission ne se reprend pas. */
  return {
    id: Number(process.env.BREVO_TEMPLATE_AGENCES ?? 0),
    variable: "BREVO_TEMPLATE_AGENCES",
  };
}

export function construireParamsPresentation(agent: AgentPresentation): ParamsBrevo {
  return {
    PRENOM: agent.prenom ?? "",
    NOM: agent.nom ?? "",
    /* Le template ouvre sur l'agence. Un repli neutre évite « Bonjour , » et,
       surtout, une ligne vide dans un email qui démarche une entreprise. */
    AGENCE: agent.agence?.trim() || "votre agence",

    /* ⚠ URL **absolue**. Un email n'a pas d'origine : `/documents/…` y serait un
       lien mort. La ligne vit sous `{% if params.PLAQUETTE_URL %}`, de sorte
       qu'une variable vidée fasse disparaître la ligne au lieu d'offrir un lien
       qui ne mène nulle part. */
    PLAQUETTE_URL: PLAQUETTE.url
      ? PLAQUETTE.url.startsWith("http")
        ? PLAQUETTE.url
        : `${SITE_URL}${PLAQUETTE.url}`
      : "",
    PLAQUETTE_LIBELLE: PLAQUETTE.url ? PLAQUETTE.libelle : "",
  };
}
