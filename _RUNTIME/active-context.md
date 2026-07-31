# ACTIVE CONTEXT — Howner / ARKO

## Contexte actif
> ⏸ **Domaine « Mandataire & Terrain » suspendu (ADR-028)** — livré et vérifié en prod le 2026-07-31. Portail mandataire, affectation admin, gestion des terrains et offre `/rechercheterrain` masqués derrière `FEATURES.mandataire` (variable `NEXT_PUBLIC_FEATURE_MANDATAIRE` **absente = suspendu** ; ne pas la créer sur Vercel).
> Coupure : `guardMandataire()` / `mandataireDisabled()` partout, **sauf les 4 écrans admin coupés dans `src/proxy.ts`** — leur layout parent est un composant client, `notFound()` seul n'y annule ni le statut ni le payload. Manœuvre : `docs/feature-flags.md`.
> Ne pas re-linker une surface suspendue sans lever le flag et amender ADR-028.

Site **multi-pages bi-produit** (ADR-021/022) : **Arko One** (20 m², 12 ex, 59 900 €) + **Arko Max** (40 m², 5 ex, 89 900 €). Front livré ; backend Phase 4 en attente ; lancement bloqué par le légal (ADR-015).

## Priorités actives
1. ~~**Migration `20260710_lead_client_documents.sql`** (GED Client, ADR-027)~~ ✅ appliquée Preview 2026-07-10 et **Prod 2026-07-13** — Preview/Prod alignés.
2. **CGV nouvelle version** (`f3de62fe`, mergée dans `dev` via PR #51) — en attente confirmation avocat avant prod (seul point encore bloquant d'ADR-015).
3. **Reconfigurer Arko Max** (perM2, options, terrasse, footprint, `reserved`) — données métier + grille tarifaire toujours en attente.
4. Faire valider par Albert : charte Affinity (ADR-002) + repositionnement bi-produit (ADR-022) + révision blocklist marque ADR-004 (2026-07-09). Suspension ADR-028 ✅ remontée verbalement le 2026-07-31.
5. ~~SPF/DKIM prod~~ ✅ corrigé manuellement (2026-07-10) — n'est plus un bloqueur.
6. **Test de réversibilité ADR-028** — poser `NEXT_PUBLIC_FEATURE_MANDATAIRE=true` sur une Preview et vérifier que tout revient. Seule preuve que la reprise fonctionne ; non exécuté à ce jour.

## Contraintes
- Ne pas mélanger les projets (ce projet ≠ AHF_WEB2 : pas de segments/Brevo/Smart Nano-Max/Villa Arko).
- Ne pas dupliquer l'état hors `00_INDEX/PROJECT_STATE.md`. `_RUNTIME` reste court, jamais backlog.
- Configurateur : **ne pas modifier la logique de calcul 3 couches** (ADR-005/020) ; montants par produit via `PRODUCTS[key].pricing`. Vidéos `useVisible` sauf Hero, 3D isolé `/viewer` (ADR-006).
- Marque (ADR-004/022) : termes interdits maintenus, « notre architecte intégrée », « Puigbo ». Wordmark ARKO retiré de l'accueil ; « Arko One »/« Arko Max » = noms produits.
- Secrets jamais dans Git (ADR-003).
