"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONFIG, PRICING, PRODUCTS } from "@/lib/site";
import { cn } from "@/shared/lib/cn";
import type { ParcelleData } from "@/shared/types/plu";

/* ── Types ──────────────────────────────────────────────────────── */

type TerrainMode = "none" | "own" | "pack";
type ProductKey = "one" | "max";

const PACK_LABELS: Record<string, string> = {
  essentiel: "Pack Essentiel · 4 900 €",
  etendu: "Pack Étendu · 7 300 €",
  departement: "Pack Département · 11 200 €",
};

/* ── Composant principal ─────────────────────────────────────────── */

export default function NouveauLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Identité
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");

  // Configuration Arko
  const [productKey, setProductKey] = useState<ProductKey>("one");
  const [bardage, setBardage] = useState<string>(CONFIG.cladding[0].id);
  const [facade, setFacade] = useState<string>(CONFIG.kitchen[0].id);
  const [bar, setBar] = useState<string>(CONFIG.bar[0].id);
  const [chambre, setChambre] = useState<string>(CONFIG.bedroom[0].id);
  const [interieur, setInterieur] = useState<string>(CONFIG.interior[0].id);
  const [terrasseM2, setTerrasseM2] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Terrain
  const [terrainMode, setTerrainMode] = useState<TerrainMode>("none");
  const [packTerrain, setPackTerrain] = useState("essentiel");
  const [adresseRecherche, setAdresseRecherche] = useState("");
  const [commune, setCommune] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [departement, setDepartement] = useState("");
  const [pluData, setPluData] = useState<ParcelleData | null>(null);
  const [pluLoading, setPluLoading] = useState(false);
  const [pluError, setPluError] = useState<string | null>(null);

  // Notes
  const [notes, setNotes] = useState("");

  const product = PRODUCTS[productKey];
  const options = product.pricing.options;

  function toggleOption(id: string) {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id],
    );
  }

  async function searchPlu() {
    if (!adresseRecherche.trim()) return;
    setPluLoading(true);
    setPluError(null);
    setPluData(null);
    try {
      const res = await fetch("/api/admin/plu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: adresseRecherche }),
      });
      const data = (await res.json()) as ParcelleData & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur PLU");
      setPluData(data);
      if (data.address_label && !commune) {
        // Tenter d'extraire commune/CP depuis le label BAN
        const parts = data.address_label.split(",").map((s) => s.trim());
        const last = parts[parts.length - 1] ?? "";
        const cpMatch = last.match(/(\d{5})\s+(.+)/);
        if (cpMatch) {
          setCodePostal(cpMatch[1]);
          setCommune(cpMatch[2]);
          setDepartement(cpMatch[1].slice(0, 2));
        }
      }
    } catch (e) {
      setPluError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPluLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom || !nom || !email) return;
    setLoading(true);
    setSubmitError(null);

    const optionsLabels = selectedOptions
      .map((id) => options.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];

    const configJson = { bardage, facade, bar, chambre, interieur, terrasseM2 };

    const body = {
      prenom, nom, email, tel: tel || null,
      produit: product.name,
      pack_terrain: terrainMode === "pack" ? packTerrain : null,
      terrain_mode: terrainMode === "none" ? null : terrainMode === "own" ? "have" : "pack",
      adresse_recherche: terrainMode !== "none" ? adresseRecherche || null : null,
      commune: commune || null,
      code_postal: codePostal || null,
      departement: departement || null,
      config_json: configJson,
      options_labels: optionsLabels,
      terrasse_m2: terrasseM2 || null,
      // PLU si dispo
      plu_consent: terrainMode === "own" && !!pluData?.found,
      plu_adresse: pluData?.address_label ?? null,
      plu_zone: pluData?.zone_urba ?? null,
      plu_libelong: pluData?.libelong ?? null,
      plu_typezone: pluData?.typezone ?? null,
      plu_typedoc: pluData?.typedoc ?? null,
      plu_etat_doc: pluData?.etat_doc ?? null,
      plu_datappro: pluData?.datappro ?? null,
      plu_prescriptions: pluData?.prescriptions ?? [],
      plu_servitudes: pluData?.servitudes ?? [],
      plu_lon: pluData?.lon ?? null,
      plu_lat: pluData?.lat ?? null,
      notes_ahf: notes || null,
    };

    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      router.push(`/admin/leads/${data.id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <a href="/admin/leads" className="text-sm text-white/30 hover:text-white">← Leads</a>
      <h1 className="mt-2 text-xl font-semibold text-white mb-6">Pré-qualification lead</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── 1. Identité ── */}
        <Section title="Identité">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom *" value={prenom} onChange={setPrenom} required />
            <Field label="Nom *" value={nom} onChange={setNom} required />
            <Field label="Email *" type="email" value={email} onChange={setEmail} required />
            <Field label="Téléphone" value={tel} onChange={setTel} />
          </div>
        </Section>

        {/* ── 2. Configuration Arko ── */}
        <Section title="Configuration Arko">
          {/* Modèle */}
          <div className="mb-4">
            <p className="mb-2 text-xs text-white/40">Modèle</p>
            <div className="flex gap-2">
              {(["one", "max"] as ProductKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setProductKey(k)}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                    productKey === k
                      ? "border-[#7469F4] bg-[#7469F4]/15 text-[#7469F4]"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
                  )}
                >
                  {PRODUCTS[k].name}
                  <span className="ml-1.5 text-xs opacity-60">{PRODUCTS[k].area}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteurs config */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Bardage"
              value={bardage}
              onChange={setBardage}
              options={CONFIG.cladding.map((c) => ({ value: c.id, label: c.label }))}
            />
            <Select
              label="Façade îlot cuisine"
              value={facade}
              onChange={setFacade}
              options={CONFIG.kitchen.map((c) => ({ value: c.id, label: c.label }))}
            />
            <Select
              label="Îlot barre"
              value={bar}
              onChange={setBar}
              options={CONFIG.bar.map((c) => ({ value: c.id, label: c.label }))}
            />
            <Select
              label="Chambre"
              value={chambre}
              onChange={setChambre}
              options={CONFIG.bedroom.map((c) => ({ value: c.id, label: c.label }))}
            />
            <Select
              label="Intérieur"
              value={interieur}
              onChange={setInterieur}
              options={CONFIG.interior.map((c) => ({ value: c.id, label: c.label }))}
            />
            <div>
              <label className="mb-1.5 block text-xs text-white/40">Terrasse (m²)</label>
              <input
                type="number"
                min={0}
                max={30}
                value={terrasseM2 || ""}
                onChange={(e) => setTerrasseM2(Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4]"
              />
            </div>
          </div>

          {/* Options premium */}
          <div className="mt-4">
            <p className="mb-2 text-xs text-white/40">Options</p>
            <div className="space-y-1.5">
              {options.map((o) => (
                <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(o.id)}
                    onChange={() => toggleOption(o.id)}
                    className="accent-[#7469F4]"
                  />
                  <span className="flex-1 text-sm text-white">{o.label}</span>
                  <span className="text-xs text-white/30">{o.price.toLocaleString("fr-FR")} €</span>
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 3. Terrain ── */}
        <Section title="Situation terrain">
          <div className="space-y-2 mb-4">
            {(
              [
                { value: "none", label: "Pas de terrain", desc: "Le client n'a pas encore de terrain" },
                { value: "own", label: "Possède un terrain — Recherche PLU", desc: "Analyser le zonage et la constructibilité" },
                { value: "pack", label: "Proposition de Pack Terrain", desc: "Pack Affinity : Essentiel / Étendu / Département" },
              ] as { value: TerrainMode; label: string; desc: string }[]
            ).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  terrainMode === opt.value
                    ? "border-[#7469F4]/50 bg-[#7469F4]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                <input
                  type="radio"
                  name="terrainMode"
                  value={opt.value}
                  checked={terrainMode === opt.value}
                  onChange={() => setTerrainMode(opt.value)}
                  className="mt-0.5 accent-[#7469F4]"
                />
                <div>
                  <p className="text-sm font-medium text-white">{opt.label}</p>
                  <p className="text-xs text-white/40">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Mode "own" — adresse + PLU */}
          {terrainMode === "own" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-white/40">Adresse du terrain</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adresseRecherche}
                    onChange={(e) => { setAdresseRecherche(e.target.value); setPluData(null); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchPlu())}
                    placeholder="ex: 12 chemin des Fougères, 64500 Saint-Jean-de-Luz"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4]"
                  />
                  <button
                    type="button"
                    onClick={searchPlu}
                    disabled={pluLoading || !adresseRecherche.trim()}
                    className="rounded-xl bg-[#7469F4]/20 px-4 py-2.5 text-sm text-[#7469F4] transition-opacity disabled:opacity-40 hover:bg-[#7469F4]/30"
                  >
                    {pluLoading ? "…" : "Analyser PLU"}
                  </button>
                </div>
                {pluError && <p className="mt-1 text-xs text-red-400">{pluError}</p>}
              </div>

              {/* Résultat PLU */}
              {pluData && (
                <div className={cn(
                  "rounded-xl border p-4 text-sm",
                  pluData.found ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/5",
                )}>
                  {pluData.found ? (
                    <>
                      <p className="font-medium text-white mb-2">
                        Zone {pluData.typezone} — {pluData.zone_urba}
                      </p>
                      <dl className="space-y-1 text-xs">
                        {pluData.address_label && (
                          <div className="flex justify-between">
                            <dt className="text-white/40">Adresse BAN</dt>
                            <dd className="text-white text-right max-w-xs truncate">{pluData.address_label}</dd>
                          </div>
                        )}
                        {pluData.typedoc && (
                          <div className="flex justify-between">
                            <dt className="text-white/40">Document</dt>
                            <dd className="text-white">{pluData.typedoc} — {pluData.etat_doc}</dd>
                          </div>
                        )}
                        {pluData.libelong && (
                          <div className="flex justify-between">
                            <dt className="text-white/40">Destination</dt>
                            <dd className="text-white text-right max-w-xs">{pluData.libelong}</dd>
                          </div>
                        )}
                        {!!pluData.prescriptions?.length && (
                          <div className="flex justify-between">
                            <dt className="text-white/40">Prescriptions</dt>
                            <dd className="text-white">{pluData.prescriptions.length}</dd>
                          </div>
                        )}
                      </dl>
                    </>
                  ) : (
                    <p className="text-white/40">Aucun document d&apos;urbanisme trouvé pour cette adresse.</p>
                  )}
                </div>
              )}

              {/* Localisation complémentaire */}
              <div className="grid grid-cols-3 gap-3">
                <Field label="Code postal" value={codePostal} onChange={setCodePostal} />
                <Field label="Commune" value={commune} onChange={setCommune} />
                <Field label="Département" value={departement} onChange={setDepartement} />
              </div>
            </div>
          )}

          {/* Mode "pack" — sélection pack + localisation */}
          {terrainMode === "pack" && (
            <div className="space-y-4">
              <Select
                label="Pack terrain"
                value={packTerrain}
                onChange={setPackTerrain}
                options={Object.entries(PACK_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              />
              <div>
                <p className="mb-2 text-xs text-white/40">Zone de recherche</p>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Code postal" value={codePostal} onChange={setCodePostal} />
                  <Field label="Commune" value={commune} onChange={setCommune} />
                  <Field label="Département" value={departement} onChange={setDepartement} />
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── 4. Notes ── */}
        <Section title="Notes internes AHF">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Contexte, source, remarques…"
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
            {loading ? "Création…" : "Créer le lead"}
          </button>
          <a
            href="/admin/leads"
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

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#7469F4]"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
