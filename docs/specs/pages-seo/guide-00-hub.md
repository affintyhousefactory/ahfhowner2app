# CANVAS — Page « Guides & Réglementation » Howner

**Route cible :** `/guide/`  
**Type :** page hub éditoriale / SEO / conversion  
**H1 :** Guides & Réglementation — réussir son projet de studio de jardin  
**Meta title suggéré :** Guides studio de jardin : permis, prix et réglementation | Howner  
**Meta description suggérée :** Permis, déclaration préalable, prix, surface, location et agrandissement : les guides Howner pour préparer un projet de studio de jardin en toute clarté.

## Cadre de marque Howner

- Howner conçoit des **studios de jardin premium / d’exception**.
- Gamme à mettre en avant : **ARKO One** et **ARKO Max**.
- Technologie : structure légère en acier **Light Steel Frame (LSF)**, fabrication hors-site.
- Promesse éditoriale : design, qualité maîtrisée, lisibilité du projet, fabrication préparée en atelier, installation organisée sur site.
- Ne pas employer « maison » comme terme générique de gamme. Préférer « studio de jardin », « espace habitable », « dépendance », « module habitable » selon le contexte.
- Ne jamais promettre « sans permis » sans préciser le régime administratif réellement applicable.
- Ne jamais garantir qu’un projet est constructible avant vérification du PLU, des règles locales et du terrain.
- CTA principal : **Configurer mon studio** → `/configurer/v2`
- CTA produits :
  - ARKO One → `/studio-jardin-arko-one/`
  - ARKO Max → `/studio-jardin-arko-max/`
- CTA hub : Guides & Réglementation → `/guide/`


## Objectif de la page

Créer une page éditoriale sobre, premium et immédiatement lisible qui :
1. répond aux questions concrètes avant achat ;
2. rassure sans minimiser les contraintes réglementaires ;
3. transforme une recherche informationnelle en projet qualifié ;
4. distribue le trafic SEO vers des articles spécialisés ;
5. ramène régulièrement vers le configurateur Howner.

## Direction UX

La page doit évoquer un **centre de ressources premium**, pas un blog générique.

### Hero
- Eyebrow : `GUIDES HOWNER`
- H1 : `Guides & Réglementation`
- Accroche : `Permis, prix, implantation, location : les réponses utiles pour transformer une idée de studio de jardin en projet concret.`
- CTA primaire : `Configurer mon studio` → `/configurer/v2`
- CTA secondaire : `Découvrir ARKO One` → `/studio-jardin-arko-one/`
- Micro-rassurance : `Les règles varient selon votre commune et votre terrain. Nos guides vous donnent les bons réflexes avant de lancer votre projet.`

### Bloc d’introduction
Texte court :
> Un studio de jardin habitable est une construction à part entière. Surface, usage, implantation, raccordements et réglementation locale conditionnent la faisabilité. Cette bibliothèque rassemble les principales questions à examiner avant de configurer votre projet Howner.

## Composant principal : liste d’aperçus d’articles

Créer une liste verticale, très aérée, avec séparateurs fins.

Chaque ligne comprend :
- catégorie en petit label ;
- titre de l’article ;
- résumé de 130 à 180 caractères ;
- à droite un **petit bouton rond “+”** ;
- toute la ligne doit être cliquable ;
- au hover : léger déplacement du `+`, soulignement discret du titre ou variation de fond ;
- accessibilité : le bouton doit porter un `aria-label="Lire le guide …"`.

### Articles à afficher

1. **Réglementation et permis pour un studio de jardin de 20 m²**  
   Route : `/guide/reglementation-permis/`  
   Aperçu : `Déclaration préalable, PLU, implantation, secteurs protégés : les vérifications essentielles avant d’installer un studio de jardin.`

2. **Prix d’un studio de jardin habitable**  
   Route : `/guide/prix-studio-jardin-habitable/`  
   Aperçu : `Structure, équipements, fondations, transport, raccordements : comprendre ce qui compose réellement le budget d’un studio de jardin.`

3. **Agrandir sans déménager**  
   Route : `/guide/agrandir-sans-demenager/`  
   Aperçu : `Créer une chambre, un bureau ou un logement indépendant dans son jardin peut être une alternative élégante à un déménagement.`

4. **Permis pour un studio de jardin de 20 m²**  
   Route : `/guide/permis-studio-jardin-20m2/`  
   Aperçu : `Pourquoi 20 m² est un seuil clé, ce que permet la déclaration préalable et les cas où les règles locales changent la donne.`

