"use client";

/**
 * Écran 1 — unité + pré-analyse du terrain (ADR-030).
 *
 * La pré-analyse est ici, et pas à l'écran 5, parce qu'une seule saisie rend
 * deux réponses : le zonage indicatif ET les coordonnées qui donnent la
 * distance de transport. Elle doit donc précéder le total.
 *
 * ADR-030 § Écarts assumés, point 1 : conservation assumée face au §8 de la
 * spec, qui proscrivait tout appel cadastre/PLU/géoportail.
 */

import { useEffect } from "react";
import { ParcelleAnalyse } from "@/shared/components/plu/ParcelleAnalyse";
import { TRANSPORT } from "@/lib/site";
import { MENTIONS, URBANISME_GENERIQUE } from "@/lib/configurateur/mentions";
import { useConfigurateur, eur } from "./store";
import { Choix, Ecran, Eyebrow, Mention } from "./ui";
import type { ParcelleData } from "@/shared/types/plu";

/** Haversine × roadFactor — même modèle que le configurateur actuel. */
function distanceDepuisAtelier(lat: number, lon: number): number {
  const R = 6371;
  const dLat = ((lat - TRANSPORT.usine.lat) * Math.PI) / 180;
  const dLon = ((lon - TRANSPORT.usine.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((TRANSPORT.usine.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)) * TRANSPORT.roadFactor);
}

export function Ecran1Modele() {
  const c = useConfigurateur();
  const usageDef = c.cfg.usages.find((u) => u.id === c.usage);

  /* `ParcelleAnalyse` publie son résultat en sessionStorage et signale par un
     événement DOM. On s'y abonne plutôt que de dupliquer l'appel réseau. */
  useEffect(() => {
    const lire = () => {
      try {
        const brut = sessionStorage.getItem("plu_result");
        if (!brut) return;
        const d = JSON.parse(brut) as ParcelleData & { adresse?: string };
        c.setPreAnalyse({
          adresse: d.adresse ?? "",
          zone: d.zone_urba ?? null,
          parcelle: d.parcelle ?? null,
          distanceKm:
            d.lat != null && d.lon != null ? distanceDepuisAtelier(d.lat, d.lon) : null,
        });
      } catch {
        /* résultat illisible : on n'écrase pas l'état existant */
      }
    };
    lire();
    window.addEventListener("plu_result_updated", lire);
    return () => window.removeEventListener("plu_result_updated", lire);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Ecran titre="Votre unité" sous="Deux volumes, une même exigence.">
      <div className="flex flex-col gap-2.5">
        {c.cfg.modeles.map((m) => (
          <Choix
            key={m.id}
            titre={m.nom}
            detail={`${m.surface} m² · ${m.typologie} · ${m.emprise}`}
            prix={eur(m.prixBaseTtc)}
            actif={c.modele === m.id}
            onClick={() => c.setModele(m.id)}
          />
        ))}
      </div>

      {/* Parcours professionnel : nombre d'unités (§3). */}
      {usageDef?.champQuantite && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3.5 py-3">
          <label htmlFor="qte" className="text-sm font-medium text-ink">
            Nombre d&apos;unités
          </label>
          <input
            id="qte"
            type="number"
            min={1}
            max={99}
            value={c.quantite}
            onChange={(e) => c.setQuantite(Math.max(1, Number(e.target.value) || 1))}
            className="min-h-[44px] w-20 rounded-lg border border-line bg-surface px-3 text-center font-mono tabular-nums text-ink outline-none focus:border-accent"
          />
        </div>
      )}
      {c.devisDedie && (
        <p className="rounded-xl border border-accent/30 bg-accent/[0.05] px-3.5 py-2.5 text-[0.8rem] leading-relaxed text-ink">
          À partir de {usageDef?.seuilDevisDedie} unités, votre projet fait l&apos;objet d&apos;un
          devis dédié. Le prix unitaire reste indicatif.
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2.5">
        <Eyebrow>Votre situation terrain</Eyebrow>
        <div className="rounded-xl border border-line bg-paper p-3.5">
          <ParcelleAnalyse mode="compact" />

          {c.preAnalyse && (
            <dl className="mt-3 flex flex-col gap-1.5 border-t border-dashed border-line pt-3 text-[0.78rem]">
              {c.preAnalyse.zone && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Zone d&apos;urbanisme</dt>
                  <dd className="font-mono text-ink">{c.preAnalyse.zone}</dd>
                </div>
              )}
              {c.preAnalyse.distanceKm != null && (
                <>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Distance atelier Bayonne</dt>
                    <dd className="font-mono tabular-nums text-ink">
                      {c.preAnalyse.distanceKm} km
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Transport estimé</dt>
                    <dd className="font-mono tabular-nums text-ink">
                      {c.transport != null ? eur(c.transport) : "à estimer"}
                    </dd>
                  </div>
                  <p className="mt-1 self-start rounded-full border border-blue/40 bg-blue/[0.08] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.06em] text-blue">
                    Grutage {eur(TRANSPORT.grutageEur)} + {c.preAnalyse.distanceKm} km ×{" "}
                    {c.transportDetailPerKm.toFixed(2).replace(".", ",")} €/km
                  </p>
                </>
              )}
            </dl>
          )}

          <p className="mt-3 border-t border-dashed border-line pt-3 text-[0.76rem] leading-relaxed text-muted">
            {URBANISME_GENERIQUE}
          </p>
        </div>
        <Mention texte={MENTIONS.terrain} />
      </div>
    </Ecran>
  );
}
