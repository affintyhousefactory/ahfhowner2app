# ADR-026 — Emails transactionnels Brevo : templates dashboard + Supabase contacts

- **Statut** : Accepté — livré (2026-06-20)
- **Date** : 2026-06-20
- **Phase** : 4
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte

Deux formulaires collectaient des données visiteurs sans les persister ni envoyer de confirmation :

1. **`/contact` (`ContactForm.tsx`)** — prénom, nom, email, téléphone, produit, message.
2. **Configurateur (`/configurer`)** — `POST /api/recherche-terrain` persistait en base mais sans email.

ADR-014 laissait le fournisseur email ouvert. **Brevo** est retenu : déjà déclaré sous-traitant UE dans `/confidentialite`, pas de SCC requis (contrairement à Resend US). Templates HTML créés dans le dashboard Brevo et référencés par ID entier — aucune dépendance React Email côté serveur.

> **Note d'implémentation** : un premier jet utilisait `@react-email/render` + `sendEmail()` (HTML inline). Remplacé par `sendBrevoTemplate(templateId, to, params)` via Brevo REST (`/v3/smtp/email`) avec `templateId` + `params`. `resend`, `@react-email/components` et `@react-email/render` désinstallés.

## Décision

### Fournisseur : Brevo REST API — templates dashboard

`src/lib/email.ts` : `sendBrevoTemplate({ templateId, to, params })` — POST Brevo avec `templateId` (entier) + `params` (variables Jinja2 `{{ params.x }}`). Pas de SDK tiers, fetch natif. `BREVO_API_KEY` jamais dans Git.

### Livrable 1 — Migration Supabase `contacts`

`supabase/migrations/20260620_contacts.sql` — table `contacts` : id, created_at, prenom, nom, email, tel, produit, message, turnstile_ok, statut (`nouveau`/`en_cours`/`traite`), notes. RLS : insert anon (formulaire public), lecture/update réservés service_role.

> **Statut** : fichier SQL créé, **migration non appliquée** (MCP Supabase read-only). À appliquer via dashboard Supabase avant mise en prod.

### Livrable 2 — Route API `POST /api/contact`

`src/app/api/contact/route.ts` — pipeline :
1. Parse body : `{ prenom, nom, email, tel?, produit?, message, captchaToken }`
2. Vérification Turnstile (`TURNSTILE_SECRET_KEY`) — passe silencieusement si secret absent (dev)
3. Insert Supabase `contacts` via `SUPABASE_SERVICE_ROLE_KEY` (skip si non configuré)
4. `sendBrevoTemplate` — `BREVO_TEMPLATE_CONTACT` + `params: { prenom, nom, produit_label, message }`
5. Fire-and-forget (`.catch(console.error)`) — ne bloque pas la réponse HTTP

### Livrable 3 — Route API `POST /api/recherche-terrain` (amendée)

Remplacement de l'envoi Resend par `sendBrevoTemplate` — `BREVO_TEMPLATE_RECAP` + `params: { nom, email, tel, modele, pack_label, zones, budget }`. Fire-and-forget.

### Livrable 4 — `ContactForm.tsx` refactorisé

- Tous les champs obligatoires : prénom, nom, email (`pattern` regex), téléphone, produit (select `required`), message
- Bouton disabled uniquement pendant `loading` (plus lié au token captcha)
- Clé de test Turnstile `1x00000000000000000000AA` — widget auto-execute, pas d'appel `execute()` manuel
- Message d'erreur serveur affiché si `fetch` KO

### Livrable 5 — Templates Brevo dashboard

Deux templates HTML créés dans Brevo > Email Templates, syntaxe Jinja2 (`{{ params.x }}`, `{% if %}`).

| Template | ID | Sujet |
|---|---|---|
| Confirmation contact | `BREVO_TEMPLATE_CONTACT` (= `10`) | `Votre message a bien été reçu — Affinity House Factory` |
| Récap configurateur/terrain | `BREVO_TEMPLATE_RECAP` (= `9`) | `Récapitulatif de votre demande ARKO — Affinity House Factory` |

Brief de création des templates : `docs/brief-artefact-email-templates.md`.

### Variables d'environnement

```
BREVO_API_KEY=              # serveur, jamais commité
BREVO_SENDER_EMAIL=contact@affinityhousefactory.com
BREVO_SENDER_NAME=Howner - By Affinity House Factory
BREVO_TO_AHF=contact@affinityhousefactory.com
BREVO_TEMPLATE_CONTACT=10  # ID entier — dashboard Brevo > Email Templates
BREVO_TEMPLATE_RECAP=9     # ID entier — dashboard Brevo > Email Templates
# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=   # 1x00000000000000000000AA en dev (test key)
TURNSTILE_SECRET_KEY=             # 1x0000000000000000000000000000000AA en dev
```

## Devops

- `package.json` `dev` : `WATCHPACK_POLLING=true next dev` (hot reload WSL2 NTFS)
- `Configurator.tsx` : `<Devis>` wrappé dans `<Suspense>` (bugfix `useSearchParams` — build était cassé)
- `emails/` vide (templates migrés vers Brevo dashboard)

## Ce qui reste (non bloquant pour les tests)

- **Migration `contacts`** : à appliquer manuellement via dashboard Supabase (SQL dans `supabase/migrations/20260620_contacts.sql`)
- **`PackTerrainContactForm`** dans `/configurer` : affiche les champs villes/zones/département mais pas encore de bouton submit connecté à `/api/recherche-terrain`
- **SPF/DKIM** `affinityhome.fr` dans Brevo : à configurer avant mise en prod (délivrabilité)

## Faisabilité

- **Verdict** : ✅ — Brevo opérationnel, templates testés (`/contact` fonctionnel en dev)
- **Dépendances résolues** : compte Brevo AHF existant, `BREVO_API_KEY` configurée, templates IDs `10`/`9`
- **Dépendances restantes** : `SUPABASE_SERVICE_ROLE_KEY` (insert `contacts`), migration SQL, SPF/DKIM prod

## Conséquences

- **Ferme ADR-014** (fournisseur email tranché : Brevo)
- **Débloque ADR-008** (confirmation Stripe utilisera `sendBrevoTemplate`)
- RGPD : Brevo déjà déclaré dans `/confidentialite` — aucune mise à jour requise

## Sources

`src/lib/email.ts`, `src/app/api/contact/route.ts`, `src/app/api/recherche-terrain/route.ts`, `src/components/site/ContactForm.tsx`, `src/components/site/Configurator.tsx`, `supabase/migrations/20260620_contacts.sql`, `docs/brief-artefact-email-templates.md`, ADR-007, ADR-014, ADR-003, ADR-024.
