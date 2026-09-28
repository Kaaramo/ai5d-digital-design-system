# 013 · La réserve basse vit dans la feuille

**Date :** 28 septembre 2026 · **Statut :** appliquée · **Version :** 1.3.0

## Contexte

`CoquilleRail` (mode `complet`) et `GabaritApp` (avec onglets) posaient `--reserve-barre`, la hauteur
de la barre basse et de la zone sûre, en **style en ligne** sur leur racine, puis la remettaient à zéro
au palier tablette par une règle de feuille. Une déclaration en ligne l'emporte sur toute règle de
feuille : la remise à zéro ne s'est jamais appliquée. Mesuré dans Chromium le 28 septembre 2026 (banc
d'essai, `docs/preuves/1.3.0/reserve-basse.md`) : à 1 280 px, la réserve valait encore 56 px dans les
deux coquilles. `CoquilleRail` ne le montrait pas, son rembourrage de palier recouvrant la variable ;
`GabaritApp` gardait 104 px sous son contenu au lieu de 48.

## Options

**A. `!important` sur la remise à zéro.** Il bat le style en ligne, et il battrait aussi le `style` d'un
produit qui voudrait régler sa réserve.

**B. La réserve dans la feuille**, sur un attribut qui dit qu'une barre existe, remise à zéro au palier
par une règle **de même sélecteur**. Le brouillon de la SPEC écrivait la remise à zéro sur
`.ai5d-coquille-rail` seul : plus faible que `.ai5d-coquille-rail[data-mode='complet']`, elle aurait
perdu à son tour.

## Décision

**B.** `CoquilleRail` : `[data-mode='complet']`, déjà posé. `GabaritApp` : `data-barre`, posé quand il
a des onglets. Aucune réserve en style en ligne ; un test le vérifie dans le source.

## Conséquences

- Au-delà de 768 px, `GabaritApp` avec onglets s'arrête où son contenu s'arrête. Sous 768 px, rien ne
  change ; `CoquilleRail` ne change à l'écran nulle part.
- La racine de `CoquilleRail` n'a plus d'attribut `style` ; son HTML sans pied reste celui de la 1.1.0,
  à cet attribut près.
- Un produit qui lisait `--reserve-barre` sur la racine dans ses tests la lit dans la feuille.
