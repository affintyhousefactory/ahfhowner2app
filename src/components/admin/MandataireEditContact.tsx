"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const STATUTS_PRO = [
  "Mandataire immobilier", "Agent commercial",
  "Apporteur d'affaires", "Conseiller habitat",
];
const RESEAU_TYPES = ["Réseau", "Agence", "Indépendant"];
const RAYONS = [
  { value: "20km", label: "20 km" },
  { value: "50km", label: "50 km" },
  { value: "80km", label: "80 km" },
  { value: "département", label: "Département" },
  { value: "région", label: "Région" },
];
const DELAIS = [
  { value: "moins_2h",  label: "< 2h"  },
  { value: "moins_24h", label: "< 24h" },
  { value: "48h",       label: "48h"   },
];
const SPECIALITES_OPTIONS = [
  { value: "terrain",              label: "Terrain" },
  { value: "maison_individuelle",  label: "Maison individuelle" },
  { value: "investissement",       label: "Investissement" },
  { value: "residence_secondaire", label: "Résidence secondaire" },
  { value: "division_parcellaire", label: "Division parcellaire" },
  { value: "locatif",              label: "Locatif" },
];

type Mandataire = {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  tel: string | null;
  statut_professionnel: string | null;
  reseau_type: string | null;
  adresse_principale: string | null;
  cp_principal: string | null;
  ville_principale: string | null;
  rayon_intervention: string | null;
  delai_rappel: string | null;
  specialites: string[] | null;
};

export default function MandataireEditContact({ m }: { m: Mandataire }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    prenom:               m.prenom               ?? "",
    nom:                  m.nom                  ?? "",
    email:                m.email                ?? "",
    tel:                  m.tel                  ?? "",
    statut_professionnel: m.statut_professionnel ?? "",
    reseau_type:          m.reseau_type          ?? "",
    adresse_principale:   m.adresse_principale   ?? "",
    cp_principal:         m.cp_principal         ?? "",
    ville_principale:     m.ville_principale     ?? "",
    rayon_intervention:   m.rayon_intervention   ?? "",
    delai_rappel:         m.delai_rappel         ?? "",
    specialites:          m.specialites          ?? [] as string[],
  });

  const handleCancel = useCallback(() => {
    setForm({
      prenom:               m.prenom               ?? "",
      nom:                  m.nom                  ?? "",
      email:                m.email                ?? "",
      tel:                  m.tel                  ?? "",
      statut_professionnel: m.statut_professionnel ?? "",
      reseau_type:          m.reseau_type          ?? "",
      adresse_principale:   m.adresse_principale   ?? "",
      cp_principal:         m.cp_principal         ?? "",
      ville_principale:     m.ville_principale     ?? "",
      rayon_intervention:   m.rayon_intervention   ?? "",
      delai_rappel:         m.delai_rappel         ?? "",
      specialites:          m.specialites          ?? [],
    });
    setError(null);
    setEditing(false);
  }, [m]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/mandataires/${m.id}`, {
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

  function toggleSpec(v: string) {
    setForm((p) => ({
      ...p,
      specialites: p.specialites.includes(v)
        ? p.specialites.filter((s) => s !== v)
        : [...p.specialites, v],
    }));
  }

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] transition-colors";
  const labelCls = "block text-xs text-white/40 mb-1";
  const chipCls  = (active: boolean) =>
    `rounded-lg border px-2.5 py-1 text-xs transition-colors cursor-pointer ${
      active ? "border-[#7469F4] bg-[#7469F4]/20 text-[#7469F4]" : "border-white/10 text-white/40 hover:border-white/20"
    }`;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Contact &amp; Profil
        </h2>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="rounded-lg px-3 py-1 text-xs text-white/40 hover:bg-white/5 hover:text-white transition-colors">
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleCancel}
              className="rounded-lg px-3 py-1 text-xs text-white/40 hover:bg-white/5 hover:text-white transition-colors">
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving}
              className="rounded-lg bg-[#7469F4] px-3 py-1 text-xs font-medium text-white disabled:opacity-50">
              {saving ? "…" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <dl className="space-y-2 text-sm">
          {([
            ["Email",   m.email],
            ["Tél",     m.tel],
            ["Statut",  m.statut_professionnel],
            ["Activité", m.reseau_type],
            ["Adresse principale", m.adresse_principale
              ? `${m.adresse_principale}${m.cp_principal ? " · " + m.cp_principal : ""}${m.ville_principale ? " " + m.ville_principale : ""}`
              : null],
            ["Rayon", RAYONS.find((r) => r.value === m.rayon_intervention)?.label ?? m.rayon_intervention],
            ["Délai rappel", DELAIS.find((d) => d.value === m.delai_rappel)?.label ?? m.delai_rappel],
          ] as [string, string | null][]).map(([label, value]) =>
            value ? (
              <div key={label} className="flex justify-between gap-4">
                <dt className="shrink-0 text-white/40">{label}</dt>
                <dd className="text-right text-white">{value}</dd>
              </div>
            ) : null,
          )}
          {(m.specialites ?? []).length > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-white/40">Spécialités</dt>
              <dd className="text-right text-white/70">
                {(m.specialites ?? [])
                  .map((s) => SPECIALITES_OPTIONS.find((o) => o.value === s)?.label ?? s)
                  .join(", ")}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <div className="space-y-4">
          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Prénom</label>
              <input className={inputCls} value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Nom</label>
              <input className={inputCls} value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Téléphone</label>
              <input type="tel" className={inputCls} value={form.tel} onChange={(e) => setForm((p) => ({ ...p, tel: e.target.value }))} />
            </div>
          </div>

          {/* Statut professionnel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Statut professionnel</label>
              <select className={inputCls} value={form.statut_professionnel} onChange={(e) => setForm((p) => ({ ...p, statut_professionnel: e.target.value }))}>
                <option value="">—</option>
                {STATUTS_PRO.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Type d'activité</label>
              <select className={inputCls} value={form.reseau_type} onChange={(e) => setForm((p) => ({ ...p, reseau_type: e.target.value }))}>
                <option value="">—</option>
                {RESEAU_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Adresse principale */}
          <div>
            <label className={labelCls}>Adresse principale</label>
            <input className={inputCls} value={form.adresse_principale} onChange={(e) => setForm((p) => ({ ...p, adresse_principale: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Code postal</label>
              <input className={inputCls} value={form.cp_principal} onChange={(e) => setForm((p) => ({ ...p, cp_principal: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Ville</label>
              <input className={inputCls} value={form.ville_principale} onChange={(e) => setForm((p) => ({ ...p, ville_principale: e.target.value }))} />
            </div>
          </div>

          {/* Rayon + Délai */}
          <div>
            <label className={labelCls}>Rayon d'intervention</label>
            <div className="flex flex-wrap gap-2">
              {RAYONS.map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => setForm((p) => ({ ...p, rayon_intervention: value }))}
                  className={chipCls(form.rayon_intervention === value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Délai habituel de rappel</label>
            <div className="flex gap-2">
              {DELAIS.map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => setForm((p) => ({ ...p, delai_rappel: value }))}
                  className={chipCls(form.delai_rappel === value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Spécialités */}
          <div>
            <label className={labelCls}>Spécialités</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALITES_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => toggleSpec(value)}
                  className={chipCls(form.specialites.includes(value))}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
