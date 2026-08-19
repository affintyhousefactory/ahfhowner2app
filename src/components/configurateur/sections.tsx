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
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/shared/lib/cn";
import { ParcelleAnalyse } from "@/shared/components/plu/ParcelleAnalyse";
import { TRANSPORT } from "@/lib/site";
import {
  DEVIS_TEXTE,
  MENTIONS,
  OPTIN_TEXTE,
  SOCLE,
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
/* 02 — ambiance                                                       */
/* ------------------------------------------------------------------ */

export function SectionAmbiance() {
  const c = useConfigurateur();
  const a = c.cfg.ambiances.find((x) => x.id === c.ambiance);

  return (
    <Section n={2} titre="Ambiance" resume={`${a?.nom} · incluse`}>
      {/* Le tableau `ambiances` doit rester bouclé : la v1 peut sortir à 2
          comme à 3 items (§17.3, arbitrage ouvert). */}
      {/* La sélection est signalée par la teinte de l'ambiance, pas par
          l'accent : trois boutons cerclés du même orange ne diraient pas
          lequel des trois bardages on est en train de regarder. */}
      <div role="tablist" aria-label="Ambiance" className="grid grid-cols-3 gap-2">
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
/* 03 — terrasse, par paliers                                          */
/* ------------------------------------------------------------------ */

const HAUTEUR: Record<string, number> = { sans: 8, petite: 20, moyenne: 32, grande: 46 };

export function SectionTerrasse() {
  const c = useConfigurateur();
  const p = c.paliers.find((x) => x.id === c.terrasse);

  return (
    <Section
      n={3}
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
      n={4}
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
        const d = JSON.parse(brut) as ParcelleData & { adresse?: string };
        c.setPreAnalyse({
          adresse: d.adresse ?? "",
          zone: d.zone_urba ?? null,
          parcelle: d.parcelle ?? null,
          distanceKm: d.lat != null && d.lon != null ? distanceDepuisAtelier(d.lat, d.lon) : null,
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

  const resume = !c.usage
    ? "Implantation non précisée"
    : c.brancheFermee
      ? "Terrain nu — prochainement"
      : `${USAGES[c.usage].titre} · ${
          c.preAnalyse?.distanceKm != null ? `${c.preAnalyse.distanceKm} km` : "adresse non renseignée"
        }`;

  return (
    <Section n={5} titre="Votre situation terrain" resume={resume}>
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
      ) : (
        <div className="flex flex-col gap-2.5">
          <Eyebrow>Adresse du terrain</Eyebrow>
          <div className="rounded-xl border border-line bg-paper p-3">
            <ParcelleAnalyse mode="compact" />

            {c.preAnalyse?.distanceKm != null && (
              <dl className="mt-3 flex flex-col gap-1.5 border-t border-dashed border-line pt-3 text-[0.76rem]">
                {c.preAnalyse.zone && (
                  <Ligne k="Zone d'urbanisme" v={c.preAnalyse.zone} />
                )}
                <Ligne k="Distance atelier Bayonne" v={`${c.preAnalyse.distanceKm} km`} />
                <Ligne k="Transport estimé" v={c.transport != null ? eur(c.transport) : "à estimer"} />
                <span className="self-start rounded-full border border-blue/40 bg-blue/[0.08] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.05em] text-blue">
                  Grutage {eur(TRANSPORT.grutageEur)} + {c.preAnalyse.distanceKm} km ×{" "}
                  {c.transportDetailPerKm.toFixed(2).replace(".", ",")} €/km
                </span>
              </dl>
            )}

            {/* Générique, au conditionnel, jamais lié à la parcelle saisie (§8). */}
            <p className="mt-3 border-t border-dashed border-line pt-3 text-[0.75rem] leading-relaxed text-muted">
              {URBANISME_GENERIQUE}
            </p>
          </div>
          <Mention texte={MENTIONS.terrain} />
        </div>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 06 — réserver un numéro                                             */
/* ------------------------------------------------------------------ */

export function SectionReservation({ onCgv }: { onCgv: (ok: boolean) => void }) {
  const c = useConfigurateur();
  const numeros = useMemo(() => chargerNumeros(c.cfg.serie.unites), [c.cfg.serie.unites]);
  const [tel, setTel] = useState<string | undefined>();
  const [optin, setOptin] = useState(false);
  const [cgv, setCgv] = useState(false); // jamais pré-cochée (§7)

  const modele = c.cfg.modeles.find((m) => m.id === c.modele)!;
  const ambiance = c.cfg.ambiances.find((a) => a.id === c.ambiance);
  const palier = c.paliers.find((p) => p.id === c.terrasse);
  const dispo = nbDisponibles(numeros);
  const choisiDemande = c.numero != null && numeros.find((x) => x.n === c.numero)?.etat === "demande";

  return (
    <Section
      n={6}
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

      <div className="grid grid-cols-6 gap-1.5">
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

      {/* « Demandé » n'apparaît qu'après sélection, pour celui qui est concerné. */}
      {choisiDemande && (
        <p className="rounded-xl border border-[#8a6a2f]/30 bg-[#8a6a2f]/[0.07] px-3 py-2 text-[0.73rem] leading-relaxed text-[#8a6a2f]">
          Ce numéro fait l&apos;objet d&apos;une autre demande en cours. Nous vous confirmons
          son attribution lors de l&apos;appel — un autre numéro reste disponible si besoin.
        </p>
      )}

      <Eyebrow>Votre configuration</Eyebrow>
      <dl className="flex flex-col gap-1.5">
        <Ligne k={`${modele.nom} — ${modele.surface} m²`} v={eur(c.prixBase)} />
        {ambiance && <Ligne k={`Ambiance ${ambiance.nom}`} v="incluse" />}
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
      <p className="text-[0.76rem] leading-relaxed text-muted">{SOCLE.compris}</p>
      <Eyebrow>À votre charge</Eyebrow>
      <p className="text-[0.76rem] leading-relaxed text-muted">{SOCLE.charge}</p>

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

      <Eyebrow>Vos coordonnées — tous requis</Eyebrow>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Champ placeholder="Prénom" autoComplete="given-name" />
          <Champ placeholder="Nom" autoComplete="family-name" />
        </div>
        {/* Même composant et même habillage que le tunnel actuel. */}
        <PhoneInput
          international
          defaultCountry="FR"
          value={tel}
          onChange={setTel}
          placeholder="Téléphone"
          className="phone-input"
          numberInputProps={{ required: true }}
        />
        <Champ placeholder="Email" type="email" autoComplete="email" />
      </div>

      <div className="flex flex-col gap-2.5">
        <Case checked={optin} onChange={setOptin}>
          {OPTIN_TEXTE}
        </Case>
        <Case
          checked={cgv}
          onChange={(v) => {
            setCgv(v);
            onCgv(v);
          }}
        >
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

function Ligne({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[0.8rem]">
      <dt className="text-muted">{k}</dt>
      <dd className="font-mono tabular-nums text-ink">{v}</dd>
    </div>
  );
}

function Champ({
  placeholder,
  type = "text",
  autoComplete,
}: {
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <input
      required
      type={type}
      placeholder={placeholder}
      aria-label={placeholder}
      autoComplete={autoComplete}
      className="min-h-[44px] w-full min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-[0.85rem] text-ink outline-none placeholder:text-muted/60 focus:border-accent"
    />
  );
}

function Case({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-accent"
      />
      <span className="text-[0.75rem] leading-relaxed text-muted">{children}</span>
    </label>
  );
}
