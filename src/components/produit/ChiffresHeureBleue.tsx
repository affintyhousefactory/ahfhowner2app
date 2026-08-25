"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * Les chiffres du produit — ADR-040, moment de motion n° 3.
 *
 * Ils s'incrémentent **une fois**, à l'entrée dans le cadre. Nulle part ailleurs
 * sur la page : un compteur qui se déclenche partout devient un tic.
 *
 * ⚠ La valeur finale est rendue par le serveur et reste dans le HTML. Le
 * compteur ne fait que la remplacer temporairement une fois le JS chargé —
 * sans JS, sans mouvement réduit, ou pour un moteur, le chiffre juste est là
 * dès le premier octet. C'est la même précaution que pour le `<h1>` du hero.
 *
 * Seule la partie numérique est animée : « 6,65 × 3,60 » ou « 12 sem. » gardent
 * leur forme, un compteur n'y voudrait rien dire.
 */

type Chiffre = { valeur: string; libelle: string };

/** Extrait le nombre d'un libellé quand il en porte un seul, sinon `null`. */
function nombreAnimable(valeur: string): number | null {
  const sansEspaces = valeur.replace(/ |\s/g, "");
  /* Un seul nombre, éventuellement suivi d'une unité — « 20 m² », « 12 sem. ».
     « 6,65 × 3,60 » en porte deux : on ne l'anime pas. */
  const m = /^(\d+(?:[.,]\d+)?)(?:[^\d]*)$/.exec(sansEspaces);
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  return Number.isFinite(n) && Number.isInteger(n) && n > 0 && n <= 9999 ? n : null;
}

export function ChiffresHeureBleue({ chiffres }: { chiffres: Chiffre[] }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-white/[.07] md:grid-cols-4">
      {chiffres.map((c) => (
        <Case key={c.libelle} chiffre={c} />
      ))}
    </div>
  );
}

function Case({ chiffre }: { chiffre: Chiffre }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const cible = nombreAnimable(chiffre.valeur);
  const [affiche, setAffiche] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || cible == null || reduce) return;
    if (typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      (entrees) => {
        if (!entrees.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        const commande = animate(0, cible, {
          duration: 1.1,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => setAffiche(chiffre.valeur.replace(String(cible), String(Math.round(v)))),
          onComplete: () => setAffiche(null), // on rend la main au texte du serveur
        });
        return () => commande.stop();
      },
      { rootMargin: "-12% 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [cible, reduce, chiffre.valeur]);

  return (
    <div className="flex flex-col gap-2 bg-nuit px-5 py-7 md:px-8 md:py-10">
      <span
        ref={ref}
        className="font-display text-[clamp(1.4rem,2.6vw,2rem)] tracking-[-0.02em] text-nuit-titre"
      >
        {affiche ?? chiffre.valeur}
      </span>
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-nuit-faible">
        {chiffre.libelle}
      </span>
    </div>
  );
}
