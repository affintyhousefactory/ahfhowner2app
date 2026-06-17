# HUB_FRONTEND — Howner / ARKO

## Rôle du HUB
Point d'entrée pour : UI, charte visuelle, performance/média, SEO, accessibilité.

## À lire en priorité
1. `DESIGN.md` — charte en vigueur (Affinity, ADR-002).
2. `src/app/globals.css` — tokens `@theme` (Tailwind v4).
3. `plans/seo-avancement.md` — tracker SEO (détail des lots).

## Architecture (multi-pages — ADR-021)
Routes App Router : `/` · `/arko-one` · `/arko-max` · `/configurer` · `/terrain` · `/contact` · `/cgv` · `/mentions-legales` · `/confidentialite` · `/viewer`. `Nav`/`Footer`/`ConfigProvider` dans `app/layout.tsx`. Nav type Tesla (méga-menu Produits). Un `h1` par page.

## Documents clés
| Document | Contenu |
|---|---|
| `DESIGN.md` | Palette, typo, UI, mapping tokens |
| `src/app/*/page.tsx` | Routes (pages produit, configurer, terrain, contact, légal) |
| `src/components/site/*` | Sections + `Nav`, `ProductHero`, `ProductsShowcase`, `ContactForm`, `LegalShell`, `ProductSync` |
| `src/components/arko3d/*` | 3D — **`/viewer` only** |

## Décisions liées
| ADR | Sujet | Statut |
|---|---|---|
| 002 | Charte Affinity (`@theme`) | Accepté — valider Albert |
| 005 | Configurator/pricing verrouillé | Accepté — **amendé par 020** |
| 006 | Guardrails perf & média | Accepté (guardrail) |
| 018 | Socle SEO | Proposé (Phase 1.5) |
| 020 | Configurateur multi-produit | Accepté |
| 021 | Multi-pages + nav Tesla | Accepté |

## Guardrails
- Lighthouse 100 / LCP < 0.8s — ne pas régresser (re-mesurer par page).
- Vidéos via `useVisible` (sauf Hero) ; bundle 3D isolé `/viewer`.
- Configurateur : **ne pas modifier la logique de calcul 3 couches** (ADR-005/020). Montants par produit via `PRODUCTS[key].pricing`.

## Risques
| Risque | Gravité |
|---|---|
| Régression LCP (auto-load vidéo / import 3D) | Haute |
| Charte non validée Albert | Moyenne |

## Questions ouvertes
Domaine prod (`howner.fr` ?) pour `metadataBase`/OG/canonical (ADR-018).
