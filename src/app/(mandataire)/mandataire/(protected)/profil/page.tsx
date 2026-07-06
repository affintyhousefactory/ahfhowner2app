"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/shared/lib/supabase-browser";

type ProfilData = {
  prenom: string | null;
  nom: string | null;
  email: string | null;
  tel: string | null;
  siret: string | null;
  forme_juridique: string | null;
  adresse: string | null;
  reseau_carte_t: string | null;
  carte_t_numero: string | null;
  statut_professionnel: string | null;
  reseau_type: string | null;
  adresse_principale: string | null;
  cp_principal: string | null;
  ville_principale: string | null;
  rayon_intervention: string | null;
  delai_rappel: string | null;
  specialites: string | null;
  contrat_url: string | null;
  contrat_signe_at: string | null;
  zone_intervention: string | null;
};

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const [token, setToken] = useState("");

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    tel: "",
    adresse_principale: "",
    cp_principal: "",
    ville_principale: "",
    rayon_intervention: "",
    forme_juridique: "",
    siret: "",
    statut_professionnel: "",
    reseau_carte_t: "",
    carte_t_numero: "",
  });

  const [email, setEmail] = useState("");
  const [contratUrl, setContratUrl] = useState<string | null>(null);
  const [contratSigneAt, setContratSigneAt] = useState<string | null>(null);

  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setToken(session.access_token);

      const res = await fetch("/api/mandataire/profil", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data: ProfilData = await res.json();
        setEmail(data.email ?? "");
        setContratUrl(data.contrat_url ?? null);
        setContratSigneAt(data.contrat_signe_at ?? null);
        setForm({
          prenom: data.prenom ?? "",
          nom: data.nom ?? "",
          tel: data.tel ?? "",
          adresse_principale: data.adresse_principale ?? "",
          cp_principal: data.cp_principal ?? "",
          ville_principale: data.ville_principale ?? "",
          rayon_intervention: data.rayon_intervention ?? "",
          forme_juridique: data.forme_juridique ?? "",
          siret: data.siret ?? "",
          statut_professionnel: data.statut_professionnel ?? "",
          reseau_carte_t: data.reseau_carte_t ?? "",
          carte_t_numero: data.carte_t_numero ?? "",
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    setSaveError("");

    const res = await fetch("/api/mandataire/profil", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setSaveError(data.error ?? "Erreur lors de la sauvegarde");
      return;
    }
    setSaveMsg("Profil enregistré.");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdError("");

    if (newPwd.length < 8) {
      setPwdError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Les mots de passe ne correspondent pas.");
      return;
    }

    setPwdLoading(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdLoading(false);

    if (error) {
      setPwdError(error.message);
      return;
    }
    setPwdMsg("Mot de passe mis à jour.");
    setNewPwd("");
    setConfirmPwd("");
    setTimeout(() => setPwdMsg(""), 4000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7469F4] border-t-transparent" />
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#7469F4] focus:outline-none";
  const labelCls = "mb-1 block text-sm font-medium text-gray-700";
  const cardCls = "bg-white border border-gray-200 rounded-xl p-6";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7469F4]/70">
          Portail Mandataire
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Mon Profil</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1 — Informations personnelles */}
        <section className={cardCls}>
          <h2 className="mb-4 font-semibold text-gray-900">Informations personnelles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Prénom</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => set("prenom", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Nom</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => set("nom", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Téléphone</label>
              <input
                type="tel"
                value={form.tel}
                onChange={(e) => set("tel", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email (non modifiable)</label>
              <input
                type="email"
                value={email}
                readOnly
                className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
              />
            </div>
          </div>
        </section>

        {/* Section 2 — Adresse & Zone d'intervention */}
        <section className={cardCls}>
          <h2 className="mb-4 font-semibold text-gray-900">Adresse & Zone d&apos;intervention</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Adresse principale</label>
              <input
                type="text"
                value={form.adresse_principale}
                onChange={(e) => set("adresse_principale", e.target.value)}
                placeholder="N° et rue"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Code postal</label>
              <input
                type="text"
                value={form.cp_principal}
                onChange={(e) => set("cp_principal", e.target.value)}
                placeholder="Ex : 33000"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Ville</label>
              <input
                type="text"
                value={form.ville_principale}
                onChange={(e) => set("ville_principale", e.target.value)}
                placeholder="Ex : Bordeaux"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Rayon d&apos;intervention</label>
              <select
                value={form.rayon_intervention}
                onChange={(e) => set("rayon_intervention", e.target.value)}
                className={inputCls}
              >
                <option value="">— Sélectionner —</option>
                <option value="20km">20 km</option>
                <option value="50km">50 km</option>
                <option value="80km">80 km</option>
                <option value="département">Département</option>
                <option value="région">Région</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 3 — Informations professionnelles */}
        <section className={cardCls}>
          <h2 className="mb-4 font-semibold text-gray-900">Informations professionnelles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Forme juridique</label>
              <select
                value={form.forme_juridique}
                onChange={(e) => set("forme_juridique", e.target.value)}
                className={inputCls}
              >
                <option value="">— Sélectionner —</option>
                <option value="EI">EI</option>
                <option value="EIRL">EIRL</option>
                <option value="EURL">EURL</option>
                <option value="SARL">SARL</option>
                <option value="SAS">SAS</option>
                <option value="SASU">SASU</option>
                <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>SIRET</label>
              <input
                type="text"
                value={form.siret}
                onChange={(e) => set("siret", e.target.value)}
                placeholder="14 chiffres"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Statut professionnel</label>
              <input
                type="text"
                value={form.statut_professionnel}
                onChange={(e) => set("statut_professionnel", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Réseau / Carte T</label>
              <input
                type="text"
                value={form.reseau_carte_t}
                onChange={(e) => set("reseau_carte_t", e.target.value)}
                placeholder="Ex : FNAIM, indépendant..."
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>N° Carte T</label>
              <input
                type="text"
                value={form.carte_t_numero}
                onChange={(e) => set("carte_t_numero", e.target.value)}
                placeholder="Ex : CPI 33012023000123"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {saveMsg && (
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {saveMsg}
          </p>
        )}
        {saveError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {saveError}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#7469F4] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5a54d4] disabled:opacity-50 transition-colors"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>

      {/* Section 4 — Contrat cadre signé */}
      <section className={cardCls}>
        <h2 className="mb-4 font-semibold text-gray-900">Contrat cadre signé</h2>
        {contratSigneAt ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Contrat signé le{" "}
              <span className="font-medium">
                {new Date(contratSigneAt).toLocaleDateString("fr-FR")}
              </span>
            </p>
            {contratUrl && (
              <a
                href={contratUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#7469F4]/30 px-4 py-2 text-sm font-medium text-[#7469F4] transition-colors hover:bg-[#7469F4]/5"
              >
                Télécharger mon contrat
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Aucun contrat signé. Rendez-vous sur la page{" "}
            <a href="/mandataire/contrat" className="text-[#7469F4] hover:underline">
              Contrat
            </a>
            .
          </p>
        )}
      </section>

      {/* Section 5 — Changer le mot de passe */}
      <section className={cardCls}>
        <h2 className="mb-4 font-semibold text-gray-900">Changer le mot de passe</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Nouveau mot de passe</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                minLength={8}
                placeholder="8 caractères minimum"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Répéter le mot de passe"
                className={inputCls}
              />
            </div>
          </div>

          {pwdMsg && (
            <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
              {pwdMsg}
            </p>
          )}
          {pwdError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {pwdError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwdLoading}
              className="rounded-xl border border-[#7469F4]/30 px-5 py-2 text-sm font-medium text-[#7469F4] hover:bg-[#7469F4]/5 disabled:opacity-50 transition-colors"
            >
              {pwdLoading ? "Mise à jour…" : "Changer le mot de passe"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
