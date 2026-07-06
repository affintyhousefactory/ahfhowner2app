"use client";

import { useState, useRef } from "react";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

export type FicheTerrain = {
  id: string;
  mandataire_id: string;
  reference_interne: string | null;
  commune: string;
  secteur: string | null;
  prix: number | null;
  surface: number | null;
  zonage: string | null;
  urbanisme_detail: string | null;
  acces_grue: string | null;
  pente_pct: number | null;
  reseaux: string | null;
  assainissement: string | null;
  compatibilite_arko: "precompatible" | "a_confirmer" | "non_compatible" | null;
  modele_arko: "one" | "max" | "both" | null;
  statut: "disponible" | "compromis" | "retire" | "vendu";
  statut_admin?: "en_attente" | "valide" | "refuse" | "publie";
  admin_commentaire?: string | null;
  date_derniere_verif: string | null;
  reserves: string[];
  notes: string | null;
  photos: { url: string; nom: string }[];
  created_at: string;
  updated_at: string;
};

interface TerrainFormProps {
  initialData?: Partial<FicheTerrain>;
  ficheId?: string;
  mandataireToken: string;
  onSaved: (fiche: FicheTerrain) => void;
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function parseReserves(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function formatReserves(arr: string[]): string {
  return (arr ?? []).join("\n");
}

const COMPATIBILITE_OPTIONS = [
  { value: "precompatible", label: "Précompatible", emoji: "✅", color: "text-green-700 bg-green-50 border-green-200" },
  { value: "a_confirmer", label: "À confirmer", emoji: "⚠️", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  { value: "non_compatible", label: "Non compatible", emoji: "❌", color: "text-red-700 bg-red-50 border-red-200" },
] as const;

const MODELE_OPTIONS = [
  { value: "one", label: "Arko One" },
  { value: "max", label: "Arko Max" },
  { value: "both", label: "Les deux" },
] as const;

const ZONAGE_OPTIONS = [
  { value: "U", label: "U — Urbain" },
  { value: "AU", label: "AU — À urbaniser" },
  { value: "A", label: "A — Agricole" },
  { value: "N", label: "N — Naturel" },
  { value: "autre", label: "Autre" },
] as const;

const STATUT_OPTIONS = [
  { value: "disponible", label: "Disponible" },
  { value: "compromis", label: "Compromis" },
  { value: "retire", label: "Retiré" },
  { value: "vendu", label: "Vendu" },
] as const;

export function TerrainForm({ initialData, ficheId, mandataireToken, onSaved }: TerrainFormProps) {
  const isEdit = !!ficheId;

  const [form, setForm] = useState({
    reference_interne: initialData?.reference_interne ?? "",
    commune: initialData?.commune ?? "",
    secteur: initialData?.secteur ?? "",
    prix: initialData?.prix?.toString() ?? "",
    surface: initialData?.surface?.toString() ?? "",
    zonage: initialData?.zonage ?? "",
    urbanisme_detail: initialData?.urbanisme_detail ?? "",
    acces_grue: initialData?.acces_grue ?? "",
    pente_pct: initialData?.pente_pct?.toString() ?? "",
    reseaux: initialData?.reseaux ?? "",
    assainissement: initialData?.assainissement ?? "",
    compatibilite_arko: initialData?.compatibilite_arko ?? "",
    modele_arko: initialData?.modele_arko ?? "",
    statut: initialData?.statut ?? "disponible",
    date_derniere_verif: initialData?.date_derniere_verif ?? todayISODate(),
    reserves: formatReserves(initialData?.reserves ?? []),
    notes: initialData?.notes ?? "",
  });

  const [photos, setPhotos] = useState<{ url: string; nom: string }[]>(
    initialData?.photos ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload: Record<string, unknown> = {
      ...form,
      prix: form.prix ? parseInt(form.prix, 10) : null,
      surface: form.surface ? parseInt(form.surface, 10) : null,
      pente_pct: form.pente_pct ? parseInt(form.pente_pct, 10) : null,
      reserves: parseReserves(form.reserves),
      photos,
      compatibilite_arko: form.compatibilite_arko || null,
      modele_arko: form.modele_arko || null,
      zonage: form.zonage || null,
    };

    // Re-soumettre si la fiche avait été refusée
    if (isEdit && initialData?.statut_admin === "refuse") {
      payload.statut_admin = "en_attente";
    }

    const url = isEdit
      ? `/api/mandataire/terrains/${ficheId}`
      : "/api/mandataire/terrains";

    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${mandataireToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de l'enregistrement");
      return;
    }

    onSaved(data as FicheTerrain);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!ficheId) {
      setError("Sauvegardez la fiche d'abord pour pouvoir ajouter des photos.");
      return;
    }
    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`/api/mandataire/terrains/${ficheId}/photos`, {
        method: "POST",
        headers: { authorization: `Bearer ${mandataireToken}` },
        body: fd,
      });

      if (res.ok) {
        const photo = await res.json();
        setPhotos((prev) => [...prev, photo]);
      } else {
        const err = await res.json();
        setError(err.error ?? "Erreur upload photo");
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDeletePhoto = async (url: string) => {
    if (!ficheId) {
      setPhotos((prev) => prev.filter((p) => p.url !== url));
      return;
    }

    const res = await fetch(`/api/mandataire/terrains/${ficheId}/photos`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${mandataireToken}`,
      },
      body: JSON.stringify({ url }),
    });

    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.url !== url));
    } else {
      const err = await res.json();
      setError(err.error ?? "Erreur suppression photo");
    }
  };

  // Bandeau statut admin
  const statutAdmin = initialData?.statut_admin;
  const adminBandeau = statutAdmin && (
    <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
      statutAdmin === "en_attente" ? "border-blue-200 bg-blue-50 text-blue-700" :
      statutAdmin === "valide"     ? "border-green-200 bg-green-50 text-green-700" :
      statutAdmin === "refuse"     ? "border-red-200 bg-red-50 text-red-700" :
      statutAdmin === "publie"     ? "border-green-300 bg-green-100 text-green-800" :
      "border-gray-200 bg-gray-50 text-gray-700"
    }`}>
      {statutAdmin === "en_attente" && (
        <p>Votre fiche est en cours de vérification par AHF.</p>
      )}
      {statutAdmin === "valide" && (
        <p>Fiche validée par AHF — en attente de publication.</p>
      )}
      {statutAdmin === "refuse" && (
        <>
          <p className="font-medium">Fiche refusée.{initialData.admin_commentaire ? ` Motif : ${initialData.admin_commentaire}` : ""}</p>
          <p className="mt-1 text-xs">Corrigez les informations et sauvegardez pour soumettre à nouveau.</p>
        </>
      )}
      {statutAdmin === "publie" && (
        <p>Fiche publiée sur le site.</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {adminBandeau}
      {/* Section 1 — Localisation */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Localisation</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Commune <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.commune}
              onChange={(e) => set("commune", e.target.value)}
              placeholder="Ex : Saint-Émilion"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Secteur</label>
            <input
              type="text"
              value={form.secteur}
              onChange={(e) => set("secteur", e.target.value)}
              placeholder="Ex : Nord-est"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Référence interne</label>
            <input
              type="text"
              value={form.reference_interne}
              onChange={(e) => set("reference_interne", e.target.value)}
              placeholder="Ex : T-2024-001"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section 2 — Prix & Surface */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Prix & Surface</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Prix (€)</label>
            <input
              type="number"
              min="0"
              value={form.prix}
              onChange={(e) => set("prix", e.target.value)}
              placeholder="Ex : 85000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Surface (m²)</label>
            <input
              type="number"
              min="0"
              value={form.surface}
              onChange={(e) => set("surface", e.target.value)}
              placeholder="Ex : 600"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section 3 — Urbanisme */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Urbanisme</h2>
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Zonage</label>
            <select
              value={form.zonage}
              onChange={(e) => set("zonage", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            >
              <option value="">— Sélectionner —</option>
              {ZONAGE_OPTIONS.map((z) => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Détail urbanisme</label>
            <textarea
              rows={3}
              value={form.urbanisme_detail}
              onChange={(e) => set("urbanisme_detail", e.target.value)}
              placeholder="Règles PLU, CES, hauteur max, reculs..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section 4 — Accès & Terrain */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Accès & Terrain</h2>
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Accès grue</label>
            <textarea
              rows={2}
              value={form.acces_grue}
              onChange={(e) => set("acces_grue", e.target.value)}
              placeholder="Largeur voie d'accès, portique, contraintes..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div className="sm:w-48">
            <label className="mb-1 block text-sm font-medium text-gray-700">Pente (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.pente_pct}
              onChange={(e) => set("pente_pct", e.target.value)}
              placeholder="Ex : 12"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section 5 — Réseaux */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Réseaux</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Réseaux (eau, électricité…)</label>
            <textarea
              rows={3}
              value={form.reseaux}
              onChange={(e) => set("reseaux", e.target.value)}
              placeholder="Eau potable en limite, EDF en façade..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Assainissement</label>
            <textarea
              rows={3}
              value={form.assainissement}
              onChange={(e) => set("assainissement", e.target.value)}
              placeholder="Tout-à-l'égout, fosse septique, étude à prévoir..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section 6 — Compatibilité ARKO */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Compatibilité ARKO</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Modèle ARKO envisagé</p>
            <div className="flex flex-wrap gap-3">
              {MODELE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="modele_arko"
                    value={opt.value}
                    checked={form.modele_arko === opt.value}
                    onChange={(e) => set("modele_arko", e.target.value)}
                    className="accent-[#7469F4]"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Compatibilité estimée</p>
            <div className="flex flex-wrap gap-3">
              {COMPATIBILITE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    form.compatibilite_arko === opt.value
                      ? opt.color
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="compatibilite_arko"
                    value={opt.value}
                    checked={form.compatibilite_arko === opt.value}
                    onChange={(e) => set("compatibilite_arko", e.target.value)}
                    className="sr-only"
                  />
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Photos */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Photos</h2>

        {!ficheId && (
          <p className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
            Sauvegardez d&apos;abord la fiche pour pouvoir ajouter des photos.
          </p>
        )}

        {photos.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.url} className="group relative aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.nom}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.url)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length === 0 && ficheId && (
          <p className="mb-3 text-sm text-gray-400">Aucune photo pour l&apos;instant.</p>
        )}

        {ficheId && (
          <div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.jpg,.png,.webp"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-dashed border-[#7469F4] px-4 py-2 text-sm font-medium text-[#7469F4] hover:bg-[#7469F4]/5 disabled:opacity-50 transition-colors"
            >
              {uploading ? "Envoi en cours…" : "+ Ajouter des photos"}
            </button>
          </div>
        )}
      </section>

      {/* Section 8 — Disponibilité & Réserves */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Disponibilité & Réserves</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
            <select
              value={form.statut}
              onChange={(e) => set("statut", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            >
              {STATUT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Dernière vérification</label>
            <input
              type="date"
              value={form.date_derniere_verif}
              onChange={(e) => set("date_derniere_verif", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Réserves <span className="text-gray-400 font-normal">(une par ligne)</span>
            </label>
            <textarea
              rows={3}
              value={form.reserves}
              onChange={(e) => set("reserves", e.target.value)}
              placeholder="Ex : Étude sol à réaliser&#10;Servitude de passage à vérifier"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Description générale, atouts du terrain, contexte..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#7469F4] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5a54d4] disabled:opacity-50 transition-colors"
        >
          {saving ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Créer la fiche"}
        </button>
      </div>
    </form>
  );
}
