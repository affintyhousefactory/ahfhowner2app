"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminPluAnalyser, { type ParcelleData } from "@/components/admin/AdminPluAnalyser";

interface LeadLocalisation {
  id: string;
  adresse_recherche: string | null;
  commune: string | null;
  code_postal: string | null;
  departement: string | null;
}

interface PluPatch {
  plu_adresse?: string | null;
  plu_zone?: string | null;
  plu_libelong?: string | null;
  plu_typezone?: string | null;
  plu_typedoc?: string | null;
  plu_etat_doc?: string | null;
  plu_datappro?: string | null;
  plu_prescriptions?: string[] | null;
  plu_servitudes?: string[] | null;
  plu_lon?: number | null;
  plu_lat?: number | null;
  parcelle_idu?: string | null;
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

  // Données PLU en attente d'application (non encore sauvegardées)
  const [pendingPlu, setPendingPlu] = useState<PluPatch | null>(null);

  const handleCancel = useCallback(() => {
    setForm({
      adresse_recherche: lead.adresse_recherche ?? "",
      commune: lead.commune ?? "",
      code_postal: lead.code_postal ?? "",
      departement: lead.departement ?? "",
    });
    setPendingPlu(null);
    setError(null);
    setEditing(false);
  }, [lead]);

  function handlePluResult(data: ParcelleData) {
    setPendingPlu({
      plu_adresse: data.address_label ?? null,
      plu_zone: data.zone_urba ?? null,
      plu_libelong: data.libelong ?? null,
      plu_typezone: data.typezone ?? null,
      plu_typedoc: data.typedoc ?? null,
      plu_etat_doc: data.etat_doc ?? null,
      plu_datappro: data.datappro ?? null,
      plu_prescriptions: data.prescriptions ?? null,
      plu_servitudes: data.servitudes ?? null,
      plu_lon: data.lon ?? null,
      plu_lat: data.lat ?? null,
      parcelle_idu: data.parcelle ?? null,
    });

    // Auto-remplir l'adresse de recherche si vide ou si on veut l'écraser
    if (data.address_label && !form.adresse_recherche) {
      setForm((prev) => ({ ...prev, adresse_recherche: data.address_label! }));
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...(pendingPlu ?? {}) }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur serveur");
      }
      setPendingPlu(null);
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
            className="rounded-lg px-3 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="rounded-lg px-3 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white"
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

          {/* Analyseur PLU — appelle /api/admin/plu, résultat inclus au PATCH */}
          <AdminPluAnalyser
            initialAddress={form.adresse_recherche}
            onResult={handlePluResult}
          />

          {pendingPlu && (
            <p className="text-[11px] text-[#7469F4]/80">
              ✓ Données PLU prêtes — cliquez sur Enregistrer pour les sauvegarder avec les champs ci-dessus.
            </p>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
