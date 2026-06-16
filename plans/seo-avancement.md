# SEO — Avancement Howner / ARKO

> Tracker de suivi (jetable). Audit réalisé le 2026-06-15. Rien d'implémenté encore — audit seul.
> Stack : Next.js 16.2.9 (App Router, Turbopack). API metadata/sitemap/robots vérifiée dans `node_modules/next/dist/docs/` (file conventions OK pour cette version).

## État actuel (constaté)
- ✅ `app/layout.tsx` : `metadata` de base (title, description, OG title/desc, `metadataBase=https://howner.fr`, `keywords`, `robots:index/follow`), `viewport`, `lang="fr"`.
- ✅ Hiérarchie : 1 seul `<h1>` (Hero), `<h2>` cohérents partout.
- ✅ `next/image` + `alt` sur toutes les images.
- ❌ Aucun fichier SEO : pas de `sitemap`, `robots`, OG image, manifest, structured data.
- ⚠️ `metadataBase = howner.fr` → **confirmer le domaine réel avant prod** (Vercel non déployé).

---

## Lot P0 — quick wins SEO + fix ancrage (faible risque)
- [ ] `app/sitemap.ts` — home, exclure `/viewer`.
- [ ] `app/robots.ts` — `allow /`, `disallow /viewer`, lien sitemap.
- [ ] `app/opengraph-image.tsx` (ou image statique) + `openGraph.images` + `twitter.card`.
- [ ] `scroll-padding-top: 4.5rem` sur `html` (header fixe 66px masque le haut des sections ancrées). Alternative : `scroll-mt` sur chaque `section[id]`.
- [ ] `alternates.canonical` dans `layout`.

## Lot P1 — visibilité & structure
- [ ] JSON-LD : `Product`+`Offer` (prix `PRICING.base` 89 900 €, dispo `BRAND.total` 12 ex.), `Organization`, **`FAQPage`** (réutiliser `FAQ` de `src/lib/site.ts`).
- [ ] `/viewer` : `export const metadata = { robots: { index: false } }` (outil 3D « Phase 2 », contenu mince).
- [ ] Compléter `NAV` (`src/lib/site.ts`) : ajouter Prix (`#prix`), FAQ (`#faq`) — 13 sections, 4 liées seulement.
- [ ] Scrollspy (section active dans la nav).
- [ ] Lazy-load 3D hors Hero via `next/dynamic` (perf LCP/TBT → impact SEO Core Web Vitals).
- [ ] Audit Lenis : confirmer `prefers-reduced-motion`, offset ancres.

## Lot P2 — polish
- [ ] Skip-link, focus-trap + `Escape` sur menu mobile.
- [ ] `app/manifest.ts` + icônes PWA (aujourd'hui : `favicon.ico` seul).
- [ ] Twitter image dédiée.
- [ ] Trim poids fonts (Space Grotesk 4 poids + Inter + Space Mono 2 poids).
- [ ] Optimisation vidéo Hero LCP (poster prioritaire, vidéo différée).
- [ ] Reconsidérer h1 « ARKO » seul (value-prop en h2).

---

## Notes / décisions
- Ancres de nav toutes valides (pas de lien mort) : `#decouvrir #configurer #specs #terrain #reserver #top` existent.
- Sections présentes mais hors menu : `#prix #faq #confiance #avant-premiere #process #perimetre #revelation`.
- Domaine `howner.fr` à valider → conditionne `metadataBase`, `sitemap`, `canonical`, OG URLs.
- Réf : audit complet dans l'historique de session du 2026-06-15.
