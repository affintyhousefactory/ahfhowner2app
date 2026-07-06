"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Mandataire {
  id: string;
  prenom: string;
  nom: string;
  zone_activite: string[] | null;
  exclusif?: boolean;
}

interface AssignMandataireProps {
  leadId: string;
  currentMandataireId: string | null;
  mandataires: Mandataire[];
  leadCommune?: string | null;
}

export default function AssignMandataire({ leadId, currentMandataireId, mandataires, leadCommune }: AssignMandataireProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(currentMandataireId ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trier : zone matchant le lieu PLU de la parcelle en premier, puis mandataire exclusif en premier
  const zoneMatch = (m: Mandataire) =>
    !!leadCommune && !!m.zone_activite?.some(
      (z) => leadCommune.toLowerCase().includes(z.toLowerCase()) || z.toLowerCase().includes(leadCommune.toLowerCase())
    );

  const sorted = [...mandataires].sort((a, b) => {
    const aMatch = zoneMatch(a);
    const bMatch = zoneMatch(b);
    if (aMatch !== bMatch) return aMatch ? -1 : 1;

    const aExcl = !!a.exclusif;
    const bExcl = !!b.exclusif;
    if (aExcl !== bExcl) return aExcl ? -1 : 1;

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

  return (
    <div className="mt-4 space-y-3">
      <select
        value={selectedId}
        onChange={(e) => { setSelectedId(e.target.value); setDone(false); }}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4]"
      >
        <option value="">— Choisir un mandataire —</option>
        {sorted.map((m) => {
          const zones = m.zone_activite?.slice(0, 2).join(", ");
          const tags = [
            zoneMatch(m) ? "zone ✓" : null,
            m.exclusif ? "exclusif" : null,
          ].filter(Boolean).join(" · ");
          return (
            <option key={m.id} value={m.id}>
              {m.prenom} {m.nom}{zones ? ` · ${zones}` : ""}{tags ? ` — ${tags}` : ""}
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
    </div>
  );
}
