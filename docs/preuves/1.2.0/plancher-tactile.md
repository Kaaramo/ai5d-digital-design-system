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

## Après le correctif · 1.2.0

Commit `2357d50`, 26/09/2026 11:56. Même commande, argument `apres`.

```
Mesure du plancher tactile · apres · Chromium 143.0.7499.4
Page : file:///C:/Users/ksthe/Documents/ai5d-design-system/specimens/composants.html

== souris · 1280 px · matchMedia('(pointer: coarse)').matches = false
{"profil":"aere","--hauteur-controle":"\"48px\"","--ligne-liste":"\"64px\"","bouton-sm":44,"bouton-md":48,"bouton-lg":56,"champ":48,"squelette-controle":48,"ligne-de-liste":64}
{"profil":"equilibre","--hauteur-controle":"\"48px\"","--ligne-liste":"\"56px\"","bouton-sm":44,"bouton-md":48,"bouton-lg":56,"champ":48,"squelette-controle":48,"ligne-de-liste":56}
{"profil":"modere","--hauteur-controle":"\"44px\"","--ligne-liste":"\"48px\"","bouton-sm":44,"bouton-md":44,"bouton-lg":52,"champ":44,"squelette-controle":44,"ligne-de-liste":48}
{"profil":"compact","--hauteur-controle":"\"40px\"","--ligne-liste":"\"40px\"","bouton-sm":44,"bouton-md":44,"bouton-lg":48,"champ":44,"squelette-controle":40,"ligne-de-liste":40}

== doigt · 390 px · matchMedia('(pointer: coarse)').matches = true
{"profil":"aere","--hauteur-controle":"\"max(48px, 44px)\"","--ligne-liste":"\"max(64px, 44px)\"","bouton-sm":44,"bouton-md":48,"bouton-lg":56,"champ":48,"squelette-controle":48,"ligne-de-liste":64}
{"profil":"equilibre","--hauteur-controle":"\"max(48px, 44px)\"","--ligne-liste":"\"max(56px, 44px)\"","bouton-sm":44,"bouton-md":48,"bouton-lg":56,"champ":48,"squelette-controle":48,"ligne-de-liste":56}
{"profil":"modere","--hauteur-controle":"\"max(44px, 44px)\"","--ligne-liste":"\"max(48px, 44px)\"","bouton-sm":44,"bouton-md":44,"bouton-lg":52,"champ":44,"squelette-controle":44,"ligne-de-liste":48}
{"profil":"compact","--hauteur-controle":"\"max(40px, 44px)\"","--ligne-liste":"\"max(40px, 44px)\"","bouton-sm":44,"bouton-md":44,"bouton-lg":52,"champ":44,"squelette-controle":44,"ligne-de-liste":44}
```

## Lecture

Confrontation au tableau du §5.1.2 de la SPEC. La valeur de la propriété est lue, pour les deux
hauteurs, dans la hauteur de l'élément qui la porte (`squelette-controle` pour `--hauteur-controle`,
`ligne-de-liste` pour `--ligne-liste`).

| Profil | Contexte | Contrôle attendu | Contrôle mesuré | Ligne attendue | Ligne mesurée | Avant (1.1.0) |
| ------ | -------- | ---------------- | --------------- | -------------- | ------------- | ------------- |
| aere | souris | 48 | 48 | 64 | 64 | 48 et 64 |
| equilibre | souris | 48 | 48 | 56 | 56 | 48 et 56 |
| modere | souris | 44 | 44 | 48 | 48 | 44 et 48 |
| compact | souris | 40 | 40 | 40 | 40 | 40 et 40 |
| aere | doigt | 48 | 48 | 64 | 64 | vides, 25,59 et 25,59 |
| equilibre | doigt | 48 | 48 | 56 | 56 | vides, 24,8 et 24,8 |
| modere | doigt | 44 | 44 | 48 | 48 | vides, 24 et 24 |
| compact | doigt | 44 | 44 | 44 | 44 | vides, 23,19 et 23,19 |

Au doigt, en `equilibre` : bouton `sm` 44, `md` 48, `lg` 56, champ 48, squelette 48, ligne 56, comme
attendu. Avant le correctif, les trois tailles de bouton valaient 44.

**Un écart de forme, pas de valeur.** Au doigt, Chromium rend la valeur calculée de
`--hauteur-controle` sous la forme `max(48px, 44px)` et non `48px` : une propriété personnalisée non
enregistrée garde, une fois ses `var()` substitués, le texte de sa valeur, sans évaluer `max()`. C'est
le comportement du navigateur, et c'est la hauteur des éléments qui la lisent qui fait foi. L'attendu du
plan, `"48px"`, supposait une évaluation qui n'a pas lieu. Avant le correctif, cette même lecture rendait
une chaîne **vide** : la propriété était invalide.
