import dns from "node:dns/promises";
import net from "node:net";
import * as cheerio from "cheerio";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 Mo
const MAX_REDIRECTS = 3;

export class ScrapeError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // link-local + metadata cloud
    if (a === 0) return true;
    return false;
  }
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // ULA
  if (lower.startsWith("fe80")) return true; // link-local
  return false;
}

async function resolveAndValidate(hostname: string): Promise<void> {
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new ScrapeError("URL interdite (IP privée)", 400);
    return;
  }
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new ScrapeError("Nom de domaine introuvable", 400);
  }
  if (addresses.length === 0) throw new ScrapeError("Nom de domaine introuvable", 400);
  for (const { address } of addresses) {
    if (isPrivateIp(address)) {
      throw new ScrapeError("URL interdite (résout vers une IP privée)", 400);
    }
  }
}

function assertPublicHttpUrl(url: URL): void {
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new ScrapeError("Seuls les liens http/https sont autorisés", 400);
  }
}

async function readBoundedBody(res: Response): Promise<Uint8Array> {
  const contentLength = res.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    throw new ScrapeError("Page trop volumineuse", 413);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new ScrapeError("Réponse vide", 502);

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) throw new ScrapeError("Page trop volumineuse", 413);
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

async function fetchWithSsrfGuard(
  rawUrl: string,
  options?: { referer?: string },
): Promise<{ res: Response; finalUrl: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ScrapeError("URL invalide", 400);
  }
  assertPublicHttpUrl(url);

  let currentUrl = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await resolveAndValidate(currentUrl.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(currentUrl.toString(), {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; HownerBot/1.0)",
          ...(options?.referer ? { Referer: options.referer } : {}),
        },
      });
    } catch {
      throw new ScrapeError("Échec de connexion à la page (timeout ou refus)", 504);
    } finally {
      clearTimeout(timer);
    }

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) throw new ScrapeError("Redirection sans destination", 502);
      currentUrl = new URL(location, currentUrl);
      assertPublicHttpUrl(currentUrl);
      continue;
    }

    if (res.status === 404) throw new ScrapeError("Page introuvable (404)", 404);
    if (!res.ok) throw new ScrapeError(`Erreur ${res.status} en récupérant la page`, 502);

    return { res, finalUrl: currentUrl.toString() };
  }
  throw new ScrapeError("Trop de redirections", 502);
}

export async function fetchAnnoncePage(rawUrl: string): Promise<{ html: string; finalUrl: string }> {
  const { res, finalUrl } = await fetchWithSsrfGuard(rawUrl);
  const buffer = await readBoundedBody(res);
  return { html: Buffer.from(buffer).toString("utf-8"), finalUrl };
}

export async function fetchBinaryResource(
  rawUrl: string,
  options?: { referer?: string },
): Promise<{ buffer: Uint8Array; contentType: string }> {
  const { res } = await fetchWithSsrfGuard(rawUrl, options);
  const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "application/octet-stream";
  const buffer = await readBoundedBody(res);
  return { buffer, contentType };
}

export interface ExtractedPage {
  title: string;
  metaDescription: string;
  jsonLd: unknown[];
  cleanedText: string;
  images: string[];
}

const IMAGE_EXCLUDE_PATTERN =
  /logo|icon|favicon|sprite|placeholder|profile-picture|avatar|broadcast|plan-?localisation|static-?map|maps\.google|carte|similaire|autres?-?annonces?|autres?-?biens?|recommand|suggest/i;

// .svg n'est jamais une vraie photo (icônes/décorations) — webp/avif/gif sont en revanche
// des formats de photo légitimes (ex: iad sert sa galerie en webp) : uploadFichePhoto les
// convertit désormais en JPEG à l'import, donc on ne les exclut plus ici.
const UNSUPPORTED_IMAGE_EXTENSION = /\.svg$/i;

// Une annonce présente rarement plus de 6-8 photos dans sa galerie principale ; au-delà,
// on récupère presque toujours du contenu hors-sujet (biens similaires, plans, pied de page).
const MAX_IMAGES = 8;

export function extractPageContent(html: string, baseUrl: string): ExtractedPage {
  const $ = cheerio.load(html);

  // Capturer le JSON-LD AVANT de nettoyer les <script> — sinon perdu.
  const jsonLd: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    try {
      jsonLd.push(JSON.parse(raw));
    } catch {
      // JSON-LD malformé, on ignore silencieusement ce bloc
    }
  });

  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";

  // Retirer nav/header/footer/aside AVANT de collecter les images : ces zones contiennent
  // presque toujours du contenu hors annonce (biens similaires en pied de page, logos,
  // widgets de navigation) plutôt que la galerie principale du bien.
  $("script, style, nav, header, footer, aside, noscript, iframe, svg").remove();

  const rawImageUrls: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src) rawImageUrls.push(src);
  });

  const cleanedText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 15_000);

  const resolvedUrls = rawImageUrls
    .map((src) => {
      try {
        return new URL(src, baseUrl);
      } catch {
        return null;
      }
    })
    .filter((u): u is URL => !!u)
    .filter((u) => !IMAGE_EXCLUDE_PATTERN.test(u.toString()))
    .filter((u) => !UNSUPPORTED_IMAGE_EXTENSION.test(u.pathname));

  // Déduplication par chemin (en ignorant les query params de format/résolution) pour
  // éviter de proposer plusieurs fois la même photo en tailles différentes. L'ordre du DOM
  // est conservé (donc les images du haut de l'annonce, en général la galerie principale,
  // sont prioritaires) et on plafonne à MAX_IMAGES pour ne garder que celles-ci.
  const seenPaths = new Set<string>();
  const images: string[] = [];
  for (const u of resolvedUrls) {
    const key = `${u.origin}${u.pathname}`;
    if (seenPaths.has(key)) continue;
    seenPaths.add(key);
    images.push(u.toString());
    if (images.length >= MAX_IMAGES) break;
  }

  return { title, metaDescription, jsonLd, cleanedText, images };
}
