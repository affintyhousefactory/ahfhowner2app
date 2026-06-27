# ACTIVE CONTEXT — Howner / ARKO

## Contexte actif
Site **multi-pages bi-produit** (ADR-021/022) : **Arko One** (20 m², 12 ex, 59 900 €) + **Arko Max** (40 m², 5 ex, 89 900 €). Front livré ; backend Phase 4 en attente ; lancement bloqué par le légal (ADR-015).

## Priorités actives
1. **Merger `feat/terrain-address-lookup`** — PR prête ; valider d'abord le build Preview Vercel (env vars Supabase scope Preview à configurer : SUPABASE_URL + ANON_KEY + SERVICE_ROLE_KEY → projet preprod).
2. **Appliquer migrations SQL** sur Supabase preprod puis prod : `20260622_leads.sql`, `20260622_config_tarifs.sql` (+ `20260620_contacts.sql` ADR-026). Option : automatiser via GitHub Actions `supabase db push` (question non tranchée).
3. **DNS howner.fr** — configurer CNAME/A chez le registrar (Settings → Domains Vercel) pour tester en conditions réelles.
4. **Reconfigurer Arko Max** (perM2, options, terrasse, footprint, `reserved`) — données métier à fournir. ⚠️ `TODO` sur `ONE_PRICING` dans `site.ts` → corriger en `MAX_PRICING` dès réception.
5. Faire valider par Albert : repositionnement bi-produit + wordmark ARKO (ADR-022) ; charte Affinity (ADR-002).
6. **ADR-026 reste** : `PackTerrainContactForm` submit câblé, SPF/DKIM prod.

## Contraintes
- Ne pas mélanger les projets (ce projet ≠ AHF_WEB2 : pas de segments/Brevo/Smart Nano-Max/Villa Arko).
- Ne pas dupliquer l'état hors `00_INDEX/PROJECT_STATE.md`. `_RUNTIME` reste court, jamais backlog.
- Configurateur : **ne pas modifier la logique de calcul 3 couches** (ADR-005/020) ; montants par produit via `PRODUCTS[key].pricing`. Vidéos `useVisible` sauf Hero, 3D isolé `/viewer` (ADR-006).
- Marque (ADR-004/022) : termes interdits maintenus, « notre architecte intégrée », « Puigbo ». Wordmark ARKO retiré de l'accueil ; « Arko One »/« Arko Max » = noms produits.
- Secrets jamais dans Git (ADR-003).
