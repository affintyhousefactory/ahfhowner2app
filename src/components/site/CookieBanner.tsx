"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Préférence analytique — persiste entre sessions (localStorage)
const CONSENT_KEY = "ahf-consent";
// Indicateur d'affichage — réinitialisé à chaque session (sessionStorage)
const SESSION_KEY = "ahf-consent-shown";

export type ConsentValue = "granted" | "denied" | null;

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(CONSENT_KEY) as ConsentValue) ?? null;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Affiche à chaque nouvelle session navigateur (sessionStorage se vide à la fermeture de l'onglet)
    const shownThisSession = sessionStorage.getItem(SESSION_KEY);
    if (!shownThisSession) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "granted");
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
    window.dispatchEvent(new Event("ahf-consent-granted"));
  }

  function deny() {
    localStorage.setItem(CONSENT_KEY, "denied");
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
          role="dialog"
          aria-label="Gestion des cookies"
        >
          {/* Carte principale */}
          <div className="relative overflow-hidden rounded-2xl border border-line/60 bg-surface/90 shadow-2xl backdrop-blur-xl">

            {/* Liseré accent en haut */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            <div className="px-5 py-5 sm:px-6">
              {/* En-tête */}
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V7h2v2z" fill="currentColor"/>
                  </svg>
                </span>
                <div>
                  <p className="text-[0.82rem] font-semibold tracking-wide text-ink">
                    Vos préférences de confidentialité
                  </p>
                  <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">
                    Nous utilisons{" "}
                    <span className="font-medium text-ink">Google Analytics</span>{" "}
                    (audience, avec votre accord) et{" "}
                    <span className="font-medium text-ink">Cloudflare Turnstile</span>{" "}
                    (sécurité des formulaires — intérêt légitime, sans consentement requis).
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <a
                  href="/confidentialite"
                  className="text-[0.72rem] text-muted underline underline-offset-2 transition-colors hover:text-ink"
                >
                  Politique de confidentialité
                </a>
                <div className="flex items-center gap-2">
                  <button
                    onClick={deny}
                    className="rounded-full border border-line px-4 py-1.5 text-[0.78rem] font-medium text-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={accept}
                    className="rounded-full bg-accent px-4 py-1.5 text-[0.78rem] font-medium text-white shadow-sm transition-colors hover:bg-accent-ink"
                  >
                    Tout accepter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
