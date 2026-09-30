# CURRENT_SESSION — Howner / ARKO

> Mémoire courte. Historique complet et backlog → `00_INDEX/PROJECT_STATE.md` § « Dernier point ».
> Règle : 300–1200 tokens.

## Décisions — 2026-09-30 (« architecte » sort du site ; nouveau numéro)

**`main` = `1cc3e4b8`**, inchangé. Travail ajouté à `feat/adr-029-doctrine-lexicale` → **PR #123 vers `dev`**.

- **Point ouvert n° 4 d'ADR-029 tranché par Richard** : « retirer partout architecte et remplacer par
  conseiller ». Personne → « notre conseiller » ; studio → « d'exception » ; conception → « dessiné
  dans notre atelier » (un conseiller ne dessine pas). ADR-029 § Amendement du 2026-09-30.
- Motif `architectes?(?! des b)` dans `PROSCRITS` (site + Brevo), éprouvé 3 fautives / 4 légitimes.
  Restent : ABF (exclu par le motif), question réglementaire du guide 40 m² (`sauf`).
- **Téléphone → `+33 (0)7 56 90 81 91`** : repli de `site.ts` changé. ⚠ **`NEXT_PUBLIC_CONTACT_PHONE`
  sur Vercel (Production + Preview) porte encore l'ancien numéro et prime sur le repli** — à changer
  par Richard (refusé à Claude), puis redéployer.
- Richard a fait : référent `howner.fr` sur la clé Google Places ; `BREVO_TEMPLATE_MULTICFG=17` sur Vercel.

## Brevo — à corriger dans le dashboard (écriture non faite, écrase sans historique)
- **Ancien numéro en dur** (`tel:` et **`wa.me/33564373714`**) dans 12 templates actifs :
  9, 10, 17, 18, 19, 20, 21, 22, 23, 24, 26, 32. Sauvegarde HTML prise en scratchpad de session.
- **« architecte »** dans 19, 21, 26 (dont « notre architecte monte le dossier » — rôle non exercé).
- **« maison »** dans 24 (préexistant).

## Prochaine action
1. Richard : `NEXT_PUBLIC_CONTACT_PHONE` sur Vercel ; feu vert pour réécrire les templates Brevo.
2. Fusionner PR #123 après vérification Preview.
3. Bascule `/configurer` (+ `llms.txt` : volume, numéro, acompte ; template 9).
4. Copie « fabricant-installateur » `/a-propos` + pied de page, avec Richard.
