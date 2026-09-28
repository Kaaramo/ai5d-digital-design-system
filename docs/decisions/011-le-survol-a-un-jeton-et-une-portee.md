# 011 · Le survol a un jeton, et une portée

**Date :** 28 septembre 2026 · **Statut :** appliquée · **Version :** 1.3.0

## Contexte

Le survol n'avait pas de jeton. `LiensRail` et `LigneLien` l'écrivaient à la main, avec un bloc de
sélecteurs par thème : `--surface-1` ou `--surface-chaude` en clair, `--surface-3` en sombre. Or
`--surface-selection` vaut `--surface-3` en sombre : un lien du rail survolé avait exactement le fond
de la rubrique active, une ligne survolée celui d'une ligne appuyée. Mesuré sur le banc d'essai le 28
septembre 2026 : `rgb(23, 44, 59)` pour les deux. La console du Portail pose des tables où survol et
sélection se côtoient.

## Options

**A. Une teinte nouvelle en sombre.** Essayées entre et au-delà des surfaces existantes : plus claire
que `--surface-3`, elle fait tomber `--action` à 4,16 et `--reussite` à 4,20 ; entre deux surfaces,
elle se confond avec l'une d'elles.

**B. Un jeton de rôle, sans valeur nouvelle, et une portée écrite.** En sombre, le survol creuse d'un
cran là où la sélection et l'appui éclairent.

## Décision

**B.** `--surface-survol` vaut `--surface-chaude` en clair et `--surface-1` en sombre, dans les quatre
blocs de thème. Il vaut pour un élément posé sur `--surface-2` ou `--surface-3` : ligne de table,
élément de menu, lien du rail. Il ne vaut pas pour un élément posé à même la page (`--surface-1`), où
il se confondrait avec elle en sombre.

## Conséquences

- En sombre, survol et sélection s'écartent de 1,27 ; en clair, ils ont la même clarté et deux teintes,
  chaude contre bleutée : la case cochée du produit porte l'état, dans les deux thèmes.
- **`--attention` ne se pose pas en texte nu sur une surface survolée** : 4,39 en clair. Il garde son
  fond `--attention-fond` (4,54). Un test en fait un témoin qui doit rester sous 4,5.
- `LiensRail` passe au jeton (arbitrage de Karamo du 28 septembre 2026), et son survol se garde par
  `(hover: hover)`. `MenuActions` l'emploie.
- `LigneLien` garde ses règles : son survol reste égal à son appui en sombre. Aucune valeur ne se
  détache à la fois des trois surfaces ; différé à un lot qui tranchera une surface nouvelle.
- Quatre couples de contraste de plus, lus dans `tests/jetons.test.ts` et nulle part ailleurs.
```
