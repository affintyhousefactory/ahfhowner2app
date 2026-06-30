"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Dossier = {
  id: string;
  statut: string;
  pack_label: string | null;
  pack_prix_ttc: number | null;
  remuneration_mandataire_ht: number | null;
  created_at: string;
  accepted_at: string | null;
  email_sent_at: string | null;
  leads: { id: string; prenom: string | null; nom: string | null; lead_number: number | null } | null;
};

const STATUT_DOSSIER: Record<string, { label: string; cls: string }> = {
  proposé:  { label: "Proposé",  cls: "bg-[#7469F4]/20 text-[#7469F4]" },
  accepté:  { label: "Accepté",  cls: "bg-blue-500/20 text-blue-400"   },
  en_cours: { label: "En cours", cls: "bg-[#e07b28]/20 text-[#e07b28]" },
  finalisé: { label: "Finalisé", cls: "bg-[#2d6b27]/30 text-green-400" },
  suspendu: { label: "Suspendu", cls: "bg-red-500/20 text-red-400"      },
};

export default function MandataireDossiers({ dossiers, mandataireId }: { dossiers: Dossier[]; mandataireId: string }) {
  const router  = useRouter();
  const [resending, setResending] = useState<string | null>(null);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  async function resendEmail(leadId: string, dossierId: string) {
    setResending(dossierId);
    setErrors((e) => ({ ...e, [dossierId]: "" }));
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/affecter/resend`, { method: "POST" });
      if (!res.ok) throw new Error("Erreur envoi");
      router.refresh();
    } catch {
      setErrors((e) => ({ ...e, [dossierId]: "Échec de l'envoi" }));
    } finally {
      setResending(null);
    }
  }

  if (dossiers.length === 0) {
    return <p className="text-sm text-white/20">Aucun dossier affecté</p>;
  }

  return (
    <div className="space-y-3">
      {dossiers.map((d) => {
        const badge  = STATUT_DOSSIER[d.statut] ?? { label: d.statut, cls: "bg-white/10 text-white/30" };
        const canResend = d.statut === "proposé";
        return (
          <div key={d.id} className="rounded-xl bg-white/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {d.leads?.lead_number && (
                    <span className="font-mono text-[10px] text-white/30">#{d.leads.lead_number}</span>
                  )}
                  <p className="text-sm text-white truncate">
                    {d.leads?.prenom} {d.leads?.nom}
                  </p>
                </div>
                <p className="text-xs text-white/30 mt-0.5">
                  Affecté le {new Date(d.created_at).toLocaleDateString("fr-FR")}
                  {d.accepted_at ? ` · Accepté le ${new Date(d.accepted_at).toLocaleDateString("fr-FR")}` : ""}
                </p>
                {d.pack_label && (
                  <p className="text-xs text-white/40">{d.pack_label}
                    {d.pack_prix_ttc ? ` · ${d.pack_prix_ttc.toLocaleString("fr-FR")} € TTC` : ""}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                  {badge.label}
                </span>
                {d.leads && (
                  <Link href={`/admin/leads/${d.leads.id}`}
                    className="text-[10px] text-white/30 hover:text-white">
                    Voir lead ↗
                  </Link>
                )}
              </div>
            </div>

            {canResend && d.leads && (
              <div className="mt-2 border-t border-white/5 pt-2">
                <button
                  onClick={() => resendEmail(d.leads!.id, d.id)}
                  disabled={resending === d.id}
                  className="text-xs text-[#7469F4]/70 hover:text-[#7469F4] disabled:opacity-40 transition-colors"
                >
                  {resending === d.id ? "Envoi…" : "↻ Renvoyer l'email d'affectation"}
                </button>
                {errors[d.id] && <p className="mt-1 text-[10px] text-red-400">{errors[d.id]}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
