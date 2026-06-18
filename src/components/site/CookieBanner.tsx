"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONSENT_KEY = "ahf-consent";

export type ConsentValue = "granted" | "denied" | null;

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(CONSENT_KEY) as ConsentValue) ?? null;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "granted");
    setVisible(false);
    // Signale aux composants Analytics qu'ils peuvent se charger
    window.dispatchEvent(new Event("ahf-consent-granted"));
  }

  function deny() {
    localStorage.setItem(CONSENT_KEY, "denied");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-line bg-surface/95 p-4 shadow-xl backdrop-blur-md sm:p-5"
          role="dialog"
          aria-label="Gestion des cookies"
        >
          <p className="text-sm leading-relaxed text-ink">
            Ce site utilise{" "}
            <strong>Google Analytics</strong> (mesure d'audience, avec votre consentement) et{" "}
            <strong>Cloudflare Turnstile</strong> (sécurité des formulaires, intérêt légitime).{" "}
            <a href="/confidentialite" className="underline underline-offset-2 hover:text-accent">
              En savoir plus
            </a>
            .
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={accept}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-ink"
            >
              Tout accepter
            </button>
            <button
              onClick={deny}
              className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              Refuser
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
