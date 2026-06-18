# ADR-025 — Page /rechercheterrain : recherche personnalisée de parcelles

- **Statut** : Accepté
- **Date** : 2026-06-18
- **Phase** : 1.5 / 4
- **Faisabilité** : ✅ Front livrable maintenant — Supabase insert actif Phase 4
- **Alerte Albert** : Non

## Contexte

L'onglet "Je cherche un terrain" de `/terrain` renvoyait vers un formulaire simplifié sans suite. Le service de recherche personnalisée de parcelles est un levier de conversion stratégique : capturer des leads qualifiés (budget + zones) pour livrer un rapport cadastral détaillé (parcelles, DVF, géorisques, cartes isochrones).

## Décision

### UX / flux
- Onglet "Je cherche un terrain" : texte reformulé (achat entre particuliers, sans agence, budget) + bouton redirige vers `/rechercheterrain`.
- Page `/rechercheterrain` : hero de promesse + formulaire multi-communes (max 5) + infos contact + CGV → soumission → Supabase → redirection `/contact`.

### Formulaire
- Zones de recherche : jusqu'à 5 entrées `{commune, cp}`, bouton `+` pour ajouter, `-` pour retirer.
- Contact : `nom`, `telephone`, `email` (obligatoires).
- Case CGV : obligatoire avant soumission.
- Validation client avant envoi.

### Supabase (Phase 4)
- Table : `recherche_terrain` (schéma dans `supabase/migrations/`).
- Soumission via route API `POST /api/recherche-terrain`.
- Sans env Supabase : fallback silencieux, redirect `/contact` quand même.
- RLS : insert public (anon) → seul service_role peut lire.

### Rapport livré au client
Carte Google Maps parcelles candidates (mode carte + satellite), récapitulatif (localisation, superficie, référence cadastrale, tarifs), DVF (5 dernières années : date, montant, superficie, lots), cartes de chaleur, isochrones géorisques, PEB.

## Faisabilité

- **Verdict** : ✅ Front complet sans dépendance backend. Insert Supabase activé dès Phase 4.
- **Dépendances** : `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Phase 4).
- **Risques** : sans RLS correcte, les leads seraient lisibles en anon → migration à appliquer avant mise en prod avec Supabase actif.

## Conséquences

- Ajouter la route `/rechercheterrain` au sitemap (ADR-018).
- Phase 4 : activer les env Supabase, appliquer la migration SQL.

## Sources

- `src/app/rechercheterrain/page.tsx`
- `src/components/site/RechercheTerrainForm.tsx`
- `src/app/api/recherche-terrain/route.ts`
- `supabase/migrations/20260618_recherche_terrain.sql`
- `ADR-007` — Supabase schémas + RLS
- `ADR-013` — Contact terrain → leads
