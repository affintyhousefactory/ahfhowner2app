# HUB_PRODUCT — Howner / ARKO

## Rôle du HUB
Point d'entrée pour : les produits Arko One / Arko Max, le pricing, la mécanique de réservation. **Bi-produit** (ADR-022) — pas de segments marketing.

## À lire en priorité
1. `src/lib/site.ts` — `PRODUCTS{one,max}`, `BRAND`, `CONFIG`, `SPECS`, `FAQ` (vérité produit).
2. ADR-022 (split One/Max), ADR-020 (configurateur multi-produit), ADR-005 (logique pricing), ADR-008 (acompte).

## Produits (registre `PRODUCTS`)
| Modèle | Surface | Exemplaires | Base | État données |
|---|---|---|---|---|
| **Arko One** | 20 m² | 12 | **69 900 €** | base + emprise 6,65 × 3,60 m confirmées (spec §5, ADR-029) ; reste de la grille remplacé par ADR-030 |
| **Arko Max** | 40 m² (= ARKO historique) | 5 | **99 900 €** | base confirmée (spec §5, ADR-029) ; reste de la grille remplacé par ADR-030 |

Origine livraison Bayonne. « Notre architecte intégrée ». Fondateur « Puigbo ». « Arko One »/« Arko Max » = noms produits (wordmark ARKO retiré de l'accueil — ADR-022).

## Pricing — devis 3 couches (verrouillé, ADR-005)
| Couche | Contenu |
|---|---|
| 1 — Maison | base + bardage + options + terrasse (`houseTotal`) |
| 2 — Livraison | km depuis Bayonne + grutage |
| 3 — Frais terrain | étude sol, assainissement, raccordements, permis (indicatif, hors total maison) |

Montants en env (ADR-003) : acompte 1 500 €, base par produit (`PRODUCTS[key].pricing.base`). **Ne jamais coder en dur.** Le configurateur lit le produit actif (sélecteur One/Max, `?produit=` — ADR-020).

## Réservation
⚠ **Depuis le 2026-09-07 (ADR-031 § Amendement), le visiteur ne choisit plus son exemplaire.** Le
configurateur v2 recueille une **demande de rappel** — bouton « Être rappelé », `slot: null` — et le
numéro est attribué par le conseiller depuis le CRM après vérification de la disponibilité. La
grille publique affichait un état statique, jamais lu en base.

Aucun volume d'exemplaires ne s'affiche plus côté public : « Arko — édition limitée », sans nombre
(une page HPA doit pouvoir en proposer plusieurs). `SERIE_TOTAL` reste la source technique.

Historique : acompte (Stripe, ADR-008, retiré du MVP) ; liste d'attente si épuisé (ADR-010) ; jauge
live par produit (ADR-009, sans objet côté public tant qu'il n'y a plus de grille) ; échéancier
10/30/40/20 % → différé (ADR-016). ⚠ **Le tunnel v1 (`/configurer`) sert encore la grille de six
numéros** — à retirer à la bascule.

## Décisions liées
| ADR | Sujet | Statut |
|---|---|---|
| 005 | Logique pricing 3 couches verrouillée | Accepté — amendé 020 |
| 008 | Acompte Stripe | Proposé |
| 016 | Échéancier paiement | Différé |
| 020 | Configurateur multi-produit | Accepté |
| 022 | Split One/Max + repositionnement | Accepté — valider Albert |

## Risques
| Risque | Gravité |
|---|---|
| Acompte/arrhes non clarifié juridiquement | Critique (ADR-015) |
| Modif pricing non concertée | Haute (ADR-005) |

## Questions ouvertes
Conditions de remboursement de l'acompte (dépend ADR-015).
