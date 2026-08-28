/**
 * Numéro de téléphone cliquable — back-office.
 *
 * Un clic compose l'appel : l'extension « Allo — Click to Call » intercepte le
 * lien et fait sonner la ligne professionnelle ; sans elle, le système confie
 * `tel:` à ce qui est installé — application de bureau Allo, Teams, ou le
 * téléphone couplé. Sans rien du tout, le lien reste inerte mais le numéro
 * demeure lisible et copiable : le pire cas est l'état d'avant.
 *
 * ⚠ **Le `href` est nettoyé, l'affichage ne l'est pas.** `tel:` n'admet ni
 * espace ni point ; le conseiller, lui, lit mieux « 06 12 34 56 78 » que la
 * forme collée. Les deux formes coexistent donc, et c'est voulu — normaliser
 * l'affichage aurait rendu les numéros plus durs à dicter à voix haute.
 *
 * ⚠ **Aucun gestionnaire d'événement ici, et ce n'est pas un détail de style.**
 * Ce composant est rendu depuis `leads/[id]/page.tsx`, qui est un **Server
 * Component** : un `onClick` y fait échouer le rendu serveur entier. La première
 * version en portait un — un `stopPropagation` par précaution — et la fiche
 * tombait en « This page couldn't load » dès qu'un lead avait un numéro.
 *
 * La précaution était inutile : la ligne du tableau n'est pas cliquable, seul le
 * « Voir → » de sa dernière cellule l'est. Le jour où un numéro devra vivre dans
 * la carte du Kanban — dont le contenu est enveloppé d'un `<Link>` —, ce ne sera
 * pas un `stopPropagation` qu'il faudra, mais sortir le lien du `<Link>` : un
 * `<a>` dans un `<a>` est du HTML invalide.
 *
 * ⚠ On ne reformate pas le numéro stocké. La base mélange trois écritures
 * (E.164 majoritaire, national collé, national espacé) et les réécrire à
 * l'affichage masquerait cette hétérogénéité au lieu de la traiter — c'est un
 * sujet de saisie, pas de rendu.
 */

export function TelephoneLien({
  tel,
  className = "",
  /** Rendu quand le lead n'a pas de numéro. */
  vide = "—",
}: {
  tel: string | null | undefined;
  className?: string;
  vide?: string;
}) {
  const brut = (tel ?? "").trim();
  if (!brut) return <span className="text-white/20">{vide}</span>;

  /* `tel:` accepte les chiffres, `+`, `*`, `#` — rien d'autre. */
  const numero = brut.replace(/[^\d+*#]/g, "");
  if (!numero) return <span className="text-white/20">{vide}</span>;

  return (
    <a
      href={`tel:${numero}`}
      title={`Appeler ${brut}`}
      className={`underline decoration-dotted underline-offset-2 transition-colors hover:text-[#7469F4] ${className}`}
    >
      {brut}
    </a>
  );
}
