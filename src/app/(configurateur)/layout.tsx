import Image from "next/image";
import Link from "next/link";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { CookieBanner } from "@/components/site/CookieBanner";
import { Analytics } from "@/components/site/Analytics";
import { BRAND } from "@/lib/site";

/**
 * Coque du tunnel de configuration — pas de navigation, pas de pied de page.
 *
 * C'est pourquoi le configurateur v2 vit dans son propre groupe de routes
 * plutôt que sous `(public)` : une mise en page imbriquée s'ajoute à la
 * parente, elle ne peut pas en retirer la `<Nav>`. Le groupe est le seul moyen
 * de servir `/configurer/v2` sans le méga-menu ni le compte à rebours.
 *
 * Motif : une fois dans le tunnel, chaque lien sortant est une sortie du
 * parcours. Il reste exactement une porte — le logo, qui ramène à l'accueil.
 *
 * Conservés de la coque publique : `Analytics` et `CookieBanner`, qui portent
 * le consentement (ADR-015) — les retirer ouvrirait un trou de conformité sur
 * la page où l'on saisit ses coordonnées.
 */
export default function ConfigurateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Analytics />
      <SmoothScroll>
        <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-canvas/80 backdrop-blur-md">
          <div className="container-page flex h-16 items-center md:h-[4.5rem]">
            <Link
              href="/"
              aria-label="Howner — revenir à l'accueil"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
            >
              <Image
                src="/images/howner-logo.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-auto"
                priority
              />
              <span className="text-lg font-semibold tracking-tight">
                {BRAND.maker}
              </span>
            </Link>
          </div>
        </header>
        <main id="main-content" className="pt-16 md:pt-[4.5rem]">
          {children}
        </main>
        <CookieBanner />
      </SmoothScroll>
    </>
  );
}
