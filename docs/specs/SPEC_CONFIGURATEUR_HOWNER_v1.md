<!--
  Copie versionnée de la spécification produite par Albert.
  Source : Google Drive partagé « AHF - Plans_SiteWeb_Inspirations »
           (0ALGUeoTQ2_hdUk9PVA) / Siteaffinity / SpecsConfigurateur /
           SPEC_CONFIGURATEUR_HOWNER_pour_Richard.md
  File ID : 1G4bAqvZE7-vEOLwIzNqLkJAy1mqj4_5J
  URL     : https://drive.google.com/file/d/1G4bAqvZE7-vEOLwIzNqLkJAy1mqj4_5J/view
  Version : v1 — 30 juillet 2026 · récupérée le 31 juillet 2026
  Accès Drive déclaré dans project-access.json (ADR-029 et suivants).

  ⚠ Copie de travail : le Drive reste la source. En cas de nouvelle version,
  re-télécharger plutôt qu'éditer ce fichier. Ne pas modifier le contenu
  ci-dessous — les ADR 029→034 le citent par section (§n).
-->

# CONFIGURATEUR HOWNER — SPÉCIFICATION DE DÉVELOPPEMENT
### Version 1 · 30 juillet 2026 · Arko One & Arko Max
**HOWNER**

Document de référence pour le développement du configurateur en ligne. Il décrit le parcours, les règles produit, les données, les mentions obligatoires et les critères de recette. Les points encore ouverts sont regroupés au §17 : ils n'empêchent pas de commencer, ils bloquent la mise en ligne.

---

## 1 · Principe

Le configurateur affiche un **prix indicatif clé en main** qui s'incrémente au fil des choix, puis permet de **réserver un créneau de production** contre 2 000 €.

Trois règles gouvernent tout le reste :

**Personnalisable, pas sur-mesure.** La coque et les plans sont figés. Aucune modification d'ouverture, de dimension ou d'implantation intérieure n'est proposée.

**Rien n'est contractuel avant le devis signé.** Chaque écran qui affiche un prix, un visuel ou une information de faisabilité porte une mention visible en ce sens.

**Une seule identité.** Howner est la seule entité citée : pages, formulaires, emails, PDF, mentions légales, coordonnées bancaires. Aucun nom de fournisseur, de sous-traitant ou de partenaire n'apparaît côté client, y compris dans les descriptifs techniques.

---

## 2 · Cadre de vente — le filtre qui commande le parcours

Deux usages sont ouverts à la vente :

1. **Annexe d'une habitation existante**, sur la même parcelle — studio supplémentaire, chambre, bureau, logement d'un proche, meublé de tourisme.
2. **Hébergement d'exploitation vendu à un professionnel** — hôtellerie de plein air et campings, parcs résidentiels de loisirs, résidences de tourisme, villages vacances, établissements thermaux.

**Le logement indépendant sur terrain nu n'est pas ouvert.** À l'écran, une seule formulation : *prochainement*. Aucune explication, aucun terme juridique, aucun motif. On recueille le contact et on informe en priorité à l'ouverture. Ce point n'est pas négociable en développement : le parcours ne doit en aucun cas permettre d'aller au bout avec ce cas de figure.

**Vocabulaire.** On écrit : module, unité, studio, hébergement, annexe, espace supplémentaire, prêt à vivre.
On n'écrit jamais : maison, votre maison, maison individuelle, résidence principale, clé en main.
Une revue de tous les textes existants du site est à faire sur ce point.

---

## 3 · Parcours — 7 écrans

| # | Écran | Contenu |
|---|---|---|
| 0 | Votre projet | Filtre d'usage, 3 boutons |
| 1 | Modèle | Arko One 20 m² · Arko Max 40 m² (+ champ quantité en parcours professionnel) |
| 2 | Ambiance | 2 à 3 versions pré-composées, incluses |
| 3 | Terrasse | 4 paliers, grille par modèle |
| 4 | Options | 6 options tarifées, dont 3 structurelles |
| 5 | Votre terrain | Qualification d'accès, uploads, prise de rendez-vous |
| 6 | Récapitulatif | Prix, inclus, à votre charge, créneau, réservation |

