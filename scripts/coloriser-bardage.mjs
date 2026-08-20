/**
 * Colorisation du bardage — rendus de teinte de l'Arko Max.
 *
 * Le rendu source fourni le 2026-08-20 montre un bardage bois clair, qui
 * **n'est pas une option du produit** (précision de Richard) : c'est une prise
 * de vue non conforme. Les trois teintes du nuancier en sont dérivées ici,
 * faute de rendus 3D dédiés.
 *
 * Principe : ne remplacer que la chromie, jamais la luminance. Garder la
 * valeur HSV préserve le relief des lames, les ombres portées et les reflets —
 * c'est ce qui distingue une recoloration crédible d'un aplat de peinture.
 *
 * Le masque combine deux critères, et les deux sont nécessaires :
 *   — chromatique : le bardage est le seul brun clair et saturé de l'image ;
 *   — géométrique : le feuillage roux, les reflets dans les baies et les herbes
 *     sèches partagent exactement cette chromie. Seule la position les sépare.
 *
 * La terrasse est du même bois et reste intacte : elle n'est pas une option de
 * teinte (fiche technique — « bois sur pilotis »). Le pignon anthracite l'est
 * aussi, sa teinte tombant hors de la plage brune.
 *
 * ⚠ Les coordonnées du masque sont **propres à ce rendu**. Un nouveau visuel
 * demande de les reprendre — lancer d'abord avec `debug` pour visualiser la
 * zone retenue en rouge.
 *
 * Usage :
 *   node scripts/coloriser-bardage.mjs "#9b9b9b" sortie.jpg
 *
 * Teintes produites le 2026-08-20 : #9b9b9b (gris clair), #45474a (gris
 * anthracite), #5a6a43 (vert) — celles-là mêmes que porte `config.ts`.
 */
import sharp from "sharp";

/* Colorisation du bardage : on ne remplace que la chromie, jamais la
   luminance. Garder V (la valeur HSV) préserve le relief des lames, les
   ombres portées et les reflets — c'est ce qui distingue une recoloration
   crédible d'un aplat de peinture. */
const rgb2hsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max];
};
const hsv2rgb = (h, s, v) => {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
};

const SRC = "public/assets/arko/max/ecrin.avif";
const LARGEUR = 2000;

export async function coloriser(cible, sortie, { debug = false } = {}) {
  const img = sharp(SRC).resize({ width: LARGEUR });
  const { data, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const out = Buffer.from(data);

  const [hc, sc, vc] = rgb2hsv(...cible);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const [h, s, v] = rgb2hsv(data[i], data[i + 1], data[i + 2]);

      /* Le bardage est le seul brun clair et saturé de l'image au-dessus de la
         ligne de terrasse. La végétation est verte (h > 60), le ciel et
         l'anthracite sont désaturés ou très sombres. */
      const brun = h >= 4 && h <= 52 && s >= 0.06 && v >= 0.15;
      /* Garde spatiale — indispensable : le feuillage roux de gauche, les
         reflets dans les vitrages et les herbes sèches partagent exactement la
         chromie du bardage. Seule la géométrie les sépare.

         La façade est un quadrilatère : bord haut fuyant (la toiture s'éloigne
         vers la droite), bord bas rectiligne au niveau de la terrasse. On
         interpole le bord haut sur x. La terrasse, du même bois, tombe sous le
         bord bas et reste donc intacte — elle n'est pas une option de teinte
         (fiche technique : « bois sur pilotis »). */
      const fx = x / W, fy = y / H;
      const dansLaFacade = (() => {
        if (fx < 0.1925 || fx > 0.6775) return false;
        const t = (fx - 0.1925) / (0.6775 - 0.1925);
        const haut = 0.430 + (0.252 - 0.430) * t;
        /* Bord bas incliné comme le haut : la terrasse remonte vers la
           droite. Une limite horizontale débordait sur les lames de terrasse
           à gauche. */
        const bas = 0.706 + (0.752 - 0.706) * t;
        if (!(fy > haut && fy < bas)) return false;
        /* Les baies renvoient le feuillage et la lumière rasante : dans le
           verre, le reflet a exactement la chromie du bardage. Aucun seuil
           colorimétrique ne les sépare — seule leur position le peut. */
        const baies = [
          { x1: 0.243, x2: 0.288, y1: 0.472, y2: 0.705 },
          { x1: 0.333, x2: 0.443, y1: 0.432, y2: 0.705 },
        ];
        return !baies.some((b) => fx > b.x1 && fx < b.x2 && fy > b.y1 && fy < b.y2);
      })();

      if (!(brun && dansLaFacade)) continue;

      if (debug) { out[i] = 255; out[i + 1] = 0; out[i + 2] = 0; continue; }

      /* Luminance relative du pixel dans la plage du bardage, reportée sur la
         valeur de la teinte cible : les lames claires restent claires. */
      const ratio = Math.min(v / 0.62, 1.35);
      const [r, g, b] = hsv2rgb(hc, sc * 0.9, Math.min(vc * ratio, 1));
      out[i] = r; out[i + 1] = g; out[i + 2] = b;
    }
  }

  await sharp(out, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 86 }).toFile(sortie);
}

const [, , hex, sortie] = process.argv;
const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
await coloriser(rgb, sortie);
console.log("écrit :", sortie);
