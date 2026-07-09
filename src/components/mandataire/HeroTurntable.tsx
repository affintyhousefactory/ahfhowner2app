"use client";

import Image from "next/image";
import { useVisible } from "@/components/arko3d/useVisible";

export function HeroTurntable() {
  const { ref, visible } = useVisible<HTMLDivElement>("300px");

  return (
    <div ref={ref} className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-[#7469F4]/10">
      {visible ? (
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/assets/arko/video/turntable-poster.jpg"
        >
          <source src="/assets/arko/video/turntable.mp4" type="video/mp4" />
        </video>
      ) : (
        <Image
          src="/assets/arko/video/turntable-poster.jpg"
          alt="Maison ARKO en vue 360°"
          fill
          sizes="(min-width: 1024px) 480px, 90vw"
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6">
        <p className="text-sm font-semibold text-white">L&apos;ARKO</p>
        <p className="mt-1 text-xs leading-relaxed text-white/85">
          Il ne lui manque qu&apos;un terrain. Trouvez-le, HOWNER s&apos;occupe du reste.
        </p>
      </div>
    </div>
  );
}
