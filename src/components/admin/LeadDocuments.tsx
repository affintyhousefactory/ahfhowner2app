"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Document {
  id: string;
  nom: string;
  type_mime: string | null;
  taille_ko: number | null;
  created_at: string;
  url: string | null;
  mandataires?: { prenom: string; nom: string } | null;
}

interface LeadDocumentsProps {
  leadId: string;
  currentMandataireId: string | null;
}

function fileIcon(mime: string | null) {
  if (!mime) return "📄";
  if (mime === "application/pdf") return "📕";
  if (mime.startsWith("image/")) return "🖼";
  if (mime.includes("word")) return "📝";
  if (mime.includes("excel") || mime.includes("spreadsheet")) return "📊";
  return "📄";
}

export default function LeadDocuments({ leadId, currentMandataireId }: LeadDocumentsProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/documents`);
      if (res.ok) setDocs((await res.json()) as Document[]);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append("file", file);
    if (currentMandataireId) form.append("mandataire_id", currentMandataireId);

    try {
      const res = await fetch(`/api/admin/leads/${leadId}/documents`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur upload");
      }
      await fetchDocs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Supprimer ce document ?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur suppression");
      }
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <div>
      {/* Upload */}
      <div className="mb-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3">
        <p className="mb-2 text-xs text-white/30 uppercase tracking-wider">Ajouter un document</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="lead-doc-upload"
            />
            <label
              htmlFor="lead-doc-upload"
              className={`flex-1 cursor-pointer rounded-xl border border-white/10 py-2.5 text-center text-sm transition-colors ${
                uploading
                  ? "text-white/30 pointer-events-none"
                  : "text-white/50 hover:border-[#7469F4]/50 hover:text-white"
              }`}
            >
              {uploading ? "Upload en cours…" : "Choisir un fichier (PDF, image, Word, Excel)"}
            </label>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>

      {/* Liste documents */}
      {loading ? (
        <p className="text-sm text-white/20">Chargement…</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-white/20">Aucun document — ajoutez un fichier ci-dessus.</p>
      ) : (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base leading-none">{fileIcon(doc.type_mime)}</span>
                <div className="min-w-0">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm text-[#7469F4] hover:underline"
                    >
                      {doc.nom}
                    </a>
                  ) : (
                    <p className="truncate text-sm text-white">{doc.nom}</p>
                  )}
                  <p className="text-[11px] text-white/30">
                    {doc.taille_ko ? `${doc.taille_ko} Ko · ` : ""}
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                    {doc.mandataires
                      ? ` · ${doc.mandataires.prenom} ${doc.mandataires.nom}`
                      : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="ml-2 shrink-0 rounded-lg px-2 py-1 text-xs text-white/20 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Supprimer"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
