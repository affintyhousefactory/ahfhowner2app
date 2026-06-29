# ACTIVE CONTEXT — Howner / ARKO

## Contexte actif
Site **multi-pages bi-produit** (ADR-021/022) : **Arko One** (20 m², 12 ex, 59 900 €) + **Arko Max** (40 m², 5 ex, 89 900 €). Front livré ; backend Phase 4 en attente ; lancement bloqué par le légal (ADR-015).

## Priorités actives
1. **`feat/admin-portal` — continuer Étapes 3-5** (carte lead, recalcul PLU, formulaire création lead, matching affectation + email T4, création mandataire, validation/suspension, Pappers MCP). Branche locale, pas encore pushée.
2. **Appliquer `20260629_admin_tables.sql`** sur preprod au merge dev, puis prod au merge main (ne pas appliquer manuellement avant).
3. **SPF/DKIM prod** — DNS au registrar howner.fr (bloqueur externe). ADR-026.
4. **DNS howner.fr** — configurer CNAME/A chez le registrar.
5. **Reconfigurer Arko Max** (perM2, options, terrasse, footprint, `reserved`) — données métier à fournir.
6. Faire valider par Albert : charte Affinity (ADR-002) + repositionnement bi-produit (ADR-022).

## Contraintes
- Ne pas mélanger les projets (ce projet ≠ AHF_WEB2 : pas de segments/Brevo/Smart Nano-Max/Villa Arko).
- Ne pas dupliquer l'état hors `00_INDEX/PROJECT_STATE.md`. `_RUNTIME` reste court, jamais backlog.
- Configurateur : **ne pas modifier la logique de calcul 3 couches** (ADR-005/020) ; montants par produit via `PRODUCTS[key].pricing`. Vidéos `useVisible` sauf Hero, 3D isolé `/viewer` (ADR-006).
- Marque (ADR-004/022) : termes interdits maintenus, « notre architecte intégrée », « Puigbo ». Wordmark ARKO retiré de l'accueil ; « Arko One »/« Arko Max » = noms produits.
- Secrets jamais dans Git (ADR-003).
