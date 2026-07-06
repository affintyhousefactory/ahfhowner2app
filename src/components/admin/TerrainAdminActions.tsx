"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

interface TerrainAdminActionsProps {
  ficheId: string;
  currentStatutAdmin: string;
  currentTitre: string | null;
  currentDescriptionPublique: string | null;
  currentAdminCommentaire: string | null;
}

export default function TerrainAdminActions({
  ficheId,
  currentStatutAdmin,
  currentTitre,
  currentDescriptionPublique,
  currentAdminCommentaire,
}: TerrainAdminActionsProps) {
  const router = useRouter();
  const [titre, setTitre] = useState(currentTitre ?? "");
  const [description_publique, setDescriptionPublique] = useState(currentDescriptionPublique ?? "");
  const [admin_commentaire, setAdminCommentaire] = useState(currentAdminCommentaire ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function getToken() {
    const { data: { session } } = await getSupabaseBrowser().auth.getSession();
    return session?.access_token ?? "";
  }

  async function handleAction(statut_admin: string) {
    if (statut_admin === "refuse" && !admin_commentaire.trim()) {
      setError("Un commentaire est requis pour refuser une fiche.");
      return;
    }
    if (statut_admin === "publie") {
      const ok = window.confirm("Publier ce terrain sur le site public ?");
      if (!ok) return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const token = await getToken();
    const res = await fetch(`/api/admin/terrains/${ficheId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        statut_admin,
        admin_commentaire: admin_commentaire || null,
        description_publique: description_publique || null,
        titre: titre || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de la mise à jour");
      return;
    }

    setSuccess(`Statut mis à jour : ${statut_admin}`);
    setTimeout(() => router.push("/admin/terrains"), 1200);
  }

  async function handleSaveFields() {
    setLoading(true);
    setError("");
    setSuccess("");

    const token = await getToken();
    const res = await fetch(`/api/admin/terrains/${ficheId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        admin_commentaire: admin_commentaire || null,
        description_publique: description_publique || null,
        titre: titre || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de la sauvegarde");
      return;
    }
    setSuccess("Champs sauvegardés.");
  }

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-white/50">
          Titre de l&apos;annonce publique
        </label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Ex : Terrain constructible — Saint-Émilion Nord"
          className="w-full rounded-lg border border-white/10 bg-[#1a1a18] px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#7469F4] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-white/50">
          Description publique (visible sur le site)
        </label>
        <textarea
          rows={4}
          value={description_publique}
          onChange={(e) => setDescriptionPublique(e.target.value)}
          placeholder="Description du terrain pour les visiteurs du site..."
          className="w-full rounded-lg border border-white/10 bg-[#1a1a18] px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#7469F4] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-white/50">
          Commentaire au mandataire (feedback interne)
        </label>
        <textarea
          rows={3}
          value={admin_commentaire}
          onChange={(e) => setAdminCommentaire(e.target.value)}
          placeholder="Feedback pour le mandataire (visible dans son portail)..."
          className="w-full rounded-lg border border-white/10 bg-[#1a1a18] px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#7469F4] focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
          {success}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={handleSaveFields}
          disabled={loading}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5 disabled:opacity-50 transition-colors"
        >
          Sauvegarder les champs
        </button>

        {currentStatutAdmin !== "valide" && currentStatutAdmin !== "publie" && (
          <button
            type="button"
            onClick={() => handleAction("valide")}
            disabled={loading}
            className="rounded-xl border border-[#7469F4]/40 px-4 py-2 text-sm text-[#7469F4] hover:bg-[#7469F4]/10 disabled:opacity-50 transition-colors"
          >
            Valider
          </button>
        )}

        <button
          type="button"
          onClick={() => handleAction("refuse")}
          disabled={loading}
          className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        >
          Refuser
        </button>

        {(currentStatutAdmin === "valide" || currentStatutAdmin === "en_attente") && (
          <button
            type="button"
            onClick={() => handleAction("publie")}
            disabled={loading}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Publier sur le site
          </button>
        )}
      </div>
    </div>
  );
}
