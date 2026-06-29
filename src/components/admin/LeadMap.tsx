"use client";

import { useEffect, useRef } from "react";

interface LeadMapProps {
  lon: number;
  lat: number;
  label?: string;
}

export default function LeadMap({ lon, lat, label }: LeadMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mounted.current) return;
    mounted.current = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;

    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L: any = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!containerRef.current) return;
      map = L.map(containerRef.current, { zoomControl: true }).setView([lat, lon], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(label ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`)
        .openPopup();
    })();

    return () => {
      map?.remove();
      mounted.current = false;
    };
  }, [lat, lon, label]);

  return (
    <div
      ref={containerRef}
      className="mt-4 h-52 w-full overflow-hidden rounded-xl border border-white/10"
    />
  );
}