5. **Permis pour un studio de jardin de 40 m²**  
   Route : `/guide/permis-studio-jardin-40m2/`  
   Aperçu : `Pour une construction nouvelle de 40 m², le permis de construire est en principe la référence. Voici les points à anticiper.`

6. **Prix réel d’un studio de jardin habitable**  
   Route proposée : `/guide/prix-reel-studio-jardin-habitable/`  
   Aperçu : `Au-delà du prix affiché : taxes, accès, fondations, raccordements et options à intégrer pour estimer une enveloppe réaliste.`  
   **Note Claude :** le brief initial donnait le même slug que l’article n°2. Ne pas publier deux contenus sur la même URL. Conserver cette route distincte ou fusionner les articles 2 et 6 avec redirection 301.

7. **Quelle surface habitable sans permis de construire ?**  
   Route : `/guide/surface-habitable-sans-permis/`  
   Aperçu : `Le seuil de 20 m² est souvent cité, mais “sans permis” ne veut pas dire “sans autorisation”. Comprendre les règles avant d’agir.`

8. **Créer un logement indépendant dans son jardin**  
   Route : `/guide/logement-independant-jardin/`  
   Aperçu : `Pour un proche, un étudiant ou un usage locatif : les points d’attention pour créer un véritable espace autonome dans son jardin.`

9. **Studio de jardin pour location saisonnière**  
   Route : `/guide/studio-jardin-location-saisonniere/`  
   Aperçu : `Urbanisme, confort, exploitation et règles des meublés de tourisme : ce qu’il faut vérifier avant de viser la location courte durée.`

## Bloc conversion intermédiaire

Après le 4e ou 5e article :

**Titre :** `Vous connaissez déjà votre usage ? Passez à votre configuration.`  
**Texte :** `Surface, aménagement, niveau d’équipement : composez une première version de votre studio ARKO et donnez une forme concrète à votre projet.`  
**CTA :** `Configurer mon studio` → `/configurer/v2`

## Bloc « Choisir son format »

Deux cartes :
- **ARKO One** — le format compact pour bureau, chambre indépendante, espace invité ou projet locatif compact.
- **ARKO Max** — davantage d’espace pour créer une dépendance habitable plus complète.

CTA carte One : `Découvrir ARKO One`  
CTA carte Max : `Découvrir ARKO Max`

## Bloc de réassurance réglementaire

Titre : `Un guide éclaire. Le terrain décide.`

Texte :
> Les seuils nationaux ne remplacent jamais la lecture du PLU, des servitudes, des règles d’implantation, des contraintes d’accès et de la destination du projet. Howner doit rester précis : nous aidons à structurer le projet, sans transformer une règle générale en promesse automatique de constructibilité.

## SEO / maillage interne

- Chaque article renvoie vers 2 à 4 autres guides pertinents.
- Chaque article contient au minimum 2 CTA vers `/configurer/v2`.
- Ajouter un fil d’Ariane : `Accueil > Guides & Réglementation > Article`.
- Ajouter `Article` schema.org sur les pages article.
- Ajouter `ItemList` ou `CollectionPage` sur le hub.
- Les FAQ peuvent utiliser `FAQPage` uniquement si leur contenu est réellement visible sur la page et conforme aux pratiques SEO en vigueur.

## Critères de réussite

- compréhension immédiate des sujets ;
- aucune ambiguïté « sans permis = sans formalité » ;
- design premium cohérent avec Howner ;
- navigation mobile fluide ;
- CTA configurateur visible sans être agressif ;
- aucune duplication d’URL ;
- maillage interne systématique ;
- contenus faciles à enrichir avec de nouveaux guides.

## Sources de référence à conserver / vérifier avant publication

Sources réglementaires consultées le 19/08/2026 :
- Code de l’urbanisme, constructions nouvelles : https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074075/LEGISCTA000006176110/
- Article R.421-1 du Code de l’urbanisme : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051190132/
- Article R.421-9 du Code de l’urbanisme : https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074075/LEGISCTA000006188272/
- RE2020 — Ministère de la Transition écologique : https://www.ecologie.gouv.fr/politiques-publiques/reglementation-environnementale-re2020
- Simulateur officiel des taxes d’urbanisme : https://www.impots.gouv.fr/simulateur-des-taxes-durbanisme
- Location meublée de tourisme — Ministère de l’Économie : https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/location-meublee-de-tourisme-quelles-sont-les-regles-respecter-pour-sa-residence

Règle éditoriale : ne jamais présenter ces contenus comme un avis juridique individualisé. Le PLU, les servitudes, les secteurs protégés, l’usage projeté, l’emprise au sol, la surface de plancher et les caractéristiques du terrain peuvent modifier la procédure applicable.

