import { reserverHref, RESERVER_LABEL } from "@/lib/site";
import { pageParRoute } from "@/lib/pages/registry";
import { ETATS_INDICATEUR, RSE } from "@/lib/pages/contenu/rse";
import { Reveal } from "@/components/ui/Reveal";
import { FilAriane } from "./FilAriane";
import { FaqEditoriale } from "./FaqEditoriale";
import { BandeCta } from "./BandeCta";
import { Reserve } from "./Bloc";

/**
 * Page « Démarche RSE » — gabarit propre, dans la coque du Guide (ADR-038).
 *
 * Pourquoi elle n'utilise pas `ArticleGuide` comme les neuf autres pages du
 * Guide (arbitrage de Richard, 2026-09-07) : ce gabarit rend des paragraphes,
 * des puces et des tableaux. Or **quatre blocs de cette page sont l'argument
 * lui-même**, et une liste à puces les tuerait :
 *
 * — le **cycle de vie** doit se lire comme une chaîne, parce que le propos est
 *   qu'aucune étape n'est ignorée ;
 * — la **grille d'indicateurs** doit montrer des cases vides assumées : c'est
 *   une page qui revendique de ne pas savoir encore ;
 * — la **trajectoire** doit se lire comme un mouvement, pas comme cinq items ;
 * — les **cartes du territoire** portent la seule partie non environnementale
 *   de la démarche, et se perdraient dans le fil du texte.
 *
 * Tout le reste est repris à l'identique : fil d'Ariane, `Reveal`, `Reserve`,
 * `FaqEditoriale`, `BandeCta`, rythme des sections et hiérarchie des titres.
 *
 * ⚠ Aucun texte n'est écrit ici. Tout vient de `contenu/rse.ts` — convention
 * ADR-038, et surtout : les garde-fous anti-greenwashing sont documentés à
 * côté du copy, là où on les relit avant de le modifier.
 */
