"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";

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
  statut?: string;
  afficher_statut_mandataire?: boolean;
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

const STATUT_BADGES: Record<string, { label: string; color: string }> = {
  vendu:    { label: "Vendu",          color: "bg-red-100 text-red-700" },
  compromis: { label: "Sous compromis", color: "bg-orange-100 text-orange-700" },
  retire:   { label: "Retiré",         color: "bg-gray-100 text-gray-500" },
};

interface TerrainDetailModalProps {
  terrain: TerrainPublic;
  onClose: () => void;
}

export default function TerrainDetailModal({ terrain, onClose }: TerrainDetailModalProps) {
  const photos = terrain.photos ?? [];
  const [idx, setIdx] = useState(0);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && photos.length > 1) setIdx((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft"  && photos.length > 1) setIdx((i) => (i - 1 + photos.length) % photos.length);
    },
    [onClose, photos.length],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const compat = terrain.compatibilite_arko ? COMPAT_LABELS[terrain.compatibilite_arko] : null;
  const statutBadge = terrain.afficher_statut_mandataire && terrain.statut && terrain.statut !== "disponible"
    ? STATUT_BADGES[terrain.statut] ?? null
    : null;

  const currentPhoto = photos[idx] ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Diaporama ── */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-t-2xl bg-gray-100">
          {currentPhoto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={currentPhoto.url}
              src={currentPhoto.url}
              alt={currentPhoto.nom}
              className="h-full w-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
            aria-label="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Flèches navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setIdx((i) => (i - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
                aria-label="Photo précédente"
              >
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                  <path d="M8 2L2 8l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => setIdx((i) => (i + 1) % photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
                aria-label="Photo suivante"
              >
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                  <path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Indicateurs dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === idx ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>

              {/* Compteur */}
              <div className="absolute bottom-3 right-3 rounded-full bg-black/30 px-2 py-0.5 font-mono text-[11px] text-white backdrop-blur-sm">
                {idx + 1}/{photos.length}
              </div>
            </>
          )}
        </div>

        {/* ── Contenu scrollable ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Badges */}
            <div className="mb-3 flex flex-wrap gap-2">
              {statutBadge && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statutBadge.color}`}>
                  {statutBadge.label}
                </span>
              )}
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
                <span className="font-semibold text-gray-900">
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
          </div>

          {/* ── CTA footer ── */}
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
            <p className="mb-1 text-sm font-semibold text-gray-900">
              Ce terrain vous intéresse ?
            </p>
            <p className="mb-4 text-xs text-gray-500">
              Notre équipe vous recontacte sous 48h pour qualifier le projet et vous mettre en relation avec notre expert terrain.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/contact?sujet=terrain&ref=${encodeURIComponent(terrain.titre ?? terrain.commune)}`}
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7469F4] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5a54d4] transition-colors"
              >
                Je suis intéressé
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
