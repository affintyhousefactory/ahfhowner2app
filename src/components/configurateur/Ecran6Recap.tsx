"use client";

/**
 * Écran 6 — récapitulatif et réservation d'un numéro (ADR-030).
 *
 * **Aucun paiement en ligne** : le lien part après l'appel de qualification
 * (§ Écarts assumés, point 2 — confirme ADR-008). Cet écran recueille le choix
 * du numéro et les coordonnées, rien de plus.
 *
 * Le FOMO vient de la rareté réelle : le CTA dit « Réserver ce numéro », donc
 * l'écran montre lesquels. Pas de compte à rebours, pas de « N personnes
 * regardent cette page » — le §6 les interdit nommément.
 */

import { useMemo, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/shared/lib/cn";
import { DEVIS_TEXTE, MENTIONS, OPTIN_TEXTE, SOCLE } from "@/lib/configurateur/mentions";
import { chargerNumeros, estSelectionnable, nbDisponibles } from "@/lib/configurateur/numeros";
import { prixOption } from "@/lib/configurateur/config";
import { useConfigurateur, eur } from "./store";
import { Ecran, Eyebrow, Mention } from "./ui";

export function Ecran6Recap({ onCgv }: { onCgv: (ok: boolean) => void }) {
  const c = useConfigurateur();
  const numeros = useMemo(() => chargerNumeros(c.cfg.serie.unites), [c.cfg.serie.unites]);
  const [tel, setTel] = useState<string | undefined>();
  const [optin, setOptin] = useState(false);
  const [cgv, setCgv] = useState(false); // jamais pré-cochée (§7)

  const modele = c.cfg.modeles.find((m) => m.id === c.modele)!;
  const ambiance = c.cfg.ambiances.find((a) => a.id === c.ambiance);
  const palier = c.paliers.find((p) => p.id === c.terrasse);
  const dispo = nbDisponibles(numeros);
  const choisiDemande =
    c.numero != null && numeros.find((x) => x.n === c.numero)?.etat === "demande";

  return (
    <Ecran titre="Votre configuration" sous={`${modele.nom} · ${ambiance?.nom} · ${palier?.nom.toLowerCase()}`}>
      {/* -------- numéros : rareté réelle, jamais simulée -------- */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow>
            {c.cfg.serie.libelle} — {c.cfg.serie.unites} unités
          </Eyebrow>
          <span className="font-mono text-[0.68rem] tracking-[0.06em] text-accent">
            {dispo} {dispo > 1 ? "numéros restants" : "numéro restant"}
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
                aria-label={
                  libre ? `Réserver le numéro ${x.n}` : `Numéro ${x.n}, déjà réservé`
                }
                onClick={() => libre && c.setNumero(actif ? null : x.n)}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1 transition-all",
                  !libre && "cursor-not-allowed border-dashed border-line bg-paper text-muted/50",
                  libre && !actif && "border-line bg-surface hover:border-accent/45",
                  actif && "border-accent bg-accent/10 shadow-[inset_0_0_0_1px_var(--color-accent)]",
                )}
              >
                <b className="font-mono text-[0.94rem] font-semibold tabular-nums">
                  {String(x.n).padStart(2, "0")}
                </b>
                <span className="font-mono text-[0.5rem] uppercase tracking-[0.06em]">
                  {libre ? "libre" : "réservé"}
                </span>
              </button>
            );
          })}
        </div>

        <p className="font-mono text-[0.66rem] leading-relaxed text-muted">
          {c.numero
            ? `Le n° ${String(c.numero).padStart(2, "0")} vous est attribué à la signature du devis.`
            : "Le numéro choisi vous est attribué à la signature du devis."}
        </p>

        {/* L'information « déjà demandé » n'apparaît qu'APRÈS sélection, pour
            celui qui est concerné — jamais en amont du choix. */}
        {choisiDemande && (
          <p className="rounded-xl border border-[#8a6a2f]/30 bg-[#8a6a2f]/[0.07] px-3 py-2 text-[0.75rem] leading-relaxed text-[#8a6a2f]">
            Ce numéro fait l&apos;objet d&apos;une autre demande en cours. Nous vous
            confirmons son attribution lors de l&apos;appel — un autre numéro reste
            disponible si besoin.
          </p>
        )}
      </div>

      {/* -------- récapitulatif chiffré -------- */}
      <dl className="mt-2 flex flex-col gap-1.5">
        <Ligne k={`${modele.nom} — ${modele.surface} m²`} v={eur(c.prixBase)} />
        {ambiance && <Ligne k={`Ambiance ${ambiance.nom}`} v="incluse" />}
        {c.prixTerrasse > 0 && <Ligne k={`Terrasse ${palier?.nom.toLowerCase()}`} v={eur(c.prixTerrasse)} />}
        {c.optionsDisponibles
          .filter((o) => c.options.includes(o.id))
          .map((o) => (
            <Ligne key={o.id} k={o.nom} v={eur(prixOption(o, c.modele))} />
          ))}
        <Ligne
          k={
            c.preAnalyse?.distanceKm != null
              ? `Transport — ${c.preAnalyse.distanceKm} km depuis Bayonne`
              : "Transport"
          }
          v={c.transport != null ? eur(c.transport) : "à estimer"}
        />
        <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-line pt-2">
          <dt className="text-[0.96rem] font-semibold text-ink">Estimation TTC</dt>
          <dd className="font-mono text-[0.96rem] font-semibold tabular-nums text-ink">
            {eur(c.total)}
          </dd>
        </div>
      </dl>
      <Mention texte={MENTIONS.prix} />

      {/* -------- socle Signature (§4, contenu à valider §17.2) -------- */}
      <Eyebrow>Compris dans le prix</Eyebrow>
      <p className="text-[0.8rem] leading-relaxed text-muted">{SOCLE.compris}</p>
      <Eyebrow>À votre charge</Eyebrow>
      <p className="text-[0.8rem] leading-relaxed text-muted">{SOCLE.charge}</p>

      {/* -------- devis : aucun paiement ici -------- */}
      <div className="flex flex-col gap-2 rounded-xl border border-line bg-paper p-3.5">
        <p className="text-[0.82rem] leading-relaxed text-muted">{DEVIS_TEXTE.intro}</p>
        <div className="flex items-baseline gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5">
          <b className="whitespace-nowrap font-mono text-base tabular-nums text-ink">
            {eur(c.cfg.reservation.montantTtc)}
          </b>
          <span className="text-[0.78rem] leading-snug text-muted">{DEVIS_TEXTE.ligne}</span>
        </div>
        <p className="text-[0.82rem] text-muted">
          {DEVIS_TEXTE.conditions}{" "}
          <a href="/cgv" className="text-accent underline underline-offset-2">
            CGV
          </a>
          .
        </p>
      </div>

      {/* -------- coordonnées -------- */}
      <div className="flex items-baseline gap-2">
        <Eyebrow>Vos coordonnées</Eyebrow>
        <span className="font-mono text-[0.6rem] tracking-[0.06em] text-muted">
          — tous les champs sont requis
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Champ placeholder="Prénom" autoComplete="given-name" />
          <Champ placeholder="Nom" autoComplete="family-name" />
        </div>
        {/* Même composant et même habillage que le tunnel actuel
            (`.phone-input` dans globals.css) — pas de nouveau motif. */}
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

      <div className="mt-1 flex flex-col gap-2.5">
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
            <a href="/cgv" className="text-accent underline underline-offset-2">
              CGV
            </a>{" "}
            et la{" "}
            <a href="/confidentialite" className="text-accent underline underline-offset-2">
              politique de confidentialité
            </a>
            .
          </span>
        </Case>
      </div>
    </Ecran>
  );
}

function Ligne({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[0.84rem]">
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
      className="min-h-[46px] w-full min-w-0 flex-1 rounded-xl border border-line bg-surface px-3.5 text-[0.88rem] text-ink outline-none placeholder:text-muted/60 focus:border-accent"
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
        className="mt-0.5 h-[19px] w-[19px] shrink-0 cursor-pointer accent-accent"
      />
      <span className="text-[0.78rem] leading-relaxed text-muted">{children}</span>
    </label>
  );
}
