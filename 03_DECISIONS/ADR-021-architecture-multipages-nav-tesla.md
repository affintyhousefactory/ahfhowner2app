# ADR-021 — Architecture multi-pages + navigation type Tesla

- **Statut** : Accepté
- **Date** : 2026-06-16
- **Phase** : 1
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte
Le site était une landing mono-page (sections 001–013 dans `app/page.tsx`). Le passage bi-produit + l'objectif SEO/SSR par page (et un parcours « Découvrir → Réserver » clair) imposent une vraie arborescence multi-pages. Le projet est **déjà** Next.js 16 App Router (ADR-001) : pas de migration de stack, simple ajout de routes.

## Décision
Découpage en routes App Router :
- `/` accueil refondu (marque + entrée vers les 2 modèles, compteur 12+5).
- `/arko-one`, `/arko-max` pages produit (scroll-zoom vidéo par produit).
- `/configurer` (configurateur + réservation), `/terrain` (LandTool).
- `/contact` (formulaire), `/cgv`, `/mentions-legales`, `/confidentialite`.

`Nav`, `Footer` et `ConfigProvider` remontent dans `app/layout.tsx` (partagés). **Navigation type Tesla** : lien « Produits » ouvrant un méga-menu survolant (2 cartes produit, CTA Découvrir → page produit, Réserver → `/configurer?produit=`), compteur cumulé « 12 + 5 » et bouton Réserver conservés. Méga-menu accessible (focus/clavier/Escape) ; accordéon mobile équivalent.

## Faisabilité
- **Verdict** : ✅ Élevée — réutilise les composants de section existants (déplacés, non réécrits).
- **Dépendances externes** : aucune.
- **Risques** : ancres `#…` historiques remplacées par des routes ; liens internes recâblés. Perf à re-mesurer par page (guardrail ADR-006).

## Conséquences
- Sections produit 40 m² (Discover/RevealScrub/Specs/Price/Included) rattachées à `/arko-max` ; Avant-première (ex-009) déplacée dans `/arko-one`.
- SEO Phase 1.5 (ADR-018) facilité : metadata + h1 par page.
- `StickyCta` reste sur l'accueil.

## Sources
`app/layout.tsx`, `app/*/page.tsx`, `Nav.tsx`, `Footer.tsx`, `ProductHero.tsx`, `ProductsShowcase.tsx`, ADR-001, ADR-018.
