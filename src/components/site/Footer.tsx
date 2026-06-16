import { BRAND, NAV } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-ink text-canvas">
      <div className="container-page">
        {/* Carte de fin éditoriale */}
        <div className="flex flex-col gap-10 py-20 md:py-28">
          <div className="flex items-baseline justify-between border-b border-canvas/15 pb-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
              013 — {BRAND.location}
            </span>
            <a
              href="#reserver"
              className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55 transition-colors hover:text-canvas"
            >
              Réserver →
            </a>
          </div>

          <h2 className="editorial text-balance text-[3rem] leading-[0.98] text-canvas md:text-[7rem]">
            {BRAND.baseline}
          </h2>
        </div>

        {/* Colonnes */}
        <div className="grid gap-10 border-t border-canvas/15 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-medium tracking-tight text-canvas">
                {BRAND.maker}
              </span>
              <span className="font-mono text-[0.7rem] tracking-[0.2em] text-canvas/50">
                / {BRAND.model}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-canvas/60">
              Une maison compacte d'architecte, conçue avec notre architecte
              intégrée et livrée prête à vivre. {BRAND.location} — fondée par
              Puigbo.
            </p>
          </div>

          <nav className="flex flex-col gap-2.5">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
              Le projet
            </p>
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm text-canvas/65 transition-colors hover:text-canvas"
              >
                {n.label}
              </a>
            ))}
            <a href="#reserver" className="text-sm text-canvas/65 transition-colors hover:text-canvas">
              Réserver
            </a>
          </nav>

          <nav className="flex flex-col gap-2.5">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
              Informations
            </p>
            <a href="#" className="text-sm text-canvas/65 transition-colors hover:text-canvas">CGV</a>
            <a href="#" className="text-sm text-canvas/65 transition-colors hover:text-canvas">Mentions légales</a>
            <a href="#" className="text-sm text-canvas/65 transition-colors hover:text-canvas">Confidentialité</a>
            <a href="#" className="text-sm text-canvas/65 transition-colors hover:text-canvas">Contact</a>
          </nav>
        </div>

        <p className="border-t border-canvas/15 py-6 text-center font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
          HOWNER · ARKO · Série 01 · {BRAND.location} — Conçu avec notre
          architecte intégrée
        </p>

        <div className="flex flex-col gap-3 border-t border-canvas/15 py-7 text-xs text-canvas/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.maker}. Tous droits réservés.</p>
          <p className="font-mono">Renders d'intention — visuels non contractuels.</p>
        </div>
      </div>
    </footer>
  );
}
