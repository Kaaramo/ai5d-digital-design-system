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

/** Une déclaration qui lit sa propre propriété, avec sa ligne. */
export interface DeclarationAutoReferente {
  /** La propriété personnalisée, `--hauteur-controle` par exemple. */
  propriete: string;
  /** Numéro de ligne dans la feuille, à partir de 1. */
  ligne: number;
  /** La ligne de la déclaration, élaguée. */
  extrait: string;
}

/**
 * La feuille sans ses commentaires, chaque caractère d'un commentaire remplacé par une espace et
 * chaque saut de ligne gardé : les positions et les numéros de ligne restent ceux du fichier.
 */
function viderCommentaires(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (commentaire) => commentaire.replace(/[^\n]/g, ' '));
}

/**
 * Les déclarations `--x: …var(--x)…` d'une feuille, valeur de repli comprise.
 *
 * Pour le navigateur, une propriété personnalisée qui dépend d'elle-même est invalide au moment du
 * calcul : elle ne vaut ni l'ancienne valeur ni celle qu'on voulait lui donner, elle ne vaut rien.
 * C'est le défaut que le plancher tactile a porté de la 0.1.0 à la 1.1.0, protégé par un test et par
 * cette même garde, qui exigeaient la forme fautive.
 *
 * Les commentaires sont vidés avant la lecture, sans perdre une ligne : un commentaire a le droit de
 * citer la forme fautive, et le numéro rapporté doit rester celui du fichier.
 */
export function declarationsAutoReferentes(css: string): DeclarationAutoReferente[] {
  const sansCommentaires = viderCommentaires(css);

  const trouvees: DeclarationAutoReferente[] = [];
  sansCommentaires.split('\n').forEach((ligne, index) => {
    for (const correspondance of ligne.matchAll(/(--[a-zA-Z0-9-]+)\s*:([^;{}]*)/g)) {
      const propriete = correspondance[1] ?? '';
      const valeur = correspondance[2] ?? '';
      if (new RegExp(`var\\(\\s*${propriete}\\s*[,)]`).test(valeur)) {
        trouvees.push({ propriete, ligne: index + 1, extrait: ligne.trim().slice(0, 120) });
      }
    }
  });
  return trouvees;
}

/**
 * Garde 3 — le plancher tactile est bien posé, et il vaut quelque chose.
 *
 * Elle n'inspecte pas des écrans rendus, ce qu'un test statique ne peut pas faire. Elle vérifie trois
 * choses dans le fichier de densités : la requête `(pointer: coarse)` existe ; elle relève la SOURCE de
 * chaque hauteur, `max(var(--hauteur-controle-profil), 44px)` et
 * `max(var(--ligne-liste-profil), 44px)` ; et aucune déclaration de la feuille ne se lit elle-même.
 *
 * Jusqu'à la 1.1.0, elle exigeait la forme `max(var(--hauteur-controle), 44px)`, invalide au calcul :
 * un produit qui aurait corrigé la feuille chez lui aurait fait échouer sa propre intégration
 * continue. Décision 005. La ligne rapportée est la vraie ligne : celle de la déclaration fautive, ou
 * celle de la requête quand une source y manque.
 */
