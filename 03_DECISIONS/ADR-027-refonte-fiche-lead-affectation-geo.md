# ADR-027 — Refonte fiche Lead admin : recherche terrain, affectation géographique, GED double

- **Statut** : Accepté (implémenté)
- **Date** : 2026-07-10
- **Phase** : 4
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte

La fiche `/admin/leads/[id]` avait grossi de façon organique et présentait trois
problèmes concrets :

1. La section « Configuration Arko » dupliquait des champs déjà présents dans
   « Identité & Projet » (modèle, pack terrain, budget/total estimé).
2. L'affectation mandataire (`AssignMandataire.tsx`) triait par correspondance texte
   approximative (`leadCommune` vs `zone_activite text[]`, substring insensible à la
   casse), alors que les colonnes `mandataires.lat`, `lon` et `rayon_intervention`
   existent depuis la migration `20260630_mandataires_profil_geo.sql` sans jamais avoir
   été exploitées pour un vrai calcul de distance.
3. Le « Dossier client » (`LeadDocuments.tsx` / table `lead_documents`) mélangeait deux
   usages distincts : documents destinés au mandataire affecté et pièces internes pour la
   préparation d'un futur devis client — sans séparation.

## Décision

- **Matching géographique mandataire** : remplacement du tri par substring par un calcul
  de distance réelle (formule de Haversine, `mandataires.lat/lon` vs `leads.plu_lat/lon`
  issus du calcul PLU), filtré à un rayon de 200 km. Tri : mandataire exclusif (≥10 fiches
  terrain actives, seuil ADR-026/CGU) en premier, puis distance croissante. Si le PLU
  n'est pas encore calculé, repli sur tri exclusivité seule (liste non filtrée par
  distance). Si aucun mandataire dans les 200 km, message explicite.
- **Réorganisation des sections** : suppression de « Configuration Arko »
  (`LeadConfigurateur.tsx` supprimé du repo, plus aucune référence). « Affectation
  mandataire » et « Dossier mandataire » (renommé depuis « Dossier client ») deviennent
  des sous-sections de « Zone de recherche terrain », colonne 2 de la fiche. Colonne 1 :
  « Identité & Projet » + nouvelle « GED Client ».
- **Autocomplete Google Places** sur le champ « Adresse de recherche » (même pattern
  `loadGooglePlacesScript` / `PlaceAutocompleteElement` que `LeadEditIdentite.tsx`),
  extraction commune/code postal depuis `addressComponents`.
- **Emails récap** :
  - Mandataire affecté : nouvelle route `POST /api/admin/leads/[id]/affecter/recap`,
    réutilise le template Brevo `BREVO_TEMPLATE_AFFECTATION` existant avec deux nouvelles
    variables (`LEAD_DESCRIPTION`, `LEAD_PRODUIT`) et un lien direct vers
    `/mandataire/dossiers/{dossier.id}` (au lieu de la liste générique).
  - Client : nouvelle route `POST /api/admin/leads/[id]/recap-client`, réutilise le
    template `BREVO_TEMPLATE_RECAP` déjà utilisé pour réservation/recherche-terrain, en
    préparation d'un futur devis (génération du devis elle-même hors scope).
- **GED double** : nouvelle table `lead_client_documents` (migration
  `20260710_lead_client_documents.sql`), séparée de `lead_documents`, sans colonne
  `mandataire_id`. Réutilise le bucket storage `lead-documents` déjà provisionné, avec un
  préfixe de chemin `client/{leadId}/...` distinct de `leads/{leadId}/...`. Nouvelle route
  `/api/admin/leads/[id]/client-documents` et composant `LeadClientDocuments.tsx`, calqués
  sur le pattern existant `LeadDocuments.tsx` / `documents/route.ts`.

## Faisabilité

- **Verdict** : ✅ — toutes les briques nécessaires existaient déjà (colonnes géo
  mandataire, pattern Google Places, infra Brevo, bucket storage) ; travail de câblage et
  de réorganisation, pas de nouvelle dépendance externe.
- **Dépendances externes** :
  - Le template Brevo `BREVO_TEMPLATE_AFFECTATION` doit être édité pour afficher les
    nouveaux placeholders `{{params.LEAD_DESCRIPTION}}` et `{{params.LEAD_PRODUIT}}`
    (sinon les variables sont envoyées mais invisibles dans l'email reçu).
  - Migration `20260710_lead_client_documents.sql` à appliquer sur Preview/Prod selon le
    workflow habituel (validation à la PR dev→main).
- **Risques** : aucun mandataire n'a nécessairement `lat`/`lon` renseignés (profil
  géographique optionnel à la création) — le rayon de 200 km ne filtre que les mandataires
  géolocalisés ; les autres restent invisibles dans la liste tant qu'ils n'ont pas complété
  leur profil.

## Conséquences

- La GED Client (`lead_client_documents`) sert de base pour une future génération de
  devis (non traitée dans cet ADR — étape suivante à définir).
- Le tri par `zone_activite` (texte libre) est abandonné au profit d'un calcul
  géographique réel ; `zone_activite` reste en base mais n'est plus utilisé pour
  l'affectation.
- Toute future évolution du calcul de distance (ex. distance routière plutôt qu'à vol
  d'oiseau) devra remplacer la fonction `haversineKm` dans `AssignMandataire.tsx`.

## Sources

`src/app/(admin)/admin/(protected)/leads/[id]/page.tsx`,
`src/components/admin/AssignMandataire.tsx`,
`src/components/admin/LeadEditLocalisation.tsx`,
`src/components/admin/LeadClientDocuments.tsx`,
`supabase/migrations/20260630_mandataires_profil_geo.sql`,
`supabase/migrations/20260710_lead_client_documents.sql`, ADR-026 (seuil exclusivité).

## Amendement 2026-07-30 — ADR-028 (suspension domaine mandataire)
Les sous-sections « Affectation mandataire » (matching géo 200 km) et « Dossier mandataire »
(GED mandataire) de la fiche lead sont **masquées**, ainsi que les routes `affecter`,
`affecter/recap`, `affecter/resend` et `documents`. **La GED Client est conservée** : elle ne
dépend pas du mandataire. Le reliquat « placeholders Brevo `LEAD_DESCRIPTION` / `LEAD_PRODUIT`
sur le template 15 » devient sans objet tant que la suspension tient.
