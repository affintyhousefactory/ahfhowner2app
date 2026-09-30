# CURRENT_SESSION — Howner / ARKO

> Mémoire courte. Historique complet et backlog → `00_INDEX/PROJECT_STATE.md` § « Dernier point ».
> Règle : 300–1200 tokens.

## Décisions — 2026-09-30 (« architecte » sort du site ; nouveau numéro)

**En production : `main` = `9367ab37`** (PR #123 → `dev`, PR #124 → `main`). Aucune migration.

- **Point ouvert n° 4 d'ADR-029 tranché par Richard** : « retirer partout architecte et remplacer par
  conseiller ». Personne → « notre conseiller » ; studio → « d'exception » ; conception → « dessiné
  dans notre atelier » (un conseiller ne dessine pas). ADR-029 § Amendement du 2026-09-30.
- Motif `architectes?(?! des b)` dans `PROSCRITS` (site + Brevo), éprouvé 3 fautives / 4 légitimes.
  Restent : ABF (exclu par le motif), question réglementaire du guide 40 m² (`sauf`).
- **Téléphone → `+33 (0)7 56 90 81 91`** : repli de `site.ts` changé. Variable Vercel
  `NEXT_PUBLIC_CONTACT_PHONE` mise à jour par Richard.
- Richard a fait : référent `howner.fr` sur la clé Google Places ; `BREVO_TEMPLATE_MULTICFG=17` sur Vercel.

## Brevo — à corriger dans le dashboard (écriture non faite, écrase sans historique)
- **Ancien numéro en dur** (`tel:` et **`wa.me/33564373714`**) dans 12 templates actifs :
  9, 10, 17, 18, 19, 20, 21, 22, 23, 24, 26, 32. Sauvegarde HTML prise en scratchpad de session.
- **« architecte »** dans 19, 21, 26 (dont « notre architecte monte le dossier » — rôle non exercé).
- **« maison »** dans 24 (préexistant).

## Prochaine action
1. Feu vert de Richard pour réécrire les templates Brevo.
2. Bascule `/configurer` (+ `llms.txt` : volume, numéro, acompte ; template 9).
3. Copie « fabricant-installateur » `/a-propos` + pied de page, avec Richard.
