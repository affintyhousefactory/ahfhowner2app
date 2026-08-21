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
  SectionAmbianceInterieure,
  SectionModule,
  SectionOptions,
  SectionReservation,
  SectionTerrain,
  SectionAdresseTerrain,
  SectionTerrasse,
} from "./sections";

function Parcours() {
  const c = useConfigurateur();
  const [cale, setCale] = useState(false);

  /* La scène est-elle calée en haut de l'écran ? Elle ne change pas de taille
     pour autant (arbitrage Richard, 2026-08-02 : le rétrécissement recadrait
     le studio et lui coupait le pied) — l'état sert uniquement à lui faire
     réserver la place de l'en-tête quand celui-ci vient se poser dessus.
     Mesure en rAF, listener passif : rien qui pèse sur le défilement. */
  useEffect(() => {
    const el = document.getElementById("cfg-app");
    if (!el) return;
    let tick = false;
    const mesurer = () => {
      if (window.innerWidth >= 1024) {
        setCale(false);
      } else {
        setCale(el.getBoundingClientRect().top < -40);
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

  const interieur = c.cfg.ambiancesInterieures.find((a) => a.id === c.ambianceInterieure);

  const pastilles = [
    ambiance?.nom ?? "",
    interieur?.nom ?? "",
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
        cale={cale}
        bardages={c.bardages}
        ambianceActive={c.ambiance}
        vuesInterieures={c.vuesInterieures}
        interieurs={c.interieurs}
        ambianceInterieureActive={c.ambianceInterieure}
      />

      <div className="flex min-w-0 flex-col bg-surface">
        <div className="flex-1">
          <SectionModule />
          <SectionAmbiance />
          <SectionAmbianceInterieure />
          <SectionTerrasse />
          <SectionOptions />
          <SectionTerrain />
          <SectionAdresseTerrain />
          <SectionReservation />
        </div>

        {/* §16 n°1 — la branche « terrain nu » ne doit mener ni à un prix ni à
            un paiement : on retire la barre entière, pas seulement le bouton. */}
        {!c.brancheFermee && (
          <BarrePrix
            total={c.total}
            mention={MENTIONS.prix.courte}
            action={libelleAction(c)}
            /* Le bouton ne s'active que lorsque **tout** ce qui compose une
               demande exploitable est là : un numéro, une adresse, des
               coordonnées joignables et les CGV. Il ne dépendait auparavant
               que des CGV — on pouvait donc « réserver » sans numéro ni
               contact, et la demande n'aurait mené nulle part. */
            actionDesactivee={c.manques.length > 0}
            motif={
              c.manques.length > 0
                ? "Complétez les éléments ci-dessus pour continuer"
                : "Seul le devis signé fait foi."
            }
            manques={c.manques}
            /* Terrain non éligible : la réservation reste ouverte, mais elle
               change de nature — et le bouton le dit avant le clic, pas après. */
            note={
              c.manques.length === 0 && c.eligibilite === "ineligible"
                ? "* Vérification d'éligibilité du terrain après entretien."
                : undefined
            }
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
 * Libellé du bouton de réservation.
 *
 * Trois états, dans cet ordre de priorité : devis dédié (au-delà du seuil de
 * quantité), réservation **sous condition** quand le zonage consulté ne donne
 * pas la parcelle pour constructible, réservation simple sinon.
 *
 * L'astérisque renvoie à la note affichée juste sous le bouton : le visiteur
 * doit savoir ce qu'il engage avant de cliquer, pas après.
 */
function libelleAction(c: ReturnType<typeof useConfigurateur>) {
  if (c.devisDedie) return "Demander un devis dédié";
  if (c.numero == null) return "Réserver un numéro";
  const n = String(c.numero).padStart(2, "0");
  return c.eligibilite === "ineligible"
    ? `Réserver le n° ${n} sous condition*`
    : `Réserver le n° ${n}`;
}

/**
 * Présélection depuis le CTA « Réserver » du menu « Nos Studios ».
 *
 * `?produit=` est lu côté serveur par la page et passé en prop : `useSearchParams`
 * imposerait une frontière Suspense et ferait tomber le parcours entier en rendu
 * client, et la lecture de `window.location` en effet (cf. `ProductSync`) ferait
 * clignoter le studio par défaut avant la présélection.
 */
export function ConfigurateurV2({ modeleInitial = "max" }: { modeleInitial?: ModeleId }) {
  return (
    <ConfigurateurProvider modeleInitial={modeleInitial}>
      <Parcours />
    </ConfigurateurProvider>
  );
}
