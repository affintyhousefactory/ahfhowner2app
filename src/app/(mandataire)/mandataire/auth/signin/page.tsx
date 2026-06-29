"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = getSupabaseBrowser();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (role !== "mandataire") {
      await supabase.auth.signOut();
      setError("Accès réservé aux mandataires partenaires.");
      setLoading(false);
      return;
    }

    router.push("/mandataire");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4f0] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7469F4]">
            <span className="text-xl font-bold text-white">H</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Portail Mandataire</h1>
          <p className="mt-1 text-sm text-gray-500">Espace réservé aux mandataires partenaires AHF</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">Connexion</h2>

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
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7469F4] focus:outline-none focus:ring-2 focus:ring-[#7469F4]/20 transition-colors"
                placeholder="vous@exemple.fr"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7469F4] focus:outline-none focus:ring-2 focus:ring-[#7469F4]/20 transition-colors"
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
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
            Pas encore partenaire ?{" "}
            <Link
              href="/mandataire/auth/signup"
              className="font-medium text-[#7469F4] hover:text-[#5a54d4]"
            >
              Devenir mandataire →
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600">
            ← Retour au site HOWNER
          </Link>
        </p>
      </div>
    </div>
  );
}
