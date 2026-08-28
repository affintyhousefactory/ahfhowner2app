# Déploiement & organisation Git — Howner / ARKO

## Vue d'ensemble

| Branche | Rôle | Vercel | Supabase |
|---|---|---|---|
| `main` | Production | `howner.fr` / `affinityhome.fr` | `ahfhownerdb` (prod) |
| `dev` | Staging / Preview | URL preview stable | `ahfhownerdb-preprod` |
| `feat/*` | Feature en cours | URL preview éphémère | `ahfhownerdb-preprod` |

**Règle absolue** : on ne pousse jamais directement sur `main` ni sur `dev`. Tout passe par une PR.

---

## Workflow standard

```
1. Créer une branche depuis dev
   git checkout dev && git pull origin dev
   git checkout -b feat/mon-sujet

2. Développer — commits réguliers
   git commit -m "feat(sujet): ..."

3. Pousser → PR feat/* → dev
   git push -u origin feat/mon-sujet
   gh pr create --base dev

4. Vercel génère un Preview automatique sur la PR
   → tester sur l'URL preview (Supabase preprod)

5. Merger la PR feat/* → dev
   → déclenche un déploiement Preview sur dev

6. Valider sur le Preview dev (Supabase preprod)

7. Release : PR dev → main
   gh pr create --base main --title "release: ..."
   → merge → Vercel déploie en Production (Supabase prod)
```

---

## Vercel — configuration projet

**Projet** : `ahfhowner2app` (team `team_hPxyTBfjGZnuSQJLbzAKkR40`)

| Paramètre | Valeur |
|---|---|
| Production branch | `main` |
| Preview branches | toutes les branches non-`main` (default Vercel) |
| Framework | Next.js — Turbopack |
| Node.js | 24.x |

### Comment Vercel sélectionne les env vars

Vercel injecte automatiquement les variables selon le contexte de build :

- Push sur `main` → scope **Production**
- Push sur `dev` ou `feat/*` → scope **Preview**
- `vercel env pull` en local → scope **Development**

Aucune config supplémentaire n'est nécessaire : `dev` est une branche Preview par défaut.

### Variables d'environnement configurées (2026-06-27)

| Variable | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `ahfhownerdb` | `ahfhownerdb-preprod` | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod | preprod | local |
| `SUPABASE_SERVICE_ROLE_KEY` | prod | preprod | local |
| `BREVO_API_KEY` | ✅ | ✅ | local |
| `BREVO_TEMPLATE_CONTACT` | 10 | 10 | 10 |
| `BREVO_TEMPLATE_RECAP` | 9 | 9 | 9 |
| `BREVO_TEMPLATE_MULTICFG` | **à poser** | **à poser** | **à poser** |
| `BREVO_LIST_PROSPECTS` | 8 | 8 | 8 |
| `BREVO_LIST_NEWSLETTER` | 5 | 5 | 5 |
| `NEXT_PUBLIC_PLAQUETTE_URL` | *(repli code)* | *(repli code)* | *(repli code)* |

> **`BREVO_TEMPLATE_MULTICFG` = 17** (2026-08-27) — présentation Howner + plaquette, envoyée
> quand le lead porte `multi_configuration` : le prospect hésite entre plusieurs modèles, il n'y a
> rien à chiffrer. Le récapitulatif chiffré (`BREVO_TEMPLATE_RECAP`) suppose une configuration
> arrêtée ; l'envoyer reviendrait à communiquer un prix sur un choix que personne n'a fait, et un
> prix communiqué ne se reprend pas.
>
> ⚠ **Aucun repli codé en dur pour les deux identifiants de template.** Un identifiant deviné
> enverrait le mauvais email à un client : les routes d'envoi et d'aperçu renvoient un 500 explicite
> quand la variable manque. **Tant que `BREVO_TEMPLATE_MULTICFG` n'est pas posée, un lead
> Multi-Configuration ne peut pas recevoir son email** — l'aperçu le dira avant l'envoi.

> **Les deux listes ne jouent pas le même rôle** (2026-08-26). `BREVO_LIST_PROSPECTS`
> (« Prospects ») reçoit tout visiteur du formulaire de contact : c'est le CRM.
> `BREVO_LIST_NEWSLETTER` (« AHF – Newsletter ») ne reçoit que ceux qui cochent la case
> d'acceptation : c'est le consentement marketing. **Une campagne se cible sur
> `BREVO_LIST_NEWSLETTER`, jamais sur `BREVO_LIST_PROSPECTS`.**
>
> Les deux ont un repli codé en dur (`?? "8"` et `?? "5"`), donc une variable absente ne
> casse rien — mais elle rend l'environnement muet sur son propre câblage. Les définir.

