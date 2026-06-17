"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PRODUCT_LIST } from "@/lib/site";
import { Arrow } from "@/components/ui/Button";

/* Formulaire de contact — Phase 1 : validation client + état envoyé.
   Aucun backend (envoi réel branché en Phase 4, service email ADR-014). */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-line bg-canvas p-8"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="mt-5 text-xl font-medium tracking-tight">Message envoyé</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Merci — nous revenons vers vous sous 24 h ouvrées.
        </p>
        <p className="mt-4 font-mono text-[0.68rem] text-muted">
          Aperçu — l'envoi réel sera activé prochainement.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="rounded-2xl border border-line bg-canvas p-6 md:p-8"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="prenom" placeholder="Prénom" required />
        <Field name="nom" placeholder="Nom" required />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field name="email" type="email" placeholder="Email" required />
        <Field name="tel" type="tel" placeholder="Téléphone" />
      </div>

      <select
        name="produit"
        defaultValue=""
        className="mt-3 w-full rounded-full border border-line bg-surface px-5 py-3.5 text-sm text-ink outline-none transition-colors focus:border-accent"
      >
        <option value="" disabled>
          Sujet — modèle concerné
        </option>
        {PRODUCT_LIST.map((p) => (
          <option key={p.key} value={p.key}>
            {p.name} ({p.area})
          </option>
        ))}
        <option value="autre">Autre demande</option>
      </select>

      <textarea
        name="message"
        required
        rows={5}
        placeholder="Votre message"
        className="mt-3 w-full rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
      />

      <button
        type="submit"
        className="group mt-4 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-[0.95rem] font-medium tracking-tight text-white transition-colors duration-300 hover:bg-accent-ink"
      >
        Envoyer
        <Arrow />
      </button>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted">
        Vos données ne servent qu'à traiter votre demande.{" "}
        <a href="/confidentialite" className="underline underline-offset-2 hover:text-ink">
          Confidentialité
        </a>
        .
      </p>
    </form>
  );
}

function Field({
  name,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-full border border-line bg-surface px-5 py-3.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
    />
  );
}
