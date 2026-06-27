# Brief Claude Artifact — Templates email Brevo · ARKO / Affinity House Factory

> **Objectif** : produire deux templates email HTML complets (visuellement validables), destinés à être créés dans le dashboard Brevo comme templates transactionnels réutilisables (avec `templateId`). Les variables dynamiques suivent la syntaxe Brevo / Jinja2.

---

## Analyse d'impact : Resend → Brevo

### Pourquoi Brevo ?

| Critère | Resend (ADR-026) | Brevo |
|---|---|---|
| Hébergement | États-Unis (SCC RGPD requis) | **Union Européenne** |
| Déclaré dans `/confidentialite` | ❌ non | ✅ **déjà déclaré** (sous-traitant existant) |
| Usage déclaré | — | "Envoi de newsletter" → extensible aux emails transactionnels |
| Templates visuels | Dashboard limité | **Éditeur drag-and-drop + HTML brut** |
| Tier gratuit | 3 000/mois | **300/jour (≈ 9 000/mois)** |
| Syntaxe templates | `{{variable}}` (Handlebars) | `{{ params.variable }}` (Jinja2) |
| SDK Node.js | `resend` (installé) | `@getbrevo/brevo` (à installer) |
| React Email compatible | ✅ natif | ❌ non — templates HTML séparés |

### Impact code

| Fichier | Action |
|---|---|
| `package.json` | Retirer `resend` + `@react-email/components` · Ajouter `@getbrevo/brevo` |
| `emails/contact-confirmation.tsx` | **Supprimer** (logique → template Brevo HTML) |
| `emails/configurateur-recap.tsx` | **Supprimer** (logique → template Brevo HTML) |
| `src/app/api/recherche-terrain/route.ts` | Remplacer `new Resend()` + `.emails.send({ react: ... })` par Brevo SDK |
| `src/app/api/contact/route.ts` | Créer avec Brevo SDK dès le départ |
| `.env.local` / Vercel env | `RESEND_API_KEY` → `BREVO_API_KEY` · `RESEND_FROM` → garder comme `BREVO_SENDER_EMAIL` |
| `src/app/confidentialite/page.tsx` | ✅ **Aucun changement** — Brevo déjà listé |
| `ADR-026` | Amender : remplacer Resend par Brevo, noter avantage RGPD EU |

### Impact RGPD

Brevo est **déjà déclaré** dans `/confidentialite/page.tsx` (ligne 162) comme sous-traitant UE. Étendre son usage aux emails transactionnels (contact + configurateur) ne crée **aucune nouvelle obligation de déclaration** — la base légale (contrat/intérêt légitime) reste la même. Avantage : suppression du risque de transfert hors-UE inhérent à Resend (US).

### Pattern d'envoi Brevo (remplacement de Resend)

```typescript
// Installation : npm install @getbrevo/brevo
import * as brevo from "@getbrevo/brevo";

const client = new brevo.TransactionalEmailsApi();
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY!;

await client.sendTransacEmail({
  templateId: 1, // ID récupéré depuis le dashboard Brevo
  to: [{ email, name: nom }],
  params: { prenom, nom, produit_label, message }, // variables du template
});
```

---

## Identité de marque

| Élément | Valeur |
|---|---|
| Marque produit | **ARKO** (série limitée) |
| Fabricant | **Affinity House Factory** |
| Site | `affinityhome.fr` |
| Expéditeur | `noreply@affinityhome.fr` |
| Ton | Sobre, haut de gamme, architectural. Pas de jargon technique ni d'effusion commerciale. |
| Langue | Français |
| Signature visuelle | Typographie serif + espacement généreux + palette neutre |

### Palette couleurs

| Token | Valeur | Usage |
|---|---|---|
| Fond body | `#f4f4f0` | Arrière-plan email |
| Fond container | `#ffffff` | Carte principale |
| Fond blocs info | `#f8f8f5` | Blocs de données |
| Texte principal | `#1a1a18` | Titres, valeurs |
| Texte corps | `#3a3a38` | Paragraphes |
| Texte discret | `#888` | Labels uppercase, brand |
| Texte footer | `#aaa` | Footer, liens |
| Séparateur | `#e8e8e4` | `<hr>` |

