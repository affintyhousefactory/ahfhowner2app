"use client";

/**
 * Configuration de la maison telle que le client l'a composée — ADR-035 §4.
 *
 * Les libellés ne sont pas stockés sur le lead : ils sont résolus depuis
 * `loadConfig()`, seule source des grilles (ADR-030). En édition, les prix sont
 * **recalculés depuis la grille courante**, jamais saisis à la main — sauf le
 * transport, qui dépend d'une distance que le lead ne porte pas.
 *
 * Le numéro de série est `slot`, colonne historique protégée par un index
 * unique. Son état « demandé vs confirmé » relève d'ADR-031 : tant qu'elle
 * n'est pas livrée, le numéro saisi ici n'est pas un verrou, et l'écran le dit.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import {
  loadConfig,
  optionsPourModele,
  paliersPourModele,
  prixOption,
  type ModeleId,
} from "@/lib/configurateur/config";
import { estConfigV2, eur, resoudreConfigV2, type LeadConfigV2 } from "@/lib/crm";

type LeadConfig = LeadConfigV2 & {
  id: string;
  /** Héritage v1 — conservé à l'écran pour les leads antérieurs (ADR-035). */
  config_json?: Record<string, unknown> | null;
  options_labels?: string[] | null;
  produit?: string | null;
  terrasse_m2?: number | null;
};

