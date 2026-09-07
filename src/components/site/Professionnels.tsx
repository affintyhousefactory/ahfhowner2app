import { HEBERGEMENTS_PRO as C } from "@/lib/pages/contenu/hebergements-professionnels";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

/**
 * Accueil — « 012 · Professionnels ».
 *
 * Insérée entre la démarche RSE et la FAQ, qui passe donc au rang 013 : le
 * numéro est une position dans la page, pas un identifiant, et laisser un trou
 * ferait chercher la section manquante.
 *
 * Trois partis :
 *
 * — **Fond sombre.** L'accueil s'adresse d'abord à un particulier ; cette
 *   section parle à quelqu'un d'autre. La rupture visuelle dit ce changement
 *   d'interlocuteur mieux qu'un titre ne le ferait, et la section précédente
 *   (« Notre démarche RSE ») est claire — l'alternance tient.
 * — **Quatre points, pas huit.** La page en détaille huit ; en reprendre la
 *   totalité ici ferait de l'accroche un doublon, et personne ne cliquerait.
 *   On garde ceux qu'un exploitant reconnaît immédiatement comme ses
 *   questions.
 * — **Le texte vient de `contenu/hebergements-professionnels.ts`.** Même règle
 *   que pour la RSE : deux copies du même argument dérivent au premier
 *   ajustement, et l'accueil finit par promettre autre chose que la page.
 */
export function Professionnels() {
  return (
    <section id="professionnels" className="bg-ink py-24 text-canvas md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="flex items-baseline justify-between border-t border-canvas/15 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
              012 — Professionnels
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
              Camping · Hôtellerie de plein air
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="titre-xl mt-12 max-w-4xl text-balance text-canvas md:mt-16">
            {C.hero.chapo}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-canvas/75">
            {C.hero.paragraphes[0]}
          </p>
        </Reveal>

        {/* Les quatre questions qu'un exploitant se pose en premier — extraites
            des huit de la page, dont elles gardent l'ordre. */}
        <Stagger className="mt-10 grid gap-x-10 gap-y-4 md:grid-cols-2">
          {C.etude.puces.slice(0, 4).map((p) => (
            <StaggerItem key={p}>
              <div className="flex items-baseline gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-canvas/40" />
                <span className="text-[0.98rem] leading-relaxed text-canvas/80">{p}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl text-[0.95rem] leading-relaxed text-canvas/55">
            {C.hero.paragraphes[1]}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10">
            <Button href={C.route} variant="lumiere">
              {C.cta.libelle}
              <Arrow />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
