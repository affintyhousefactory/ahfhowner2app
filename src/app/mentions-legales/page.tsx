import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = {
  title: "Mentions légales | HOWNER",
  description: "Mentions légales HOWNER — en cours de validation juridique.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
};

export default function MentionsPage() {
  return (
    <LegalShell eyebrow="Légal" title="Mentions légales">
      <p>
        Éditeur du site, forme juridique, capital, siège social, numéro
        d'immatriculation, directeur de la publication, coordonnées de contact,
        hébergeur : ces informations seront renseignées ici à la finalisation
        de la structure juridique.
      </p>
      <p>
        Pour toute demande, utilisez le{" "}
        <a href="/contact" className="underline underline-offset-2 hover:text-ink">
          formulaire de contact
        </a>
        .
      </p>
    </LegalShell>
  );
}
