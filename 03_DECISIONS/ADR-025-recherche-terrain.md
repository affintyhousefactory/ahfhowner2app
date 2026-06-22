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

## Amendements (2026-06-20)

### Intégration Configurateur
- Champs de zone (villes / zones / département) injectés dans `Configurator.tsx > Devis` quand "Pack Terrain Affinity" est sélectionné — sans champs contact (nom/tel/email retirés, récupérés lors de la réservation).
- Case CGV déplacée juste avant le bouton "Réserver" (toujours visible, indépendante du mode terrain).
- Section "À prévoir" renommée **"Frais complémentaires Hors proposition (hors total)"** avec estimations mises à jour (G2 dès 2 400 €, micro-station dès 9 000 €, ENEDIS, selon commune).
- API `POST /api/recherche-terrain` : champ `source` ajouté (`"rechercheterrain"` | `"configurateur"`).
- Migration `supabase/migrations/20260620_recherche_terrain_source.sql` : colonne `source text DEFAULT 'rechercheterrain'`.

### Placeholders zone
- Essentiel → "Lyon, Bordeaux, Nantes, Rennes, Montpellier"
- Étendu → "Bretagne, Auvergne-Rhône-Alpes, Grand Est"
- Département → "69 — Rhône, 33 — Gironde, 44 — Loire-Atlantique"

## Sources

- `src/app/rechercheterrain/page.tsx`
- `src/components/site/RechercheTerrainForm.tsx`
- `src/components/site/Configurator.tsx` (intégration pack terrain)
- `src/app/api/recherche-terrain/route.ts`
- `supabase/migrations/20260618_recherche_terrain.sql`
- `supabase/migrations/20260619_recherche_terrain_modele_budget.sql`
- `supabase/migrations/20260620_recherche_terrain_source.sql`
- `ADR-007` — Supabase schémas + RLS
- `ADR-013` — Contact terrain → leads
