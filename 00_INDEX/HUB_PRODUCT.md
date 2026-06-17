# HUB_PRODUCT — Howner / ARKO

## Rôle du HUB
Point d'entrée pour : les produits Arko One / Arko Max, le pricing, la mécanique de réservation. **Bi-produit** (ADR-022) — pas de segments marketing.

## À lire en priorité
1. `src/lib/site.ts` — `PRODUCTS{one,max}`, `BRAND`, `CONFIG`, `SPECS`, `FAQ` (vérité produit).
2. ADR-022 (split One/Max), ADR-020 (configurateur multi-produit), ADR-005 (logique pricing), ADR-008 (acompte).

## Produits (registre `PRODUCTS`)
| Modèle | Surface | Exemplaires | Base | État données |
|---|---|---|---|---|
| **Arko One** | 20 m² | 12 | 59 900 € | grille provisoire `TODO ARKO ONE` (perM2/options/dimensions à fournir) |
| **Arko Max** | 40 m² (= ARKO historique) | 5 | 89 900 € | complète |

Origine livraison Bayonne. « Notre architecte intégrée ». Fondateur « Puigbo ». « Arko One »/« Arko Max » = noms produits (wordmark ARKO retiré de l'accueil — ADR-022).

## Pricing — devis 3 couches (verrouillé, ADR-005)
| Couche | Contenu |
|---|---|
| 1 — Maison | base + bardage + options + terrasse (`houseTotal`) |
| 2 — Livraison | km depuis Bayonne + grutage |
| 3 — Frais terrain | étude sol, assainissement, raccordements, permis (indicatif, hors total maison) |

Montants en env (ADR-003) : acompte 1 500 €, base par produit (`PRODUCTS[key].pricing.base`). **Ne jamais coder en dur.** Le configurateur lit le produit actif (sélecteur One/Max, `?produit=` — ADR-020).

## Réservation
Choix d'un numéro + acompte (Stripe, ADR-008) ; liste d'attente si épuisé (ADR-010). Jauge live par produit (ADR-009). Échéancier 10/30/40/20 % → différé (ADR-016). Réservation product-aware (`/configurer`).

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
