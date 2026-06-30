"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadGooglePlacesScript } from "@/shared/lib/google-places";

interface LeadIdentite {
  id: string;
  lead_number?: number | null;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  tel: string | null;
  produit: string | null;
  source: string | null;
  statut: string | null;
  pack_terrain: string | null;
  budget_terrain: number | null;
  total_estime: number | null;
  notes_ahf: string | null;
  adresse_postale_client: string | null;
  cp_client: string | null;
  ville_client: string | null;
  delai_projet: string | null;
  description_projet: string | null;
}

const DELAIS_PROJET = [
  "Moins de 6 mois",
  "6 à 12 mois",
  "12 à 24 mois",
  "Plus de 24 mois",
  "Non défini",
];

const STATUTS = [
  "nouveau", "contacte", "devis_envoye", "signe", "annule",
  "qualifié", "affecté", "en_cours", "finalisé", "perdu",
];

export default function LeadEditIdentite({ lead }: { lead: LeadIdentite }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef    = useRef<HTMLDivElement>(null);
  const placeElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  const [form, setForm] = useState({
    prenom: lead.prenom ?? "",
    nom: lead.nom ?? "",
    email: lead.email ?? "",
    tel: lead.tel ?? "",
    produit: lead.produit ?? "",
    source: lead.source ?? "",
    statut: lead.statut ?? "nouveau",
    pack_terrain: lead.pack_terrain ?? "",
    budget_terrain: lead.budget_terrain?.toString() ?? "",
    total_estime: lead.total_estime?.toString() ?? "",
    notes_ahf: lead.notes_ahf ?? "",
    adresse_postale_client: lead.adresse_postale_client ?? "",
    cp_client: lead.cp_client ?? "",
    ville_client: lead.ville_client ?? "",
    delai_projet: lead.delai_projet ?? "",
    description_projet: lead.description_projet ?? "",
  });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

  // Init Google Places autocomplete quand on entre en mode édition
  useEffect(() => {
    if (!editing || !apiKey) return;

    loadGooglePlacesScript(apiKey).then(() => {
      if (!containerRef.current || placeElementRef.current) return;
      const element = new window.google.maps.places.PlaceAutocompleteElement({
        includedRegionCodes:  ["fr"],
        includedPrimaryTypes: ["address"],
      });
      containerRef.current.appendChild(element);
      placeElementRef.current = element;

      element.addEventListener("gmp-select", async (event) => {
        const place = event.placePrediction.toPlace();
        await place.fetchFields({ fields: ["formattedAddress", "addressComponents"] });
        let cp = ""; let ville = "";
        for (const comp of place.addressComponents ?? []) {
          if (comp.types.includes("postal_code")) cp = comp.longText ?? "";
          if (comp.types.includes("locality"))    ville = comp.longText ?? "";
        }
        setForm((prev) => ({
          ...prev,
          adresse_postale_client: place.formattedAddress ?? prev.adresse_postale_client,
          cp_client:   cp    || prev.cp_client,
          ville_client: ville || prev.ville_client,
        }));
      });
    });

    return () => {
      placeElementRef.current?.remove();
      placeElementRef.current = null;
    };
  }, [editing, apiKey]);

  const handleCancel = useCallback(() => {
    setForm({
      prenom: lead.prenom ?? "",
      nom: lead.nom ?? "",
      email: lead.email ?? "",
      tel: lead.tel ?? "",
      produit: lead.produit ?? "",
      source: lead.source ?? "",
      statut: lead.statut ?? "nouveau",
      pack_terrain: lead.pack_terrain ?? "",
      budget_terrain: lead.budget_terrain?.toString() ?? "",
      total_estime: lead.total_estime?.toString() ?? "",
      notes_ahf: lead.notes_ahf ?? "",
      adresse_postale_client: lead.adresse_postale_client ?? "",
      cp_client: lead.cp_client ?? "",
      ville_client: lead.ville_client ?? "",
      delai_projet: lead.delai_projet ?? "",
      description_projet: lead.description_projet ?? "",
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
        body: JSON.stringify({
          ...form,
          budget_terrain: form.budget_terrain ? Number(form.budget_terrain) : null,
          total_estime: form.total_estime ? Number(form.total_estime) : null,
        }),
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
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4]";
  const labelCls = "block text-xs text-white/40 mb-1";

  if (!editing) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Identité &amp; projet
            </h2>
            {lead.lead_number && (
              <span className="font-mono text-[10px] text-[#7469F4]/70">#{lead.lead_number}</span>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-3 py-1 text-xs text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            Modifier
          </button>
        </div>

        <dl className="space-y-2 text-sm">
          {([
            ["Modèle", lead.produit],
            ["Pack", lead.pack_terrain],
            ["Budget terrain", lead.budget_terrain ? `${Number(lead.budget_terrain).toLocaleString("fr-FR")} €` : null],
            ["Total estimé", lead.total_estime ? `${Number(lead.total_estime).toLocaleString("fr-FR")} €` : null],
            ["Source", lead.source],
            ["Statut", lead.statut],
            ["Délai projet", lead.delai_projet],
            ["Description", lead.description_projet],
          ] as [string, string | null][]).map(([label, value]) =>
            value ? (
              <div key={label} className="flex justify-between">
                <dt className="text-white/40">{label}</dt>
                <dd className="text-white">{value}</dd>
              </div>
            ) : null,
          )}
        </dl>

        {(lead.adresse_postale_client || lead.cp_client || lead.ville_client) && (
          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm">
            <p className="text-xs text-white/30 mb-1">Adresse client</p>
            {lead.adresse_postale_client && <p className="text-white">{lead.adresse_postale_client}</p>}
            {(lead.cp_client || lead.ville_client) && (
              <p className="text-white/60">{[lead.cp_client, lead.ville_client].filter(Boolean).join(" ")}</p>
            )}
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs text-white/40 mb-1">Notes AHF</p>
          <p className="text-sm text-white/60 whitespace-pre-wrap">
            {lead.notes_ahf || <span className="italic text-white/20">Aucune note</span>}
          </p>
        </div>
      </>
    );
  }

  // ── Mode édition ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Identité &amp; projet
        </h2>
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
      </div>

      <div className="space-y-3">
        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Prénom</label>
            <input className={inputCls} value={form.prenom} onChange={set("prenom")} />
          </div>
          <div>
            <label className={labelCls}>Nom</label>
            <input className={inputCls} value={form.nom} onChange={set("nom")} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input className={inputCls} type="email" value={form.email} onChange={set("email")} />
        </div>

        <div>
          <label className={labelCls}>Téléphone</label>
          <input className={inputCls} type="tel" value={form.tel} onChange={set("tel")} />
        </div>

        {/* Adresse postale client (Google Places) */}
        <div className="pt-1 border-t border-white/5">
          <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Adresse postale client</p>
          <div>
            <label className={labelCls}>Adresse (autocomplete)</label>
            <div ref={containerRef} className="gmap-autocomplete" />
            {form.adresse_postale_client && (
              <p className="mt-1 text-[11px] text-[#7469F4]/80">✓ {form.adresse_postale_client}</p>
            )}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Code postal</label>
              <input className={inputCls} value={form.cp_client} onChange={set("cp_client")} />
            </div>
            <div>
              <label className={labelCls}>Ville</label>
              <input className={inputCls} value={form.ville_client} onChange={set("ville_client")} />
            </div>
          </div>
        </div>

        {/* Projet */}
        <div className="pt-1 border-t border-white/5">
          <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Projet</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Modèle</label>
              <select className={inputCls} value={form.produit} onChange={set("produit")}>
                <option value="">—</option>
                <option value="Arko One">Arko One</option>
                <option value="Arko Max">Arko Max</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <select className={inputCls} value={form.statut} onChange={set("statut")}>
                {STATUTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2">
            <label className={labelCls}>Source</label>
            <input className={inputCls} value={form.source} onChange={set("source")} />
          </div>

          <div className="mt-2">
            <label className={labelCls}>Pack terrain</label>
            <input className={inputCls} value={form.pack_terrain} onChange={set("pack_terrain")} />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Budget terrain (€)</label>
              <input className={inputCls} type="number" value={form.budget_terrain} onChange={set("budget_terrain")} />
            </div>
            <div>
              <label className={labelCls}>Total estimé (€)</label>
              <input className={inputCls} type="number" value={form.total_estime} onChange={set("total_estime")} />
            </div>
          </div>
        </div>

        {/* Vue mandataire (anonymisée) */}
        <div className="pt-1 border-t border-white/5">
          <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Vue mandataire (anonymisée)</p>
          <div className="mb-2">
            <label className={labelCls}>Description du projet (vue mandataire)</label>
            <input className={inputCls} value={form.description_projet}
              onChange={set("description_projet")} placeholder="Ex: Studio indépendant dans jardin" />
          </div>
          <div>
            <label className={labelCls}>Délai envisagé</label>
            <select className={inputCls} value={form.delai_projet} onChange={set("delai_projet")}>
              <option value="">—</option>
              {DELAIS_PROJET.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes AHF</label>
          <textarea
            className={inputCls}
            rows={4}
            value={form.notes_ahf}
            onChange={set("notes_ahf")}
            placeholder="Notes internes…"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </>
  );
}
