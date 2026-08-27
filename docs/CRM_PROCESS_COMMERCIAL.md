# CRM Howner — process commercial, cibles et qualification

> **Rédigé le 2026-08-27.** Décrit le portail `/admin` **tel qu'il est en production** et le
> parcours commercial qu'il a vocation à porter. Les deux ne coïncident pas encore : ce qui
> existe est marqué ✅, ce qui reste à construire ⛔. Ne pas confondre les deux en lisant.
>
> Sources : ADR-035 (§ Amendements des 2026-08-04 et 2026-08-27), ADR-026 (§ Amendement du
> 2026-08-26), les trames de phoning et le document de services amont du projet AHF_MARKETING
> (référencés au § 6).

---

## 1. Le parcours en trois temps

Howner ne vend pas un studio de jardin au premier appel. Le chemin est :

```
phoning → qualification → premier récapitulatif → rendez-vous → services amont → devis studio → commande
```

Le CRM porte ce parcours en trois temps. **Seul le premier est livré.**

| Temps | Ce qui se passe | Dans le CRM | État |
|---|---|---|---|
| **1** | L'appel est retranscrit, un récapitulatif et la plaquette partent au prospect | Écran de pré-qualification + aperçu du récapitulatif | ✅ **en production** |
| **2** | Un rendez-vous sur site ou en visioconférence a lieu ; son retour est collecté | — | ⛔ **à construire** |
| **3** | Les services préliminaires nécessaires avant implantation sont qualifiés et vendus | — | ⛔ **à construire** |

La logique de fond, reprise du document de services amont : **monétiser le temps d'étude même si
le projet n'aboutit pas**, **lever les freins à la commande** (urbanisme, accès, sol, réseaux,
assainissement, rentabilité) et **créer un engagement progressif** vers la commande du studio.

---

## 2. Temps 1 — la pré-qualification ✅

### 2.1 L'écran

`/admin/leads/nouveau` — « Pré-qualification lead ». Il suit l'appel, dans l'ordre où les choses
se disent.

**0 · Cible commerciale — obligatoire.** En tête, avant l'identité : c'est la question qu'on se pose
avant de composer le numéro, pas après avoir raccroché. Voir § 3.

**1 · Identité** — prénom, nom, email, téléphone.

**2 · Suivi** — conseiller responsable, statut commercial, prochain rappel.

**3 · Configuration** — usage, quantité, modèle, bardage, terrasse, options. **Les grilles viennent
toutes de `loadConfig()`** : aucun prix n'est écrit dans l'écran (guardrail ADR-030).

**4 · Terrain** — trois modes : aucun, « terrain identifié » (analyse PLU), ou pack terrain (masqué,
domaine suspendu ADR-028).

**5 · Notes** — la retranscription libre de l'appel.

### 2.2 Le transport se calcule pendant l'appel

Dès que l'analyse PLU rend les coordonnées de la parcelle, l'écran affiche la distance **et le
détail du calcul** :

```
412 km depuis l'atelier de Bayonne · grutage 1 440 € + 412 km × 2,16 €/km (9 t) = 2 330 €
```

Le détail, pas seulement le résultat : un conseiller qui annonce un prix au téléphone doit pouvoir
dire d'où il sort si le client le lui demande.

**Sans terrain identifié, rien n'est calculé** — et l'écran le dit en clair. Un zéro se lirait
comme une livraison offerte.

Le champ « Transport » reste une **surcharge**, pas un pré-remplissage : le calcul reste vivant
quand le conseiller change de modèle (le poids change, donc le prix), et une valeur tapée reste une
décision, signalée « surchargé à … ».

⚠ Les coordonnées de l'atelier (`TRANSPORT.usine`) sont **approximatives**. Sur 300 km l'écart est
dans le bruit ; sur un client à 15 km, il se voit.

### 2.3 Le récapitulatif se relit avant de partir

L'enregistrement du lead **ne redirige pas** : l'écran bascule sur la relecture. Le conseiller vient
de raccrocher, c'est maintenant qu'il sait si ce qui part est juste.

- L'aperçu affiche le **vrai template Brevo** peuplé des valeurs du lead, dans une iframe.
- Le template est lu **chez Brevo**, pas dans le dépôt : c'est Brevo qui enverra, donc c'est son
  template qui fait foi.
- L'aperçu et l'envoi consomment **la même** fabrique de valeurs (`construireParamsRecap()`) — deux
  constructions pour un même email, c'est un écran qui finit par montrer autre chose que ce qui
  part, et il montrerait des prix.

