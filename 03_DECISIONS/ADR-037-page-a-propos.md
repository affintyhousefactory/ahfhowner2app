# ADR-037 — Page « À propos » (`/a-propos`) : l'ADN de marque, sans partenaire nommé

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Phase** : 1.5
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : **Oui — un écart à son texte source (nom du bureau d'études retiré) et un choix de slug qui engage le SEO.**

## Contexte

Albert a produit un texte de page « À propos » — `page_about_howner.md`, déposé le 2026-08-17 dans le Drive partagé (`AHF - Plans_SiteWeb_Inspirations` → `Siteaffinity/About`, accès déclaré en lecture seule dans `project-access.json`). Versé au dépôt en `docs/specs/page-about-howner.md` pour que cet ADR le cite par un chemin stable, comme la spec configurateur (précédent ADR-029).

Le site n'avait aucune page de marque : l'accueil et les deux pages produit vendent un objet, rien n'expose la démarche — ni la philosophie, ni la technologie structurelle (LSF), ni l'argument éco. C'est un manque de conversion autant que de SEO : la requête « qui est Howner » n'a pas de page de destination.

Le texte source pose **un conflit direct avec ADR-029 §67**, dont la formulation ne souffre pas d'exception :

> « Howner est la seule entité citée côté client. Aucun nom de fournisseur, de sous-traitant ou de partenaire n'apparaît, y compris dans les descriptifs techniques. »

Or le §3 du texte nomme le bureau d'études structure et pose un lien sortant vers son site.

## Décision

**1. La page est créée sur `/a-propos`**, dans le groupe `(public)`, et prend le contenu du texte source à deux écarts près.

**2. Le nom du bureau d'études est retiré ; l'argument est conservé.** « en s'appuyant sur l'expertise d'un bureau d'études structure indépendant » remplace la mention nommée et son lien. La *caution technique* est ce qui porte l'argument commercial — le nom du prestataire n'y ajoute rien pour un prospect, et ADR-029 est marquée « absolue » dans `CLAUDE.md`. La formulation reste **exacte** : elle ne prétend pas que le bureau d'études est interne, contrairement à ce qu'aurait fait « notre bureau d'études ». Le lien sortant disparaît avec le nom.

**3. Le vocabulaire est aligné sur ADR-029 amendée** : « maison » (terme imposé depuis le 2026-08-03), accord au féminin, « notre architecte intégrée » sans prénom. Le texte source disait « nos architectes » — corrigé au singulier imposé. « habitat » remplace la tournure qui laissait entendre un logement autonome : le cadre de vente du §1 (annexe sur parcelle bâtie ou hébergement professionnel) ne bouge pas, et une page de marque n'est pas l'endroit où l'élargir par inadvertance.

**4. Le slug est français — `/a-propos`, pas `/about`.** Toutes les routes de contenu du site le sont (`/configurer`, `/contact`, `/mentions-legales`, `/confidentialite`) ; le public est français. Le libellé de nav est « À propos ». Le dossier Drive s'appelle « About », ce qui décrit le sujet, pas l'URL.

**5. Le contenu vit dans `site.ts` (`ABOUT`)**, jamais dans le composant — même convention que `PROCESS`, `FAQ`, `LAND_PREP`, et même raison : un texte de marque se corrige sans ouvrir un composant. Aucun prix, aucun palier, aucune option : la page ne touche pas `config.ts` et ne peut donc pas se périmer avec les grilles (règle du 2026-08-04).

**6. Aucun volume recopié.** Le bloc de sortie dérive de `SERIE_COUNT` / `SERIE_TOTAL`, jamais d'un littéral — c'est la règle actée le 2026-08-04 après le passage de 12 à 6.

## Faisabilité

- **Verdict** : ✅ Page éditoriale statique, sans dépendance de données ni appel externe.
- **Dépendances externes** : aucune. Les trois visuels sont des assets déjà présents au dépôt (`interior/kitchen`, `sketch/arko-sketch-ink`, `exterior/arko-forest`) — aucun média ajouté, donc aucun effet sur le budget de page d'ADR-006.
- **Risques** :
  - **Décision d'Albert requise** sur le nom du bureau d'études. S'il veut le voir apparaître, ADR-029 §67 doit être **amendée** — ce n'est pas un arbitrage de mise en œuvre, c'est un changement de règle de marque. La remettre coûte une ligne de `site.ts`.
  - **LSF, acier, Hors-Site sont employés sciemment** : ces termes sont sortis de la blocklist le 2026-07-09 (ADR-004 § révision, repris par ADR-029). Ne pas les relire comme des infractions.
  - **Slug indexable** : une fois `/a-propos` crawlée, la renommer coûte une redirection permanente. Trancher avant mise en production, pas après.

## Conséquences

- **SEO** : `/a-propos` entre au `sitemap.ts` (priorité 0,7), aux « Pages clés » de `llms.txt`, et porte un JSON-LD `AboutPage` (`aboutPageSchema()`). Pas d'`Organization` dupliquée — le layout `(public)` l'émet déjà sitewide, deux entités concurrentes pour la même marque se seraient nui.
- **Navigation** : l'entrée est ajoutée à `NAV` (`site.ts`), donc elle apparaît **d'un coup** dans la barre desktop, le menu mobile et la colonne « Modèles & parcours » du pied de page — les trois lisent la même source.
- **Rendu** : composant **serveur**, `Reveal` en seul îlot client. L'état masqué vit sous `.js-motion` (globals.css) : le HTML servi reste visible sans JS, donc indexable — leçon du 2026-07-20, où framer-motion sérialisait `opacity:0` au SSR et rendait la page blanche pour un crawler.
- **Pas de `<main>` dans la page** : le layout `(public)` en fournit déjà un. Les pages `/contact` et `/arko-*` en ouvrent un second, imbriqué — défaut préexistant, **non corrigé ici** (hors périmètre) mais à traiter avec le polish P2 d'ADR-018.
- **Ce que la page ne fait pas** : aucun formulaire, aucun compteur temps réel, aucune promesse de délai ou de prix. Elle renvoie vers le tunnel par `reserverHref()`, donc la bascule d'ADR-031 la suivra sans retouche.
- **Gate** : `tsc` propre, `eslint` propre sur les fichiers touchés, `npm run check:vocabulaire` conforme. Vérification visuelle et plan des titres à faire sur Preview Vercel (pas de test local — `_RUNTIME/active-context.md`).

## Sources

- `docs/specs/page-about-howner.md` — texte source d'Albert (Drive, 2026-08-17).
- `03_DECISIONS/ADR-029-repositionnement-produit-marque.md` §45 et §67 — vocabulaire, cadre de vente, interdiction de nommer un partenaire ; § Amendement du 2026-08-03 (« maison » imposé).
- `03_DECISIONS/ADR-004-regles-marque-absolues.md` — révision du 2026-07-09 (LSF / acier / Hors-Site sortis de la blocklist).
- `03_DECISIONS/ADR-018-socle-seo.md` — sitemap, JSON-LD, `llms.txt`.
- `src/lib/site.ts` (`ABOUT`, `NAV`, `SERIE_TOTAL`), `src/lib/jsonld.ts`, `src/app/sitemap.ts`, `src/app/(public)/a-propos/page.tsx`.
- `DESIGN.md` — charte Affinity (tokens `@theme`).
