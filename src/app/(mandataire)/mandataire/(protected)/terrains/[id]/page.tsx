"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";
import { TerrainForm, type FicheTerrain } from "@/components/mandataire/TerrainForm";

export default function TerrainDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ficheId = params.id as string;

  const [token, setToken] = useState("");
  const [fiche, setFiche] = useState<FicheTerrain | null>(null);
  const [loading, setLoading] = useState(true);
  const [retiring, setRetiring] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setToken(session.access_token);

      const res = await fetch("/api/mandataire/terrains", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const all: FicheTerrain[] = await res.json();
        const found = all.find((f) => f.id === ficheId);
        setFiche(found ?? null);
      }
      setLoading(false);
    };
    load();
  }, [ficheId]);

  const handleRetire = async () => {
    if (!confirm("Retirer cette fiche ? Elle ne sera plus visible mais conservée.")) return;
    setRetiring(true);
    setError("");

    const res = await fetch(`/api/mandataire/terrains/${ficheId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      router.push("/mandataire/terrains");
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur lors du retrait");
      setRetiring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
      </div>
    );
  }

  if (!fiche) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Fiche introuvable.</p>
        <Link href="/mandataire/terrains" className="mt-4 inline-block text-sm text-[#7469F4] hover:underline">
          ← Retour à Mes Terrains
        </Link>
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

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
            Fiche terrain
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">{fiche.commune}</h1>
          {fiche.reference_interne && (
            <p className="text-sm text-gray-400">{fiche.reference_interne}</p>
          )}
        </div>
        {fiche.statut !== "retire" && (
          <button
            type="button"
            onClick={handleRetire}
            disabled={retiring}
            className="flex-shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {retiring ? "Retrait…" : "Retirer cette fiche"}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <TerrainForm
        initialData={fiche}
        ficheId={ficheId}
        mandataireToken={token}
        onSaved={(updated) => setFiche(updated)}
      />
    </div>
  );
}
