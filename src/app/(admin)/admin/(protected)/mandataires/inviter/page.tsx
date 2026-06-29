"use client";

import { useState, useRef } from "react";

export default function InviterMandatairePage() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [zones, setZones] = useState<string[]>([]);
  const [zoneInput, setZoneInput] = useState("");
  const zoneRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; invitation_url: string } | null>(null);

  function addZone(value: string) {
    const v = value.trim();
    if (v && !zones.includes(v)) setZones((z) => [...z, v]);
    setZoneInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/mandataires/inviter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, nom, email, tel: tel || undefined, zone_activite: zones }),
      });
      const data = (await res.json()) as { id?: string; invitation_url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      setResult({ id: data.id!, invitation_url: data.invitation_url! });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="p-8 max-w-xl">
        <div className="rounded-2xl border border-[#7469F4]/30 bg-[#7469F4]/5 p-6">
          <p className="text-sm font-medium text-[#7469F4] mb-1">Invitation envoyée</p>
          <p className="text-sm text-white/60 mb-4">
            {prenom} {nom} va recevoir un email avec son lien d'inscription (valable 7 jours).
          </p>
          <div className="mb-4">
            <p className="text-[11px] text-white/30 mb-1 uppercase tracking-wide">Lien d'onboarding</p>
            <code className="block rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70 break-all">
              {result.invitation_url}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(result.invitation_url)}
              className="mt-2 text-xs text-[#7469F4] hover:underline"
            >
              Copier le lien
            </button>
          </div>
          <div className="flex gap-3">
            <a
              href={`/admin/mandataires/${result.id}`}
              className="rounded-xl bg-[#7469F4] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Voir la fiche
            </a>
            <a
              href="/admin/mandataires"
              className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white/40 hover:bg-white/10"
            >
              Retour à la liste
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl">
      <a href="/admin/mandataires" className="text-sm text-white/30 hover:text-white">← Mandataires</a>
      <h1 className="mt-2 text-xl font-semibold text-white mb-1">Inviter un mandataire</h1>
      <p className="text-sm text-white/30 mb-6">
        Un email avec un lien d'inscription personnalisé sera envoyé automatiquement (valable 7 jours).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Identité</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom *" value={prenom} onChange={setPrenom} required />
            <Field label="Nom *" value={nom} onChange={setNom} required />
            <Field label="Email *" type="email" value={email} onChange={setEmail} required />
            <Field label="Téléphone" value={tel} onChange={setTel} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Zone d'activité (optionnel)</h2>
          <p className="mb-2 text-xs text-white/30">Pré-rempli dans le formulaire du mandataire. Entrée ou virgule.</p>
          {zones.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {zones.map((z) => (
                <span key={z} className="flex items-center gap-1.5 rounded-full bg-[#7469F4]/20 px-3 py-1 text-xs text-[#7469F4]">
                  {z}
                  <button type="button" onClick={() => setZones((prev) => prev.filter((x) => x !== z))} className="opacity-60 hover:opacity-100">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={zoneRef}
              type="text"
              value={zoneInput}
              onChange={(e) => setZoneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addZone(zoneInput); }
              }}
              placeholder="ex: 64, Bayonne…"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4]"
            />
            <button type="button" onClick={() => addZone(zoneInput)} disabled={!zoneInput.trim()}
              className="rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white/60 hover:bg-white/15 disabled:opacity-40">+</button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading || !prenom || !nom || !email}
            className="rounded-xl bg-[#7469F4] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40">
            {loading ? "Envoi…" : "Envoyer l'invitation"}
          </button>
          <a href="/admin/mandataires" className="rounded-xl bg-white/5 px-6 py-2.5 text-sm text-white/40 hover:bg-white/10">
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4]" />
    </div>
  );
}
