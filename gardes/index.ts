/**
 * Les gardes du système de design.
 *
 * Ce sont des fonctions pures : elles parcourent une arborescence et rendent une liste
 * d'infractions. Elles ne lèvent pas, n'affichent rien, et ne décident rien — c'est
 * l'appelant qui décide quoi en faire. Un projet consommateur les branche dans son
 * intégration continue et fait échouer sa construction sur une liste non vide.
 *
 * Elles existent parce que la discipline humaine a échoué : quatre jetons sémantiques
 * ont divergé entre la marque et les produits sans que personne ne le décide. Une règle
 * qu'aucune machine ne vérifie est une règle qui sera enfreinte.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export interface Infraction {
  /** Chemin relatif à la racine examinée. */
  fichier: string;
  /** Numéro de ligne, à partir de 1. */
  ligne: number;
  /** La ligne fautive, élaguée. */
  extrait: string;
  /** Le nom de la garde qui a relevé l'infraction. */
  regle: string;
}

export interface OptionsGarde {
  /**
   * Chemins, relatifs à la racine, exclus de l'examen. La comparaison se fait sur un
   * préfixe : `noyau/polices` exclut tout le dossier.
   */
  exceptions?: string[];
  /** Extensions examinées. Par défaut, les fichiers de style et de code. */
  extensions?: string[];
}

const EXTENSIONS_PAR_DEFAUT = ['.css', '.ts', '.tsx', '.js', '.jsx', '.mjs'];

const DOSSIERS_TOUJOURS_IGNORES = ['node_modules', '.git', 'dist', 'build', '.next'];

function normaliser(chemin: string): string {
  return chemin.split(sep).join('/');
}

function* parcourir(racine: string, courant: string): Generator<string> {
  for (const entree of readdirSync(courant)) {
    if (DOSSIERS_TOUJOURS_IGNORES.includes(entree)) continue;
    const complet = join(courant, entree);
    if (statSync(complet).isDirectory()) {
      yield* parcourir(racine, complet);
    } else {
      yield complet;
    }
  }
}

function fichiersExamines(racine: string, options: OptionsGarde): string[] {
  const extensions = options.extensions ?? EXTENSIONS_PAR_DEFAUT;
  const exceptions = (options.exceptions ?? []).map(normaliser);

  const retenus: string[] = [];
  for (const complet of parcourir(racine, racine)) {
    const relatif = normaliser(relative(racine, complet));
    if (!extensions.some((extension) => relatif.endsWith(extension))) continue;
    if (
      exceptions.some((exception) => relatif === exception || relatif.startsWith(`${exception}/`))
    )
      continue;
    retenus.push(relatif);
  }
  return retenus.sort();
}

function examinerLignes(
  racine: string,
  options: OptionsGarde,
  regle: string,
  estFautive: (ligne: string) => boolean,
): Infraction[] {
  const infractions: Infraction[] = [];
  for (const fichier of fichiersExamines(racine, options)) {
    const lignes = readFileSync(join(racine, fichier), 'utf8').split(/\r?\n/);
    lignes.forEach((ligne, index) => {
      if (!estFautive(ligne)) return;
      infractions.push({
        fichier,
        ligne: index + 1,
        extrait: ligne.trim().slice(0, 120),
        regle,
      });
    });
  }
  return infractions;
}

/** Retire les commentaires d'une ligne : ils ont le droit de citer une valeur écartée. */
function sansCommentaire(ligne: string): string {
  return ligne
    .replace(/\/\*.*?\*\//g, '')
    .replace(/\/\/.*$/, '')
    .replace(/^\s*\*.*$/, '');
}

/**
 * Garde 1 — aucune couleur en dur.
 *
 * Un écran qui décide une couleur dans son coin est un écran qui dérivera. Les seules
 * exceptions légitimes sont les fichiers qui DÉFINISSENT les jetons ; elles se passent
 * explicitement en `exceptions`.
 */
export function verifierAucuneCouleurEnDur(
  racine: string,
  options: OptionsGarde = {},
): Infraction[] {
  const hexadecimal = /#[0-9a-fA-F]{3,8}\b/;
  const fonctionCouleur = /\b(?:rgba?|hsla?)\s*\(/;
  return examinerLignes(racine, options, 'aucune-couleur-en-dur', (ligne) => {
    const utile = sansCommentaire(ligne);
    return hexadecimal.test(utile) || fonctionCouleur.test(utile);
  });
}

/** Les six jetons de marque. Aucun projet n'a le droit de les redéfinir. */
export const JETONS_DE_MARQUE = [
  '--marque-encre',
  '--marque-navy',
  '--marque-blanc',
  '--marque-action',
  '--marque-action-survol',
  '--marque-action-clair',
] as const;

/**
 * Garde 2 — aucun jeton de marque redéfini.
 *
 * Un produit qui redéfinit `--marque-action` dérive la marque sans que personne ne
 * l'ait décidé. C'est exactement le mécanisme qui a produit les écarts constatés.
 */
export function verifierAucunJetonDeMarqueRedefini(
  racine: string,
  options: OptionsGarde = {},
): Infraction[] {
  const motif = new RegExp(`^\\s*(${JETONS_DE_MARQUE.join('|')})\\s*:`);
  return examinerLignes(racine, options, 'aucun-jeton-de-marque-redefini', (ligne) =>
    motif.test(sansCommentaire(ligne)),
  );
}

/** Le plancher tactile, en pixels. Il ne dépend d'aucun profil de densité. */
export const PLANCHER_TACTILE = 44;

/**
 * Garde 3 — le plancher tactile est bien posé.
 *
 * Elle n'inspecte pas des écrans rendus, ce qu'un test statique ne peut pas faire : elle
 * vérifie que le fichier de densités contient la requête média qui relève la hauteur de
 * contrôle à 44 px. C'est cette règle unique qui protège tous les écrans à la fois.
 */
export function verifierPlancherTactile(cheminProfils: string): Infraction[] {
  const css = readFileSync(cheminProfils, 'utf8');
  const infractions: Infraction[] = [];
  const regle = 'cible-tactile-minimale';

  if (!css.includes('@media (pointer: coarse)')) {
    infractions.push({
      fichier: cheminProfils,
      ligne: 1,
      extrait: 'requete @media (pointer: coarse) absente',
      regle,
    });
    return infractions;
  }

  const bloc = /@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
  for (const variable of ['--hauteur-controle', '--ligne-liste']) {
    if (!bloc.includes(`max(var(${variable}), ${PLANCHER_TACTILE}px)`)) {
      infractions.push({
        fichier: cheminProfils,
        ligne: 1,
        extrait: `${variable} n'est pas releve a ${PLANCHER_TACTILE}px sur pointeur grossier`,
        regle,
      });
    }
  }

  return infractions;
}

/** Met en forme une liste d'infractions pour un message d'erreur lisible. */
export function decrire(infractions: Infraction[]): string {
  if (infractions.length === 0) return 'Aucune infraction.';
  return infractions
    .map(({ regle, fichier, ligne, extrait }) => `  [${regle}] ${fichier}:${ligne}  ${extrait}`)
    .join('\n');
}
