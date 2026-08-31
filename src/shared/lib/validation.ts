/**
 * Contrôles de saisie partagés — email, SIREN, site web.
 *
 * ⚠ Le motif d'email était écrit **trois fois** dans le dépôt, avec trois
 * définitions différentes : `/api/contact` acceptait un jeu de caractères
 * restreint, `/api/configurateur/reservation` un autre, et le store du
 * configurateur se contentait de `.+@.+\..{2,}`. Trois formulaires, trois idées
 * de ce qu'est une adresse valide — c'est la même dérive qu'ADR-029 pour le
 * vocabulaire. Tout se lit ici désormais.
 */

/**
 * Une adresse **plausible**, pas une adresse valide.
 *
 * La seule façon de savoir qu'une adresse existe est de lui écrire ; aucune
 * expression régulière ne le dira. Celle-ci écarte ce qui ne peut pas marcher —
 * espace, arobase manquante ou doublée, domaine sans point, extension d'une
 * seule lettre — et laisse passer le reste. Un contrôle plus strict rejette des
 * adresses réelles (apostrophes, `+`, domaines longs), ce qui coûte plus cher
 * qu'une faute de frappe rattrapée au rappel suivant.
 */
export function emailPlausible(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Ni vide, ni plausible : la seule combinaison qui mérite d'être signalée. */
export function emailMalForme(email: string | null | undefined): boolean {
  const v = (email ?? "").trim();
  return v.length > 0 && !emailPlausible(v);
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* SIREN                                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */

/** Ne garde que les chiffres — le SIREN se dicte « 812 345 678 ». */
export function sirenChiffres(siren: string | null | undefined): string {
  return (siren ?? "").replace(/\D/g, "");
}

/**
 * Clé de contrôle du SIREN (algorithme de Luhn).
 *
 * ⚠ **Un SIREN qui échoue au test n'est pas forcément faux.** La Poste porte
 * historiquement le 356 000 000, qui ne respecte pas la clé — l'INSEE l'admet
 * comme exception. Le résultat sert donc à **avertir**, jamais à refuser : au
 * téléphone, un chiffre mal entendu est fréquent, et bloquer la saisie ferait
 * perdre les huit autres.
 */
export function sirenValide(siren: string | null | undefined): boolean {
  const n = sirenChiffres(siren);
  if (n.length !== 9) return false;

  let somme = 0;
  for (let i = 0; i < 9; i++) {
    let c = Number(n[i]);
    /* Un chiffre sur deux est doublé, en partant de la droite : sur neuf
       positions, ce sont les rangs pairs depuis la gauche. */
    if (i % 2 === 1) {
      c *= 2;
      if (c > 9) c -= 9;
    }
    somme += c;
  }
  return somme % 10 === 0;
}

/** Affichage lisible : « 812345678 » → « 812 345 678 ». */
export function sirenFormate(siren: string | null | undefined): string {
  const n = sirenChiffres(siren);
  return n.length === 9 ? `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}` : n;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Site web                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * Complète une adresse de site dictée au téléphone.
 *
 * Personne ne dit « h-t-t-p-s deux-points » : on entend « camping-des-pins point
 * fr ». Sans schéma, l'URL devient relative une fois affichée en lien, et mène
 * au back-office au lieu du site du prospect. On préfixe donc en `https://`,
 * jamais en `http://` — un site professionnel sans TLS en 2026 redirigera
 * lui-même.
 */
export function normaliserSiteWeb(url: string | null | undefined): string | null {
  const v = (url ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

/** Un domaine reconnaissable : au moins un point, pas d'espace. */
export function siteWebPlausible(url: string | null | undefined): boolean {
  const v = (url ?? "").trim().replace(/^https?:\/\//i, "");
  if (!v) return false;
  return /^[^\s/]+\.[^\s/]{2,}/.test(v);
}
