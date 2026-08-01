"use client";

/**
 * Écrans 2, 3 et 4 — ambiance, terrasse, options (ADR-030).
 *
 * Trois contraintes de la spec pilotent ces écrans :
 * — l'ambiance doit fonctionner à 2 comme à 3 items (§17.3, arbitrage ouvert) ;
 * — la terrasse se choisit par paliers, **jamais de prix au m²** (§5) ;
 * — une option incompatible avec le modèle est **absente**, jamais grisée (§15).
 */

import { cn } from "@/shared/lib/cn";
import { MENTIONS } from "@/lib/configurateur/mentions";
import { prixOption } from "@/lib/configurateur/config";
import { useConfigurateur, eur } from "./store";
import { Choix, Ecran, Eyebrow, Mention } from "./ui";

/* ------------------------------------------------------------------ */
/* Écran 2 — ambiance                                                  */
/* ------------------------------------------------------------------ */

export function Ecran2Ambiance() {
  const c = useConfigurateur();

  return (
    <Ecran titre="Ambiance" sous="Des versions pré-composées, incluses dans le prix.">
      {/* Visuel — les assets actuels sont conservés (ADR-030). La nomenclature
          cible {modele}_{vue}_{ambiance}.webp s'adoptera au fil des nouveaux. */}
      <div className="flex aspect-[4/3] items-end rounded-xl border border-line bg-gradient-to-br from-accent/15 to-transparent p-3">
        <span className="rounded border border-line bg-surface px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
          {c.modele} · {c.ambiance}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Ambiance"
        className="flex gap-1.5 rounded-full border border-line bg-paper p-1"
      >
        {c.cfg.ambiances.map((a) => {
          const actif = c.ambiance === a.id;
          return (
            <button
              key={a.id}
              role="tab"
              type="button"
              aria-selected={actif}
              onClick={() => c.setAmbiance(a.id)}
              className={cn(
                "min-h-[40px] flex-1 rounded-full px-2 text-[0.82rem] font-medium transition-colors",
                actif ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              {a.nom}
            </button>
          );
        })}
      </div>

      <Mention texte={MENTIONS.ambiance} />
    </Ecran>
  );
}

/* ------------------------------------------------------------------ */
/* Écran 3 — terrasse par paliers                                      */
/* ------------------------------------------------------------------ */

/** Hauteur de barre : encode la taille relative, pas un ratio tarifaire. */
const HAUTEUR: Record<string, number> = { sans: 8, petite: 20, moyenne: 32, grande: 46 };

export function Ecran3Terrasse() {
  const c = useConfigurateur();

  return (
    <Ecran titre="Terrasse" sous="Quatre paliers, dimensionnés pour votre unité.">
      <div className="grid grid-cols-4 gap-1.5">
        {c.paliers.map((p) => {
          const actif = c.terrasse === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={actif}
              onClick={() => c.setTerrasse(p.id)}
              className={cn(
                "flex min-h-[92px] flex-col items-center justify-end gap-1.5 rounded-xl border px-1.5 pb-2.5 pt-2.5 transition-all",
                actif ? "border-accent bg-accent/[0.07]" : "border-line bg-surface hover:border-accent/45",
              )}
            >
              <span
                aria-hidden
                style={{ height: HAUTEUR[p.id] }}
                className={cn("w-full rounded", actif ? "bg-accent" : "bg-accent/25")}
              />
              <span className="text-[0.72rem] font-semibold text-ink">
                {p.nom.replace("Sans terrasse", "Sans")}
              </span>
              <span className="font-mono text-[0.64rem] tabular-nums text-muted">
                {p.prixTtc === 0 ? "—" : eur(p.prixTtc)}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[0.78rem] leading-relaxed text-muted">
        Structure acier, dalle porcelaine 18 mm, finitions aluminium teinte au choix.
      </p>
    </Ecran>
  );
}

/* ------------------------------------------------------------------ */
/* Écran 4 — options, dont structurelles verrouillées                  */
/* ------------------------------------------------------------------ */

export function Ecran4Options() {
  const c = useConfigurateur();

  return (
    <Ecran titre="Options" sous="Ajoutées à votre prix, fournies et posées.">
      {c.optionsStructurelles.length > 0 && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-[#8a6a2f]/40 bg-[#8a6a2f]/[0.05] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-[#8a6a2f]/45 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-[#8a6a2f]">
              Structurel
            </span>
            <span className="text-[0.72rem] leading-snug text-muted">
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
          <Mention texte={MENTIONS.optionStructurelle} />
        </div>
      )}

      <div className="flex flex-col gap-2.5">
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
      </div>

      <Mention texte={MENTIONS.option} />
    </Ecran>
  );
}

/* ------------------------------------------------------------------ */
/* Écran 5 — dossier terrain : périmètre d'ADR-032                     */
/* ------------------------------------------------------------------ */

export function Ecran5Terrain() {
  const c = useConfigurateur();

  return (
    <Ecran
      titre="Dossier terrain"
      sous="L'accès conditionne la faisabilité autant que l'urbanisme."
    >
      <div className="rounded-xl border border-line bg-paper p-4">
        <p className="text-sm leading-relaxed text-muted">
          Nos unités arrivent par camion et se posent à la grue. Quelques photos et une
          vidéo de l&apos;accès, filmée depuis la rue jusqu&apos;à l&apos;emplacement,
          nous permettent de vous répondre avec certitude — avant que vous
          n&apos;engagiez quoi que ce soit.
        </p>
        <p className="mt-3 border-t border-dashed border-line pt-3 font-mono text-[0.66rem] leading-relaxed text-muted">
          Le dépôt des médias et la prise de rendez-vous de qualification arrivent
          prochainement. En attendant, notre conseiller les recueille lors de
          l&apos;appel.
        </p>
      </div>
      <Eyebrow>Étape suivante</Eyebrow>
      <p className="text-[0.82rem] leading-relaxed text-muted">
        Votre configuration est complète : {c.cfg.modeles.find((m) => m.id === c.modele)?.nom},
        ambiance {c.cfg.ambiances.find((a) => a.id === c.ambiance)?.nom.toLowerCase()}.
      </p>
    </Ecran>
  );
}
