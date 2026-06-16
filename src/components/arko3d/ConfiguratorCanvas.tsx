"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
  Center,
} from "@react-three/drei";
import { ArkoModel } from "./ArkoModel";
import { COLORS } from "./materials";
import { useVisible } from "./useVisible";

/* Aperçu 3D live du configurateur : recoloration instantanée du bardage,
   rotation auto + manipulation au drag. */
export default function ConfiguratorCanvas({
  cladding,
}: {
  cladding: keyof typeof COLORS.cladding;
}) {
  const { ref, visible } = useVisible<HTMLDivElement>();
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div ref={ref} className="h-full w-full">
    <Canvas
      shadows
      frameloop={visible ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ position: [-9, 4, 10], fov: 32 }}
      gl={{ alpha: true, antialias: true, toneMappingExposure: 1.12 }}
      style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
    >
      <hemisphereLight intensity={0.5} groundColor="#cfcabd" />
      <directionalLight
        position={[7, 12, 6]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0002}
      />
      <Center disableY>
        <ArkoModel cladding={cladding} />
      </Center>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.42} scale={26} blur={2.6} far={8} resolution={1024} color="#3a382f" />
      <Environment resolution={256}>
        <Lightformer intensity={2.4} position={[0, 6, -6]} scale={[14, 6, 1]} />
        <Lightformer intensity={1.4} position={[-6, 4, 4]} scale={[8, 8, 1]} />
        <Lightformer intensity={1.2} position={[6, 3, 4]} scale={[8, 8, 1]} />
        <Lightformer intensity={1.6} position={[0, 8, 2]} scale={[12, 4, 1]} color="#fff7ec" />
      </Environment>
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        autoRotate={!reduce}
        autoRotateSpeed={0.45}
        target={[0, 1.1, 0]}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.1}
        enableDamping
      />
    </Canvas>
    </div>
  );
}
