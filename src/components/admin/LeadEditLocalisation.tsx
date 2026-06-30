"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface LeadLocalisation {
  id: string;
  adresse_recherche: string | null;
  commune: string | null;
  code_postal: string | null;
  departement: string | null;
}

export default function LeadEditLocalisation({ lead }: { lead: LeadLocalisation }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    adresse_recherche: lead.adresse_recherche ?? "",
    commune: lead.commune ?? "",
    code_postal: lead.code_postal ?? "",
    departement: lead.departement ?? "",
  });

  const handleCancel = useCallback(() => {
    setForm({
      adresse_recherche: lead.adresse_recherche ?? "",
      commune: lead.commune ?? "",
      code_postal: lead.code_postal ?? "",
      departement: lead.departement ?? "",
    });
    setError(null);
    setEditing(false);
  }, [lead]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur serveur");
      }
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4]";
  const labelCls = "block text-xs text-white/40 mb-1";

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Zone de recherche terrain
        </h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-3 py-1 text-xs text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="rounded-lg px-3 py-1 text-xs text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[#7469F4] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <dl className="mt-3 space-y-2 text-sm">
          {([
            ["Adresse recherche", lead.adresse_recherche],
            ["Commune", lead.commune],
            ["Code postal", lead.code_postal],
            ["Département", lead.departement],
          ] as [string, string | null][]).map(([label, value]) =>
            value ? (
              <div key={label} className="flex justify-between">
                <dt className="text-white/40">{label}</dt>
                <dd className="text-white">{value}</dd>
              </div>
            ) : null,
          )}
        </dl>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <label className={labelCls}>Adresse de recherche</label>
            <input className={inputCls} value={form.adresse_recherche} onChange={set("adresse_recherche")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Commune</label>
              <input className={inputCls} value={form.commune} onChange={set("commune")} />
            </div>
            <div>
              <label className={labelCls}>Code postal</label>
              <input className={inputCls} value={form.code_postal} onChange={set("code_postal")} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Département</label>
            <input className={inputCls} value={form.departement} onChange={set("departement")} />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
