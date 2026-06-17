/* ============================================================
   JSON-LD (schema.org) — données structurées SEO (ADR-018 P1).
   Alimenté par site.ts (aucun texte dupliqué, conformité marque
   ADR-004 héritée). Logo Organization volontairement omis tant que
   la charte n'est pas figée (ADR-002). Prix Offer = miroir des prix
   déjà publics sur les pages produit.
   ============================================================ */
import { SITE_URL, BRAND, FAQ, type Product } from "@/lib/site";

type JsonLdObject = Record<string, unknown>;

// Entité éditrice — rendue sitewide (layout). name = marque du site,
// legalName/adresse = structure juridique (cf. mentions légales).
export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.maker,
    legalName: "Affinity House Factory",
    url: SITE_URL,
    description:
      "Maisons compactes d'architecte livrées prêtes à vivre, fabriquées au Pays-Basque.",
    email: "contact@affinityhousefactory.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "28 Chemin de Sabalce OEV",
      postalCode: "64100",
      addressLocality: "Bayonne",
      addressCountry: "FR",
    },
    areaServed: "FR",
    founder: { "@type": "Person", name: "Puigbo" },
  };
}

// Produit + Offre — rendu sur chaque page produit (/arko-one, /arko-max).
export function productSchema(product: Product): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: `${product.name} — maison compacte d'architecte de ${product.area}, livrée prête à vivre. ${product.series}, série limitée à ${product.total} exemplaires numérotés.`,
    category: "Maison",
    brand: { "@type": "Brand", name: BRAND.maker },
    url: `${SITE_URL}${product.slug}`,
    offers: {
      "@type": "Offer",
      price: product.pricing.base,
      priceCurrency: "EUR",
      availability: "https://schema.org/LimitedAvailability",
      url: `${SITE_URL}${product.slug}`,
      seller: { "@type": "Organization", name: BRAND.maker },
    },
  };
}

// FAQ — rendu sur la home (où la section FAQ est visible).
export function faqSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
