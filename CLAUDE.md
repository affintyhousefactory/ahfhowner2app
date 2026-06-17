@AGENTS.md

# CLAUDE.md — Howner / ARKO

Site mono-produit de réservation **ARKO** (série limitée 12 exemplaires). Front complet ; backend en attente (Phase 4).

## ⚠️ Interlocuteur — lecture OBLIGATOIRE en début de session
Avant toute reco ou décision, lire `PROFIL.md` (vulgarisation + posture). Convention : `rules/discovery/profil-md-convention.md`.

## ⚠️ Lecture obligatoire en début de session
Avant toute reco, décision ou code, lire **dans cet ordre** (ADR-019) :
1. `PROFIL.md` — interlocuteur + posture (mandatory, en tête).
2. `_RUNTIME/CURRENT_SESSION.md` — focus + décisions de la session courante.
3. `_RUNTIME/active-context.md` — priorités + contraintes actives.
4. `00_INDEX/PROJECT_STATE.md` — **état canonique** : phases, blockers, index ADR, prochaine action.
5. `00_INDEX/INDEX.md` → le HUB du domaine concerné (`HUB_GOUVERNANCE/PRODUCT/FRONTEND/BACKEND/RELEASE`).
6. `DESIGN.md`, puis l'ADR concernée dans `03_DECISIONS/` avant de toucher une feature.

> `resume` / `memory-sync` restituent l'avancement depuis `00_INDEX/PROJECT_STATE.md` + `_RUNTIME/`. Tenir à jour « Dernier point » (PROJECT_STATE) et `CURRENT_SESSION.md` en fin de session. **Une seule vérité d'état = `00_INDEX/PROJECT_STATE.md`** ; ne pas dupliquer.

## Mission
Vendre et réserver l'ARKO : présenter le produit, configurer (devis 3 couches), tester un terrain, réserver un numéro avec acompte. Conversion + performance + rigueur juridique.

## Phases
- **Phase 1** (front) ✅ livré — Lighthouse 100, LCP 0.8s.
- **Phase 1.5** (SEO) ⏳ — ADR-018.
- **Phase 4** (backend Stripe/Supabase/terrain) ⛔ non démarré — ADR-007→013.
- **Pré-lancement** (légal) ⛔ bloqué — ADR-015.

## Gouvernance ADR
Toute décision structurante (archi, intégration externe, change de marque/design/pricing, RGPD) = **un ADR** dans `03_DECISIONS/` (template `ADR_TEMPLATE.md`). Numérotation `ADR-NNN-titre.md`. Tenir l'**index ADR** de `PROJECT_STATE.md` synchronisé avec les fichiers. Chaque ADR Phase 4 porte un verdict de faisabilité (✅/🟠/🔴/❓) + dépendances externes.

## Guardrails (ne pas régresser)
- **Configurator / pricing verrouillé** (ADR-005) — ne pas toucher `Configurator.tsx` / `config-store.tsx`.
- **Perf & média** (ADR-006) — vidéos via `useVisible` (sauf Hero) ; bundle 3D (`arko3d/*`) isolé à `/viewer` ; Lighthouse 100, LCP < 0.8s.
- **Next 16 « non standard »** — lire `node_modules/next/dist/docs/` avant tout code (cf. AGENTS.md).

## Marque (ADR-004 — absolu)
Termes **interdits** : CCMI, LSF, acier, hors-site, modulaire, préfabriqué, tiny house, conteneur, catalogue, micro-maison. Toujours « notre architecte intégrée » (sans prénom). Fondateur = « Puigbo » (sans accent). Source : `src/lib/site.ts`.

## Secrets (ADR-003)
Montants → `NEXT_PUBLIC_*` via env (fallback). Clés serveur (Supabase service-role, Stripe, Apify, Anthropic) → **jamais dans Git**, jamais côté client. Placeholders uniquement dans la doc.

## Alertes Albert (AHF_CORE)
Remonter à Albert si : changement de positionnement/marque, **changement de charte/design** (ADR-002 en attente), changement de prix cible, **risque juridique** (ADR-015), risque RGPD/sécurité, dépendance externe critique, dérive planning. Format : sujet · impact · gravité · décision attendue · recommandation.

## Stack
Next.js 16.2.9 App Router (Turbopack) · React 19 · TypeScript · Tailwind v4 (`@theme` dans `globals.css`) · three/r3f/drei (`/viewer` only) · gsap · lenis · framer-motion.
