/**
 * Numéros de série — couture vers ADR-031 (non encore écrite).
 *
 * ADR-030 § Écarts assumés, point 2 : le mode retenu est **« demandé puis
 * confirmé »**. Le numéro n'est pas bloqué à la soumission du formulaire ; il
 * l'est à la confirmation du conseiller. Deux visiteurs peuvent donc demander
 * le même numéro — l'arbitrage est humain.
 *
 * Trois états, mais **deux seulement sont exposés au visiteur** :
 * — `confirme` → affiché « réservé », non sélectionnable ;
 * — `demande`  → reste **libre et sélectionnable** ; l'information n'apparaît
 *                qu'après sélection de ce numéro précis (un 3ᵉ état sur la
 *                grille crée de l'hésitation et brouille le compteur) ;
 * — `libre`    → sélectionnable.
 *
 * ⚠ Aujourd'hui les données sont statiques. ADR-031 les remplacera par une
 * lecture de la table des numéros, **projection de la base et jamais une
 * valeur saisie** (§6) : si le compteur affiche 3 restants, il doit exister
 * exactement 3 lignes libres.
 */

export type EtatNumero = "libre" | "demande" | "confirme";

export type Numero = {
  n: number;
  etat: EtatNumero;
};

/** Placeholder ADR-031 — à remplacer par une lecture de la base. */
export function chargerNumeros(unites: number): Numero[] {
  const CONFIRMES = new Set<number>();
  const DEMANDES = new Set<number>();
  return Array.from({ length: unites }, (_, i) => {
    const n = i + 1;
    return {
      n,
      etat: CONFIRMES.has(n) ? "confirme" : DEMANDES.has(n) ? "demande" : "libre",
    };
  });
}

/** Le compteur public ne compte que ce qui est réellement pris (§6). */
export function nbDisponibles(nums: Numero[]): number {
  return nums.filter((x) => x.etat !== "confirme").length;
}

export function estSelectionnable(x: Numero): boolean {
  return x.etat !== "confirme";
}
