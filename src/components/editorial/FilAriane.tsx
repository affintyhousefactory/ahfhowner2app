import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/jsonld";

/**
 * Fil d'Ariane — visible **et** structuré (ADR-038 §6).
 *
 * Les deux vont ensemble : `BreadcrumbList` décrit aux moteurs un chemin que
 * le visiteur doit pouvoir suivre à l'œil. Poser le schéma sans le fil affiché
 * revient à décrire une navigation qui n'existe pas.
 *
 * Le dernier maillon n'est pas un lien — il désigne la page courante — mais il
 * porte `aria-current="page"` : un lecteur d'écran doit pouvoir situer où il
 * est, pas seulement d'où il vient.
 */
export function FilAriane({
  fil,
  clair = false,
}: {
  fil: readonly { nom: string; route: string }[];
  clair?: boolean;
}) {
  const dernier = fil.length - 1;
  return (
    <>
      <JsonLd data={breadcrumbSchema(fil)} />
      <nav
        aria-label="Fil d'Ariane"
        className="font-mono text-[0.7rem] uppercase tracking-[0.18em]"
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {fil.map((e, i) => (
            <li key={e.route} className="flex items-center gap-2">
              {i === dernier ? (
                <span
                  aria-current="page"
                  className={clair ? "text-canvas/70" : "text-muted"}
                >
                  {e.nom}
                </span>
              ) : (
                <>
                  <Link
                    href={e.route}
                    className={
                      clair
                        ? "text-canvas/60 transition-colors hover:text-canvas"
                        : "text-muted transition-colors hover:text-ink"
                    }
                  >
                    {e.nom}
                  </Link>
                  <span aria-hidden className={clair ? "text-canvas/30" : "text-line"}>
                    /
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