Le compteur de prix est visible en permanence à partir de l'écran 1, avec sa mention fixe.
Le visiteur peut revenir en arrière à tout moment sans perdre ses choix.
La configuration est sauvegardée derrière un identifiant et reprenable pendant 30 jours via un lien envoyé par email.

**Écran 0 — les trois boutons**
- *Une annexe sur le terrain de mon habitation* → parcours particulier
- *Des hébergements pour mon établissement* → parcours professionnel
- *Un logement indépendant sur un terrain nu* → page « prochainement », formulaire d'inscription, aucun prix affiché, fin de parcours

**Parcours professionnel.** Mêmes écrans, plus un champ *nombre d'unités* à l'écran 1 et le bloc rentabilité du §10. À partir de 3 unités, le prix unitaire reste affiché mais le récapitulatif bascule sur *devis dédié* : bouton de prise de rendez-vous à la place du bouton de réservation.

---

## 4 · Socle Signature — à afficher au récapitulatif

**⚠ Contenu à valider par Howner avant intégration (§17).** Structure attendue : deux blocs face à face.

**Compris dans le prix**
- Ossature acier léger, plancher, murs et toiture plate avec acrotère, chéneau et descentes d'eaux pluviales
- Isolation biosourcée conforme à la réglementation environnementale en vigueur, frein-vapeur, traitement des points singuliers
- Bardage extérieur, teinte selon l'ambiance choisie
- Menuiseries aluminium à triple vitrage et volets roulants motorisés à commande centralisée
- Chauffage par radiateurs électriques à pilotage individuel, ventilation mécanique, eau chaude sanitaire par ballon dimensionné
- Électricité complète aux normes en vigueur, éclairage, prises et réseau informatique
- Plomberie, évacuations, salle d'eau et cuisine équipées selon l'ambiance choisie
- Cloisons, plafonds et finitions intérieures
- Fondations sur pieux vissés, dimensionnées pour l'unité *(voir la réserve ci-dessous)*
- Fabrication, transport, levage et pose
- Montage et suivi de votre dossier d'urbanisme
- Garanties légales de l'entreprise

*Réserve à afficher sur la ligne fondations :* les fondations sont comprises pour un sol courant, jusqu'à une profondeur d'ancrage définie. Au-delà, un complément est chiffré après étude de sol. **La profondeur de référence est à fixer par Howner (§17) : sans elle, la ligne ne peut pas être affichée comme incluse.**

**À votre charge**
- Terrassement, nivellement et travaux de terrain
- Raccordements aux réseaux — eau, électricité, assainissement, télécommunications — **chiffrés séparément après étude de votre terrain**
- Étude de sol si elle est exigée
- Mise à disposition d'un accès permettant le passage du camion et le stationnement de la grue
- Mobilier et décoration

---

## 5 · Prix — grilles complètes (TTC, TVA 20 %)

**Modèles**

| Modèle | Surface | Emprise | Typologie | Prix |
|---|---|---|---|---|
| Arko One | 20 m² | 6,65 × 3,60 m | studio | **77 900 €** |
| Arko Max | 40 m² | 4,00 × 11,00 m | T2 | **99 900 €** |

**Terrasse** — paliers uniquement, ne jamais afficher de prix au m²

| Palier | Arko One | Arko Max |
|---|---|---|
| Sans terrasse | 0 € | 0 € |
| Petite | 1 990 € | 3 990 € |
| Moyenne | 2 990 € | 5 990 € |
| Grande | 3 990 € | 7 990 € |

Descriptif client : structure acier, dalle porcelaine 18 mm, finitions aluminium teinte au choix. Aucun nom de fournisseur.

**Options** — ▲ = structurelle

| Option | Modèles | Prix |
|---|---|---|
| ▲ Kit solaire photovoltaïque 3 kWc | One · Max | 7 900 € |
| ▲ Casquette pare-soleil | One | 2 490 € |
| ▲ Casquette pare-soleil | Max | 3 490 € |
| Climatisation réversible | One | 3 490 € |
| Climatisation réversible | Max | 5 990 € |
| ▲ Poêle à bois | Max | 5 900 € |
| Pack prêt à louer | One · Max | 1 990 € |

