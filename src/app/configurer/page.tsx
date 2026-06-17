import type { Metadata } from "next";
import { Configurator } from "@/components/site/Configurator";
import { Reservation } from "@/components/site/Reservation";
import { ProductSync } from "@/components/site/ProductSync";

export const metadata: Metadata = {
  title: "Configurer & réserver | HOWNER",
  description:
    "Configurez votre Arko One (20 m²) ou Arko Max (40 m²) et réservez votre exemplaire numéroté. Devis indicatif en direct.",
};

export default function ConfigurerPage() {
  return (
    <main className="pt-16 md:pt-[4.5rem]">
      <ProductSync />
      <Configurator />
      <Reservation />
    </main>
  );
}
