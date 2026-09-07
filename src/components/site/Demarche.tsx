import { RSE } from "@/lib/pages/contenu/rse";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

/**
 * Accueil — « 011 · Notre démarche ».
 *
 * Le rang 011 était libre entre « 010 — En confiance » et « 012 — Questions » :
 * la démarche prolonge la confiance et précède les questions, sans qu'aucune
 * autre section ait à se renuméroter.
 *
 * Trois partis, tous liés au risque propre à ce sujet :
 *
 * — **Le texte vient de `contenu/rse.ts`**, pas d'une chaîne écrite ici. Une
 *   accroche RSE recopiée à la main dériverait du contenu de la page au premier
 *   ajustement, et l'accueil promettrait alors autre chose que ce que la page
 *   tient. C'est la seule vraie garantie de cohérence entre les deux.
 * — **Aucun chiffre, aucun label, aucune promesse.** L'accroche dit le
 *   principe et le mouvement, jamais un résultat : la page elle-même n'en
 *   affiche aucun.
 * — **Le CTA est sobre** et mène à la page, pas au configurateur. Brancher la
 *   conversion sur un engagement environnemental serait précisément le geste
 *   que cette page refuse.
 */
export function Demarche() {
  return (
    <section id="demarche" className="bg-surface py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="flex items-baseline justify-between border-t border-line pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              011 — Notre démarche RSE
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              HOWNER · ARKO
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="titre-xl mt-12 max-w-4xl text-balance text-ink md:mt-16">
            Pas de greenwashing.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-ink/80">
            Nous préférons mesurer une amélioration plutôt que revendiquer une
            qualité environnementale que nous ne pouvons pas démontrer.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-muted">
            {RSE.chapo}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10">
            <Button href={RSE.route} variant="outline">
              Découvrir notre démarche RSE
              <Arrow />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
