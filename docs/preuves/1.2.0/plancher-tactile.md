# Le plancher tactile, mesuré dans Chromium

SPEC 1.2.0, §5.1.4, troisième preuve. jsdom ne calcule aucune propriété personnalisée : cette mesure
est la seule qui voit la hauteur qu'une personne touche. Le script est
[`mesure-plancher.cjs`](mesure-plancher.cjs). Il ouvre le spécimen du dépôt, qui importe les vraies
feuilles par le préréglage, et reproduit les formules de hauteur de `Bouton` (`sm`, `md`, `lg`), de
`Champ`, de `SqueletteFormulaire`, et une ligne de `min-height: var(--ligne-liste)`.

Attendu après correctif (SPEC §5.1.2), au doigt, en `equilibre` : `--hauteur-controle` à `"48px"`,
`--ligne-liste` à `"56px"`, bouton `sm` 44, `md` 48, `lg` 56, champ 48, squelette 48, ligne 56 ; en
`compact`, `"44px"` et `"44px"`.

## Avant le correctif · 1.1.0

Commit `7427fe6`, 26/09/2026 11:38. Commande :
`NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/mesure-plancher.cjs avant`

```
Mesure du plancher tactile · avant · Chromium 143.0.7499.4
Page : file:///C:/Users/ksthe/Documents/ai5d-design-system/specimens/composants.html

== souris · 1280 px · matchMedia('(pointer: coarse)').matches = false
{"profil":"aere","--hauteur-controle":"\"48px\"","--ligne-liste":"\"64px\"","bouton-sm":44,"bouton-md":48,"bouton-lg":56,"champ":48,"squelette-controle":48,"ligne-de-liste":64}
{"profil":"equilibre","--hauteur-controle":"\"48px\"","--ligne-liste":"\"56px\"","bouton-sm":44,"bouton-md":48,"bouton-lg":56,"champ":48,"squelette-controle":48,"ligne-de-liste":56}
{"profil":"modere","--hauteur-controle":"\"44px\"","--ligne-liste":"\"48px\"","bouton-sm":44,"bouton-md":44,"bouton-lg":52,"champ":44,"squelette-controle":44,"ligne-de-liste":48}
{"profil":"compact","--hauteur-controle":"\"40px\"","--ligne-liste":"\"40px\"","bouton-sm":44,"bouton-md":44,"bouton-lg":48,"champ":44,"squelette-controle":40,"ligne-de-liste":40}

== doigt · 390 px · matchMedia('(pointer: coarse)').matches = true
{"profil":"aere","--hauteur-controle":"\"\"","--ligne-liste":"\"\"","bouton-sm":44,"bouton-md":44,"bouton-lg":44,"champ":44,"squelette-controle":25.59,"ligne-de-liste":25.59}
{"profil":"equilibre","--hauteur-controle":"\"\"","--ligne-liste":"\"\"","bouton-sm":44,"bouton-md":44,"bouton-lg":44,"champ":44,"squelette-controle":24.8,"ligne-de-liste":24.8}
{"profil":"modere","--hauteur-controle":"\"\"","--ligne-liste":"\"\"","bouton-sm":44,"bouton-md":44,"bouton-lg":44,"champ":44,"squelette-controle":24,"ligne-de-liste":24}
{"profil":"compact","--hauteur-controle":"\"\"","--ligne-liste":"\"\"","bouton-sm":44,"bouton-md":44,"bouton-lg":44,"champ":44,"squelette-controle":23.19,"ligne-de-liste":23.19}
```
