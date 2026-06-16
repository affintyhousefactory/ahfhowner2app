"use client";

import { useEffect, useRef, useState } from "react";

/* Vrai quand l'élément est (presque) à l'écran. Sert à mettre en pause
   le rendu WebGL des Canvas hors-vue et à ne charger les vidéos lourdes
   qu'à l'approche (perf / batterie). Démarre à false : on ne télécharge
   rien tant que l'IntersectionObserver n'a pas confirmé la proximité —
   sinon tous les <video autoPlay> se chargent dès le 1er paint. */
export function useVisible<T extends HTMLElement>(rootMargin = "250px") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, visible };
}
