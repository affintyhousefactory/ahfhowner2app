/* ============================================================
   Lien d'appel — drapeau France + numéro, infobulle « Nous appeler ».
   Servi dans l'en-tête du site (Nav) et dans celui du tunnel (TunnelHeader).

   Aucun JavaScript : l'infobulle est en CSS pur (`group-hover` /
   `group-focus-visible`). Un composant sans état ne pèse rien dans le bundle
   et reste utilisable côté serveur — les deux en-têtes sont déjà des
   composants clients, mais ce lien n'a aucune raison de le devenir (ADR-006).

   Le numéro et sa forme composable viennent de `CONTACT` (site.ts), jamais
   écrits ici.
   ============================================================ */
import { CONTACT } from "@/lib/site";
import { cn } from "@/shared/lib/cn";

/* Drapeau français — SVG inline, trois bandes. Le liseré est nécessaire :
   sans lui, la bande blanche disparaît sur le fond clair du site. */
function DrapeauFrance({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 3 2"
      width="15"
      height="10"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0 rounded-[1px] ring-1 ring-ink/15", className)}
    >
      <rect width="1" height="2" x="0" fill="#002395" />
      <rect width="1" height="2" x="1" fill="#ffffff" />
      <rect width="1" height="2" x="2" fill="#ED2939" />
    </svg>
  );
}

function Combine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

export function PhoneLink({
  full = false,
  className,
}: {
  /** Affiche le numéro à toutes les largeurs. Par défaut il n'apparaît qu'à
   *  partir de `lg` — en dessous, la barre est déjà serrée et l'icône suffit
   *  à déclencher l'appel en un geste. */
  full?: boolean;
  className?: string;
}) {
  return (
    <a
      href={`tel:${CONTACT.phoneTel}`}
      /* Le libellé accessible porte l'action ET le numéro : l'infobulle,
         purement visuelle, reste `aria-hidden` — sinon un lecteur d'écran
         énoncerait deux fois la même chose. */
      aria-label={`${CONTACT.phoneLabel} au ${CONTACT.phone}`}
      /* La taille du texte vit sur le lien, pas sur le numéro : le libellé en
         hérite, et un appelant peut l'agrandir d'une classe (`text-sm` sur la
         page contact) sans que le composant expose une variante. */
      className={cn(
        "group relative flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs",
        "text-ink/70 transition-colors hover:border-ink/25 hover:text-ink",
        className,
      )}
    >
      <Combine className="text-accent" />
      <DrapeauFrance />
      <span
        className={cn(
          "whitespace-nowrap font-mono",
          full ? "inline" : "hidden lg:inline",
        )}
      >
        {CONTACT.phone}
      </span>

      {/* Infobulle — sous le lien, centrée. `pointer-events-none` évite
          qu'elle intercepte le clic ou provoque un aller-retour de survol. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2",
          "whitespace-nowrap rounded-full bg-ink px-2.5 py-1 font-mono text-[0.65rem] tracking-wide text-canvas",
          "opacity-0 transition-opacity duration-200 motion-reduce:transition-none",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
        )}
      >
        {CONTACT.phoneLabel}
      </span>
    </a>
  );
}
