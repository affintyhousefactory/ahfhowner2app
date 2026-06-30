import Link from "next/link";

const OPPORTUNITES = [
  {
    icon: "🌱",
    label: "Un terrain à valoriser",
    desc: "Constructibilité partielle, terrain agricole converti, diffus — transformez la contrainte en projet.",
  },
  {
    icon: "🏡",
    label: "Un jardin sous-exploité",
    desc: "Extension de parcelle, dépendance, détachement — votre client n'y avait pas pensé, vous si.",
  },
  {
    icon: "🔍",
    label: "Un client qui cherche autrement",
    desc: "Habiter, investir, agrandir — pour ceux que l'immobilier classique ne convainc plus.",
  },
];

const USAGES = [
  { icon: "🏠", label: "Habitat indépendant" },
  { icon: "👨‍👩‍👧", label: "Logement familial" },
  { icon: "💼", label: "Bureau ou activité professionnelle" },
  { icon: "📈", label: "Investissement locatif" },
  { icon: "🌿", label: "Extension de valeur sur une parcelle" },
];

export default function MandataireLandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      {/* Header sticky */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7469F4]">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm sm:text-base">HOWNER</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/mandataire/auth/signin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/mandataire/auth/signup"
              className="rounded-lg bg-[#7469F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a54d4] transition-colors shadow-sm"
            >
              Devenir Mandataire
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#7469F4]/10 px-4 py-1.5 text-sm font-medium text-[#7469F4]">
          🚀 Mandataires Partenaires HOWNER
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Donnez une nouvelle dimension
          <br className="hidden sm:block" />
          à vos opportunités immobilières
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500">
          Un terrain à valoriser. Un jardin sous-exploité. Un client qui cherche à habiter, investir ou agrandir autrement.{" "}
          <span className="font-medium text-gray-800">
            HOWNER vous aide à transformer ces opportunités en projets concrets.
          </span>
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/mandataire/auth/signup"
            className="w-full rounded-xl bg-[#7469F4] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#7469F4]/20 hover:bg-[#5a54d4] transition-colors sm:w-auto"
          >
            Devenir Mandataire →
          </Link>
          <Link
            href="/mandataire/auth/signin"
            className="w-full rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors sm:w-auto"
          >
            J'ai déjà un compte
          </Link>
        </div>
      </section>

      {/* Opportunités */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
              Pourquoi HOWNER
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Chaque opportunité mérite un projet
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {OPPORTUNITES.map((o) => (
              <div
                key={o.label}
                className="rounded-2xl border border-gray-100 bg-[#f4f4f0] p-6"
              >
                <span className="text-3xl">{o.icon}</span>
                <h3 className="mt-4 font-semibold text-gray-900">{o.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Micro-maisons */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <span className="text-3xl">🏡</span>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            Des micro-maisons qui font la différence
          </h2>
          <p className="mt-2 text-gray-500">
            Des modèles contemporains, conçus pour les nouveaux usages
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {USAGES.map((u) => (
            <div
              key={u.label}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <span className="text-2xl shrink-0">{u.icon}</span>
              <span className="font-medium text-gray-800">{u.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Votre rôle */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="text-3xl">🤝</span>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              Votre rôle : révéler le potentiel
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f4f4f0] p-8">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-gray-400">
                Vous
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-700">
                Vous connaissez votre territoire et vos clients.
                <br />
                Vous détectez l'opportunité.
              </p>
            </div>
            <div className="rounded-2xl border border-[#7469F4]/15 bg-[#7469F4]/5 p-8">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/60">
                HOWNER
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-700">
                Apporte l'expertise produit
                <br />
                et le parcours projet complet.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 px-8 py-8 text-center">
            <p className="text-base text-gray-600">Ensemble, vous proposez plus qu'un bien :</p>
            <p className="mt-2 text-xl font-bold text-[#7469F4]">
              une nouvelle façon d'habiter et de valoriser l'immobilier.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#7469F4] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Prêt à rejoindre le réseau HOWNER ?
          </h2>
          <p className="mt-3 text-[#c7c4f8]">
            100 % success fee · Aucun frais fixe · Contrat-cadre bilatéral sécurisé
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/mandataire/auth/signup"
              className="w-full rounded-xl bg-white px-8 py-4 text-base font-semibold text-[#7469F4] hover:bg-gray-50 transition-colors sm:w-auto"
            >
              Devenir Mandataire →
            </Link>
            <Link
              href="/mandataire/auth/signin"
              className="w-full rounded-xl border border-white/30 px-8 py-4 text-base font-medium text-white hover:bg-white/10 transition-colors sm:w-auto"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#f4f4f0] py-6 text-center text-sm text-gray-400">
        <Link href="/" className="hover:text-gray-600 transition-colors">
          ← Retour au site HOWNER
        </Link>
        <span className="mx-3">·</span>
        <span>© {new Date().getFullYear()} Affinity House Factory</span>
      </footer>
    </div>
  );
}
