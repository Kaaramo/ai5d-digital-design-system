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
