# HUB_PRODUCT — Howner / ARKO

## Rôle du HUB
Point d'entrée pour : le produit ARKO, le pricing, la mécanique de réservation. **Mono-produit** (pas de segments).

## À lire en priorité
1. `src/lib/site.ts` — `BRAND`, `PRICING`, `SPECS`, `FAQ` (vérité produit).
2. ADR-005 (pricing verrouillé), ADR-008 (acompte).

## Produit
**ARKO** — maison compacte d'architecte ~40 m², série 01, **12 exemplaires numérotés**. Pays Basque (origine livraison Bayonne). « Notre architecte intégrée ». Fondateur « Puigbo ».

## Pricing — devis 3 couches (verrouillé, ADR-005)
| Couche | Contenu |
|---|---|
| 1 — Maison | base + bardage + options + terrasse (`houseTotal`) |
| 2 — Livraison | km depuis Bayonne + grutage |
| 3 — Frais terrain | étude sol, assainissement, raccordements, permis (indicatif, hors total maison) |

Montants en env (ADR-003) : acompte 1 500 €, base ~89 900 €. **Ne jamais coder en dur.**

## Réservation
Choix d'un numéro (1–12) + acompte (Stripe, ADR-008) ; liste d'attente si épuisé (ADR-010). Jauge live (ADR-009). Échéancier 10/30/40/20 % → différé (ADR-016).

## Décisions liées
| ADR | Sujet | Statut |
|---|---|---|
| 005 | Pricing 3 couches verrouillé | Accepté |
| 008 | Acompte Stripe | Proposé |
| 016 | Échéancier paiement | Différé |

## Risques
| Risque | Gravité |
|---|---|
| Acompte/arrhes non clarifié juridiquement | Critique (ADR-015) |
| Modif pricing non concertée | Haute (ADR-005) |

## Questions ouvertes
Conditions de remboursement de l'acompte (dépend ADR-015).
