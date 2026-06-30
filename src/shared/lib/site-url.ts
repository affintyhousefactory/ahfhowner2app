import { NextRequest } from "next/server";

/**
 * Retourne l'URL publique du site pour les liens dans les emails.
 * Priorité : NEXT_PUBLIC_SITE_URL > VERCEL_URL (auto Vercel) > req.nextUrl.origin
 */
export function getSiteUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return req.nextUrl.origin;
}
