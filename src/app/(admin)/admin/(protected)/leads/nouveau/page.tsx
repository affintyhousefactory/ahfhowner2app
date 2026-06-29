"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRODUITS = ["Arko One", "Arko Max"];
const PACKS = [
  { value: "essentiel", label: "Pack Essentiel" },
  { value: "etendu", label: "Pack Étendu" },
  { value: "departement", label: "Pack Département" },
];

export default function NouveauLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", tel: "",
    produit: "", pack_terrain: "",
    adresse_recherche: "", commune: "", code_postal: "", departement: "",
    notes_ahf: "",
  });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json() as { id?: string; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Erreur serveur");
      router.push(`/admin/leads/${body.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <a href="/admin/leads" className="text-sm text-white/30 hover:text-white">← Leads</a>
      <h1 className="mt-2 text-xl font-semibold text-white mb-6">Nouveau lead</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identité */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Identité</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom *" value={form.prenom} onChange={set("prenom")} required />
            <Field label="Nom *" value={form.nom} onChange={set("nom")} required />
            <Field label="Email *" type="email" value={form.email} onChange={set("email")} required />
            <Field label="Téléphone" value={form.tel} onChange={set("tel")} />
          </div>
        </div>

        {/* Projet */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Projet</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/40">Modèle</label>
              <select value={form.produit} onChange={set("produit")}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4]">
                <option value="">—</option>
                {PRODUITS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">Pack terrain</label>
              <select value={form.pack_terrain} onChange={set("pack_terrain")}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4]">
                <option value="">—</option>
                {PACKS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Localisation</h2>
          <Field label="Adresse de recherche" value={form.adresse_recherche} onChange={set("adresse_recherche")} />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Field label="Code postal" value={form.code_postal} onChange={set("code_postal")} />
            </div>
            <div className="col-span-1">
              <Field label="Commune" value={form.commune} onChange={set("commune")} />
            </div>
            <div className="col-span-1">
              <Field label="Département" value={form.departement} onChange={set("departement")} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <label className="mb-1.5 block text-xs text-white/40">Notes internes AHF</label>
          <textarea value={form.notes_ahf} onChange={set("notes_ahf")} rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4]"
            placeholder="Contexte, source, remarques…" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="rounded-xl bg-[#7469F4] px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50">
            {loading ? "Création…" : "Créer le lead"}
          </button>
          <a href="/admin/leads"
            className="rounded-xl bg-white/5 px-6 py-2.5 text-sm text-white/40 hover:bg-white/10 transition-colors">
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40">{label}</label>
      <input type={type} value={value} onChange={onChange} required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4]" />
    </div>
  );
}
