"use client";

/**
 * Journal d'appels et de notes — ADR-035 §3.
 *
 * Une timeline unique pour les appels entrants, sortants et les notes libres :
 * les séparer obligerait à lire deux colonnes pour reconstituer une relation.
 *
 * Le bouton « Appeler » ouvre le lien `tel:` **et** pré-ouvre la fiche d'appel.
 * Rien n'est enregistré tant que le conseiller ne valide pas — un journal qui
 * se remplit tout seul se remplit d'appels qui n'ont pas eu lieu, et perd toute
 * valeur de preuve.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import {
  CONSEILLERS,
  ISSUES_APPEL,
  SENS_APPEL,
  STATUTS_COMMERCIAUX,
  dateHeureFr,
  issueAppel,
  type IssueAppel,
  type SensAppel,
} from "@/lib/crm";

type Appel = {
  id: string;
  sens: SensAppel;
  issue: string | null;
  note: string | null;
  duree_min: number | null;
  auteur: string | null;
  prochain_rappel_at: string | null;
  occurred_at: string;
  created_at: string;
};

/** `datetime-local` attend une heure locale sans fuseau, pas un ISO UTC. */
function versChampLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function versIso(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const vide = (auteur: string) => ({
  sens: "sortant" as SensAppel,
  issue: "" as IssueAppel | "",
  note: "",
  duree_min: "",
  auteur,
  occurred_at: versChampLocal(new Date()),
  prochain_rappel_at: "",
  statut_commercial: "",
});

export default function LeadAppels({
  leadId,
  tel,
  responsable,
  statutCommercialActuel,
}: {
  leadId: string;
  tel: string | null;
  responsable: string | null;
  statutCommercialActuel: string | null;
}) {
  const router = useRouter();
  const [appels, setAppels] = useState<Appel[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ouvert, setOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [form, setForm] = useState(() => vide(responsable ?? CONSEILLERS[0] ?? ""));

  // Aucun `setState` avant le premier `await` : l'état de chargement est déjà
  // `true` à l'initialisation, et le poser à nouveau en tête d'effet
  // déclencherait un rendu en cascade pour rien.
  const charger = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/appels`);
      if (res.ok) setAppels((await res.json()) as Appel[]);
    } finally {
      setChargement(false);
    }
  }, [leadId]);

  useEffect(() => { charger(); }, [charger]);

  function ouvrirSaisie(sens: SensAppel) {
    setForm({ ...vide(responsable ?? CONSEILLERS[0] ?? ""), sens });
    setErreur(null);
    setOuvert(true);
  }

  /** Le lien `tel:` part, la fiche d'appel s'ouvre — la validation reste manuelle. */
  function appeler() {
    if (tel) window.location.href = `tel:${tel.replace(/[^\d+]/g, "")}`;
    ouvrirSaisie("sortant");
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!form.note.trim() && !form.issue) {
      setErreur("Renseigner au moins une issue ou une note.");
      return;
    }
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/appels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sens: form.sens,
          issue: form.issue || null,
          note: form.note.trim() || null,
          duree_min: form.duree_min || null,
          auteur: form.auteur || null,
          occurred_at: versIso(form.occurred_at),
          // Clé toujours présente : une valeur vide EFFACE l'échéance courante
          // du lead, ce qui est le comportement voulu après un appel abouti.
          prochain_rappel_at: versIso(form.prochain_rappel_at),
          statut_commercial: form.statut_commercial || undefined,
        }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur serveur");
      }
      setOuvert(false);
      await charger();
      router.refresh();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur");
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(appelId: string) {
    if (!confirm("Supprimer cette entrée du journal ?")) return;
    const res = await fetch(`/api/admin/leads/${leadId}/appels`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appelId }),
    });
    if (res.ok) {
      setAppels((prev) => prev.filter((a) => a.id !== appelId));
      router.refresh();
    }
  }

  const champ =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]";
  const label = "mb-1 block text-xs text-white/40";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Suivi des appels &amp; notes
          </h2>
          <p className="mt-1 text-xs text-white/25">
            Chaque appel entrant ou sortant, chaque note, horodatés.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={appeler}
            disabled={!tel}
            title={tel ?? "Aucun numéro renseigné"}
            className="rounded-xl bg-[#7469F4] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            📞 Appeler
          </button>
          <button
            type="button"
            onClick={() => ouvrirSaisie("entrant")}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-[#7469F4]/50 hover:text-white"
          >
            + Journaliser
          </button>
        </div>
      </div>

      {/* ── Fiche d'appel ────────────────────────────────────────────────── */}
      {ouvert && (
        <form onSubmit={enregistrer} className="mb-4 space-y-3 rounded-xl border border-[#7469F4]/30 bg-[#7469F4]/5 p-4">
          <div className="flex gap-2">
            {SENS_APPEL.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, sens: s.id, issue: s.id === "note" ? "" : f.issue }))}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                  form.sens === s.id
                    ? "border-[#7469F4] bg-[#7469F4]/20 text-[#7469F4]"
                    : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
                )}
              >
                {s.icone} {s.label}
              </button>
            ))}
          </div>

          {form.sens !== "note" && (
            <div>
              <label className={label}>Issue</label>
              <div className="flex flex-wrap gap-1.5">
                {ISSUES_APPEL.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, issue: f.issue === i.id ? "" : i.id }))}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity",
                      form.issue === i.id ? i.badge : "bg-white/5 text-white/30 hover:bg-white/10",
                    )}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={label}>Note</label>
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Ce qui s'est dit, objections, points à préparer…"
              className={`${champ} placeholder:text-white/20`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Date de l&apos;appel</label>
              <input
                type="datetime-local"
                value={form.occurred_at}
                onChange={(e) => setForm((f) => ({ ...f, occurred_at: e.target.value }))}
                className={champ}
              />
            </div>
            <div>
              <label className={label}>Durée (min)</label>
              <input
                type="number"
                min={0}
                value={form.duree_min}
                onChange={(e) => setForm((f) => ({ ...f, duree_min: e.target.value }))}
                className={champ}
              />
            </div>
            <div>
              <label className={label}>Auteur</label>
              <select
                value={form.auteur}
                onChange={(e) => setForm((f) => ({ ...f, auteur: e.target.value }))}
                className={champ}
              >
                <option value="">—</option>
                {[...new Set([...CONSEILLERS, form.auteur].filter(Boolean))].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Prochain rappel</label>
              <input
                type="datetime-local"
                value={form.prochain_rappel_at}
                onChange={(e) => setForm((f) => ({ ...f, prochain_rappel_at: e.target.value }))}
                className={champ}
              />
            </div>
          </div>

          <div>
            <label className={label}>Faire évoluer le statut commercial</label>
            <select
              value={form.statut_commercial}
              onChange={(e) => setForm((f) => ({ ...f, statut_commercial: e.target.value }))}
              className={champ}
            >
              <option value="">
                Inchangé — {STATUTS_COMMERCIAUX.find((s) => s.id === (statutCommercialActuel ?? "nouveau"))?.label}
              </option>
              {STATUTS_COMMERCIAUX.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {erreur && <p className="text-xs text-red-400">{erreur}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={envoi}
              className="rounded-xl bg-[#7469F4] px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
            >
              {envoi ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="rounded-xl px-4 py-2 text-xs text-white/40 hover:bg-white/5 hover:text-white"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      {chargement ? (
        <p className="text-sm text-white/20">Chargement…</p>
      ) : appels.length === 0 ? (
        <p className="text-sm text-white/20">Aucun échange journalisé.</p>
      ) : (
        <ol className="relative space-y-3 border-l border-white/10 pl-4">
          {appels.map((a) => {
            const sens = SENS_APPEL.find((s) => s.id === a.sens) ?? SENS_APPEL[0];
            const iss = issueAppel(a.issue);
            return (
              <li key={a.id} className="relative">
                <span className="absolute -left-[21px] top-2 h-2 w-2 rounded-full bg-white/25" />
                <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-white/70">
                      {sens.icone} {sens.label}
                    </span>
                    {iss && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${iss.badge}`}>
                        {iss.label}
                      </span>
                    )}
                    {a.duree_min != null && (
                      <span className="text-[11px] text-white/30">{a.duree_min} min</span>
                    )}
                    <span className="ml-auto text-[11px] text-white/25">{dateHeureFr(a.occurred_at)}</span>
                    <button
                      onClick={() => supprimer(a.id)}
                      title="Supprimer"
                      className="rounded px-1 text-[11px] text-white/15 transition-colors hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>

                  {a.note && (
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-white/70">{a.note}</p>
                  )}

                  <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-white/25">
                    {a.auteur && <span>par {a.auteur}</span>}
                    {a.prochain_rappel_at && <span>rappel planifié : {dateHeureFr(a.prochain_rappel_at)}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
