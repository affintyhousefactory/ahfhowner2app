"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND } from "@/lib/site";
import { Button, Arrow } from "@/components/ui/Button";
import { Gauge } from "@/components/ui/Gauge";
import { useConfig, eur } from "./config-store";

export function StickyCta() {
  const [show, setShow] = useState(false);
  const { houseTotal } = useConfig();

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.85;
      const resa = document.getElementById("reserver");
      let overResa = false;
      if (resa) {
        const r = resa.getBoundingClientRect();
        overResa = r.top < window.innerHeight && r.bottom > 0;
      }
      setShow(past && !overResa);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 print:hidden"
        >
          <div className="container-page pb-4">
            <div className="flex items-center justify-between gap-4 rounded-full border border-line bg-canvas/90 px-4 py-2.5 shadow-[0_10px_40px_rgba(26,23,20,0.12)] backdrop-blur-md md:px-6 md:py-3">
              <div className="flex items-center gap-5">
                <Gauge
                  reserved={BRAND.reserved}
                  total={BRAND.total}
                  variant="mini"
                />
                <span className="hidden font-mono text-xs text-muted sm:block">
                  votre Arko {eur(houseTotal)} · acompte{" "}
                  {BRAND.deposit.toLocaleString("fr-FR")} €
                </span>
              </div>
              <Button
                href="/configurer"
                variant="accent"
                magnetic={false}
                className="px-5 py-2.5 text-sm"
              >
                Réserver
                <Arrow />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
