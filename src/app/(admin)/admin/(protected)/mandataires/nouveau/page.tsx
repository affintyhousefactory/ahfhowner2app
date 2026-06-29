"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";

const RESEAUX_CARTE_T = [
  "Réseau indépendant (carte T propre)",
  "FNAIM",
  "Century 21",
  "IAD",
  "Megagence",
  "3G Immo",
  "Safti",
  "Capifrance",
  "Optimhome",
  "Autre réseau",
];

interface PappersResult {
  nom_entreprise: string;
  forme_juridique: string;
  adresse: string;
  siren: string;
  cessee: boolean;
  statut_rcs: string;
  dirigeant: { prenom: string; nom: string; qualite: string } | null;
}

export default function NouveauMandatairePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Identité
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");

  // Entreprise
  const [siret, setSiret] = useState("");
  const [formeJuridique, setFormeJuridique] = useState("");
  const [adresse, setAdresse] = useState("");
  const [pappersLoading, setPappersLoading] = useState(false);
  const [pappersError, setPappersError] = useState<string | null>(null);
  const [pappersResult, setPappersResult] = useState<PappersResult | null>(null);

  // Carte T
  const [reseauCarteT, setReseauCarteT] = useState("");
  const [carteTNumero, setCarteTNumero] = useState("");

  // Zone d'activité (tags)
  const [zones, setZones] = useState<string[]>([]);
  const [zoneInput, setZoneInput] = useState("");
  const zoneRef = useRef<HTMLInputElement>(null);

  // Description
  const [description, setDescription] = useState("");

  function addZone(value: string) {
    const v = value.trim();
    if (v && !zones.includes(v)) setZones((z) => [...z, v]);
    setZoneInput("");
  }

  function removeZone(z: string) {
    setZones((prev) => prev.filter((x) => x !== z));
  }

  async function lookupPappers() {
    const siren = siret.replace(/\s/g, "").slice(0, 9);
    if (siren.length !== 9) { setPappersError("SIREN = 9 premiers chiffres du SIRET"); return; }
    setPappersLoading(true);
    setPappersError(null);
    setPappersResult(null);
    try {
      const res = await fetch(`/api/admin/pappers?siren=${siren}`);
      const data = (await res.json()) as PappersResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur Pappers");
      setPappersResult(data);
      if (data.forme_juridique && !formeJuridique) setFormeJuridique(data.forme_juridique);
      if (data.adresse && !adresse) setAdresse(data.adresse);
      if (data.dirigeant) {
        if (!prenom) setPrenom(data.dirigeant.prenom);
        if (!nom) setNom(data.dirigeant.nom);
      }
    } catch (e) {
      setPappersError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPappersLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom || !nom || !email) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/admin/mandataires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom, nom, email, tel: tel || null,
          siret: siret || null,
          forme_juridique: formeJuridique || null,
          adresse: adresse || null,
          reseau_carte_t: reseauCarteT || null,
          carte_t_numero: carteTNumero || null,
          zone_activite: zones,
          description: description || null,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      router.push(`/admin/mandataires/${data.id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <a href="/admin/mandataires" className="text-sm text-white/30 hover:text-white">← Mandataires</a>
      <h1 className="mt-2 text-xl font-semibold text-white mb-6">Nouveau mandataire</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Ligne 1 : Identité + Entreprise côte à côte ── */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* ── 1. Identité ── */}
          <Section title="Identité">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom *" value={prenom} onChange={setPrenom} required />
              <Field label="Nom *" value={nom} onChange={setNom} required />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field label="Email *" type="email" value={email} onChange={setEmail} required />
              <Field label="Téléphone" value={tel} onChange={setTel} />
            </div>
          </Section>

          {/* ── 2. Entreprise + Pappers ── */}
          <Section title="Entreprise">
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-white/40">SIRET</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={siret}
                  onChange={(e) => { setSiret(e.target.value); setPappersResult(null); }}
                  placeholder="xxx xxx xxx xxxxx"
                  maxLength={17}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4] font-mono"
                />
                <button
                  type="button"
                  onClick={lookupPappers}
                  disabled={pappersLoading || siret.replace(/\s/g, "").length < 9}
                  className="rounded-xl bg-[#7469F4]/20 px-3 py-2.5 text-sm text-[#7469F4] hover:bg-[#7469F4]/30 transition-opacity disabled:opacity-40 whitespace-nowrap"
                >
                  {pappersLoading ? "…" : "Vérifier"}
                </button>
              </div>
              {pappersError && <p className="mt-1 text-xs text-red-400">{pappersError}</p>}
            </div>

            {/* Résultat Pappers */}
            {pappersResult && (
              <div className={cn(
                "mb-4 rounded-xl border p-3 text-sm",
                pappersResult.cessee
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-[#7469F4]/30 bg-[#7469F4]/5",
              )}>
                <p className="font-medium text-white text-sm">{pappersResult.nom_entreprise}</p>
                <p className="text-xs text-white/50 mt-0.5">{pappersResult.forme_juridique} · SIREN {pappersResult.siren}</p>
                {pappersResult.adresse && <p className="text-xs text-white/40 mt-1">{pappersResult.adresse}</p>}
                {pappersResult.dirigeant && (
                  <p className="text-xs text-white/40 mt-1">
                    {pappersResult.dirigeant.qualite} : {pappersResult.dirigeant.prenom} {pappersResult.dirigeant.nom}
                  </p>
                )}
                {pappersResult.cessee && <p className="mt-1 text-xs font-medium text-red-400">⚠ Entreprise cessée</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Forme juridique" value={formeJuridique} onChange={setFormeJuridique} />
              <div className="col-span-2">
                <Field label="Adresse siège" value={adresse} onChange={setAdresse} />
              </div>
            </div>
          </Section>
        </div>

        {/* ── Ligne 2 : Carte T + Zone d'activité côte à côte ── */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* ── 3. Carte T ── */}
          <Section title="Carte T — Transaction immobilière">
            <div>
              <label className="mb-1.5 block text-xs text-white/40">Réseau / détenteur carte T</label>
              <select
                value={reseauCarteT}
                onChange={(e) => setReseauCarteT(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
              >
                <option value="">— Sélectionner —</option>
                {RESEAUX_CARTE_T.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="mt-4">
              <Field label="Numéro carte T" value={carteTNumero} onChange={setCarteTNumero} placeholder="CPI 75 2025 000 XXX" />
            </div>
          </Section>

          {/* ── 4. Zone d'activité ── */}
          <Section title="Zone d'activité">
            <p className="mb-2 text-xs text-white/30">Départements, communes ou zones. Entrée ou virgule pour ajouter.</p>

            {zones.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {zones.map((z) => (
                  <span key={z} className="flex items-center gap-1.5 rounded-full bg-[#7469F4]/20 px-3 py-1 text-xs text-[#7469F4]">
                    {z}
                    <button type="button" onClick={() => removeZone(z)} className="opacity-60 hover:opacity-100">×</button>
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
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addZone(zoneInput);
                  }
                }}
                placeholder="ex: 64, Bayonne, Pyrénées-Atl."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4]"
              />
              <button
                type="button"
                onClick={() => addZone(zoneInput)}
                disabled={!zoneInput.trim()}
                className="rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white/60 hover:bg-white/15 disabled:opacity-40 transition-colors"
              >
                +
              </button>
            </div>
          </Section>
        </div>

        {/* ── 5. Description pleine largeur ── */}
        <Section title="Description (optionnel)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Profil, spécialités, remarques internes…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] placeholder:text-white/20"
          />
        </Section>

        {submitError && <p className="text-sm text-red-400">{submitError}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || !prenom || !nom || !email}
            className="rounded-xl bg-[#7469F4] px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            {loading ? "Création…" : "Créer le mandataire"}
          </button>
          <a
            href="/admin/mandataires"
            className="rounded-xl bg-white/5 px-6 py-2.5 text-sm text-white/40 hover:bg-white/10 transition-colors"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}

/* ── Sous-composants ─────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4]"
      />
    </div>
  );
}
