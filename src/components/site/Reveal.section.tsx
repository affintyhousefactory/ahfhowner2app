"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

const PARTS = [
  { k: "01", t: "Toit plat", d: "Une ligne nette, étanchéité multicouche." },
  { k: "02", t: "Coque bois", d: "Structure isolée, montée et finie au sol." },
  { k: "03", t: "Angle vitré en retrait", d: "La loggia : le dehors entre, à l'abri." },
  { k: "04", t: "Terrasse sur pilotis", d: "Le sol se prolonge, sans toucher la pente." },
];

export function RevealSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, reduce ? 1.12 : 1]);
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", reduce ? "-4%" : "6%"]);

  return (
    <section id="reveler" className="relative bg-ink text-canvas">
      <div className="container-page py-20 md:py-28">
        <Reveal>
          <p className="eyebrow text-canvas/60">La maison qui se révèle</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 max-w-4xl text-balance kinetic text-canvas/95 [font-size:var(--text-h1)]">
            Elle s'ouvre. Tout est déjà là, dedans.
          </h2>
        </Reveal>
      </div>

      {/* Image cinématographique full-bleed avec scrub */}
      <div
        ref={ref}
        className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[16/9]"
      >
        <motion.div style={{ scale, y }} className="absolute inset-0">
          <Image
            src="/assets/arko/exterior/arko-rear.jpg"
            alt="ARKO — l'angle vitré en retrait s'ouvre sur la chambre, terrasse bois"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
      </div>

      {/* Structure révélée */}
      <div className="container-page py-16 md:py-24">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {PARTS.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.06}>
              <div className="border-t border-canvas/15 pt-4">
                <span className="font-mono text-xs text-canvas/50">{p.k}</span>
                <h3 className="mt-2 text-lg font-medium tracking-tight text-canvas">
                  {p.t}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-canvas/60">
                  {p.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
