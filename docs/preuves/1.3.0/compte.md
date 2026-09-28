# La revérification dans Compte

SPEC 1.3.0, §0.6, pièces 5 et 13. Compte au commit `1ef7ef2`, relu le 28/09/2026.

## EnteteConsole

```
25:export function EnteteConsole({
27:  filDAriane = [],
31:  filDAriane?: SegmentFil[];
33:  action?: React.ReactNode;
37:      {filDAriane.length > 0 ? (
38:        <nav aria-label="Fil d’Ariane">
51:            {filDAriane.map((segment, index) => (
57:                  <span aria-current="page">{segment.libelle}</span>
61:                {index < filDAriane.length - 1 ? <span aria-hidden="true">/</span> : null}
98:        {action}
fichiers de apps/compte/app qui le rendent : 7
```

## Selecteur

```
6: * Le menu deroulant du depot, sur un `<select>` NATIF.
11: * defilement et un repli tactile. Le `<select>` du navigateur fait les quatre, dans la
19:export function Selecteur({
21:  libelleMasque = false,
26:  invite,
29:  libelleMasque?: boolean;
34:  invite?: string | undefined;
43:          libelleMasque
65:      <select
81:        {invite === undefined ? null : (
83:            Une invite VIDE et desactivee : le formulaire ne part pas sur un choix que
88:            {invite}
rendus dans apps/compte : 7
```

## Verdicts

`EnteteObjet` monte : Compte pose un titre, un fil nommé et une action unique à droite, sur sept
écrans. `Selecteur` monte : Compte en rend sept, sur un `<select>` natif. Les nombres de la SPEC
(« 14 fichiers », « 12 emplois ») comptaient des lignes ; les verdicts ne changent pas (plan, écart
E12).
