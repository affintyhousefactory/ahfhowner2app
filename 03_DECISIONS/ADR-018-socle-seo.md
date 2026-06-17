# ADR-018 — Socle SEO (sitemap / robots / OG / JSON-LD)

- **Statut** : Accepté — **P0 livré** (2026-06-17, build vert) ; P1/P2 restants
- **Date** : 2026-06-16 (P0 livré 2026-06-17)
- **Phase** : 1.5
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte
Audit SEO réalisé le 2026-06-15 (`plans/seo-avancement.md`) : le site n'a **aucun** fichier SEO (pas de sitemap, robots, OG image, structured data) ni `canonical`. Métadonnées de base présentes dans `layout.tsx`. Cassure de nav (ancres sous header fixe).

## Décision
Implémenter le socle SEO selon les conventions de fichiers Next 16 (vérifiées dans `node_modules/next/dist/docs/`), priorisé en lots :
- **P0** : `app/sitemap.ts`, `app/robots.ts` (disallow `/viewer`), OG image + `twitter.card`, `scroll-padding-top`, `canonical`.
- **P1** : JSON-LD (`Product`+`Offer`, `Organization`, `FAQPage`), `noindex` sur `/viewer`, compléter `NAV`.
- **P2** : skip-link, manifest/PWA, trim fonts, optimisation vidéo Hero.

## Faisabilité
- **Verdict** : ✅ Élevée — API Next 16 confirmée, contenu disponible (`site.ts` FAQ/PRICING/BRAND).
- **Dépendances externes** : domaine réel à confirmer (`howner.fr` vs autre) pour `metadataBase`/canonical/OG.
- **Risques** : respecter la blocklist marque (ADR-004) dans tout texte SEO ; ne pas régresser la perf (ADR-006).

## Conséquences
Reprend et exécute `plans/seo-avancement.md` (qui reste le tracker détaillé jetable).

**P0 livré (2026-06-17)** : `app/sitemap.ts`, `app/robots.ts` (disallow `/viewer`), `app/opengraph-image.tsx` (next/og), `app/viewer/layout.tsx` (noindex), twitter card + canonical par page. **Domaine de prod = `affinityhome.fr`** (centralisé `SITE_URL` dans `src/lib/site.ts`, override `NEXT_PUBLIC_SITE_URL`) — décision actée, remplace `howner.fr`. Build `next build` vert (16 routes). Reste P1 (JSON-LD + `llms.txt`) et P2 (manifest/PWA, skip-link, fonts).

## Sources
`plans/seo-avancement.md`, `src/app/layout.tsx`, audit du 2026-06-15.
