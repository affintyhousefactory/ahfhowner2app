"use client";

import { useEffect, useCallback } from "react";

export type TerrainPublic = {
  id: string;
  titre: string | null;
  commune: string;
  secteur: string | null;
  prix: number | null;
  surface: number | null;
  zonage: string | null;
  compatibilite_arko: string | null;
  modele_arko: string | null;
  photos: { url: string; nom: string }[] | null;
  description_publique: string | null;
  publie_at: string | null;
};

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

interface TerrainDetailModalProps {
  terrain: TerrainPublic;
  onClose: () => void;
}

export default function TerrainDetailModal({ terrain, onClose }: TerrainDetailModalProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const mainPhoto = terrain.photos?.[0];
  const compat = terrain.compatibilite_arko ? COMPAT_LABELS[terrain.compatibilite_arko] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-gray-600 hover:bg-black/20 transition-colors"
          aria-label="Fermer"
        >
          ×
        </button>

        {/* Photo */}
        {mainPhoto ? (
          <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainPhoto.url}
              alt={mainPhoto.nom}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-t-2xl bg-gray-100" />
        )}

        <div className="p-6">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap gap-2">
            {compat && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${compat.color}`}>
                {compat.label}
              </span>
            )}
            {terrain.modele_arko && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {MODELE_LABELS[terrain.modele_arko] ?? terrain.modele_arko}
              </span>
            )}
          </div>

          <h2 className="mb-1 text-xl font-semibold text-gray-900">
            {terrain.titre ?? terrain.commune}
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            {terrain.commune}{terrain.secteur ? ` — ${terrain.secteur}` : ""}
          </p>

          {/* Stats */}
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            {terrain.prix && (
              <span className="font-medium text-gray-900">
                {terrain.prix.toLocaleString("fr-FR")} €
              </span>
            )}
            {terrain.surface && (
              <span className="text-gray-600">{terrain.surface.toLocaleString("fr-FR")} m²</span>
            )}
            {terrain.zonage && (
              <span className="text-gray-500">Zone {terrain.zonage}</span>
            )}
          </div>

          {terrain.description_publique && (
            <p className="text-sm leading-relaxed text-gray-700">{terrain.description_publique}</p>
          )}

          {/* Photos gallery */}
          {(terrain.photos ?? []).length > 1 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {terrain.photos!.slice(1).map((photo) => (
                <div key={photo.url} className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.nom} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
