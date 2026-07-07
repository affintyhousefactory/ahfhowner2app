"use client";

import { useMemo, useState } from "react";
import TerrainDetailModal, { numeroAnnonce, type TerrainPublic } from "./TerrainDetailModal";

const COMPAT_LABELS: Record<string, { label: string; color: string }> = {
  precompatible:  { label: "Précompatible",  color: "bg-green-100 text-green-700" },
  a_confirmer:    { label: "À confirmer",    color: "bg-amber-100 text-amber-700" },
  non_compatible: { label: "Non compatible", color: "bg-red-100 text-red-700" },
};

const MODELE_LABELS: Record<string, string> = {
  one:  "Arko One",
  max:  "Arko Max",
  both: "One + Max",
};

const STATUT_BADGES: Record<string, { label: string; color: string }> = {
  vendu:     { label: "Vendu",          color: "bg-red-100 text-red-700" },
  compromis: { label: "Sous compromis", color: "bg-orange-100 text-orange-700" },
  retire:    { label: "Retiré",         color: "bg-gray-100 text-gray-500" },
};

const STATUT_FILTER_OPTIONS = [
  { value: "",           label: "Tous les statuts" },
  { value: "disponible", label: "Disponible" },
  { value: "compromis",  label: "Sous compromis" },
  { value: "vendu",      label: "Vendu" },
  { value: "retire",     label: "Retiré" },
] as const;

function effectiveStatut(t: TerrainPublic): string {
  return t.afficher_statut_mandataire && t.statut && t.statut !== "disponible"
    ? t.statut
    : "disponible";
}

export default function TerrainsGrid({ terrains }: { terrains: TerrainPublic[] }) {
  const [selected, setSelected] = useState<TerrainPublic | null>(null);
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreCommune, setFiltreCommune] = useState("");
  const [filtrePrixMin, setFiltrePrixMin] = useState("");
  const [filtrePrixMax, setFiltrePrixMax] = useState("");
  const [tri, setTri] = useState<"recent" | "ancien">("recent");

  const communes = useMemo(
    () => Array.from(new Set(terrains.map((t) => t.commune))).sort((a, b) => a.localeCompare(b)),
    [terrains],
  );

  const filtered = useMemo(() => {
    const prixMin = filtrePrixMin ? Number(filtrePrixMin) : null;
    const prixMax = filtrePrixMax ? Number(filtrePrixMax) : null;

    const list = terrains.filter((t) => {
      if (filtreStatut && effectiveStatut(t) !== filtreStatut) return false;
      if (filtreCommune && t.commune !== filtreCommune) return false;
      if (prixMin !== null && (t.prix ?? 0) < prixMin) return false;
      if (prixMax !== null && (t.prix ?? Infinity) > prixMax) return false;
      return true;
    });

    return list.sort((a, b) => {
      const da = a.publie_at ? new Date(a.publie_at).getTime() : 0;
      const db = b.publie_at ? new Date(b.publie_at).getTime() : 0;
      return tri === "recent" ? db - da : da - db;
    });
  }, [terrains, filtreStatut, filtreCommune, filtrePrixMin, filtrePrixMax, tri]);

  const resetFiltres = () => {
    setFiltreStatut("");
    setFiltreCommune("");
    setFiltrePrixMin("");
    setFiltrePrixMax("");
    setTri("recent");
  };

  const filtresActifs = !!(filtreStatut || filtreCommune || filtrePrixMin || filtrePrixMax || tri !== "recent");

  if (terrains.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-gray-500">Aucun terrain disponible pour le moment. Revenez prochainement.</p>
      </div>
    );
  }

  return (
    <>
      {/* Filtres */}
      <div className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Statut</label>
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
          >
            {STATUT_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Commune</label>
          <select
            value={filtreCommune}
            onChange={(e) => setFiltreCommune(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
          >
            <option value="">Toutes les communes</option>
            {communes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Prix min (€)</label>
          <input
            type="number"
            min="0"
            value={filtrePrixMin}
            onChange={(e) => setFiltrePrixMin(e.target.value)}
            placeholder="0"
            className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Prix max (€)</label>
          <input
            type="number"
            min="0"
            value={filtrePrixMax}
            onChange={(e) => setFiltrePrixMax(e.target.value)}
            placeholder="Illimité"
            className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Date de publication</label>
          <select
            value={tri}
            onChange={(e) => setTri(e.target.value as "recent" | "ancien")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
          >
            <option value="recent">Plus récents</option>
            <option value="ancien">Plus anciens</option>
          </select>
        </div>

        {filtresActifs && (
          <button
            type="button"
            onClick={resetFiltres}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
          >
            Réinitialiser
          </button>
        )}

        <p className="ml-auto text-sm text-gray-400">
          {filtered.length} terrain{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg text-gray-500">Aucun terrain ne correspond à ces critères.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((terrain) => {
          const mainPhoto = terrain.photos?.[0];
          const compat = terrain.compatibilite_arko ? COMPAT_LABELS[terrain.compatibilite_arko] : null;
          const desc = terrain.description_publique;
          const statutBadge = terrain.afficher_statut_mandataire && terrain.statut && terrain.statut !== "disponible"
            ? STATUT_BADGES[terrain.statut] ?? null
            : null;
          const truncated = desc && desc.length > 120 ? `${desc.slice(0, 120)}…` : desc;

          return (
            <article
              key={terrain.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Photo */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {mainPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainPhoto.url}
                    alt={mainPhoto.nom}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
                {/* Badges overlay */}
                <div className="absolute left-3 top-3 flex gap-1.5 flex-wrap">
                  {statutBadge && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${statutBadge.color}`}>
                      {statutBadge.label}
                    </span>
                  )}
                  {compat && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm ${compat.color}`}>
                      {compat.label}
                    </span>
                  )}
                  {terrain.modele_arko && (
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-gray-600 backdrop-blur-sm">
                      {MODELE_LABELS[terrain.modele_arko] ?? terrain.modele_arko}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gray-400">
                  Annonce n° {numeroAnnonce(terrain.id)}
                </p>
                <h3 className="mb-1 font-semibold text-gray-900 leading-snug">
                  {terrain.titre ?? terrain.commune}
                </h3>
                <p className="mb-3 text-sm text-gray-500">
                  {terrain.commune}{terrain.secteur ? ` — ${terrain.secteur}` : ""}
                </p>

                {/* Stats */}
                <div className="mb-3 flex flex-wrap gap-3 text-sm">
                  {terrain.prix && (
                    <span className="font-semibold text-gray-900">
                      {terrain.prix.toLocaleString("fr-FR")} €
                    </span>
                  )}
                  {terrain.surface && (
                    <span className="text-gray-500">{terrain.surface.toLocaleString("fr-FR")} m²</span>
                  )}
                  {terrain.zonage && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      Zone {terrain.zonage}
                    </span>
                  )}
                </div>

                {truncated && (
                  <p className="mb-4 text-sm leading-relaxed text-gray-600 flex-1">{truncated}</p>
                )}

                <button
                  onClick={() => setSelected(terrain)}
                  className="mt-auto rounded-xl border border-[#7469F4]/30 px-4 py-2 text-sm font-medium text-[#7469F4] transition-colors hover:bg-[#7469F4]/5"
                >
                  En savoir plus
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <TerrainDetailModal terrain={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
