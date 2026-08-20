import Image from "next/image";
import { reserverHref } from "@/lib/site";
import { pageParRoute } from "@/lib/pages/registry";
import { SOCLE_LOCAL, type PageLocale } from "@/lib/pages/contenu/locales";
import { EditorialHero } from "./EditorialHero";
import { CartesModeles } from "./CartesModeles";
import { BandeCta } from "./BandeCta";
import { FaqEditoriale } from "./FaqEditoriale";
import { PagesLiees } from "./PagesLiees";
import { Section, EnteteSection, Chapo, ListePuces, Reserve } from "./Bloc";
import { Etapes } from "./Listes";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Gabarit des pages locales (ADR-038, lot 4).
 *
 * Il rend deux choses de nature différente, et c'est délibéré :
 *
 * — **les sections propres à la commune**, qui viennent du contenu et portent
 *   l'angle de la page (l'accès à Bayonne, la tension logement à Anglet, la
 *   rareté des petites surfaces à Biarritz, le terrain sur la Côte Basque) ;
 * — **le socle commun** (fabrication hors-site, gamme, méthode), écrit une
 *   seule fois dans `SOCLE_LOCAL` et partagé par les quatre.
 *
 * C'est ce partage qui rend les pages tenables : ce qui est identique l'est
 * légitimement — la méthode de qualification ne change pas d'une commune à
 * l'autre — et ce qui diffère est ce sur quoi la page se positionne
 * réellement. Quatre pages qui n'auraient que le socle seraient dédupliquées
 * par les moteurs, et n'existeraient donc pour aucune requête.
 *
 * La date de vérification est affichée : ces pages citent des faits locaux
 * datés (documents d'urbanisme, dispositifs d'encadrement) qui se périment.
 */
