import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";

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

const ETAPES = [
  {
    n: "01",
    icon: "📝",
    label: "Créez votre compte",
    desc: "Profil professionnel, carte pro / RSAC, assurance RC — validé par nos équipes en 48h.",
    highlight: null as string | null,
  },
  {
    n: "02",
    icon: "✍️",
    label: "Signez le contrat-cadre",
    desc: "Signature électronique du contrat-cadre de sous-traitance : il encadre la collaboration (exclusivité territoriale, obligations réciproques).",
    highlight: null as string | null,
  },
  {
    n: "03",
    icon: "📍",
    label: "Déclarez vos zones",
    desc: "Indiquez votre périmètre d'intervention. C'est la base de toute affectation de leads.",
    highlight: null as string | null,
  },
  {
    n: "04",
    icon: "🏞️",
    label: "Référencez vos terrains",
    desc: "Collez le lien d'une annonce déjà en ligne : notre IA récupère et pré-remplit automatiquement localisation, prix, urbanisme et photos — il ne vous reste qu'à vérifier et publier.",
    highlight: "✨ Import IA en un clic",
  },
  {
    n: "05",
    icon: "📨",
    label: "Recevez des leads qualifiés",
    desc: "Chaque Lead correspond à un client qui recherche un terrain pour installer une maison ARKO. Nous vous passons le dossier. Vous accusez réception sous 48h.",
    highlight: null as string | null,
  },
  {
    n: "06",
    icon: "🏆",
    label: "Activez votre exclusivité",
    desc: "10 terrains publiés en 90 jours, 8 maintenus actifs : la zone devient la vôtre.",
    highlight: null as string | null,
  },
] as const;

const BENEFICES = [
  { value: "0 €", label: "Frais fixe", sub: "Aucun coût d'adhésion ni d'abonnement" },
  { value: "100 %", label: "Success fee", sub: "Rémunéré uniquement sur dossier finalisé" },
  { value: "48 h", label: "Réactivité garantie", sub: "Délai d'accusé de réception d'un Lead" },
  { value: "1 zone", label: "Exclusivité territoriale", sub: "Réservée aux mandataires actifs" },
] as const;

export default function MandataireLandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      {/* Header sticky */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7469F4]">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm sm:text-base">HOWNER</span>
          </Link>
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
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#7469F4]/10 px-4 py-1.5 text-sm font-medium text-[#7469F4]">
              🚀 Mandataires Partenaires HOWNER
            </div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Mandataire immobilier !
              <br className="hidden sm:block" />
              Déposez vos annonces de terrains susceptibles d&apos;accueillir nos maisons compactes Arko
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500 lg:mx-0">
              Accompagnez nos clients qui cherchent à habiter, investir ou agrandir autrement.{" "}
              <span className="font-medium text-gray-800">
                Enregistrez-vous sur notre plateforme, importez vos annonces grâce à notre IA, et obtenez de HOWNER
                l&apos;exclusivité territoriale pour mieux les servir.
              </span>
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
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
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-[#7469F4]/10">
              <Image
                src="/images/mandataires/arko-one-exterieur2.JPG"
                alt="Maison ARKO One installée sur son terrain"
                fill
                sizes="(min-width: 1024px) 480px, 90vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6">
                <p className="text-sm font-semibold text-white">L'ARKO One</p>
                <p className="mt-1 text-xs leading-relaxed text-white/85">
                  Il ne lui manque qu'un terrain. Trouvez-le, HOWNER s'occupe du reste.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunités + usages ARKO (regroupé pour alléger la page) */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
              Pourquoi HOWNER
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Chaque terrain mérite une maison ARKO
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Des modèles ARKO contemporains, conçus pour les nouveaux usages.
            </p>
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {USAGES.map((u) => (
              <span
                key={u.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-[#f4f4f0] px-3.5 py-1.5 text-xs font-medium text-gray-700"
              >
                <span>{u.icon}</span>
                {u.label}
              </span>
            ))}
          </div>
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
              une nouvelle façon de valoriser le foncier de terrains.
            </p>
          </div>
        </div>
      </section>

      {/* Comment ça marche — parcours + bénéfices */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
              Comment ça marche
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              De la création de compte à l&apos;exclusivité territoriale
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Un parcours simple, encadré par les CGU du Portail Mandataires,
              pour transformer votre activité en réseau de prospects qualifiés.
            </p>
          </div>

          {/* Stepper */}
          <div className="relative grid gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-6 hidden h-px bg-gray-200 lg:block"
            />
            {ETAPES.map((e) => (
              <div key={e.n} className="relative flex flex-col items-center text-center">
                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white text-lg shadow-sm",
                    e.highlight
                      ? "border-[#7469F4] ring-4 ring-[#7469F4]/15"
                      : "border-[#7469F4]/20",
                  )}
                >
                  {e.icon}
                </div>
                <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[#7469F4]/60">
                  Étape {e.n}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">{e.label}</h3>
                {e.highlight && (
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-[#7469F4]/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-[#7469F4]">
                    {e.highlight}
                  </span>
                )}
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{e.desc}</p>
              </div>
            ))}
          </div>

          {/* Bénéfices chiffrés */}
          <div className="mt-14 grid gap-4 sm:grid-cols-4">
            {BENEFICES.map((b) => (
              <div
                key={b.label}
                className="rounded-2xl border border-gray-100 bg-[#f4f4f0] p-5 text-center"
              >
                <p className="text-2xl font-bold text-[#7469F4]">{b.value}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{b.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{b.sub}</p>
              </div>
            ))}
          </div>

          {/* Progression vers l'exclusivité */}
          <div className="mt-8 rounded-2xl border border-[#7469F4]/15 bg-[#7469F4]/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800">
                Objectif exclusivité territoriale
              </p>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[#7469F4]">
                10 terrains publiés / 90 jours
              </p>
            </div>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white">
              <div className="h-full w-[80%] rounded-l-full bg-[#7469F4]" />
              <div className="h-full w-[20%] bg-[#7469F4]/25" />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Seuil de maintien après attribution : 8 terrains actifs en continu — les mandataires
              qui publient tôt sécurisent leur zone en premier.
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
        <Link href="/cgu-mandataire" className="hover:text-gray-600 transition-colors">
          CGU Mandataires
        </Link>
        <span className="mx-3">·</span>
        <Link href="/confidentialite" className="hover:text-gray-600 transition-colors">
          Politique de confidentialité
        </Link>
        <span className="mx-3">·</span>
        <Link href="/mentions-legales" className="hover:text-gray-600 transition-colors">
          Mentions légales
        </Link>
        <span className="mx-3">·</span>
        <span>© {new Date().getFullYear()} Affinity House Factory</span>
      </footer>
    </div>
  );
}
