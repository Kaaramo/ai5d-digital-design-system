# 009 · Ce qui monte, et ce qui s'étend

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

Le README l'écrit : « un composant monte dans le système quand un deuxième produit en a besoin, pas
avant ». Le contrat de P09 demandait quinze éléments, de trois natures différentes, et la règle ne
s'applique pas à toutes de la même façon. `GabaritPortail` est monté sans consommateur et a été
retiré en 1.0.0 ; `CoquilleRail` est montée quand le Portail a demandé un rail. La règle tient ; il
fallait dire comment elle se lit.

## Options

**A. Une seule lecture, stricte** : rien ne monte ni ne s'étend sans deuxième produit. `Champ` avec
icône (0.2.2), `danger-contour` (0.6.0), l'état de `CarteAction` (0.7.0), `erreur` dans les boîtes
(1.1.0) n'auraient jamais existé : chacun a été demandé par un seul produit.

**B. Une lecture par nature.**

## Décision

**B.**

| Nature | Ce qui la justifie |
| ------ | ------------------ |
| **Composant nouveau** | Un deuxième produit qui en a le besoin, constaté dans son code (fichier et ligne). Sinon, il reste dans le produit qui l'a demandé, écrit sur les jetons avec l'API proposée, et monte le jour où le deuxième arrive |
| **Extension d'un composant déjà partagé** (une propriété, une valeur de type) | Le besoin d'un produit suffit, parce que le composant est déjà commun et que l'ajout est rétrocompatible. Le constat dans l'autre produit, quand il existe, est écrit |
| **Jeton ou règle globale de feuille** | Un correctif d'un défaut du système, ou une règle transversale par nature (typographie, mouvement, navigateur), qui vaut pour tout produit qui l'emploie |

**La console d'un produit n'est pas un deuxième consommateur** : c'est le même produit. Elle compte
pour savoir si une pièce convient à la densité `compact`, pas pour la faire monter.

## Conséquences, pour la 1.2.0

- Montés, avec leur deuxième consommateur constaté dans Compte : `TitreSection`, `LigneLien`,
  `ListeLignes`, `ListeDefinitions`, `ValeurCopiable`.
- Étendus : `Bouton` (`href`), `TonSemantique` (`neutre`), `OngletsRubrique` (`Lien`, six onglets),
  `CoquilleRail` (deux pieds), `SelecteurTheme` (`libellesVisibles`, 44 px au doigt).
- Jetons et règles : le plancher tactile (correctif), `--mesure-texte`, les trois jetons de mouvement,
  `caret-color`, `::selection`, `COULEURS_NAVIGATEUR`, la recette `LOGOTYPE`.
- Restés dans le Portail, faute de deuxième consommateur : `IndicateurNavigation`, la primitive
  `Apparition`, la largeur `--largeur-lecture` (une constante du Portail), `BarreProgression`.
- Repoussé : le tracé vectoriel du logotype, au lot L4.
- Retirés, mesure à l'appui : `scrollbar-color` (1,49, et redondant avec `color-scheme`) et
  `--duree-signature` (doublon de `--duree-longue`). `--duree-survol` n'a jamais existé.
