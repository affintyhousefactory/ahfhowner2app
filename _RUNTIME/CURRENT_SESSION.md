# CURRENT_SESSION — Howner / ARKO

## Décisions — 2026-08-04 (ADR-035 — CRM interne, chantier prioritaire)
Détail : **ADR-035** et « Dernier point » de `PROJECT_STATE.md`. Ici, ce qui doit rester présent à l'esprit.

- **Branche `feat/adr-035-crm-leads` (`7aac1145`) — non poussée, PR non ouverte.** `dev` reste à `96f084f0`.
- **Le CRM est refait AVANT ADR-031, à dessein** : il pose le contrat de données (`config_v2` + `cfg_*` + `slot`) que la soumission du configurateur remplira. Dans l'autre ordre, ADR-031 aurait improvisé un format.
- **Numérotation 035** — 031→034 sont réservés et cités dans ADR-030 et dans le code. Priorité ≠ numéro.
- **« Affectation » = conseiller AHF** (`responsable`), **sans rapport avec `mandataire_id`**. La colonne « Affectation » (champ `statut`) est retirée de la liste ; le champ reste en base.
- **Deux retards distincts** : rappel daté dépassé (rouge) · silence > 7 j sur lead actif (orange). Un lead **jamais appelé** compte depuis sa **création**.
- **Journal d'appels manuel** : « Appeler » ouvre `tel:` et pré-ouvre la fiche, mais **rien n'est enregistré sans validation**.
- **Migration `20260804_crm_leads.sql` NON appliquée** (ni Preview, ni Prod). Le **trigger `dernier_appel_at` n'est pas testable en local** — vérification sur Preview.
- **Gate** : `tsc` propre · vocabulaire conforme · eslint admin **21 → 20 erreurs** (pas de régression).

## Focus actuel
`dev` est à **`e284cac4`** (2026-08-03) — 6 commits mergés en fast-forward depuis `b7339d44`, aucune migration. **`main` reste à `4d34ed26`.** Contenu : ligne d'appel (site + tunnel + `/contact`) et **bascule « module » → « maison »**. Le configurateur v2 vit toujours sur `/configurer/v2` (`noindex`) ; `/configurer` sert le v1, qu'aucun CTA n'atteint.

Trois risques 🔴 :
- **CGV non confirmées avocat, live en prod** (ADR-015, depuis le 2026-07-13).
- **L'entonnoir de réservation entier mène au v2, dont le CTA final n'a pas de handler.** Cet état **ne doit pas atteindre `main`** avant ADR-031.
- **Vocabulaire « maison » non validé juridiquement** — exposition CCMI, à joindre au dossier avocat des CGV (voir ci-dessous).

## Décisions — 2026-08-02
Détail et motifs : **ADR-030 § Amendement du 2026-08-02**, ADR-029 § Amendement, et « Dernier point » de `PROJECT_STATE.md`. Ici, seulement ce qui doit rester présent à l'esprit.

**Mise en œuvre du configurateur v2**
- **Colonne de sections dépliantes, pas un stepper** — l'écran 0 est descendu en section 05, le stepper n'avait plus d'avantage.
- **Coque de tunnel** dans le groupe de routes `(configurateur)` : ni nav ni pied de page. Une mise en page imbriquée ne peut pas retirer la `<Nav>` de sa parente — d'où le groupe.
- **Grilles, visuels et teintes d'ambiance dans `config.ts`**, jamais dans un composant (règle ADR-030).
- **Mobile 390 px** : l'en-tête s'efface au défilement, la scène garde 232 px constants (le rétrécissement coupait le pied du module).
- **`?produit=` lu côté serveur** — `useSearchParams` impose une frontière Suspense et fait échouer le prerender de production.

**Arbitrages de Richard**
- **Série 01 reste à 12 unités** — amende ADR-029 et le §5 de la spec (qui fixaient 6). `SERIE_TOTAL` et `serie.unites` alignés.
- **Réservation à 2 000 €** partout — `DEPOSIT_EUR` 5 000 → 2 000, textes éditoriaux désormais **interpolés** sur la constante. Variable Vercel absente des 3 scopes (vérifié) : le fallback sert en production.
- **Tous les CTA « Réserver » mènent au v2**, via `reserverHref()` pour que la bascule future tienne en une ligne. « Tester mon terrain » retiré de l'accueil et des pages produit.
- **Alerte Albert traitée verbalement** — 4 écarts à la spec assumés (§8, §6-§7, §5 transport, §5 série) plus le parti « colonne de sections ».
- **« Et si je n'ai pas encore de terrain ? » conservée** en FAQ — ⚠ contredit sciemment ADR-029 sur la page la plus lue.
- **Échéancier 40/50/10 % non tranché**, laissé intact : territoire CGV, non confirmé par l'avocat.

