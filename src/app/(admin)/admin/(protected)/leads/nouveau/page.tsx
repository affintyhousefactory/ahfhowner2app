"use client";

/**
 * Création d'un lead — refaite sur les grilles du configurateur v2 (ADR-035 §6).
 *
 * L'écran suit l'appel : on note qui est au bout du fil, ce qu'il veut, où se
 * trouve son terrain, et quand le rappeler. Les grilles viennent toutes de
 * `loadConfig()` (ADR-030) — aucun prix, aucun palier, aucune option n'est
 * écrit ici.
 *
 * Le mode « Pack terrain » relève du domaine mandataire suspendu (ADR-028) : il
 * n'apparaît que si le drapeau est levé.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { FEATURES } from "@/lib/features";
import { CONSEILLERS, STATUTS_COMMERCIAUX, eur } from "@/lib/crm";
import {
  loadConfig,
  optionsPourModele,
  paliersPourModele,
  prixOption,
  type ModeleId,
} from "@/lib/configurateur/config";
import type { ParcelleData } from "@/shared/types/plu";

type TerrainMode = "none" | "own" | "pack";

const PACK_LABELS: Record<string, string> = {
  essentiel: "Pack Essentiel · 4 900 €",
  etendu: "Pack Étendu · 7 300 €",
  departement: "Pack Département · 11 200 €",
};

export default function NouveauLeadPage() {
  const router = useRouter();
  const cfg = useMemo(() => loadConfig(), []);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Identité
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");

  // Suivi
  const [responsable, setResponsable] = useState("");
  const [statutCommercial, setStatutCommercial] = useState("nouveau");
  const [prochainRappel, setProchainRappel] = useState("");

  // Configuration v2
  const [usage, setUsage] = useState("");
  const [quantite, setQuantite] = useState("1");
  const [modele, setModele] = useState<ModeleId>("one");
  const [ambiance, setAmbiance] = useState(cfg.ambiances[0].id);
  const [terrasse, setTerrasse] = useState("sans");
  const [options, setOptions] = useState<string[]>([]);
  const [transport, setTransport] = useState("");
  const [slot, setSlot] = useState("");

  // Terrain
  const [terrainMode, setTerrainMode] = useState<TerrainMode>("none");
  const [packTerrain, setPackTerrain] = useState("essentiel");
  const [adresseRecherche, setAdresseRecherche] = useState("");
  const [commune, setCommune] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [departement, setDepartement] = useState("");
  const [parcelle, setParcelle] = useState("");
  const [pluData, setPluData] = useState<ParcelleData | null>(null);
  const [pluLoading, setPluLoading] = useState(false);
  const [pluError, setPluError] = useState<string | null>(null);

  // Notes
  const [notes, setNotes] = useState("");

  /* Les prix suivent la grille, jamais la saisie. */
  const calcul = useMemo(() => {
    const m = cfg.modeles.find((x) => x.id === modele) ?? cfg.modeles[0];
    const paliers = paliersPourModele(cfg, m.id);
    const dispo = optionsPourModele(cfg, m.id);
    const base = m.prixBaseTtc;
    const prixTerrasse = paliers.find((p) => p.id === terrasse)?.prixTtc ?? 0;
    const prixOptions = dispo
      .filter((o) => options.includes(o.id))
      .reduce((s, o) => s + prixOption(o, m.id), 0);
    const t = transport ? Number(transport) : 0;
    return { m, paliers, dispo, base, prixTerrasse, prixOptions, transport: t, total: base + prixTerrasse + prixOptions + t };
  }, [cfg, modele, terrasse, options, transport]);

  const usageDef = cfg.usages.find((u) => u.id === usage);
  const brancheFermee = usageDef ? !usageDef.eligible : false;

  function changerModele(m: ModeleId) {
    const dispo = optionsPourModele(cfg, m).map((o) => o.id);
    setModele(m);
    setOptions((prev) => prev.filter((id) => dispo.includes(id)));
    if (!paliersPourModele(cfg, m).some((p) => p.id === terrasse)) setTerrasse("sans");
  }

  function toggleOption(id: string) {
    setOptions((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));
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
        // Extraire commune / code postal du libellé BAN
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

    const q = Math.max(1, Number(quantite) || 1);

    // Instantané fidèle + colonnes plates : voir ADR-035 §4.
    const config_v2 = {
      version: cfg.version,
      usage: usage || null,
      quantite: q,
      modele,
      ambiance,
      terrasse,
      options,
      prix: {
        base: calcul.base,
        terrasse: calcul.prixTerrasse,
        options: calcul.prixOptions,
        transport: transport ? Number(transport) : null,
        total: calcul.total,
      },
      slot: slot ? Number(slot) : null,
      saisi_par: "admin",
    };

    const body = {
      prenom, nom, email, tel: tel || null,
      produit: calcul.m.nom,

      // Suivi CRM
      responsable: responsable || null,
      statut_commercial: statutCommercial,
      prochain_rappel_at: prochainRappel ? new Date(prochainRappel).toISOString() : null,

      // Configuration v2
      config_v2,
      cfg_version: cfg.version,
      cfg_usage: usage || null,
      cfg_quantite: q,
      cfg_modele: modele,
      cfg_ambiance: ambiance,
      cfg_terrasse: terrasse,
      cfg_options: options,
      cfg_prix_base: calcul.base,
      cfg_prix_terrasse: calcul.prixTerrasse,
      cfg_prix_options: calcul.prixOptions,
      cfg_transport: transport ? Number(transport) : null,
      cfg_total: calcul.total,
      slot: slot ? Number(slot) : null,

      // Terrain
      pack_terrain: terrainMode === "pack" ? packTerrain : null,
      terrain_mode: terrainMode === "none" ? null : terrainMode === "own" ? "have" : "pack",
      adresse_recherche: terrainMode !== "none" ? adresseRecherche || null : null,
      commune: commune || null,
      code_postal: codePostal || null,
      departement: departement || null,
      parcelle_idu: parcelle || null,

      // PLU
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

  const modesTerrain: { value: TerrainMode; label: string; desc: string }[] = [
    { value: "none", label: "Pas encore de terrain", desc: "Le client n'a pas identifié de parcelle" },
    { value: "own", label: "Terrain identifié — analyse PLU", desc: "Adresse dictée au téléphone : zonage et constructibilité" },
    ...(FEATURES.mandataire
      ? [{ value: "pack" as TerrainMode, label: "Proposition de Pack Terrain", desc: "Pack Affinity : Essentiel / Étendu / Département" }]
      : []),
  ];

  return (
    <div className="max-w-3xl p-8">
      <a href="/admin/leads" className="text-sm text-white/30 hover:text-white">← Leads</a>
      <h1 className="mb-6 mt-2 text-xl font-semibold text-white">Pré-qualification lead</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── 1. Identité ─────────────────────────────────────────────── */}
        <Section title="Identité">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom *" value={prenom} onChange={setPrenom} required />
            <Field label="Nom *" value={nom} onChange={setNom} required />
            <Field label="Email *" type="email" value={email} onChange={setEmail} required />
            <Field label="Téléphone" value={tel} onChange={setTel} />
          </div>
        </Section>

        {/* ── 2. Suivi ────────────────────────────────────────────────── */}
        <Section title="Suivi commercial">
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Conseiller"
              value={responsable}
              onChange={setResponsable}
              options={[{ value: "", label: "Non attribué" }, ...CONSEILLERS.map((c) => ({ value: c, label: c }))]}
            />
            <Select
              label="Statut"
              value={statutCommercial}
              onChange={setStatutCommercial}
              options={STATUTS_COMMERCIAUX.map((s) => ({ value: s.id, label: s.label }))}
            />
            <div>
              <label className="mb-1.5 block text-xs text-white/40">Prochain rappel</label>
              <input
                type="datetime-local"
                value={prochainRappel}
                onChange={(e) => setProchainRappel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
              />
            </div>
          </div>
        </Section>

        {/* ── 3. Configuration ────────────────────────────────────────── */}
        <Section title="Configuration">
          <div className="mb-4">
            <Select
              label="Usage"
              value={usage}
              onChange={setUsage}
              options={[
                { value: "", label: "—" },
                ...cfg.usages.map((u) => ({
                  value: u.id,
                  label: u.libelle + (u.eligible ? "" : " (hors cadre de vente)"),
                })),
              ]}
            />
            {brancheFermee && (
              <p className="mt-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-400/80">
                Cet usage n&apos;est pas ouvert à la vente (ADR-029) : la configuration ci-dessous
                est enregistrée pour mémoire, aucun prix ne doit être communiqué au client.
              </p>
            )}
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs text-white/40">Maison</p>
            <div className="flex gap-2">
              {cfg.modeles.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => changerModele(m.id)}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                    modele === m.id
                      ? "border-[#7469F4] bg-[#7469F4]/15 text-[#7469F4]"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
                  )}
                >
                  {m.nom}
                  <span className="ml-1.5 text-xs opacity-60">{m.surface} m²</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs text-white/40">Ambiance</p>
            <div className="flex flex-wrap gap-2">
              {cfg.ambiances.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAmbiance(a.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors",
                    ambiance === a.id
                      ? "border-[#7469F4] bg-[#7469F4]/15 text-white"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
                  )}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: a.teinte }} />
                  {a.nom}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Terrasse"
              value={terrasse}
              onChange={setTerrasse}
              options={calcul.paliers.map((p) => ({
                value: p.id,
                label: p.prixTtc > 0 ? `${p.nom} — ${eur(p.prixTtc)}` : p.nom,
              }))}
            />
            <div>
              <label className="mb-1.5 block text-xs text-white/40">Nombre d&apos;unités</label>
              <input
                type="number"
                min={1}
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4]"
              />
            </div>
            <Select
              label="Numéro de série"
              value={slot}
              onChange={setSlot}
              options={[
                { value: "", label: "Aucun" },
                ...Array.from({ length: cfg.serie.unites }, (_, i) => ({
                  value: String(i + 1),
                  label: `n° ${i + 1}`,
                })),
              ]}
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs text-white/40">
              Options <span className="text-white/25">— filtrées selon la maison</span>
            </p>
            <div className="space-y-1.5">
              {calcul.dispo.map((o) => (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={options.includes(o.id)}
                    onChange={() => toggleOption(o.id)}
                    className="accent-[#7469F4]"
                  />
                  <span className="flex-1 text-sm text-white">
                    {o.nom}
                    {o.detail && <span className="text-white/30"> — {o.detail}</span>}
                    {o.structurelle && (
                      <span className="ml-2 rounded-full bg-[#e07b28]/15 px-1.5 py-0.5 text-[10px] text-[#e07b28]">
                        structurelle
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-white/30">{eur(prixOption(o, modele))}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/40">Transport (€ TTC)</label>
              <input
                type="number"
                min={0}
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                placeholder="à estimer"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-[11px] text-white/30">Total TTC — grille {cfg.version}</p>
              <p className="mt-0.5 text-lg font-semibold text-white">{eur(calcul.total)}</p>
            </div>
          </div>
        </Section>

        {/* ── 4. Terrain ──────────────────────────────────────────────── */}
        <Section title="Situation terrain">
          <div className="mb-4 space-y-2">
            {modesTerrain.map((opt) => (
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
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
                  />
                  <button
                    type="button"
                    onClick={searchPlu}
                    disabled={pluLoading || !adresseRecherche.trim()}
                    className="rounded-xl bg-[#7469F4]/20 px-4 py-2.5 text-sm text-[#7469F4] transition-opacity hover:bg-[#7469F4]/30 disabled:opacity-40"
                  >
                    {pluLoading ? "…" : "Analyser PLU"}
                  </button>
                </div>
                {pluError && <p className="mt-1 text-xs text-red-400">{pluError}</p>}
              </div>

              {pluData && (
                <div className={cn(
                  "rounded-xl border p-4 text-sm",
                  pluData.found ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/5",
                )}>
                  {pluData.found ? (
                    <>
                      <p className="mb-2 font-medium text-white">
                        Zone {pluData.typezone} — {pluData.zone_urba}
                      </p>
                      <dl className="space-y-1 text-xs">
                        {pluData.address_label && (
                          <div className="flex justify-between">
                            <dt className="text-white/40">Adresse BAN</dt>
                            <dd className="max-w-xs truncate text-right text-white">{pluData.address_label}</dd>
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
                            <dd className="max-w-xs text-right text-white">{pluData.libelong}</dd>
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

              <div className="grid grid-cols-4 gap-3">
                <Field label="Code postal" value={codePostal} onChange={setCodePostal} />
                <Field label="Commune" value={commune} onChange={setCommune} />
                <Field label="Département" value={departement} onChange={setDepartement} />
                <Field label="Parcelle (IDU)" value={parcelle} onChange={setParcelle} />
              </div>
            </div>
          )}

          {terrainMode === "pack" && FEATURES.mandataire && (
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

        {/* ── 5. Notes ────────────────────────────────────────────────── */}
        <Section title="Notes internes AHF">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Contexte, source, remarques…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
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
            className="rounded-xl bg-white/5 px-6 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/10"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}

/* ── Sous-composants ─────────────────────────────────────────────────────── */

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
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
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
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
