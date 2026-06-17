import { BRAND } from "@/lib/site";

/* Gabarit des pages légales.
   - `pending` (défaut true) : document non validé → bandeau d'avertissement
     juridique (ADR-015), ex. CGV.
   - `pending={false}` + `updated` : document finalisé → mention « Dernière
     mise à jour » + rendu riche (legal-prose). */
export function LegalShell({
  eyebrow,
  title,
  pending = true,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  pending?: boolean;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="pt-16 md:pt-[4.5rem]">
      <section className="container-page py-20 md:py-28">
        <div className="rule flex items-baseline justify-between pt-5">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            {eyebrow}
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            {BRAND.maker}
          </span>
        </div>

        <h1 className="editorial mt-10 max-w-3xl text-balance text-[2.4rem] leading-[1.04] text-ink md:mt-14 md:text-[4.5rem]">
          {title}
        </h1>

        {pending ? (
          /* Bandeau d'état juridique (ADR-015) — documents non validés. */
          <div className="mt-10 max-w-2xl rounded-2xl border border-line bg-surface p-6">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent">
              Document en cours de validation juridique
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Le contenu définitif de cette page est en cours de rédaction avec
              notre conseil. Il sera publié avant toute mise en vente. Les
              éléments ci-dessous sont indicatifs et non contractuels.
            </p>
          </div>
        ) : updated ? (
          <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
            Dernière mise à jour · {updated}
          </p>
        ) : null}

        {pending ? (
          <div className="mt-10 max-w-2xl space-y-6 text-sm leading-relaxed text-ink/80">
            {children}
          </div>
        ) : (
          <div className="legal-prose mt-12 max-w-3xl">{children}</div>
        )}
      </section>
    </main>
  );
}
