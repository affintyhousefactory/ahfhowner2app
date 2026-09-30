# PENDING QUESTIONS — Howner / ARKO

> Questions **réellement ouvertes**, rien d'autre. Une question tranchée quitte ce fichier :
> la décision va dans `_RUNTIME/recent-decisions.md`, puis dans un ADR si elle est durable.
> Élagué le 2026-09-07 — le fichier portait quatorze entrées dont sept périmées, et deux fausses.

## Pour Richard — arbitrages qui bloquent quelque chose

- **Échéance de l'objectif −10 %** (page RSE, en production depuis le 2026-09-07). Le texte publié
  dit « −10 % par rapport à notre première mesure fiable », sans date. C'est la seule ligne de la
  page qui engage un résultat, et aucune donnée ne permet de la trancher à sa place. **En combien de
  temps, et à partir de quelle année de référence ?**
- **Basculer les deux pages nouvelles en `"publiee"` ?** `/guide/demarche-rse-howner` et
  `/hebergements-professionnels` sont servies mais **hors sitemap** (`statut: "a-venir"`, ADR-038).
  Une vérification en production suffit à les ouvrir aux moteurs.
- **Bascule du configurateur** — `/configurer` (v1) sert encore six numéros, trois teintes et
  « Envoyer ma demande — n° NN », au sitemap en priorité 0.8. Seul endroit du site qui contredit les
  décisions du 2026-09-07. Quand ?
- **Rouvrir des teintes de bardage ?** Une seule est proposée depuis le 2026-09-07 (`surDemande` sur
  les deux autres). En rouvrir une est un booléen dans `config.ts` — la question est commerciale,
  pas technique. *(Remplace l'ancien point ouvert §17.3 d'ADR-030 sur le nombre d'ambiances.)*
- **Bloc rentabilité en parcours particulier ?** (§17.5, point ouvert d'ADR-030) — ouvert ou réservé
  au professionnel. Drapeau par usage (`blocRentabilite: null` pour `annexe`), bascule gratuite.
- **Asset vidéo Arko One** — absent du dépôt, repli sur le footage Max (`placeholderMedia: true`,
  mention « visuel provisoire » affichée). Fournir le fichier 20 m².
- **`reserved` par produit** — jauges One/Max encore sur des valeurs de démonstration (ADR-009).
  ⚠ Sans effet côté public depuis le 2026-09-07 : aucun volume ne s'affiche plus.

## Alertes Albert — non traitées

- **Positionnement RSE** — public depuis le 2026-09-07. Les allégations environnementales relèvent
  d'un régime encadré ; la page a été écrite pour rester dans le démontrable, mais le sujet n'a pas
  été porté.
- **Charte Affinity** (ADR-002) — contredit le verrou « Argile & Encre » du PASSATION.
- **Repositionnement bi-produit** (ADR-022) et **« studio de jardin »** du 2026-08-19.
- **RGPD / confidentialité** — la politique publiée (doc mutualisée AHF) déclare GA4, un bandeau de
  consentement et Brevo newsletter. Le site n'a ni analytics ni bandeau. Arbitrer : déployer
  réellement, ou adapter la politique au périmètre réel.
- **Contrat d'apporteur des agences** (ADR-044) — les templates 23 et 24 promettent une commission à
  167 agences sans cadre juridique (loi Hoguet). Le volet ne démarre pas avant.

## Légal — encore ouvert

- **Échéancier de paiement** — trois versions coexistent : la FAQ et les CGV live disent 40/50/10,
  le §7 de la spec dit « acompte de confirmation 30 % », ADR-016 dit 10/30/40/20 (différé). La FAQ
  reste sur 40/50/10 par défaut. À reprendre avec l'avocat.
- **Médiateur de la consommation non nommé** (art. L.616-1) — avant toute communication commerciale.
- ⚠ **« Et si je n'ai pas encore de terrain ? »** — contradiction assumée par Richard le 2026-08-02 :
  la réponse dit que l'acquisition relève du client, alors qu'ADR-029 ferme ce cas (annexe sur
  parcelle bâtie ou hébergement professionnel ; terrain nu « prochainement »).

---

**Retirées le 2026-09-07** parce que tranchées ou fausses : grille Arko One (ADR-029), alerte Albert
ADR-030 (traitée le 2026-08-02), volume de la Série 01 *(le fichier disait « tranché : 12 » alors
que c'est 6 depuis le 2026-08-04 — et le volume ne s'affiche plus)*, domaine de production *(le
fichier disait `affinityhome.fr` ; c'est `howner.fr`, cf. `SITE_URL`)*, email de contact et
fournisseur d'email transactionnel *(Brevo, ADR-026, en production)*, validation légale des CGV
*(levée le 2026-08-22)*.