Puis « Envoyer le récapitulatif ». L'email emporte la configuration, le total, la ligne de livraison
avec sa distance, et **le lien vers la plaquette** (`public/documents/plaquette-howner-2026.pdf`).

**Un lien, pas une pièce jointe** : une pièce jointe alourdit l'email, dégrade la délivrabilité et
ne dit rien, là où un lien se mesure dans Brevo. **Un fichier désigné, pas « le dernier d'un
dossier »** : sinon on envoie un brouillon le jour où quelqu'un rouvre un document pour corriger
une virgule.

`leads.recap_envoye_at` trace l'envoi — sans quoi, à deux conseillers, le client reçoit deux fois
le même devis.

### 2.4 Le journal d'appels

`lead_appels` enregistre chaque échange : sens, **issue** (Joint · Répondeur · Pas de réponse ·
Rappel demandé · Refus), note, durée, auteur, prochain rappel. Un trigger propage sur le lead la
date du dernier appel **et son issue**.

**L'issue remonte sur le lead** (`leads.derniere_issue`, 2026-08-27) : visible dans la liste, sur la
carte du Kanban et sur la fiche, et **filtrable** — « tous les répondeurs à relancer » est le geste
d'une campagne. Elle reste un **axe distinct** du statut commercial : celui-ci dit où en est
l'affaire, l'issue dit comment s'est terminé le dernier échange. Un lead peut être « En discussion »
et avoir eu un répondeur ce matin ; les fondre en un seul champ ferait perdre l'un des deux.

L'issue retenue est celle du **dernier appel qui en porte une** — le formulaire accepte une note
sans issue, et un commentaire ajouté après coup ne doit pas effacer le « Répondeur » de la veille.
Corrigeable à la main depuis la fiche, mais le trigger reprend la main au prochain appel journalisé :
la saisie est un rattrapage, le journal reste la source.

⚠ **Aucune issue ne décrit un rendez-vous.** C'est le manque qui bloque le temps 2 (§ 5).

### 2.5 Les statuts et le tableau de bord

Neuf statuts commerciaux, déclarés une seule fois dans `src/lib/crm.ts` :

`Nouveau` → `À rappeler` → `Contact pris` → `En discussion` → `Devis envoyé` →
`Paiement réservé` → `Signé` · `Non retenu` · **`Erreur / Test / Doublon`**

