/**
 * Glyphe Instagram — tracé officiel simplifié (cadre, objectif, témoin).
 *
 * Dessiné en SVG plutôt qu'importé en image : il se recolore avec le texte
 * (`currentColor`), reste net à toute taille et ne coûte aucune requête. La
 * règle « pas d'emoji comme icône » vaut ici comme ailleurs.
 */
export function Instagram({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
