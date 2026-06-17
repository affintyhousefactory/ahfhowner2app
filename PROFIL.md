# PROFIL — Howner / ARKO

> Lu en début de session. Fixe la vulgarisation + la posture de décision.
> Mis à jour à chaque recalibrage (Bloc 0 du cahier des charges).

## Interlocuteur
- Rôle : Fondateur HOWNER / Arko (mono-produit série limitée bi-modèle Arko One / Max).
- Contexte : pilote le projet de bout en bout (positionnement, marque, juridique, planning) et arbitre les choix structurants. N'écrit pas le code lui-même.

## Maîtrise technique
- Niveau : novice ▱▱▰▰▱ expert (intermédiaire-avancée)
- Notes : comprend l'architecture (Next.js App Router, configurateur multi-produit, ADR), valide les arbitrages tech et lit le code, demande la cause-racine quand quelque chose ne va pas. Pas d'écriture code direct. Garde-fous techniques (perf ADR-006, configurateur ADR-005/020, secrets ADR-003) maîtrisés.

## Maîtrise produit / entrepreneuriale
- Niveau : novice ▱▱▱▰▰ expert (avancée)
- Notes : très clair sur le positionnement, la cible, le tunnel de conversion (FOMO, jauges, countdown), la gouvernance par ADR et les alertes Albert. Cadre le projet bi-produit (Arko One 20 m² / Arko Max 40 m²), pilote la marque (retrait wordmark ARKO, charte Affinity à valider) et le juridique (acompte/arrhes ADR-015).

## Posture adoptée
- Vulgarisation : **technique vulgarisée** — vocabulaire métier OK, internals framework (App Router, hydration SSR, stores React) à expliciter quand cités.
- Décision : **co-pilotage** — Claude propose des défauts éprouvés et les met en œuvre ; Richard tranche les choix structurants (marque, positionnement, prix, juridique, validation Albert).
- Implication concrète : Claude écrit le code, crée les ADR, synchronise PROJECT_STATE/HUBs/_RUNTIME et ne remonte que les arbitrages réels (alertes Albert formalisées : sujet · impact · gravité · décision attendue · reco).

## Préférences de communication
- Langue : français (caveman mode actif → fragments OK, articles/filler droppés).
- Format : updates courts à chaque étape clé, pas de narration interne.
- Decisions : ADR systématique pour décisions structurantes (architecture, intégration externe, change marque/design/pricing, RGPD).
- À challenger : positionnements basés sur intuition sans donnée ; choix de marque qui dérivent de la charte Affinity sans alerte Albert ; tout ajout qui touche les guardrails (Configurator, perf, secrets) sans amendement explicite.

## Dernier calibrage
2026-06-17 — créé après ingestion de `claude-knowledge` (`rules/discovery/profil-md-convention.md`). Calibrage observé sur la session de refonte multi-pages bi-produit + FOMO + ingestion KI.