### Termes **interdits** (règle de marque absolue)
`CCMI` · `LSF` · `acier` · `hors-site` · `modulaire` · `préfabriqué` · `tiny house` · `conteneur` · `catalogue` · `micro-maison`

### Termes corrects
- « notre architecte intégrée » (sans prénom)
- Fondateur = « Puigbo » (sans accent)
- Produits : **Arko One** (20 m²) · **Arko Max** (40 m²)

---

## Syntaxe Brevo pour les templates HTML

```
Variables       : {{ params.nom }}
Conditionnel    : {% if params.produit_label %}...{% endif %}
Boucle          : {% for item in params.zones %}{{ item }}{% endfor %}
Valeur par défaut : {{ params.tel | default("—") }}
```

> Les templates sont créés dans **Brevo > Campaigns > Email Templates > New Template > HTML editor**.  
> Après enregistrement, Brevo attribue un `templateId` (entier) à passer dans l'appel API.

---

## Template 1 — Confirmation de contact

**Déclencheur** : formulaire `/contact` soumis avec succès  
**Sujet Brevo** : `Votre message a bien été reçu — Affinity House Factory`  
**Destinataires** : client (accusé de réception) + copie interne AHF

### Paramètres (`params`)

| Paramètre | Type | Obligatoire | Description |
|---|---|---|---|
| `params.prenom` | string | ✅ | Prénom du contact |
| `params.nom` | string | ✅ | Nom du contact |
| `params.produit_label` | string | — | `Arko One (20 m²)` / `Arko Max (40 m²)` / `Autre demande` — bloc conditionnel |
| `params.message` | string | ✅ | Texte libre du message |

### Structure du contenu

```
[AFFINITY HOUSE FACTORY]  ← uppercase 11px letterspacing #888

H1 : Votre message a bien été reçu

Bonjour {{ params.prenom }} {{ params.nom }},

Nous avons bien reçu votre message et reviendrons vers vous sous 24 h ouvrées.

{% if params.produit_label %}
┌─ Bloc fond #f8f8f5 ───────────────────────────────┐
│ MODÈLE CONCERNÉ                                    │
│ {{ params.produit_label }}                         │
└────────────────────────────────────────────────────┘
{% endif %}

┌─ Bloc fond #f8f8f5 ───────────────────────────────┐
│ VOTRE MESSAGE                                      │
│ (italique) {{ params.message }}                    │
└────────────────────────────────────────────────────┘

────────────────────────────────────────────────────
Affinity House Factory — affinityhome.fr
Cet email vous a été envoyé suite à votre demande de contact.
```

### Données d'exemple (preview Brevo)

```json
{
  "prenom": "Marie",
  "nom": "Dupont",
  "produit_label": "Arko One (20 m²)",
  "message": "Bonjour, je souhaite en savoir plus sur les délais de livraison et les options de financement."
}
```

---

## Template 2 — Récapitulatif configurateur / recherche terrain

**Déclencheur** : formulaire `/configurer` ou `/rechercheterrain` soumis  
**Sujet Brevo** : `Récapitulatif de votre demande ARKO — Affinity House Factory`  
**Destinataires** : client + copie interne AHF

### Paramètres (`params`)

