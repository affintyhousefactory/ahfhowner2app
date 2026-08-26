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
| `BREVO_LIST_PROSPECTS` | 8 | 8 | 8 |
| `BREVO_LIST_NEWSLETTER` | 5 | 5 | 5 |
| `NEXT_PUBLIC_PLAQUETTE_URL` | à poser | à poser | à poser |

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
> Tant que la variable est vide, le récapitulatif part **sans** la ligne plaquette —
> un lien mort vaut moins que pas de lien. Le template Brevo doit porter la ligne sous
> `{% if params.PLAQUETTE_URL %}`.

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
