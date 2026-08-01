"use client";

/**
 * Écran 0 — filtre d'usage (ADR-030, §2 et §3 de la spec).
 *
 * Ce n'est pas une question de confort : la branche « logement indépendant sur
 * terrain nu » ne doit jamais mener à un prix ni à une réservation. C'est le
 * critère de recette n°1 (§16). D'où l'absence totale de barre de prix sur cet
 * écran, et le remplacement du corps par le bloc « prochainement ».
 */

import { useState } from "react";
import { useConfigurateur } from "./store";
import { Choix, Ecran, Mention } from "./ui";
import { MENTIONS } from "@/lib/configurateur/mentions";
import type { UsageId } from "@/lib/configurateur/config";

const LIBELLES: Record<UsageId, { titre: string; detail: string }> = {
  annexe: { titre: "Une annexe chez moi", detail: "Sur le terrain de mon habitation" },
  pro: { titre: "Des hébergements", detail: "Pour mon établissement" },
  logement_nu: { titre: "Un logement indépendant", detail: "Sur un terrain nu" },
};

export function Ecran0Usage() {
  const c = useConfigurateur();
  const [email, setEmail] = useState("");
  const [inscrit, setInscrit] = useState(false);

  const ferme = c.usage === "logement_nu";

  return (
    <Ecran titre="Votre projet" sous="Où votre unité va-t-elle s'implanter ?">
      <div className="flex flex-col gap-2.5">
        {c.cfg.usages.map((u) => (
          <Choix
            key={u.id}
            titre={LIBELLES[u.id].titre}
            detail={LIBELLES[u.id].detail}
            actif={c.usage === u.id}
            onClick={() => c.setUsage(u.id)}
          />
        ))}
      </div>

      {ferme ? (
        /* Aucune explication, aucun motif, aucun prix — une seule formulation. */
        <div className="mt-2 flex flex-col items-start gap-3 rounded-xl border border-line bg-paper p-4">
          <span className="rounded-full border border-line px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
            Prochainement
          </span>
          <p className="text-sm leading-relaxed text-muted">{MENTIONS.usage.detail}</p>

          {inscrit ? (
            <p className="text-sm font-medium text-accent">
              Merci — nous vous informerons en priorité à l&apos;ouverture.
            </p>
          ) : (
            <form
              className="flex w-full flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setInscrit(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                aria-label="Votre email"
                className="min-h-[48px] w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-accent"
              />
              <button
                type="submit"
                className="min-h-[48px] w-full rounded-xl border border-accent text-[0.92rem] font-semibold text-accent transition-colors hover:bg-accent/5"
              >
                M&apos;informer à l&apos;ouverture
              </button>
            </form>
          )}
        </div>
      ) : (
        <>
          <p className="font-mono text-[0.66rem] leading-relaxed text-muted">
            Nos unités s&apos;implantent sur un terrain déjà bâti.
          </p>
          <Mention texte={MENTIONS.usage} />
        </>
      )}
    </Ecran>
  );
}
