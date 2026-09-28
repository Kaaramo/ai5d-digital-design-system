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
