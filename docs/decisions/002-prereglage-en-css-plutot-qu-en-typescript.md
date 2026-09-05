# 002 — Le préréglage Tailwind en CSS, plutôt qu'en TypeScript

**Date :** 5 septembre 2026 · **Statut :** appliquée

## Contexte

La spécification, section 8, nomme le fichier `noyau/ai5d.preset.ts` — un préréglage
Tailwind exporté en TypeScript, comme le voulait Tailwind v3.

## Options

**A. `ai5d.preset.css`, un bloc `@theme`.** C'est la forme native de Tailwind v4, qui
abandonne la configuration JavaScript au profit d'une configuration en CSS.

**B. `ai5d.preset.ts`, tel que la spec l'écrit.** Il faudrait alors traduire les jetons CSS
en objet JavaScript, puis laisser Tailwind les retraduire en CSS.

## Décision

**A.**

L'option B est une couche de traduction sans usage : elle transforme du CSS en JavaScript
pour qu'un outil le retransforme en CSS. Chaque aller-retour est une occasion de perdre une
valeur, et rien dans le système ne demande à lire les jetons depuis du JavaScript.

## Conséquences

- L'export `"./preset"` du `package.json` pointe sur le fichier CSS. **Un projet
  consommateur n'est pas affecté par l'écart** : il écrit toujours
  `import '@ai5d/design-system/preset'`.
- La spécification est en retard sur ce point. Elle sera corrigée à sa prochaine édition
  plutôt qu'au fil de l'eau : un document qu'on rectifie à chaque écart cesse d'être un
  document de référence.
- Le bloc `@theme` ne contient **aucune valeur** : il ne fait que pointer vers les jetons.
  `tests/preset.test.ts` le vérifie déclaration par déclaration, et vérifie en plus que
  chaque cible existe réellement quelque part.
