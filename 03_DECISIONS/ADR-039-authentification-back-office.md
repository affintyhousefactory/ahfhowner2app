# ADR-039 — Authentification réelle du back-office (session en cookie, gardes serveur)

- **Statut** : Accepté — livré, en attente de vérification Preview puis mise en production
- **Date** : 2026-08-25
- **Décideur** : Richard
- **Faisabilité** : ✅ (aucune dépendance externe)
- **Remplace / amende** : complète ADR-007 (RLS) et ADR-028 (garde au proxy)

## Contexte

Le 2026-08-25, une vérification des comptes admin de production a montré que
**`https://howner.fr/admin/leads` répondait 200 sans aucune session**, en servant
dans son HTML les noms, adresses email, téléphones et statuts commerciaux des
prospects. Deux constats ont suivi :

1. **17 des 19 routes `/api/admin/*` n'avaient aucune vérification d'identité.**
   Confirmé en production : `GET /api/admin/leads/<id>/appels` renvoyait le
   journal d'appels, note commerciale comprise. Les deux seules routes gardées
   étaient celles des terrains — déjà en 404 par ADR-028.

2. **Les six policies RLS `admin_*` n'ont jamais rien accordé.** Elles testaient
   `auth.jwt() ->> 'role'`, qui vaut `authenticated` pour tout utilisateur
   connecté ; le rôle applicatif vit dans `app_metadata`. Prouvé sur un jeton
   réel. Personne ne l'avait vu parce que tout le back-office interroge la base
   en `service_role`, qui contourne la RLS par construction.

**Cause commune** : le portail admin n'a jamais eu d'authentification côté
serveur. La seule barrière était le `useEffect` de
`(admin)/admin/(protected)/layout.tsx`, un composant **client** : il redirige
l'affichage **après** que le serveur a rendu et envoyé la page. C'est la même
mécanique qu'ADR-028 avait déjà rencontrée — un layout client placé devant une
garde la rend inopérante — vue cette fois depuis l'autre bout.

**Impact** : violation de données personnelles au sens de l'article 33 du RGPD,
sur des prospects identifiables. Faible en volume (3 leads), pas en nature.

## Décision

Poser une authentification **vérifiée par le serveur** sur tout le back-office.

### 1. La session passe du `localStorage` aux cookies

`getSupabaseBrowser()` utilisait `createClient` de `@supabase/supabase-js`, qui
range la session dans le `localStorage`. Un `localStorage` ne quitte jamais la
machine : lors d'une navigation, le navigateur n'envoie que les cookies, et le
serveur ne voyait donc **aucune** session. Aucune garde serveur n'était
possible — elle aurait refusé tout le monde, administrateurs compris.

`@supabase/ssr` et `createBrowserClient` rangent la même session dans des
cookies, qui accompagnent chaque requête.

**Conséquence assumée** : les sessions ouvertes avant la bascule sont perdues.
Une reconnexion suffit. Rien d'autre ne change pour l'utilisateur.

### 2. Une garde au proxy

`src/proxy.ts` couvre désormais `/admin/:path*` et `/api/admin/:path*`, hors
`/admin/auth/*`. Le proxy s'exécute **avant tout rendu** : sans session portant
`app_metadata.role === "admin"`, une page est redirigée vers l'écran de
connexion et une route d'API reçoit un 401 JSON — jamais une redirection HTML,
qu'un `fetch` ne saurait pas lire.

`getUser()` et non `getSession()` : le second relit un cookie que le navigateur
contrôle, le premier fait valider le jeton par Supabase. **Une garde qui croit
un jeton sur parole ne garde rien.**

Le matcher reste strictement limité aux surfaces admin : ADR-006 interdit
d'alourdir les pages publiques.

### 3. Deux gardes de plus, en défense en profondeur

- Les **10 pages serveur** du back-office appellent `estAdmin()` avant toute
  lecture, et redirigent sinon.
- Les **26 handlers** des routes `/api/admin/*` appellent `refuserSiPasAdmin()`,
  qui produit la réponse de refus que l'appelant relaie — le même motif que
  `mandataireDisabled()` d'ADR-028, choisi parce qu'on ne peut pas oublier le
  `return`.

### 4. Les policies RLS testent enfin le bon claim

Migration `20260825_adr039_policies_admin.sql` : une fonction `public.est_admin()`
lit `auth.jwt() -> 'app_metadata' ->> 'role'`, et les six policies s'y adossent.
`security invoker`, exécution retirée à `anon` — **`revoke from public` ne
suffit pas**, Supabase pose des privilèges par défaut qui accordent `EXECUTE` à
`anon` sur toute fonction créée dans `public` ; vérifié dans `pg_proc.proacl`
après la première application, où `anon` figurait encore.

Cette correction ne débloque rien et ne casse rien aujourd'hui : c'est la couche
de rattrapage du jour où un écran lira la base avec l'identité de l'utilisateur
plutôt qu'avec la clé de service.

## Comptes

Deux comptes nominatifs créés en production le 2026-08-25 :
`richard@howner.fr` et `albert@howner.fr`, tous deux `app_metadata.role = admin`,
confirmés, **connexion prouvée** et rôle vérifié dans le jeton émis.

Motifs : l'unique compte existant (`richard.labrador@outlook.fr`) n'avait plus
servi depuis le 2026-07-06, reposait sur une boîte personnelle qui est aussi la
seule voie de réinitialisation, et **Albert n'avait aucun compte de production**.
Un compte par personne : le journal d'appels enregistre l'auteur, ce qui n'a de
valeur que si chacun a le sien.

## Alternatives écartées

- **Filtrer `/admin` par adresse IP** — envisagé comme endiguement immédiat,
  **écarté par Richard** : les leads doivent pouvoir être qualifiés depuis
  n'importe quel espace de coworking. Une garde qui dépend du lieu de connexion
  ne répond pas au besoin.
- **Couper `/admin` en attendant** — accepté par Richard comme effet de bord
  possible (« va au bout même si ça coupe temporairement »), mais non nécessaire :
  les comptes ont été créés et éprouvés **avant** la pose de la garde,
  précisément pour ne pas s'enfermer dehors.
- **Charger les écrans côté client derrière des API gardées** — supprime la
  fuite mais réécrit tout le back-office et perd le rendu serveur.

## Conséquences

- Le back-office n'est plus lisible sans compte. Les trois leads restent
  qualifiables depuis n'importe où, par mot de passe.
- Une reconnexion est nécessaire après la mise en production.
- **Règle nouvelle, à ne pas régresser** : toute page ou route sous `/admin` ou
  `/api/admin` naît gardée (`estAdmin()` / `refuserSiPasAdmin()`). Une surface
  admin non gardée est une fuite, pas un oubli de confort.

## Reste ouvert

- **Double authentification (TOTP)** — recommandée pour un back-office contenant
  des données personnelles consulté depuis des réseaux partagés. Supabase la
  propose nativement. **Non posée : à décider par Richard.**
- **Protection contre les mots de passe compromis** — désactivée sur le projet
  Supabase (`auth_leaked_password_protection`, relevé par `get_advisors`).
  Réglage de tableau de bord, pas de code.
- **Le domaine mandataire suspendu** (ADR-028) est gardé par ces mêmes couches,
  mais ses écrans n'ont pas été revus dans le détail : ils restent en 404.
- **`checkAdmin()` par en-tête `Authorization`** subsiste dans les deux routes
  `terrains` — redondant avec la nouvelle garde, à retirer à la réactivation du
  flag plutôt que de toucher au domaine suspendu aujourd'hui.
