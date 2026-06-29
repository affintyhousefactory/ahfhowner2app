"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";
import { cn } from "@/shared/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "⬛" },
  { href: "/admin/leads", label: "Leads", icon: "👤" },
  { href: "/admin/mandataires", label: "Mandataires", icon: "🏠" },
  { href: "/admin/affectations", label: "Affectations", icon: "🔗" },
];

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/admin/auth/signin"); return; }
      const role = session.user.app_metadata?.role;
      if (role !== "admin") { router.replace("/admin/auth/signin"); return; }
      setUserEmail(session.user.email ?? "");
      setChecking(false);
    };

    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/admin/auth/signin");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  async function handleSignOut() {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/admin/auth/signin");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a18]">
        <span className="text-sm text-white/40">Vérification…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#1a1a18]">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-white/10 bg-[#1a1a18]">
        <div className="flex h-14 items-center border-b border-white/10 px-5">
          <span className="text-sm font-semibold tracking-tight text-white">HOWNER</span>
          <span className="ml-2 rounded bg-[#7469F4]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#7469F4] uppercase">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map(({ href, label }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[#7469F4]/15 text-[#7469F4]"
                    : "text-white/50 hover:bg-white/5 hover:text-white",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <p className="truncate px-3 py-1 text-[11px] text-white/30">{userEmail}</p>
          <button
            onClick={handleSignOut}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
