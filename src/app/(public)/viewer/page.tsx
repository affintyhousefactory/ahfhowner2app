"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
  Grid,
  Center,
} from "@react-three/drei";
import { ArkoModel } from "@/components/arko3d/ArkoModel";
import { COLORS } from "@/components/arko3d/materials";

const CLADDINGS = [
  ["anthracite", "Anthracite"],
  ["gris", "Gris clair"],
  ["bleu", "Bleu pigeon"],
  ["vert", "Vert"],
] as const;

export default function Viewer() {
  const [cladding, setCladding] =
    useState<keyof typeof COLORS.cladding>("anthracite");
  const [deck, setDeck] = useState(true);
  const [interior, setInterior] = useState(true);

  return (
    <div className="fixed inset-0 bg-[#eceae3]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [-10.5, 4.6, 10], fov: 34 }}
        gl={{ antialias: true, toneMappingExposure: 1.15 }}
      >
        <color attach="background" args={["#eceae3"]} />
        <hemisphereLight intensity={0.45} groundColor="#b9b6ac" />
        <directionalLight
          position={[8, 12, 6]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0002}
        />

        <Center disableY position={[0, 0, 0]}>
          <ArkoModel
            cladding={cladding}
            showDeck={deck}
            showInterior={interior}
          />
        </Center>

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.5}
          scale={28}
          blur={2.4}
          far={8}
          resolution={1024}
          color="#3a382f"
        />
        <Grid
          position={[0, 0, 0]}
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.6}
          cellColor="#cfccc2"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#bdb9ad"
          fadeDistance={40}
          fadeStrength={1.5}
          infiniteGrid
        />

        {/* Environnement procédural (réflexions verre, sans réseau) */}
        <Environment resolution={256}>
          <Lightformer intensity={2.4} position={[0, 6, -6]} scale={[14, 6, 1]} />
          <Lightformer intensity={1.4} position={[-6, 4, 4]} scale={[8, 8, 1]} />
          <Lightformer intensity={1.2} position={[6, 3, 4]} scale={[8, 8, 1]} />
          <Lightformer
            intensity={1.6}
            position={[0, 8, 2]}
            scale={[12, 4, 1]}
            color="#fff7ec"
          />
        </Environment>

        <OrbitControls
          makeDefault
          target={[0, 1.2, 0]}
          minDistance={6}
          maxDistance={26}
          maxPolarAngle={Math.PI / 2.05}
          enableDamping
        />
      </Canvas>

      {/* Panneau d'inspection */}
      <div className="pointer-events-none fixed inset-x-0 top-0 flex items-start justify-between p-5">
        <div className="pointer-events-auto rounded-xl border border-black/10 bg-white/80 px-4 py-3 backdrop-blur">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500">
            ARKO — viewer brut · Phase 2
          </p>
          <p className="mt-1 text-sm text-neutral-800">
            Modèle paramétrique · 10 × 4 m · vérification de fidélité
          </p>
        </div>
      </div>

      <div className="pointer-events-auto fixed bottom-5 left-1/2 flex -translate-x-1/2 flex-wrap items-center gap-2 rounded-full border border-black/10 bg-white/85 px-3 py-2 backdrop-blur">
        {CLADDINGS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setCladding(id)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors ${
              cladding === id
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-black/5"
            }`}
          >
            <span
              className="h-3.5 w-3.5 rounded-full ring-1 ring-black/15"
              style={{ backgroundColor: COLORS.cladding[id] }}
            />
            {label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-black/10" />
        <Toggle on={deck} set={setDeck} label="Terrasse" />
        <Toggle on={interior} set={setInterior} label="Intérieur" />
      </div>
    </div>
  );
}

function Toggle({
  on,
  set,
  label,
}: {
  on: boolean;
  set: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => set(!on)}
      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
        on ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-black/5"
      }`}
    >
      {label}
    </button>
  );
}
