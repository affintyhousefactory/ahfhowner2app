import * as THREE from "three";

/* Texture procédurale : bardage à lames verticales (standing seam).
   Niveaux de gris -> modulés par material.color (teinte du bardage). */
export function makeSeamTexture(seamPerMeter = 5.5) {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#d8d8d8";
  ctx.fillRect(0, 0, c.width, c.height);
  // creux (ombre) + arête (lumière) pour lire la lame verticale
  ctx.fillStyle = "#bdbdbd";
  ctx.fillRect(0, 0, 2, c.height);
  ctx.fillStyle = "#ececec";
  ctx.fillRect(2, 0, 1, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  // repeat réglé par face via .clone() + repeat.set
  tex.repeat.set(seamPerMeter, 1);
  return tex;
}

export const COLORS = {
  cladding: {
    anthracite: "#3b403d",
    gris: "#b7b9b4",
    bleu: "#5d7d8f",
    vert: "#5c6b44",
  },
  deck: "#b08f66",
  concrete: "#9a9c97",
  frame: "#1c1f1e",
  woodInterior: "#caa978",
  ground: "#cfcabd",
} as const;
