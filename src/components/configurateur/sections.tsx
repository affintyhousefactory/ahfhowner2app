"use client";

/**
 * Les six sections du configurateur v2 (ADR-030).
 *
 * 01 Le studio · 02 Ambiance · 03 Terrasse · 04 Options ·
 * 05 Votre situation terrain · 06 Réserver un numéro
 *
 * Le studio ouvre le parcours et arrive présélectionné depuis le menu ;
 * l'implantation et le terrain passent en avant-dernier, là où l'engagement se
 * précise. Le « dossier terrain » a été retiré du parcours (recueil oral par le
 * conseiller) — décision du 2026-08-01.
 */

import { useEffect, useMemo, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/shared/lib/cn";
import {
  ParcelleAnalyse,
  computeEligibility,
} from "@/shared/components/plu/ParcelleAnalyse";
import { TRANSPORT } from "@/lib/site";
import {
  appelDeNote,
  DEVIS_TEXTE,
  MENTIONS,
  OPTIN_TEXTE,
  SOCLE,
  type PosteSocle,
  URBANISME_GENERIQUE,
  CONTACT_TERRAIN_NU,
} from "@/lib/configurateur/mentions";
import { prixOption } from "@/lib/configurateur/config";
import { chargerNumeros, estSelectionnable, nbDisponibles } from "@/lib/configurateur/numeros";
import { useConfigurateur, eur } from "./store";
import { Choix, Eyebrow, Mention, Section } from "./ui";
import type { ParcelleData } from "@/shared/types/plu";
import type { UsageId } from "@/lib/configurateur/config";

/* ------------------------------------------------------------------ */
/* 01 — le studio                                                      */
/* ------------------------------------------------------------------ */

/* Même repli que `ContactForm` : la clé de test de Cloudflare, qui laisse
   toujours passer. Elle évite qu'un environnement sans variable ne rende un
   widget cassé — la vraie barrière est le secret, côté serveur. */
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

export function SectionModule() {
  const c = useConfigurateur();
  const m = c.cfg.modeles.find((x) => x.id === c.modele)!;
  const usageDef = c.cfg.usages.find((u) => u.id === c.usage);

  return (
    <Section n={1} titre="Le studio" resume={`${m.nom} · ${eur(m.prixBaseTtc)}`} ouvertParDefaut>
      <p className="font-mono text-[0.64rem] leading-relaxed text-muted">
        Présélectionné depuis le menu « Nos Studios » — modifiable ici.
      </p>
      {c.cfg.modeles.map((x) => (
        <Choix
          key={x.id}
          titre={x.nom}
          detail={`${x.surface} m² · ${x.typologie} · ${x.emprise}`}
          prix={eur(x.prixBaseTtc)}
          actif={c.modele === x.id}
          onClick={() => c.setModele(x.id)}
        />
      ))}

      {usageDef?.champQuantite && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5">
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
        <p className="rounded-xl border border-accent/30 bg-accent/[0.05] px-3.5 py-2.5 text-[0.78rem] leading-relaxed text-ink">
          À partir de {usageDef?.seuilDevisDedie} unités, votre projet fait l&apos;objet
          d&apos;un devis dédié. Le prix unitaire reste indicatif.
        </p>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — bardage extérieur                                              */
/* ------------------------------------------------------------------ */

export function SectionAmbiance() {
  const c = useConfigurateur();
  const a = c.cfg.ambiances.find((x) => x.id === c.ambiance);

  return (
    <Section n={2} titre="Bardage extérieur" resume={`${a?.nom} · inclus`}>
      {/* Le tableau `ambiances` doit rester bouclé : la v1 peut sortir à 2
          comme à 3 items (§17.3, arbitrage ouvert). */}
      {/* La sélection est signalée par la teinte de l'ambiance, pas par
          l'accent : trois boutons cerclés du même orange ne diraient pas
          lequel des trois bardages on est en train de regarder. */}
      <div role="tablist" aria-label="Bardage extérieur" className="grid grid-cols-3 gap-2">
        {c.cfg.ambiances.map((x) => {
          const actif = c.ambiance === x.id;
          return (
            <button
              key={x.id}
              role="tab"
              type="button"
              aria-selected={actif}
              onClick={() => c.setAmbiance(x.id)}
              style={
                actif
                  ? { borderColor: x.teinte, backgroundColor: `${x.teinte}14`, boxShadow: `inset 0 0 0 1px ${x.teinte}` }
                  : undefined
              }
              className={cn(
                "flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all",
                actif ? "" : "border-line bg-surface hover:border-accent/45",
              )}
            >
              <span
                aria-hidden
                style={{ backgroundColor: x.teinte }}
                className="h-[30px] w-[30px] rounded-full ring-1 ring-inset ring-ink/15"
              />
              <span className="text-[0.74rem] font-semibold text-ink">{x.nom}</span>
            </button>
          );
        })}
      </div>
      <Mention texte={MENTIONS.ambiance} />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — ambiance intérieure                                            */
/* ------------------------------------------------------------------ */

/**
 * Rubrique créée le 2026-08-20 (demande de Richard).
 *
 * Deux ambiances, sans supplément : c'est un choix de finition. Le sélecteur
 * reprend exactement le motif du bardage — pastille de teinte plutôt qu'accent
 * de sélection — pour que les deux rubriques voisines se lisent de la même
 * façon.
 *
 * Le nombre de vues n'est jamais présumé : il vient du modèle (l'Arko Max a un
 * salon que l'Arko One n'a pas), et le compte affiché en dérive.
 */
export function SectionAmbianceInterieure() {
  const c = useConfigurateur();
  const a = c.cfg.ambiancesInterieures.find((x) => x.id === c.ambianceInterieure);

  return (
    <Section
      n={3}
      titre="Ambiance intérieure"
      resume={`${a?.nom ?? ""} · incluse`}
    >
      <div
        role="tablist"
        aria-label="Ambiance intérieure"
        className="grid grid-cols-2 gap-2"
      >
        {c.cfg.ambiancesInterieures.map((x) => {
          const actif = c.ambianceInterieure === x.id;
          return (
            <button
              key={x.id}
              role="tab"
              type="button"
              aria-selected={actif}
              onClick={() => c.setAmbianceInterieure(x.id)}
              style={
                actif
                  ? {
                      borderColor: x.teinte,
                      backgroundColor: `${x.teinte}14`,
                      boxShadow: `inset 0 0 0 1px ${x.teinte}`,
                    }
                  : undefined
              }
              className={cn(
                "flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all",
                actif ? "" : "border-line bg-surface hover:border-accent/45",
              )}
            >
              <span
                aria-hidden
                style={{ backgroundColor: x.teinte }}
                className="h-[30px] w-[30px] rounded-full ring-1 ring-inset ring-ink/15"
              />
              <span className="text-[0.74rem] font-semibold text-ink">{x.nom}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[0.72rem] text-muted">
        {c.vuesInterieures.length} vues défilent dans l&apos;aperçu.
      </p>
      <Mention texte={MENTIONS.ambianceInterieure} />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — terrasse, par paliers                                          */
/* ------------------------------------------------------------------ */

const HAUTEUR: Record<string, number> = { sans: 8, petite: 20, moyenne: 32, grande: 46 };

export function SectionTerrasse() {
  const c = useConfigurateur();
  const p = c.paliers.find((x) => x.id === c.terrasse);

  return (
    <Section
      n={4}
      titre="Terrasse"
      resume={p && p.prixTtc > 0 ? `${p.nom} · ${eur(p.prixTtc)}` : "Sans terrasse"}
    >
      <div className="grid grid-cols-4 gap-1.5">
        {c.paliers.map((x) => {
          const actif = c.terrasse === x.id;
          return (
            <button
              key={x.id}
              type="button"
              aria-pressed={actif}
              onClick={() => c.setTerrasse(x.id)}
              className={cn(
                "flex min-h-[88px] flex-col items-center justify-end gap-1.5 rounded-xl border px-1 pb-2 pt-2 transition-all",
                actif ? "border-accent bg-accent/[0.07]" : "border-line bg-surface hover:border-accent/45",
              )}
            >
              {/* La hauteur encode la taille relative — jamais un prix au m² (§5). */}
              <span
                aria-hidden
                style={{ height: HAUTEUR[x.id] }}
                className={cn("w-full rounded", actif ? "bg-accent" : "bg-accent/25")}
              />
              <span className="text-[0.7rem] font-semibold text-ink">
                {x.nom.replace("Sans terrasse", "Sans")}
              </span>
              <span className="font-mono text-[0.62rem] tabular-nums text-muted">
                {x.prixTtc === 0 ? "—" : eur(x.prixTtc)}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[0.76rem] leading-relaxed text-muted">
        Structure acier, dalle porcelaine 18 mm, finitions aluminium teinte au choix.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 04 — options                                                        */
/* ------------------------------------------------------------------ */

export function SectionOptions() {
  const c = useConfigurateur();
  const n = c.options.length;

  return (
    <Section
      n={5}
      titre="Options"
      resume={n ? `${n} option${n > 1 ? "s" : ""}` : "Aucune"}
    >
      {c.optionsStructurelles.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-[#8a6a2f]/40 bg-[#8a6a2f]/[0.05] p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-[#8a6a2f]/45 px-1.5 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-[#8a6a2f]">
              Structurel
            </span>
            <span className="flex-1 text-[0.7rem] leading-snug text-muted">
              À choisir maintenant — non modifiable après réservation.
            </span>
          </div>
          {c.optionsStructurelles.map((o) => (
            <Choix
              key={o.id}
              titre={o.nom}
              detail={o.detail}
              prix={eur(prixOption(o, c.modele))}
              actif={c.options.includes(o.id)}
              onClick={() => c.toggleOption(o.id)}
            />
          ))}
        </div>
      )}
      {/* Une option incompatible est absente, jamais grisée (§15). */}
      {c.optionsLibres.map((o) => (
        <Choix
          key={o.id}
          titre={o.nom}
          detail={o.detail}
          prix={eur(prixOption(o, c.modele))}
          actif={c.options.includes(o.id)}
          onClick={() => c.toggleOption(o.id)}
        />
      ))}
      <Mention texte={MENTIONS.option} />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 05 — implantation + situation terrain                               */
/* ------------------------------------------------------------------ */

const USAGES: Record<UsageId, { titre: string; detail: string }> = {
  annexe: { titre: "Comme annexe chez moi", detail: "Sur le terrain de mon habitation" },
  pro: { titre: "Comme hébergement à vocation professionnel", detail: "Pour mon établissement" },
  logement_nu: { titre: "Comme logement indépendant", detail: "Sur un terrain nu" },
};

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

export function SectionTerrain() {
  const c = useConfigurateur();

  /* `ParcelleAnalyse` publie son résultat en sessionStorage et signale par un
     événement DOM. On s'y abonne plutôt que de dupliquer l'appel réseau. */
  useEffect(() => {
    const lire = () => {
      try {
        const brut = sessionStorage.getItem("plu_result");
        if (!brut) return;
        const d = JSON.parse(brut) as ParcelleData;
        c.setPreAnalyse({
          /* `address_label` est le nom réel du champ renvoyé par l'analyse.
             Lire `adresse` donnait toujours `undefined` : le manque « renseigner
             l'adresse du terrain » restait affiché alors que la parcelle était
             analysée, distance et transport calculés. */
          adresse: d.address_label ?? "",
          zone: d.zone_urba ?? null,
          parcelle: d.parcelle ?? null,
          distanceKm: d.lat != null && d.lon != null ? distanceDepuisAtelier(d.lat, d.lon) : null,
        });
        /* Verdict calculé par la pré-analyse elle-même, pas recalculé ici :
           deux règles pour une même question finissent toujours par diverger. */
        c.setEligibilite(computeEligibility(d).verdict === "ineligible" ? "ineligible" : "ok");
      } catch {
        /* résultat illisible : on n'écrase pas l'état existant */
      }
    };
    lire();
    window.addEventListener("plu_result_updated", lire);
    return () => window.removeEventListener("plu_result_updated", lire);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Le résumé ne porte plus la distance : l'adresse a sa propre section depuis
     le 2026-08-20, et c'est elle qui l'affiche. */
  const resume = !c.usage
    ? "Implantation non précisée"
    : c.brancheFermee
      ? "Terrain nu — prochainement"
      : USAGES[c.usage].titre;

  return (
    <Section n={6} titre="Votre situation terrain" resume={resume}>
      <Eyebrow>Où votre studio de jardin Arko va-t-il s&apos;implanter ?</Eyebrow>
      {c.cfg.usages.map((u) => (
        <Choix
          key={u.id}
          titre={USAGES[u.id].titre}
          detail={USAGES[u.id].detail}
          actif={c.usage === u.id}
          onClick={() => c.setUsage(u.id)}
        />
      ))}

      {/* L'encart n'apparaît que sur la branche fermée. */}
      {c.brancheFermee ? (
        <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-paper p-3">
          <span className="self-start rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
            Prochainement
          </span>
          <p className="text-[0.78rem] leading-relaxed text-muted">{MENTIONS.usage.detail}</p>
          <a
            href={CONTACT_TERRAIN_NU}
            className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-accent px-4 text-[0.9rem] font-semibold text-white transition-colors hover:bg-accent-ink"
          >
            Être informé en priorité
          </a>
        </div>
      ) : null}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 07 — adresse du terrain                                             */
/* ------------------------------------------------------------------ */

/**
 * Section détachée de « Votre situation terrain » le 2026-08-20.
 *
 * La pré-analyse déploie zonage, distance, transport, avertissement
 * d'éligibilité et rappel d'urbanisme : empilé sous le choix d'implantation,
 * l'ensemble devenait illisible. Ce sont deux questions distinctes — où l'on
 * implante, puis où se trouve le terrain.
 *
 * Absente sur la branche « terrain nu », qui ne mène ni à un prix ni à une
 * réservation (§16 n°1) : demander une adresse y serait sans objet.
 */
export function SectionAdresseTerrain() {
  const c = useConfigurateur();
  if (c.brancheFermee) return null;

  /* Le résumé porte le **verdict**, pas l'adresse : c'est la réponse qu'on
     est venu chercher. L'adresse, on la connaît déjà — on vient de la taper. */
  const testé = Boolean(c.preAnalyse?.adresse || c.preAnalyse?.parcelle);
  const resume = !testé
    ? "Vérifiez en 30 secondes si votre projet est possible"
    : c.eligibilite === "ineligible"
      ? `${c.preAnalyse?.adresse || "Terrain"} — à vérifier avec nous`
      : `${c.preAnalyse?.adresse || "Terrain"} — zonage favorable`;

  return (
    <Section
      n={7}
      /* « Adresse du terrain » nommait un champ ; on nomme désormais ce que la
         section apporte. C'est la seule du parcours qui répond gratuitement à
         la question qui bloque le plus les projets — d'où sa mise en avant. */
      titre="Tester l'éligibilité de mon terrain"
      badge="Gratuit · immédiat"
      saillant={!testé}
      resume={resume}
    >
      {/* `cfg-adresse` : cible du focus quand la barre signale que l'adresse
          manque. */}
      <div
        id="cfg-adresse"
        tabIndex={-1}
        className="scroll-mt-32 rounded-xl border border-line bg-paper p-3 outline-none"
      >
        <ParcelleAnalyse mode="compact" />

        {c.preAnalyse?.distanceKm != null && (
          <dl className="mt-3 flex flex-col gap-1.5 border-t border-dashed border-line pt-3 text-[0.76rem]">
            {c.preAnalyse.zone && <Ligne k="Zone d'urbanisme" v={c.preAnalyse.zone} />}
            <Ligne k="Distance atelier Bayonne" v={`${c.preAnalyse.distanceKm} km`} />
            <Ligne
              k="Transport estimé"
              v={c.transport != null ? eur(c.transport) : "à estimer"}
            />
            <span className="self-start rounded-full border border-blue/40 bg-blue/[0.08] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.05em] text-blue">
              Grutage {eur(TRANSPORT.grutageEur)} + {c.preAnalyse.distanceKm} km ×{" "}
              {c.transportDetailPerKm.toFixed(2).replace(".", ",")} €/km
            </span>
          </dl>
        )}

        {/* Terrain non éligible : on le dit, mais on ne ferme pas la porte. La
            pré-analyse lit un zonage, elle ne juge pas un projet — un entretien
            peut lever ce que la donnée ignore. La réservation reste possible,
            sous condition (cf. barre de prix). */}
        {c.eligibilite === "ineligible" && (
          <p className="mt-3 rounded-xl border border-[#8a6a2f]/30 bg-[#8a6a2f]/[0.07] px-3 py-2 text-[0.75rem] leading-relaxed text-[#8a6a2f]">
            D&apos;après le zonage consulté, cette parcelle ne paraît pas
            constructible en l&apos;état. Vous pouvez tout de même réserver un
            numéro : son éligibilité sera vérifiée lors de l&apos;entretien, et la
            réservation reste sans engagement jusqu&apos;au devis signé.
          </p>
        )}

        {/* Générique, au conditionnel, jamais lié à la parcelle saisie (§8). */}
        <p className="mt-3 border-t border-dashed border-line pt-3 text-[0.75rem] leading-relaxed text-muted">
          {URBANISME_GENERIQUE}
        </p>
      </div>
      <Mention texte={MENTIONS.terrain} />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 08 — choisir son numéro de série                                    */
/* ------------------------------------------------------------------ */

export function SectionReservation() {
  const c = useConfigurateur();
  const numeros = useMemo(() => chargerNumeros(c.cfg.serie.unites), [c.cfg.serie.unites]);

  const dispo = nbDisponibles(numeros);
  const choisiDemande = c.numero != null && numeros.find((x) => x.n === c.numero)?.etat === "demande";

  return (
    <Section
      n={8}
      titre="Réserver un numéro"
      resume={`${c.cfg.serie.libelle} · ${dispo} restant${dispo > 1 ? "s" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>
          {c.cfg.serie.libelle} — {c.cfg.serie.unites} unités
        </Eyebrow>
        <span className="font-mono text-[0.66rem] tracking-[0.06em] text-accent">
          {dispo} restant{dispo > 1 ? "s" : ""}
        </span>
      </div>

      {/* `cfg-numeros` : cible du focus quand la barre signale qu'aucun numéro
          n'est choisi. `tabIndex={-1}` rend le bloc focusable par programme
          sans l'insérer dans l'ordre de tabulation. */}
      <div id="cfg-numeros" tabIndex={-1} className="grid grid-cols-6 gap-1.5 scroll-mt-32 outline-none">
        {numeros.map((x) => {
          const libre = estSelectionnable(x);
          const actif = c.numero === x.n;
          return (
            <button
              key={x.n}
              type="button"
              disabled={!libre}
              aria-pressed={libre ? actif : undefined}
              aria-label={libre ? `Réserver le numéro ${x.n}` : `Numéro ${x.n}, déjà réservé`}
              onClick={() => libre && c.setNumero(actif ? null : x.n)}
              className={cn(
                "flex min-h-[54px] flex-col items-center justify-center rounded-xl border px-0.5 py-1 transition-all",
                !libre && "cursor-not-allowed border-dashed border-line bg-paper text-muted/50",
                libre && !actif && "border-line bg-surface hover:border-accent/45",
                actif && "border-accent bg-accent/10 shadow-[inset_0_0_0_1px_var(--color-accent)]",
              )}
            >
              <b className="font-mono text-[0.9rem] font-semibold tabular-nums">
                {String(x.n).padStart(2, "0")}
              </b>
              <span className="font-mono text-[0.46rem] uppercase tracking-[0.04em]">
                {libre ? "libre" : "réservé"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="font-mono text-[0.64rem] leading-relaxed text-muted">
        {c.numero
          ? `Le n° ${String(c.numero).padStart(2, "0")} vous est attribué à la signature du devis.`
          : "Le numéro choisi vous est attribué à la signature du devis."}
      </p>

      {/* Seul le conflit reste ici : c'est le seul retour qui demande une
          action **à cet endroit précis** — rechoisir un numéro. Les autres
          (succès, échec, envoi partiel) s'affichent au pied, contre le bouton
          qui vient d'être cliqué : c'est là que le regard se trouve. */}
      {c.envoi.phase === "conflit" && (
        <p className="rounded-xl border border-[#8a6a2f]/30 bg-[#8a6a2f]/[0.07] px-3 py-2 text-[0.78rem] leading-relaxed text-[#8a6a2f]">
          Ce numéro vient d&apos;être confirmé par un autre client — à quelques
          minutes près. Votre configuration est intacte :{" "}
          {c.numerosLibres.length > 0
            ? `choisissez un autre numéro (${c.numerosLibres.map((n) => String(n).padStart(2, "0")).join(", ")} encore libres).`
            : "choisissez un autre numéro ci-dessus."}
        </p>
      )}

      {/* Dit ce qui manque là où le geste se fait, plutôt que d'attendre le bas
          de page : sans numéro sélectionné, la suite du formulaire n'a pas
          d'objet. */}
      {c.numero == null && (
        <p className="rounded-xl border border-accent/30 bg-accent/[0.06] px-3 py-2 text-[0.75rem] leading-relaxed text-ink">
          Choisissez d&apos;abord un numéro ci-dessus : c&apos;est lui qui sera retenu
          pour votre réservation.
        </p>
      )}

      {/* « Demandé » n'apparaît qu'après sélection, pour celui qui est concerné. */}
      {choisiDemande && (
        <p className="rounded-xl border border-[#8a6a2f]/30 bg-[#8a6a2f]/[0.07] px-3 py-2 text-[0.73rem] leading-relaxed text-[#8a6a2f]">
          Ce numéro fait l&apos;objet d&apos;une autre demande en cours. Nous vous confirmons
          son attribution lors de l&apos;appel — un autre numéro reste disponible si besoin.
        </p>
      )}

    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 09 — vos coordonnées                                                */
/* ------------------------------------------------------------------ */

/**
 * Détachée de la réservation le 2026-08-20.
 *
 * Choisir un numéro et se présenter sont deux gestes différents : le premier
 * est un choix, le second une saisie. Les tenir dans un même accordéon
 * obligeait à traverser tout le récapitulatif de prix pour passer de l'un à
 * l'autre.
 *
 * Les consentements restent ici, avec les coordonnées qu'ils engagent.
 */
export function SectionCoordonnees() {
  const c = useConfigurateur();
  const [memeAdresse, setMemeAdresse] = useState(false);

  const rempli =
    c.contact.prenom.trim() &&
    c.contact.nom.trim() &&
    c.contact.tel &&
    c.contact.email.trim();

  return (
    <Section
      n={9}
      titre="Vos coordonnées"
      resume={rempli ? `${c.contact.prenom} ${c.contact.nom}` : "Tous les champs requis"}
    >
      <Eyebrow>Vos coordonnées — tous requis</Eyebrow>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Champ
            id="cfg-prenom"
            placeholder="Prénom"
            autoComplete="given-name"
            valeur={c.contact.prenom}
            onValeur={(v) => c.setContact("prenom", v)}
          />
          <Champ
            id="cfg-nom"
            placeholder="Nom"
            autoComplete="family-name"
            valeur={c.contact.nom}
            onValeur={(v) => c.setContact("nom", v)}
          />
        </div>
        {/* Même composant et même habillage que le tunnel actuel. */}
        <PhoneInput
          international
          defaultCountry="FR"
          value={c.contact.tel}
          onChange={(v) => c.setContact("tel", v ?? "")}
          placeholder="Téléphone"
          className="phone-input"
          numberInputProps={{ required: true, id: "cfg-tel" }}
        />
        <Champ
          id="cfg-email"
          placeholder="Email"
          type="email"
          autoComplete="email"
          valeur={c.contact.email}
          onValeur={(v) => c.setContact("email", v)}
        />

        <Champ
          id="cfg-adresse-postale"
          placeholder="Adresse"
          autoComplete="street-address"
          valeur={c.contact.adresse}
          onValeur={(v) => c.setContact("adresse", v)}
        />
        <div className="flex gap-2">
          <Champ
            id="cfg-cp"
            placeholder="Code postal"
            autoComplete="postal-code"
            inputMode="numeric"
            valeur={c.contact.cp}
            onValeur={(v) => c.setContact("cp", v.replace(/\D/g, "").slice(0, 5))}
            className="max-w-[8rem]"
          />
          <Champ
            id="cfg-ville"
            placeholder="Ville"
            autoComplete="address-level2"
            valeur={c.contact.ville}
            onValeur={(v) => c.setContact("ville", v)}
          />
        </div>

        {/* Report en un clic depuis le terrain testé en section 07. La case
            n'apparaît que si l'analyse a produit une adresse : proposer de
            recopier ce qui n'existe pas ne ferait qu'ajouter une question. */}
        {c.preAnalyse?.adresse && (
          <Case
            checked={memeAdresse}
            onChange={(v) => {
              setMemeAdresse(v);
              if (!v) return;
              const { rue, cp, ville } = decouperAdresse(c.preAnalyse!.adresse);
              c.setContact("adresse", rue);
              c.setContact("cp", cp);
              c.setContact("ville", ville);
            }}
          >
            <span className="text-ink">
              Utiliser l&apos;adresse de mon terrain — {c.preAnalyse.adresse}
            </span>
          </Case>
        )}
      </div>

      {/* Turnstile en mode invisible : la route refuse toute demande sans jeton
          dès que le secret est configuré — ce qui a fait échouer les premiers
          envois en 400. Le widget se résout tout seul et ne demande rien au
          visiteur, sauf s'il est jugé suspect.

          Posé ici plutôt qu'au pied : il doit vivre dans le flux du formulaire
          pour être monté quand la section est ouverte, et le jeton est prêt
          bien avant le clic. */}
      <Turnstile
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={c.setCaptchaToken}
        onError={() => c.setCaptchaToken(null)}
        onExpire={() => c.setCaptchaToken(null)}
        options={{ theme: "light", size: "invisible" }}
      />

      <div className="flex flex-col gap-2.5">
        <Case checked={c.optin} onChange={c.setOptin}>
          {OPTIN_TEXTE}
        </Case>
        <Case id="cfg-cgv" checked={c.cgv} onChange={c.setCgv}>
          <span className="text-ink">
            J&apos;accepte les{" "}
            <a href="/cgv" className="text-accent underline underline-offset-2">CGV</a> et la{" "}
            <a href="/confidentialite" className="text-accent underline underline-offset-2">
              politique de confidentialité
            </a>
            .
          </span>
        </Case>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Détail de la configuration — panneau du pied de parcours            */
/* ------------------------------------------------------------------ */

/**
 * Le récapitulatif complet : lignes de configuration, estimation, périmètre,
 * et conditions de réservation.
 *
 * Il ne vit plus dans un accordéon mais dans le pied du parcours, ouvert
 * depuis la barre de prix (décision du 2026-08-20). Le raisonnement : ce
 * détail répond à une question posée par le total affiché juste à côté —
 * « d'où vient ce prix ? ». Le placer ailleurs obligeait à quitter des yeux le
 * chiffre qu'il explique, et à traverser un long bloc de texte pour atteindre
 * les champs de contact.
 */
export function DetailConfiguration() {
  const c = useConfigurateur();
  const modele = c.cfg.modeles.find((m) => m.id === c.modele)!;
  const ambiance = c.cfg.ambiances.find((a) => a.id === c.ambiance);
  const interieurRecap = c.cfg.ambiancesInterieures.find(
    (a) => a.id === c.ambianceInterieure,
  );
  const palier = c.paliers.find((p) => p.id === c.terrasse);

  return (
    <div className="flex flex-col gap-2.5">
      <Eyebrow>Votre configuration</Eyebrow>
      <dl className="flex flex-col gap-1.5">
        <Ligne k={`${modele.nom} — ${modele.surface} m²`} v={eur(c.prixBase)} />
        {ambiance && <Ligne k={`Bardage ${ambiance.nom.toLowerCase()}`} v="inclus" />}
        {interieurRecap && (
          <Ligne k={`${interieurRecap.nom}`} v="incluse" />
        )}
        {c.prixTerrasse > 0 && <Ligne k={`Terrasse ${palier?.nom.toLowerCase()}`} v={eur(c.prixTerrasse)} />}
        {c.optionsDisponibles
          .filter((o) => c.options.includes(o.id))
          .map((o) => (
            <Ligne key={o.id} k={o.nom} v={eur(prixOption(o, c.modele))} />
          ))}
        <Ligne
          k={c.preAnalyse?.distanceKm != null ? `Transport — ${c.preAnalyse.distanceKm} km depuis Bayonne` : "Transport"}
          v={c.transport != null ? eur(c.transport) : "à estimer"}
        />
        <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-line pt-2">
          <dt className="text-[0.92rem] font-semibold text-ink">Estimation TTC</dt>
          <dd className="font-mono text-[0.92rem] font-semibold tabular-nums text-ink">{eur(c.total)}</dd>
        </div>
      </dl>
      <Mention texte={MENTIONS.prix} />

      <Eyebrow>Compris dans le prix</Eyebrow>
      <ListeSocle postes={SOCLE.compris} />
      <Eyebrow>Non inclus</Eyebrow>
      <ListeSocle postes={SOCLE.nonInclus} />

      <div className="flex flex-col gap-2 rounded-xl border border-line bg-paper p-3">
        <p className="text-[0.78rem] leading-relaxed text-muted">{DEVIS_TEXTE.intro}</p>
        <div className="flex items-baseline gap-2 rounded-xl border border-line bg-surface px-3 py-2">
          <b className="whitespace-nowrap font-mono text-[0.95rem] tabular-nums text-ink">
            {eur(c.cfg.reservation.montantTtc)}
          </b>
          <span className="text-[0.73rem] leading-snug text-muted">{DEVIS_TEXTE.ligne}</span>
        </div>
        <p className="text-[0.78rem] text-muted">
          {DEVIS_TEXTE.conditions}{" "}
          <a href="/cgv" className="text-accent underline underline-offset-2">
            CGV
          </a>
          .
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Ligne({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[0.8rem]">
      <dt className="text-muted">{k}</dt>
      <dd className="font-mono tabular-nums text-ink">{v}</dd>
    </div>
  );
}

function Champ({
  id,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  className,
  valeur,
  onValeur,
}: {
  /** Sert de cible au focus depuis la barre de prix. */
  id: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  /** `numeric` sur le code postal : le bon clavier au premier coup, sur mobile. */
  inputMode?: "text" | "numeric";
  className?: string;
  valeur: string;
  onValeur: (v: string) => void;
}) {
  return (
    <input
      required
      id={id}
      type={type}
      value={valeur}
      onChange={(e) => onValeur(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      className={cn(
        "min-h-[44px] w-full min-w-0 flex-1 scroll-mt-32 rounded-xl border border-line bg-surface px-3 text-[0.85rem] text-ink outline-none placeholder:text-muted/60 focus:border-accent",
        className,
      )}
    />
  );
}

function Case({
  id,
  checked,
  onChange,
  children,
}: {
  id?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex scroll-mt-32 cursor-pointer items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-accent"
      />
      <span className="text-[0.75rem] leading-relaxed text-muted">{children}</span>
    </label>
  );
}

/**
 * Découpe une adresse renvoyée par la pré-analyse en rue / code postal / ville.
 *
 * Le libellé arrive sous la forme « 12 rue des Pins 64100 Bayonne ». On repère
 * le code postal — cinq chiffres isolés — et l'on découpe autour : ce qui
 * précède est la voie, ce qui suit la commune. Aucune bibliothèque pour ça :
 * le format vient d'une source unique et connue, et un analyseur d'adresses
 * généraliste échouerait autant sur les cas tordus.
 *
 * Si le code postal est introuvable, tout part dans la voie plutôt que d'être
 * réparti au hasard — le visiteur corrigera, ce qui vaut mieux qu'un champ
 * rempli faux.
 */
function decouperAdresse(libelle: string): { rue: string; cp: string; ville: string } {
  const m = libelle.match(/^(.*?)\s*(\d{5})\s+(.+)$/);
  if (!m) return { rue: libelle.trim(), cp: "", ville: "" };
  return { rue: m[1].trim(), cp: m[2], ville: m[3].trim() };
}

/**
 * Postes du socle, rendus en phrase continue.
 *
 * La phrase plutôt que la liste à puces : ce sont des périmètres, pas des
 * options à cocher — une liste inviterait à les comparer un à un alors qu'ils
 * se lisent d'un bloc.
 *
 * Un poste peut porter un lien et un développé. L'astérisque n'est pas
 * décorative : elle signale qu'il y a quelque chose à lire derrière, et le
 * développé est donné en `title` **et** en texte accessible — un sigle expliqué
 * seulement au survol reste opaque au clavier et au tactile.
 */
/**
 * Un encart du socle — « Compris dans le prix » ou « Non inclus ».
 *
 * L'appel de note vient d'`appelDeNote()` : il était écrit `*` en dur, et n'était
 * rendu que sur les postes porteurs d'un lien. Deux limites depuis que les VRD et
 * la micro-station portent une estimation de coût — elles n'ont pas de lien, et
 * leurs appels doivent suivre celui de l'ossature LSF, qui vit dans l'autre liste.
 */
function ListeSocle({ postes }: { postes: readonly PosteSocle[] }) {
  const avecNote = postes.filter((p) => p.note);

  return (
    <p className="text-[0.76rem] leading-relaxed text-muted">
      {postes.map((poste, i) => {
        const appel = appelDeNote(poste);
        /* Le développé reste lisible sans souris ni pointeur : `title` pour le
           survol, `sr-only` pour les lecteurs d'écran, et la ligne de notes
           ci-dessous pour tout le monde. */
        const corps = (
          <>
            {poste.texte}
            {appel && <span aria-hidden>{appel}</span>}
            {poste.note && <span className="sr-only"> — {poste.note}</span>}
          </>
        );

        return (
          <span key={poste.texte}>
            {i > 0 && ", "}
            {poste.href ? (
              <a
                href={poste.href}
                title={poste.note}
                className="text-accent underline decoration-dotted underline-offset-2 transition-colors hover:decoration-solid"
              >
                {corps}
              </a>
            ) : (
              corps
            )}
            {/* Hors du lien : le développé d'un sigle n'est pas cliquable. */}
            {poste.complement}
          </span>
        );
      })}
      .
      {avecNote.length > 0 && (
        <span className="mt-1 block font-mono text-[0.64rem] text-muted/80">
          {avecNote.map((p) => (
            <span key={p.texte} className="block">
              {appelDeNote(p)} {p.note}
            </span>
          ))}
        </span>
      )}
    </p>
  );
}
