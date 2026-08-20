import { Reveal } from "@/components/ui/Reveal";

/**
 * FAQ de page éditoriale.
 *
 * Rendue en `<details>` natifs : ouverture sans JavaScript, donc le texte des
 * réponses est **dans le HTML servi** — c'est la condition pour qu'un moteur
 * les lise, et c'est aussi ce qui autorise le schéma `FAQPage` (ADR-038 §6 :
 * jamais posé si les réponses ne sont pas réellement visibles).
 *
 * Composant serveur : `<details>` n'a besoin d'aucun état React.
 */
export function FaqEditoriale({
  items,
}: {
  items: readonly { q: string; a: string }[];
}) {
  return (
    <div className="mt-14 md:mt-20">
      {items.map((item, i) => (
        <Reveal key={item.q} delay={i * 0.04}>
          <details className="group border-b border-line py-5">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6">
              <h3 className="text-[1.1rem] font-medium tracking-tight text-ink md:text-[1.3rem]">
                {item.q}
              </h3>
              <span
                aria-hidden
                className="mt-1 shrink-0 font-mono text-xl text-muted transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-muted">
              {item.a}
            </p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
