import { NextRequest, NextResponse } from "next/server";
import {
  geocodeAddress,
  reverseGeocode,
  resolveParcelleFromCoords,
  resolveParcelleAndCoords,
  parseParcelle,
  analyseCoords,
} from "@/shared/lib/plu";
import type { ParcelleData } from "@/shared/types/plu";

export type { ParcelleData };

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    address?: string;
    parcelle?: string;
    turnstileToken?: string;
  };
  const { address, parcelle, turnstileToken } = body;

  const hasAddress = address && address.trim().length >= 5;
  const hasParcelle = parcelle && parcelle.trim().replace(/\s/g, "").length >= 10;

  if (!hasAddress && !hasParcelle) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  // Turnstile
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    if (!turnstileToken) {
      return NextResponse.json({ error: "captcha_required" }, { status: 400 });
    }
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: turnstileToken }),
    });
    const r = (await check.json()) as { success: boolean };
    if (!r.success) {
      return NextResponse.json({ error: "captcha_failed" }, { status: 403 });
    }
  }

  try {
    /* ── Voie A — adresse ── */
    if (hasAddress) {
      const geo = await geocodeAddress(address!.trim());
      if (!geo) {
        return NextResponse.json({ error: "address_not_found" }, { status: 404 });
      }

      const [pluData, parcelleId] = await Promise.all([
        analyseCoords(geo.lon, geo.lat, "—", geo.label),
        resolveParcelleFromCoords(geo.lon, geo.lat),
      ]);

      return NextResponse.json<ParcelleData>(
        parcelleId ? { ...pluData, parcelle: parcelleId } : pluData,
      );
    }

    /* ── Voie B — numéro de parcelle ── */
    const parsed = parseParcelle(parcelle!);
    if (!parsed) {
      return NextResponse.json({ error: "invalid_parcelle" }, { status: 400 });
    }

    const parcelleData = await resolveParcelleAndCoords(parsed.code_insee, parsed.section, parsed.numero);
    if (!parcelleData) {
      return NextResponse.json({ error: "parcelle_not_found" }, { status: 404 });
    }

    const [pluData, addressLabel] = await Promise.all([
      analyseCoords(parcelleData.lon, parcelleData.lat, parcelleData.idu),
      reverseGeocode(parcelleData.lon, parcelleData.lat),
    ]);

    return NextResponse.json<ParcelleData>(
      addressLabel ? { ...pluData, address_label: addressLabel } : pluData,
    );
  } catch {
    return NextResponse.json({ error: "gpu_unavailable" }, { status: 503 });
  }
}
