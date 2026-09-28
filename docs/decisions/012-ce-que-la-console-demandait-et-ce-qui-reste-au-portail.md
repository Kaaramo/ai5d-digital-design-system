```markdown
# 012 · Ce que la console demandait, et ce qui reste au Portail

**Date :** 28 septembre 2026 · **Statut :** appliquée · **Version :** 1.3.0

## Contexte

La SPEC P10 du Portail demande treize pièces au système pour sa console (§7.2). La décision 009 dit
comment la règle du deuxième consommateur se lit : un composant nouveau monte quand un deuxième
produit en a le besoin, constaté dans son code ; une extension se justifie par le besoin d'un seul
produit ; un jeton ou une règle globale, par un correctif ou une nature transversale. La console du
Portail n'est pas un deuxième consommateur du Portail.

## Options

**A. Tout monter**, parce que la console est la plus grosse demande que le système ait reçue.
`TableauDonnees` écrit pour la seule console porterait ses choix (sélection de participations, adresse
tronquée, colonne collée) et serait à réécrire au premier usage de Compte. `GabaritPortail`, monté sans
consommateur, a été retiré en 1.0.0.

**B. La décision 009, pièce par pièce**, avec le SDK `@ai5d/auth` compté comme un consommateur, puisqu'il
construit ses composants sur ceux du système (décision 004).

## Décision

**B.**

| Monte | Nature | Deuxième consommateur |
| ----- | ------ | --------------------- |
| `MenuActions` | Composant | Le SDK : `UserButton.tsx:100-139` écrit un menu à la main |
| `EnteteObjet` | Composant | Compte : `EnteteConsole.tsx:25-34`, rendu dans sept fichiers (relu sur `1ef7ef2`) |
| `Selecteur` | Composant | Compte : `Selecteur.tsx:19-35`, rendu sept fois (relu sur `1ef7ef2`) |
| `Bandeau` qui se ferme | Extension | Suffit ; Compte rend déjà un `Bandeau` de réussite sans fermeture (`Annonce.tsx:18-20`). `Annonce` est lue comme une extension de `Bandeau`, non comme un composant |
| `EnteteRubrique`, `action` | Extension | Suffit ; `EnteteConsole.tsx:33` porte aussi une action unique |
| Compteur d'onglet, `Chiffre` compact | Extensions | Suffit |
| `--surface-survol` | Jeton, et correctif | `LiensRail` et `LigneLien` l'écrivaient à la main |
| Feuilles hissées | Correctif | Tous les produits |

Restent au Portail, avec l'API de P10 : `TableauDonnees`, `BarreActionsGroupees`, `PucesFiltre`,
`RechercheTable`, `BarreEnregistrement`, `CaseACocher`, `ChoixSegmente`, `ZoneTexte`, et la région de
retour (collée, remplacement, codes d'adresse, focus), composée sur `Bandeau`.

## Conséquences

- Aucune pièce restée au Portail n'est bloquante : aucune ne touche un composant du système ni ne
  déclare de jeton.
- Chacune monte le jour où Compte en montre le besoin, fichier et ligne. `TableauDonnees` le premier,
  si Compte remplace ses registres en lignes par une table.
- Les écarts entre le contrat de P10 et la 1.3.0 sont au §17 de la SPEC de la 1.3.0 : P10 s'y conforme.
