# 1.2.0 · La vérification du système

**Date :** 26 septembre 2026 · **Commit vérifié :** `dd720c5`

## Les quatre commandes, d'un seul bloc

`CI=true pnpm typecheck && CI=true pnpm lint && CI=true pnpm format:check && CI=true pnpm test`, code
de sortie `0`. Fin de [`verification-brute.txt`](verification-brute.txt) :

```
> @ai5d/design-system@1.2.0 format:check C:\Users\ksthe\Documents\ai5d-design-system
> prettier --check .
Checking formatting...
All matched files use Prettier code style!
> @ai5d/design-system@1.2.0 test C:\Users\ksthe\Documents\ai5d-design-system
> vitest run
 RUN  v2.1.9 C:/Users/ksthe/Documents/ai5d-design-system
 Test Files  35 passed (35)
      Tests  714 passed (714)
   Start at  13:40:06
```

`typecheck` et `lint` ne rendent rien quand ils passent.

## Ce que les passes ont trouvé

| Passe | Échec | Cause | Réparation |
| ----- | ----- | ----- | ---------- |
| 1 | `lint` : 21 erreurs `no-require-imports` et `no-unused-vars` | Les scripts de l'exécution du plan, rangés dans `.superpowers/` à la racine du dépôt : ignoré par Git, mais lu par ESLint en configuration plate | Scripts sortis du dépôt ; configuration du système inchangée |
| 2 | `format:check` : 17 fichiers Markdown | Le registre et les consignes de la même exécution, dans le même dossier | Dossier entier sorti du dépôt |
| 3 | Aucun | | Le code du lot est passé d'un coup : 707 tests, 35 fichiers |
| Captures | La page des spécimens débordait à 320 px (414 px) | Son propre en-tête de thème et ses colonnes de 320 px ; déjà 400 px en 1.1.0. En émulation mobile, les captures d'élément tombaient hors de leur cible | `_build/generer-specimens.mjs` : en-tête qui passe à la ligne, colonnes bornées à la largeur disponible (`c2f8c75`) |
| Captures | `ValeurCopiable` : un vide de 180 px entre le champ et son bouton, au doigt | En colonne, la base flexible du champ (`16rem`) devenait une hauteur | `flex: 0 0 auto` en colonne, test qui a échoué d'abord (`c2f8c75`) ; 708 tests |
| Montée de Compte | `typecheck` de Compte : six erreurs `TS2322` sur `Link` | Next redéclare trois gestionnaires sans `| undefined` ; sous `exactOptionalPropertyTypes`, le `ComposantLien` élargi refusait `Link`. L'écart E2 du plan, sondé sans Next, concluait l'inverse | `ProprietesLienProduit` (`64a893a`), test qui recopie `Link` et a échoué au typage d'abord ; 709 tests. Détail dans [`montee-compte.md`](montee-compte.md) |
| Relecture | Trois défauts, classés mineurs par le relecteur et regradés par leur effet (voir [`relecture.md`](relecture.md)) : la garde du plancher se laissait rassurer par un commentaire ; un lien désactivé transmettait `tabIndex` et ses gestionnaires ; `ListeDefinitions` et `ValeurCopiable` tombaient à 0 px dans une colonne centrée | `dd720c5`, cinq tests qui ont échoué d'abord ; 714 tests |

Après chaque réparation, le bloc entier a été relancé, puis les mutations.

## Chaque garde nouvelle, vue échouer

Voir [`mutations.md`](mutations.md), relancé sur `dd720c5` : treize mutations, toutes rougissent,
dont M1, la forme exacte de `densites/profils.css:79-80` en 1.1.0, qui fait rougir la garde distribuée,
le test de forme, le résolveur et la non-régression (15 tests). Les fichiers du produit sont intacts
après restauration.

## Ce que la vérification ne couvre pas

Le rendu : il se prouve dans [`plancher-tactile.md`](plancher-tactile.md), [`captures.md`](captures.md)
et [`navigateurs.md`](navigateurs.md). La construction d'un produit : le système livre du TypeScript non
transpilé, et aucune construction n'a été lancée.
