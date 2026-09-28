# La montée de Compte à la 1.3.0, sans une ligne changée dans Compte

SPEC 1.3.0, §11.2, US-C15. Le 28 septembre 2026, après la relecture et ses réparations.

- **Compte** : `/home/user/ai5d-platform`, commit `1ef7ef2`, copie de travail propre
  (`git status --short` vide), système `1.1.0` installé (`#v1.1.0` dans `package.json:53` à la racine
  et dans `apps/compte/package.json:11`).
- **Le paquet essayé** : le même que pour le Portail, `pnpm pack` du système au commit `6db360a`.
- **Compte n'a pas été touché.** La montée s'est jouée dans une copie entière (`cp -a`) : dans la
  copie seule, le dossier du système installé a été supprimé puis remplacé par le contenu du paquet.
  Une première montée, jouée plus tôt le même jour sur le paquet d'avant les réparations, avait rendu
  les mêmes cinq échecs.

## Avant : Compte à la 1.1.0, dans la copie

```
 FAIL  tests/invariants/sdk.test.ts > le SDK installe est celui que les manifestes demandent > les tests du SDK ne sont pas livres avec lui
 Test Files  1 failed | 145 passed (146)
      Tests  1 failed | 2694 passed (2695)
code : 1
```

Un échec qui précède la montée : `tests/invariants/sdk.test.ts:78` constate que le SDK installé livre
ses tests. Il ne touche pas au système.

## Après : Compte avec la 1.3.0, sans rien changer d'autre

```
$ grep -c PRECEDENCE_FEUILLES node_modules/@ai5d/design-system/noyau/composants/index.ts
1

> ai5d-platform@0.0.0 typecheck /tmp/claude-0/sc/montee/compte
> pnpm -r exec tsc --noEmit && tsc -p tsconfig.tests.json

code : 0

> ai5d-platform@0.0.0 lint /tmp/claude-0/sc/montee/compte
> eslint .

code : 0
 FAIL  tests/invariants/sdk.test.ts > le SDK installe est celui que les manifestes demandent > les tests du SDK ne sont pas livres avec lui
AssertionError: expected true to be false // Object.is equality
 ❯ tests/invariants/sdk.test.ts:78:40
 FAIL  tests/invariants/socle.test.ts > squelette du monorepo > epingle la version REELLEMENT installee, pas une autre
AssertionError: expected '1.2.0' to be '1.1.0' // Object.is equality
 ❯ tests/invariants/socle.test.ts:82:22
 FAIL  tests/unites/coquille-document.test.tsx > GabaritDocument, sur les documents de Compte > declare une piste de lecture qui peut se reduire
AssertionError: expected '' to contain 'minmax(0, 720px)'
 ❯ tests/unites/coquille-document.test.tsx:186:21
 FAIL  tests/unites/coquille-document.test.tsx > GabaritDocument, sur les documents de Compte > rend les sections visibles sur ordinateur et a l impression, par ::details-content
AssertionError: expected '' to contain '@media (min-width: 1024px)'
 ❯ tests/unites/coquille-document.test.tsx:193:21
 FAIL  tests/unites/coquille.test.tsx > CoquillePortail — une composition, lue au texte > laisse le systeme reserver la hauteur de la barre basse
AssertionError: expected 'import type { ReactNode } from \'reac…' to contain '.ai5d-coquille-rail { --reserve-barre…'
 ❯ tests/unites/coquille.test.tsx:107:18
 Test Files  4 failed | 142 passed (146)
      Tests  5 failed | 2690 passed (2695)
code : 1
```

`tsc` muet sur tout le dépôt (`pnpm -r exec tsc --noEmit` puis les tests), ESLint muet : **Compte
compile et passe son lint sans changer une ligne.** Aucun avertissement de React dans la sortie.

Cinq tests rougissent, dont un qui rougissait avant. Les quatre autres lisent l'intérieur du système
ou sa version, pas son rendu :

