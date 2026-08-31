"use client";

/**
 * Vivier Brevo — piocher une agence dans le fichier de prospection (ADR-044 §2).
 *
 * Ce qui est à l'écran n'est pas dans la base : ce sont les contacts de la
 * liste Brevo « Agents » que **personne ne suit encore**. Prendre l'un d'eux en
 * suivi crée sa fiche, pré-remplie de ce que Brevo sait de lui — et il
 * disparaît d'ici, puisque la soustraction se refait à chaque chargement.
 *
 * ⚠ Le filtrage est local, et il doit l'être : l'API Brevo v3 n'a pas de
 * recherche de contacts. Ce qu'on filtre est ce qu'on a déjà reçu.
 *
 * ⚠ Un contact désinscrit chez Brevo reste affiché, signalé. Le masquer
 * laisserait croire qu'il n'existe pas, et quelqu'un finirait par le ressaisir
 * à la main. On peut le suivre — on ne pourra simplement jamais lui écrire.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { TelephoneLien } from "@/shared/components/admin/TelephoneLien";
import type { ContactVivier } from "@/shared/lib/brevo-agents";

export default function VivierBrevo({
  vivier,
  total,
  dejaSuivis,
  tronque,
}: {
  vivier: ContactVivier[];
  total: number;
  dejaSuivis: number;
  tronque: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [departement, setDepartement] = useState("");
  const [source, setSource] = useState("");
  /* Les contacts déjà repris pendant cette session : ils quittent l'écran sans
     attendre un rechargement, sinon on reclique sur une ligne déjà traitée. */
  const [repris, setRepris] = useState<Set<string>>(new Set());
  const [encours, setEncours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const departements = useMemo(
    () => [...new Set(vivier.map((c) => c.departement).filter(Boolean))].sort() as string[],
    [vivier],
  );
  const sources = useMemo(
    () => [...new Set(vivier.map((c) => c.source_contact).filter(Boolean))].sort() as string[],
    [vivier],
  );

  const filtres = useMemo(() => {
    const terme = q.trim().toLowerCase();
    return vivier.filter((c) => {
      if (repris.has(c.email)) return false;
      if (departement && c.departement !== departement) return false;
      if (source && c.source_contact !== source) return false;
      if (!terme) return true;
      return [c.agence, c.prenom, c.nom, c.email, c.commune]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(terme));
    });
  }, [vivier, q, departement, source, repris]);

  async function suivre(c: ContactVivier) {
    setEncours(c.email);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agence: c.agence ?? c.email,
          prenom: c.prenom,
          nom: c.nom,
          fonction: c.fonction,
          email: c.email,
          tel: c.tel,
          tel_fixe: c.tel_fixe,
          adresse: c.adresse,
          code_postal: c.code_postal,
          commune: c.commune,
          departement: c.departement,
          siren: c.siren,
          siret: c.siret,
          naf: c.naf,
          site_web: c.site_web,
          linkedin: c.linkedin,
          brevo_contact_id: c.brevo_contact_id,
          source_contact: c.source_contact,
          url_source: c.url_source,
        }),
      });
      const body = (await res.json()) as { agent?: { id: string }; error?: string; agentExistant?: string };
      if (!res.ok) {
        /* Le doublon n'est pas une erreur à afficher et à oublier : la fiche
           existe, le conseiller veut y aller. */
        if (body.agentExistant) {
          router.push(`/admin/agents/${body.agentExistant}`);
          return;
        }
        throw new Error(body.error ?? "Création refusée");
      }
      setRepris((p) => new Set(p).add(c.email));
      router.refresh();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setEncours(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher — agence, contact, email, commune"
          className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
        />
        <select
          value={departement}
          onChange={(e) => setDepartement(e.target.value)}
          aria-label="Filtrer par département"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
        >
          <option value="">Tous les départements</option>
          {departements.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          aria-label="Filtrer par source"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#7469F4] [color-scheme:dark]"
        >
          <option value="">Toutes les sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-xs text-white/25">
        {filtres.length} contact{filtres.length > 1 ? "s" : ""} à reprendre
        {filtres.length !== vivier.length && ` sur ${vivier.length} non suivis`}
        {" · "}
        {dejaSuivis} déjà suivi{dejaSuivis > 1 ? "s" : ""} sur {total} dans la liste Brevo
      </p>

      {tronque && (
        <p className="mb-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-300/80">
          La liste Brevo n&apos;a pas pu être lue en entier — ce qui s&apos;affiche est
          incomplet. Ne pas en conclure qu&apos;un contact absent n&apos;existe pas.
        </p>
      )}

      {erreur && <p className="mb-3 text-sm text-red-400">{erreur}</p>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#252521]">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/30">
              <th className="px-4 py-3 font-normal">Agence</th>
              <th className="px-4 py-3 font-normal">Contact</th>
              <th className="px-4 py-3 font-normal">Téléphone</th>
              <th className="px-4 py-3 font-normal">Secteur</th>
              <th className="px-4 py-3 font-normal">Source</th>
              <th className="px-4 py-3 font-normal">Statut Brevo</th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtres.map((c) => (
              <tr key={c.email} className={cn("hover:bg-white/5", c.desinscrit && "opacity-50")}>
                <td className="px-4 py-3">
                  <span className="text-white">{c.agence ?? "—"}</span>
                  {c.desinscrit && (
                    <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
                      désinscrit
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-white/70">
                    {`${c.prenom ?? ""} ${c.nom ?? ""}`.trim() || "—"}
                  </span>
                  <span className="block truncate text-[11px] text-white/30">{c.email}</span>
                </td>
                <td className="px-4 py-3 text-white/60">
                  <TelephoneLien tel={c.tel_fixe ?? c.tel} />
                </td>
                <td className="px-4 py-3 text-white/50">
                  {c.commune ?? "—"}
                  {c.departement && <span className="ml-1 text-white/25">({c.departement})</span>}
                </td>
                <td className="px-4 py-3 text-[11px] text-white/40">
                  {c.url_source ? (
                    <a
                      href={c.url_source}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-dotted underline-offset-2 hover:text-white"
                    >
                      {c.source_contact ?? "source"}
                    </a>
                  ) : (
                    (c.source_contact ?? "—")
                  )}
                </td>
                <td className="px-4 py-3 text-[11px] text-white/40">{c.statut_brevo ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => suivre(c)}
                    disabled={encours === c.email}
                    className="rounded-xl bg-[#7469F4] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {encours === c.email ? "…" : "Suivre"}
                  </button>
                </td>
              </tr>
            ))}
            {filtres.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-white/25">
                  {vivier.length === 0
                    ? "Toute la liste Brevo est déjà suivie."
                    : "Aucun contact ne correspond à ces filtres."}
                  {" "}
                  <Link href="/admin/agents" className="text-[#7469F4] underline underline-offset-2">
                    Voir les agences suivies
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
