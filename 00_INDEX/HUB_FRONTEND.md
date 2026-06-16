# HUB_FRONTEND — Howner / ARKO

## Rôle du HUB
Point d'entrée pour : UI, charte visuelle, performance/média, SEO, accessibilité.

## À lire en priorité
1. `DESIGN.md` — charte en vigueur (Affinity, ADR-002).
2. `src/app/globals.css` — tokens `@theme` (Tailwind v4).
3. `plans/seo-avancement.md` — tracker SEO (détail des lots).

## Documents clés
| Document | Contenu |
|---|---|
| `DESIGN.md` | Palette, typo, UI, mapping tokens |
| `src/components/site/*` | Composants page (Hero, Reservation, LandTool…) |
| `src/components/arko3d/*` | 3D — **`/viewer` only** |

## Décisions liées
| ADR | Sujet | Statut |
|---|---|---|
| 002 | Charte Affinity (`@theme`) | Accepté — valider Albert |
| 005 | Configurator/pricing verrouillé | Accepté (guardrail) |
| 006 | Guardrails perf & média | Accepté (guardrail) |
| 018 | Socle SEO | Proposé (Phase 1.5) |

## Guardrails
- Lighthouse 100 / LCP < 0.8s — ne pas régresser.
- Vidéos via `useVisible` (sauf Hero) ; bundle 3D isolé `/viewer`.
- **Ne pas toucher** `Configurator.tsx` / `config-store.tsx`.

## Risques
| Risque | Gravité |
|---|---|
| Régression LCP (auto-load vidéo / import 3D) | Haute |
| Charte non validée Albert | Moyenne |

## Questions ouvertes
Domaine prod (`howner.fr` ?) pour `metadataBase`/OG/canonical (ADR-018).