**Options structurelles.** La casquette, le poêle et le kit solaire entrent dans l'étude d'exécution de l'ossature. Elles se choisissent avant la réservation et ne peuvent plus être ajoutées ensuite. À l'écran, mention : *à choisir maintenant, non modifiable après la réservation*. Les autres options restent ajoutables jusqu'à la signature du devis.

Le poêle ne s'affiche pas sur l'Arko One : il est réservé à l'Arko Max. La climatisation existe sur les deux modèles à des prix différents — une unité sur le One, deux sur le Max. Filtrage par le champ `modeles` de chaque option, pas en dur.

**Transport** — déduit de la distance routière depuis Bayonne

| Zone | Périmètre | Supplément |
|---|---|---|
| 1 | ≤ 60 km | inclus |
| 2 | ≤ 150 km | 1 500 € |
| 3 | ≤ 300 km | 2 900 € |
| 4 | au-delà | sur étude — pas de prix affiché, bascule sur formulaire de contact |

C'est le **seul calcul automatique du configurateur**. Aucun autre appel de service externe n'est prévu.

**Calcul du total** : prix du modèle + terrasse + options + transport. Aucune remise, aucun code promotionnel en version 1.

---

## 6 · Créneaux de production

**Série 01 : six unités.** Premier arrivé, premier servi, à l'horodatage du paiement.

| Statut | Déclencheur | Durée | Effet |
|---|---|---|---|
| `disponible` | — | — | Décompté publiquement |
| `optionne` | Paiement des 2 000 € confirmé | 30 jours | Retiré du compteur public |
| `confirme` | Encaissement de l'acompte de 30 % | définitif | Entre en production |
| `libere` | 30 jours écoulés sans acompte | immédiat | Remboursement intégral, créneau rendu au premier de la liste d'attente |

Une fois les six créneaux `optionne` ou `confirme` : **liste d'attente** sur la Série 01, et **réservations sans limite sur la Série 02**.

**Exigences techniques, non négociables :**

- **Horodatage serveur**, à la seconde, sur l'événement de paiement confirmé par le prestataire — jamais sur le clic, jamais côté client.
- **Verrou atomique.** Deux paiements simultanés ne doivent jamais prendre le même créneau. Transaction en base avec contrôle du stock, ou verrou applicatif. Le second est basculé en liste d'attente et remboursé, ou reporté sur la Série 02 au choix du client.
- **Libération automatique** à J+30 par tâche planifiée, sans intervention humaine. Relances automatiques à J+20 et J+27.
- Le premier de la liste d'attente est notifié à la libération et dispose de **72 heures** pour réserver, ensuite on passe au suivant.
- **Le compteur public est une projection de la base, jamais une valeur saisie.** S'il affiche trois créneaux restants, il doit exister exactement trois lignes `disponible`. Un compteur de rareté qui ne reflète pas la réalité est une pratique commerciale trompeuse : ce point sera vérifié en recette.
- **Journal d'audit** : chaque changement de statut horodaté, avec l'identifiant de réservation et le motif.

Affichage : *Série 01 — 6 unités · 4 créneaux disponibles*. Pas de compte à rebours artificiel, pas de « 12 personnes regardent cette page ».

---

## 7 · Réservation et paiement

**2 000 €**, qui bloquent un créneau pendant 30 jours et déclenchent l'étude de faisabilité du terrain. Imputés sur le prix si le projet se poursuit. **Remboursés intégralement** dans tous les cas de sortie : rétractation, étude défavorable, créneau libéré faute d'acompte.

Exigences :
- Prestataire de paiement du marché, authentification forte, **aucune donnée de carte ne transite ni n'est stockée sur le serveur Howner**.
- **Le webhook serveur est la source de vérité**, pas la redirection de retour du navigateur. Un client qui ferme son onglet après paiement doit avoir sa réservation.
- **Idempotence** : un webhook rejoué ne crée pas de seconde réservation.
- Remboursement déclenchable depuis le back-office, tracé, avec notification automatique au client.
- Reçu de paiement immédiat, puis facture d'acompte émise par Howner.
- Le paiement n'est proposé qu'après acceptation explicite des conditions générales, case non pré-cochée, avec lien vers le texte intégral.

