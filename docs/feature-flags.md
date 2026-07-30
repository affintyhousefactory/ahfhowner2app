# Feature flags — mode d'emploi

Procédure d'exploitation. La **décision** et son périmètre exhaustif sont dans
`03_DECISIONS/ADR-028-suspension-domaine-mandataire.md` — ce document dit
seulement *comment actionner l'interrupteur*, dans les deux sens.

## Flags existants

| Flag | Variable Vercel | État actuel | ADR |
|---|---|---|---|
| `FEATURES.mandataire` | `NEXT_PUBLIC_FEATURE_MANDATAIRE` | **suspendu** (variable non définie) | 028 |

Source : `src/lib/features.ts`. Gardes : `src/shared/lib/feature-guard.ts`.

## Règle de lecture

```ts
mandataire: process.env.NEXT_PUBLIC_FEATURE_MANDATAIRE === "true"
```

**Seule la chaîne exacte `"true"` active la fonctionnalité.** Tout le reste —
variable absente, chaîne vide, `1`, `TRUE`, `yes` — vaut **suspendu**. C'est
délibéré : un oubli ou une faute de frappe ne peut pas rouvrir le dispositif.

Le préfixe `NEXT_PUBLIC_` est obligatoire : le flag est lu par des composants
client (`Footer`, `Nav`, `Configurator`, `config-store`, `ParcelleAnalyse`).
Conséquence à connaître : **sa valeur est inlinée au build**. Changer la
variable sur Vercel n'a d'effet qu'après un redéploiement — ce n'est pas un
interrupteur à chaud.

## Activer (lever la suspension)

1. **Preview d'abord.** Vercel → Settings → Environment Variables →
   `NEXT_PUBLIC_FEATURE_MANDATAIRE` = `true`, scope **Preview** uniquement.
2. Redéployer une branche pour que la valeur soit prise en compte
   (`vercel --force` ou un push).
3. Dérouler la checklist de vérification ci-dessous.
4. Si tout est vert : ajouter la même variable sur le scope **Production**,
   puis redéployer `main`.
5. Suivre les étapes métier de l'ADR-028 § « Procédure de réactivation » —
   relecture des textes publics (ADR-004), état des comptes mandataires et des
   fiches terrain en base, test du tunnel complet jusqu'à l'email Brevo.
6. Mettre à jour le statut d'ADR-028 et `00_INDEX/PROJECT_STATE.md`.

## Désactiver (re-suspendre)

1. **Supprimer** la variable `NEXT_PUBLIC_FEATURE_MANDATAIRE` du scope concerné
   — ne pas la passer à `false`. L'absence est l'état canonique, et une
   variable orpheline à `false` invite à la « corriger » par erreur.
2. Redéployer.
3. Vérifier les 404 (checklist ci-dessous).
4. **Ne pas oublier le SEO** : `/terrains` et `/rechercheterrain` auront été
   réintroduits au sitemap pendant la période active. Après re-suspension elles
   repassent en 404 et sortent du sitemap automatiquement, mais Google mettra
   quelques semaines à les désindexer à nouveau.
5. Si des données ont été créées pendant la période active (leads affectés,
   fiches terrain publiées, dossiers ouverts), elles restent en base et
   redeviennent inaccessibles depuis l'interface. Traiter le sort commercial de
   ces dossiers **avant** de re-suspendre, pas après.

## Checklist de vérification

À dérouler après tout changement de valeur, dans un sens comme dans l'autre.
« Suspendu » = colonne de gauche, « actif » = colonne de droite.

| Vérification | Suspendu | Actif |
|---|---|---|
| `/mandataire`, `/mandataire/auth/signin` | 404 | page servie |
| `/terrains`, `/rechercheterrain`, `/terrain`, `/cgu-mandataire` | 404 | page servie |
| `/admin/mandataires`, `/admin/affectations`, `/admin/ged`, `/admin/terrains` | 404 | page servie |
| Sidebar admin | 2 entrées | 6 entrées |
| `sitemap.xml` | 7 URLs | 9 URLs |
| `robots.txt` | `/terrains`, `/rechercheterrain`, `/terrain`, `/cgu-mandataire` en `disallow` | absents du `disallow` |
| `POST /api/recherche-terrain`, `/api/mandataire/dossiers` | 404 | réponse métier |
| Footer | ni « Recherche terrain » ni « Accès Mandataire » | les deux présents |
| `/configurer` § « Votre situation terrain » | analyse PLU directe, pas de sélecteur | sélecteur 2 boutons |
| Fiche lead admin | GED Client seule | + Affectation + Dossier mandataire |

Contrôle rapide en ligne de commande :

```bash
BASE=https://<deployment>.vercel.app
for p in /mandataire /terrains /rechercheterrain /terrain /cgu-mandataire \
         /admin/mandataires /admin/affectations /admin/ged /admin/terrains; do
  printf '%-28s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$p")"
done
curl -s "$BASE/sitemap.xml" | grep -c '<url>'
```

## Ajouter un nouveau flag

1. Une clé dans `FEATURES` (`src/lib/features.ts`), commentée : ce qu'elle
   couvre, pourquoi, et où est la décision.
2. Défaut = **fonctionnalité désactivée** quand la variable est absente.
3. Poser les gardes **aux frontières** — layout de groupe ou de segment pour
   les pages, première ligne du handler pour les API — plutôt que de parsemer
   des conditions dans les composants. Une garde de layout couvre toutes les
   sous-routes ; c'est ce qui rend le masquage exhaustif sans être invasif.
4. Un ADR pour la décision, une ligne dans le tableau « Flags existants »
   ci-dessus, et la checklist de vérification correspondante.
