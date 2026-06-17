import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/site";

// Aperçu social 1200×630 généré à la volée (next/og) — typographique, sobre,
// aux tokens charte Affinity. Aucun asset requis (ADR-018). Neutre vis-à-vis
// de la charte tant qu'elle n'est pas validée par Albert (ADR-002).
export const alt = "HOWNER — Une maison compacte faite pour vous";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f6f7f9",
          color: "#0d141a",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: "0.42em",
            fontWeight: 600,
            color: "#3a5a86",
          }}
        >
          {BRAND.maker}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05 }}>
            {BRAND.baseline}
          </div>
          <div style={{ fontSize: 34, color: "#727586", lineHeight: 1.3 }}>
            {BRAND.subline}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: 26,
            color: "#727586",
          }}
        >
          <div style={{ width: "64px", height: "4px", background: "#3a5a86" }} />
          {BRAND.madeIn}
        </div>
      </div>
    ),
    { ...size },
  );
}
