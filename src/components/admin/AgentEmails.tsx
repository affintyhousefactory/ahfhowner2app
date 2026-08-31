"use client";

/**
 * Ce que cette agence a reçu — ADR-044 §4.
 *
 * Lu en direct chez Brevo à l'ouverture de l'onglet, jamais stocké : la source
 * est Brevo, et une copie affichée serait une copie qui vieillit sans le dire.
 *
 * ⚠ **Seuls les envois transactionnels apparaissent** — ceux que le CRM
 * déclenche. Une campagne lancée depuis Brevo sur la liste 9 ne passe pas par
 * `/smtp/emails` : elle vivra dans les statistiques de campagne du contact,
 * vides tant qu'aucune n'a été envoyée. Le dire à l'écran évite de conclure
 * qu'une agence n'a rien reçu.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { dateHeureFr } from "@/lib/crm";
import { etatEmail } from "@/lib/agents";
import type { EmailEnvoye } from "@/shared/lib/brevo-emails";

type Meta = {
  templateId: number | null;
  variable: string;
  pret: boolean;
  bloquant: string | null;
  destinataire: string;
  dejaEnvoyeLe: string | null;
};

export default function AgentEmails({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [emails, setEmails] = useState<EmailEnvoye[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [apercu, setApercu] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState<string | null>(null);

  /* ⚠ Même forme que `JournalAppels`, et pour la même raison : aucun `setState`
     atteignable avant la première pause, sinon l'effet déclenche des rendus en
     cascade. L'état de chargement est déjà `true` à l'initialisation ; il ne se
     repose pas en tête. Les deux lectures sont séquentielles — deux appels
     internes ne valent pas de contourner la règle.

     Pas de `catch` : quand Brevo est injoignable, c'est la **route** qui répond
     502 avec son message. Le `fetch`, lui, aboutit. */
  const charger = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/emails`);
      const corps = (await res.json()) as { emails?: EmailEnvoye[]; error?: string };
      if (res.ok) {
        setEmails(corps.emails ?? []);
        setErreur(null);
      } else {
        setErreur(corps.error ?? "Historique illisible");
      }

      /* La méta manquante n'est pas une panne d'historique : les deux moitiés
         de l'onglet vivent leur vie. Perdre le bouton d'envoi ne doit pas
         effacer ce qui est déjà parti. */
      const resMeta = await fetch(`/api/admin/agents/${agentId}/presentation/apercu?meta=1`);
      if (resMeta.ok) setMeta((await resMeta.json()) as Meta);
    } finally {
      setChargement(false);
    }
  }, [agentId]);

  useEffect(() => { charger(); }, [charger]);

  async function envoyer() {
    /* L'aperçu est un passage obligé : cet email promet une commission, et une
       promesse faite à une entreprise ne se reprend pas. La confirmation dit
       à qui il part — l'adresse d'un fichier de prospection n'est pas toujours
       celle qu'on croit. */
    if (!meta?.pret) return;
    if (!confirm(`Envoyer la présentation partenaire à ${meta.destinataire} ?`)) return;

    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/presentation`, { method: "POST" });
      const body = (await res.json()) as { error?: string; horodate?: boolean };
      if (!res.ok) throw new Error(body.error ?? "Envoi refusé");
      setEnvoye(
        body.horodate
          ? "Présentation envoyée."
          : "Présentation envoyée — la date n'a pas pu être enregistrée sur la fiche.",
      );
      await charger();
      router.refresh();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Emails reçus
          </h2>
          <p className="mt-1 text-xs text-white/25">
            Lu chez Brevo, en direct. Les campagnes lancées depuis Brevo n&apos;apparaissent
            pas ici — seuls les envois déclenchés depuis le CRM.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setApercu((v) => !v)}
            disabled={!meta?.templateId}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-[#7469F4]/50 hover:text-white disabled:opacity-30"
          >
            {apercu ? "Fermer l'aperçu" : "Aperçu"}
          </button>
          <button
            type="button"
            onClick={envoyer}
            disabled={!meta?.pret || envoi}
            title={meta?.bloquant ?? undefined}
            className="rounded-xl bg-[#7469F4] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            {envoi ? "Envoi…" : "Envoyer la présentation"}
          </button>
        </div>
      </div>

      {/* Ce qui empêche l'envoi se dit AVANT le clic, pas après : le conseiller
          ne doit pas découvrir une variable absente au moment d'envoyer. */}
      {meta?.bloquant && (
        <p className="mb-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-300/80">
          {meta.bloquant}
        </p>
      )}
      {envoye && <p className="mb-3 text-sm text-green-400">{envoye}</p>}
      {erreur && <p className="mb-3 text-sm text-red-400">{erreur}</p>}

      {apercu && meta?.templateId && (
        <iframe
          title="Aperçu de la présentation partenaire"
          src={`/api/admin/agents/${agentId}/presentation/apercu`}
          className="mb-4 h-[600px] w-full rounded-xl border border-white/10 bg-white"
        />
      )}

      {chargement ? (
        <p className="text-sm text-white/20">Chargement…</p>
      ) : emails.length === 0 ? (
        <p className="text-sm text-white/20">Aucun email transactionnel envoyé à cette adresse.</p>
      ) : (
        <ol className="space-y-2">
          {emails.map((e) => {
            const et = etatEmail(e.etat);
            return (
              <li
                key={e.messageId}
                className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-white/80">{e.sujet}</span>
                  {et && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${et.badge}`}>
                      {et.label}
                    </span>
                  )}
                  {e.templateId && (
                    <span className="text-[11px] text-white/25">modèle {e.templateId}</span>
                  )}
                  <span className="ml-auto text-[11px] text-white/25">{dateHeureFr(e.date)}</span>
                </div>
                {e.evenements.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/25">
                    {e.evenements.map((ev, i) => (
                      <span key={`${ev.event}-${ev.date}-${i}`} className={cn(i === 0 && "text-white/40")}>
                        {etatEmail(ev.event)?.label ?? ev.event} · {dateHeureFr(ev.date)}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
