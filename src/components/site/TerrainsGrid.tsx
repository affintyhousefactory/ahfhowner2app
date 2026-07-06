"use client";

import { useState } from "react";
import TerrainDetailModal, { type TerrainPublic } from "./TerrainDetailModal";

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

export default function TerrainsGrid({ terrains }: { terrains: TerrainPublic[] }) {
  const [selected, setSelected] = useState<TerrainPublic | null>(null);

  if (terrains.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-gray-500">Aucun terrain disponible pour le moment. Revenez prochainement.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {terrains.map((terrain) => {
          const mainPhoto = terrain.photos?.[0];
          const compat = terrain.compatibilite_arko ? COMPAT_LABELS[terrain.compatibilite_arko] : null;
          const desc = terrain.description_publique;
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
