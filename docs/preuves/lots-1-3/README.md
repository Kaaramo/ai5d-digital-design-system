# Preuves — lots 1 à 3

> Sorties réelles des commandes, le 5 septembre 2026.
> Une classe présente dans le code ne prouve pas un rendu ; un test écrit ne prouve
> pas un test qui passe.

## Le bloc de vérification

```
pnpm typecheck  -> code 0 , 0 ligne(s) de sortie
pnpm lint       -> code 0 , 0 ligne(s) de sortie
pnpm format     -> All matched files use Prettier code style!
pnpm test       ->  Tests 186 passed (186)
```

### Répartition des tests par fichier

```
 ✓ tests/contraste.test.ts (16 tests) 15ms
 ✓ tests/densites.test.ts (15 tests) 22ms
 ✓ tests/preset.test.ts (10 tests) 23ms
 ✓ gardes/gardes.test.ts (15 tests) 142ms
 ✓ tests/jetons.test.ts (60 tests) 130ms
 ✓ tests/polices.test.ts (13 tests) 28ms
 ✓ tests/composants/composants.test.tsx (45 tests) 941ms
 ✓ tests/fumee.test.ts (2 tests) 5ms
 ✓ tests/marque.test.ts (6 tests) 10ms
 ✓ tests/index.test.ts (4 tests) 9ms
```

## Polices — poids réel et absence de doublon

```
noyau/polices/fraunces-variable.woff2        65.7 Ko
noyau/polices/inter-variable.woff2           47.1 Ko
noyau/polices/jetbrains-mono-500.woff2       21.3 Ko
empreintes distinctes : 3 pour 3 fichiers
total : 140 Ko
appels reseau dans polices.css : 0
```

## Ce qui n'est PAS prouvé

- Les spécimens `specimens/composants.html` n'ont pas été regardés dans un navigateur.
- L'absence d'appel réseau au chargement de la page n'a pas été vérifiée dans l'onglet Réseau.
- Les quatre profils de densité ne sont validés sur aucun écran de produit réel.