| Paramètre | Type | Obligatoire | Description |
|---|---|---|---|
| `params.nom` | string | ✅ | Nom du demandeur |
| `params.email` | string | ✅ | Email |
| `params.tel` | string | — | Téléphone |
| `params.modele` | string | — | `Arko One` ou `Arko Max` |
| `params.bardage` | string | — | `Anthracite` / `Gris clair` / `Bleu pigeon` / `Vert` |
| `params.facade` | string | — | `Îlot façade foncée` / `Îlot façade claire` |
| `params.bar` | string | — | `Îlot avec barre` / `Îlot sans barre` |
| `params.chambre` | string | — | `Chêne naturel` / `Reflet ardoise` / `Touche olive` |
| `params.interieur` | string | — | `Intérieur bois` / `Intérieur clair` |
| `params.terrasse_m2` | number | — | Surface en m² (0 ou absent = sans terrasse) |
| `params.options_labels` | string | — | Options séparées par virgules |
| `params.total_estime` | string | — | Ex. `67 400 €` |
| `params.pack_label` | string | — | `Pack Essentiel — communes ciblées` / `Pack Étendu — zones élargies` / `Pack Département` |
| `params.zones` | string | — | Communes/zones séparées par virgules |
| `params.budget` | string | — | Budget terrain ex. `80 000 €` |

### Catalogue des valeurs (référence configurateur)

**Bardage** : `Anthracite` · `Gris clair` · `Bleu pigeon` · `Vert`  
**Cuisine** : `Îlot façade foncée` · `Îlot façade claire`  
**Barre** : `Îlot avec barre` · `Îlot sans barre`  
**Chambre** : `Chêne naturel` · `Reflet ardoise` · `Touche olive`  
**Intérieur** : `Intérieur bois` · `Intérieur clair`  
**Options** : `Pack Cuisine Premium` · `Pack Salle d'eau Premium` · `Poêle à bois` · `Pack Solaire` · `Pack Domotique`  
**Packs terrain** : `essentiel` → `Pack Essentiel — communes ciblées` · `etendu` → `Pack Étendu — zones élargies` · `departement` → `Pack Département`

### Structure du contenu

```
[AFFINITY HOUSE FACTORY]  ← uppercase 11px letterspacing #888

H1 : Récapitulatif de votre demande

Bonjour {{ params.nom }},

Voici le récapitulatif de votre configuration et de votre demande de
recherche de terrain. Nous revenons vers vous sous 48 h ouvrées.

{% if params.modele %}
┌─ VOTRE MAISON ────────────────────────────────────┐
│ MODÈLE          BARDAGE                            │
│ {{ params.modele }}   {% if params.bardage %}{{ params.bardage }}{% endif %}  │
│                                                    │
│ CUISINE         BARRE                              │
│ {% if params.facade %}{{ params.facade }}{% endif %}   {% if params.bar %}{{ params.bar }}{% endif %}  │
│                                                    │
│ CHAMBRE         INTÉRIEUR                          │
│ {% if params.chambre %}{{ params.chambre }}{% endif %}  {% if params.interieur %}{{ params.interieur }}{% endif %}  │
│                                                    │
│ {% if params.terrasse_m2 %}                        │
│ TERRASSE                                           │
│ {{ params.terrasse_m2 }} m²                        │
│ {% endif %}                                        │
│                                                    │
│ {% if params.options_labels %}                     │
│ OPTIONS                                            │
│ {{ params.options_labels }}                        │
│ {% endif %}                                        │
│                                                    │
│ {% if params.total_estime %}                       │
│ ─────────────────────────────────────────────────  │
│ ESTIMATION TOTALE                                  │
│ {{ params.total_estime }}  ← gras 17px             │
│ {% endif %}                                        │
└────────────────────────────────────────────────────┘
{% endif %}

{% if params.pack_label %}
┌─ RECHERCHE DE TERRAIN ────────────────────────────┐
│ PACK                                               │
│ {{ params.pack_label }}                            │
│                                                    │
│ {% if params.zones %}                              │
│ ZONES / COMMUNES                                   │
│ {{ params.zones }}                                 │
│ {% endif %}                                        │
│                                                    │
│ {% if params.budget %}                             │
│ BUDGET TERRAIN                                     │
│ {{ params.budget }}                                │
│ {% endif %}                                        │
└────────────────────────────────────────────────────┘
{% endif %}

┌─ VOS COORDONNÉES ─────────────────────────────────┐
│ NOM             EMAIL                              │
│ {{ params.nom }}   {{ params.email }}              │
│                                                    │
│ {% if params.tel %}                                │
│ TÉLÉPHONE                                          │
│ {{ params.tel }}                                   │
│ {% endif %}                                        │
└────────────────────────────────────────────────────┘

────────────────────────────────────────────────────
Affinity House Factory — affinityhome.fr
Cet email confirme la réception de votre demande.
```

