import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress, analyseCoords } from "@/shared/lib/plu";

// Route admin — même logique que /api/parcelle mais sans Turnstile.
// Accessible uniquement depuis le portail admin (pas exposé publiquement utile car CORS restrictif).
export async function POST(req: NextRequest) {
  const { address } = (await req.json()) as { address?: string };

  if (!address || address.trim().length < 5) {
    return NextResponse.json({ error: "Adresse requise (min 5 caractères)" }, { status: 400 });
  }

  const geo = await geocodeAddress(address.trim());
  if (!geo) {
    return NextResponse.json({ error: "Adresse introuvable via BAN" }, { status: 422 });
  }

  const result = await analyseCoords(geo.lon, geo.lat, "—", geo.label);
  return NextResponse.json(result);
}
