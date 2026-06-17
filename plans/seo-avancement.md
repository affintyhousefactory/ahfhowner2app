# SEO — Avancement Howner / ARKO

> Tracker de suivi (jetable). Audit réalisé le 2026-06-15. Rien d'implémenté encore — audit seul.
> Stack : Next.js 16.2.9 (App Router, Turbopack). API metadata/sitemap/robots vérifiée dans `node_modules/next/dist/docs/` (file conventions OK pour cette version).

## État actuel (constaté)
- ✅ `app/layout.tsx` : `metadata` de base (title, description, OG title/desc, `metadataBase=SITE_URL` → `https://affinityhome.fr`, `keywords`, `robots:index/follow`, `twitter`, `canonical`), `viewport`, `lang="fr"`.
- ✅ Hiérarchie : 1 seul `<h1>` (Hero), `<h2>` cohérents partout.
- ✅ `next/image` + `alt` sur toutes les images.
- ❌ Aucun fichier SEO : pas de `sitemap`, `robots`, OG image, manifest, structured data.
- ⚠️ `metadataBase = howner.fr` → **confirmer le domaine réel avant prod** (Vercel non déployé).

---

## Lot P0 — quick wins SEO + fix ancrage (faible risque) ✅ LIVRÉ 2026-06-17
> Domaine de prod confirmé : **`affinityhome.fr`** (constante `SITE_URL` dans `src/lib/site.ts`, surchargeable par `NEXT_PUBLIC_SITE_URL`). `metadataBase` recâblé dessus.
- [x] `app/sitemap.ts` — 6 routes indexables (`/`, `/arko-one`, `/arko-max`, `/configurer`, `/terrain`, `/contact`) ; légal (noindex) + `/viewer` exclus.
- [x] `app/robots.ts` — `allow /`, `disallow /viewer`, `host` + lien sitemap.
- [x] `app/opengraph-image.tsx` — généré via `next/og` (1200×630, typographique, tokens charte) + `twitter.card = summary_large_image` (layout).
- [x] `alternates.canonical` — self-canonical par page (layout = `/`, chaque route pose le sien, légal inclus).
- [x] `/viewer` → `noindex, nofollow` via `app/viewer/layout.tsx` (page = client component, metadata impossible sur la page).
- [~] `scroll-padding-top` — sans objet en multi-pages (plus de longue page ancrée sous header fixe ; `/configurer` gère déjà l'offset). À réévaluer si retour d'ancres intra-page.

## Lot P1 — visibilité & structure ✅ LIVRÉ 2026-06-17
- [x] JSON-LD : `Product`+`Offer` (prix par produit, `LimitedAvailability`), `Organization` (sitewide, + adresse AHF/founder), **`FAQPage`** (home). Builders `src/lib/jsonld.ts`, composant `src/components/seo/JsonLd.tsx`. Logo Organization **omis** (charte non figée, ADR-002) ; prix exposé (déjà public).
- [x] `/llms.txt` — route handler `src/app/llms.txt/route.ts` (statique, suit `SITE_URL`).
- [x] Pages légales **mentions-legales** + **confidentialite** remplies (contenu réel mutualisé AHF), `index:true`, ajoutées au sitemap. `LegalShell` rendu conditionnel (`pending`/`updated`). CGV reste placeholder noindex (ADR-015).
- [x] `/viewer` noindex — déjà fait en P0.
- [~] Compléter `NAV` / Scrollspy — **sans objet** (nav Tesla multi-pages, plus de page-ancre unique).
- [~] Lazy-load 3D — déjà couvert (bundle `arko3d/*` isolé à `/viewer`, ADR-006).
- [ ] **Reste P1** : audit Lenis `prefers-reduced-motion` (vérifier `SmoothScroll.tsx`).

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
- Domaine confirmé **`affinityhome.fr`** (2026-06-17) → centralisé dans `SITE_URL` (`src/lib/site.ts`) : `metadataBase`, `sitemap`, `robots`, `canonical`, OG.
- Réf : audit complet dans l'historique de session du 2026-06-15.
