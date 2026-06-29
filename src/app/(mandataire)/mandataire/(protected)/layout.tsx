"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/mandataire/auth/signin");
        return;
      }

      // Vérifier le rôle mandataire via metadata utilisateur
      const role = session.user.user_metadata?.role;
      if (role !== "mandataire") {
        router.replace("/mandataire/auth/signin");
        return;
      }

      setChecking(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/mandataire/auth/signin");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f0]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <MandataireNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function MandataireNav() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/mandataire/auth/signin");
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-[#7469F4] flex items-center justify-center">
            <span className="text-xs font-bold text-white">H</span>
          </div>
          <span className="font-semibold text-gray-900">HOWNER · Portail Mandataire</span>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
