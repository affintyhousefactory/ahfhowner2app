/* Ikurriña — drapeau du Pays-Basque, SVG inline (perf-safe, aucune dépendance).
   Couleurs officielles : rouge #D52B1E · vert #009B48 · blanc.
   Construction : fond rouge → sautoir vert (X) → croix blanche par-dessus (+). */
export function Ikurrina({
  className,
  title = "Drapeau du Pays-Basque",
  width = 18,
  height = 12,
}: {
  className?: string;
  title?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      role="img"
      aria-label={title}
      width={width}
      height={height}
      viewBox="0 0 30 20"
      className={className}
    >
      <title>{title}</title>
      {/* fond rouge */}
      <rect width="30" height="20" fill="#D52B1E" />
      {/* sautoir vert (X) */}
      <g stroke="#009B48" strokeWidth="6">
        <line x1="0" y1="0" x2="30" y2="20" />
        <line x1="30" y1="0" x2="0" y2="20" />
      </g>
      {/* croix blanche (+) */}
      <g stroke="#ffffff" strokeWidth="6">
        <line x1="15" y1="0" x2="15" y2="20" />
        <line x1="0" y1="10" x2="30" y2="10" />
      </g>
    </svg>
  );
}
