"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { useVisible } from "@/components/arko3d/useVisible";

type Panel = {
  id: string;
  kind: "video" | "photo";
  src: string;
  poster?: string;
  tag: string;
  title: string;
  text: string;
};

/* Séquence curatée : films Higgsfield + photos, une vue plein cadre par écran. */
const PANELS: Panel[] = [
  {
    id: "ecrin",
    kind: "video",
    src: "/assets/arko/video/aerien.mp4",
    poster: "/assets/arko/video/aerien-poster.jpg",
    tag: "L'écrin",
    title: "Posée dans la forêt.",
    text: "Un volume net dans les pins, au petit matin.",
  },
  {
    id: "sejour",
    kind: "video",
    src: "/assets/arko/video/interieur.mp4",
    poster: "/assets/arko/video/interieur-poster.jpg",
    tag: "Séjour-cuisine",
    title: "Vivre grand dans le juste.",
    text: "Cuisine îlot, plan en marbre, bandeau vitré sur le paysage.",
  },
  {
    id: "chambre",
    kind: "photo",
    src: "/assets/arko/interior/bedroom.jpg",
    tag: "La chambre",
    title: "Le calme, cadré sur l'essentiel.",
    text: "Une fenêtre comme un tableau, la lumière du matin.",
  },
  {
    id: "bain",
    kind: "photo",
    src: "/assets/arko/interior/bathroom.jpg",
    tag: "La salle de bain",
    title: "Net, lumineux, sans superflu.",
    text: "Miroir rond, plan suspendu. Compacte, jamais étriquée.",
  },
  {
    id: "loggia",
    kind: "video",
    src: "/assets/arko/video/loggia.mp4",
    poster: "/assets/arko/video/loggia-poster.jpg",
    tag: "L'angle vitré",
    title: "Le dehors entre. La lumière reste.",
    text: "La loggia se creuse et s'ouvre en grand.",
  },
  {
    id: "terrasse",
    kind: "photo",
    src: "/assets/arko/exterior/arko-rear.jpg",
    tag: "La terrasse",
    title: "Le prolongement, dehors.",
    text: "Terrasse bois sur pilotis, bandeau de fenêtres, volume net.",
  },
  {
    id: "crepuscule",
    kind: "video",
    src: "/assets/arko/video/crepuscule.mp4",
    poster: "/assets/arko/video/crepuscule-poster.jpg",
    tag: "L'heure bleue",
    title: "La nuit tombe. La lumière reste.",
    text: "Au crépuscule, l'angle vitré devient une lanterne dans les pins.",
  },
];

export function Discover() {
  return (
    <section id="decouvrir" className="bg-canvas">
      <div className="container-page py-24 md:py-36">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              002 — Découvrir
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              {PANELS.length} vues
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 max-w-4xl text-balance text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:text-[5rem]">
            Pièce après pièce, on entre.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
            Faites défiler — une vue par écran.
          </p>
        </Reveal>
      </div>

      {PANELS.map((p, i) => (
        <GalleryPanel key={p.id} item={p} index={i + 1} total={PANELS.length} />
      ))}
    </section>
  );
}

function GalleryPanel({
  item,
  index,
  total,
}: {
  item: Panel;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { ref: visRef, visible } = useVisible<HTMLDivElement>("300px");
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  /* Mouvement UNIQUEMENT sur les photos (scale 1 → 1.08 + parallax doux) :
     les vidéos bougent déjà par leur contenu, on les laisse fixes (sinon le
     scale les rend molles). Transform GPU only ; reduced-motion → immobile.
     Le wrapper photo déborde de 8 % pour qu'aucun bord n'apparaisse au parallax. */
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const animate = !reduce && item.kind === "photo";

  const media =
    item.kind === "photo" ? (
      <Image
        src={item.src}
        alt={item.title}
        fill
        sizes="100vw"
        className="object-cover"
      />
    ) : visible ? (
      <video
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={item.poster}
      >
        <source src={item.src} type="video/mp4" />
      </video>
    ) : (
      <Image
        src={item.poster!}
        alt={item.title}
        fill
        sizes="100vw"
        className="object-cover"
      />
    );

  return (
    <div ref={ref} className="relative h-[100svh] w-full overflow-hidden bg-ink">
      {animate ? (
        <motion.div
          ref={visRef}
          style={{ y, scale }}
          className="absolute inset-[-8%] will-change-transform"
        >
          {media}
        </motion.div>
      ) : (
        <div ref={visRef} className="absolute inset-0">
          {media}
        </div>
      )}

      {/* Voile dégradé pour la lisibilité, quelle que soit l'image */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink/85 via-ink/45 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 [text-shadow:0_1px_22px_rgba(10,9,7,0.55)]">
        <div className="container-page pb-10 md:pb-14">
          <div className="flex items-center justify-between border-t border-canvas/30 pt-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/85">
            <span>
              {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")} — {item.tag}
            </span>
            <span className="hidden sm:block">
              {item.kind === "video" ? "Film" : "Vue"} · ARKO
            </span>
          </div>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 max-w-2xl text-xl font-medium leading-snug tracking-tight text-canvas md:text-3xl"
          >
            {item.title}
          </motion.p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-canvas/85">
            {item.text}
          </p>
        </div>
      </div>
    </div>
  );
}
