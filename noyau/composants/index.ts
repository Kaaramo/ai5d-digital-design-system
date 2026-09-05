/**
 * Les onze composants de base du noyau.
 *
 * Ils ne dépendent d'aucun framework de style : leurs styles passent par les variables
 * CSS du noyau, de sorte qu'un projet qui n'utiliserait pas Tailwind les rend
 * correctement dès qu'il a importé `noyau/jetons.css`, `noyau/paliers.css` et
 * `densites/profils.css`.
 *
 * Trois d'entre eux forment la coquille d'application mobile : `GabaritApp`,
 * `BarreOnglets` et `CarteAction`. Ils sont dans le noyau et non dans l'écosystème parce
 * qu'ils ne lisent ni la session ni les droits : c'est le produit qui leur donne son
 * contenu.
 *
 * Les composants inter-produits — menu de compte, sélecteur d'organisation, sélecteur
 * de produit, accès refusé, bandeau d'environnement — n'appartiennent pas ici : ils
 * vivent dans la couche écosystème, parce qu'ils lisent la session et les droits.
 */

export { Bandeau } from './Bandeau';
export type { ProprietesBandeau } from './Bandeau';

export { BarreOnglets, HAUTEUR_BARRE_ONGLETS, ONGLETS_MAX, ONGLETS_MIN } from './BarreOnglets';
export type { Onglet, ProprietesBarreOnglets } from './BarreOnglets';

export { Bouton } from './Bouton';
export type { ProprietesBouton, TailleBouton, VarianteBouton } from './Bouton';

export { Carte } from './Carte';
export type { ProprietesCarte } from './Carte';

export { CarteAction, TAILLE_PASTILLE_ICONE } from './CarteAction';
export type { ProprietesCarteAction } from './CarteAction';

export { GabaritApp, HAUTEUR_ENTETE } from './GabaritApp';
export type { ProprietesGabaritApp } from './GabaritApp';

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
