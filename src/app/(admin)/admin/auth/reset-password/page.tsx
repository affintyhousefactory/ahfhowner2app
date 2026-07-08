"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

export default function AdminResetPasswordPage() {
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

    setTimeout(() => router.push("/admin/auth/signin"), 2500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a18] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#252521] p-8">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-[#7469F4]/20 px-3 py-1 text-xs font-medium tracking-widest text-[#7469F4] uppercase">
            Admin
          </span>
          <h1 className="mt-4 text-xl font-semibold text-white">Réinitialiser le mot de passe</h1>
        </div>

        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm font-medium text-white">Mot de passe mis à jour</p>
            <p className="mt-2 text-xs text-white/40">
              Vous allez être redirigé vers la page de connexion…
            </p>
          </div>
        ) : !ready ? (
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
            <p className="text-sm text-white/50">Vérification du lien…</p>
            <p className="mt-4 text-xs text-white/30">
              Lien invalide ou expiré ? Demandez un nouveau lien depuis le tableau de bord Supabase.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-white/50">
              Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.
            </p>

            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
              minLength={8}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#7469F4]"
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#7469F4]"
            />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#7469F4] py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            >
              {loading ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
