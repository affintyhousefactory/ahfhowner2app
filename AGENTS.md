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
- **Ne pas toucher** `src/components/site/Configurator.tsx` ni `config-store.tsx` (pricing verrouillé — ADR-005).
- Vidéos via `useVisible` (sauf Hero) ; bundle 3D `src/components/arko3d/*` isolé à `/viewer` (ADR-006). Lighthouse 100 / LCP < 0.8s.

## Marque (absolu — ADR-004)
Termes interdits : CCMI, LSF, acier, hors-site, modulaire, préfabriqué, tiny house, conteneur, catalogue, micro-maison. « Notre architecte intégrée » (sans prénom). « Puigbo » (sans accent).

## Secrets (ADR-003)
Montants → `NEXT_PUBLIC_*` (env, fallback). Clés serveur jamais dans Git, jamais côté client. Placeholders uniquement dans la doc.

## Stack
Next.js 16.2.9 App Router · React 19 · TypeScript · Tailwind v4 (`@theme`) · three/r3f (`/viewer` only) · gsap · lenis · framer-motion.
