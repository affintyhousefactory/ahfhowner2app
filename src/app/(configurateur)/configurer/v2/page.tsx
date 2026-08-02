import type { Metadata } from "next";
import { ConfigurateurV2 } from "@/components/configurateur/Configurateur";
import type { ModeleId } from "@/lib/configurateur/config";

/**
 * Configurateur v2 — exposé sur une route dédiée le temps de la validation.
 *
 * `/configurer` continue de servir le tunnel actuel : le nouveau parcours n'a
 * pas encore sa soumission (ADR-031) ni son dossier terrain (ADR-032).
 * Basculer maintenant casserait l'entonnoir de réservation en production.
 *
 * `noindex` : deux URLs servant le même parcours ne doivent pas se concurrencer
 * dans l'index. La bascule se fera quand ADR-031 aura livré la persistance.
 */
export const metadata: Metadata = {
  title: "Configurateur v2 — aperçu | HOWNER",
  description: "Aperçu du nouveau parcours de configuration.",
  robots: { index: false, follow: false },
};

/**
 * `?produit=one|max` est lu ici, côté serveur : la présélection arrive dans le
 * HTML initial. Le parcours reste rendu côté serveur — `useSearchParams` aurait
 * exigé une frontière Suspense et fait basculer la page en rendu client.
 */
export default async function ConfigurerV2Page({
  searchParams,
}: {
  searchParams: Promise<{ produit?: string | string[] }>;
}) {
  const { produit } = await searchParams;
  const modeleInitial: ModeleId = produit === "one" || produit === "max" ? produit : "max";

  /* Le <main> et le décalage sous l'en-tête sont portés par la coque du
     groupe `(configurateur)` — cf. `../../layout.tsx`. */
  return <ConfigurateurV2 modeleInitial={modeleInitial} />;
}
