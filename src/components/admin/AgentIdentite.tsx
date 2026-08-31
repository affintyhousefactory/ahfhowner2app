"use client";

/**
 * Identité et suivi d'un agent partenaire — lecture, puis édition (ADR-044 §9).
 *
 * Le même formulaire sert à créer et à corriger : ce sont les mêmes champs, et
 * les tenir en double aurait produit deux listes qui divergent — le défaut
 * qu'ADR-035 §7 a corrigé sur les statuts.
 *
 * ⚠ **Le statut de partenariat ne se change pas ici.** Il vit dans le Kanban et
 * dans la fiche d'appel, deux endroits qui annoncent ses effets de bord — dont
 * la désinscription Brevo, irréversible depuis nos écrans. Un menu déroulant
 * noyé dans un formulaire d'identité ne les annoncerait pas.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONSEILLERS } from "@/lib/crm";
import { emailMalForme, sirenValide } from "@/shared/lib/validation";

export type AgentFiche = {
  id?: string;
  agence: string;
  prenom: string | null;
  nom: string | null;
  fonction: string | null;
  email: string;
  tel: string | null;
  tel_fixe: string | null;
  adresse: string | null;
  code_postal: string | null;
  commune: string | null;
  departement: string | null;
  siren: string | null;
  siret: string | null;
  naf: string | null;
  site_web: string | null;
  linkedin: string | null;
  responsable: string | null;
  prochain_rappel_at: string | null;
  notes: string | null;
  source_contact?: string | null;
  url_source?: string | null;
};

const VIDE: AgentFiche = {
  agence: "", prenom: "", nom: "", fonction: "", email: "", tel: "", tel_fixe: "",
  adresse: "", code_postal: "", commune: "", departement: "",
  siren: "", siret: "", naf: "68.31Z", site_web: "", linkedin: "",
  responsable: "", prochain_rappel_at: "", notes: "",
};

/** `datetime-local` attend une heure locale sans fuseau, pas un ISO UTC. */
function versChampLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function AgentIdentite({ agent }: { agent?: AgentFiche }) {
  const router = useRouter();
  const creation = !agent?.id;
  const [edition, setEdition] = useState(creation);
  const [form, setForm] = useState<AgentFiche>(() => ({
    ...VIDE,
    ...(agent ?? {}),
    prochain_rappel_at: versChampLocal(agent?.prochain_rappel_at ?? null),
  }));
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function set<K extends keyof AgentFiche>(k: K, v: AgentFiche[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agence.trim()) return setErreur("Le nom de l'agence est obligatoire.");
    if (!form.email.trim()) {
      return setErreur("L'email est obligatoire — c'est lui qui rattache la fiche à Brevo.");
    }
    if (emailMalForme(form.email)) return setErreur("Email mal formé.");
    /* Le SIREN est facultatif ; s'il est saisi, il doit être juste — un SIREN
       faux est pire qu'absent, il fait croire à un rapprochement possible. */
    if (form.siren && !sirenValide(form.siren)) return setErreur("SIREN invalide (9 chiffres, clé de Luhn).");

    setEnvoi(true);
    setErreur(null);
    try {
      const corps = {
        ...form,
        prochain_rappel_at: form.prochain_rappel_at
          ? new Date(form.prochain_rappel_at).toISOString()
          : null,
      };
      const res = await fetch(
        creation ? "/api/admin/agents" : `/api/admin/agents/${agent!.id}`,
        {
          method: creation ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corps),
        },
      );
      const body = (await res.json()) as { agent?: { id: string }; error?: string; agentExistant?: string };
      if (!res.ok) {
        if (body.agentExistant) {
          router.push(`/admin/agents/${body.agentExistant}`);
          return;
        }
        throw new Error(body.error ?? "Enregistrement refusé");
      }
      if (creation && body.agent?.id) {
        router.push(`/admin/agents/${body.agent.id}`);
        return;
      }
      setEdition(false);
      router.refresh();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur");
    } finally {
      setEnvoi(false);
    }
  }

  const champ =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4] [color-scheme:dark]";
  const label = "mb-1 block text-xs text-white/40";

  if (!edition && agent) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Identité &amp; suivi
          </h2>
          <button
            type="button"
            onClick={() => setEdition(true)}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-[#7469F4]/50 hover:text-white"
          >
            Modifier
          </button>
        </div>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Ligne t="Agence" v={agent.agence} />
          <Ligne t="Contact" v={`${agent.prenom ?? ""} ${agent.nom ?? ""}`.trim() || null} />
          <Ligne t="Fonction" v={agent.fonction} />
          <Ligne t="Email" v={agent.email} />
          <Ligne t="Ligne fixe" v={agent.tel_fixe} />
          <Ligne t="Mobile" v={agent.tel} />
          <Ligne t="Adresse" v={agent.adresse} />
          <Ligne t="Commune" v={[agent.code_postal, agent.commune].filter(Boolean).join(" ") || null} />
          <Ligne t="Département" v={agent.departement} />
          <Ligne t="SIREN" v={agent.siren} />
          <Ligne t="SIRET" v={agent.siret} />
          <Ligne t="Code NAF" v={agent.naf} />
          <Ligne t="Site web" v={agent.site_web} lien />
          <Ligne t="LinkedIn" v={agent.linkedin} lien />
          <Ligne t="Conseiller" v={agent.responsable} />
          {/* D'où vient la ligne. Un an après, c'est la seule réponse à
              « pourquoi cette agence est-elle dans notre fichier ? ». */}
          <Ligne t="Origine" v={agent.source_contact} />
          <Ligne t="Page source" v={agent.url_source} lien />
        </dl>
        {agent.notes && (
          <p className="mt-4 whitespace-pre-wrap rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm text-white/70">
            {agent.notes}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={enregistrer} className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {creation ? "Nouvelle agence partenaire" : "Identité & suivi"}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label}>Agence *</label>
          <input value={form.agence} onChange={(e) => set("agence", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Prénom</label>
          <input value={form.prenom ?? ""} onChange={(e) => set("prenom", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Nom</label>
          <input value={form.nom ?? ""} onChange={(e) => set("nom", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Fonction</label>
          <input value={form.fonction ?? ""} onChange={(e) => set("fonction", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={champ}
          />
        </div>
        <div>
          <label className={label}>Ligne fixe</label>
          <input value={form.tel_fixe ?? ""} onChange={(e) => set("tel_fixe", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Mobile</label>
          <input value={form.tel ?? ""} onChange={(e) => set("tel", e.target.value)} className={champ} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Adresse</label>
          <input value={form.adresse ?? ""} onChange={(e) => set("adresse", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Code postal</label>
          <input
            value={form.code_postal ?? ""}
            onChange={(e) => {
              const cp = e.target.value;
              setForm((f) => ({
                ...f,
                code_postal: cp,
                /* Le département se déduit du code postal — deux chiffres qu'on
                   ne fait pas ressaisir. Il reste modifiable : la Corse et
                   l'outre-mer ne suivent pas cette règle. */
                departement: /^\d{2}/.test(cp) ? cp.slice(0, 2) : f.departement,
              }));
            }}
            className={champ}
          />
        </div>
        <div>
          <label className={label}>Commune</label>
          <input value={form.commune ?? ""} onChange={(e) => set("commune", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Département</label>
          <input value={form.departement ?? ""} onChange={(e) => set("departement", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Code NAF</label>
          <input value={form.naf ?? ""} onChange={(e) => set("naf", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>SIREN</label>
          <input value={form.siren ?? ""} onChange={(e) => set("siren", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>SIRET</label>
          <input value={form.siret ?? ""} onChange={(e) => set("siret", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Site web</label>
          <input value={form.site_web ?? ""} onChange={(e) => set("site_web", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>LinkedIn</label>
          <input value={form.linkedin ?? ""} onChange={(e) => set("linkedin", e.target.value)} className={champ} />
        </div>
        <div>
          <label className={label}>Conseiller</label>
          <select
            value={form.responsable ?? ""}
            onChange={(e) => set("responsable", e.target.value)}
            className={champ}
          >
            <option value="">—</option>
            {[...new Set([...CONSEILLERS, form.responsable].filter(Boolean))].map((c) => (
              <option key={c} value={c as string}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Prochain rappel</label>
          <input
            type="datetime-local"
            value={form.prochain_rappel_at ?? ""}
            onChange={(e) => set("prochain_rappel_at", e.target.value)}
            className={champ}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Notes</label>
          <textarea
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Ce qu'il faut savoir avant de rappeler cette agence…"
            className={champ}
          />
        </div>
      </div>

      {erreur && <p className="text-sm text-red-400">{erreur}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={envoi}
          className="rounded-xl bg-[#7469F4] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {envoi ? "Enregistrement…" : creation ? "Créer la fiche" : "Enregistrer"}
        </button>
        {!creation && (
          <button
            type="button"
            onClick={() => setEdition(false)}
            className="rounded-xl px-4 py-2 text-sm text-white/40 hover:bg-white/5 hover:text-white"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

function Ligne({ t, v, lien = false }: { t: string; v: string | null | undefined; lien?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-white/30">{t}</dt>
      <dd className="text-sm text-white/75">
        {v ? (
          lien ? (
            <a
              href={v.startsWith("http") ? v : `https://${v}`}
              target="_blank"
              rel="noreferrer"
              className="truncate underline decoration-dotted underline-offset-2 hover:text-[#7469F4]"
            >
              {v}
            </a>
          ) : (
            v
          )
        ) : (
          <span className="text-white/20">—</span>
        )}
      </dd>
    </div>
  );
}
