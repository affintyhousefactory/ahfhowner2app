"use client";

/**
 * Configurateur v2 — orchestrateur du parcours en 7 écrans (ADR-030).
 *
 * Mobile d'abord, cible 390 px : un écran à la fois, barre de prix ancrée en
 * bas. Le compteur de prix apparaît à l'écran 1 et ne quitte plus la vue —
 * l'écran 0 n'en a pas, la branche « terrain nu » ne doit jamais afficher de
 * montant (§16, critère n°1).
 */

import { useState } from "react";
import { MENTIONS } from "@/lib/configurateur/mentions";
import { ConfigurateurProvider, ETAPES, useConfigurateur } from "./store";
import { BarrePrix, Progression } from "./ui";
import { Ecran0Usage } from "./Ecran0Usage";
import { Ecran1Modele } from "./Ecran1Modele";
import { Ecran2Ambiance, Ecran3Terrasse, Ecran4Options, Ecran5Terrain } from "./Ecrans234";
import { Ecran6Recap } from "./Ecran6Recap";

function Parcours() {
  const c = useConfigurateur();
  const [cgvOk, setCgvOk] = useState(false);

  const usageDef = c.cfg.usages.find((u) => u.id === c.usage);
  const brancheFermee = c.usage === "logement_nu";
  const dernier = c.etape === 6;

  /* L'écran 0 n'a pas de barre de prix, et la branche fermée n'en aura jamais. */
  const barreVisible = c.etape > 0 && !brancheFermee;

  const peutAvancer = c.etape !== 0 || (c.usage != null && !brancheFermee);

  return (
    <div className="flex min-h-[100svh] flex-col bg-canvas">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8 pt-6">
        <Progression etape={c.etape} onAller={c.aller} />

        <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">
          Étape {c.etape + 1} sur {ETAPES.length}
        </p>

        <div className="mt-3">
          {c.etape === 0 && <Ecran0Usage />}
          {c.etape === 1 && <Ecran1Modele />}
          {c.etape === 2 && <Ecran2Ambiance />}
          {c.etape === 3 && <Ecran3Terrasse />}
          {c.etape === 4 && <Ecran4Options />}
          {c.etape === 5 && <Ecran5Terrain />}
          {c.etape === 6 && <Ecran6Recap onCgv={setCgvOk} />}
        </div>

        {c.etape > 0 && (
          <button
            type="button"
            onClick={c.precedent}
            className="mt-6 min-h-[44px] text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            ← Revenir à l&apos;étape précédente
          </button>
        )}
      </div>

      {/* Écran 0 : un bouton simple, sans montant. */}
      {c.etape === 0 && !brancheFermee && (
        <div className="sticky bottom-0 border-t border-line bg-paper/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              disabled={!peutAvancer}
              onClick={c.suivant}
              className="min-h-[48px] w-full rounded-xl bg-accent text-[0.92rem] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
            >
              Continuer
            </button>
            {!peutAvancer && (
              <p className="mt-2 text-center font-mono text-[0.62rem] text-muted">
                Choisissez votre situation pour continuer
              </p>
            )}
          </div>
        </div>
      )}

      {barreVisible && (
        <BarrePrix
          total={c.total}
          mention={MENTIONS.prix.courte}
          action={
            dernier
              ? c.devisDedie
                ? "Demander un devis dédié"
                : c.numero
                  ? `Réserver le n° ${String(c.numero).padStart(2, "0")}`
                  : "Réserver ce numéro"
              : "Suivant"
          }
          onAction={() => {
            if (!dernier) c.suivant();
            /* ADR-031 : soumission de la demande de numéro. */
          }}
          actionDesactivee={dernier && !cgvOk}
          motifBlocage="Acceptez les CGV pour continuer"
        />
      )}

      {/* Parcours professionnel : rappel du seuil de devis dédié. */}
      {dernier && c.devisDedie && usageDef?.seuilDevisDedie && (
        <span className="sr-only">
          Projet de {c.quantite} unités — devis dédié à partir de {usageDef.seuilDevisDedie}.
        </span>
      )}
    </div>
  );
}

export function ConfigurateurV2() {
  return (
    <ConfigurateurProvider>
      <Parcours />
    </ConfigurateurProvider>
  );
}
