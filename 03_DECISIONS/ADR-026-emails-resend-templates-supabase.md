# ADR-026 — Emails transactionnels Resend : templates + synchro Supabase contacts

- **Statut** : Proposé
- **Date** : 2026-06-20
- **Phase** : 4
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte

Deux formulaires collectent des données visiteurs sans les persister ni envoyer de confirmation :

1. **`/contact` (`ContactForm.tsx`)** — prénom, nom, email, téléphone, produit, message. Appelle uniquement `/api/verify-turnstile` puis `setSent(true)`. Aucune route API `/api/contact`, aucune table Supabase `contacts`.
2. **Configurateur (`/configurer`)** — appelle `POST /api/recherche-terrain` qui persiste en base (`recherche_terrain`) mais n'envoie aucun email de confirmation au client ni à AHF.

ADR-014 posait la question du fournisseur email (ouvert). Ce besoin permet de la trancher : **Resend** est retenu (DX Next.js native, intégration serveur simple, deliverability correcte, SPF/DKIM configurables sur `affinityhome.fr`).

## Décision

### Fournisseur : Resend + React Email

Librairies côté serveur uniquement : `resend`, `@react-email/components`. Jamais côté client. Clé API dans `RESEND_API_KEY` (secret serveur, jamais dans Git).

### Livrable 1 — Migration Supabase `contacts`

```sql
-- supabase/migrations/20260620_contacts.sql
CREATE TABLE IF NOT EXISTS contacts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   timestamptz DEFAULT now() NOT NULL,
  prenom       text        NOT NULL,
  nom          text        NOT NULL,
  email        text        NOT NULL,
  tel          text,
  produit      text,          -- 'one' | 'max' | 'autre' | null
  message      text        NOT NULL,
  turnstile_ok boolean     NOT NULL DEFAULT false,
  statut       text        NOT NULL DEFAULT 'nouveau'
               CHECK (statut IN ('nouveau', 'en_cours', 'traite')),
  notes        text
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- Insert public (formulaire visiteur avec Turnstile vérifié côté serveur)
CREATE POLICY "contacts_insert_public"
  ON contacts FOR INSERT TO anon
  WITH CHECK (true);
-- Lecture/update réservés service_role (pas de policy SELECT → anon aveugle)
```

### Livrable 2 — Route API `POST /api/contact`

`src/app/api/contact/route.ts` — pipeline :
1. Parse body : `{ prenom, nom, email, tel?, produit?, message, captchaToken }`
2. Vérification Turnstile (`TURNSTILE_SECRET_KEY`) → 400 si KO
3. Insert Supabase `contacts` via `SUPABASE_SERVICE_ROLE_KEY`
4. Envoi Resend template #1 (client) + copie AHF (`RESEND_TO_AHF`)
5. `ContactForm.tsx` : remplacer l'appel `/api/verify-turnstile` par `/api/contact` (transmet tout le formData)

### Livrable 3 — Template Resend #1 : confirmation contact

`emails/contact-confirmation.tsx` (React Email)

Champs affichés :
- Prénom, nom
- Produit sélectionné (Arko One / Arko Max / Autre demande)
- Message (bloc citation)
- Délai de réponse : « sous 24 h ouvrées »
- Pied : `affinityhome.fr`, marque Affinity House Factory

Expéditeur : `noreply@affinityhome.fr`
Destinataires : client (accusé de réception) + `RESEND_TO_AHF` (notification interne)

### Livrable 4 — Template Resend #2 : récapitulatif configurateur

`emails/configurateur-recap.tsx` (React Email)

Champs affichés :
- Modèle (Arko One / Arko Max), bardage, façade cuisine, barre, chambre, intérieur
- Terrasse (m²), options sélectionnées, total estimé (€)
- Pack terrain : pack choisi + zones/villes/département
- Nom, email, téléphone du demandeur

Déclenchement : fin du `POST /api/recherche-terrain`, quelle que soit la `source` (`configurateur` ou `rechercheterrain`). Ajouter l'appel Resend après l'insert Supabase existant.

Expéditeur : `noreply@affinityhome.fr`
Destinataires : client + `RESEND_TO_AHF`

### Variables d'environnement à ajouter

```
RESEND_API_KEY=             # serveur, jamais commité
RESEND_FROM=noreply@affinityhome.fr
RESEND_TO_AHF=contact@affinityhousefactory.com
```

`TURNSTILE_SECRET_KEY` et `SUPABASE_SERVICE_ROLE_KEY` déjà prévus (ADR-003/007), à renseigner dans `.env.local`.

## Faisabilité

- **Verdict** : ✅ Élevée — Resend est opérationnel dès création du compte + configuration DNS. Aucune dépendance bloquante.
- **Dépendances externes** :
  - Compte Resend + `RESEND_API_KEY` (à créer)
  - SPF/DKIM sur `affinityhome.fr` (config DNS — 15 min)
  - `SUPABASE_SERVICE_ROLE_KEY` (requise pour l'insert `contacts` côté serveur — ADR-007)
  - MCP Supabase à repasser en écriture pour appliquer la migration (aujourd'hui read-only)
- **Risques** :
  - Délivrabilité si SPF/DKIM non configuré avant mise en prod → tester en staging d'abord
  - Table `contacts` bloquée tant que MCP Supabase reste read-only (migration à appliquer manuellement ou via dashboard Supabase)
  - `ContactForm.tsx` : le refactor de l'appel API est minimal mais touche un composant visible → tester le Turnstile en environnement réel

## Conséquences

- **Ferme ADR-014** (fournisseur email tranché : Resend).
- **Débloque ADR-008** (confirmation Stripe pourra utiliser le même client Resend).
- `ContactForm.tsx` doit envoyer `formData` complet à `/api/contact` (aujourd'hui ne transmet que le token Turnstile).
- `/api/recherche-terrain` reçoit un second effet de bord (send email) — veiller à ne pas bloquer la réponse HTTP si Resend échoue (fire-and-forget acceptable ou try/catch silencieux).
- Templates React Email à valider visuellement dans `react-email` dev server avant mise en prod.
- Index ADR `PROJECT_STATE.md` à mettre à jour (ADR-026 + clore ADR-014).

## Sources

`src/components/site/ContactForm.tsx`, `src/app/api/recherche-terrain/route.ts`, `src/components/site/config-store.tsx`, `supabase/migrations/20260618_recherche_terrain.sql`, ADR-007, ADR-014, ADR-003.
