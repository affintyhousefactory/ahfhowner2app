"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RAYON_MAX_KM = 200;

interface Mandataire {
  id: string;
  prenom: string;
  nom: string;
  zone_activite: string[] | null;
  exclusif?: boolean;
  lat?: number | null;
  lon?: number | null;
  rayon_intervention?: string | null;
}

interface AssignMandataireProps {
  leadId: string;
  currentMandataireId: string | null;
  mandataires: Mandataire[];
  leadCommune?: string | null;
  leadLat?: number | null;
  leadLon?: number | null;
}

/* Distance à vol d'oiseau en km (formule de Haversine). */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AssignMandataire({
  leadId,
  currentMandataireId,
  mandataires,
  leadLat,
  leadLon,
}: AssignMandataireProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(currentMandataireId ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapDone, setRecapDone] = useState(false);
  const [recapError, setRecapError] = useState<string | null>(null);

  const hasLeadCoords = leadLat != null && leadLon != null;

  // Distance réelle (Haversine) depuis la commune du lead (plu_lat/plu_lon), si connue.
  const withDistance = mandataires.map((m) => ({
    ...m,
    distanceKm:
      hasLeadCoords && m.lat != null && m.lon != null
        ? haversineKm(leadLat!, leadLon!, m.lat, m.lon)
        : null,
  }));

  // Tant que le PLU n'est pas calculé, on ne peut pas filtrer par rayon : on affiche tout,
  // trié uniquement par exclusivité (comportement de repli).
  const candidates = hasLeadCoords
    ? withDistance.filter((m) => m.distanceKm != null && m.distanceKm <= RAYON_MAX_KM)
    : withDistance;

  const sorted = [...candidates].sort((a, b) => {
    const aExcl = !!a.exclusif;
    const bExcl = !!b.exclusif;
    if (aExcl !== bExcl) return aExcl ? -1 : 1;

    if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
    return 0;
  });

  async function handleAssign() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/affecter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mandataire_id: selectedId }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? "Erreur serveur");
      }
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRecap() {
    setRecapLoading(true);
    setRecapError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/affecter/recap`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? "Erreur serveur");
      }
      setRecapDone(true);
    } catch (e) {
      setRecapError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setRecapLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {!hasLeadCoords && (
        <p className="text-xs text-white/30">
          Calculez le PLU dans « Zone de recherche terrain » pour trier les mandataires par
          distance réelle (rayon {RAYON_MAX_KM} km). En attendant, tri par exclusivité
          uniquement.
        </p>
      )}
      {hasLeadCoords && sorted.length === 0 && (
        <p className="text-xs text-white/30">
          Aucun mandataire disponible dans un rayon de {RAYON_MAX_KM} km autour de cette commune.
        </p>
      )}

      <select
        value={selectedId}
        onChange={(e) => { setSelectedId(e.target.value); setDone(false); }}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4]"
      >
        <option value="">— Choisir un mandataire —</option>
        {sorted.map((m) => {
          const tags = [
            m.distanceKm != null ? `${Math.round(m.distanceKm)} km` : null,
            m.exclusif ? "exclusif" : null,
          ].filter(Boolean).join(" · ");
          return (
            <option key={m.id} value={m.id}>
              {m.prenom} {m.nom}{tags ? ` — ${tags}` : ""}
            </option>
          );
        })}
      </select>

      <button
        onClick={handleAssign}
        disabled={!selectedId || loading || selectedId === currentMandataireId}
        className="w-full rounded-xl bg-[#7469F4] py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
      >
        {loading ? "Affectation…" : done ? "✓ Affecté" : currentMandataireId ? "Réaffecter" : "Affecter"}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {currentMandataireId && (
        <>
          <button
            onClick={handleSendRecap}
            disabled={recapLoading}
            className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-white/70 transition-colors hover:border-[#7469F4]/50 hover:text-white disabled:opacity-40"
          >
            {recapLoading ? "Envoi…" : recapDone ? "✓ Récap envoyé" : "✉️ Envoyer récap au mandataire"}
          </button>
          {recapError && <p className="text-xs text-red-400">{recapError}</p>}
        </>
      )}
    </div>
  );
}
