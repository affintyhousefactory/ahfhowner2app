"use client";

/**
 * Compartiments de la fiche d'un lead.
 *
 * La fiche empilait six blocs sur deux colonnes : identité, configuration,
 * appels, GED client, terrain, GED mandataire. Il fallait défiler pour trouver
 * le journal d'appels — c'est-à-dire l'écran qu'on ouvre le plus souvent, quand
 * on rappelle quelqu'un.
 *
 * Elle reprend donc les compartiments de `/leads/nouveau`, avec une différence
 * qui n'est pas cosmétique : **ce sont des onglets, pas des étapes**. On ne
 * progresse pas dans une fiche existante, on y revient — et à l'endroit qu'on
 * veut. La barre de création numérote (1, 2, 3…) parce qu'un premier appel a un
 * ordre ; celle-ci ne numérote pas.
 *
 * ⚠ **Les contenus arrivent en props, pas en imports.** Ce composant est client
 * — il tient l'onglet courant — mais les blocs qu'il affiche sont rendus par la
 * page, côté serveur. Les recevoir déjà rendus évite de faire traverser la
 * frontière client à `lead`, aux documents et aux mandataires.
 *
 * ⚠ **Montage à la première visite, puis conservation.** Un onglet jamais ouvert
 * n'est pas rendu ; dès qu'il l'a été une fois, il reste monté et se contente
 * d'être masqué. Ce compromis règle deux problèmes opposés :
 *
 * - **tout monter d'emblée** cassait la carte. Leaflet, initialisé dans un
 *   conteneur en `display:none`, se dimensionne à zéro et n'affiche que des
 *   tuiles grises une fois révélé — il faudrait un `invalidateSize()` à
 *   l'ouverture. Ne le monter que visible évite le problème à la racine, et
 *   épargne au passage les requêtes du journal d'appels et de la GED tant que
 *   personne ne les regarde ;
 * - **tout démonter en sortant** viderait un formulaire d'identité à demi
 *   rempli parce qu'on a jeté un œil aux appels, et ferait recharger le journal
 *   à chaque aller-retour.
 */

import { useState } from "react";
import { cn } from "@/shared/lib/cn";

export type OngletFiche = {
  id: string;
  titre: string;
  /** Compteur discret : nombre d'appels, de pièces… `null` pour n'en pas mettre. */
  compte?: number | null;
  contenu: React.ReactNode;
};

export function LeadOnglets({ onglets }: { onglets: OngletFiche[] }) {
  const premier = onglets[0]?.id ?? "";
  const [actif, setActif] = useState(premier);
  /* Les onglets déjà ouverts, qui restent montés ensuite. */
  const [visites, setVisites] = useState<Set<string>>(() => new Set([premier]));

  function ouvrir(id: string) {
    setActif(id);
    setVisites((v) => (v.has(id) ? v : new Set(v).add(id)));
  }

  return (
    <div>
      <nav
        aria-label="Sections de la fiche"
        className="mb-5 flex flex-wrap gap-1.5 border-b border-white/10 pb-3"
      >
        {onglets.map((o) => {
          const courant = o.id === actif;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => ouvrir(o.id)}
              aria-current={courant ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors",
                courant
                  ? "border-[#7469F4] bg-[#7469F4]/15 text-white"
                  : "border-white/10 bg-white/5 text-white/45 hover:border-white/25 hover:text-white/70",
              )}
            >
              {o.titre}
              {/* Le compteur dit s'il y a quelque chose à voir sans avoir à
                  ouvrir : « Appels 3 » évite d'aller vérifier qu'il n'y a rien. */}
              {o.compte != null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    courant ? "bg-[#7469F4] text-white" : "bg-white/10 text-white/40",
                  )}
                >
                  {o.compte}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {onglets.map((o) =>
        visites.has(o.id) ? (
          <div key={o.id} hidden={o.id !== actif}>
            {o.contenu}
          </div>
        ) : null,
      )}
    </div>
  );
}
