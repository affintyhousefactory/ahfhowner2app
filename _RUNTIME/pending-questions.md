# PENDING QUESTIONS — Howner / ARKO

## Questions ouvertes

- ~~**Grille Arko One ?**~~ ✅ **répondu par la spec** (ADR-029) : base **77 900 €**, emprise **6,65 × 3,60 m**. Les champs `perM2` / `terrassePerM2` deviennent sans objet — ADR-030 remplace le modèle de calcul (paliers de terrasse, options tarifées, transport par zone) au lieu de l'ajuster.
- **Nombre d'ambiances au lancement ?** (§17.3, point ouvert d'ADR-030) — **trois sont livrées** (Littoral / Atelier / Basque, sur les rendus v1). Le tableau reste bouclé : passer à deux ne coûte qu'une ligne de `config.ts`. À confirmer par Howner quand les visuels définitifs arriveront.
- **Bloc rentabilité en parcours particulier ?** (§17.5, point ouvert d'ADR-030) — ouvert ou réservé au professionnel. Drapeau par usage (`blocRentabilite: null` pour `annexe`), la bascule est gratuite. **Non tranché.**
- ~~**Alerte Albert ADR-030**~~ ✅ **traitée verbalement le 2026-08-02** — écarts maintenus et assumés par Richard : §8 pré-analyse PLU conservée, §6-§7 aucun paiement en ligne, §5 transport au kilomètre, §5 Série 01 à 12 unités, plus le parti « colonne de sections dépliantes » au lieu du tunnel en 7 écrans.
- ~~**Volume de la Série 01 — 6 ou 12 ?**~~ ✅ **tranché le 2026-08-02 : 12.** ADR-029 et le §5 de la spec sont amendés ; `SERIE_TOTAL` et `serie.unites` alignés.
- **Échéancier de paiement — 40/50/10 % ou acompte 30 % ?** Trois versions coexistent : la FAQ et les CGV live disent 40/50/10, le §7 de la spec dit « acompte de confirmation 30 % », ADR-016 dit 10/30/40/20 (différé). **Non tranché le 2026-08-02** — la FAQ reste sur 40/50/10 par défaut, les pourcentages engageant contractuellement et les CGV n'étant pas confirmées par l'avocat (ADR-015). À reprendre avec le volet légal.
- ⚠ **« Et si je n'ai pas encore de terrain ? » — contradiction assumée.** Richard a choisi le 2026-08-02 de **garder la réponse actuelle**, qui dit que l'acquisition du terrain relève du client. ADR-029 a pourtant fermé ce cas (cadre = annexe sur parcelle bâtie ou hébergement professionnel, terrain nu « prochainement »). L'accueil et la section 05 du configurateur ne disent donc pas la même chose. À revoir si le critère de recette §16 n°1 est audité.
- **Asset vidéo Arko One ?** Absent du repo → fallback provisoire = footage Max (`placeholderMedia: true`). Fournir le fichier 20 m².
- **`reserved` par produit ?** Jauges One/Max actuellement One=0, Max=4 (placeholder).
- **Email de contact ?** Destinataire + service d'envoi pour `/contact` (Phase 4, lié ADR-014).
- **Validation Albert — repositionnement bi-produit + déverrouillage configurateur + retrait wordmark ARKO ?** ADR-022/020.
- ~~**Domaine de production ?**~~ **Tranché 2026-06-17 : `affinityhome.fr`** (constante `SITE_URL`, `src/lib/site.ts`).
- ⚠ **Alerte Albert — RGPD confidentialité ?** La politique de confidentialité publiée (doc mutualisée AHF) déclare GA4 (cookies `_ga`), un bandeau de consentement et Brevo (newsletter) — **non déployés sur ce site** (pas d'analytics/cookies/newsletter aujourd'hui ; backend Phase 4). Arbitrer avant mise en prod indexée : (a) déployer réellement ces traceurs + bandeau consentement, ou (b) adapter la politique au périmètre réel du site.
- **Fournisseur email transactionnel ?** Resend / Mailgun / SendGrid — bloque la confirmation Stripe (ADR-014).
- **Validation Albert — charte Affinity ?** ADR-002 contredit le verrou « Argile & Encre » du PASSATION.
- **Validation Albert — légal ?** Acompte vs arrhes + CGV (ADR-015) — bloque le lancement commercial.

## Règle
Une question tranchée → décision dans `_RUNTIME/recent-decisions.md`, puis ADR si durable.
