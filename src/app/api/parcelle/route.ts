import { NextRequest, NextResponse } from "next/server";

export type ParcelleData = {
  found: boolean;
  parcelle: string;
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

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { parcelle?: string; turnstileToken?: string };
  const { parcelle, turnstileToken } = body;

  if (!parcelle || parcelle.trim().replace(/\s/g, "").length < 10) {
    return NextResponse.json({ error: "invalid_parcelle" }, { status: 400 });
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

  const id = parcelle.trim().toUpperCase().replace(/\s/g, "");

  try {
    const gpuRes = await fetch(`${GPU_BASE}/${id}/`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "HOWNER/1.0 (contact@affinityhousefactory.com)",
      },
      // Cache 24 h — le zonage ne change pas fréquemment
      next: { revalidate: 86400 },
    });

    if (!gpuRes.ok) {
      return NextResponse.json<ParcelleData>({ found: false, parcelle: id });
    }

    const contentType = gpuRes.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json<ParcelleData>({ found: false, parcelle: id });
    }

    const raw = (await gpuRes.json()) as Record<string, unknown[]>;

    // L'API GPU renvoie { zone_urba: [...], prescription_pct: [...], ... }
    const zones = (raw.zone_urba ?? []) as Record<string, unknown>[];

    if (!zones.length) {
      return NextResponse.json<ParcelleData>({ found: false, parcelle: id });
    }

    const z = zones[0];

    // Agréger prescriptions ponctuelles + linéaires + surfaciques
    const rawPrx = [
      ...((raw.prescription_pct ?? []) as Record<string, unknown>[]),
      ...((raw.prescription_lin ?? []) as Record<string, unknown>[]),
      ...((raw.prescription_surf ?? []) as Record<string, unknown>[]),
    ];
    const prescriptions = rawPrx
      .map((p) => ((p.libelle ?? p.libelong ?? p.typepsc) as string | undefined))
      .filter((s): s is string => !!s)
      .slice(0, 10);

    const rawServ = ((raw.servitude ?? []) as Record<string, unknown>[]);
    const servitudes = rawServ
      .map((s) => ((s.libelong ?? s.typesup) as string | undefined))
      .filter((s): s is string => !!s)
      .slice(0, 10);

    return NextResponse.json<ParcelleData>({
      found: true,
      parcelle: id,
      zone_urba: z.libelle as string,
      typezone: z.typezone as string,
      typedoc: z.typedoc as string,
      etat_doc: z.etat as string,
      datappro: z.datappro as string,
      libelle_long: (z.l_zone ?? z.destdomi) as string | undefined,
      prescriptions,
      servitudes,
    });
  } catch {
    return NextResponse.json({ error: "gpu_unavailable" }, { status: 503 });
  }
}
