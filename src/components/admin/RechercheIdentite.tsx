"use client";

/**
 * « Je l'ai déjà, ce contact ? » — en tête de la pré-qualification.
 *
 * Le conseiller tape trois lettres pendant que ça sonne. Ce qu'il voit revenir
 * n'a pas la même valeur selon la source, et l'écran le dit :
 *
 * - **une fiche existante** est un avertissement, pas une commodité. Créer un
 *   second lead pour le même prospect, c'est deux conseillers qui l'appellent et
 *   deux devis qui circulent. Le bouton mène à la fiche, il ne pré-remplit pas ;
 * - **un contact** (formulaire du site, ou Brevo) est une commodité : on
 *   pré-remplit l'identité et la ressaisie disparaît.
 *
 * ⚠ La recherche ne part qu'à partir de trois caractères et après une pause de
 * frappe : au téléphone, on tape par à-coups, et une requête par caractère
 * rendrait des résultats qui changent sous les doigts.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";

type Correspondance = {
  origine: "lead" | "contact" | "brevo";
  id?: string;
  leadNumber?: number | null;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  tel: string | null;
  detail?: string | null;
};

const ORIGINES = {
  lead: { libelle: "Fiche existante", badge: "bg-[#E2A03F]/20 text-[#E2A03F]" },
  contact: { libelle: "Formulaire du site", badge: "bg-[#7469F4]/20 text-[#7469F4]" },
  brevo: { libelle: "Contact Brevo", badge: "bg-white/10 text-white/50" },
} as const;

export function RechercheIdentite({
  onRemplir,
}: {
  onRemplir: (c: { prenom: string; nom: string; email: string; tel: string }) => void;
}) {
  const [q, setQ] = useState("");
  /* Les résultats portent le terme qui les a produits : sans lui, effacer une
     lettre laisserait à l'écran des correspondances qui ne répondent plus à ce
     qui est tapé. */
  const [reponse, setReponse] = useState<{ terme: string; correspondances: Correspondance[] } | null>(null);
  const [charge, setCharge] = useState(false);

  const terme = q.trim();
  const actif = terme.length >= 3;

  /* ⚠ Aucun `setState` dans le corps de l'effet — tout se passe dans le
     minuteur, donc hors du rendu. Synchroniser un état ici déclencherait des
     rendus en cascade ; ce qui peut être **dérivé** l'est plus bas. */
  useEffect(() => {
    if (terme.length < 3) return;

    const minuteur = setTimeout(async () => {
      setCharge(true);
      try {
        const res = await fetch(`/api/admin/leads/recherche?q=${encodeURIComponent(terme)}`);
        const body = (await res.json()) as { correspondances?: Correspondance[] };
        setReponse({ terme, correspondances: body.correspondances ?? [] });
      } catch {
        /* Une recherche qui échoue ne bloque pas la saisie : le formulaire reste
           utilisable, c'est son chemin normal. */
        setReponse({ terme, correspondances: [] });
      } finally {
        setCharge(false);
      }
    }, 350);

    return () => clearTimeout(minuteur);
  }, [terme]);

  /* État dérivé, jamais stocké : sous trois caractères il n'y a rien à montrer,
     et une réponse d'un terme précédent ne vaut plus. */
  const resultats = actif && reponse?.terme === terme ? reponse.correspondances : null;
  const doublon = resultats?.some((c) => c.origine === "lead") ?? false;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <label className="mb-1.5 block text-xs text-white/40">
        Ce contact est-il déjà connu&nbsp;?
      </label>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Nom, prénom, email ou téléphone — 3 caractères suffisent"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]"
      />

      {charge && <p className="mt-2 text-[11px] text-white/30">Recherche…</p>}

      {resultats && resultats.length === 0 && !charge && (
        <p className="mt-2 text-[11px] text-white/30">
          Aucune correspondance — c&apos;est un nouveau contact.
        </p>
      )}

      {doublon && (
        <p className="mt-3 rounded-lg border border-[#E2A03F]/25 bg-[#E2A03F]/5 px-3 py-2 text-[11px] leading-relaxed text-[#E2A03F]/90">
          <span className="font-semibold">Ce prospect a déjà une fiche.</span> En créer une seconde,
          c&apos;est deux conseillers qui l&apos;appellent et deux devis qui circulent. Ouvrez la
          fiche existante et journalisez l&apos;appel dedans.
        </p>
      )}

      {resultats && resultats.length > 0 && (
        <ul className="mt-3 space-y-2">
          {resultats.map((c, i) => {
            const o = ORIGINES[c.origine];
            return (
              <li
                key={`${c.origine}-${c.id ?? c.email ?? i}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">
                    {c.leadNumber && (
                      <span className="mr-1.5 font-mono text-[10px] text-white/30">
                        #{c.leadNumber}
                      </span>
                    )}
                    {[c.prenom, c.nom].filter(Boolean).join(" ") || "(sans nom)"}
                  </p>
                  <p className="truncate text-[11px] text-white/35">
                    {[c.email, c.tel].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", o.badge)}>
                      {o.libelle}
                    </span>
                    {c.detail && <span className="text-[10px] text-white/25">{c.detail}</span>}
                  </p>
                </div>

                {c.origine === "lead" && c.id ? (
                  <Link
                    href={`/admin/leads/${c.id}`}
                    className="shrink-0 rounded-lg border border-[#E2A03F]/40 px-3 py-1.5 text-xs text-[#E2A03F] transition-colors hover:bg-[#E2A03F]/10"
                  >
                    Ouvrir la fiche →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onRemplir({
                        prenom: c.prenom ?? "",
                        nom: c.nom ?? "",
                        email: c.email ?? "",
                        tel: c.tel ?? "",
                      })
                    }
                    className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-[#7469F4]/60 hover:text-white"
                  >
                    Reprendre l&apos;identité
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
