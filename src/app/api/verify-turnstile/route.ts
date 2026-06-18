import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ success: false, error: "missing_token" }, { status: 400 });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // En dev sans clé configurée : passe silencieusement
    return NextResponse.json({ success: true });
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const data = await res.json();

  if (!data.success) {
    return NextResponse.json({ success: false, error: "invalid_token" }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
