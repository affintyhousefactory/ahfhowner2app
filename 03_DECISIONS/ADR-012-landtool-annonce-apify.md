# ADR-012 — LandTool : extraction d'annonce via Apify

- **Statut** : Proposé
- **Date** : 2026-06-16
- **Phase** : 4
- **Faisabilité** : 🟠 Moyenne
- **Alerte Albert** : Non

## Contexte
Le mode « lien d'annonce » de `LandTool.tsx` est dégradé : il ne récupère pas encore l'adresse depuis l'URL d'une annonce immobilière. Le PASSATION cible **Apify** pour le scraping.

## Décision
Route serveur appelant **Apify** pour extraire l'adresse depuis l'URL d'annonce, puis réutiliser le pipeline **BAN** (déjà fonctionnel) pour obtenir le verdict de zone (ADR-011).

## Faisabilité
- **Verdict** : 🟠 Moyenne — dépend d'un service tiers payant et de la couverture des portails d'annonces.
- **Dépendances externes** : Apify (`APIFY_TOKEN`), coût par run, fragilité des scrapers vs changements de sites.
- **Risques** : couverture incomplète, coût variable, blocage anti-bot des portails.

## Conséquences
Dépend d'ADR-011 (pipeline zonage en aval). Fallback : saisie manuelle d'adresse (mode actuel).

## Sources
`PASSATION_RICHARD.md` §LandTool (mode annonce / Apify), `src/components/site/LandTool.tsx`.
