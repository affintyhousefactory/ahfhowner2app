# RECENT DECISIONS — Howner / ARKO

## Décisions récentes

### 2026-09-07 (le site cesse de promettre ce qu'il ne tient pas)
- **Le visiteur ne choisit plus son exemplaire.** La grille de numéros affichait un état statique,
  jamais lu en base. Attribution par le conseiller en CRM, bouton « Être rappelé », `slot: null`.
  → ADR-031 § Amendement.
- **Aucun volume d'exemplaires ne s'affiche plus côté public** — une page HPA doit pouvoir en
  proposer plusieurs. « Arko — édition limitée », sans nombre. → ADR-030 § Amendement, point 5.
- **Une teinte de bardage retirée se marque, elle ne se supprime pas** (`surDemande`) : les leads
  antérieurs se relisent, la rouvrir est un booléen.
- **Les CTA disent ce vers quoi ils mènent** : « Configurer », pas « Réserver » — via une constante,
  le libellé étant réécrit dans onze fichiers.
- **Aucune allégation environnementale non démontrable**, sur *toutes* les surfaces : la clause vaut
  au-delà de la page RSE et a imposé de réécrire la section 04 d'`/a-propos`. → ADR-038 §7.
- **Sortir du gabarit commun se justifie par ce que le contenu perdrait à y entrer**, jamais par une
  préférence de rendu. → ADR-038 § Amendement.
- **Le build Vercel de la PR fait partie de la gate** quand la Preview n'a pas été vérifiée : `tsc`
  peut passer là où `next build` échoue.

### 2026-08-02 (ADR-030 — mise en œuvre du configurateur v2)
- **Colonne de sections dépliantes** retenue contre le stepper : l'écran 0 étant descendu en section 05, le stepper n'avait plus d'avantage. → ADR-030 § Amendement.
- **Groupe de routes `(configurateur)`** pour servir `/configurer/v2` sans nav — une mise en page imbriquée ne peut pas retirer la `<Nav>` de sa parente.
- **Scène à hauteur constante** : le rétrécissement mobile est rejeté après essai (`object-cover` coupait le pied du module). C'est l'en-tête qui s'efface.
- **CTA « Tester mon terrain » retiré** de l'accueil et des pages produit : son repli menait au configurateur v1, que plus aucun bouton ne dessert.
- **Le vocabulaire s'apprécie sur le texte rendu, pas sur le code.** « clé en main » était servi sur les pages produit, coupé par un retour à la ligne JSX, invisible au contrôle. → ADR-029 § Amendement.
- **Plus de test local** (dev server, Playwright, `next build`) : HMR aveugle sur `/mnt/d`, laptop lent. Gate = `tsc` + `eslint` + `check:vocabulaire` + Preview Vercel.

---

> Historique antérieur au 2026-08-02 : `00_INDEX/PROJECT_STATE.md` § « Dernier point ».
> Ce fichier reste court — trois entrées au plus. Élagué le 2026-09-07.
