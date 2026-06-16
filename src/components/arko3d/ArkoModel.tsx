"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSeamTexture, COLORS } from "./materials";

/* ============================================================
   ARKO — modèle paramétrique fidèle aux renders 2023 (40 m²).
   Repère : origine au sol, centre. X = longueur (10 m),
   Z = profondeur (4 m), Y = hauteur. Façade (baie) vers +Z.
   Parties regroupées pour la VUE ÉCLATÉE (prop `explode`).
   ============================================================ */

const L = 10;
const D = 4;
const H = 2.6;
const LIFT = 0.42;
const WT = 0.12;
const SLAB = 0.3;
const FLOOR = 0.2;

const xL = -L / 2;
const xR = L / 2;
const zF = D / 2;
const zB = -D / 2;
const floorTop = LIFT;
const wallTop = LIFT + H;
const wallCY = wallTop / 2 + floorTop / 2;

// Loggia (angle vitré en retrait), coin avant-gauche — chambre agrandie
const LOG_X = xL + 2.9;
const LOG_Z = zF - 1.5;

// Baie coulissante (séjour-cuisine ouvert, étiré)
const BAY_X0 = 0.3;
const BAY_X1 = 4.5;
const BAY_TOP = floorTop + 2.25;

// Bandeau de fenêtres (arrière)
const WIN_SILL = floorTop + 1.2;
const WIN_HEAD = floorTop + 1.95;
const REAR_WINS: [number, number][] = [
  [-4.4, -3.6],
  [-1.0, 0.8],
  [1.4, 2.2],
  [2.8, 3.6],
];

type Mat = THREE.Material | THREE.Material[];

