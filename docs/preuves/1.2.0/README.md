# Preuves · 1.2.0

> Sorties réelles, recopiées. Une classe présente dans le code ne prouve pas un rendu ; un test écrit
> ne prouve pas un test qui passe.

| Preuve | Fichier |
| ------ | ------- |
| La vérification d'un bloc, et ce que ses passes ont trouvé | [`verification.md`](verification.md) |
| Chaque garde nouvelle, vue échouer | [`mutations.md`](mutations.md) |
| Le plancher tactile mesuré dans Chromium, avant et après | [`plancher-tactile.md`](plancher-tactile.md) |
| Les captures, à la souris et au doigt, en clair et en sombre, et leurs mesures | [`captures.md`](captures.md) |
| Le fondu et l'onglet initial, moteur par moteur | [`navigateurs.md`](navigateurs.md) |
| La montée de Compte, sans une ligne changée dans Compte | [`montee-compte.md`](montee-compte.md) |
| La relecture indépendante, ses constats et leur traitement | [`relecture.md`](relecture.md) |

## Écarts avec la SPEC

Les treize écarts du plan (`docs/superpowers/plans/2026-09-26-version-1-2-0-espace-participant.md`),
recopiés :

| # | SPEC | Constat | Ce que fait le plan |
| - | ---- | ------- | ------------------- |
| E1 | En-tête : dossier local `F:\ai5d-digital-design-system` | Le dépôt vit dans `C:\Users\ksthe\Documents\ai5d-design-system` | Tous les chemins du plan partent de ce dossier |
| E2 | §5.0.3 : « un composant qui acceptait l'ancien type étroit reste assignable au nouveau » | Sonde `tsc` (TypeScript 5.7, `@types/react` du dépôt) : un composant typé `{ href; 'aria-current'?: 'page' \| undefined; children }` **n'est plus assignable** : `aria-current` d'un `<a>` admet aussi `true`, `'step'`… Un composant typé `{ href; className?; children }` l'est. `Link` de Next l'est. Les trois produits passent `Link` tel quel (`NavigationRubriques.tsx:59`, `RailConsole.tsx:109` dans Compte ; `NavigationParticipant.tsx:21`, `NavigationConsole.tsx:14` dans le Portail) | Le journal et le guide de montée le disent ; un test `@ts-expect-error` le fixe (tâche 4) ; la montée de Compte le constate (tâche 16) |
| E3 | §5.12.1 : `DUREE_SUCCES_COPIE_MS` exporté par `ValeurCopiable.tsx` | Ce fichier est un module client. Leçon du dépôt : une constante importée d'un module client par un composant serveur vaut `undefined` sous Next, sans erreur | La constante vit dans `noyau/composants/copie.ts`, module pur ; l'index l'exporte de là (tâche 11) |
| E4 | §10 : la garde d'espacement nomme « le `1px` de `lien.ts` » | La garde lit les propriétés d'espacement : dans `STYLE_HORS_ECRAN`, c'est `margin: -1px` qu'elle voit, `width: 1px` n'en est pas une | L'exception s'écrit `'-1px'` (tâche 4) |
| E5 | §5.4.3 : trait d'attente « dessiné par `::after` » ; §10 ne nomme pas d'exception pour `OngletsRubrique` | Pour recouvrir la bordure basse de 2 px de l'onglet, le pseudo-élément se place à `bottom: -2px`, un espacement hors échelle | `'-2px'` s'ajoute aux exceptions nommées d'`OngletsRubrique.tsx`, avec son motif (tâche 6) |
| E6 | §10 : « exceptions du dépôt : `noyau/couleurs-navigateur.ts` ajouté » | `EXCEPTIONS_DU_DEPOT` sert aux gardes 1, 4, 5 et 6 : y ajouter le fichier le soustrairait aussi aux trois autres | Une liste `EXCEPTIONS_COULEURS` pour la seule garde 1 (tâche 3) |
| E7 | §5.7.2 : le commentaire renvoie à `tests/theme.test.ts` | Le fichier de tests du thème est `tests/composants/theme.test.tsx`, comme le dit §10 | Le commentaire renvoie à ce fichier |
| E8 | §6.2, §10 : « le HTML de `1.1.0` » pour `Bouton` sans `href` et `CoquilleRail` sans pied | Une affirmation n'est pas une preuve, et un littéral HTML recopié à la main serait faux au premier espace | `_build/figer-1.1.0.mjs` fige depuis l'étiquette `v1.1.0` les copies `tests/instantanes/Bouton-1.1.0.tsx` et `CoquilleRail-1.1.0.tsx` ; les tests comparent les deux rendus (tâches 2, 4, 7) |
| E9 | §5.1.4 : le résolveur vit dans `tests/densites.test.ts` | La non-régression en a besoin aussi | `tests/aides/densite.ts`, partagé (tâche 2) |
| E10 | §5.1.4 : la mesure relève « un bouton `sm`, `md`, `lg`, un champ » du spécimen | Le spécimen de `1.1.0` n'a ni tailles de bouton ni blocs de mesure : la mesure « avant » ne pourrait pas les lire | Le script injecte sa propre zone, sur les formules exactes des composants, avant comme après (tâche 1) |
| E11 | §13 : un guide de montée, sans fichier désigné | Le guide de migration de la `1.0.0` vit dans son entrée de `CHANGELOG.md` | Le guide de montée vit dans l'entrée `1.2.0` (tâche 14) |
| E12 | §11.1 : le spécimen reproduit le balisage | Pour les pièces nouvelles, une feuille recopiée à la main mentirait sur les états | Le générateur extrait les vraies feuilles `STYLE_…` des composants et les injecte (tâche 15) |
| E13 | §0.8.3 : prise en charge d'`animation-timeline` et `scroll-initial-target` « à constater au plan » | Sonde Playwright 1.57, `CSS.supports` et masque calculé sur une rangée de six onglets : **Chromium 143** les deux, fondu absent quand rien ne déborde (`none`), présent aux trois positions, rangée amenée sur l'onglet actif ; **WebKit 26.0** le fondu seul ; **Firefox 144** aucun des deux | Constat recopié dans la décision 007 et le journal ; refait sur le vrai spécimen à la tâche 16 |

