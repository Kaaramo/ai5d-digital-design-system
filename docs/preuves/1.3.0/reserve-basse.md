# La réserve basse

SPEC 1.3.0, §0.7, §5.10. Dans Chromium, `CoquilleRail` en mode `complet` et `GabaritApp` avec trois
onglets, à 390 puis à 1 280 px : la valeur calculée de `--reserve-barre` sur la racine, le style en
ligne de la racine, et le rembourrage bas du contenu.

## Avant · 1.2.0 · commit `244941e`, 28/09/2026 15:11

```
Banc 1.3.0 · avant · Chromium 141.0.7390.37
## Réserve basse

reserve-coquille · 390 px
{"reserveBarre":"calc(56px + 0px)","styleEnLigne":"--reserve-barre:calc(var(--hauteur-barre-onglets) + var(--zone-sure-basse, 0px))","paddingBottomContenu":"88px"}
erreurs de console : aucune

reserve-coquille · 1280 px
{"reserveBarre":"calc(56px + 0px)","styleEnLigne":"--reserve-barre:calc(var(--hauteur-barre-onglets) + var(--zone-sure-basse, 0px))","paddingBottomContenu":"48px"}
erreurs de console : aucune

reserve-app · 390 px
{"reserveBarre":"calc(56px + 0px)","styleEnLigne":"--reserve-barre:calc(56px + var(--zone-sure-basse, 0px))","paddingBottomContenu":"104px"}
erreurs de console : aucune

reserve-app · 1280 px
{"reserveBarre":"calc(56px + 0px)","styleEnLigne":"--reserve-barre:calc(56px + var(--zone-sure-basse, 0px))","paddingBottomContenu":"104px"}
erreurs de console : aucune

```

## Lecture

À 1 280 px, la réserve vaut encore la hauteur de la barre dans les deux coquilles : le constat du
§0.7 est confirmé. `CoquilleRail` ne le montre pas, son rembourrage de palier recouvrant la variable ;
`GabaritApp` le montre, 56 px de trop sous le contenu. La tâche 13 s'applique.

## Après · 1.3.0 · commit `33c2b6e`, 28/09/2026 15:26

```
Banc 1.3.0 · apres · Chromium 141.0.7390.37
## Réserve basse

reserve-coquille · 390 px
{"reserveBarre":"calc(56px + 0px)","styleEnLigne":null,"paddingBottomContenu":"88px"}
erreurs de console : aucune

reserve-coquille · 1280 px
{"reserveBarre":"0px","styleEnLigne":null,"paddingBottomContenu":"48px"}
erreurs de console : aucune

reserve-app · 390 px
{"reserveBarre":"calc(56px + 0px)","styleEnLigne":null,"paddingBottomContenu":"104px"}
erreurs de console : aucune

reserve-app · 1280 px
{"reserveBarre":"0px","styleEnLigne":null,"paddingBottomContenu":"48px"}
erreurs de console : aucune

```

## Lecture

À 1 280 px, la réserve vaut désormais `0px` dans les deux coquilles, et aucune racine ne porte de
style en ligne (`styleEnLigne` `null`). `GabaritApp` perd les 56 px de trop : 48 px sous le contenu au
lieu de 104. `CoquilleRail` garde ses 48 px, comme avant : le défaut n'y était pas visible. À 390 px,
rien ne change : la réserve vaut toujours la hauteur de la barre plus la zone sûre (88 px et 104 px
sous le contenu, comme avant).