**⚠ Un terme proscrit était servi en production**
« clé en main » s'affichait sur `/arko-one` et `/arko-max` pendant que `check:vocabulaire` annonçait « conforme » : le contrôle lisait le source ligne à ligne, le terme était coupé par un retour à la ligne JSX. Le script lit désormais le **texte rendu**. Seule occurrence du dépôt.

## Décisions — 2026-08-03
- **Ligne d'appel** `+33 (0)5 64 37 37 14` en en-tête du site et du tunnel, encadré « Contacter un conseiller » sur `/contact` (Lu–Ve 9 h–12 h / 14 h–18 h). Source unique `CONTACT` (`site.ts`, surchargeable par `NEXT_PUBLIC_CONTACT_PHONE` — **absente de Vercel, c'est le repli qui sert**), `PhoneLink` sans JS, JSON-LD enrichi. Le numéro a changé en cours de session : une seule ligne à toucher, tout le reste en dérive.
- **⚠ « module » → « maison »** sur tout le site client — **décision de Richard**, alerte formulée avant exécution et **maintenue**. 70 occurrences, accord au féminin. `maisons?` retiré du contrôle, `maisons? individuelles?` mis à sa place. **ADR-029 amendée**, `CLAUDE.md` / `AGENTS.md` réécrits.
- **Le cadre de vente ne bouge pas** : annexe sur parcelle bâtie ou hébergement professionnel, terrain nu fermé. Seul le mot change.
- **Accord au féminin propagé** : `BRAND.madeIn` → « Fabriquée au Pays-Basque » (4 surfaces), bas de page « Conçue ». Reste au masculin, à raison : `/arko-one` où « livré prêt / Fabriqué » s'accorde à **studio**.
- **Risque non levé** : exposition au régime **CCMI** (loi du 19 déc. 1990). Lecture de Claude, pas d'un avocat — à confirmer avec les CGV (ADR-015). **À remonter à Albert.**

## Leçons de méthode encore actives
- **Un garde-fou qui n'observe pas la sortie réelle ne contrôle rien.** Trois occurrences : un 404 ne prouvait pas un masquage (ADR-028, 31/07) ; un contrôle vocabulaire vert ne prouvait pas la conformité du rendu (ADR-029, 02/08) ; une Preview a renvoyé `200` en servant la page de login Vercel, jeton de partage périmé (03/08). **Sonder le corps servi, jamais le seul code HTTP.**
- **Une garde `notFound()` n'est fiable que si aucun layout client ne la précède** — sinon couper au proxy (`src/proxy.ts`).
- **Pas de test local** : HMR aveugle sur `/mnt/d`, laptop lent. Gate = `tsc` + `eslint` + `check:vocabulaire`, puis Preview Vercel. Revers assumé — une classe d'erreurs ne se voit qu'au prerender de production.

## Prochaine action
1. **ADR-035** — pousser `feat/adr-035-crm-leads`, ouvrir la PR vers `dev` (**à valider par Richard**), vérifier sur Preview, appliquer la migration.
2. **ADR-031** — soumission de la demande de numéro. Toujours bloquante pour `main` : elle conditionne la bascule sur `/configurer`, la levée du `noindex`, le retrait du v1 et la sortie de `/configurer` du sitemap. Elle écrit désormais dans le contrat posé par ADR-035.

## Blockers / À fournir
- **CGV + légal** — version `f3de62fe` en attente confirmation avocat (ADR-015). **Y joindre la question CCMI** ouverte par la bascule « maison » du 03/08 : même texte, même interlocuteur.
- **Albert** — charte Affinity (ADR-002), repositionnement bi-produit (ADR-022), **bascule « module » → « maison » du 03/08 (non remontée)**. Écarts ADR-030 ✅ traités.
- **Arko Max pricing grid** — données métier attendues (ne concerne plus que le v1).
- **Coordonnées atelier** — placeholder Bayonne (43.4933, −1.4748) ; sert le transport du v2.
- **Asset vidéo Arko One** — absent, fallback provisoire sur le footage Max.
- **ADR-028** — test de réversibilité (`NEXT_PUBLIC_FEATURE_MANDATAIRE=true` sur une Preview) jamais exécuté.

## Règle
Court : 300–1200 tokens. Historique complet et backlog → `00_INDEX/PROJECT_STATE.md`.
