# Version 1.2.0 · l'espace participant, et le plancher tactile réparé · Plan d'implémentation

> **Pour qui exécute ce plan :** sous-compétence requise, `superpowers:subagent-driven-development`
> (recommandée pour les tâches 2 à 15) ou `superpowers:executing-plans`. Les étapes sont en cases à
> cocher (`- [ ]`).
>
> **Cycle adapté, sur décision de Karamo (règles globales, « Le moment des tests »).** Ce plan ne suit
> **pas** le cycle « test rouge, test vert ». Chaque tâche écrit **le code et ses tests ensemble**, se
> coche « écrite, non testée » dans `tasks/todo.md`, et se commite. **Aucune suite de tests, aucun
> typecheck, aucun linter avant la tâche 16**, qui lance la vérification d'un seul bloc. Seules les
> commandes marquées « mesure » (navigateur) ou « génération » (instantanés, spécimens, formatage) se
> lancent en cours de lot. **Jamais de `build`** : le dépôt n'en a pas, et la règle vaut partout.

**Goal :** publier `@ai5d/design-system` `1.2.0` : le plancher tactile qui fonctionne enfin au doigt, et
ce que la V2 de l'espace participant du Portail demande au système (bouton en lien, ton neutre, onglets
reliés au routeur, deux pieds de coquille, sélecteur de thème au doigt, cinq composants, jetons de
mesure et de mouvement, couleurs du navigateur, recette du logotype), sans changer une valeur de jeton
ni casser un appel existant.

**Architecture :** le correctif sépare la **source** de chaque hauteur de densité de la **valeur** que
lisent les composants, et se prouve trois fois (forme, valeur effective par un résolveur, mesure
Chromium). Les liens partagent un module pur, `noyau/composants/lien.ts`, qui décide une fois quand le
lien du routeur n'est jamais employé et porte le protocole d'attente `data-en-attente`. Tout reste
rendable par un composant serveur, sauf `ValeurCopiable` et `SelecteurTheme`. La non-régression des
jetons s'exécute contre un instantané de `v1.1.0` versionné dans `tests/instantanes/`.

**Tech Stack :** TypeScript 5.7 strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) ·
React 19 · Vitest 2, Testing Library, jsdom 25 · ESLint 9 · Prettier 3 · pnpm 10.24 · Node 24 ·
Playwright 1.57 installé globalement sur le poste (mesures et captures, aucune dépendance ajoutée au
dépôt).

**Spec :**
[`docs/superpowers/specs/version-1.2.0-espace-participant/SPEC-Version-1.2.0-Espace-Participant.md`](../specs/version-1.2.0-espace-participant/SPEC-Version-1.2.0-Espace-Participant.md)
et
[`docs/superpowers/specs/version-1.2.0-espace-participant/USER-STORIES-Version-1.2.0-Espace-Participant.md`](../specs/version-1.2.0-espace-participant/USER-STORIES-Version-1.2.0-Espace-Participant.md).
Ce couple **est** la spécification ; ce plan n'en ajoute aucune. Il déclare au §« Écarts » ce que la
lecture du code a fait apparaître, avec son constat.

---

## Global Constraints

Chaque tâche les porte implicitement. Les valeurs sont recopiées de la SPEC.

| # | Contrainte | Source |
| - | ---------- | ------ |
| G1 | **Aucune valeur de jeton existante ne change.** `tests/non-regression.test.ts` le prouve contre `tests/instantanes/jetons-1.1.0.json` | SPEC §0.7, §6.2 |
| G2 | **Aucune propriété retirée, aucune variante renommée.** `TonSemantique` et `ComposantLien` s'élargissent, `ProprietesBouton` devient une union ; les appels constatés compilent tels quels | SPEC §0.7 |
| G3 | **Aucune dépendance ajoutée** au `package.json`, ni de production ni de développement. Les icônes nouvelles viennent de `lucide-react`, déjà en pair | SPEC §0.7 |
| G4 | **Aucun cadriciel.** Aucun fichier de `noyau/` ni de `gardes/` n'importe Next ; le lien du routeur arrive toujours en propriété | SPEC §0.7 |
| G5 | **`noyau/marque.css` et les six jetons de marque ne bougent pas** | SPEC §0.7 |
| G6 | **Aucun composant existant ne passe côté client.** `'use client'` : `SelecteurTheme` (déjà), `ValeurCopiable`. Tous les autres restent rendables par un composant serveur, `Bouton`, `Pastille`, `PastilleEtat`, `Bandeau`, `OngletsRubrique`, `CoquilleRail`, `TitreSection`, `LigneLien`, `ListeLignes`, `ListeDefinitions`, `Logotype` compris | SPEC §0.7, §5.0.6 |
| G7 | **Aucune couleur ni aucun espacement littéral dans un composant** (gardes 1 et 6). Couleurs littérales : `noyau/jetons.css`, `noyau/marque.css`, `noyau/ai5d.preset.css`, et la seule exception nominale ajoutée, `noyau/couleurs-navigateur.ts`. Espacements hors échelle : nommés fichier par fichier dans `HORS_ECHELLE` | SPEC §5.0.1, §5.7.2 |
| G8 | Échelle : `--espace-1` 4 px, `-2` 8 px, `-3` 12 px, `-4` 16 px, `-6` 24 px, `-8` 32 px, `-12` 48 px, `-16` 64 px. **Il n'existe pas de `--espace-5`.** Rayons : `--rayon-sm` 4 px, `--rayon-md` 10 px, `--rayon-plein`. Cible : `--cible-tactile` 44 px | SPEC §5.0.1 |
| G9 | **Feuilles injectées** : identifiant stable `ai5d-…`, toute classe préfixée `ai5d-`, couleurs et états dans la feuille, jamais en style en ligne. Quatre règles : (1) survol gardé par `@media (hover: hover)` et par `:not(:disabled)` ou `:not([aria-disabled='true'])` ; (2) focus `:focus-visible`, anneau 2 px `var(--action)`, décalé de 2 px (1 px sur un champ), rouge sur un contrôle de danger ; (3) appui immédiat : `:active` sans transition, relâchement en `var(--mouvement-retour)` ; (4) toute feuille qui déclare `@keyframes` contient `@media (prefers-reduced-motion: reduce)`, et le mouvement réduit supprime | SPEC §5.0.2 |
| G10 | **La prose ne vit jamais dans une chaîne `STYLE_…`** : un accent grave dans un gabarit littéral le termine. Les commentaires CSS d'une feuille injectée n'emploient ni accent grave ni `--nom:` | `OngletsRubrique.tsx`, en-tête de sa feuille |
| G11 | **Voix**, dans tout texte qu'une personne lit : vouvoiement, apostrophe typographique `’` dans les chaînes d'interface, aucun tiret cadratin, aucun emoji, aucun point d'exclamation ; un refus nomme qui peut lever le blocage. Tout texte cité entre guillemets s'affiche mot pour mot | SPEC §5.0.5 |
| G12 | **Dépôt public** : aucune donnée personnelle, aucune clé, aucune adresse réelle. Les exemples emploient les personnes fictives du PRD du Portail | SPEC §0 |
| G13 | **`exactOptionalPropertyTypes`** : toute propriété optionnelle s'écrit `?: T \| undefined` | `LiensRail.tsx`, convention du dépôt |
| G14 | **Tests écrits avec le code, vérification d'un bloc à la fin** : `CI=true pnpm typecheck && CI=true pnpm lint && CI=true pnpm format:check && CI=true pnpm test`. Aucun `build`, jamais | Règles de Karamo |
| G15 | **Commits** : un par tâche, en français, une phrase qui dit ce que le commit apporte ; aucun co-auteur, aucune mention d'outillage. Avant chaque commit, le message écrit dans `.git/message-1.2.0.txt` passe `grep -icE 'co-authored\|cl[a]ude\|assist[a]nt\|generat[e]d with' .git/message-1.2.0.txt`, qui doit afficher `0`. **Aucune poussée sans l'accord explicite de Karamo** | Règles de Karamo, SPEC §14 |
| G16 | **Aucune estimation en heures**, nulle part | Règles de Karamo |
| G17 | **Le `44px` du plancher reste littéral** dans `densites/profils.css` : le fichier s'importe seul (export `./densites/profils.css`) et `var(--cible-tactile)` y serait vide | SPEC §5.1.1 |
| G18 | **Scripts d'édition dans un fichier, jamais en ligne dans le shell** (leçon du dépôt). Un message de commit s'écrit par un document ici délimité par `'MESSAGE'`, qui ne transforme rien | `tasks/lessons.md` |
| G19 | **Les numéros de ligne cités sont ceux du fichier au début de la tâche.** Quand une tâche modifie un même fichier en plusieurs étapes, on se repère au texte cité, ou on applique ces étapes du bas du fichier vers le haut | Ce plan |

**Le geste de commit**, identique à chaque tâche (G15, G18) :

```bash
cat > .git/message-1.2.0.txt <<'MESSAGE'
{la phrase de la tâche, recopiée}
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt   # doit afficher 0
git commit -F .git/message-1.2.0.txt
```

Chaque tâche donne sa phrase exacte, à coller à la place de la ligne entre les deux `MESSAGE`.

---

## Review Focus

Cinq classes d'entrées que la SPEC implique sans les tester, et qui mordraient d'abord un produit ou
une personne. Chacune a son test dans la tâche qui possède le code.

1. **Un composant de lien du produit qui ne transmet pas tout ce qu'il reçoit, ou qui est typé sur
   l'ancienne forme étroite.** Un bouton en lien perdrait sa hauteur et sa variante. Attendu : le lien
   du produit reçoit `className`, `style`, `data-variante`, `data-taille` ; un composant typé
   `'aria-current'?: 'page'` ne compile plus, et c'est écrit. Tests : tâche 4 (lien espion, et
   `@ts-expect-error` sur le type étroit).
2. **Un lien désactivé ou en chargement qui reçoit un `onClick` du produit.** Un `<a>` sans adresse
   reçoit encore les clics. Attendu : rien ne se déclenche, comme sur un `<button disabled>`. Test :
   tâche 4.
3. **`ValeurCopiable` avec `mono={false}`.** Une surcharge de style mal écrite remplacerait la police
   Inter du champ par celle du navigateur. Attendu : le champ garde `var(--police-corps)`. Test :
   tâche 11.
4. **`ListeLignes` avec des enfants conditionnels** (`null`, `false`). Un `<li>` vide dessinerait un
   filet orphelin. Attendu : un `<li>` par enfant rendu, aucun autre. Test : tâche 10.
5. **Une feuille dont un commentaire cite la forme fautive, ou dont la déclaration fautive porte une
   valeur de repli** (`--x: var(--x, 4px)`). Attendu : la garde ignore le commentaire, relève le repli,
   et rapporte la vraie ligne. Tests : tâche 2.

Couverts aussi, sans figurer dans les cinq : `rel` fourni en casse mixte (aucun doublon, tâche 4),
`download={false}` (lien du routeur employé, tâche 4), un `actif` inconnu avec six onglets (tâche 6),
un pied compact en mode `bureau-seulement` (tâche 7).

---

## Écarts de ce plan à la SPEC, constatés en machine le 26 septembre 2026

La SPEC est une hypothèse (règles de Karamo). Voici ce que la lecture du code et trois sondes ont
montré, et ce que le plan en fait. Chaque écart se recopie dans `docs/preuves/1.2.0/README.md` à la
tâche 16.

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

---

## Les points ouverts du §0.8, et ce que le plan en fait

1. **Classement de la version.** Le plan prépare une **mineure, `1.2.0`**, comme la SPEC le propose.
   **Karamo tranche** à la tâche 18, captures en main. S'il la juge majeure, la tâche 18 dit les six
   gestes qui publient `2.0.0` sans rien changer d'autre.
2. **La sélection en bleu d'action.** Livrée, capturée sur les trois surfaces en clair et en sombre
   (tâche 16). **Karamo la valide ou la retire** à la tâche 18, qui dit les gestes du retrait.
3. **`animation-timeline` et `scroll-initial-target`.** **Tranché par constat** (E13) : pris en charge
   par Chromium, en partie par WebKit, pas par Firefox ; le repli est le rendu de `1.1.0`, écrit dans la
   décision 007. Constat refait à la tâche 16 sur le vrai spécimen.
4. **Safari.** WebKit de Playwright n'est pas Safari. Sans appareil, Safari reste une ligne « non
   couvert » du rapport ; Karamo dit à la tâche 18 s'il dispose d'un appareil.
5. **L'étiquette `v1.2.0`.** Posée et poussée **seulement sur l'accord explicite de Karamo**, tâche 18.
   Le plan ne l'exécute pas sans lui.

---

## Structure des fichiers

| Fichier | Responsabilité | Tâche |
| ------- | -------------- | ----- |
| `densites/profils.css` | Sources par profil, valeur calculée une fois, plancher sur la source | 2 |
| `gardes/index.ts` | `declarationsAutoReferentes`, `verifierPlancherTactile` réécrite | 2 |
| `_build/figer-1.1.0.mjs` | Fige depuis l'étiquette `v1.1.0` les feuilles et deux composants | 2 |
| `tests/instantanes/` | `jetons-1.1.0.json`, `profils-1.1.0.css`, `Bouton-1.1.0.tsx`, `CoquilleRail-1.1.0.tsx` | 2 |
| `tests/aides/densite.ts` | Le résolveur des valeurs effectives de densité | 2 |
| `tests/cycles.test.ts` | Aucune propriété ne se lit elle-même ; toute feuille animée respecte le mouvement réduit | 2 |
| `noyau/jetons.css` | `--mesure-texte`, `--mouvement-*`, règle de la durée longue, `caret-color`, `::selection` | 3 |
| `noyau/couleurs-navigateur.ts` | `COULEURS_NAVIGATEUR`, les deux couleurs de `<meta name="theme-color">` | 3 |
| `noyau/theme.ts` | Réexporte `COULEURS_NAVIGATEUR` | 3 |
| `tests/non-regression.test.ts` | Aucune valeur de `1.1.0` ne change | 3 |
| `noyau/composants/lien.ts` | Lien natif ou lien du routeur, `rel`, mention du nouvel onglet, texte hors écran, attribut d'attente | 4 |
| `noyau/composants/LiensRail.tsx` | `ComposantLien` élargi | 4 |
| `noyau/composants/Bouton.tsx` | `Bouton` rendu en lien ; survol gardé | 4 |
| `noyau/composants/Pastille.tsx`, `Bandeau.tsx` | Ton `neutre` | 5 |
| `noyau/composants/OngletsRubrique.tsx` | Lien du produit, six onglets, fondu, onglet initial, appui, attente | 6 |
| `noyau/composants/CoquilleRail.tsx` | `piedContenu`, `piedCompact` | 7 |
| `noyau/composants/SelecteurTheme.tsx` | 44 px au doigt, `libellesVisibles` | 8 |
| `noyau/composants/TitreSection.tsx`, `ListeDefinitions.tsx` | Composants nouveaux, sans état | 9 |
| `noyau/composants/LigneLien.tsx`, `ListeLignes.tsx` | Composants nouveaux, sans état | 10 |
| `noyau/composants/copie.ts`, `ValeurCopiable.tsx` | Constante pure ; composant client | 11 |
| `noyau/logotype.ts`, `noyau/composants/Logotype.tsx`, `package.json` | Recette `LOGOTYPE`, lue par le composant, export `./logotype` | 12 |
| `noyau/composants/index.ts` | Cinq composants, leurs types, les constantes | 13 |
| `CHANGELOG.md`, `README.md`, `noyau/NOYAU.md`, `noyau/formulations.md`, `package.json` | Documents et version | 14 |
| `docs/decisions/005` à `009` | Les arbitrages | 2, 3, 6, 12, 14 |
| `_build/generer-specimens.mjs`, `specimens/composants.html` | La preuve visuelle | 15 |
| `docs/preuves/1.2.0/` | Mesures, captures, sondes, vérification, montée de Compte | 1, 16 |

---

## Ordre des tâches

```
T1   suivi · mesure « avant »                          (aucun code du produit)
T2   plancher tactile sans cycle                       ← premier code, la SPEC le met en tête
T3   jetons, feuille, couleurs du navigateur
T4   lien.ts · ComposantLien · Bouton en lien          ← T6, T10, T11 en dépendent
T5   ton neutre
T6   OngletsRubrique
T7   CoquilleRail
T8   SelecteurTheme
T9   TitreSection · ListeDefinitions
T10  LigneLien · ListeLignes
T11  ValeurCopiable                                    ← consomme Bouton (T4)
T12  logotype
T13  index                                             ← après tous les composants
T14  documents · version · décision 009
T15  spécimens                                         ← après les feuilles définitives
T16  VÉRIFICATION D'UN BLOC · preuves
T17  relecture contre la SPEC
T18  publication, sur accord de Karamo
```

---

### Task 1 : Le suivi du lot, et la mesure « avant » du plancher tactile

Aucun code du produit. Cette tâche pose la section du lot dans `tasks/todo.md`, en tête de
l'exécution, puis mesure le défaut dans Chromium **avant** toute correction (SPEC §4, étape 0).

**Files:**
- Modify: `tasks/todo.md` (ajout d'une section en fin de fichier)
- Create: `docs/preuves/1.2.0/mesure-plancher.cjs`
- Create: `docs/preuves/1.2.0/plancher-tactile.md`

**Interfaces:**
- Consumes : `specimens/composants.html` tel qu'il est en `1.1.0` (il importe les vraies feuilles par
  `@import '../noyau/ai5d.preset.css'`) ; Playwright global (`npm root -g`).
- Produces : `docs/preuves/1.2.0/mesure-plancher.cjs`, relancé tel quel à la tâche 16 avec
  l'argument `apres`. Sortie : une ligne JSON par profil et par contexte, clés `profil`,
  `--hauteur-controle`, `--ligne-liste`, `bouton-sm`, `bouton-md`, `bouton-lg`, `champ`,
  `squelette-controle`, `ligne-de-liste`.

- [ ] **Step 1 : ajouter la section du lot à `tasks/todo.md`**

Ajouter en fin de fichier :

```markdown
## Version 1.2.0 · l'espace participant, et le plancher tactile réparé · 26 septembre 2026

SPEC et user stories : `docs/superpowers/specs/version-1.2.0-espace-participant/`. Plan :
`docs/superpowers/plans/2026-09-26-version-1-2-0-espace-participant.md`. Chaque tâche se coche
« écrite, non testée » ; la tâche 16 vérifie tout d'un bloc.

- [ ] T1 · Le suivi, la mesure « avant » du plancher tactile
- [ ] T2 · Le plancher tactile sans cycle : feuille, garde, résolveur, instantanés de 1.1.0, décision 005
- [ ] T3 · Mesure, mouvement, durée longue, sélection, curseur, `COULEURS_NAVIGATEUR`, non-régression, décision 006
- [ ] T4 · `lien.ts`, `ComposantLien` élargi, `Bouton` rendu en lien
- [ ] T5 · Le ton `neutre`
- [ ] T6 · `OngletsRubrique` : lien du produit, six onglets, fondu, attente, décision 007
- [ ] T7 · `CoquilleRail` : pied de contenu et pied compact
- [ ] T8 · `SelecteurTheme` : 44 px au doigt, libellés visibles
- [ ] T9 · `TitreSection` et `ListeDefinitions`
- [ ] T10 · `LigneLien` et `ListeLignes`
- [ ] T11 · `ValeurCopiable`
- [ ] T12 · La recette `LOGOTYPE` et l'export `./logotype`, décision 008
- [ ] T13 · L'index
- [ ] T14 · Journal, guide de montée, README, NOYAU, formulations, version, décision 009
- [ ] T15 · Les spécimens
- [ ] T16 · Vérification d'un bloc, gardes vues échouer, mesure « après », captures, navigateurs, montée de Compte, preuves
- [ ] T17 · Relecture du lot contre la SPEC
- [ ] T18 · Points du §0.8 tranchés par Karamo, accord explicite, étiquette `v1.2.0` et poussée
```

- [ ] **Step 2 : écrire le script de mesure `docs/preuves/1.2.0/mesure-plancher.cjs`**

```js
/**
 * La mesure du plancher tactile dans un vrai moteur (SPEC 1.2.0, §5.1.4, troisieme preuve).
 *
 * jsdom ne calcule aucune propriete personnalisee : c est ce qui a laisse vivre le defaut de la 0.1.0
 * a la 1.1.0. Ce script ouvre le specimen du depot, qui importe les vraies feuilles par le prereglage,
 * dans deux contextes (souris a 1280 px, doigt a 390 px), verifie d abord que `pointer: coarse` vaut
 * ce qu il doit, puis releve pour chaque profil les deux proprietes calculees et la hauteur de six
 * elements construits sur les formules exactes des composants :
 *
 *   bouton-sm, -md, -lg   Bouton.tsx, HAUTEURS, et min-height: var(--cible-tactile)
 *   champ                 Champ.tsx, styleEntree
 *   squelette-controle    Squelette.tsx, SqueletteFormulaire, hauteur var(--hauteur-controle)
 *   ligne-de-liste        min-height: var(--ligne-liste), la hauteur de LigneLien
 *
 * La zone de mesure est injectee par le script, et non lue dans le specimen : celui de la 1.1.0 n a
 * ni tailles de bouton ni blocs de mesure, et la mesure « avant » doit etre la meme que la mesure
 * « apres ».
 *
 * Il n ajoute aucune dependance au depot : il emploie le Playwright installe sur le poste.
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/mesure-plancher.cjs avant
 */
const { chromium } = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const MOMENT = process.argv[2] ?? 'sans-nom';
const PAGE = pathToFileURL(resolve('specimens/composants.html')).href;
const PROFILS = ['aere', 'equilibre', 'modere', 'compact'];

const CONTEXTES = [
  { nom: 'souris', grossier: false, options: { viewport: { width: 1280, height: 800 } } },
  {
    nom: 'doigt',
    grossier: true,
    options: {
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 3,
    },
  },
];

const ZONE = [
  ['bouton-sm', 'height: calc(var(--hauteur-controle) - 8px); min-height: var(--cible-tactile)'],
  ['bouton-md', 'height: var(--hauteur-controle); min-height: var(--cible-tactile)'],
  ['bouton-lg', 'height: calc(var(--hauteur-controle) + 8px); min-height: var(--cible-tactile)'],
  ['champ', 'height: var(--hauteur-controle); min-height: var(--cible-tactile)'],
  ['squelette-controle', 'height: var(--hauteur-controle)'],
  ['ligne-de-liste', 'min-height: var(--ligne-liste)'],
];

async function mesurer(page) {
  return page.evaluate(
    ({ profils, zone }) => {
      const conteneur = document.createElement('div');
      conteneur.id = 'zone-de-mesure';
      conteneur.innerHTML = zone
        .map(
          ([cle, style]) =>
            `<div data-mesure="${cle}" style="display: flex; align-items: center; box-sizing: border-box; ${style}">${cle}</div>`,
        )
        .join('');
      document.body.prepend(conteneur);

      const racine = document.documentElement;
      const lignes = [];
      for (const profil of profils) {
        racine.setAttribute('data-densite', profil);
        const calcule = getComputedStyle(racine);
        const ligne = {
          profil,
          '--hauteur-controle': JSON.stringify(calcule.getPropertyValue('--hauteur-controle').trim()),
          '--ligne-liste': JSON.stringify(calcule.getPropertyValue('--ligne-liste').trim()),
        };
        for (const [cle] of zone) {
          const element = document.querySelector(`[data-mesure="${cle}"]`);
          ligne[cle] = Math.round(element.getBoundingClientRect().height * 100) / 100;
        }
        lignes.push(ligne);
      }

      conteneur.remove();
      racine.removeAttribute('data-densite');
      return lignes;
    },
    { profils: PROFILS, zone: ZONE },
  );
}

(async () => {
  const navigateur = await chromium.launch();
  console.log(`Mesure du plancher tactile · ${MOMENT} · Chromium ${navigateur.version()}`);
  console.log(`Page : ${PAGE}`);

  for (const contexte of CONTEXTES) {
    const ctx = await navigateur.newContext(contexte.options);
    const page = await ctx.newPage();
    await page.goto(PAGE, { waitUntil: 'load' });
    const grossier = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
    console.log(
      `\n== ${contexte.nom} · ${contexte.options.viewport.width} px · matchMedia('(pointer: coarse)').matches = ${grossier}`,
    );
    if (grossier !== contexte.grossier) {
      console.error(`ECHEC : pointer: coarse vaut ${grossier}, attendu ${contexte.grossier}.`);
      process.exitCode = 1;
      await ctx.close();
      continue;
    }
    for (const ligne of await mesurer(page)) console.log(JSON.stringify(ligne));
    await ctx.close();
  }

  await navigateur.close();
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
```

- [ ] **Step 3 : écrire l'en-tête de `docs/preuves/1.2.0/plancher-tactile.md`**

```markdown
# Le plancher tactile, mesuré dans Chromium

SPEC 1.2.0, §5.1.4, troisième preuve. jsdom ne calcule aucune propriété personnalisée : cette mesure
est la seule qui voit la hauteur qu'une personne touche. Le script est
[`mesure-plancher.cjs`](mesure-plancher.cjs). Il ouvre le spécimen du dépôt, qui importe les vraies
feuilles par le préréglage, et reproduit les formules de hauteur de `Bouton` (`sm`, `md`, `lg`), de
`Champ`, de `SqueletteFormulaire`, et une ligne de `min-height: var(--ligne-liste)`.

Attendu après correctif (SPEC §5.1.2), au doigt, en `equilibre` : `--hauteur-controle` à `"48px"`,
`--ligne-liste` à `"56px"`, bouton `sm` 44, `md` 48, `lg` 56, champ 48, squelette 48, ligne 56 ; en
`compact`, `"44px"` et `"44px"`.
```

- [ ] **Step 4 (mesure) : lancer la mesure « avant » et en recopier la sortie brute**

Depuis la racine du dépôt, **avant** toute modification de `densites/profils.css`. Si Playwright
manque au poste, s'arrêter et le dire à Karamo : rien ne s'installe dans le dépôt.

````bash
{
  echo
  echo '## Avant le correctif · 1.1.0'
  echo
  echo "Commit \`$(git rev-parse --short HEAD)\`, $(date '+%d/%m/%Y %H:%M'). Commande :"
  echo "\`NODE_PATH=\"\$(npm root -g)\" node docs/preuves/1.2.0/mesure-plancher.cjs avant\`"
  echo
  echo '```'
  NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/mesure-plancher.cjs avant 2>&1
  echo '```'
} >> docs/preuves/1.2.0/plancher-tactile.md
````

Attendu, à lire dans le fichier : `souris` avec `matches = false` et `"48px"`, `"56px"` en `equilibre` ;
`doigt` avec `matches = true`, et `""` pour les deux propriétés dans les quatre profils (valeur
invalide au calcul), boutons à 44 px quelle que soit leur taille. Si le contexte `doigt` rend
`matches = false`, la mesure ne vaut rien : s'arrêter et le dire.

- [ ] **Step 5 : cocher et commiter**

Dans `tasks/todo.md`, remplacer `- [ ] T1 · Le suivi, la mesure « avant » du plancher tactile` par
`- [x] T1 · Le suivi, la mesure « avant » du plancher tactile · fait`.

```bash
git add tasks/todo.md docs/preuves/1.2.0/mesure-plancher.cjs docs/preuves/1.2.0/plancher-tactile.md docs/superpowers/plans/2026-09-26-version-1-2-0-espace-participant.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Le suivi de la version 1.2.0, son plan, et la mesure du plancher tactile avant correctif
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 2 : Le plancher tactile sans cycle

Le premier code du lot (SPEC §4, étape 1 ; §5.1). Chaque profil déclare la **source** de ses deux
hauteurs ; la valeur lue est calculée une fois ; le plancher relève la source. Le test et la garde qui
exigeaient la forme fautive la refusent désormais. Cette tâche fige aussi `1.1.0` pour les preuves des
tâches 3, 4 et 7.

**Files:**
- Modify: `densites/profils.css` (réécrit en entier)
- Modify: `gardes/index.ts:157-195` (du commentaire de `PLANCHER_TACTILE` à la fin de `verifierPlancherTactile`)
- Modify: `gardes/gardes.test.ts:131-161` (le bloc `garde 3`)
- Create: `_build/figer-1.1.0.mjs`
- Create (génération) : `tests/instantanes/jetons-1.1.0.json`, `tests/instantanes/profils-1.1.0.css`, `tests/instantanes/Bouton-1.1.0.tsx`, `tests/instantanes/CoquilleRail-1.1.0.tsx`
- Create: `tests/aides/densite.ts`
- Modify: `tests/densites.test.ts` (réécrit en entier)
- Create: `tests/cycles.test.ts`
- Modify: `densites/DENSITES.md:38-75`
- Modify: `noyau/PALIERS.md:96-99`
- Create: `docs/decisions/005-le-plancher-tactile-sans-cycle.md`
- Modify: `tasks/lessons.md` (section ajoutée en fin de fichier)

**Interfaces:**
- Consumes : `decouperBlocs(css: string): BlocCss[]` et `lireJetons(...)` de `outils/jetons.ts`
  (inchangés) ; l'étiquette Git `v1.1.0`.
- Produces :
  - `gardes/index.ts` : `export interface DeclarationAutoReferente { propriete: string; ligne: number; extrait: string }`
    et `export function declarationsAutoReferentes(css: string): DeclarationAutoReferente[]` ;
    `verifierPlancherTactile(cheminProfils: string): Infraction[]` (même signature, nouvelles règles).
  - `tests/aides/densite.ts` : `PROFILS` (`readonly ['aere', 'equilibre', 'modere', 'compact']`),
    `type Profil`, `type Pointeur = 'souris' | 'doigt'`, `INVALIDE = 'invalide'`,
    `valeursEffectives(blocs: BlocCss[], profil: Profil | null, pointeur: Pointeur): Map<string, string>`.
  - `tests/instantanes/jetons-1.1.0.json` : `{ etiquette: 'v1.1.0', fichiers: Record<chemin, Array<{ chemin: string[]; selecteur: string; declarations: Record<string, string> }>> }`
    pour `noyau/marque.css`, `noyau/jetons.css`, `noyau/paliers.css`, `densites/profils.css`.
  - `tests/instantanes/Bouton-1.1.0.tsx` (exporte `Bouton`) et `CoquilleRail-1.1.0.tsx` (exporte
    `CoquilleRail`) : copies exactes de `v1.1.0`, imports relatifs réécrits.

- [ ] **Step 1 : réécrire `densites/profils.css`**

```css
/* =========================================================================
   AI5D Digital Design System - profils de densite

   Meme ADN partout : palette, typographies, composants, iconographie, bordures,
   langage graphique. Seule varie la densite fonctionnelle.

     Academie  AERE       lecture, apprentissage, respiration
     Compte    EQUILIBRE  gestion, securite, parametres
     Cercle    MODERE     communaute, interactions, flux
     Lab       COMPACT    donnees, workflows, outils, experimentation

   Deux regles, et elles ne se negocient pas.

   1. La densite change l'espace entre les choses, JAMAIS la taille du texte.
      Ce fichier ne contient donc ni couleur, ni famille, ni taille de police.
      Sans cette regle, le profil compact devient illisible en six mois : c'est
      la pente naturelle de tout profil dense.

   2. Le plancher tactile de 44 px prime sur les quatre profils. Il est exprime
      une fois, en bas de ce fichier, sous forme de requete media, et il releve
      la SOURCE de chaque hauteur, jamais la valeur qu'il ecrit (decision 005).

   Un produit pose data-densite sur son element racine, une fois. C'est toute
   son adoption.
   ========================================================================= */

:root,
[data-densite='aere'] {
  --rythme-section: 64px;
  --padding-carte: 32px;
  --hauteur-controle-profil: 48px;
  --ligne-liste-profil: 64px;
  --interligne-corps: 1.6;
  --contenu-max: 1120px;
}

[data-densite='equilibre'] {
  --rythme-section: 48px;
  --padding-carte: 24px;
  --hauteur-controle-profil: 48px;
  --ligne-liste-profil: 56px;
  --interligne-corps: 1.55;
  --contenu-max: 1120px;
}

[data-densite='modere'] {
  --rythme-section: 40px;
  --padding-carte: 20px;
  --hauteur-controle-profil: 44px;
  --ligne-liste-profil: 48px;
  --interligne-corps: 1.5;
  --contenu-max: 1280px;
}

[data-densite='compact'] {
  --rythme-section: 32px;
  --padding-carte: 16px;
  --hauteur-controle-profil: 40px;
  --ligne-liste-profil: 40px;
  --interligne-corps: 1.45;
  --contenu-max: 100%;
}

/* =========================================================================
   La valeur que lisent les composants.

   Chaque profil declare la SOURCE de ses deux hauteurs. La hauteur de controle
   et la ligne de liste que lisent les composants se calculent ici, une fois,
   sur tout element qui porte un profil : un profil pose sur un bloc interieur
   recalcule donc les siennes. Un profil ajoute plus tard se declare AU-DESSUS
   de ce bloc.
   ========================================================================= */

:root,
[data-densite] {
  --hauteur-controle: var(--hauteur-controle-profil);
  --ligne-liste: var(--ligne-liste-profil);
}

/* =========================================================================
   Le plancher tactile.

   Le profil compact descend a 40 px sur un ecran de bureau avec une souris.
   Jamais sur un telephone : une cible de 40 px y produit des erreurs de saisie
   que l'utilisateur attribue a l'application, jamais a son doigt.

   La regle vaut pour les quatre profils, y compris ceux qui sont deja au-dessus
   du plancher : ecrite ainsi, elle survit a l'ajout d'un cinquieme profil que
   personne n'aura pense a verifier.

   ELLE LIT LA SOURCE, JAMAIS LA PROPRIETE QU'ELLE ECRIT. Jusqu'a la 1.1.0, ce
   bloc relevait chaque hauteur en la lisant elle-meme. Pour le navigateur, une
   propriete personnalisee qui depend d'elle-meme est invalide au moment du
   calcul : elle ne valait ni l'ancienne valeur ni 44 px, elle ne valait rien,
   et la hauteur tombait a celle du contenu. Mesure dans Chromium le 26 septembre
   2026 : sur tout ecran tactile, chaque bouton valait 44 px quelle que soit sa
   taille, et le squelette d'un champ 21 px. Le test et la garde exigeaient cette
   forme. Decision 005.

   Le 44 px reste ecrit en clair : ce fichier s'importe seul, et la cible tactile
   de jetons.css n'y serait pas definie.
   ========================================================================= */

@media (pointer: coarse) {
  :root,
  [data-densite] {
    --hauteur-controle: max(var(--hauteur-controle-profil), 44px);
    --ligne-liste: max(var(--ligne-liste-profil), 44px);
  }
}
```

Les commentaires n'écrivent aucun `--nom:` (le test des propriétés déclarées lit le texte brut), ni
« font-size », ni `--taille-`, ni `--police-`, ni croisillon (règle 1 de `tests/densites.test.ts`).

- [ ] **Step 2 : réécrire la garde du plancher dans `gardes/index.ts`**

Remplacer les lignes 157 à 195 (de `/** Le plancher tactile, en pixels…` à la fin de
`verifierPlancherTactile`) par :

```ts
/** Le plancher tactile, en pixels. Il ne dépend d'aucun profil de densité. */
export const PLANCHER_TACTILE = 44;

/** Une déclaration qui lit sa propre propriété, avec sa ligne. */
export interface DeclarationAutoReferente {
  /** La propriété personnalisée, `--hauteur-controle` par exemple. */
  propriete: string;
  /** Numéro de ligne dans la feuille, à partir de 1. */
  ligne: number;
  /** La ligne de la déclaration, élaguée. */
  extrait: string;
}

/**
 * Les déclarations `--x: …var(--x)…` d'une feuille, valeur de repli comprise.
 *
 * Pour le navigateur, une propriété personnalisée qui dépend d'elle-même est invalide au moment du
 * calcul : elle ne vaut ni l'ancienne valeur ni celle qu'on voulait lui donner, elle ne vaut rien.
 * C'est le défaut que le plancher tactile a porté de la 0.1.0 à la 1.1.0, protégé par un test et par
 * cette même garde, qui exigeaient la forme fautive.
 *
 * Les commentaires sont vidés avant la lecture, sans perdre une ligne : un commentaire a le droit de
 * citer la forme fautive, et le numéro rapporté doit rester celui du fichier.
 */
export function declarationsAutoReferentes(css: string): DeclarationAutoReferente[] {
  const sansCommentaires = css.replace(/\/\*[\s\S]*?\*\//g, (commentaire) =>
    commentaire.replace(/[^\n]/g, ' '),
  );

  const trouvees: DeclarationAutoReferente[] = [];
  sansCommentaires.split('\n').forEach((ligne, index) => {
    for (const correspondance of ligne.matchAll(/(--[a-zA-Z0-9-]+)\s*:([^;{}]*)/g)) {
      const propriete = correspondance[1] ?? '';
      const valeur = correspondance[2] ?? '';
      if (new RegExp(`var\\(\\s*${propriete}\\s*[,)]`).test(valeur)) {
        trouvees.push({ propriete, ligne: index + 1, extrait: ligne.trim().slice(0, 120) });
      }
    }
  });
  return trouvees;
}

/**
 * Garde 3 — le plancher tactile est bien posé, et il vaut quelque chose.
 *
 * Elle n'inspecte pas des écrans rendus, ce qu'un test statique ne peut pas faire. Elle vérifie trois
 * choses dans le fichier de densités : la requête `(pointer: coarse)` existe ; elle relève la SOURCE de
 * chaque hauteur, `max(var(--hauteur-controle-profil), 44px)` et
 * `max(var(--ligne-liste-profil), 44px)` ; et aucune déclaration de la feuille ne se lit elle-même.
 *
 * Jusqu'à la 1.1.0, elle exigeait la forme `max(var(--hauteur-controle), 44px)`, invalide au calcul :
 * un produit qui aurait corrigé la feuille chez lui aurait fait échouer sa propre intégration
 * continue. Décision 005. La ligne rapportée est la vraie ligne : celle de la déclaration fautive, ou
 * celle de la requête quand une source y manque.
 */
export function verifierPlancherTactile(cheminProfils: string): Infraction[] {
  const css = readFileSync(cheminProfils, 'utf8');
  const regle = 'cible-tactile-minimale';

  const infractions: Infraction[] = declarationsAutoReferentes(css).map(({ propriete, ligne }) => ({
    fichier: cheminProfils,
    ligne,
    extrait: `${propriete} se lit elle-meme : la valeur est invalide au calcul, et la hauteur tombe a celle du contenu`,
    regle,
  }));

  const debut = css.indexOf('@media (pointer: coarse)');
  if (debut === -1) {
    infractions.push({
      fichier: cheminProfils,
      ligne: 1,
      extrait: 'requete @media (pointer: coarse) absente',
      regle,
    });
    return infractions;
  }

  const ligneRequete = css.slice(0, debut).split('\n').length;
  const bloc = /@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
  for (const variable of ['--hauteur-controle', '--ligne-liste']) {
    if (!bloc.includes(`max(var(${variable}-profil), ${PLANCHER_TACTILE}px)`)) {
      infractions.push({
        fichier: cheminProfils,
        ligne: ligneRequete,
        extrait: `${variable} n'est pas releve a ${PLANCHER_TACTILE}px sur pointeur grossier`,
        regle,
      });
    }
  }

  return infractions;
}
```

- [ ] **Step 3 : écrire `_build/figer-1.1.0.mjs`**

```js
/**
 * Fige la 1.1.0, une fois, pour les preuves de la 1.2.0.
 *
 * Un changement de valeur de jeton est majeur (CHANGELOG, en tete), et la 1.2.0 se dit mineure : la
 * preuve doit s executer, pas s affirmer. Ce script lit les fichiers de l etiquette v1.1.0 par Git et
 * ecrit dans tests/instantanes/ :
 *
 *   jetons-1.1.0.json       chaque bloc des quatre feuilles, avec ses declarations
 *   profils-1.1.0.css       la feuille de densites fautive, temoin du test et de la garde
 *   Bouton-1.1.0.tsx        le bouton de la 1.1.0, pour comparer le HTML sans adresse
 *   CoquilleRail-1.1.0.tsx  la coquille de la 1.1.0, pour comparer le HTML sans pied
 *
 * Les tests ne lisent jamais Git : l integration continue clone sans etiquettes. Ils lisent ces
 * fichiers, versionnes. Node 24 retire les types de outils/jetons.ts a l import.
 *
 *   node _build/figer-1.1.0.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { decouperBlocs } from '../outils/jetons.ts';

const ETIQUETTE = 'v1.1.0';
const DOSSIER = 'tests/instantanes';
const FEUILLES = [
  'noyau/marque.css',
  'noyau/jetons.css',
  'noyau/paliers.css',
  'densites/profils.css',
];

function lire(chemin) {
  return execFileSync('git', ['show', `${ETIQUETTE}:${chemin}`], { encoding: 'utf8' });
}

const fichiers = {};
for (const chemin of FEUILLES) {
  fichiers[chemin] = decouperBlocs(lire(chemin))
    .filter((bloc) => bloc.declarations.size > 0)
    .map((bloc) => ({
      chemin: bloc.chemin,
      selecteur: bloc.selecteur,
      declarations: Object.fromEntries(bloc.declarations),
    }));
}

mkdirSync(DOSSIER, { recursive: true });
writeFileSync(
  `${DOSSIER}/jetons-1.1.0.json`,
  `${JSON.stringify({ etiquette: ETIQUETTE, fichiers }, null, 2)}\n`,
);
writeFileSync(`${DOSSIER}/profils-1.1.0.css`, lire('densites/profils.css'));
writeFileSync(`${DOSSIER}/Bouton-1.1.0.tsx`, lire('noyau/composants/Bouton.tsx'));
writeFileSync(
  `${DOSSIER}/CoquilleRail-1.1.0.tsx`,
  lire('noyau/composants/CoquilleRail.tsx')
    .replaceAll("from './", "from '../../noyau/composants/")
    .replace("from '../paliers'", "from '../../noyau/paliers'"),
);

console.log(`${ETIQUETTE} figee dans ${DOSSIER} : 4 feuilles, 2 composants.`);
```

- [ ] **Step 4 (génération) : figer `1.1.0`, puis formater ce qui vient d'être écrit**

```bash
node _build/figer-1.1.0.mjs
pnpm exec prettier --write _build/figer-1.1.0.mjs tests/instantanes
```

Attendu : `v1.1.0 figee dans tests/instantanes : 4 feuilles, 2 composants.` Puis vérifier à l'œil que
`tests/instantanes/profils-1.1.0.css` porte, lignes 79 et 80, `max(var(--hauteur-controle), 44px)` et
`max(var(--ligne-liste), 44px)`, et la requête ligne 76 :

```bash
grep -n "pointer: coarse\|max(var" tests/instantanes/profils-1.1.0.css
```

Attendu : `76:@media (pointer: coarse) {`, `79:    --hauteur-controle: …`, `80:    --ligne-liste: …`.

- [ ] **Step 5 : écrire le résolveur `tests/aides/densite.ts`**

```ts
/**
 * Le calcul, hors navigateur, des valeurs de densité que reçoit la racine d'un document.
 *
 * jsdom ne calcule aucune propriété personnalisée : c'est ce qui a laissé vivre le défaut du plancher
 * tactile de la 0.1.0 à la 1.1.0 (décision 005). Ce résolveur fait, en quelques lignes, ce que fait le
 * navigateur pour `<html data-densite="…">` : appliquer dans l'ordre du fichier les blocs qui visent
 * cet élément, le bloc `(pointer: coarse)` compris au doigt, substituer les `var()`, évaluer `max()` en
 * pixels, et déclarer invalide toute propriété prise dans un cycle.
 *
 * Il ne remplace pas la mesure dans Chromium (`docs/preuves/1.2.0/plancher-tactile.md`) : il la rend
 * rejouable à chaque exécution.
 *
 * Les sélecteurs de la feuille ont tous la même spécificité pour la racine (`:root` et un attribut
 * valent un pseudo-classe ou un attribut chacun) : l'ordre du fichier décide, comme ici.
 */
import type { BlocCss } from '../../outils/jetons';

export const PROFILS = ['aere', 'equilibre', 'modere', 'compact'] as const;
export type Profil = (typeof PROFILS)[number];
export type Pointeur = 'souris' | 'doigt';

/** La valeur d'une propriété invalide au calcul, celle que le navigateur rend vide. */
export const INVALIDE = 'invalide';

const REQUETE_TACTILE = '@media (pointer: coarse)';

/** Vrai quand le bloc s'applique à la racine qui porte `profil`, ou aucun profil. */
function viseLaRacine(bloc: BlocCss, profil: Profil | null, pointeur: Pointeur): boolean {
  if (bloc.chemin.length > 1) return false;
  const regle = bloc.chemin[0];
  if (regle !== undefined && !(regle === REQUETE_TACTILE && pointeur === 'doigt')) return false;

  return bloc.selecteur
    .split(',')
    .map((partie) => partie.replace(/\s+/g, ' ').trim())
    .some(
      (partie) =>
        partie === ':root' ||
        (profil !== null &&
          (partie === '[data-densite]' || partie === `[data-densite='${profil}']`)),
    );
}

/** `max(48px, 44px)` devient `48px` ; toute autre valeur reste telle quelle. */
function evaluer(valeur: string): string {
  const max = /^max\(\s*(-?\d+(?:\.\d+)?)px\s*,\s*(-?\d+(?:\.\d+)?)px\s*\)$/.exec(valeur);
  if (max === null) return valeur;
  return `${Math.max(Number(max[1]), Number(max[2]))}px`;
}

export function valeursEffectives(
  blocs: BlocCss[],
  profil: Profil | null,
  pointeur: Pointeur,
): Map<string, string> {
  const declarees = new Map<string, string>();
  for (const bloc of blocs) {
    if (!viseLaRacine(bloc, profil, pointeur)) continue;
    for (const [nom, valeur] of bloc.declarations) declarees.set(nom, valeur);
  }

  const calculees = new Map<string, string>();

  function calculer(nom: string, enCours: ReadonlySet<string>): string {
    const connue = calculees.get(nom);
    if (connue !== undefined) return connue;
    const brute = declarees.get(nom);
    if (brute === undefined || enCours.has(nom)) return INVALIDE;

    const suite = new Set(enCours).add(nom);
    const invalides: string[] = [];
    const substituee = brute.replace(
      /var\((--[a-z0-9-]+)\)/g,
      (_correspondance: string, autre: string) => {
        const valeur = calculer(autre, suite);
        if (valeur === INVALIDE) invalides.push(autre);
        return valeur;
      },
    );

    const resultat = invalides.length > 0 ? INVALIDE : evaluer(substituee);
    calculees.set(nom, resultat);
    return resultat;
  }

  for (const nom of declarees.keys()) calculer(nom, new Set());
  return calculees;
}
```

- [ ] **Step 6 : réécrire `tests/densites.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { decouperBlocs, lireJetons } from '../outils/jetons';
import { INVALIDE, PROFILS, valeursEffectives, type Pointeur, type Profil } from './aides/densite';

const CHEMIN = 'densites/profils.css';
const brut = readFileSync(CHEMIN, 'utf8');
const blocs = decouperBlocs(brut);

/** Les six variables que lisent les composants. Nom et valeur déclarée inchangés depuis la 0.1.0. */
const VARIABLES = [
  '--rythme-section',
  '--padding-carte',
  '--hauteur-controle',
  '--ligne-liste',
  '--interligne-corps',
  '--contenu-max',
] as const;

/** Ce que chaque profil déclare lui-même depuis la 1.2.0 : quatre variables et deux sources. */
const DECLAREES_PAR_PROFIL = [
  '--rythme-section',
  '--padding-carte',
  '--hauteur-controle-profil',
  '--ligne-liste-profil',
  '--interligne-corps',
  '--contenu-max',
] as const;

/** Les huit propriétés du fichier : les six que lisent les composants, et les deux sources. */
const AUTORISEES: readonly string[] = [...VARIABLES, '--hauteur-controle-profil', '--ligne-liste-profil'];

/** Le tableau de la spec fondatrice, section 6.1, recopié sans interprétation : la valeur à la souris. */
const ATTENDU: Record<Profil, Record<(typeof VARIABLES)[number], string>> = {
  aere: {
    '--rythme-section': '64px',
    '--padding-carte': '32px',
    '--hauteur-controle': '48px',
    '--ligne-liste': '64px',
    '--interligne-corps': '1.6',
    '--contenu-max': '1120px',
  },
  equilibre: {
    '--rythme-section': '48px',
    '--padding-carte': '24px',
    '--hauteur-controle': '48px',
    '--ligne-liste': '56px',
    '--interligne-corps': '1.55',
    '--contenu-max': '1120px',
  },
  modere: {
    '--rythme-section': '40px',
    '--padding-carte': '20px',
    '--hauteur-controle': '44px',
    '--ligne-liste': '48px',
    '--interligne-corps': '1.5',
    '--contenu-max': '1280px',
  },
  compact: {
    '--rythme-section': '32px',
    '--padding-carte': '16px',
    '--hauteur-controle': '40px',
    '--ligne-liste': '40px',
    '--interligne-corps': '1.45',
    '--contenu-max': '100%',
  },
};

/** SPEC 1.2.0, §5.1.2 : la valeur effective au doigt, relevée au plancher de 44 px. */
const AU_DOIGT: Record<Profil, { '--hauteur-controle': string; '--ligne-liste': string }> = {
  aere: { '--hauteur-controle': '48px', '--ligne-liste': '64px' },
  equilibre: { '--hauteur-controle': '48px', '--ligne-liste': '56px' },
  modere: { '--hauteur-controle': '44px', '--ligne-liste': '48px' },
  compact: { '--hauteur-controle': '44px', '--ligne-liste': '44px' },
};

const INCHANGEES_AU_DOIGT = [
  '--rythme-section',
  '--padding-carte',
  '--interligne-corps',
  '--contenu-max',
] as const;

/** La source de chaque hauteur porte la valeur de la spec : seule la forme a changé. */
function sourceAttendue(profil: Profil, nom: (typeof DECLAREES_PAR_PROFIL)[number]): string {
  if (nom === '--hauteur-controle-profil') return ATTENDU[profil]['--hauteur-controle'];
  if (nom === '--ligne-liste-profil') return ATTENDU[profil]['--ligne-liste'];
  return ATTENDU[profil][nom];
}

describe('profils de densite', () => {
  for (const profil of PROFILS) {
    it(`le profil ${profil} declare ses quatre variables et ses deux sources aux valeurs de la spec`, () => {
      const jetons = lireJetons(CHEMIN, `[data-densite='${profil}']`);
      for (const nom of DECLAREES_PAR_PROFIL) {
        expect(jetons.get(nom), `${profil} : ${nom} manquant ou faux`).toBe(
          sourceAttendue(profil, nom),
        );
      }
    });
  }

  it('le profil aere sert aussi de defaut sur :root', () => {
    const racine = lireJetons(CHEMIN, ':root');
    for (const nom of DECLAREES_PAR_PROFIL) {
      expect(racine.get(nom), `${nom} absent du defaut`).toBe(sourceAttendue('aere', nom));
    }
  });

  it('ordonne les quatre profils du plus aere au plus compact', () => {
    for (const variable of ['--rythme-section', '--padding-carte', '--ligne-liste'] as const) {
      const valeurs = PROFILS.map((profil) => Number.parseInt(ATTENDU[profil][variable], 10));
      const trie = [...valeurs].sort((a, b) => b - a);
      expect(valeurs, `${variable} ne decroit pas d'un profil au suivant`).toEqual(trie);
    }
  });
});

describe('les valeurs effectives, calculees comme le navigateur (SPEC 1.2.0, §5.1.2)', () => {
  for (const profil of PROFILS) {
    it(`${profil}, a la souris : les six valeurs de la spec`, () => {
      const valeurs = valeursEffectives(blocs, profil, 'souris');
      for (const variable of VARIABLES) {
        expect(valeurs.get(variable), variable).toBe(ATTENDU[profil][variable]);
      }
    });

    it(`${profil}, au doigt : les hauteurs relevees au plancher, le reste inchange`, () => {
      const valeurs = valeursEffectives(blocs, profil, 'doigt');
      expect(valeurs.get('--hauteur-controle')).toBe(AU_DOIGT[profil]['--hauteur-controle']);
      expect(valeurs.get('--ligne-liste')).toBe(AU_DOIGT[profil]['--ligne-liste']);
      for (const variable of INCHANGEES_AU_DOIGT) {
        expect(valeurs.get(variable), variable).toBe(ATTENDU[profil][variable]);
      }
    });
  }

  it('sans profil, la racine prend le profil aere, a la souris comme au doigt', () => {
    const souris = valeursEffectives(blocs, null, 'souris');
    const doigt = valeursEffectives(blocs, null, 'doigt');
    for (const variable of VARIABLES) {
      expect(souris.get(variable), variable).toBe(ATTENDU.aere[variable]);
    }
    expect(doigt.get('--hauteur-controle')).toBe('48px');
    expect(doigt.get('--ligne-liste')).toBe('64px');
  });

  it('aucune valeur ne se resout en invalide, nulle part', () => {
    const pointeurs: Pointeur[] = ['souris', 'doigt'];
    for (const profil of [null, ...PROFILS]) {
      for (const pointeur of pointeurs) {
        const valeurs = valeursEffectives(blocs, profil, pointeur);
        for (const variable of VARIABLES) {
          expect(valeurs.get(variable), `${profil ?? 'sans profil'} · ${pointeur} · ${variable}`).not.toBe(
            INVALIDE,
          );
        }
      }
    }
  });

  it('le temoin : le resolveur voit le defaut de la 1.1.0', () => {
    /*
      Sans ce temoin, un resolveur qui ne detecterait aucun cycle passerait tous les tests ci-dessus
      sans rien prouver. La feuille de la 1.1.0 vaut 48 px a la souris, et rien au doigt.
    */
    const anciens = decouperBlocs(readFileSync('tests/instantanes/profils-1.1.0.css', 'utf8'));
    expect(valeursEffectives(anciens, 'equilibre', 'souris').get('--hauteur-controle')).toBe('48px');
    expect(valeursEffectives(anciens, 'equilibre', 'doigt').get('--hauteur-controle')).toBe(INVALIDE);
    expect(valeursEffectives(anciens, 'equilibre', 'doigt').get('--ligne-liste')).toBe(INVALIDE);
  });
});

describe('regle 1 - la densite ne touche ni au texte ni aux couleurs', () => {
  it('ne contient aucune couleur', () => {
    expect(brut).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    expect(brut).not.toMatch(/\brgba?\(/);
    expect(brut).not.toMatch(/\bhsla?\(/);
  });

  it('ne contient ni famille ni taille de police', () => {
    expect(brut).not.toMatch(/font-family/);
    expect(brut).not.toMatch(/font-size/);
    expect(brut).not.toMatch(/--taille-/);
    expect(brut).not.toMatch(/--police-/);
  });

  it('ne declare que les huit proprietes autorisees', () => {
    /*
      Six jusqu a la 1.1.0. Les deux sources, `--hauteur-controle-profil` et `--ligne-liste-profil`,
      sont nees du correctif du plancher tactile (decision 005) : ce sont elles que le plancher releve,
      pour ne plus lire la propriete qu il ecrit.
    */
    const declarees = new Set([...brut.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] ?? ''));
    for (const declaree of declarees) {
      expect(AUTORISEES, `${declaree} n'a rien a faire dans ce fichier`).toContain(declaree);
    }
  });

  it('declare bien les huit, et pas moins', () => {
    const declarees = new Set([...brut.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] ?? ''));
    for (const nom of AUTORISEES) {
      expect(declarees, `${nom} absent du fichier`).toContain(nom);
    }
  });
});

describe('regle 2 - le plancher tactile (contrainte C4, decision 005)', () => {
  const blocTactile = /@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/.exec(brut)?.[1] ?? '';

  it("s'exprime en requete media, une seule fois, et non ecran par ecran", () => {
    expect(brut).toContain('@media (pointer: coarse)');
    expect((brut.match(/@media \(pointer: coarse\)/g) ?? []).length).toBe(1);
  });

  it('releve la SOURCE de chaque hauteur a 44 px au minimum', () => {
    expect(blocTactile).toContain('--hauteur-controle: max(var(--hauteur-controle-profil), 44px);');
    expect(blocTactile).toContain('--ligne-liste: max(var(--ligne-liste-profil), 44px);');
  });

  it("ne lit jamais la propriete qu'il ecrit", () => {
    // La forme de la 1.1.0, que ce test EXIGEAIT : invalide au calcul, donc aucune hauteur au doigt.
    expect(blocTactile).not.toMatch(/var\(--hauteur-controle\)/);
    expect(blocTactile).not.toMatch(/var\(--ligne-liste\)/);
  });

  it('calcule la valeur lue une fois, dans un bloc generique', () => {
    expect(brut).toMatch(
      /^:root,\n\[data-densite\] \{\n {2}--hauteur-controle: var\(--hauteur-controle-profil\);\n {2}--ligne-liste: var\(--ligne-liste-profil\);\n\}/m,
    );
  });

  it('couvre tous les profils, y compris ceux a ajouter plus tard', () => {
    expect(blocTactile, 'le selecteur generique [data-densite] est absent').toContain(
      '[data-densite]',
    );
    expect(blocTactile).toContain(':root');
  });

  it('protege le seul profil qui descend sous le plancher', () => {
    const compact = Number.parseInt(ATTENDU.compact['--hauteur-controle'], 10);
    expect(
      compact,
      'le profil compact ne descend plus sous 44 px : la garde est-elle utile ?',
    ).toBeLessThan(44);
  });

  it('declare les profils, puis le bloc generique, puis le plancher, dans cet ordre', () => {
    const dernierProfil = brut.lastIndexOf("[data-densite='");
    const generique = brut.search(/^:root,\n\[data-densite\] \{/m);
    const plancher = brut.indexOf('@media (pointer: coarse)');
    expect(generique, 'le bloc generique est introuvable').toBeGreaterThan(-1);
    expect(dernierProfil, 'un profil est declare apres le bloc generique').toBeLessThan(generique);
    expect(generique, 'le plancher precede le bloc generique').toBeLessThan(plancher);
  });
});
```

- [ ] **Step 7 : écrire `tests/cycles.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { declarationsAutoReferentes } from '../gardes';

/**
 * AUCUNE PROPRIETE NE SE LIT ELLE-MEME.
 *
 * Premiere des trois preuves du correctif du plancher tactile (SPEC 1.2.0, §5.1.4, decision 005). De la
 * 0.1.0 a la 1.1.0, `densites/profils.css` ecrivait `--hauteur-controle: max(var(--hauteur-controle),
 * 44px)` : une propriete personnalisee qui depend d elle-meme est invalide au calcul, et sur tout ecran
 * tactile la hauteur tombait a celle du contenu. jsdom ne calcule rien : seule la forme peut se lire
 * ici, et elle se lit dans TOUTES les feuilles du systeme, les feuilles injectees comprises.
 */

const FEUILLES = [
  'noyau/jetons.css',
  'noyau/paliers.css',
  'densites/profils.css',
  'noyau/ai5d.preset.css',
];

/** Le texte des constantes `STYLE_…` des composants et des modules du noyau. */
function feuillesInjectees(): Array<{ nom: string; fichier: string; css: string }> {
  const dossier = 'noyau/composants';
  return readdirSync(dossier)
    .filter((fichier) => /\.tsx?$/.test(fichier))
    .flatMap((fichier) => {
      const source = readFileSync(`${dossier}/${fichier}`, 'utf8');
      return [...source.matchAll(/const (STYLE_[A-Z_]+) = `([\s\S]*?)`;/g)].map((m) => ({
        nom: `${fichier} · ${m[1] ?? ''}`,
        fichier,
        css: m[2] ?? '',
      }));
    });
}

const INJECTEES = feuillesInjectees();

describe('aucune declaration ne lit sa propre propriete', () => {
  for (const chemin of FEUILLES) {
    it(chemin, () => {
      const trouvees = declarationsAutoReferentes(readFileSync(chemin, 'utf8'));
      expect(trouvees, trouvees.map((t) => `${chemin}:${t.ligne}  ${t.extrait}`).join('\n')).toEqual(
        [],
      );
    });
  }

  it('lit bien les feuilles injectees des composants', () => {
    // Seize en 1.1.0, cinq de plus en 1.2.0. Si le motif cessait d en trouver, les tests suivants
    // passeraient a vide.
    expect(INJECTEES.length).toBeGreaterThanOrEqual(21);
  });

  for (const { nom, css } of INJECTEES) {
    it(nom, () => {
      expect(declarationsAutoReferentes(css)).toEqual([]);
    });
  }
});

describe('le temoin : la forme de la 1.1.0 est relevee', () => {
  it('releve les deux declarations fautives, a leur vraie ligne', () => {
    const trouvees = declarationsAutoReferentes(
      readFileSync('tests/instantanes/profils-1.1.0.css', 'utf8'),
    );
    expect(trouvees.map(({ propriete, ligne }) => [propriete, ligne])).toEqual([
      ['--hauteur-controle', 79],
      ['--ligne-liste', 80],
    ]);
  });

  it('releve aussi la forme avec valeur de repli', () => {
    expect(declarationsAutoReferentes(':root {\n  --x: var(--x, 4px);\n}\n')).toEqual([
      { propriete: '--x', ligne: 2, extrait: '--x: var(--x, 4px);' },
    ]);
  });

  it('ne prend pas une source voisine pour la propriete elle-meme', () => {
    expect(
      declarationsAutoReferentes(':root {\n  --hauteur-controle: var(--hauteur-controle-profil);\n}\n'),
    ).toEqual([]);
  });

  it('ne lit pas les commentaires, et garde les numeros de ligne', () => {
    const css = '/* ancienne forme :\n   --x: max(var(--x), 44px);\n*/\n:root {\n  --y: var(--y);\n}\n';
    expect(declarationsAutoReferentes(css)).toEqual([
      { propriete: '--y', ligne: 5, extrait: '--y: var(--y);' },
    ]);
  });
});

describe('toute feuille qui anime respecte le mouvement reduit (SPEC 1.2.0, §5.0.2, regle 4)', () => {
  const parFichier = new Map<string, string>();
  for (const { fichier, css } of INJECTEES) {
    parFichier.set(fichier, `${parFichier.get(fichier) ?? ''}\n${css}`);
  }

  for (const [fichier, css] of parFichier) {
    if (!css.includes('@keyframes')) continue;
    it(fichier, () => {
      expect(css, `${fichier} anime sans respecter prefers-reduced-motion`).toContain(
        '@media (prefers-reduced-motion: reduce)',
      );
    });
  }
});
```

- [ ] **Step 8 : réécrire le bloc `garde 3` de `gardes/gardes.test.ts` (lignes 131 à 161)**

```ts
describe('garde 3 - plancher tactile', () => {
  it('valide le fichier de profils du depot', () => {
    const infractions = verifierPlancherTactile('densites/profils.css');
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('refuse la forme de la 1.1.0, qui se lisait elle-meme, a sa vraie ligne', () => {
    /*
      Jusqu a la 1.1.0, cette garde EXIGEAIT cette forme. Elle est invalide au calcul : sur tout ecran
      tactile, chaque bouton de chaque produit valait 44 px. Decision 005.
    */
    const infractions = verifierPlancherTactile('tests/instantanes/profils-1.1.0.css');
    const cycles = infractions.filter((i) => i.extrait.includes('se lit elle-meme'));
    expect(cycles.map((i) => i.ligne)).toEqual([79, 80]);
    expect(cycles[0]?.extrait).toContain('--hauteur-controle se lit elle-meme');
    expect(cycles[1]?.extrait).toContain('--ligne-liste se lit elle-meme');

    const sourcesAbsentes = infractions.filter((i) => i.extrait.includes("n'est pas releve"));
    expect(sourcesAbsentes.map((i) => i.ligne)).toEqual([76, 76]);
  });

  it('releve une requete media absente', () => {
    const racine = depotTemporaire();
    const chemin = join(racine, 'profils.css');
    writeFileSync(chemin, "[data-densite='compact'] { --hauteur-controle-profil: 40px; }\n");
    const infractions = verifierPlancherTactile(chemin);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.extrait).toContain('absente');
  });

  it('releve une source oubliee dans la requete, a la ligne de la requete', () => {
    const racine = depotTemporaire();
    const chemin = join(racine, 'profils.css');
    writeFileSync(
      chemin,
      ':root {\n  --ligne-liste-profil: 56px;\n}\n@media (pointer: coarse) {\n  :root { --hauteur-controle: max(var(--hauteur-controle-profil), 44px); }\n}\n',
    );
    const infractions = verifierPlancherTactile(chemin);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.extrait).toContain('--ligne-liste');
    expect(infractions[0]?.ligne).toBe(4);
  });

  it('releve une propriete qui se lit elle-meme hors du plancher', () => {
    const racine = depotTemporaire();
    const chemin = join(racine, 'profils.css');
    writeFileSync(
      chemin,
      [
        ':root {',
        '  --ligne-liste: calc(var(--ligne-liste) + 4px);',
        '}',
        '@media (pointer: coarse) {',
        '  :root {',
        '    --hauteur-controle: max(var(--hauteur-controle-profil), 44px);',
        '    --ligne-liste: max(var(--ligne-liste-profil), 44px);',
        '  }',
        '}',
        '',
      ].join('\n'),
    );
    const infractions = verifierPlancherTactile(chemin);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.ligne).toBe(2);
    expect(infractions[0]?.extrait).toContain('--ligne-liste se lit elle-meme');
  });

  it('ne releve pas un commentaire qui cite la forme fautive', () => {
    const racine = depotTemporaire();
    const chemin = join(racine, 'profils.css');
    writeFileSync(
      chemin,
      [
        '/* Ancienne forme, invalide :',
        '   --hauteur-controle: max(var(--hauteur-controle), 44px);',
        '*/',
        '@media (pointer: coarse) {',
        '  :root {',
        '    --hauteur-controle: max(var(--hauteur-controle-profil), 44px);',
        '    --ligne-liste: max(var(--ligne-liste-profil), 44px);',
        '  }',
        '}',
        '',
      ].join('\n'),
    );
    expect(verifierPlancherTactile(chemin)).toEqual([]);
  });

  it('fixe le plancher a 44 px, valeur non negociable', () => {
    expect(PLANCHER_TACTILE).toBe(44);
  });
});
```

- [ ] **Step 9 : mettre à jour `densites/DENSITES.md`**

Remplacer la section « ### 2. » et les deux suivantes (lignes 38 à 75) par :

````markdown
### 2. Le plancher tactile de 44 px prime sur les quatre profils

Le Lab descend à 40 px sur un écran de bureau avec une souris. Jamais sur un téléphone :
une cible de 40 px y produit des erreurs de saisie que l'utilisateur attribue à
l'application, jamais à son doigt.

La règle s'exprime une seule fois, en requête média ; elle n'est donc pas négociable écran par
écran. Elle relève la **source** de chaque hauteur, jamais la propriété qu'elle écrit :

```css
/* Chaque profil déclare ses deux sources. */
[data-densite='compact'] {
  --hauteur-controle-profil: 40px;
  --ligne-liste-profil: 40px;
}

/* La valeur que lisent les composants, calculée une fois. */
:root,
[data-densite] {
  --hauteur-controle: var(--hauteur-controle-profil);
  --ligne-liste: var(--ligne-liste-profil);
}

/* Le plancher, sur la source. */
@media (pointer: coarse) {
  :root,
  [data-densite] {
    --hauteur-controle: max(var(--hauteur-controle-profil), 44px);
    --ligne-liste: max(var(--ligne-liste-profil), 44px);
  }
}
```

**Pourquoi l'ancienne forme ne valait rien.** Jusqu'à la 1.1.0, le bloc écrivait
`--hauteur-controle: max(var(--hauteur-controle), 44px)`. Une propriété personnalisée qui se lit
elle-même est invalide au moment du calcul : elle ne vaut ni l'ancienne valeur ni 44 px, elle ne vaut
rien, et la hauteur tombe à celle du contenu. Sur tout écran tactile, chaque bouton valait 44 px
quelle que soit sa taille, et le squelette d'un champ 21 px. Le test et la garde exigeaient cette
forme ; ils la refusent depuis la 1.2.0. Décision
[005](../docs/decisions/005-le-plancher-tactile-sans-cycle.md).

Les valeurs effectives, celles que `tests/densites.test.ts` calcule à chaque exécution et que
`docs/preuves/1.2.0/plancher-tactile.md` mesure dans Chromium :

|                     | AÉRÉ  | ÉQUILIBRÉ | MODÉRÉ | COMPACT |
| ------------------- | ----- | --------- | ------ | ------- |
| Contrôle, souris    | 48 px | 48 px     | 44 px  | 40 px   |
| Contrôle, doigt     | 48 px | 48 px     | 44 px  | 44 px   |
| Ligne, souris       | 64 px | 56 px     | 48 px  | 40 px   |
| Ligne, doigt        | 64 px | 56 px     | 48 px  | 44 px   |

Le sélecteur générique `[data-densite]` couvre aussi les profils qu'on ajouterait plus tard
et que personne n'aurait pensé à vérifier.

## Adoption

Une ligne, sur l'élément racine du produit :

```html
<html lang="fr" data-densite="equilibre"></html>
```

C'est toute l'adoption. Les composants du noyau lisent `--hauteur-controle`, `--ligne-liste` et
`--padding-carte` sans savoir quel profil est actif.

## Ajouter un profil

Autorisé quand un produit ne rentre dans aucun des quatre, avec démonstration à l'appui.
Un profil s'ajoute dans `profils.css`, **avant** le bloc générique et le bloc
`@media (pointer: coarse)`. Il déclare ses deux sources, `--hauteur-controle-profil` et
`--ligne-liste-profil`, et jamais `--hauteur-controle` ni `--ligne-liste` : ce sont les valeurs
calculées. Un profil déclaré après le plancher le remplacerait, et le test vérifie cet ordre.
````

- [ ] **Step 10 : corriger la règle 6 de `noyau/PALIERS.md` (lignes 96 à 99)**

```markdown
### 6. Le plancher tactile prime

44 px, garanti par [`../densites/profils.css`](../densites/profils.css) sous
`@media (pointer: coarse)`, qui relève la **source** de chaque hauteur. Les paliers ne le renégocient
pas. Jusqu'à la 1.1.0, la règle était écrite mais ne valait rien au doigt : elle lisait la propriété
qu'elle écrivait, et la hauteur tombait à celle du contenu. Décision 005.
```

- [ ] **Step 11 : écrire `docs/decisions/005-le-plancher-tactile-sans-cycle.md`**

```markdown
# 005 · Le plancher tactile sans cycle

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

Depuis la 0.1.0, `densites/profils.css` relevait les deux hauteurs de densité sous
`@media (pointer: coarse)` en écrivant `--hauteur-controle: max(var(--hauteur-controle), 44px)`, et de
même pour `--ligne-liste`. La propriété se lisait elle-même.

Pour le navigateur, une propriété personnalisée qui dépend d'elle-même est invalide au moment du
calcul. Elle ne vaut ni l'ancienne valeur ni 44 px : elle ne vaut rien. Mesuré dans Chromium le
26 septembre 2026, profil `equilibre` : à la souris, 48 px et 56 px ; au doigt, deux valeurs vides, un
élément de hauteur `var(--hauteur-controle)` à 21 px, une ligne à 18 px. `Bouton` et `Champ` étaient
rattrapés par leur hauteur minimale de 44 px : sur téléphone, toutes leurs tailles valaient 44 px.

Le défaut a vécu neuf versions parce que tout le protégeait. `tests/densites.test.ts` exigeait la
forme fautive au caractère près ; `verifierPlancherTactile`, distribuée aux produits, relevait une
infraction si elle manquait ; et jsdom ne calcule aucune propriété personnalisée.

## Options

**A. Relever la hauteur dans chaque composant.** Chaque produit qui lit `--hauteur-controle` dans ses
propres écrans resterait cassé, et la règle unique de la charte deviendrait une règle par composant.

**B. Une troisième propriété lue par les composants**, `--hauteur-controle-tactile`. Tous les
composants et tous les produits changeraient de variable : une rupture pour corriger une feuille.

**C. Séparer la source de la valeur.** Chaque profil déclare `--hauteur-controle-profil` et
`--ligne-liste-profil` ; un bloc générique calcule `--hauteur-controle` et `--ligne-liste` depuis la
source ; le plancher relève la source, jamais la propriété qu'il écrit.

## Décision

**C.** Les deux propriétés que lisent les composants gardent leur nom et leur valeur déclarée ; seule
leur forme change. Au doigt, elles valent enfin ce que `DENSITES.md` documente depuis la 0.1.0.

## Conséquences

- `profils.css` déclare huit propriétés au lieu de six.
- Un profil ajouté plus tard déclare ses deux sources **avant** le bloc générique.
- `verifierPlancherTactile` exige la forme corrigée et refuse toute déclaration qui se lit elle-même,
  n'importe où dans la feuille, avec sa vraie ligne. Un produit qui la lance sur la feuille installée
  passe en 1.2.0.
- Trois preuves, parce qu'aucune ne suffit seule : un test de forme sur toutes les feuilles du système
  (`tests/cycles.test.ts`), un test de valeur effective par un résolveur (`tests/densites.test.ts`), et
  la mesure dans Chromium, avant et après, dans `docs/preuves/1.2.0/plancher-tactile.md`.
- Au doigt, en `equilibre`, un bouton `md` passe de 44 à 48 px, un `lg` de 44 à 56 px, un champ de 44
  à 48 px. C'est le premier point de « Ce qui change à l'écran » dans le journal de la 1.2.0.
```

- [ ] **Step 12 : consigner la leçon dans `tasks/lessons.md`**

Ajouter en fin de fichier :

```markdown

---

## Version 1.2.0

### Un test qui recopie une forme protège aussi son défaut

De la 0.1.0 à la 1.1.0, `tests/densites.test.ts` et `verifierPlancherTactile` exigeaient au caractère
près `max(var(--hauteur-controle), 44px)`. Cette forme se lit elle-même et ne vaut rien au calcul : sur
tout écran tactile, chaque bouton de chaque produit valait 44 px. Le test ne pouvait pas le voir, parce
qu'il lisait la forme, et jsdom ne calcule aucune propriété personnalisée. La garde, distribuée aux
produits, aurait fait échouer celui qui corrigeait la feuille chez lui.

**Une règle CSS qui produit une valeur se teste par sa valeur** (un résolveur à chaque exécution, puis
une mesure dans un vrai navigateur), jamais par sa seule forme.
```

- [ ] **Step 13 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write densites/profils.css densites/DENSITES.md noyau/PALIERS.md gardes/index.ts gardes/gardes.test.ts tests/aides/densite.ts tests/densites.test.ts tests/cycles.test.ts tasks/lessons.md
```

Dans `tasks/todo.md`, cocher T2 : `- [x] T2 · … · écrite, non testée`.

```bash
git add densites/profils.css densites/DENSITES.md noyau/PALIERS.md gardes/index.ts gardes/gardes.test.ts _build/figer-1.1.0.mjs tests/instantanes tests/aides/densite.ts tests/densites.test.ts tests/cycles.test.ts docs/decisions/005-le-plancher-tactile-sans-cycle.md tasks/lessons.md tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Le plancher tactile lit enfin la source de chaque profil, et le test comme la garde refusent la forme qui se lisait elle-même
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 3 : La mesure d'un texte, les mouvements par rôle, la durée longue, et le navigateur qui suit le thème

SPEC §4, étape 2 ; §5.7 ; §5.14 ; §6. Aucune valeur existante ne bouge : la tâche ajoute, et le prouve
contre l'instantané de la tâche 2.

**Files:**
- Modify: `noyau/jetons.css:28-29` (après `accent-color`), `:130-133` (typographie), `:177-185` (mouvement), et une règle après le bloc `:root` (ligne 205)
- Create: `noyau/couleurs-navigateur.ts`
- Modify: `noyau/theme.ts` (en-tête, et réexport en fin de fichier)
- Modify: `gardes/gardes.test.ts:26-46` (liste `EXCEPTIONS_COULEURS`)
- Modify: `tests/jetons.test.ts` (exigences de contraste, et trois blocs ajoutés)
- Create: `tests/non-regression.test.ts`
- Modify: `tests/composants/theme.test.tsx` (le test « n importe rien », et un bloc ajouté)
- Create: `docs/decisions/006-la-duree-longue-et-le-moment-signature.md`

**Interfaces:**
- Consumes : `tests/instantanes/jetons-1.1.0.json`, `valeursEffectives`, `PROFILS`, `INVALIDE`
  (tâche 2) ; `lireJetons`, `resoudre`, `decouperBlocs`, `type BlocCss` (`outils/jetons.ts`).
- Produces :
  - `noyau/jetons.css` : `--mesure-texte: 65ch` ; `--mouvement-retour`, `--mouvement-entree`,
    `--mouvement-sortie` ; `caret-color: var(--action)` sur `:root` ; `::selection`.
  - `noyau/couleurs-navigateur.ts` : `export const COULEURS_NAVIGATEUR = { clair: '#FAF7F2', sombre: '#0B1620' } as const`.
  - `noyau/theme.ts` : `export { COULEURS_NAVIGATEUR } from './couleurs-navigateur'`, donc
    `import { COULEURS_NAVIGATEUR } from '@ai5d/design-system/theme'`.
  - La règle de la durée longue, phrase exacte (la même dans `jetons.css`, `NOYAU.md` à la tâche 14,
    et la décision 006) : « La durée longue sert deux choses, et deux seulement : une confirmation qui
    engage la sécurité du compte, et le moment signature unique d’un produit, déclaré par son nom dans
    le DESIGN.md de ce produit. Jamais un ornement, jamais deux moments dans un même produit. »

- [ ] **Step 1 : le curseur de saisie, dans le bloc `:root` de `noyau/jetons.css`**

Après la ligne `accent-color: var(--action);` (ligne 29), insérer :

```css

  /*
    LE CURSEUR DE SAISIE SUIT L'ACTION, depuis la 1.2.0. Il tient 5,15 au moins sur les champs,
    dans les deux themes.
  */
  caret-color: var(--action);
```

- [ ] **Step 2 : la mesure d'un texte, dans la section typographie**

Après `--lettrage-mono: 0.16em;` (ligne 133), insérer :

```css

  /* La longueur de ligne d'un texte courant long : programme, annonce, politique. Au-dela de
     soixante-cinq signes, l'oeil perd le debut de la ligne suivante. Ce n'est pas une largeur
     de colonne : une phrase courte d'en-tete garde sa propre borne. Depuis la 1.2.0. */
  --mesure-texte: 65ch;
```

- [ ] **Step 3 : la section mouvement (lignes 177 à 185), réécrite**

```css
  /* -----------------------------------------------------------------------
     Mouvement.

     La règle de la durée longue, réécrite en 1.2.0 (décision 006) :
     La durée longue sert deux choses, et deux seulement : une confirmation qui
     engage la sécurité du compte, et le moment signature unique d’un produit,
     déclaré par son nom dans le DESIGN.md de ce produit. Jamais un ornement,
     jamais deux moments dans un même produit.
     ----------------------------------------------------------------------- */
  --duree-courte: 150ms;
  --duree-moyenne: 250ms;
  --duree-longue: 800ms;
  --courbe-entree: cubic-bezier(0.16, 1, 0.3, 1);
  --courbe-sortie: cubic-bezier(0.4, 0, 1, 1);

  /* Un mouvement se nomme par son ROLE, depuis la 1.2.0. La duree et la courbe qu'il porte
     peuvent changer sans qu'un seul appel change. Retour et sortie valent la meme chose
     aujourd'hui : ils ne disent pas la meme chose. Sous prefers-reduced-motion, leurs durees
     tombent a 100 ms par le bloc du bas ; ce qui se deplace reste a supprimer par chaque feuille. */
  --mouvement-retour: var(--duree-courte) var(--courbe-sortie); /* un etat repond */
  --mouvement-entree: var(--duree-moyenne) var(--courbe-entree); /* quelque chose arrive */
  --mouvement-sortie: var(--duree-courte) var(--courbe-sortie); /* quelque chose part */
```

- [ ] **Step 4 : la sélection de texte, juste après la fermeture du bloc `:root` (ligne 205)**

```css

/* =========================================================================
   La selection de texte, depuis la 1.2.0.

   Elle prend les couleurs du bouton primaire : la seule paire du systeme
   mesuree dans les deux themes, au repos comme au survol. Le texte selectionne
   tient 5,69 en clair et 5,45 en sombre. Le fond d'information, propose d'abord,
   ne se detachait pas d'une carte sombre : 1,01.

   Aucune couleur de barre de defilement n'est posee : color-scheme, livre en
   1.1.0, les assombrit deja, et le trait propose ne tenait que 1,49.
   ========================================================================= */

::selection {
  background: var(--action);
  color: var(--texte-sur-action);
}
```

- [ ] **Step 5 : écrire `noyau/couleurs-navigateur.ts`**

```ts
/**
 * Les deux seules couleurs du système écrites hors d'une feuille.
 *
 * `<meta name="theme-color">` colore la barre d'adresse d'un navigateur de téléphone, et n'accepte
 * pas de variable CSS. Sans cet export, chaque produit devrait écrire une valeur hexadécimale, ce que
 * `verifierAucuneCouleurEnDur` lui interdit, à raison.
 *
 * Elles valent `--surface-1` dans chaque thème ; `tests/composants/theme.test.tsx` les confronte à
 * `jetons.css`. Module pur, sans import : `noyau/theme.ts` le réexporte, et un gabarit serveur le lit.
 */
export const COULEURS_NAVIGATEUR = {
  clair: '#FAF7F2',
  sombre: '#0B1620',
} as const;
```

- [ ] **Step 6 : réexporter depuis `noyau/theme.ts`**

Dans l'en-tête, remplacer les lignes 4 à 6 :

```ts
 * ── CE MODULE EST PUR, ET IL DOIT LE RESTER ─────────────────────────────────
 * Il n importe que `couleurs-navigateur.ts`, pur lui aussi. Le selecteur de theme est un composant
 * CLIENT : s il atteignait `next/headers` ou Prisma, meme de loin, la compilation echouerait au premier
 * import.
```

Ajouter en fin de fichier :

```ts

/**
 * Les couleurs de `<meta name="theme-color">`, les seules que le systeme ecrive hors d une feuille.
 * Reexportees ici pour s importer par `@ai5d/design-system/theme`, depuis un module sans directive
 * qu un gabarit serveur peut lire (lecon du depot : une constante lue par le serveur ne vit pas dans
 * un module client).
 */
export { COULEURS_NAVIGATEUR } from './couleurs-navigateur';
```

- [ ] **Step 7 : la seule exception nominale, pour la seule garde des couleurs (`gardes/gardes.test.ts`)**

Après la constante `EXCEPTIONS_DU_DEPOT` (ligne 36), insérer :

```ts

/**
 * La garde des couleurs a une exception de plus que les autres, et une seule : les deux couleurs de
 * `<meta name="theme-color">`, qui n'acceptent pas de variable CSS (SPEC 1.2.0, §5.7.2). Elle n'entre
 * pas dans `EXCEPTIONS_DU_DEPOT`, qui la soustrairait aussi aux gardes de largeur, de hauteur de vue et
 * d'espacement.
 */
const EXCEPTIONS_COULEURS = [...EXCEPTIONS_DU_DEPOT, 'noyau/couleurs-navigateur.ts'];
```

Dans le test « ne releve aucune infraction dans le depot lui-meme » de la garde 1 (ligne 44),
remplacer `{ exceptions: EXCEPTIONS_DU_DEPOT }` par `{ exceptions: EXCEPTIONS_COULEURS }`.

- [ ] **Step 8 : les huit couples de contraste, dans `tests/jetons.test.ts`**

Remplacer `const EXIGENCES` (lignes 109 à 117) par :

```ts
const EXIGENCES: Array<{ jeton: string; fonds: string[] }> = [
  {
    jeton: '--texte-fort',
    // `--surface-selection` : le titre d'une ligne ou d'un onglet a l'appui (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-chaude', '--surface-selection'],
  },
  { jeton: '--texte', fonds: ['--surface-1', '--surface-2', '--surface-chaude'] },
  {
    jeton: '--texte-faible',
    // `--surface-selection` : la description d'une ligne a l'appui, 4,51 en clair, de peu (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-chaude', '--surface-selection'],
  },
  { jeton: '--reussite', fonds: ['--surface-1', '--surface-2', '--reussite-fond'] },
  { jeton: '--attention', fonds: ['--surface-1', '--surface-2', '--attention-fond'] },
  { jeton: '--erreur', fonds: ['--surface-1', '--surface-2', '--erreur-fond'] },
  {
    jeton: '--action',
    // `--surface-selection` : l'onglet actif et le segment coche (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--info-fond', '--surface-selection'],
  },
];

/** Les exigences du theme sombre, sorties du bloc qui les mesure pour que le total se compte. */
const EXIGENCES_SOMBRES: Array<{ jeton: string; fonds: string[] }> = [
  {
    jeton: '--texte-fort',
    fonds: ['--surface-1', '--surface-2', '--surface-3', '--surface-selection'],
  },
  {
    jeton: '--texte',
    // `--surface-chaude` : le corps d'un bandeau neutre (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-3', '--surface-chaude'],
  },
  {
    jeton: '--texte-faible',
    // `--surface-chaude` : le ton neutre ; `--surface-selection` : l'appui en sombre (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-3', '--surface-chaude', '--surface-selection'],
  },
  { jeton: '--reussite', fonds: ['--surface-1', '--surface-2', '--reussite-fond'] },
  { jeton: '--attention', fonds: ['--surface-1', '--surface-2', '--attention-fond'] },
  { jeton: '--erreur', fonds: ['--surface-1', '--surface-2', '--erreur-fond'] },
  {
    jeton: '--action',
    // `--surface-selection` : l'onglet actif en sombre, 4,51, de peu (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-3', '--info-fond', '--surface-selection'],
  },
];

/**
 * Les couples des boutons, mesures a part : texte sur action, au repos et au survol, et texte sur
 * erreur, dans chaque theme.
 */
const COUPLES_DE_BOUTONS = 6;
```

Dans le bloc `describe('jetons - contraste en sombre (garde C3)'`, supprimer la déclaration locale
`const exigencesSombres …` (lignes 164 à 172) et remplacer, ligne 238, `exigencesSombres` par
`EXIGENCES_SOMBRES`.

Ajouter, après ce bloc :

```ts
describe('jetons - le nombre de couples mesures', () => {
  it('mesure cinquante-sept couples : les quarante-neuf de la 1.1.0, et huit de la 1.2.0', () => {
    /*
      Le nombre n est plus ecrit dans NOYAU.md : il y avait vieilli (« 44 paires » pour 49). Il se lit
      ici, et nulle part ailleurs. SPEC 1.2.0, §6.3.
    */
    const clairs = EXIGENCES.flatMap(({ fonds }) => fonds).length;
    const sombres = EXIGENCES_SOMBRES.flatMap(({ fonds }) => fonds).length;
    expect(clairs + sombres + COUPLES_DE_BOUTONS).toBe(57);
  });
});
```

- [ ] **Step 9 : la mesure, le mouvement, la durée longue, la sélection, dans `tests/jetons.test.ts`**

En tête du fichier, après `const brut = …` (ligne 7), ajouter :

```ts

/** SPEC 1.2.0, §5.14.3, decision 006 : la regle, mot pour mot, dans jetons.css et NOYAU.md. */
const REGLE_DUREE_LONGUE =
  'La durée longue sert deux choses, et deux seulement : une confirmation qui engage la sécurité du compte, et le moment signature unique d’un produit, déclaré par son nom dans le DESIGN.md de ce produit. Jamais un ornement, jamais deux moments dans un même produit.';

const MOUVEMENTS: Array<[string, string]> = [
  ['--mouvement-retour', 'var(--duree-courte) var(--courbe-sortie)'],
  ['--mouvement-entree', 'var(--duree-moyenne) var(--courbe-entree)'],
  ['--mouvement-sortie', 'var(--duree-courte) var(--courbe-sortie)'],
];
```

Ajouter en fin de fichier :

```ts
describe('jetons - la mesure d un texte (1.2.0)', () => {
  it('--mesure-texte vaut 65ch', () => {
    expect(clair.get('--mesure-texte')).toBe('65ch');
  });

  it('ne varie pas avec le theme', () => {
    expect(lireJetons(CHEMIN, ":root[data-theme='dark']").has('--mesure-texte')).toBe(false);
    expect(lireJetons(CHEMIN, ":root[data-theme='light']").has('--mesure-texte')).toBe(false);
  });
});

describe('jetons - le mouvement par role (1.2.0)', () => {
  for (const [nom, valeur] of MOUVEMENTS) {
    it(`${nom} vaut ${valeur}`, () => {
      expect(clair.get(nom)).toBe(valeur);
    });
  }

  it('ne pointent que vers des durees et des courbes existantes', () => {
    for (const [nom] of MOUVEMENTS) {
      const cibles = [...(clair.get(nom) ?? '').matchAll(/var\((--[a-z0-9-]+)\)/g)].map(
        (m) => m[1] ?? '',
      );
      expect(cibles, nom).toHaveLength(2);
      for (const cible of cibles) {
        expect(cible, `${nom} pointe vers ${cible}`).toMatch(/^--(duree|courbe)-/);
        expect(clair.has(cible), `${cible} n'est declare nulle part`).toBe(true);
      }
    }
  });

  it('sous mouvement reduit, leurs durees tombent a 100 ms par le bloc existant', () => {
    const reduit = lireJetons(CHEMIN, ':root', { inclureRegleArobase: true });
    expect(reduit.get('--duree-courte')).toBe('100ms');
    expect(reduit.get('--duree-moyenne')).toBe('100ms');
    expect(reduit.get('--duree-longue')).toBe('0ms');
  });

  it('aucun jeton --duree-signature : il doublerait --duree-longue (decision 006)', () => {
    expect(brut).not.toMatch(/--duree-signature\s*:/);
  });

  it('la regle de la duree longue est ecrite, mot pour mot, dans jetons.css et NOYAU.md', () => {
    const normaliser = (texte: string) => texte.replace(/\s+/g, ' ');
    expect(normaliser(brut)).toContain(REGLE_DUREE_LONGUE);
    expect(normaliser(readFileSync('noyau/NOYAU.md', 'utf8'))).toContain(REGLE_DUREE_LONGUE);
  });
});

describe('le navigateur suit le theme, jusque dans la selection (1.2.0)', () => {
  it('pose le curseur de saisie sur la couleur d action', () => {
    expect(brut).toMatch(/:root\s*\{[^}]*caret-color:\s*var\(--action\);/);
  });

  it('peint la selection aux couleurs du bouton primaire', () => {
    expect(brut).toMatch(
      /::selection\s*\{\s*background:\s*var\(--action\);\s*color:\s*var\(--texte-sur-action\);\s*\}/,
    );
  });

  it('ne pose aucune couleur de barre de defilement', () => {
    expect(brut).not.toMatch(/^\s*scrollbar-color\s*:/m);
  });
});
```

`color-scheme` et `accent-color` restent gardés par le bloc existant « le schema de couleur du
navigateur », inchangé.

- [ ] **Step 10 : écrire `tests/non-regression.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { decouperBlocs, type BlocCss } from '../outils/jetons';
import { INVALIDE, PROFILS, valeursEffectives } from './aides/densite';

/**
 * AUCUNE VALEUR DE LA 1.1.0 NE CHANGE.
 *
 * Un changement de valeur de jeton est majeur (CHANGELOG, en tete) : il change le rendu de tous les
 * produits. La 1.2.0 se dit mineure ; cette preuve s execute au lieu de s affirmer (SPEC 1.2.0, §6.2).
 *
 * L instantane a ete engendre une fois depuis l etiquette v1.1.0 par `_build/figer-1.1.0.mjs`, puis
 * versionne. Le test ne lit jamais Git : l integration continue clone sans etiquettes.
 *
 * Trois feuilles se comparent declaration par declaration, bloc par bloc : aucune valeur declaree n a
 * le droit de bouger, et une propriete absente fait echouer. La feuille de densites se compare par sa
 * valeur EFFECTIVE, puisque le correctif du plancher change sa forme et rien d autre.
 */

interface BlocFige {
  chemin: string[];
  selecteur: string;
  declarations: Record<string, string>;
}

interface Instantane {
  etiquette: string;
  fichiers: Record<string, BlocFige[]>;
}

const INSTANTANE = JSON.parse(
  readFileSync('tests/instantanes/jetons-1.1.0.json', 'utf8'),
) as Instantane;

const DENSITES = 'densites/profils.css';

const VARIABLES = [
  '--rythme-section',
  '--padding-carte',
  '--hauteur-controle',
  '--ligne-liste',
  '--interligne-corps',
  '--contenu-max',
] as const;

function cle(chemin: string[], selecteur: string): string {
  return [...chemin, selecteur].join(' » ');
}

function indexer(blocs: BlocCss[]): Map<string, Map<string, string>> {
  const index = new Map<string, Map<string, string>>();
  for (const bloc of blocs) {
    const ou = cle(bloc.chemin, bloc.selecteur);
    const declarations = index.get(ou) ?? new Map<string, string>();
    for (const [nom, valeur] of bloc.declarations) declarations.set(nom, valeur);
    index.set(ou, declarations);
  }
  return index;
}

function versBlocs(figes: BlocFige[]): BlocCss[] {
  return figes.map(({ chemin, selecteur, declarations }) => ({
    chemin,
    selecteur,
    declarations: new Map(Object.entries(declarations)),
  }));
}

describe(`aucune valeur de ${INSTANTANE.etiquette} ne change`, () => {
  it('l instantane porte les quatre feuilles', () => {
    expect(Object.keys(INSTANTANE.fichiers).sort()).toEqual([
      'densites/profils.css',
      'noyau/jetons.css',
      'noyau/marque.css',
      'noyau/paliers.css',
    ]);
  });

  for (const [fichier, figes] of Object.entries(INSTANTANE.fichiers)) {
    if (fichier === DENSITES) continue;

    it(`${fichier} garde chaque declaration, bloc par bloc`, () => {
      expect(figes.length).toBeGreaterThan(0);
      const actuels = indexer(decouperBlocs(readFileSync(fichier, 'utf8')));
      for (const bloc of figes) {
        const ou = cle(bloc.chemin, bloc.selecteur);
        for (const [nom, valeur] of Object.entries(bloc.declarations)) {
          expect(actuels.get(ou)?.get(nom), `${fichier} · ${ou} · ${nom}`).toBe(valeur);
        }
      }
    });
  }

  describe(`${DENSITES}, par la valeur effective`, () => {
    const avant = versBlocs(INSTANTANE.fichiers[DENSITES] ?? []);
    const apres = decouperBlocs(readFileSync(DENSITES, 'utf8'));

    it('l instantane de la feuille de densites n est pas vide', () => {
      expect(avant.length).toBeGreaterThan(0);
    });

    for (const profil of [null, ...PROFILS]) {
      const nom = profil ?? 'sans profil';

      it(`${nom} : a la souris, les six valeurs sont celles de la 1.1.0`, () => {
        const v110 = valeursEffectives(avant, profil, 'souris');
        const v120 = valeursEffectives(apres, profil, 'souris');
        for (const variable of VARIABLES) {
          expect(v110.get(variable), `1.1.0 · ${variable}`).not.toBe(INVALIDE);
          expect(v120.get(variable), `1.2.0 · ${variable}`).toBe(v110.get(variable));
        }
      });

      it(`${nom} : au doigt, les deux hauteurs passent d invalide au plancher`, () => {
        const v110 = valeursEffectives(avant, profil, 'doigt');
        const v120 = valeursEffectives(apres, profil, 'doigt');
        const souris = valeursEffectives(apres, profil, 'souris');
        for (const variable of ['--hauteur-controle', '--ligne-liste']) {
          expect(v110.get(variable), `1.1.0 · ${variable}`).toBe(INVALIDE);
          const attendu = `${Math.max(Number.parseFloat(souris.get(variable) ?? '0'), 44)}px`;
          expect(v120.get(variable), `1.2.0 · ${variable}`).toBe(attendu);
        }
        for (const variable of ['--rythme-section', '--padding-carte', '--interligne-corps', '--contenu-max']) {
          expect(v120.get(variable), variable).toBe(v110.get(variable));
        }
      });
    }
  });
});
```

- [ ] **Step 11 : le module de thème et ses couleurs, dans `tests/composants/theme.test.tsx`**

Ajouter aux imports :

```ts
import { COULEURS_NAVIGATEUR } from '../../noyau/theme';
import { COULEURS_NAVIGATEUR as COULEURS_DU_MODULE } from '../../noyau/couleurs-navigateur';
import { lireJetons } from '../../outils/jetons';
```

Remplacer le test `it('n importe rien', …)` (lignes 55 à 58) par :

```ts
  it('n importe que couleurs-navigateur, pur lui aussi', () => {
    const sansCommentaires = (chemin: string) =>
      readFileSync(chemin, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');

    const theme = sansCommentaires('noyau/theme.ts');
    expect(theme).not.toMatch(/^\s*import /m);
    expect([...theme.matchAll(/from '([^']+)'/g)].map((m) => m[1])).toEqual([
      './couleurs-navigateur',
    ]);

    const couleurs = sansCommentaires('noyau/couleurs-navigateur.ts');
    expect(couleurs).not.toMatch(/^\s*import /m);
    expect(couleurs).not.toMatch(/\bfrom '/);
  });
```

Ajouter, après le bloc `describe('le module de theme', …)` :

```ts
describe('COULEURS_NAVIGATEUR, pour <meta name="theme-color"> (1.2.0)', () => {
  const CHEMIN = 'noyau/jetons.css';

  it('vaut --surface-1 dans chaque theme', () => {
    const clair = lireJetons(CHEMIN, ':root').get('--surface-1')?.toUpperCase();
    const sombre = lireJetons(CHEMIN, ":root[data-theme='dark']").get('--surface-1')?.toUpperCase();
    const sombreDuSysteme = lireJetons(CHEMIN, ":root:not([data-theme='light'])", {
      inclureRegleArobase: true,
    })
      .get('--surface-1')
      ?.toUpperCase();

    expect(COULEURS_NAVIGATEUR.clair).toBe(clair);
    expect(COULEURS_NAVIGATEUR.sombre).toBe(sombre);
    expect(COULEURS_NAVIGATEUR.sombre).toBe(sombreDuSysteme);
  });

  it('s importe par le module de theme, qui le reexporte sans le recopier', () => {
    expect(COULEURS_NAVIGATEUR).toBe(COULEURS_DU_MODULE);
  });
});
```

- [ ] **Step 12 : écrire `docs/decisions/006-la-duree-longue-et-le-moment-signature.md`**

```markdown
# 006 · La durée longue et le moment signature

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

La règle de `jetons.css` réservait `--duree-longue` (800 ms, 0 ms sous mouvement réduit) aux
confirmations qui engagent la sécurité du compte. Compte l'emploie ainsi
(`components/ConfirmationSecurite.tsx:36`, `DUREE_MS = 800`), et pour rien d'autre.

Le Portail a un moment d'une autre nature : la première ouverture d'une attestation délivrée, « la
feuille qui se pose » (SPEC P09, §5.9.3). Son contrat demandait pour lui un jeton `--duree-signature`.
Dans le même temps, les produits écrivaient leurs transitions en durée et courbe littérales : Compte
efface une ligne par `opacity 250ms ease-out` (`app/(portail)/organisations/[slug]/Gestion.tsx:51`).

## Options

**A. Un jeton `--duree-signature`, qui vaut `var(--duree-longue)`.** Deux noms pour une même valeur et
un même rôle : ils divergent à la première correction.

**B. Refuser le moment au Portail.** La délivrance de l'attestation est l'instant que ce produit existe
pour produire ; la traiter comme un survol serait faux.

**C. Réécrire la règle de la durée longue, et nommer les mouvements courants par leur rôle.**

## Décision

**C.** La règle, telle qu'elle figure dans `jetons.css` et `NOYAU.md` :

> La durée longue sert deux choses, et deux seulement : une confirmation qui engage la sécurité du compte, et le moment signature unique d’un produit, déclaré par son nom dans le DESIGN.md de ce produit. Jamais un ornement, jamais deux moments dans un même produit.

Trois jetons nomment un mouvement par ce qu'il fait : `--mouvement-retour` (un état répond),
`--mouvement-entree` (quelque chose arrive), `--mouvement-sortie` (quelque chose part).

## Conséquences

- Aucun jeton `--duree-signature`. Le Portail écrit `var(--duree-longue)` et déclare le moment dans
  son `DESIGN.md`.
- `--duree-survol`, que le contrat de P09 proposait de déprécier, n'a jamais existé dans ce dépôt.
- Les composants existants ne migrent pas vers les jetons de rôle dans ce lot : leurs paires actuelles
  changeraient d'un rien au survol, et personne ne l'a demandé. `LigneLien` et les états nouveaux des
  onglets les emploient.
- La primitive `Apparition` reste dans le Portail, faute de deuxième consommateur ; elle s'écrit sur
  `--mouvement-entree`.
```

- [ ] **Step 13 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/jetons.css noyau/couleurs-navigateur.ts noyau/theme.ts gardes/gardes.test.ts tests/jetons.test.ts tests/non-regression.test.ts tests/composants/theme.test.tsx
```

Cocher T3 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/jetons.css noyau/couleurs-navigateur.ts noyau/theme.ts gardes/gardes.test.ts tests/jetons.test.ts tests/non-regression.test.ts tests/composants/theme.test.tsx docs/decisions/006-la-duree-longue-et-le-moment-signature.md tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
La mesure d’un texte, les mouvements nommés par leur rôle, la durée longue réécrite, et la sélection, le curseur et les couleurs du navigateur qui suivent le thème
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 4 : Les outils de lien, `ComposantLien` élargi, et `Bouton` rendu en lien

SPEC §5.0.3, §5.0.4, §5.2. Deuxième consommateur constaté : Compte (`RetourPortail.tsx:24`,
`LienInvalide.tsx:56`) et le SDK (`AccesRefuse.tsx:126-131`) naviguent par `window.location.assign`
depuis un `<button>`.

**Files:**
- Create: `noyau/composants/lien.ts`
- Modify: `noyau/composants/LiensRail.tsx:1` (import) et `:34-47` (`ComposantLien`)
- Modify: `noyau/composants/BarreOnglets.tsx:183-187` et `noyau/composants/GabaritDocument.tsx:184-188` (deux commentaires devenus faux)
- Modify: `noyau/composants/Bouton.tsx` (imports, en-tête, types, feuille, rendu)
- Create: `tests/composants/bouton-lien.test.tsx`
- Modify: `gardes/gardes.test.ts:269-290` (`HORS_ECHELLE`)

**Interfaces:**
- Consumes : `tests/instantanes/Bouton-1.1.0.tsx` (tâche 2) ; `Icone` inchangé.
- Produces :
  - `noyau/composants/lien.ts` : `ATTRIBUT_EN_ATTENTE = 'data-en-attente'` ;
    `MENTION_NOUVEL_ONGLET = '(s’ouvre dans un nouvel onglet)'` ; `CLASSE_HORS_ECRAN = 'ai5d-hors-ecran'` ;
    `ID_STYLE_HORS_ECRAN = 'ai5d-hors-ecran'` ; `STYLE_HORS_ECRAN: string` ;
    `relSur(rel: string | undefined, target: string | undefined): string | undefined` ;
    `lienNatif(options: { download?: unknown; target?: string | undefined }): boolean`.
  - `LiensRail.tsx` : `ComposantLien = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }>`.
  - `Bouton.tsx` : `ProprietesBoutonAction`, `ProprietesBoutonLien`, `ProprietesBouton = ProprietesBoutonAction | ProprietesBoutonLien`,
    `VarianteBouton`, `TailleBouton` (inchangés), `Bouton(proprietes: ProprietesBouton)`.
  - Le sélecteur d'attente, écrit tel quel dans chaque feuille concernée :
    `:is([data-en-attente], :has([data-en-attente]))`.

- [ ] **Step 1 : écrire `noyau/composants/lien.ts`**

```ts
/**
 * Les outils communs aux composants qui rendent un lien : `Bouton` avec une adresse, `LigneLien`.
 *
 * Module pur : ni JSX, ni directive, ni import. Il s'importe aussi bien d'un composant serveur que
 * d'un module client, et ses constantes y valent ce qu'elles valent ici.
 *
 * ── DEUX CAS OÙ LE LIEN DU ROUTEUR N'EST JAMAIS EMPLOYÉ ─────────────────────
 * Un téléchargement : un routeur client ne télécharge pas, il naviguerait vers le fichier. Un nouvel
 * onglet : il charge un document entier de toute façon. Dans les deux cas, un `<a>` natif, même quand
 * le produit a fourni son lien. C'est décidé ici, une fois, pour tous les composants.
 *
 * ── LE PROTOCOLE D'ATTENTE ──────────────────────────────────────────────────
 * Le système ne connaît pas le routeur, donc ni l'instant où une navigation part ni celui où elle
 * aboutit. Il offre une convention : un lien est « en attente » quand il porte `data-en-attente`, ou
 * quand il contient un élément qui le porte. La seconde forme existe parce que, sous Next, l'état d'un
 * lien ne se lit que dans l'un de ses descendants. Les feuilles le voient par
 * `:is([data-en-attente], :has([data-en-attente]))`, écrit tel quel dans chacune.
 *
 * Le système ne pose pas `aria-busy` sur un lien en attente : il ne voit que le CSS, et l'annonce
 * d'une navigation en cours appartient à l'indicateur du produit.
 */

/** L'attribut qui dit qu'une navigation part de ce lien et n'a pas encore abouti. */
export const ATTRIBUT_EN_ATTENTE = 'data-en-attente';

/** Lu par les lecteurs d'écran après le libellé d'un lien qui ouvre un nouvel onglet. */
export const MENTION_NOUVEL_ONGLET = '(s’ouvre dans un nouvel onglet)';

/** La classe qui retire un texte de l'écran sans le retirer de l'arbre d'accessibilité. */
export const CLASSE_HORS_ECRAN = 'ai5d-hors-ecran';

/** L'identifiant stable sous lequel un composant injecte la feuille de cette classe. */
export const ID_STYLE_HORS_ECRAN = 'ai5d-hors-ecran';

/**
 * Le texte hors écran occupe un pixel, et sa marge négative d'un pixel est nommée hors échelle dans
 * les exceptions de la garde d'espacement : c'est une construction, pas un pas de l'échelle.
 */
export const STYLE_HORS_ECRAN = `
.ai5d-hors-ecran {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
`;

/**
 * Le `rel` d'un lien : celui du produit, complété de `noopener` et `noreferrer` quand le lien ouvre
 * un nouvel onglet. Sans doublon, casse comprise : `rel` se compare sans elle.
 */
export function relSur(rel: string | undefined, target: string | undefined): string | undefined {
  if (target !== '_blank') return rel;

  const jetons = (rel ?? '').split(/\s+/).filter((jeton) => jeton !== '');
  const presents = new Set(jetons.map((jeton) => jeton.toLowerCase()));
  for (const requis of ['noopener', 'noreferrer']) {
    if (!presents.has(requis)) jetons.push(requis);
  }
  return jetons.join(' ');
}

/** Vrai quand le lien doit être un `<a>` natif, quel que soit le lien du produit. */
export function lienNatif(options: { download?: unknown; target?: string | undefined }): boolean {
  const telechargement = options.download !== undefined && options.download !== false;
  return telechargement || options.target === '_blank';
}
```

- [ ] **Step 2 : élargir `ComposantLien` dans `noyau/composants/LiensRail.tsx`**

Ligne 1 :

```ts
import type { AnchorHTMLAttributes, ComponentProps, ComponentType, ReactNode } from 'react';
```

Lignes 34 à 47 (le commentaire et le type) :

```ts
/**
 * Le composant de lien du produit. Celui de Next convient tel quel.
 *
 * Il reçoit TOUS les attributs d'un `<a>`, et il doit les transmettre : un bouton en lien lui passe
 * `style`, `target`, `rel`, `aria-*` et `data-*`, et les perdre rendrait un lien sans hauteur ni
 * variante. Élargi en 1.2.0 ; jusque-là, il ne promettait que l'adresse, la classe et l'état courant.
 *
 * Un composant typé sur l'ancienne forme, avec `'aria-current'?: 'page'`, n'est plus assignable : un
 * lien admet aussi `true`, `step`, `location`… Un produit type le sien par
 * `ComponentProps<ComposantLien>`. Constaté par `tsc` le 26 septembre 2026 ; aucun produit n'était
 * concerné, tous passent `Link` tel quel.
 */
export type ComposantLien = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }
>;
```

- [ ] **Step 3 : rendre vrais deux commentaires qui décrivaient l'ancien contrat**

`noyau/composants/BarreOnglets.tsx`, lignes 183 à 187 :

```tsx
            /*
              Le lien du produit reçoit l'adresse, la classe et l'état courant. Depuis la 1.2.0,
              `ComposantLien` promet tous les attributs d'un lien ; `data-onglet` reste pourtant sur le
              repli `a` seulement, pour que le rendu de la 1.1.0 ne change pas.
            */
```

`noyau/composants/GabaritDocument.tsx`, lignes 184 à 188 :

```tsx
          {/*
            Le lien du produit reçoit l'adresse et la classe. Depuis la 1.2.0, `ComposantLien` accepte
            aussi `aria-label` ; le nom accessible passe pourtant toujours par un texte masqué et le
            logotype reste décoratif, pour que le rendu de la 1.1.0 ne change pas et que le lien
            s'annonce « Retour à l'accueil » et rien d'autre.
          */}
```

- [ ] **Step 4 : `noyau/composants/Bouton.tsx`, les imports (ligne 1)**

```ts
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties } from 'react';
import type { ComposantLien } from './LiensRail';
import {
  CLASSE_HORS_ECRAN,
  ID_STYLE_HORS_ECRAN,
  MENTION_NOUVEL_ONGLET,
  STYLE_HORS_ECRAN,
  lienNatif,
  relSur,
} from './lien';
```

- [ ] **Step 5 : `Bouton.tsx`, deux sections ajoutées à l'en-tête**

Insérer avant la ligne 70 (le ` */` qui ferme l'en-tête), après la section `danger-contour` :

```ts
 *
 * ── LE BOUTON QUI MÈNE QUELQUE PART, EN v1.2.0 ──────────────────────────────
 * Avec `href`, le bouton est un lien : un `<a>`, ou le lien du routeur du produit passé en `Lien`,
 * avec les classes, la hauteur, les variantes et les états d'un bouton. Il s'ouvre au clic du milieu,
 * se copie, et fonctionne sans JavaScript. Compte naviguait par `window.location.assign` depuis un
 * `<button>` à deux endroits, et le SDK à un troisième, faute de cette forme.
 *
 * Un lien désactivé ou en chargement perd son adresse : `role="link"`, `aria-disabled`, hors de la
 * tabulation, et le `onClick` du produit ne lui est pas transmis. `type` n'est jamais transmis à un
 * lien. Le téléchargement et le nouvel onglet sont décidés dans `lien.ts`.
 *
 * ── LE SURVOL EST GARDÉ PAR `(hover: hover)`, EN v1.2.0 ─────────────────────
 * Au doigt, `:hover` se déclenche après la pression et reste collé jusqu'au geste suivant : un bouton
 * touché gardait sa couleur de survol. C'est la seule différence de rendu pour un `<button>`, et elle
 * n'existe qu'au doigt.
```

- [ ] **Step 6 : `Bouton.tsx`, les types (lignes 72 à 98)**

```ts
export type VarianteBouton =
  'primaire' | 'secondaire' | 'neutre' | 'discret' | 'danger' | 'danger-contour';
export type TailleBouton = 'sm' | 'md' | 'lg';

/** Ce que partagent le bouton d'action et le bouton qui mène quelque part. */
interface ProprietesCommunesBouton {
  variante?: VarianteBouton | undefined;
  taille?: TailleBouton | undefined;
  /** Le bouton reste lisible et garde son libellé : la mise en page ne saute pas. */
  chargement?: boolean | undefined;
  /**
   * Le libellé affiché PENDANT le chargement, à la place du libellé normal.
   *
   * Absent, le bouton garde son libellé : c'est le comportement d'avant la v0.5.0, et
   * aucun produit consommateur ne change de rendu.
   *
   * Il nomme l'ACTION, jamais l'attente. « Connexion en cours » et non « Veuillez
   * patienter » : le second ne dit rien que l'estompage ne disait déjà.
   *
   * L'argument historique contre le changement de libellé visait la LARGEUR : un bouton
   * ajusté à son texte change de taille quand le texte change, et la colonne saute. Il
   * reste vrai, et c'est pourquoi cette propriété est optionnelle. Sur un bouton
   * `pleineLargeur`, le texte se recentre sans rien déplacer.
   */
  libelleChargement?: string | undefined;
  /** Occupe toute la largeur disponible. Le registre `CarteAuth` s'en sert. */
  pleineLargeur?: boolean | undefined;
}

/** Le bouton d'action : un `<button>`, rendu exactement comme en 1.1.0. */
export interface ProprietesBoutonAction
  extends ProprietesCommunesBouton,
    ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
}

/** Le bouton qui mène quelque part : un lien, avec l'apparence et les états d'un bouton. */
export interface ProprietesBoutonLien
  extends ProprietesCommunesBouton,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** L'adresse. Sa présence fait du bouton un lien. */
  href: string;
  /** Le lien du routeur du produit ; `a` par défaut. Ignoré avec `download` ou `target="_blank"`. */
  Lien?: ComposantLien | undefined;
  /** Rend un lien inerte : ni adresse, ni focus, et il le dit. */
  disabled?: boolean | undefined;
}

export type ProprietesBouton = ProprietesBoutonAction | ProprietesBoutonLien;
```

- [ ] **Step 7 : `Bouton.tsx`, la feuille (lignes 112 à 218, de `const ID_STYLE` à la fin de `STYLE_BOUTON`)**

```ts
const ID_STYLE = 'ai5d-bouton';

/**
 * Les couleurs et les états, hors du style en ligne. La feuille sert les deux éléments, `<button>` et
 * `<a>`.
 *
 * `:focus-visible` et non `:focus` : un anneau qui apparaît au clic de souris est du
 * bruit, un anneau qui n'apparaît pas au clavier est un mur.
 *
 * L'appui est un déplacement d'un pixel, jamais un changement d'échelle : un `scale` sur
 * un bouton pleine largeur fait bouger toute la colonne, et sur un écran de 440 px cela
 * se voit.
 *
 * Chaque règle de survol et d'appui est gardée par `:not(:disabled)` et
 * `:not([aria-disabled='true'])` : un bouton en chargement, ou un lien inerte, réagirait sinon à la
 * souris tout en refusant le clic. Et depuis la 1.2.0, le survol l'est par `@media (hover: hover)`.
 *
 * Un lien actif rend trois points d'attente, masqués ; le protocole de `lien.ts` les montre.
 */
const STYLE_BOUTON = `
.ai5d-bouton {
  background: transparent;
  color: var(--action);
  border: 1px solid transparent;
  transition:
    background var(--duree-courte) var(--courbe-entree),
    border-color var(--duree-courte) var(--courbe-entree),
    color var(--duree-courte) var(--courbe-entree),
    opacity var(--duree-courte) var(--courbe-entree),
    transform var(--duree-courte) var(--courbe-sortie);
  text-decoration: none;
}

.ai5d-bouton[data-variante='primaire'] {
  background: var(--action);
  color: var(--texte-sur-action);
  border-color: var(--action);
}
.ai5d-bouton[data-variante='secondaire'] {
  background: transparent;
  color: var(--action);
  border-color: var(--action);
}
.ai5d-bouton[data-variante='neutre'] {
  background: var(--surface-2);
  color: var(--texte-fort);
  border-color: var(--bordure-forte);
}
.ai5d-bouton[data-variante='danger'] {
  background: var(--erreur);
  color: var(--texte-sur-erreur);
  border-color: var(--erreur);
}
.ai5d-bouton[data-variante='danger-contour'] {
  background: transparent;
  color: var(--erreur);
  border-color: var(--erreur);
}

@media (hover: hover) {
  .ai5d-bouton:not(:disabled):not([aria-disabled='true']):hover[data-variante='primaire'] {
    background: var(--action-survol);
    border-color: var(--action-survol);
  }
  .ai5d-bouton:not(:disabled):not([aria-disabled='true']):hover[data-variante='secondaire'],
  .ai5d-bouton:not(:disabled):not([aria-disabled='true']):hover[data-variante='discret'] {
    background: var(--info-fond);
  }
  .ai5d-bouton:not(:disabled):not([aria-disabled='true']):hover[data-variante='neutre'] {
    background: var(--surface-chaude);
    border-color: var(--texte-faible);
  }
  .ai5d-bouton:not(:disabled):not([aria-disabled='true']):hover[data-variante='danger'] {
    background: var(--erreur-survol);
    border-color: var(--erreur-survol);
  }
  .ai5d-bouton:not(:disabled):not([aria-disabled='true']):hover[data-variante='danger-contour'] {
    background: var(--erreur-fond);
  }
}

.ai5d-bouton:not(:disabled):not([aria-disabled='true']):active { transform: translateY(1px); }

.ai5d-bouton:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }
.ai5d-bouton[data-variante='danger']:focus-visible,
.ai5d-bouton[data-variante='danger-contour']:focus-visible { outline-color: var(--erreur); }

.ai5d-bouton__points {
  display: inline-flex;
  align-items: center;
  gap: var(--espace-1);
}
.ai5d-bouton__points--attente { display: none; }
.ai5d-bouton:is([data-en-attente], :has([data-en-attente])) .ai5d-bouton__points--attente {
  display: inline-flex;
}
.ai5d-bouton__point {
  width: 4px;
  height: 4px;
  border-radius: var(--rayon-plein);
  background: currentColor;
  opacity: 0.35;
  animation: ai5d-bouton-point 1200ms infinite ease-in-out;
}
.ai5d-bouton__point:nth-child(2) { animation-delay: 160ms; }
.ai5d-bouton__point:nth-child(3) { animation-delay: 320ms; }

@keyframes ai5d-bouton-point {
  0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-bouton:not(:disabled):not([aria-disabled='true']):active { transform: none; }
  .ai5d-bouton__point { animation: none; opacity: 1; }
}
`;
```

- [ ] **Step 8 : `Bouton.tsx`, le rendu (lignes 220 à 308, du commentaire de `PointsDeChargement` à la fin du fichier)**

```tsx
/**
 * Trois points, décoratifs.
 *
 * `aria-hidden` : l'information est dans le libellé de chargement et dans `aria-busy`.
 * Un lecteur d'écran qui annoncerait trois points n'apprendrait rien à personne.
 *
 * `currentColor`, jamais un jeton. Le bouton primaire porte `--texte-sur-action`, le
 * `danger` porte `--texte-sur-erreur`, le `neutre` porte `--texte-fort` : trois points
 * figés sur une seule de ces valeurs seraient faux sur deux boutons sur trois.
 */
function PointsDeChargement() {
  return (
    <span className="ai5d-bouton__points" aria-hidden="true">
      <span className="ai5d-bouton__point" />
      <span className="ai5d-bouton__point" />
      <span className="ai5d-bouton__point" />
    </span>
  );
}

/**
 * Les trois points de l'attente de navigation.
 *
 * Tout bouton en lien actif les rend, masqués ; le protocole de `lien.ts` les montre quand le lien,
 * ou l'un de ses descendants, porte `data-en-attente`. Un `<button>` ne les rend pas : il a
 * `chargement`.
 */
function PointsDAttente() {
  return (
    <span className="ai5d-bouton__points ai5d-bouton__points--attente" aria-hidden="true">
      <span className="ai5d-bouton__point" />
      <span className="ai5d-bouton__point" />
      <span className="ai5d-bouton__point" />
    </span>
  );
}

interface OptionsStyle {
  taille: TailleBouton;
  pleineLargeur: boolean;
  curseur: CSSProperties['cursor'];
  opacite: number;
  style: CSSProperties | undefined;
}

/**
 * Le style en ligne, commun aux deux éléments. Il garde ce qui dépend des propriétés reçues : la
 * hauteur selon la taille, la largeur pleine, le curseur et l'opacité. Les couleurs et les états sont
 * dans la feuille. Un `style` du consommateur gagne, comme avant.
 */
function styleDuBouton({
  taille,
  pleineLargeur,
  curseur,
  opacite,
  style,
}: OptionsStyle): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--espace-2)',
    height: HAUTEURS[taille],
    // Le plancher tactile s'applique deja sur --hauteur-controle ; on le rappelle
    // ici pour la taille sm, qui soustrait 8 px.
    minHeight: 'var(--cible-tactile)',
    minWidth: 'var(--cible-tactile)',
    padding: '0 20px',
    width: pleineLargeur ? '100%' : undefined,
    fontFamily: 'var(--police-corps)',
    fontSize: TAILLES_TEXTE[taille],
    fontWeight: 'var(--graisse-semi)',
    lineHeight: 1,
    borderRadius: 'var(--rayon-md)',
    /*
      UN BOUTON QUI CHARGE N EST PAS UN BOUTON INDISPONIBLE.

      L opacite de 0.6 s appliquait aux deux etats. Mesure apres l ajout du libelle de
      chargement : « Connexion en cours » sur un bouton primaire a 60 % donne 1,95 en
      clair et 1,89 en sombre, tres loin du seuil AA de 4,5. Le bouton porte desormais la
      seule information de l ecran, et il en etait l element le moins lisible.

      L estompage reste pour `disabled`, ou il dit la verite : cette action n est pas
      disponible. Le chargement garde sa pleine opacite, et son curseur dit qu on attend
      plutot qu on est refuse.
    */
    cursor: curseur,
    opacity: opacite,
    ...style,
  };
}

/** Le bouton d'action. Son rendu est celui de la 1.1.0, au caractère près : un test le compare. */
function BoutonAction({
  variante = 'primaire',
  taille = 'md',
  chargement = false,
  libelleChargement,
  pleineLargeur = false,
  disabled,
  className,
  style,
  children,
  type = 'button',
  href: _href,
  ...reste
}: ProprietesBoutonAction) {
  const inactif = disabled === true || chargement;

  const styleBouton = styleDuBouton({
    taille,
    pleineLargeur,
    curseur: chargement ? 'progress' : disabled === true ? 'not-allowed' : 'pointer',
    opacite: disabled === true ? 0.6 : 1,
    style,
  });

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_BOUTON }} />

      <button
        type={type}
        className={className === undefined ? 'ai5d-bouton' : `ai5d-bouton ${className}`}
        style={styleBouton}
        disabled={inactif}
        aria-busy={chargement || undefined}
        data-variante={variante}
        data-taille={taille}
        {...reste}
      >
        {chargement && libelleChargement !== undefined ? libelleChargement : children}
        {chargement ? <PointsDeChargement /> : null}
      </button>
    </>
  );
}

/**
 * Le bouton qui mène quelque part.
 *
 * Inactif, désactivé ou en chargement, il perd son adresse : un lien sans `href` ne navigue pas, ne
 * prend pas le focus, et `role="link"` avec `aria-disabled` le fait annoncer « lien, indisponible ».
 * Le `onClick` du produit ne lui est pas transmis : un `<a>` sans adresse reçoit encore les clics, là
 * où un `<button disabled>` les refuse.
 */
function BoutonLien({
  variante = 'primaire',
  taille = 'md',
  chargement = false,
  libelleChargement,
  pleineLargeur = false,
  href,
  Lien,
  disabled,
  download,
  target,
  rel,
  onClick,
  className,
  style,
  children,
  type: _type,
  ...reste
}: ProprietesBoutonLien) {
  const classe = className === undefined ? 'ai5d-bouton' : `ai5d-bouton ${className}`;
  const feuille = <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_BOUTON }} />;

  if (disabled === true || chargement) {
    return (
      <>
        {feuille}
        <a
          {...reste}
          role="link"
          aria-disabled="true"
          aria-busy={chargement || undefined}
          className={classe}
          style={styleDuBouton({
            taille,
            pleineLargeur,
            curseur: chargement ? 'progress' : 'not-allowed',
            opacite: disabled === true ? 0.6 : 1,
            style,
          })}
          data-variante={variante}
          data-taille={taille}
        >
          {chargement && libelleChargement !== undefined ? libelleChargement : children}
          {chargement ? <PointsDeChargement /> : null}
        </a>
      </>
    );
  }

  const nouvelOnglet = target === '_blank';
  const attributs = {
    className: classe,
    style: styleDuBouton({ taille, pleineLargeur, curseur: 'pointer', opacite: 1, style }),
    'data-variante': variante,
    'data-taille': taille,
  };
  const contenu = (
    <>
      {children}
      <PointsDAttente />
      {nouvelOnglet ? (
        <span className={CLASSE_HORS_ECRAN}>{` ${MENTION_NOUVEL_ONGLET}`}</span>
      ) : null}
    </>
  );

  return (
    <>
      {feuille}
      {nouvelOnglet ? (
        <style id={ID_STYLE_HORS_ECRAN} dangerouslySetInnerHTML={{ __html: STYLE_HORS_ECRAN }} />
      ) : null}

      {Lien === undefined || lienNatif({ download, target }) ? (
        <a
          {...reste}
          {...attributs}
          href={href}
          download={download}
          target={target}
          rel={relSur(rel, target)}
          onClick={onClick}
        >
          {contenu}
        </a>
      ) : (
        <Lien
          {...reste}
          {...attributs}
          href={href}
          target={target}
          rel={relSur(rel, target)}
          onClick={onClick}
        >
          {contenu}
        </Lien>
      )}
    </>
  );
}

/** Vrai quand le bouton reçoit une adresse : il devient un lien. */
function estBoutonLien(proprietes: ProprietesBouton): proprietes is ProprietesBoutonLien {
  return typeof proprietes.href === 'string';
}

export function Bouton(proprietes: ProprietesBouton) {
  return estBoutonLien(proprietes) ? (
    <BoutonLien {...proprietes} />
  ) : (
    <BoutonAction {...proprietes} />
  );
}
```

- [ ] **Step 9 : nommer l'exception de `lien.ts` dans `HORS_ECHELLE` (`gardes/gardes.test.ts`)**

Dans l'objet `HORS_ECHELLE`, après l'entrée `Bouton.tsx` :

```ts
    // Le texte hors ecran : un pixel, et sa marge negative d un pixel. Une construction, pas un pas.
    'noyau/composants/lien.ts': ['-1px'],
```

- [ ] **Step 10 : écrire `tests/composants/bouton-lien.test.tsx`**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import type { AnchorHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { Bouton, type ProprietesBoutonAction } from '../../noyau/composants/Bouton';
import type { ComposantLien } from '../../noyau/composants/LiensRail';
import {
  ATTRIBUT_EN_ATTENTE,
  CLASSE_HORS_ECRAN,
  MENTION_NOUVEL_ONGLET,
  lienNatif,
  relSur,
} from '../../noyau/composants/lien';
import { Bouton as Bouton110 } from '../instantanes/Bouton-1.1.0';

/**
 * `Bouton` rendu en lien (SPEC 1.2.0, §5.2).
 *
 * Deux produits naviguaient par un script depuis un `<button>`, parce que le bouton du système n'en
 * savait pas plus. Ce qui se garde ici : un appel sans adresse rend le bouton de la 1.1.0 au caractère
 * près ; un lien reçoit tout ce qu'un bouton porte ; le téléchargement et le nouvel onglet ne passent
 * jamais par le routeur ; un lien inerte ne navigue pas, ne prend pas le focus, ne transmet pas le clic.
 */

function feuille(): string {
  return document.getElementById('ai5d-bouton')?.innerHTML ?? '';
}

/** Un lien de produit qui retient ce qu'il reçoit, et le transmet tout entier, comme `Link` de Next. */
function espion() {
  const recus: Array<ComponentProps<ComposantLien>> = [];
  const Lien: ComposantLien = (proprietes) => {
    recus.push(proprietes);
    const { children, ...reste } = proprietes;
    return (
      <a data-lien-produit="" {...reste}>
        {children}
      </a>
    );
  };
  return { Lien, recus };
}

describe('Bouton sans adresse : exactement le bouton de la 1.1.0', () => {
  const CAS: ProprietesBoutonAction[] = [
    {},
    { variante: 'secondaire' },
    { variante: 'neutre', taille: 'sm' },
    { variante: 'danger', taille: 'lg' },
    { variante: 'danger-contour', pleineLargeur: true },
    { chargement: true },
    { chargement: true, libelleChargement: 'Connexion en cours' },
    { disabled: true },
    { type: 'submit', className: 'ma-classe', 'aria-label': 'Envoyer le formulaire' },
    { style: { marginTop: 'var(--espace-4)' } },
  ];

  for (const [index, cas] of CAS.entries()) {
    it(`cas ${index + 1} : ${JSON.stringify(cas)}`, () => {
      const avant = render(<Bouton110 {...cas}>Envoyer</Bouton110>).container.querySelector(
        'button',
      );
      const apres = render(<Bouton {...cas}>Envoyer</Bouton>).container.querySelector('button');
      expect(apres).not.toBeNull();
      expect(apres?.outerHTML).toBe(avant?.outerHTML);
    });
  }
});

describe('Bouton avec une adresse : un lien, avec les classes et les etats d un bouton', () => {
  it('rend le lien du produit, et lui transmet classe, style, variante et taille', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton href="/formations/ia-relation-client" Lien={Lien} pleineLargeur>
        Voir ma formation
      </Bouton>,
    );
    const lien = screen.getByRole('link', { name: 'Voir ma formation' });
    expect(lien).toHaveAttribute('data-lien-produit');
    expect(lien).toHaveAttribute('href', '/formations/ia-relation-client');

    expect(recus).toHaveLength(1);
    expect(recus[0]?.className).toBe('ai5d-bouton');
    expect(recus[0]?.style?.height).toBe('var(--hauteur-controle)');
    expect(recus[0]?.style?.width).toBe('100%');
    expect(recus[0]).toMatchObject({ 'data-variante': 'primaire', 'data-taille': 'md' });
  });

  it('sans lien du produit, rend un a natif avec la classe, la variante et la hauteur', () => {
    render(<Bouton href="/formations">Mes formations</Bouton>);
    const lien = screen.getByRole('link', { name: 'Mes formations' });
    expect(lien.tagName).toBe('A');
    expect(lien).toHaveClass('ai5d-bouton');
    expect(lien).toHaveAttribute('data-variante', 'primaire');
    expect(lien.style.height).toContain('--hauteur-controle');
    expect(lien.style.minHeight).toContain('--cible-tactile');
  });

  it('garde la hauteur de densite dans les trois tailles', () => {
    for (const taille of ['sm', 'md', 'lg'] as const) {
      const { container, unmount } = render(
        <Bouton href="/formations" taille={taille}>
          Voir
        </Bouton>,
      );
      const lien = container.querySelector('a');
      expect(lien).toHaveAttribute('data-taille', taille);
      expect(lien?.style.height).toContain('--hauteur-controle');
      unmount();
    }
  });

  it('avec download, ignore le lien du produit : un routeur client ne telecharge pas', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton variante="neutre" href="/api/sessions/7K3F9Q/calendrier.ics" download Lien={Lien}>
        Ajouter à mon calendrier
      </Bouton>,
    );
    const lien = screen.getByRole('link', { name: 'Ajouter à mon calendrier' });
    expect(recus).toHaveLength(0);
    expect(lien).not.toHaveAttribute('data-lien-produit');
    expect(lien).toHaveAttribute('download');
  });

  it('transmet un nom de fichier en download tel quel', () => {
    render(
      <Bouton href="/attestation.pdf" download="attestation-AI5D-2026-7K3F9Q.pdf">
        Télécharger
      </Bouton>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('download', 'attestation-AI5D-2026-7K3F9Q.pdf');
  });

  it('avec download={false}, reste un lien du routeur', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton href="/formations" download={false} Lien={Lien}>
        Mes formations
      </Bouton>,
    );
    expect(recus).toHaveLength(1);
  });

  it('avec target _blank : a natif, rel complete, mention du nouvel onglet lue et hors ecran', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton
        variante="discret"
        href="https://exemple.invalid/session"
        target="_blank"
        Lien={Lien}
      >
        Rejoindre la session
      </Bouton>,
    );
    const lien = screen.getByRole('link', {
      name: `Rejoindre la session ${MENTION_NOUVEL_ONGLET}`,
    });
    expect(recus).toHaveLength(0);
    expect(lien).toHaveAttribute('target', '_blank');
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer');
    expect(lien.querySelector(`.${CLASSE_HORS_ECRAN}`)).toHaveTextContent(MENTION_NOUVEL_ONGLET);
    expect(document.getElementById('ai5d-hors-ecran')).not.toBeNull();
  });

  it('complete le rel du produit sans doublon, quelle que soit sa casse', () => {
    render(
      <Bouton href="https://exemple.invalid" target="_blank" rel="NoOpener external">
        Voir
      </Bouton>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'NoOpener external noreferrer');
  });

  it('desactive : aucune adresse, lien indisponible, hors de la tabulation, aucun clic transmis', async () => {
    const clic = vi.fn();
    render(
      <>
        <Bouton href="/formations" disabled onClick={clic}>
          Voir ma formation
        </Bouton>
        <button type="button">Suivant</button>
      </>,
    );
    const lien = screen.getByText('Voir ma formation').closest('a');
    expect(lien).not.toBeNull();
    expect(lien).not.toHaveAttribute('href');
    expect(lien).toHaveAttribute('role', 'link');
    expect(lien).toHaveAttribute('aria-disabled', 'true');
    expect(lien?.style.opacity).toBe('0.6');
    expect(lien?.style.cursor).toBe('not-allowed');

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Suivant' })).toHaveFocus();

    if (lien !== null) fireEvent.click(lien);
    expect(clic).not.toHaveBeenCalled();
  });

  it('en chargement : aucune adresse, occupe, pleine opacite, trois points, libelle de chargement', () => {
    const { container } = render(
      <Bouton href="/formations" chargement libelleChargement="Ouverture de la formation">
        Voir ma formation
      </Bouton>,
    );
    const lien = container.querySelector('a');
    expect(lien).not.toHaveAttribute('href');
    expect(lien).toHaveAttribute('aria-busy', 'true');
    expect(lien).toHaveAttribute('aria-disabled', 'true');
    expect(lien?.style.opacity).toBe('1');
    expect(lien?.style.cursor).toBe('progress');
    expect(lien).toHaveTextContent('Ouverture de la formation');
    expect(
      container.querySelectorAll(
        '.ai5d-bouton__points:not(.ai5d-bouton__points--attente) .ai5d-bouton__point',
      ),
    ).toHaveLength(3);
  });

  it('ne transmet jamais type a un lien', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton href="/formations" type="button" Lien={Lien}>
        Voir
      </Bouton>,
    );
    expect(recus[0]).not.toHaveProperty('type');

    render(
      <Bouton href="/formations" type="button">
        Voir aussi
      </Bouton>,
    );
    expect(screen.getByRole('link', { name: 'Voir aussi' })).not.toHaveAttribute('type');
  });

  it('rend ses points d attente, masques, que le protocole montre', () => {
    const { container } = render(<Bouton href="/formations">Voir</Bouton>);
    const points = container.querySelector('.ai5d-bouton__points--attente');
    expect(points).toHaveAttribute('aria-hidden', 'true');
    expect(points?.querySelectorAll('.ai5d-bouton__point')).toHaveLength(3);
    expect(ATTRIBUT_EN_ATTENTE).toBe('data-en-attente');

    const css = feuille().replace(/\s+/g, ' ');
    expect(css).toContain('.ai5d-bouton__points--attente { display: none; }');
    expect(css).toContain(
      '.ai5d-bouton:is([data-en-attente], :has([data-en-attente])) .ai5d-bouton__points--attente { display: inline-flex; }',
    );
  });

  it('un bouton d action ne rend aucun point au repos', () => {
    const { container } = render(<Bouton>Envoyer</Bouton>);
    expect(container.querySelectorAll('.ai5d-bouton__point')).toHaveLength(0);
  });

  it('se rend au serveur, sans JavaScript : un vrai lien', () => {
    // Compte : « Revenir au portail » redevient un lien que le clic du milieu ouvre (US-S04).
    const html = renderToStaticMarkup(
      <Bouton href="/" pleineLargeur>
        Revenir au portail
      </Bouton>,
    );
    expect(html).toContain('<a ');
    expect(html).toContain('href="/"');
    expect(readFileSync('noyau/composants/Bouton.tsx', 'utf8').startsWith("'use client';")).toBe(
      false,
    );
  });
});

describe('la feuille du bouton, qu il soit bouton ou lien', () => {
  it('garde tout survol par (hover: hover) : au doigt, il restait colle apres le toucher', () => {
    render(<Bouton>Envoyer</Bouton>);
    const brut = feuille();
    expect(brut).toContain('@media (hover: hover) {');
    expect(brut.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')).not.toContain(':hover');
  });

  it('exclut du survol et de l appui tout element inerte, bouton ou lien', () => {
    render(<Bouton>Envoyer</Bouton>);
    const css = feuille().replace(/\s+/g, ' ');
    const regles = css.split('}').filter((r) => r.includes(':hover') || r.includes(':active'));
    expect(regles.length).toBeGreaterThan(0);
    for (const regle of regles) {
      expect(regle, regle).toContain(":not(:disabled):not([aria-disabled='true'])");
    }
  });

  it('ne souligne jamais un bouton en lien', () => {
    render(<Bouton>Envoyer</Bouton>);
    expect(feuille().replace(/\s+/g, ' ')).toMatch(/\.ai5d-bouton \{[^}]*text-decoration: none;/);
  });
});

describe('lien.ts', () => {
  it('relSur ne touche pas un lien qui reste dans l onglet', () => {
    expect(relSur(undefined, undefined)).toBeUndefined();
    expect(relSur('external', '_self')).toBe('external');
  });

  it('relSur ajoute noopener et noreferrer a un nouvel onglet, sans doublon', () => {
    expect(relSur(undefined, '_blank')).toBe('noopener noreferrer');
    expect(relSur('noopener', '_blank')).toBe('noopener noreferrer');
    expect(relSur('  external   noreferrer ', '_blank')).toBe('external noreferrer noopener');
  });

  it('lienNatif decide une fois quand le lien du routeur n est jamais employe', () => {
    expect(lienNatif({ download: true })).toBe(true);
    expect(lienNatif({ download: 'fichier.ics' })).toBe(true);
    expect(lienNatif({ download: '' })).toBe(true);
    expect(lienNatif({ download: false })).toBe(false);
    expect(lienNatif({})).toBe(false);
    expect(lienNatif({ target: '_blank' })).toBe(true);
    expect(lienNatif({ target: '_self' })).toBe(false);
  });

  it('la mention du nouvel onglet est la formulation de reference', () => {
    expect(MENTION_NOUVEL_ONGLET).toBe('(s’ouvre dans un nouvel onglet)');
  });
});

describe('ComposantLien accepte tous les attributs d un lien (SPEC 1.2.0, §5.0.3)', () => {
  it('un lien qui accepte les attributs d un a, comme Link de Next, reste assignable', () => {
    const LienLarge = ({
      children,
      ...reste
    }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) => (
      <a {...reste}>{children}</a>
    );
    const lien: ComposantLien = LienLarge;
    expect(lien).toBe(LienLarge);
  });

  it('un lien type sur une forme etroite, sans etat courant, reste assignable', () => {
    const LienEtroit = ({
      href,
      className,
      children,
    }: {
      href: string;
      className?: string | undefined;
      children: ReactNode;
    }) => (
      <a href={href} className={className}>
        {children}
      </a>
    );
    const lien: ComposantLien = LienEtroit;
    expect(lien).toBe(LienEtroit);
  });

  it('un lien type sur l ancienne forme, etat courant limite a page, ne compile plus', () => {
    /*
      Constate par tsc le 26 septembre 2026 : `aria-current` d un lien admet aussi `true`, `step`,
      `location`. Un produit qui aurait type son lien ainsi le type par `ComponentProps<ComposantLien>`,
      et le journal de la 1.2.0 le dit. Le jour ou cette ligne compile de nouveau, la directive echoue
      et quelqu un relit ce paragraphe.
    */
    const LienAncien = ({
      href,
      children,
    }: {
      href: string;
      'aria-current'?: 'page' | undefined;
      children: ReactNode;
    }) => <a href={href}>{children}</a>;
    // @ts-expect-error aria-current d un lien est plus large que la seule valeur page
    const lien: ComposantLien = LienAncien;
    expect(lien).toBe(LienAncien);
  });
});
```

- [ ] **Step 11 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/composants/lien.ts noyau/composants/LiensRail.tsx noyau/composants/BarreOnglets.tsx noyau/composants/GabaritDocument.tsx noyau/composants/Bouton.tsx tests/composants/bouton-lien.test.tsx gardes/gardes.test.ts
```

Cocher T4 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/composants/lien.ts noyau/composants/LiensRail.tsx noyau/composants/BarreOnglets.tsx noyau/composants/GabaritDocument.tsx noyau/composants/Bouton.tsx tests/composants/bouton-lien.test.tsx gardes/gardes.test.ts tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Le bouton peut être un lien, avec ses variantes et ses états, et le lien du produit reçoit tous les attributs d’un lien
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 5 : Le ton `neutre`

SPEC §5.3. Deuxième consommateur constaté : Compte écrit « SANS ACCÈS » en texte faute de ton
(`CarteProduit.tsx:26-28`, `acces-libelles.ts:17-21`).

**Files:**
- Modify: `noyau/composants/Pastille.tsx:3-22`
- Modify: `noyau/composants/Bandeau.tsx:7-14` (en-tête) et `:25-45` (les trois tables)
- Modify: `tests/composants/composants.test.tsx` (imports, et un bloc ajouté en fin de fichier)

**Interfaces:**
- Consumes : rien de nouveau.
- Produces : `TonSemantique = 'information' | 'reussite' | 'attention' | 'erreur' | 'neutre'`, accepté
  par `Pastille`, `PastilleEtat`, `Bandeau` et `EtatCarteAction`, sans changement de code dans les deux
  derniers. `PastilleEtat.tsx` ne change pas : son point prend `currentColor`.

- [ ] **Step 1 : `noyau/composants/Pastille.tsx`, lignes 3 à 22**

```tsx
/**
 * La pastille — un état, en version compacte.
 *
 * Elle contient toujours du texte. Une pastille de couleur sans mot ne dit rien à qui
 * ne distingue pas les couleurs, et rien du tout à qui la découvre.
 *
 * ── LE TON `neutre`, EN v1.2.0 ──────────────────────────────────────────────
 * Il dit « rien à signaler » : un état au repos, qui ne demande aucun geste et n'annonce aucune
 * réussite (« Inscription confirmée », « Formation terminée », « Sans accès »). Il ne dit jamais un
 * état qui attend un geste, c'est `attention`, ni un échec, c'est `erreur`. Texte faible sur surface
 * chaude : 4,53 en clair, 5,79 en sombre, mesurés par la garde de contraste. En sombre, le fond ne se
 * détache pas d'une carte ; c'est le mot qui porte l'état, comme partout dans le système.
 */

export type TonSemantique = 'information' | 'reussite' | 'attention' | 'erreur' | 'neutre';

export interface ProprietesPastille extends HTMLAttributes<HTMLSpanElement> {
  ton?: TonSemantique | undefined;
  children: ReactNode;
}

const COULEURS: Record<TonSemantique, { texte: string; fond: string }> = {
  information: { texte: 'var(--info)', fond: 'var(--info-fond)' },
  reussite: { texte: 'var(--reussite)', fond: 'var(--reussite-fond)' },
  attention: { texte: 'var(--attention)', fond: 'var(--attention-fond)' },
  erreur: { texte: 'var(--erreur)', fond: 'var(--erreur-fond)' },
  neutre: { texte: 'var(--texte-faible)', fond: 'var(--surface-chaude)' },
};
```

- [ ] **Step 2 : `noyau/composants/Bandeau.tsx`**

Dans l'en-tête (lignes 7 à 14), avant la ligne ` */` qui le ferme, ajouter :

```tsx
 *
 * Le ton `neutre` (v1.2.0) dit « rien à signaler » : icône `Info`, `role="status"`, contour et titre
 * en texte faible, corps en `--texte`. Le contour suit la règle des quatre autres tons, la couleur du
 * ton : en `--bordure-forte`, le bandeau ne se détacherait pas du papier (1,49).
```

Remplacer les trois tables (lignes 25 à 45) par :

```tsx
const ICONES: Record<TonSemantique, LucideIcon> = {
  information: Info,
  reussite: CheckCircle2,
  attention: AlertTriangle,
  erreur: XCircle,
  neutre: Info,
};

const COULEURS: Record<TonSemantique, { texte: string; fond: string }> = {
  information: { texte: 'var(--info)', fond: 'var(--info-fond)' },
  reussite: { texte: 'var(--reussite)', fond: 'var(--reussite-fond)' },
  attention: { texte: 'var(--attention)', fond: 'var(--attention-fond)' },
  erreur: { texte: 'var(--erreur)', fond: 'var(--erreur-fond)' },
  neutre: { texte: 'var(--texte-faible)', fond: 'var(--surface-chaude)' },
};

/** `alert` interrompt le lecteur d'écran ; `status` attend. Le ton décide. */
const ROLES: Record<TonSemantique, 'status' | 'alert'> = {
  information: 'status',
  reussite: 'status',
  attention: 'alert',
  erreur: 'alert',
  neutre: 'status',
};
```

- [ ] **Step 3 : les tests, dans `tests/composants/composants.test.tsx`**

Ligne 4, remplacer l'import de `lucide-react` par :

```tsx
import { Info, Mail, Shield } from 'lucide-react';
```

Dans l'import de `../../noyau/composants` (lignes 5 à 21), ajouter `CarteAction` et `PastilleEtat`
à la liste, dans l'ordre alphabétique.

Ajouter en fin de fichier :

```tsx
describe('le ton neutre (1.2.0)', () => {
  it('Pastille : texte faible sur surface chaude, et le mot, toujours', () => {
    const element = Pastille({ ton: 'neutre', children: 'Inscription confirmée' });
    expect(element.props.style).toMatchObject({
      color: 'var(--texte-faible)',
      background: 'var(--surface-chaude)',
    });
    expect(element.props['data-ton']).toBe('neutre');

    render(<Pastille ton="neutre">Inscription confirmée</Pastille>);
    expect(screen.getByText('Inscription confirmée')).toHaveAttribute('data-ton', 'neutre');
  });

  it('PastilleEtat : le point prend la couleur du ton, donc le texte faible', () => {
    const { container } = render(<PastilleEtat ton="neutre">Formation terminée</PastilleEtat>);
    const pastille = container.querySelector('[data-ton="neutre"]');
    expect(pastille).toHaveTextContent('Formation terminée');
    expect(pastille?.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('Bandeau : icone Info, role status, contour et titre en texte faible, corps en texte', () => {
    const element = Bandeau({
      ton: 'neutre',
      titre: 'Formation terminée',
      children: 'Votre attestation sera délivrée par l’équipe AI5D.',
    });
    expect(element.props.role).toBe('status');
    expect(element.props.style).toMatchObject({
      background: 'var(--surface-chaude)',
      border: '1px solid var(--texte-faible)',
      color: 'var(--texte)',
    });

    const { container } = render(
      <Bandeau ton="neutre" titre="Formation terminée">
        Votre attestation sera délivrée par l’équipe AI5D.
      </Bandeau>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Formation terminée').style.color).toBe('var(--texte-faible)');

    const reference = render(<Icone nom={Info} taille={20} />).container.querySelector('svg');
    expect(container.querySelector('svg')?.innerHTML).toBe(reference?.innerHTML);
  });

  it('CarteAction accepte un etat neutre sans changement de code', () => {
    const { container } = render(
      <CarteAction
        icone={Shield}
        titre="AI5D Lab"
        action="Voir le produit"
        etat={{ ton: 'neutre', libelle: 'Sans accès' }}
      />,
    );
    expect(container.querySelector('[data-ton="neutre"]')).toHaveTextContent('Sans accès');
  });
});
```

- [ ] **Step 4 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/composants/Pastille.tsx noyau/composants/Bandeau.tsx tests/composants/composants.test.tsx
```

Cocher T5 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/composants/Pastille.tsx noyau/composants/Bandeau.tsx tests/composants/composants.test.tsx tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Le ton neutre dit « rien à signaler » dans les pastilles et les bandeaux
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 6 : `OngletsRubrique` relié au routeur, jusqu'à six, et son débordement mesuré par le navigateur

SPEC §5.4 ; décision 007. Deuxième consommateur constaté pour le lien : `OngletsPortail.tsx:95-99`
de Compte rend les onglets sans lien du routeur, et chaque sous-page recharge le document.

**Files:**
- Modify: `noyau/composants/OngletsRubrique.tsx` (réécrit en entier)
- Modify: `tests/composants/onglets-rubrique.test.tsx` (imports, le test « ne pose AUCUN voile » des lignes 118 à 136, et un bloc ajouté)
- Modify: `gardes/gardes.test.ts` (entrée `OngletsRubrique.tsx` de `HORS_ECHELLE`)
- Create: `docs/decisions/007-le-fondu-des-onglets-revient-mesure-par-le-navigateur.md`

**Interfaces:**
- Consumes : `ComposantLien` (tâche 4) ; le sélecteur d'attente de `lien.ts`, écrit tel quel.
- Produces : `ProprietesOngletsRubrique` gagne `Lien?: ComposantLien | undefined` ;
  `ONGLETS_RUBRIQUE_MIN = 2`, `ONGLETS_RUBRIQUE_MAX = 6` ; `HAUTEUR_ONGLETS = 44` inchangé.

- [ ] **Step 1 : réécrire `noyau/composants/OngletsRubrique.tsx`**

```tsx
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icone } from './Icone';
import type { ComposantLien } from './LiensRail';

/**
 * La navigation entre les sous-pages d'une rubrique.
 *
 * ── ELLE N'EST PAS `BarreOnglets`, ET LA CONFUSION SERAIT COÛTEUSE ──────────
 * `BarreOnglets` est une barre BASSE et FIXE de coquille mobile, qui disparaît au palier
 * tablette parce qu'au-delà l'appareil se pose et qu'une bande de 56 px en bas de l'écran
 * est du gaspillage. Celle-ci est HAUTE, dans le flux du document, et présente à tous les
 * paliers.
 *
 * Deux composants portant le mot « onglet » pour deux rôles opposés, c'est assumé : le nom
 * dit ce que la chose EST, et ces deux choses sont différentes. Le jour où quelqu'un
 * cherchera « les onglets », il trouvera les deux et lira ce paragraphe.
 *
 * ── CE SONT DES LIENS, PAS UN `tablist` ─────────────────────────────────────
 * Le motif ARIA `tablist` promet des panneaux qui apparaissent sans navigation, et un
 * lecteur d'écran qui l'entend attend les flèches pour circuler. Ici la page change
 * vraiment : chaque onglet est une route rendue au serveur, qui se met en signet et revient
 * par le bouton Retour du navigateur.
 *
 * On emploie donc `nav` et `aria-current="page"`, et les flèches ne font rien, ce qui est
 * exactement le comportement attendu d'une liste de liens. Annoncer un `tablist` qui
 * navigue serait une promesse fausse.
 *
 * ── L'ÉTAT ACTIF PASSE PAR TROIS SIGNAUX ────────────────────────────────────
 * La couleur d'action, la graisse semi-grasse, et le trait de 2 px. Les trois ensemble, ou
 * l'information n'atteint pas tout le monde : près d'un homme sur douze ne distingue pas
 * correctement le rouge du vert, et un trait de 2 px seul se rate au balayage. C'est la
 * même règle que celle écrite dans `BarreOnglets`, et pour la même raison.
 *
 * ── LE DÉBORDEMENT SE VOIT PAR UN FONDU, MESURÉ PAR LE NAVIGATEUR ──────────
 * Trois onglets de deux mots ne tiennent pas sur un téléphone de 390 px. Le conteneur
 * défile, et son ascenseur est masqué.
 *
 * La 0.6.0 y posait un dégradé fixe de 24 px ; la 0.6.3 l'a retiré, parce qu'un voile posé sans
 * mesure se dessinait aussi là où rien ne débordait, et qu'une mesure au montage aurait fait de ce
 * composant un module client. La 1.2.0 le rend, sans mesure ni script : c'est la frise de défilement
 * du conteneur, sous `@supports (animation-timeline: scroll())`, qui choisit le bord. Quand rien ne
 * déborde, la frise est inactive et aucun masque ne s'applique. Sans prise en charge, le dernier
 * onglet coupé net par le bord reste le signal, comme en 0.6.3. Décision 007.
 *
 * L'onglet actif est amené dans la vue au premier affichage par `scroll-initial-target`, sous
 * `@supports`, pour la même raison : un `scrollIntoView` demanderait un effet, donc une directive
 * client, et ferait tomber tout appelant serveur qui passe des icônes.
 *
 * Constaté le 26 septembre 2026 (Playwright 1.57) : Chromium 143 fait les deux, WebKit 26 le fondu
 * seul, Firefox 144 aucun des deux.
 *
 * ── LE LIEN DU PRODUIT, L'APPUI ET L'ATTENTE, EN v1.2.0 ────────────────────
 * Avec `Lien`, changer d'onglet ne recharge plus le document. L'appui pose la surface de sélection
 * sans transition ; une navigation en attente, selon le protocole de `lien.ts`, fait pulser un trait
 * bas, que l'onglet actif ne montre jamais. La borne passe de cinq à six : une session à distance du
 * Portail a six sous-pages, et fusionner le badge et l'attestation confondrait deux objets.
 *
 * ── LE COMPOSANT NE DÉDUIT PAS L'ACTIF, IL LE REÇOIT ────────────────────────
 * Déduire le chemin courant demanderait un routeur, donc une dépendance à un framework,
 * dans un système qui n'en a aucune. Le consommateur lit son chemin et passe un
 * identifiant.
 *
 * Avertissement à son intention, écrit ici parce que c'est ici qu'on le lira : sous Next
 * App Router, il doit le faire dans un composant CLIENT. Un gabarit partagé n'est pas
 * rejoué quand on passe d'une route sœur à l'autre, et l'onglet actif resterait figé sur la
 * première sous-page ouverte.
 */

export interface OngletRubrique {
  /** Identifiant stable. C'est lui que compare `actif`. */
  id: string;
  /** Le libellé. Deux mots au plus. */
  libelle: string;
  /** L'adresse de la sous-page. Toujours fournie : ce sont des liens. */
  href: string;
  /** Une icône Lucide, importée par le consommateur. Facultative. */
  icone?: LucideIcon | undefined;
}

export interface ProprietesOngletsRubrique {
  /** Deux à six. En dessous de deux, il n'y a rien à choisir. */
  onglets: OngletRubrique[];
  /** L'`id` de l'onglet courant. Un identifiant inconnu n'en marque aucun. */
  actif: string;
  /** Le nom de la navigation pour les lecteurs d'écran. */
  etiquette?: string | undefined;
  /** Le lien du routeur du produit ; `a` par défaut. Avec lui, changer d'onglet ne recharge pas le document. */
  Lien?: ComposantLien | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** La hauteur d'un onglet. Elle porte le plancher tactile de la charte. */
export const HAUTEUR_ONGLETS = 44;

/**
 * Deux à six onglets. Comme `BarreOnglets`, le composant ne lève pas au-delà : la borne est écrite,
 * exportée et testée.
 */
export const ONGLETS_RUBRIQUE_MIN = 2;
export const ONGLETS_RUBRIQUE_MAX = 6;

const ID_STYLE = 'ai5d-onglets-rubrique';

/*
  La prose vit dans le commentaire au-dessus, jamais dans la chaîne ci-dessous : un accent
  grave dans un gabarit littéral le TERMINE, et la prose de ce système cite volontiers du
  code entre accents graves.

  Le masque du fondu ne lit que l opacite : la teinte choisie n apparait jamais. Le trait
  d attente se place a -2 px pour recouvrir exactement la bordure basse de 2 px de l onglet,
  comme le trait actif ; la valeur est nommee hors echelle dans la garde d espacement.
*/
const STYLE_ONGLETS = `
.ai5d-onglets-r {
  display: flex;
  align-items: stretch;
  gap: var(--espace-6);
  border-bottom: 1px solid var(--bordure);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-padding-inline: var(--espace-6);
}
.ai5d-onglets-r::-webkit-scrollbar { display: none; }

.ai5d-onglets-r__lien {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--espace-2);
  flex: 0 0 auto;
  height: 44px;
  padding: 0 var(--espace-1);
  white-space: nowrap;
  text-decoration: none;
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
  font-weight: var(--graisse-normale);
  color: var(--texte-faible);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition:
    color var(--duree-courte) var(--courbe-entree),
    background var(--mouvement-retour);
}

@media (hover: hover) {
  .ai5d-onglets-r__lien:hover { color: var(--texte-fort); }
}

.ai5d-onglets-r__lien:active { background: var(--surface-selection); border-radius: var(--rayon-sm); transition: none; }

.ai5d-onglets-r__lien:focus-visible {
  outline: 2px solid var(--action);
  outline-offset: 2px;
  border-radius: var(--rayon-sm);
}

.ai5d-onglets-r__lien[aria-current='page'] {
  color: var(--action);
  font-weight: var(--graisse-semi);
  border-bottom-color: var(--action);
}

.ai5d-onglets-r__lien::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--bordure-forte);
  opacity: 0;
  pointer-events: none;
}
.ai5d-onglets-r__lien:is([data-en-attente], :has([data-en-attente])):not([aria-current='page'])::after { opacity: 1; animation: ai5d-onglets-attente 1200ms ease-in-out infinite alternate; }

@keyframes ai5d-onglets-attente {
  from { opacity: 0.4; }
  to { opacity: 1; }
}

@supports (animation-timeline: scroll()) {
  .ai5d-onglets-r {
    animation: ai5d-onglets-fondu linear both;
    animation-timeline: scroll(self inline);
  }
  @keyframes ai5d-onglets-fondu {
    0% {
      mask-image: linear-gradient(to left, transparent, var(--encre) var(--espace-6));
    }
    1%, 99% {
      mask-image: linear-gradient(to right, transparent, var(--encre) var(--espace-6), var(--encre) calc(100% - var(--espace-6)), transparent);
    }
    100% {
      mask-image: linear-gradient(to right, transparent, var(--encre) var(--espace-6));
    }
  }
}

@supports (scroll-initial-target: nearest) {
  .ai5d-onglets-r__lien[aria-current='page'] { scroll-initial-target: nearest; }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-onglets-r__lien { transition: none; }
  .ai5d-onglets-r__lien:is([data-en-attente], :has([data-en-attente])):not([aria-current='page'])::after { animation: none; opacity: 1; }
}
`;

export function OngletsRubrique({
  onglets,
  actif,
  etiquette = 'Sous-pages de la rubrique',
  Lien,
  className,
  style,
}: ProprietesOngletsRubrique) {
  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_ONGLETS }} />

      <nav
        aria-label={etiquette}
        className={className === undefined ? 'ai5d-onglets-r' : `ai5d-onglets-r ${className}`}
        style={style}
      >
        {onglets.map((onglet) => {
          /*
            `undefined` et non `false` : `aria-current="false"` est une valeur VALIDE qui
            signifie « ce n'est pas l'element courant », et certains lecteurs d'ecran
            l'annoncent. L'attribut doit disparaitre, pas valoir faux.
          */
          const courant = onglet.id === actif ? 'page' : undefined;
          const contenu: ReactNode = (
            <>
              {onglet.icone === undefined ? null : <Icone nom={onglet.icone} taille={16} />}
              <span>{onglet.libelle}</span>
            </>
          );

          return Lien === undefined ? (
            <a
              key={onglet.id}
              href={onglet.href}
              className="ai5d-onglets-r__lien"
              aria-current={courant}
            >
              {contenu}
            </a>
          ) : (
            <Lien
              key={onglet.id}
              href={onglet.href}
              className="ai5d-onglets-r__lien"
              aria-current={courant}
            >
              {contenu}
            </Lien>
          );
        })}
      </nav>
    </>
  );
}
```

La feuille garde trois règles sur une seule ligne (`:active`, le trait d'attente, et sa version
réduite) : les tests les cherchent ainsi, et Prettier ne reformate pas l'intérieur d'une chaîne.

- [ ] **Step 2 : nommer `-2px` dans `HORS_ECHELLE` (`gardes/gardes.test.ts`)**

Remplacer l'entrée `OngletsRubrique.tsx` et son commentaire par :

```ts
    // Le trait actif qui recouvre la bordure : un chevauchement, pas un espacement. Et depuis la
    // 1.2.0, le trait d attente, place a -2 px pour recouvrir exactement la bordure basse de 2 px.
    'noyau/composants/OngletsRubrique.tsx': ['-1px', '-2px'],
```

- [ ] **Step 3 : les tests, dans `tests/composants/onglets-rubrique.test.tsx`**

Remplacer les imports (lignes 1 à 8) par :

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'react';
import { Shield, ShieldCheck, MonitorSmartphone } from 'lucide-react';
import {
  HAUTEUR_ONGLETS,
  ONGLETS_RUBRIQUE_MAX,
  ONGLETS_RUBRIQUE_MIN,
  OngletsRubrique,
  type OngletRubrique,
} from '../../noyau/composants/OngletsRubrique';
import type { ComposantLien } from '../../noyau/composants/LiensRail';
```

Remplacer le test « ne pose AUCUN voile de debordement, et c est une correction » (lignes 118 à 136)
par :

```tsx
  it('ne rend aucun element de voile : le fondu n existe que dans la frise de defilement', () => {
    /*
      La 0.6.0 posait un voile, un degrade fixe de 24 px ; vu a l ecran, il se dessinait aussi la ou
      rien ne debordait, et la 0.6.3 l a retire. La 1.2.0 rend le fondu sans element ni mesure : un
      masque anime par la frise de defilement du conteneur, sous @supports, qui ne s applique pas quand
      rien ne defile. Decision 007.
    */
    const { container } = render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    expect(container.querySelector('.ai5d-onglets-r__voile')).toBeNull();
    expect(screen.getByRole('navigation').children).toHaveLength(TROIS.length);

    const feuille = document.getElementById('ai5d-onglets-rubrique')?.innerHTML ?? '';
    const supports = feuille.indexOf('@supports (animation-timeline: scroll())');
    expect(supports).toBeGreaterThan(-1);
    expect(feuille.indexOf('linear-gradient')).toBeGreaterThan(supports);
  });
```

Ajouter en fin de fichier :

```tsx
const SIX: OngletRubrique[] = [
  { id: 'vue', libelle: 'Vue d’ensemble', href: '/sessions/7K3F9Q' },
  { id: 'annonces', libelle: 'Annonces', href: '/sessions/7K3F9Q/annonces' },
  { id: 'ressources', libelle: 'Ressources', href: '/sessions/7K3F9Q/ressources' },
  { id: 'replays', libelle: 'Replays', href: '/sessions/7K3F9Q/replays' },
  { id: 'attestation', libelle: 'Attestation', href: '/sessions/7K3F9Q/attestation' },
  { id: 'badge', libelle: 'Badge', href: '/sessions/7K3F9Q/badge' },
];

function feuilleBrute(): string {
  return document.getElementById('ai5d-onglets-rubrique')?.innerHTML ?? '';
}

function feuille(): string {
  return feuilleBrute().replace(/\s+/g, ' ');
}

describe('OngletsRubrique relie au routeur (1.2.0)', () => {
  it('rend six onglets, et annonce ses bornes', () => {
    render(<OngletsRubrique onglets={SIX} actif="attestation" />);
    expect(screen.getAllByRole('link')).toHaveLength(6);
    expect(ONGLETS_RUBRIQUE_MIN).toBe(2);
    expect(ONGLETS_RUBRIQUE_MAX).toBe(6);
  });

  it('passe chaque onglet par le lien du produit, l etat courant compris', () => {
    const recus: Array<ComponentProps<ComposantLien>> = [];
    const Lien: ComposantLien = (proprietes) => {
      recus.push(proprietes);
      const { children, ...reste } = proprietes;
      return <a {...reste}>{children}</a>;
    };
    render(<OngletsRubrique onglets={SIX} actif="attestation" Lien={Lien} />);

    expect(recus).toHaveLength(6);
    expect(recus.map((recu) => recu.href)).toEqual(SIX.map((onglet) => onglet.href));
    expect(recus.every((recu) => recu.className === 'ai5d-onglets-r__lien')).toBe(true);
    expect(recus.filter((recu) => recu['aria-current'] === 'page')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Attestation' })).toHaveAttribute('aria-current', 'page');
  });

  it('un actif inconnu parmi six onglets ne marque rien, et ne leve pas', () => {
    render(<OngletsRubrique onglets={SIX} actif="sous-page-retiree" />);
    for (const lien of screen.getAllByRole('link')) {
      expect(lien).not.toHaveAttribute('aria-current');
    }
  });

  it('montre le debordement par un fondu que le navigateur mesure, sous @supports', () => {
    render(<OngletsRubrique onglets={SIX} actif="vue" />);
    const css = feuille();
    const bloc = css.slice(css.indexOf('@supports (animation-timeline: scroll())'));
    expect(bloc).toContain('animation: ai5d-onglets-fondu linear both;');
    expect(bloc).toContain('animation-timeline: scroll(self inline);');
    // Le raccourci `animation` remet la frise a zero : elle se declare apres lui.
    expect(bloc.indexOf('animation-timeline: scroll(self inline)')).toBeGreaterThan(
      bloc.indexOf('animation: ai5d-onglets-fondu'),
    );
    expect((bloc.match(/mask-image:/g) ?? []).length).toBe(3);
  });

  it('amene l onglet actif dans la vue par le CSS, sans effet ni directive', () => {
    render(<OngletsRubrique onglets={SIX} actif="attestation" />);
    const css = feuille();
    expect(css).toContain(
      "@supports (scroll-initial-target: nearest) { .ai5d-onglets-r__lien[aria-current='page'] { scroll-initial-target: nearest; } }",
    );
    expect(css).toContain('scroll-padding-inline: var(--espace-6);');
    expect(
      readFileSync('noyau/composants/OngletsRubrique.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(false);
  });

  it('pose l appui sans transition, et garde le survol aux pointeurs fins', () => {
    render(<OngletsRubrique onglets={SIX} actif="vue" />);
    const css = feuille();
    expect(css).toContain(
      '.ai5d-onglets-r__lien:active { background: var(--surface-selection); border-radius: var(--rayon-sm); transition: none; }',
    );
    expect(css).toContain('background var(--mouvement-retour)');
    expect(css).toContain(
      '@media (hover: hover) { .ai5d-onglets-r__lien:hover { color: var(--texte-fort); } }',
    );
    expect(feuilleBrute().replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')).not.toContain(
      ':hover',
    );
  });

  it('fait pulser un trait d attente, jamais sur l onglet actif, et le fige sous mouvement reduit', () => {
    render(<OngletsRubrique onglets={SIX} actif="vue" />);
    const css = feuille();
    expect(css).toContain(
      ".ai5d-onglets-r__lien:is([data-en-attente], :has([data-en-attente])):not([aria-current='page'])::after { opacity: 1; animation: ai5d-onglets-attente 1200ms ease-in-out infinite alternate; }",
    );
    expect(css).toContain('background: var(--bordure-forte);');
    const reduit = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduit).toContain('::after { animation: none; opacity: 1; }');
  });
});
```

- [ ] **Step 4 : écrire `docs/decisions/007-le-fondu-des-onglets-revient-mesure-par-le-navigateur.md`**

```markdown
# 007 · Le fondu des onglets revient, mesuré par le navigateur

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

`OngletsRubrique` défile quand ses onglets ne tiennent pas. La 0.6.0 signalait le débordement par un
dégradé fixe de 24 px au bord droit ; vu à l'écran, il se dessinait aussi sur un écran de 1 440 px où
rien ne débordait, et coupait le filet et le trait de l'onglet actif. La 0.6.3 l'a retiré : le rendre
conditionnel demandait de mesurer la largeur au montage, donc un état, donc un module client, et
`OngletsRubrique` est rendu par des composants serveur qui lui passent des icônes (leçon de `Avatar`,
0.6.2).

Le contrat de P09 redemande le fondu (« sur le bord qui cache un onglet »), et l'onglet actif amené
dans la vue au montage par `scrollIntoView` : sur un téléphone de 390 px, l'onglet Attestation, le
cinquième, est caché à droite.

## Options

**A. Mesurer au montage**, et amener l'onglet par un effet. Le composant devient client : tout appelant
serveur qui passe des icônes tombe.

**B. Un voile fixe**, comme en 0.6.0. Déjà vu faux.

**C. Laisser le navigateur mesurer.** Le fondu est un masque animé par la frise de défilement du
conteneur (`animation-timeline: scroll(self inline)`), sous `@supports` : au début, fondu à droite ;
au milieu, aux deux bords ; à la fin, à gauche ; et quand rien ne défile, la frise est inactive et
aucun masque ne s'applique. L'onglet actif est amené dans la vue par `scroll-initial-target: nearest`,
sous `@supports`.

## Décision

**C.** Aucun script, aucune directive, aucun élément de voile dans le DOM.

## Constat, le 26 septembre 2026

Sonde Playwright 1.57 sur une rangée de six onglets, `CSS.supports` et masque calculé :

| Moteur | `animation-timeline` | `scroll-initial-target` | Rien ne déborde | Début, milieu, fin |
| ------ | -------------------- | ----------------------- | --------------- | ------------------ |
| Chromium 143 | oui | oui, rangée amenée sur l'onglet actif | aucun masque | les trois masques attendus |
| WebKit 26.0 | oui | non | aucun masque | les trois masques attendus |
| Firefox 144 | non | non | aucun masque | aucun masque |

Le constat est refait sur le spécimen du dépôt à la vérification de la 1.2.0
(`docs/preuves/1.2.0/navigateurs.md`). WebKit de Playwright n'est pas Safari : Safari reste à constater
sur un appareil.

## Conséquences

- Sans prise en charge, le rendu est celui de la 1.1.0 : le dernier onglet coupé net par le bord est le
  signal, et l'onglet actif n'est pas amené dans la vue. Le Portail le sait (SPEC 1.2.0, §17, écarts 4
  et 5).
- Le rembourrage de défilement (`scroll-padding-inline: var(--espace-6)`) garde l'onglet actif hors du
  fondu.
- Une navigation cliente ne remonte pas le composant : l'onglet touché est déjà dans la vue.
```

- [ ] **Step 5 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/composants/OngletsRubrique.tsx tests/composants/onglets-rubrique.test.tsx gardes/gardes.test.ts
```

Cocher T6 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/composants/OngletsRubrique.tsx tests/composants/onglets-rubrique.test.tsx gardes/gardes.test.ts docs/decisions/007-le-fondu-des-onglets-revient-mesure-par-le-navigateur.md tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Les onglets de rubrique passent par le lien du produit, montent à six, et montrent leur débordement par un fondu que le navigateur mesure
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 7 : `CoquilleRail`, deux pieds

SPEC §5.5. `piedCompact` : deuxième consommateur constaté, Compte ne rend `SelecteurTheme` que dans le
pied du rail (`PiedDuRail.tsx:106`), invisible sous 768 px.

**Files:**
- Modify: `noyau/composants/CoquilleRail.tsx` (en-tête ligne 45, propriétés ligne 68, feuille lignes 160 et 195, rendu lignes 251 à 347)
- Modify: `tests/composants/coquille-rail.test.tsx` (imports, et un bloc ajouté)

**Interfaces:**
- Consumes : `tests/instantanes/CoquilleRail-1.1.0.tsx` (tâche 2).
- Produces : `ProprietesCoquilleRail` gagne `piedContenu?: ReactNode | undefined` et
  `piedCompact?: ReactNode | undefined` ; la racine porte `data-pied="complet" | "compact"` quand un
  pied existe ; classes `ai5d-coquille-rail__pied-contenu` (le `<footer>`) et
  `ai5d-coquille-rail__pied-compact`.

- [ ] **Step 1 : l'en-tête (insérer avant la ligne 45, le ` */` qui le ferme)**

```tsx
 *
 * ── LES DEUX PIEDS DE CONTENU, EN 1.2.0 ─────────────────────────────────────
 * `piedContenu` se rend dans un `<footer>` APRÈS `<main>`, à toutes les largeurs : c'est lui qui porte
 * le repère `contentinfo`, et les liens légaux n'ont rien à faire dans le contenu principal.
 * `piedCompact` s'y ajoute sous 768 px : ce que le pied du rail offre au-delà, et que le téléphone
 * perdrait sans lui, le thème d'abord. Au-delà de 768 px, il est retiré par `display: none`, donc de
 * l'arbre d'accessibilité aussi, puisque le rail porte le sien. Quand un pied existe, c'est lui le
 * dernier élément de la page : c'est donc lui qui porte la réserve basse, pas le contenu. Sans pied,
 * la coquille rend le HTML de la 1.1.0, au caractère près.
```

- [ ] **Step 2 : les propriétés (après la ligne 68, `pied?: ReactNode | undefined;`)**

```tsx
  /**
   * Le pied de contenu, à toutes les largeurs : rendu dans un `<footer>` APRÈS `<main>`, pour que
   * le repère `contentinfo` existe. Liens légaux, mentions. Le système n'y écrit aucun texte.
   */
  piedContenu?: ReactNode | undefined;
  /**
   * Ce que le pied de contenu porte en plus sous 768 px, au-dessus de `piedContenu` : ce que le
   * pied du rail offre au-delà, et que le téléphone perdrait sans lui. Le thème, d'abord.
   * Ignoré en mode `bureau-seulement`.
   */
  piedCompact?: ReactNode | undefined;
```

- [ ] **Step 3 : la feuille**

Après la ligne 160 (`.ai5d-coquille-rail__bandeau { margin-bottom: var(--espace-6); }`), insérer :

```css

/*
  LES DEUX PIEDS DE CONTENU, EN 1.2.0. Quand un pied existe, c est lui le dernier element de la
  page : il porte la reserve basse, et le contenu la rend.
*/
.ai5d-coquille-rail[data-pied] .ai5d-coquille-rail__contenu { padding-bottom: var(--espace-8); }
.ai5d-coquille-rail__pied-contenu {
  padding: var(--espace-6) var(--marge-page) calc(var(--espace-6) + var(--reserve-barre, 0px));
  border-top: 1px solid var(--bordure);
}
.ai5d-coquille-rail__pied-compact {
  display: flex; flex-direction: column; gap: var(--espace-2);
  margin-bottom: var(--espace-4);
}
```

Dans le bloc `@media (min-width: ${TABLETTE}px)`, après la ligne 195
(`.ai5d-coquille-rail__contenu { padding: var(--espace-12) var(--espace-8); }`), insérer :

```css

  /* Le rail porte le theme au-dela : le pied compact sort de l ecran ET de l arbre d accessibilite. */
  .ai5d-coquille-rail__pied-compact { display: none; }
  .ai5d-coquille-rail[data-pied='compact'] .ai5d-coquille-rail__pied-contenu { display: none; }
  .ai5d-coquille-rail__pied-contenu { padding: var(--espace-6) var(--espace-8); }
```

- [ ] **Step 4 : le rendu (lignes 251 à 347, la fonction `CoquilleRail`)**

```tsx
export function CoquilleRail({
  produit,
  navigationRail,
  navigationBarre,
  pied,
  piedContenu,
  piedCompact,
  actionsBarre,
  mention,
  bandeau,
  largeurContenu,
  mode = 'complet',
  refus,
  densite,
  rechargerAuRetour = true,
  children,
}: ProprietesCoquilleRail) {
  const complet = mode === 'complet';

  /*
    La reserve basse n existe qu en mode complet : en mode bureau-seulement il n y a pas de barre
    basse, et reserver sa hauteur laisserait un vide sous chaque page.
  */
  const styleRacine: CSSProperties | undefined = complet
    ? ({
        '--reserve-barre': 'calc(var(--hauteur-barre-onglets) + var(--zone-sure-basse, 0px))',
      } as CSSProperties)
    : undefined;

  /* Le pied compact n existe qu en mode complet : la console n a pas de telephone a servir. */
  const avecPiedCompact = complet && piedCompact !== undefined;
  const typePied =
    piedContenu !== undefined ? 'complet' : avecPiedCompact ? 'compact' : undefined;
  const styleColonne =
    largeurContenu === undefined ? undefined : { maxWidth: `${largeurContenu}px` };

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_COQUILLE_RAIL }} />

      {rechargerAuRetour ? <RechargeAuRetour /> : null}

      <div
        className="ai5d-coquille-rail"
        style={styleRacine}
        data-coquille="rail"
        data-mode={mode}
        data-densite={densite}
        data-pied={typePied}
      >
        {complet ? null : <div className="ai5d-coquille-rail__refus">{refus}</div>}

        <div className="ai5d-coquille-rail__cadre">
          <a href="#contenu" className="ai5d-coquille-rail__evitement">
            Aller au contenu
          </a>

          <div className="ai5d-coquille-rail__rail">
            {/*
              LA MARQUE, EN BLOC, SANS FILET SOUS ELLE.

              Un rail n a pas d en-tete. Le filet que portait la premiere version de Compte etait
              le reste d un en-tete horizontal supprime la veille.
            */}
            <div className="ai5d-coquille-rail__marque">
              <Logotype produit={produit} taille={20} />
              {mention === undefined ? null : (
                <span className="ai5d-coquille-rail__mention">{mention}</span>
              )}
            </div>

            <div className="ai5d-coquille-rail__nav">{navigationRail}</div>

            {pied === undefined ? null : <div className="ai5d-coquille-rail__pied">{pied}</div>}
          </div>

          <div className="ai5d-coquille-rail__principal">
            {complet ? (
              <header className="ai5d-coquille-rail__barre">
                <Logotype produit={produit} taille={18} />
                {actionsBarre === undefined ? null : (
                  <div className="ai5d-coquille-rail__barre-actions">{actionsBarre}</div>
                )}
              </header>
            ) : null}

            <main id="contenu" className="ai5d-coquille-rail__contenu">
              <div className="ai5d-coquille-rail__colonne" style={styleColonne}>
                {bandeau === undefined ? null : (
                  <div className="ai5d-coquille-rail__bandeau">{bandeau}</div>
                )}
                {children}
              </div>
            </main>

            {typePied === undefined ? null : (
              <footer className="ai5d-coquille-rail__pied-contenu">
                <div className="ai5d-coquille-rail__colonne" style={styleColonne}>
                  {avecPiedCompact ? (
                    <div className="ai5d-coquille-rail__pied-compact">{piedCompact}</div>
                  ) : null}
                  {piedContenu}
                </div>
              </footer>
            )}
          </div>

          {complet ? navigationBarre : null}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 5 : les tests, dans `tests/composants/coquille-rail.test.tsx`**

Ajouter aux imports :

```tsx
import { CoquilleRail as CoquilleRail110 } from '../instantanes/CoquilleRail-1.1.0';
```

Ajouter en fin de fichier :

```tsx
/** Le HTML rendu, sans les feuilles injectees : la feuille change en 1.2.0, pas le balisage. */
function sansFeuilles(conteneur: HTMLElement): string {
  const copie = conteneur.cloneNode(true) as HTMLElement;
  copie.querySelectorAll('style').forEach((feuille) => feuille.remove());
  return copie.innerHTML;
}

describe('CoquilleRail sans pied : le HTML de la 1.1.0 (1.2.0)', () => {
  const CAS: Array<Partial<Parameters<typeof CoquilleRail>[0]>> = [
    {},
    { actionsBarre: <button type="button">Sortie</button> },
    { densite: 'compact', largeurContenu: 960 },
    { mention: 'Console d’administration', bandeau: <p>Vos actions sont consignées.</p> },
    { mode: 'bureau-seulement', refus: <p>La console demande un écran de bureau.</p> },
  ];

  for (const [index, cas] of CAS.entries()) {
    it(`cas ${index + 1}`, () => {
      const communes = {
        produit: 'Compte',
        navigationRail: <nav aria-label="Rubriques">rail</nav>,
        navigationBarre: <nav aria-label="Barre">barre</nav>,
        pied: <span>pied</span>,
        rechargerAuRetour: false,
      };
      const avant = render(
        <CoquilleRail110 {...communes} {...cas}>
          <p>Le contenu</p>
        </CoquilleRail110>,
      ).container;
      const apres = render(
        <CoquilleRail {...communes} {...cas}>
          <p>Le contenu</p>
        </CoquilleRail>,
      ).container;
      expect(sansFeuilles(apres)).toBe(sansFeuilles(avant));
    });
  }
});

describe('CoquilleRail, les deux pieds (1.2.0)', () => {
  it('rend le pied de contenu dans un footer, apres main et hors de main', () => {
    const { container } = coquille({ piedContenu: <a href="/confidentialite">Confidentialité</a> });
    const principal = container.querySelector('main');
    const pied = container.querySelector('footer');
    if (principal === null || pied === null) throw new Error('main ou footer absent');

    expect(principal.contains(pied)).toBe(false);
    expect(principal.compareDocumentPosition(pied) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(container.querySelector('[data-coquille="rail"]')).toHaveAttribute('data-pied', 'complet');
  });

  it('pose le pied compact au-dessus du pied de contenu', () => {
    const { container } = coquille({
      piedCompact: <span>Thème</span>,
      piedContenu: <span>Mentions légales</span>,
    });
    const colonne = container.querySelector('footer .ai5d-coquille-rail__colonne');
    expect(colonne?.firstElementChild).toHaveClass('ai5d-coquille-rail__pied-compact');
    expect(colonne?.firstElementChild).toHaveTextContent('Thème');
    expect(colonne).toHaveTextContent('Mentions légales');
  });

  it('avec le seul pied compact, se declare compact', () => {
    const { container } = coquille({ piedCompact: <span>Thème</span> });
    expect(container.querySelector('[data-coquille="rail"]')).toHaveAttribute('data-pied', 'compact');
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('ignore le pied compact en mode bureau seulement', () => {
    const { container } = coquille({
      mode: 'bureau-seulement',
      refus: <p>La console demande un écran de bureau.</p>,
      piedCompact: <span>Thème</span>,
    });
    expect(container.querySelector('footer')).toBeNull();
    expect(container.querySelector('[data-coquille="rail"]')).not.toHaveAttribute('data-pied');
  });

  it('donne au pied la largeur de la colonne du contenu', () => {
    const { container } = coquille({ largeurContenu: 960, piedContenu: <span>Mentions</span> });
    expect(container.querySelector('footer .ai5d-coquille-rail__colonne')).toHaveStyle({
      maxWidth: '960px',
    });
  });

  it('passe la reserve basse au pied, et retire le pied compact au-dela de 768 px', () => {
    const css = STYLE_COQUILLE_RAIL.replace(/\s+/g, ' ');
    expect(css).toContain(
      '.ai5d-coquille-rail[data-pied] .ai5d-coquille-rail__contenu { padding-bottom: var(--espace-8); }',
    );
    expect(css).toContain(
      'padding: var(--espace-6) var(--marge-page) calc(var(--espace-6) + var(--reserve-barre, 0px));',
    );

    const tablette = STYLE_COQUILLE_RAIL.slice(
      STYLE_COQUILLE_RAIL.indexOf('@media (min-width: 768px)'),
    ).replace(/\s+/g, ' ');
    expect(tablette).toContain('.ai5d-coquille-rail__pied-compact { display: none; }');
    expect(tablette).toContain(
      ".ai5d-coquille-rail[data-pied='compact'] .ai5d-coquille-rail__pied-contenu { display: none; }",
    );
  });
});
```

- [ ] **Step 6 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/composants/CoquilleRail.tsx tests/composants/coquille-rail.test.tsx
```

Cocher T7 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/composants/CoquilleRail.tsx tests/composants/coquille-rail.test.tsx tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
La coquille à rail accepte un pied de contenu et un pied compact, après le contenu principal
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 8 : `SelecteurTheme` au doigt, libellés visibles

SPEC §5.6. **Correctif** pour la cible (32 px, sous le plancher, constaté aussi dans Compte),
**extension** pour les libellés.

**Files:**
- Modify: `noyau/composants/SelecteurTheme.tsx:33-35` (en-tête), `:51-81` (feuille), `:108-153` (propriétés et rendu)
- Modify: `tests/composants/theme.test.tsx` (un bloc ajouté)
- Modify: `gardes/gardes.test.ts` (commentaire de l'entrée `SelecteurTheme.tsx`, valeurs inchangées)

**Interfaces:**
- Consumes : `LIBELLE_THEME`, `THEMES`, `Theme` (`noyau/theme.ts`), `Icone` (accepte `className`).
- Produces : `ProprietesSelecteurTheme` gagne `libellesVisibles?: boolean | undefined` ; groupe
  `data-libelles` ; icône `ai5d-theme__icone` en mode libellés ; `STYLE_SELECTEUR_THEME` exporté
  comme avant.

- [ ] **Step 1 : l'en-tête (lignes 33 à 35, la section « LA CIBLE TACTILE EST PORTÉE PAR LE GROUPE »)**

```tsx
 * ── AU DOIGT, CHAQUE SEGMENT FAIT 44 PX, EN v1.2.0 ──────────────────────────
 * Des segments de 32 px, dans un groupe de 40 : le commentaire qui les justifiait disait « on vise le
 * groupe ». C'était faux : chaque segment est une cible distincte, et le groupe lui-même était sous le
 * plancher. Sous `(pointer: coarse)`, chaque segment prend 44 px au moins, et le groupe 52. À la
 * souris, rien ne change.
 *
 * ── LES LIBELLÉS VISIBLES, EN v1.2.0 ────────────────────────────────────────
 * Avec `libellesVisibles`, « Clair », « Sombre », « Système » s'écrivent à côté de l'icône et le groupe
 * occupe toute la largeur : c'est la forme d'un pied de page de téléphone. Le nom visible devient le
 * nom accessible, sans `aria-label` ni `title`, pour qu'une commande vocale qui entend « Sombre »
 * trouve « Sombre ». Sous 17rem de largeur disponible, l'icône se retire et le mot reste : un mot seul
 * se lit, une icône seule s'apprend. Le segment coché prend la graisse semi-grasse en plus de sa
 * couleur.
```

- [ ] **Step 2 : la feuille (lignes 51 à 81, `STYLE_SELECTEUR_THEME`)**

```tsx
export const STYLE_SELECTEUR_THEME = `
.ai5d-theme {
  display: inline-flex; align-items: center; gap: 2px;
  padding: 3px;
  border: 1px solid var(--bordure);
  border-radius: var(--rayon-plein);
}
.ai5d-theme__segment {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  padding: 0;
  border: none; border-radius: var(--rayon-plein);
  background: none; color: var(--texte-faible);
  cursor: pointer;
  transition: background var(--duree-courte) var(--courbe-sortie),
              color var(--duree-courte) var(--courbe-sortie);
}
@media (hover: hover) {
  .ai5d-theme__segment:hover { background: var(--surface-1); color: var(--texte-fort); }
}
.ai5d-theme__segment[aria-checked='true'] {
  background: var(--surface-selection);
  color: var(--action);
}
.ai5d-theme__segment:active { background: var(--surface-selection); transition: none; }
.ai5d-theme__segment:focus-visible {
  outline: 2px solid var(--action);
  outline-offset: 2px;
}

@media (pointer: coarse) {
  .ai5d-theme__segment { min-width: var(--cible-tactile); min-height: var(--cible-tactile); }
}

.ai5d-theme[data-libelles] {
  display: flex; width: 100%;
  container-type: inline-size;
}
.ai5d-theme[data-libelles] .ai5d-theme__segment {
  flex: 1 1 0; width: auto; min-width: 0;
  gap: var(--espace-1); padding: 0 var(--espace-2);
  font-family: var(--police-corps); font-size: var(--taille-sm);
  font-weight: var(--graisse-moyenne); white-space: nowrap;
}
.ai5d-theme[data-libelles] .ai5d-theme__segment[aria-checked='true'] {
  font-weight: var(--graisse-semi);
}
@container (max-width: 17rem) {
  .ai5d-theme[data-libelles] .ai5d-theme__icone { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-theme__segment { transition: none; }
}
`;
```

- [ ] **Step 3 : les propriétés et le rendu (lignes 108 à 153)**

```tsx
export interface ProprietesSelecteurTheme {
  /** L'état de départ, lu du cookie par le gabarit racine du produit. */
  theme: Theme;
  /**
   * Le domaine du cookie : `.ai5d.technology` en production, `.staging.ai5d.technology` en
   * préproduction, absent en local, où un domaine ne se pose pas sur `localhost`.
   */
  domaine?: string | undefined;
  /**
   * Écrit « Clair », « Sombre », « Système » à côté de l'icône, et occupe toute la largeur
   * disponible. Faux par défaut : le pied du rail de Compte garde ses icônes.
   */
  libellesVisibles?: boolean | undefined;
}

export function SelecteurTheme({
  theme: themeInitial,
  domaine,
  libellesVisibles = false,
}: ProprietesSelecteurTheme) {
  const [theme, setTheme] = useState<Theme>(themeInitial);

  function choisir(suivant: Theme): void {
    setTheme(suivant);
    memoriserTheme(suivant, domaine);

    const attribut = attributTheme(suivant);
    if (attribut === undefined) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', attribut);
  }

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_SELECTEUR_THEME }} />

      <div
        className="ai5d-theme"
        role="radiogroup"
        aria-label="Thème de l’interface"
        data-libelles={libellesVisibles ? '' : undefined}
      >
        {THEMES.map((valeur) => (
          <button
            key={valeur}
            type="button"
            role="radio"
            aria-checked={theme === valeur}
            // En mode icônes, le libellé n'est pas à l'écran : sans lui, le bouton n'aurait pas de
            // nom. En mode libellés, le nom visible EST le nom accessible.
            aria-label={libellesVisibles ? undefined : LIBELLE_THEME[valeur]}
            title={libellesVisibles ? undefined : LIBELLE_THEME[valeur]}
            onClick={() => choisir(valeur)}
            className="ai5d-theme__segment"
          >
            {libellesVisibles ? (
              <>
                <Icone nom={ICONE_DU_THEME[valeur]} taille={16} className="ai5d-theme__icone" />
                <span>{LIBELLE_THEME[valeur]}</span>
              </>
            ) : (
              <Icone nom={ICONE_DU_THEME[valeur]} taille={16} />
            )}
          </button>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 4 : le commentaire de l'exception dans `HORS_ECHELLE` (`gardes/gardes.test.ts`)**

Remplacer la ligne de commentaire au-dessus de l'entrée `SelecteurTheme.tsx` par :

```ts
    // Le controle segmente du theme : trois segments qui se touchent dans un groupe serre. Au doigt,
    // chaque segment prend 44 px depuis la 1.2.0 ; l ecart et le rembourrage du groupe ne changent pas.
```

- [ ] **Step 5 : les tests, dans `tests/composants/theme.test.tsx`**

Ajouter en fin de fichier :

```tsx
describe('SelecteurTheme au doigt, et en libelles (1.2.0)', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  const css = STYLE_SELECTEUR_THEME.replace(/\s+/g, ' ');

  it('donne a chaque segment 44 px au doigt, et rien de plus a la souris', () => {
    expect(css).toContain(
      '@media (pointer: coarse) { .ai5d-theme__segment { min-width: var(--cible-tactile); min-height: var(--cible-tactile); } }',
    );
    expect(css).toContain('width: 32px; height: 32px;');
  });

  it('garde le survol aux pointeurs fins, et pose l appui sans transition', () => {
    expect(STYLE_SELECTEUR_THEME.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')).not.toContain(
      ':hover',
    );
    expect(css).toContain(
      '.ai5d-theme__segment:active { background: var(--surface-selection); transition: none; }',
    );
  });

  it('en libelles, ecrit les trois mots, et le nom visible est le nom accessible', () => {
    render(<SelecteurTheme theme="sombre" libellesVisibles />);
    const groupe = screen.getByRole('radiogroup', { name: 'Thème de l’interface' });
    expect(groupe).toHaveAttribute('data-libelles');

    const segments = screen.getAllByRole('radio');
    expect(segments.map((segment) => segment.textContent)).toEqual(['Clair', 'Sombre', 'Système']);
    for (const segment of segments) {
      expect(segment).not.toHaveAttribute('aria-label');
      expect(segment).not.toHaveAttribute('title');
    }
    expect(screen.getByRole('radio', { name: 'Sombre' })).toHaveAttribute('aria-checked', 'true');
  });

  it('en icones, garde le nom par aria-label et title, comme en 1.1.0', () => {
    render(<SelecteurTheme theme="clair" />);
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('data-libelles');
    for (const segment of screen.getAllByRole('radio')) {
      expect(segment).toHaveAttribute('aria-label');
      expect(segment).toHaveAttribute('title');
    }
  });

  it('occupe toute la largeur, retire l icone sous 17rem, et graisse le segment coche', () => {
    expect(css).toContain('.ai5d-theme[data-libelles] { display: flex; width: 100%; container-type: inline-size; }');
    expect(css).toContain(
      '@container (max-width: 17rem) { .ai5d-theme[data-libelles] .ai5d-theme__icone { display: none; } }',
    );
    expect(css).toContain(
      ".ai5d-theme[data-libelles] .ai5d-theme__segment[aria-checked='true'] { font-weight: var(--graisse-semi); }",
    );
  });

  it('pose la classe de l icone en mode libelles, pour la requete de conteneur', () => {
    const { container } = render(<SelecteurTheme theme="systeme" libellesVisibles />);
    expect(container.querySelectorAll('svg.ai5d-theme__icone')).toHaveLength(3);
  });
});
```

La dernière assertion suppose que `Icone` transmet `className` à l'élément `svg` de Lucide, ce qu'il
fait (`Icone.tsx`, `className={className}`).

- [ ] **Step 6 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/composants/SelecteurTheme.tsx tests/composants/theme.test.tsx gardes/gardes.test.ts
```

Cocher T8 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/composants/SelecteurTheme.tsx tests/composants/theme.test.tsx gardes/gardes.test.ts tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Le sélecteur de thème offre 44 px au doigt et peut écrire ses libellés
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 9 : `TitreSection` et `ListeDefinitions`

SPEC §5.8, §5.11. Deux composants nouveaux, sans état ni directive. Deuxièmes consommateurs
constatés : douze titres en Fraunces écrits à la main dans Compte (`EnteteEcran.tsx:65`,
`LienInvalide.tsx:33`, `CarteProduit.tsx:136`…) ; un `<dl>` écrit à la main
(`app/admin/comptes/[id]/page.tsx:83-110`).

**Files:**
- Create: `noyau/composants/TitreSection.tsx`
- Create: `noyau/composants/ListeDefinitions.tsx`
- Create: `tests/composants/titre-section.test.tsx`
- Create: `tests/composants/liste-definitions.test.tsx`

**Interfaces:**
- Consumes : rien de nouveau.
- Produces :
  - `TitreSection(proprietes: ProprietesTitreSection)` ; `NiveauTitre = 1 | 2 | 3` ;
    `TailleTitre = 'ecran' | 'section' | 'bloc'` ;
    `ProprietesTitreSection extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'>` avec
    `niveau`, `taille`, `children: ReactNode`.
  - `ListeDefinitions(proprietes: ProprietesListeDefinitions)` ;
    `Definition { libelle: string; valeur: ReactNode; mono?: boolean | undefined }` ;
    `ProprietesListeDefinitions { elements: Definition[]; colonnes?: 1 | 2 | undefined; className?; style? }` ;
    `CONTENEUR_DEFINITIONS_DEUX_COLONNES = 480` ; `STYLE_DEFINITIONS` (exporté, lu par les spécimens).

- [ ] **Step 1 : écrire `noyau/composants/TitreSection.tsx`**

```tsx
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

/**
 * Le titre d'une section, écrit une fois pour tous les produits.
 *
 * ── LE NIVEAU ET LA TAILLE SONT DEUX CHOSES ─────────────────────────────────
 * Le niveau est le plan du document : `h1`, `h2` ou `h3`, un seul `h1` par page. La taille est
 * l'écran : `ecran`, `section`, `bloc`. Les deux sont obligatoires et séparés, et c'est ce qui empêche
 * de choisir un `h3` pour sa taille.
 *
 * ── POURQUOI IL MONTE, EN v1.2.0 ────────────────────────────────────────────
 * Compte écrivait douze titres en Fraunces à la main, aux trois mêmes tailles, et deux d'entre eux
 * avaient déjà perdu le lettrage. Le Portail en avait huit copies sans graisse : le navigateur
 * appliquait le gras par défaut d'un titre à une Fraunces chargée en 400, un faux gras épaissi à la
 * volée. Ici, la graisse est toujours `--graisse-normale`.
 *
 * Aucun état, donc aucune feuille : un style en ligne, et le `style` du consommateur gagne.
 * `EnteteRubrique`, `GabaritAuth` et `Chiffre` gardent leur titre propre : les faire passer par ici
 * ajouterait le lettrage à des titres en production, un changement de rendu que personne n'a demandé.
 */

export type NiveauTitre = 1 | 2 | 3;
export type TailleTitre = 'ecran' | 'section' | 'bloc';

export interface ProprietesTitreSection
  extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
  /** Le niveau dans le plan du document : `h1`, `h2` ou `h3`. Un seul `h1` par page. */
  niveau: NiveauTitre;
  /** La taille à l'écran, indépendante du niveau : un `h2` peut être un titre de bloc. */
  taille: TailleTitre;
  children: ReactNode;
}

const TAILLES: Record<TailleTitre, string> = {
  ecran: 'var(--taille-2xl)',
  section: 'var(--taille-xl)',
  bloc: 'var(--taille-lg)',
};

const BALISES = { 1: 'h1', 2: 'h2', 3: 'h3' } as const;

export function TitreSection({ niveau, taille, children, style, ...reste }: ProprietesTitreSection) {
  const Balise = BALISES[niveau];

  const styleTitre: CSSProperties = {
    margin: 0,
    fontFamily: 'var(--police-titre)',
    fontWeight: 'var(--graisse-normale)',
    fontSize: TAILLES[taille],
    lineHeight: 'var(--interligne-titre)',
    letterSpacing: 'var(--lettrage-titre)',
    color: 'var(--texte-fort)',
    // Un intitulé long passe à la ligne en lignes équilibrées, jamais tronqué.
    textWrap: 'balance',
    overflowWrap: 'break-word',
    ...style,
  };

  return (
    <Balise style={styleTitre} {...reste}>
      {children}
    </Balise>
  );
}
```

- [ ] **Step 2 : écrire `noyau/composants/ListeDefinitions.tsx`**

```tsx
import type { CSSProperties, ReactNode } from 'react';

/**
 * Des faits, en libellés et valeurs alignés : la fiche d'une attestation, d'un compte, d'une session.
 *
 * ── UN `<dl>`, ET CHAQUE PAIRE DANS UN `<div>` ──────────────────────────────
 * Le HTML permet de grouper un `<dt>` et son `<dd>` dans un `<div>`, et c'est ce qui garde la paire
 * ensemble dans la grille. Un lecteur d'écran annonce une liste de définitions.
 *
 * ── LA BASCULE INTERROGE LE CONTENEUR, PAS LA FENÊTRE ───────────────────────
 * Comme `GrilleCartes`. Le contrat de P09 disait « deux colonnes dès 640 px » de fenêtre ; une fiche
 * de 36rem dans le Portail en offre 528 à 640 px, au-delà de 480, donc deux colonnes comme P09 le veut.
 * Mais une fiche de console dans une colonne étroite recevrait deux colonnes de 150 px avec une
 * requête de fenêtre. Sans requêtes de conteneur, une colonne : la mise en page du téléphone, correcte
 * partout.
 *
 * Aucun état, aucune directive. Deuxième consommateur : la fiche d'un compte dans la console de
 * Compte, écrite à la main (`app/admin/comptes/[id]/page.tsx:83-110`).
 */

export interface Definition {
  libelle: string;
  valeur: ReactNode;
  /** La valeur en JetBrains Mono : un numéro, un identifiant. */
  mono?: boolean | undefined;
}

export interface ProprietesListeDefinitions {
  elements: Definition[];
  /** `2` : deux colonnes dès que la liste dispose de 480 px. `1` par défaut. */
  colonnes?: 1 | 2 | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** La largeur, en px, à partir de laquelle une liste à deux colonnes les affiche. */
export const CONTENEUR_DEFINITIONS_DEUX_COLONNES = 480;

const ID_STYLE = 'ai5d-definitions';

export const STYLE_DEFINITIONS = `
.ai5d-definitions { container-type: inline-size; }
.ai5d-definitions__liste {
  display: grid; grid-template-columns: minmax(0, 1fr);
  row-gap: var(--espace-4); column-gap: var(--espace-6);
  margin: 0;
}
.ai5d-definitions__element { min-width: 0; }
.ai5d-definitions__element dt {
  font-family: var(--police-corps); font-size: var(--taille-xs);
  font-weight: var(--graisse-moyenne); line-height: 1.6;
  color: var(--texte-faible);
}
.ai5d-definitions__element dd {
  margin: 0;
  font-family: var(--police-corps); font-size: var(--taille-md);
  font-weight: var(--graisse-normale); line-height: var(--interligne-corps);
  color: var(--texte-fort);
  overflow-wrap: anywhere;
}
.ai5d-definitions__element dd[data-mono] {
  font-family: var(--police-mono); font-weight: var(--graisse-moyenne); font-size: var(--taille-sm);
}
@container (min-width: ${CONTENEUR_DEFINITIONS_DEUX_COLONNES}px) {
  .ai5d-definitions[data-colonnes='2'] .ai5d-definitions__liste {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
`;

export function ListeDefinitions({
  elements,
  colonnes = 1,
  className,
  style,
}: ProprietesListeDefinitions) {
  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_DEFINITIONS }} />

      <div
        className={className === undefined ? 'ai5d-definitions' : `ai5d-definitions ${className}`}
        data-colonnes={colonnes}
        style={style}
      >
        <dl className="ai5d-definitions__liste">
          {elements.map((element, index) => (
            <div key={`${index}-${element.libelle}`} className="ai5d-definitions__element">
              <dt>{element.libelle}</dt>
              <dd data-mono={element.mono === true ? '' : undefined}>{element.valeur}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
```

- [ ] **Step 3 : écrire `tests/composants/titre-section.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { TitreSection } from '../../noyau/composants/TitreSection';

/**
 * `TitreSection` (SPEC 1.2.0, §5.8). jsdom abandonne sans le dire certaines propriétés qu'il ne
 * connaît pas (leçon de la 1.0.0) : le style se lit sur l'élément React rendu par la fonction, et le
 * DOM ne sert qu'au niveau, aux attributs et à ce que jsdom sait lire.
 */

describe('TitreSection (1.2.0)', () => {
  it('rend le niveau demande', () => {
    for (const niveau of [1, 2, 3] as const) {
      const { unmount } = render(
        <TitreSection niveau={niveau} taille="section">
          Mes autres formations
        </TitreSection>,
      );
      expect(
        screen.getByRole('heading', { level: niveau, name: 'Mes autres formations' }),
      ).toBeInTheDocument();
      unmount();
    }
  });

  it('separe la taille du niveau : un h2 peut etre un titre de bloc', () => {
    const element = TitreSection({ niveau: 2, taille: 'bloc', children: 'Ressources' });
    expect(element.type).toBe('h2');
    expect(element.props.style.fontSize).toBe('var(--taille-lg)');
  });

  it('donne a chaque taille son jeton', () => {
    for (const [taille, jeton] of [
      ['ecran', 'var(--taille-2xl)'],
      ['section', 'var(--taille-xl)'],
      ['bloc', 'var(--taille-lg)'],
    ] as const) {
      expect(TitreSection({ niveau: 2, taille, children: 'Titre' }).props.style.fontSize).toBe(
        jeton,
      );
    }
  });

  it('compose en Fraunces 400, lettre et equilibre, sans marge, et ne tronque jamais', () => {
    const element = TitreSection({ niveau: 1, taille: 'ecran', children: 'IA générative et relation client' });
    expect(element.props.style).toMatchObject({
      margin: 0,
      fontFamily: 'var(--police-titre)',
      fontWeight: 'var(--graisse-normale)',
      lineHeight: 'var(--interligne-titre)',
      letterSpacing: 'var(--lettrage-titre)',
      color: 'var(--texte-fort)',
      textWrap: 'balance',
      overflowWrap: 'break-word',
    });
  });

  it('laisse gagner le style du consommateur, et transmet id et aria', () => {
    render(
      <TitreSection
        niveau={2}
        taille="section"
        id="autres-formations"
        aria-describedby="aide"
        style={{ color: 'var(--texte-faible)' }}
      >
        Mes autres formations
      </TitreSection>,
    );
    const titre = screen.getByRole('heading', { level: 2 });
    expect(titre).toHaveAttribute('id', 'autres-formations');
    expect(titre).toHaveAttribute('aria-describedby', 'aide');
    expect(titre.style.color).toBe('var(--texte-faible)');
    expect(titre.style.fontFamily).toContain('--police-titre');
  });

  it('reste rendable par un composant serveur, et ne touche pas aux titres existants', () => {
    expect(readFileSync('noyau/composants/TitreSection.tsx', 'utf8').startsWith("'use client';")).toBe(
      false,
    );
    for (const fichier of ['EnteteRubrique', 'GabaritAuth', 'Chiffre']) {
      expect(readFileSync(`noyau/composants/${fichier}.tsx`, 'utf8')).not.toContain('TitreSection');
    }
  });
});
```

« IA générative et relation client » est un intitulé de formation fictif ; il remplace dans les
exemples de ce lot le nom de la formation du PRD, qui porte celui d'un outil (G12, et règle des
commits : aucune mention d'outillage dans un fichier du dépôt).

- [ ] **Step 4 : écrire `tests/composants/liste-definitions.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import {
  CONTENEUR_DEFINITIONS_DEUX_COLONNES,
  ListeDefinitions,
  type Definition,
} from '../../noyau/composants/ListeDefinitions';

const FAITS: Definition[] = [
  { libelle: 'Session', valeur: 'Orange Guinée · octobre 2026' },
  { libelle: 'Dates', valeur: 'Du 13 au 15 octobre 2026, présentiel' },
  { libelle: 'Numéro', valeur: 'AI5D-2026-7K3F9Q', mono: true },
];

function feuille(): string {
  return (document.getElementById('ai5d-definitions')?.innerHTML ?? '').replace(/\s+/g, ' ');
}

describe('ListeDefinitions (1.2.0)', () => {
  it('rend un dl, chaque libelle et sa valeur groupes dans un div', () => {
    const { container } = render(<ListeDefinitions elements={FAITS} />);
    const liste = container.querySelector('dl');
    expect(liste).not.toBeNull();
    const groupes = [...(liste?.querySelectorAll(':scope > div') ?? [])];
    expect(groupes).toHaveLength(3);
    for (const [index, groupe] of groupes.entries()) {
      expect(groupe.querySelector('dt')).toHaveTextContent(FAITS[index]?.libelle ?? '');
      expect(groupe.querySelector('dd')).toBeInTheDocument();
    }
  });

  it('marque la valeur mono, et elle seule', () => {
    const { container } = render(<ListeDefinitions elements={FAITS} />);
    const valeurs = container.querySelectorAll('dd');
    expect(valeurs[2]).toHaveAttribute('data-mono');
    expect(valeurs[0]).not.toHaveAttribute('data-mono');
    expect(feuille()).toContain(
      '.ai5d-definitions__element dd[data-mono] { font-family: var(--police-mono); font-weight: var(--graisse-moyenne); font-size: var(--taille-sm); }',
    );
  });

  it('ne passe a deux colonnes que sur demande, par requete de conteneur a 480 px', () => {
    const { container, rerender } = render(<ListeDefinitions elements={FAITS} />);
    expect(container.querySelector('.ai5d-definitions')).toHaveAttribute('data-colonnes', '1');
    rerender(<ListeDefinitions elements={FAITS} colonnes={2} />);
    expect(container.querySelector('.ai5d-definitions')).toHaveAttribute('data-colonnes', '2');

    expect(CONTENEUR_DEFINITIONS_DEUX_COLONNES).toBe(480);
    const css = feuille();
    expect(css).toContain('.ai5d-definitions { container-type: inline-size; }');
    expect(css).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(css).toContain(
      "@container (min-width: 480px) { .ai5d-definitions[data-colonnes='2'] .ai5d-definitions__liste { grid-template-columns: repeat(2, minmax(0, 1fr)); } }",
    );
    expect(css).not.toMatch(/@media \(min-width/);
  });

  it('libelle en texte faible et casse normale, valeur en texte fort, qui passe a la ligne', () => {
    render(<ListeDefinitions elements={FAITS} />);
    const css = feuille();
    expect(css).toContain(
      '.ai5d-definitions__element dt { font-family: var(--police-corps); font-size: var(--taille-xs); font-weight: var(--graisse-moyenne); line-height: 1.6; color: var(--texte-faible); }',
    );
    expect(css).toContain('color: var(--texte-fort);');
    expect(css).toContain('overflow-wrap: anywhere;');
    expect(css).not.toContain('text-transform');
  });

  it('reste rendable par un composant serveur', () => {
    expect(
      readFileSync('noyau/composants/ListeDefinitions.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(false);
  });
});
```

- [ ] **Step 5 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/composants/TitreSection.tsx noyau/composants/ListeDefinitions.tsx tests/composants/titre-section.test.tsx tests/composants/liste-definitions.test.tsx
```

Cocher T9 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/composants/TitreSection.tsx noyau/composants/ListeDefinitions.tsx tests/composants/titre-section.test.tsx tests/composants/liste-definitions.test.tsx tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Un titre de section et une liste de définitions, écrits une fois pour tous les produits
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 10 : `LigneLien` et `ListeLignes`

SPEC §5.9, §5.10. Deuxième consommateur constaté : `LigneCompte.tsx:24-34` de Compte, une ligne
entière en `Link` stylée en ligne, sans survol, sans focus, sans appui, et sa propriété `dernier`.

**Files:**
- Create: `noyau/composants/LigneLien.tsx`
- Create: `noyau/composants/ListeLignes.tsx`
- Create: `tests/composants/ligne-lien.test.tsx`
- Create: `tests/composants/liste-lignes.test.tsx`
- Modify: `gardes/gardes.test.ts` (`HORS_ECHELLE`)

**Interfaces:**
- Consumes : `ComposantLien` (tâche 4) ; `CLASSE_HORS_ECRAN`, `ID_STYLE_HORS_ECRAN`,
  `MENTION_NOUVEL_ONGLET`, `STYLE_HORS_ECRAN`, `lienNatif`, `relSur` (`lien.ts`, tâche 4) ; `Icone`.
- Produces :
  - `LigneLien(proprietes: ProprietesLigneLien)`, propriétés du §5.9.1 de la SPEC ;
    `STYLE_LIGNE_LIEN` (exporté).
  - `ListeLignes(proprietes: ProprietesListeLignes)` :
    `{ children: ReactNode; etiquette?: string | undefined; bordsExterieurs?: boolean | undefined; className?; style? }` ;
    `STYLE_LISTE_LIGNES` (exporté).

- [ ] **Step 1 : écrire `noyau/composants/LigneLien.tsx`**

```tsx
import { ChevronRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Icone } from './Icone';
import type { ComposantLien } from './LiensRail';
import {
  CLASSE_HORS_ECRAN,
  ID_STYLE_HORS_ECRAN,
  MENTION_NOUVEL_ONGLET,
  STYLE_HORS_ECRAN,
  lienNatif,
  relSur,
} from './lien';

/**
 * Une ligne qui mène quelque part : une formation, une ressource, un replay.
 *
 * ── UNE LIGNE ENTIÈRE EST UNE CIBLE ─────────────────────────────────────────
 * Un seul élément interactif, le lien. On ne pose ni lien ni bouton dans `debut` ou `fin` : un lien
 * dans un lien est invalide, et deux cibles sur une même ligne se touchent au doigt. Une ligne qui ne
 * mène nulle part n'est pas un lien : le produit rend du texte, il n'y a donc pas d'état désactivé.
 *
 * ── ELLE RÉPOND DÈS L'APPUI ─────────────────────────────────────────────────
 * Sur un réseau lent, le pire n'est pas d'attendre : c'est de ne pas savoir si l'appui a été pris.
 * L'appui pose la surface de sélection sans transition, dans l'image suivante ; le relâchement repart
 * en `--mouvement-retour`. Puis, si le lien du produit suit le protocole d'attente de `lien.ts`, le
 * chevron cède la place à trois points.
 *
 * ── SA HAUTEUR EST CELLE DE LA DENSITÉ ──────────────────────────────────────
 * `min-height: var(--ligne-liste)` : c'est le premier composant du système qui lit ce jeton. 56 px en
 * `equilibre`, 40 px en `compact` à la souris, 44 px au moins au doigt.
 *
 * ── DEUX CAS SANS CHEVRON, ET SANS ROUTEUR ──────────────────────────────────
 * Un téléchargement et un lien sortant : un `<a>` natif, quel que soit le lien du produit, et aucun
 * chevron, qui promettrait une page. Le lien sortant reçoit `noopener noreferrer` et la mention lue du
 * nouvel onglet.
 *
 * Le survol change de jeton selon le thème, comme `LiensRail` : `--surface-chaude` se détache en
 * clair, `--surface-3` prend le relais en sombre, en attendant le jeton de survol de la 1.3.0.
 */

export interface ProprietesLigneLien {
  href: string;
  /** Le nom de la destination. Une ligne, deux au plus. */
  titre: string;
  /** Ce qui distingue cette ligne des autres : une référence, une date. */
  description?: ReactNode | undefined;
  /** Un fait court : « PDF · 2,4 Mo », un numéro. */
  meta?: ReactNode | undefined;
  /** La méta en JetBrains Mono : un identifiant, un numéro. */
  metaMono?: boolean | undefined;
  /** Ce qui précède le texte : une icône, un avatar, une pastille d'état. */
  debut?: ReactNode | undefined;
  /** Ce qui suit le texte. Par défaut un chevron ; aucun avec `download` ou `externe`. */
  fin?: ReactNode | undefined;
  /** Le titre en Fraunces 400, `--taille-lg` : pour une ligne qui nomme une formation. */
  titreEnTitre?: boolean | undefined;
  /** Le lien du routeur du produit ; `a` par défaut. */
  Lien?: ComposantLien | undefined;
  /** Un téléchargement : `<a download>` natif, sans chevron. */
  download?: boolean | string | undefined;
  /** Un lien sortant : nouvel onglet, `rel="noopener noreferrer"`, mention lue, sans chevron. */
  externe?: boolean | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

const ID_STYLE = 'ai5d-ligne-lien';

/*
  L ecart de 2 px entre le titre et sa description est hors echelle, et nomme comme tel dans les
  exceptions de la garde d espacement : une ligne, pas deux paragraphes.
*/
export const STYLE_LIGNE_LIEN = `
.ai5d-ligne {
  display: flex; align-items: center; gap: var(--espace-3);
  min-height: var(--ligne-liste);
  padding: var(--espace-3);
  margin-inline: calc(var(--espace-3) * -1);
  border-radius: var(--rayon-md);
  color: inherit;
  text-decoration: none;
  transition: background var(--mouvement-retour);
}
.ai5d-ligne__debut,
.ai5d-ligne__fin { flex: 0 0 auto; display: inline-flex; align-items: center; }
.ai5d-ligne__corps {
  flex: 1 1 auto; min-width: 0;
  display: flex; flex-direction: column; gap: 2px;
}
.ai5d-ligne__titre {
  font-family: var(--police-corps); font-size: var(--taille-md);
  font-weight: var(--graisse-moyenne); color: var(--texte-fort);
  overflow-wrap: anywhere;
}
.ai5d-ligne__titre[data-en-titre] {
  font-family: var(--police-titre); font-size: var(--taille-lg);
  font-weight: var(--graisse-normale); line-height: var(--interligne-titre);
}
.ai5d-ligne__description,
.ai5d-ligne__meta {
  font-family: var(--police-corps); font-size: var(--taille-sm);
  font-weight: var(--graisse-normale); color: var(--texte-faible);
}
.ai5d-ligne__meta[data-mono] { font-family: var(--police-mono); font-weight: var(--graisse-moyenne); }
.ai5d-ligne__fin { color: var(--texte-faible); }

@media (hover: hover) {
  .ai5d-ligne:hover { background: var(--surface-chaude); }
  :root[data-theme='dark'] .ai5d-ligne:hover { background: var(--surface-3); }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .ai5d-ligne:hover { background: var(--surface-3); }
  }
}
.ai5d-ligne:active { background: var(--surface-selection); transition: none; }
.ai5d-ligne:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }

.ai5d-ligne__attente { display: none; align-items: center; gap: var(--espace-1); color: var(--texte-faible); }
.ai5d-ligne:is([data-en-attente], :has([data-en-attente])) .ai5d-ligne__attente { display: inline-flex; }
.ai5d-ligne:is([data-en-attente], :has([data-en-attente])) .ai5d-ligne__fin { display: none; }
.ai5d-ligne__point {
  width: 4px; height: 4px;
  border-radius: var(--rayon-plein);
  background: currentColor;
  opacity: 0.35;
  animation: ai5d-ligne-point 1200ms infinite ease-in-out;
}
.ai5d-ligne__point:nth-child(2) { animation-delay: 160ms; }
.ai5d-ligne__point:nth-child(3) { animation-delay: 320ms; }
@keyframes ai5d-ligne-point {
  0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-ligne__point { animation: none; opacity: 1; }
}
`;

/** Les trois points de l'attente, décoratifs et masqués hors attente. */
function PointsDAttente() {
  return (
    <span className="ai5d-ligne__attente" aria-hidden="true">
      <span className="ai5d-ligne__point" />
      <span className="ai5d-ligne__point" />
      <span className="ai5d-ligne__point" />
    </span>
  );
}

export function LigneLien({
  href,
  titre,
  description,
  meta,
  metaMono = false,
  debut,
  fin,
  titreEnTitre = false,
  Lien,
  download,
  externe = false,
  className,
  style,
}: ProprietesLigneLien) {
  const target = externe ? '_blank' : undefined;
  const sansChevron = lienNatif({ download, target });
  const finRendue =
    fin !== undefined ? fin : sansChevron ? null : <Icone nom={ChevronRight} taille={20} />;
  const classe = className === undefined ? 'ai5d-ligne' : `ai5d-ligne ${className}`;

  const contenu = (
    <>
      {debut === undefined ? null : <span className="ai5d-ligne__debut">{debut}</span>}
      <span className="ai5d-ligne__corps">
        <span className="ai5d-ligne__titre" data-en-titre={titreEnTitre ? '' : undefined}>
          {titre}
        </span>
        {description === undefined ? null : (
          <span className="ai5d-ligne__description">{description}</span>
        )}
        {meta === undefined ? null : (
          <span className="ai5d-ligne__meta" data-mono={metaMono ? '' : undefined}>
            {meta}
          </span>
        )}
      </span>
      {finRendue === null ? null : <span className="ai5d-ligne__fin">{finRendue}</span>}
      <PointsDAttente />
      {externe ? <span className={CLASSE_HORS_ECRAN}>{` ${MENTION_NOUVEL_ONGLET}`}</span> : null}
    </>
  );

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_LIGNE_LIEN }} />
      {externe ? (
        <style id={ID_STYLE_HORS_ECRAN} dangerouslySetInnerHTML={{ __html: STYLE_HORS_ECRAN }} />
      ) : null}

      {Lien === undefined || sansChevron ? (
        <a
          href={href}
          download={download}
          target={target}
          rel={relSur(undefined, target)}
          className={classe}
          style={style}
        >
          {contenu}
        </a>
      ) : (
        <Lien href={href} className={classe} style={style}>
          {contenu}
        </Lien>
      )}
    </>
  );
}
```

- [ ] **Step 2 : écrire `noyau/composants/ListeLignes.tsx`**

```tsx
import { Children, isValidElement } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * La liste qui range des `LigneLien`, avec un filet entre chaque.
 *
 * `role="list"` n'est pas redondant : sans puces, Safari retire la sémantique de liste, et VoiceOver
 * n'annonce plus « liste, trois éléments ».
 *
 * Chaque enfant rendu prend son propre `<li>` ; un enfant absent (`null`, `false`) n'en prend aucun,
 * pour qu'une ligne conditionnelle ne laisse pas un filet orphelin. Un fragment compte pour un enfant :
 * on passe les lignes une par une.
 *
 * `bordsExterieurs` à faux fait ce que Compte faisait à la main avec la propriété `dernier` de
 * `LigneCompte` : aucun filet au-dessus de la première ligne ni sous la dernière.
 */

export interface ProprietesListeLignes {
  /** Des `LigneLien`, une par destination. Chaque enfant est posé dans son propre `<li>`. */
  children: ReactNode;
  /** Le nom de la liste pour les lecteurs d'écran, quand aucun titre visible ne la précède. */
  etiquette?: string | undefined;
  /** Un filet au-dessus de la première ligne et sous la dernière. Vrai par défaut. */
  bordsExterieurs?: boolean | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

const ID_STYLE = 'ai5d-liste-lignes';

export const STYLE_LISTE_LIGNES = `
.ai5d-liste-lignes { list-style: none; margin: 0; padding: 0; }
.ai5d-liste-lignes > li + li { border-top: 1px solid var(--bordure); }
.ai5d-liste-lignes[data-bords] { border-top: 1px solid var(--bordure); border-bottom: 1px solid var(--bordure); }
`;

export function ListeLignes({
  children,
  etiquette,
  bordsExterieurs = true,
  className,
  style,
}: ProprietesListeLignes) {
  const lignes = Children.toArray(children);

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_LISTE_LIGNES }} />

      <ul
        role="list"
        aria-label={etiquette}
        className={className === undefined ? 'ai5d-liste-lignes' : `ai5d-liste-lignes ${className}`}
        data-bords={bordsExterieurs ? '' : undefined}
        style={style}
      >
        {lignes.map((ligne, index) => (
          <li key={isValidElement(ligne) && ligne.key !== null ? ligne.key : index}>{ligne}</li>
        ))}
      </ul>
    </>
  );
}
```

- [ ] **Step 3 : nommer le `2px` de `LigneLien.tsx` dans `HORS_ECHELLE` (`gardes/gardes.test.ts`)**

Après l'entrée `EnteteCarte.tsx` :

```ts
    // Le titre d une ligne et sa description, serres : une ligne, pas deux paragraphes.
    'noyau/composants/LigneLien.tsx': ['2px'],
```

- [ ] **Step 4 : écrire `tests/composants/ligne-lien.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'react';
import { FileText } from 'lucide-react';
import { Icone } from '../../noyau/composants/Icone';
import { LigneLien, STYLE_LIGNE_LIEN } from '../../noyau/composants/LigneLien';
import type { ComposantLien } from '../../noyau/composants/LiensRail';

const css = STYLE_LIGNE_LIEN.replace(/\s+/g, ' ');

function espion() {
  const recus: Array<ComponentProps<ComposantLien>> = [];
  const Lien: ComposantLien = (proprietes) => {
    recus.push(proprietes);
    const { children, ...reste } = proprietes;
    return <a {...reste}>{children}</a>;
  };
  return { Lien, recus };
}

describe('LigneLien (1.2.0)', () => {
  it('rend un seul element interactif : la ligne entiere est une cible', () => {
    const { container } = render(
      <LigneLien
        href="/formations/7K3F9Q"
        titre="IA générative et relation client"
        description="Du 13 au 15 octobre 2026"
        meta="Présentiel"
        debut={<Icone nom={FileText} taille={20} />}
      />,
    );
    expect(
      container.querySelectorAll('a, button, input, select, textarea, [tabindex]'),
    ).toHaveLength(1);

    const lien = screen.getByRole('link');
    expect(lien).toHaveClass('ai5d-ligne');
    expect(lien).toHaveAttribute('href', '/formations/7K3F9Q');
    expect(lien.querySelector('.ai5d-ligne__debut')).not.toBeNull();
    expect(lien.querySelector('.ai5d-ligne__titre')).toHaveTextContent('IA générative et relation client');
    expect(lien.querySelector('.ai5d-ligne__description')).toHaveTextContent(
      'Du 13 au 15 octobre 2026',
    );
    expect(lien.querySelector('.ai5d-ligne__meta')).toHaveTextContent('Présentiel');
  });

  it('porte un chevron par defaut, et ses points d attente, tous deux decoratifs', () => {
    render(<LigneLien href="/ressources" titre="Ressources" description="Trois fichiers" />);
    const lien = screen.getByRole('link', { name: /Ressources/ });
    expect(lien.querySelector('.ai5d-ligne__fin svg')).toHaveAttribute('aria-hidden', 'true');
    expect(lien.querySelector('.ai5d-ligne__attente')).toHaveAttribute('aria-hidden', 'true');
    expect(lien.querySelectorAll('.ai5d-ligne__point')).toHaveLength(3);
  });

  it('avec download : a natif, telechargement, aucun chevron, meme avec un lien du produit', () => {
    const { Lien, recus } = espion();
    render(
      <LigneLien
        href="/ressources/support-jour-1.pdf"
        titre="Support du jour 1"
        meta="PDF · 2,4 Mo"
        download
        Lien={Lien}
      />,
    );
    const lien = screen.getByRole('link');
    expect(recus).toHaveLength(0);
    expect(lien).toHaveAttribute('download');
    expect(lien.querySelector('.ai5d-ligne__fin')).toBeNull();
  });

  it('externe : a natif, nouvel onglet, rel complet, mention lue, aucun chevron', () => {
    const { Lien, recus } = espion();
    render(
      <LigneLien href="https://exemple.invalid/replay" titre="Replay du jour 1" externe Lien={Lien} />,
    );
    const lien = screen.getByRole('link', { name: /s’ouvre dans un nouvel onglet/ });
    expect(recus).toHaveLength(0);
    expect(lien).toHaveAttribute('target', '_blank');
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer');
    expect(lien.querySelector('.ai5d-ligne__fin')).toBeNull();
  });

  it('passe par le lien du produit sinon, avec sa classe et son style', () => {
    const { Lien, recus } = espion();
    render(
      <LigneLien
        href="/formations"
        titre="Mes formations"
        Lien={Lien}
        className="ma-ligne"
        style={{ marginTop: 'var(--espace-2)' }}
      />,
    );
    expect(recus).toHaveLength(1);
    expect(recus[0]?.className).toBe('ai5d-ligne ma-ligne');
    expect(recus[0]?.style).toEqual({ marginTop: 'var(--espace-2)' });
  });

  it('garde une fin fournie, meme avec download', () => {
    render(<LigneLien href="/programme.pdf" titre="Programme" download fin={<span>PDF</span>} />);
    expect(screen.getByRole('link').querySelector('.ai5d-ligne__fin')).toHaveTextContent('PDF');
  });

  it('rend la meta en chasse fixe, et le titre en Fraunces, sur demande', () => {
    const { container } = render(
      <LigneLien
        href="/verifier"
        titre="IA générative et relation client"
        titreEnTitre
        meta="AI5D-2026-7K3F9Q"
        metaMono
      />,
    );
    expect(container.querySelector('.ai5d-ligne__meta')).toHaveAttribute('data-mono');
    expect(container.querySelector('.ai5d-ligne__titre')).toHaveAttribute('data-en-titre');
    expect(css).toContain(
      '.ai5d-ligne__meta[data-mono] { font-family: var(--police-mono); font-weight: var(--graisse-moyenne); }',
    );
    expect(css).toContain(
      '.ai5d-ligne__titre[data-en-titre] { font-family: var(--police-titre); font-size: var(--taille-lg); font-weight: var(--graisse-normale); line-height: var(--interligne-titre); }',
    );
  });
});

describe('la feuille de LigneLien', () => {
  it('tient la hauteur de densite : le premier composant qui lit --ligne-liste', () => {
    expect(css).toContain('min-height: var(--ligne-liste);');
  });

  it('pose l appui sans transition, et relache en --mouvement-retour', () => {
    expect(css).toContain(
      '.ai5d-ligne:active { background: var(--surface-selection); transition: none; }',
    );
    expect(css).toContain('transition: background var(--mouvement-retour);');
  });

  it('garde le survol aux pointeurs fins : surface chaude en clair, surface 3 en sombre', () => {
    expect(STYLE_LIGNE_LIEN.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')).not.toContain(
      ':hover',
    );
    expect(css).toContain('.ai5d-ligne:hover { background: var(--surface-chaude); }');
    expect(css).toContain(
      ":root[data-theme='dark'] .ai5d-ligne:hover { background: var(--surface-3); }",
    );
    expect(css).toContain(
      ":root:not([data-theme='light']) .ai5d-ligne:hover { background: var(--surface-3); }",
    );
  });

  it('montre l attente par le protocole, chevron retire, points figes sous mouvement reduit', () => {
    expect(css).toContain(
      '.ai5d-ligne:is([data-en-attente], :has([data-en-attente])) .ai5d-ligne__attente { display: inline-flex; }',
    );
    expect(css).toContain(
      '.ai5d-ligne:is([data-en-attente], :has([data-en-attente])) .ai5d-ligne__fin { display: none; }',
    );
    expect(css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))).toContain(
      '.ai5d-ligne__point { animation: none; opacity: 1; }',
    );
  });

  it('porte l anneau de focus de 2 px en couleur d action', () => {
    expect(css).toContain(
      '.ai5d-ligne:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }',
    );
  });

  it('n ecrit aucune couleur en dur, et reste rendable par un composant serveur', () => {
    expect(STYLE_LIGNE_LIEN).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(readFileSync('noyau/composants/LigneLien.tsx', 'utf8').startsWith("'use client';")).toBe(
      false,
    );
  });
});
```

- [ ] **Step 5 : écrire `tests/composants/liste-lignes.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { LigneLien } from '../../noyau/composants/LigneLien';
import { ListeLignes, STYLE_LISTE_LIGNES } from '../../noyau/composants/ListeLignes';

describe('ListeLignes (1.2.0)', () => {
  it('rend une liste nommee, un element par ligne rendue, et aucun pour un enfant absent', () => {
    const avecSupport = false;
    render(
      <ListeLignes etiquette="Mes ressources">
        <LigneLien href="/programme" titre="Programme" />
        {null}
        {avecSupport && <LigneLien href="/support" titre="Support" />}
        <LigneLien href="/replay" titre="Replay" />
      </ListeLignes>,
    );
    const liste = screen.getByRole('list', { name: 'Mes ressources' });
    expect(liste.tagName).toBe('UL');
    expect(liste).toHaveAttribute('role', 'list');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('trace les filets entre les lignes, et aux bords sauf demande contraire', () => {
    const { container, rerender } = render(
      <ListeLignes>
        <LigneLien href="/programme" titre="Programme" />
      </ListeLignes>,
    );
    expect(container.querySelector('ul')).toHaveAttribute('data-bords');

    rerender(
      <ListeLignes bordsExterieurs={false}>
        <LigneLien href="/programme" titre="Programme" />
      </ListeLignes>,
    );
    expect(container.querySelector('ul')).not.toHaveAttribute('data-bords');

    const css = STYLE_LISTE_LIGNES.replace(/\s+/g, ' ');
    expect(css).toContain('.ai5d-liste-lignes { list-style: none; margin: 0; padding: 0; }');
    expect(css).toContain('.ai5d-liste-lignes > li + li { border-top: 1px solid var(--bordure); }');
    expect(css).toContain(
      '.ai5d-liste-lignes[data-bords] { border-top: 1px solid var(--bordure); border-bottom: 1px solid var(--bordure); }',
    );
  });

  it('reste rendable par un composant serveur', () => {
    expect(readFileSync('noyau/composants/ListeLignes.tsx', 'utf8').startsWith("'use client';")).toBe(
      false,
    );
  });
});
```

- [ ] **Step 6 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/composants/LigneLien.tsx noyau/composants/ListeLignes.tsx tests/composants/ligne-lien.test.tsx tests/composants/liste-lignes.test.tsx gardes/gardes.test.ts
```

Cocher T10 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/composants/LigneLien.tsx noyau/composants/ListeLignes.tsx tests/composants/ligne-lien.test.tsx tests/composants/liste-lignes.test.tsx gardes/gardes.test.ts tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Une ligne qui mène quelque part et répond dès l’appui, et la liste qui les range
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 11 : `ValeurCopiable`

SPEC §5.12. Composant client. Deuxième consommateur constaté : `CopierValeur.tsx:16` de Compte,
employé par `GestionCles.tsx:133` et `GestionReceptions.tsx:202`, dont la copie échouait en silence
(sprint 19, constat K6).

**Files:**
- Create: `noyau/composants/copie.ts`
- Create: `noyau/composants/ValeurCopiable.tsx`
- Create: `tests/composants/valeur-copiable.test.tsx`

**Interfaces:**
- Consumes : `Bouton` (`ProprietesBoutonAction`, tâche 4) ; `Champ` (`id`, `libelle`, `value`,
  `readOnly`, `onFocus`, `className` sur l'enveloppe, `style` sur l'entrée) ; `Icone` ;
  `CLASSE_HORS_ECRAN`, `ID_STYLE_HORS_ECRAN`, `STYLE_HORS_ECRAN` (`lien.ts`).
- Produces :
  - `noyau/composants/copie.ts` : `DUREE_SUCCES_COPIE_MS = 2000` (écart E3).
  - `ValeurCopiable(proprietes: ProprietesValeurCopiable)` :
    `{ valeur: string; libelle: string; messageEchec: string; libelleBouton?: string | undefined; libelleSucces?: string | undefined; mono?: boolean | undefined }` ;
    `STYLE_COPIABLE` (exporté, lu par les spécimens).

- [ ] **Step 1 : écrire `noyau/composants/copie.ts`**

```ts
/**
 * La durée pendant laquelle `ValeurCopiable` dit qu'une valeur est copiée, en millisecondes.
 *
 * Elle vit dans ce module pur, sans directive, et non dans le fichier du composant : celui-là est un
 * module client, et une constante importée d'un module client par un composant serveur vaut
 * `undefined` sous Next, sans erreur (leçon du dépôt : une constante lue par le serveur ne vit pas
 * dans un module client).
 */
export const DUREE_SUCCES_COPIE_MS = 2000;
```

- [ ] **Step 2 : écrire `noyau/composants/ValeurCopiable.tsx`**

```tsx
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Check, Copy } from 'lucide-react';
import { Bouton } from './Bouton';
import { Champ } from './Champ';
import { DUREE_SUCCES_COPIE_MS } from './copie';
import { Icone } from './Icone';
import { CLASSE_HORS_ECRAN, ID_STYLE_HORS_ECRAN, STYLE_HORS_ECRAN } from './lien';

/**
 * Une valeur qui se copie d'un geste, ou se sélectionne quand la copie échoue.
 *
 * ── L'ÉCHEC N'EST JAMAIS AVALÉ ──────────────────────────────────────────────
 * C'est le défaut que Compte a payé : `writeText(…).catch(() => undefined)` laissait croire une clé
 * copiée. Ici, si la promesse est rejetée, ou si le presse-papiers manque (page non sécurisée,
 * navigateur intégré d'une application), le champ prend le focus, toute la valeur est sélectionnée, et
 * `messageEchec` s'affiche et s'annonce. Il est obligatoire parce qu'il nomme ce qu'il faut
 * sélectionner, « l'adresse », « la clé », ce qu'une phrase générique ne peut pas.
 *
 * ── LE SUCCÈS SE DIT DEUX SECONDES ──────────────────────────────────────────
 * `libelleSucces` et une coche pendant `DUREE_SUCCES_COPIE_MS`, puis le repos ; un second clic relance
 * la minuterie, nettoyée au démontage. L'annonce est polie, jamais une alerte : une copie n'interrompt
 * personne.
 *
 * ── LA VALEUR À 16 PX ───────────────────────────────────────────────────────
 * En chasse fixe par défaut, mais à `--taille-md` : sous 16 px, un téléphone iOS agrandit la page au
 * focus du champ.
 *
 * Presse-papiers en écriture seulement, sur un geste de la personne ; aucune lecture.
 */

export interface ProprietesValeurCopiable {
  /** La valeur, affichée en clair dans un champ en lecture seule. */
  valeur: string;
  /** Le libellé du champ. */
  libelle: string;
  /** Ce qu'on lit quand la copie échoue : il nomme le geste manuel. Obligatoire. */
  messageEchec: string;
  /** « Copier » par défaut. */
  libelleBouton?: string | undefined;
  /** « Copié » par défaut ; affiché pendant `DUREE_SUCCES_COPIE_MS`. */
  libelleSucces?: string | undefined;
  /** La valeur en JetBrains Mono. Vrai par défaut. */
  mono?: boolean | undefined;
}

type EtatCopie = 'repos' | 'succes' | 'echec';

const ID_STYLE = 'ai5d-valeur-copiable';

export const STYLE_COPIABLE = `
.ai5d-copiable { container-type: inline-size; display: flex; flex-direction: column; gap: var(--espace-2); }
.ai5d-copiable__rangee { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--espace-2); }
.ai5d-copiable__champ { flex: 1 1 16rem; min-width: 0; }
.ai5d-copiable__echec {
  margin: 0;
  font-family: var(--police-corps); font-size: var(--taille-sm);
  font-weight: var(--graisse-normale); color: var(--texte-faible);
}
@container (max-width: 24rem) {
  .ai5d-copiable__rangee { flex-direction: column; align-items: stretch; }
  .ai5d-copiable__rangee .ai5d-bouton { width: 100%; }
}
`;

/** La valeur en chasse fixe. Absente, le champ garde sa police : on ne la remplace pas par rien. */
const STYLE_VALEUR_MONO: CSSProperties = {
  fontFamily: 'var(--police-mono)',
  fontWeight: 'var(--graisse-moyenne)',
  fontSize: 'var(--taille-md)',
};

export function ValeurCopiable({
  valeur,
  libelle,
  messageEchec,
  libelleBouton = 'Copier',
  libelleSucces = 'Copié',
  mono = true,
}: ProprietesValeurCopiable) {
  const identifiant = `valeur-copiable-${useId()}`;
  const [etat, setEtat] = useState<EtatCopie>('repos');
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (minuterie.current !== null) clearTimeout(minuterie.current);
    },
    [],
  );

  function arreterMinuterie(): void {
    if (minuterie.current === null) return;
    clearTimeout(minuterie.current);
    minuterie.current = null;
  }

  function echouer(): void {
    setEtat('echec');
    const champ = document.getElementById(identifiant);
    if (!(champ instanceof HTMLInputElement)) return;
    champ.focus();
    champ.select();
  }

  async function copier(): Promise<void> {
    arreterMinuterie();
    const pressePapiers = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
    if (pressePapiers === undefined) {
      echouer();
      return;
    }
    try {
      await pressePapiers.writeText(valeur);
    } catch {
      echouer();
      return;
    }
    setEtat('succes');
    minuterie.current = setTimeout(() => {
      minuterie.current = null;
      setEtat('repos');
    }, DUREE_SUCCES_COPIE_MS);
  }

  const succes = etat === 'succes';

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_COPIABLE }} />
      <style id={ID_STYLE_HORS_ECRAN} dangerouslySetInnerHTML={{ __html: STYLE_HORS_ECRAN }} />

      <div className="ai5d-copiable">
        <div className="ai5d-copiable__rangee">
          <Champ
            id={identifiant}
            libelle={libelle}
            value={valeur}
            readOnly
            spellCheck={false}
            autoComplete="off"
            onFocus={(evenement) => evenement.currentTarget.select()}
            className="ai5d-copiable__champ"
            style={mono ? STYLE_VALEUR_MONO : undefined}
          />
          <Bouton variante="neutre" onClick={() => void copier()}>
            <Icone nom={succes ? Check : Copy} taille={16} />
            {succes ? libelleSucces : libelleBouton}
          </Bouton>
        </div>

        <div className="ai5d-copiable__annonce" aria-live="polite">
          {succes ? <span className={CLASSE_HORS_ECRAN}>{libelleSucces}</span> : null}
          {etat === 'echec' ? <p className="ai5d-copiable__echec">{messageEchec}</p> : null}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3 : écrire `tests/composants/valeur-copiable.test.tsx`**

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Check } from 'lucide-react';
import { Icone } from '../../noyau/composants/Icone';
import { ValeurCopiable } from '../../noyau/composants/ValeurCopiable';
import { DUREE_SUCCES_COPIE_MS } from '../../noyau/composants/copie';

/**
 * `ValeurCopiable` (SPEC 1.2.0, §5.12). Le presse-papiers est simulé : jsdom n'en a pas. Ce qui se
 * garde ici est ce que Compte a payé : un échec qui se dit, et ne se fait jamais passer pour un succès.
 */

const ADRESSE = 'https://portail.ai5d.technology/badge/7K3F9Q';
const ECHEC = 'Sélectionnez l’adresse ci-dessus pour la copier.';

function pressePapiers(writeText: (valeur: string) => Promise<void>): void {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
}

function rendre() {
  return render(
    <ValeurCopiable
      valeur={ADRESSE}
      libelle="Adresse de votre badge"
      messageEchec={ECHEC}
      libelleBouton="Copier le lien"
      libelleSucces="Lien copié"
    />,
  );
}

async function cliquer(nom: string): Promise<void> {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: nom }));
    await Promise.resolve();
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('ValeurCopiable (1.2.0)', () => {
  it('affiche la valeur en clair, dans un champ en lecture seule, lie a son libelle', () => {
    rendre();
    const champ = screen.getByLabelText('Adresse de votre badge');
    expect(champ).toHaveValue(ADRESSE);
    expect(champ).toHaveAttribute('readonly');
    expect(champ).toHaveAttribute('spellcheck', 'false');
    expect(champ).toHaveAttribute('autocomplete', 'off');
  });

  it('compose la valeur en chasse fixe, a 16 px : sous 16 px, iOS agrandit la page au focus', () => {
    rendre();
    const champ = screen.getByLabelText('Adresse de votre badge');
    expect(champ.style.fontFamily).toContain('--police-mono');
    expect(champ.style.fontSize).toContain('--taille-md');
  });

  it('sans chasse fixe, garde la police du champ, jamais celle du navigateur', () => {
    render(<ValeurCopiable valeur={ADRESSE} libelle="Adresse" messageEchec={ECHEC} mono={false} />);
    expect(screen.getByLabelText('Adresse').style.fontFamily).toContain('--police-corps');
  });

  it('prend Copier et Copie comme libelles par defaut', async () => {
    pressePapiers(vi.fn().mockResolvedValue(undefined));
    render(
      <ValeurCopiable
        valeur="cle-de-demonstration"
        libelle="Clé"
        messageEchec="Sélectionnez la clé ci-dessus pour la copier."
      />,
    );
    await cliquer('Copier');
    expect(screen.getByRole('button', { name: 'Copié' })).toBeInTheDocument();
  });

  it('succes : copie, dit Lien copie avec une coche, l annonce, puis revient au repos a 2 000 ms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    pressePapiers(writeText);
    const { container } = rendre();
    await cliquer('Copier le lien');

    expect(writeText).toHaveBeenCalledWith(ADRESSE);
    const bouton = screen.getByRole('button', { name: 'Lien copié' });
    const coche = render(<Icone nom={Check} taille={16} />).container.querySelector('svg');
    expect(bouton.querySelector('svg')?.innerHTML).toBe(coche?.innerHTML);
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Lien copié');

    expect(DUREE_SUCCES_COPIE_MS).toBe(2000);
    act(() => {
      vi.advanceTimersByTime(DUREE_SUCCES_COPIE_MS - 1);
    });
    expect(screen.getByRole('button', { name: 'Lien copié' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('button', { name: 'Copier le lien' })).toBeInTheDocument();
  });

  it('un second clic relance la minuterie', async () => {
    pressePapiers(vi.fn().mockResolvedValue(undefined));
    rendre();
    await cliquer('Copier le lien');
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    await cliquer('Lien copié');
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole('button', { name: 'Lien copié' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('button', { name: 'Copier le lien' })).toBeInTheDocument();
  });

  it('echec : ne dit jamais copie, selectionne toute la valeur, affiche et annonce le geste', async () => {
    pressePapiers(vi.fn().mockRejectedValue(new Error('refus du navigateur')));
    const { container } = rendre();
    await cliquer('Copier le lien');

    const champ = screen.getByLabelText<HTMLInputElement>('Adresse de votre badge');
    expect(champ).toHaveFocus();
    expect(champ.selectionStart).toBe(0);
    expect(champ.selectionEnd).toBe(ADRESSE.length);
    expect(screen.getByText(ECHEC)).toBeVisible();
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(ECHEC);
    expect(screen.queryByRole('button', { name: 'Lien copié' })).toBeNull();
  });

  it('echoue aussi quand le presse-papiers manque, sur une page non securisee', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    rendre();
    await cliquer('Copier le lien');
    expect(screen.getByLabelText('Adresse de votre badge')).toHaveFocus();
    expect(screen.getByText(ECHEC)).toBeInTheDocument();
  });

  it('nettoie sa minuterie au demontage', async () => {
    pressePapiers(vi.fn().mockResolvedValue(undefined));
    const { unmount } = rendre();
    await cliquer('Copier le lien');
    const nettoyage = vi.spyOn(globalThis, 'clearTimeout');
    unmount();
    expect(nettoyage).toHaveBeenCalled();
    nettoyage.mockRestore();
  });

  it('empile champ et bouton sous 24rem de conteneur, et ne connait aucun palier', () => {
    rendre();
    const css = (document.getElementById('ai5d-valeur-copiable')?.innerHTML ?? '').replace(
      /\s+/g,
      ' ',
    );
    expect(css).toContain('.ai5d-copiable { container-type: inline-size;');
    expect(css).toContain('@container (max-width: 24rem)');
    expect(css).toContain('flex: 1 1 16rem;');
    expect(css).not.toMatch(/@media \(min-width/);
  });

  it('se declare module client, et sa duree vit dans un module pur', () => {
    expect(
      readFileSync('noyau/composants/ValeurCopiable.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(true);
    expect(readFileSync('noyau/composants/copie.ts', 'utf8')).not.toContain("'use client'");
  });
});
```

- [ ] **Step 4 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/composants/copie.ts noyau/composants/ValeurCopiable.tsx tests/composants/valeur-copiable.test.tsx
```

Cocher T11 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/composants/copie.ts noyau/composants/ValeurCopiable.tsx tests/composants/valeur-copiable.test.tsx tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Une valeur qui se copie d’un geste, ou se sélectionne quand la copie échoue
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 12 : La recette du logotype, hors du DOM

SPEC §5.13 ; décision 008. Deuxième consommateur constaté pour la recette : l'en-tête des courriels de
Compte écrit « AI5D » d'un bloc en Fraunces à l'encre (`emails/Coquille.tsx:44-53`). Le tracé
vectoriel est repoussé au lot L4.

**Files:**
- Create: `noyau/logotype.ts`
- Modify: `noyau/composants/Logotype.tsx:1` (import), `:3-20` (en-tête), `:37-110` (rendu)
- Modify: `package.json` (champ `exports`)
- Create: `tests/logotype.test.ts`
- Create: `tests/exports.test.ts`
- Modify: `tests/composants/composants.test.tsx` (un test dans le bloc `Logotype`)
- Create: `docs/decisions/008-le-logotype-hors-du-dom-une-recette-avant-un-trace.md`

**Interfaces:**
- Consumes : `lireJetons` (`outils/jetons.ts`).
- Produces : `@ai5d/design-system/logotype` exporte `LOGOTYPE` (valeur du §5.13.2 de la SPEC),
  `type RoleLogotype = 'lettres' | 'cinq'`, `interface MorceauLogotype`, et
  `nomLogotype(produit?: string): string`.

- [ ] **Step 1 : écrire `noyau/logotype.ts`**

```ts
/**
 * La recette du logotype AI5D, hors du DOM.
 *
 * Dans une page, le logotype est un composant (`composants/Logotype.tsx`), et le « 5 » y est toujours
 * bleu et incliné. Dans un PDF, une image de partage ou un courriel, chaque produit le recomposait à
 * sa façon : le Portail en Fraunces bleu, Compte en Fraunces à l'encre, et aucun n'inclinait le « 5 ».
 * Ce module écrit la composition une fois ; le composant la lit, et ne peut plus en diverger.
 *
 * ── AUCUNE COULEUR ICI ──────────────────────────────────────────────────────
 * Chaque morceau porte un RÔLE. Le consommateur associe `lettres` à son encre (`texte-fort` à
 * l'écran, l'encre sur papier) et `cinq` à son bleu d'action, dans le fichier que son produit réserve
 * aux couleurs d'un format sans CSS (`pdf/jetons.ts`, `emails/jetons.ts` dans le Portail). Un nom de
 * jeton n'aurait aucun sens dans un PDF.
 *
 * ── LES LIMITES, ÉCRITES ────────────────────────────────────────────────────
 * Un client de messagerie qui ignore `transform`, Outlook de bureau notamment, redresse le « 5 ».
 * Aucune recette n'y peut rien ; le bleu, lui, passe partout. Le tracé vectoriel des lettres, qui
 * lèverait cette limite, n'est pas livré : il n'a pas de deuxième consommateur, et il demande un
 * outillage de polices que ce dépôt n'a pas. Il appartient au lot L4. Décision 008.
 *
 * Module pur, sans JSX, sans directive, sans import.
 */

/** Le rôle d'un morceau : le consommateur l'associe à SES jetons. Aucune couleur ici. */
export type RoleLogotype = 'lettres' | 'cinq';

export interface MorceauLogotype {
  texte: 'AI' | '5' | 'D';
  role: RoleLogotype;
}

export const LOGOTYPE = {
  morceaux: [
    { texte: 'AI', role: 'lettres' },
    { texte: '5', role: 'cinq' },
    { texte: 'D', role: 'lettres' },
  ],
  /** Inter, graisse 700 : un PDF charge `Inter-Bold`, une image de partage Inter 700. */
  famille: 'Inter',
  graisse: 700,
  /** Lettrage en em, identique à `--lettrage-marque`. */
  lettrageEm: -0.02,
  /** Le « 5 » s'incline de -5 degrés autour de son centre, dans toutes les variantes. */
  inclinaisonCinqDeg: -5,
  /** Le nom du produit, quand il suit : « AI5D Portail ». */
  produit: {
    famille: 'Fraunces',
    graisse: 300,
    /** Taille du nom rapportée à celle du logotype. */
    echelle: 0.92,
    /** Écart avant le nom, en em de la taille du logotype. */
    ecartEm: 0.42,
  },
} as const satisfies {
  morceaux: readonly MorceauLogotype[];
  famille: string;
  graisse: number;
  lettrageEm: number;
  inclinaisonCinqDeg: number;
  produit: { famille: string; graisse: number; echelle: number; ecartEm: number };
};

/** Le nom accessible, identique à celui du composant : « AI5D » ou « AI5D Portail ». */
export function nomLogotype(produit?: string): string {
  return produit ? `AI5D ${produit}` : 'AI5D';
}
```

- [ ] **Step 2 : `noyau/composants/Logotype.tsx` lit la recette**

Après la ligne 1, ajouter :

```tsx
import { LOGOTYPE, nomLogotype } from '../logotype';
```

Dans l'en-tête (lignes 3 à 20), avant le ` */` qui le ferme, ajouter :

```tsx
 *
 * Depuis la 1.2.0, la composition vient de `noyau/logotype.ts`, la recette que suivent aussi le PDF,
 * l'image de partage et le courriel : les morceaux, l'inclinaison du « 5 », l'échelle et l'écart du
 * nom du produit. Le rendu ne change pas d'un pixel ; la recette et le composant ne peuvent plus
 * diverger.
```

Remplacer la fonction `Logotype` (lignes 37 à 110) par :

```tsx
export function Logotype({
  variante = 'auto',
  produit,
  taille = 24,
  className,
  style,
  ...reste
}: ProprietesLogotype) {
  const COULEURS: Record<VarianteLogotype, string> = {
    auto: 'var(--texte-fort)',
    encre: 'var(--encre)',
    blanc: 'var(--blanc)',
  };
  const couleurLettres = COULEURS[variante];

  const styleRacine: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'baseline',
    fontFamily: 'var(--police-corps)',
    fontSize: `${taille}px`,
    lineHeight: 1,
    ...style,
  };

  const styleLettres: CSSProperties = {
    fontWeight: 'var(--graisse-forte)',
    letterSpacing: 'var(--lettrage-marque)',
    color: couleurLettres,
  };

  const styleCinq: CSSProperties = {
    ...styleLettres,
    // Le geste de la marque. Il ne sort jamais du logotype, et le logotype
    // ne sort jamais sans lui.
    color: 'var(--action)',
    display: 'inline-block',
    transform: `rotate(${LOGOTYPE.inclinaisonCinqDeg}deg)`,
  };

  return (
    <span
      className={className}
      style={styleRacine}
      role="img"
      aria-label={nomLogotype(produit)}
      {...reste}
    >
      {LOGOTYPE.morceaux.map((morceau) => (
        <span
          key={morceau.texte}
          aria-hidden="true"
          style={morceau.role === 'cinq' ? styleCinq : styleLettres}
        >
          {morceau.texte}
        </span>
      ))}
      {produit ? (
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--police-titre)',
            fontWeight: 'var(--graisse-legere)',
            fontSize: `${Math.round(taille * LOGOTYPE.produit.echelle)}px`,
            color: couleurLettres,
            marginLeft: `${Math.round(taille * LOGOTYPE.produit.ecartEm)}px`,
          }}
        >
          {produit}
        </span>
      ) : null}
    </span>
  );
}
```

- [ ] **Step 3 : exporter `./logotype` dans `package.json`**

Dans le champ `exports`, après `"./theme": "./noyau/theme.ts"` :

```json
    "./theme": "./noyau/theme.ts",
    "./logotype": "./noyau/logotype.ts"
```

Le champ `files` ne change pas : `noyau` y est déjà.

- [ ] **Step 4 : écrire `tests/logotype.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LOGOTYPE, nomLogotype } from '../noyau/logotype';
import { lireJetons } from '../outils/jetons';

/** Le code sans ses commentaires : un commentaire a le droit de nommer une couleur ou un jeton. */
function code(chemin: string): string {
  return readFileSync(chemin, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('la recette du logotype (1.2.0)', () => {
  it('compose trois morceaux, dans l ordre, le cinq au milieu', () => {
    expect(LOGOTYPE.morceaux.map((morceau) => morceau.texte)).toEqual(['AI', '5', 'D']);
    expect(LOGOTYPE.morceaux.map((morceau) => morceau.role)).toEqual(['lettres', 'cinq', 'lettres']);
  });

  it('se compose en Inter 700, le cinq incline de -5 degres', () => {
    expect(LOGOTYPE.famille).toBe('Inter');
    expect(LOGOTYPE.graisse).toBe(700);
    expect(LOGOTYPE.inclinaisonCinqDeg).toBe(-5);
  });

  it('compose le nom du produit en Fraunces 300, a 0,92 de la taille, apres 0,42 em', () => {
    expect(LOGOTYPE.produit).toEqual({ famille: 'Fraunces', graisse: 300, echelle: 0.92, ecartEm: 0.42 });
  });

  it('a le lettrage de --lettrage-marque', () => {
    expect(`${LOGOTYPE.lettrageEm}em`).toBe(lireJetons('noyau/jetons.css', ':root').get('--lettrage-marque'));
  });

  it('ne contient aucune couleur, ni valeur ni nom de jeton, et n importe rien', () => {
    const source = code('noyau/logotype.ts');
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toMatch(/\b(?:rgba?|hsla?)\s*\(/);
    expect(source).not.toContain('var(--');
    for (const jeton of ['--action', '--encre', '--blanc', '--texte', '--marque', '--surface', '--info']) {
      expect(source, jeton).not.toContain(jeton);
    }
    expect(source).not.toMatch(/^\s*import /m);
  });

  it('dit le nom accessible du composant', () => {
    expect(nomLogotype()).toBe('AI5D');
    expect(nomLogotype('Portail')).toBe('AI5D Portail');
    expect(nomLogotype('')).toBe('AI5D');
  });

  it('est lue par le composant, qui n ecrit plus ses nombres en dur', () => {
    const source = code('noyau/composants/Logotype.tsx');
    expect(source).toContain("from '../logotype'");
    for (const litteral of ['0.92', '0.42', '-5deg']) {
      expect(source, litteral).not.toContain(litteral);
    }
  });
});
```

- [ ] **Step 5 : écrire `tests/exports.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

interface Manifeste {
  version: string;
  exports: Record<string, string>;
  files: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

const MANIFESTE = JSON.parse(readFileSync('package.json', 'utf8')) as Manifeste;

describe('le champ exports du manifeste (1.2.0)', () => {
  it('chaque chemin exporte existe', () => {
    for (const [cle, chemin] of Object.entries(MANIFESTE.exports)) {
      expect(existsSync(chemin), `${cle} pointe vers ${chemin}, qui n existe pas`).toBe(true);
    }
  });

  it('exporte la recette du logotype et le theme', () => {
    expect(MANIFESTE.exports['./logotype']).toBe('./noyau/logotype.ts');
    expect(MANIFESTE.exports['./theme']).toBe('./noyau/theme.ts');
  });

  it('chaque fichier exporte part avec le paquet', () => {
    for (const chemin of Object.values(MANIFESTE.exports)) {
      const dossier = chemin.replace(/^\.\//, '').split('/')[0] ?? '';
      expect(MANIFESTE.files, `${chemin} ne part pas avec le paquet`).toContain(dossier);
    }
  });
});

describe('aucune dependance ajoutee (SPEC 1.2.0, §0.7)', () => {
  it('garde exactement les dependances de la 1.1.0', () => {
    expect(Object.keys(MANIFESTE.dependencies).sort()).toEqual(['clsx', 'react', 'react-dom']);
    expect(Object.keys(MANIFESTE.peerDependencies).sort()).toEqual([
      'lucide-react',
      'react',
      'react-dom',
    ]);
    expect(Object.keys(MANIFESTE.devDependencies).sort()).toEqual([
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@testing-library/user-event',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      '@vitejs/plugin-react',
      'eslint',
      'jsdom',
      'lucide-react',
      'prettier',
      'typescript',
      'typescript-eslint',
      'vitest',
    ]);
  });
});
```

- [ ] **Step 6 : un test de rendu dans le bloc `Logotype` de `tests/composants/composants.test.tsx`**

Après le test « compose le label en Fraunces, la serif d affichage », ajouter :

```tsx
  it('compose le nom du produit selon la recette, sans changer un pixel (1.2.0)', () => {
    // 20 px : le nom a Math.round(20 * 0.92) = 18 px, apres Math.round(20 * 0.42) = 8 px.
    render(<Logotype produit="Portail" taille={20} />);
    expect(screen.getByRole('img', { name: 'AI5D Portail' })).toBeInTheDocument();
    const nom = screen.getByText('Portail');
    expect(nom.style.fontSize).toBe('18px');
    expect(nom.style.marginLeft).toBe('8px');
    expect(screen.getByText('5').style.transform).toBe('rotate(-5deg)');
  });
```

- [ ] **Step 7 : écrire `docs/decisions/008-le-logotype-hors-du-dom-une-recette-avant-un-trace.md`**

```markdown
# 008 · Le logotype hors du DOM : une recette avant un tracé

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

Dans une page, `Logotype` compose « AI5D » en Inter 700, le « 5 » bleu et incliné de -5 degrés, dans
toutes les variantes : c'est un interdit de la charte mère que de le redresser ou de le recolorer.

Hors du DOM, chaque produit recomposait le logotype à sa façon. Le Portail l'écrit en Fraunces bleu
dans son PDF d'attestation et ses images de partage (SPEC P09, §0.3) ; Compte l'écrit d'un bloc en
Fraunces à l'encre dans l'en-tête de ses courriels (`emails/Coquille.tsx:44-53`). Ni l'un ni l'autre
n'incline le « 5 ». Le contrat de P09 demandait `TRACE_LOGOTYPE` : les lettres tracées en chemins
depuis Inter 700.

## Options

**A. Le tracé vectoriel, `TRACE_LOGOTYPE`.** Aucun deuxième consommateur (Compte ne produit ni PDF ni
image de partage), et il demande un outillage de polices que ce dépôt n'a pas.

**B. La recette, `LOGOTYPE`.** Les morceaux, leur rôle, la famille, la graisse, le lettrage,
l'inclinaison du « 5 », l'échelle et l'écart du nom du produit. Aucune couleur : chaque format porte
les siennes dans le fichier que son produit leur réserve. Le composant la lit.

**C. Rien.** Chaque produit continue de recomposer, et de trahir.

## Décision

**B**, exportée par `@ai5d/design-system/logotype`. Le repli que P09 prévoyait (Inter 700, « 5 »
pivoté, §5.22.2 de sa SPEC) devient la voie normale.

## Conséquences

- `Logotype.tsx` lit la recette : son rendu ne change pas d'un pixel, et un test le garde.
- Un client de messagerie qui ignore `transform` redresse le « 5 ». La limite est écrite dans le
  module ; le bleu, lui, passe partout.
- Le tracé appartient au lot L4, remédiation des logotypes (`tasks/todo.md`), et montera avec son
  deuxième consommateur.
```

- [ ] **Step 8 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/logotype.ts noyau/composants/Logotype.tsx package.json tests/logotype.test.ts tests/exports.test.ts tests/composants/composants.test.tsx
```

Cocher T12 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/logotype.ts noyau/composants/Logotype.tsx package.json tests/logotype.test.ts tests/exports.test.ts tests/composants/composants.test.tsx docs/decisions/008-le-logotype-hors-du-dom-une-recette-avant-un-trace.md tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
La recette du logotype, lue par le composant et exportée pour les documents, les images et les courriels
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 13 : L'index

SPEC §3.13. Les cinq composants, leurs types, les constantes.

**Files:**
- Modify: `noyau/composants/index.ts`
- Modify: `tests/index.test.ts`

**Interfaces:**
- Consumes : tout ce que les tâches 4 à 11 produisent.
- Produces : `@ai5d/design-system/composants` exporte en plus `TitreSection`, `LigneLien`,
  `ListeLignes`, `ListeDefinitions`, `ValeurCopiable` et leurs types, `ProprietesBoutonAction`,
  `ProprietesBoutonLien`, `ATTRIBUT_EN_ATTENTE`, `MENTION_NOUVEL_ONGLET`, `ONGLETS_RUBRIQUE_MIN`,
  `ONGLETS_RUBRIQUE_MAX`, `CONTENEUR_DEFINITIONS_DEUX_COLONNES`, `DUREE_SUCCES_COPIE_MS`.

- [ ] **Step 1 : `noyau/composants/index.ts`**

Ligne 2, remplacer ` * Les 34 composants de base du noyau.` par :

```ts
 * Les 39 composants de base du noyau.
```

Remplacer les exports du `Bouton` (lignes 38 et 39) par :

```ts
export { Bouton } from './Bouton';
export type {
  ProprietesBouton,
  ProprietesBoutonAction,
  ProprietesBoutonLien,
  TailleBouton,
  VarianteBouton,
} from './Bouton';

/**
 * Le protocole d attente et la mention du nouvel onglet, communs aux liens du systeme. Le produit
 * lit `ATTRIBUT_EN_ATTENTE` pour poser son marqueur dans le lien du routeur.
 */
export { ATTRIBUT_EN_ATTENTE, MENTION_NOUVEL_ONGLET } from './lien';
```

Remplacer l'export d'`OngletsRubrique` (lignes 117 et 118) par :

```ts
export {
  HAUTEUR_ONGLETS,
  ONGLETS_RUBRIQUE_MAX,
  ONGLETS_RUBRIQUE_MIN,
  OngletsRubrique,
} from './OngletsRubrique';
export type { OngletRubrique, ProprietesOngletsRubrique } from './OngletsRubrique';

export { LigneLien } from './LigneLien';
export type { ProprietesLigneLien } from './LigneLien';

export { ListeLignes } from './ListeLignes';
export type { ProprietesListeLignes } from './ListeLignes';
```

Après l'export d'`EtatVide` (ligne 112), ajouter :

```ts

export { TitreSection } from './TitreSection';
export type { NiveauTitre, ProprietesTitreSection, TailleTitre } from './TitreSection';

export { CONTENEUR_DEFINITIONS_DEUX_COLONNES, ListeDefinitions } from './ListeDefinitions';
export type { Definition, ProprietesListeDefinitions } from './ListeDefinitions';
```

Après l'export de `Champ` (lignes 104 et 105), ajouter :

```ts

/**
 * `ValeurCopiable` est un module client ; sa duree vit dans un module pur, pour qu un composant
 * serveur qui la lit la recoive (lecon du depot).
 */
export { ValeurCopiable } from './ValeurCopiable';
export type { ProprietesValeurCopiable } from './ValeurCopiable';
export { DUREE_SUCCES_COPIE_MS } from './copie';
```

- [ ] **Step 2 : `tests/index.test.ts`**

Dans `ATTENDUS` (lignes 8 à 43), ajouter à leur place alphabétique `'LigneLien'`, `'ListeDefinitions'`,
`'ListeLignes'` (après `'LiensRail'`), `'TitreSection'` (après `'TempsRelatif'`), `'ValeurCopiable'`
(en dernier).

Ligne 46, renommer le test : `it('exporte les trente-neuf composants du noyau', () => {`.

Dans le test des constantes (après la ligne 79), ajouter :

```ts
    expect(composants.ONGLETS_RUBRIQUE_MIN).toBe(2);
    expect(composants.ONGLETS_RUBRIQUE_MAX).toBe(6);
    expect(composants.CONTENEUR_DEFINITIONS_DEUX_COLONNES).toBe(480);
    expect(composants.DUREE_SUCCES_COPIE_MS).toBe(2000);
    expect(composants.ATTRIBUT_EN_ATTENTE).toBe('data-en-attente');
    expect(composants.MENTION_NOUVEL_ONGLET).toBe('(s’ouvre dans un nouvel onglet)');
```

Ajouter, dans le bloc `describe('la frontiere serveur / client', …)`, après le dernier test :

```ts
  it('des cinq composants de la 1.2.0, seul ValeurCopiable est un module client', () => {
    // SPEC 1.2.0, §5.0.6 : les quatre autres se rendent au serveur, icones et lien du produit compris.
    const client = (nom: string) =>
      readFileSync(`${DOSSIER}/${nom}.tsx`, 'utf8').startsWith("'use client';");
    expect(client('ValeurCopiable')).toBe(true);
    for (const nom of ['TitreSection', 'LigneLien', 'ListeLignes', 'ListeDefinitions']) {
      expect(client(nom), `${nom} ne doit pas etre un module client`).toBe(false);
    }
  });
```

- [ ] **Step 3 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write noyau/composants/index.ts tests/index.test.ts
```

Cocher T13 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add noyau/composants/index.ts tests/index.test.ts tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
L’index expose les cinq composants et les constantes de la 1.2.0
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 14 : Les documents, la version et la décision 009

SPEC §3.16 à §3.18, §12, §13. `tests/documentation.test.ts` ne change pas : il confrontera `1.2.0` et
trente-neuf composants au README et à `NOYAU.md`, et l'entrée `## 1.2.0 ` du journal.

**Files:**
- Modify: `package.json:3` (version)
- Modify: `CHANGELOG.md` (entrée ajoutée après la ligne 8)
- Modify: `README.md:15-16`, `:65`, `:72`, `:136-159`, `:275`, `:301`, `:304`
- Modify: `noyau/NOYAU.md` (§1.3, §1.4, §2, un §2 bis, §3, §6, §7)
- Modify: `noyau/formulations.md` (section « États techniques », et une section ajoutée)
- Create: `docs/decisions/009-ce-qui-monte-et-ce-qui-s-etend.md`

**Interfaces:**
- Consumes : tout le lot.
- Produces : la version `1.2.0` partout où la garde documentaire la cherche ; la règle de la durée
  longue dans `NOYAU.md`, mot pour mot (test de la tâche 3).

- [ ] **Step 1 : la version, dans `package.json`**

```json
  "version": "1.2.0",
```

- [ ] **Step 2 : l'entrée du journal, en tête de `CHANGELOG.md` (après le `---` de la ligne 8)**

La date est celle du jour où l'étiquette se pose ; la tâche 18 la corrige si ce n'est pas le
26 septembre 2026.

````markdown

## 1.2.0 · 26 septembre 2026

Ce que l'espace participant du Portail demandait, et le correctif d'un défaut que tous les produits
portaient sur téléphone. Aucune valeur de jeton ne change : `tests/non-regression.test.ts` le prouve
contre un instantané de la 1.1.0.

### Ce qui change à l'écran, sans une ligne de code dans le produit

1. **Au doigt, les contrôles retrouvent leur hauteur.** `--hauteur-controle` et `--ligne-liste` se
   lisaient elles-mêmes sous `(pointer: coarse)` et devenaient invalides : sur téléphone, tous les
   boutons valaient 44 px et un squelette de champ 21 px. En `equilibre`, un bouton `md` refait 48 px,
   un `lg` 56 px, un champ 48 px. Le test et la garde exigeaient la forme fautive ; ils la refusent.
   Décision 005.
2. **La sélection de texte** prend les couleurs du bouton primaire, et le curseur de saisie le bleu
   d'action.
3. **Au doigt, le sélecteur de thème** a des segments de 44 px.
4. **Au doigt, un bouton touché** ne garde plus sa couleur de survol.
5. **Les onglets de rubrique** montrent un fondu au bord qui cache un onglet, et seulement là ;
   l'onglet actif est amené dans la vue au premier affichage, là où le navigateur le sait. Constaté le
   26 septembre 2026 : Chromium fait les deux, WebKit le fondu seul, Firefox aucun des deux et y garde
   le rendu de la 1.1.0. Décision 007.

### Ajouts

- `Bouton` rendu en lien : `href`, `Lien`, `download`, `target`. `ComposantLien` accepte tous les
  attributs d'un lien.
- Le ton `neutre` : « rien à signaler », pour `Pastille`, `PastilleEtat`, `Bandeau`.
- `OngletsRubrique` : `Lien`, jusqu'à six onglets, l'état d'attente.
- `CoquilleRail` : `piedContenu` et `piedCompact`.
- `SelecteurTheme` : `libellesVisibles`.
- Cinq composants : `TitreSection`, `LigneLien`, `ListeLignes`, `ListeDefinitions`, `ValeurCopiable`.
- `--mesure-texte`, `--mouvement-retour`, `--mouvement-entree`, `--mouvement-sortie`.
- `COULEURS_NAVIGATEUR` par `@ai5d/design-system/theme` ; `LOGOTYPE` par
  `@ai5d/design-system/logotype`.
- Le protocole d'attente d'un lien, `data-en-attente` sur le lien ou l'un de ses descendants
  (`ATTRIBUT_EN_ATTENTE`), et la mention du nouvel onglet (`MENTION_NOUVEL_ONGLET`).

### Règle réécrite

La durée longue sert aussi le moment signature unique d'un produit, déclaré dans son `DESIGN.md`.
Décision 006.

### Compatibilité

Aucune propriété retirée, aucune variante renommée. `ProprietesBouton` devient une union
(`ProprietesBoutonAction | ProprietesBoutonLien`), `TonSemantique` gagne `neutre` : un produit qui
étend le premier ou énumère le second dans un `Record` devra le traiter ; aucun ne le fait dans
Compte, le Portail ou le SDK (constaté le 26 septembre 2026).

`ComposantLien` accepte tous les attributs d'un `<a>`, et `Link` de Next reste assignable tel quel. Un
composant de lien écrit par un produit doit transmettre tout ce qu'il reçoit ; typé sur l'ancienne
forme étroite, avec `'aria-current'?: 'page'`, il ne compile plus (constaté par `tsc`) : il se type
par `ComponentProps<ComposantLien>`. Aucun produit n'est concerné, tous passent `Link`.

`densites/profils.css` déclare deux propriétés de plus, les sources `--hauteur-controle-profil` et
`--ligne-liste-profil`. Un produit qui aurait écrit son propre profil déclare ces deux sources, et non
plus `--hauteur-controle` ni `--ligne-liste`.

`verifierPlancherTactile` exige désormais la forme corrigée et refuse toute propriété qui se lit
elle-même : un produit qui la lance sur la feuille installée passe.

### Guide de montée

#### Pour tout produit

1. Remplacer l'étiquette dans le manifeste :
   `"@ai5d/design-system": "github:Kaaramo/ai5d-digital-design-system#v1.2.0"`, puis `pnpm install`.
2. Si le produit a écrit son propre composant de lien pour `LiensRail`, `BarreOnglets` ou
   `GabaritDocument`, vérifier qu'il transmet **tous** les attributs reçus au `<a>` (`...reste`) et
   qu'il est typé par `ComponentProps<ComposantLien>` ; `Link` de Next le fait déjà.
3. Relancer sa vérification d'un bloc.
4. Regarder à l'écran, au doigt, les cinq différences ci-dessus : c'est tout ce qui change sans code.

Aucune adoption n'est obligatoire : chaque ajout est facultatif.

#### AI5D Portail, de 1.0.1 à 1.2.0

La montée traverse aussi la 1.1.0 : `BoiteMotif` et `BoiteConfirmation` acceptent `erreur`, et le
schéma de couleur du navigateur suit le thème (contrôles natifs sombres en sombre). Tout le reste est
ce que le sprint P09 consomme ; les écarts entre son contrat et cette version sont au §17 de la SPEC
de la 1.2.0.

#### AI5D Compte, de 1.1.0 à 1.2.0

| Ce que Compte fait aujourd'hui | Ce que la 1.2.0 permet | Obligatoire |
| ------------------------------ | ---------------------- | ----------- |
| `RetourPortail.tsx:24` et `LienInvalide.tsx:56` naviguent par `window.location.assign` depuis un `<button>` | `<Bouton href="/" pleineLargeur>Revenir au portail</Bouton>` : un composant serveur de plus, un vrai lien | Non |
| `OngletsPortail.tsx:95` rend les onglets sans lien du routeur : chaque sous-page recharge le document | `Lien={Link}` | Non |
| « SANS ACCÈS » en texte, faute de ton (`CarteProduit.tsx:26`) | Ton `neutre` ; l'arbitrage « des lignes, pas des badges » de sa charte reste le sien | Non |
| Douze titres en Fraunces écrits à la main (`EnteteEcran.tsx:65`, `LienInvalide.tsx:33`, `CarteProduit.tsx:136`, et neuf autres) | `TitreSection` ; les copies disparaissent | Non |
| `LigneCompte.tsx:24-34`, un `Link` stylé en ligne, sans états | `LigneLien` dans une `ListeLignes bordsExterieurs={false}` | Non |
| `<dl>` de la fiche de compte écrit à la main (`app/admin/comptes/[id]/page.tsx:83-110`) | `ListeDefinitions` | Non |
| `CopierValeur.tsx:16` | `ValeurCopiable`, avec `messageEchec` « Sélectionnez la clé ci-dessus pour la copier. » | Non |
| « AI5D » en Fraunces à l'encre dans l'en-tête des courriels (`emails/Coquille.tsx:44-53`) | Composer selon `LOGOTYPE`, couleurs dans `emails/jetons.ts` : « AI » et « D » en Inter 700 à l'encre, « 5 » en bleu d'action | Non |
| Le thème est inatteignable sous 768 px (`PiedDuRail.tsx:106`) | `piedCompact` avec `SelecteurTheme libellesVisibles` | Non |
| Transitions écrites à la main (`Gestion.tsx:51`) | `--mouvement-sortie` | Non |

#### Le SDK `@ai5d/auth`

Rien n'est requis : il déclare le système en dépendance de pair `*`. `AccesRefuse.tsx:126-131` pourra
passer à `Bouton href` dans une version du SDK, qui montera alors sa dépendance de développement.

---
````

- [ ] **Step 3 : le README**

Lignes 15 et 16 :

```markdown
![Version](https://img.shields.io/badge/version-1.2.0-2251FF?style=flat-square&labelColor=051C2C)
![Composants](https://img.shields.io/badge/composants-39-2251FF?style=flat-square&labelColor=051C2C)
```

Lignes 65 et 72, remplacer `#v1.1.0` par `#v1.2.0` (deux occurrences, et aucune autre version ne doit
rester).

Lignes 136 à 159, du titre à la fin du bloc d'imports :

````markdown
## Les 39 composants

Neuf familles. Le détail de ce que chacun garantit est dans [`noyau/NOYAU.md`](noyau/NOYAU.md).

<div align="center">

| Famille                | Composants                                                                                                                         |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| **Marque**             | `Logotype` · `Embleme` · `Icone`                                                                                                   |
| **Saisie et action**   | `Bouton` · `Champ` · `ValeurCopiable`                                                                                              |
| **États et signaux**   | `Pastille` · `PastilleEtat` · `Bandeau` · `TempsRelatif` · `Chiffre` · `Avatar`                                                    |
| **Contenu**            | `Carte` · `CarteAction` · `GrilleCartes` · `EnteteRubrique` · `EnteteCarte` · `EtatVide` · `TitreSection` · `ListeDefinitions`     |
| **Coquilles**          | `CoquilleRail` · `GabaritAuth` · `GabaritApp` · `GabaritSeuil`                                                                     |
| **Navigation**         | `LiensRail` · `BarreOnglets` · `OngletsRubrique` · `SelecteurTheme` · `LigneLien` · `ListeLignes`                                  |
| **Document**           | `GabaritDocument` · `SommaireDocument` · `BlocDocument` · `DeplierDocument`                                                        |
| **Dialogues**          | `BoiteConfirmation` · `BoiteMotif`                                                                                                 |
| **Attente et session** | `Squelette` · `SigneAnime` · `RechargeAuRetour`                                                                                    |

</div>

```tsx
import { CoquilleRail, LiensRail, BarreOnglets } from '@ai5d/design-system/composants';
import { themeOuSysteme, attributTheme, COULEURS_NAVIGATEUR } from '@ai5d/design-system/theme';
import { LOGOTYPE } from '@ai5d/design-system/logotype';
```
````

Dans l'arborescence, après la ligne 275 (`theme.ts`), ajouter :

```text
│   ├── couleurs-navigateur.ts les deux couleurs de <meta name="theme-color">
│   ├── logotype.ts           la recette du logotype hors d'une page
```

Ligne 301 : `les 34 composants` devient `les 39 composants`. Ligne 304 :

```markdown
| [`CHANGELOG.md`](CHANGELOG.md)                   | Une entrée par changement, le guide de migration vers `1.0.0` et le guide de montée vers `1.2.0` |
```

- [ ] **Step 4 : `noyau/NOYAU.md`**

Au §1.3, après le paragraphe « **Une règle qui ne se discute pas.** » (ligne 75), ajouter :

```markdown

**Le ton `neutre`, depuis la 1.2.0.** Il dit « rien à signaler » : un état au repos, qui ne demande
aucun geste et n'annonce aucune réussite (« Inscription confirmée », « Formation terminée », « Sans
accès », « Remplacée »). Il ne dit **jamais** un état qui attend un geste (c'est `attention`) ni un
échec (c'est `erreur`). Texte `--texte-faible` sur `--surface-chaude` : 4,53 en clair, 5,79 en sombre.
Comme les quatre autres, il porte toujours un mot : le composant n'existe pas sans texte.
```

Le §1.4 (lignes 79 à 81) devient :

```markdown
`tests/jetons.test.ts` recalcule à chaque exécution chaque paire de contraste que le système déclare,
en clair et en sombre, et échoue sous 4,5. Le nombre de paires se lit dans ce test et nulle part
ailleurs : écrit ici, il avait déjà vieilli une fois. C'est ce test qui aurait attrapé, dès le premier
jour, les quatre défauts trouvés le 5 septembre 2026.
```

Au §2, après la ligne « Échelle : 12 · 14 · 16 · 18 · 22 · 30 · 48 · 56 px. » (ligne 104), ajouter :

```markdown

**La mesure d'un texte.** `--mesure-texte` vaut `65ch` : la longueur de ligne d'un texte courant long
(programme, annonce, politique). Au-delà de soixante-cinq signes, l'œil perd le début de la ligne
suivante. Elle s'emploie en `max-width` sur un bloc de texte, jamais sur une colonne entière : une
phrase courte d'en-tête garde sa propre borne.

---

## 2 bis. Le mouvement

Trois durées, deux courbes, et depuis la 1.2.0 trois jetons qui nomment un mouvement par son **rôle**.
La durée et la courbe qu'ils portent peuvent changer sans qu'un seul appel change.

| Jeton                | Valeur                                      | Rôle                                   |
| -------------------- | ------------------------------------------- | -------------------------------------- |
| `--mouvement-retour` | `var(--duree-courte) var(--courbe-sortie)`  | Un état répond : survol, appui relâché |
| `--mouvement-entree` | `var(--duree-moyenne) var(--courbe-entree)` | Quelque chose arrive                   |
| `--mouvement-sortie` | `var(--duree-courte) var(--courbe-sortie)`  | Quelque chose part                     |

Sous `prefers-reduced-motion`, leurs durées tombent à 100 ms d'elles-mêmes ; ce qui se déplace reste à
supprimer par chaque feuille. Les composants antérieurs à la 1.2.0 ne sont pas migrés.

**La durée longue** (800 ms, 0 ms sous mouvement réduit) suit une règle réécrite en 1.2.0,
décision 006 :

> La durée longue sert deux choses, et deux seulement : une confirmation qui engage la sécurité du compte, et le moment signature unique d’un produit, déclaré par son nom dans le DESIGN.md de ce produit. Jamais un ornement, jamais deux moments dans un même produit.
```

La citation reste sur une seule ligne : le test de la tâche 3 la cherche mot pour mot, espaces
normalisés, et la règle de Prettier pour le Markdown (`proseWrap: preserve`) ne la coupe pas.

Au §3, le titre (ligne 108) devient `## 3. Les 39 composants`, et les tables changent ainsi.

« Saisie et action » :

```markdown
| Composant        | Ce qu'il garantit                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Bouton`         | Variantes, trois tailles, hauteur pilotée par la densité, plancher tactile respecté, `aria-busy` en chargement. Avec `href`, un vrai lien aux mêmes classes et états |
| `Champ`          | Libellé **toujours** lié par `htmlFor`, aide et erreur reliées par `aria-describedby`, erreur jamais portée par la seule couleur                                     |
| `ValeurCopiable` | Une valeur en clair, copiée d'un geste. Si la copie échoue, la valeur est sélectionnée et le geste manuel nommé : jamais une copie annoncée qui n'a pas eu lieu      |
```

Dans « États et signaux », la ligne `Pastille` devient :

```markdown
| `Pastille`     | Un état compact, qui contient toujours du texte. Cinq tons, dont `neutre`, « rien à signaler »     |
```

Dans « Contenu », ajouter en fin de table :

```markdown
| `TitreSection`     | Le niveau (plan du document) et la taille (écran) séparés et obligatoires ; Fraunces 400, jamais de faux gras, jamais tronqué |
| `ListeDefinitions` | Un `<dl>` de libellés et de valeurs ; deux colonnes dès 480 px de conteneur, une sinon                                         |
```

Dans « Coquilles », la ligne `CoquilleRail` devient :

```markdown
| `CoquilleRail` | La coquille des écrans à rubriques. Rail de 240 px en tablette, 280 px sur bureau, barre basse sous 768 px ; mode `bureau-seulement` pour une console. La navigation arrive en emplacements. Aucun import de Next. Un pied de contenu après `<main>`, et un pied compact sous 768 px |
```

« Navigation » devient :

```markdown
| Composant         | Ce qu'il garantit                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `LiensRail`       | Les liens du rail. Reçoit la rubrique active et le lien du produit ; actif sur `--surface-selection`, `aria-current`               |
| `BarreOnglets`    | La navigation basse. Trois à cinq onglets, icône **et** mot, zone sûre réservée, lien du produit, disparaît dès 768 px             |
| `OngletsRubrique` | Les sous-pages d'une rubrique, deux à six. Des **liens**, jamais un `tablist` ; un fondu au bord qui cache un onglet, sans script |
| `SelecteurTheme`  | Clair, sombre, système, en groupe radio. 44 px au doigt, libellés visibles sur demande, cookie partagé sur le domaine              |
| `LigneLien`       | Une ligne entière, un seul lien. Hauteur `--ligne-liste`, appui immédiat, attente visible ; ni chevron ni routeur pour un fichier  |
| `ListeLignes`     | Une `<ul role="list">`, un filet entre les lignes, et aux bords sur demande                                                        |
```

Au §6, après le premier paragraphe (ligne 262), ajouter :

```markdown

**Le navigateur suit.** `color-scheme` et `accent-color` depuis la 1.1.0 ; `caret-color` et la
sélection de texte, aux couleurs du bouton primaire, depuis la 1.2.0. La barre d'adresse d'un
téléphone se colore par `<meta name="theme-color">`, qui n'accepte pas de variable : ses deux valeurs,
celles de `--surface-1`, s'importent par `COULEURS_NAVIGATEUR` depuis `@ai5d/design-system/theme`.
```

Au §7, en fin de section, ajouter :

```markdown

Hors d'une page, dans un PDF, une image de partage ou un courriel, le logotype se compose selon
`LOGOTYPE`, exporté par `@ai5d/design-system/logotype` : la recette, sans les couleurs, que chaque
format porte lui-même.
```

- [ ] **Step 5 : `noyau/formulations.md`**

Dans la table « États techniques », ajouter la ligne :

```markdown
| Copie impossible         | « Sélectionnez {ce qu’il faut copier} ci-dessus pour la copier. »  |
```

Après le paragraphe « **Assumer l'absence.** », ajouter :

```markdown

**Nommer le geste manuel.** Quand une copie échoue, on dit ce qu'il faut sélectionner, et la valeur
reste visible, déjà sélectionnée : « Sélectionnez l’adresse ci-dessus pour la copier. » dans le
Portail, « Sélectionnez la clé ci-dessus pour la copier. » dans Compte. Jamais une copie annoncée qui
n'a pas eu lieu. Les libellés par défaut du bouton sont « Copier » et « Copié ».
```

Ajouter en fin de fichier :

```markdown

## Liens

| Situation                       | Formulation                                                   | La règle derrière                                                                                     |
| ------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Lien qui ouvre un nouvel onglet | « (s’ouvre dans un nouvel onglet) », lue après le libellé    | On prévient avant que le contexte change ; le système l'ajoute seul à tout lien sortant de `Bouton` et `LigneLien` |
```

- [ ] **Step 6 : écrire `docs/decisions/009-ce-qui-monte-et-ce-qui-s-etend.md`**

```markdown
# 009 · Ce qui monte, et ce qui s'étend

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

Le README l'écrit : « un composant monte dans le système quand un deuxième produit en a besoin, pas
avant ». Le contrat de P09 demandait quinze éléments, de trois natures différentes, et la règle ne
s'applique pas à toutes de la même façon. `GabaritPortail` est monté sans consommateur et a été
retiré en 1.0.0 ; `CoquilleRail` est montée quand le Portail a demandé un rail. La règle tient ; il
fallait dire comment elle se lit.

## Options

**A. Une seule lecture, stricte** : rien ne monte ni ne s'étend sans deuxième produit. `Champ` avec
icône (0.2.2), `danger-contour` (0.6.0), l'état de `CarteAction` (0.7.0), `erreur` dans les boîtes
(1.1.0) n'auraient jamais existé : chacun a été demandé par un seul produit.

**B. Une lecture par nature.**

## Décision

**B.**

| Nature | Ce qui la justifie |
| ------ | ------------------ |
| **Composant nouveau** | Un deuxième produit qui en a le besoin, constaté dans son code (fichier et ligne). Sinon, il reste dans le produit qui l'a demandé, écrit sur les jetons avec l'API proposée, et monte le jour où le deuxième arrive |
| **Extension d'un composant déjà partagé** (une propriété, une valeur de type) | Le besoin d'un produit suffit, parce que le composant est déjà commun et que l'ajout est rétrocompatible. Le constat dans l'autre produit, quand il existe, est écrit |
| **Jeton ou règle globale de feuille** | Un correctif d'un défaut du système, ou une règle transversale par nature (typographie, mouvement, navigateur), qui vaut pour tout produit qui l'emploie |

**La console d'un produit n'est pas un deuxième consommateur** : c'est le même produit. Elle compte
pour savoir si une pièce convient à la densité `compact`, pas pour la faire monter.

## Conséquences, pour la 1.2.0

- Montés, avec leur deuxième consommateur constaté dans Compte : `TitreSection`, `LigneLien`,
  `ListeLignes`, `ListeDefinitions`, `ValeurCopiable`.
- Étendus : `Bouton` (`href`), `TonSemantique` (`neutre`), `OngletsRubrique` (`Lien`, six onglets),
  `CoquilleRail` (deux pieds), `SelecteurTheme` (`libellesVisibles`, 44 px au doigt).
- Jetons et règles : le plancher tactile (correctif), `--mesure-texte`, les trois jetons de mouvement,
  `caret-color`, `::selection`, `COULEURS_NAVIGATEUR`, la recette `LOGOTYPE`.
- Restés dans le Portail, faute de deuxième consommateur : `IndicateurNavigation`, la primitive
  `Apparition`, la largeur `--largeur-lecture` (une constante du Portail), `BarreProgression`.
- Repoussé : le tracé vectoriel du logotype, au lot L4.
- Retirés, mesure à l'appui : `scrollbar-color` (1,49, et redondant avec `color-scheme`) et
  `--duree-signature` (doublon de `--duree-longue`). `--duree-survol` n'a jamais existé.
```

- [ ] **Step 7 (génération) : formater, cocher et commiter**

```bash
pnpm exec prettier --write package.json CHANGELOG.md README.md noyau/NOYAU.md noyau/formulations.md
```

Relire ensuite, à l'œil, que la citation de la règle de la durée longue dans `NOYAU.md` est restée
d'une seule ligne, et que le README ne cite plus que `#v1.2.0` :

```bash
grep -n "#v1\." README.md
grep -n "La durée longue sert deux choses" noyau/NOYAU.md
```

Cocher T14 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add package.json CHANGELOG.md README.md noyau/NOYAU.md noyau/formulations.md docs/decisions/009-ce-qui-monte-et-ce-qui-s-etend.md tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Version 1.2.0 : le journal et son guide de montée, le README, le noyau, les formulations et la décision 009
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 15 : Les spécimens

SPEC §11.1. Les pièces de la 1.2.0 dans les quatre densités et les trois états de thème, avec les
**vraies feuilles** des composants (écart E12), et les rangées dont la tâche 16 a besoin pour ses
captures et ses sondes.

**Files:**
- Modify: `_build/generer-specimens.mjs`
- Modify (génération) : `specimens/composants.html`

**Interfaces:**
- Consumes : les constantes `STYLE_…` de `lien.ts`, `Bouton.tsx`, `OngletsRubrique.tsx`,
  `CoquilleRail.tsx`, `SelecteurTheme.tsx`, `LigneLien.tsx`, `ListeLignes.tsx`,
  `ListeDefinitions.tsx`, `ValeurCopiable.tsx` ; les constantes numériques exportées du noyau.
- Produces, dans `specimens/composants.html`, les points d'accroche que lisent
  `captures.cjs` et `sonde-navigateurs.cjs` (tâche 16) : `[data-specimen="onglets-debut"]`,
  `"onglets-milieu"`, `"onglets-fin"` (avec `data-defiler`), `"onglets-initial"` (sans),
  `"onglets-large"`, `"theme-icones"`, `"theme-288"`, `"theme-216"`, `"selection"` ; le premier lien
  `.ai5d-bouton[data-variante="primaire"][href]` de chaque planche.

- [ ] **Step 1 : les imports (ligne 12)**

```js
import { readdirSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
```

- [ ] **Step 2 : le ton neutre dans `TONS` (lignes 21 à 26)**

```js
const TONS = [
  ['information', 'Information'],
  ['reussite', 'Adresse vérifiée'],
  ['attention', 'Adresse non confirmée'],
  ['erreur', 'Trop de tentatives'],
  ['neutre', 'Inscription confirmée'],
];
```

- [ ] **Step 3 : les pièces de la 1.2.0, après la fonction `pastilles()` (ligne 84)**

```js
/*
  LES PIECES DE LA 1.2.0, AVEC LES VRAIES FEUILLES DES COMPOSANTS.

  Pour elles, la page ne recopie pas la feuille : elle lit les constantes STYLE_ des composants et
  resout leurs rares interpolations numeriques (TABLETTE, LARGEUR_RAIL_TABLETTE, 480...) depuis les
  constantes exportees du noyau. Seul le balisage est reproduit. Une interpolation inconnue fait
  echouer la generation, plutot que d ecrire une feuille fausse.
*/
const FEUILLES_DES_COMPOSANTS = [
  'noyau/composants/lien.ts',
  'noyau/composants/Bouton.tsx',
  'noyau/composants/OngletsRubrique.tsx',
  'noyau/composants/CoquilleRail.tsx',
  'noyau/composants/SelecteurTheme.tsx',
  'noyau/composants/LigneLien.tsx',
  'noyau/composants/ListeLignes.tsx',
  'noyau/composants/ListeDefinitions.tsx',
  'noyau/composants/ValeurCopiable.tsx',
];

function constantesNumeriques() {
  const valeurs = new Map();
  for (const dossier of ['noyau', 'noyau/composants']) {
    for (const fichier of readdirSync(dossier)) {
      if (!/\.tsx?$/.test(fichier)) continue;
      const source = readFileSync(`${dossier}/${fichier}`, 'utf8');
      for (const [, nom, valeur] of source.matchAll(/export const ([A-Z_]+) = (\d+);/g)) {
        valeurs.set(nom, valeur);
      }
    }
  }
  return valeurs;
}

function feuillesDesComposants() {
  const constantes = constantesNumeriques();
  return FEUILLES_DES_COMPOSANTS.map((chemin) => {
    const source = readFileSync(chemin, 'utf8');
    const feuilles = [...source.matchAll(/const STYLE_[A-Z_]+ = `([\s\S]*?)`;/g)].map((m) => m[1]);
    if (feuilles.length === 0) throw new Error(`${chemin} : aucune feuille STYLE_ trouvee`);
    return feuilles
      .map((css) =>
        css.replace(/\$\{([A-Z_]+)\}/g, (_, nom) => {
          const valeur = constantes.get(nom);
          if (valeur === undefined) throw new Error(`${chemin} : constante ${nom} introuvable`);
          return valeur;
        }),
      )
      .join('\n');
  }).join('\n');
}

/* Le style en ligne d un Bouton, recopie des formules de Bouton.tsx : la hauteur vient de la densite. */
function styleBouton(hauteur) {
  return `display: inline-flex; align-items: center; justify-content: center; gap: var(--espace-2); height: ${hauteur}; min-height: var(--cible-tactile); min-width: var(--cible-tactile); padding: 0 20px; font-family: var(--police-corps); font-size: var(--taille-md); font-weight: var(--graisse-semi); line-height: 1; border-radius: var(--rayon-md); cursor: pointer;`;
}

const POINTS_BOUTON =
  '<span class="ai5d-bouton__points ai5d-bouton__points--attente" aria-hidden="true"><span class="ai5d-bouton__point"></span><span class="ai5d-bouton__point"></span><span class="ai5d-bouton__point"></span></span>';

function boutonsEnLien() {
  const variantes = ['primaire', 'secondaire', 'neutre', 'discret', 'danger', 'danger-contour'];
  const rangees = variantes
    .map(
      (variante) => `
      <div class="rangee">
        <a class="ai5d-bouton" href="#" data-variante="${variante}" data-taille="md" style="${styleBouton('var(--hauteur-controle)')}">Voir ma formation${POINTS_BOUTON}</a>
        <a class="ai5d-bouton" href="#" data-variante="${variante}" data-taille="md" data-en-attente="" style="${styleBouton('var(--hauteur-controle)')}">En attente${POINTS_BOUTON}</a>
        <a class="ai5d-bouton" role="link" aria-disabled="true" data-variante="${variante}" data-taille="md" style="${styleBouton('var(--hauteur-controle)')} cursor: not-allowed; opacity: 0.6;">Désactivé</a>
      </div>`,
    )
    .join('');
  const tailles = [
    ['sm', 'calc(var(--hauteur-controle) - 8px)'],
    ['md', 'var(--hauteur-controle)'],
    ['lg', 'calc(var(--hauteur-controle) + 8px)'],
  ]
    .map(
      ([taille, hauteur]) =>
        `<a class="ai5d-bouton" href="#" data-variante="primaire" data-taille="${taille}" style="${styleBouton(hauteur)}">${taille}${POINTS_BOUTON}</a>`,
    )
    .join(' ');
  return `${rangees}<div class="rangee">${tailles}</div>`;
}

const ONGLETS = ['Vue d’ensemble', 'Annonces', 'Ressources', 'Replays', 'Attestation', 'Badge'];

/* Six onglets : le cinquieme est actif, le troisieme en attente de navigation. */
function onglets() {
  const liens = ONGLETS.map((libelle, index) => {
    const actif = index === 4 ? ' aria-current="page"' : '';
    const attente = index === 2 ? ' data-en-attente=""' : '';
    return `<a class="ai5d-onglets-r__lien" href="#"${actif}${attente}><span>${libelle}</span></a>`;
  }).join('');
  return `<nav class="ai5d-onglets-r" aria-label="Sous-pages de la session">${liens}</nav>`;
}

function rangeesOnglets() {
  const defilees = ['debut', 'milieu', 'fin']
    .map(
      (position) => `
      <div class="specimen-colonne-390" data-specimen="onglets-${position}" data-defiler="${position}">${onglets()}</div>`,
    )
    .join('');
  return `${defilees}
      <div class="specimen-colonne-390" data-specimen="onglets-initial">${onglets()}</div>`;
}

const THEMES_DU_SELECTEUR = [
  ['clair', 'Clair'],
  ['sombre', 'Sombre'],
  ['systeme', 'Système'],
];

function selecteurTheme(libelles) {
  const segments = THEMES_DU_SELECTEUR.map(([valeur, mot]) => {
    const coche = valeur === 'sombre';
    return libelles
      ? `<button type="button" role="radio" aria-checked="${coche}" class="ai5d-theme__segment"><span class="ai5d-theme__icone specimen-icone" aria-hidden="true"></span><span>${mot}</span></button>`
      : `<button type="button" role="radio" aria-checked="${coche}" aria-label="${mot}" title="${mot}" class="ai5d-theme__segment"><span class="specimen-icone" aria-hidden="true"></span></button>`;
  }).join('');
  return `<div class="ai5d-theme" role="radiogroup" aria-label="Thème de l’interface"${libelles ? ' data-libelles=""' : ''}>${segments}</div>`;
}

function selecteursTheme() {
  return `
      <div class="rangee" data-specimen="theme-icones">${selecteurTheme(false)}</div>
      <div class="specimen-pied-288" data-specimen="theme-288">${selecteurTheme(true)}</div>
      <div class="specimen-pied-216" data-specimen="theme-216">${selecteurTheme(true)}</div>`;
}

function piedsCoquille() {
  return `
      <div class="ai5d-coquille-rail specimen-coquille" data-coquille="rail" data-mode="complet" data-pied="complet">
        <footer class="ai5d-coquille-rail__pied-contenu">
          <div class="ai5d-coquille-rail__colonne">
            <div class="ai5d-coquille-rail__pied-compact">
              <span class="specimen-libelle">Thème</span>
              ${selecteurTheme(true)}
            </div>
            <div class="rangee"><a class="lien" href="#">Confidentialité</a><a class="lien" href="#">Mentions légales</a></div>
          </div>
        </footer>
      </div>`;
}

/* Le style en ligne de TitreSection, recopie de TitreSection.tsx. */
function styleTitre(taille) {
  return `margin: 0; font-family: var(--police-titre); font-weight: var(--graisse-normale); font-size: ${taille}; line-height: var(--interligne-titre); letter-spacing: var(--lettrage-titre); color: var(--texte-fort); text-wrap: balance; overflow-wrap: break-word;`;
}

function titres() {
  return `
      <div class="specimen-titres">
        <h1 style="${styleTitre('var(--taille-2xl)')}">IA générative et relation client</h1>
        <h2 style="${styleTitre('var(--taille-xl)')}">Mes autres formations</h2>
        <h3 style="${styleTitre('var(--taille-lg)')}">Ressources de la session</h3>
      </div>`;
}

const CHEVRON =
  '<span class="ai5d-ligne__fin"><span class="specimen-chevron" aria-hidden="true">›</span></span>';
const POINTS_LIGNE =
  '<span class="ai5d-ligne__attente" aria-hidden="true"><span class="ai5d-ligne__point"></span><span class="ai5d-ligne__point"></span><span class="ai5d-ligne__point"></span></span>';
const NOUVEL_ONGLET = '<span class="ai5d-hors-ecran"> (s’ouvre dans un nouvel onglet)</span>';

/* Trois lignes : une destination, un fichier au survol, un lien sortant a l appui. Puis une en attente. */
function lignes() {
  return `
      <ul role="list" class="ai5d-liste-lignes" data-bords="">
        <li><a class="ai5d-ligne" href="#"><span class="ai5d-ligne__corps"><span class="ai5d-ligne__titre" data-en-titre="">IA générative et relation client</span><span class="ai5d-ligne__description">Du 13 au 15 octobre 2026, présentiel</span></span>${CHEVRON}${POINTS_LIGNE}</a></li>
        <li><a class="ai5d-ligne" href="#" download data-force="survol"><span class="ai5d-ligne__corps"><span class="ai5d-ligne__titre">Support du jour 1</span><span class="ai5d-ligne__meta">PDF · 2,4 Mo</span></span>${POINTS_LIGNE}</a></li>
        <li><a class="ai5d-ligne" href="#" target="_blank" rel="noopener noreferrer" data-force="appui"><span class="ai5d-ligne__corps"><span class="ai5d-ligne__titre">Rejoindre la session</span><span class="ai5d-ligne__meta" data-mono="">AI5D-2026-7K3F9Q</span></span>${POINTS_LIGNE}${NOUVEL_ONGLET}</a></li>
      </ul>
      <ul role="list" class="ai5d-liste-lignes">
        <li><a class="ai5d-ligne" href="#" data-en-attente=""><span class="ai5d-ligne__corps"><span class="ai5d-ligne__titre">Ressources</span><span class="ai5d-ligne__description">La page suivante arrive</span></span>${CHEVRON}${POINTS_LIGNE}</a></li>
      </ul>`;
}

const FAITS = [
  ['Session', 'Orange Guinée · octobre 2026', false],
  ['Dates', 'Du 13 au 15 octobre 2026, présentiel', false],
  ['Émise le', '19 octobre 2026', false],
  ['Numéro', 'AI5D-2026-7K3F9Q', true],
];

function definitions(colonnes) {
  const elements = FAITS.map(
    ([libelle, valeur, mono]) =>
      `<div class="ai5d-definitions__element"><dt>${libelle}</dt><dd${mono ? ' data-mono=""' : ''}>${valeur}</dd></div>`,
  ).join('');
  return `<div class="ai5d-definitions specimen-bloc" data-colonnes="${colonnes}"><dl class="ai5d-definitions__liste">${elements}</dl></div>`;
}

function valeurCopiable(etat) {
  const libelle = etat === 'succes' ? 'Lien copié' : 'Copier le lien';
  const annonce =
    etat === 'echec'
      ? '<p class="ai5d-copiable__echec">Sélectionnez l’adresse ci-dessus pour la copier.</p>'
      : '';
  return `
      <div class="ai5d-copiable specimen-bloc">
        <div class="ai5d-copiable__rangee">
          <div class="champ ai5d-copiable__champ"><label>Adresse de votre badge</label><input value="https://portail.ai5d.technology/badge/7K3F9Q" readonly style="font-family: var(--police-mono); font-weight: var(--graisse-moyenne); font-size: var(--taille-md);" /></div>
          <button type="button" class="ai5d-bouton" data-variante="neutre" data-taille="md" style="${styleBouton('var(--hauteur-controle)')}"><span class="specimen-icone" aria-hidden="true"></span>${libelle}</button>
        </div>
        <div class="ai5d-copiable__annonce" aria-live="polite">${annonce}</div>
      </div>`;
}

function mesure() {
  return `
      <div class="mesure-bloc">height: var(--hauteur-controle)</div>
      <div class="mesure-ligne">min-height: var(--ligne-liste)</div>`;
}

/* Une fois, hors des planches : la selection sur les trois surfaces, et le curseur de saisie. */
function selection() {
  return `
<section class="specimen-selection" data-specimen="selection" aria-label="Sélection de texte et curseur">
  <p class="surface-papier">Sur le papier : attestation AI5D-2026-7K3F9Q, délivrée le 19 octobre 2026.</p>
  <p class="surface-carte">Sur une carte : attestation AI5D-2026-7K3F9Q, délivrée le 19 octobre 2026.</p>
  <p class="surface-menu">Sur un menu : attestation AI5D-2026-7K3F9Q, délivrée le 19 octobre 2026.</p>
  <label class="specimen-curseur">Numéro d’attestation <input value="AI5D-2026-7K3F9Q" /></label>
</section>`;
}
```

- [ ] **Step 4 : les pièces dans chaque planche**

Dans `planche()`, remplacer la fin de la fonction, de la ligne `        <div class="mono">AI5D-7F3K-92QX</div>`
(ligne 123) à la fin du gabarit (`  </section>\`;`, ligne 126), par :

```js
        <div class="mono">AI5D-7F3K-92QX</div>
      </div>
    </div>

    <div class="grille">
      <div class="colonne">
        <h3>Boutons en lien</h3>
        ${boutonsEnLien()}

        <h3>Onglets de rubrique</h3>
        ${rangeesOnglets()}

        <h3>Sélecteur de thème</h3>
        ${selecteursTheme()}

        <h3>Pied de coquille</h3>
        ${piedsCoquille()}
      </div>

      <div class="colonne">
        <h3>Titres</h3>
        ${titres()}

        <h3>Lignes</h3>
        ${lignes()}

        <h3>Définitions, une colonne</h3>
        ${definitions(1)}

        <h3>Valeur copiable</h3>
        ${valeurCopiable('repos')}
        ${valeurCopiable('succes')}
        ${valeurCopiable('echec')}

        <h3>Mesure du plancher</h3>
        ${mesure()}
      </div>
    </div>

    <h3>Définitions, deux colonnes dès 480 px de conteneur</h3>
    ${definitions(2)}

    <h3>Onglets, sans débordement</h3>
    <div data-specimen="onglets-large">${onglets()}</div>
  </section>`;
```

- [ ] **Step 5 : les aides de la page, après `const STYLE = …` (ligne 223)**

```js
const STYLE_SPECIMENS = `
/* Les aides de la page, pour les pieces de la 1.2.0. Aucune ne remplace la feuille d un composant. */
.neutre { color: var(--texte-faible); background: var(--surface-chaude); }
.bandeau.neutre { border: 1px solid currentColor; }
.specimen-colonne-390 { width: 390px; max-width: 100%; margin-bottom: 12px; }
.specimen-pied-288 { width: 288px; max-width: 100%; margin-bottom: 12px; }
.specimen-pied-216 { width: 216px; margin-bottom: 12px; }
.specimen-bloc { margin-bottom: 16px; }
.specimen-icone { display: inline-block; flex: 0 0 auto; width: 16px; height: 16px; border: 1.75px solid currentColor; border-radius: var(--rayon-plein); }
.specimen-chevron { font-size: var(--taille-lg); line-height: 1; }
.specimen-libelle { font-size: var(--taille-sm); font-weight: var(--graisse-semi); color: var(--texte-faible); }
.specimen-coquille.ai5d-coquille-rail { min-height: 0; }
.specimen-titres { display: flex; flex-direction: column; gap: 12px; }
.specimen-titres :is(h1, h2, h3) { text-transform: none; }
.ai5d-copiable__champ.champ { margin-bottom: 0; }
.ai5d-copiable__champ.champ input { width: 100%; }

/* Les etats que le pointeur pose d ordinaire, forces pour la capture. */
.ai5d-ligne[data-force='survol'] { background: var(--surface-chaude); }
:root[data-theme='dark'] .ai5d-ligne[data-force='survol'] { background: var(--surface-3); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .ai5d-ligne[data-force='survol'] { background: var(--surface-3); }
}
.ai5d-ligne[data-force='appui'] { background: var(--surface-selection); }

.mesure-bloc, .mesure-ligne {
  display: flex; align-items: center; margin-bottom: 8px; padding: 0 12px;
  background: var(--surface-chaude); border: 1px dashed var(--bordure-forte); border-radius: var(--rayon-md);
  font-family: var(--police-mono); font-size: var(--taille-xs); color: var(--texte-faible);
}
.mesure-bloc { height: var(--hauteur-controle); }
.mesure-ligne { min-height: var(--ligne-liste); }

.specimen-selection { max-width: var(--contenu-max); margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 12px; }
.specimen-selection p { margin: 0; padding: 12px 16px; border: 1px solid var(--bordure); border-radius: var(--rayon-md); color: var(--texte-fort); }
.surface-papier { background: var(--surface-1); }
.surface-carte { background: var(--surface-2); }
.surface-menu { background: var(--surface-3); }
.specimen-curseur { display: flex; flex-direction: column; gap: 6px; font-size: var(--taille-sm); color: var(--texte); }
.specimen-curseur input { height: var(--hauteur-controle); padding: 0 14px; background: var(--surface-2); color: var(--texte-fort); border: 1px solid var(--bordure-forte); border-radius: var(--rayon-md); font-family: var(--police-mono); font-size: var(--taille-md); }
`;
```

- [ ] **Step 6 : le défilement imposé des rangées d'onglets, en fin de `SCRIPT` (avant la ligne 236, le `` ` `` qui le ferme)**

```js

/* Les rangees d onglets a une position de defilement imposee : debut, milieu, fin. */
function defiler() {
  for (const cadre of document.querySelectorAll('[data-defiler]')) {
    const rangee = cadre.querySelector('.ai5d-onglets-r');
    if (rangee === null) continue;
    const maximum = rangee.scrollWidth - rangee.clientWidth;
    const position = cadre.dataset.defiler;
    rangee.scrollLeft = position === 'fin' ? maximum : position === 'milieu' ? maximum / 2 : 0;
  }
}
window.addEventListener('load', defiler);
window.addEventListener('resize', defiler);
```

- [ ] **Step 7 : la page (fonction `main`, lignes 238 à 265)**

Remplacer `<style>${STYLE}</style>` par :

```js
<style>${STYLE}</style>
<style>${feuillesDesComposants()}</style>
<style>${STYLE_SPECIMENS}</style>
```

Remplacer `${DENSITES.map((d) => planche(...d)).join('\n')}` par :

```js
${DENSITES.map((d) => planche(...d)).join('\n')}
${selection()}
```

Et le message final :

```js
  console.log(
    'specimens/composants.html ecrit : 4 densites, 3 themes, les pieces de la 1.2.0 avec les feuilles des composants, aucun appel reseau.',
  );
```

- [ ] **Step 8 (génération) : engendrer la page, formater le générateur, cocher et commiter**

```bash
pnpm exec prettier --write _build/generer-specimens.mjs
pnpm specimens
grep -c 'data-specimen="onglets-debut"' specimens/composants.html
grep -c 'ai5d-onglets-fondu' specimens/composants.html
```

Attendu : le message de génération, puis `4` (une rangée par densité), puis au moins `1` (la vraie
feuille d'`OngletsRubrique` est dans la page). Ouvrir `specimens/composants.html` dans Chromium et
regarder chaque planche une fois, en clair puis en sombre, avant de commiter : c'est la tâche 16 qui
en fait des preuves, mais un défaut grossier se voit ici.

Cocher T15 dans `tasks/todo.md` (`· écrite, non testée`).

```bash
git add _build/generer-specimens.mjs specimens/composants.html tasks/todo.md
cat > .git/message-1.2.0.txt <<'MESSAGE'
Les spécimens montrent les pièces de la 1.2.0, avec les vraies feuilles des composants
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 16 : La vérification d'un seul bloc, et les preuves

SPEC §4, étapes 9 et 10 ; §5.1.4 ; §10 ; §11.2 ; §14, étapes 1 et 2. **La seule tâche qui lance des
tests.** Jamais de `build`. Un test rouge se corrige à la racine (`superpowers:systematic-debugging`),
et quand un test et le code se contredisent, le résultat le plus solide gagne ; chaque correction se
consigne dans `verification.md`.

**Files:**
- Create: `docs/preuves/1.2.0/mutations.mjs`, `mutations.md`
- Create: `docs/preuves/1.2.0/captures.cjs`, `captures.md`, et les captures du §11.2
- Create: `docs/preuves/1.2.0/sonde-navigateurs.cjs`, `navigateurs.md`
- Create: `docs/preuves/1.2.0/verification.md`, `montee-compte.md`, `README.md`
- Modify: `docs/preuves/1.2.0/plancher-tactile.md` (la mesure « après », et sa lecture)
- Modify: `tasks/todo.md`, `tasks/lessons.md`

**Interfaces:**
- Consumes : tout le lot ; `mesure-plancher.cjs` (tâche 1) ; les points d'accroche des spécimens
  (tâche 15).
- Produces : le dossier de preuves que la tâche 18 montre à Karamo.

- [ ] **Step 1 (génération) : régénérer les spécimens, au cas où une feuille aurait bougé depuis la tâche 15**

```bash
pnpm specimens
git status --short specimens
```

- [ ] **Step 2 : la vérification d'un seul bloc**

```bash
( CI=true pnpm typecheck && CI=true pnpm lint && CI=true pnpm format:check && CI=true pnpm test ) 2>&1 | tee docs/preuves/1.2.0/verification-brute.txt
echo "code de sortie : ${PIPESTATUS[0]}"
```

Si elle échoue : diagnostiquer chaque échec à sa cause, corriger, et **relancer le bloc entier**, jusqu'au
vert. Chaque échec de la première passe entre dans la table « Ce que la première passe a trouvé » de
`verification.md` (étape 9) : l'échec, sa cause, la réparation, sur le modèle de
`docs/preuves/1.0.0/verification.md`. Si une correction change une feuille injectée, relancer
`pnpm specimens` avant les étapes suivantes.

- [ ] **Step 3 : écrire `docs/preuves/1.2.0/mutations.mjs`, puis voir échouer chaque garde nouvelle**

```js
/**
 * Chaque garde nouvelle de la 1.2.0, vue echouer une fois (SPEC 1.2.0, §10 ; lecon du depot : « avant
 * de fixer ce qu une garde tolere, la lancer telle quelle et lire ce qu elle trouve »).
 *
 * Pour chaque mutation, le fichier est sauvegarde, mute, le test vise lance, et le fichier restaure
 * dans tous les cas. Une mutation qui ne fait rien rougir est une garde qui ne garde rien.
 * M1 est la forme exacte de la 1.1.0, densites/profils.css:79-80 : l ancien code.
 *
 *   node docs/preuves/1.2.0/mutations.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const MUTATIONS = [
  {
    nom: 'M1 · le plancher relit sa propre propriete, forme de la 1.1.0',
    fichier: 'densites/profils.css',
    avant: 'max(var(--hauteur-controle-profil), 44px)',
    apres: 'max(var(--hauteur-controle), 44px)',
    tests: ['gardes/gardes.test.ts', 'tests/cycles.test.ts', 'tests/densites.test.ts', 'tests/non-regression.test.ts'],
  },
  {
    nom: 'M2 · une valeur de jeton de la 1.1.0 change',
    fichier: 'noyau/jetons.css',
    avant: '--surface-chaude: #f4efe7;',
    apres: '--surface-chaude: #f4efe8;',
    tests: ['tests/non-regression.test.ts'],
  },
  {
    nom: 'M3 · un jeton de mouvement pointe vers une duree inexistante',
    fichier: 'noyau/jetons.css',
    avant: '--mouvement-retour: var(--duree-courte)',
    apres: '--mouvement-retour: var(--duree-rapide)',
    tests: ['tests/jetons.test.ts'],
  },
  {
    nom: 'M4 · un lien sortant perd noreferrer',
    fichier: 'noyau/composants/lien.ts',
    avant: "['noopener', 'noreferrer']",
    apres: "['noopener']",
    tests: ['tests/composants/bouton-lien.test.tsx', 'tests/composants/ligne-lien.test.tsx'],
  },
  {
    nom: 'M5 · OngletsRubrique devient un module client',
    fichier: 'noyau/composants/OngletsRubrique.tsx',
    avant: "import type { CSSProperties, ReactNode } from 'react';",
    apres: "'use client';\n\nimport type { CSSProperties, ReactNode } from 'react';",
    tests: ['tests/index.test.ts', 'tests/composants/onglets-rubrique.test.tsx'],
  },
  {
    nom: 'M6 · l export du logotype pointe dans le vide',
    fichier: 'package.json',
    avant: '"./logotype": "./noyau/logotype.ts"',
    apres: '"./logotype": "./noyau/logotypes.ts"',
    tests: ['tests/exports.test.ts'],
  },
  {
    nom: 'M7 · la couleur du navigateur derive de --surface-1',
    fichier: 'noyau/couleurs-navigateur.ts',
    avant: "clair: '#FAF7F2'",
    apres: "clair: '#FAF7F3'",
    tests: ['tests/composants/theme.test.tsx'],
  },
  {
    nom: 'M8 · la copie avale son echec',
    fichier: 'noyau/composants/ValeurCopiable.tsx',
    avant: "setEtat('echec');",
    apres: "setEtat('repos');",
    tests: ['tests/composants/valeur-copiable.test.tsx'],
  },
  {
    nom: 'M9 · la ligne perd sa hauteur de densite',
    fichier: 'noyau/composants/LigneLien.tsx',
    avant: 'min-height: var(--ligne-liste);',
    apres: 'min-height: auto;',
    tests: ['tests/composants/ligne-lien.test.tsx'],
  },
  {
    nom: 'M10 · un survol de bouton sort de la garde (hover: hover)',
    fichier: 'noyau/composants/Bouton.tsx',
    avant: '@media (hover: hover) {',
    apres: '@media all {',
    tests: ['tests/composants/bouton-lien.test.tsx'],
  },
  {
    nom: 'M11 · la coquille ne se declare plus avec un pied',
    fichier: 'noyau/composants/CoquilleRail.tsx',
    avant: 'data-pied={typePied}',
    apres: '',
    tests: ['tests/composants/coquille-rail.test.tsx'],
  },
  {
    nom: 'M12 · le ton neutre se colore en information',
    fichier: 'noyau/composants/Pastille.tsx',
    avant: "neutre: { texte: 'var(--texte-faible)', fond: 'var(--surface-chaude)' },",
    apres: "neutre: { texte: 'var(--info)', fond: 'var(--info-fond)' },",
    tests: ['tests/composants/composants.test.tsx'],
  },
  {
    nom: 'M13 · la garde distribuee exige de nouveau la forme fautive',
    fichier: 'gardes/index.ts',
    avant: 'max(var(${variable}-profil)',
    apres: 'max(var(${variable})',
    tests: ['gardes/gardes.test.ts'],
  },
];

const lignes = [];
let sansEffet = 0;

for (const { nom, fichier, avant, apres, tests } of MUTATIONS) {
  const original = readFileSync(fichier, 'utf8');
  if (!original.includes(avant)) {
    lignes.push(`| ${nom} | mutation impossible : le texte vise est absent de ${fichier} | ECHEC |`);
    sansEffet += 1;
    continue;
  }

  writeFileSync(fichier, original.replace(avant, apres));
  let rouge = false;
  let sortie = '';
  try {
    sortie = execSync(`pnpm exec vitest run ${tests.join(' ')}`, { encoding: 'utf8', stdio: 'pipe' });
  } catch (erreur) {
    rouge = true;
    sortie = `${erreur.stdout ?? ''}${erreur.stderr ?? ''}`;
  } finally {
    writeFileSync(fichier, original);
  }

  const resume = (sortie.match(/Tests\s+[^\n]*/) ?? ['(aucun resume)'])[0].trim();
  lignes.push(`| ${nom} | ${tests.join(', ')} · ${resume} | ${rouge ? 'rougit' : 'RESTE VERT'} |`);
  if (!rouge) sansEffet += 1;
}

console.log('| Mutation | Tests lances, et leur resume | Verdict |');
console.log('| -------- | ---------------------------- | ------- |');
for (const ligne of lignes) console.log(ligne);
console.log('');
console.log(sansEffet === 0 ? 'Toutes les mutations ont rougi.' : `${sansEffet} mutation(s) sans effet ou impossibles.`);
const reste = execSync('git diff --stat -- noyau densites gardes package.json', { encoding: 'utf8' });
console.log(`Fichiers du produit apres restauration : ${reste.trim() === '' ? 'aucun changement' : reste}`);
process.exitCode = sansEffet === 0 ? 0 : 1;
```

````bash
{
  echo '# Chaque garde nouvelle, vue échouer'
  echo
  echo "Commit \`$(git rev-parse --short HEAD)\`. Commande : \`node docs/preuves/1.2.0/mutations.mjs\`."
  echo
  node docs/preuves/1.2.0/mutations.mjs 2>&1
} > docs/preuves/1.2.0/mutations.md
````

Attendu : treize lignes « rougit », puis « Toutes les mutations ont rougi. » et « aucun changement ».
Une ligne « RESTE VERT » est un test qui ne garde rien : on renforce le test, on relance le bloc de
l'étape 2, puis ce script.

- [ ] **Step 4 (mesure) : la mesure « après » du plancher, et sa lecture**

````bash
{
  echo
  echo '## Après le correctif · 1.2.0'
  echo
  echo "Commit \`$(git rev-parse --short HEAD)\`, $(date '+%d/%m/%Y %H:%M'). Même commande, argument \`apres\`."
  echo
  echo '```'
  NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/mesure-plancher.cjs apres 2>&1
  echo '```'
} >> docs/preuves/1.2.0/plancher-tactile.md
````

Puis ajouter à la main, sous la sortie, une section `## Lecture` : un tableau qui confronte, profil par
profil et contexte par contexte, les valeurs mesurées au tableau du §5.1.2 de la SPEC (souris : 48, 48,
44, 40 et 64, 56, 48, 40 ; doigt : 48, 48, 44, 44 et 64, 56, 48, 44), et les hauteurs d'`equilibre` au
doigt (bouton `sm` 44, `md` 48, `lg` 56, champ 48, squelette 48, ligne 56). Toute différence est un
défaut : il se corrige, et la mesure se relance.

- [ ] **Step 5 : écrire `docs/preuves/1.2.0/captures.cjs`**

```js
/**
 * Les captures de la 1.2.0 (SPEC 1.2.0, §11.2), et les mesures qui les accompagnent.
 *
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/captures.cjs
 *
 * Chaque contexte « doigt » verifie d abord que `pointer: coarse` est vrai, et chaque contexte
 * « souris » qu il est faux : sinon la capture ne vaut rien, et le script s arrete.
 */
const { chromium } = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const PAGE = pathToFileURL(resolve('specimens/composants.html')).href;
const DOSSIER = 'docs/preuves/1.2.0';
const BOUTON_PRIMAIRE = '.ai5d-bouton[data-variante="primaire"][href]';

const souris = (largeur) => ({ viewport: { width: largeur, height: 900 } });
const doigt = (largeur) => ({
  viewport: { width: largeur, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});

async function ouvrir(navigateur, options, theme, grossierAttendu) {
  const contexte = await navigateur.newContext(options);
  const page = await contexte.newPage();
  await page.goto(PAGE, { waitUntil: 'load' });
  await page.evaluate((valeur) => document.documentElement.setAttribute('data-theme', valeur), theme);
  await page.waitForTimeout(400);
  const grossier = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  if (grossier !== grossierAttendu) {
    throw new Error(`pointer: coarse vaut ${grossier}, attendu ${grossierAttendu}`);
  }
  return { contexte, page };
}

async function capturer(page, selecteur, fichier) {
  const element = page.locator(selecteur).first();
  await element.scrollIntoViewIfNeeded();
  await element.screenshot({ path: `${DOSSIER}/${fichier}` });
  console.log(`  ${fichier}`);
}

const masque = (selecteur) =>
  `getComputedStyle(document.querySelector('${selecteur} .ai5d-onglets-r')).maskImage`;

(async () => {
  const navigateur = await chromium.launch();
  console.log(`Captures de la 1.2.0 · Chromium ${navigateur.version()} · ${PAGE}`);

  console.log('\n== Pleines pages');
  for (const [fichier, options, theme, grossier] of [
    ['specimens-souris-clair-1280.png', souris(1280), 'light', false],
    ['specimens-souris-sombre-1280.png', souris(1280), 'dark', false],
    ['specimens-doigt-clair-390.png', doigt(390), 'light', true],
    ['specimens-doigt-sombre-390.png', doigt(390), 'dark', true],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, options, theme, grossier);
    await page.screenshot({ path: `${DOSSIER}/${fichier}`, fullPage: true });
    console.log(`  ${fichier} · pointer: coarse = ${grossier}`);
    await contexte.close();
  }

  console.log('\n== Selecteur de theme');
  for (const [nom, options, grossier] of [
    ['doigt 390', doigt(390), true],
    ['souris 1280', souris(1280), false],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, options, 'light', grossier);
    const mesure = await page.evaluate(() => {
      const groupe = document.querySelector('[data-specimen="theme-icones"] .ai5d-theme');
      const segments = [...groupe.querySelectorAll('.ai5d-theme__segment')].map((segment) => {
        const boite = segment.getBoundingClientRect();
        return `${Math.round(boite.width)}x${Math.round(boite.height)}`;
      });
      return { groupe: Math.round(groupe.getBoundingClientRect().height), segments };
    });
    console.log(`  ${nom} : groupe ${mesure.groupe} px de haut, segments ${mesure.segments.join(', ')}`);
    await contexte.close();
  }
  for (const [fichier, options, grossier, selecteur] of [
    ['specimens-doigt-clair-320.png', doigt(320), true, '[data-specimen="theme-288"]'],
    ['specimens-souris-clair-768.png', souris(768), false, '[data-specimen="theme-216"]'],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, options, 'light', grossier);
    await capturer(page, selecteur, fichier);
    const icones = await page.evaluate(
      (s) => [...document.querySelectorAll(`${s} .ai5d-theme__icone`)].map((i) => getComputedStyle(i).display),
      selecteur,
    );
    const largeur = await page.evaluate(
      (s) => Math.round(document.querySelector(`${s} .ai5d-theme`).getBoundingClientRect().width),
      selecteur,
    );
    console.log(`    groupe de ${largeur} px, icones : ${icones.join(', ')}`);
    await contexte.close();
  }

  console.log('\n== Onglets de rubrique');
  {
    const { contexte, page } = await ouvrir(navigateur, doigt(390), 'light', true);
    for (const position of ['debut', 'milieu', 'fin']) {
      await capturer(page, `[data-specimen="onglets-${position}"]`, `onglets-${position}-390.png`);
      console.log(`    masque : ${await page.evaluate(masque(`[data-specimen="onglets-${position}"]`))}`);
    }
    const initial = await page.evaluate(
      () => document.querySelector('[data-specimen="onglets-initial"] .ai5d-onglets-r').scrollLeft,
    );
    console.log(`  rangee sans defilement impose, scrollLeft au chargement : ${initial}`);
    await contexte.close();
  }
  {
    const { contexte, page } = await ouvrir(navigateur, souris(1280), 'light', false);
    await capturer(page, '[data-specimen="onglets-large"]', 'onglets-1280.png');
    console.log(`    masque, rien ne deborde : ${await page.evaluate(masque('[data-specimen="onglets-large"]'))}`);
    await contexte.close();
  }

  console.log('\n== Selection et curseur');
  for (const [fichier, theme] of [
    ['selection-clair.png', 'light'],
    ['selection-sombre.png', 'dark'],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, souris(1280), theme, false);
    await page.bringToFront();
    const couleurs = await page.evaluate(() => {
      const section = document.querySelector('[data-specimen="selection"]');
      const paragraphes = section.querySelectorAll('p');
      const plage = document.createRange();
      plage.setStartBefore(paragraphes[0]);
      plage.setEndAfter(paragraphes[paragraphes.length - 1]);
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(plage);
      return { curseur: getComputedStyle(section.querySelector('input')).caretColor };
    });
    await capturer(page, '[data-specimen="selection"]', fichier);
    console.log(`    ${theme} : curseur de saisie ${couleurs.curseur}`);
    await contexte.close();
  }

  console.log('\n== Le survol du bouton primaire en lien');
  {
    const { contexte, page } = await ouvrir(navigateur, doigt(390), 'light', true);
    const survol = await page.evaluate(() => matchMedia('(hover: hover)').matches);
    const avant = await page.$eval(BOUTON_PRIMAIRE, (e) => getComputedStyle(e).backgroundColor);
    await page.tap(BOUTON_PRIMAIRE);
    await page.waitForTimeout(400);
    const apres = await page.$eval(BOUTON_PRIMAIRE, (e) => getComputedStyle(e).backgroundColor);
    console.log(`  doigt : hover:hover = ${survol}, fond avant ${avant}, apres le toucher ${apres}`);
    await contexte.close();
  }
  {
    const { contexte, page } = await ouvrir(navigateur, souris(1280), 'light', false);
    const avant = await page.$eval(BOUTON_PRIMAIRE, (e) => getComputedStyle(e).backgroundColor);
    await page.hover(BOUTON_PRIMAIRE);
    await page.waitForTimeout(400);
    const apres = await page.$eval(BOUTON_PRIMAIRE, (e) => getComputedStyle(e).backgroundColor);
    console.log(`  souris : fond au repos ${avant}, au survol ${apres}`);
    await contexte.close();
  }

  await navigateur.close();
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
```

- [ ] **Step 6 (mesure) : les captures**

````bash
{
  echo '# Captures de la 1.2.0'
  echo
  echo "Commit \`$(git rev-parse --short HEAD)\`. Commande : \`NODE_PATH=\"\$(npm root -g)\" node docs/preuves/1.2.0/captures.cjs\`."
  echo
  echo '```'
  NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/captures.cjs 2>&1
  echo '```'
} > docs/preuves/1.2.0/captures.md
````

Attendu, à lire dans `captures.md` : au doigt, segments de 44x44 au moins et groupe de 52 px ; à la
souris, 32x32 et 40 px ; à 320 px, le mot seul si le groupe mesure moins de 272 px (17rem), icône et
mot sinon ; dans 216 px, icônes `none` ; masques `to left` au début, double au milieu, `to right` à la
fin, `none` à 1 280 px ; `scrollLeft` supérieur à 0 sur la rangée sans défilement imposé ; curseur
`rgb(34, 81, 255)` en clair et `rgb(107, 136, 255)` en sombre ; au doigt, `hover:hover = false` et le
même fond avant et après le toucher ; à la souris, un fond qui change au survol.

Puis **regarder chaque capture** : la sélection se lit-elle sur les trois surfaces, en clair et en
sombre ? Le pied compact, les titres, les lignes au survol et à l'appui, les définitions à deux colonnes
à 1 280 px, la copie en succès et en échec ? Ce qui se voit s'écrit sous la sortie, dans une section
`## Ce que les captures montrent`. Un défaut vu se corrige, et les étapes 2 à 6 se relancent.

- [ ] **Step 7 : écrire `docs/preuves/1.2.0/sonde-navigateurs.cjs`, et constater les trois moteurs**

```js
/**
 * Ce que chaque moteur fait du fondu des onglets et de l onglet initial (SPEC 1.2.0, §0.8.3,
 * decision 007), sur le specimen du depot.
 *
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/sonde-navigateurs.cjs
 *
 * WebKit de Playwright n est pas Safari : Safari se constate sur un appareil, ou reste non couvert.
 */
const pw = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const PAGE = pathToFileURL(resolve('specimens/composants.html')).href;
const PROPRIETES = [
  'animation-timeline: scroll()',
  'scroll-initial-target: nearest',
  'selector(:has(a))',
  'container-type: inline-size',
  'mask-image: linear-gradient(black, transparent)',
];

function lireMasque(nom) {
  const rangee = document.querySelector(`[data-specimen="${nom}"] .ai5d-onglets-r`);
  if (rangee === null) return 'absent';
  const style = getComputedStyle(rangee);
  return style.maskImage || style.webkitMaskImage || 'none';
}

(async () => {
  for (const nom of ['chromium', 'firefox', 'webkit']) {
    const navigateur = await pw[nom].launch();
    const tactile = nom === 'firefox' ? { hasTouch: true } : { hasTouch: true, isMobile: true };

    const etroit = await navigateur.newContext({ viewport: { width: 390, height: 844 }, ...tactile });
    const page = await etroit.newPage();
    await page.goto(PAGE, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    await page.addScriptTag({ content: lireMasque.toString() });
    const constat = await page.evaluate((proprietes) => {
      const initiale = document.querySelector('[data-specimen="onglets-initial"] .ai5d-onglets-r');
      return {
        prisEnCharge: Object.fromEntries(proprietes.map((p) => [p, CSS.supports(p)])),
        pointerCoarse: matchMedia('(pointer: coarse)').matches,
        masqueDebut: lireMasque('onglets-debut'),
        masqueMilieu: lireMasque('onglets-milieu'),
        masqueFin: lireMasque('onglets-fin'),
        scrollInitial: initiale === null ? 'absent' : initiale.scrollLeft,
      };
    }, PROPRIETES);
    await etroit.close();

    const large = await navigateur.newContext({ viewport: { width: 1280, height: 900 } });
    const pageLarge = await large.newPage();
    await pageLarge.goto(PAGE, { waitUntil: 'load' });
    await pageLarge.waitForTimeout(600);
    await pageLarge.addScriptTag({ content: lireMasque.toString() });
    const masqueSansDebordement = await pageLarge.evaluate(() => lireMasque('onglets-large'));
    await large.close();

    console.log(`\n== ${nom} ${navigateur.version()}`);
    console.log(JSON.stringify({ ...constat, masqueSansDebordement }, null, 2));
    await navigateur.close();
  }
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
```

````bash
{
  echo '# Le fondu des onglets et l onglet initial, moteur par moteur'
  echo
  echo "Commit \`$(git rev-parse --short HEAD)\`, $(date '+%d/%m/%Y'). Playwright global, spécimen du dépôt."
  echo
  echo '```'
  NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/sonde-navigateurs.cjs 2>&1
  echo '```'
} > docs/preuves/1.2.0/navigateurs.md
````

Attendu, comme la sonde du 26 septembre 2026 (E13) : Chromium, les deux pris en charge, trois masques
et `none` sans débordement, `scrollInitial` supérieur à 0 ; WebKit, le fondu sans l'onglet initial ;
Firefox, ni l'un ni l'autre, et `none` partout. Ajouter sous la sortie un tableau de lecture, une ligne
par moteur, et la phrase : « Safari : non constaté, faute d'appareil », ou le constat de Karamo s'il en
a un.

- [ ] **Step 8 : la montée de Compte, sans une ligne changée dans Compte**

SPEC §11.2, US-S17. Aucune commande de `pnpm install` ne tourne ailleurs pendant ce temps. Si la copie
de travail de Compte n'est pas propre, on ne touche à rien : la ligne va dans « Ce qui n'est pas
couvert ».

```bash
# 1. Le paquet du système, tel qu'une étiquette le livrerait (champ files compris).
mkdir -p C:/Users/ksthe/AppData/Local/Temp/ai5d-montee-1.2.0
pnpm pack --pack-destination C:/Users/ksthe/AppData/Local/Temp/ai5d-montee-1.2.0

# 2. Compte : propre, sinon on s'arrête.
cd C:/Users/ksthe/Documents/ai5d-platform
git status --short
git rev-parse --short HEAD

# 3. La garde distribuée, lancée par le système sur la feuille installée dans Compte, en 1.1.0.
cd C:/Users/ksthe/Documents/ai5d-design-system
node --input-type=module -e "import { decrire, verifierPlancherTactile } from './gardes/index.ts'; console.log(decrire(verifierPlancherTactile('C:/Users/ksthe/Documents/ai5d-platform/apps/compte/node_modules/@ai5d/design-system/densites/profils.css')));"

# 4. La montée, seule.
cd C:/Users/ksthe/Documents/ai5d-platform
pnpm --filter compte add C:/Users/ksthe/AppData/Local/Temp/ai5d-montee-1.2.0/ai5d-design-system-1.2.0.tgz

# 5. La vérification de Compte, sans rien changer d'autre.
CI=true pnpm typecheck 2>&1 | tee C:/Users/ksthe/AppData/Local/Temp/ai5d-montee-1.2.0/typecheck.txt
CI=true pnpm lint 2>&1 | tee C:/Users/ksthe/AppData/Local/Temp/ai5d-montee-1.2.0/lint.txt
CI=true pnpm test 2>&1 | tee C:/Users/ksthe/AppData/Local/Temp/ai5d-montee-1.2.0/test.txt

# 6. La garde, sur la feuille désormais installée.
cd C:/Users/ksthe/Documents/ai5d-design-system
node --input-type=module -e "import { decrire, verifierPlancherTactile } from './gardes/index.ts'; console.log(decrire(verifierPlancherTactile('C:/Users/ksthe/Documents/ai5d-platform/apps/compte/node_modules/@ai5d/design-system/densites/profils.css')));"

# 7. Compte rendu à son état. Aucun commit, aucune poussée.
cd C:/Users/ksthe/Documents/ai5d-platform
git checkout -- apps/compte/package.json pnpm-lock.yaml
pnpm install --frozen-lockfile
git status --short
```

Écrire `docs/preuves/1.2.0/montee-compte.md` : le commit de Compte, la garde avant (quatre infractions
attendues sur la feuille de la 1.1.0 : deux « se lit elle-meme », lignes 79 et 80, et deux sources
absentes), la garde après (`Aucune infraction.`), les trois sorties de Compte recopiées telles quelles
(fin de sortie au moins, codes de sortie en entier), et le `git status --short` final, vide. Si l'une
des trois commandes de Compte échoue, recopier l'échec et en chercher la cause : un échec dû à la
montée est un défaut de la 1.2.0, qui se corrige ici ; un échec qui existait avant la montée se prouve
en relançant la même commande sur Compte rendu à son état, et s'écrit comme tel.

- [ ] **Step 9 : écrire `docs/preuves/1.2.0/verification.md`**

```markdown
# 1.2.0 · La vérification du système

**Date :** {la date du jour de l'étape 2} · **Commit vérifié :** {le hash de l'étape 2}

## Les quatre commandes, d'un seul bloc

(la fin de `verification-brute.txt` recopiée : le résumé de chaque commande, le nombre de fichiers et
de tests de Vitest, et le code de sortie 0)

## Ce que la première passe a trouvé

| Échec | Cause | Réparation |
| ----- | ----- | ---------- |
(une ligne par échec de la première passe ; « Aucun » si elle est passée d'un coup)

## Chaque garde nouvelle, vue échouer

Voir [`mutations.md`](mutations.md) : treize mutations, dont M1, la forme exacte de
`densites/profils.css:79-80` en 1.1.0, qui fait rougir la garde distribuée, le test de forme, le
résolveur et la non-régression.

## Ce que la vérification ne couvre pas

Le rendu : il se prouve dans [`plancher-tactile.md`](plancher-tactile.md), [`captures.md`](captures.md)
et [`navigateurs.md`](navigateurs.md). La construction d'un produit : le système livre du TypeScript non
transpilé, et aucune construction n'a été lancée.
```

Les accolades de ce modèle se remplacent par les valeurs réelles, et les parenthèses par les sorties
recopiées ; aucune ne reste dans le fichier commité.

- [ ] **Step 10 : écrire `docs/preuves/1.2.0/README.md`**

```markdown
# Preuves · 1.2.0

> Sorties réelles, recopiées. Une classe présente dans le code ne prouve pas un rendu ; un test écrit
> ne prouve pas un test qui passe.

| Preuve | Fichier |
| ------ | ------- |
| La vérification d'un bloc, et ce que sa première passe a trouvé | [`verification.md`](verification.md) |
| Chaque garde nouvelle, vue échouer | [`mutations.md`](mutations.md) |
| Le plancher tactile mesuré dans Chromium, avant et après | [`plancher-tactile.md`](plancher-tactile.md) |
| Les captures, à la souris et au doigt, en clair et en sombre, et leurs mesures | [`captures.md`](captures.md) |
| Le fondu et l'onglet initial, moteur par moteur | [`navigateurs.md`](navigateurs.md) |
| La montée de Compte, sans une ligne changée dans Compte | [`montee-compte.md`](montee-compte.md) |

## Écarts avec la SPEC

Les treize écarts E1 à E13 du plan (`docs/superpowers/plans/2026-09-26-version-1-2-0-espace-participant.md`),
recopiés, et tout écart trouvé pendant l'exécution, avec son constat.

## Ce qui n'est pas couvert

- **Safari**, faute d'appareil. WebKit de Playwright en donne une indication, pas une preuve.
- **Un téléphone réel.** Le doigt est une émulation de Chromium (`hasTouch`, `isMobile`), vérifiée par
  `matchMedia('(pointer: coarse)')` avant chaque mesure.
- **`scroll-initial-target` hors de Chromium, `animation-timeline` dans Firefox** : non pris en charge
  au jour de la vérification ; le repli est le rendu de la 1.1.0.
- **Le rendu dans un client de messagerie** : la recette `LOGOTYPE` n'y est pas employée par le système.
- **Le Portail** : il monte de la 1.0.1 à la 1.2.0 dans son sprint P09, pas dans ce lot.
- **La construction d'un produit** : aucun `build` n'a été lancé.
```

Recopier sous « Écarts avec la SPEC » le tableau E1 à E13 du plan, et y ajouter les écarts nés de
l'exécution. Ajouter sous « Ce qui n'est pas couvert » toute preuve qui n'a pas pu se faire (la montée
de Compte si sa copie de travail était occupée, par exemple), avec sa raison.

- [ ] **Step 11 : le suivi et les leçons**

Dans `tasks/todo.md`, remplacer la mention `· écrite, non testée` de T2 à T15 par `· vérifiée`, et
cocher T16 : `- [x] T16 · … · vérifiée, preuves dans docs/preuves/1.2.0/`.

Dans `tasks/lessons.md`, section « Version 1.2.0 » : une leçon par défaut que la vérification, les
mutations, la mesure ou les captures ont trouvé, sur le modèle de la première (le constat, puis la
règle en gras). Si rien n'a été trouvé, ne rien ajouter.

- [ ] **Step 12 : commiter**

```bash
git add docs/preuves/1.2.0 tasks/todo.md tasks/lessons.md specimens/composants.html
git status --short
cat > .git/message-1.2.0.txt <<'MESSAGE'
La vérification de la 1.2.0, ses gardes vues échouer, le plancher mesuré après correctif, les captures, les trois moteurs et la montée de Compte
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

Si la vérification a demandé des corrections dans le code, elles entrent dans ce même commit, et la
phrase du message le dit (« … et les défauts qu'elle a trouvés, réparés »).

---

### Task 17 : La relecture du lot contre la SPEC

SPEC §4, étape 11. Un relecteur neuf, qui n'a pas écrit le code.

**Files:**
- Modify: `docs/preuves/1.2.0/README.md` (écarts), et tout fichier que la relecture fait corriger

**Interfaces:**
- Consumes : `git diff v1.1.0..HEAD`, la SPEC, les user stories, ce plan, `docs/preuves/1.2.0/`.
- Produces : la liste des constats, chacun corrigé ou consigné.

- [ ] **Step 1 : lancer la relecture**

Avec `superpowers:requesting-code-review`, confier au relecteur : le diff `v1.1.0..HEAD`, la SPEC et
les user stories, la table de couverture en fin de ce plan, et ces questions précises :

1. Chaque critère du §15 de la SPEC et de chaque user story a-t-il sa preuve, test ou mesure ?
2. G1 à G19 tiennent-elles sur tout le diff ? En particulier : aucune couleur ni aucun espacement
   littéral hors des exceptions nommées ; aucun `'use client'` ajouté hors de `ValeurCopiable` ; aucun
   import de Next ; aucune dépendance ajoutée.
3. Chaque chaîne qu'une personne lit respecte-t-elle la voix (G11) ?
4. Un produit à la 1.1.0 qui monte compile-t-il sans changer une ligne (montée de Compte) ?

Et ces trois recherches, dont le résultat se recopie :

```bash
git diff v1.1.0..HEAD -- noyau densites gardes README.md CHANGELOG.md docs/decisions tasks | grep -n '^+.*—'
git diff v1.1.0..HEAD --name-only | xargs grep -lniE 'cl[a]ude|assist[a]nt|co-authored' || echo "aucune mention"
git log v1.1.0..HEAD --format=%B | grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with'
```

Attendu : aucune ligne ajoutée avec un tiret cadratin ; « aucune mention » ; `0`.

- [ ] **Step 2 : traiter chaque constat**

Un constat juste se corrige à la racine, et le bloc de vérification de la tâche 16 (étape 2) se relance
en entier ; la mesure et les captures se relancent si le constat touche une feuille. Un constat écarté
s'écrit sous « Écarts avec la SPEC » de `docs/preuves/1.2.0/README.md`, avec son motif. Cocher T17 dans
`tasks/todo.md`.

```bash
git add -A docs/preuves/1.2.0 tasks/todo.md noyau densites gardes tests _build specimens CHANGELOG.md README.md
git status --short
cat > .git/message-1.2.0.txt <<'MESSAGE'
La relecture de la 1.2.0 contre sa spécification, et le traitement de ses constats
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
```

---

### Task 18 : La publication, sur l'accord explicite de Karamo

SPEC §14. **Rien de cette tâche ne s'exécute sans l'accord explicite de Karamo, donné en réponse à la
question de l'étape 2.** Une étiquette arrive dans tous les produits qui la montent. Jamais de poussée
forcée ; une étiquette publiée ne se déplace jamais : un défaut trouvé après se corrige en `1.2.1`.

**Files:**
- Modify (selon les décisions de Karamo) : `CHANGELOG.md`, `package.json`, `README.md`, `noyau/jetons.css`, `tests/jetons.test.ts`, `noyau/NOYAU.md`, `tasks/todo.md`

**Interfaces:**
- Consumes : le dossier `docs/preuves/1.2.0/` complet et relu.
- Produces : l'étiquette annotée `v1.2.0` (comme `v1.1.0`) sur `origin`.

- [ ] **Step 1 : les vérifications d'avant poussée**

```bash
git status --short
git log v1.1.0..HEAD --format=%B | grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with'
git log v1.1.0..HEAD --format='%an <%ae>' | sort -u
git ls-files | grep -iE '(^|/)\.env|\.pem$|\.key$' || echo "aucun secret suivi"
```

Attendu : arbre propre, `0`, une seule identité, « aucun secret suivi ».

- [ ] **Step 2 : poser la question à Karamo, en nommant ce qui sera publié**

Lui présenter, simplement : les cinq différences à l'écran du journal ; les ajouts ; la mesure du
plancher avant et après ; les captures de la sélection en clair et en sombre ; le constat des trois
moteurs ; la montée de Compte ; ce qui n'est pas couvert. Puis lui demander de trancher, un par un :

1. **Le classement** : mineure `1.2.0` (proposée), ou majeure `2.0.0` ?
2. **La sélection en bleu d'action** : gardée, ou retirée ?
3. **Safari** : dispose-t-il d'un appareil pour le constater avant l'étiquette ?
4. **L'accord** de poser l'étiquette et de pousser `main`.

Ne rien faire d'autre avant sa réponse.

- [ ] **Step 3, seulement si Karamo retire la sélection : la retirer proprement**

Dans `noyau/jetons.css`, supprimer le bloc de commentaire « La selection de texte, depuis la 1.2.0 » et
la règle `::selection`. Dans `tests/jetons.test.ts`, supprimer le test « peint la selection aux
couleurs du bouton primaire ». Dans `CHANGELOG.md`, le point 2 de « Ce qui change à l'écran » devient
« **Le curseur de saisie** prend le bleu d'action. » ; dans `NOYAU.md` §6, « `caret-color` et la
sélection de texte, aux couleurs du bouton primaire, » devient « `caret-color` ». Consigner le retrait
et son motif sous « Écarts avec la SPEC » des preuves ; les captures `selection-*.png` restent, comme
preuve de ce qui a été refusé. Relancer le bloc de la tâche 16 (étape 2).

- [ ] **Step 4, seulement si Karamo juge la version majeure : publier `2.0.0`**

`package.json` : `"version": "2.0.0"`. `README.md` : le badge `version-2.0.0` et les deux commandes
d'installation en `#v2.0.0`. `CHANGELOG.md` : le titre `## 2.0.0 · {date du jour}`, et en première
phrase de l'entrée « Majeure, sur décision de Karamo : la hauteur au doigt change le rendu de tous les
produits. » ; dans le guide, `#v2.0.0`. Relancer le bloc de la tâche 16 (étape 2) : la garde
documentaire confronte la nouvelle version. L'étiquette de l'étape 6 devient `v2.0.0`.

- [ ] **Step 5 : dater, cocher, et relancer le bloc**

Si le jour n'est pas le 26 septembre 2026, corriger la date du titre de l'entrée dans `CHANGELOG.md`.
Dans `tasks/todo.md`, cocher T18 :
`- [x] T18 · accord de Karamo le {date}, étiquette v1.2.0 posée et poussée`.

```bash
git add CHANGELOG.md tasks/todo.md package.json README.md noyau/jetons.css noyau/NOYAU.md tests/jetons.test.ts docs/preuves/1.2.0
cat > .git/message-1.2.0.txt <<'MESSAGE'
La 1.2.0 datée du jour de sa publication, sur l’accord de Karamo
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.2.0.txt
git commit -F .git/message-1.2.0.txt
( CI=true pnpm typecheck && CI=true pnpm lint && CI=true pnpm format:check && CI=true pnpm test ) 2>&1 | tail -n 15
```

Le bloc doit rendre le code de sortie 0 sur ce commit, qui sera celui de l'étiquette. Rouge : on
corrige, on recommite, on relance ; l'étiquette attend.

- [ ] **Step 6 : l'étiquette et la poussée**

```bash
git tag -a v1.2.0 -m "v1.2.0"
git push origin main
git push origin v1.2.0
git ls-remote --tags origin v1.2.0
gh run list --limit 1
```

Attendu : l'étiquette présente sur `origin`, et le dernier passage de l'intégration continue
« Qualité » vert sur `main`. S'il est rouge, le dire à Karamo aussitôt : l'étiquette ne se déplace pas,
le défaut se corrige en `1.2.1`.

---

## Couverture de la SPEC

Chaque critère du §15, et la tâche qui le porte. Les critères des user stories qui ne s'y trouvent pas
mot pour mot suivent.

| Critère (SPEC §15) | Tâches |
| ------------------ | ------ |
| Aucune déclaration ne lit sa propre propriété, témoin relevé | 2 (`cycles.test.ts`), 16 (M1) |
| Valeurs effectives du §5.1.2 vérifiées par le résolveur, souris et doigt, quatre profils | 2 (`densites.test.ts`), 3 (non-régression) |
| `verifierPlancherTactile` accepte la feuille du dépôt, refuse la 1.1.0 avec message et ligne | 2, 16 (M1, M13, montée de Compte) |
| Mesure Chromium avant et après | 1, 16 (étape 4) |
| `DENSITES.md` et `PALIERS.md` corrigés ; décision 005 | 2 |
| `Bouton` avec `href` : lien, classes, hauteur, états ; sans `href`, le HTML de 1.1.0 | 4 |
| Lien désactivé ou en chargement sans `href` ; lien sortant avec `rel` et mention | 4, 10 |
| `download` et `target="_blank"` n'emploient jamais le lien du routeur | 4, 10 |
| `OngletsRubrique` : six onglets et `Lien` ; fondu à 390 px, aucun à 1 280 px | 6, 16 (captures, navigateurs) |
| Un lien qui contient `[data-en-attente]` montre son attente (spécimen) | 4, 6, 10, 15, 16 |
| Au doigt, un bouton touché ne garde pas sa couleur de survol | 4 (feuille), 16 (toucher mesuré) |
| Ton `neutre` dans `Pastille`, `PastilleEtat`, `Bandeau` | 5 |
| Cinq composants exportés, documentés dans `NOYAU.md` et le README, rendus dans les spécimens | 9, 10, 11, 13, 14, 15 |
| `LigneLien` : `min-height: var(--ligne-liste)`, appui sans transition, un seul interactif | 10 |
| `ListeDefinitions` : deux colonnes par requête de conteneur à 480 px | 9 |
| `ValeurCopiable` : échec qui sélectionne et affiche, succès qui revient à 2 000 ms | 11 |
| `CoquilleRail` : `<footer>` après `<main>`, et le HTML de 1.1.0 sans pied | 7 |
| Sélecteur de thème à 44 px au doigt ; libellés à 320 px et dans 216 px | 8, 16 |
| Sélection lisible sur les trois surfaces, en clair et en sombre ; curseur bleu | 3, 15, 16 |
| `COULEURS_NAVIGATEUR` par `/theme`, égal à `--surface-1` | 3 |
| `--mesure-texte`, trois mouvements, aucun `--duree-signature`, règle réécrite, décision 006 | 3, 14 |
| Instantané de 1.1.0 versionné, non-régression | 2, 3 |
| 57 couples de contraste, tous au-dessus de 4,5 | 3 |
| `LOGOTYPE` par `/logotype`, sans couleur ; `Logotype.tsx` le lit, rendu inchangé | 12 |
| Vérification d'un bloc verte, sortie recopiée | 16 |
| Aucune dépendance ajoutée ; aucun composant existant ne passe client | 12 (`exports.test.ts`), 13, 16 (M5) |
| Montée de Compte constatée, ou écrite non couverte | 16 |
| Trente-neuf composants et version `1.2.0` partout où la garde les cherche | 13, 14 |
| Décisions 005 à 009 ; `tasks/todo.md` coché ; leçons | 2, 3, 6, 12, 14, 16 |
| Rapport « Ce qui n'est pas couvert » | 16 |
| Messages de commit sans mention interdite | chaque tâche (G15), 17, 18 |
| Étiquette `v1.2.0` seulement après l'accord de Karamo | 18 |

User stories, en plus : `ComposantLien` assignable par `Link` (US-S03 : tâche 4, types) ; `<Bouton
href="/">` rendu au serveur (US-S04 : tâche 4) ; guide de montée qui nomme `RetourPortail.tsx:24`,
`LienInvalide.tsx:56` et `AccesRefuse.tsx:126-131` (US-S04 : tâche 14) ; pied compact retiré de l'arbre
au-delà de 768 px par `display: none` (US-S02 : tâche 7) ; groupe du sélecteur de 52 px au doigt
(US-S02 : tâches 8 et 16) ; contrastes de la description d'une ligne à l'appui et au survol (US-S05 :
tâche 3) ; rapport navigateur par navigateur (US-S06 : tâche 16) ; `NOYAU.md` dit quand employer
`neutre` (US-S07 : tâche 14) ; `--mesure-texte` ne varie pas avec la densité (US-S10 : tâche 2,
`profils.css` n'en déclare que huit) ; formulation de la copie (US-S14 : tâche 14) ; chaque chemin
exporté existe (US-S15 : tâche 12) ; aucune étiquette publiée déplacée (US-S16 : tâche 18) ; la garde,
lancée sur la feuille installée par un produit, passe (US-S17 : tâche 16).
