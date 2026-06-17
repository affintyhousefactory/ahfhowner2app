# CURRENT_SESSION — Howner / ARKO

## Focus actuel
**ADR-018 — SEO P0+P1 livrés** : robots/sitemap/OG/twitter/canonical/noindex `/viewer` + JSON-LD (Organization/Product+Offer/FAQPage) + `llms.txt`. Domaine `affinityhome.fr`. Reste P2 (polish, non bloquant).
**Pages légales remplies** : mentions-legales + confidentialite (contenu réel AHF, `index:true`, sitemap) ; CGV reste placeholder (ADR-015).
⚠ Alerte Albert RGPD à arbitrer : politique de confidentialité = doc mutualisée AHF déclarant GA4/cookies/Brevo non déployés sur ce site.
(Sessions précédentes : refonte multi-pages bi-produit + déploiement preview Vercel `feat/`.)

## Objectif de la session
Passer la landing mono-page mono-produit à un site multi-pages bi-produit (SEO/SSR par page, parcours Découvrir → Réserver), avec configurateur multi-produit et socle légal/contact.

## Décisions prises cette session
- **ADR-020** configurateur multi-produit (amende ADR-005 : verrou = logique de calcul, plus le fichier).
- **ADR-021** architecture multi-pages + nav Tesla (Nav/Footer/ConfigProvider dans `layout.tsx`).
- **ADR-022** split produit One/Max + repositionnement (amende ADR-004 ; total 12 → 12+5 ; retrait wordmark ARKO accueil).
- Isolation MCP : `project-access.json` créé à la racine (périmètre github/supabase, Gmail/Drive verrouillés).

## État de l'implémentation
- Routes livrées (10) : `/ arko-one arko-max configurer terrain contact cgv mentions-legales confidentialite` + `/viewer`. Toutes 200, `tsc` propre, console clean.
- `src/lib/site.ts` : registre `PRODUCTS{one,max}` + `ONE_PRICING` (provisoire). Configurateur paramétré par produit (`?produit=` présélectionne via `ProductSync`).
- Accueil : baseline « Une maison compacte faite pour vous », « Fabriqué au Pays-Basque », wordmark ARKO + « 001 » retirés, h1 par page.

## À fournir (placeholders à remplacer)
- Grille **Arko One** : perM2, options, terrasse, dimensions/footprint, `reserved` (base 59 900 € / 20 m² / 12 ex confirmés).
- **Arko Max** : `reserved` (total 5 acté).
- **Asset vidéo Arko One** (absent du repo → fallback footage Max, `placeholderMedia: true`).
- **Contact** : email destinataire + branchement envoi (Phase 4, ADR-014).

## Alertes Albert (à remonter)
Repositionnement mono→bi-produit ; déverrouillage configurateur (ADR-005→020) ; retrait wordmark ARKO accueil (ADR-004→022). Charte Affinity (ADR-002) toujours en attente.

## Règle
Court : 300–1200 tokens. Backlog → `00_INDEX/PROJECT_STATE.md`.
