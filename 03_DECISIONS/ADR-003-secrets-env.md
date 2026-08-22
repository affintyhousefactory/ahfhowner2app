# ADR-003 — Secrets & montants via variables d'environnement, jamais dans Git

- **Statut** : Accepté (partiel)
- **Date** : 2026-06-16
- **Phase** : 1+
- **Faisabilité** : ✅ En place ; reste `.env.example`
- **Alerte Albert** : Non

## Contexte
Aucun montant ni secret ne doit être codé en dur. `site.ts` lit déjà les montants depuis l'environnement (`NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR`, `NEXT_PUBLIC_ARKO_BASE_EUR`, tarifs livraison) avec fallback constant. Les clés Phase 4 (Supabase, Stripe, Apify) ne sont pas encore configurées.

## Décision
- Montants commerciaux → `NEXT_PUBLIC_*` (client), lus via env avec fallback.
- Clés serveur (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APIFY_TOKEN`, `ANTHROPIC_API_KEY`) → secrets serveur, **jamais commités**, jamais exposés client.
- Fournir un `.env.example` (placeholders uniquement).

## Faisabilité
- **Verdict** : ✅ Pattern déjà appliqué dans `site.ts`. Manque le `.env.example` documenté.
- **Dépendances externes** : aucune.
- **Risques** : confusion clé publique vs service-role (cf. ADR-007 RLS).

## Amendement du 2026-08-22 — les variables de montant sont enfin posées

**Constat.** Le corps de cet ADR affirme que « `site.ts` lit déjà les montants depuis l'environnement ». C'était vrai du code et faux des faits : **aucune** des variables de montant n'existait dans un scope Vercel. Le repli constant était la seule valeur servie depuis l'origine — la lecture d'environnement ne servait à rien, et un prix ne pouvait pas être changé sans commit, PR et déploiement. L'écart n'a été vu qu'en corrigeant le tarif de l'Arko One (ADR-029 § Amendement du 2026-08-22).

**Décision de Richard : les poser.** Neuf variables, en Preview et en production, aux valeurs exactes des replis du code.

| Variable | Valeur | Ce qu'elle pilote |
|---|---|---|
| `NEXT_PUBLIC_ARKO_ONE_BASE_EUR` | `69900` | prix de base Arko One |
| `NEXT_PUBLIC_ARKO_BASE_EUR` | `99900` | prix de base Arko Max |
| `NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR` | `2000` | réservation, sur toutes les surfaces |
| `NEXT_PUBLIC_DELIVERY_GRUTAGE_EUR` | `1440` | forfait grutage |
| `NEXT_PUBLIC_DELIVERY_PER_KM_EUR` | `2.16` | transport Arko Max (9 t × 0,24 €/t/km) |
| `NEXT_PUBLIC_ARKO_ONE_DELIVERY_PER_KM_EUR` | `1.44` | transport Arko One (6 t × 0,24 €/t/km) |
| `NEXT_PUBLIC_CONTACT_PHONE` | `+33 (0)5 64 37 37 14` | téléphone affiché |
| `NEXT_PUBLIC_CRM_CONSEILLERS` | `Richard,Albert,Accueil` | liste d'affectation du back-office |
| `NEXT_PUBLIC_CRM_SLA_JOURS` | `7` | délai de rappel |

Poser la variable ne change rien le jour même. C'est voulu : la manœuvre doit être vérifiable — si un montant bougeait à l'écran, c'est qu'une valeur aurait été mal saisie.

**Vérifié, et pas seulement constaté.** Un déploiement servant 69 900 € ne prouve rien : le repli du code vaut le même montant, et les deux chemins donnent le même écran. La variable de Preview a donc été passée à **68 900 €** le temps d'un redéploiement : la page produit et son JSON-LD ont suivi, puis la valeur a été rétablie. C'est ce test qui établit que la variable est lue — le premier ne discriminait rien.

**Ce que « sans redéploiement » ne veut pas dire.** Next inline les `NEXT_PUBLIC_*` **au build** : changer un montant impose toujours un redéploiement, simplement plus un commit, une PR et une revue. Le gain est réel — un prix se corrige depuis l'interface Vercel, par quelqu'un qui ne touche pas au code — mais la valeur ne se propage pas à chaud. Toute formulation laissant croire l'inverse serait fausse.

### Le garde-fou qui manquait

Poser ces variables crée un risque qui n'existait pas tant qu'elles étaient absentes. `Number(process.env.X ?? repli)` a un angle mort : **`??` ne se déclenche que sur `null`/`undefined`**. Une variable définie mais vide — valeur effacée dans l'interface, espace en trop, montant collé avec son séparateur de milliers — traverse la garde, et `Number("")` vaut **0**. Le site afficherait un studio de jardin à **0 €**, sans qu'aucun déploiement n'échoue.

`site.ts` lit désormais ses montants par `montantEnv(brut, repli, nom)` : vide, non numérique, zéro ou négatif ⇒ repli, avec un avertissement nommant la variable dans la console du build. Les séparateurs de milliers et la virgule décimale sont tolérés — un montant se saisit à la main, et « 69 900 » est ce qu'on tape naturellement. Vérifié sur dix cas, dont chacun des quatre modes d'échec.

**Zéro est refusé** pour tous ces montants : aucun n'a de raison de valoir zéro, et accepter zéro reviendrait à ne pas avoir de garde-fou du tout.

### Ce qui n'est délibérément pas posé

- **`NEXT_PUBLIC_FEATURE_MANDATAIRE`** — ADR-028 pose que « variable absente = suspendu, c'est le défaut sûr ». La définir, fût-ce à `false`, transformerait un défaut sûr en valeur à maintenir, qu'une faute de frappe suffirait à inverser. Le domaine reste suspendu par absence.
- **`NEXT_PUBLIC_GA_MEASUREMENT_ID`** en Preview — la mesure d'audience n'a pas à collecter le trafic de recette. Elle reste en production seule.
- **`NEXT_PUBLIC_SITE_URL`** en Preview — le repli vaut `https://howner.fr`, donc une Preview annonce des URL canoniques de production. C'est un défaut réel mais distinct : l'URL d'une Preview change à chaque déploiement et ne peut pas être une constante. À traiter avec `VERCEL_URL`, hors de cet amendement.

## Conséquences
`.gitignore` doit couvrir `.env.local`. Toute nouvelle intégration ajoute sa variable au `.env.example`.

## Sources
`src/lib/site.ts`, `PASSATION_RICHARD.md` (variables d'environnement Phase 4).
