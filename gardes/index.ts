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
  /**
   * `(?<!&)` : une entité HTML numérique n'est PAS une couleur.
   *
   * `&#8239;` est l'espace fine insécable, celle que la typographie française exige avant
   * un point d'interrogation. Sans cette exclusion, la garde y voyait la couleur `#8239`
   * et refusait un écran parfaitement conforme. Trouvé dans le portail Compte, sur la
   * ligne « Mot de passe oublié&#8239;? ».
   */
  const hexadecimal = /(?<!&)#[0-9a-fA-F]{3,8}\b/;
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

/**
 * Le plancher de largeur, en pixels. Aucune mise en page ne casse en dessous, et aucune
 * largeur figee n'a le droit de le depasser. Voir `noyau/paliers.ts`.
 */
export const PLANCHER_LARGEUR = 320;

/**
 * Garde 4 - aucune largeur fixe au-dela du plancher.
 *
 * `max-width` et `min-width` sont la solution, pas le probleme : ce sont eux qui rendent
 * une mise en page souple, et ils ne sont donc pas examines. C'est `width: 440px` qui
 * casse, parce qu'il ne descend pas quand l'ecran descend.
 *
 * Sous 320 px, une largeur figee est legitime : une pastille, une icone, un avatar ont une
 * taille et pas une proportion.
 */
export function verifierAucuneLargeurFixe(
  racine: string,
  options: OptionsGarde = {},
): Infraction[] {
  // On retire d'abord les formes bornees, puis on cherche ce qui reste.
  const bornees = /\b(?:max|min)-?[Ww]idth\s*:\s*[^;,}]*/g;
  const largeur = /(?:^|[^-\w])width\s*:\s*['"]?(\d+)px/;

  return examinerLignes(racine, options, 'aucune-largeur-fixe', (ligne) => {
    const utile = sansCommentaire(ligne).replace(bornees, '');
    const trouve = largeur.exec(utile);
    if (trouve === null) return false;
    return Number(trouve[1]) > PLANCHER_LARGEUR;
  });
}

/**
 * Garde 5 - la hauteur de vue doit etre dynamique.
 *
 * Sur un telephone, la barre d'URL du navigateur entre et sort du cadre pendant le
 * defilement. `100vh` vaut la hauteur SANS elle : un ecran cale dessus se fait couper au
 * chargement, puis se reajuste au premier geste. `100dvh` suit la hauteur reellement
 * disponible.
 *
 * `dvh`, `svh` et `lvh` sont acceptes. Seul `vh` est refuse.
 */
export function verifierHauteurDeVueDynamique(
  racine: string,
  options: OptionsGarde = {},
): Infraction[] {
  // `dvh`, `svh` et `lvh` ne peuvent pas correspondre : le motif exige un chiffre
  // immediatement avant `vh`, et ces trois unites ont une lettre a cette place.
  const statique = /\d+(?:\.\d+)?vh\b/;

  return examinerLignes(racine, options, 'hauteur-de-vue-dynamique', (ligne) =>
    statique.test(sansCommentaire(ligne)),
  );
}

/** Met en forme une liste d'infractions pour un message d'erreur lisible. */
export function decrire(infractions: Infraction[]): string {
  if (infractions.length === 0) return 'Aucune infraction.';
  return infractions
    .map(({ regle, fichier, ligne, extrait }) => `  [${regle}] ${fichier}:${ligne}  ${extrait}`)
    .join('\n');
}
