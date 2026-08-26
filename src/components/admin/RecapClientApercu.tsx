"use client";

/**
 * Relecture puis envoi du récapitulatif d'appel.
 *
 * ⚠ **L'aperçu n'est pas décoratif : il est la condition de l'envoi.** Le bouton
 * « Envoyer » n'existait pas seul auparavant — un clic sur la fiche du lead
 * expédiait le récapitulatif sans que personne ait relu ce qui partait. Sur un
 * premier appel retranscrit à la volée, ce qui part porte un prix, une distance
 * et un nom : trois choses qu'on ne rattrape pas après coup.
 *
 * Le rendu est celui du vrai template Brevo, peuplé des valeurs du lead
 * (`/api/admin/leads/[id]/recap-client/apercu`). Il est affiché dans une
 * `iframe` : un email est du HTML de courrier, avec ses propres styles, et
 * l'injecter dans la page du back-office le déformerait autant que l'inverse.
 */

import { useState } from "react";

export function RecapClientApercu({
  leadId,
  email,
  dejaEnvoyeLe,
  onEnvoye,
}: {
  leadId: string;
  email: string | null;
  /** ISO. Rend visible qu'un récap est déjà parti — et quand. */
  dejaEnvoyeLe?: string | null;
  onEnvoye?: () => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer() {
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/recap-client`, { method: "POST" });
      const body = (await res.json()) as { error?: string; horodate?: boolean };
      if (!res.ok) throw new Error(body.error ?? "Erreur serveur");
      setEnvoye(true);
      onEnvoye?.();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setEnvoi(false);
    }
  }

  if (!email) {
    return (
      <p className="text-xs text-[#E2A03F]/80">
        Pas d&apos;adresse email sur ce lead — aucun récapitulatif ne peut partir.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Récapitulatif client
          </h3>
          <p className="mt-1 text-[11px] text-white/40">
            Destinataire : <span className="text-white/60">{email}</span>
            {dejaEnvoyeLe && (
              <>
                {" · "}
                <span className="text-[#E2A03F]/80">
                  déjà envoyé le{" "}
                  {new Date(dejaEnvoyeLe).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-white/25 hover:text-white"
        >
          {ouvert ? "Masquer l'aperçu" : "Relire avant envoi"}
        </button>
      </div>

      {ouvert && (
        <>
          {/* `sandbox` sans `allow-scripts` : le HTML vient de Brevo, mais il
              transite par un rendu local — on l'affiche, on ne l'exécute pas. */}
          <iframe
            title="Aperçu du récapitulatif client"
            src={`/api/admin/leads/${leadId}/recap-client/apercu`}
            sandbox=""
            className="mt-4 h-[26rem] w-full rounded-lg border border-white/10 bg-white"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">
            Aperçu du template Brevo peuplé des valeurs de ce lead. Les liens de
            désinscription et de préférences sont inertes ici : Brevo ne les fabrique
            qu&apos;à l&apos;envoi.
          </p>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={envoyer}
          disabled={envoi || envoye}
          className="rounded-lg bg-[#7469F4] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {envoye ? "Récapitulatif envoyé" : envoi ? "Envoi…" : "Envoyer le récapitulatif"}
        </button>

        {!ouvert && !envoye && (
          <span className="text-[11px] text-white/30">Relire l&apos;aperçu avant d&apos;envoyer.</span>
        )}
        {erreur && <span className="text-[11px] text-[#E2555A]">{erreur}</span>}
      </div>
    </div>
  );
}
