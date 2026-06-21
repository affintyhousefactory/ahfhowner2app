# ADR-026 — Emails transactionnels Brevo : templates + synchro Supabase contacts

- **Statut** : Accepté
- **Date** : 2026-06-20
- **Phase** : 4
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte

Deux formulaires collectent des données visiteurs sans les persister ni envoyer de confirmation :

1. **`/contact` (`ContactForm.tsx`)** — prénom, nom, email, téléphone, produit, message. Appelait uniquement `/api/verify-turnstile` puis `setSent(true)`. Aucune route API `/api/contact`, aucune table Supabase `contacts`.
2. **Configurateur (`/configurer`)** — appelait `POST /api/recherche-terrain` qui persistait en base (`recherche_terrain`) mais n'envoyait aucun email de confirmation.

ADR-014 posait la question du fournisseur email (ouvert). **Brevo** est retenu : déjà déclaré dans la politique de confidentialité AHF, cohérent avec l'écosystème existant. Envoi via REST API Brevo (`api.brevo.com/v3/smtp/email`) + rendu HTML via `@react-email/render`.

## Décision

### Fournisseur : Brevo REST API + React Email

Côté serveur uniquement. Helper partagé `src/lib/email.ts` : convertit un composant React Email en HTML via `@react-email/render`, envoie via `fetch` Brevo. Pas de SDK tiers (fetch natif suffit). Clé dans `BREVO_API_KEY` (jamais dans Git).

### Livrable 1 — Migration Supabase `contacts`

`supabase/migrations/20260620_contacts.sql` — table `contacts` : id, created_at, prenom, nom, email, tel, produit, message, turnstile_ok, statut, notes. RLS : insert public (anon), lecture/update réservés service_role.

### Livrable 2 — Helper email partagé

`src/lib/email.ts` — `sendEmail({ to, subject, template })` :
1. Rend le template React Email → HTML (`@react-email/render`)
2. POST Brevo avec `htmlContent`, `sender`, `to`, `subject`
3. Log warn si `BREVO_API_KEY` absent (dev local), throw si erreur Brevo

### Livrable 3 — Route API `POST /api/contact`

`src/app/api/contact/route.ts` — pipeline :
1. Parse body : `{ prenom, nom, email, tel?, produit?, message, captchaToken }`
2. Vérification Turnstile (`TURNSTILE_SECRET_KEY`) → 400 si KO
3. Insert Supabase `contacts` via `SUPABASE_SERVICE_ROLE_KEY`
4. `sendEmail` template #1 → client + copie `EMAIL_TO_AHF`

`ContactForm.tsx` rewired : envoie tout le formData vers `/api/contact`.

### Livrable 4 — Template Brevo #1 : confirmation contact

`emails/contact-confirmation.tsx` (React Email → HTML via `@react-email/render`)

Champs : prénom, nom, produit sélectionné, message, délai 24 h ouvrées.
Expéditeur : `EMAIL_FROM` (`noreply@affinityhome.fr`). Destinataires : client + AHF.

### Livrable 5 — Template Brevo #2 : récapitulatif configurateur

`emails/configurateur-recap.tsx` (React Email → HTML)

Champs : modèle, bardage, façade, barre, chambre, intérieur, terrasse, options, total, pack terrain, zones, coordonnées.
Déclenchement : fin de `POST /api/recherche-terrain` (fire-and-forget, quelle que soit la `source`).

### Variables d'environnement

```
BREVO_API_KEY=              # serveur, jamais commité
EMAIL_FROM=noreply@affinityhome.fr
EMAIL_TO_AHF=contact@affinityhousefactory.com
```

`TURNSTILE_SECRET_KEY` et `SUPABASE_SERVICE_ROLE_KEY` déjà prévus (ADR-003/007).

## Faisabilité

- **Verdict** : ✅ Élevée — Brevo opérationnel dès configuration compte + DNS. Aucune dépendance bloquante.
- **Dépendances externes** :
  - Compte Brevo + `BREVO_API_KEY` (compte AHF existant)
  - SPF/DKIM sur `affinityhome.fr` dans Brevo (DNS — 15 min)
  - `SUPABASE_SERVICE_ROLE_KEY` pour l'insert `contacts` côté serveur
  - Migration `20260620_contacts.sql` à appliquer (dashboard Supabase ou MCP en écriture)
- **Risques** :
  - Délivrabilité si SPF/DKIM non configuré avant mise en prod → tester d'abord
  - Table `contacts` inapplicable tant que MCP Supabase reste read-only

## Conséquences

- **Ferme ADR-014** (fournisseur tranché : Brevo).
- **Débloque ADR-008** (confirmation Stripe pourra utiliser `sendEmail`).
- `/api/recherche-terrain` : envoi email fire-and-forget après persist, ne bloque pas la réponse HTTP.
- Templates React Email à valider visuellement (`email-preview` ou `react-email dev`) avant mise en prod.

## Sources

`src/components/site/ContactForm.tsx`, `src/app/api/contact/route.ts`, `src/app/api/recherche-terrain/route.ts`, `src/lib/email.ts`, `emails/`, `supabase/migrations/20260620_contacts.sql`, ADR-007, ADR-014, ADR-003.
