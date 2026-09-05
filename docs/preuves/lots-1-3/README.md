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

## Rendu réel des spécimens

Rendus par Chrome sans réseau, depuis le fichier local.

| Thème | Capture |
| ----- | ------- |
| Clair | [`specimens-clair.png`](specimens-clair.png) |
| Sombre | [`specimens-sombre.png`](specimens-sombre.png) |

Ce que le rendu confirme : le papier tiède et les cartes blanches à ombre douce en clair ;
l'absence totale d'ombre en sombre, la hiérarchie passant par la clarté des surfaces ; les
quatre tons sémantiques distincts dans les deux thèmes ; Fraunces à l'affichage et JetBrains
Mono sur les identifiants ; le « 5 » bleu et incliné.

**Ce que le rendu a trouvé, et qui est corrigé.** Le logotype était presque invisible en
mode sombre : sa couleur était figée sur `--encre` et le consommateur devait basculer la
variante à la main. Sur une page qui change de thème, personne n'y pense. Le défaut de
`Logotype` suit désormais `--texte-fort` et se retourne tout seul ; les variantes `encre` et
`blanc` restent disponibles pour un fond dont la clarté ne dépend pas du thème.

## Ce qui n'est PAS prouvé

- L'absence d'appel réseau au chargement n'a pas été vérifiée dans l'onglet Réseau d'un
  navigateur. Elle l'est seulement au niveau du fichier `polices.css`, qui ne contient
  aucune URL.
- Les quatre profils de densité ne sont validés sur aucun écran de produit réel : les
  valeurs sont dérivées de la charte Académie par raisonnement.
- Le rendu n'a été vérifié que sur Chrome, à une seule largeur.
