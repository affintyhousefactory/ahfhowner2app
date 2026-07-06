"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";
import { TerrainForm, type FicheTerrain } from "@/components/mandataire/TerrainForm";

export default function NouveauTerrainPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setToken(session.access_token);
      setLoading(false);
    });
  }, []);

  const handleSaved = (fiche: FicheTerrain) => {
    router.push(`/mandataire/terrains/${fiche.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/mandataire/terrains"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Mes Terrains
        </Link>
      </div>

      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
          Nouvelle fiche
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Nouvelle fiche terrain</h1>
      </div>

      <TerrainForm
        mandataireToken={token}
        onSaved={handleSaved}
      />
    </div>
  );
}
