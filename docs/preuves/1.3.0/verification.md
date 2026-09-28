# 1.3.0 · La vérification du système

**Date :** 28 septembre 2026, 15:24 · **Commit vérifié :** `fdf2fc3` (tâches 1 à 16 commitées, rien
d'autre dans l'arbre de travail)

## Les quatre commandes, d'un seul bloc

```bash
( CI=true GITHUB_ACTIONS=true pnpm typecheck && CI=true pnpm lint && CI=true pnpm format:check && CI=true GITHUB_ACTIONS=true pnpm test ) 2>&1 | tee docs/preuves/1.3.0/verification-brute.txt
```

Sortie brute entière dans [`verification-brute.txt`](verification-brute.txt) (codes de couleur
retirés). Le résumé de chaque commande, recopié :

```

> @ai5d/design-system@1.2.0 typecheck /home/user/ai5d-digital-design-system
> tsc --noEmit


> @ai5d/design-system@1.2.0 lint /home/user/ai5d-digital-design-system
> eslint .


> @ai5d/design-system@1.2.0 format:check /home/user/ai5d-digital-design-system
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
[...]
 ✓ tests/marque.test.ts (6 tests | 1 skipped) 6ms

 Test Files  40 passed (40)
      Tests  830 passed | 1 skipped (831)
   Start at  15:23:41
   Duration  23.89s (transform 1.85s, setup 7.77s, collect 8.62s, tests 10.46s, environment 26.03s, prepare 4.56s)

code de sortie : 0
```

`tsc` muet, ESLint muet, Prettier conforme, **40 fichiers de tests, 830 tests verts et 1 sauté**, code
de sortie `0`. Le test sauté est la dérive de la marque (`tests/marque.test.ts`), dont la source n'est
pas sur ce poste.

`GITHUB_ACTIONS=true` devant `typecheck` et `test` : `tests/marque.test.ts` lit la source de la marque
sur le poste de Karamo, et ne se saute que sous cette variable (plan, écart E14).

## Ce que la première passe a trouvé

| Échec | Cause | Réparation |
| ----- | ----- | ---------- |
| Aucun | La première passe (15:22) est sortie verte, avec les mêmes nombres : 40 fichiers, 830 tests verts, 1 sauté, aucun avertissement ni erreur dans la sortie | Aucune |

La passe recopiée ci-dessus est la seconde, relancée telle quelle pour la consigner.

## Chaque test vu échouer

Voir [`mutations.md`](mutations.md) : vingt-deux mutations, dont quatre qui retirent un fichier
nouveau (l'état d'avant son implémentation), et celle qui rejoue le brouillon du §5.10 de la SPEC.
Les vingt-deux ont rougi ; l'arbre est restauré après chacune (« Etat apres restauration : aucun
changement »).

## Ce que la vérification ne couvre pas

Le rendu : il se prouve dans [`feuilles.md`](feuilles.md), [`reserve-basse.md`](reserve-basse.md),
[`menu-navigateurs.md`](menu-navigateurs.md) et [`captures.md`](captures.md). La construction d'un
produit : le système livre du TypeScript non transpilé, et aucune construction n'a été lancée.

## Après la relecture : la vérification relancée d'un bloc

**Date :** 28 septembre 2026, 16:26 · **Commit vérifié :** `6db360a` (les réparations de la
relecture), avec dans l'arbre de travail les preuves de la tâche 19 et de la tâche 20 qui entrent au
commit suivant (`CHANGELOG.md`, `docs/preuves/1.3.0/`, `tasks/`).

Même commande ; sortie brute entière dans
[`verification-relecture-brute.txt`](verification-relecture-brute.txt). Le résumé de chaque commande,
recopié :

```

> @ai5d/design-system@1.2.0 typecheck /home/user/ai5d-digital-design-system
> tsc --noEmit


> @ai5d/design-system@1.2.0 lint /home/user/ai5d-digital-design-system
> eslint .


> @ai5d/design-system@1.2.0 format:check /home/user/ai5d-digital-design-system
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
[...]
 ✓ tests/fumee.test.ts (3 tests) 5ms

 Test Files  40 passed (40)
      Tests  845 passed | 1 skipped (846)
   Start at  16:26:25
   Duration  22.86s (transform 1.97s, setup 7.77s, collect 8.79s, tests 9.15s, environment 25.88s, prepare 4.10s)

code de sortie : 0
```

`tsc` muet, ESLint muet, Prettier conforme, **40 fichiers de tests, 845 tests verts et 1 sauté**, code
de sortie `0`. Quinze tests de plus qu'à la première passe : ceux des réparations de la relecture.

Une passe intermédiaire, sur `4f5e4c4` (avant la réparation de `6db360a`), était déjà verte : 40
fichiers, 845 tests verts, 1 sauté. Aucune passe n'a été rouge.

Les mutations relancées toutes sur ce même état : **les 34 ont rougi**, arbre restauré après chacune
([`mutations.md`](mutations.md)).