> **`NEXT_PUBLIC_PLAQUETTE_URL`** (2026-08-26) — lien vers la plaquette commerciale
> jointe au récapitulatif d'appel. **Un lien, pas une pièce jointe** : une pièce jointe
> alourdit l'email, dégrade la délivrabilité et ne dit rien, là où un lien se mesure
> dans Brevo. **Un fichier désigné, pas « le dernier d'un dossier »** : prendre
> automatiquement le fichier le plus récemment modifié, c'est envoyer un brouillon le
> jour où quelqu'un rouvre un document pour corriger une virgule.
>
> Le fichier est servi par le dépôt : `public/documents/plaquette-howner-2026.pdf`
> (1,7 Mo, 28 pages). La variable n'a donc pas à être posée — elle ne sert qu'à pointer
> ailleurs (stockage objet, version datée) sans toucher au code. La vider fait
> disparaître la ligne du récapitulatif : un lien mort vaut moins que pas de lien. Le
> template Brevo porte la ligne sous `{% if params.PLAQUETTE_URL %}`.
>
> ⚠ L'URL envoyée est **absolue** (`SITE_URL` + chemin) : un email n'a pas d'origine à
> laquelle rapporter un chemin relatif.
>
> ⚠ La version publiée est destinée à l'écran (images JPEG, ~1755 px de large, soit
> ~150 dpi en A4). **Garder l'original pour l'imprimeur** — il est sur le Drive AHF.

> **`NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`** — ⚠ **restreinte par référent HTTP** dans Google
> Cloud. Au 2026-08-28, la liste autorise `*.vercel.app` **mais pas `howner.fr`** : l'autocomplétion
> d'adresse répond 403 en production depuis sa mise en ligne (juillet), et échoue en silence — les
> champs restent saisissables à la main, donc personne ne l'avait vu.
>
> À corriger dans Google Cloud Console → Identifiants → clé Places → Référents HTTP :
> ajouter `https://howner.fr/*` et `https://www.howner.fr/*`, garder `*.vercel.app/*`.
>
> ⚠ **Une intégration tierce vérifiée sur une Preview ne prouve rien pour le domaine réel** quand
> elle filtre par référent.

> Stripe retiré du MVP (ADR-008 amendé 2026-06-27) — ne pas configurer `STRIPE_*`.

---

## Supabase — organisation des bases

Voir `docs/supabase-environments.md` pour le détail complet.

| Base | Ref | Branche | Usage |
|---|---|---|---|
| `ahfhownerdb` | `msrjocrcewvqkcehruny` | `main` | Données clients réelles |
| `ahfhownerdb-preprod` | `ixozlavseaykxmjtkkrk` | `dev`, `feat/*` | Tests et validation |
| `ahfhownerdb-dev` | _(à créer)_ | local | Développement isolé |

### Migrations SQL

Les migrations vivent dans `supabase/migrations/` (fichiers `YYYYMMDD_description.sql`).

**Ordre d'application** :
1. Appliquer sur `ahfhownerdb-preprod` (via MCP Supabase ou SQL Editor dashboard)
2. Valider sur le Preview Vercel
3. Appliquer sur `ahfhownerdb` prod après merge sur `main`

Ne jamais appliquer une migration directement en prod sans l'avoir testée sur preprod.

---

## Commandes utiles

```bash
# Vérifier sur quelle branche on est avant de coder
git branch

# Créer une feature depuis dev (toujours)
git checkout dev && git pull origin dev
git checkout -b feat/ma-feature

# Pousser et ouvrir une PR vers dev
git push -u origin feat/ma-feature
gh pr create --base dev

# Ouvrir une PR de release dev → main
gh pr create --base main --title "release: description"

# Resynchroniser les env vars locaux
vercel env pull .env.local --environment=development
```

---

## Checklist release (dev → main)

- [ ] Build vert sur la PR (`npm run build` sans erreur)
- [ ] Preview Vercel fonctionnel sur `dev` (formulaires, emails, Supabase)
- [ ] Migrations SQL appliquées sur preprod ✅ puis prod
- [ ] Pas de régression Lighthouse (LCP < 0.8s, score 100)
- [ ] Pas de `console.error` dans les logs Vercel Preview
- [ ] PR `dev → main` approuvée