**Rétractation : 30 jours.** Formulaire type de rétractation joint aux conditions générales et à l'email de confirmation. Si l'étude démarre avant le quatorzième jour, il faut l'accord exprès du client, recueilli par une case dédiée au moment de la réservation.

---

## 8 · Écran « Votre terrain » — qualification d'accès

Aucune analyse automatique. **Aucun appel à un service de cadastre, de plan local d'urbanisme ou de géoportail.** Aucun verdict de constructibilité lié à l'adresse saisie. C'est une consigne, pas une limite technique.

En tête d'écran :
> Nos unités arrivent par camion et se posent à la grue. L'accès à votre terrain conditionne la faisabilité du projet, autant que l'urbanisme. Quelques photos et une vidéo nous permettent de vous répondre avec certitude, avant que vous n'engagiez quoi que ce soit.

**Médias demandés**, chacun avec un exemple visuel à côté du champ :
- **Une vidéo continue**, filmée en marchant depuis la voie publique jusqu'à l'emplacement prévu, en commentant. Pièce la plus utile du dossier.
- Photo de l'entrée du terrain depuis la rue
- Photo du portail ouvert
- Photo du passage le plus étroit
- Photos de l'emplacement prévu vu des quatre côtés
- Photo du ciel au-dessus de l'emplacement
- Photo des lignes aériennes s'il y en a — **obligatoire dans ce cas**

**Champs**
- Largeur du passage le plus étroit · présence d'un virage serré
- Lignes électriques ou téléphoniques traversant la parcelle ou la rue, poteaux, hauteur estimée
- Hauteur libre sur le trajet : porche, branches, auvent, fils
- Pente et nature du sol de l'aire d'approche
- Distance entre le point de stationnement possible d'un camion et l'emplacement
- Obstacles au-dessus ou autour de l'emplacement
- Contraintes de voisinage ou de circulation
- Adresse ou référence cadastrale · surface approximative du terrain
- **Une habitation existe déjà sur la parcelle** — oui / non / je ne sais pas. *Condition d'éligibilité du parcours annexe : si « non », bascule vers la page « prochainement »*
- **Raccordement aux réseaux du bâtiment existant** — oui / non / je ne sais pas
- Créneau souhaité pour l'appel de qualification

Parcours professionnel : remplacer les deux questions en gras par *nature de l'établissement*, *classement*, *nombre d'emplacements ou de clés*, *les unités s'implantent-elles sur un terrain déjà aménagé et classé*.

**Information générique en statique**, au conditionnel, jamais liée à la parcelle saisie :
> Un module de 20 m² relève en général d'une déclaration préalable, un module de 40 m² d'un permis de construire. Le régime exact dépend de votre commune, du règlement local et de la présence d'un bâtiment existant. Loi littoral, périmètre protégé, zone inondable, recul de voirie : ces points sont vérifiés par notre équipe lors de l'étude de votre terrain.

**Appel de qualification : avant la réservation, gratuit, 15 à 20 minutes.** Prise de rendez-vous intégrée à l'écran. Il évite d'encaisser sur un terrain inaccessible.

**Uploads** — contraintes techniques
- Photos : formats courants, 25 Mo par fichier, 15 fichiers maximum
- Vidéo : 500 Mo, ou champ alternatif acceptant un lien de partage externe si le fichier est plus lourd
- Compression et génération de miniatures côté serveur
- Stockage privé, accès par URL signées à durée limitée, jamais d'exposition publique
- Conservation limitée, suppression sur demande, mention dans la politique de confidentialité
- Barre de progression et reprise possible : un envoi de vidéo qui échoue silencieusement fait perdre le dossier

---

## 9 · Bloc rentabilité — parcours professionnel

Objectif : montrer ce que l'unité peut rapporter, **sans rien affirmer**.

