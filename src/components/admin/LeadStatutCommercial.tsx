"use client";

/**
 * Sélecteur de statut commercial de la fiche lead.
 *
 * Les huit statuts viennent de `src/lib/crm.ts` (ADR-035 §7) : ils étaient
 * déclarés ici, dans la liste et implicitement au dashboard, avec des libellés
 * et des couleurs déjà divergents.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUTS_COMMERCIAUX, statutCommercial, type StatutCommercialId } from "@/lib/crm";

interface Props {
  leadId: string;
  current: StatutCommercialId | null;
}

export default function LeadStatutCommercial({ leadId, current }: Props) {
  const router = useRouter();
  const [value, setValue] = useState<StatutCommercialId>(current ?? "nouveau");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const cur = statutCommercial(value);

  async function select(id: StatutCommercialId) {
    if (id === value) { setOpen(false); return; }
    setSaving(true);
    const prev = value;
    setValue(id);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut_commercial: id }),
      });
      if (!res.ok) { setValue(prev); }
      else router.refresh();
    } catch {
      setValue(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-opacity ${cur.badge} ${saving ? "opacity-50" : "hover:opacity-80"}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {cur.label}
        <svg className="ml-0.5 h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#1f1f1c] shadow-xl">
            {STATUTS_COMMERCIAUX.map((s) => (
              <button
                key={s.id}
                onClick={() => select(s.id)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5 ${s.id === value ? "text-white" : "text-white/50"}`}
              >
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                {s.label}
                {s.id === value && <span className="ml-auto text-[10px] text-[#7469F4]">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
