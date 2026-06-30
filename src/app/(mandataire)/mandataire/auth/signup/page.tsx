"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContratCanvas, type ContratData } from "@/shared/components/mandataire/ContratCanvas";

type SignupStep = "account" | "contrat" | "done";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>("account");
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
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/mandataire" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7469F4]">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">HOWNER</span>
          </Link>
          <Link
            href="/mandataire/auth/signin"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Déjà mandataire ? <span className="font-medium text-[#7469F4]">Se connecter</span>
          </Link>
        </div>
      </header>

      {step === "account" && (
        <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Progression */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Link
                  href="/mandataire"
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Retour
                </Link>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7469F4] text-xs font-bold text-white">
                  1
                </span>
                <span className="text-xs font-medium text-[#7469F4]">Identification</span>
                <span className="mx-1 text-gray-300">→</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-xs text-gray-400">
                  2
                </span>
                <span className="text-xs text-gray-400">Contrat</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Créer votre compte</h1>
              <p className="mt-1 text-sm text-gray-500">
                Étape 1/2 · Ensuite vous signerez votre contrat-cadre de sous-traitance.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <form onSubmit={handleAccountCreate} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email professionnel <span className="text-red-400">*</span>
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
                    Mot de passe <span className="text-red-400">*</span>
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
                    Confirmer le mot de passe <span className="text-red-400">*</span>
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
                  Continuer vers le contrat →
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              En créant un compte, vous acceptez les conditions générales de sous-traitance AHF.
            </p>
          </div>
        </div>
      )}

      {step === "contrat" && (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          {/* Progression */}
          <div className="mb-8">
            <button
              onClick={() => setStep("account")}
              className="mb-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Retour
            </button>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#7469F4]/30 bg-[#7469F4]/10 text-xs font-bold text-[#7469F4]">
                ✓
              </span>
              <span className="text-xs text-gray-400">Identification</span>
              <span className="mx-1 text-gray-300">→</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7469F4] text-xs font-bold text-white">
                2
              </span>
              <span className="text-xs font-medium text-[#7469F4]">Contrat</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Signer votre contrat</h1>
            <p className="mt-1 text-sm text-gray-500">
              Étape 2/2 · Complétez et signez votre contrat-cadre de sous-traitance AHF.
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
                  <Link
                    href="/mandataire/auth/signin"
                    className="font-medium underline hover:text-orange-900"
                  >
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
            Questions ?{" "}
            <a
              href="mailto:contact@affinityhousefactory.com"
              className="underline hover:text-gray-600"
            >
              contact@affinityhousefactory.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