**Mécanique imposée : le visiteur pose ses hypothèses, le site calcule.** Deux curseurs — prix moyen par nuit, taux d'occupation annuel — et une ligne de charges d'exploitation en pourcentage du revenu brut, modifiable, initialisée à 30 %. Sorties affichées : revenu brut annuel, revenu net estimé, durée d'amortissement de l'investissement configuré.

Les valeurs par défaut des curseurs sont présentées comme des repères de marché, jamais comme une prévision de Howner.

**Vocabulaire proscrit dans ce bloc** : rendement garanti, revenu assuré, investissement sûr, placement, rentabilité assurée.

Mention obligatoire, visible sans interaction, sous le résultat :
> Simulation établie à partir des hypothèses que vous saisissez. Elle ne constitue ni une prévision, ni une garantie de revenus, et ne tient compte ni de la fiscalité, ni des règles locales de location de courte durée.

Le bloc est activable par usage : sa présence dans le parcours particulier est en attente d'arbitrage (§17).

---

## 10 · Mentions et bulles — textes exacts

**Règle d'affichage.** Une bulle ne suffit jamais pour une mention essentielle : la mention courte est **visible sans interaction**, la bulle donne le détail. Les bulles doivent être accessibles au clavier et au toucher, pas uniquement au survol.

**Usage — écran 0**
> Nos unités s'implantent sur un terrain déjà bâti, ou dans un établissement d'hébergement existant. La construction d'un logement indépendant sur terrain nu arrive prochainement : inscrivez-vous pour être informé en priorité.

**Ambiance**
> Visuel d'ambiance non contractuel. Teintes, matériaux et mobilier présentés sont indicatifs et peuvent varier selon les approvisionnements. Le mobilier et la décoration ne sont pas inclus. Les références exactes sont arrêtées au dossier de personnalisation, après réservation.

Ligne fixe : *Visuel non contractuel — mobilier non inclus.*

**Option**
> Cette option est ajoutée à votre prix. Elle comprend la fourniture, la pose et la mise en service. Elle ne comprend pas les travaux de terrain ni les raccordements extérieurs. Sa faisabilité est confirmée à la visite technique.

Ligne fixe : *Options fournies et posées — hors travaux de terrain.*

**Option structurelle**
> Cette option modifie la structure de votre unité et entre dans l'étude d'exécution. Elle se choisit maintenant : elle ne pourra plus être ajoutée après votre réservation.

**Prix**
> Estimation indicative, non contractuelle. Prix TTC, TVA 20 % (construction neuve). Seul le devis signé après visite technique fait foi. Les raccordements aux réseaux, les fondations et les travaux de terrain ne sont pas compris.

Ligne fixe : *Estimation indicative — seul le devis signé fait foi.*

**Accès — écran terrain**
> Votre unité arrive par camion et se pose à la grue. Une vidéo de l'accès, filmée depuis la rue jusqu'à l'emplacement, nous permet de vous confirmer la faisabilité avant que vous n'engagiez quoi que ce soit. Si l'accès demande des moyens particuliers, nous vous le disons et nous le chiffrons.

**Terrain**
> Ces informations nous servent à préparer l'étude de votre terrain. Aucune vérification d'urbanisme n'est faite automatiquement : votre parcelle est étudiée par nos soins, à la main, après votre réservation.

Ligne fixe : *Informations transmises à notre équipe — aucune analyse automatique.*

**Créneau**
> La série 01 est limitée à six unités. Votre réservation bloque un créneau de production pendant 30 jours, le temps de l'étude de votre terrain et de la visite technique. Passé ce délai sans signature, le créneau repart au premier inscrit sur la liste d'attente et votre réservation vous est intégralement remboursée.

**Réservation**
> Votre réservation de 2 000 € bloque votre créneau et déclenche l'étude de faisabilité de votre terrain. Elle est déduite du prix si le projet se poursuit, et intégralement remboursée dans le cas contraire. Vous disposez d'un délai de rétractation de 30 jours.

**Transport**
> Forfait indicatif calculé par zone géographique, confirmé après vérification de l'accès du camion et de la grue.

---

## 11 · Emails transactionnels

Tous au nom de Howner, en vouvoiement, sans emoji.