Nés de l'exécution :

| # | Constat | Ce qui a été fait |
| - | ------- | ----------------- |
| X1 | **E2 était faux pour un produit réel** : sous `exactOptionalPropertyTypes`, le `Link` de Next n'était pas assignable au `ComposantLien` élargi (six erreurs de types dans Compte) | `ProprietesLienProduit` sans `onMouseEnter` ni `onTouchStart`, `onClick` resserré ; test qui recopie `Link` (`64a893a`) |
| X2 | `ValeurCopiable`, en colonne, laissait un vide de 180 px au doigt | `flex: 0 0 auto` en colonne, test (`c2f8c75`) |
| X3 | La page des spécimens débordait à 320 px et faussait les captures au doigt | En-tête et grille de la page bornés à la largeur (`c2f8c75`) |
| X4 | Au doigt, Chromium rend `--hauteur-controle` sous la forme `max(48px, 44px)`, sans évaluer `max()` | Comportement du navigateur ; la hauteur des éléments fait foi (`plancher-tactile.md`, Lecture) |
| X5 | Le plan commitait tout dans un seul commit de vérification | Les réparations sont commitées à part, pour que chaque preuve cite le commit qu'elle mesure |

## Ce qui n'est pas couvert

- **Safari**, faute d'appareil. WebKit de Playwright en donne une indication, pas une preuve.
- **Un téléphone réel.** Le doigt est une émulation de Chromium (`hasTouch`, `isMobile`), vérifiée par
  `matchMedia('(pointer: coarse)')` avant chaque mesure.
- **`scroll-initial-target` hors de Chromium, `animation-timeline` dans Firefox** : non pris en charge
  au jour de la vérification ; le repli est le rendu de la 1.1.0.
- **Le rendu dans un client de messagerie** : la recette `LOGOTYPE` n'y est pas employée par le système.
- **Le Portail** : il monte de la 1.0.1 à la 1.2.0 dans son sprint P09, pas dans ce lot. Il active lui
  aussi `exactOptionalPropertyTypes` : l'écart X1 le concernait autant que Compte.
- **Les trois invariants d'épinglage de Compte** ne peuvent passer qu'avec l'étiquette `v1.2.0`, qui
  n'est pas posée.
- **Les captures** ont été faites sur `c2f8c75` ; `64a893a` ne change que des types, un commentaire, le
  journal et l'index, sans effet sur le rendu. La mesure du plancher a été faite sur `2357d50`, dont
  `densites/profils.css` est identique.
- **La construction d'un produit** : aucun `build` n'a été lancé.
