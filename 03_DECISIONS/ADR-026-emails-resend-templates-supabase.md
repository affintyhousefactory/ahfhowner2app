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

## Amendement du 2026-08-26 — consentement, listes, et ce que porte le récapitulatif

Trois constats faits en production, trois corrections.

### 1. La liste « AHF – Newsletter » n'était jamais alimentée

Aucune des six routes qui écrivent des contacts Brevo ne la citait. Pire, un
visiteur qui **ne cochait pas** la case d'acceptation n'entrait dans **aucune**
liste : sa demande vivait en base Supabase, l'email de confirmation partait,
mais le CRM Brevo l'ignorait. Compteurs au moment du constat : liste 8
« Prospects » → 1 contact, liste 5 « AHF – Newsletter » → 0, liste 7
« Mandataires » → 0.

**Deux listes, deux rôles, décidés par Richard :**

- **« Prospects » (8) reçoit tout le monde**, coche ou pas. C'est le CRM :
  tracer qui a écrit relève de l'intérêt légitime, pas de la communication.
- **« AHF – Newsletter » (5) ne reçoit que ceux qui cochent.** C'est là que vit
  le consentement marketing.
- **Une campagne se cible sur « Newsletter », jamais sur « Prospects ».** Règle
  écrite dans `docs/deployment.md`, à côté des deux variables.

`emailBlacklisted: !optIn` est conservé : seconde barrière au niveau du contact,
pour qu'une campagne mal ciblée n'atteigne personne qui n'a pas consenti.

Appliqué aux **trois** formulaires — `/api/contact`, `/api/reservation`,
`/api/configurateur/reservation` — qui posent la même question, mot pour mot
(`OPTIN_TEXTE`). Trois formulaires qui recueillent le même consentement et le
rangent de trois façons, c'est un fichier contact qu'on ne sait plus lire.
`/api/recherche-terrain` garde l'ancien schéma : domaine suspendu (ADR-028).

⚠ **Effet de bord assumé, écrit dans le code.** Brevo ajoute aux listes mais n'en
retire jamais. Un contact qui coche puis revient sans cocher reste dans
« Newsletter » tout en repassant blocklisté : l'envoi est bloqué, mais les deux
signaux se contredisent dans l'interface. Le retrait de consentement doit passer
par le lien de désinscription, pas par une case laissée vide sur un second
message.

⚠ **Le double opt-in n'est toujours pas en service.** `addBrevoContactDOI()`
existe dans `src/shared/lib/email.ts` mais **n'est appelé nulle part** — les six
routes utilisent l'ajout direct. L'opt-in simple est légal en France ; le nom de
la fonction laisse croire le contraire, d'où cette mention.

### 2. Le lien de désinscription était mort depuis l'origine

`{{ unsubscribe_link }}` **n'est pas un tag Brevo.** Brevo le remplaçait par une
chaîne vide, sans erreur ni avertissement : le HTML réellement délivré portait
`<a href="">Se désinscrire</a>`. Vérifié sur un email de production du
2026-08-22, récupéré par l'API — pas sur le template source, qui ne montre rien.

Le tag correct est **`{{ unsubscribe }}`**. `{{ update_profile }}`, lui,
fonctionnait déjà.

Troisième lien du pied de page, « Supprimer mon compte », pointait vers
`affinityhousefactory.com/compte/supprimer` : ce site est **en maintenance** et
sert la même page à toute URL avec un `200` trompeur — empreinte identique à
celle d'une URL absurde testée sur le même domaine. Un droit à l'effacement
annoncé qui ne mène nulle part vaut moins que pas d'annonce. Redirigé vers
`howner.fr/confidentialite`, dont le §11 décrit les modalités réelles.

**Templates 9 et 10 corrigés à la main par Richard le 2026-08-26**, vérifiés par
l'API.

**Leçon de méthode** : un template Brevo ne se contrôle pas sur sa source. Un tag
inconnu y est indiscernable d'un tag valide — il faut lire le HTML **délivré**.

### 3. La plaquette commerciale part avec le récapitulatif

**Un lien, pas une pièce jointe.** Une pièce jointe alourdit l'email, dégrade la
délivrabilité et ne dit rien, là où un lien se mesure dans Brevo.

**Un fichier désigné, pas « le dernier d'un dossier ».** Prendre automatiquement
le fichier le plus récemment modifié d'un répertoire Drive, c'est envoyer un
brouillon le jour où quelqu'un rouvre un document pour corriger une virgule.

Fichier servi par le dépôt : `public/documents/plaquette-howner-2026.pdf`, lié
sous `{% if params.PLAQUETTE_URL %}` — variable vide = ligne absente, jamais de
lien mort. L'URL envoyée est **absolue** (`SITE_URL` + chemin) : un email n'a pas
d'origine à laquelle rapporter un chemin relatif.

⚠ **Le fichier d'origine pesait 64,6 Mo** pour 28 pages — export en
`FlateDecode`, compression sans perte qui ne compresse presque rien sur des
photos. Ré-exporté par Richard : **1,69 Mo**, 38 fois moins, 28 pages et 29
images conservées, 27 désormais en JPEG. La version publiée vise l'écran
(~150 dpi en A4) ; **l'original reste le fichier d'impression**, sur le Drive AHF.

⚠ **Nommage** : `check:vocabulaire` a refusé « catalogue », proscrit par ADR-029.
Le terme retenu est **plaquette**.

## Sources

`src/lib/email.ts`, `src/app/api/contact/route.ts`, `src/app/api/recherche-terrain/route.ts`, `src/components/site/ContactForm.tsx`, `src/components/site/Configurator.tsx`, `supabase/migrations/20260620_contacts.sql`, `docs/brief-artefact-email-templates.md`, ADR-007, ADR-014, ADR-003, ADR-024.
