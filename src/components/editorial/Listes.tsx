import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Reserve } from "./Bloc";

/* Formes de liste communes aux cinq specs du lot 2. */

/** Arguments numérotés — « Pourquoi Howner ? », blocs bénéfices. */
export function Arguments({
  items,
}: {
  items: readonly {
    titre: string;
    texte: string;
    reserve?: string;
  }[];
}) {
  return (
    <div className="mt-16 grid gap-x-12 gap-y-12 md:mt-24 md:grid-cols-2">
      {items.map((a, i) => (
        <Reveal key={a.titre} delay={0.05 * i}>
          <div className="border-t border-line pt-6">
            <span className="editorial text-[2rem] leading-none text-ink/20">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="editorial mt-4 text-xl text-ink md:text-2xl">{a.titre}</h3>
            <p className="mt-3 text-[1rem] leading-relaxed text-muted">{a.texte}</p>
            {a.reserve ? <Reserve>{a.reserve}</Reserve> : null}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** Grille de cartes — usages, profils. */
export function Cartes({
  items,
}: {
  items: readonly { titre: string; texte: string }[];
}) {
  return (
    <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
      {items.map((c) => (
        <StaggerItem key={c.titre}>
          <div className="flex h-full flex-col border border-line bg-surface p-7">
            <h3 className="editorial text-lg text-ink md:text-xl">{c.titre}</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{c.texte}</p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/** Parcours numéroté — les cinq temps du projet. */
export function Etapes({
  items,
}: {
  items: readonly { titre: string; texte: string }[];
}) {
  return (
    <Stagger className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-20 lg:grid-cols-5">
      {items.map((e, i) => (
        <StaggerItem key={e.titre}>
          <div className="flex h-full flex-col border-t border-line pt-5">
            <span className="editorial text-[2.5rem] leading-none text-ink/20 md:text-[3rem]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="editorial mt-4 text-lg text-ink">{e.titre}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{e.texte}</p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/**
 * Tableau à deux colonnes — exigence / approche, comparatifs.
 *
 * Rendu en `<table>` et non en grille de `<div>` : ce sont des données
 * appariées, un lecteur d'écran doit pouvoir lire « Structure → ossature
 * légère », pas deux fragments sans lien. Sur mobile, chaque ligne devient un
 * bloc empilé — le tableau ne déborde pas, il change de forme.
 */
export function TableauDeux({
  entetes,
  lignes,
}: {
  entetes: readonly [string, string];
  lignes: readonly { gauche: string; droite: string }[];
}) {
  return (
    <Reveal>
      <div className="mt-14 md:mt-20">
        <table className="w-full border-collapse text-left">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-line">
              {entetes.map((e) => (
                <th
                  key={e}
                  scope="col"
                  className="py-4 pr-6 font-mono text-[0.7rem] font-normal uppercase tracking-[0.18em] text-muted"
                >
                  {e}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr
                key={l.gauche}
                className="flex flex-col border-b border-line py-5 md:table-row md:py-0"
              >
                <th
                  scope="row"
                  className="pr-6 text-left align-top font-medium text-ink md:w-1/3 md:py-5 md:font-normal"
                >
                  {l.gauche}
                </th>
                <td className="mt-2 align-top text-[0.98rem] leading-relaxed text-muted md:mt-0 md:py-5">
                  {l.droite}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

/**
 * Matrice comparative — une colonne d'entrée, N colonnes de comparaison.
 *
 * Généralisée à N colonnes après la troisième page du lot 2 : le comparatif
 * One/Max en demande deux, la comparaison « pièce intérieure / extension /
 * studio » en demande trois. Deux composants presque identiques auraient
 * divergé au premier ajustement.
 *
 * Les en-têtes viennent de l'appelant, qui les tire de `PRODUCTS` quand il
 * s'agit des modèles : rien n'est recopié.
 *
 * Sur mobile, chaque ligne devient un bloc empilé et chaque cellule reprend
 * son en-tête en préfixe — un tableau qui déborde latéralement est illisible
 * au pouce, et les specs exigent « très lisible sur mobile ». Le préfixe est
 * `aria-hidden` : l'en-tête est déjà porté par la structure du tableau, le
 * répéter le ferait lire deux fois par un lecteur d'écran.
 */
export function TableauMatrice({
  entetes,
  lignes,
}: {
  /** Première entrée = en-tête de la colonne d'entrée. */
  entetes: readonly string[];
  lignes: readonly { tete: string; cellules: readonly string[] }[];
}) {
  const colonnes = entetes.slice(1);
  return (
    <Reveal>
      <div className="mt-14 md:mt-20">
        <table className="w-full border-collapse text-left">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-line">
              {entetes.map((e) => (
                <th
                  key={e}
                  scope="col"
                  className="py-4 pr-6 font-mono text-[0.7rem] font-normal uppercase tracking-[0.18em] text-muted"
                >
                  {e}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr
                key={l.tete}
                className="flex flex-col border-b border-line py-5 md:table-row md:py-0"
              >
                <th
                  scope="row"
                  className="pr-6 text-left align-middle font-medium text-ink md:py-5 md:font-normal"
                >
                  {l.tete}
                </th>
                {l.cellules.map((c, i) => (
                  <td
                    key={colonnes[i] ?? i}
                    className="mt-1.5 align-middle text-[0.95rem] text-muted first-of-type:mt-2 md:mt-0 md:py-5"
                  >
                    <span
                      aria-hidden
                      className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted/70 md:hidden"
                    >
                      {colonnes[i]} —{" "}
                    </span>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}
