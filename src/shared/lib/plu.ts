import type { ParcelleData } from "@/shared/types/plu";

/* ── Types internes ─────────────────────────────────────────────── */

type GpuFeature = {
  type: "Feature";
  properties: Record<string, string | number | null>;
};

type GpuCollection = { type: "FeatureCollection"; features: GpuFeature[] };

type BanFeature = {
  geometry: { coordinates: [number, number] };
  properties: { label: string; citycode: string };
};

type CartoParcelle = {
  properties: { idu: string };
  geometry: { type: string; coordinates: number[][][][] };
};

/* ── Géocodage adresse → { lon, lat, label } ─────────────────────  */

export async function geocodeAddress(
  address: string,
): Promise<{ lon: number; lat: number; label: string } | null> {
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

/* ── Géocodage inverse coords → adresse littérale (BAN) ──────────── */

export async function reverseGeocode(lon: number, lat: number): Promise<string | null> {
  const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { features: BanFeature[] };
    return data.features?.[0]?.properties?.label ?? null;
  } catch {
    return null;
  }
}

/* ── Parcelle par coordonnées (apicarto) → idu ──────────────────── */

export async function resolveParcelleFromCoords(lon: number, lat: number): Promise<string | null> {
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

export async function resolveParcelleAndCoords(
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

export function polygonCentroid(ring: number[][]): [number, number] {
  let sumLon = 0, sumLat = 0;
  for (const [lon, lat] of ring) { sumLon += lon; sumLat += lat; }
  return [sumLon / ring.length, sumLat / ring.length];
}

/* ── Parse idu utilisateur → code_insee + section + numéro ─────── */

export function parseParcelle(
  raw: string,
): { code_insee: string; section: string; numero: string } | null {
  const clean = raw.trim().toUpperCase().replace(/[\s\-_.]/g, "");
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
    headers: {
      Accept: "application/json",
      "User-Agent": "HOWNER/1.0 (contact@affinityhousefactory.com)",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as GpuCollection;
  return data.features ?? [];
}

async function fetchGpuSup(lon: number, lat: number): Promise<GpuFeature[]> {
  const url = `https://www.geoportail-urbanisme.gouv.fr/api/feature-info/sup?lon=${lon}&lat=${lat}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "HOWNER/1.0 (contact@affinityhousefactory.com)",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as GpuCollection | GpuFeature[];
  return Array.isArray(data) ? data : (data.features ?? []);
}

/* ── Analyse GPU complète → ParcelleData ───────────────────────── */

export async function analyseCoords(
  lon: number,
  lat: number,
  parcelle: string,
  addressLabel?: string,
): Promise<ParcelleData> {
  const [zoneFeatures, prxPct, prxLin, prxSurf, supFeatures] = await Promise.all([
    fetchGpuDu(lon, lat, "zone_urba"),
    fetchGpuDu(lon, lat, "prescription_pct"),
    fetchGpuDu(lon, lat, "prescription_lin"),
    fetchGpuDu(lon, lat, "prescription_surf"),
    fetchGpuSup(lon, lat),
  ]);

  if (!zoneFeatures.length) {
    return { found: false, parcelle, address_label: addressLabel };
  }

  const z = zoneFeatures[0].properties;

  const idurba = (z.idurba as string) ?? "";
  const idurbaMatch = idurba.match(/_([A-Z]+(?:i[A-Z]*)?)_(\d{8})$/i);
  const typedoc = idurbaMatch?.[1]?.toUpperCase() ?? undefined;
  const datappro =
    idurbaMatch?.[2] ??
    (z.datappro as string | null) ??
    (z.datvalid as string | null) ??
    undefined;

  const allPrx = [...prxPct, ...prxLin, ...prxSurf];
  const prescriptions = allPrx
    .map((f) => (f.properties.libelle ?? f.properties.typepsc) as string | null)
    .filter((s): s is string => !!s)
    .slice(0, 10);

  const servitudes = supFeatures
    .map((f) => (f.properties.suptype as string | null))
    .filter((s): s is string => !!s)
    .map((t) => t.toUpperCase())
    .slice(0, 10);

  return {
    found: true,
    parcelle,
    address_label: addressLabel,
    lon,
    lat,
    zone_urba: z.libelle as string,
    libelong: (z.libelong ?? z.destdomi) as string | undefined,
    typezone: z.typezone as string,
    typedoc,
    etat_doc: "opposable",
    datappro,
    prescriptions,
    servitudes,
  };
}
