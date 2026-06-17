# ACTIVE CONTEXT — Howner / ARKO

## Contexte actif
Site **multi-pages bi-produit** (ADR-021/022) : **Arko One** (20 m², 12 ex, 59 900 €) + **Arko Max** (40 m², 5 ex, 89 900 €). Front livré ; backend Phase 4 en attente ; lancement bloqué par le légal (ADR-015).

## Priorités actives
1. **Fournir les données Arko One** (perM2, options, terrasse, dimensions/footprint), `reserved` par produit, **asset vidéo One** (fallback footage Max pour l'instant).
2. Faire valider par Albert : repositionnement bi-produit + déverrouillage configurateur + retrait wordmark ARKO (ADR-022/020) ; charte Affinity (ADR-002).
3. SEO (ADR-018) — **P0+P1 livrés** (sitemap/robots/OG/twitter/canonical/noindex viewer + JSON-LD Org/Product/FAQ + `llms.txt`, domaine `affinityhome.fr` via `SITE_URL`). Reste **P2** (polish non bloquant). Pages légales mentions+confidentialité remplies (CGV bloqué ADR-015).
4. Débloquer Phase 4 : Supabase schémas (ADR-007), choix email (ADR-014).

## Contraintes
- Ne pas mélanger les projets (ce projet ≠ AHF_WEB2 : pas de segments/Brevo/Smart Nano-Max/Villa Arko).
- Ne pas dupliquer l'état hors `00_INDEX/PROJECT_STATE.md`. `_RUNTIME` reste court, jamais backlog.
- Configurateur : **ne pas modifier la logique de calcul 3 couches** (ADR-005/020) ; montants par produit via `PRODUCTS[key].pricing`. Vidéos `useVisible` sauf Hero, 3D isolé `/viewer` (ADR-006).
- Marque (ADR-004/022) : termes interdits maintenus, « notre architecte intégrée », « Puigbo ». Wordmark ARKO retiré de l'accueil ; « Arko One »/« Arko Max » = noms produits.
- Secrets jamais dans Git (ADR-003).
