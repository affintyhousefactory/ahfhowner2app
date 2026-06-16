# ADR-001 — Stack Next.js 16 App Router + Tailwind v4 + TypeScript

- **Statut** : Accepté (livré)
- **Date** : 2026-06-16
- **Phase** : 1
- **Faisabilité** : ✅ Fait
- **Alerte Albert** : Non

## Contexte
Le site ARKO nécessite SSR/SSG, SEO, et une base évolutive vers un backend (Phase 4). Next.js 16.2.9 (App Router, Turbopack) est en place, avec React 19, Tailwind v4 (`@theme` dans `globals.css`, pas `@config`), TypeScript.

## Décision
Conserver Next.js 16 App Router comme socle. RSC par défaut, Client Components uniquement si nécessaire. Tailwind v4 via `@tailwindcss/postcss`. TypeScript strict.

## Faisabilité
- **Verdict** : ✅ Livré et validé (Lighthouse 100/100/100/100 desktop, LCP 0.8s, CLS 0).
- **Dépendances externes** : aucune.
- **Risques** : version Next « non standard » — lire `node_modules/next/dist/docs/` avant tout code (cf. AGENTS.md).

## Conséquences
Toute API Next (metadata, sitemap, route handlers) suit les conventions de fichiers de cette version. Voir ADR-018 (SEO) et les ADR Phase 4 (route handlers Stripe/Supabase).

## Sources
`package.json`, `PASSATION_RICHARD.md` (Phase 1), `AGENTS.md`.
