import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = {
  title: "Conditions générales de vente | HOWNER",
  description: "Conditions générales de vente HOWNER — en cours de validation juridique.",
  alternates: { canonical: "/cgv" },
  robots: { index: false, follow: true },
};

export default function CgvPage() {
  return (
    <LegalShell eyebrow="Légal" title="Conditions générales de vente">
      <p>
        Les présentes conditions encadreront la réservation et la vente des
        modèles Arko One et Arko Max : objet, prix, acompte de réservation,
        échéancier de paiement, délais de fabrication et de pose, garanties
        légales, droit de rétractation et conditions de remboursement.
      </p>
      <p>
        La nature exacte de la somme versée à la réservation (acompte ou arrhes)
        et ses conditions de remboursement sont en cours d'arbitrage juridique
        et seront précisées ici avant toute mise en vente.
      </p>
    </LegalShell>
  );
}