export function DemarcheRse() {
  const page = pageParRoute(RSE.route)!;

  const fil = [
    { nom: "Accueil", route: "/" },
    { nom: "Guides & Réglementation", route: "/guide" },
    { nom: page.libelle, route: RSE.route },
  ];

  return (
    <>
      {/* — Hero — même construction que les articles du Guide : fond sombre,
          `<h1>` porté par `Reveal` seul, dont l'état masqué vit en CSS. */}
      <section className="bg-ink pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-page">
          <FilAriane fil={fil} clair />

          <Reveal>
            <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/60">
              {RSE.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="titre-l mt-6 max-w-4xl text-balance text-canvas">
              {page.h1}
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 max-w-2xl text-[1.1rem] leading-relaxed text-canvas/85">
              {RSE.chapo}
            </p>
          </Reveal>

          {/* Le principe est posé avant tout le reste — c'est la promesse que
              la page doit ensuite tenir section après section. */}
          <Reveal delay={0.15}>
            <p className="mt-10 inline-block border border-canvas/25 px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-canvas">
              {RSE.badge}
            </p>
          </Reveal>
        </div>
      </section>

      {/* — 1. Les indicateurs — **en tête de page** depuis le 2026-09-07
          (décision de Richard). C'est la section qui prouve la méthode : la
          placer avant les convictions qu'elle sert à vérifier évite de faire
          lire trois écrans d'intentions avant la seule page où l'on montre ce
          qu'on ne sait pas encore.

          Elle affiche deux choses qui ne doivent jamais se confondre : notre
          état de mesure (l'étiquette) et un ordre de grandeur public (le
          repère, avec sa source cliquable). D'où deux traitements visuels
          distincts et une mention explicite sur chaque repère. */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="titre-l text-balance text-ink">{RSE.indicateurs.titre}</h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-ink/85">
                {RSE.indicateurs.intro}
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-px bg-line md:grid-cols-2">
            {RSE.indicateurs.items.map((ind, i) => (
              <Reveal key={ind.libelle} delay={0.02 * i}>
                <div className="flex h-full flex-col bg-surface p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline">
                    <div className="min-w-0">
                      <h3 className="text-[0.98rem] font-medium tracking-tight text-ink">
                        {ind.libelle}
                      </h3>
                      {ind.note ? (
                        <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">
                          {ind.note}
                        </p>
                      ) : null}
                    </div>
                    {/* L'état est un libellé, jamais un chiffre ni une jauge :
                        une barre de progression suggérerait une avancée
                        quantifiée que nous ne mesurons pas. */}
                    <span
                      className={
                        ind.etat === "mesure-en-cours"
                          ? "shrink-0 whitespace-nowrap border border-accent/40 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-accent"
                          : "shrink-0 whitespace-nowrap border border-line px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted"
                      }
                    >
                      {ETATS_INDICATEUR[ind.etat]}
                    </span>
                  </div>

                  {/* Le repère public — visuellement détaché de ce qui précède,
                      et annoncé comme extérieur à Howner dès son étiquette. Un
                      ordre de grandeur posé sans cette précaution se lirait
                      comme notre résultat. */}
                  {ind.repere ? (
                    <div className="mt-4 border-t border-dashed border-line pt-3">
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
                        Repère public — pas notre chiffre
                      </p>
                      <p className="mt-1.5 font-mono text-[0.9rem] tabular-nums text-ink">
                        {ind.repere.valeur}
                      </p>
                      <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">
                        {ind.repere.precision}
                      </p>
                      <a
                        href={ind.repere.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-[0.8rem] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                      >
                        {ind.repere.source}
                      </a>
                    </div>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>

          {/* L'objectif chiffré vient après la grille, pas avant : il ne se
              comprend qu'une fois vu ce qui est mesuré et ce qui ne l'est pas
              encore. Sa réserve est attachée, jamais reléguée. */}
          <div className="mt-12 max-w-3xl border-l-2 border-accent pl-6">
            <Reveal>
              <p className="titre-s text-ink">{RSE.indicateurs.objectif.titre}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-3 text-[1.05rem] leading-relaxed text-ink/85">
                {RSE.indicateurs.objectif.texte}
              </p>
            </Reveal>
            <Reserve>{RSE.indicateurs.objectif.reserve}</Reserve>
          </div>

          <div className="mt-8 max-w-3xl">
            <Reserve>{RSE.indicateurs.reserve}</Reserve>
          </div>
        </div>
      </section>

      <article className="bg-canvas py-16 md:py-24">
        <div className="container-page">
          {/* — 2. Notre conviction — */}
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="titre-l text-balance text-ink">{RSE.conviction.titre}</h2>
            </Reveal>
            {RSE.conviction.paragraphes.map((p, i) => (
              <Reveal key={i} delay={0.04 * i}>
                <p className="mt-5 text-[1.05rem] leading-relaxed text-ink/85">{p}</p>
              </Reveal>
            ))}
          </div>

          <Citation texte={RSE.conviction.citation} />

          {/* — 3. La sobriété — */}
          <div className="mt-16 max-w-3xl md:mt-24">
            <Reveal>
              <h2 className="titre-l text-balance text-ink">{RSE.sobriete.titre}</h2>
            </Reveal>
            {RSE.sobriete.paragraphes.map((p, i) => (
              <Reveal key={i} delay={0.04 * i}>
                <p className="mt-5 text-[1.05rem] leading-relaxed text-ink/85">{p}</p>
              </Reveal>
            ))}
            <Reveal>
              <ul className="mt-6 space-y-3">
                {RSE.sobriete.puces.map((item) => (
                  <li key={item} className="flex items-baseline gap-3">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted/60" />
                    <span className="text-[1rem] leading-relaxed text-ink/85">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reserve>{RSE.sobriete.reserve}</Reserve>
          </div>
        </div>
      </article>

      {/* — 4. Le cycle de vie — fond distinct : c'est le cœur méthodologique. */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="titre-l text-balance text-ink">{RSE.cycle.titre}</h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-ink/85">
                {RSE.cycle.intro}
              </p>
            </Reveal>
          </div>

          {/* Une chaîne, pas une liste : chaque étape porte son rang et reste
              reliée à la suivante par un filet. Le propos de la section est
              qu'aucun maillon n'est écarté — l'énumération à puces le dirait
              beaucoup moins. */}
          <ol className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {RSE.cycle.etapes.map((e, i) => (
              <Reveal key={e.nom} delay={0.03 * i}>
                <li className="flex h-full flex-col bg-surface p-5">
                  <span className="font-mono text-[0.7rem] tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-[1.05rem] font-medium tracking-tight text-ink">
                    {e.nom}
                  </h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{e.quoi}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          <div className="mt-12 max-w-3xl">
            <Reveal>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                Ce que nous documentons
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <ul className="mt-4 flex flex-wrap gap-2">
                {RSE.cycle.suivis.map((s) => (
                  <li
                    key={s}
                    className="border border-line bg-canvas px-3 py-1.5 text-[0.85rem] text-ink/80"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reserve>{RSE.cycle.reserve}</Reserve>
          </div>
        </div>
      </section>

      <article className="bg-canvas py-16 md:py-24">
        <div className="container-page">
          {/* — 5. Réduire les pertes — */}
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="titre-l text-balance text-ink">{RSE.pertes.titre}</h2>
            </Reveal>
            {RSE.pertes.paragraphes.map((p, i) => (
              <Reveal key={i} delay={0.04 * i}>
                <p className="mt-5 text-[1.05rem] leading-relaxed text-ink/85">{p}</p>
              </Reveal>
            ))}
            <Reveal>
              <ul className="mt-6 space-y-3">
                {RSE.pertes.puces.map((item) => (
                  <li key={item} className="flex items-baseline gap-3">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted/60" />
                    <span className="text-[1rem] leading-relaxed text-ink/85">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Citation texte={RSE.pertes.citation} />
        </div>
      </article>

      {/* — 6. Le territoire — fond sombre : c'est la section que la spec veut
          la plus forte, et la seule qui ne parle pas d'environnement. */}
      <section className="bg-ink py-16 text-canvas md:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="titre-l text-balance text-canvas">{RSE.territoire.titre}</h2>
            </Reveal>
            {RSE.territoire.paragraphes.map((p, i) => (
              <Reveal key={i} delay={0.04 * i}>
                <p className="mt-5 text-[1.05rem] leading-relaxed text-canvas/80">{p}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {RSE.territoire.cartes.map((c, i) => (
              <Reveal key={c.titre} delay={0.05 * i}>
                <div className="border-t border-canvas/15 pt-5">
                  <span className="font-mono text-[0.7rem] tabular-nums text-canvas/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="titre-s mt-3 text-canvas">{c.titre}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-canvas/65">
                    {c.texte}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <blockquote className="mt-14 max-w-3xl border-l-2 border-canvas/40 pl-6">
              <p className="text-[1.25rem] leading-snug text-canvas md:text-[1.5rem]">
                {RSE.territoire.citation}
              </p>
            </blockquote>
          </Reveal>

          <Reveal>
            <p className="mt-8 max-w-3xl border-l border-canvas/20 pl-4 text-sm leading-relaxed text-canvas/60">
              {RSE.territoire.reserve}
            </p>
          </Reveal>
        </div>
      </section>

      {/* — 7. Les engagements — */}
      <section className="bg-canvas py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="titre-l text-balance text-ink">{RSE.engagements.titre}</h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-ink/85">
                {RSE.engagements.intro}
              </p>
            </Reveal>
          </div>

          <div className="mt-12">
            {RSE.engagements.items.map((e, i) => (
              <Reveal key={e.titre} delay={0.04 * i}>
                <div className="flex flex-col gap-2 border-b border-line py-6 md:flex-row md:gap-10">
                  <span className="font-mono text-[0.75rem] tabular-nums text-accent md:w-16 md:shrink-0 md:pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[1.1rem] font-medium tracking-tight text-ink md:w-72 md:shrink-0">
                    {e.titre}
                  </h3>
                  <p className="max-w-2xl text-[0.98rem] leading-relaxed text-ink/80">
                    {e.texte}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* — 8. La trajectoire — un mouvement, d'où le filet qui relie les rangs. */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="titre-l text-balance text-ink">{RSE.trajectoire.titre}</h2>
            </Reveal>
          </div>

          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {RSE.trajectoire.etapes.map((e, i) => (
              <Reveal key={e.titre} delay={0.05 * i}>
                <li className="relative">
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-accent font-mono text-[0.68rem] tabular-nums text-accent">
                      {i + 1}
                    </span>
                    {/* Le filet s'arrête au dernier rang : une trajectoire qui
                        se prolonge dans le vide promettrait une suite datée. */}
                    {i < RSE.trajectoire.etapes.length - 1 ? (
                      <span aria-hidden className="hidden h-px flex-1 bg-line lg:block" />
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-[1.05rem] font-medium tracking-tight text-ink">
                    {e.titre}
                  </h3>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{e.texte}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* — 9. Conclusion — */}
      <section className="bg-canvas py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="titre-l text-balance text-ink">{RSE.conclusion.titre}</h2>
            </Reveal>
            {RSE.conclusion.paragraphes.map((p, i) => (
              <Reveal key={i} delay={0.04 * i}>
                <p className="mt-5 text-[1.05rem] leading-relaxed text-ink/85">{p}</p>
              </Reveal>
            ))}
          </div>

          <Citation texte={RSE.conclusion.citation} />

          <div className="mt-16 max-w-3xl">
            <Reveal>
              <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                À retenir
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <ul className="mt-6 space-y-3">
                {RSE.aRetenir.map((item) => (
                  <li key={item} className="flex items-baseline gap-3">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span className="text-[1.05rem] leading-relaxed text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="titre-l text-ink">Questions fréquentes</h2>
            </Reveal>
            <FaqEditoriale items={RSE.faq} />
          </div>
        </div>
      </section>

      {/* CTA de clôture — délibérément sobre : la spec écarte tout appel
          commercial appuyé sur cette page. */}
      <BandeCta
        titre="Découvrir les studios Arko"
        texte="Deux formats, une même exigence de conception. Composez une première version de votre projet, ou parcourez nos guides."
        principal={{ libelle: RESERVER_LABEL, href: reserverHref() }}
        secondaire={{ libelle: "Tous les guides", href: "/guide" }}
      />
    </>
  );
}

/** Citation pleine largeur — le seul ornement de la page, et il porte du texte. */
function Citation({ texte }: { texte: string }) {
  return (
    <Reveal>
      <blockquote className="mt-12 max-w-3xl border-l-2 border-accent pl-6 md:mt-16">
        <p className="text-[1.25rem] leading-snug text-ink md:text-[1.6rem]">{texte}</p>
      </blockquote>
    </Reveal>
  );
}
