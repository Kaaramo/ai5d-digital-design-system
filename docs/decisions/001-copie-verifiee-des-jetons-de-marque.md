# 001 — Copie vérifiée des jetons de marque, plutôt qu'un paquet

**Date :** 5 septembre 2026 · **Statut :** appliquée

## Contexte

Le noyau doit citer six valeurs de la marque institutionnelle sans jamais les redéfinir.
`AI5D_Brand_2026` n'est ni un dépôt Git ni un paquet npm : c'est un dossier de livrables.
L'importation ne peut donc pas passer par une dépendance.

## Options

**A. Copie synchronisée par script, vérifiée au build.** Un script lit la source, écrit
`noyau/marque.css` avec l'empreinte de la source en en-tête, et un test relit la source à
chaque exécution pour détecter toute divergence.

**B. Publier `AI5D_Brand_2026/tokens.css` comme paquet `@ai5d/brand-tokens`.**
Techniquement plus propre : une dépendance versionnée, pas de copie.

## Décision

**A.**

L'option B impose de versionner la marque, c'est-à-dire de la faire bouger — de lui donner
un dépôt, un cycle de publication, des numéros de version. C'est exactement ce que la
décision D1 du cadrage interdit : la marque existe, elle est bonne, elle ne bouge pas.

La copie est le prix de cette contrainte. On le paie en la rendant incapable de dériver en
silence : `tests/marque.test.ts` relit la source et échoue si une valeur a changé d'un côté
sans l'autre.

## Conséquences

- `pnpm marque` régénère `noyau/marque.css`. Le fichier est exclu de Prettier : le formater
  créerait un aller-retour permanent avec son générateur, chacun défaisant le travail de
  l'autre.
- Les jetons sont préfixés `--marque-`. Le noyau les aliase vers ses propres noms, de sorte
  qu'aucune valeur de marque n'apparaît ailleurs que dans ce fichier.
- La bascule vers un paquet reste possible plus tard sans rien changer aux projets
  consommateurs : ils n'importent que `noyau/jetons.css`.
- Si le chemin de `AI5D_Brand_2026` change, le script échoue avec un message clair. C'est
  voulu : mieux vaut un build rouge qu'une copie silencieusement périmée.
