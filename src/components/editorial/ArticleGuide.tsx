import Link from "next/link";
import { reserverHref } from "@/lib/site";
import { pageParRoute, guidesVoisins } from "@/lib/pages/registry";
import {
  SOURCES_REGLEMENTAIRES,
  SOURCES_VERIFIEES_LE,
  type Guide,
} from "@/lib/pages/contenu/guides";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { FilAriane } from "./FilAriane";
import { FaqEditoriale } from "./FaqEditoriale";
import { BandeCta } from "./BandeCta";
import { Reserve } from "./Bloc";
import { TableauMatrice } from "./Listes";

/**
 * Gabarit d'article de guide (ADR-038, lot 3).
 *
 * Un seul gabarit pour neuf articles : leur structure est identique — chapô,
 * sections, « à retenir », FAQ éventuelle, sources. Neuf pages écrites à la
 * main auraient divergé sur la hiérarchie des titres, et c'est précisément ce
 * qu'un moteur lit en premier.
 *
 * Trois partis qui ne sont pas cosmétiques :
 *
 * — **La réponse courte est en haut**, encadrée. Ces articles répondent à des
 *   questions fermées (« faut-il un permis ? ») : faire descendre la réponse
 *   sous cinq paragraphes est un procédé de rétention qui dessert le lecteur.
 * — **Les sources officielles sont affichées**, pas seulement conservées en
 *   commentaire. Un article réglementaire qui ne montre pas d'où il tient ses
 *   règles demande qu'on le croie sur parole, et interdit au lecteur de
 *   vérifier une règle qui aurait changé depuis. La date de consultation est
 *   affichée avec elles, pour la même raison.
 * — **L'avertissement de fin est constant** sur les neuf pages : ces contenus
 *   ne sont pas un avis juridique individualisé. C'est la règle éditoriale du
 *   hub, et elle ne se module pas d'un article à l'autre.
 */
