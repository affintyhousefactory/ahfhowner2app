"use client";

/**
 * Configurateur v2 — deux tiers de scène, un tiers de décisions (ADR-030).
 *
 * Parti retenu le 2026-08-01 après arbitrage : **colonne de sections
 * dépliantes** plutôt que stepper. Le stepper ne gagnait que sur « forcer une
 * décision », or l'implantation est descendue en section 05 — il n'avait donc
 * plus d'avantage, et il obligeait à naviguer pour comparer deux choix, ce que
 * la scène collante est précisément censée rendre immédiat.
 *
 * Pas de défilement imbriqué : c'est la page qui défile, la scène est
 * `sticky`. Sur mobile elle se réduit dès l'entrée dans la colonne, sans quoi
 * le bandeau et la barre de prix ne laisseraient qu'un tiers d'écran au contenu.
 */

import { useEffect, useState } from "react";
import { MENTIONS } from "@/lib/configurateur/mentions";
import type { ModeleId } from "@/lib/configurateur/config";
import { ConfigurateurProvider, useConfigurateur } from "./store";
import { BarrePrix, Scene } from "./ui";
import {
  SectionAmbiance,
  SectionModule,
  SectionOptions,
  SectionReservation,
  SectionTerrain,
  SectionTerrasse,
} from "./sections";

function Parcours() {
  const c = useConfigurateur();
  const [cgvOk, setCgvOk] = useState(false);
  const [compact, setCompact] = useState(false);

  /* Rétrécissement de la scène sur mobile — piloté au défilement de la page,
     en rAF et en listener passif pour ne pas peser sur le scroll. */
  useEffect(() => {
    const el = document.getElementById("cfg-app");
    if (!el) return;
    let tick = false;
    const mesurer = () => {
      if (window.innerWidth >= 1024) {
        setCompact(false);
      } else {
        setCompact(el.getBoundingClientRect().top < -40);
      }
      tick = false;
    };
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(mesurer);
    };
    mesurer();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const modele = c.cfg.modeles.find((m) => m.id === c.modele)!;
  const ambiance = c.cfg.ambiances.find((a) => a.id === c.ambiance);
  const palier = c.paliers.find((p) => p.id === c.terrasse);

  const pastilles = [
    ambiance?.nom ?? "",
    ...(palier && palier.prixTtc > 0 ? [`Terrasse ${palier.nom.toLowerCase()}`] : []),
    ...c.optionsDisponibles.filter((o) => c.options.includes(o.id)).map((o) => o.nom),
  ].filter(Boolean);

  return (
    <div id="cfg-app" className="mx-auto grid max-w-6xl items-start lg:grid-cols-[2fr_1fr]">
      <Scene
        nom={modele.nom}
        sous={`${modele.surface} m² · ${modele.typologie} · ${modele.emprise}`}
        tag={`${modele.id === "one" ? "arko-one" : "arko-max"} · ${c.ambiance}`}
        pastilles={pastilles}
        compact={compact}
        ambiances={c.cfg.ambiances}
        ambianceActive={c.ambiance}
      />

      <div className="flex min-w-0 flex-col bg-surface">
        <div className="flex-1">
          <SectionModule />
          <SectionAmbiance />
          <SectionTerrasse />
          <SectionOptions />
          <SectionTerrain />
          <SectionReservation onCgv={setCgvOk} />
        </div>

        {/* §16 n°1 — la branche « terrain nu » ne doit mener ni à un prix ni à
            un paiement : on retire la barre entière, pas seulement le bouton. */}
        {!c.brancheFermee && (
          <BarrePrix
            total={c.total}
            mention={MENTIONS.prix.courte}
            action={
              c.devisDedie
                ? "Demander un devis dédié"
                : c.numero
                  ? `Réserver le n° ${String(c.numero).padStart(2, "0")}`
                  : "Réserver ce numéro"
            }
            actionDesactivee={!cgvOk}
            motif={cgvOk ? "Seul le devis signé fait foi." : "Acceptez les CGV pour continuer"}
            onAction={() => {
              /* ADR-031 : soumission de la demande de numéro. */
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Présélection depuis le CTA « Réserver » du menu Modules.
 *
 * `?produit=` est lu côté serveur par la page et passé en prop : `useSearchParams`
 * imposerait une frontière Suspense et ferait tomber le parcours entier en rendu
 * client, et la lecture de `window.location` en effet (cf. `ProductSync`) ferait
 * clignoter le module par défaut avant la présélection.
 */
export function ConfigurateurV2({ modeleInitial = "max" }: { modeleInitial?: ModeleId }) {
  return (
    <ConfigurateurProvider modeleInitial={modeleInitial}>
      <Parcours />
    </ConfigurateurProvider>
  );
}
