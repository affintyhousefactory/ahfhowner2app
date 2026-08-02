# HUB_FRONTEND — Howner / ARKO

## Rôle du HUB
Point d'entrée pour : UI, charte visuelle, performance/média, SEO, accessibilité.

## À lire en priorité
1. `DESIGN.md` — charte en vigueur (Affinity, ADR-002).
2. `src/app/globals.css` — tokens `@theme` (Tailwind v4).
3. `plans/seo-avancement.md` — tracker SEO (détail des lots).

## Architecture (multi-pages — ADR-021)
Routes App Router : `/` · `/arko-one` · `/arko-max` · `/configurer` · `/configurer/v2` · `/terrain` · `/contact` · `/cgv` · `/mentions-legales` · `/confidentialite` · `/viewer`. `Nav`/`Footer`/`ConfigProvider` dans le layout du groupe `(public)`. Nav type Tesla (méga-menu Produits). Un `h1` par page.

**Deux coques distinctes** (ADR-030) : `(public)` porte la navigation complète ; **`(configurateur)` sert `/configurer/v2` sans nav ni pied de page** — une seule porte de sortie, le logo. Un groupe de routes est nécessaire ici : une mise en page imbriquée s'ajoute à sa parente, elle ne peut pas en retirer la `<Nav>`. Toute nouvelle surface de tunnel naît dans `(configurateur)`.

## Documents clés
| Document | Contenu |
|---|---|
| `DESIGN.md` | Palette, typo, UI, mapping tokens |
| `src/app/*/page.tsx` | Routes (pages produit, configurer, terrain, contact, légal) |
| `src/components/site/*` | Sections + `Nav`, `ProductHero`, `ProductsShowcase`, `ContactForm`, `LegalShell`, `ProductSync` |
| `src/components/configurateur/*` | **Configurateur v2** — `Configurateur` (assemblage), `sections`, `ui` (`Section`/`Choix`/`Scene`/`BarrePrix`), `store` |
| `src/lib/configurateur/*` | Grilles (`config`), textes de mentions (`mentions`), numéros de série (`numeros`) |
| `src/components/arko3d/*` | 3D — **`/viewer` only** |

## Décisions liées
| ADR | Sujet | Statut |
|---|---|---|
| 002 | Charte Affinity (`@theme`) | Accepté — valider Albert |
| 005 | Configurator/pricing verrouillé | **Remplacé → 030** |
| 006 | Guardrails perf & média | Accepté (guardrail) |
| 018 | Socle SEO | Proposé (Phase 1.5) |
| 020 | Configurateur multi-produit | **Remplacé → 030** |
| 021 | Multi-pages + nav Tesla | Accepté |
| 029 | Vocabulaire de marque | Accepté — `npm run check:vocabulaire` avant chaque PR |
| 030 | Configurateur v2 (colonne de sections, coque dédiée) | Accepté — livré sur `/configurer/v2` |

## Guardrails
- Lighthouse 100 / LCP < 0.8s — ne pas régresser (re-mesurer par page).
- Vidéos via `useVisible` (sauf Hero) ; bundle 3D isolé `/viewer`.
- Configurateur v2 : **ne jamais coder les grilles en dur** (ADR-030) — prix, paliers, options, visuels et teintes d'ambiance passent tous par `src/lib/configurateur/config.ts`, jamais par un composant. Le verrou ADR-005 est levé, celui-ci le remplace.
- Configurateur v1 (`Configurator.tsx`, `config-store.tsx`) : sert encore `/configurer`, à retirer à la bascule (ADR-031). Montants par produit via `PRODUCTS[key].pricing`.
- **Pas de test local** : le HMR Turbopack ne voit pas `/mnt/d` et `next build` local est trop lent. Gate = `tsc --noEmit` + `eslint` + `npm run check:vocabulaire`, puis Preview Vercel.

## Risques
| Risque | Gravité |
|---|---|
| Régression LCP (auto-load vidéo / import 3D) | Haute |
| Erreurs visibles au seul prerender de production (pas de `next build` local) — ex. bailout `useSearchParams`, 2026-08-02 | Moyenne |
| Charte non validée Albert | Moyenne |

## Questions ouvertes
Domaine prod (`howner.fr` ?) pour `metadataBase`/OG/canonical (ADR-018).
