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
- **Domaine « Mandataire & Terrain » suspendu** (ADR-028) — portail mandataire, onboarding, affectation lead↔mandataire, GED mandataire, écrans admin Mandataires/Affectations/GED/Terrains, `/terrains`, `/rechercheterrain`, `/terrain`, `/cgu-mandataire` et le mode « Je cherche un terrain » du configurateur sont **masqués derrière `FEATURES.mandataire`** (`src/lib/features.ts`). **Ne jamais re-linker ni ré-exposer une de ces surfaces sans lever le flag et amender ADR-028.** Toute nouvelle surface du domaine doit naître gardée (`guardMandataire()` / `mandataireDisabled()`).
- **Configurateur — verrou LEVÉ** (ADR-030 remplace ADR-005 et ADR-020). `Configurator.tsx` et `config-store.tsx` sont réécrits : parcours en 7 écrans, grilles pilotées par données, `perM2`/`terrassePerM2` supprimés. Nouvelle règle : **ne jamais coder les grilles en dur** — prix, paliers et options sont éditables sans redéploiement (§12 de la spec, « elles bougeront »).
- **Perf & média** (ADR-006) — vidéos via `useVisible` (sauf Hero) ; bundle 3D (`arko3d/*`) isolé à `/viewer` ; Lighthouse 100, LCP < 0.8s.
- **Next 16 « non standard »** — lire `node_modules/next/dist/docs/` avant tout code (cf. AGENTS.md).

## Marque (ADR-029 — absolu, remplace ADR-004)
> **Amendement du 2026-08-03 (décision de Richard)** : « maison » **n'est plus interdit** — c'est le terme **imposé**, il remplace « module » sur tout le site client (accord au **féminin**). « maison individuelle » reste proscrit : c'est l'expression qui déclenche le régime **CCMI** (loi du 19 déc. 1990). Ne pas relâcher cette ligne sans l'avocat. À remonter à Albert.

Termes **interdits** : **maison individuelle**, résidence principale, **clé en main**, toute raison sociale autre que Howner, tout nom de fournisseur — plus la blocklist historique : modulaire, préfabriqué, tiny house, conteneur, catalogue.
Vocabulaire **imposé** : **maison**, unité, studio, hébergement, annexe, espace supplémentaire, prêt à vivre.
Toujours « notre architecte intégrée » (sans prénom). Fondateur = « Puigbo » (sans accent).
**Cadre de vente** (ADR-029) : annexe sur parcelle déjà bâtie, ou hébergement professionnel. Le logement indépendant sur terrain nu **n'est pas ouvert** — « prochainement », sans prix ni explication.
Contrôle avant chaque PR : `npm run check:vocabulaire`. Source : `src/lib/site.ts`, spec `docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md`.
Exclus du contrôle : pages légales (§17.10 + ADR-015), domaine mandataire suspendu (ADR-028), back-office.

## Secrets (ADR-003)
Montants → `NEXT_PUBLIC_*` via env (fallback). Clés serveur (Supabase service-role, Stripe, Apify, Anthropic) → **jamais dans Git**, jamais côté client. Placeholders uniquement dans la doc.

## Alertes Albert (AHF_CORE)
Remonter à Albert si : changement de positionnement/marque, **changement de charte/design** (ADR-002 en attente), changement de prix cible, **risque juridique** (ADR-015), risque RGPD/sécurité, dépendance externe critique, dérive planning. Format : sujet · impact · gravité · décision attendue · recommandation.

## Stack
Next.js 16.2.9 App Router (Turbopack) · React 19 · TypeScript · Tailwind v4 (`@theme` dans `globals.css`) · three/r3f/drei (`/viewer` only) · gsap · lenis · framer-motion.
