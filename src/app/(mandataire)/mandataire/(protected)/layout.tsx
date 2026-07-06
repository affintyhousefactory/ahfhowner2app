"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";
import { cn } from "@/shared/lib/cn";

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
    <div className="flex min-h-screen flex-col bg-[#f4f4f0]">
      <MandataireNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <MandataireFooter />
    </div>
  );
}

function MandataireFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
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
  );
}

const NAV_LINKS = [
  { href: "/mandataire/dashboard", label: "Dashboard" },
  { href: "/mandataire/dossiers",  label: "Dossiers"  },
  { href: "/mandataire/terrains",  label: "Mes Terrains" },
];

function MandataireNav() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/mandataire");
  };

  // Ferme le menu si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[#7469F4] flex items-center justify-center">
              <span className="text-xs font-bold text-white">H</span>
            </div>
            <span className="hidden font-semibold text-gray-900 sm:inline">Portail Mandataire</span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-[#7469F4]/10 font-medium text-[#7469F4]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Engrenage + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Paramètres du compte"
            aria-expanded={menuOpen}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
              menuOpen
                ? "border-[#7469F4]/40 bg-[#7469F4]/10 text-[#7469F4]"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            {/* Icône engrenage */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
              />
              <path
                d="M13.3 6.3l-.8-.5a5.2 5.2 0 0 0 0-1.6l.8-.5a.7.7 0 0 0 .2-.9l-.8-1.4a.7.7 0 0 0-.9-.2l-.8.5a5.1 5.1 0 0 0-1.4-.8V.7A.7.7 0 0 0 8.9 0H7.1a.7.7 0 0 0-.7.7v.9a5.1 5.1 0 0 0-1.4.8l-.8-.5a.7.7 0 0 0-.9.2L2.5 3.5a.7.7 0 0 0 .2.9l.8.5a5.2 5.2 0 0 0 0 1.6l-.8.5a.7.7 0 0 0-.2.9l.8 1.4a.7.7 0 0 0 .9.2l.8-.5c.4.3.9.6 1.4.8v.9c0 .4.3.7.7.7h1.8c.4 0 .7-.3.7-.7v-.9a5.1 5.1 0 0 0 1.4-.8l.8.5a.7.7 0 0 0 .9-.2l.8-1.4a.7.7 0 0 0-.2-.9Z"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
              <Link
                href="/mandataire/profil"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors",
                  pathname === "/mandataire/profil"
                    ? "font-medium text-[#7469F4]"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1.5 12.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Mon Profil
              </Link>
              <div className="mx-3 my-1 h-px bg-gray-100" />
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 7h7M9 4.5L11.5 7 9 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