| Déclencheur | Contenu |
|---|---|
| Configuration sauvegardée | Lien de reprise, valable 30 jours |
| Réservation confirmée | Numéro de réservation, créneau attribué, configuration complète, montant, conditions de remboursement, délai de rétractation, formulaire type, reçu |
| Dossier terrain reçu | Accusé de réception, rappel du rendez-vous d'appel |
| J+20 | Rappel : signature attendue sous 10 jours pour conserver le créneau |
| J+27 | Dernier rappel, 3 jours restants |
| Créneau libéré | Explication, confirmation du remboursement intégral, proposition de report sur la Série 02 |
| Créneau disponible (liste d'attente) | Notification, 72 heures pour réserver, lien direct |
| Acompte encaissé | Créneau confirmé, prochaines étapes |
| Inscription « prochainement » | Confirmation d'inscription, sans promesse de date |

Chaque email en version texte brut en plus du HTML. Domaine d'envoi authentifié, sous peine de finir en indésirables.

---

## 12 · Données — JSON

```json
{
  "version": "v1",
  "marque": "Howner",
  "devise": "EUR",
  "tva": 20,
  "usages": [
    { "id": "annexe", "libelle": "Une annexe sur le terrain de mon habitation",
      "eligible": true, "exige_batiment_existant": true, "bloc_rentabilite": "en_attente_arbitrage" },
    { "id": "pro", "libelle": "Des hébergements pour mon établissement",
      "eligible": true, "champ_quantite": true, "seuil_devis_dedie": 3, "bloc_rentabilite": true },
    { "id": "logement_nu", "libelle": "Un logement indépendant sur un terrain nu",
      "eligible": false, "comportement": "page_prochainement_inscription" }
  ],
  "cycles": [
    { "id": "serie_01", "libelle": "Série 01", "unites": 6, "reservation_limitee": true },
    { "id": "serie_02", "libelle": "Série 02", "unites": null, "reservation_limitee": false }
  ],
  "creneau": {
    "duree_option_jours": 30,
    "relances_jours": [20, 27],
    "delai_liste_attente_heures": 72,
    "statuts": ["disponible", "optionne", "confirme", "libere"],
    "horodatage": "serveur, sur webhook de paiement confirmé",
    "compteur_public": "projection de la base, jamais saisi"
  },
  "reservation": { "montant": 2000, "remboursable_integralement": true,
    "imputee_sur_le_prix": true, "delai_retractation_jours": 30 },
  "acompte_confirmation": { "taux": 30 },
  "modeles": [
    { "id": "one", "nom": "Arko One", "surface": 20, "emprise": "6,65 × 3,60 m",
      "prix_base_ttc": 77900, "urbanisme_generique": "En général déclaration préalable" },
    { "id": "max", "nom": "Arko Max", "surface": 40, "emprise": "4,00 × 11,00 m",
      "prix_base_ttc": 99900, "urbanisme_generique": "En général permis de construire" }
  ],
  "ambiances": [
    { "id": "littoral", "nom": "Littoral", "supplement_ttc": 0 },
    { "id": "atelier",  "nom": "Atelier",  "supplement_ttc": 0 },
    { "id": "basque",   "nom": "Basque",   "supplement_ttc": 0 }
  ],
  "terrasse": {
    "one": [ { "id": "sans", "prix_ttc": 0 }, { "id": "petite", "prix_ttc": 1990 },
             { "id": "moyenne", "prix_ttc": 2990 }, { "id": "grande", "prix_ttc": 3990 } ],
    "max": [ { "id": "sans", "prix_ttc": 0 }, { "id": "petite", "prix_ttc": 3990 },
             { "id": "moyenne", "prix_ttc": 5990 }, { "id": "grande", "prix_ttc": 7990 } ]
  },
  "options": [
    { "id": "solaire",       "nom": "Kit solaire photovoltaïque 3 kWc", "prix_ttc": 7900,
      "modeles": ["one","max"], "structurelle": true },
    { "id": "casquette",     "nom": "Casquette pare-soleil",
      "prix_ttc_par_modele": { "one": 2490, "max": 3490 }, "modeles": ["one","max"], "structurelle": true },
    { "id": "clim",          "nom": "Climatisation réversible",
      "prix_ttc_par_modele": { "one": 3490, "max": 5990 }, "modeles": ["one","max"], "structurelle": false },
    { "id": "poele_bois",    "nom": "Poêle à bois", "prix_ttc": 5900,
      "modeles": ["max"], "structurelle": true },
    { "id": "pack_location", "nom": "Pack prêt à louer", "prix_ttc": 1990,
      "modeles": ["one","max"], "structurelle": false }
  ],
  "transport": [
    { "zone": 1, "rayon_km": 60, "prix_ttc": 0 },
    { "zone": 2, "rayon_km": 150, "prix_ttc": 1500 },
    { "zone": 3, "rayon_km": 300, "prix_ttc": 2900 },
    { "zone": 4, "rayon_km": null, "comportement": "sur_etude" }
  ],
  "rentabilite": {
    "mode": "hypotheses_saisies_par_le_visiteur",
    "curseurs": ["prix_nuitee", "taux_occupation"],
    "charges_exploitation_pct_defaut": 30,
    "sorties": ["revenu_brut_annuel", "revenu_net_annuel", "duree_amortissement"],
    "vocabulaire_interdit": ["rendement garanti", "revenu assuré", "investissement sûr", "placement"]
  },
  "terrain": {
    "analyse_automatique": false,
    "medias_demandes": ["video_continue_voie_publique_vers_emplacement", "photo_entree_rue",
                        "photo_portail_ouvert", "photo_passage_le_plus_etroit",
                        "photo_emplacement_4_cotes", "photo_ciel_au_dessus", "photo_lignes_aeriennes"],
    "champs_acces": ["largeur_passage_min", "virage_serre", "lignes_aeriennes", "hauteur_libre",
                     "pente_et_nature_sol", "distance_stationnement_emplacement", "obstacles",
                     "contraintes_voisinage"],
    "appel_qualification": { "avant_reservation": true, "gratuit": true, "duree_min": 15,
                             "verdicts": ["acces_simple", "a_confirmer_sur_place",
                                          "moyens_speciaux_avec_surcout"] }
  },
  "calcul_prix_ttc": "prix_base + terrasse + options + transport",
  "vocabulaire_interdit": ["maison", "maison individuelle", "résidence principale", "clé en main",
                           "toute autre raison sociale que Howner", "tout nom de fournisseur"],
  "visuels": { "nomenclature": "{modele}_{vue}_{ambiance}.webp",
               "mention": "Visuel non contractuel — mobilier non inclus." }
}
```

Toutes ces valeurs sont éditables sans redéploiement : prix, paliers, options, nombre d'unités de la série. Elles bougeront.

---

## 13 · Back-office

Minimal mais indispensable dès la version 1 :

- Liste des réservations : numéro, date et heure d'horodatage, client, modèle, configuration complète, montant, statut, échéance des 30 jours
- Liste d'attente ordonnée, avec position et date d'inscription
- Changement de statut manuel, motivé et tracé
- Déclenchement d'un remboursement
- Accès aux médias du dossier terrain
- Export de la liste en tableur
- Journal d'audit consultable
- Compteur de créneaux en lecture seule, calculé, non modifiable à la main

---

## 14 · Contraintes techniques

**Mobile d'abord.** L'essentiel des visites se fera au téléphone. Cible de conception 390 px de large. Les bulles doivent s'ouvrir au toucher, jamais au survol seul.

**Images.** Format moderne compressé, plusieurs résolutions selon l'écran, chargement différé, préchargement de l'ambiance suivante pour que le changement soit instantané. Nomenclature `{modele}_{vue}_{ambiance}.webp`. Le poids des visuels est le premier facteur de perte de visiteurs sur ce type de parcours.

**Performance.** Affichage du contenu principal sous 2,5 secondes en 4G. Le configurateur ne doit pas dépendre d'un appel réseau pour recalculer un prix : toutes les grilles sont chargées une fois.

**Données personnelles.** Bannière de consentement conforme, mesure d'audience conditionnée au consentement, politique de confidentialité au nom de Howner, durées de conservation définies, droit d'effacement traitable depuis le back-office.

**Sécurité.** Validation systématique côté serveur, limitation du nombre de requêtes sur les formulaires, protection anti-robot discrète, contrôle du type réel des fichiers envoyés, aucun secret exposé côté navigateur.

**Accessibilité.** Navigation au clavier complète, contrastes suffisants, textes alternatifs sur les visuels, formulaires étiquetés. Les mentions légales portées par les bulles doivent être atteignables sans souris.

---

## 15 · Cas limites à traiter

| Cas | Comportement attendu |
|---|---|
| Paiement échoué | Configuration conservée, message clair, nouvelle tentative possible, aucun créneau bloqué |
| Deux paiements simultanés sur le dernier créneau | Le premier horodaté l'emporte ; le second est informé immédiatement, remboursé ou reporté à son choix |
| Plus aucun créneau pendant le tunnel | Message avant paiement, bascule proposée vers la liste d'attente ou la Série 02 |
| Onglet fermé après paiement | La réservation existe : le webhook fait foi |
| Retour en arrière après l'écran options | Choix conservés, prix recalculé |
| Option incompatible avec le modèle | Non affichée, jamais grisée avec un message d'erreur |
| Adresse hors zone 3 | Prix de transport masqué, bascule sur formulaire de contact |
| Vidéo trop lourde | Champ de lien externe proposé automatiquement |
| Abandon en cours de parcours | Email de reprise si l'adresse a été saisie et le consentement donné |

---

## 16 · Recette — à vérifier avant mise en ligne

- [ ] Le parcours « logement indépendant sur terrain nu » ne permet jamais d'atteindre un prix ni un paiement
- [ ] Le compteur public correspond exactement au nombre de lignes `disponible` en base
- [ ] Deux paiements simultanés sur le dernier créneau ne créent jamais deux réservations
- [ ] Un webhook rejoué ne crée pas de doublon
- [ ] La libération automatique à J+30 fonctionne sans intervention
- [ ] Toutes les mentions obligatoires sont visibles sans interaction, sur mobile comme sur ordinateur
- [ ] Aucune occurrence de « maison », « clé en main », « résidence principale » dans les textes
- [ ] Aucune autre raison sociale, aucun nom de fournisseur, nulle part
- [ ] Aucun appel à un service de cadastre ou d'urbanisme
- [ ] Les options réservées à l'Arko Max n'apparaissent pas sur l'Arko One
- [ ] Les options structurelles portent leur mention et sont verrouillées après réservation
- [ ] Le bloc rentabilité n'emploie aucun terme proscrit
- [ ] Les emails partent, en HTML et en texte, sans finir en indésirables
- [ ] Parcours complet testé au téléphone, de l'écran 0 au paiement

---

## 17 · En attente de validation Howner

Ces points n'empêchent pas de développer. Ils bloquent la mise en ligne.

1. **Prix affichés** : le site public porte encore d'autres montants que ceux du §5. Un seul jeu de prix doit exister.
2. **Contenu exact du socle Signature** (§4), à valider ligne par ligne.
3. **Nombre d'ambiances au lancement** : deux ou trois, selon la disponibilité des visuels. Le tableau `ambiances` doit être bouclé, jamais codé en dur.
4. **Prix des options** : des devis fournisseurs sont en cours, les montants du §5 peuvent bouger.
5. **Bloc rentabilité dans le parcours particulier** : ouvert ou réservé au professionnel.
6. **Profondeur d'ancrage de référence des fondations** et nombre de pieux compris dans le prix, au-delà desquels un complément s'applique. Sans cette limite, la ligne « fondations comprises » ne peut pas être affichée.
7. **Cotes d'accès** issues du loueur de grue, pour la grille de l'appel de qualification.
8. **Millésimes des séries** et calendrier de production affiché.
9. **Grille de remise de volume** pour les commandes professionnelles de trois unités et plus.
10. **Pages légales** : conditions générales, mentions légales, politique de confidentialité, coordonnées du médiateur de la consommation. Textes à fournir, sans quoi le paiement ne peut pas être ouvert.
