"use client";

import { useState, useRef, useEffect } from "react";
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
  source_url?: string | null;
  source_reference?: string | null;
  contact_nom?: string | null;
  contact_prenom?: string | null;
  contact_telephone?: string | null;
  contact_role?: "proprietaire" | "notaire" | "agence_partenaire" | "autre_mandataire" | "autre" | null;
  contact_role_detail?: string | null;
  created_at: string;
  updated_at: string;
};

interface TerrainFormProps {
  initialData?: Partial<FicheTerrain>;
  ficheId?: string;
  mandataireToken: string;
  onSaved: (fiche: FicheTerrain, warning?: string) => void;
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

const CONTACT_ROLE_OPTIONS = [
  { value: "proprietaire", label: "Propriétaire" },
  { value: "notaire", label: "Notaire" },
  { value: "agence_partenaire", label: "Agence partenaire" },
  { value: "autre_mandataire", label: "Mandataire indépendant" },
  { value: "autre", label: "Autre" },
] as const;

function isFilled(value: string | undefined): boolean {
  return !!value?.trim();
}

function analyzeStatusMessage(elapsed: number): string {
  if (elapsed < 4) return "Récupération de la page…";
  if (elapsed < 12) return "Lecture du contenu de l'annonce…";
  if (elapsed < 25) return "Analyse par l'intelligence artificielle…";
  return "Ça prend plus de temps que prévu (page volumineuse ou site lent) — merci de patienter…";
}

function excerpt(text: string, max = 70): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

/**
 * Card repliable : affiche un résumé compact quand tous ses champs ont été
 * remplis (via l'analyse d'annonce ou manuellement), sinon le contenu complet.
 * Défini hors du composant parent pour ne jamais remonter les inputs enfants.
 */
function CollapsibleCard({
  title,
  collapsed,
  onToggle,
  summary,
  children,
  alwaysVisible,
}: {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  summary: string;
  children: React.ReactNode;
  /** Contenu affiché quel que soit l'état (ex : champ jamais extrait, comme une référence interne). */
  alwaysVisible?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 text-xs font-medium text-[#7469F4] hover:underline"
          >
            Modifier
          </button>
        )}
      </div>
      {collapsed ? (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600">
          <span className="mt-0.5 shrink-0 text-green-600">✓</span>
          <span>{summary}</span>
        </p>
      ) : (
        <div className="mt-4">{children}</div>
      )}
      {alwaysVisible && <div className={collapsed ? "mt-3" : "mt-4"}>{alwaysVisible}</div>}
    </section>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="En savoir plus"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px] font-medium text-gray-500 hover:border-[#7469F4] hover:text-[#7469F4]"
      >
        i
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}

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
    contact_nom: initialData?.contact_nom ?? "",
    contact_prenom: initialData?.contact_prenom ?? "",
    contact_telephone: initialData?.contact_telephone ?? "",
    contact_role: initialData?.contact_role ?? "",
    contact_role_detail: initialData?.contact_role_detail ?? "",
  });

  const [photos, setPhotos] = useState<{ url: string; nom: string }[]>(
    initialData?.photos ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url ?? "");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [analyzeInfo, setAnalyzeInfo] = useState("");
  const [analyzeSuccess, setAnalyzeSuccess] = useState(true);
  const [analyzeElapsed, setAnalyzeElapsed] = useState(0);
  const [pendingImportImages, setPendingImportImages] = useState<string[]>([]);
  const [photoImportProgress, setPhotoImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const analyzeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => setAnalyzeElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [analyzing]);

  const toggleSection = (id: string) =>
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const requiresNotes = form.statut !== "disponible" || parseReserves(form.reserves).length > 0;
  const requiresContactRoleDetail = !!form.contact_role && form.contact_role !== "proprietaire";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (requiresNotes && !form.notes.trim()) {
      setError(
        "Notes obligatoires dès que le statut n'est pas \"Disponible\" ou qu'une réserve est renseignée."
      );
      return;
    }

    if (
      !form.contact_nom.trim() ||
      !form.contact_prenom.trim() ||
      !form.contact_telephone.trim() ||
      !form.contact_role
    ) {
      setError("Le point de contact pour ce bien (nom, prénom, téléphone, rôle) est obligatoire.");
      return;
    }

    if (requiresContactRoleDetail && !form.contact_role_detail.trim()) {
      setError("Merci de préciser l'agence/structure du point de contact.");
      return;
    }

    if (!form.compatibilite_arko) {
      setError("La compatibilité ARKO est obligatoire.");
      return;
    }

    if (!form.reseaux.trim() && !form.assainissement.trim()) {
      setError("Au moins un champ de Réseaux (réseaux ou assainissement) doit être renseigné.");
      return;
    }

    if (!form.acces_grue.trim() && !form.pente_pct.trim()) {
      setError("Au moins un champ d'Accès & Terrain (accès grue ou pente) doit être renseigné.");
      return;
    }

    if (!form.prix.trim() && !form.surface.trim()) {
      setError("Au moins un champ de Prix & Surface (prix ou surface) doit être renseigné.");
      return;
    }

    if (!form.zonage && !form.urbanisme_detail.trim()) {
      setError("Au moins un champ d'Urbanisme (zonage ou détail urbanisme) doit être renseigné.");
      return;
    }

    if (parseReserves(form.reserves).length === 0 && !form.notes.trim()) {
      setError("Au moins un champ de Disponibilité & Réserves (réserves ou notes internes) doit être renseigné.");
      return;
    }

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
      source_url: sourceUrl || null,
      contact_role: form.contact_role || null,
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

    if (!res.ok) {
      setSaving(false);
      setError(data.error ?? "Erreur lors de l'enregistrement");
      return;
    }

    const savedFiche = data as FicheTerrain;
    let importWarning: string | undefined;

    if (pendingImportImages.length > 0) {
      const total = pendingImportImages.length;
      setPhotoImportProgress({ done: 0, total });

      const importedPhotos: { url: string; nom: string }[] = [];
      let failedCount = 0;

      for (const imageUrl of pendingImportImages) {
        const r = await fetch(`/api/mandataire/terrains/${savedFiche.id}/photos/import-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${mandataireToken}`,
          },
          body: JSON.stringify({ imageUrl, sourceUrl }),
        });
        if (r.ok) {
          importedPhotos.push(await r.json());
        } else {
          failedCount++;
        }
        setPhotoImportProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      }

      setPendingImportImages([]);
      setPhotoImportProgress(null);
      if (importedPhotos.length > 0) {
        savedFiche.photos = [...(savedFiche.photos ?? []), ...importedPhotos];
        setPhotos(savedFiche.photos);
      }
      if (failedCount > 0) {
        importWarning =
          `${failedCount} photo(s) sur ${total} n'ont pas pu être importées automatiquement ` +
          "(image indisponible ou format non supporté par le site source). " +
          "Vous pouvez les ajouter manuellement depuis la section Photos ci-dessous.";
      }
    }

    setSaving(false);
    onSaved(savedFiche, importWarning);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeError("");
    setAnalyzeInfo("");
    setAnalyzeElapsed(0);

    const controller = new AbortController();
    analyzeAbortRef.current = controller;

    try {
      const res = await fetch("/api/mandataire/terrains/scrape-annonce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${mandataireToken}`,
        },
        body: JSON.stringify({ url: sourceUrl }),
        signal: controller.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        setAnalyzeError(data.error ?? "Erreur lors de l'analyse de la page");
        return;
      }

      const { fields, images, warnings } = data as {
        fields: Record<string, unknown>;
        images: string[];
        warnings: string[];
      };

      const fieldMap: Record<string, string> = {
        commune: "commune",
        secteur: "secteur",
        prix: "prix",
        surface: "surface",
        zonage: "zonage",
        urbanisme_detail: "urbanisme_detail",
        reseaux: "reseaux",
        assainissement: "assainissement",
        contact_nom: "contact_nom",
        contact_prenom: "contact_prenom",
        contact_telephone: "contact_telephone",
        contact_role: "contact_role",
      };

      // Calculé à partir de `form` (valeur courante au moment du clic) plutôt que via le
      // callback fonctionnel de setForm, dont l'exécution n'est pas garantie synchrone :
      // on a besoin du résultat immédiatement pour le message et le calcul des replis.
      let filledCount = 0;
      const stillEmpty: string[] = [];
      const next = { ...form };

      for (const [apiKey, formKey] of Object.entries(fieldMap)) {
        const value = fields[apiKey];
        const isEmpty = !(next as Record<string, string>)[formKey]?.toString().trim();
        if (value != null && isEmpty) {
          (next as Record<string, string>)[formKey] = String(value);
          filledCount++;
        } else if (isEmpty) {
          stillEmpty.push(formKey);
        }
      }
      if (fields.description_libre && !next.notes.trim()) {
        next.notes = String(fields.description_libre);
      }
      // La référence de l'annonce (littéraux "Réf :"/"Référence :" détectés par l'IA)
      // alimente la Référence interne du mandataire, jamais extraite autrement.
      if (fields.source_reference && !next.reference_interne.trim()) {
        next.reference_interne = String(fields.source_reference);
        filledCount++;
      } else if (!next.reference_interne.trim()) {
        stillEmpty.push("reference_interne");
      }

      setForm(next);

      const newCollapsed = new Set<string>();
      // Secteur est optionnel : ne doit pas empêcher le repli de Localisation.
      if (isFilled(next.commune)) newCollapsed.add("localisation");
      if (isFilled(next.prix) && isFilled(next.surface)) newCollapsed.add("prix_surface");
      if (isFilled(next.zonage) && isFilled(next.urbanisme_detail)) newCollapsed.add("urbanisme");
      if (isFilled(next.reseaux) && isFilled(next.assainissement)) newCollapsed.add("reseaux");
      setCollapsedSections(newCollapsed);

      setPendingImportImages(images ?? []);

      const success = filledCount > 0 || (images?.length ?? 0) > 0;
      setAnalyzeSuccess(success);

      const msgParts = [
        success
          ? `${filledCount} champ(s) pré-rempli(s) depuis l'annonce.`
          : "Aucune information exploitable n'a pu être extraite de cette page.",
      ];
      if (stillEmpty.length) msgParts.push(`À compléter manuellement : ${stillEmpty.join(", ")}.`);
      if (images?.length) msgParts.push(`${images.length} photo(s) détectée(s), seront importées après l'enregistrement.`);
      if (warnings?.length) msgParts.push(...warnings);
      setAnalyzeInfo(msgParts.join(" "));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setAnalyzeSuccess(false);
        setAnalyzeInfo("Analyse annulée.");
      } else {
        setAnalyzeError("Erreur réseau lors de l'analyse de la page.");
      }
    } finally {
      setAnalyzing(false);
      analyzeAbortRef.current = null;
    }
  };

  const handleCancelAnalyze = () => {
    analyzeAbortRef.current?.abort();
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

      {/* Import depuis une annonce existante */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-1.5">
          <h2 className="font-semibold text-gray-900">Importer depuis une annonce existante</h2>
          <InfoTooltip text="Collez le lien de votre annonce déjà publiée sur une autre plateforme (iad, SeLoger...) : les informations disponibles seront extraites automatiquement pour pré-remplir cette fiche, et les photos de l'annonce seront importées dans Howner après l'enregistrement." />
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://www.iadfrance.fr/annonce/..."
            disabled={analyzing}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
          />
          {!analyzing && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!sourceUrl.trim()}
              className="shrink-0 rounded-lg border border-dashed border-[#7469F4] px-4 py-2 text-sm font-medium text-[#7469F4] hover:bg-[#7469F4]/5 disabled:opacity-50"
            >
              Analyser la page
            </button>
          )}
        </div>

        {analyzing && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#7469F4]/20 bg-white px-3 py-2.5">
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-gray-700">
                {analyzeStatusMessage(analyzeElapsed)}
              </p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-full animate-pulse rounded-full bg-[#7469F4]/50" />
              </div>
            </div>
            <span className="shrink-0 font-mono text-xs text-gray-400">{analyzeElapsed}s</span>
            <button
              type="button"
              onClick={handleCancelAnalyze}
              className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Arrêter
            </button>
          </div>
        )}

        {analyzeError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {analyzeError}
          </div>
        )}
        {analyzeInfo && (
          <div
            className={`mt-3 rounded-lg border px-4 py-3 text-sm font-medium leading-relaxed ${
              analyzeSuccess
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {analyzeInfo}
          </div>
        )}
      </section>

      {/* Gèle tous les champs le temps que l'analyse d'annonce les remplisse, pour éviter
          les conflits d'édition entre l'utilisateur et le pré-remplissage automatique. */}
      <fieldset disabled={analyzing} className="space-y-6 border-0 p-0 m-0 min-w-0">

      {/* Localisation — commune/secteur extractibles (repliables) ; référence interne toujours visible sur la même ligne */}
      <CollapsibleCard
        title="Localisation"
        collapsed={collapsedSections.has("localisation")}
        onToggle={() => toggleSection("localisation")}
        summary={form.commune ? `${form.commune}${form.secteur ? " — " + form.secteur : ""}` : "Commune non renseignée"}
        alwaysVisible={
          <div className="sm:w-64">
            <label className="mb-1 block text-sm font-medium text-gray-700">Référence interne</label>
            <input
              type="text"
              value={form.reference_interne}
              onChange={(e) => set("reference_interne", e.target.value)}
              placeholder="Ex : T-2024-001"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            />
          </div>
        }
      >
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
        </div>
      </CollapsibleCard>

      {/* Champs extractibles depuis une annonce : regroupés en grille, repliés une fois complétés */}
      <div className="grid gap-6 sm:grid-cols-2">
        <CollapsibleCard
          title="Prix & Surface"
          collapsed={collapsedSections.has("prix_surface")}
          onToggle={() => toggleSection("prix_surface")}
          summary={`${form.prix ? `${form.prix} €` : "Prix non renseigné"} · ${form.surface ? `${form.surface} m²` : "Surface non renseignée"}`}
        >
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
        </CollapsibleCard>

        <CollapsibleCard
          title="Urbanisme"
          collapsed={collapsedSections.has("urbanisme")}
          onToggle={() => toggleSection("urbanisme")}
          summary={`${ZONAGE_OPTIONS.find((z) => z.value === form.zonage)?.label ?? "Zonage non renseigné"}${form.urbanisme_detail ? " — " + excerpt(form.urbanisme_detail) : ""}`}
        >
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
        </CollapsibleCard>

        <CollapsibleCard
          title="Réseaux"
          collapsed={collapsedSections.has("reseaux")}
          onToggle={() => toggleSection("reseaux")}
          summary={excerpt([form.reseaux, form.assainissement].filter(Boolean).join(" — ") || "Non renseigné", 100)}
        >
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
        </CollapsibleCard>

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
      </div>

      {/* Compatibilité ARKO + Photos : cards compactes regroupées côte à côte */}
      <div className="grid gap-6 sm:grid-cols-2">
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
            <p className="mb-2 text-sm font-medium text-gray-700">
              Compatibilité estimée <span className="text-red-500">*</span>
            </p>
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
      </div>

      {/* Point de contact pour ce bien — référent externe (propriétaire, notaire, agence partenaire...) */}
      <section className="rounded-xl border border-[#7469F4]/30 bg-[#7469F4]/5 p-5">
        <h2 className="mb-4 font-semibold text-gray-900">
          📞 Point de contact pour ce bien <span className="text-red-500">*</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.contact_nom}
              onChange={(e) => set("contact_nom", e.target.value)}
              placeholder="Ex : Dupont"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.contact_prenom}
              onChange={(e) => set("contact_prenom", e.target.value)}
              placeholder="Ex : Jean"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">
              Tél. <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={form.contact_telephone}
              onChange={(e) => set("contact_telephone", e.target.value)}
              placeholder="Ex : 06 12 34 56 78"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#7469F4] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">
              Rôle ou agence partenaire <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.contact_role}
              onChange={(e) => set("contact_role", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
            >
              <option value="">— Sélectionner —</option>
              {CONTACT_ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          {requiresContactRoleDetail && (
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {form.contact_role === "notaire" ? "Étude notariale" : "Nom de l'agence / structure"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.contact_role_detail}
                onChange={(e) => set("contact_role_detail", e.target.value)}
                placeholder="Ex : Agence Dupont Immobilier"
                className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none"
              />
            </div>
          )}
        </div>
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              🔒 Notes internes <span className="font-normal text-gray-400">— réservé Admin, jamais affiché sur le site public</span>
              {requiresNotes && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              rows={4}
              required={requiresNotes}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Description générale, atouts du terrain, contexte..."
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                requiresNotes && !form.notes.trim()
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-[#7469F4]"
              }`}
            />
            {requiresNotes && (
              <p className="mt-1 text-xs text-amber-600">
                Un statut différent de "Disponible" ou une réserve renseignée nécessite une note explicative pour AHF.
              </p>
            )}
          </div>
        </div>
      </section>

      </fieldset>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {photoImportProgress && (
        <div className="flex items-center gap-3 rounded-xl border border-[#7469F4]/20 bg-[#7469F4]/5 px-4 py-3">
          <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
          <p className="flex-1 text-sm font-medium text-gray-700">
            Import des photos de l&apos;annonce… ({photoImportProgress.done}/{photoImportProgress.total})
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || analyzing}
          className="rounded-xl bg-[#7469F4] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5a54d4] disabled:opacity-50 transition-colors"
        >
          {saving && photoImportProgress
            ? "Import des photos…"
            : saving
              ? "Enregistrement…"
              : isEdit
                ? "Mettre à jour"
                : "Créer la fiche"}
        </button>
      </div>
    </form>
  );
}
