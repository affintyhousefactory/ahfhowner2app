"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { PRODUCT_LIST } from "@/lib/site";
import { Arrow } from "@/components/ui/Button";

const SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

// Les clés de test Cloudflare ne nécessitent pas de vrai token côté serveur
const TEST_KEYS = ["1x00000000000000000000AA", "2x00000000000000000000AB", "3x00000000000000000000FF"];
const SITE_KEY_VALUE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? SITE_KEY;
const CAPTCHA_REQUIRED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !TEST_KEYS.includes(SITE_KEY_VALUE);

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // En prod avec vraie clé, le token doit être présent (widget auto-execute)
    if (CAPTCHA_REQUIRED && !captchaToken) return;

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    setLoading(true);
    setSubmitError(false);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom: data.get("prenom"),
        nom: data.get("nom"),
        email: data.get("email"),
        tel: data.get("tel") || null,
        produit: data.get("produit") || null,
        message: data.get("message"),
        captchaToken,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setSubmitError(true);
      return;
    }

    setSent(true);
  }

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
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-line bg-canvas p-6 md:p-8"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="prenom" placeholder="Prénom *" required />
        <Field name="nom" placeholder="Nom *" required />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field
          name="email"
          type="email"
          placeholder="Email *"
          required
          pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
        />
        <Field name="tel" type="tel" placeholder="Téléphone *" required />
      </div>

      <select
        name="produit"
        defaultValue=""
        required
        className="mt-3 w-full rounded-full border border-line bg-surface px-5 py-3.5 text-sm text-ink outline-none transition-colors focus:border-accent"
      >
        <option value="" disabled>
          Sujet — modèle concerné *
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
        placeholder="Votre message *"
        className="mt-3 w-full rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
      />

      <Turnstile
        ref={turnstileRef}
        siteKey={SITE_KEY}
        onSuccess={setCaptchaToken}
        onExpire={() => setCaptchaToken(null)}
        options={{ theme: "light", size: "invisible" }}
        className="mt-3"
      />

      {submitError && (
        <p className="mt-2 text-center text-xs text-red-500">
          Une erreur est survenue — veuillez réessayer.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group mt-4 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-[0.95rem] font-medium tracking-tight text-white transition-colors duration-300 hover:bg-accent-ink disabled:opacity-50"
      >
        {loading ? "Envoi…" : "Envoyer"}
        {!loading && <Arrow />}
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
  pattern,
}: {
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  pattern?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      pattern={pattern}
      placeholder={placeholder}
      className="w-full rounded-full border border-line bg-surface px-5 py-3.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
    />
  );
}
