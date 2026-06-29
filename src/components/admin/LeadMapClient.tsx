"use client";

import dynamic from "next/dynamic";

const LeadMap = dynamic(() => import("./LeadMap"), { ssr: false });

export default function LeadMapClient({ lon, lat, label }: { lon: number; lat: number; label?: string }) {
  return <LeadMap lon={lon} lat={lat} label={label} />;
}
