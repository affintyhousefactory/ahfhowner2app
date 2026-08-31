/**
 * Vivier Brevo — ADR-044 §2.
 *
 * La lecture de Brevo se fait **côté serveur**, à l'ouverture de la page : la
 * clé d'API n'a rien à faire dans le navigateur, et la soustraction des agences
 * déjà suivies exige la base. Le composant client ne fait que filtrer et
 * reprendre.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { estAdmin } from "@/shared/lib/supabase-server";
import { ErreurRequete } from "@/components/admin/ErreurRequete";
import VivierBrevo from "@/components/admin/VivierBrevo";
import { lireVivierBrevo } from "@/shared/lib/brevo-agents";

export const dynamic = "force-dynamic";

export default async function VivierPage() {
  if (!(await estAdmin())) redirect("/admin/auth/signin");

  /* Lecture directe, sans `fetch` sur soi-même : un aller-retour HTTP interne
     rejouerait l'authentification, coûterait un tour de réseau et obligerait à
     reconstruire l'URL absolue du déploiement. */
  const reponse = await lireVivierBrevo();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Vivier Brevo</h1>
          <p className="mt-1 text-xs text-white/30">
            Les contacts de la liste « Agents » que personne ne suit encore. Rien de ceci
            n&apos;est en base — Brevo reste le fichier, la fiche ne se crée qu&apos;au clic.
          </p>
        </div>
        <Link
          href="/admin/agents"
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10"
        >
          ← Agences suivies
        </Link>
      </div>

      {"error" in reponse ? (
        <ErreurRequete titre="Vivier illisible" message={reponse.error} />
      ) : (
        <VivierBrevo
          vivier={reponse.vivier}
          total={reponse.total}
          dejaSuivis={reponse.dejaSuivis}
          tronque={reponse.tronque}
        />
      )}
    </div>
  );
}