export default function LeadConfiguration({ lead }: { lead: LeadConfig }) {
  const router = useRouter();
  const cfg = useMemo(() => loadConfig(), []);
  const [edition, setEdition] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const [form, setForm] = useState({
    usage: lead.cfg_usage ?? "",
    quantite: String(lead.cfg_quantite ?? 1),
    modele: (lead.cfg_modele ?? "max") as ModeleId,
    ambiance: lead.cfg_ambiance ?? cfg.ambiances[0].id,
    terrasse: lead.cfg_terrasse ?? "sans",
    options: lead.cfg_options ?? [],
    transport: lead.cfg_transport != null ? String(lead.cfg_transport) : "",
    slot: lead.slot != null ? String(lead.slot) : "",
  });

  /* Les prix suivent la grille, jamais la saisie. Changer de maison purge les
     options devenues incompatibles — même règle que le parcours client. */
  const calcul = useMemo(() => {
    const modele = cfg.modeles.find((m) => m.id === form.modele) ?? cfg.modeles[0];
    const paliers = paliersPourModele(cfg, modele.id);
    const dispo = optionsPourModele(cfg, modele.id);
    const retenues = dispo.filter((o) => form.options.includes(o.id));

    const base = modele.prixBaseTtc;
    const terrasse = paliers.find((p) => p.id === form.terrasse)?.prixTtc ?? 0;
    const options = retenues.reduce((s, o) => s + prixOption(o, modele.id), 0);
    const transport = form.transport ? Number(form.transport) : 0;

    return { modele, paliers, dispo, base, terrasse, options, transport, total: base + terrasse + options + transport };
  }, [cfg, form]);

  function changerModele(m: ModeleId) {
    const dispo = optionsPourModele(cfg, m).map((o) => o.id);
    setForm((f) => ({
      ...f,
      modele: m,
      options: f.options.filter((id) => dispo.includes(id)),
      terrasse: paliersPourModele(cfg, m).some((p) => p.id === f.terrasse) ? f.terrasse : "sans",
    }));
  }

  async function enregistrer() {
    setEnvoi(true);
    setErreur(null);
    const quantite = Math.max(1, Number(form.quantite) || 1);
    const slot = form.slot ? Number(form.slot) : null;

    // L'instantané JSON conserve la grille utilisée : un lead d'aujourd'hui ne
    // doit pas se relire avec les prix de demain (ADR-035 §4).
    const config_v2 = {
      version: cfg.version,
      usage: form.usage || null,
      quantite,
      modele: form.modele,
      ambiance: form.ambiance,
      terrasse: form.terrasse,
      options: form.options,
      prix: {
        base: calcul.base,
        terrasse: calcul.terrasse,
        options: calcul.options,
        transport: form.transport ? Number(form.transport) : null,
        total: calcul.total,
      },
      slot,
      saisi_par: "admin",
    };

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config_v2,
          cfg_version: cfg.version,
          cfg_usage: form.usage || null,
          cfg_quantite: quantite,
          cfg_modele: form.modele,
          cfg_ambiance: form.ambiance,
          cfg_terrasse: form.terrasse,
          cfg_options: form.options,
          cfg_prix_base: calcul.base,
          cfg_prix_terrasse: calcul.terrasse,
          cfg_prix_options: calcul.options,
          cfg_transport: form.transport ? Number(form.transport) : null,
          cfg_total: calcul.total,
          slot,
          // Le champ texte reste alimenté : il sert les emails Brevo et la vue
          // mandataire, qui ne connaissent pas les identifiants de grille.
          produit: calcul.modele.nom,
        }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erreur serveur");
      }
      setEdition(false);
      router.refresh();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setEnvoi(false);
    }
  }

  const champ =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]";
  const label = "mb-1 block text-xs text-white/40";

  /* ── Lecture ──────────────────────────────────────────────────────────── */
  if (!edition) {
    const v2 = estConfigV2(lead);
    const c = resoudreConfigV2(lead);

    return (
      <>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Configuration
            </h2>
            <p className="mt-1 text-xs text-white/25">
              {v2 ? `Configurateur — grille ${c.versionGrille}` : "Lead antérieur au configurateur v2"}
            </p>
          </div>
          <button
            onClick={() => setEdition(true)}
            className="rounded-lg px-3 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            Modifier
          </button>
        </div>

        {c.grillePerimee && (
          <p className="mb-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-400/80">
            Configuré sur la grille <strong>{c.versionGrille}</strong> ; la grille courante est{" "}
            <strong>{c.versionCourante}</strong>. Les montants ci-dessous sont ceux enregistrés à la
            configuration — les rouvrir en édition les recalculera au tarif du jour.
          </p>
        )}

        {v2 ? (
          <>
            <dl className="space-y-2 text-sm">
              <Ligne label="Usage" valeur={c.usage?.label ?? null} />
              {c.quantite > 1 && <Ligne label="Nombre d'unités" valeur={String(c.quantite)} />}
              <Ligne
                label="Maison"
                valeur={c.modele ? `${c.modele.label} · ${c.modele.surface} m² · ${c.modele.emprise}` : null}
              />
              <Ligne
                label="Ambiance"
                valeur={c.ambiance?.label ?? null}
                pastille={c.ambiance?.teinte}
              />
              <Ligne label="Terrasse" valeur={c.terrasse?.label ?? null} />
            </dl>

            {c.options.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-white/40">Options</p>
                <ul className="space-y-1.5">
                  {c.options.map((o) => (
                    <li key={o.id} className="flex items-center justify-between text-sm">
                      <span className="text-white">
                        {o.label}
                        {o.detail && <span className="text-white/30"> — {o.detail}</span>}
                        {o.structurelle && (
                          <span className="ml-2 rounded-full bg-[#e07b28]/15 px-1.5 py-0.5 text-[10px] text-[#e07b28]">
                            structurelle
                          </span>
                        )}
                        {o.inconnu && (
                          <span className="ml-2 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30">
                            hors grille
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-white/30">{eur(o.prix)}</span>
                    </li>
                  ))}
                </ul>
                {c.optionsStructurelles.length > 0 && (
                  <p className="mt-2 text-[11px] text-white/25">
                    Les options structurelles entrent dans l&apos;étude d&apos;exécution : non ajoutables
                    après réservation.
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
              <dl className="space-y-1.5 text-sm">
                <Ligne label="Maison" valeur={eur(c.prix.base)} discret />
                <Ligne label="Terrasse" valeur={eur(c.prix.terrasse)} discret />
                <Ligne label="Options" valeur={eur(c.prix.options)} discret />
                <Ligne label="Transport" valeur={eur(c.prix.transport)} discret />
                <div className="flex justify-between border-t border-white/10 pt-1.5">
                  <dt className="text-sm font-medium text-white/60">Total TTC</dt>
                  <dd className="text-sm font-semibold text-white">{eur(c.prix.total)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/5 px-3 py-2.5">
              <div>
                <p className="text-xs text-white/40">Numéro de série demandé</p>
                <p className="mt-0.5 text-[11px] text-white/25">
                  Attribué à la signature du devis — la réservation n&apos;est pas un verrou.
                </p>
              </div>
              <span className="font-mono text-lg text-white">
                {c.numero != null ? `n° ${c.numero}` : "—"}
              </span>
            </div>
          </>
        ) : (
          <Heritage lead={lead} />
        )}
      </>
    );
  }

  /* ── Édition ──────────────────────────────────────────────────────────── */
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Configuration</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setEdition(false); setErreur(null); }}
            className="rounded-lg px-3 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            Annuler
          </button>
          <button
            onClick={enregistrer}
            disabled={envoi}
            className="rounded-lg bg-[#7469F4] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            {envoi ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className={label}>Usage</label>
          <select
            value={form.usage}
            onChange={(e) => setForm((f) => ({ ...f, usage: e.target.value }))}
            className={champ}
          >
            <option value="">—</option>
            {cfg.usages.map((u) => (
              <option key={u.id} value={u.id}>
                {u.libelle}{!u.eligible ? " (hors cadre de vente)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Maison</label>
            <select
              value={form.modele}
              onChange={(e) => changerModele(e.target.value as ModeleId)}
              className={champ}
            >
              {cfg.modeles.map((m) => (
                <option key={m.id} value={m.id}>{m.nom} — {m.surface} m²</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Nombre d&apos;unités</label>
            <input
              type="number"
              min={1}
              value={form.quantite}
              onChange={(e) => setForm((f) => ({ ...f, quantite: e.target.value }))}
              className={champ}
            />
          </div>
        </div>

        <div>
          <label className={label}>Ambiance</label>
          <div className="flex flex-wrap gap-2">
            {cfg.ambiances.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, ambiance: a.id }))}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors",
                  form.ambiance === a.id
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

        <div>
          <label className={label}>Terrasse</label>
          <select
            value={form.terrasse}
            onChange={(e) => setForm((f) => ({ ...f, terrasse: e.target.value }))}
            className={champ}
          >
            {calcul.paliers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}{p.prixTtc > 0 ? ` — ${eur(p.prixTtc)}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>
            Options <span className="text-white/25">— filtrées selon la maison</span>
          </label>
          <div className="space-y-1">
            {calcul.dispo.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={form.options.includes(o.id)}
                  onChange={() =>
                    setForm((f) => ({
                      ...f,
                      options: f.options.includes(o.id)
                        ? f.options.filter((x) => x !== o.id)
                        : [...f.options, o.id],
                    }))
                  }
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
                <span className="text-xs text-white/30">{eur(prixOption(o, form.modele))}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Transport (€ TTC)</label>
            <input
              type="number"
              min={0}
              value={form.transport}
              onChange={(e) => setForm((f) => ({ ...f, transport: e.target.value }))}
              placeholder="à estimer"
              className={`${champ} placeholder:text-white/20`}
            />
            <p className="mt-1 text-[11px] text-white/25">
              Dépend de la distance à l&apos;atelier — non déduit de la grille.
            </p>
          </div>
          <div>
            <label className={label}>Numéro de série demandé</label>
            <select
              value={form.slot}
              onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
              className={champ}
            >
              <option value="">Aucun</option>
              {Array.from({ length: cfg.serie.unites }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>n° {n}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-white/25">
              {cfg.serie.libelle} — {cfg.serie.unites} exemplaires.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <dl className="space-y-1.5 text-sm">
            <Ligne label="Maison" valeur={eur(calcul.base)} discret />
            <Ligne label="Terrasse" valeur={eur(calcul.terrasse)} discret />
            <Ligne label="Options" valeur={eur(calcul.options)} discret />
            <Ligne label="Transport" valeur={eur(calcul.transport)} discret />
            <div className="flex justify-between border-t border-white/10 pt-1.5">
              <dt className="text-sm font-medium text-white/60">Total TTC</dt>
              <dd className="text-sm font-semibold text-white">{eur(calcul.total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-white/25">
            Recalculé depuis la grille {cfg.version} — les montants ne se saisissent pas.
          </p>
        </div>

        {erreur && <p className="text-xs text-red-400">{erreur}</p>}
      </div>
    </>
  );
}

/* ── Sous-composants ─────────────────────────────────────────────────────── */

function Ligne({
  label,
  valeur,
  pastille,
  discret = false,
}: {
  label: string;
  valeur: string | null;
  pastille?: string;
  discret?: boolean;
}) {
  if (!valeur) return null;
  return (
    <div className="flex items-center justify-between">
      <dt className={discret ? "text-white/35" : "text-white/40"}>{label}</dt>
      <dd className={`flex items-center gap-2 ${discret ? "text-white/60" : "text-white"}`}>
        {pastille && <span className="h-3 w-3 rounded-full" style={{ background: pastille }} />}
        {valeur}
      </dd>
    </div>
  );
}

/** Leads antérieurs au configurateur v2 : les grilles v1 et v2 ne sont pas
 *  commensurables (`perM2` a disparu), toute conversion serait une invention.
 *  On restitue donc l'existant tel quel, sans le réinterpréter. */
function Heritage({ lead }: { lead: LeadConfig }) {
  const entrees = Object.entries(lead.config_json ?? {}).filter(([, v]) => v !== null && v !== "");

  if (entrees.length === 0 && !lead.options_labels?.length) {
    return <p className="text-sm text-white/20">Aucune configuration enregistrée.</p>;
  }

  return (
    <>
      <dl className="space-y-2 text-sm">
        {entrees.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-white/40">{k}</dt>
            <dd className="text-white">{String(v)}</dd>
          </div>
        ))}
      </dl>
      {!!lead.options_labels?.length && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs text-white/40">Options</p>
          <ul className="space-y-1 text-sm text-white">
            {lead.options_labels.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      )}
      <p className="mt-3 text-[11px] text-white/25">
        Cliquer « Modifier » enregistrera cette fiche sur la grille courante — les deux modèles de
        prix ne sont pas convertibles l&apos;un dans l&apos;autre.
      </p>
    </>
  );
}
