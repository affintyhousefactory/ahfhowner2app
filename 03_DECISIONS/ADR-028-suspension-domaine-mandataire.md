# ADR-028 — Suspension réversible du domaine « Mandataire & Terrain »

- **Statut** : Accepté — livré
- **Date** : 2026-07-30
- **Phase** : All
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : **Oui — retrait d'une offre commerciale du site public et du discours de marque (changement de positionnement)**

## Contexte

Le dispositif « Mandataire & Terrain » a été construit et livré par étapes : portail mandataire et son onboarding contractuel (PR #16), portail admin avec affectation géographique lead ↔ mandataire (PR #14), fiches terrain et GED double (ADR-027, PR #51), page d'offre `/rechercheterrain` (ADR-025), listing public `/terrains`.

AHF constate que **la finalité de marché et la cible visées par ce dispositif ne sont pas mûres**. Le maintenir en ligne fait promettre au site un service — « L'expert Mandataire Affinity vous re-contacte sous 48 h », « Pack Recherche Terrain confié à un Mandataire Partenaire qualifié » — que l'entreprise ne veut pas honorer aujourd'hui. C'est un risque commercial (promesse non tenue) autant qu'un coût d'exploitation (un back-office à animer pour un flux qu'on ne veut pas traiter).

La reprise est explicitement prévue, à une échéance non fixée. Supprimer le code reviendrait à devoir le reconstruire.

## Décision

**Suspendre, pas supprimer.** Le code, les schémas Supabase, les données et les comptes restent en place ; seules les **interfaces et les points d'entrée** sont neutralisés, derrière un interrupteur unique.

### Mécanisme

`src/lib/features.ts` :

```ts
export const FEATURES = {
  mandataire: process.env.NEXT_PUBLIC_FEATURE_MANDATAIRE === "true",
} as const;
```

Variable absente = **suspendu**. C'est le défaut sûr : un oubli de configuration ne peut pas rouvrir le dispositif.

`src/shared/lib/feature-guard.ts` expose deux gardes :
- `guardMandataire()` — `notFound()` dans les pages et layouts serveur ;
- `mandataireDisabled()` — réponse **404** dans les routes API.

404 et non 403 : côté visiteur, une fonctionnalité suspendue doit être indiscernable d'une fonctionnalité inexistante.

### Périmètre suspendu

| Surface | Points de coupure |
|---|---|
| Portail mandataire | `src/app/(mandataire)/layout.tsx` — une garde couvre landing, auth (signin/signup/forgot/reset) et tout `(protected)` : dashboard, dossiers, contrat, documents, profil, terrains |
| Onboarding mandataire | `src/app/onboarding/mandataire/layout.tsx` (layout serveur créé pour garder une page client) |
| Admin — écrans | `layout.tsx` de segment sur `affectations/`, `ged/`, `mandataires/`, `terrains/` (couvre les sous-routes) + entrées retirées de la sidebar |
| Admin — fiche lead | Sous-sections « Affectation mandataire » et « Dossier mandataire » masquées ; lectures `mandataires` / `fiches_terrain` non exécutées. **GED Client conservée** (ADR-027) |
| Admin — liste leads | Colonne « Mandataire » et jointure associée retirées |
| Admin — dashboard | KPI financiers, `DossiersDonut`, `Entonnoir`, `MandatairesBar` et alertes mandataires/dossiers masqués ; remplacés par 2 KPI leads. L'alerte « leads sans affectation > 48 h » devient « sans traitement > 48 h » |
| Public — pages | `/terrains`, `/rechercheterrain`, `/terrain` (stub), `/cgu-mandataire` → 404 |
| Public — liens | Footer (« Recherche terrain », « Accès Mandataire »), `NAV` (« Terrains »), CTA « Tester mon terrain » de `Hero`/`ProductHero` redirigés vers `/configurer`, bloc « Pack Recherche Terrain » de `ParcelleAnalyse` |
| Public — contenu | FAQ « Et si je n'ai pas encore de terrain ? » réécrite ; mention des mandataires partenaires retirée du parcours de paiement |
| SEO | `/rechercheterrain` et `/terrains` sortis du sitemap ; ajoutés au `disallow` de `robots.txt` avec `/terrain` et `/cgu-mandataire` ; ligne « Votre terrain » retirée de `llms.txt` |
| Configurateur | Sélecteur « J'ai un terrain / Je cherche un terrain » retiré ; `terrainMode` démarre sur `"have"` ; `setTerrainMode("pack")` verrouillé dans le store |
| API | 29 routes, 36 handlers : `api/mandataire/**`, `api/onboarding/mandataire/**`, `api/admin/mandataires/**`, `api/admin/terrains/**`, `api/admin/dossiers/[id]`, `api/admin/leads/[id]/affecter{,/recap,/resend}`, `api/admin/leads/[id]/documents`, `api/admin/pappers`, `api/terrains`, `api/recherche-terrain` |

### Ce qui n'est **pas** supprimé

- Aucun fichier supprimé, aucune migration Supabase, aucune donnée touchée. Les tables `mandataires`, `dossiers`, `fiches_terrain`, `lead_documents` et les colonnes `leads.mandataire_id` / `affecte_at` sont intactes.
- Les comptes Supabase des mandataires existants ne sont ni supprimés ni désactivés : ils n'ont simplement plus d'interface. Aucun email ne leur est envoyé — les routes qui en émettent sont coupées.
- Les templates Brevo (15 affectation, liste 7 mandataires) restent configurés, simplement plus appelés.
- Le code suspendu reste **compilé et typé** : c'est ce qui garantit qu'il ne pourrira pas d'ici la reprise.

### Ce qui reste actif

Tunnel de réservation, configurateur et pricing 3 couches, analyse PLU du terrain du client (`ParcelleAnalyse` — « J'ai un terrain »), calcul de livraison GPS, `/contact`, admin Leads + fiche lead + GED Client, emails Brevo contact/récap, pages légales.

## Procédure de réactivation

> Mode d'emploi opérationnel (activer **et** re-suspendre, checklist de
> vérification, contrôle curl) : **`docs/feature-flags.md`**. Les étapes
> ci-dessous portent le volet décisionnel et métier.

1. Poser `NEXT_PUBLIC_FEATURE_MANDATAIRE=true` — d'abord sur un scope **Preview** Vercel pour valider, puis Production. Aucun déploiement de code n'est nécessaire.
2. Vérifier le retour des surfaces : portail `/mandataire`, écrans admin (sidebar à 6 entrées), `/terrains`, `/rechercheterrain`, sélecteur terrain du configurateur, `sitemap.xml` (**7 → 9 URLs**), `robots.txt`.
3. **Revalider les textes publics** avant réouverture : la FAQ et le paragraphe « mandataires partenaires » du parcours de paiement reviennent à leur version d'origine — les relire au regard d'ADR-004 (blocklist marque) et de l'état du réseau à ce moment-là.
4. Vérifier l'état des comptes mandataires et des fiches terrain en base : des données peuvent être devenues obsolètes pendant la suspension (statuts, exclusivités territoriales, annonces).
5. Retester le tunnel `/configurer` en mode « Je cherche un terrain » → `/api/recherche-terrain` → lead → affectation → email Brevo template 15.
6. Amender cet ADR (statut « Remplacé » ou « Levé ») et remettre à jour `PROJECT_STATE.md`.

## Faisabilité

- **Verdict** : ✅ Élevée — un seul flag, des gardes posées aux frontières (layouts de groupe et de segment, première ligne des handlers), zéro migration.
- **Dépendances externes** : aucune. La variable Vercel est optionnelle (l'absence vaut suspension).
- **Risques** :
  - *Désindexation* — `/terrains` et `/rechercheterrain` étaient dans le sitemap ; leur 404 provoquera une désindexation progressive. Assumé : c'est l'effet recherché, et la réactivation les remettra au sitemap.
  - *Liens externes morts* — un visiteur ayant `/mandataire` en favori tombe sur un 404 sans explication. Accepté (audience très restreinte, mandataires joignables directement).
  - *Dérive du code suspendu* — le code reste typé et compilé, mais plus testé en usage. La procédure de réactivation impose une revalidation fonctionnelle, pas une simple bascule.
  - *Zéros trompeurs* — écarté : les widgets admin dérivés des dossiers sont masqués, pas alimentés à vide.

## Conséquences

- Le site ne promet plus de service terrain qu'AHF ne veut pas rendre. Le parcours se recentre sur : découvrir → configurer → réserver.
- **Effet de bord positif** dans le configurateur : `terrainMode` démarrant sur `"have"`, l'analyse PLU s'affiche d'emblée et la livraison estimée + le total apparaissent sans clic préalable (ils étaient conditionnés au choix d'un mode).
- **Amende ADR-005** : `Configurator.tsx` et `config-store.tsx` sont modifiés, ce que le guardrail interdit sans décision écrite. La modification est **strictement UI / parcours** — `houseTotal`, `delivery`, `grandTotal` et la logique 3 couches sont inchangés.
- **Amende ADR-025** (`/rechercheterrain` suspendue), **ADR-027** (affectation + GED mandataire suspendues, GED Client conservée), **ADR-018** (sitemap/robots).
- Nouveau guardrail projet : ne pas re-linker une surface suspendue sans lever le flag et amender cet ADR.
- `src/components/site/LandTool.tsx` est du **code mort** (aucun import) qui référence `/rechercheterrain` ; laissé en l'état, à traiter hors de ce chantier.

## Sources

`src/lib/features.ts`, `src/shared/lib/feature-guard.ts`, `CLAUDE.md` § Guardrails, ADR-005, ADR-018, ADR-025, ADR-027, `00_INDEX/PROJECT_STATE.md`.
