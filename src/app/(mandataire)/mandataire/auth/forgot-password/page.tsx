"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Veuillez compléter la vérification de sécurité.");
      return;
    }

    setLoading(true);

    const verif = await fetch("/api/verify-turnstile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: captchaToken }),
    });
    if (!verif.ok) {
      setError("Vérification de sécurité échouée. Réessayez.");
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowser();
    const redirectTo = window.location.origin + "/mandataire/auth/reset-password";

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError("Une erreur est survenue. Vérifiez l'adresse email et réessayez.");
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4f0] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/mandataire" className="inline-flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7469F4]">
              <span className="text-xl font-bold text-white">H</span>
            </div>
            <span className="font-semibold text-gray-900">Portail Mandataire</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Email envoyé</h2>
              <p className="mt-2 text-sm text-gray-500">
                Si un compte est associé à{" "}
                <span className="font-medium text-gray-700">{email}</span>, vous recevrez
                un lien de réinitialisation dans les prochaines minutes.
              </p>
              <p className="mt-3 text-xs text-gray-400">
                Pensez à vérifier vos spams.
              </p>
              <Link
                href="/mandataire/auth/signin"
                className="mt-6 inline-block text-sm font-medium text-[#7469F4] hover:text-[#5a54d4] transition-colors"
              >
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Mot de passe oublié</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Entrez votre email professionnel. Nous vous enverrons un lien pour
                  réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#7469F4] focus:outline-none focus:ring-2 focus:ring-[#7469F4]/20 transition-colors"
                    placeholder="vous@exemple.fr"
                  />
                </div>

                <div className="w-full overflow-hidden rounded-lg">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={SITE_KEY}
                    onSuccess={setCaptchaToken}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ theme: "light", size: "flexible" }}
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !captchaToken}
                  className="w-full rounded-xl bg-[#7469F4] py-3 text-sm font-semibold text-white hover:bg-[#5a54d4] disabled:opacity-60 transition-colors"
                >
                  {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link
            href="/mandataire/auth/signin"
            className="hover:text-gray-700 transition-colors"
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
