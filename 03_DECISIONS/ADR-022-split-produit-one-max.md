# ADR-022 — Split produit Arko One / Arko Max + repositionnement

- **Statut** : Accepté — **à valider Albert**
- **Date** : 2026-06-16
- **Phase** : 1
- **Faisabilité** : 🟠 Moyenne (données Arko Max à reconfigurer)
- **Alerte Albert** : **Oui — changement de positionnement (mono → bi-produit), prix cible, retrait wordmark ARKO (touche ADR-004)**

## Contexte
Le PASSATION décrivait un produit unique ARKO (40 m², 12 ex, 89 900 €). La direction passe à **deux modèles** : Arko One (20 m²) et Arko Max (40 m²). Cela modifie le positionnement, la grille de prix et l'usage du nom « ARKO » en page d'accueil.

## Décision
- **Deux produits** dans un registre `PRODUCTS` (`src/lib/site.ts`) :
  - **Arko One** — 20 m², **12 exemplaires**, base **59 900 €**, grille confirmée (perM2, options, terrasse, dimensions).
  - **Arko Max** — 40 m² (= ARKO historique), **5 exemplaires** (était 12), 89 900 €. Grille (perM2, options, terrasse, dimensions/footprint, `reserved`) **à reconfigurer** : valeurs provisoires en attente de confirmation métier.
- **Compteur cumulé « 12 + 5 »** en navigation.
- **Marque** : retrait du wordmark « ARKO » et du label « 001 — Le modèle » sur l'accueil **uniquement** ; « Arko One » / « Arko Max » conservés comme noms produits. Baseline accueil → « Une maison compacte faite pour vous » ; provenance affichée « Fabriqué au Pays-Basque ».
- **Média Arko One** : asset 20 m² dédié **absent du repo** → fallback provisoire sur le footage 40 m² (`placeholderMedia: true`), à remplacer.

## Faisabilité
- **Verdict** : 🟠 Moyenne — structure livrée et fonctionnelle ; dépend de données métier manquantes pour être définitive.
- **Dépendances externes** : valeurs Arko Max (perM2/options/terrasse/footprint/`reserved` à reconfirmer), asset vidéo Arko One (fallback footage Max), confirmation Albert.
- **Risques** : dérive identité vs PASSATION (« Argile & Encre » / ARKO) ; cohérence juridique des deux séries.

## Conséquences
- Amende **ADR-004** (usage du nom ARKO) et la cible prix.
- Déclenche **ADR-020** (configurateur multi-produit) et **ADR-021** (multi-pages).
- Données à confirmer avant mise en vente : grille Arko Max (perM2, options, terrasse, footprint, `reserved`), total Max = 5 confirmé, asset vidéo Arko One. ⚠️ Dans le code `src/lib/site.ts`, les commentaires `TODO` sont actuellement sur `ONE_PRICING` — à corriger en `MAX_PRICING` dès réception des données métier.

## Sources
`src/lib/site.ts` (`PRODUCTS`, `ONE_PRICING`, `BRAND`), `Hero.tsx`, `ProductsShowcase.tsx`, `Nav.tsx`, ADR-004, ADR-020, ADR-021.