- `Paiement réservé` constate un **fait comptable** (l'encaissement de la réservation du numéro),
  pas une appréciation du conseiller.
- **`Erreur / Test / Doublon`** est le rebut : une saisie de test, un doublon, une frappe ratée. Il
  est **retiré du Kanban** — mêlées aux vraies, ces lignes faussent les compteurs — mais **jamais
  supprimé** : le lead reste en base et dans la vue tableau, avec un compteur et un lien pour le
  retrouver.

---

## 3. Les cinq cibles commerciales

Elles ne sont pas une catégorisation a posteriori : **chacune a sa trame d'appel** — accroche, punch
lines, objections propres. Renseigner la cible, c'est enregistrer **avec quelle trame l'appel a été
mené**. Un lead sans cible est un appel dont on ignore ce qui a été dit.

| № | Cible | Codes NAF rév. 2 |
|---|---|---|
| 1 | **Campings et hôtellerie de plein air** | `55.30Z` Terrains de camping et parcs pour caravanes ou véhicules de loisirs |
| 2 | **Hôtels, domaines, gîtes et hébergements touristiques** | `55.10Z` Hôtels et hébergement similaire · `55.20Z` Hébergement touristique et autre hébergement de courte durée |
| 3 | **EHPAD, résidences services seniors, médico-social** | `87.10A` Hébergement médicalisé pour personnes âgées · `87.30A` Hébergement social pour personnes âgées · `87.10C` Hébergement médicalisé pour adultes handicapés · `87.30B` Hébergement social pour handicapés physiques |
| 4 | **Collectivités, employeurs et logement des saisonniers** | `84.11Z` Administration publique générale · `55.90Z` Autres hébergements · `68.20B` Location de terrains et d'autres biens immobiliers |
| 5 | **Particuliers investisseurs disposant de fonds** | `68.20A` Location de logements — **seulement si l'investissement passe par une SCI** |

**⚠ Nomenclature NAF rév. 2, pas NAF 2025.** Chaque libellé a été vérifié sur insee.fr le
2026-08-27. La NAF 2025 est publiée mais **ne codera les APE qu'au 1er janvier 2027** : jusque-là,
les codes portés par les entreprises — et par les fichiers de prospection — sont ceux de la rév. 2.
**À revoir à la bascule.**

**La cinquième cible n'a pas de code par défaut** : un particulier n'exerce pas d'activité
enregistrée. En inventer un aurait rendu la colonne inexploitable pour le ciblage.

Les codes servent au ciblage et au rapprochement avec les fichiers de prospection. **Ils orientent,
ils ne tranchent pas** : un camping exploité en société civile peut porter un code immobilier. C'est
le conseiller qui décide, la liste l'aide.

### ⚠ Un écart de nomenclature à résoudre

Le document de services amont utilise une **segmentation différente** pour sa cible 2 :

| № | CRM & trames de phoning | Document de services amont |
|---|---|---|
| 1 | Campings et hôtellerie de plein air | Hôtellerie de plein air / Tourisme / Campings |
| 2 | **Hôtels, domaines, gîtes et hébergements touristiques** | **Entreprises et professionnels** |
| 3 | EHPAD, résidences services seniors, médico-social | Médico-social / Soins / Hébergement spécialisé |
| 4 | Collectivités, employeurs et logement des saisonniers | Collectivités / Institutions |
| 5 | Particuliers investisseurs disposant de fonds | Investisseurs / Exploitants à financement sécurisé |

Le document de services le reconnaît lui-même : « cette nomenclature pourra être renommée pour
reprendre exactement celle de la trame de phoning ». **C'est la nomenclature du CRM qui fait foi** —
c'est elle qui est contrainte en base (`leads_cible_commerciale_check`) et qui correspond aux
trames réellement utilisées au téléphone. Les services du § 6 sont rattachés ci-dessous à la cible
CRM correspondante, et l'écart est signalé là où il porte à conséquence.

---

## 4. La qualification : trames et fichiers de prospection

### 4.1 Les trames de phoning

**[Trames de phoning HOWNER — par ciblage](https://docs.google.com/document/d/1P4D6KgRjYTO4i_L4pGgtgs73dZIzh9bAZeC_I4D5mOo/edit)**
(Drive partagé « AHF - Marketing », dossier `Commerce`).

Le document contient, pour chacune des cinq cibles : ce que vit l'interlocuteur en ce moment,
l'accroche, les punch lines, les objections spécifiques — plus une **trame commune de barrage** en
quatre niveaux (attaque directe, « c'est de la part de qui ? », « c'est à quel sujet ? », et la
sortie quand ça ne passe pas).

Deux règles de terrain, à ne jamais enfreindre :

- **ne jamais désigner le produit par « maison » ni par « CCMI »** (ADR-029) ;
- **ne jamais laisser entendre que les pieux vissés dispensent d'autorisation d'urbanisme** — le
  droit classe tout bâtiment ancré au sol en construction permanente.

### 4.2 Les fichiers de prospection

Trois classeurs Google Sheets, **354 campings qualifiés** sur les trois départements :

| Fichier | Volume |
|---|---|
| [Prospection HPA 64](https://docs.google.com/spreadsheets/d/1ib7D3xw7wWwddE4QmYkd07jrpVqFD2RyPO6_Tris0ZQ/edit) | 101 campings |
| [Prospection HPA 40](https://docs.google.com/spreadsheets/d/1DKYYDTIgva1vdfEP36iNxcwGm7EcRsoSwZSmSg5ryrc/edit) | 136 campings |
| [Prospection HPA 33](https://docs.google.com/spreadsheets/d/1h2H007ZcHp61DiLWW7Y4KqzTgmaE0Tn8aqRRPEH0K3s/edit) | 117 campings |
| [Méthodologie et sources](https://docs.google.com/document/d/1ZvdkGIXI2bqQStxTIVntAQg0SWmHCuWCm-wA9ClpJkk/edit) | — |

Ces fichiers alimentent la **cible 1**. C'est là que les codes NAF servent : `55.30Z` est le code
qui identifie un terrain de camping dans les bases d'entreprises.

⛔ **Aucun lien automatique entre ces classeurs et le CRM.** Un lead se saisit à la main dans
`/admin/leads/nouveau` pendant ou après l'appel. Un import serait un chantier à part entière (et un
ADR).

### 4.3 Les questions qui ouvrent la vente des services amont

Reprises du document de services, à poser pendant l'appel :

1. Avez-vous déjà identifié le terrain ou l'emplacement ?
2. Êtes-vous propriétaire, ou avez-vous la maîtrise du foncier ?
3. Connaissez-vous le zonage PLU / PLUi ?
4. Quel usage envisagez-vous pour le studio ?
5. S'agit-il d'une unité ou de plusieurs ?
6. Quel est votre objectif de mise en service ?
7. Les réseaux sont-ils présents à proximité ?
8. Le terrain est-il accessible à un semi-remorque, à un camion-grue ?
9. Une étude de sol ou un relevé topographique existe-t-il ?
10. Pour un investissement : quel rendement ou revenu cible ?
11. Pour une organisation : qui valide le budget et la décision finale ?
12. Quel budget global, hors ou avec aménagements extérieurs ?

Les questions 1 à 3 et 7 à 9 alimentent directement les champs Terrain de l'écran ; la 5 alimente
la quantité ; la 4 alimente l'usage.

**Le CTA de fin d'appel n'est pas « voulez-vous acheter un studio ? »** mais :

> « La prochaine étape utile est de vérifier que votre site peut réellement accueillir un ARKO et
> d'établir le budget complet avant de vous engager. Nous pouvons réaliser cette étude de
> faisabilité pour vous. »

---

## 5. Temps 2 — le retour de rendez-vous ⛔

**Rien n'existe pour l'instant.** Ce qu'il faudrait, dans l'ordre de dépendance :

1. **Un type de rendez-vous** — sur site ou en visioconférence — avec sa date. Les issues d'appel
   actuelles (§ 2.4) n'en décrivent aucun.
2. **Un compte rendu structuré** : ce qui a été vu, les contraintes relevées, la décision du
   prospect, la prochaine étape.
3. **Les constats qui conditionnent les services** — accès camion-grue, réseaux, sol, zonage,
   nombre d'unités envisagées : ce sont eux qui déterminent quels services du § 6 sont nécessaires.

Le point 3 est le pivot : c'est lui qui permet au temps 3 d'être une **conséquence** de ce qu'on a
constaté, et non une liste de services proposée au jugé.

---

## 6. Temps 3 — les services préliminaires ⛔

Source : `HOWNER_services_amont_par_cible_2026-08-27.md` (Drive « AHF - Marketing », dossier
`Commerce`).

> ⚠ **Version préliminaire.** Les prix sont des **ordres de grandeur HT** à valider par devis et
> partenariats locaux (Pays Basque, Landes, Gironde). Ils ne sont pas contractuels, et **rien de
> tout cela n'est encore dans le CRM**.

### 6.1 Les cinq niveaux

| Niveau | Service | Prix conseillé HT | Déduit de la commande ARKO |
|---|---|---:|---|
| 0 | Qualification téléphonique | Gratuit | — |
| 1 | Diagnostic de faisabilité | 190 à 790 € | 50 à 100 % |
| 2 | Études techniques / administratives | 590 à 3 900 € | 0 à 50 % |
| 3 | Étude de programme / implantation multi-unités | 1 490 à 5 900 € | 25 à 50 % |
| 4 | Prestations réglementaires tierces | Refacturation + coordination | Non, ou partiellement |

La **déduction** est ce qui fait de ces services une étape de conversion et non un frein : le
diagnostic à 190–290 € est déduit à 100 % de la commande, l'étude de faisabilité à 50–100 %. Les
études tierces (géomètre, G2, ANC, BET) ne sont jamais déduites — ce sont des coûts réels
refacturés.

### 6.2 Les cinq offres à lancer en priorité

Plutôt qu'une grille complète d'emblée, cinq produits :

| Offre | Contenu | Prix HT | Cible CRM visée |
|---|---|---:|---|
| **Diagnostic Howner** | Urbanisme préliminaire, implantation, accès, contraintes majeures | 290 € | Toutes |
| **Étude Faisabilité Howner** | Diagnostic approfondi, implantation, budget global, Go/No-Go | 690 € | Toutes |
| **Pack Projet Investisseur** | Faisabilité, budget, scénario de rendement, planning | 990 € | 5 |
| **Pack Projet Pro / HPA** | Implantation, capacité, VRD préliminaire, budget, scénario économique | 1 490 € | 1 et 2 |
| **Pack Projet Institution** | Programme, implantation, contraintes réglementaires, budget, planning | à partir de 2 900 € | 3 et 4 |

⚠ Le « Pack Projet Pro / HPA » vise, dans le document source, la cible « Entreprises et
professionnels ». Rapporté à la nomenclature du CRM, il couvre les cibles **1** (campings) et **2**
(hôtels, domaines, gîtes) — c'est l'écart signalé au § 3.

### 6.3 La grille détaillée

21 services codifiés `HWR-001` à `HWR-200`, chacun avec son type (interne, mixte, sous-traité), son
coût d'achat estimatif, son prix de vente conseillé et sa déductibilité. Les plus structurants :

| Code | Service | Type | Prix HT | Déductible |
|---|---|---|---:|---|
| `HWR-010` | Diagnostic express de faisabilité | Interne | 190 à 290 € | 100 % |
| `HWR-020` | Étude de faisabilité parcelle / site | Mixte | 490 à 790 € | 50–100 % |
| `HWR-030` | Étude d'implantation ARKO | Mixte | 690 à 1 290 € | Partiellement |
| `HWR-040` | Étude de capacité multi-unités | Mixte | 990 à 1 990 € | Partiellement |
| `HWR-050` | Audit accès / livraison / grutage | Sous-traité | 390 à 690 € | Partiellement |
| `HWR-060` | Budget global projet | Interne | 390 à 690 € | 100 % |
| `HWR-070` | Étude de rentabilité / ROI | Interne | 590 à 990 € | 0 à 50 % |
| `HWR-080` | Dossier de déclaration préalable | Sous-traité | 690 à 990 € | Non |
| `HWR-090` | Dossier de permis de construire | Sous-traité | 1 490 à 2 900 € | Non |
| `HWR-110` | Étude géotechnique G2 AVP | Sous-traité | 1 900 à 3 900 € | Non |
| `HWR-150` | Audit accessibilité / PMR | Sous-traité | 790 à 1 990 € | Non |
| `HWR-160` | Pré-étude sécurité ERP | Sous-traité | 990 à 2 490 € | Non |

Le détail complet — 21 lignes, coûts d'achat, modèles de marge, politique de sous-traitance,
repères de coûts 2026 — vit dans le document source. **Ne pas le recopier ici** : il évoluera, et
deux copies divergent toujours.

### 6.4 Ce que le CRM devrait porter

Pour que le temps 3 existe :

- une **ligne de services** attachée au lead (service, prix, statut : proposé / accepté / réalisé) ;
- le **montant déductible** cumulé, à reporter sur le devis du studio ;
- le lien entre les **constats du rendez-vous** (§ 5) et les services proposés, pour qu'ils
  découlent d'un besoin établi ;
- une **grille de services éditable sans redéploiement** — même règle que les grilles du
  configurateur (ADR-030) : les prix ci-dessus sont préliminaires, ils bougeront.

Ce chantier mérite son propre ADR.

---

## 7. Ce qui bloque, ce qui manque

| Point | Nature |
|---|---|
| Temps 2 et 3 inexistants dans le CRM | Chantier à ouvrir (ADR) |
| Aucun lien entre les classeurs de prospection et le CRM | Saisie manuelle assumée |
| Nomenclature des cibles divergente entre CRM et document de services | À trancher — le CRM fait foi |
| Prix des services préliminaires non validés | Devis et partenariats locaux attendus |
| Codes NAF rév. 2 → NAF 2025 au 1er janvier 2027 | À revoir à la bascule |
| Coordonnées exactes de l'atelier | Attendues — le transport en dépend |
| Les leads antérieurs au 2026-08-27 n'ont pas de cible | Les statistiques par cible ne partent que de cette date |
| L'encaissement n'est pas branché (ADR-008) | Le statut « Paiement réservé » se pose à la main |

---

## 8. Où vivent les choses

| Sujet | Fichier |
|---|---|
| Statuts, cibles, conseillers, issues d'appel | `src/lib/crm.ts` |
| Écran de pré-qualification | `src/app/(admin)/admin/(protected)/leads/nouveau/page.tsx` |
| Fiche du lead | `src/components/admin/LeadEditIdentite.tsx` |
| Liste, tableau et Kanban | `src/components/admin/LeadsVue.tsx` |
| Aperçu et envoi du récapitulatif | `src/components/admin/RecapClientApercu.tsx` |
| Paramètres du récapitulatif (source unique) | `src/shared/lib/recap-client.ts` |
| Grilles, transport, distance | `src/lib/configurateur/config.ts` |
| Plaquette et constantes de marque | `src/lib/site.ts` |
| Décisions | `03_DECISIONS/ADR-035`, `ADR-026`, `ADR-030`, `ADR-029` |
