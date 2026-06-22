import { NextRequest, NextResponse } from "next/server";

export type ParcelleData = {
  found: boolean;
  parcelle: string;
  address_label?: string;
  zone_urba?: string;
  libelong?: string;
  typezone?: string;
  typedoc?: string;
  etat_doc?: string;
  datappro?: string;
  prescriptions?: string[];
  servitudes?: string[];
};

/* ── Types GPU ──────────────────────────────────────────────────── */

type GpuFeature = {
  type: "Feature";
  properties: Record<string, string | number | null>;
};

type GpuCollection = { type: "FeatureCollection"; features: GpuFeature[] };

/* ── Géocodage adresse → { lon, lat, label } ─────────────────────  */

type BanFeature = {
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

  const data = (await res.json()) as { features: BanFeature[] };
  const f = data.features?.[0];
  if (!f) return null;

  const [lon, lat] = f.geometry.coordinates;
  return { lon, lat, label: f.properties.label };
}

/* ── Parcelle par coordonnées (apicarto) → idu ──────────────────── */

type CartoParcelle = {
  properties: { idu: string };
  geometry: { type: string; coordinates: number[][][][] };
};

async function resolveParcelleFromCoords(lon: number, lat: number): Promise<string | null> {
  const geom = JSON.stringify({ type: "Point", coordinates: [lon, lat] });
  const url = new URL("https://apicarto.ign.fr/api/cadastre/parcelle");
  url.searchParams.set("geom", geom);
  url.searchParams.set("_limit", "1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { features?: CartoParcelle[] };
  return data.features?.[0]?.properties?.idu ?? null;
}

/* ── Parcelle par code_insee + section + numéro (voie B) ────────── */

async function resolveParcelleAndCoords(
  code_insee: string,
  section: string,
  numero: string,
): Promise<{ idu: string; lon: number; lat: number } | null> {
  const url = new URL("https://apicarto.ign.fr/api/cadastre/parcelle");
  url.searchParams.set("code_insee", code_insee);
  url.searchParams.set("section", section);
  url.searchParams.set("numero", numero);
  url.searchParams.set("_limit", "1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { features?: CartoParcelle[] };
  const f = data.features?.[0];
  if (!f) return null;

  const { idu } = f.properties;
  const [lon, lat] = polygonCentroid(f.geometry.coordinates[0][0]);
  return { idu, lon, lat };
}

/* ── Centroïde approximé depuis un anneau extérieur polygone ─────── */

function polygonCentroid(ring: number[][]): [number, number] {
  let sumLon = 0, sumLat = 0;
  for (const [lon, lat] of ring) { sumLon += lon; sumLat += lat; }
  return [sumLon / ring.length, sumLat / ring.length];
}

/* ── Parse idu utilisateur → code_insee + section + numéro ─────── */

function parseParcelle(raw: string): { code_insee: string; section: string; numero: string } | null {
  const clean = raw.trim().toUpperCase().replace(/[\s\-_.]/g, "");
  // Format attendu: 5 chiffres (dept+commune) + chiffres optionnels (préfixe) + 1-2 lettres + 3-5 chiffres
  const m = clean.match(/^(\d{5})\d{0,5}([A-Z]{1,2})(\d{3,5})$/);
  if (!m) return null;
  return {
    code_insee: m[1],
    section: m[2],
    numero: m[3].padStart(4, "0"),
  };
}

/* ── Appels GPU par coordonnées ─────────────────────────────────── */

async function fetchGpuDu(lon: number, lat: number, typeName: string): Promise<GpuFeature[]> {
  const url = `https://www.geoportail-urbanisme.gouv.fr/api/feature-info/du?lon=${lon}&lat=${lat}&typeName=${typeName}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "HOWNER/1.0 (contact@affinityhousefactory.com)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as GpuCollection;
  return data.features ?? [];
}

async function fetchGpuSup(lon: number, lat: number): Promise<GpuFeature[]> {
  const url = `https://www.geoportail-urbanisme.gouv.fr/api/feature-info/sup?lon=${lon}&lat=${lat}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "HOWNER/1.0 (contact@affinityhousefactory.com)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as GpuCollection | GpuFeature[];
  return Array.isArray(data) ? data : (data.features ?? []);
}

/* ── Analyse GPU complète → ParcelleData ───────────────────────── */

async function analyseCoords(
  lon: number,
  lat: number,
  parcelle: string,
  addressLabel?: string,
): Promise<NextResponse> {
  const [zoneFeatures, prxPct, prxLin, prxSurf, supFeatures] = await Promise.all([
    fetchGpuDu(lon, lat, "zone_urba"),
    fetchGpuDu(lon, lat, "prescription_pct"),
    fetchGpuDu(lon, lat, "prescription_lin"),
    fetchGpuDu(lon, lat, "prescription_surf"),
    fetchGpuSup(lon, lat),
  ]);

  if (!zoneFeatures.length) {
    return NextResponse.json<ParcelleData>({ found: false, parcelle, address_label: addressLabel });
  }

  const z = zoneFeatures[0].properties;

  // Extraire type doc + date depuis idurba (ex: "64102_PLU_20250927")
  const idurba = (z.idurba as string) ?? "";
  const idurbaMatch = idurba.match(/_([A-Z]+(?:i[A-Z]*)?)_(\d{8})$/i);
  const typedoc = idurbaMatch?.[1]?.toUpperCase() ?? undefined;
  const datappro = idurbaMatch?.[2] ?? (z.datappro as string | null) ?? (z.datvalid as string | null) ?? undefined;

  // Prescriptions : libelle ou typepsc
  const allPrx = [...prxPct, ...prxLin, ...prxSurf];
  const prescriptions = allPrx
    .map((f) => (f.properties.libelle ?? f.properties.typepsc) as string | null)
    .filter((s): s is string => !!s)
    .slice(0, 10);

  // Servitudes : suptype lisible
  const servitudes = supFeatures
    .map((f) => (f.properties.suptype as string | null))
    .filter((s): s is string => !!s)
    .map((t) => t.toUpperCase())
    .slice(0, 10);

  return NextResponse.json<ParcelleData>({
    found: true,
    parcelle,
    address_label: addressLabel,
    zone_urba: z.libelle as string,
    libelong: (z.libelong ?? z.destdomi) as string | undefined,
    typezone: z.typezone as string,
    typedoc,
    etat_doc: "opposable",
    datappro,
    prescriptions,
    servitudes,
  });
}

/* ── Handler principal ──────────────────────────────────────────── */

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

      // Parcelle en parallèle de l'analyse GPU (facultatif — pour le CTA)
      const [gpuResponse, parcelleId] = await Promise.all([
        analyseCoords(geo.lon, geo.lat, "—", geo.label),
        resolveParcelleFromCoords(geo.lon, geo.lat),
      ]);

      // Si la résolution cadastrale a réussi, on corrige l'idu dans la réponse
      if (parcelleId) {
        const data = (await gpuResponse.json()) as ParcelleData;
        return NextResponse.json<ParcelleData>({ ...data, parcelle: parcelleId });
      }
      return gpuResponse;
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

    return analyseCoords(parcelleData.lon, parcelleData.lat, parcelleData.idu);
  } catch {
    return NextResponse.json({ error: "gpu_unavailable" }, { status: 503 });
  }
}
