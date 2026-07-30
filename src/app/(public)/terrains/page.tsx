import { getSupabaseAdmin } from "@/shared/lib/supabase";
import TerrainsGrid from "@/components/site/TerrainsGrid";
import type { TerrainPublic } from "@/components/site/TerrainDetailModal";
import { guardMandataire } from "@/shared/lib/feature-guard";

export const revalidate = 3600;

export const metadata = {
  title: "Terrains disponibles — Howner / ARKO",
  description: "Terrains référencés par nos experts Affinity, compatibles avec l'Arko.",
};

export default async function TerrainsPubliquePage() {
  // ADR-028 — les fiches terrain sont alimentées par le réseau mandataire,
  // suspendu. Garde avant toute requête Supabase.
  guardMandataire();

  const { data } = await getSupabaseAdmin()
    .from("fiches_terrain")
    .select("id, titre, commune, secteur, prix, surface, zonage, compatibilite_arko, modele_arko, photos, description_publique, publie_at, statut, afficher_statut_mandataire")
    .eq("statut_admin", "publie")
    .order("publie_at", { ascending: false });

  const terrains = (data ?? []) as TerrainPublic[];

  return (
    <main id="main-content" className="min-h-screen bg-[var(--color-canvas,#fafaf8)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-ink,#1a1a18)] sm:text-4xl">
            Terrains disponibles
          </h1>
          <p className="mx-auto max-w-xl text-base text-[var(--color-ink,#1a1a18)]/60">
            Terrains référencés par nos experts Affinity, compatibles avec l&apos;Arko.
          </p>
        </header>

        <TerrainsGrid terrains={terrains} />
      </div>
    </main>
  );
}
