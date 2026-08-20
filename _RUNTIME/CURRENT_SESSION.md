# CURRENT_SESSION — Howner / ARKO

## Décisions — 2026-08-20 (chantier ADR-038 — lot 2 livré, 5 pages d'usage en ligne)
- **PR #79** (empilée sur #78 → #77). **5 pages publiées**, sitemap **8 → 13 URLs**, vérifié sur le HTML servi.
- **Ordre non négociable : vérifier en Preview, puis publier.** Le `statut` du registre existe pour ça — les pages ont d'abord été servies **sans être déclarées** au sitemap.
- **Le maillage et la colonne « Usages » du pied de page dérivent du registre.** Ils ne rendent rien tant que la famille est vide, et s'étoffent seuls à chaque lot. **Sans ce lien entrant, les 5 pages auraient été orphelines** — au sitemap mais référencées par personne.
- **Navigation principale non touchée** : 19 entrées ne tiennent pas dans une barre. **Arbitrage de présentation en attente de Richard** (méga-menu « Nos Studios » ?).
- **Le garde-fou vocabulaire m'a repris 3 fois** pendant l'écriture, dont 2 sur mes propres commentaires. Un contrôle ne vaut que s'il s'applique à celui qui l'écrit.
- **L'exception « tiny house » a dû être étendue** au fichier de contenu (`src/lib/pages/contenu/`), qu'elle ignorait. ADR-029 amendée : **une exception suit le texte là où il est écrit.**
- ⚠ **`/bureau-de-jardin` et `/bureau-pour-teletravail` se ressemblent** — partage documenté (l'objet / la situation), section constructive liée et non dupliquée. **À rejuger sur le rendu**, fusion ouverte. Même réserve que les guides 01/04/07 du lot 3.
- **Visuels Arko One non traités** (demande de Richard : pas de visuels pour l'instant). Les 5 pages servent des assets déjà au dépôt. **Lot média à prévoir.**
- **Reste** : lot 3 (hub + 9 guides), lot 4 (4 pages locales, **en attente de matière locale de Richard**).

## Décisions — 2026-08-20 (chantier ADR-038 — 19 pages éditoriales)
- **Lot 0 livré, PR #77 → `dev`** (fondations, aucune page publiée). **Lot 1 livré, empilé dessus** : audit de conformité seul, **visuels non touchés** (demande de Richard).
- **Quatre arbitrages de Richard** : copy réécrit plutôt que garde-fou assoupli · « tiny house » autorisé sur la seule page qui compare (ADR-029 amendée) · pages locales à 30-40 % de contenu propre · livraison lot par lot.
- **Le registre `src/lib/pages/registry.ts` est la seule source de routes.** Une page ne passe à `"publiee"` qu'après vérification en Preview — sinon le sitemap annonce des 404.
- **`sauf` ≠ `EXCLUS`** dans `check-vocabulaire.mjs` : le premier lève **un terme sur un chemin**, le second sort **un fichier entier** du contrôle. N'employer `sauf` que pour une exception écrite dans un ADR. Garde-fou **re-testé** après modification (3 essais).
- **⚠ Les CGV parlent encore de « maisons légères ARKO » (39 occurrences, terme contractuel défini) et citent le CCMI.** Le repositionnement du 19/08 éloignait le site de ce régime ; **le contrat, lui, l'y ramène** — et c'est le contrat qui est lu en cas de litige. **Non corrigé à dessein** (document contractuel non validé par l'avocat, ADR-015). **Alerte Albert, à joindre au dossier CGV.**
- **Aucun garde-fou automatique ne surveille le vocabulaire des pages légales** — elles sont hors périmètre de `check:vocabulaire`. L'exclusion est légitime, sa conséquence doit être connue.
- **Reste du chantier** : lot 2 (5 pages d'usage), lot 3 (hub + 9 guides), lot 4 (4 pages locales, **en attente de matière locale de Richard**).

## Décisions — 2026-08-19 (soir — visuels Arko Max en production, PR #76)
- **`main` = `4b2fb554`, production déployée et vérifiée en ligne.** Trois commits média, **aucune migration**. Détail dans « Dernier point » de `PROJECT_STATE.md`.
- **Les composants de page produit se paramètrent, ils ne se dupliquent pas.** `RevealScrub` et `Discover` servent les deux produits : leurs médias passent en props (`frames`, `panels`), les données dans `src/lib/media/arko-max.ts`. Sans prop, comportement inchangé — c'est ce qui a permis de refondre l'Arko Max sans toucher l'Arko One, vérifié sur le HTML servi des deux pages.
- **« La Révélation » de l'Arko Max n'est plus une vidéo** mais une séquence d'images scrubée. La vue extérieure y est jouée **deux fois** (pose, puis zoom d'entrée) avec un raccord continu : `to` du premier plan = `from` du second. **Toucher un `at` sans reprendre le chevauchement voisin casse le fondu.**
- **`sizes` suit l'échelle maximale du plan**, sinon Next sert une image au format écran et le zoom la rend molle. Une seule source encodée en 3840 px, les sept autres en 2560 px.
- **« L'heure bleue » retirée** de Découvrir (7 → 6 vues) : le film de crépuscule ne montre pas l'Arko Max.
- **L'Arko One sert toujours des visuels 40 m²** (vidéo produit + les six médias génériques). Mention « visuel provisoire » maintenue. **Prochain lot naturel** : ses propres rendus, à brancher par les mêmes props.

## Décisions — 2026-08-04 (soir — amendement ADR-035 + volume de série)
- **« Pack prêt à louer » (1 990 €) retiré de la grille** — offre non viable après étude (Richard). Contenu à `config.ts`, aucun lead ne la portait (vérifié). **Écart de plus à la spec §5 → à porter à Albert.**
- **`version` de grille incrémentée** `v1` → **`2026-08-04`** (format daté : la version des *grilles* n'est pas celle du *configurateur*). **Règle : tout mouvement de prix, palier ou option incrémente `version`**, sinon `grillePerimee` ne garde rien.
- **« Lead chaud » → « Paiement réservé »** (`chaud` → `paiement_reserve`, **identifiant renommé en base**, pas seulement le libellé). Constate un **fait comptable**, plus une appréciation. Migration `20260804_statut_paiement_reserve.sql` ✅ Preview, vérifiée par requête. Prod : 0 lead, à passer avec l'autre.
- **Numéro de série — deux niveaux** : rien avant devis · **réservé** au devis envoyé (reprenable) · **bloqué** à l'encaissement (seul état qui décrémente le compteur). Codé une fois dans `etatNumeroPourStatut()`. Badge `N° x` à côté du modèle dans la liste et le Kanban.
- **⚠ `leads_slot_unique` contredit cette règle** — il bloque le numéro dès le premier lead, quel que soit son statut. Dormant tant qu'ADR-031 n'écrit pas ; **bloquant au premier doublon**. Idem `leads_slot_check` (encore 1→12). Non corrigés, à trancher avec ADR-031.
- **Série 01 = 6 exemplaires** — annule l'arbitrage du 02/08. Appliqué **partout**, pas au seul configurateur : `BRAND.total` et `PRODUCTS.*.total` dérivent de `SERIE_TOTAL`, les 3 derniers littéraux interpolés.
- **Pennylane** posera ce statut automatiquement — **ADR-036 réservée**, dépendance externe critique, **alerte Albert**.

## Décisions — 2026-08-04 (ADR-035 — CRM interne, chantier prioritaire)
Détail : **ADR-035** et « Dernier point » de `PROJECT_STATE.md`. Ici, ce qui doit rester présent à l'esprit.

- **Branche `feat/adr-035-crm-leads` poussée — PR #73 → `dev` ouverte**, en attente de revue. `dev` reste à `96f084f0`.
- **Le CRM est refait AVANT ADR-031, à dessein** : il pose le contrat de données (`config_v2` + `cfg_*` + `slot`) que la soumission du configurateur remplira. Dans l'autre ordre, ADR-031 aurait improvisé un format.
- **Numérotation 035** — 031→034 sont réservés et cités dans ADR-030 et dans le code. Priorité ≠ numéro.
- **« Affectation » = conseiller AHF** (`responsable`), **sans rapport avec `mandataire_id`**. La colonne « Affectation » (champ `statut`) est retirée de la liste ; le champ reste en base.
- **Deux retards distincts** : rappel daté dépassé (rouge) · silence > 7 j sur lead actif (orange). Un lead **jamais appelé** compte depuis sa **création**.
- **Journal d'appels manuel** : « Appeler » ouvre `tel:` et pré-ouvre la fiche, mais **rien n'est enregistré sans validation**.
- **Migration `20260804_crm_leads.sql` ✅ appliquée sur Preview** (`ahfhownerdb-preprod`), structure et **trigger vérifiés fonctionnellement**, données de test retirées. **Toujours PAS sur Prod** — à la validation de la PR `dev` → `main`.
- **⚠ Défaut de sécurité introduit puis corrigé** : fonctions du trigger en `SECURITY DEFINER` dans `public` = exposées en `/rest/v1/rpc/` au rôle `anon`, donc écriture sur `leads.dernier_appel_at` hors RLS. Corrigé (`security invoker` + `revoke`), audit Supabase propre. **Règle : dans Supabase, une fonction `SECURITY DEFINER` dans `public` est une route API publique tant qu'on ne lui retire pas l'exécution.**
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
1. **ADR-035** — **PR #73 ouverte**, migration Preview appliquée et trigger vérifié. Reste : contrôler le **Kanban**, le **journal d'appels** et la **GED double origine** sur la Preview Vercel, puis merger. La migration Prod (correctif de sécurité inclus) part à la validation `dev` → `main`.
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
