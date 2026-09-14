# 003 · La coquille à rail monte, et sa navigation passe en emplacements

**Date :** 14 septembre 2026 · **Statut :** appliquée · **Version :** 1.0.0

## Contexte

Compte portait deux coquilles à rail : `CoquillePortail` pour le compte de la personne,
`CoquilleConsole` pour l'administration. Elles avaient divergé sur des détails que personne n'avait
décidés, et elles recopiaient chacune deux blocs de sélecteurs par thème pour la pastille active.

Le système, lui, avait `GabaritPortail`. Écrit avant tout usage réel, il posait un en-tête horizontal
au-dessus du rail, forme que la première mise en service de Compte avait montrée fausse. Aucun produit
ne l'employait. Compte avait posé une condition pour remonter sa propre coquille : qu'un deuxième
produit demande un rail. AI5D Portail l'a demandé.

## Le problème à résoudre

La coquille de Compte connaissait Next. Sa navigation importait `next/link` et lisait `usePathname()`
pour savoir quelle rubrique était active, et c'était juste : un gabarit partagé n'est pas rejoué par
App Router d'une page sœur à l'autre, donc l'état actif calculé au serveur restait figé sur la
première page ouverte. Il a fallu le passer côté client, dans Compte, pour cette raison exacte.

Un système qui dépend de Next ne sert qu'aux produits Next.

## Options

**A. La coquille reçoit un tableau de rubriques et une fonction d'activité.** Elle rendrait sa
navigation elle-même. Mais le tableau porte des composants d'icône, et un composant React ne traverse
pas la frontière serveur-client : le passer depuis un gabarit serveur lève à l'exécution. Et la
coquille devrait lire le chemin, donc devenir un composant client, et toute la page avec elle.

**B. La coquille importe le lien et le chemin d'un cadriciel.** Rapide pour Next, et le système ne
servirait plus qu'à Next.

**C. La navigation arrive en emplacements.** La coquille reçoit `navigationRail` et
`navigationBarre`, des éléments déjà rendus. Le produit écrit un module client d'une vingtaine de
lignes qui lit son chemin et rend `LiensRail` et `BarreOnglets` avec son propre composant de lien.

## Décision

**C.** Les éléments traversent la frontière, les tableaux d'icônes non. La coquille reste un composant
sans crochet, rendu au serveur. La seule pièce qui connaît le chemin et le routeur reste dans le
produit, qui est le seul à les connaître.

`LiensRail` et `BarreOnglets` reçoivent le composant de lien en propriété, `a` par défaut. Avec le lien
du routeur, changer de rubrique ne recharge plus le document : c'était vrai du rail de Compte, et faux
de sa barre basse, qui rechargeait la page entière à chaque onglet sur un téléphone.

`GabaritPortail` est retiré.

## Conséquences

- Un produit écrit une fois son module de navigation. C'est le prix, et il est d'une vingtaine de
  lignes.
- La largeur de la colonne, qui dépend du chemin, ne peut pas être une valeur figée passée par un
  gabarit serveur partagé : App Router ne le rejouerait pas. Le produit la calcule côté client, ou la
  pose dans son contenu. Compte le fait déjà avec `ColonneContenu`.
- La pastille active prend `--surface-selection`, un jeton de rôle réglé par thème, et les sélecteurs
  recopiés disparaissent.