export function ArticleGuide({ guide }: { guide: Guide }) {
  const page = pageParRoute(guide.route)!;
  const voisins = guidesVoisins(guide.route, 3);

  const fil = [
    { nom: "Accueil", route: "/" },
    { nom: "Guides & Réglementation", route: "/guide" },
    { nom: page.libelle, route: guide.route },
  ];

  return (
    <>
      {/* En-tête — fond sombre, comme les pages d'usage : le `<h1>` n'est
          porté que par `Reveal`, dont l'état masqué vit en CSS. Aucun titre ne
          naît sous un bloc animé en JS. */}
      <section className="bg-ink pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-page">
          <FilAriane fil={fil} clair />

          <Reveal>
            <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/60">
              Guide
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="titre-l mt-6 max-w-4xl text-balance text-canvas">
              {page.h1}
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 max-w-2xl text-[1.1rem] leading-relaxed text-canvas/85">
              {guide.chapo}
            </p>
          </Reveal>

          {guide.reponseCourte ? (
            <Reveal delay={0.15}>
              <div className="mt-10 max-w-2xl border-l-2 border-canvas/40 bg-canvas/5 p-6">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
                  En bref
                </p>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-canvas">
                  {guide.reponseCourte}
                </p>
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      <article className="bg-canvas py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            {guide.sections.map((s, i) => (
              <section key={s.titre} className={i === 0 ? "" : "mt-16 md:mt-20"}>
                <Reveal>
                  <h2 className="titre-l text-balance text-ink">
                    {s.titre}
                  </h2>
                </Reveal>

                {s.paragraphes?.map((p, j) => (
                  <Reveal key={j} delay={0.04 * j}>
                    <p className="mt-5 text-[1.05rem] leading-relaxed text-ink/85">{p}</p>
                  </Reveal>
                ))}

                {s.puces ? (
                  <Reveal>
                    <ul className="mt-6 space-y-3">
                      {s.puces.map((item) => (
                        <li key={item} className="flex items-baseline gap-3">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted/60" />
                          <span className="text-[1rem] leading-relaxed text-ink/85">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ) : null}

                {s.etapes ? (
                  <Reveal>
                    <ol className="mt-6 space-y-4">
                      {s.etapes.map((item, k) => (
                        <li key={item} className="flex items-baseline gap-4">
                          <span className="font-mono text-[0.75rem] tabular-nums text-muted">
                            {String(k + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[1rem] leading-relaxed text-ink/85">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Reveal>
                ) : null}

                {s.tableau ? (
                  <TableauMatrice
                    entetes={s.tableau.entetes}
                    lignes={s.tableau.lignes.map((l) => ({
                      tete: l.gauche,
                      cellules: [l.droite],
                    }))}
                  />
                ) : null}

                {s.reserve ? <Reserve>{s.reserve}</Reserve> : null}

                {s.cta ? (
                  <Reveal>
                    <div className="mt-8">
                      <Button href={s.cta.href} variant="outline">
                        {s.cta.libelle}
                        <Arrow />
                      </Button>
                    </div>
                  </Reveal>
                ) : null}
              </section>
            ))}

            {guide.aRetenir ? (
              <Reveal>
                <aside className="mt-16 border-t border-line pt-8 md:mt-20">
                  <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                    À retenir
                  </h2>
                  <ul className="mt-6 space-y-3">
                    {guide.aRetenir.map((item) => (
                      <li key={item} className="flex items-baseline gap-3">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        <span className="text-[1.05rem] leading-relaxed text-ink">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </aside>
              </Reveal>
            ) : null}
          </div>
        </div>
      </article>

      {guide.faq ? (
        <section className="bg-surface py-16 md:py-24">
          <div className="container-page">
            <div className="max-w-3xl">
              <Reveal>
                <h2 className="titre-l text-ink">
                  Questions fréquentes
                </h2>
              </Reveal>
              <FaqEditoriale items={guide.faq} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Maillage — dérivé du registre, donc jamais vers une page absente. */}
      {voisins.length > 0 ? (
        <section className="bg-canvas py-16 md:py-24">
          <div className="container-page">
            <Reveal>
              <div className="rule flex items-baseline justify-between pt-5">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                  Poursuivre
                </span>
                <Link
                  href="/guide"
                  className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
                >
                  Tous les guides
                </Link>
              </div>
            </Reveal>
            <div className="mt-10">
              {voisins.map((v, i) => (
                <Reveal key={v.route} delay={0.05 * i}>
                  <Link
                    href={v.route}
                    className="group flex items-baseline justify-between gap-8 border-b border-line py-6 transition-colors hover:border-ink/40"
                  >
                    <div className="max-w-2xl">
                      <h3 className="text-[1.1rem] font-medium tracking-tight text-ink md:text-[1.3rem]">
                        {v.libelle}
                      </h3>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                        {v.resume}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className="shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <Arrow />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Sources — affichées, datées, et suivies de l'avertissement constant. */}
      <section className="bg-surface py-16 md:py-20">
        <div className="container-page">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                Sources officielles — consultées le {SOURCES_VERIFIEES_LE}
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <ul className="mt-6 space-y-2.5">
                {SOURCES_REGLEMENTAIRES.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.95rem] leading-relaxed text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                    >
                      {s.libelle}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 border-l border-line pl-4 text-sm leading-relaxed text-muted">
                {`Ces contenus sont informatifs et ne constituent pas un avis
                juridique individualisé. Le PLU, les servitudes, les secteurs
                protégés, l'usage projeté, l'emprise au sol, la surface de plancher
                et les caractéristiques du terrain peuvent modifier la procédure
                applicable à votre projet.`}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <BandeCta
        titre="Donner forme à votre projet"
        texte="Choisissez votre modèle, votre ambiance et vos options : le configurateur transforme une intention en première version de projet."
        principal={{ libelle: "Configurer mon studio", href: reserverHref() }}
        secondaire={{ libelle: "Tous les guides", href: "/guide" }}
      />
    </>
  );
}
