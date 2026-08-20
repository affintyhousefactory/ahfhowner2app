import Link from "next/link";
import { pagesDeFamille, type FamillePage } from "@/lib/pages/registry";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Button";

/**
 * Maillage interne — dérivé du registre, jamais écrit à la main.
 *
 * La spec impose 2 à 4 liens internes par page. Écrits en dur, ils pourrissent
 * au premier renommage et pointent vers des pages qui n'existent pas encore ;
 * dérivés du registre, ils ne peuvent désigner qu'une page **publiée**.
 *
 * Conséquence voulue pendant le chantier : tant que les pages voisines sont à
 * `"a-venir"`, ce bloc ne rend **rien du tout** — pas un titre orphelin, pas
 * une liste vide. Le maillage apparaît de lui-même à mesure que les lots
 * passent en ligne.
 */
export function PagesLiees({
  famille,
  routeCourante,
  titre = "À lire aussi",
  limite = 3,
}: {
  famille: FamillePage;
  routeCourante: string;
  titre?: string;
  limite?: number;
}) {
  const pages = pagesDeFamille(famille)
    .filter((p) => p.route !== routeCourante)
    .slice(0, limite);

  if (pages.length === 0) return null;

  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              {titre}
            </span>
          </div>
        </Reveal>

        <div className="mt-10 md:mt-14">
          {pages.map((p, i) => (
            <Reveal key={p.route} delay={0.05 * i}>
              <Link
                href={p.route}
                className="group flex items-baseline justify-between gap-8 border-b border-line py-6 transition-colors hover:border-ink/40"
              >
                <div className="max-w-2xl">
                  <h3 className="text-[1.15rem] font-medium tracking-tight text-ink md:text-[1.4rem]">
                    {p.libelle}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                    {p.resume}
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
  );
}
