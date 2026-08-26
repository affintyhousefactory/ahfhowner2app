/**
 * Rendu local d'un template Brevo — le même moteur que `scripts/apercu-email.mjs`,
 * porté en TypeScript pour servir l'aperçu du back-office.
 *
 * ⚠ **Ce module ne sert qu'à montrer, jamais à envoyer.** L'envoi reste fait par
 * Brevo à partir de son propre template : ce rendu-ci est une reconstitution,
 * et une reconstitution peut diverger. C'est précisément pourquoi l'aperçu et
 * l'envoi consomment le **même** jeu de paramètres, construit une seule fois par
 * `construireParamsRecap()` — si les deux divergent un jour, ce sera sur la mise
 * en forme, jamais sur les valeurs annoncées au client.
 *
 * Il ne couvre que les deux constructions Jinja qu'emploient nos templates :
 * `{{ params.X }}` et `{% if params.X %}…{% endif %}`, imbrications comprises.
 * Un moteur Jinja complet serait une dépendance de plus pour relire un email.
 */

export type ParamsBrevo = Record<string, string | number | null | undefined>;

/** Rend les `{% if %}` par une pile, pour supporter l'imbrication. */
function rendreConditions(html: string, params: ParamsBrevo): string {
  const jetons = html.split(/(\{%\s*if\s+params\.[A-Za-z_0-9]+\s*%\}|\{%\s*endif\s*%\})/);
  const pile: { texte: string; garde: boolean }[] = [{ texte: "", garde: true }];

  for (const jeton of jetons) {
    const ouvre = jeton.match(/^\{%\s*if\s+params\.([A-Za-z_0-9]+)\s*%\}$/);
    if (ouvre) {
      pile.push({ texte: "", garde: Boolean(params[ouvre[1]]) });
      continue;
    }
    if (/^\{%\s*endif\s*%\}$/.test(jeton)) {
      const bloc = pile.pop();
      if (!bloc) throw new Error("[brevo-render] `endif` sans `if`");
      pile[pile.length - 1].texte += bloc.garde ? bloc.texte : "";
      continue;
    }
    pile[pile.length - 1].texte += jeton;
  }

  if (pile.length !== 1) throw new Error("[brevo-render] `if` non fermé");
  return pile[0].texte;
}

/**
 * Rend un template Brevo avec un jeu de paramètres.
 *
 * Les deux tags de pied de page (`unsubscribe`, `update_profile`) ne sont
 * résolus que par Brevo, au moment de l'envoi : ici ils deviennent inertes.
 * Les neutraliser plutôt que de les laisser tels quels évite qu'un conseiller
 * clique dessus depuis l'aperçu et se croie face à un lien mort — ils sont
 * vivants dans l'email réel, c'est l'aperçu qui ne peut pas les fabriquer.
 */
export function rendreTemplateBrevo(html: string, params: ParamsBrevo): string {
  return rendreConditions(html, params)
    .replace(/\{\{\s*params\.([A-Za-z_0-9]+)\s*\}\}/g, (_, cle: string) => {
      const v = params[cle];
      return v == null ? "" : String(v);
    })
    .replace(/\{\{\s*(unsubscribe|unsubscribe_link|update_profile)\s*\}\}/g, "#");
}
