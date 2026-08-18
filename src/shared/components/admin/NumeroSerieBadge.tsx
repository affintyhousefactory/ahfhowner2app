/**
 * Numéro de série demandé par le client, affiché à côté du modèle.
 *
 * Le badge ne dit pas seulement *quel* numéro : il dit **à quel point il est
 * pris**, parce que c'est la seule information qui compte pour un conseiller
 * qui arbitre entre deux leads sur le même numéro (ADR-035 § Amendement du
 * 2026-08-04) :
 *
 * — rien d'engagé  → gris, le numéro est un simple souhait ;
 * — devis envoyé   → ambre, « réservé » — retiré des propositions, pas encore
 *                     payé, donc reprenable ;
 * — paiement encaissé (ou signé) → teal plein, « bloqué » — définitif.
 *
 * L'état n'est pas stocké : il se déduit du statut commercial via
 * `etatNumeroPourStatut()`, seule source de la règle.
 */
import { etatNumeroPourStatut } from "@/lib/crm";

export function NumeroSerieBadge({
  slot,
  statut,
  className = "",
}: {
  slot: number | null | undefined;
  statut: string | null | undefined;
  className?: string;
}) {
  if (slot == null) return null;

  const etat = etatNumeroPourStatut(statut);
  const style =
    etat === "confirme"
      ? { cls: "bg-teal-500/20 text-teal-300 ring-1 ring-inset ring-teal-400/30", titre: "Numéro bloqué — réservation encaissée" }
      : etat === "demande"
        ? { cls: "bg-amber-500/15 text-amber-300/90 ring-1 ring-inset ring-amber-400/20", titre: "Numéro réservé — devis envoyé, paiement non encaissé" }
        : { cls: "bg-white/5 text-white/35", titre: "Numéro souhaité — rien ne le bloque à ce stade" };

  return (
    <span
      title={style.titre}
      className={`ml-2 shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none ${style.cls} ${className}`}
    >
      N°&nbsp;{slot}
    </span>
  );
}
