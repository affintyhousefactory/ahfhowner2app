/**
 * État d'erreur d'un écran admin — le pendant visible de `signalerPanne`.
 *
 * Existe parce que « aucun lead » et « je n'ai pas pu lire les leads » sont
 * deux phrases différentes, et que le code n'en disait qu'une. Le 2026-08-18,
 * `/admin/leads` affichait une liste vide alors que la requête échouait en
 * `42703` : les colonnes du CRM n'existaient pas en production. Un conseiller
 * en aurait conclu qu'il n'y avait pas de demande.
 *
 * Volontairement bavard sur le message technique : l'écran est interne, et
 * c'est précisément le détail (`column "responsable" does not exist`) qui fait
 * gagner le diagnostic. Rien ici n'est vu d'un client.
 */
export function ErreurRequete({
  titre,
  message,
}: {
  /** Ce qui n'a pas pu être lu, en français d'utilisateur. */
  titre: string;
  /** Message brut renvoyé par la base — affiché tel quel, jamais reformulé. */
  message?: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-500/30 bg-red-500/[0.07] p-6"
    >
      <p className="text-sm font-semibold text-red-300">{titre}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        La requête a échoué — cet écran n&apos;affiche donc pas « rien », il
        n&apos;a pas pu lire. Ne pas en conclure que la donnée est absente.
      </p>
      {message ? (
        <pre className="mt-4 overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-xs text-red-200/80">
          {message}
        </pre>
      ) : null}
      <p className="mt-4 text-xs text-white/35">
        Causes fréquentes : base de production en pause, ou migration non
        appliquée sur cet environnement.
      </p>
    </div>
  );
}
