"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/cn";
import { loadGooglePlacesScript } from "@/shared/lib/google-places";

/* ── Types ──────────────────────────────────────────────────────────────── */

export type ContratData = {
  // Identité
  prenom: string;
  nom: string;
  tel: string;
  // Page 1 — Sous-traitant
  nom_raison_sociale: string;
  forme_juridique: string;
  siret: string;
  adresse: string;            // adresse siège
  immatriculation_rsac: string;
  reseau_carte_t: string;
  carte_t_numero: string;
  email: string;
  qualite: string;
  // Statut professionnel
  statut_professionnel: string;
  reseau_type: string;
  // Adresse principale
  adresse_principale: string;
  cp_principal: string;
  ville_principale: string;
  lat: number | null;
  lon: number | null;
  // Profil d'intervention
  rayon_intervention: string;
  delai_rappel: string;
  specialites: string[];
  // Article 16 — Contact DPA
  dpa_nom_prenom: string;
  dpa_email: string;
  dpa_email_violations: string;
  // Signature
  signature_nom: string;
  signature_prenom: string;
  signature_qualite: string;
  signature_date: string;
  signature_data_url: string;
};

type Step = "fields" | "article16" | "signature" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "fields",    label: "Identification"  },
  { id: "article16", label: "Contact RGPD"    },
  { id: "signature", label: "Signature"        },
  { id: "review",    label: "Récapitulatif"    },
];

/* ── Constantes ─────────────────────────────────────────────────────────── */

const FORMES_JURIDIQUES = [
  "Micro-entrepreneur", "EI — Entreprise Individuelle",
  "EURL", "SASU", "SARL", "SAS", "Autre",
];

const STATUTS_PRO = [
  "Mandataire immobilier",
  "Agent commercial",
  "Apporteur d'affaires",
  "Conseiller habitat",
];

const RESEAU_TYPES = ["Réseau", "Agence", "Indépendant"];

const RAYONS = [
  { value: "20km",        label: "20 km" },
  { value: "50km",        label: "50 km" },
  { value: "80km",        label: "80 km" },
  { value: "département", label: "Mon département" },
  { value: "région",      label: "Ma région" },
];

const DELAIS = [
  { value: "moins_2h",   label: "Moins de 2 heures" },
  { value: "moins_24h",  label: "Moins de 24 heures" },
  { value: "48h",        label: "48 heures" },
];

const SPECIALITES_OPTIONS = [
  { value: "terrain",              label: "Recherche terrain" },
  { value: "maison_individuelle",  label: "Maison individuelle" },
  { value: "investissement",       label: "Investissement locatif" },
  { value: "residence_secondaire", label: "Résidence secondaire" },
  { value: "division_parcellaire", label: "Division parcellaire" },
  { value: "locatif",              label: "Locatif" },
];

/* ── Pappers result type ─────────────────────────────────────────────────── */

interface PappersResult {
  nom_entreprise: string;
  forme_juridique: string;
  adresse: string;
  siren: string;
  cessee: boolean;
}

/* ── Props ───────────────────────────────────────────────────────────────── */

type Props = {
  onComplete: (data: ContratData) => void;
  prefill?: {
    prenom?: string;
    nom?: string;
    email?: string;
    tel?: string;
    siret?: string;
    forme_juridique?: string;
    adresse?: string;
    reseau_carte_t?: string;
    carte_t_numero?: string;
  };
  className?: string;
};

/* ── Composant principal ─────────────────────────────────────────────────── */

