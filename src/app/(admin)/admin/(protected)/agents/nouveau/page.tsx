/**
 * Création manuelle d'une agence partenaire — ADR-044 §9.
 *
 * Pour celles qui ne sont pas dans le fichier : rencontrée en salon, recommandée
 * par un confrère. Celles qui y sont se reprennent en un clic depuis le vivier,
 * pré-remplies — ressaisir à la main ce que Brevo sait déjà serait une perte de
 * temps et une source d'écarts.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { estAdmin } from "@/shared/lib/supabase-server";
import AgentIdentite from "@/components/admin/AgentIdentite";

export const dynamic = "force-dynamic";

export default async function NouvelAgentPage() {
  if (!(await estAdmin())) redirect("/admin/auth/signin");

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Nouvelle agence</h1>
          <p className="mt-1 text-xs text-white/30">
            Pour une agence hors fichier de prospection. Si elle est dans la liste Brevo,
            la reprendre depuis le vivier évite la ressaisie.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link
            href="/admin/agents/vivier"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10"
          >
            Vivier Brevo
          </Link>
          <Link
            href="/admin/agents"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10"
          >
            ← Retour
          </Link>
        </div>
      </div>

      <div className="max-w-3xl rounded-2xl border border-white/10 bg-[#252521] p-6">
        <AgentIdentite />
      </div>
    </div>
  );
}
