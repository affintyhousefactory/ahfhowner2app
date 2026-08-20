/* ============================================================
   JSON-LD (schema.org) — données structurées SEO (ADR-018 P1).
   Alimenté par site.ts (aucun texte dupliqué, conformité marque
   ADR-004 héritée). Logo Organization volontairement omis tant que
   la charte n'est pas figée (ADR-002). Prix Offer = miroir des prix
   déjà publics sur les pages produit.
   ============================================================ */
import {
  SITE_URL,
  ABOUT,
  BRAND,
  COMPANY,
  CONTACT,
  PHONE_HOURS_SPEC,
  FAQ,
  type Product,
} from "@/lib/site";
import type { PageEditoriale } from "@/lib/pages/registry";

type JsonLdObject = Record<string, unknown>;

// Entité éditrice — rendue sitewide (layout). name = marque du site,
// legalName/adresse = structure juridique (cf. mentions légales).
export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.maker,
    // Dérivés de `COMPANY` (site.ts) depuis le 2026-08-17 : le pied de page
    // affiche désormais le même bloc NAP, et deux copies auraient divergé.
    legalName: COMPANY.legalName,
    url: SITE_URL,
    // ADR-029 amendée le 2026-08-19 — « studio de jardin » remplace « maison ».
    description:
      "Studios de jardin d'exception livrés prêts à vivre, fabriqués au Pays-Basque.",
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
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressCountry: COMPANY.countryCode,
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
    // ADR-029 amendée — « studio de jardin » remplace « maison », accord au masculin.
    description: `${product.name} — studio de jardin d'architecte de ${product.area}, livré prêt à vivre. ${product.series}, série limitée à ${product.total} exemplaires numérotés.`,
    category: "Studio de jardin",
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

/* À propos — rendu sur /a-propos. `AboutPage` plutôt que `Organization` : le
   layout public émet déjà l'Organization sitewide, la dupliquer ici enverrait
   deux entités concurrentes pour la même marque. `mainEntityOfPage` rattache la
   page à cette Organization sans la redéclarer.
   Aucun partenaire n'y est nommé — ADR-029 §67 vaut aussi pour les données
   structurées, qui sont servies au même titre que le texte visible. */
export function aboutPageSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `${ABOUT.kicker} — ${BRAND.maker}`,
    url: `${SITE_URL}/a-propos`,
    description: ABOUT.quote,
    inLanguage: "fr-FR",
    mainEntity: { "@type": "Organization", name: BRAND.maker, url: SITE_URL },
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

/* ============================================================
   Pages éditoriales — ADR-038.
   Les trois schémas ci-dessous accompagnent le chantier « PagesSite_SEO ».
   Ils prennent leurs données du registre (`src/lib/pages/registry.ts`), donc
   un titre ne s'écrit jamais deux fois : ce qu'affiche la page et ce que lit
   un moteur sortent de la même ligne.
   ============================================================ */

/**
 * Fil d'Ariane — `BreadcrumbList`.
 *
 * Attendu par la spec sur **toutes** les pages du chantier. `position` est
 * 1-indexé et l'ordre compte : c'est lui qui dessine le chemin affiché sous le
 * résultat de recherche. Le dernier élément porte quand même son `item` :
 * l'omettre est toléré, mais le garder évite un fil tronqué chez les moteurs
 * qui le suivent jusqu'au bout.
 */
export function breadcrumbSchema(
  fil: readonly { nom: string; route: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fil.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.nom,
      item: `${SITE_URL}${e.route}`,
    })),
  };
}

/**
 * Article de guide — `Article`.
 *
 * ⚠ Pas de `FAQPage` ici, même quand la spec en suggère une : ce schéma ne se
 * pose que si les questions et réponses sont **réellement visibles** sur la
 * page (règle rappelée par le hub, et pratique en vigueur côté moteurs). Il
 * sera ajouté page par page, à la vue du rendu, jamais par défaut.
 *
 * `publisher` reste une simple référence à l'Organization émise sitewide par
 * le layout `(public)` — la redéclarer enverrait deux entités concurrentes
 * pour la même marque (même motif qu'`aboutPageSchema`).
 */
export function articleSchema(
  page: PageEditoriale,
  options: { publieLe: string; modifieLe?: string },
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.resume,
    url: `${SITE_URL}${page.route}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${page.route}` },
    inLanguage: "fr-FR",
    datePublished: options.publieLe,
    dateModified: options.modifieLe ?? options.publieLe,
    author: { "@type": "Organization", name: BRAND.maker, url: SITE_URL },
    publisher: { "@type": "Organization", name: BRAND.maker, url: SITE_URL },
  };
}

/**
 * Hub `/guide` — `CollectionPage` portant la liste de ses articles.
 *
 * `CollectionPage` plutôt qu'un `ItemList` nu : le hub **est** une page, pas
 * seulement une liste. L'`ItemList` vit à l'intérieur, ce qui dit à la fois ce
 * qu'est la page et ce qu'elle rassemble.
 */
export function guidesHubSchema(
  hub: PageEditoriale,
  articles: readonly PageEditoriale[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.h1,
    description: hub.resume,
    url: `${SITE_URL}${hub.route}`,
    inLanguage: "fr-FR",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.h1,
        url: `${SITE_URL}${a.route}`,
      })),
    },
  };
}
