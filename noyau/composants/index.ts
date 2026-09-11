/**
 * Les quinze composants de base du noyau.
 *
 * Ils ne dépendent d'aucun framework de style : leurs styles passent par les variables
 * CSS du noyau, de sorte qu'un projet qui n'utiliserait pas Tailwind les rend
 * correctement dès qu'il a importé `noyau/jetons.css`, `noyau/paliers.css` et
 * `densites/profils.css`.
 *
 * Trois d'entre eux forment la coquille d'application mobile : `GabaritApp`,
 * `BarreOnglets` et `CarteAction`. Un quatrième, `GabaritPortail`, porte la coquille des
 * écrans de réglages, avec son rail de rubriques. Ils sont dans le noyau et non dans
 * l'écosystème parce qu'ils ne lisent ni la session ni les droits : c'est le produit qui
 * leur donne son contenu.
 *
 * Deux composants portent le mot « onglet », et ils ne font pas la même chose.
 * `BarreOnglets` est la navigation BASSE et FIXE d'une coquille mobile, qui disparaît au
 * palier tablette ; `OngletsRubrique` découpe une rubrique en sous-pages, dans le flux du
 * document, à tous les paliers. Chacun l'explique dans son propre fichier.
 *
 * Les composants inter-produits — menu de compte, sélecteur d'organisation, sélecteur
 * de produit, accès refusé, bandeau d'environnement — n'appartiennent pas ici : ils
 * vivent dans la couche écosystème, parce qu'ils lisent la session et les droits.
 */

export { Avatar, initiales } from './Avatar';
export type { ProprietesAvatar } from './Avatar';

export { Bandeau } from './Bandeau';
export type { ProprietesBandeau } from './Bandeau';

export { BarreOnglets, HAUTEUR_BARRE_ONGLETS, ONGLETS_MAX, ONGLETS_MIN } from './BarreOnglets';
export type { Onglet, ProprietesBarreOnglets } from './BarreOnglets';

export { Bouton } from './Bouton';
export type { ProprietesBouton, TailleBouton, VarianteBouton } from './Bouton';

export { Carte } from './Carte';
export type { ProprietesCarte } from './Carte';

export { CarteAction, TAILLE_PASTILLE_ICONE } from './CarteAction';
export type { EtatCarteAction, ProprietesCarteAction } from './CarteAction';

export {
  CHEMIN_EPAULES,
  CHEMIN_TETE,
  Embleme,
  GRILLE_EMBLEME,
  RAYON_CARTOUCHE,
  TRANSFORME_TETE,
} from './Embleme';
export type { ProprietesEmbleme, TailleEmbleme, VarianteEmbleme } from './Embleme';

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

export { GabaritPortail, LARGEUR_RAIL_BUREAU, LARGEUR_RAIL_TABLETTE } from './GabaritPortail';
export type { ProprietesGabaritPortail, Rubrique } from './GabaritPortail';

export { CONTENEUR_DEUX_COLONNES, CONTENEUR_TROIS_COLONNES, GrilleCartes } from './GrilleCartes';
export type { ProprietesGrilleCartes } from './GrilleCartes';

export { Champ, TAILLE_ICONE_CHAMP } from './Champ';
export type { ProprietesChamp } from './Champ';

export { EPAISSEUR_TRAIT, Icone } from './Icone';
export type { ProprietesIcone, TailleIcone } from './Icone';

export { HAUTEUR_ONGLETS, OngletsRubrique } from './OngletsRubrique';
export type { OngletRubrique, ProprietesOngletsRubrique } from './OngletsRubrique';

export { Logotype } from './Logotype';
export type { ProprietesLogotype, VarianteLogotype } from './Logotype';

export { Pastille } from './Pastille';

/**
 * Les formes de l attente. Le systeme donne les formes, le produit compose ses pages :
 * lui seul connait la structure de ses ecrans.
 */
export {
  Squelette,
  SqueletteCartes,
  SqueletteEnTete,
  SqueletteFormulaire,
  SqueletteIndicateurs,
  SqueletteListe,
  SqueletteTableau,
  ZoneEnChargement,
} from './Squelette';
export type { ProprietesSquelette } from './Squelette';
export type { ProprietesPastille, TonSemantique } from './Pastille';
