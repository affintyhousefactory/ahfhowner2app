"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Statut = "en_attente" | "actif" | "suspendu";

interface MandataireActionsProps {
  mandataireId: string;
  currentStatut: Statut;
}

export default function MandataireActions({ mandataireId, currentStatut }: MandataireActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeStatut(statut: Statut) {
    setLoading(statut);
    setError(null);
    try {
      const res = await fetch(`/api/admin/mandataires/${mandataireId}/statut`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? "Erreur serveur");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        {currentStatut === "en_attente" && (
          <button
            onClick={() => changeStatut("actif")}
            disabled={!!loading}
            className="rounded-xl bg-[#2d6b27]/30 px-4 py-2 text-sm text-green-400 hover:bg-[#2d6b27]/50 transition-colors disabled:opacity-50"
          >
            {loading === "actif" ? "…" : "✓ Valider"}
          </button>
        )}
        {currentStatut === "actif" && (
          <button
            onClick={() => changeStatut("en_attente")}
            disabled={!!loading}
            className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white/40 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {loading === "en_attente" ? "…" : "Remettre en attente"}
          </button>
        )}
        {currentStatut !== "suspendu" && (
          <button
            onClick={() => changeStatut("suspendu")}
            disabled={!!loading}
            className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {loading === "suspendu" ? "…" : "Suspendre"}
          </button>
        )}
        {currentStatut === "suspendu" && (
          <button
            onClick={() => changeStatut("en_attente")}
            disabled={!!loading}
            className="rounded-xl bg-[#e07b28]/20 px-4 py-2 text-sm text-[#e07b28] hover:bg-[#e07b28]/30 transition-colors disabled:opacity-50"
          >
            {loading === "en_attente" ? "…" : "Réactiver"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
