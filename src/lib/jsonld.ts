/* ============================================================
   JSON-LD (schema.org) — données structurées SEO (ADR-018 P1).
   Alimenté par site.ts (aucun texte dupliqué, conformité marque
   ADR-004 héritée). Logo Organization volontairement omis tant que
   la charte n'est pas figée (ADR-002). Prix Offer = miroir des prix
   déjà publics sur les pages produit.
   ============================================================ */
import {
  SITE_URL,
  BRAND,
  CONTACT,
  PHONE_HOURS_SPEC,
  FAQ,
  type Product,
} from "@/lib/site";

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
    // ADR-029 — vocabulaire : « maison » est proscrit, « module » imposé.
    description:
      "Modules compacts d'architecte livrés prêts à vivre, fabriqués au Pays-Basque.",
    email: "contact@affinityhousefactory.com",
    // Numéro au format E.164 — seul format que les moteurs composent
    // correctement (bouton « Appeler » du knowledge panel).
    telephone: CONTACT.phoneTel,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phoneTel,
      contactType: "sales",
      areaServed: "FR",
      availableLanguage: "French",
      hoursAvailable: PHONE_HOURS_SPEC.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: h.opens,
        closes: h.closes,
      })),
    },
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
    // ADR-029 — vocabulaire : « module » remplace « maison », accord au masculin.
    description: `${product.name} — module compact d'architecte de ${product.area}, livré prêt à vivre. ${product.series}, série limitée à ${product.total} exemplaires numérotés.`,
    category: "Module d'habitation",
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
