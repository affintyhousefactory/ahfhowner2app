/* Injecte un bloc JSON-LD (schema.org) dans le <head>/arbre serveur.
   Composant serveur — aucun JS client (ADR-006). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
