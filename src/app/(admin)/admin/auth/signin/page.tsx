"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

export default function AdminSignin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!captchaToken) {
      setError("Veuillez compléter la vérification de sécurité.");
      setLoading(false);
      return;
    }

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
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.session) {
      setError("Identifiants incorrects.");
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setLoading(false);
      return;
    }

    const role = data.session.user.app_metadata?.role;
    if (role !== "admin") {
      await supabase.auth.signOut();
      setError("Accès réservé aux administrateurs.");
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a18]">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#252521] p-8">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-[#7469F4]/20 px-3 py-1 text-xs font-medium tracking-widest text-[#7469F4] uppercase">
            Admin
          </span>
          <h1 className="mt-4 text-xl font-semibold text-white">Tableau de bord HOWNER</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#7469F4]"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#7469F4]"
          />

          <div className="w-full overflow-hidden rounded-lg">
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
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
