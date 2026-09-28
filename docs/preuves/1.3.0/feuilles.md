# Une feuille par composant : le compte des balises

SPEC 1.3.0, §0.4, §5.1, §11.2. Le banc d'essai rend cinq cents `Bouton` et un `Champ` par React,
au serveur puis hydratés (`feuilles`), ou au client seul (`feuilles-client`), et les ouvre dans Chromium.

## Avant · 1.2.0 · commit `244941e`, 28/09/2026 15:11

```
Banc 1.3.0 · avant · Chromium 141.0.7390.37
## Feuilles, 500 boutons et un champ

feuilles (rendu serveur puis hydratation)
{"total":501,"dansHead":0,"dansBody":501,"identifiants":["ai5d-bouton","ai5d-champ"],"identifiantsDupliques":499,"dataHref":[],"boutons":500}
erreurs de console : aucune

feuilles-client (rendu client seul)
{"total":501,"dansHead":0,"dansBody":501,"identifiants":["ai5d-bouton","ai5d-champ"],"identifiantsDupliques":499,"dataHref":[],"boutons":500}
erreurs de console : aucune

```

## Après · 1.3.0 · commit `33c2b6e`, 28/09/2026 15:26

```
Banc 1.3.0 · apres · Chromium 141.0.7390.37
## Feuilles, 500 boutons et un champ

feuilles (rendu serveur puis hydratation)
{"total":1,"dansHead":1,"dansBody":0,"identifiants":[],"identifiantsDupliques":0,"dataHref":["ai5d-bouton ai5d-champ"],"boutons":500}
erreurs de console : aucune

feuilles-client (rendu client seul)
{"total":2,"dansHead":2,"dansBody":0,"identifiants":[],"identifiantsDupliques":0,"dataHref":["ai5d-bouton","ai5d-champ"],"boutons":500}
erreurs de console : aucune

```

## Lecture

Avant : cinq cents boutons et un champ posaient 501 balises `<style>` dans `<body>`, avec 499
identifiants dupliqués, au serveur comme au client. Après : une seule balise dans `<head>` quand la
page est rendue au serveur puis hydratée (`data-href` « ai5d-bouton ai5d-champ »), deux quand le
client rend seul (une par clé), aucun identifiant, aucune dans `<body>`. L'hydratation du document
entier n'écrit aucune erreur de console.

Au serveur, une balise pour tout le système : une recette de produit compte les clés de `data-href`,
pas les balises (SPEC P10 §15.5, écart 9 du §17).
