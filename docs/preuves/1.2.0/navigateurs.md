# Le fondu des onglets et l onglet initial, moteur par moteur

Commit `c2f8c75`, 26/09/2026. Playwright global, spécimen du dépôt.

```

== chromium 143.0.7499.4
{
  "prisEnCharge": {
    "animation-timeline: scroll()": true,
    "scroll-initial-target: nearest": true,
    "selector(:has(a))": true,
    "container-type: inline-size": true,
    "mask-image: linear-gradient(black, transparent)": true
  },
  "pointerCoarse": true,
  "masqueDebut": "linear-gradient(to left, rgba(0, 0, 0, 0), rgb(5, 28, 44) 24px)",
  "masqueMilieu": "linear-gradient(to right, rgba(0, 0, 0, 0), rgb(5, 28, 44) 24px, rgb(5, 28, 44) calc(100% - 24px), rgba(0, 0, 0, 0))",
  "masqueFin": "linear-gradient(to right, rgba(0, 0, 0, 0), rgb(5, 28, 44) 24px)",
  "scrollInitial": 244,
  "masqueSansDebordement": "none"
}

== firefox 144.0.2
{
  "prisEnCharge": {
    "animation-timeline: scroll()": false,
    "scroll-initial-target: nearest": false,
    "selector(:has(a))": true,
    "container-type: inline-size": true,
    "mask-image: linear-gradient(black, transparent)": true
  },
  "pointerCoarse": true,
  "masqueDebut": "none",
  "masqueMilieu": "none",
  "masqueFin": "none",
  "scrollInitial": 0,
  "masqueSansDebordement": "none"
}

== webkit 26.0
{
  "prisEnCharge": {
    "animation-timeline: scroll()": true,
    "scroll-initial-target: nearest": false,
    "selector(:has(a))": true,
    "container-type: inline-size": true,
    "mask-image: linear-gradient(black, transparent)": true
  },
  "pointerCoarse": true,
  "masqueDebut": "linear-gradient(to left, rgba(0, 0, 0, 0), rgb(5, 28, 44) 24px)",
  "masqueMilieu": "linear-gradient(to right, rgba(0, 0, 0, 0), rgb(5, 28, 44) 24px, rgb(5, 28, 44) calc(100% - 24px), rgba(0, 0, 0, 0))",
  "masqueFin": "linear-gradient(to right, rgba(0, 0, 0, 0), rgb(5, 28, 44) 24px)",
  "scrollInitial": 0,
  "masqueSansDebordement": "none"
}
```

## Lecture

| Moteur | Fondu (`animation-timeline`) | Onglet initial (`scroll-initial-target`) | Rien ne déborde | Début, milieu, fin |
| ------ | ---------------------------- | ---------------------------------------- | --------------- | ------------------ |
| Chromium 143 | oui | oui, rangée amenée à 244 px | aucun masque | les trois masques attendus |
| WebKit 26.0 | oui | non, `scrollLeft` à 0 | aucun masque | les trois masques attendus |
| Firefox 144 | non | non | aucun masque | aucun masque : le rendu de la 1.1.0 |

Conforme à la sonde du plan (écart E13) et à la décision 007. Dans les trois moteurs, `:has()`, les
requêtes de conteneur et `mask-image` sont pris en charge.

Safari : non constaté, faute d'appareil. WebKit de Playwright en donne une indication, pas une preuve.
