import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact | HOWNER",
  description:
    "Une question sur Arko One ou Arko Max ? Écrivez-nous, nous répondons sous 24 h ouvrées.",
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
            <h1 className="editorial text-balance text-[2.4rem] leading-[1.02] text-ink md:text-[4.5rem]">
              Parlons de votre projet.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
              Une question sur Arko One, Arko Max, votre terrain ou la
              réservation ? Notre architecte intégrée vous répond.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
