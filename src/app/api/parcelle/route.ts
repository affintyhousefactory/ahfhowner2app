import { NextRequest, NextResponse } from "next/server";

export type ParcelleData = {
  found: boolean;
  parcelle: string;
  address_label?: string;
  zone_urba?: string;
  typezone?: string;
  typedoc?: string;
  etat_doc?: string;
  datappro?: string;
  libelle_long?: string;
  prescriptions?: string[];
  servitudes?: string[];
};

const GPU_BASE = "https://www.geoportail-urbanisme.gouv.fr/api/feature-info/parcel";

/* ── Géocodage adresse → { lon, lat, label } ── */

type GeoFeature = {
  geometry: { coordinates: [number, number] };
  properties: { label: string; citycode: string };
};

async function geocodeAddress(address: string): Promise<{ lon: number; lat: number; label: string } | null> {
  const url = new URL("https://api-adresse.data.gouv.fr/search/");
  url.searchParams.set("q", address);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { features: GeoFeature[] };
  const f = data.features?.[0];
  if (!f) return null;

  const [lon, lat] = f.geometry.coordinates;
  return { lon, lat, label: f.properties.label };
}

/* ── Coordonnées → identifiant parcelle cadastrale (14 chars) ── */

type CadastreFeature = {
  properties: { id: string; numero: string; section: string; commune: string };
};

async function resolveParcelleFromCoords(lon: number, lat: number): Promise<string | null> {
  const url = new URL("https://apicarto.ign.fr/api/cadastre/parcelle");
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("source_ign", "PCI");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { features?: CadastreFeature[] };
  return data.features?.[0]?.properties?.id ?? null;
}

/* ── Analyse GPU parcelle → ParcelleData ── */

async function analyseGPU(id: string, addressLabel?: string): Promise<NextResponse> {
  const gpuRes = await fetch(`${GPU_BASE}/${id}/`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "HOWNER/1.0 (contact@affinityhousefactory.com)",
    },
    next: { revalidate: 86400 },
  });

  if (!gpuRes.ok) {
    return NextResponse.json<ParcelleData>({ found: false, parcelle: id, address_label: addressLabel });
  }

  const contentType = gpuRes.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json<ParcelleData>({ found: false, parcelle: id, address_label: addressLabel });
  }

  const raw = (await gpuRes.json()) as Record<string, unknown[]>;
  const zones = (raw.zone_urba ?? []) as Record<string, unknown>[];

  if (!zones.length) {
    return NextResponse.json<ParcelleData>({ found: false, parcelle: id, address_label: addressLabel });
  }

  const z = zones[0];

  const rawPrx = [
    ...((raw.prescription_pct ?? []) as Record<string, unknown>[]),
    ...((raw.prescription_lin ?? []) as Record<string, unknown>[]),
    ...((raw.prescription_surf ?? []) as Record<string, unknown>[]),
  ];
  const prescriptions = rawPrx
    .map((p) => ((p.libelle ?? p.libelong ?? p.typepsc) as string | undefined))
    .filter((s): s is string => !!s)
    .slice(0, 10);

  const rawServ = (raw.servitude ?? []) as Record<string, unknown>[];
  const servitudes = rawServ
    .map((s) => ((s.libelong ?? s.typesup) as string | undefined))
    .filter((s): s is string => !!s)
    .slice(0, 10);

  return NextResponse.json<ParcelleData>({
    found: true,
    parcelle: id,
    address_label: addressLabel,
    zone_urba: z.libelle as string,
    typezone: z.typezone as string,
    typedoc: z.typedoc as string,
    etat_doc: z.etat as string,
    datappro: z.datappro as string,
    libelle_long: (z.l_zone ?? z.destdomi) as string | undefined,
    prescriptions,
    servitudes,
  });
}

/* ── Handler ── */

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    address?: string;
    parcelle?: string;
    turnstileToken?: string;
  };
  const { address, parcelle, turnstileToken } = body;

  // Validation : au moins une des deux entrées
  const hasAddress = address && address.trim().length >= 5;
  const hasParcelle = parcelle && parcelle.trim().replace(/\s/g, "").length >= 10;

  if (!hasAddress && !hasParcelle) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  // Vérification Turnstile
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
    // Voie A — adresse
    if (hasAddress) {
      const geo = await geocodeAddress(address!.trim());
      if (!geo) {
        return NextResponse.json({ error: "address_not_found" }, { status: 404 });
      }

      const parcelleId = await resolveParcelleFromCoords(geo.lon, geo.lat);
      if (!parcelleId) {
        return NextResponse.json({ error: "parcelle_not_found" }, { status: 404 });
      }

      return analyseGPU(parcelleId, geo.label);
    }

    // Voie B — numéro parcelle direct
    const id = parcelle!.trim().toUpperCase().replace(/\s/g, "");
    return analyseGPU(id);
  } catch {
    return NextResponse.json({ error: "gpu_unavailable" }, { status: 503 });
  }
}