export function ContratCanvas({ onComplete, prefill, className }: Props) {
  const [step, setStep] = useState<Step>("fields");
  const [data, setData] = useState<ContratData>({
    prenom:               prefill?.prenom ?? "",
    nom:                  prefill?.nom ?? "",
    tel:                  prefill?.tel ?? "",
    nom_raison_sociale:   "",
    forme_juridique:      prefill?.forme_juridique ?? "",
    siret:                prefill?.siret ?? "",
    adresse:              prefill?.adresse ?? "",
    immatriculation_rsac: "",
    reseau_carte_t:       prefill?.reseau_carte_t ?? "",
    carte_t_numero:       prefill?.carte_t_numero ?? "",
    email:                prefill?.email ?? "",
    qualite:              "Sous-traitant — Mandataire immobilier partenaire",
    statut_professionnel: "",
    reseau_type:          "",
    adresse_principale:   "",
    cp_principal:         "",
    ville_principale:     "",
    lat:                  null,
    lon:                  null,
    rayon_intervention:   "",
    delai_rappel:         "",
    specialites:          [],
    dpa_nom_prenom:       prefill?.prenom && prefill?.nom ? `${prefill.prenom} ${prefill.nom}` : "",
    dpa_email:            prefill?.email ?? "",
    dpa_email_violations: prefill?.email ?? "",
    signature_nom:        prefill?.nom ?? "",
    signature_prenom:     prefill?.prenom ?? "",
    signature_qualite:    "Mandataire partenaire",
    signature_date:       new Date().toLocaleDateString("fr-FR"),
    signature_data_url:   "",
  });

  // Pappers
  const [pappersLoading, setPappersLoading] = useState(false);
  const [pappersResult, setPappersResult] = useState<PappersResult | null>(null);
  const [pappersError, setPappersError] = useState<string | null>(null);

  // Signature canvas
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const drawing     = useRef(false);
  const lastPos     = useRef<{ x: number; y: number } | null>(null);

  // Google Places
  const containerRef    = useRef<HTMLDivElement>(null);
  const placeElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

  useEffect(() => {
    if (step !== "fields" || !apiKey) return;

    loadGooglePlacesScript(apiKey).then(() => {
      if (!containerRef.current || placeElementRef.current) return;
      const element = new window.google.maps.places.PlaceAutocompleteElement({
        includedRegionCodes:  ["fr"],
        includedPrimaryTypes: ["street_address", "route"],
      });
      containerRef.current.appendChild(element);
      placeElementRef.current = element;

      element.addEventListener("gmp-select", async (event) => {
        const place = event.placePrediction.toPlace();
        await place.fetchFields({ fields: ["formattedAddress", "addressComponents", "location"] });
        let cp = ""; let ville = "";
        for (const c of place.addressComponents ?? []) {
          if (c.types.includes("postal_code")) cp = c.longText ?? "";
          if (c.types.includes("locality"))    ville = c.longText ?? "";
        }
        setData((prev) => ({
          ...prev,
          adresse_principale: place.formattedAddress ?? prev.adresse_principale,
          cp_principal:       cp    || prev.cp_principal,
          ville_principale:   ville || prev.ville_principale,
          lat: place.location?.lat() ?? prev.lat,
          lon: place.location?.lng() ?? prev.lon,
        }));
      });
    });

    return () => {
      placeElementRef.current?.remove();
      placeElementRef.current = null;
    };
  }, [step, apiKey]);

  // Sync DPA email avec email principal si vide
  useEffect(() => {
    if (!data.dpa_email && data.email) {
      set("dpa_email", data.email);
      set("dpa_email_violations", data.email);
    }
  }, [data.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function set(field: keyof ContratData, value: ContratData[keyof ContratData]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSpecialite(value: string) {
    setData((prev) => ({
      ...prev,
      specialites: prev.specialites.includes(value)
        ? prev.specialites.filter((s) => s !== value)
        : [...prev.specialites, value],
    }));
  }

  async function lookupPappers() {
    const siren = data.siret.replace(/\D/g, "").slice(0, 9);
    if (siren.length !== 9) { setPappersError("Saisissez au moins 9 chiffres (SIREN)"); return; }
    setPappersLoading(true); setPappersError(null); setPappersResult(null);
    try {
      const res = await fetch(`/api/admin/pappers?siren=${siren}`);
      const d = (await res.json()) as PappersResult & { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Erreur Pappers");
      setPappersResult(d);
      if (d.forme_juridique && !data.forme_juridique) set("forme_juridique", d.forme_juridique);
      if (d.adresse && !data.adresse) set("adresse", d.adresse);
      if (d.nom_entreprise && !data.nom_raison_sociale) set("nom_raison_sociale", d.nom_entreprise);
    } catch (e) {
      setPappersError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPappersLoading(false);
    }
  }

  const canProceed = (): boolean => {
    if (step === "fields") {
      return !!(
        data.email &&
        data.statut_professionnel &&
        data.reseau_type &&
        data.nom_raison_sociale &&
        data.forme_juridique &&
        data.siret &&
        data.reseau_carte_t &&
        data.carte_t_numero &&
        data.adresse_principale &&
        data.rayon_intervention &&
        data.delai_rappel
      );
    }
    if (step === "article16") return !!(data.dpa_nom_prenom && data.dpa_email);
    if (step === "signature") return !!(data.signature_nom && data.signature_prenom && data.signature_data_url);
    return true;
  };

  const next = () => {
    const order: Step[] = ["fields", "article16", "signature", "review"];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  };
  const prev = () => {
    const order: Step[] = ["fields", "article16", "signature", "review"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  /* ── Canvas signature ─── */
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
    e.preventDefault();
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current || !canvasRef.current || !lastPos.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvasRef.current);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a1a18"; ctx.lineWidth = 2.5;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    e.preventDefault();
  }, []);

  const endDraw = useCallback(() => {
    drawing.current = false; lastPos.current = null;
    if (canvasRef.current) set("signature_data_url", canvasRef.current.toDataURL("image/png"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    set("signature_data_url", "");
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header AHF */}
      <div className="rounded-xl border border-[#7469F4]/20 bg-[#7469F4]/5 px-5 py-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
          Contrat-cadre de sous-traitance mandataire
        </p>
        <h2 className="mt-1 text-lg font-semibold text-gray-900">
          Pack Recherche Terrain — Plateforme HOWNER
        </h2>
        <p className="mt-0.5 text-sm text-gray-500">
          AHF · SAS · SIRET 982 581 506 00010 · 28 Chemin de Sabalce OEV, 64100 Bayonne
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => i < stepIndex && setStep(s.id)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                s.id === step
                  ? "bg-[#7469F4] text-white"
                  : i < stepIndex
                    ? "cursor-pointer bg-[#7469F4]/20 text-[#7469F4] hover:bg-[#7469F4]/30"
                    : "bg-gray-100 text-gray-400",
              )}
            >
              {i + 1}
            </button>
            <span className={cn("hidden text-xs sm:inline", s.id === step ? "font-medium text-gray-900" : "text-gray-400")}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* ── Étape 1 : Identification ─────────────────────────────────────── */}
      {step === "fields" && (
        <div className="space-y-6">
          <SectionLabel>Page 1 — Identification du Mandataire (Sous-traitant)</SectionLabel>

          {/* Bloc 1 — Identité & Contact */}
          <Bloc title="Identité &amp; contact">
            <div className="grid grid-cols-2 gap-3">
              <ReadonlyInput label="Prénom" value={data.prenom} />
              <ReadonlyInput label="Nom" value={data.nom} />
            </div>
            <FieldRow label="Téléphone">
              <input type="tel" value={data.tel}
                onChange={(e) => set("tel", e.target.value)}
                placeholder="06 XX XX XX XX" className={inputCls} />
            </FieldRow>
            <FieldRow label="Email professionnel *">
              <input type="email" value={data.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="vous@exemple.fr" className={inputCls} />
            </FieldRow>
          </Bloc>

          {/* Bloc 2 — Statut professionnel */}
          <Bloc title="Statut professionnel">
            <FieldRow label="Statut *">
              <select value={data.statut_professionnel}
                onChange={(e) => set("statut_professionnel", e.target.value)} className={inputCls}>
                <option value="">Sélectionner…</option>
                {STATUTS_PRO.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Type d'activité *">
              <div className="flex gap-2">
                {RESEAU_TYPES.map((r) => (
                  <button key={r} type="button"
                    onClick={() => set("reseau_type", r)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      data.reseau_type === r
                        ? "border-[#7469F4] bg-[#7469F4]/10 text-[#7469F4]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300",
                    )}>
                    {r}
                  </button>
                ))}
              </div>
            </FieldRow>
          </Bloc>

          {/* Bloc 3 — Entreprise & Carte T */}
          <Bloc title="Entreprise &amp; Carte T">
            <FieldRow label="SIRET *">
              <div className="flex gap-2">
                <input type="text" value={data.siret}
                  onChange={(e) => { set("siret", e.target.value.replace(/\D/g, "").slice(0, 14)); setPappersResult(null); }}
                  placeholder="14 chiffres" className={cn(inputCls, "font-mono flex-1")} />
                <button type="button" onClick={lookupPappers}
                  disabled={pappersLoading || data.siret.replace(/\D/g, "").length < 9}
                  className="shrink-0 rounded-lg bg-[#7469F4]/10 px-4 py-2.5 text-sm text-[#7469F4] hover:bg-[#7469F4]/20 disabled:opacity-40 whitespace-nowrap transition-colors">
                  {pappersLoading ? "…" : "Vérifier"}
                </button>
              </div>
              {pappersError && <p className="mt-1 text-xs text-red-500">{pappersError}</p>}
              {pappersResult && (
                <div className={cn("mt-2 rounded-xl border p-3 text-sm",
                  pappersResult.cessee ? "border-red-200 bg-red-50" : "border-[#7469F4]/20 bg-[#7469F4]/5")}>
                  <p className="font-medium text-gray-900">{pappersResult.nom_entreprise}</p>
                  <p className="text-xs text-gray-500 mt-0.5">SIREN {pappersResult.siren}</p>
                  {pappersResult.cessee && <p className="mt-1 text-xs font-medium text-red-600">⚠ Entreprise cessée</p>}
                </div>
              )}
            </FieldRow>

            <FieldRow label="Nom / Raison sociale *">
              <input type="text" value={data.nom_raison_sociale}
                onChange={(e) => set("nom_raison_sociale", e.target.value)}
                placeholder="Ex : MonAgence Immo" className={inputCls} />
            </FieldRow>

            <FieldRow label="Forme juridique *">
              <select value={data.forme_juridique}
                onChange={(e) => set("forme_juridique", e.target.value)} className={inputCls}>
                <option value="">Sélectionner…</option>
                {FORMES_JURIDIQUES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </FieldRow>

            <FieldRow label="Adresse du siège">
              <input type="text" value={data.adresse}
                onChange={(e) => set("adresse", e.target.value)}
                placeholder="N° voie, code postal, commune" className={inputCls} />
            </FieldRow>

            <FieldRow label="Immatriculation RSAC (N° Greffe)">
              <input type="text" value={data.immatriculation_rsac}
                onChange={(e) => set("immatriculation_rsac", e.target.value)}
                placeholder="Ex : Greffe de Bordeaux N° 2024AC00123" className={inputCls} />
            </FieldRow>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Réseau / Détenteur carte T *">
                <input type="text" value={data.reseau_carte_t}
                  onChange={(e) => set("reseau_carte_t", e.target.value)}
                  placeholder="Ex : IAD, SAFTI, indépendant…" className={inputCls} />
              </FieldRow>
              <FieldRow label="N° Carte professionnelle T *">
                <input type="text" value={data.carte_t_numero}
                  onChange={(e) => set("carte_t_numero", e.target.value)}
                  placeholder="CCI de … n° …" className={inputCls} />
              </FieldRow>
            </div>
          </Bloc>

          {/* Bloc 4 — Adresse principale (Google Places) */}
          <Bloc title="Adresse principale">
            <p className="text-xs text-gray-400">
              Votre adresse personnelle — utilisée pour calculer votre rayon d'intervention.
            </p>
            <FieldRow label="Rechercher votre adresse *">
              <div ref={containerRef} className="gmap-autocomplete" />
            </FieldRow>
            {data.adresse_principale && (
              <p className="text-xs text-[#7469F4]">✓ {data.adresse_principale}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Code postal">
                <input type="text" value={data.cp_principal} readOnly
                  placeholder="auto" className={cn(inputCls, "bg-gray-50 text-gray-500")} />
              </FieldRow>
              <FieldRow label="Ville">
                <input type="text" value={data.ville_principale} readOnly
                  placeholder="auto" className={cn(inputCls, "bg-gray-50 text-gray-500")} />
              </FieldRow>
            </div>
            {data.lat && data.lon && (
              <p className="text-xs text-gray-400">
                Position géolocalisée · {data.lat.toFixed(5)}, {data.lon.toFixed(5)}
              </p>
            )}
          </Bloc>

          {/* Bloc 5 — Profil d'intervention */}
          <Bloc title="Profil d'intervention">
            <FieldRow label="Zone d'intervention *">
              <div className="flex flex-wrap gap-2">
                {RAYONS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => set("rayon_intervention", value)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      data.rayon_intervention === value
                        ? "border-[#7469F4] bg-[#7469F4]/10 font-medium text-[#7469F4]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300",
                    )}>
                    {label}
                  </button>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="Délai habituel de rappel *">
              <div className="flex flex-wrap gap-2">
                {DELAIS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => set("delai_rappel", value)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      data.delai_rappel === value
                        ? "border-[#7469F4] bg-[#7469F4]/10 font-medium text-[#7469F4]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300",
                    )}>
                    {label}
                  </button>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="Spécialités">
              <div className="flex flex-wrap gap-2">
                {SPECIALITES_OPTIONS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => toggleSpecialite(value)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      data.specialites.includes(value)
                        ? "border-[#7469F4] bg-[#7469F4]/10 font-medium text-[#7469F4]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300",
                    )}>
                    {label}
                  </button>
                ))}
              </div>
            </FieldRow>
          </Bloc>
        </div>
      )}

      {/* ── Étape 2 : Article 16 RGPD ────────────────────────────────────── */}
      {step === "article16" && (
        <div className="space-y-4">
          <SectionLabel>Article 16 — Contact des parties (RGPD)</SectionLabel>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">
              AHF — Responsable de traitement (pré-rempli)
            </p>
            <ReadonlyDisplay label="Contact DPA / RGPD" value="contact@affinityhousefactory.com" />
            <ReadonlyDisplay label="Adresse" value="28 Chemin de Sabalce OEV, 64100 Bayonne" />
            <ReadonlyDisplay label="Notifications violations" value="contact@affinityhousefactory.com — délai 48h" />
          </div>

          <div className="space-y-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-500">
              Mandataire partenaire — Sous-traitant (à compléter)
            </p>
            <FieldRow label="Contact DPA / RGPD — Prénom Nom *">
              <input type="text" value={data.dpa_nom_prenom}
                onChange={(e) => set("dpa_nom_prenom", e.target.value)}
                placeholder="Prénom Nom" className={inputCls} />
            </FieldRow>
            <FieldRow label="Email professionnel *">
              <input type="email" value={data.dpa_email}
                onChange={(e) => set("dpa_email", e.target.value)}
                placeholder="vous@exemple.fr" className={inputCls} />
            </FieldRow>
            <FieldRow label="Email de notifications violations (délai 48h)">
              <input type="email" value={data.dpa_email_violations}
                onChange={(e) => set("dpa_email_violations", e.target.value)}
                placeholder="violations@exemple.fr" className={inputCls} />
              <p className="mt-1 text-xs text-gray-400">Par défaut identique à l'email professionnel.</p>
            </FieldRow>
          </div>
        </div>
      )}

      {/* ── Étape 3 : Signature ───────────────────────────────────────────── */}
      {step === "signature" && (
        <div className="space-y-4">
          <SectionLabel>Signature — Section Signatures du contrat</SectionLabel>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">AHF — Pré-signé</p>
            <ReadonlyDisplay label="Signataire AHF" value="Albert Puigbo — Directeur Général" />
            <ReadonlyDisplay label="Fait à" value="Bayonne" />
          </div>

          <div className="space-y-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-500">
              Pour le Mandataire partenaire
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Prénom *">
                <input type="text" value={data.signature_prenom}
                  onChange={(e) => set("signature_prenom", e.target.value)} className={inputCls} />
              </FieldRow>
              <FieldRow label="Nom *">
                <input type="text" value={data.signature_nom}
                  onChange={(e) => set("signature_nom", e.target.value)} className={inputCls} />
              </FieldRow>
            </div>
            <FieldRow label="Qualité">
              <input type="text" value={data.signature_qualite}
                onChange={(e) => set("signature_qualite", e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="Date">
              <input type="text" value={data.signature_date} readOnly className={cn(inputCls, "bg-gray-50 text-gray-500")} />
            </FieldRow>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Signature manuscrite *</label>
              <div className="relative">
                <canvas ref={canvasRef} width={600} height={160}
                  className="w-full cursor-crosshair rounded-xl border-2 border-dashed border-gray-300 bg-white touch-none"
                  style={{ touchAction: "none" }}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
                {!data.signature_data_url && (
                  <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-300">
                    Signez ici avec votre souris ou votre doigt
                  </p>
                )}
              </div>
              <button type="button" onClick={clearCanvas} className="text-xs text-gray-400 underline hover:text-gray-600">
                Effacer la signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Étape 4 : Récapitulatif ───────────────────────────────────────── */}
      {step === "review" && (
        <div className="space-y-4">
          <SectionLabel>Récapitulatif — Vérifiez avant de confirmer</SectionLabel>

          <ReviewSection title="Identité &amp; Contact">
            <ReviewRow label="Prénom / Nom" value={`${data.prenom} ${data.nom}`} />
            {data.tel && <ReviewRow label="Téléphone" value={data.tel} />}
            <ReviewRow label="Email" value={data.email} />
          </ReviewSection>

          <ReviewSection title="Statut professionnel">
            <ReviewRow label="Statut" value={data.statut_professionnel} />
            <ReviewRow label="Type d'activité" value={data.reseau_type} />
          </ReviewSection>

          <ReviewSection title="Entreprise &amp; Carte T">
            <ReviewRow label="Nom / Raison sociale" value={data.nom_raison_sociale} />
            <ReviewRow label="Forme juridique" value={data.forme_juridique} />
            <ReviewRow label="SIRET" value={data.siret} />
            {data.adresse && <ReviewRow label="Adresse siège" value={data.adresse} />}
            {data.immatriculation_rsac && <ReviewRow label="RSAC" value={data.immatriculation_rsac} />}
            <ReviewRow label="Réseau carte T" value={data.reseau_carte_t} />
            <ReviewRow label="Carte T n°" value={data.carte_t_numero} />
          </ReviewSection>

          <ReviewSection title="Adresse principale">
            <ReviewRow label="Adresse" value={data.adresse_principale} />
            {data.cp_principal && <ReviewRow label="CP" value={data.cp_principal} />}
            {data.ville_principale && <ReviewRow label="Ville" value={data.ville_principale} />}
          </ReviewSection>

          <ReviewSection title="Profil d'intervention">
            <ReviewRow label="Rayon" value={RAYONS.find((r) => r.value === data.rayon_intervention)?.label ?? data.rayon_intervention} />
            <ReviewRow label="Délai rappel" value={DELAIS.find((d) => d.value === data.delai_rappel)?.label ?? data.delai_rappel} />
            {data.specialites.length > 0 && (
              <ReviewRow
                label="Spécialités"
                value={data.specialites.map((s) => SPECIALITES_OPTIONS.find((o) => o.value === s)?.label ?? s).join(", ")}
              />
            )}
          </ReviewSection>

          <ReviewSection title="Contact RGPD (Article 16)">
            <ReviewRow label="Contact DPA" value={data.dpa_nom_prenom} />
            <ReviewRow label="Email DPA" value={data.dpa_email} />
            <ReviewRow label="Email violations" value={data.dpa_email_violations || data.dpa_email} />
          </ReviewSection>

          <ReviewSection title="Signature">
            <ReviewRow label="Signataire" value={`${data.signature_prenom} ${data.signature_nom}`} />
            <ReviewRow label="Qualité" value={data.signature_qualite} />
            <ReviewRow label="Date" value={data.signature_date} />
            {data.signature_data_url && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.signature_data_url} alt="Aperçu signature" className="h-16 rounded border border-gray-200 bg-white" />
              </div>
            )}
          </ReviewSection>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            <p className="font-semibold">Avant de confirmer</p>
            <p className="mt-1 text-orange-700">
              En cliquant sur « Confirmer et signer », vous acceptez le contrat-cadre de sous-traitance AHF dans son intégralité.
              Cette signature électronique a valeur contractuelle (article 12).
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        {step !== "fields" ? (
          <button type="button" onClick={prev}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors">
            Retour
          </button>
        ) : <div />}

        {step !== "review" ? (
          <button type="button" onClick={next} disabled={!canProceed()}
            className={cn(
              "rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors",
              canProceed() ? "bg-[#7469F4] text-white hover:bg-[#5a54d4]" : "cursor-not-allowed bg-gray-100 text-gray-400",
            )}>
            Suivant
          </button>
        ) : (
          <button type="button" onClick={() => onComplete(data)}
            className="rounded-xl bg-[#7469F4] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5a54d4] transition-colors">
            Confirmer et signer
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">Contrat · {children}</p>
    </div>
  );
}

function Bloc({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400" dangerouslySetInnerHTML={{ __html: title }} />
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function ReadonlyInput({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-500">{label}</label>
      <div className={cn(inputCls, "bg-gray-50 text-gray-500")}>{value || "—"}</div>
    </div>
  );
}

function ReadonlyDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-700 text-right">{value}</span>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 space-y-2">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400" dangerouslySetInnerHTML={{ __html: title }} />
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800 text-right font-medium">{value}</span>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7469F4] focus:outline-none focus:ring-2 focus:ring-[#7469F4]/20 transition-colors";
