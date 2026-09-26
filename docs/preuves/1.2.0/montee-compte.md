# La montée de Compte à la 1.2.0, sans une ligne changée dans Compte

SPEC 1.2.0, §11.2, US-S17. Le 26 septembre 2026.

- **Compte** : `C:\Users\ksthe\Documents\ai5d-platform`, commit `1ef7ef2`, copie de travail propre
  (`git status --short` vide) avant l'essai, système `1.1.0` installé.
- **Le paquet essayé** : `pnpm pack` du système, tel qu'une étiquette le livrerait (champ `files`
  compris), installé seul par `pnpm --filter compte add <archive>`. Aucun autre fichier de Compte n'a
  été touché.

## La première montée a trouvé un défaut de la 1.2.0

Avec la première forme de `ComposantLien` (les attributs d'un `<a>` tels quels), `pnpm typecheck` de
Compte a échoué : **six erreurs `TS2322`**, toutes sur un `Link` de Next passé en `Lien`
(`app/(documents)/conditions/page.tsx:31`, `app/(documents)/confidentialite/page.tsx:24`,
`app/conditions/accepter/page.tsx:60`, `components/NavigationRubriques.tsx:59` et `:71`,
`components/RailConsole.tsx:109`). Extrait de la sortie :

```
app/(documents)/conditions/page.tsx(31,7): error TS2322: Type 'ForwardRefExoticComponent<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<any> & { children?: ReactNode; } & RefAttributes<...>>' is not assignable to type 'ComposantLien | undefined'.
  ...
        Type 'AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode; }' is not assignable to type 'LinkProps<any>' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types
          Types of property 'onMouseEnter' are incompatible.
            Type 'MouseEventHandler<HTMLAnchorElement> | undefined' is not assignable to type 'MouseEventHandler<HTMLAnchorElement>'.
```

Cause : Next 16.3.5 redéclare `onClick`, `onMouseEnter` et `onTouchStart` sans `| undefined`
(`next/dist/client/link.d.ts`, lignes 77, 81, 85) ; sous `exactOptionalPropertyTypes`, que Compte et
le Portail activent, un type qui les promettait avec `| undefined` refusait `Link`. La sonde du plan
(écart E2) l'avait conclu assignable, faute de Next dans le dépôt du système. **Publiée ainsi, la 1.2.0
aurait cassé la compilation de Compte, et celle du Portail à sa montée.**

Réparation, commit `64a893a` : `ProprietesLienProduit` retire `onMouseEnter` et `onTouchStart`, que le
système ne transmet jamais, et déclare `onClick` sans `| undefined` ; `Bouton` ne passe `onClick` au
lien du produit que lorsqu'il est défini. Un test recopie la forme de `Link` de Next : il a échoué au
typage avant la réparation, et passe après.

## La montée, après réparation

Le paquet a été refait depuis la copie de travail qui porte la réparation (le code de `64a893a` ; ce
commit n'ajoute ensuite que l'export du type, des commentaires et le journal).

### La garde distribuée, sur la feuille installée dans Compte

Avant, sur la feuille de la 1.1.0 :

```
  [cible-tactile-minimale] C:/Users/ksthe/Documents/ai5d-platform/apps/compte/node_modules/@ai5d/design-system/densites/profils.css:79  --hauteur-controle se lit elle-meme : la valeur est invalide au calcul, et la hauteur tombe a celle du contenu
  [cible-tactile-minimale] C:/Users/ksthe/Documents/ai5d-platform/apps/compte/node_modules/@ai5d/design-system/densites/profils.css:80  --ligne-liste se lit elle-meme : la valeur est invalide au calcul, et la hauteur tombe a celle du contenu
  [cible-tactile-minimale] C:/Users/ksthe/Documents/ai5d-platform/apps/compte/node_modules/@ai5d/design-system/densites/profils.css:76  --hauteur-controle n'est pas releve a 44px sur pointeur grossier
  [cible-tactile-minimale] C:/Users/ksthe/Documents/ai5d-platform/apps/compte/node_modules/@ai5d/design-system/densites/profils.css:76  --ligne-liste n'est pas releve a 44px sur pointeur grossier
```

Après, sur la feuille de la 1.2.0 :

```
Aucune infraction.
```

### La vérification de Compte

`CI=true pnpm typecheck` : code de sortie `0`.

```
> pnpm -r exec tsc --noEmit && tsc -p tsconfig.tests.json
```

`CI=true pnpm lint` : code de sortie `0`.

```
> eslint .
```

`CI=true pnpm test` : code de sortie `1`.

```
 Test Files  1 failed | 145 passed (146)
      Tests  3 failed | 2692 passed (2695)
   Duration  101.89s
```

Les trois échecs sont les invariants d'épinglage de Compte (`tests/invariants/socle.test.ts`) :

```
→ la reference doit contenir #v: expected 'file:C:/Users/ksthe/AppData/Local/Tem…' to match /#v\d+\.\d+\.\d+$/
→ aucune etiquette lisible dans la reference: expected undefined to be defined
Expected: "file:C:/Users/ksthe/AppData/Local/Temp/ai5d-montee-1.2.0/ai5d-design-system-1.2.0.tgz"
Received: "github:Kaaramo/ai5d-digital-design-system#v1.1.0"
```

Ils refusent la référence `file:` de l'archive d'essai et exigent une étiquette `#v…`, qui n'existe pas
avant la publication. Ce n'est pas un défaut de la 1.2.0 : ils passeront quand Compte épinglera
`#v1.2.0`. Les 2 692 autres tests passent.

## Compte rendu à son état

```
git checkout -- apps/compte/package.json pnpm-lock.yaml
pnpm install --frozen-lockfile        (code de sortie 0)
git status --short                    (vide)
apps/compte/node_modules/@ai5d/design-system/package.json : "version": "1.1.0"
```

Aucun commit, aucune poussée dans Compte.
