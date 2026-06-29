"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/cn";

export type ContratData = {
  // Page 1 — Sous-traitant
  nom_raison_sociale: string;
  forme_juridique: string;
  siret: string;
  adresse: string;
  immatriculation_rsac: string;
  reseau_carte_t: string;
  carte_t_numero: string;
  email: string;
  qualite: string;
  // Article 16 — Contact DPA Mandataire
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
  { id: "fields", label: "Identification" },
  { id: "article16", label: "Contact RGPD" },
  { id: "signature", label: "Signature" },
  { id: "review", label: "Récapitulatif" },
];

const FORMES_JURIDIQUES = [
  "Micro-entrepreneur",
  "EI — Entreprise Individuelle",
  "EURL",
  "SASU",
  "SARL",
  "SAS",
  "Autre",
];

type Props = {
  onComplete: (data: ContratData) => void;
  className?: string;
};

export function ContratCanvas({ onComplete, className }: Props) {
  const [step, setStep] = useState<Step>("fields");
  const [data, setData] = useState<ContratData>({
    nom_raison_sociale: "",
    forme_juridique: "",
    siret: "",
    adresse: "",
    immatriculation_rsac: "",
    reseau_carte_t: "",
    carte_t_numero: "",
    email: "",
    qualite: "Sous-traitant — Mandataire immobilier partenaire",
    dpa_nom_prenom: "",
    dpa_email: "",
    dpa_email_violations: "",
    signature_nom: "",
    signature_prenom: "",
    signature_qualite: "Mandataire partenaire",
    signature_date: new Date().toLocaleDateString("fr-FR"),
    signature_data_url: "",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const set = (field: keyof ContratData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  // Sync email DPA avec email principal par défaut
  useEffect(() => {
    if (!data.dpa_email && data.email) {
      set("dpa_email", data.email);
      set("dpa_email_violations", data.email);
    }
  }, [data.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const canProceed = (): boolean => {
    if (step === "fields") {
      return !!(
        data.nom_raison_sociale &&
        data.forme_juridique &&
        data.siret &&
        data.adresse &&
        data.email
      );
    }
    if (step === "article16") {
      return !!(data.dpa_nom_prenom && data.dpa_email);
    }
    if (step === "signature") {
      return !!(data.signature_nom && data.signature_prenom && data.signature_data_url);
    }
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

  // Canvas drawing
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
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
    ctx.strokeStyle = "#1a1a18";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    e.preventDefault();
  }, []);

  const endDraw = useCallback(() => {
    drawing.current = false;
    lastPos.current = null;
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      set("signature_data_url", dataUrl);
    }
  }, []);

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
            <span
              className={cn(
                "hidden text-xs sm:inline",
                s.id === step ? "font-medium text-gray-900" : "text-gray-400",
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step: Identification (Page 1 du contrat) */}
      {step === "fields" && (
        <div className="space-y-4">
          <SectionLabel>Page 1 — Identification du Mandataire (Sous-traitant)</SectionLabel>

          <FieldRow label="Nom / Raison sociale *">
            <input
              type="text"
              value={data.nom_raison_sociale}
              onChange={(e) => set("nom_raison_sociale", e.target.value)}
              placeholder="Ex : LABRADOR Immobilier ou Jean LABRADOR"
              className={inputCls}
            />
          </FieldRow>

          <FieldRow label="Forme juridique *">
            <select
              value={data.forme_juridique}
              onChange={(e) => set("forme_juridique", e.target.value)}
              className={inputCls}
            >
              <option value="">Sélectionner…</option>
              {FORMES_JURIDIQUES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="SIRET *">
            <input
              type="text"
              value={data.siret}
              onChange={(e) => set("siret", e.target.value.replace(/\D/g, "").slice(0, 14))}
              placeholder="14 chiffres"
              maxLength={17}
              className={inputCls}
            />
          </FieldRow>

          <FieldRow label="Adresse complète *">
            <input
              type="text"
              value={data.adresse}
              onChange={(e) => set("adresse", e.target.value)}
              placeholder="N° voie, code postal, commune"
              className={inputCls}
            />
          </FieldRow>

          <FieldRow label="Immatriculation RSAC (N° Greffe)">
            <input
              type="text"
              value={data.immatriculation_rsac}
              onChange={(e) => set("immatriculation_rsac", e.target.value)}
              placeholder="Ex : Greffe de Bayonne N° 12345"
              className={inputCls}
            />
          </FieldRow>

          <FieldRow label="Nom du Réseau carte T">
            <input
              type="text"
              value={data.reseau_carte_t}
              onChange={(e) => set("reseau_carte_t", e.target.value)}
              placeholder="Ex : IAD, SAFTI, Optimhome, indépendant…"
              className={inputCls}
            />
          </FieldRow>

          <FieldRow label="Carte professionnelle T">
            <input
              type="text"
              value={data.carte_t_numero}
              onChange={(e) => set("carte_t_numero", e.target.value)}
              placeholder="CCI de … n° …"
              className={inputCls}
            />
          </FieldRow>

          <FieldRow label="Email professionnel *">
            <input
              type="email"
              value={data.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="vous@exemple.fr"
              className={inputCls}
            />
          </FieldRow>

          <FieldRow label="Qualité dans ce contrat">
            <input
              type="text"
              value={data.qualite}
              readOnly
              className={cn(inputCls, "bg-gray-50 text-gray-500")}
            />
          </FieldRow>
        </div>
      )}

      {/* Step: Article 16 — Contact des parties */}
      {step === "article16" && (
        <div className="space-y-4">
          <SectionLabel>Article 16 — Contact des parties (RGPD)</SectionLabel>

          {/* AHF — pré-rempli lecture seule */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">
              AHF — Responsable de traitement (pré-rempli)
            </p>
            <ReadonlyField label="Contact DPA / RGPD" value="contact@affinityhousefactory.com" />
            <ReadonlyField label="Adresse" value="28 Chemin de Sabalce OEV, 64100 Bayonne" />
            <ReadonlyField label="Notifications violations" value="contact@affinityhousefactory.com — délai 48h" />
          </div>

          {/* Mandataire — à compléter */}
          <div className="space-y-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-500">
              Mandataire partenaire — Sous-traitant (à compléter)
            </p>

            <FieldRow label="Contact DPA / RGPD — Prénom Nom *">
              <input
                type="text"
                value={data.dpa_nom_prenom}
                onChange={(e) => set("dpa_nom_prenom", e.target.value)}
                placeholder="Prénom Nom"
                className={inputCls}
              />
            </FieldRow>

            <FieldRow label="Email professionnel *">
              <input
                type="email"
                value={data.dpa_email}
                onChange={(e) => set("dpa_email", e.target.value)}
                placeholder="vous@exemple.fr"
                className={inputCls}
              />
            </FieldRow>

            <FieldRow label="Email de notifications violations (délai 48h)">
              <input
                type="email"
                value={data.dpa_email_violations}
                onChange={(e) => set("dpa_email_violations", e.target.value)}
                placeholder="violations@exemple.fr"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-gray-400">
                Par défaut identique à l'email professionnel. Peut être un alias ou une adresse dédiée.
              </p>
            </FieldRow>
          </div>
        </div>
      )}

      {/* Step: Signature */}
      {step === "signature" && (
        <div className="space-y-4">
          <SectionLabel>Signature — Section Signatures du contrat</SectionLabel>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">
              AHF — Pré-signé
            </p>
            <ReadonlyField label="Signataire AHF" value="Albert Puigbo — Directeur Général" />
            <ReadonlyField label="Fait à" value="Bayonne" />
          </div>

          <div className="space-y-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-500">
              Pour le Mandataire partenaire
            </p>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Prénom *">
                <input
                  type="text"
                  value={data.signature_prenom}
                  onChange={(e) => set("signature_prenom", e.target.value)}
                  className={inputCls}
                />
              </FieldRow>
              <FieldRow label="Nom *">
                <input
                  type="text"
                  value={data.signature_nom}
                  onChange={(e) => set("signature_nom", e.target.value)}
                  className={inputCls}
                />
              </FieldRow>
            </div>

            <FieldRow label="Qualité">
              <input
                type="text"
                value={data.signature_qualite}
                onChange={(e) => set("signature_qualite", e.target.value)}
                className={inputCls}
              />
            </FieldRow>

            <FieldRow label="Date">
              <input
                type="text"
                value={data.signature_date}
                readOnly
                className={cn(inputCls, "bg-gray-50 text-gray-500")}
              />
            </FieldRow>

            {/* Canvas signature */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Signature manuscrite *
              </label>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={160}
                  className="w-full cursor-crosshair rounded-xl border-2 border-dashed border-gray-300 bg-white touch-none"
                  style={{ touchAction: "none" }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
                {!data.signature_data_url && (
                  <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-300">
                    Signez ici avec votre souris ou votre doigt
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs text-gray-400 underline hover:text-gray-600"
              >
                Effacer la signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <div className="space-y-4">
          <SectionLabel>Récapitulatif — Vérifiez avant de confirmer</SectionLabel>

          <ReviewSection title="Identification">
            <ReviewRow label="Nom / Raison sociale" value={data.nom_raison_sociale} />
            <ReviewRow label="Forme juridique" value={data.forme_juridique} />
            <ReviewRow label="SIRET" value={data.siret} />
            <ReviewRow label="Adresse" value={data.adresse} />
            {data.immatriculation_rsac && <ReviewRow label="RSAC" value={data.immatriculation_rsac} />}
            {data.reseau_carte_t && <ReviewRow label="Réseau carte T" value={data.reseau_carte_t} />}
            {data.carte_t_numero && <ReviewRow label="Carte T n°" value={data.carte_t_numero} />}
            <ReviewRow label="Email" value={data.email} />
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
                <img
                  src={data.signature_data_url}
                  alt="Aperçu signature"
                  className="h-16 rounded border border-gray-200 bg-white"
                />
              </div>
            )}
          </ReviewSection>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            <p className="font-semibold">Avant de confirmer</p>
            <p className="mt-1 text-orange-700">
              En cliquant sur « Confirmer et signer », vous acceptez le contrat-cadre de sous-traitance AHF
              dans son intégralité. Cette signature électronique a valeur contractuelle (article 12).
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        {step !== "fields" ? (
          <button
            type="button"
            onClick={prev}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
          >
            Retour
          </button>
        ) : (
          <div />
        )}

        {step !== "review" ? (
          <button
            type="button"
            onClick={next}
            disabled={!canProceed()}
            className={cn(
              "rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors",
              canProceed()
                ? "bg-[#7469F4] text-white hover:bg-[#5a54d4]"
                : "cursor-not-allowed bg-gray-100 text-gray-400",
            )}
          >
            Suivant
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onComplete(data)}
            className="rounded-xl bg-[#7469F4] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5a54d4] transition-colors"
          >
            Confirmer et signer
          </button>
        )}
      </div>
    </div>
  );
}

// Sub-components

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
        Contrat · {children}
      </p>
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

function ReadonlyField({ label, value }: { label: string; value: string }) {
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
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400">{title}</p>
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
