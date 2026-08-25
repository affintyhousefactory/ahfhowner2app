import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/site/ContactForm";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { CONTACT } from "@/lib/site";
import { Instagram } from "@/components/ui/Instagram";

export const metadata: Metadata = {
  title: "Contact | HOWNER",
  description:
    "Une question sur Arko One ou Arko Max ? Écrivez-nous, nous répondons sous 24 h ouvrées.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="pt-16 md:pt-[4.5rem]">
      <section className="container-page py-20 md:py-28">
        <div className="rule flex items-baseline justify-between pt-5">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            Contact
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            Réponse sous 24 h
          </span>
        </div>

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h1 className="titre-xl text-balance text-ink">
              Parlons de votre projet.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
              Une question sur Arko One, Arko Max, votre terrain ou la
              réservation ? Notre architecte intégrée vous répond.
            </p>

            {/* Voie directe, en regard du formulaire : une question de
                faisabilité se tranche en deux minutes de vive voix là où un
                aller-retour par écrit coûte une journée. */}
            <div className="mt-10 max-w-md rounded-2xl border border-line bg-surface p-6">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                Par téléphone
              </p>
              <p className="mt-3 text-lg font-medium tracking-tight text-ink">
                Contacter un conseiller
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {CONTACT.phoneDays}, {CONTACT.phoneHours}. Plus direct que le
                formulaire quand la question porte sur votre parcelle ou sur un
                délai.
              </p>
              <PhoneLink full className="mt-5 w-fit px-4 py-2 text-sm" />
            </div>

            {/* Troisième voie, volontairement plus discrète que les deux
                autres : on y va pour voir les studios, pas pour poser une
                question — un message privé n'a ni trace ni délai de réponse
                annoncé, contrairement au formulaire et au téléphone. */}
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Howner sur Instagram (${CONTACT.instagramHandle}) — nouvel onglet`}
              className="mt-6 inline-flex min-h-11 max-w-md items-center gap-3 text-sm text-muted transition-colors hover:text-ink"
            >
              <Instagram />
              <span>
                Voir les studios sur Instagram
                <span className="ml-1.5 font-mono text-[0.72rem] text-muted/70">
                  {CONTACT.instagramHandle}
                </span>
              </span>
            </a>
          </div>
          <Suspense fallback={<div className="rounded-2xl border border-line bg-canvas p-6 md:p-8" />}>
            <ContactForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
