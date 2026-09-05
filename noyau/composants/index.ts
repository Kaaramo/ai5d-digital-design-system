/**
 * Les huit composants de base du noyau.
 *
 * Ils ne dépendent d'aucun framework de style : leurs styles passent par les variables
 * CSS du noyau, de sorte qu'un projet qui n'utiliserait pas Tailwind les rend
 * correctement dès qu'il a importé `noyau/jetons.css` et `densites/profils.css`.
 *
 * Les composants inter-produits — menu de compte, sélecteur d'organisation, sélecteur
 * de produit, accès refusé, bandeau d'environnement — n'appartiennent pas ici : ils
 * vivent dans la couche écosystème, parce qu'ils lisent la session et les droits.
 */

export { Bandeau } from './Bandeau';
export type { ProprietesBandeau } from './Bandeau';

export { Bouton } from './Bouton';
export type { ProprietesBouton, TailleBouton, VarianteBouton } from './Bouton';

export { Carte } from './Carte';
export type { ProprietesCarte } from './Carte';

export {
  BASCULE_DEUX_COLONNES,
  GabaritAuth,
  LARGEUR_FORMULAIRE,
  LARGEUR_MAX_PANNEAU,
  PART_PANNEAU,
} from './GabaritAuth';
export type { ProprietesGabaritAuth } from './GabaritAuth';

export { Champ } from './Champ';
export type { ProprietesChamp } from './Champ';

export { EPAISSEUR_TRAIT, Icone } from './Icone';
export type { ProprietesIcone, TailleIcone } from './Icone';

export { Logotype } from './Logotype';
export type { ProprietesLogotype, VarianteLogotype } from './Logotype';

export { Pastille } from './Pastille';
export type { ProprietesPastille, TonSemantique } from './Pastille';
