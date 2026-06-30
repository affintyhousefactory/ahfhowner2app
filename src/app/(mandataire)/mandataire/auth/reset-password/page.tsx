"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase redirige ici avec un fragment #access_token=...&type=recovery
  // Le client Supabase le consomme automatiquement via onAuthStateChange
  useEffect(() => {
    const supabase = getSupabaseBrowser();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);

    const supabase = getSupabaseBrowser();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Erreur lors de la mise à jour. Le lien a peut-être expiré.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    setTimeout(() => router.push("/mandataire/auth/signin"), 2500);
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
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Mot de passe mis à jour</h2>
              <p className="mt-2 text-sm text-gray-500">
                Vous allez être redirigé vers la page de connexion…
              </p>
            </div>
          ) : !ready ? (
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
              <p className="text-sm text-gray-500">Vérification du lien…</p>
              <p className="mt-4 text-xs text-gray-400">
                Lien invalide ou expiré ?{" "}
                <Link
                  href="/mandataire/auth/forgot-password"
                  className="text-[#7469F4] hover:underline"
                >
                  Demander un nouveau lien
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Nouveau mot de passe
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choisissez un mot de passe sécurisé d'au moins 8 caractères.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    autoFocus
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#7469F4] focus:outline-none focus:ring-2 focus:ring-[#7469F4]/20 transition-colors"
                    placeholder="8 caractères minimum"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
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
                  className="w-full rounded-xl bg-[#7469F4] py-3 text-sm font-semibold text-white hover:bg-[#5a54d4] disabled:opacity-60 transition-colors"
                >
                  {loading ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
