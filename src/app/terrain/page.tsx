import type { Metadata } from "next";
import { LandTool } from "@/components/site/LandTool";

export const metadata: Metadata = {
  title: "Votre terrain | HOWNER",
  description:
    "Vérifiez une adresse ou une annonce, estimez la livraison et la constructibilité indicative pour votre Arko. Ou trouvez une parcelle compatible.",
  alternates: { canonical: "/terrain" },
};

export default function TerrainPage() {
  return (
    <main className="pt-16 md:pt-[4.5rem]">
      <LandTool />
    </main>
  );
}
