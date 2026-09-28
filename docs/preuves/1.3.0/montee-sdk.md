# La montée du SDK `@ai5d/auth` à la 1.3.0

SPEC 1.3.0, §11.2. Le 28 septembre 2026, après la relecture et ses réparations.

- **Le SDK** : `@ai5d/auth` 1.1.0, tel qu'il est livré (le paquet installé, qui porte ses sources, sa
  configuration et ses tests), faute d'accès à son dépôt privé `Kaaramo/ai5d-auth`. Ce n'est pas un
  clone : aucune histoire Git, aucune poussée possible. Il déclare le système en pair `*` et en
  développement `#v1.0.1` ; ses dépendances ont été installées depuis son verrou (« Lockfile is up to date », système `1.0.1`).
- **Le paquet essayé** : le même que pour le Portail et Compte, `pnpm pack` du système au commit
  `6db360a`, posé dans une copie à la place du système installé.

## Avant, avec le système que le SDK épingle (`1.0.1`)

La copie avait été montée plus tôt le même jour sur le paquet d'avant les réparations ; la sortie
d'avant toute montée, relevée alors, est celle-ci (fin de sortie) :

```
> @ai5d/auth@1.1.0 typecheck /tmp/claude-0/-home-user-AI5D-Portail/91c64683-1384-5c39-86cc-33e8396232e1/scratchpad/montee/sdk
> tsc --noEmit
> @ai5d/auth@1.1.0 lint /tmp/claude-0/-home-user-AI5D-Portail/91c64683-1384-5c39-86cc-33e8396232e1/scratchpad/montee/sdk
> eslint .
> @ai5d/auth@1.1.0 test /tmp/claude-0/-home-user-AI5D-Portail/91c64683-1384-5c39-86cc-33e8396232e1/scratchpad/montee/sdk
> vitest run
 Test Files  11 passed (11)
      Tests  161 passed (161)
```

## Après : le SDK avec la 1.3.0

```
$ grep -c CONDITION_ANCRE node_modules/@ai5d/design-system/noyau/composants/MenuActions.tsx
3
> @ai5d/auth@1.1.0 typecheck /tmp/claude-0/sc/montee/sdk
> tsc --noEmit
code : 0
> @ai5d/auth@1.1.0 lint /tmp/claude-0/sc/montee/sdk
> eslint .
code : 0
> @ai5d/auth@1.1.0 test /tmp/claude-0/sc/montee/sdk
> vitest run
 Test Files  11 passed (11)
      Tests  161 passed (161)
code : 0
```

`tsc` muet, ESLint muet, **11 fichiers de tests, 161 tests verts**, trois codes `0`. Rien n'est requis
du SDK : `UserButton.tsx:100-139` pourra passer à `MenuActions` dans une version du SDK, ce qui n'est
pas l'objet de cette montée.

## Ce que cette montée ne couvre pas

Le dépôt du SDK lui-même, faute d'accès : ses fichiers hors paquet (intégration continue, scripts) ne
sont pas éprouvés. La copie est jetable et n'a rien écrit ailleurs.
