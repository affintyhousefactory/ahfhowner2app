<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Conventions projet — Howner / ARKO

## Ordre de lecture (début de session) — ADR-019
1. `_RUNTIME/CURRENT_SESSION.md` + `_RUNTIME/active-context.md` — mémoire active courte.
2. `00_INDEX/PROJECT_STATE.md` — **état canonique** (point d'entrée `resume` / `memory-sync`).
3. `00_INDEX/INDEX.md` → HUB du domaine (`HUB_GOUVERNANCE/PRODUCT/FRONTEND/BACKEND/RELEASE`).
4. `CLAUDE.md` — mission, phases, gouvernance, guardrails, alertes Albert.
5. `DESIGN.md` ; puis l'ADR concernée dans `03_DECISIONS/` avant de toucher une feature.

> Une seule vérité d'état = `00_INDEX/PROJECT_STATE.md`. `_RUNTIME` ≠ backlog. Ne pas mélanger les projets.

## Gouvernance
- Toute décision structurante = un ADR dans `03_DECISIONS/` (`ADR-NNN-titre.md`, template `ADR_TEMPLATE.md`).
- Garder l'index ADR de `PROJECT_STATE.md` synchronisé avec les fichiers.

## Guardrails (ne pas régresser)
- **Domaine « Mandataire & Terrain » suspendu** (ADR-028) — masqué derrière `FEATURES.mandataire` (`src/lib/features.ts`). Ne pas re-linker ni ré-exposer une surface suspendue sans lever le flag et amender l'ADR ; toute nouvelle surface du domaine naît gardée (`guardMandataire()` / `mandataireDisabled()`).
- **Configurateur : verrou levé** (ADR-030 remplace ADR-005/020). `Configurator.tsx` et `config-store.tsx` sont réécrits. Règle qui remplace l'ancienne : **grilles jamais en dur** — prix, paliers et options éditables sans redéploiement.
- Vidéos via `useVisible` (sauf Hero) ; bundle 3D `src/components/arko3d/*` isolé à `/viewer` (ADR-006). Lighthouse 100 / LCP < 0.8s.

## Marque (absolu — ADR-029, remplace ADR-004)
> **Amendée le 2026-08-03** : « maison » est passé d'interdit à **imposé** et remplace « module » (accord au féminin). « maison individuelle » reste interdit — régime CCMI.

Termes interdits : **maison individuelle**, résidence principale, **clé en main**, toute raison sociale autre que Howner, tout nom de fournisseur — plus modulaire, préfabriqué, tiny house, conteneur, catalogue.
Vocabulaire imposé : **maison**, unité, studio, hébergement, annexe, espace supplémentaire, prêt à vivre.
« Notre architecte intégrée » (sans prénom). « Puigbo » (sans accent).
Cadre de vente : annexe sur parcelle bâtie ou hébergement professionnel ; terrain nu **non ouvert**.
Contrôle : `npm run check:vocabulaire` avant chaque PR.

## Secrets (ADR-003)
Montants → `NEXT_PUBLIC_*` (env, fallback). Clés serveur jamais dans Git, jamais côté client. Placeholders uniquement dans la doc.

## Stack
Next.js 16.2.9 App Router · React 19 · TypeScript · Tailwind v4 (`@theme`) · three/r3f (`/viewer` only) · gsap · lenis · framer-motion.