### Données d'exemple — configurateur complet

```json
{
  "nom": "Jean Martin",
  "email": "jean.martin@example.com",
  "tel": "06 12 34 56 78",
  "modele": "Arko One",
  "bardage": "Anthracite",
  "facade": "Îlot façade foncée",
  "bar": "Îlot avec barre",
  "chambre": "Chêne naturel",
  "interieur": "Intérieur bois",
  "terrasse_m2": 12,
  "options_labels": "Pack Cuisine Premium, Poêle à bois",
  "total_estime": "67 400 €",
  "pack_label": "Pack Étendu — zones élargies",
  "zones": "Pays Basque, Landes",
  "budget": "80 000 €"
}
```

### Données d'exemple — recherche terrain seule

```json
{
  "nom": "Sophie Leroux",
  "email": "sophie.leroux@example.com",
  "tel": null,
  "modele": null,
  "pack_label": "Pack Essentiel — communes ciblées",
  "zones": "Anglet, Biarritz, Bayonne",
  "budget": null
}
```

---

## Contraintes techniques pour les templates Brevo (HTML)

- Format : **HTML statique inline** (pas de CSS externe, pas de `<style>` dans `<head>`)
- Syntaxe variables : `{{ params.variable }}`
- Syntaxe conditionnelle : `{% if params.variable %}...{% endif %}`
- Max width container : **560 px**
- Pas de JavaScript
- Compatible : Gmail · Outlook · Apple Mail
- Toutes les valeurs optionnelles doivent être dans un bloc `{% if %}...{% endif %}`

---

## Workflow de validation → publication → intégration

1. **Claude Artifact** génère les 2 templates HTML avec les données d'exemple
2. **Validation visuelle** dans le navigateur (artefact rendu)
3. **Publication Brevo** : Dashboard > Campaigns > Email Templates > New Template > paste HTML
4. **Récupération des `templateId`** (entiers) depuis l'URL ou la liste Brevo
5. **Mise à jour des routes API** :
   - `/api/contact` → `sendTransacEmail({ templateId: ID_1, params: { prenom, nom, produit_label, message } })`
   - `/api/recherche-terrain` → `sendTransacEmail({ templateId: ID_2, params: { nom, email, modele, bardage, ... } })`
6. **Amendment ADR-026** : noter le remplacement Resend → Brevo + avantage RGPD EU

---

## Variables d'environnement (remplacement)

```bash
# Retirer
RESEND_API_KEY
RESEND_FROM
RESEND_TO_AHF

# Ajouter
BREVO_API_KEY=           # serveur, jamais commité
BREVO_SENDER_EMAIL=noreply@affinityhome.fr
BREVO_SENDER_NAME=Affinity House Factory
BREVO_TO_AHF=contact@affinityhousefactory.com
BREVO_TEMPLATE_CONTACT=  # templateId entier (après création dashboard)
BREVO_TEMPLATE_RECAP=    # templateId entier (après création dashboard)
```

---

## Fichiers source de référence

- `emails/contact-confirmation.tsx` — template React Email (logique de référence, à supprimer après migration)
- `emails/configurateur-recap.tsx` — template React Email (logique de référence, à supprimer après migration)
- `src/lib/site.ts` → `CONFIG` (choix configurateur), `PRICING` (options), `PRODUCTS`
- `src/components/site/ContactForm.tsx` — champs formulaire contact
- `src/app/api/recherche-terrain/route.ts` — payload API terrain (utilise encore `resend`)
- `src/app/confidentialite/page.tsx` ligne 162 — Brevo déjà déclaré sous-traitant
- `03_DECISIONS/ADR-026-emails-resend-templates-supabase.md` — à amender
