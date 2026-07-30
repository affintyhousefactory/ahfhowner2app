/**
 * Interrupteurs de fonctionnalités — ADR-028.
 *
 * `mandataire` couvre l'ensemble du domaine « Mandataire & Terrain » :
 * portail mandataire, onboarding, affectation mandataire ↔ lead et GED
 * mandataire côté admin, écrans admin Mandataires / Affectations / GED
 * Dossiers / Terrains, pages publiques `/terrains`, `/rechercheterrain`,
 * `/terrain`, `/cgu-mandataire`, et le mode « Je cherche un terrain » du
 * configurateur.
 *
 * Le domaine est **suspendu, pas supprimé** : le code, les schémas Supabase,
 * les données et les comptes restent en place. Seules les interfaces et les
 * points d'entrée sont neutralisés.
 *
 * Réactivation : poser `NEXT_PUBLIC_FEATURE_MANDATAIRE=true` (Vercel, ou
 * `.env.local` en dev). Variable absente = suspendu — c'est le défaut sûr.
 * Procédure complète : `03_DECISIONS/ADR-028-suspension-domaine-mandataire.md`
 * § « Procédure de réactivation ».
 */
export const FEATURES = {
  mandataire: process.env.NEXT_PUBLIC_FEATURE_MANDATAIRE === "true",
} as const;

export type FeatureName = keyof typeof FEATURES;
