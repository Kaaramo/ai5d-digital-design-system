/**
 * Lecture d'un fichier CSS de jetons.
 *
 * Ce module ne connaît aucune couleur AI5D : il sait lire des déclarations
 * `--nom: valeur;` et rien d'autre.
 *
 * Il suit la profondeur des accolades plutôt que d'employer une expression régulière.
 * La raison est concrète : `densites/profils.css` contient un bloc
 * `@media (pointer: coarse) { :root { … } }`, et une expression régulière naïve y verrait
 * un second bloc `:root` dont les valeurs viendraient écraser celles du profil par défaut.
 * Un parseur CSS complet serait du poids pour aucune robustesse supplémentaire sur des
 * fichiers que nous écrivons nous-mêmes ; le suivi de profondeur suffit et se lit.
 */
import { readFileSync } from 'node:fs';

export interface BlocCss {
  /** Le sélecteur du bloc, espaces normalisés. */
  selecteur: string;
  /** La chaîne des sélecteurs englobants, du plus extérieur au plus proche. */
  chemin: string[];
  /** Les déclarations `--nom: valeur` du bloc, ses blocs imbriqués exclus. */
  declarations: Map<string, string>;
}

function retirerCommentaires(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function normaliser(selecteur: string): string {
  return selecteur.replace(/\s+/g, ' ').trim();
}

/**
 * Isole le sélecteur de ce qui le précède.
 *
 * Le découpage donne tout le texte compris entre la fin du bloc précédent et
 * l'accolade ouvrante. Ce texte peut contenir des règles terminées par un
 * point-virgule — un `@import` en tête de fichier, par exemple — qui ne font pas
 * partie du sélecteur. On ne garde que ce qui suit le dernier point-virgule.
 */
function isolerSelecteur(brut: string): string {
  const dernierPointVirgule = brut.lastIndexOf(';');
  return normaliser(dernierPointVirgule === -1 ? brut : brut.slice(dernierPointVirgule + 1));
}

/** Découpe un fichier CSS en blocs, en gardant la trace des blocs englobants. */
export function decouperBlocs(css: string): BlocCss[] {
  const texte = retirerCommentaires(css);
  const blocs: BlocCss[] = [];
  const pile: Array<{ selecteur: string; debutCorps: number }> = [];
  let debutSelecteur = 0;

  for (let i = 0; i < texte.length; i += 1) {
    const caractere = texte[i];

    if (caractere === '{') {
      pile.push({
        selecteur: isolerSelecteur(texte.slice(debutSelecteur, i)),
        debutCorps: i + 1,
      });
      debutSelecteur = i + 1;
      continue;
    }

    if (caractere === '}') {
      const ouvert = pile.pop();
      if (!ouvert) continue;

      const corps = texte.slice(ouvert.debutCorps, i);
      // On ne garde que les declarations de ce niveau : tout ce qui est entre accolades
      // appartient a un bloc imbrique, qui a ete traite pour son propre compte.
      const propre = corps.replace(/\{[^{}]*\}/g, '').replace(/[^;]*$/, '');

      const declarations = new Map<string, string>();
      for (const [, nom, valeur] of propre.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
        if (nom && valeur) declarations.set(nom, valeur.trim());
      }

      blocs.push({
        selecteur: ouvert.selecteur,
        chemin: pile.map((niveau) => niveau.selecteur),
        declarations,
      });
      debutSelecteur = i + 1;
    }
  }

  return blocs;
}

export interface OptionsLecture {
  /**
   * Inclure les blocs situés à l'intérieur d'une règle `@`, `@media` en particulier.
   * Faux par défaut : on veut les valeurs de base, pas celles d'un cas conditionnel.
   */
  inclureRegleArobase?: boolean;
}

/**
 * Lit les jetons des blocs dont la liste de sélecteurs contient EXACTEMENT `selecteur`.
 *
 * La correspondance est exacte, partie par partie, et non par sous-chaîne. La raison a
 * été trouvée en exécutant les tests : `:root[data-theme='dark']` contient la sous-chaîne
 * `:root`, si bien qu'une correspondance laxiste faisait écraser les valeurs du thème
 * clair par celles du thème sombre — et mesurait le blanc du bouton sur le mauvais bleu.
 *
 * Un sélecteur composé comme `:root, [data-densite='aere']` correspond donc à `:root`
 * comme à `[data-densite='aere']`, mais `:root[data-theme='dark']` ne correspond qu'à
 * lui-même.
 *
 * Quand plusieurs blocs correspondent, leurs déclarations sont fusionnées dans l'ordre
 * du fichier — la dernière l'emporte, comme le ferait un navigateur.
 */
export function lireJetons(
  chemin: string,
  selecteur = ':root',
  options: OptionsLecture = {},
): Map<string, string> {
  const blocs = decouperBlocs(readFileSync(chemin, 'utf8'));
  const jetons = new Map<string, string>();

  const attendu = normaliser(selecteur);

  for (const bloc of blocs) {
    const parties = bloc.selecteur.split(',').map((partie) => normaliser(partie));
    if (!parties.includes(attendu)) continue;
    const sousRegleArobase = bloc.chemin.some((niveau) => niveau.startsWith('@'));
    if (sousRegleArobase && !options.inclureRegleArobase) continue;
    for (const [nom, valeur] of bloc.declarations) jetons.set(nom, valeur);
  }

  return jetons;
}

/**
 * Résout `var(--autre)` en remontant les alias. Lève au-delà de dix sauts, ce qui
 * signale une boucle plutôt que de faire tourner le processus indéfiniment.
 */
export function resoudre(jetons: Map<string, string>, nom: string): string {
  let valeur = jetons.get(nom);
  if (valeur === undefined) throw new Error(`Jeton inconnu : ${nom}`);

  for (let saut = 0; saut < 10; saut += 1) {
    const alias = /^var\((--[a-z0-9-]+)\)$/.exec(valeur.trim());
    if (!alias) return valeur.trim();
    const suivant = jetons.get(alias[1] as string);
    if (suivant === undefined) throw new Error(`Alias non resolu : ${valeur}`);
    valeur = suivant;
  }

  throw new Error(`Boucle d'alias sur ${nom}`);
}