export function verifierPlancherTactile(cheminProfils: string): Infraction[] {
  const css = readFileSync(cheminProfils, 'utf8');
  const regle = 'cible-tactile-minimale';

  const infractions: Infraction[] = declarationsAutoReferentes(css).map(({ propriete, ligne }) => ({
    fichier: cheminProfils,
    ligne,
    extrait: `${propriete} se lit elle-meme : la valeur est invalide au calcul, et la hauteur tombe a celle du contenu`,
    regle,
  }));

  /*
    Toute la garde lit la feuille sans ses commentaires, et pas seulement la recherche des cycles :
    un commentaire qui citait la bonne forme suffisait a faire passer un plancher qui ne s appliquait
    pas (relecture de la 1.2.0). Le vidage garde les positions, donc les numeros de ligne.
  */
  const lue = viderCommentaires(css);
  const debut = lue.indexOf('@media (pointer: coarse)');
  if (debut === -1) {
    infractions.push({
      fichier: cheminProfils,
      ligne: 1,
      extrait: 'requete @media (pointer: coarse) absente',
      regle,
    });
    return infractions;
  }

  const ligneRequete = lue.slice(0, debut).split('\n').length;
  const bloc = /@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/.exec(lue)?.[1] ?? '';
  for (const variable of ['--hauteur-controle', '--ligne-liste']) {
    if (!bloc.includes(`max(var(${variable}-profil), ${PLANCHER_TACTILE}px)`)) {
      infractions.push({
        fichier: cheminProfils,
        ligne: ligneRequete,
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

/**
 * Garde 6 - aucun espacement en pixels.
 *
 * Les cinq gardes voyaient les couleurs, les jetons de marque, le plancher tactile, les
 * largeurs figees et la hauteur de vue. Aucune ne voyait un espacement. Releve le 14 septembre
 * 2026, a l ecriture de cette garde : une trentaine de litteraux dans les composants du
 * systeme, la ou le plan du sprint 17 en annoncait quatre. Un espacement en dur ignore
 * l echelle et les profils de densite, et rien ne le signalait.
 *
 * ── CE QUI EST EXAMINE ──────────────────────────────────────────────────────
 * Les proprietes d espacement, en CSS comme en objet de style : `padding`, `margin` et leurs
 * cotes, `gap`, `row-gap`, `column-gap`, `inset`, et `top` `right` `bottom` `left` quand ils
 * sont la propriete elle-meme. `border-top: 1px` n est PAS un espacement : c est un trait, et un
 * motif qui chercherait `top` n importe ou le refuserait a tort.
 *
 * ── DEUX SORTES DE LITTERAL, UNE SEULE REGLE ────────────────────────────────
 * `0px` est permis : c est une remise a zero, pas une mesure.
 *
 * Tout autre litteral est une infraction, SAUF s il figure dans `horsEchelle`. Cette liste est
 * faite pour les valeurs que l echelle n offre pas (14 px, 20 px, un demi-pixel d alignement
 * optique) : les convertir changerait le rendu, et c est une decision de dessin, pas une
 * correction mecanique. Elles restent donc permises, mais NOMMEES, fichier par fichier.
 *
 * Une valeur que l echelle offre (4, 8, 12, 16, 24, 32, 48, 64) n a aucune excuse : le jeton
 * existe. Elle ne peut pas figurer dans `horsEchelle`, et la garde le refuse.
 */
export interface OptionsEspacement extends OptionsGarde {
  /** Les litteraux hors echelle admis, par fichier relatif : `{ 'noyau/composants/Bandeau.tsx': ['14px'] }`. */
  horsEchelle?: Record<string, string[]>;
}

/** Les valeurs que l echelle d espacement offre. Un litteral egal a l une d elles est un contournement. */
export const VALEURS_DE_L_ECHELLE = [4, 8, 12, 16, 24, 32, 48, 64];

const PROPRIETE_ESPACEMENT =
  /(?:^|[\s{;'"(,])(?:padding|margin|gap|row-?gap|column-?gap|inset|top|right|bottom|left)(?:-?(?:top|right|bottom|left|block|inline)(?:-?(?:start|end))?|Top|Right|Bottom|Left|Block|Inline)?['"]?\s*:\s*([^;,}\n]+)/gi;

export function verifierAucunEspacementEnDur(
  racine: string,
  options: OptionsEspacement = {},
): Infraction[] {
  const horsEchelle = options.horsEchelle ?? {};
  const infractions: Infraction[] = [];

  for (const fichier of fichiersExamines(racine, options)) {
    const admis = horsEchelle[fichier] ?? [];
    const lignes = readFileSync(join(racine, fichier), 'utf8').split(/\r?\n/);

    lignes.forEach((ligne, index) => {
      const utile = sansCommentaire(ligne);
      for (const trouve of utile.matchAll(PROPRIETE_ESPACEMENT)) {
        for (const litteral of (trouve[1] ?? '').match(/-?\d+(?:\.\d+)?px/g) ?? []) {
          if (/^-?0px$/.test(litteral)) continue;
          const valeur = Math.abs(Number.parseFloat(litteral));
          const surEchelle = VALEURS_DE_L_ECHELLE.includes(valeur);
          if (!surEchelle && admis.includes(litteral)) continue;

          infractions.push({
            fichier,
            ligne: index + 1,
            extrait: `${litteral}${surEchelle ? ' (le jeton existe)' : ' (hors echelle, non declare)'} · ${ligne.trim().slice(0, 90)}`,
            regle: 'aucun-espacement-en-dur',
          });
        }
      }
    });
  }

  return infractions;
}

/**
 * Les exceptions declarees qui ne correspondent plus a rien.
 *
 * Une liste d exceptions pourrit : un composant disparait ou se corrige, et l exception reste,
 * prete a couvrir le prochain litteral qui tombera sur la meme valeur. Celle-ci rend chaque
 * entree qui ne designe plus aucun litteral present, ou qui designe une valeur de l echelle.
 */
export function exceptionsEspacementPerimees(
  racine: string,
  horsEchelle: Record<string, string[]>,
): string[] {
  const perimees: string[] = [];

  for (const [fichier, valeurs] of Object.entries(horsEchelle)) {
    let source = '';
    try {
      source = readFileSync(join(racine, fichier), 'utf8');
    } catch {
      perimees.push(`${fichier} : le fichier n existe plus`);
      continue;
    }
    for (const valeur of valeurs) {
      if (VALEURS_DE_L_ECHELLE.includes(Math.abs(Number.parseFloat(valeur)))) {
        perimees.push(`${fichier} : ${valeur} est sur l echelle, le jeton existe`);
      } else if (!source.includes(valeur)) {
        perimees.push(`${fichier} : ${valeur} n y figure plus`);
      }
    }
  }

  return perimees;
}

/** Met en forme une liste d'infractions pour un message d'erreur lisible. */
export function decrire(infractions: Infraction[]): string {
  if (infractions.length === 0) return 'Aucune infraction.';
  return infractions
    .map(({ regle, fichier, ligne, extrait }) => `  [${regle}] ${fichier}:${ligne}  ${extrait}`)
    .join('\n');
}
