/**
 * Les paliers du registre applicatif.
 *
 * Ils appartiennent au noyau et non à une couche à part, parce qu'ils ne varient pas d'un
 * produit à l'autre. Les densités varient : l'Académie respire, le Lab compresse. Les
 * paliers, non. Un téléphone de 390 px est un téléphone de 390 px dans les quatre produits.
 *
 * Deux des six valeurs ne sont pas des points de bascule. Ce sont des contraintes : rien ne
 * s'y déclenche, mais rien n'a le droit d'y casser. Les distinguer évite qu'on écrive un
 * jour `@media (min-width: 320px)`, qui ne voudrait rien dire.
 *
 * Ces constantes existent pour être lues par du TypeScript. Une requête média ne peut pas
 * consommer une variable CSS : `@media (min-width: var(--palier))` n'est pas valide, et ce
 * n'est pas un oubli des navigateurs mais une conséquence de l'ordre d'évaluation. Les
 * valeurs sont donc écrites en clair dans `paliers.css`, et `tests/paliers.test.ts` vérifie
 * que les deux fichiers disent la même chose.
 */

/**
 * Le plancher. Aucune mise en page ne casse en dessous.
 *
 * Ce n'est pas un palier : rien ne s'y déclenche. C'est la largeur du plus petit écran
 * qu'on accepte de servir, et la garde `verifierAucuneLargeurFixe` la prend pour seuil.
 */
export const PLANCHER = 320;

/**
 * La largeur sur laquelle on dessine en premier. Un téléphone courant, tenu à la verticale.
 * Un écran conçu ici et élargi ensuite tient. L'inverse ne tient jamais.
 */
export const REFERENCE_MOBILE = 390;

/**
 * Les marges de page passent de 16 à 24 px.
 *
 * 640 et non 480, et c'est mesuré : le formulaire de `GabaritAuth` vaut 440 px, et deux
 * marges de 32 px en ajoutent 64. Il faut donc au moins 504 px avant d'élargir les marges,
 * sans quoi le formulaire déborde. 640 est la valeur ronde immédiatement au-dessus.
 */
export const COMPACT = 640;

/**
 * La barre d'onglets disparaît, la navigation remonte dans l'en-tête.
 *
 * Au-delà de cette largeur, l'appareil se tient à deux mains ou se pose : le pouce n'est
 * plus le seul argument, et une barre basse gaspille une bande de 56 px sur toute la
 * largeur.
 */
export const TABLETTE = 768;

/**
 * Deux colonnes deviennent possibles.
 *
 * C'est déjà la bascule de `GabaritAuth`, mesurée séparément et retrouvée ici : à 768 px, un
 * panneau à 45 % laisse 423 px pour un formulaire de 440. Le test croise les deux valeurs.
 */
export const BUREAU = 1024;

/** Le contenu est plafonné à `--contenu-max` et centré, plutôt que de s'étirer. */
export const LARGE = 1280;

/** Les quatre vrais points de bascule. `PLANCHER` et `REFERENCE_MOBILE` n'en sont pas. */
export const PALIERS = {
  compact: COMPACT,
  tablette: TABLETTE,
  bureau: BUREAU,
  large: LARGE,
} as const;

export type Palier = keyof typeof PALIERS;

/**
 * La requête média d'un palier, pour que personne ne réécrive `(min-width: 768px)` à la
 * main dans un produit. Une valeur recopiée est une valeur qui divergera.
 *
 * @example
 * const regle = `@media ${auDela('tablette')} { … }`;
 */
export function auDela(palier: Palier): string {
  return `(min-width: ${PALIERS[palier]}px)`;
}

/**
 * La requête média en dessous d'un palier, bornée à 0,02 px près pour ne pas recouvrir
 * `auDela`. Deux requêtes qui se recouvrent produisent une règle qui gagne par hasard,
 * selon l'ordre d'écriture.
 */
export function enDeca(palier: Palier): string {
  return `(max-width: ${PALIERS[palier] - 0.02}px)`;
}
