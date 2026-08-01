import type { Metadata } from "next";
import { ConfigurateurV2 } from "@/components/configurateur/Configurateur";

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

export default function ConfigurerV2Page() {
  return (
    <main id="main-content" className="pt-16 md:pt-[4.5rem]">
      <ConfigurateurV2 />
    </main>
  );
}