| Test de Compte | Pourquoi il rougit | Réécriture |
| -------------- | ------------------ | ---------- |
| `tests/unites/coquille.test.tsx:107` | Il exige la chaîne `.ai5d-coquille-rail { --reserve-barre: 0px; }` dans `CoquilleRail.tsx` installé ; la 1.3.0 l'écrit `.ai5d-coquille-rail[data-mode='complet'] { --reserve-barre: 0px; }` (décision 013) | La chaîne nouvelle |
| `tests/unites/coquille-document.test.tsx:185` | `container.querySelector('style')` sur `GabaritDocument` : la feuille est hissée dans `<head>`, la chaîne lue est vide (décision 010) | `document.head.querySelector('style[data-href~="ai5d-gabarit-document"]')` |
| `tests/unites/coquille-document.test.tsx:192` | Idem | Idem |
| `tests/invariants/socle.test.ts:82` | Il compare l'étiquette demandée (`1.1.0`) à la version installée (`1.2.0` dans ce paquet, `1.3.0` une fois étiquetée) | Aucune : elle suit la montée des deux étiquettes (`socle.test.ts:99` les veut égales) |

## Les réécritures, jouées dans la copie

Pour que le guide de montée ne promette rien qui n'ait été joué : dans la copie seule, les trois
lectures réécrites comme le dit `CHANGELOG.md`, et les deux étiquettes posées à `#v1.2.0` (le numéro
que porte ce paquet ; ce sera `#v1.3.0`).

```
$ git diff   # dans la copie
-    "@ai5d/design-system": "github:Kaaramo/ai5d-digital-design-system#v1.1.0",
+    "@ai5d/design-system": "github:Kaaramo/ai5d-digital-design-system#v1.2.0",
-    "@ai5d/design-system": "github:Kaaramo/ai5d-digital-design-system#v1.1.0",
+    "@ai5d/design-system": "github:Kaaramo/ai5d-digital-design-system#v1.2.0",
-    const feuille = container.querySelector('style')?.textContent ?? '';
+    const feuille =
+      document.head.querySelector('style[data-href~="ai5d-gabarit-document"]')?.textContent ?? '';
-    const feuille = container.querySelector('style')?.textContent ?? '';
+    const feuille =
+      document.head.querySelector('style[data-href~="ai5d-gabarit-document"]')?.textContent ?? '';
-    expect(rail).toContain('.ai5d-coquille-rail { --reserve-barre: 0px; }');
+    expect(rail).toContain(".ai5d-coquille-rail[data-mode='complet'] { --reserve-barre: 0px; }");
$ CI=true pnpm exec vitest run tests/unites/coquille.test.tsx tests/unites/coquille-document.test.tsx tests/invariants/socle.test.ts
 ✓ tests/invariants/socle.test.ts (13 tests) 8ms
 ✓ tests/unites/coquille.test.tsx (67 tests) 59ms
 ✓ tests/unites/coquille-document.test.tsx (25 tests) 1563ms
 Test Files  3 passed (3)
      Tests  105 passed (105)
code : 0
```

Les quatre lectures passent. Le guide de Compte, dans `CHANGELOG.md`, les nomme avec ces réécritures
(relecture, constat I4).

## Ce que cette montée ne couvre pas

- Le format de Compte (`format:check`) n'a pas été lancé : la montée ne change aucun fichier de Compte.
- La construction de Compte : aucun `build`.
- Aucune adoption des composants nouveaux (`EnteteObjet`, `Selecteur`, `Bandeau` refermable,
  `MenuActions`) : aucune n'est obligatoire, et chacune est un changement de Compte.

## Compte, rendu à son état

```
$ git -C /home/user/ai5d-platform status --short
$ git -C /home/user/ai5d-platform rev-parse --short HEAD
1ef7ef2
```

Aucune ligne : Compte est tel qu'avant l'essai.
