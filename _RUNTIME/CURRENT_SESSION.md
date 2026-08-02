# CURRENT_SESSION — Howner / ARKO

## Focus actuel
**Configurateur v2 livré sur `/configurer/v2`** (branche mergée sur `dev` le 2026-08-02, fast-forward `0300237b..1bc955c4`, 6 commits, aucune migration). Route en `noindex` : `/configurer` sert toujours le tunnel v1 tant qu'ADR-031 n'a pas livré la soumission.
Deux risques 🔴 ouverts : **CGV non confirmées avocat, live en prod** (ADR-015, depuis le 2026-07-13) · **l'entonnoir de réservation entier pointe sur `/configurer/v2`, dont le CTA final n'a pas de handler** — cet état ne doit pas atteindre `main` avant ADR-031.

## Décisions prises — 2026-08-02 (ADR-030 — mise en œuvre du configurateur v2)
- **Colonne de sections dépliantes, pas un stepper.** Six sections numérotées portant chacune son choix en résumé, à côté d'une scène collante. L'écran 0 (filtre d'usage) est **descendu en section 05** — le stepper perdait alors son seul avantage (« forcer une décision ») tout en obligeant à naviguer pour comparer deux choix. Le critère de recette §16 n°1 tient : `brancheFermee` retire la **barre de prix entière** sur la branche « terrain nu ».
- **Coque de tunnel dans un groupe de routes dédié** `src/app/(configurateur)/` : ni méga-menu ni pied de page, une seule porte de sortie (le logo). Motif technique : une mise en page imbriquée s'ajoute à sa parente, elle ne peut pas en retirer la `<Nav>`. `Analytics` + `CookieBanner` conservés (consentement ADR-015 sur l'écran qui collecte des coordonnées).
- **Entrée depuis le méga-menu Modules** → `/configurer/v2?produit=one|max`, **paramètre lu côté serveur**. `useSearchParams` impose une frontière Suspense : le build de production est tombé dessus (`missing-suspense-with-csr-bailout`).
- **Ambiances** : `visuel` + `teinte` déclarés dans la grille (`config.ts`), jamais dans un composant. Littoral / Atelier / Basque réutilisent les rendus v1 (bleu pigeon / anthracite / vert). Les trois images sont **empilées et permutées en opacité** — c'est le préchargement exigé au §14. Le sélecteur signale la sélection par **la teinte du bardage**, pas par l'accent.
- **Mobile 390 px : c'est l'en-tête qui cède, pas le visuel.** Il s'efface en descente, revient au premier geste vers le haut (seuil 6 px, sinon l'inertie de Lenis le fait clignoter). La scène garde **232 px constants** — la version qui la faisait rétrécir à 132 px est **rejetée après essai** : `object-cover` coupait le pied du module sur un rendu 4:3. Réserve d'espace via la variable CSS `--cfg-nav`.
- **Compteur public** : « 2 séries · 12 exemplaires ». **Série 01 maintenue à 12 unités** — arbitrage Richard, qui **amende ADR-029 et le §5 de la spec** (ils fixaient 6) ; `SERIE_TOTAL` et `serie.unites` alignés, douze numéros au sélecteur.
- **Tous les CTA « Réserver » du site public mènent au v2** (arbitrage Richard) — via `reserverHref()` dans `site.ts`, pour que la bascule future tienne en une ligne. Hors périmètre : `?parcelle=` et `?pack=` (paramètres v1), et « Tester mon terrain ».
- **Alerte Albert traitée verbalement**, écarts maintenus et assumés : §8 pré-analyse PLU, §6-§7 paiement, §5 transport, §5 volume de série, plus le parti « colonne de sections ».
- **Méthode — plus de test local.** Le HMR Turbopack ne voit pas `/mnt/d` (WSL/NTFS : il faut supprimer `.next` et redémarrer à chaque essai) et `next build` local est trop lent. **Gate = `tsc --noEmit` + `eslint` + `check:vocabulaire`, puis Preview Vercel.** Le revers est assumé : une classe d'erreurs ne se voit qu'au prerender de production.
- **FAQ de l'accueil (« 012 — Questions ») reprise** : **réservation alignée à 2 000 €** partout (`DEPOSIT_EUR` 5 000 → 2 000 ; FAQ et bloc réassurance **interpolés** sur la constante, ils ne peuvent plus diverger ; variable Vercel absente des 3 scopes, vérifié → le fallback sert en production, les CTA « Réserver — 2 000 € » suivent). **Mention « paiement sécurisé en ligne » retirée** (ADR-030 : rien n'est encaissé depuis le site). **Nouvelle question** sur les options structurelles non ajoutables après réservation (§5). **Échéancier 40/50/10 % laissé intact** — territoire CGV, non confirmé par l'avocat (ADR-015) ; question non tranchée, recommandation appliquée par défaut. **« Et si je n'ai pas encore de terrain ? » conservée** (décision Richard) — ⚠ contredit sciemment ADR-029 sur la page la plus lue.
- **Reste — priorité** : **ADR-031** (le CTA « Réserver ce numéro » n'a pas de handler). Tant qu'elle n'est pas livrée, l'entonnoir ne doit pas partir sur `main`. Puis bascule sur `/configurer`, levée du `noindex`, retrait du v1 et sortie de `/configurer` du sitemap.

## Décisions prises — 2026-08-01 (ADR-030 — écriture de l'ADR)
- **Tunnel en 7 écrans** décidé, **verrou ADR-005 levé** : `Configurator.tsx` et `config-store.tsx` sont réécrits, `perM2`/`terrassePerM2` disparaissent. Règle de remplacement : **grilles jamais en dur**.
- **3 écarts assumés à la spec d'Albert** : pré-analyse PLU conservée (§8), aucun paiement en ligne (§6-§7), transport au kilomètre (§5). **Alerte Albert = Oui, non faite à ce jour.**
- **2 arbitrages ouverts** câblés comme des drapeaux : nombre d'ambiances (§17.3), bloc rentabilité en parcours particulier (§17.5).
- Proposition d'interface dans `docs/design/configurateur-v2.md`. Détail complet : `03_DECISIONS/ADR-030-configurateur-v2.md` et « Dernier point » de `PROJECT_STATE.md`.

## Décisions prises — 2026-07-31 (ADR-029 — repositionnement produit & marque)
- Cadre de vente restreint (annexe sur parcelle bâtie + hébergement pro), **terrain nu fermé**. Vocabulaire inversé : « maison », « clé en main » interdits → module / unité / studio / hébergement / annexe. Prix **77 900 / 99 900 €**, **Série 01 = 6 unités**. **ADR-004 remplacée.**
- 3 arbitrages remontés à Howner (contradiction « clé en main » dans la spec, lecture cumulative module/modulaire, identité Howner vs éditeur légal AHF SAS).

## Décisions prises — 2026-07-31 (ADR-028 — correctif du masquage admin)
- Une garde `notFound()` **n'est fiable que si aucun layout client ne la précède** — sinon couper au proxy (`src/proxy.ts`). Vérifié en production.
- **Un code HTTP 404 ne prouve pas un masquage** : le contrôle `curl` compte désormais les `<h1>` et la taille du corps.
- **Reste** : test de réversibilité (`NEXT_PUBLIC_FEATURE_MANDATAIRE=true` sur une Preview) non exécuté.

## Blockers / À fournir
- **CGV + légal** — version `f3de62fe` en attente confirmation avocat (ADR-015, seul point bloqué).
- **Albert** — charte Affinity (ADR-002), repositionnement bi-produit (ADR-022). ~~Écarts ADR-030~~ ✅ traités verbalement le 2026-08-02.
- **Arko Max pricing grid** — données métier attendues (ne concerne plus que le v1).
- **Coordonnées atelier** — placeholder Bayonne (43.4933, −1.4748) à affiner ; sert le transport du v2.
- **Asset vidéo Arko One** — absent, fallback provisoire sur le footage Max.

## Règle
Court : 300–1200 tokens. Historique complet et backlog → `00_INDEX/PROJECT_STATE.md`.
