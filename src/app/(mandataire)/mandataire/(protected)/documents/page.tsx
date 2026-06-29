"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

type Document = {
  name: string;
  label: string;
  size: number | null;
  updatedAt: string;
  signedUrl: string | null;
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [mandataireId, setMandataireId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("mandataires")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile?.id) { setLoading(false); return; }
      setMandataireId(profile.id);

      const { data: files } = await supabase.storage
        .from("mandataires-documents")
        .list(profile.id, { sortBy: { column: "updated_at", order: "desc" } });

      if (!files?.length) { setLoading(false); return; }

      const enriched: Document[] = await Promise.all(
        files.map(async (f) => {
          const path = `${profile.id}/${f.name}`;
          const { data: urlData } = await supabase.storage
            .from("mandataires-documents")
            .createSignedUrl(path, 60 * 60); // 1h

          return {
            name: f.name,
            label: labelFromName(f.name),
            size: f.metadata?.size ?? null,
            updatedAt: f.updated_at ?? "",
            signedUrl: urlData?.signedUrl ?? null,
          };
        }),
      );

      setDocs(enriched);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
          Portail Mandataire
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Mes documents</h1>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-4xl">📄</p>
          <p className="mt-3 font-medium text-gray-700">Aucun document pour l'instant</p>
          <p className="mt-1 text-sm text-gray-400">
            Votre contrat signé apparaîtra ici une fois la signature complétée.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">Document</th>
                <th className="hidden px-5 py-3 text-left font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400 sm:table-cell">Date</th>
                <th className="hidden px-5 py-3 text-right font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400 sm:table-cell">Taille</th>
                <th className="px-5 py-3 text-right font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map((doc) => (
                <tr key={doc.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-900">{doc.label}</p>
                        <p className="text-xs text-gray-400">{doc.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-gray-500 sm:table-cell">
                    {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="hidden px-5 py-4 text-right text-gray-500 sm:table-cell">
                    {doc.size ? `${Math.round(doc.size / 1024)} Ko` : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {doc.signedUrl ? (
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#7469F4]/10 px-3 py-1.5 text-xs font-semibold text-[#7469F4] hover:bg-[#7469F4]/20 transition-colors"
                      >
                        Télécharger
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">Indisponible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mandataireId && docs.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          Les liens de téléchargement sont valables 1 heure. Rechargez la page pour les renouveler.
        </p>
      )}
    </div>
  );
}

function labelFromName(fileName: string): string {
  if (fileName.startsWith("contrat-")) return "Contrat-cadre de sous-traitance AHF";
  return fileName.replace(/-/g, " ").replace(/\.pdf$/i, "");
}
