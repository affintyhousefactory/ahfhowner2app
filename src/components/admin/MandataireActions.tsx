"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Statut = "invite" | "en_attente" | "actif" | "suspendu";

interface MandataireActionsProps {
  mandataireId:       string;
  currentStatut:      Statut;
  activeDossiers?:    number; // proposé + accepté
  suspensionRaison?:  string | null;
}

export default function MandataireActions({
  mandataireId,
  currentStatut,
  activeDossiers = 0,
  suspensionRaison,
}: MandataireActionsProps) {
  const router = useRouter();
  const [loading, setLoading]       = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [raison, setRaison]         = useState("");
  const [suspending, setSuspending] = useState(false);

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

  async function confirmSuspendre() {
    if (!raison.trim()) return;
    setSuspending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/mandataires/${mandataireId}/suspendre`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raison: raison.trim() }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? "Erreur serveur");
      }
      setShowModal(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSuspending(false);
    }
  }

  if (currentStatut === "invite") {
    return (
      <p className="text-xs text-[#7469F4]/70">
        Invitation envoyée — en attente que le mandataire complète son profil.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex gap-3 flex-wrap">
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
              onClick={() => { setRaison(""); setError(null); setShowModal(true); }}
              disabled={!!loading}
              className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              Suspendre
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

        {currentStatut === "suspendu" && suspensionRaison && (
          <p className="text-xs text-red-400/70">
            Raison : {suspensionRaison}
          </p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Modal splash suspension */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#1e1e1c] p-6 shadow-2xl">
            {/* Icône warning */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <h3 className="mb-1 text-base font-semibold text-white">Suspendre ce mandataire</h3>

            {activeDossiers > 0 ? (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm">
                <p className="font-medium text-red-400">
                  ⚠ {activeDossiers} dossier{activeDossiers > 1 ? "s" : ""} actif{activeDossiers > 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-red-400/70 text-xs">
                  Ces dossiers seront suspendus et les leads associés remis en disponibilité
                  pour être réaffectés à un autre mandataire.
                </p>
              </div>
            ) : (
              <p className="mb-4 text-sm text-white/50">
                Aucun dossier actif. Cette action suspendra le compte du mandataire.
              </p>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                Raison de la suspension <span className="text-red-400">*</span>
              </label>
              <textarea
                value={raison}
                onChange={(e) => setRaison(e.target.value)}
                rows={3}
                placeholder="Ex: Inactivité prolongée, manquement aux obligations contractuelles…"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-400/50 resize-none"
              />
            </div>

            {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={suspending}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 hover:bg-white/5 transition-colors disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                onClick={confirmSuspendre}
                disabled={suspending || !raison.trim()}
                className="flex-1 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40"
              >
                {suspending ? "Suspension…" : "Confirmer la suspension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
