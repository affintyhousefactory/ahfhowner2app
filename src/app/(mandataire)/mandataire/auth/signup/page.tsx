"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContratCanvas, type ContratData } from "@/shared/components/mandataire/ContratCanvas";

type SignupStep = "landing" | "account" | "contrat" | "done";

const DIFFERENCIATEURS = [
  {
    icon: "🎯",
    titre: "Dossiers qualifiés entrants",
    desc: "Vos clients ont déjà choisi leur modèle ARKO et versé leur acompte. Zéro prospection.",
  },
  {
    icon: "€",
    titre: "0 € de frais fixes",
    desc: "Contrairement aux plateformes à abonnement, vous ne payez rien tant que vous ne réussissez pas.",
  },
  {
    icon: "📋",
    titre: "Critères techniques précis",
    desc: "Un cahier des charges ARKO clair (Annexe 1) : zonage, surface, réseaux, orientation.",
  },
  {
    icon: "🗺️",
    titre: "GPU API PLU intégrée",
    desc: "Vérifiez la constructibilité PLU de chaque parcelle directement depuis votre portail.",
  },
  {
    icon: "✍️",
    titre: "Contrat-cadre bilatéral",
    desc: "Relation sécurisée — pas une marketplace anonyme. Contrat de sous-traitance signé.",
  },
  {
    icon: "📊",
    titre: "Rapport compatibilité terrain",
    desc: "Générez le rapport Annexe 2 automatiquement. Valeur ajoutée pour votre client.",
  },
  {
    icon: "🏆",
    titre: "Success fee transparent",
    desc: "Essentiel 3 600 € · Étendu 5 500 € · Département 8 400 € HT. Grille fixée au contrat.",
  },
  {
    icon: "🎓",
    titre: "Formation produit ARKO",
    desc: "Module intégré pour maîtriser les spécificités techniques et juridiques de l'Arko.",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccountCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    // Pré-validation : on passe directement à l'étape contrat,
    // le compte sera créé côté serveur avec le contrat signé.
    setStep("contrat");
  };

  const handleContratComplete = async (contratData: ContratData) => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/mandataire/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, contrat: contratData }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        setError("__duplicate__");
      } else {
        setError(json.error ?? "Erreur lors de l'enregistrement. Veuillez contacter AHF.");
      }
      setLoading(false);
      return;
    }

    setStep("done");
    setLoading(false);
  };

  if (step === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f0] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Inscription envoyée !</h1>
          <p className="mt-3 text-gray-600">
            Votre dossier est en cours de validation par l'équipe AHF. Vous recevrez un email de
            confirmation sous 48h ouvrées.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            En cas de question : contact@affinityhousefactory.com
          </p>
          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.push("/mandataire/auth/signin")}
              className="w-full rounded-xl bg-[#7469F4] py-3 text-sm font-semibold text-white hover:bg-[#5a54d4] transition-colors"
            >
              Accéder à mon portail
            </button>
            <Link
              href="/"
              className="block w-full rounded-xl border border-gray-200 bg-white py-3 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              Retour au site HOWNER
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      {step === "landing" && (
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7469F4]">
              <span className="text-xl font-bold text-white">H</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
              Devenez Mandataire HOWNER
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Recevez des dossiers clients qualifiés. 0 € de frais fixes.
              100 % success fee.
            </p>
          </div>

          {/* Différenciateurs */}
          <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIFFERENCIATEURS.map((d) => (
              <div
                key={d.titre}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <span className="text-2xl">{d.icon}</span>
                <h3 className="mt-3 font-semibold text-gray-900">{d.titre}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{d.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mx-auto max-w-md text-center">
            <button
              onClick={() => setStep("account")}
              className="w-full rounded-2xl bg-[#7469F4] py-4 text-base font-semibold text-white hover:bg-[#5a54d4] transition-colors shadow-lg shadow-[#7469F4]/20"
            >
              Commencer mon inscription →
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Déjà mandataire ?{" "}
              <Link href="/mandataire/auth/signin" className="font-medium text-[#7469F4] hover:text-[#5a54d4]">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      )}

      {step === "account" && (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <button
                onClick={() => setStep("landing")}
                className="mb-4 text-sm text-gray-400 hover:text-gray-600"
              >
                ← Retour
              </button>
              <h2 className="text-2xl font-semibold text-gray-900">Créer votre compte</h2>
              <p className="mt-1 text-sm text-gray-500">
                Étape 1/2 — Identification · Ensuite vous signerez votre contrat.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <form onSubmit={handleAccountCreate} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#7469F4] focus:outline-none focus:ring-2 focus:ring-[#7469F4]/20 transition-colors"
                    placeholder="vous@exemple.fr"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#7469F4] focus:outline-none focus:ring-2 focus:ring-[#7469F4]/20 transition-colors"
                    placeholder="8 caractères minimum"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#7469F4] focus:outline-none focus:ring-2 focus:ring-[#7469F4]/20 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-[#7469F4] py-3 text-sm font-semibold text-white hover:bg-[#5a54d4] disabled:opacity-60 transition-colors"
                >
                  {loading ? "Création du compte…" : "Continuer vers le contrat →"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {step === "contrat" && (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <div className="mb-8">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
              Étape 2/2
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Signer votre contrat</h2>
            <p className="mt-1 text-sm text-gray-500">
              Complétez les informations et signez votre contrat-cadre de sous-traitance AHF.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <ContratCanvas
              onComplete={handleContratComplete}
              className={loading ? "pointer-events-none opacity-60" : ""}
            />
            {error === "__duplicate__" ? (
              <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                <p className="font-semibold">Email déjà associé à un compte.</p>
                <p className="mt-1">
                  Vous avez peut-être déjà créé un compte avec cet email.{" "}
                  <Link href="/mandataire/auth/signin" className="font-medium underline hover:text-orange-900">
                    Se connecter →
                  </Link>
                </p>
              </div>
            ) : error ? (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Questions ? contactez-nous à{" "}
            <a href="mailto:contact@affinityhousefactory.com" className="underline">
              contact@affinityhousefactory.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
