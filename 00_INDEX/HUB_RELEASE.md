# HUB_RELEASE — Howner / ARKO

## Rôle du HUB
Point d'entrée pour : déploiement, QA, gates de mise en production.

## À lire en priorité
1. `00_INDEX/PROJECT_STATE.md` — blockers de lancement.
2. ADR-015 (gate légal), ADR-006 (gate perf).

## Documents clés
| Document | Contenu |
|---|---|
| `next.config.ts` | Config build |
| `plans/seo-avancement.md` | Checklist SEO pré-prod |

## Déploiement
- Hébergement **Vercel** ; preview deployments ; aucune clé dans Git ; build vérifié avant merge.
- MCP `vercel` (OAuth) configuré ; 0 projet déployé à ce jour.

## Gates de release
| Gate | Critère | ADR |
|---|---|---|
| Perf | Lighthouse 100 / LCP < 0.8s | 006 |
| Légal | CGV valides + régime acompte tranché | 015 🔴 |
| SEO | sitemap/robots/canonical/OG | 018 |
| Marque | grep blocklist OK | 004 |

## Risques
| Risque | Gravité |
|---|---|
| Lancement sans validation légale | Critique (ADR-015) |
| Régression perf au build | Haute |

## Questions ouvertes
Domaine prod + variables d'environnement Phase 4 à configurer sur Vercel.