function Box({
  name,
  position,
  size,
  material,
  castShadow = true,
  receiveShadow = true,
}: {
  name?: string;
  position: [number, number, number];
  size: [number, number, number];
  material: Mat;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  return (
    <mesh
      name={name}
      position={position}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      material={material}
    >
      <boxGeometry args={size} />
    </mesh>
  );
}

const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep

export function ArkoModel({
  cladding = "anthracite",
  showDeck = true,
  showInterior = true,
  explode,
}: {
  cladding?: keyof typeof COLORS.cladding;
  showDeck?: boolean;
  showInterior?: boolean;
  explode?: { get: () => number };
}) {
  const M = useMemo(() => {
    const seam = makeSeamTexture();
    const claddingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(COLORS.cladding[cladding]),
      map: seam,
      roughness: 0.74,
      metalness: 0.08,
    });
    const claddingH = claddingMat.clone();
    const seamH = seam.clone();
    seamH.rotation = Math.PI / 2;
    seamH.center.set(0.5, 0.5);
    claddingH.map = seamH;

    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#11171a"),
      roughness: 0.06,
      metalness: 0,
      transparent: true,
      opacity: 0.42,
      envMapIntensity: 1.4,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    const frame = new THREE.MeshStandardMaterial({ color: COLORS.frame, roughness: 0.5, metalness: 0.2 });
    const deck = new THREE.MeshStandardMaterial({ color: COLORS.deck, roughness: 0.82 });
    const concrete = new THREE.MeshStandardMaterial({ color: COLORS.concrete, roughness: 0.9 });
    const wood = new THREE.MeshStandardMaterial({ color: COLORS.woodInterior, roughness: 0.7 });
    const bedMat = new THREE.MeshStandardMaterial({ color: "#3b3a36", roughness: 0.7 });
    const kitchenMat = new THREE.MeshStandardMaterial({ color: "#26282a", roughness: 0.55 });
    return { claddingMat, claddingH, glass, frame, deck, concrete, wood, bedMat, kitchenMat };
  }, [cladding]);

  const clad = M.claddingMat;

  // Refs des assemblages mobiles (vue éclatée)
  const toit = useRef<THREE.Group>(null);
  const facade = useRef<THREE.Group>(null);
  const arriere = useRef<THREE.Group>(null);
  const gauche = useRef<THREE.Group>(null);
  const droit = useRef<THREE.Group>(null);
  const terrasse = useRef<THREE.Group>(null);

  useFrame(() => {
    const raw = explode ? explode.get() : 0;
    const e = ease(Math.max(0, Math.min(1, raw)));
    if (toit.current) {
      toit.current.position.y = e * 2.9;
      toit.current.rotation.z = e * 0.03;
    }
    if (facade.current) facade.current.position.z = e * 2.0;
    if (arriere.current) arriere.current.position.z = -e * 2.0;
    if (gauche.current) gauche.current.position.x = -e * 2.2;
    if (droit.current) droit.current.position.x = e * 2.2;
    if (terrasse.current) {
      terrasse.current.position.z = e * 1.6;
      terrasse.current.position.y = -e * 0.4;
    }
  });

  return (
    <group name="ARKO" dispose={null}>
      {/* ---------- PILOTIS ---------- */}
      <group name="pilotis">
        {[
          [xL + 0.5, zF - 0.5],
          [xL + 0.5, zB + 0.5],
          [0, zF - 0.5],
          [0, zB + 0.5],
          [xR - 0.5, zF - 0.5],
          [xR - 0.5, zB + 0.5],
        ].map(([x, z], i) => (
          <Box key={i} name={`pilotis-${i}`} position={[x, LIFT / 2, z]} size={[0.12, LIFT, 0.12]} material={M.frame} />
        ))}
      </group>

      {/* ---------- DALLE + SOL + MOBILIER (fixes) ---------- */}
      <Box name="dalle-plancher" position={[0, floorTop - FLOOR / 2, 0]} size={[L, FLOOR, D]} material={M.concrete} />
      {showInterior && (
        <>
          <Box name="sol-interieur" position={[0, floorTop + 0.005, 0]} size={[L - 2 * WT, 0.02, D - 2 * WT]} material={M.wood} castShadow={false} />
          <group name="mobilier">
            <Box name="lit" position={[xL + 1.25, floorTop + 0.28, zB + 1.25]} size={[1.8, 0.45, 2.1]} material={M.bedMat} castShadow={false} />
            <Box name="bloc-bain" position={[-1.0, floorTop + 1.1, -0.2]} size={[1.4, 2.2, 1.9]} material={M.wood} castShadow={false} />
            <Box name="cuisine-lineaire" position={[2.6, floorTop + 0.45, zB + 0.45]} size={[4.0, 0.9, 0.65]} material={M.kitchenMat} castShadow={false} />
            <Box name="ilot" position={[2.9, floorTop + 0.42, 0.6]} size={[1.8, 0.85, 0.8]} material={M.kitchenMat} castShadow={false} />
          </group>
        </>
      )}

      {/* ---------- MUR ARRIÈRE (bandeau de fenêtres) ---------- */}
      <group name="mur-arriere" ref={arriere}>
        <Box position={[0, (floorTop + WIN_SILL) / 2, zB + WT / 2]} size={[L, WIN_SILL - floorTop, WT]} material={clad} />
        <Box position={[0, (WIN_HEAD + wallTop) / 2, zB + WT / 2]} size={[L, wallTop - WIN_HEAD, WT]} material={clad} />
        {((): [number, number][] => {
          const segs: [number, number][] = [];
          let cur = xL;
          for (const [a, b] of REAR_WINS) {
            segs.push([cur, a]);
            cur = b;
          }
          segs.push([cur, xR]);
          return segs;
        })().map(([a, b], i) =>
          b - a > 0.001 ? (
            <Box key={i} position={[(a + b) / 2, (WIN_SILL + WIN_HEAD) / 2, zB + WT / 2]} size={[b - a, WIN_HEAD - WIN_SILL, WT]} material={clad} />
          ) : null,
        )}
        <group name="vitrages-bandeau">
          {REAR_WINS.map(([a, b], i) => (
            <Box key={i} name={`fenetre-${i}`} position={[(a + b) / 2, (WIN_SILL + WIN_HEAD) / 2, zB + WT / 2]} size={[b - a, WIN_HEAD - WIN_SILL, 0.04]} material={M.glass} castShadow={false} />
          ))}
        </group>
      </group>

      {/* ---------- MUR DROIT ---------- */}
      <group name="mur-droit" ref={droit}>
        <Box name="mur-droit-m" position={[xR - WT / 2, wallCY, 0]} size={[WT, H, D]} material={clad} />
      </group>

      {/* ---------- CÔTÉ GAUCHE : mur + LOGGIA ---------- */}
      <group name="gauche" ref={gauche}>
        <Box name="mur-gauche" position={[xL + WT / 2, wallCY, (zB + LOG_Z) / 2]} size={[WT, H, LOG_Z - zB]} material={clad} />
        <group name="loggia">
          <Box name="loggia-joue" position={[LOG_X - WT / 2, wallCY, (LOG_Z + zF) / 2]} size={[WT, H, zF - LOG_Z]} material={clad} />
          <Box name="loggia-vitre-fond" position={[(xL + LOG_X) / 2, wallCY, LOG_Z]} size={[LOG_X - xL, H, 0.05]} material={M.glass} castShadow={false} />
          <Box name="loggia-vitre-cote" position={[xL + WT / 2, wallCY, (LOG_Z + zF) / 2]} size={[0.05, H, zF - LOG_Z]} material={M.glass} castShadow={false} />
          <Box name="loggia-sol" position={[(xL + LOG_X) / 2, floorTop - 0.05, (LOG_Z + zF) / 2]} size={[LOG_X - xL, 0.06, zF - LOG_Z]} material={M.concrete} />
        </group>
      </group>

      {/* ---------- FAÇADE : mur + baie coulissante ---------- */}
      <group name="facade" ref={facade}>
        <Box position={[(LOG_X + BAY_X0) / 2, wallCY, zF - WT / 2]} size={[BAY_X0 - LOG_X, H, WT]} material={clad} />
        <Box position={[(BAY_X1 + xR) / 2, wallCY, zF - WT / 2]} size={[xR - BAY_X1, H, WT]} material={clad} />
        <Box position={[(BAY_X0 + BAY_X1) / 2, (BAY_TOP + wallTop) / 2, zF - WT / 2]} size={[BAY_X1 - BAY_X0, wallTop - BAY_TOP, WT]} material={clad} />
        <group name="baie-coulissante">
          <Box name="baie-1" position={[(BAY_X0 + 2.4) / 2, (floorTop + BAY_TOP) / 2, zF - WT / 2]} size={[2.4 - BAY_X0, BAY_TOP - floorTop, 0.05]} material={M.glass} castShadow={false} />
          <Box name="baie-2" position={[(2.4 + BAY_X1) / 2, (floorTop + BAY_TOP) / 2, zF - WT / 2 - 0.06]} size={[BAY_X1 - 2.4, BAY_TOP - floorTop, 0.05]} material={M.glass} castShadow={false} />
          <Box position={[2.4, (floorTop + BAY_TOP) / 2, zF - WT / 2]} size={[0.06, BAY_TOP - floorTop, 0.1]} material={M.frame} castShadow={false} />
        </group>
      </group>

      {/* ---------- TOIT (dalle + acrotère) ---------- */}
      <group name="toit" ref={toit}>
        <Box name="dalle-toit" position={[0, wallTop + SLAB / 2, 0.06]} size={[L + 0.3, SLAB, D + 0.42]} material={M.claddingH} />
        <Box name="acrotere-arr" position={[0, wallTop + SLAB + 0.09, zB - 0.18]} size={[L + 0.3, 0.18, 0.08]} material={M.claddingH} />
        <Box name="acrotere-av" position={[0, wallTop + SLAB + 0.09, zF + 0.18]} size={[L + 0.3, 0.18, 0.08]} material={M.claddingH} />
        <Box name="acrotere-g" position={[xL - 0.11, wallTop + SLAB + 0.09, 0.06]} size={[0.08, 0.18, D + 0.42]} material={M.claddingH} />
        <Box name="acrotere-d" position={[xR + 0.11, wallTop + SLAB + 0.09, 0.06]} size={[0.08, 0.18, D + 0.42]} material={M.claddingH} />
      </group>

      {/* ---------- TERRASSE ---------- */}
      {showDeck && (
        <group name="terrasse" ref={terrasse}>
          <Box name="terrasse-plateau" position={[(LOG_X + xR) / 2, floorTop - 0.06, zF + 1.1]} size={[xR - LOG_X, 0.1, 2.2]} material={M.deck} />
          {[
            [LOG_X + 0.4, zF + 0.4],
            [LOG_X + 0.4, zF + 1.9],
            [xR - 0.4, zF + 0.4],
            [xR - 0.4, zF + 1.9],
            [(LOG_X + xR) / 2, zF + 1.9],
          ].map(([x, z], i) => (
            <Box key={i} name={`terrasse-pilotis-${i}`} position={[x, (floorTop - 0.1) / 2, z]} size={[0.1, floorTop - 0.1, 0.1]} material={M.frame} />
          ))}
        </group>
      )}
    </group>
  );
}
