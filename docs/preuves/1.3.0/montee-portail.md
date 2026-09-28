# La montée du Portail à la 1.3.0, sans une ligne changée dans le Portail

SPEC 1.3.0, §11.2, US-C02. Le 28 septembre 2026, après la relecture et ses réparations.

- **Le Portail** : `/home/user/AI5D-Portail`, commit `ad843ea`, copie de travail propre
  (`git status --short` vide), système `1.2.0` installé (`#v1.2.0` dans `package.json`).
- **Le paquet essayé** : `pnpm pack` du système au commit `6db360a`, tel qu'une étiquette le livrerait
  (champ `files` compris). Il s'appelle encore `ai5d-design-system-1.2.0.tgz` : le manifeste dit `1.2.0`
  jusqu'à la tâche 21 (G17), et l'invariant IP67 du Portail, qui exige au moins `1.2.0`, passe.
- **Le Portail n'a pas été touché.** La montée s'est jouée dans une copie entière
  (`cp -a`, `.git` et `node_modules` compris) : dans la copie seule, le dossier du système installé
  (`node_modules/.pnpm/@ai5d+design-system@…/node_modules/@ai5d/design-system`) a été supprimé puis
  remplacé par le contenu du paquet. `package.json` et `pnpm-lock.yaml` sont restés ceux du Portail :
  la vérification lit donc le manifeste du Portail tel quel, sans la référence `file:` que refuse IP08.
  Une première montée, jouée plus tôt le même jour dans le Portail lui-même par `pnpm add` sur le
  paquet d'avant les réparations, puis défaite, avait rendu les mêmes codes et 3 159 tests verts.

## Le lot est bien celui qui est installé

```
$ grep -c PRECEDENCE_FEUILLES node_modules/@ai5d/design-system/noyau/composants/index.ts
1
$ grep -c CONDITION_ANCRE node_modules/@ai5d/design-system/noyau/composants/MenuActions.tsx
3
$ tar -tzf ai5d-design-system-1.2.0.tgz | grep -c "noyau/composants/MenuActions.tsx\|noyau/composants/feuille.ts\|gardes/index.ts"
3
```

`CONDITION_ANCRE` n'existe qu'après la réparation du constat I2 : c'est le code réparé qui est monté.

## Les quatre commandes du Portail, sans rien changer d'autre

```

> ai5d-portail@0.1.0 typecheck /tmp/claude-0/sc/montee/portail
> tsc --noEmit

code : 0

> ai5d-portail@0.1.0 lint /tmp/claude-0/sc/montee/portail
> eslint .

code : 0

> ai5d-portail@0.1.0 format:check /tmp/claude-0/sc/montee/portail
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
code : 0
 ✓ tests/unites/barre-progression.test.tsx (2 tests) 167ms

 Test Files  177 passed | 1 skipped (178)
      Tests  3159 passed | 1 skipped (3160)
   Start at  16:15:41
   Duration  88.23s (transform 9.80s, setup 37.42s, collect 51.80s, tests 61.29s, environment 44.08s, prepare 18.10s)

code : 0
```

`tsc` muet, ESLint muet, Prettier conforme, **177 fichiers de tests, 3 159 tests verts et 1 sauté**,
quatre codes `0`. Aucun avertissement de React (`precedence`, `<style`, `popover`, hydratation) dans la
sortie des tests. Les tests du Portail qui lisent **ses propres** feuilles dans leur conteneur
(`tests/unites/cadres.test.tsx:62`, `tests/unites/navigation-suivie.test.tsx:67`) ne bougent pas :
seules les feuilles du système se hissent.

## La garde 7 sur les composants du Portail, pour P10

Lancée depuis le système sur le Portail lui-même, en lecture seule, avec la garde réparée (constat
I1) :

```
$ node --input-type=module -e "import { decrire, verifierFeuilleUnique } from './gardes/index.ts'; …"
  [feuille-unique] Apparition.tsx:43  <style> sans href ni precedence : la feuille est posee a chaque instance
  [feuille-unique] IndicateurNavigation.tsx:59  <style> sans href ni precedence : la feuille est posee a chaque instance
  [feuille-unique] champs/commun.tsx:91  <style> sans href ni precedence : la feuille est posee a chaque instance
  [feuille-unique] ecrans/CadrePublic.tsx:58  <style> sans href ni precedence : la feuille est posee a chaque instance
  [feuille-unique] participant/FeuilleAttestation.tsx:66  <style> sans href ni precedence : la feuille est posee a chaque instance
app :
Aucune infraction.
```

Ce n'est pas un échec de la montée : ce sont les cinq feuilles que le Portail pose encore à chaque
instance, conformes à ce que le plan attendait. P10 les corrige sous la précédence `portail`, avec
`href` **et** `precedence` : la garde relève désormais une feuille qui porterait `precedence` seule,
que React rendrait à chaque instance sans erreur. `app/` : aucune infraction.

## Ce que cette montée ne couvre pas

- **Une page de la console rendue sur le poste**, et le compte de ses balises (tâche 20, étape 5) :
  elle se joue sur le poste de Karamo, contre le vrai Compte ; elle reste dans « Ce qui n'est pas
  couvert ».
- **La construction du Portail** : aucun `build` n'a été lancé.
- **Le poids du flux RSC** : non mesuré (voir [`relecture.md`](relecture.md), « Reportés »).

## Le Portail, rendu à son état

```
$ git -C /home/user/AI5D-Portail status --short
$ git -C /home/user/AI5D-Portail rev-parse --short HEAD
ad843ea
```

Aucune ligne : la copie de travail du Portail est celle d'avant l'essai.
