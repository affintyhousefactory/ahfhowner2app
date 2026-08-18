"use client";

/**
 * GED Client — ADR-027, étendue par ADR-035 §5.
 *
 * Deux fils distincts sur le même dossier : ce que **nous** déposons pour le
 * client, et ce que **le client** dépose depuis son espace (ADR-034, à venir).
 * La colonne `origine` existe avant l'écran qui l'alimentera — c'est le sens de
 * préparer le CRM d'abord.
 *
 * L'avancement du dossier se lit par différence avec `PIECES_DOSSIER` : une
 * pièce attendue sans document est une absence, pas une ligne en base.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { cn } from "@/shared/lib/cn";
import { ORIGINES_DOC, PIECES_DOSSIER, pieceDossier, type OrigineDoc } from "@/lib/crm";

interface Document {
  id: string;
  nom: string;
  type_mime: string | null;
  taille_ko: number | null;
  created_at: string;
  url: string | null;
  origine: OrigineDoc | null;
  categorie: string | null;
}

function fileIcon(mime: string | null) {
  if (!mime) return "📄";
  if (mime === "application/pdf") return "📕";
  if (mime.startsWith("image/")) return "🖼";
  if (mime.includes("word")) return "📝";
  if (mime.includes("excel") || mime.includes("spreadsheet")) return "📊";
  return "📄";
}

export default function LeadClientDocuments({ leadId }: { leadId: string }) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorie, setCategorie] = useState("");
  const [origine, setOrigine] = useState<OrigineDoc>("ahf");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/client-documents`);
      if (res.ok) setDocs((await res.json()) as Document[]);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const fourni = useMemo(
    () => new Set(docs.map((d) => d.categorie).filter(Boolean) as string[]),
    [docs],
  );
  const manquantes = PIECES_DOSSIER.filter((p) => p.id !== "autre" && !fourni.has(p.id));
  const attendues = PIECES_DOSSIER.filter((p) => p.id !== "autre").length;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append("file", file);
    form.append("origine", origine);
    if (categorie) form.append("categorie", categorie);

    try {
      const res = await fetch(`/api/admin/leads/${leadId}/client-documents`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur upload");
      }
      setCategorie("");
      await fetchDocs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  /** Reclassement d'une pièce déjà déposée — optimiste, annulé si refusé. */
  async function reclasser(docId: string, valeur: string) {
    const avant = docs.find((d) => d.id === docId)?.categorie ?? null;
    setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, categorie: valeur || null } : d)));
    const res = await fetch(`/api/admin/leads/${leadId}/client-documents`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId, categorie: valeur || null }),
    });
    if (!res.ok) {
      setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, categorie: avant } : d)));
      setError("Reclassement refusé");
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Supprimer ce document ?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/client-documents`, {
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

  const champ =
    "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]";

  return (
    <div>
      {/* ── Avancement du dossier ──────────────────────────────────────── */}
      <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-wider text-white/30">Dossier</p>
          <p className="text-xs text-white/40">
            {attendues - manquantes.length} / {attendues} pièces
          </p>
        </div>
        {manquantes.length === 0 ? (
          <p className="mt-1.5 text-sm text-green-400">Dossier complet.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {manquantes.map((p) => (
              <span
                key={p.id}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px]",
                  p.attenduDe === "client"
                    ? "bg-[#e07b28]/15 text-[#e07b28]"
                    : "bg-white/5 text-white/40",
                )}
                title={p.attenduDe === "client" ? "À demander au client" : "À fournir par AHF"}
              >
                {p.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Dépôt ──────────────────────────────────────────────────────── */}
      <div className="mb-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3">
        <p className="mb-2 text-xs uppercase tracking-wider text-white/30">Ajouter un document</p>

        <div className="mb-2 grid grid-cols-2 gap-2">
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className={champ}>
            <option value="">Catégorie…</option>
            {PIECES_DOSSIER.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <select
            value={origine}
            onChange={(e) => setOrigine(e.target.value as OrigineDoc)}
            className={champ}
          >
            {ORIGINES_DOC.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="lead-client-doc-upload"
        />
        <label
          htmlFor="lead-client-doc-upload"
          className={cn(
            "block cursor-pointer rounded-xl border border-white/10 py-2.5 text-center text-sm transition-colors",
            uploading
              ? "pointer-events-none text-white/30"
              : "text-white/50 hover:border-[#7469F4]/50 hover:text-white",
          )}
        >
          {uploading ? "Upload en cours…" : "Choisir un fichier (PDF, image, Word, Excel)"}
        </label>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>

      {/* ── Liste, par origine ─────────────────────────────────────────── */}
      {loading ? (
        <p className="text-sm text-white/20">Chargement…</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-white/20">Aucun document — ajoutez un fichier ci-dessus.</p>
      ) : (
        <div className="space-y-4">
          {ORIGINES_DOC.map((o) => {
            const groupe = docs.filter((d) => (d.origine ?? "ahf") === o.id);
            if (groupe.length === 0) return null;
            return (
              <div key={o.id}>
                <p className="mb-1.5 text-[11px] uppercase tracking-wider text-white/30">
                  {o.label} · {groupe.length}
                </p>
                <ul className="space-y-2">
                  {groupe.map((doc) => (
                    <li
                      key={doc.id}
                      className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
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
                              {pieceDossier(doc.categorie) && ` · ${pieceDossier(doc.categorie)!.label}`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="shrink-0 rounded-lg px-2 py-1 text-xs text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Une pièce arrivée de l'espace client n'a pas de catégorie :
                          le fichier existe, seule son affectation manque. */}
                      <select
                        value={doc.categorie ?? ""}
                        onChange={(e) => reclasser(doc.id, e.target.value)}
                        aria-label={`Catégorie de ${doc.nom}`}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60 outline-none focus:border-[#7469F4] [color-scheme:dark]"
                      >
                        <option value="">Non classé</option>
                        {PIECES_DOSSIER.map((p) => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