export function PageLocaleView({ page: contenu }: { page: PageLocale }) {
  const entree = pageParRoute(contenu.route)!;

  const fil = [
    { nom: "Accueil", route: "/" },
    { nom: entree.libelle, route: contenu.route },
  ];

  return (
    <>
      <EditorialHero
        eyebrow={contenu.eyebrow}
        h1={entree.h1}
        chapo={contenu.chapo}
        paragraphes={contenu.paragraphes}
        fil={fil}
        principal={{ libelle: contenu.ctaHero, href: reserverHref() }}
        secondaire={{ libelle: "Voir les deux studios", href: "#modeles" }}
        visuel={contenu.visuel}
      />

      {/* Sections propres à la commune — l'angle de la page. */}
      <Section>
        <div className="max-w-3xl">
          {contenu.sections.map((s, i) => (
            <section key={s.titre} className={i === 0 ? "" : "mt-16 md:mt-20"}>
              <Reveal>
                <h2 className="editorial text-balance text-[1.6rem] leading-snug text-ink md:text-[2.2rem]">
                  {s.titre}
                </h2>
              </Reveal>

              {s.paragraphes?.map((p, j) => (
                <Reveal key={j} delay={0.04 * j}>
                  <p className="mt-5 text-[1.05rem] leading-relaxed text-ink/85">{p}</p>
                </Reveal>
              ))}

              {s.puces ? <ListePuces items={s.puces} /> : null}

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

              {s.reserve ? <Reserve>{s.reserve}</Reserve> : null}

              {s.cta ? (
                <Reveal>
                  <div className="mt-8">
                    <a
                      href={s.cta.href}
                      className="inline-flex items-center gap-2 border-b border-ink/20 pb-1 text-[1rem] text-ink transition-colors hover:border-ink"
                    >
                      {s.cta.libelle} →
                    </a>
                  </div>
                </Reveal>
              ) : null}
            </section>
          ))}
        </div>
      </Section>

      {/* Socle commun — hors-site. */}
      <Section fond="surface">
        <EnteteSection
          numero="La fabrication"
          titre={SOCLE_LOCAL.horsSite.titre}
          mention="Light Steel Frame"
        />
        <Chapo paragraphes={SOCLE_LOCAL.horsSite.paragraphes} />
        <Reserve>{SOCLE_LOCAL.horsSite.reserve}</Reserve>

        {contenu.visuelSecondaire ? (
          <Reveal delay={0.1}>
            <figure className="mt-14 md:mt-20">
              <div className="relative aspect-[16/9] w-full overflow-hidden border border-line bg-canvas">
                <Image
                  src={contenu.visuelSecondaire.src}
                  alt={contenu.visuelSecondaire.alt}
                  fill
                  sizes="(max-width: 768px) 92vw, 80vw"
                  className="object-cover"
                />
              </div>
            </figure>
          </Reveal>
        ) : null}
      </Section>

      {/* Socle commun — la gamme. */}
      <Section id="modeles">
        <EnteteSection
          numero="La gamme"
          titre="Le modèle se choisit sur l'usage et la parcelle"
          mention="One ou Max"
        />
        <CartesModeles
          one={{
            accroche: "Quand la compacité est la première contrainte.",
            texte:
              "Obtenir une vraie fonction supplémentaire avec une emprise maîtrisée — c'est souvent ce que la parcelle autorise.",
            usages: [
              "bureau de jardin",
              "chambre indépendante ou espace invité",
              "studio compact",
              "petit logement, selon configuration et autorisations",
            ],
          }}
          max={{
            accroche: "Quand le terrain et les règles permettent plus généreux.",
            texte:
              "Davantage de fonctions dans un même volume, pour une occupation plus longue ou plus autonome.",
            usages: [
              "studio habitable plus confortable",
              "espace destiné à un proche",
              "bureau avec zone de réunion",
              "séjour, couchage et salle d'eau distincts",
            ],
          }}
        />
      </Section>

      {/* Socle commun — la méthode. */}
      <Section fond="surface">
        <EnteteSection
          numero="La méthode"
          titre={SOCLE_LOCAL.methode.titre}
          mention="Six temps"
        />
        <Chapo paragraphes={[SOCLE_LOCAL.methode.intro]} />
        <Etapes
          items={SOCLE_LOCAL.methode.etapes.map((e) => {
            const [titre, ...reste] = e.split(" — ");
            return { titre, texte: reste.join(" — ") };
          })}
        />
        <Reserve>{SOCLE_LOCAL.methode.reserve}</Reserve>
      </Section>

      {contenu.faq ? (
        <Section>
          <div className="max-w-3xl">
            <Reveal>
              <h2 className="editorial text-[1.6rem] leading-snug text-ink md:text-[2.2rem]">
                Questions fréquentes — {entree.libelle}
              </h2>
            </Reveal>
            <FaqEditoriale items={contenu.faq} />
          </div>
        </Section>
      ) : null}

      {/* Avertissement + date de vérification des faits locaux datés. */}
      <Section fond="surface">
        <div className="max-w-3xl">
          <Reveal>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Faisabilité et urbanisme — vérifié le {contenu.verifieLe}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 border-l border-line pl-4 text-sm leading-relaxed text-muted">
              {SOCLE_LOCAL.avertissement}
            </p>
          </Reveal>
        </div>
      </Section>

      <PagesLiees
        famille="local"
        routeCourante={contenu.route}
        titre="Autres communes"
      />

      <BandeCta
        titre="Votre terrain mérite d'être étudié avant d'être écarté"
        texte="Une parcelle étroite ou un accès difficile ne signifient pas qu'un projet est impossible — pas plus qu'un grand jardin ne garantit qu'il l'est. La seule façon de savoir est de regarder."
        principal={{ libelle: contenu.ctaHero, href: reserverHref() }}
        secondaire={{ libelle: "Nos guides & réglementation", href: "/guide" }}
      />

      <PagesLiees
        famille="usage"
        routeCourante={contenu.route}
        titre="Selon votre usage"
        limite={3}
      />
    </>
  );
}
