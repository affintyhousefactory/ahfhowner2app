import { SITE_URL, BRAND, PRODUCT_LIST } from "@/lib/site";

// /llms.txt — résumé du site pour les agents/LLM (ADR-018 P1). Statique,
// alimenté par site.ts (suit le domaine via SITE_URL). Conformité marque
// ADR-004 (aucun terme interdit).
export const dynamic = "force-static";

const eur = (n: number) => `${n.toLocaleString("fr-FR")} €`;

export function GET() {
  const products = PRODUCT_LIST.map(
    (p) =>
      `- [${p.name}](${SITE_URL}${p.slug}) — ${p.area}, à partir de ${eur(p.pricing.base)}, série limitée à ${p.total} exemplaires numérotés.`,
  ).join("\n");

  const body = `# ${BRAND.maker}

> ${BRAND.baseline}. ${BRAND.subline}

${BRAND.maker} conçoit et livre des maisons compactes d'architecte en série limitée, fabriquées au Pays-Basque. Chaque modèle est dessiné et suivi par notre architecte intégrée, livré prêt à vivre. Parcours utilisateur : découvrir un modèle, configurer un devis indicatif, vérifier la compatibilité d'un terrain, réserver un exemplaire numéroté avec un acompte remboursable.

## Modèles
${products}

## Pages clés
- [Configurer & réserver](${SITE_URL}/configurer) — configuration et réservation d'un exemplaire numéroté.
- [Votre terrain](${SITE_URL}/terrain) — vérification d'une adresse ou d'une annonce, estimation de livraison.
- [Contact](${SITE_URL}/contact) — questions et accompagnement projet.

## Informations légales
- [Mentions légales](${SITE_URL}/mentions-legales)
- [Politique de confidentialité](${SITE_URL}/confidentialite)

## Notes
- Éditeur : Affinity House Factory (Bayonne, France).
- Les prix affichés sont des prix de base indicatifs ; le devis final dépend de la configuration, de la livraison et des frais liés au terrain.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
