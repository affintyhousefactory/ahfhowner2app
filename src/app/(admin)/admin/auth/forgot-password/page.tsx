"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

export default function AdminForgotPasswordPage() {
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
    const redirectTo = window.location.origin + "/admin/auth/reset-password";

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
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a18] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#252521] p-8">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-[#7469F4]/20 px-3 py-1 text-xs font-medium tracking-widest text-[#7469F4] uppercase">
            Admin
          </span>
          <h1 className="mt-4 text-xl font-semibold text-white">Mot de passe oublié</h1>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <span className="text-2xl">📧</span>
            </div>
            <p className="text-sm font-medium text-white">Email envoyé</p>
            <p className="mt-2 text-xs text-white/40">
              Si un compte est associé à <span className="text-white/70">{email}</span>, vous
              recevrez un lien de réinitialisation dans les prochaines minutes.
            </p>
            <p className="mt-3 text-xs text-white/30">Pensez à vérifier vos spams.</p>
            <Link
              href="/admin/auth/signin"
              className="mt-6 inline-block text-sm font-medium text-[#7469F4] hover:text-[#5a54d4] transition-colors"
            >
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-white/50">
              Entrez votre email administrateur. Nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#7469F4]"
              />

              <div className="w-full">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={SITE_KEY}
                  onSuccess={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                  options={{ theme: "dark", size: "flexible" }}
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="w-full rounded-xl bg-[#7469F4] py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
              >
                {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-white/40">
          <Link href="/admin/auth/signin" className="hover:text-white/70 transition-colors">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
