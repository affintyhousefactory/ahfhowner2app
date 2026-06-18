import { NextRequest, NextResponse } from "next/server";

type Zone = { commune: string; cp: string };

type Payload = {
  nom: string;
  telephone: string;
  email: string;
  zones: Zone[];
  accepte_cgv: boolean;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;

  const { nom, telephone, email, zones, accepte_cgv } = body;

  if (!nom || !telephone || !email || !zones?.length || !accepte_cgv) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    // Phase 4 non activée : lead perdu côté base, mais UX préservée
    console.warn("[recherche-terrain] Supabase non configuré — lead non persisté.");
    return NextResponse.json({ success: true, persisted: false });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/recherche_terrain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnon,
      Authorization: `Bearer ${supabaseAnon}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ nom, telephone, email, zones, accepte_cgv }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[recherche-terrain] Supabase error:", err);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ success: true, persisted: true });
}
