"use client";

import { FAQ } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

/* Rend les segments **gras** d'un texte FAQ en <strong>, sans dépendance markdown. */
function renderInlineBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function Faq() {
  return (
    <section id="faq" className="bg-canvas py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              012 — Questions
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              L'essentiel
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="titre-xl mt-12 max-w-3xl text-balance text-ink md:mt-16">
            Les réponses, franches.
          </h2>
        </Reveal>

        <div className="mt-14 md:mt-20">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.04}>
              <details className="group border-b border-line py-5">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6">
                  <span className="text-[1.15rem] font-medium tracking-tight text-ink md:text-[1.4rem]">
                    {item.q}
                  </span>
                  <span className="mt-1 shrink-0 font-mono text-xl text-muted transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="mt-4 max-w-2xl space-y-4">
                  {(Array.isArray(item.a) ? item.a : [item.a]).map((paragraph, j) => {
                    const [maybeTitle, ...rest] = paragraph.split("\n");
                    const isStep = rest.length > 0 && /^Étape \d/.test(maybeTitle);
                    return (
                      <div key={j}>
                        {isStep && (
                          <p className="text-[0.98rem] font-medium text-ink">{maybeTitle}</p>
                        )}
                        <p className="text-[0.98rem] leading-relaxed text-muted">
                          {renderInlineBold(isStep ? rest.join("\n") : paragraph)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
