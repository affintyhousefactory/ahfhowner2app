import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = {
  title: "Politique de confidentialité | HOWNER",
  description: "Politique de confidentialité HOWNER — en cours de validation juridique.",
  robots: { index: false, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <LegalShell eyebrow="RGPD" title="Politique de confidentialité">
      <p>
        Cette page détaillera les données personnelles collectées (réservation,
        contact, outil terrain), leur finalité, leur base légale, leur durée de
        conservation, les sous-traitants éventuels, et vos droits (accès,
        rectification, effacement, opposition).
      </p>
      <p>
        Le traitement définitif et les coordonnées du responsable seront publiés
        avant toute collecte réelle en production.
      </p>
    </LegalShell>
  );
}
