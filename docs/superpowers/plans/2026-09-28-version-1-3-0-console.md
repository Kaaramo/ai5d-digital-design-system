# Version 1.3.0 · ce qui manque au système pour la console · Plan d'implémentation

> **Pour qui exécute ce plan :** sous-compétence requise, `superpowers:subagent-driven-development`
> (recommandée pour les tâches 2 à 16) ou `superpowers:executing-plans`. Les étapes sont en cases à
> cocher (`- [ ]`).
>
> **Le moment des tests, sur décision de Karamo (règles globales).** Chaque tâche écrit **d'abord son
> test**, en code complet, puis l'implémentation ; elle donne la commande qui voit le test échouer et
> celle qui le voit passer. **Aucune de ces commandes ne se lance en cours de lot** : la tâche se coche
> « écrite, non testée » dans `tasks/todo.md` et se commite. La tâche 17 lance la vérification d'un
> seul bloc (le test passe), puis `docs/preuves/1.3.0/mutations.mjs`, qui remet l'état d'avant chaque
> tâche (fichier retiré, ou texte de la 1.2.0 restitué) et voit chaque test échouer. Seules les
> commandes marquées « mesure » (navigateur) ou « génération » (instantanés, spécimens, banc d'essai,
> formatage) se lancent en cours de lot. **Jamais de `build`** : le dépôt n'en a pas, et la règle vaut
> partout.

**Goal :** publier `@ai5d/design-system` `1.3.0` : une feuille par composant quel que soit le nombre
d'instances, un jeton de survol réglé par thème, le menu d'actions au clavier, le bandeau qui se ferme,
l'action d'un en-tête de rubrique, le compteur d'onglet, le chiffre compact, l'en-tête d'objet et le
sélecteur natif, sans changer une valeur de jeton ni casser un appel existant, et sans que la console
du Portail ait à attendre une pièce qui n'a pas de deuxième consommateur.

**Architecture :** toute feuille passe par un module pur, `noyau/composants/feuille.ts`, qui pose
`<style href precedence="ai5d">` : React 19 la hisse dans `<head>` et la déduplique, au serveur comme
au client. Une septième garde distribuée, `verifierFeuilleUnique`, refuse toute balise qui ne le fait
pas. Le survol devient un jeton de rôle, `--surface-survol`, sans valeur nouvelle. Les deux composants
qui ont un état (`MenuActions`, `Selecteur`) sont des modules clients ; tout le reste se rend au
serveur. Ce que jsdom ne calcule pas (hissage réel, couche supérieure, ancre CSS, clavier, réserve
basse) se prouve sur un **banc d'essai** rendu par React, au serveur puis hydraté, ouvert dans Chromium.
La non-régression des jetons s'exécute contre un instantané de `v1.2.0` versionné.

**Tech Stack :** TypeScript 5.7 strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) ·
React 19.2 · Vitest 2, Testing Library, jsdom 25 · ESLint 9 · Prettier 3 · pnpm 10.24 · Node 22 ·
Playwright installé globalement sur le poste (mesures, recette et captures ; aucune dépendance ajoutée
au dépôt) · esbuild 0.21, celui que Vite apporte à Vitest, résolu depuis eux pour construire le banc
d'essai (aucune dépendance ajoutée).

**Spec :**
[`docs/superpowers/specs/version-1.3.0-console/SPEC-Version-1.3.0-Console.md`](../specs/version-1.3.0-console/SPEC-Version-1.3.0-Console.md)
et
[`docs/superpowers/specs/version-1.3.0-console/USER-STORIES-Version-1.3.0-Console.md`](../specs/version-1.3.0-console/USER-STORIES-Version-1.3.0-Console.md).
Ce couple **est** la spécification ; ce plan n'en ajoute aucune. Il déclare au § « Écarts » ce que la
lecture du code et les sondes ont fait apparaître, avec leur constat. Les arbitrages de Karamo du 28
septembre 2026 (SPEC §0.9) sont appliqués : mineure `1.3.0` ; survol sombre sur `--surface-1` ;
`LiensRail` passe au jeton ; `TableauDonnees` reste au Portail ; `EnteteObjet` et `Selecteur` montent.

**Constat du plan.** Le code de chaque tâche a été monté, avant d'être écrit ici, dans une copie
jetable du dépôt (hors du dépôt, rien de commité) le 28 septembre 2026 : `tsc` sans erreur, ESLint et
Prettier propres, 826 tests verts et un sauté, les seuls rouges étant les quatre tests documentaires
qu'éteint la tâche 15 ; les 22 mutations de la tâche 17 rougissent ; le banc d'essai, la sonde du menu
et les captures tournent dans Chromium 141. Ce n'est pas une preuve du lot : c'est la raison pour
laquelle les nombres attendus de ce plan sont écrits. La preuve est celle des tâches 17 et 18.

---

## Global Constraints

Chaque tâche les porte implicitement. Les valeurs sont recopiées de la SPEC.

| # | Contrainte | Source |
| - | ---------- | ------ |
| G1 | **Aucune valeur de jeton existante ne change.** `tests/non-regression.test.ts` le prouve contre `tests/instantanes/jetons-1.1.0.json` et, désormais, `jetons-1.2.0.json` | SPEC §0.8, §6 |
| G2 | **Aucune propriété retirée, aucune variante renommée.** `ProprietesChiffre` devient une union ; les appels du Portail (`app/admin/page.tsx:40-56`) compilent tels quels | SPEC §0.8 |
| G3 | **Aucune dépendance ajoutée** au `package.json`, ni de production ni de développement. `Ellipsis`, `X` et `ChevronRight` viennent de `lucide-react`, déjà en pair ; esbuild est résolu depuis Vitest, jamais déclaré | SPEC §0.8 |
| G4 | **Aucun cadriciel.** Aucun fichier de `noyau/` ni de `gardes/` n'importe Next ; le lien du routeur arrive toujours en propriété | SPEC §0.8 |
| G5 | **`noyau/marque.css` et les six jetons de marque ne bougent pas** | SPEC §0.8 |
| G6 | **Aucun composant existant ne passe côté client.** `'use client'` : `MenuActions` et `Selecteur`, nouveaux. `Bandeau`, `EnteteRubrique`, `OngletsRubrique`, `Chiffre`, `Squelette`, `EnteteObjet` restent rendables par un composant serveur | SPEC §0.8, §5.0.4 |
| G7 | **Aucune couleur ni aucun espacement littéral dans un composant** (gardes 1 et 6). Les seules exceptions sont celles que `gardes/gardes.test.ts` nomme déjà ; ce lot n'en ajoute aucune | SPEC §5.0.1 |
| G8 | Échelle : `--espace-1` 4 px, `-2` 8 px, `-3` 12 px, `-4` 16 px, `-6` 24 px, `-8` 32 px, `-12` 48 px, `-16` 64 px. **Il n'existe pas de `--espace-5`.** Rayons : `--rayon-sm` 4 px, `--rayon-md` 10 px, `--rayon-lg` 16 px, `--rayon-plein`. Cible : `--cible-tactile` 44 px | SPEC §5.0.1 |
| G9 | **Toute feuille passe par `feuille(id, css)`** (tâche 2), jamais par une balise `<style>` : la garde 7 le refuse. Clé stable `ai5d-…`, toute classe préfixée `ai5d-`, couleurs et états dans la feuille, jamais en style en ligne. Quatre règles : (1) survol gardé par `@media (hover: hover)` et par `:not(:disabled)` ou `:not([aria-disabled='true'])` ; (2) focus `:focus-visible`, anneau 2 px `var(--action)` ; (3) appui immédiat, `:active` sans transition ; (4) toute feuille qui déclare `@keyframes` contient `@media (prefers-reduced-motion: reduce)` | SPEC §5.0.2 |
| G10 | **Les constantes `STYLE_…` gardent leur nom, leur forme (`const STYLE_X = \`…\`;`) et leurs exports** : `_build/generer-specimens.mjs` et `tests/cycles.test.ts` les lisent par leur texte. La prose ne vit jamais dans la chaîne : un accent grave la terminerait. Les commentaires CSS d'une feuille n'emploient ni accent grave ni `--nom:` | SPEC §0.8 ; `OngletsRubrique.tsx` |
| G11 | **Voix**, dans tout texte qu'une personne lit : vouvoiement, apostrophe typographique `’` dans les chaînes d'interface, aucun tiret cadratin ni demi-cadratin, aucun emoji, aucun point d'exclamation ; un refus nomme qui peut lever le blocage. Le système n'écrit que « Fermer ce message », « Fil d’Ariane » et la forme du nom d'un compteur ; tout autre libellé vient du produit | SPEC §5.0.3 |
| G12 | **Dépôt public** : aucune donnée personnelle, aucune clé, aucune adresse réelle. Les exemples emploient les personnes fictives du PRD du Portail ; les adresses finissent en `exemple.invalid` | SPEC §0 |
| G13 | **`exactOptionalPropertyTypes`** : toute propriété optionnelle nouvelle s'écrit `?: T \| undefined`. Les deux propriétés historiques de `Chiffre`, `cible?: string` et `mise?: boolean`, gardent leur forme exacte | `LiensRail.tsx`, SPEC §5.7.1 |
| G14 | **Tests écrits d'abord, vérification d'un bloc à la fin** : `CI=true GITHUB_ACTIONS=true pnpm typecheck && CI=true pnpm lint && CI=true pnpm format:check && CI=true GITHUB_ACTIONS=true pnpm test`. `GITHUB_ACTIONS=true` parce que `tests/marque.test.ts` lit la source de la marque sur le poste de Karamo (`C:/Users/ksthe/Documents/AI5D_Brand_2026/tokens.css`) et ne se saute que sous cette variable, pas sous `CI` (écart E14). Aucun `build`, jamais | Règles de Karamo |
| G15 | **Commits** : un par tâche, en français, une phrase qui dit ce que le commit apporte ; aucun co-auteur, aucune mention d'outillage. Avant chaque commit, le message écrit dans `.git/message-1.3.0.txt` passe `grep -icE 'co-authored\|cl[a]ude\|assist[a]nt\|generat[e]d with' .git/message-1.3.0.txt`, qui doit afficher `0`. **Aucune poussée sans l'accord explicite de Karamo** ; on reste sur la branche `version-1.3.0-console` | Règles de Karamo, SPEC §14 |
| G16 | **Aucune estimation en heures**, nulle part | Règles de Karamo |
| G17 | **La version reste `1.2.0` dans `package.json` et dans le README jusqu'à la tâche 21**, qui la pose sur l'accord explicite de Karamo : `tests/documentation.test.ts` confronte la version du manifeste au badge et aux commandes d'installation du README | Consigne du lot, écart E15 |
| G18 | **Scripts d'édition dans un fichier, jamais en ligne dans le shell** (leçon du dépôt). Un message de commit s'écrit par un document ici délimité par `'MESSAGE'`, qui ne transforme rien | `tasks/lessons.md` |
| G19 | **Les numéros de ligne cités sont ceux du fichier au début de la tâche.** Quand une tâche modifie un fichier en plusieurs étapes, on se repère au texte cité, pas au numéro | Ce plan |

**Le geste de commit**, identique à chaque tâche (G15, G18) :

```bash
cat > .git/message-1.3.0.txt <<'MESSAGE'
{la phrase de la tâche, recopiée}
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt   # doit afficher 0
git commit -F .git/message-1.3.0.txt
```

Chaque tâche donne sa phrase exacte, à coller à la place de la ligne entre les deux `MESSAGE`.

**Les deux commandes différées**, que chaque tâche nomme (G14) :

```bash
# Voir échouer : l'état d'avant la tâche Tn, remis puis restauré (tâche 17 seulement).
node docs/preuves/1.3.0/mutations.mjs Tn

# Voir passer : les fichiers de test de la tâche (tâche 17 seulement, après le bloc vert).
CI=true GITHUB_ACTIONS=true pnpm exec vitest run {fichiers}
```

---

## Review Focus

Six classes d'entrées que la SPEC implique sans les tester, et qui mordraient d'abord un produit ou
une personne. Chacune a son test dans la tâche qui possède le code.

1. **Un test de produit, ou du système, qui lit une feuille dans son conteneur.** Après le hissage, il
   lit `null`, et un test qui boucle sur les règles de cette feuille passe à vide : c'est le cas de
   « n applique le survol qu aux boutons actifs » (`tests/composants/composants.test.tsx:258`), que la
   SPEC n'avait pas compté. Attendu : chaque lecture passe par `texteFeuille`, qui **lève** quand la
   feuille n'est pas exactement une fois dans `document.head`. Tests : tâche 2 ; montée du Portail,
   tâche 20.
2. **Une balise ouvrante `<style` écrite sur plusieurs lignes, ou dont une expression contient `>`**
   (`data-x={(a) => a > 0}`). Une lecture ligne à ligne la rate ; une lecture au premier chevron la
   coupe. Attendu : la garde lit jusqu'au chevron qui ferme la balise, accolades et chaînes suivies.
   Tests : tâche 3.
3. **Un menu dont toutes les actions sont graves, qui n'en a qu'une, ou aucune.** Attendu : aucun filet
   en tête, aucun filet sans grave, rien du tout sans action. Tests : tâche 10.
4. **L'identifiant de `useId` sous une autre version de React** : `_R_1_` en 19.2, `:r1:` en 19.0, que
   l'ancre CSS (`anchor-name`) refuse. Attendu : l'identifiant du menu et le nom d'ancre ne gardent que
   `[a-zA-Z0-9_-]`. Test : tâche 10 (forme de l'identifiant).
5. **Un compteur à zéro, un compteur à quatre chiffres, un onglet actif qui en porte un.** Attendu :
   « 0 » affiché, « 1 234 » avec l'espace fine insécable, la pastille neutre sur l'onglet actif, un
   nom accessible sans espace avant la virgule. Tests : tâche 8.
6. **Une règle de palier qui remet une propriété à zéro avec un sélecteur plus faible que celui qui la
   pose.** Le brouillon du §5.10 de la SPEC en porte une. Attendu : la remise à zéro porte le même
   sélecteur que la réserve. Tests : tâche 13, et sa mutation, qui rejoue le brouillon.

Couverts aussi, sans figurer dans les six : un lien de produit qui reçoit `role` et `tabIndex` dans un
menu (tâche 10), un `Selecteur` en erreur dont l'aide n'est plus citée (tâche 12), un `EnteteObjet`
sans fil ni gestes (tâche 11), un rendu serveur du document entier hydraté sans erreur (tâches 1 et
18, banc d'essai).

---

## Écarts de ce plan à la SPEC, constatés en machine le 28 septembre 2026

La SPEC est une hypothèse (règles de Karamo). Voici ce que la lecture du code et les sondes ont
montré, et ce que le plan en fait. Chaque écart se recopie dans `docs/preuves/1.3.0/README.md` à la
tâche 18.

| # | SPEC | Constat | Ce que fait le plan |
| - | ---- | ------- | ------------------- |
| E1 | Chemins non dits pour les consommateurs | Dans ce conteneur : le système à `/home/user/ai5d-digital-design-system`, le Portail à `/home/user/AI5D-Portail`, Compte à `/home/user/ai5d-platform` (sans `node_modules`). Sur le poste de Karamo, ils sont ailleurs (`F:\AI5D Portail`, `C:\Users\ksthe\Documents\…`) | Toutes les commandes partent de la racine du système ; les trois consommateurs sont des variables posées en tête des tâches 1 et 20 |
| E2 | §5.1.7 : « trente-neuf occurrences » dans huit fichiers de tests | Recompté : **52** dans les huit mêmes fichiers. `composants.test.tsx` en porte **19** et non 6 : treize lectures par `querySelector('#ai5d-…')`, que la recherche de la SPEC ne cherchait pas. L'une d'elles (`:258`) passerait à vide après le hissage | Une migration scriptée, rejouable, qui les convertit toutes (tâche 2) ; `texteFeuille` lève au lieu de rendre une chaîne vide |
| E3 | §11.1, §11.2 : feuilles, réserve basse et menu constatés « dans Chromium, sur le spécimen » | Le spécimen est une page **statique**, sans React : il reproduit le balisage, il ne peut ni hisser une feuille, ni poser le style en ligne d'un composant, ni ouvrir un menu au clavier | Un **banc d'essai** dans `docs/preuves/1.3.0/banc/` : les vrais composants rendus au serveur (`renderToString` du document entier, comme Next) puis hydratés, construits par l'esbuild de Vitest (tâche 1, complété à la tâche 18). Le spécimen garde son rôle : voir chaque pièce dans les quatre densités et les trois thèmes |
| E4 | §0.7 : réserve basse « non mesuré » | Sonde du plan sur `v1.2.0`, Chromium 141 : à 1 280 px, `--reserve-barre` vaut encore `calc(56px + 0px)` dans `CoquilleRail` **et** dans `GabaritApp`. Dans `CoquilleRail`, le rembourrage de palier (`padding: var(--espace-12) var(--espace-8)`) recouvre la variable : contenu à 48 px, **aucun défaut visible**. Dans `GabaritApp`, le contenu garde **104 px** en bas (48 + 56) : défaut visible | Le correctif s'applique aux deux (tâche 13, décision 013) ; le journal ne promet un changement à l'écran que pour `GabaritApp` avec onglets, au-delà de 768 px. La tâche 1 refait la mesure officielle |
| E5 | §5.10 : `@media (min-width: 768px) { .ai5d-coquille-rail { --reserve-barre: 0px; } }` | Ce sélecteur (0,1,0) perd contre `.ai5d-coquille-rail[data-mode='complet']` (0,2,0) qui pose la réserve : la remise à zéro ne s'appliquerait toujours pas | La remise à zéro porte le même sélecteur que la réserve (tâche 13) ; une mutation rejoue le brouillon et le test rougit |
| E6 | §5.6.2 : un texte hors écran « , 25 à traiter » après le libellé | Nom accessible calculé : « Participants **,** 25 à traiter », avec une espace avant la virgule, dans jsdom (`dom-accessibility-api`) **et** dans Chromium (arbre d'accessibilité lu par CDP le 28 septembre 2026) : un élément sorti du flux est traité en bloc | Le lien porte `aria-label="Participants, 25 à traiter"` quand il a un compteur ; la pastille reste `aria-hidden`. Le nom commence par le libellé visible (WCAG 2.5.3). `OngletsRubrique` ne pose donc pas `ai5d-hors-ecran` (tâche 8) |
| E7 | §5.9 : `Selecteur` « réagit comme `Champ` » ; `desactive` sans rendu dit | La feuille `ai5d-champ` n'a aucune règle d'état désactivé ; le Portail estompait son `<select>` à 0,6 dans sa propre feuille | Estompage en style en ligne sur le seul `<select>` désactivé (0,6, curseur `not-allowed`) : y ajouter une règle dans la feuille changerait tous les `Champ` (tâche 12). `aria-describedby` suit le Portail : l'aide n'est plus citée quand une erreur la masque |
| E8 | §5.9 : même feuille `ai5d-champ` | La feuille est une constante privée de `Champ.tsx` | `Champ.tsx` exporte `ID_STYLE_CHAMP` et `STYLE_CHAMP` (forme `const` gardée, G10) ; `Selecteur` pose la même clé et le même texte (tâche 12) |
| E9 | §5.4 : la feuille d'une règle du bandeau | `tests/composants/composants.test.tsx:782` appelle `Bandeau({…})` comme une fonction et lit `props.role` de l'élément rendu : un fragment en racine le casserait | La feuille est le premier enfant du bandeau ; React la hisse de là comme d'ailleurs (tâche 6) |
| E10 | §5.3.3 : « puis, s'il y en a, un filet et les graves » | Un menu dont toutes les actions sont graves aurait un filet en tête, qui ne sépare rien | Filet seulement quand il y a des actions des deux sortes (tâche 10) |
| E11 | §5.3.2 : un défilement ou un redimensionnement referme le menu | La phrase est écrite dans le paragraphe du repli ; avec l'ancre CSS, le menu suit son déclencheur | Écoute du défilement et du redimensionnement seulement sans ancre ; l'écart est lu dans `--espace-1` à l'exécution, jamais écrit ; le focus se pose sans faire défiler (tâche 10). Constaté dans Chromium : repli simulé, menu refermé au défilement ; ancre réelle, menu qui suit |
| E12 | §0.6 : `EnteteConsole` « employé dans 14 fichiers », `Selecteur` « 12 emplois » | Relu sur `1ef7ef2` : `EnteteConsole` rendu dans **7** fichiers de `apps/compte/app` (14 lignes qui le citent, import compris) ; `Selecteur` rendu **7** fois dans 6 fichiers. Lignes citées par la SPEC exactes (`EnteteConsole.tsx:25-34`, `:33`, `:38` ; `Selecteur.tsx:19-35`, `:21`, `:26`, `:65`) | Verdicts inchangés : les deux montent. Les nombres exacts vont dans `docs/preuves/1.3.0/compte.md` (tâche 1) et la décision 012 |
| E13 | §0.9 point 7, §11.2 : Chromium, Firefox et WebKit | Ce conteneur n'a que Chromium (Playwright 1.56.1, `/opt/pw-browsers/chromium-1194`). Le poste de Karamo avait les trois moteurs en 1.2.0 (Playwright 1.57) | La sonde du menu tente les trois ; un moteur absent s'écrit « non installé » et va dans « Ce qui n'est pas couvert », sauf si Karamo la rejoue sur son poste (tâche 18) |
| E14 | §10 : `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test` | `tests/marque.test.ts:60` ne se saute que si `GITHUB_ACTIONS` vaut `true` et que la source de la marque manque ; dans ce conteneur elle manque toujours | Bloc de la consigne : `GITHUB_ACTIONS=true` devant `typecheck` et `test`. Sur le poste de Karamo, sans la variable, le test tourne et garde la marque |
| E15 | §3.17 et §4 étape 6 : la version posée avec les documents ; §4 étape 9 : les montées d'essai dans les preuves, avant la revue | Consigne du lot : la version de `package.json` ne se pose qu'à la dernière tâche, sur accord ; et la montée d'essai du Portail est une tâche de fin | Documents à la tâche 15 **sans** la version (G17) ; montée d'essai à la tâche 20, **après** la relecture : elle éprouve le code tel qu'il sera étiqueté. Version, badge et commandes d'installation à la tâche 21 |
| E16 | §10 : « chaque garde et chaque test nouveau est vu échouer une fois » | Consigne du lot : tests écrits d'abord, commandes différées | `mutations.mjs` (tâche 17) : 22 mutations, dont quatre qui retirent un fichier nouveau, c'est-à-dire l'état d'avant l'implémentation. Rejouable tâche par tâche : `node docs/preuves/1.3.0/mutations.mjs T10` |
| E17 | §10 : « chaque composant de la liste du §0.4 rendu deux fois ne pose qu'une feuille par clé » | Au client, la feuille reste dans `document.head` après le démontage (constaté) : un second rendu ne prouverait rien pour un composant déjà rendu dans le même fichier | La preuve composant par composant se fait au serveur (`renderToString` de deux instances : une balise, les clés attendues) ; la preuve client porte sur cinq cents boutons (tâche 2) |
| E18 | §11.1 : « l'apostrophe droite du constat n° 9 » | Il y en a **deux** dans la page des spécimens : « l'accompagner » et « l'interface » | Les deux corrigées (tâche 16) |
| E19 | §5.1.2 : `OngletsRubrique` parmi les porteurs de `ai5d-hors-ecran` | Conséquence d'E6 | `ai5d-hors-ecran` reste partagé par `Bouton`, `LigneLien`, `ValeurCopiable` et `MenuActions` |

---

## Les points ouverts du §0.9, et ce que le plan en fait

1. **Classement de la version.** Tranché par Karamo : mineure, `1.3.0`. La tâche 21 le lui rappelle en
   nommant ce qui sera publié.
2. **Le survol sombre, `--surface-1`.** Livré à la tâche 4, capturé à la tâche 18 : une ligne survolée à
   côté de deux lignes sélectionnées, un menu survolé, le rail, en clair et en sombre. **Karamo le
   valide sur les captures** à la tâche 21, ou demande une autre valeur, qui devra passer les mesures du
   §0.5.
3. **`LiensRail` vers `--surface-survol`.** Tranché : migré à la tâche 5, capturé avant (tâche 1) et
   après (tâche 18). Revu sur captures à la tâche 21 ; s'il sort, la tâche 21 dit les gestes.
4. **`TableauDonnees` au Portail.** Tranché, décision 009 appliquée ; consigné dans la décision 012.
5. **Revérifications dans Compte.** Closes par la SPEC ; refaites en machine à la tâche 1 (écart E12).
6. **La réserve basse.** Sonde du plan : confirmée (écart E4). La tâche 1 refait la mesure ; la tâche 13
   s'applique si elle la confirme, se réduit à consigner sinon.
7. **Les moteurs.** Chromium seul dans ce conteneur (écart E13) ; Firefox, WebKit et Safari vont dans
   « Ce qui n'est pas couvert » sauf si Karamo les joue.
8. **L'étiquette `v1.3.0`.** Posée et poussée **seulement sur l'accord explicite de Karamo**, tâche 21.

---

## Structure des fichiers

| Fichier | Responsabilité | Tâche |
| ------- | -------------- | ----- |
| `docs/preuves/1.3.0/banc/` (`pages.tsx`, `serveur.tsx`, `client.tsx`, `.gitignore`), `banc.mjs`, `sonde-banc.cjs` | Le banc d'essai rendu par React, et ses mesures | 1, 18 |
| `docs/preuves/1.3.0/compte.md`, `feuilles.md`, `reserve-basse.md` | Revérification de Compte, mesures avant puis après | 1, 18 |
| `noyau/composants/feuille.ts` | `feuille(id, css)`, `PRECEDENCE_FEUILLES` | 2 |
| Les 21 fichiers du §0.4, `docs/preuves/1.3.0/migrer-feuilles.mjs` | Les feuilles hissées, par une migration rejouable | 2 |
| `tests/aides/feuille.ts`, `tests/feuilles.test.tsx`, sept fichiers de tests migrés | `texteFeuille`, une feuille par composant au client et au serveur | 2 |
| `gardes/index.ts`, `gardes/gardes.test.ts` | Garde 7, `verifierFeuilleUnique` | 3 |
| `noyau/jetons.css`, `_build/figer-1.2.0.mjs`, `tests/instantanes/jetons-1.2.0.json`, `EnteteRubrique-1.2.0.tsx` | `--surface-survol` ; l'instantané de la 1.2.0 | 4 |
| `tests/jetons.test.ts`, `tests/non-regression.test.ts` | Quatre couples de plus, le témoin `--attention`, la non-régression de la 1.2.0 | 4 |
| `noyau/composants/LiensRail.tsx`, `LigneLien.tsx` | Survol par jeton ; commentaire | 5 |
| `noyau/composants/Bandeau.tsx` | `onFermer`, `libelleFermer`, `ref` | 6 |
| `noyau/composants/EnteteRubrique.tsx` | `action`, `ProprietesEnteteRubrique` | 7 |
| `noyau/composants/OngletsRubrique.tsx` | `compteur`, `libelleCompteur` | 8 |
| `noyau/composants/Chiffre.tsx`, `Squelette.tsx` | `Chiffre` compact, `SqueletteIndicateurs compact` | 9 |
| `noyau/composants/MenuActions.tsx` | Composant nouveau, client | 10 |
| `noyau/composants/EnteteObjet.tsx` | Composant nouveau, serveur | 11 |
| `noyau/composants/Selecteur.tsx`, `Champ.tsx` | Composant nouveau, client ; la feuille des champs exportée | 12 |
| `noyau/composants/CoquilleRail.tsx`, `GabaritApp.tsx` | La réserve basse dans la feuille | 13 |
| `noyau/composants/index.ts`, `tests/index.test.ts` | Quarante-deux composants, leurs types, `PRECEDENCE_FEUILLES` | 2, 14 |
| `CHANGELOG.md`, `README.md`, `noyau/NOYAU.md`, `noyau/formulations.md` | Documents, sans la version | 15 |
| `docs/decisions/010` à `013` | Les arbitrages | 3, 4, 13, 15 |
| `_build/generer-specimens.mjs`, `specimens/composants.html` | La preuve visuelle | 16 |
| `docs/preuves/1.3.0/mutations.mjs`, `verification.md` | Le bloc, et chaque test vu échouer | 17 |
| `docs/preuves/1.3.0/sonde-menu.cjs`, `captures.cjs`, `menu-navigateurs.md`, `captures.md`, captures, `README.md` | La recette au navigateur, ce qui n'est pas couvert | 18 |
| `docs/preuves/1.3.0/relecture.md` | La relecture | 19 |
| `docs/preuves/1.3.0/montee-portail.md`, `montee-compte.md`, `montee-sdk.md` | Les montées d'essai | 20 |
| `package.json`, `README.md`, `CHANGELOG.md` | La version, sur accord | 21 |

---

## Ordre des tâches

```
T1   suivi · revérification de Compte · banc d'essai · mesures « avant »   (aucun code du produit)
T2   feuille.ts · les 21 composants · 52 lectures de tests migrées     ← premier code : tout en dépend
T3   garde 7 · décision 010
T4   --surface-survol · instantané 1.2.0 · contrastes · décision 011     ← T5, T7, T10 en dépendent
T5   LiensRail au jeton · commentaire de LigneLien
T6   Bandeau qui se ferme                                              ← §4, étape 3 : extensions
T7   EnteteRubrique et son action
T8   compteur d'onglet
T9   Chiffre compact · SqueletteIndicateurs compact
T10  MenuActions                                                        ← §4, étape 4 : composants
T11  EnteteObjet                                                        ← consomme TitreSection, Chiffre (T9)
T12  Selecteur
T13  réserve basse, si T1 la confirme · décision 013                    ← §4, étape 5
T14  index                                                              ← après tous les composants
T15  NOYAU · README · formulations · CHANGELOG · décision 012 (sans la version)
T16  spécimens                                                          ← après les feuilles définitives
T17  VÉRIFICATION D'UN BLOC · chaque test vu échouer
T18  recette au navigateur · mesures « après » · captures · preuves · leçons
T19  relecture contre la SPEC
T20  montée d'essai dans le Portail, puis Compte et le SDK
T21  version 1.3.0 et étiquette, SUR ACCORD EXPLICITE DE KARAMO
```

---

### Task 1 : Le suivi, la revérification de Compte, le banc d'essai et les mesures « avant »

Aucun code du produit. Cette tâche pose la section du lot dans `tasks/todo.md`, refait en machine les
deux constats dans Compte (SPEC §15, « Ouverture »), construit le banc d'essai (écart E3) et mesure,
**avant** toute correction, les feuilles, la réserve basse et le survol du rail (SPEC §4, étape 0).

**Files:**
- Modify: `tasks/todo.md` (section ajoutée en fin de fichier)
- Create: `docs/preuves/1.3.0/compte.md`
- Create: `docs/preuves/1.3.0/banc/pages.tsx`, `docs/preuves/1.3.0/banc/serveur.tsx`, `docs/preuves/1.3.0/banc/client.tsx`, `docs/preuves/1.3.0/banc/.gitignore`
- Create: `docs/preuves/1.3.0/banc.mjs`, `docs/preuves/1.3.0/sonde-banc.cjs`
- Create (mesure) : `docs/preuves/1.3.0/sonde-banc-avant.txt`, `feuilles.md`, `reserve-basse.md`, `survol-rail-avant-clair.png`, `survol-rail-avant-sombre.png`

**Interfaces:**
- Consumes : `noyau/composants` tel qu'il est en `1.2.0` (`Bouton`, `Champ`, `CoquilleRail`,
  `GabaritApp`, `LiensRail`) ; Playwright global (`npm root -g`) ; esbuild résolu depuis `vitest`.
- Produces : `docs/preuves/1.3.0/banc.mjs`, qui écrit `docs/preuves/1.3.0/banc/genere/{section}.html`
  et `client.js` pour les sections `feuilles`, `feuilles-client`, `reserve-coquille`, `reserve-app`,
  `rail` ; `sonde-banc.cjs {moment}`, relancé tel quel à la tâche 18 avec `apres`. La tâche 18 ajoute
  les sections `menu` et `survol` à `pages.tsx`.

- [ ] **Step 1 : ajouter la section du lot à `tasks/todo.md`**

Ajouter en fin de fichier :

```markdown
## Version 1.3.0 · ce qui manque au système pour la console · 28 septembre 2026

SPEC et user stories : `docs/superpowers/specs/version-1.3.0-console/`. Plan :
`docs/superpowers/plans/2026-09-28-version-1-3-0-console.md`. Chaque tâche écrit son test d'abord et
se coche « écrite, non testée » ; la tâche 17 vérifie tout d'un bloc et voit chaque test échouer.

- [ ] T1 · Le suivi, la revérification de Compte, le banc d'essai, les mesures « avant »
- [ ] T2 · Les feuilles hissées : `feuille.ts`, les 21 composants, `texteFeuille`, 52 lectures migrées
- [ ] T3 · La garde `verifierFeuilleUnique`, décision 010
- [ ] T4 · `--surface-survol`, l'instantané de la 1.2.0, les contrastes, décision 011
- [ ] T5 · `LiensRail` au jeton de survol, commentaire de `LigneLien`
- [ ] T6 · `Bandeau` qui se ferme et reçoit le focus
- [ ] T7 · `EnteteRubrique` et son action
- [ ] T8 · Le compteur d'onglet
- [ ] T9 · `Chiffre` compact et `SqueletteIndicateurs compact`
- [ ] T10 · `MenuActions`
- [ ] T11 · `EnteteObjet`
- [ ] T12 · `Selecteur`
- [ ] T13 · La réserve basse dans la feuille, décision 013
- [ ] T14 · L'index
- [ ] T15 · Journal, guide de montée, README, NOYAU, formulations, décision 012, sans la version
- [ ] T16 · Les spécimens
- [ ] T17 · Vérification d'un bloc, chaque test vu échouer
- [ ] T18 · Recette au navigateur, mesures « après », captures, preuves, leçons
- [ ] T19 · Relecture du lot contre la SPEC
- [ ] T20 · Montée d'essai dans le Portail, puis Compte et le SDK
- [ ] T21 · Points du §0.9 revus par Karamo, accord explicite, version 1.3.0, étiquette `v1.3.0` et poussée
```

- [ ] **Step 2 : revérifier Compte, fichier et ligne, et l'écrire dans `docs/preuves/1.3.0/compte.md`**

Compte se lit, il ne se modifie pas. Si son dossier est absent du poste, la ligne va dans « Ce qui
n'est pas couvert » et le verdict reste celui de la SPEC.

````bash
COMPTE=/home/user/ai5d-platform   # sur le poste de Karamo : son dossier de ai5d-platform (écart E1)
{
  echo '# La revérification dans Compte'
  echo
  echo "SPEC 1.3.0, §0.6, pièces 5 et 13. Compte au commit \`$(git -C "$COMPTE" rev-parse --short HEAD)\`, relu le $(date '+%d/%m/%Y')."
  echo
  echo '## EnteteConsole'
  echo
  echo '```'
  grep -n "export function EnteteConsole\|filDAriane\|aria-label=\"Fil\|aria-current\|action?:\|{action}" "$COMPTE/apps/compte/components/EnteteConsole.tsx"
  echo "fichiers de apps/compte/app qui le rendent : $(grep -rl "<EnteteConsole" "$COMPTE/apps/compte/app" --include=*.tsx | wc -l)"
  echo '```'
  echo
  echo '## Selecteur'
  echo
  echo '```'
  grep -n "export function Selecteur\|libelleMasque\|invite\|<select" "$COMPTE/apps/compte/components/Selecteur.tsx"
  echo "rendus dans apps/compte : $(grep -rn '<Selecteur$\|<Selecteur ' "$COMPTE/apps/compte" --include=*.tsx | grep -v node_modules | wc -l)"
  echo '```'
} > docs/preuves/1.3.0/compte.md
````

Attendu, constaté au plan sur `1ef7ef2` : `EnteteConsole.tsx:25` (la fonction), `:31` (`filDAriane`),
`:33` (l'action), `:38` (`nav aria-label="Fil d’Ariane"`), `:57` (`aria-current="page"`), rendu dans
7 fichiers ; `Selecteur.tsx:19` (la fonction), `:21` (`libelleMasque`), `:26` (`invite`), `:65`
(`<select`), 7 rendus. Ajouter sous la sortie une section `## Verdicts` : « `EnteteObjet` monte :
Compte pose un titre, un fil nommé et une action unique à droite, sur sept écrans. `Selecteur` monte :
Compte en rend sept, sur un `<select>` natif. Les nombres de la SPEC (« 14 fichiers », « 12 emplois »)
comptaient des lignes ; les verdicts ne changent pas (plan, écart E12). »

- [ ] **Step 3 : écrire le banc d'essai, `docs/preuves/1.3.0/banc/pages.tsx`**

```tsx
/**
 * Le banc d'essai de la 1.3.0 : les composants du système rendus par React, au serveur puis au
 * navigateur, comme un produit les rend.
 *
 * Les spécimens sont une page statique qui reproduit le balisage sans React : ils ne peuvent montrer
 * ni une feuille hissée, ni un style en ligne posé par un composant, ni un menu qui s'ouvre au
 * clavier (plan, écart E3). Construit par `docs/preuves/1.3.0/banc.mjs`, mesuré par
 * `sonde-banc.cjs`. Hors de `tsconfig.json`, d'ESLint et de Prettier, comme tout `docs/` : ce n'est
 * pas du code du produit, et il n'importe que ce que le produit importerait.
 */
import type { ReactNode } from 'react';
import { BookOpen, Home, Shield, User } from 'lucide-react';
import {
  Bouton,
  Champ,
  CoquilleRail,
  GabaritApp,
  LiensRail,
} from '../../../../noyau/composants';

export type Section = 'feuilles' | 'feuilles-client' | 'reserve-coquille' | 'reserve-app' | 'rail';

export const SECTIONS: readonly Section[] = [
  'feuilles',
  'feuilles-client',
  'reserve-coquille',
  'reserve-app',
  'rail',
];

/** Cinq cents boutons et un champ : la table de la console, réduite à ce qui compte. */
function CinqCents() {
  return (
    <div data-banc="cinq-cents">
      {Array.from({ length: 500 }, (_, i) => (
        <Bouton key={i} variante="discret" taille="sm">
          {`Ligne ${i + 1}`}
        </Bouton>
      ))}
      <Champ libelle="Rechercher une personne" />
    </div>
  );
}

/** La coquille en mode complet, avec sa barre basse : la réserve se mesure à 390 et à 1 280 px. */
function ReserveCoquille() {
  return (
    <CoquilleRail
      produit="Portail"
      navigationRail={<nav aria-label="Rubriques">rail</nav>}
      navigationBarre={<nav aria-label="Barre">barre</nav>}
      rechargerAuRetour={false}
    >
      <p>Un contenu court.</p>
    </CoquilleRail>
  );
}

function ReserveApp() {
  return (
    <GabaritApp
      produit="Compte"
      onglets={[
        { id: 'accueil', libelle: 'Accueil', icone: Home },
        { id: 'profil', libelle: 'Profil', icone: User },
        { id: 'securite', libelle: 'Sécurité', icone: Shield },
      ]}
      actif="accueil"
    >
      <p>Un contenu court.</p>
    </GabaritApp>
  );
}

/** Le rail sur sa surface, la rubrique active et deux autres : le survol se capture ici. */
function Rail() {
  return (
    <div
      data-banc="rail"
      style={{
        width: '17.5rem',
        padding: 'var(--espace-4) var(--espace-3)',
        background: 'var(--surface-2)',
        borderRight: '1px solid var(--bordure)',
      }}
    >
      <LiensRail
        etiquette="Rubriques"
        actif="formations"
        rubriques={[
          { id: 'accueil', libelle: 'Accueil', icone: Home, href: '#accueil' },
          { id: 'formations', libelle: 'Formations', icone: BookOpen, href: '#formations' },
          { id: 'securite', libelle: 'Sécurité', icone: Shield, href: '#securite' },
        ]}
      />
    </div>
  );
}

export function Contenu({ section }: { section: Section }): ReactNode {
  if (section === 'feuilles' || section === 'feuilles-client') return <CinqCents />;
  if (section === 'reserve-coquille') return <ReserveCoquille />;
  if (section === 'reserve-app') return <ReserveApp />;
  return <Rail />;
}

/** Le document entier, comme Next le rend : les feuilles hissées vont dans ce `<head>`. */
export function Page({ section }: { section: Section }) {
  return (
    <html lang="fr" data-densite="equilibre" data-section={section}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`Banc 1.3.0 · ${section}`}</title>
        <link rel="stylesheet" href="../../../../../noyau/ai5d.preset.css" />
      </head>
      <body
        style={{
          margin: 0,
          background: 'var(--surface-1)',
          color: 'var(--texte)',
          fontFamily: 'var(--police-corps)',
        }}
      >
        <div id="racine">{section === 'feuilles-client' ? null : <Contenu section={section} />}</div>
        <script src="client.js" />
      </body>
    </html>
  );
}
```

- [ ] **Step 4 : écrire `docs/preuves/1.3.0/banc/serveur.tsx`, `client.tsx` et `.gitignore`**

`docs/preuves/1.3.0/banc/serveur.tsx` :

```tsx
/**
 * Le rendu serveur du banc : chaque section écrite en HTML, comme Next l'enverrait. La page
 * `feuilles-client` n'a pas de rendu serveur : son client monte les cinq cents boutons seul.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { Page, SECTIONS } from './pages';

const DOSSIER = 'docs/preuves/1.3.0/banc/genere';
mkdirSync(DOSSIER, { recursive: true });

for (const section of SECTIONS) {
  const html = `<!doctype html>${renderToString(<Page section={section} />)}`;
  writeFileSync(`${DOSSIER}/${section}.html`, html);
  console.log(`${section}.html · balises <style au serveur : ${(html.match(/<style/g) ?? []).length}`);
}
```

`docs/preuves/1.3.0/banc/client.tsx` :

```tsx
/** L'hydratation du banc, ou le rendu client seul pour `feuilles-client`. */
import { createRoot, hydrateRoot } from 'react-dom/client';
import { Contenu, Page, type Section } from './pages';

const section = document.documentElement.dataset.section as Section;

if (section === 'feuilles-client') {
  const racine = document.getElementById('racine');
  if (racine !== null) createRoot(racine).render(<Contenu section={section} />);
} else {
  hydrateRoot(document, <Page section={section} />, {
    onRecoverableError: (erreur) => console.error(`HYDRATATION ${String(erreur)}`),
  });
}
```

`docs/preuves/1.3.0/banc/.gitignore` :

```gitignore
# Les pages et les paquets du banc se reconstruisent par `node docs/preuves/1.3.0/banc.mjs`.
genere/
```

- [ ] **Step 5 : écrire `docs/preuves/1.3.0/banc.mjs`**

```js
/**
 * Construit le banc d'essai de la 1.3.0 et en écrit les pages, sans dépendance ajoutée.
 *
 * esbuild est celui que Vite apporte à Vitest, résolu depuis eux : le dépôt n'en déclare aucun. Deux
 * paquets : le rendu serveur (Node), exécuté aussitôt pour écrire les pages, et le client
 * (navigateur), qui les hydrate. Les pages s'ouvrent ensuite dans Chromium par `sonde-banc.cjs`.
 *
 *   node docs/preuves/1.3.0/banc.mjs
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const BANC = 'docs/preuves/1.3.0/banc';
const DOSSIER = `${BANC}/genere`;

const depuisDepot = createRequire(`${process.cwd()}/`);
const vite = createRequire(depuisDepot.resolve('vitest')).resolve('vite');
const { build, version } = await import(pathToFileURL(createRequire(vite).resolve('esbuild')).href);
console.log(`esbuild ${version}, celui de Vite, lui-même celui de Vitest`);

const communs = {
  bundle: true,
  jsx: 'automatic',
  logLevel: 'warning',
  define: { 'process.env.NODE_ENV': '"production"' },
};

await build({
  ...communs,
  entryPoints: [`${BANC}/serveur.tsx`],
  outfile: `${DOSSIER}/serveur.mjs`,
  platform: 'node',
  format: 'esm',
  packages: 'external',
});
await build({
  ...communs,
  entryPoints: [`${BANC}/client.tsx`],
  outfile: `${DOSSIER}/client.js`,
  platform: 'browser',
  format: 'iife',
});

await import(pathToFileURL(`${process.cwd()}/${DOSSIER}/serveur.mjs`).href);
```

- [ ] **Step 6 (génération) : construire le banc sur la 1.2.0**

```bash
node docs/preuves/1.3.0/banc.mjs
```

Attendu, constaté au plan :

```
esbuild 0.21.5, celui de Vite, lui-même celui de Vitest
feuilles.html · balises <style au serveur : 501
feuilles-client.html · balises <style au serveur : 0
reserve-coquille.html · balises <style au serveur : 1
reserve-app.html · balises <style au serveur : 3
rail.html · balises <style au serveur : 1
```

Si esbuild ne se résout pas (Vitest monté de version, arbre de `node_modules` changé), s'arrêter et le
dire à Karamo : rien ne s'installe dans le dépôt.

- [ ] **Step 7 : écrire `docs/preuves/1.3.0/sonde-banc.cjs`**

```js
/**
 * Les mesures du banc d'essai dans Chromium (SPEC 1.3.0, §11.2) : les feuilles, la réserve basse, et
 * le survol du rail capturé en clair et en sombre. Lancé une fois sur la 1.2.0 (tâche 1, « avant »),
 * une fois sur le lot (tâche 18, « apres ») : le même script, les mêmes pages.
 *
 *   node docs/preuves/1.3.0/banc.mjs
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/sonde-banc.cjs avant
 *
 * Il n'ajoute aucune dépendance au dépôt : il emploie le Playwright installé sur le poste.
 */
const { chromium } = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const MOMENT = process.argv[2] ?? 'sans-nom';
const DOSSIER = 'docs/preuves/1.3.0';
const adresse = (section) =>
  pathToFileURL(resolve(`${DOSSIER}/banc/genere/${section}.html`)).href;

async function ouvrir(navigateur, section, largeur, theme) {
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: 900 } });
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('console', (message) => {
    if (message.type() === 'error') erreurs.push(message.text());
  });
  page.on('pageerror', (erreur) => erreurs.push(erreur.message));
  await page.goto(adresse(section), { waitUntil: 'load' });
  if (theme !== undefined) {
    await page.evaluate((valeur) => document.documentElement.setAttribute('data-theme', valeur), theme);
  }
  await page.waitForTimeout(400);
  return { contexte, page, erreurs };
}

/** Toutes les balises de feuille du document, où elles sont, et sous quelle clé. */
function compterFeuilles() {
  const toutes = [...document.querySelectorAll('style')];
  const ids = toutes.map((balise) => balise.id).filter((id) => id !== '');
  return {
    total: toutes.length,
    dansHead: document.head.querySelectorAll('style').length,
    dansBody: document.body.querySelectorAll('style').length,
    identifiants: [...new Set(ids)],
    identifiantsDupliques: ids.length - new Set(ids).size,
    dataHref: toutes.map((balise) => balise.getAttribute('data-href')).filter((cle) => cle !== null),
    boutons: document.querySelectorAll('.ai5d-bouton').length,
  };
}

function mesurerReserve([racine, contenu]) {
  const elementRacine = document.querySelector(racine);
  const elementContenu = document.querySelector(contenu);
  return {
    reserveBarre: getComputedStyle(elementRacine).getPropertyValue('--reserve-barre').trim(),
    styleEnLigne: elementRacine.getAttribute('style'),
    paddingBottomContenu: getComputedStyle(elementContenu).paddingBottom,
  };
}

(async () => {
  const navigateur = await chromium.launch();
  console.log(`Banc 1.3.0 · ${MOMENT} · Chromium ${navigateur.version()}`);

  console.log('\n## Feuilles, 500 boutons et un champ');
  for (const section of ['feuilles', 'feuilles-client']) {
    const { contexte, page, erreurs } = await ouvrir(navigateur, section, 1280);
    console.log(`\n${section} (${section === 'feuilles' ? 'rendu serveur puis hydratation' : 'rendu client seul'})`);
    console.log(JSON.stringify(await page.evaluate(compterFeuilles)));
    console.log(`erreurs de console : ${erreurs.length === 0 ? 'aucune' : erreurs.join(' | ')}`);
    await contexte.close();
  }

  console.log('\n## Réserve basse');
  for (const [section, selecteurs] of [
    ['reserve-coquille', ['.ai5d-coquille-rail', '.ai5d-coquille-rail__contenu']],
    ['reserve-app', ['.ai5d-app', '.ai5d-app__contenu']],
  ]) {
    for (const largeur of [390, 1280]) {
      const { contexte, page, erreurs } = await ouvrir(navigateur, section, largeur);
      console.log(`\n${section} · ${largeur} px`);
      console.log(JSON.stringify(await page.evaluate(mesurerReserve, selecteurs)));
      console.log(`erreurs de console : ${erreurs.length === 0 ? 'aucune' : erreurs.join(' | ')}`);
      await contexte.close();
    }
  }

  console.log('\n## Le rail survolé');
  for (const theme of ['light', 'dark']) {
    const { contexte, page, erreurs } = await ouvrir(navigateur, 'rail', 1280, theme);
    const lien = page.getByRole('link', { name: 'Sécurité' });
    await lien.hover();
    await page.waitForTimeout(300);
    const fonds = await page.evaluate(() =>
      [...document.querySelectorAll('.ai5d-liens-rail__lien')].map(
        (element) => `${element.textContent} : ${getComputedStyle(element).backgroundColor}`,
      ),
    );
    const fichier = `survol-rail-${MOMENT}-${theme === 'light' ? 'clair' : 'sombre'}.png`;
    await page.locator('[data-banc="rail"]').screenshot({ path: `${DOSSIER}/${fichier}` });
    console.log(`\n${fichier} · « Sécurité » survolé, « Formations » actif`);
    console.log(fonds.join('\n'));
    console.log(`erreurs de console : ${erreurs.length === 0 ? 'aucune' : erreurs.join(' | ')}`);
    await contexte.close();
  }

  await navigateur.close();
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
```

- [ ] **Step 8 (mesure) : les mesures « avant », recopiées brutes**

Depuis la racine du dépôt, **avant** toute modification de `noyau/`. Si Playwright manque au poste
(`NODE_PATH="$(npm root -g)" node -e "require('playwright')"` échoue), s'arrêter et le dire à Karamo.

````bash
NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/sonde-banc.cjs avant > docs/preuves/1.3.0/sonde-banc-avant.txt 2>&1
{
  echo '# Une feuille par composant : le compte des balises'
  echo
  echo 'SPEC 1.3.0, §0.4, §5.1, §11.2. Le banc d'"'"'essai rend cinq cents `Bouton` et un `Champ` par React,'
  echo 'au serveur puis hydratés (`feuilles`), ou au client seul (`feuilles-client`), et les ouvre dans Chromium.'
  echo
  echo "## Avant · 1.2.0 · commit \`$(git rev-parse --short HEAD)\`, $(date '+%d/%m/%Y %H:%M')"
  echo
  echo '```'
  sed -n '1p;/^## Feuilles/,/^## Réserve/p' docs/preuves/1.3.0/sonde-banc-avant.txt | sed '$d'
  echo '```'
} > docs/preuves/1.3.0/feuilles.md
{
  echo '# La réserve basse'
  echo
  echo 'SPEC 1.3.0, §0.7, §5.10. Dans Chromium, `CoquilleRail` en mode `complet` et `GabaritApp` avec trois'
  echo 'onglets, à 390 puis à 1 280 px : la valeur calculée de `--reserve-barre` sur la racine, le style en'
  echo 'ligne de la racine, et le rembourrage bas du contenu.'
  echo
  echo "## Avant · 1.2.0 · commit \`$(git rev-parse --short HEAD)\`, $(date '+%d/%m/%Y %H:%M')"
  echo
  echo '```'
  sed -n '1p;/^## Réserve/,/^## Le rail/p' docs/preuves/1.3.0/sonde-banc-avant.txt | sed '$d'
  echo '```'
} > docs/preuves/1.3.0/reserve-basse.md
````

Attendu, constaté au plan sur `v1.2.0` :

| Mesure | Valeur |
| ------ | ------ |
| `feuilles` et `feuilles-client` | `total` 501, `dansHead` 0, `dansBody` 501, `identifiants` `["ai5d-bouton","ai5d-champ"]`, `identifiantsDupliques` 499, aucune erreur de console |
| `reserve-coquille` · 390 px | `reserveBarre` `calc(56px + 0px)`, `paddingBottomContenu` 88px |
| `reserve-coquille` · 1 280 px | `reserveBarre` `calc(56px + 0px)`, `paddingBottomContenu` 48px |
| `reserve-app` · 390 px | `calc(56px + 0px)`, 104px |
| `reserve-app` · 1 280 px | `calc(56px + 0px)`, **104px** |
| Rail en sombre | « Formations » (actif) et « Sécurité » (survolé) au **même** fond, `rgb(23, 44, 59)` |

Puis ajouter à la main, sous le bloc de `reserve-basse.md`, une section `## Lecture` : « À 1 280 px, la
réserve vaut encore la hauteur de la barre dans les deux coquilles : le constat du §0.7 est confirmé.
`CoquilleRail` ne le montre pas, son rembourrage de palier recouvrant la variable ; `GabaritApp` le
montre, 56 px de trop sous le contenu. La tâche 13 s'applique. » Si la mesure dit `0px` à 1 280 px,
écrire au contraire que le constat est infirmé : la tâche 13 se réduira à le consigner.

- [ ] **Step 9 : cocher et commiter**

Dans `tasks/todo.md`, remplacer `- [ ] T1 · Le suivi, la revérification de Compte, le banc d'essai, les mesures « avant »`
par `- [x] T1 · Le suivi, la revérification de Compte, le banc d'essai, les mesures « avant » · fait`.

```bash
git add tasks/todo.md docs/superpowers/plans/2026-09-28-version-1-3-0-console.md docs/preuves/1.3.0
git status --short docs/preuves/1.3.0   # aucun fichier de banc/genere/ : le .gitignore les écarte
cat > .git/message-1.3.0.txt <<'MESSAGE'
Le suivi de la version 1.3.0, son plan, Compte revérifié, et le banc d’essai qui mesure les feuilles et la réserve basse avant correctif
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 2 : Les feuilles hissées

Le premier code du lot (SPEC §4, étape 1 ; §5.1). Toute feuille passe par `feuille(id, css)` ; les 21
fichiers du §0.4 la rendent ; la balise anonyme de `GabaritApp` rejoint `STYLE_APP` ; chaque test qui
lisait une feuille dans son conteneur ou par son `id` la lit dans `document.head` (écart E2).

**Files:**
- Create: `tests/aides/feuille.ts`
- Create: `tests/feuilles.test.tsx`
- Create: `noyau/composants/feuille.ts`
- Create: `docs/preuves/1.3.0/migrer-feuilles.mjs`
- Modify (migration) : `noyau/composants/` `BarreOnglets`, `BoiteConfirmation`, `BoiteMotif`, `Bouton`, `CarteAction`, `Champ`, `CoquilleRail`, `GabaritApp`, `GabaritAuth`, `GabaritDocument`, `GabaritSeuil`, `GrilleCartes`, `LiensRail`, `LigneLien`, `ListeDefinitions`, `ListeLignes`, `OngletsRubrique`, `SelecteurTheme`, `SigneAnime`, `Squelette`, `ValeurCopiable` (`.tsx`)
- Modify (migration) : `tests/composants/` `composants`, `mobile`, `onglets-rubrique`, `grille-cartes`, `valeur-copiable`, `bouton-lien`, `liste-definitions` (`.test.tsx`)
- Modify: `noyau/composants/index.ts` (l'export de `PRECEDENCE_FEUILLES`)

**Interfaces:**
- Consumes : `createElement` de React 19 ; les constantes `ID_STYLE…` et `STYLE_…` des composants,
  inchangées (G10).
- Produces :
  - `noyau/composants/feuille.ts` : `export const PRECEDENCE_FEUILLES = 'ai5d'` et
    `export function feuille(id: string, css: string): ReactElement`.
  - `tests/aides/feuille.ts` : `export function texteFeuille(id: string): string`, qui lève si la
    feuille n'est pas exactement une fois dans `document.head`.
  - `noyau/composants/index.ts` : `PRECEDENCE_FEUILLES` exporté ; `feuille` ne l'est pas.

- [ ] **Step 1 : écrire l'aide `tests/aides/feuille.ts` (le test d'abord)**

```ts
/**
 * La feuille hissée d'un composant, lue où React la pose : dans `document.head` (décision 010).
 */
export function texteFeuille(id: string): string {
  const balises = document.head.querySelectorAll<HTMLStyleElement>(`style[data-href~="${id}"]`);
  if (balises.length !== 1) {
    throw new Error(
      `La feuille ${id} est posée ${balises.length} fois dans document.head ; attendu : une fois.`,
    );
  }
  return balises[0]?.textContent ?? '';
}
```

- [ ] **Step 2 : écrire `tests/feuilles.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { Home, Shield, User } from 'lucide-react';
import {
  BarreOnglets,
  BoiteConfirmation,
  BoiteMotif,
  Bouton,
  CarteAction,
  Champ,
  CoquilleRail,
  GabaritApp,
  GabaritAuth,
  GabaritDocument,
  GabaritSeuil,
  GrilleCartes,
  LiensRail,
  LigneLien,
  ListeDefinitions,
  ListeLignes,
  OngletsRubrique,
  PRECEDENCE_FEUILLES,
  SelecteurTheme,
  SigneAnime,
  Squelette,
  ValeurCopiable,
} from '../noyau/composants';
import { texteFeuille } from './aides/feuille';

/**
 * UNE FEUILLE PAR COMPOSANT, QUEL QUE SOIT LE NOMBRE D INSTANCES (SPEC 1.3.0, §5.1, décision 010).
 *
 * Jusqu à la 1.2.0, chaque instance posait sa propre balise `<style id>` devant elle : cinq cents
 * boutons, cinq cents feuilles et autant d identifiants dupliqués (mesuré le 28 septembre 2026). React
 * 19 hisse et déduplique toute balise qui porte `href` et `precedence`. Ce fichier le prouve au client
 * (jsdom) et au serveur ; le navigateur le confirme sur le banc d essai (docs/preuves/1.3.0/).
 */

const RIEN = () => undefined;

const DOCUMENT = {
  surtitre: 'Protection des données',
  titre: 'Politique de confidentialité',
  sousTitre: 'En vigueur au 28 septembre 2026',
  version: null,
  sections: [],
} as const;

/** Chaque composant qui pose une feuille, et les clés qu il doit poser. */
const CAS: Array<{ nom: string; cles: string[]; element: ReactElement }> = [
  {
    nom: 'BarreOnglets',
    cles: ['ai5d-barre-onglets'],
    element: (
      <BarreOnglets
        onglets={[
          { id: 'a', libelle: 'Accueil', icone: Home },
          { id: 'b', libelle: 'Profil', icone: User },
          { id: 'c', libelle: 'Sécurité', icone: Shield },
        ]}
        actif="a"
      />
    ),
  },
  {
    nom: 'BoiteConfirmation',
    cles: ['ai5d-boite', 'ai5d-bouton'],
    element: (
      <BoiteConfirmation
        phrase="Retirer Aïssatou Camara de la session ?"
        action="Retirer"
        enCours={false}
        onAnnuler={RIEN}
        onConfirmer={RIEN}
      />
    ),
  },
  {
    nom: 'BoiteMotif',
    cles: ['ai5d-boite', 'ai5d-bouton', 'ai5d-champ'],
    element: (
      <BoiteMotif
        phrase="Révoquer l’attestation AI5D-2026-7K3F9Q ?"
        consequence="La page de vérification dira qu’elle est révoquée."
        libelleChamp="Motif"
        action="Révoquer"
        longueurMinimale={10}
        enCours={false}
        onAnnuler={RIEN}
        onValider={RIEN}
      />
    ),
  },
  { nom: 'Bouton', cles: ['ai5d-bouton'], element: <Bouton>Inviter</Bouton> },
  {
    nom: 'Bouton en lien vers un nouvel onglet',
    cles: ['ai5d-bouton', 'ai5d-hors-ecran'],
    element: (
      <Bouton href="https://exemple.invalid" target="_blank">
        Voir la page de vérification
      </Bouton>
    ),
  },
  {
    nom: 'CarteAction',
    cles: ['ai5d-carte-action'],
    element: <CarteAction icone={Shield} titre="Sécurité" action="Gérer" href="/securite" />,
  },
  { nom: 'Champ', cles: ['ai5d-champ'], element: <Champ libelle="Adresse" /> },
  {
    nom: 'CoquilleRail',
    cles: ['ai5d-coquille-rail'],
    element: (
      <CoquilleRail
        produit="Portail"
        navigationRail={<nav aria-label="Rubriques">rail</nav>}
        navigationBarre={<nav aria-label="Barre">barre</nav>}
        rechargerAuRetour={false}
      >
        <p>Contenu</p>
      </CoquilleRail>
    ),
  },
  {
    nom: 'GabaritApp',
    cles: ['ai5d-gabarit-app'],
    element: (
      <GabaritApp produit="Compte">
        <p>Contenu</p>
      </GabaritApp>
    ),
  },
  {
    nom: 'GabaritAuth',
    cles: ['ai5d-gabarit-auth'],
    element: (
      <GabaritAuth produit="Compte">
        <p>Contenu</p>
      </GabaritAuth>
    ),
  },
  {
    nom: 'GabaritDocument',
    cles: ['ai5d-gabarit-document'],
    element: <GabaritDocument document={DOCUMENT} pied={null} accueil="/" />,
  },
  {
    nom: 'GabaritSeuil',
    cles: ['ai5d-gabarit-seuil', 'ai5d-signe-anime'],
    element: <GabaritSeuil marque={<span>AI5D</span>} phrase="Nous préparons votre espace." />,
  },
  {
    nom: 'GrilleCartes',
    cles: ['ai5d-grille-cartes'],
    element: (
      <GrilleCartes>
        <p>Une carte</p>
      </GrilleCartes>
    ),
  },
  {
    nom: 'LiensRail',
    cles: ['ai5d-liens-rail'],
    element: (
      <LiensRail
        rubriques={[{ id: 'accueil', libelle: 'Accueil', icone: Home, href: '/' }]}
        actif="accueil"
        etiquette="Rubriques"
      />
    ),
  },
  {
    nom: 'LigneLien externe',
    cles: ['ai5d-ligne-lien', 'ai5d-hors-ecran'],
    element: <LigneLien href="https://exemple.invalid" titre="Rejoindre la session" externe />,
  },
  {
    nom: 'ListeDefinitions',
    cles: ['ai5d-definitions'],
    element: <ListeDefinitions elements={[{ libelle: 'Numéro', valeur: 'AI5D-2026-7K3F9Q' }]} />,
  },
  {
    nom: 'ListeLignes',
    cles: ['ai5d-liste-lignes'],
    element: (
      <ListeLignes>
        <span>Une ligne</span>
      </ListeLignes>
    ),
  },
  {
    nom: 'OngletsRubrique',
    cles: ['ai5d-onglets-rubrique'],
    element: (
      <OngletsRubrique
        onglets={[
          { id: 'a', libelle: 'Participants', href: '/a' },
          { id: 'b', libelle: 'Ressources', href: '/b' },
        ]}
        actif="a"
      />
    ),
  },
  {
    nom: 'SelecteurTheme',
    cles: ['ai5d-selecteur-theme'],
    element: <SelecteurTheme theme="clair" />,
  },
  {
    nom: 'SigneAnime',
    cles: ['ai5d-signe-anime'],
    element: <SigneAnime marque={<span>AI5D</span>} />,
  },
  { nom: 'Squelette', cles: ['ai5d-squelette'], element: <Squelette /> },
  {
    nom: 'ValeurCopiable',
    cles: ['ai5d-valeur-copiable', 'ai5d-hors-ecran', 'ai5d-bouton', 'ai5d-champ'],
    element: (
      <ValeurCopiable
        valeur="https://portail.ai5d.technology/badge/7K3F9Q"
        libelle="Adresse de votre badge"
        messageEchec="Sélectionnez l’adresse ci-dessus pour la copier."
      />
    ),
  },
];

/** Les clés de la balise unique qu un rendu serveur pose, dans l ordre de `data-href`. */
function clesServeur(html: string): string[] {
  return (/<style data-precedence="ai5d" data-href="([^"]*)">/.exec(html)?.[1] ?? '').split(' ');
}

describe('au client, cinq cents boutons posent une seule feuille', () => {
  it('une balise ai5d-bouton dans document.head, aucune dans le conteneur', () => {
    const { container } = render(
      <div>
        {Array.from({ length: 500 }, (_, i) => (
          <Bouton key={i} variante="discret" taille="sm">{`Ligne ${i + 1}`}</Bouton>
        ))}
      </div>,
    );
    expect(container.querySelectorAll('button')).toHaveLength(500);
    expect(container.querySelectorAll('style')).toHaveLength(0);
    expect(document.querySelectorAll('style[data-href~="ai5d-bouton"]')).toHaveLength(1);
    expect(texteFeuille('ai5d-bouton')).toContain('.ai5d-bouton {');
  });

  it('la feuille hissée ne porte aucun identifiant, et nomme sa précédence', () => {
    render(<Bouton>Inviter</Bouton>);
    const balise = document.head.querySelector('style[data-href~="ai5d-bouton"]');
    expect(balise?.getAttribute('data-precedence')).toBe(PRECEDENCE_FEUILLES);
    expect(balise?.hasAttribute('id')).toBe(false);
  });
});

describe('au serveur, toutes les feuilles du système tiennent dans une balise', () => {
  it('cinq cents boutons et un champ : une balise, deux clés, un sélecteur > intact', () => {
    const html = renderToString(
      <div>
        {Array.from({ length: 500 }, (_, i) => (
          <Bouton key={i}>{`Ligne ${i + 1}`}</Bouton>
        ))}
        <Champ libelle="Rechercher une personne" />
      </div>,
    );
    expect(html.match(/<style/g)).toHaveLength(1);
    expect(clesServeur(html)).toEqual(['ai5d-bouton', 'ai5d-champ']);
    expect(html).not.toMatch(/<style[^>]* id=/);
    // Le rendu serveur n échappe que `<style` et `</style` : un combinateur d enfant passe tel quel.
    expect(html).toContain(
      '.ai5d-bouton:is([data-en-attente], :has([data-en-attente])) .ai5d-bouton__points--attente',
    );
  });

  it('PRECEDENCE_FEUILLES vaut ai5d', () => {
    expect(PRECEDENCE_FEUILLES).toBe('ai5d');
  });
});

describe('chaque composant, rendu deux fois, ne pose qu une feuille par clé', () => {
  for (const { nom, cles, element } of CAS) {
    it(nom, () => {
      const html = renderToString(
        <>
          {element}
          {element}
        </>,
      );
      expect(html.match(/<style/g), nom).toHaveLength(1);
      expect([...clesServeur(html)].sort()).toEqual([...cles].sort());
      expect(html).not.toMatch(/<style[^>]* id=/);
    });
  }
});
```

- [ ] **Step 3 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T2
```

Attendu : deux lignes « rougit ». Sans `feuille.ts`, `tests/feuilles.test.tsx` ne se charge pas ; avec
le bouton rendu comme en 1.2.0, cinq cents balises au client et au serveur, et la garde 7 (tâche 3)
relève `Bouton.tsx`.

- [ ] **Step 4 : écrire `noyau/composants/feuille.ts`**

```ts
/**
 * La feuille d'un composant, posée une fois par document (SPEC 1.3.0, §5.1 ; décision 010).
 *
 * Module pur : ni JSX, ni directive. Il s'importe d'un composant serveur comme d'un module client, et
 * il n'est pas un `.tsx`, qui compterait comme un composant (`tests/index.test.ts`).
 *
 * ── POURQUOI ────────────────────────────────────────────────────────────────
 * Jusqu'à la 1.2.0, chaque instance rendait sa balise `<style id>` devant elle : cinq cents boutons,
 * cinq cents feuilles identiques et cinq cents fois le même identifiant, dans le HTML transmis comme
 * dans le document (mesuré le 28 septembre 2026). React 19 hisse dans `<head>`, et déduplique par
 * `href`, toute balise `<style>` qui porte `href` et `precedence` ; au serveur, il réunit les feuilles
 * d'une même précédence dans une seule balise.
 *
 * Le texte passe en enfant, jamais par `dangerouslySetInnerHTML` : c'est la forme que React documente
 * pour une feuille hissée, et le rendu serveur n'échappe que `<style` et `</style`.
 */
import { createElement, type ReactElement } from 'react';

/**
 * Le groupe de toutes les feuilles du système. Exporté par l'index, pour qu'un produit compte les
 * feuilles du système dans sa recette ; `feuille` ne l'est pas : un produit pose ses propres feuilles
 * sous SA précédence, jamais sous celle-ci.
 */
export const PRECEDENCE_FEUILLES = 'ai5d';

/**
 * La feuille d'un composant, posée une fois par document quel que soit le nombre d'instances.
 * `id` est la clé de déduplication : `ai5d-bouton`, `ai5d-champ`… Jamais d'espace : React le refuse,
 * et l'hydratation échouerait.
 */
export function feuille(id: string, css: string): ReactElement {
  return createElement('style', { href: id, precedence: PRECEDENCE_FEUILLES }, css);
}
```

- [ ] **Step 5 : écrire la migration, `docs/preuves/1.3.0/migrer-feuilles.mjs`**

Elle est scriptée parce qu'elle touche vingt-huit fichiers d'un même geste, et rejouable pour qu'on la
relise en la relançant. Trois cas particuliers : dans `Bouton.tsx`, la balise locale s'appelait
`feuille` et devient `feuilleBouton` ; les deux feuilles hors écran conditionnelles (`Bouton`,
`LigneLien`) deviennent une expression ; la balise anonyme de `GabaritApp` rejoint `STYLE_APP`.

```js
/**
 * La migration mecanique des feuilles vers `feuille(id, css)` (SPEC 1.3.0, §5.1.2 et §5.1.7).
 *
 * Rejouable, et sans effet la seconde fois : chaque remplacement vise la forme de la 1.2.0, qui
 * n existe plus apres. Elle ecrit, fichier par fichier, ce qu elle a change ; le plan (tache 2) dit
 * les nombres attendus. Ecrite dans un fichier et non passee au shell (lecon du depot).
 *
 *   node docs/preuves/1.3.0/migrer-feuilles.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const COMPOSANTS = 'noyau/composants';

/** Insere une ligne d import apres le dernier import de tete du fichier. */
function importer(source, ligne) {
  if (source.includes(ligne)) return source;
  const lignes = source.split('\n');
  let derniere = -1;
  for (let i = 0; i < Math.min(lignes.length, 60); i += 1) {
    if (/^import .*;$/.test(lignes[i]) || /^\} from '.*';$/.test(lignes[i])) derniere = i;
  }
  lignes.splice(derniere + 1, 0, ligne);
  return lignes.join('\n');
}

// 1. Les composants : chaque balise posee a chaque rendu devient une feuille hissee.
const BALISE = /<style\s+id=\{([A-Z_]+)\}\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*([A-Z_]+)\s*\}\}\s*\/>/g;
const CONDITIONNELLE =
  /\{(\w+) \? \(\n\s*<style id=\{ID_STYLE_HORS_ECRAN\} dangerouslySetInnerHTML=\{\{ __html: STYLE_HORS_ECRAN \}\} \/>\n\s*\) : null\}/g;

for (const nom of readdirSync(COMPOSANTS).filter((f) => f.endsWith('.tsx'))) {
  const chemin = `${COMPOSANTS}/${nom}`;
  const avant = readFileSync(chemin, 'utf8');
  let apres = avant
    .replace(CONDITIONNELLE, (_, condition) => `{${condition} ? feuille(ID_STYLE_HORS_ECRAN, STYLE_HORS_ECRAN) : null}`)
    // Bouton.tsx nommait « feuille » sa balise locale : le nom revient a la fonction.
    .replace(
      'const feuille = <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_BOUTON }} />;',
      'const feuilleBouton = feuille(ID_STYLE, STYLE_BOUTON);',
    )
    .replaceAll('        {feuille}\n', '        {feuilleBouton}\n')
    .replace('      {feuille}\n      {nouvelOnglet', '      {feuilleBouton}\n      {nouvelOnglet')
    .replace(BALISE, (_, id, css) => `{feuille(${id}, ${css})}`);

  // GabaritApp : la balise anonyme de palier rejoint STYLE_APP, une fois.
  if (nom === 'GabaritApp.tsx' && /<style\s*\n\s*dangerouslySetInnerHTML/.test(avant)) {
    apres = apres
      .replace(
        /\s*\{avecBarre \? \(\n\s*<style\n\s*dangerouslySetInnerHTML=\{\{\n\s*__html: `@media \(min-width: \$\{TABLETTE\}px\) \{ \.ai5d-app \{ --reserve-barre: 0px; \} \}`,\n\s*\}\}\n\s*\/>\n\s*\) : null\}/,
        '',
      )
      .replace(
        '@media (min-width: ${BUREAU}px) {\n  .ai5d-app__contenu {',
        '/* La barre basse disparait au palier tablette : sa reserve retombe a zero. */\n@media (min-width: ${TABLETTE}px) {\n  .ai5d-app { --reserve-barre: 0px; }\n}\n\n@media (min-width: ${BUREAU}px) {\n  .ai5d-app__contenu {',
      );
  }

  if (apres !== avant) {
    apres = importer(apres, "import { feuille } from './feuille';");
    writeFileSync(chemin, apres);
    console.log(`${chemin} : ${(apres.match(/feuille\(/g) ?? []).length} appel(s) de feuille()`);
  }
}

// 2. Les tests : chaque lecture d une feuille dans son conteneur ou par son id passe par texteFeuille.
const TESTS = [
  'tests/composants/composants.test.tsx',
  'tests/composants/mobile.test.tsx',
  'tests/composants/onglets-rubrique.test.tsx',
  'tests/composants/grille-cartes.test.tsx',
  'tests/composants/valeur-copiable.test.tsx',
  'tests/composants/bouton-lien.test.tsx',
  'tests/composants/liste-definitions.test.tsx',
];

for (const chemin of TESTS) {
  const avant = readFileSync(chemin, 'utf8');
  let apres = avant
    .replace(
      /const feuille = container\.querySelector\('#ai5d-bouton'\);\n\s*expect\(feuille\)\.not\.toBeNull\(\);\n\s*const css = feuille\?\.innerHTML \?\? '';/,
      "const css = texteFeuille('ai5d-bouton');",
    )
    .replace(
      /\(?(?:container|document)\.(?:querySelector\('#(ai5d-[a-z-]+)'\)|getElementById\('(ai5d-[a-z-]+)'\))\?\.innerHTML \?\? ''\)?/g,
      (_, parDiese, parId) => `texteFeuille('${parDiese ?? parId}')`,
    )
    .replace(/container\.querySelector\('style'\)\?\.textContent \?\? ''/g, "texteFeuille('ai5d-gabarit-auth')")
    .replace(
      /\[\.\.\.container\.querySelectorAll\('style'\)\]\.map\(\(s\) => s\.innerHTML\)\.join\('\\n'\)/,
      "texteFeuille('ai5d-gabarit-app')",
    )
    .replace(
      "expect(document.getElementById('ai5d-hors-ecran')).not.toBeNull();",
      "expect(texteFeuille('ai5d-hors-ecran')).toContain('.ai5d-hors-ecran');",
    )
    .replace(/\nfunction styleInjecte\(id: string\): string \{\n[\s\S]*?\n\}\n/, '\n')
    .replaceAll('styleInjecte(', 'texteFeuille(');

  if (apres === avant) continue;
  apres = importer(apres, "import { texteFeuille } from '../aides/feuille';");

  // Un `container` qui ne sert plus qu a lire la feuille disparait : ESLint le refuserait.
  const lignes = apres.split('\n');
  for (let i = 0; i < lignes.length; i += 1) {
    if (!lignes[i].includes('const { container } = render(')) continue;
    let fin = i + 1;
    while (fin < lignes.length && lignes[fin] !== '  });') fin += 1;
    if (!/\bcontainer\b/.test(lignes.slice(i + 1, fin).join('\n'))) {
      lignes[i] = lignes[i].replace('const { container } = render(', 'render(');
    }
  }
  apres = lignes.join('\n');
  writeFileSync(chemin, apres);
  console.log(`${chemin} : ${(apres.match(/texteFeuille\(/g) ?? []).length} lecture(s) par texteFeuille`);
}
```

- [ ] **Step 6 (génération) : lancer la migration, formater, et la relancer**

```bash
node docs/preuves/1.3.0/migrer-feuilles.mjs
pnpm exec prettier --write noyau/composants tests
node docs/preuves/1.3.0/migrer-feuilles.mjs
```

Attendu au premier passage, constaté au plan :

```
noyau/composants/BarreOnglets.tsx : 1 appel(s) de feuille()
noyau/composants/BoiteConfirmation.tsx : 1 appel(s) de feuille()
noyau/composants/BoiteMotif.tsx : 1 appel(s) de feuille()
noyau/composants/Bouton.tsx : 3 appel(s) de feuille()
noyau/composants/CarteAction.tsx : 1 appel(s) de feuille()
noyau/composants/Champ.tsx : 1 appel(s) de feuille()
noyau/composants/CoquilleRail.tsx : 1 appel(s) de feuille()
noyau/composants/GabaritApp.tsx : 1 appel(s) de feuille()
noyau/composants/GabaritAuth.tsx : 1 appel(s) de feuille()
noyau/composants/GabaritDocument.tsx : 1 appel(s) de feuille()
noyau/composants/GabaritSeuil.tsx : 1 appel(s) de feuille()
noyau/composants/GrilleCartes.tsx : 1 appel(s) de feuille()
noyau/composants/LiensRail.tsx : 1 appel(s) de feuille()
noyau/composants/LigneLien.tsx : 2 appel(s) de feuille()
noyau/composants/ListeDefinitions.tsx : 1 appel(s) de feuille()
noyau/composants/ListeLignes.tsx : 1 appel(s) de feuille()
noyau/composants/OngletsRubrique.tsx : 1 appel(s) de feuille()
noyau/composants/SelecteurTheme.tsx : 1 appel(s) de feuille()
noyau/composants/SigneAnime.tsx : 1 appel(s) de feuille()
noyau/composants/Squelette.tsx : 1 appel(s) de feuille()
noyau/composants/ValeurCopiable.tsx : 2 appel(s) de feuille()
tests/composants/composants.test.tsx : 19 lecture(s) par texteFeuille
tests/composants/mobile.test.tsx : 14 lecture(s) par texteFeuille
tests/composants/onglets-rubrique.test.tsx : 6 lecture(s) par texteFeuille
tests/composants/grille-cartes.test.tsx : 4 lecture(s) par texteFeuille
tests/composants/valeur-copiable.test.tsx : 3 lecture(s) par texteFeuille
tests/composants/bouton-lien.test.tsx : 2 lecture(s) par texteFeuille
tests/composants/liste-definitions.test.tsx : 1 lecture(s) par texteFeuille
```

Au second passage : **aucune ligne**. Les 52 occurrences de l'écart E2 donnent 49 appels : les deux
définitions locales de `styleInjecte` (`mobile`, `grille-cartes`) sont retirées, et la lecture de
`bouton-lien.test.tsx:170` devient une attente sur le texte de la feuille.

- [ ] **Step 7 : vérifier à l'œil ce que la migration laisse, et ce qu'elle ne laisse pas**

```bash
grep -rn "dangerouslySetInnerHTML\|<style" noyau/composants
grep -rnE "querySelector(All)?\('style'\)|getElementById\('ai5d-|querySelector\('#ai5d-|styleInjecte" tests/composants
grep -n "feuilleBouton\|ID_STYLE_HORS_ECRAN, STYLE_HORS_ECRAN" noyau/composants/Bouton.tsx noyau/composants/LigneLien.tsx
grep -n "TABLETTE}px\|reserve-barre: 0px\|<style" noyau/composants/GabaritApp.tsx
```

Attendu : la première recherche ne rend rien ; la deuxième rend seulement
`tests/composants/coquille-rail.test.tsx:212` (`sansFeuilles`, qui retire les feuilles des deux rendus
qu'elle compare et reste juste, SPEC §5.1.7) ; `Bouton.tsx` porte `const feuilleBouton = feuille(ID_STYLE, STYLE_BOUTON);`,
deux `{feuilleBouton}` et `{nouvelOnglet ? feuille(ID_STYLE_HORS_ECRAN, STYLE_HORS_ECRAN) : null}` ;
`LigneLien.tsx` porte `{externe ? feuille(ID_STYLE_HORS_ECRAN, STYLE_HORS_ECRAN) : null}` ;
`GabaritApp.tsx` n'a plus de `<style`, et `STYLE_APP` contient, avant le palier bureau :

```css
/* La barre basse disparait au palier tablette : sa reserve retombe a zero. */
@media (min-width: ${TABLETTE}px) {
  .ai5d-app { --reserve-barre: 0px; }
}
```

Cette règle garde le défaut de la 1.2.0 (le style en ligne la bat) : c'est la tâche 13 qui le
corrige, sur mesure. Ici, seule sa place change.

- [ ] **Step 8 : exporter `PRECEDENCE_FEUILLES` depuis `noyau/composants/index.ts`**

Remplacer la ligne `export { Avatar, initiales } from './Avatar';` par :

```ts
/**
 * La precedence des feuilles hissees du systeme, pour qu un produit les compte dans sa recette. La
 * fonction `feuille` n est pas exportee : un produit pose ses feuilles sous sa propre precedence.
 */
export { PRECEDENCE_FEUILLES } from './feuille';

export { Avatar, initiales } from './Avatar';
```

- [ ] **Step 9 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/feuilles.test.tsx tests/composants
```

Attendu, constaté au plan : `tests/feuilles.test.tsx` 26 tests verts ; tous les tests de composants
verts sans qu'aucune attente sur le texte d'une feuille ait changé.

- [ ] **Step 10 : cocher et commiter**

Dans `tasks/todo.md`, cocher T2 avec la mention `· écrite, non testée`.

```bash
git add noyau/composants tests docs/preuves/1.3.0/migrer-feuilles.mjs tasks/todo.md
git status --short
cat > .git/message-1.3.0.txt <<'MESSAGE'
Une feuille par composant, quel que soit le nombre d’instances : les feuilles se hissent dans le head et les tests les y lisent
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 3 : La garde `verifierFeuilleUnique`, et la décision 010

SPEC §5.1.5 et §18. Septième garde distribuée, sur le modèle des six autres : elle relève toute balise
qui se poserait à chaque instance. Le système se l'applique à lui-même ; le Portail pourra la brancher
dans IP19 pour `components/champs/commun.tsx:90-92`.

**Files:**
- Modify: `gardes/gardes.test.ts` (l'import, et un bloc `describe` avant `describe('mise en forme'`)
- Modify: `gardes/index.ts` (trois fonctions insérées avant `/** Met en forme une liste d'infractions`)
- Create: `docs/decisions/010-les-feuilles-se-hissent.md`

**Interfaces:**
- Consumes : `fichiersExamines`, `Infraction`, `OptionsGarde` de `gardes/index.ts` (inchangés).
- Produces : `export function verifierFeuilleUnique(racine: string, options: OptionsGarde = {}): Infraction[]`,
  règle `feuille-unique`, extrait `<style> sans precedence : la feuille est posee a chaque instance`.
  Extensions examinées par défaut : `.tsx`, `.ts`, `.jsx`, `.js`.

- [ ] **Step 1 : les tests d'abord, dans `gardes/gardes.test.ts`**

Dans l'import de `./index`, ajouter `verifierFeuilleUnique,` entre `verifierAucunJetonDeMarqueRedefini,`
et `verifierHauteurDeVueDynamique,`. Puis insérer, juste avant `describe('mise en forme', () => {` :

```ts
describe('garde 7 - une feuille par composant, une fois par document', () => {
  const EXTRAIT = '<style> sans precedence : la feuille est posee a chaque instance';

  it('ne releve aucune infraction dans les composants du depot', () => {
    const infractions = verifierFeuilleUnique('noyau/composants');
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('releve les deux feuilles posees a chaque instance des instantanes de la 1.1.0', () => {
    // Le temoin : la forme de toutes les versions jusqu a la 1.2.0 comprise.
    const infractions = verifierFeuilleUnique('tests/instantanes');
    expect(infractions.map((i) => i.fichier)).toEqual([
      'Bouton-1.1.0.tsx',
      'CoquilleRail-1.1.0.tsx',
    ]);
  });

  it('releve une balise posee a chaque rendu, avec son message et sa ligne', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'Ligne.tsx'),
      [
        "const ID = 'portail-ligne';",
        'export function Ligne() {',
        '  return <style id={ID} dangerouslySetInnerHTML={{ __html: CSS }} />;',
        '}',
        '',
      ].join('\n'),
    );
    expect(verifierFeuilleUnique(racine)).toEqual([
      { fichier: 'Ligne.tsx', ligne: 3, extrait: EXTRAIT, regle: 'feuille-unique' },
    ]);
  });

  it('lit une balise ouvrante ecrite sur trois lignes jusqu a son chevron', () => {
    // Constat n° 2 de la relecture de la 1.2.0 : une lecture ligne a ligne rate ce cas.
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'Carte.tsx'),
      [
        'export const Carte = () => (',
        '  <style',
        '    id="portail-carte"',
        '    dangerouslySetInnerHTML={{ __html: CSS }}',
        '  />',
        ');',
        '',
      ].join('\n'),
    );
    const infractions = verifierFeuilleUnique(racine);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.ligne).toBe(2);
  });

  it('accepte une feuille hissee, meme quand une expression de la balise contient un chevron', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'Hissee.tsx'),
      [
        'export const Hissee = () => (',
        '  <style',
        '    href="portail-hissee"',
        '    data-rendu={(a: number) => a > 0}',
        '    precedence="portail"',
        '  >',
        '    {CSS}',
        '  </style>',
        ');',
        '',
      ].join('\n'),
    );
    expect(verifierFeuilleUnique(racine)).toEqual([]);
  });

  it("accepte createElement('style') qui porte precedence, et releve celui qui ne la porte pas", () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'feuilles.ts'),
      [
        "import { createElement } from 'react';",
        "export const bonne = createElement('style', { href: ID, precedence: 'portail' }, CSS);",
        'export const mauvaise = createElement("style", { id: ID }, CSS);',
        '',
      ].join('\n'),
    );
    const infractions = verifierFeuilleUnique(racine);
    expect(infractions.map((i) => i.ligne)).toEqual([3]);
  });

  it('ne releve pas un commentaire qui cite la forme fautive', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'Note.tsx'),
      [
        '/* Avant la 1.3.0 : <style id={ID} dangerouslySetInnerHTML={{ __html: CSS }} /> */',
        '// <style id="ancienne">',
        "export const note = 'rien';",
        '',
      ].join('\n'),
    );
    expect(verifierFeuilleUnique(racine)).toEqual([]);
  });
});
```

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T3
```

Attendu : « rougit ». Avant l'étape 3, `verifierFeuilleUnique` n'existe pas et `gardes/gardes.test.ts`
ne se charge pas ; la mutation rejoue une garde qui accepte tout, et les trois tests qui attendent une
infraction rougissent.

- [ ] **Step 3 : écrire la garde dans `gardes/index.ts`**

Insérer, juste avant `/** Met en forme une liste d'infractions pour un message d'erreur lisible. */` :

```ts
/**
 * Le texte d'un fichier de code sans ses commentaires, chaque caractère d'un commentaire remplacé
 * par une espace et chaque saut de ligne gardé : les numéros de ligne restent ceux du fichier.
 * Un commentaire a le droit de citer la forme fautive.
 */
function viderCommentairesDeCode(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (commentaire) => commentaire.replace(/[^\n]/g, ' '))
    .replace(
      /(^|[^:'"`])\/\/[^\n]*/g,
      (commentaire, avant: string) => `${avant}${' '.repeat(commentaire.length - avant.length)}`,
    );
}

/**
 * La fin d'une construction ouverte à `debut` : le `>` qui ferme une balise ouvrante JSX, ou la
 * parenthèse qui ferme un appel. Les accolades, les parenthèses et les chaînes sont suivies, pour
 * qu'un `>` écrit dans une expression (`() => …`, `a > b`) ne ferme rien.
 */
function finDeConstruction(texte: string, debut: number, fermante: '>' | ')'): number {
  let profondeur = 0;
  for (let i = debut; i < texte.length; i += 1) {
    const c = texte[i];
    if (c === '"' || c === "'" || c === '`') {
      const fin = texte.indexOf(c, i + 1);
      if (fin === -1) return texte.length;
      i = fin;
      continue;
    }
    if (c === '{' || c === '(') profondeur += 1;
    else if (c === '}' || c === ')') {
      if (profondeur === 0 && c === fermante) return i;
      profondeur -= 1;
    } else if (c === fermante && profondeur === 0) return i;
  }
  return texte.length;
}

/**
 * Garde 7 - une feuille de composant se pose une fois par document.
 *
 * Une balise `<style>` sans `href` ni `precedence` est rendue à chaque instance : cinq cents lignes,
 * cinq cents copies et autant d'identifiants dupliqués. Seule une feuille hissée se déduplique
 * (décision 010, mesuré le 28 septembre 2026).
 *
 * Elle relève, dans le code, tout élément JSX `<style` dont la balise ouvrante ne porte pas
 * `precedence`, et tout `createElement('style', …)` dont les propriétés ne la portent pas. La balise
 * se lit jusqu'au `>` qui la ferme, sur plusieurs lignes au besoin : une lecture ligne à ligne
 * raterait une déclaration écrite sur deux (constat n° 2 de la relecture de la 1.2.0). Les
 * commentaires sont ignorés. Une chaîne qui contient le texte `<style` serait relevée : la garde lit
 * du code, et un produit exclut un tel fichier par `exceptions`.
 */
export function verifierFeuilleUnique(racine: string, options: OptionsGarde = {}): Infraction[] {
  const regle = 'feuille-unique';
  const extrait = '<style> sans precedence : la feuille est posee a chaque instance';
  const examinees = { extensions: ['.tsx', '.ts', '.jsx', '.js'], ...options };
  const infractions: Infraction[] = [];

  for (const fichier of fichiersExamines(racine, examinees)) {
    const code = viderCommentairesDeCode(readFileSync(join(racine, fichier), 'utf8'));
    const ligneDe = (position: number) => code.slice(0, position).split('\n').length;

    for (const trouve of code.matchAll(/<style(?=[\s/>])/g)) {
      const debut = trouve.index ?? 0;
      const balise = code.slice(debut, finDeConstruction(code, debut + 1, '>') + 1);
      if (!/\bprecedence\s*=/.test(balise)) {
        infractions.push({ fichier, ligne: ligneDe(debut), extrait, regle });
      }
    }

    for (const trouve of code.matchAll(/createElement\(\s*(['"])style\1\s*,/g)) {
      const debut = trouve.index ?? 0;
      const appel = code.slice(debut, finDeConstruction(code, debut + trouve[0].length, ')') + 1);
      if (!/\bprecedence\b/.test(appel)) {
        infractions.push({ fichier, ligne: ligneDe(debut), extrait, regle });
      }
    }
  }

  return infractions;
}
```

- [ ] **Step 4 : écrire `docs/decisions/010-les-feuilles-se-hissent.md`**

```markdown
# 010 · Les feuilles se hissent

**Date :** 28 septembre 2026 · **Statut :** appliquée · **Version :** 1.3.0

## Contexte

Depuis la 0.4.0, un composant qui a des états porte sa feuille dans une constante `STYLE_…` et la
rendait, à chaque rendu, dans une balise `<style id>` posée devant lui. Vingt-six balises dans vingt et
un fichiers. Mesuré le 28 septembre 2026 sur le banc d'essai (`docs/preuves/1.3.0/feuilles.md`) : cinq
cents boutons et un champ posaient 501 balises, 499 identifiants dupliqués, dans le HTML transmis comme
dans le document. La console du Portail rend des tables de cinq cents lignes.

## Options

**A. Une feuille statique importée par le préréglage.** Aucun geste pour un produit qui importe déjà
`@ai5d/design-system/preset`. Mais toutes les feuilles chargées à chaque page, et chaque feuille
séparée de son composant : deux lieux à tenir ensemble, ce que le dépôt a refusé depuis la 0.4.0.

**B. Les feuilles hissées par React.** Une balise `<style>` qui porte `href` et `precedence` est
hissée dans `<head>` et dédupliquée par `href`, au serveur comme au client ; au serveur, toutes les
feuilles d'une précédence tiennent dans une balise. React 19 est déjà exigé en pair.

## Décision

**B.** Une seule fonction, `feuille(id, css)`, dans un module pur (`noyau/composants/feuille.ts`),
pose `<style href={id} precedence="ai5d">`. Le texte passe en enfant. `PRECEDENCE_FEUILLES` est
exporté pour qu'un produit compte les feuilles du système ; `feuille` ne l'est pas : un produit pose
les siennes sous sa propre précédence (le Portail : `portail`). La septième garde,
`verifierFeuilleUnique`, refuse toute balise `<style>` ou tout `createElement('style')` sans
`precedence`.

## Conséquences

- La feuille n'est plus dans le conteneur du composant mais dans `<head>`, sans `id`. Un test qui la
  lisait par son conteneur ou son `id` la lit par `style[data-href~="ai5d-…"]` (`tests/aides/feuille.ts`).
  Cinquante-deux lectures migrées dans ce dépôt, dont une qui passait à vide sur `null`.
- Au serveur, une balise pour tout le système, dont `data-href` liste les composants employés : une
  recette compte les clés, pas les balises.
- Démontée, une feuille reste dans `<head>` : elle ne coûte rien, et la retirer ferait clignoter la
  prochaine instance.
- L'ordre dans la cascade change face à une règle de classe d'un produit, hors couche et de même
  spécificité ; face aux utilitaires de Tailwind 4, rangés dans une couche, rien ne change.
- Une politique de sécurité du contenu à nonce devra fournir le nonce au rendu de React.
```

- [ ] **Step 5 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run gardes/gardes.test.ts
```

Attendu, constaté au plan : 49 tests verts, dont les sept de la garde 7.

- [ ] **Step 6 : cocher et commiter**

Dans `tasks/todo.md`, cocher T3 avec la mention `· écrite, non testée`.

```bash
git add gardes docs/decisions/010-les-feuilles-se-hissent.md tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Une septième garde refuse toute feuille posée à chaque instance, et la décision 010 dit pourquoi les feuilles se hissent
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 4 : Le jeton `--surface-survol`, l'instantané de la 1.2.0, et la décision 011

SPEC §5.2, §6 et §18. Un jeton de rôle, sans valeur nouvelle : `--surface-chaude` en clair,
`--surface-1` en sombre, dans les quatre blocs de thème. Cette tâche fige aussi la 1.2.0 : ses jetons,
pour la non-régression, et `EnteteRubrique`, pour la tâche 7.

**Files:**
- Create: `_build/figer-1.2.0.mjs`
- Create (génération) : `tests/instantanes/jetons-1.2.0.json`, `tests/instantanes/EnteteRubrique-1.2.0.tsx`
- Modify: `tests/jetons.test.ts` (quatre couples, le nombre, un bloc `describe` en fin de fichier)
- Modify: `tests/non-regression.test.ts` (un second instantané, en fin de fichier)
- Modify: `noyau/jetons.css` (quatre déclarations)
- Create: `docs/decisions/011-le-survol-a-un-jeton-et-une-portee.md`

**Interfaces:**
- Consumes : `decouperBlocs` de `outils/jetons.ts` ; `lireJetons`, `resoudre` ; `ratioContraste`,
  `SEUIL_TEXTE_COURANT` de `outils/contraste.ts` ; l'étiquette Git `v1.2.0`.
- Produces : `--surface-survol` ; `tests/instantanes/jetons-1.2.0.json` (même forme que celui de la
  1.1.0) ; `tests/instantanes/EnteteRubrique-1.2.0.tsx` (exporte `EnteteRubrique`, imports relatifs
  réécrits).

- [ ] **Step 1 : écrire `_build/figer-1.2.0.mjs`**

```js
/**
 * Fige la 1.2.0, une fois, pour les preuves de la 1.3.0.
 *
 * La 1.3.0 se dit mineure : aucune valeur de jeton ne bouge, et un en-tete de rubrique sans action
 * rend le HTML de la 1.2.0 au caractere pres. Ce script lit les fichiers de l etiquette v1.2.0 par Git
 * et ecrit dans tests/instantanes/ :
 *
 *   jetons-1.2.0.json          chaque bloc des quatre feuilles, avec ses declarations
 *   EnteteRubrique-1.2.0.tsx   l en-tete de la 1.2.0, pour comparer le HTML sans action
 *
 * Les tests ne lisent jamais Git : l integration continue clone sans etiquettes. Node 22 retire les
 * types de outils/jetons.ts a l import.
 *
 *   node _build/figer-1.2.0.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { decouperBlocs } from '../outils/jetons.ts';

const ETIQUETTE = 'v1.2.0';
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
  `${DOSSIER}/jetons-1.2.0.json`,
  `${JSON.stringify({ etiquette: ETIQUETTE, fichiers }, null, 2)}\n`,
);
writeFileSync(
  `${DOSSIER}/EnteteRubrique-1.2.0.tsx`,
  lire('noyau/composants/EnteteRubrique.tsx').replaceAll(
    "from './",
    "from '../../noyau/composants/",
  ),
);

console.log(`${ETIQUETTE} figee dans ${DOSSIER} : 4 feuilles, 1 composant.`);
```

- [ ] **Step 2 (génération) : figer la 1.2.0, puis formater**

```bash
node _build/figer-1.2.0.mjs
pnpm exec prettier --write _build/figer-1.2.0.mjs tests/instantanes
grep -c '"selecteur"' tests/instantanes/jetons-1.2.0.json
head -2 tests/instantanes/EnteteRubrique-1.2.0.tsx
```

Attendu : `v1.2.0 figee dans tests/instantanes : 4 feuilles, 1 composant.`, puis `16`, puis les imports
`from 'lucide-react'` et `from '../../noyau/composants/Icone'`.

- [ ] **Step 3 : les tests d'abord, dans `tests/jetons.test.ts`**

Dans `EXIGENCES`, remplacer les trois entrées `--reussite`, `--erreur` et `--action` par :

```ts
  {
    jeton: '--reussite',
    // `--surface-survol` : un texte de reussite dans une ligne survolee, 4,53 (1.3.0).
    fonds: ['--surface-1', '--surface-2', '--reussite-fond', '--surface-survol'],
  },
  { jeton: '--attention', fonds: ['--surface-1', '--surface-2', '--attention-fond'] },
  {
    jeton: '--erreur',
    // `--surface-survol` : le geste grave d'un menu, survole (1.3.0).
    fonds: ['--surface-1', '--surface-2', '--erreur-fond', '--surface-survol'],
  },
  {
    jeton: '--action',
    // `--surface-selection` : l'onglet actif et le segment coche (1.2.0). `--surface-survol` : un
    // lien dans une ligne survolee (1.3.0).
    fonds: ['--surface-1', '--surface-2', '--info-fond', '--surface-selection', '--surface-survol'],
  },
```

Dans `EXIGENCES_SOMBRES`, remplacer l'entrée `--erreur` par :

```ts
  {
    jeton: '--erreur',
    // `--surface-3` : le geste grave d'un menu, en sombre, 4,98 (1.3.0).
    fonds: ['--surface-1', '--surface-2', '--erreur-fond', '--surface-3'],
  },
```

Les autres couples du §5.2.2 sont déjà mesurés sous le nom de la surface qu'ils désignent :
`--texte-fort`, `--texte` et `--texte-faible` sur `--surface-chaude` en clair ; les cinq textes sur
`--surface-1` en sombre ; `--texte` sur `--surface-3` en sombre. En clair, `--surface-3` vaut le blanc,
déjà mesuré sous `--surface-2`. Quatre couples s'ajoutent.

Dans le bloc `jetons - le nombre de couples mesures`, remplacer le titre et l'attente :

```ts
  it('mesure soixante et un couples : quarante-neuf de la 1.1.0, huit de la 1.2.0, quatre de la 1.3.0', () => {
```

```ts
    expect(clairs + sombres + COUPLES_DE_BOUTONS).toBe(61);
```

Et ajouter en fin de fichier :

```ts
describe('jetons - le survol (1.3.0, decision 011)', () => {
  const BLOCS = [':root', ":root[data-theme='dark']", ":root[data-theme='light']"] as const;

  it('--surface-survol est declare dans les quatre blocs de theme', () => {
    for (const bloc of BLOCS) {
      expect(lireJetons(CHEMIN, bloc).has('--surface-survol'), bloc).toBe(true);
    }
    const preference = lireJetons(CHEMIN, ":root:not([data-theme='light'])", {
      inclureRegleArobase: true,
    });
    expect(preference.get('--surface-survol')).toBe('var(--surface-1)');
  });

  it('ne pointe que vers une surface existante, et ne porte aucune valeur nouvelle', () => {
    expect(clair.get('--surface-survol')).toBe('var(--surface-chaude)');
    expect(themeClairExplicite.get('--surface-survol')).toBe('var(--surface-chaude)');
    expect(sombre.get('--surface-survol')).toBe('var(--surface-1)');
  });

  it('se distingue de la selection en sombre : il creuse la ou elle eclaire', () => {
    const ratio = ratioContraste(
      couleur(sombre, '--surface-survol'),
      couleur(sombre, '--surface-selection'),
    );
    expect(ratio, ratio.toFixed(2)).toBeGreaterThan(1.2);
  });

  it('le temoin : --attention en texte nu sur une surface survolee echoue en clair, et doit echouer', () => {
    /*
      4,39. Un texte en --attention ne se pose pas sur une surface survolee sans son fond
      --attention-fond (4,54). NOYAU.md, section 1.4, l ecrit. Si ce test passe un jour, une valeur a
      bouge sans que la regle ait ete relue.
    */
    const ratio = ratioContraste(couleur(clair, '--attention'), couleur(clair, '--surface-survol'));
    expect(ratio, ratio.toFixed(2)).toBeLessThan(SEUIL_TEXTE_COURANT);
    expect(
      ratioContraste(couleur(clair, '--attention'), couleur(clair, '--attention-fond')),
    ).toBeGreaterThanOrEqual(SEUIL_TEXTE_COURANT);
  });
});
```

- [ ] **Step 4 : le second instantané, en fin de `tests/non-regression.test.ts`**

```ts
/**
 * AUCUNE VALEUR DE LA 1.2.0 NE CHANGE (SPEC 1.3.0, §6).
 *
 * La 1.3.0 ajoute une seule propriete, `--surface-survol`, qui nomme un role et pointe vers des
 * surfaces existantes. Les quatre feuilles se comparent ici declaration par declaration, la feuille de
 * densites comprise : la 1.3.0 n y touche pas. L instantane a ete engendre une fois depuis l etiquette
 * v1.2.0 par `_build/figer-1.2.0.mjs`, puis versionne.
 */
const INSTANTANE_120 = JSON.parse(
  readFileSync('tests/instantanes/jetons-1.2.0.json', 'utf8'),
) as Instantane;

describe(`aucune valeur de ${INSTANTANE_120.etiquette} ne change`, () => {
  it('l instantane porte les quatre feuilles', () => {
    expect(Object.keys(INSTANTANE_120.fichiers).sort()).toEqual([
      'densites/profils.css',
      'noyau/jetons.css',
      'noyau/marque.css',
      'noyau/paliers.css',
    ]);
  });

  for (const [fichier, figes] of Object.entries(INSTANTANE_120.fichiers)) {
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
});
```

- [ ] **Step 5 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T4
```

Attendu : deux lignes « rougit ». Avant l'étape 6, `--surface-survol` n'existe pas : les quatre
couples et le bloc du survol ne résolvent rien. La première mutation rend en sombre le survol égal à
la sélection, forme de la 1.2.0 ; la seconde change une valeur de la 1.2.0, que l'instantané refuse.

- [ ] **Step 6 : déclarer le jeton dans `noyau/jetons.css`**

Dans le bloc `:root`, juste après `--surface-selection: var(--info-fond);` (ligne 105), insérer :

```css

  /* Le survol d'un element pose sur --surface-2 ou --surface-3 : une ligne de table, un element
     de menu, un lien du rail. Il ne vaut pas sur --surface-1 en sombre, ou il se confondrait avec
     la page : un element pose a meme la page garde ses propres regles (LigneLien). En sombre, il
     creuse d'un cran la ou la selection eclaire : les deux ne se confondent plus (1,27), ce que
     --surface-3 ne permettait pas (1,00). Il ne porte aucune valeur nouvelle : il nomme un role et
     choisit, par theme, une surface deja mesuree. Decision 011. */
  --surface-survol: var(--surface-chaude);
```

Dans le bloc `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { … } }`, juste
après `    --surface-selection: var(--surface-3);` (ligne 292), insérer
`    --surface-survol: var(--surface-1);`.

Dans le bloc `:root[data-theme='dark']`, juste après `  --surface-selection: var(--surface-3);`
(ligne 331), insérer `  --surface-survol: var(--surface-1);`.

Dans le bloc `:root[data-theme='light']`, juste après `  --surface-selection: var(--info-fond);`
(ligne 364), insérer `  --surface-survol: var(--surface-chaude);`.

Aucune autre ligne ne bouge (G1). Le commentaire n'écrit aucun `--nom:` en tête de ligne (test
« a purge les valeurs de texte faible ecartees des DECLARATIONS »).

- [ ] **Step 7 : écrire `docs/decisions/011-le-survol-a-un-jeton-et-une-portee.md`**

```markdown
# 011 · Le survol a un jeton, et une portée

**Date :** 28 septembre 2026 · **Statut :** appliquée · **Version :** 1.3.0

## Contexte

Le survol n'avait pas de jeton. `LiensRail` et `LigneLien` l'écrivaient à la main, avec un bloc de
sélecteurs par thème : `--surface-1` ou `--surface-chaude` en clair, `--surface-3` en sombre. Or
`--surface-selection` vaut `--surface-3` en sombre : un lien du rail survolé avait exactement le fond
de la rubrique active, une ligne survolée celui d'une ligne appuyée. Mesuré sur le banc d'essai le 28
septembre 2026 : `rgb(23, 44, 59)` pour les deux. La console du Portail pose des tables où survol et
sélection se côtoient.

## Options

**A. Une teinte nouvelle en sombre.** Essayées entre et au-delà des surfaces existantes : plus claire
que `--surface-3`, elle fait tomber `--action` à 4,16 et `--reussite` à 4,20 ; entre deux surfaces,
elle se confond avec l'une d'elles.

**B. Un jeton de rôle, sans valeur nouvelle, et une portée écrite.** En sombre, le survol creuse d'un
cran là où la sélection et l'appui éclairent.

## Décision

**B.** `--surface-survol` vaut `--surface-chaude` en clair et `--surface-1` en sombre, dans les quatre
blocs de thème. Il vaut pour un élément posé sur `--surface-2` ou `--surface-3` : ligne de table,
élément de menu, lien du rail. Il ne vaut pas pour un élément posé à même la page (`--surface-1`), où
il se confondrait avec elle en sombre.

## Conséquences

- En sombre, survol et sélection s'écartent de 1,27 ; en clair, ils ont la même clarté et deux teintes,
  chaude contre bleutée : la case cochée du produit porte l'état, dans les deux thèmes.
- **`--attention` ne se pose pas en texte nu sur une surface survolée** : 4,39 en clair. Il garde son
  fond `--attention-fond` (4,54). Un test en fait un témoin qui doit rester sous 4,5.
- `LiensRail` passe au jeton (arbitrage de Karamo du 28 septembre 2026), et son survol se garde par
  `(hover: hover)`. `MenuActions` l'emploie.
- `LigneLien` garde ses règles : son survol reste égal à son appui en sombre. Aucune valeur ne se
  détache à la fois des trois surfaces ; différé à un lot qui tranchera une surface nouvelle.
- Quatre couples de contraste de plus, lus dans `tests/jetons.test.ts` et nulle part ailleurs.
```

- [ ] **Step 8 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/jetons.test.ts tests/non-regression.test.ts
```

Attendu, constaté au plan : les deux fichiers verts, 129 tests.

- [ ] **Step 9 : cocher et commiter**

Dans `tasks/todo.md`, cocher T4 avec la mention `· écrite, non testée`.

```bash
git add _build/figer-1.2.0.mjs tests/instantanes tests/jetons.test.ts tests/non-regression.test.ts noyau/jetons.css docs/decisions/011-le-survol-a-un-jeton-et-une-portee.md tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Le survol a son jeton, qui creuse en sombre là où la sélection éclaire, la 1.2.0 figée pour la non-régression, et la décision 011
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 5 : `LiensRail` au jeton de survol, et le commentaire de `LigneLien`

SPEC §5.2.3, point 3 du §0.9 (tranché). Le survol du rail prend `--surface-survol` et se garde par
`(hover: hover)` ; les deux blocs par thème disparaissent. `LigneLien` ne change pas de rendu : son
commentaire dit pourquoi.

**Files:**
- Modify: `tests/composants/liens-rail.test.tsx` (un bloc `describe` en fin de fichier)
- Modify: `noyau/composants/LiensRail.tsx:84-127` (le commentaire de `STYLE_LIENS_RAIL` et la constante)
- Modify: `noyau/composants/LigneLien.tsx:38-39`

**Interfaces:**
- Consumes : `--surface-survol` (tâche 4).
- Produces : `STYLE_LIENS_RAIL`, même nom, même export.

- [ ] **Step 1 : le test d'abord, en fin de `tests/composants/liens-rail.test.tsx`**

```tsx
describe('LiensRail, le survol par jeton (1.3.0, decision 011)', () => {
  it('survole sur --surface-survol, garde par (hover: hover), sans bloc par theme', () => {
    expect(STYLE_LIENS_RAIL).toMatch(
      /@media \(hover: hover\) \{\s*\.ai5d-liens-rail__lien:hover \{ background: var\(--surface-survol\);/,
    );
    expect(STYLE_LIENS_RAIL.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/g, '')).not.toContain(
      ':hover',
    );
    expect(STYLE_LIENS_RAIL).not.toContain('data-theme');
    expect(STYLE_LIENS_RAIL).not.toContain('prefers-color-scheme');
  });

  it('ne recouvre pas la rubrique active au survol', () => {
    expect(STYLE_LIENS_RAIL).toMatch(
      /\[aria-current='page'\]:hover \{ background: var\(--surface-selection\); \}/,
    );
  });
});
```

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T5
```

Attendu : « rougit ». La mutation rejoue le survol de la 1.2.0, sur `--surface-1` et hors de la garde.

- [ ] **Step 3 : réécrire la feuille du rail, `noyau/composants/LiensRail.tsx`**

Remplacer les lignes 84 à 127, du `/**` placé au-dessus de « Le survol change de jeton selon le thème,
comme dans le rail de Compte » jusqu'au `` `; `` qui ferme `STYLE_LIENS_RAIL`, par :

```tsx
/**
 * Le survol prend `--surface-survol`, depuis la 1.3.0 (décision 011). Jusque-là, faute de jeton réglé
 * par thème, il valait `--surface-1` en clair et `--surface-3` en sombre, écrit à la main dans deux
 * blocs de sélecteurs : en sombre, un lien survolé avait exactement le fond de la rubrique active. Le
 * jeton creuse d'un cran en sombre, là où la sélection éclaire. Le survol est gardé par
 * `(hover: hover)` : au doigt, il restait collé après le toucher.
 */
export const STYLE_LIENS_RAIL = `
.ai5d-liens-rail {
  display: flex; flex-direction: column; gap: var(--espace-1);
}
.ai5d-liens-rail__lien {
  display: flex; align-items: center; gap: var(--espace-3);
  min-height: var(--cible-tactile);
  padding: var(--espace-2) var(--espace-3);
  border-radius: var(--rayon-md);
  color: var(--texte);
  font-family: var(--police-corps); font-size: var(--taille-sm);
  text-decoration: none;
  transition: background var(--duree-courte) var(--courbe-sortie),
              color var(--duree-courte) var(--courbe-sortie);
}
@media (hover: hover) {
  .ai5d-liens-rail__lien:hover { background: var(--surface-survol); color: var(--texte-fort); }
}
.ai5d-liens-rail__lien[aria-current='page'] {
  background: var(--surface-selection);
  color: var(--action);
  font-weight: var(--graisse-semi);
}
/* Le survol ne recouvre pas la pastille active : elle garde son fond de selection. */
@media (hover: hover) {
  .ai5d-liens-rail__lien[aria-current='page']:hover { background: var(--surface-selection); }
}

/* Au clavier seulement : focus-visible ne se declenche pas au clic de souris. */
.ai5d-liens-rail__lien:focus-visible {
  outline: 2px solid var(--action);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-liens-rail__lien { transition: none; }
}
`;
```

- [ ] **Step 4 : le commentaire de `noyau/composants/LigneLien.tsx`**

Remplacer les lignes 38 et 39 :

```tsx
 * Le survol change de jeton selon le thème, comme `LiensRail` : `--surface-chaude` se détache en
 * clair, `--surface-3` prend le relais en sombre, en attendant le jeton de survol de la 1.3.0.
```

par :

```tsx
 * Le survol change de jeton selon le thème : `--surface-chaude` se détache en clair, `--surface-3`
 * prend le relais en sombre. Il ne passe pas à `--surface-survol` (décision 011) : ce jeton vaut pour
 * un élément posé sur `--surface-2` ou `--surface-3`, et une ligne se pose aussi à même la page, où il
 * se confondrait avec elle en sombre. En sombre, son survol reste égal à son appui ; aucune valeur ne
 * se détache à la fois des trois surfaces (SPEC 1.3.0, §5.2.4). Différé.
```

- [ ] **Step 5 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/composants/liens-rail.test.tsx tests/composants/ligne-lien.test.tsx tests/cycles.test.ts
```

- [ ] **Step 6 : cocher et commiter**

```bash
git add noyau/composants/LiensRail.tsx noyau/composants/LigneLien.tsx tests/composants/liens-rail.test.tsx tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Le rail survole sur le jeton de survol et ne se confond plus avec la rubrique active en sombre
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 6 : `Bandeau` qui se ferme et reçoit le focus

SPEC §5.4, pièce 10 de P10 lue comme une extension (§0.6). `onFermer`, `libelleFermer`, `ref` ; une
classe et une feuille d'une règle pour l'anneau. Le reste du rendu est celui de la 1.2.0.

**Files:**
- Modify: `tests/composants/composants.test.tsx` (un bloc `describe` en fin de fichier)
- Modify: `noyau/composants/Bandeau.tsx` (réécrit en entier)

**Interfaces:**
- Consumes : `Bouton` (`variante="discret"`, `taille="sm"`), `Icone`, `X` de `lucide-react`, `feuille`.
- Produces : `ProprietesBandeau` gagne `onFermer?: (() => void) | undefined`,
  `libelleFermer?: string | undefined`, `ref?: Ref<HTMLDivElement> | undefined`. Clé de feuille
  `ai5d-bandeau`.

- [ ] **Step 1 : les tests d'abord, en fin de `tests/composants/composants.test.tsx`**

```tsx
describe('Bandeau qui se ferme et recoit le focus (1.3.0)', () => {
  it('n a de bouton de fermeture qu avec onFermer, nomme « Fermer ce message » par defaut', () => {
    const { rerender } = render(<Bandeau ton="reussite">23 invitations envoyées.</Bandeau>);
    expect(screen.queryByRole('button')).toBeNull();

    const fermer = vi.fn();
    rerender(
      <Bandeau ton="reussite" onFermer={fermer}>
        23 invitations envoyées.
      </Bandeau>,
    );
    const bouton = screen.getByRole('button', { name: 'Fermer ce message' });
    expect(bouton).toHaveAttribute('data-variante', 'discret');
    expect(bouton).toHaveAttribute('data-taille', 'sm');
    expect(bouton.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('appelle onFermer, et ne se retire jamais de lui-meme', async () => {
    const fermer = vi.fn();
    render(
      <Bandeau ton="reussite" onFermer={fermer} libelleFermer="Fermer le retour">
        23 invitations envoyées.
      </Bandeau>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Fermer le retour' }));
    expect(fermer).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('range la fermeture apres l action', () => {
    render(
      <Bandeau
        ton="attention"
        onFermer={() => undefined}
        action={<Bouton variante="secondaire">Voir les 2 envois échoués</Bouton>}
      >
        23 invitations envoyées. 2 ne sont pas parties.
      </Bandeau>,
    );
    const [action, fermer] = screen.getAllByRole('button');
    expect(action).toHaveTextContent('Voir les 2 envois échoués');
    expect(fermer).toHaveAccessibleName('Fermer ce message');
  });

  it('transmet ref et tabIndex a la racine, pour qu un produit y rende le focus', () => {
    const reference = { current: null as HTMLDivElement | null };
    render(
      <Bandeau ton="reussite" ref={reference} tabIndex={-1}>
        23 invitations envoyées.
      </Bandeau>,
    );
    expect(reference.current).toBe(screen.getByRole('status'));
    expect(reference.current).toHaveAttribute('tabindex', '-1');
    reference.current?.focus();
    expect(document.activeElement).toBe(reference.current);
  });

  it('joint sa classe a celle du produit, et pose l anneau dans sa feuille', () => {
    render(
      <Bandeau ton="information" className="region-retour">
        Enregistré.
      </Bandeau>,
    );
    expect(screen.getByRole('status')).toHaveClass('ai5d-bandeau', 'region-retour');
    expect(texteFeuille('ai5d-bandeau')).toContain(
      '.ai5d-bandeau:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }',
    );
  });

  it('garde son role selon le ton, fermeture ou non', () => {
    render(
      <Bandeau ton="attention" onFermer={() => undefined}>
        2 envois ont échoué.
      </Bandeau>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T6
```

Attendu : « rougit » (trois tests : aucun bouton de fermeture).

- [ ] **Step 3 : réécrire `noyau/composants/Bandeau.tsx`**

La feuille est le **premier enfant** du bandeau et non la tête d'un fragment : un test existant
appelle `Bandeau({…})` comme une fonction et lit `props.role` de l'élément rendu (écart E9). React la
hisse de là comme d'ailleurs.

```tsx
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bouton } from './Bouton';
import { feuille } from './feuille';
import { Icone } from './Icone';
import type { TonSemantique } from './Pastille';

/**
 * Le bandeau — une information d'état, sur toute la largeur.
 *
 * Chaque ton porte **une icône et un texte**, jamais la couleur seule. Et le rôle ARIA
 * suit le ton : `status` pour ce qui informe, `alert` pour ce qui demande une réaction.
 * Un lecteur d'écran annonce alors la chose au bon moment — un `alert` interrompt, un
 * `status` attend une pause.
 *
 * Le ton `neutre` (v1.2.0) dit « rien à signaler » : icône `Info`, `role="status"`, contour et titre
 * en texte faible, corps en `--texte`. Le contour suit la règle des quatre autres tons, la couleur du
 * ton : en `--bordure-forte`, le bandeau ne se détacherait pas du papier (1,49).
 *
 * ── IL SE FERME, ET IL REÇOIT LE FOCUS, EN v1.3.0 ───────────────────────────
 * Avec `onFermer`, un bouton « Fermer ce message » suit l'action ; c'est le produit qui retire le
 * bandeau, jamais le système de lui-même. Avec `ref` et `tabIndex={-1}`, le produit peut y ramener le
 * focus quand l'élément qui l'avait disparaît : un anneau `:focus-visible` s'y dessine. La console du
 * Portail compose sa région de retour dessus ; Compte rendait déjà un `Bandeau` de réussite sans
 * fermeture (`Annonce.tsx:18-20`). Une extension, pas un composant : décision 012.
 */

export interface ProprietesBandeau extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ton?: TonSemantique | undefined;
  /** Le titre du bandeau. Court, et il nomme la conséquence. */
  titre?: string | undefined;
  children: ReactNode;
  /** Une action unique, à droite. Un bandeau qui propose deux sorties n'en propose aucune. */
  action?: ReactNode | undefined;
  /**
   * Présent : un bouton de fermeture, après l'action. Le produit retire le bandeau ; le système ne le
   * fait pas disparaître de lui-même, et ne le ferme jamais seul.
   */
  onFermer?: (() => void) | undefined;
  /** Le nom du bouton de fermeture. « Fermer ce message » par défaut. */
  libelleFermer?: string | undefined;
  /** Pour y ramener le focus quand l'élément qui l'avait disparaît. Avec `tabIndex={-1}`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

const ID_STYLE = 'ai5d-bandeau';

/** Le seul état du bandeau qui ne s'écrit pas en ligne : l'anneau, quand le produit y porte le focus. */
const STYLE_BANDEAU = `
.ai5d-bandeau:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }
`;

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

export function Bandeau({
  ton = 'information',
  titre,
  children,
  action,
  onFermer,
  libelleFermer = 'Fermer ce message',
  className,
  style,
  ...reste
}: ProprietesBandeau) {
  const couleurs = COULEURS[ton];

  const styleBandeau: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--espace-3)',
    padding: '14px var(--espace-4)',
    background: couleurs.fond,
    color: 'var(--texte)',
    border: `1px solid ${couleurs.texte}`,
    borderRadius: 'var(--rayon-md)',
    fontFamily: 'var(--police-corps)',
    fontSize: 'var(--taille-sm)',
    lineHeight: 'var(--interligne-corps)',
    ...style,
  };

  return (
    <div
      className={className === undefined ? 'ai5d-bandeau' : `ai5d-bandeau ${className}`}
      style={styleBandeau}
      role={ROLES[ton]}
      data-ton={ton}
      {...reste}
    >
      {/* Hissée dans le head par React : la racine reste le bandeau, pour qui lit ses propriétés. */}
      {feuille(ID_STYLE, STYLE_BANDEAU)}
      <Icone nom={ICONES[ton]} taille={20} couleur={couleurs.texte} style={{ marginTop: '1px' }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {titre ? (
          <div
            style={{
              fontWeight: 'var(--graisse-semi)',
              color: couleurs.texte,
              marginBottom: '2px',
            }}
          >
            {titre}
          </div>
        ) : null}
        <div>{children}</div>
      </div>

      {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}

      {onFermer === undefined ? null : (
        <Bouton
          variante="discret"
          taille="sm"
          aria-label={libelleFermer}
          onClick={onFermer}
          style={{ alignSelf: 'flex-start' }}
        >
          <Icone nom={X} taille={16} />
        </Bouton>
      )}
    </div>
  );
}
```

- [ ] **Step 4 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/composants/composants.test.tsx
```

- [ ] **Step 5 : cocher et commiter**

```bash
git add noyau/composants/Bandeau.tsx tests/composants/composants.test.tsx tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Un bandeau qui se ferme quand on l’a lu, et qui reçoit le focus quand l’élément tenu disparaît
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 7 : `EnteteRubrique` et son action

SPEC §5.5, pièce 6. Sans action, le HTML est celui de la 1.2.0 au caractère près, comparé à
l'instantané figé à la tâche 4.

**Files:**
- Create: `tests/composants/entete-rubrique.test.tsx`
- Modify: `noyau/composants/EnteteRubrique.tsx` (réécrit en entier)

**Interfaces:**
- Consumes : `tests/instantanes/EnteteRubrique-1.2.0.tsx` (tâche 4).
- Produces : `export interface ProprietesEnteteRubrique { icone; titre; intention; action?: ReactNode | undefined }`.

- [ ] **Step 1 : le test d'abord, `tests/composants/entete-rubrique.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BookOpen, Shield } from 'lucide-react';
import { EnteteRubrique } from '../../noyau/composants/EnteteRubrique';
import { Bouton } from '../../noyau/composants/Bouton';
import { EnteteRubrique as EnteteRubrique120 } from '../instantanes/EnteteRubrique-1.2.0';

/**
 * `EnteteRubrique` et son action (SPEC 1.3.0, §5.5).
 *
 * L espace participant du Portail ne passe aucune action : son HTML ne doit pas bouger d un
 * caractere. La console en passe une, qui ne doit plus couper le filet.
 */

describe('EnteteRubrique sans action : le HTML de la 1.2.0', () => {
  const CAS = [
    { icone: Shield, titre: 'Sécurité', intention: 'Ce qui protège votre compte.' },
    { icone: BookOpen, titre: 'Mes formations', intention: 'Vos sessions, passées et à venir.' },
  ];

  for (const cas of CAS) {
    it(cas.titre, () => {
      expect(renderToStaticMarkup(<EnteteRubrique {...cas} />)).toBe(
        renderToStaticMarkup(<EnteteRubrique120 {...cas} />),
      );
    });
  }
});

describe('EnteteRubrique avec action', () => {
  function rendre() {
    return render(
      <EnteteRubrique
        icone={BookOpen}
        titre="Formations"
        intention="Les formations du catalogue, et leurs sessions."
        action={<Bouton href="/admin/formations/nouvelle">Nouvelle formation</Bouton>}
      />,
    );
  }

  it('pose l action dans l en-tete, donc au-dessus du filet, a la fin de la rangee du titre', () => {
    const { container } = rendre();
    const entete = container.querySelector('header') as HTMLElement;
    const action = screen.getByRole('link', { name: 'Nouvelle formation' });
    expect(entete).toContainElement(action);
    expect(entete.style.borderBottom).toBe('1px solid var(--bordure)');

    const rangee = screen.getByRole('heading', { level: 1 }).parentElement as HTMLElement;
    expect(rangee.style.flexWrap).toBe('wrap');
    const emplacement = rangee.lastElementChild as HTMLElement;
    expect(emplacement).toContainElement(action);
    expect(emplacement.style.marginInlineStart).toBe('auto');
  });

  it('suit le h1 dans l ordre du document, donc de la tabulation', () => {
    rendre();
    const titre = screen.getByRole('heading', { level: 1 });
    const action = screen.getByRole('link', { name: 'Nouvelle formation' });
    expect(titre.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('garde un seul h1', () => {
    rendre();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
```

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T7
```

Attendu : « rougit » : une rangée toujours en `flex-wrap` ne rend plus le HTML de la 1.2.0. Avant
l'étape 3, les trois tests avec action échouent (aucun emplacement d'action).

- [ ] **Step 3 : réécrire `noyau/composants/EnteteRubrique.tsx`**

```tsx
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icone } from './Icone';

/**
 * L en-tete d une rubrique du portail : une icone encadree, un titre, une phrase
 * d intention, un filet.
 *
 * Deux niveaux de texte ici, la ou un en-tete d ecran d authentification en porte trois. La
 * difference n est pas une inattention : sur un ecran d entree, le surtitre dit ou l on est a
 * quelqu un qui vient d arriver et ne connait pas la maison. Dans une coquille a rail, le
 * logotype coiffe le rail et la rubrique y est surlignee : un troisieme rappel serait du bruit.
 *
 * La phrase d intention dit a quoi sert la rubrique, en une phrase, jamais deux. Elle
 * remplace la ligne d aide que chaque carte porterait sinon.
 *
 * ── LE CADRE DE L ICONE EST NEUTRE, JAMAIS TEINTE PAR RUBRIQUE ──────────────
 * La reference qui a inspire cette disposition pose un disque bleu clair sur Profil et un
 * disque rose sur Securite. Le systeme de design n a pas de jeton de couleur par rubrique,
 * et employer les tons SEMANTIQUES pour cela serait une faute : `--erreur-fond` derriere
 * l icone de Securite poserait un signal d alerte permanent sur une page dont le travail est
 * justement de dire que tout va bien.
 *
 * Le cadre est donc celui d `EnteteCarte`, deja mesure : `--surface-1` est le seul jeton de
 * surface dont l ecart de clarte avec `--surface-2` n est nul dans AUCUN des deux themes, et
 * c est le filet `--bordure` qui porte la separation.
 *
 * ── LE FILET DETACHE L EN-TETE DE CE QUI SUIT ───────────────────────────────
 * Sans lui, les onglets qui viennent juste dessous se lisent comme une troisieme ligne du
 * titre. Il est ici et non dans les onglets : c est l en-tete qui se termine.
 *
 * ── IL RESTE UN COMPOSANT SERVEUR ───────────────────────────────────────────
 * Il RECOIT une icone Lucide et la rend lui-meme. Une icone est un composant React, donc une
 * fonction, et React refuse qu une fonction passe d un composant serveur a un composant
 * client : la passer plus loin ferait rendre 500 a la rubrique entiere.
 *
 * ── LE RETRAIT DE L INTENTION SUIT LE CADRE ─────────────────────────────────
 * Dans Compte, il s ecrivait `calc(40px + var(--espace-4))` : la taille du cadre, recopiee. Le
 * jour ou le cadre change, l intention se decale sans que rien ne le signale. Il se calcule
 * desormais a partir de la meme constante que le cadre, et la garde d espacement du systeme n y
 * voit plus de litteral.
 *
 * ── L ACTION DE LA RUBRIQUE, EN v1.3.0 ──────────────────────────────────────
 * Une seule, a droite du titre, sur sa rangee : « Nouvelle formation ». Posee a cote de l en-tete,
 * elle coupait son filet. La rangee passe en `flex-wrap` et l action se range a sa fin, et dessous
 * quand la place manque : toujours dans l en-tete, donc au-dessus du filet, et apres le `h1` dans
 * l ordre de tabulation. Sans action, le HTML est celui de la 1.2.0 au caractere pres : un test le
 * compare. Compte pose aussi une action unique a droite de son titre (`EnteteConsole.tsx:33`).
 */

export interface ProprietesEnteteRubrique {
  icone: LucideIcon;
  titre: string;
  intention: string;
  /**
   * L action de la rubrique, a droite du titre, sur sa rangee : « Nouvelle formation ». Une seule.
   * Elle passe sous le titre quand la rangee ne la tient plus, sans jamais couper le filet.
   */
  action?: ReactNode | undefined;
}

/** Le cote du cadre de l icone. Le retrait de l intention en depend. */
export const TAILLE_CADRE_RUBRIQUE = 40;
export function EnteteRubrique({ icone, titre, intention, action }: ProprietesEnteteRubrique) {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--espace-2)',
        paddingBottom: 'var(--espace-6)',
        borderBottom: '1px solid var(--bordure)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--espace-4)',
          ...(action === undefined ? {} : { flexWrap: 'wrap' }),
        }}
      >
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${TAILLE_CADRE_RUBRIQUE}px`,
            height: `${TAILLE_CADRE_RUBRIQUE}px`,
            borderRadius: 'var(--rayon-md)',
            background: 'var(--surface-1)',
            border: '1px solid var(--bordure)',
            color: 'var(--texte-fort)',
          }}
        >
          <Icone nom={icone} taille={20} />
        </span>

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--police-titre)',
            fontSize: 'var(--taille-2xl)',
            fontWeight: 'var(--graisse-normale)',
            lineHeight: 'var(--interligne-titre)',
            color: 'var(--texte-fort)',
          }}
        >
          {titre}
        </h1>

        {action === undefined ? null : <div style={{ marginInlineStart: 'auto' }}>{action}</div>}
      </div>

      {/*
        L intention est alignee sur le TITRE, et non sur l icone : le cadre plus l ecart qui le
        separe du titre. Sans ce retrait, la phrase commencerait sous l icone et le bloc n aurait
        plus de bord gauche.
      */}
      <p
        style={{
          margin: 0,
          marginLeft: `calc(${TAILLE_CADRE_RUBRIQUE}px + var(--espace-4))`,
          fontFamily: 'var(--police-corps)',
          fontSize: 'var(--taille-sm)',
          lineHeight: 'var(--interligne-corps)',
          color: 'var(--texte-faible)',
        }}
      >
        {intention}
      </p>
    </header>
  );
}
```

- [ ] **Step 4 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/composants/entete-rubrique.test.tsx tests/composants/briques.test.tsx
```

Attendu, constaté au plan : 23 tests verts, les cinq de l'en-tête et les dix-huit de
`briques.test.tsx`, dont ses trois sur l'en-tête, inchangés.

- [ ] **Step 5 : cocher et commiter**

```bash
git add noyau/composants/EnteteRubrique.tsx tests/composants/entete-rubrique.test.tsx tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
L’en-tête de rubrique porte son action à droite du titre, sans couper son filet, et garde le HTML de la 1.2.0 sans elle
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 8 : Le compteur d'un onglet

SPEC §5.6, pièce 7. Un nombre après le libellé, en pastille neutre masquée aux lecteurs d'écran ; le
lien porte son nom entier en `aria-label` (écart E6).

**Files:**
- Modify: `tests/composants/onglets-rubrique.test.tsx` (un bloc `describe` en fin de fichier)
- Modify: `noyau/composants/OngletsRubrique.tsx` (sept retouches)

**Interfaces:**
- Consumes : `Pastille` (`ton="neutre"`), `feuille`.
- Produces : `OngletRubrique.compteur?: number | undefined` ;
  `ProprietesOngletsRubrique.libelleCompteur?: string | undefined`.

- [ ] **Step 1 : les tests d'abord, en fin de `tests/composants/onglets-rubrique.test.tsx`**

```tsx
describe('OngletsRubrique, le compteur (1.3.0)', () => {
  const SESSION: OngletRubrique[] = [
    { id: 'vue', libelle: 'Vue d’ensemble', href: '/admin/sessions/7K3F9Q' },
    {
      id: 'participants',
      libelle: 'Participants',
      href: '/admin/sessions/7K3F9Q/participants',
      compteur: 25,
    },
    {
      id: 'ressources',
      libelle: 'Ressources',
      href: '/admin/sessions/7K3F9Q/ressources',
      compteur: 2,
    },
    { id: 'attestations', libelle: 'Attestations', href: '/admin/sessions/7K3F9Q/attestations' },
  ];

  it('se lit une fois : « Participants, 25 à traiter »', () => {
    render(<OngletsRubrique onglets={SESSION} actif="vue" libelleCompteur="à traiter" />);
    expect(screen.getByRole('link', { name: 'Participants, 25 à traiter' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ressources, 2 à traiter' })).toBeInTheDocument();
  });

  it('sans libelleCompteur, le nombre seul', () => {
    render(<OngletsRubrique onglets={SESSION} actif="vue" />);
    expect(screen.getByRole('link', { name: 'Participants, 25' })).toBeInTheDocument();
  });

  it('pose une pastille neutre, masquee aux lecteurs d ecran, en chiffres tabulaires', () => {
    render(<OngletsRubrique onglets={SESSION} actif="vue" libelleCompteur="à traiter" />);
    const lien = screen.getByRole('link', { name: 'Participants, 25 à traiter' });
    const pastille = lien.querySelector('.ai5d-onglets-r__compteur') as HTMLElement;
    expect(pastille).toHaveTextContent('25');
    expect(pastille).toHaveAttribute('aria-hidden', 'true');
    expect(pastille).toHaveAttribute('data-ton', 'neutre');
    expect(feuille()).toContain(
      '.ai5d-onglets-r__compteur { font-variant-numeric: tabular-nums; }',
    );
  });

  it('formate le nombre a la francaise, et affiche zero quand il est passe', () => {
    render(
      <OngletsRubrique
        onglets={[
          { id: 'a', libelle: 'Participants', href: '/a', compteur: 1234 },
          { id: 'b', libelle: 'Ressources', href: '/b', compteur: 0 },
        ]}
        actif="a"
      />,
    );
    expect(screen.getByRole('link', { name: 'Participants, 1 234' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ressources, 0' })).toBeInTheDocument();
  });

  it('ne rend rien sans compteur', () => {
    render(<OngletsRubrique onglets={SESSION} actif="vue" />);
    const lien = screen.getByRole('link', { name: 'Vue d’ensemble' });
    expect(lien.querySelector('.ai5d-onglets-r__compteur')).toBeNull();
    expect(lien).not.toHaveAttribute('aria-label');
  });

  it('sur l onglet actif, la pastille garde le ton neutre', () => {
    render(<OngletsRubrique onglets={SESSION} actif="participants" libelleCompteur="à traiter" />);
    const actif = screen.getByRole('link', { name: 'Participants, 25 à traiter' });
    expect(actif).toHaveAttribute('aria-current', 'page');
    expect(actif.querySelector('.ai5d-onglets-r__compteur')).toHaveAttribute('data-ton', 'neutre');
  });
});
```

`feuille()` est l'aide déjà définie plus haut dans ce fichier (le texte de `ai5d-onglets-rubrique`,
espaces réduits). Le nom attendu n'a pas d'espace avant la virgule : c'est ce que l'écart E6 corrige.

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T8
```

Attendu : « rougit » (cinq tests : le nom accessible).

- [ ] **Step 3 : `noyau/composants/OngletsRubrique.tsx`, les imports**

Après `import { feuille } from './feuille';` (posé par la tâche 2), ajouter
`import { Pastille } from './Pastille';`.

- [ ] **Step 4 : l'en-tête, avant le ` */` qui le ferme (après « première sous-page ouverte. »)**

```tsx
 *
 * ── LE COMPTEUR, EN v1.3.0 ──────────────────────────────────────────────────
 * Un nombre après le libellé : ce qui attend un geste sur cette sous-page. Le système ne l'interprète
 * pas : `compteur={0}` affiche « 0 », et c'est le produit qui décide de ne pas le passer. La pastille
 * est `neutre`, même sur l'onglet actif, qui se dit déjà par ses trois signaux ; ses chiffres sont
 * tabulaires, formatés à la française, et elle est masquée aux lecteurs d'écran.
 *
 * Le lien porte alors son nom en `aria-label` : « Participants, 25 à traiter ». Un texte hors écran
 * après le libellé faisait lire « Participants , 25 à traiter » : Chromium et jsdom insèrent une
 * espace devant un élément sorti du flux (mesuré le 28 septembre 2026). Le nom commence par le
 * libellé visible, comme l'exige la règle du nom visible inclus dans le nom accessible.
```

- [ ] **Step 5 : les types**

Dans `OngletRubrique`, après `icone?: LucideIcon | undefined;` :

```tsx
  /** Un nombre, affiché après le libellé. Absent : rien. Le produit décide ce qu'il compte. */
  compteur?: number | undefined;
```

Dans `ProprietesOngletsRubrique`, après `Lien?: ComposantLien | undefined;` :

```tsx
  /** Ce que compte le compteur, lu après lui : « à traiter ». Le même pour tous les onglets. */
  libelleCompteur?: string | undefined;
```

- [ ] **Step 6 : le format et le nom, après `const ID_STYLE = 'ai5d-onglets-rubrique';`**

```tsx

/** « 1 234 », avec l'espace fine insécable. */
const FORMAT_COMPTEUR = new Intl.NumberFormat('fr-FR');

/** « Participants, 25 à traiter », ou « Participants, 25 » sans ce que compte le compteur. */
function nomAvecCompteur(libelle: string, compteur: number, libelleCompteur?: string): string {
  const nombre = FORMAT_COMPTEUR.format(compteur);
  return libelleCompteur === undefined
    ? `${libelle}, ${nombre}`
    : `${libelle}, ${nombre} ${libelleCompteur}`;
}
```

- [ ] **Step 7 : la feuille, juste avant `@supports (animation-timeline: scroll()) {`**

```css
.ai5d-onglets-r__compteur { font-variant-numeric: tabular-nums; }

```

- [ ] **Step 8 : le rendu**

Dans la signature de `OngletsRubrique`, ajouter `libelleCompteur,` après `Lien,`. Remplacer :

```tsx
          const courant = onglet.id === actif ? 'page' : undefined;
          const contenu: ReactNode = (
            <>
              {onglet.icone === undefined ? null : <Icone nom={onglet.icone} taille={16} />}
              <span>{onglet.libelle}</span>
            </>
          );
```

par :

```tsx
          const courant = onglet.id === actif ? 'page' : undefined;
          const nom =
            onglet.compteur === undefined
              ? undefined
              : nomAvecCompteur(onglet.libelle, onglet.compteur, libelleCompteur);
          const contenu: ReactNode = (
            <>
              {onglet.icone === undefined ? null : <Icone nom={onglet.icone} taille={16} />}
              <span>{onglet.libelle}</span>
              {onglet.compteur === undefined ? null : (
                <Pastille ton="neutre" className="ai5d-onglets-r__compteur" aria-hidden="true">
                  {FORMAT_COMPTEUR.format(onglet.compteur)}
                </Pastille>
              )}
            </>
          );
```

Puis, sur le `<a>` **et** sur le `<Lien>`, ajouter `aria-label={nom}` juste après
`aria-current={courant}`. `undefined` retire l'attribut : un onglet sans compteur garde le nom de son
contenu, comme en 1.2.0.

- [ ] **Step 9 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/composants/onglets-rubrique.test.tsx
```

Attendu, constaté au plan : 26 tests verts, les vingt de la 1.2.0 et les six du compteur.

- [ ] **Step 10 : cocher et commiter**

```bash
git add noyau/composants/OngletsRubrique.tsx tests/composants/onglets-rubrique.test.tsx tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Un onglet compte ce qui y attend un geste, et le dit une fois : « Participants, 25 à traiter »
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 9 : `Chiffre` compact, et `SqueletteIndicateurs compact`

SPEC §5.7, pièce 11. `ProprietesChiffre` devient une union : la tuile de la 1.2.0, inchangée, ou une
ligne qui se lit comme une phrase et mène où elle le dit.

**Files:**
- Modify: `tests/composants/composants.test.tsx` (les imports, deux blocs `describe` en fin de fichier)
- Modify: `noyau/composants/Chiffre.tsx` (réécrit en entier)
- Modify: `noyau/composants/Squelette.tsx:286-318` (`SqueletteIndicateurs`)

**Interfaces:**
- Consumes : `Carte`, `feuille`, `ComposantLien`.
- Produces : `export type ProprietesChiffre = ProprietesChiffreCarte | ProprietesChiffreCompact` ;
  `export const STYLE_CHIFFRE`, clé `ai5d-chiffre` ; `SqueletteIndicateurs` accepte `compact?: boolean`.

- [ ] **Step 1 : les tests d'abord, dans `tests/composants/composants.test.tsx`**

Dans les imports : ajouter `import type { ComponentProps } from 'react';` avant l'import de
`'../../noyau/composants'` ; ajouter `Chiffre,` après `Champ,` et `SqueletteIndicateurs,` après
`PastilleEtat,` dans cet import ; ajouter après lui
`import type { ComposantLien } from '../../noyau/composants';`. Puis, en fin de fichier :

```tsx
describe('Chiffre compact (1.3.0)', () => {
  it('se lit comme une phrase, sans carte, en chiffres tabulaires', () => {
    const { container } = render(
      <Chiffre compact valeur="212" libelle="inscriptions sur 237 personnes" />,
    );
    const racine = container.querySelector('.ai5d-chiffre') as HTMLElement;
    expect(racine.tagName).toBe('SPAN');
    expect(racine).toHaveAttribute('data-compact', '');
    expect(racine.textContent).toBe('212inscriptions sur 237 personnes');
    const css = texteFeuille('ai5d-chiffre').replace(/\s+/g, ' ');
    expect(css).toContain('.ai5d-chiffre__valeur { font-family: var(--police-titre);');
    expect(css).toContain('font-size: var(--taille-lg);');
    expect(css).toContain('font-variant-numeric: tabular-nums;');
  });

  it('mene a la liste qu il compte quand il porte une adresse, par le lien du produit', () => {
    const recus: Array<ComponentProps<ComposantLien>> = [];
    const Lien: ComposantLien = (proprietes) => {
      recus.push(proprietes);
      const { children, ...reste } = proprietes;
      return <a {...reste}>{children}</a>;
    };
    render(
      <Chiffre
        compact
        valeur="8"
        libelle="invitations non acceptées"
        href="/admin/sessions/7K3F9Q/participants?filtre=invitees"
        Lien={Lien}
      />,
    );
    expect(screen.getByRole('link', { name: '8 invitations non acceptées' })).toHaveClass(
      'ai5d-chiffre',
    );
    expect(recus.map((recu) => recu.href)).toEqual([
      '/admin/sessions/7K3F9Q/participants?filtre=invitees',
    ]);
  });

  it('en lien : libelle en bleu, souligne au survol des pointeurs fins, appui sans transition', () => {
    render(<Chiffre compact valeur="8" libelle="invitations non acceptées" href="/invitees" />);
    const css = texteFeuille('ai5d-chiffre').replace(/\s+/g, ' ');
    expect(css).toContain('.ai5d-chiffre[href] .ai5d-chiffre__libelle { color: var(--action); }');
    expect(css).toContain(
      '@media (hover: hover) { .ai5d-chiffre[href]:hover .ai5d-chiffre__libelle { text-decoration: underline;',
    );
    expect(css).toContain(
      '.ai5d-chiffre[href]:active { background: var(--surface-selection); transition: none; }',
    );
    expect(
      texteFeuille('ai5d-chiffre').replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, ''),
    ).not.toContain(':hover');
  });

  it('sans adresse, ne promet aucun deplacement : ni lien, ni regle qui le vise', () => {
    render(<Chiffre compact valeur="237" libelle="personnes" />);
    expect(screen.queryByRole('link')).toBeNull();
    const regles = texteFeuille('ai5d-chiffre')
      .split('}')
      .filter((regle) => /:hover|:active|:focus-visible|--action/.test(regle));
    for (const regle of regles) expect(regle).toContain('[href]');
  });

  it('la tuile de la 1.2.0 ne change pas, et ne pose aucune feuille', () => {
    const { container } = render(
      <Chiffre valeur="42" libelle="Comptes créés" cible="Cible : 50" />,
    );
    expect(container.querySelector('.ai5d-chiffre')).toBeNull();
    expect(screen.getByText('42')).toHaveStyle({ fontFamily: 'var(--police-titre)' });
  });
});

describe('SqueletteIndicateurs compact (1.3.0)', () => {
  it('rend la forme d une rangee de Chiffre compacts : des blocs d une ligne, sans tuile', () => {
    const { container } = render(<SqueletteIndicateurs compact nombre={6} />);
    const rangee = container.querySelector('[data-forme="indicateurs"]') as HTMLElement;
    expect(rangee).toHaveAttribute('data-compact', '');
    expect(rangee.style.display).toBe('flex');
    expect(rangee.style.flexWrap).toBe('wrap');
    expect(rangee.style.gap).toBe('var(--espace-6)');
    const blocs = container.querySelectorAll<HTMLElement>('.ai5d-squelette');
    expect(blocs).toHaveLength(6);
    expect(blocs[0]?.style.height).toBe('calc(var(--taille-lg) * var(--interligne-titre))');
    expect(blocs[0]?.style.width).toBe('10rem');
    expect(blocs[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('sans compact, la grille de tuiles de la 1.2.0', () => {
    const { container } = render(<SqueletteIndicateurs nombre={3} />);
    const grille = container.querySelector('[data-forme="indicateurs"]') as HTMLElement;
    expect(grille.style.display).toBe('grid');
    expect(grille).not.toHaveAttribute('data-compact');
  });
});
```

Le nom accessible d'un indicateur en lien est « 8 invitations non acceptées », avec l'espace que le
navigateur pose entre deux éléments d'un conteneur flexible : c'est ce que dit le §5.7.3 (« lien, 212
inscriptions sur 237 personnes »).

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T9
```

Attendu : deux lignes « rougit ». Avant l'étape 3, `compact` n'existe pas et le typage refuse les
appels du test.

- [ ] **Step 3 : réécrire `noyau/composants/Chiffre.tsx`**

`cible?: string` et `mise?: boolean` gardent leur forme exacte, sans `| undefined` : les quatre appels
du Portail (`app/admin/page.tsx:40-56`) compilent tels quels (G2, G13).

```tsx
import { Carte } from './Carte';
import { feuille } from './feuille';
import type { ComposantLien } from './LiensRail';

/**
 * Un chiffre d exploitation, avec son libelle et sa cible quand le produit en fixe une.
 *
 * ── AUCUN GRAPHIQUE, ET C EST UN CHOIX ──────────────────────────────────────
 * Une courbe demande une serie, une serie demande une historisation, et une historisation
 * demande une table qu il faudrait purger. Pour sept chiffres qu une personne regarde une
 * fois par semaine, c est une infrastructure entiere pour un usage que rien ne reclame.
 *
 * Un chiffre nu se lit en une seconde, et la question qu il pose - « est-ce que ca monte » -
 * se repond en le comparant a la cible ecrite a cote, pas a une pente.
 *
 * ── LA CIBLE VIENT D UN DOCUMENT, PAS D UNE INTUITION ───────────────────────
 * Quand elle est absente, le chiffre est un simple constat. Quand elle est la, le produit la
 * recopie du document qui la fixe, avec sa reference : c est ce qui permet de discuter le
 * chiffre sans discuter la cible.
 *
 * ── LA FORME COMPACTE, EN v1.3.0 ────────────────────────────────────────────
 * Une ligne et non une tuile : la valeur et le libelle se lisent comme une phrase, « 212
 * inscriptions sur 237 personnes ». Avec `href`, l indicateur entier mene a la liste qu il compte :
 * libelle en bleu d action, souligne au survol ; sans lien, ni l un ni l autre, il ne promet pas un
 * deplacement. Les chiffres sont tabulaires. La valeur est en Fraunces : c est le systeme qui
 * l ecrit, et non un produit.
 */

/** La tuile de la 1.2.0, inchangee. */
interface ProprietesChiffreCarte {
  valeur: string;
  libelle: string;
  /** Recopiee du document du produit quand il en fixe une. Absente sinon. */
  cible?: string;
  /** Le chiffre qui porte l ecran. Un seul par page, sinon plus rien ne ressort. */
  mise?: boolean;
  compact?: false | undefined;
  href?: undefined;
  Lien?: undefined;
}

/** Une ligne : la valeur et le libelle se lisent comme une phrase, sans carte. */
interface ProprietesChiffreCompact {
  valeur: string;
  libelle: string;
  compact: true;
  /** Present : l indicateur entier est un lien vers la liste qu il compte. */
  href?: string | undefined;
  /** Le lien du routeur du produit ; `a` par defaut. */
  Lien?: ComposantLien | undefined;
  cible?: undefined;
  mise?: undefined;
}

export type ProprietesChiffre = ProprietesChiffreCarte | ProprietesChiffreCompact;

const ID_STYLE = 'ai5d-chiffre';

/*
  Le survol souligne le libelle et rien d autre : un changement de fond ferait d une phrase un
  bouton. Seul un indicateur qui porte une adresse reagit.
*/
export const STYLE_CHIFFRE = `
.ai5d-chiffre[data-compact] {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--espace-2);
  border-radius: var(--rayon-sm);
  color: inherit;
  text-decoration: none;
}
.ai5d-chiffre__valeur {
  font-family: var(--police-titre);
  font-weight: var(--graisse-normale);
  font-size: var(--taille-lg);
  line-height: var(--interligne-titre);
  color: var(--texte-fort);
  font-variant-numeric: tabular-nums;
}
.ai5d-chiffre__libelle {
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
  color: var(--texte);
  font-variant-numeric: tabular-nums;
}
.ai5d-chiffre[href] .ai5d-chiffre__libelle { color: var(--action); }
@media (hover: hover) {
  .ai5d-chiffre[href]:hover .ai5d-chiffre__libelle {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
}
.ai5d-chiffre[href]:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }
.ai5d-chiffre[href]:active { background: var(--surface-selection); transition: none; }
`;

function ChiffreCompact({ valeur, libelle, href, Lien }: ProprietesChiffreCompact) {
  const contenu = (
    <>
      <span className="ai5d-chiffre__valeur">{valeur}</span>
      <span className="ai5d-chiffre__libelle">{libelle}</span>
    </>
  );

  return (
    <>
      {feuille(ID_STYLE, STYLE_CHIFFRE)}
      {href === undefined ? (
        <span className="ai5d-chiffre" data-compact="">
          {contenu}
        </span>
      ) : Lien === undefined ? (
        <a className="ai5d-chiffre" data-compact="" href={href}>
          {contenu}
        </a>
      ) : (
        <Lien className="ai5d-chiffre" data-compact="" href={href}>
          {contenu}
        </Lien>
      )}
    </>
  );
}

export function Chiffre(proprietes: ProprietesChiffre) {
  if (proprietes.compact === true) return <ChiffreCompact {...proprietes} />;

  const { valeur, libelle, cible, mise } = proprietes;
  return (
    <Carte>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espace-1)' }}>
        <span
          style={{
            fontFamily: 'var(--police-titre)',
            fontSize: mise === true ? 'var(--taille-2xl)' : 'var(--taille-xl)',
            color: mise === true ? 'var(--action)' : 'var(--texte-fort)',
            lineHeight: 'var(--interligne-titre)',
          }}
        >
          {valeur}
        </span>

        <span style={{ color: 'var(--texte-fort)' }}>{libelle}</span>

        {cible === undefined ? null : (
          <span style={{ color: 'var(--texte-faible)', fontSize: 'var(--taille-xs)' }}>
            {cible}
          </span>
        )}
      </div>
    </Carte>
  );
}
```

- [ ] **Step 4 : `SqueletteIndicateurs` dans `noyau/composants/Squelette.tsx`**

Remplacer les lignes 286 à 318, du `/**` placé au-dessus de « Les tuiles d indicateurs d un tableau de
bord. » jusqu'à la fin de la fonction `SqueletteIndicateurs`, par :

```tsx
/**
 * Les tuiles d indicateurs d un tableau de bord.
 *
 * La disposition arrive en propriete : deux colonnes sur telephone puis quatre chez un dirigeant,
 * trois d emblee en console. Une valeur par defaut qui ne correspondrait a aucun des deux ferait
 * toujours sauter l un des ecrans.
 *
 * `compact` (1.3.0) rend la forme d une rangee de `Chiffre` compacts : des blocs d une ligne, a la
 * hauteur d une valeur, et non des tuiles de 5rem qui promettraient autre chose.
 */
export function SqueletteIndicateurs({
  nombre = 4,
  colonnes = 'repeat(2, 1fr)',
  colonnesLarges = 'repeat(4, 1fr)',
  compact = false,
}: {
  nombre?: number;
  colonnes?: string;
  colonnesLarges?: string;
  /** La forme d une rangee de `Chiffre` compacts : des blocs d une ligne, sans tuile. */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--espace-6)' }}
        data-forme="indicateurs"
        data-compact=""
      >
        {Array.from({ length: nombre }, (_, i) => (
          <Squelette
            key={i}
            hauteur="calc(var(--taille-lg) * var(--interligne-titre))"
            largeur="10rem"
            rayon="sm"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: colonnes,
        gap: 'var(--espace-4)',
      }}
      data-forme="indicateurs"
      data-colonnes-larges={colonnesLarges}
    >
      {Array.from({ length: nombre }, (_, i) => (
        <Squelette key={i} hauteur="5rem" rayon="md" />
      ))}
    </div>
  );
}
```

- [ ] **Step 5 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/composants/composants.test.tsx tests/composants/briques.test.tsx tests/composants/squelette.test.tsx
```

- [ ] **Step 6 : cocher et commiter**

```bash
git add noyau/composants/Chiffre.tsx noyau/composants/Squelette.tsx tests/composants/composants.test.tsx tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Un chiffre qui se lit comme une phrase et mène à la liste qu’il compte, et son squelette à la forme d’une rangée
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 10 : `MenuActions`

SPEC §5.3, pièce 4 ; deuxième consommateur constaté dans le SDK (`UserButton.tsx:100-139`). Le premier
composant client du lot : état ouvert, focus itinérant, écoute de `toggle`. Le menu vit dans la couche
supérieure (`popover="auto"`), se place par l'ancre CSS ou, sans elle, par une mesure à l'ouverture.

**Files:**
- Create: `tests/composants/menu-actions.test.tsx`
- Create: `noyau/composants/MenuActions.tsx`

**Interfaces:**
- Consumes : `Bouton` (le déclencheur, `discret` `sm`, qui transmet `aria-*`, `popoverTarget`,
  `onKeyDown` et `style` par `...reste`), `Icone`, `Ellipsis`, `feuille`, `relSur`,
  `MENTION_NOUVEL_ONGLET`, `CLASSE_HORS_ECRAN`, `ID_STYLE_HORS_ECRAN`, `STYLE_HORS_ECRAN` de `lien.ts`,
  `ComposantLien`, `--surface-survol` (tâche 4).
- Produces : `ActionMenuLien`, `ActionMenuGeste`, `ActionMenu` (union : un lien **ou** un geste),
  `ProprietesMenuActions { libelle; actions; declencheur?; Lien? }`, `MenuActions`, `STYLE_MENU`
  (clé `ai5d-menu-actions`).

- [ ] **Step 1 : le test d'abord, `tests/composants/menu-actions.test.tsx`**

Le fichier dit en tête ce que jsdom ne prouve pas (leçon « jsdom ne connaît pas `showModal()` ») : il
double `showPopover` et `hidePopover`, et émet `toggle` comme le navigateur. `CSS.supports` n'existe
pas dans jsdom : le composant y prend le chemin du repli, ce qui permet de tester la fermeture au
défilement.

```tsx
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'react';
import { MenuActions, type ActionMenu } from '../../noyau/composants/MenuActions';
import type { ComposantLien } from '../../noyau/composants/LiensRail';
import { MENTION_NOUVEL_ONGLET } from '../../noyau/composants/lien';
import { texteFeuille } from '../aides/feuille';

/**
 * `MenuActions` (SPEC 1.3.0, §5.3).
 *
 * CE QUE CE FICHIER NE PROUVE PAS. jsdom 25 n'implémente ni `showPopover()`, ni `hidePopover()`, ni
 * l'évènement `toggle`, ni la couche supérieure, ni la fermeture au clic extérieur, ni Échap côté
 * navigateur, ni l'ancre CSS. Les tests doublent les deux méthodes et émettent `toggle` à la main,
 * comme le ferait le navigateur : ils prouvent la structure, l'ordre, le focus que le composant pose
 * lui-même et sa feuille. Le reste se constate dans Chromium (docs/preuves/1.3.0/menu-navigateurs.md).
 */

const ouverts = new WeakSet<HTMLElement>();
const montrer = vi.fn();
const cacher = vi.fn();
const originaux = {
  show: HTMLElement.prototype.showPopover,
  hide: HTMLElement.prototype.hidePopover,
};

/** Ce que fait le navigateur : l'état change, puis `toggle` est émis sur l'élément. */
function emettre(element: HTMLElement, etat: 'open' | 'closed') {
  const evenement = new Event('toggle');
  Object.defineProperty(evenement, 'newState', { value: etat });
  Object.defineProperty(evenement, 'oldState', { value: etat === 'open' ? 'closed' : 'open' });
  element.dispatchEvent(evenement);
}

beforeAll(() => {
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    montrer(this.id);
    if (ouverts.has(this)) return;
    ouverts.add(this);
    emettre(this, 'open');
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    cacher(this.id);
    if (!ouverts.has(this)) return;
    ouverts.delete(this);
    emettre(this, 'closed');
  };
});

afterAll(() => {
  HTMLElement.prototype.showPopover = originaux.show;
  HTMLElement.prototype.hidePopover = originaux.hide;
});

const corriger = vi.fn();
const bloquer = vi.fn();
const retirer = vi.fn();

const ACTIONS: ActionMenu[] = [
  { id: 'retirer', libelle: 'Retirer de la session', grave: true, onChoisir: retirer },
  { id: 'corriger', libelle: 'Corriger l’adresse', onChoisir: corriger },
  { id: 'fiche', libelle: 'Voir la fiche', href: '/admin/personnes/7K3F9Q' },
  { id: 'bloquer', libelle: 'Bloquer', onChoisir: bloquer },
];

function rendre(actions: readonly ActionMenu[] = ACTIONS) {
  const rendu = render(<MenuActions libelle="Actions pour Aïssatou Camara" actions={actions} />);
  const declencheur = screen.getByRole('button', { name: 'Actions pour Aïssatou Camara' });
  const menu = screen.getByRole('menu', { hidden: true });
  return { ...rendu, declencheur, menu };
}

function libelles(menu: HTMLElement): string[] {
  return within(menu)
    .getAllByRole('menuitem', { hidden: true })
    .map((element) => element.textContent ?? '');
}

describe('MenuActions : la structure', () => {
  it('lie le declencheur au menu par aria et par popovertarget', () => {
    const { declencheur, menu } = rendre();
    expect(declencheur).toHaveAttribute('aria-haspopup', 'menu');
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
    expect(declencheur).toHaveAttribute('aria-controls', menu.id);
    expect(declencheur).toHaveAttribute('popovertarget', menu.id);
    expect(declencheur).toHaveAttribute('data-variante', 'discret');
    expect(declencheur).toHaveAttribute('data-taille', 'sm');
    expect(menu).toHaveAttribute('popover', 'auto');
    expect(menu).toHaveAttribute('aria-label', 'Actions pour Aïssatou Camara');
    expect(menu.id).toMatch(/^ai5d-menu-[a-zA-Z0-9_-]+$/);
  });

  it('range les gestes graves apres un filet, chacun dans l ordre recu', () => {
    const { menu } = rendre();
    expect(libelles(menu)).toEqual([
      'Corriger l’adresse',
      'Voir la fiche',
      'Bloquer',
      'Retirer de la session',
    ]);
    const enfants = [...menu.children].map((enfant) => enfant.getAttribute('role'));
    expect(enfants).toEqual(['menuitem', 'menuitem', 'menuitem', 'separator', 'menuitem']);
    expect(within(menu).getByText('Retirer de la session')).toHaveAttribute('data-grave', '');
  });

  it('ne pose aucun filet quand aucune action n est grave', () => {
    const { menu } = rendre([{ id: 'bloquer', libelle: 'Bloquer', onChoisir: bloquer }]);
    expect(menu.querySelector('[role="separator"]')).toBeNull();
  });

  it('ne rend rien, ni declencheur ni menu, sans action', () => {
    const { container } = render(
      <MenuActions libelle="Actions pour Aïssatou Camara" actions={[]} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('passe un lien interne par le lien du produit', () => {
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
    render(<MenuActions libelle="Actions de la formation" actions={ACTIONS} Lien={Lien} />);
    expect(recus.map((recu) => recu.href)).toEqual(['/admin/personnes/7K3F9Q']);
    expect(recus[0]?.role).toBe('menuitem');
  });

  it('ouvre un nouvel onglet par un a natif, rel complete et mention lue', () => {
    const recus: unknown[] = [];
    const Lien: ComposantLien = (proprietes) => {
      recus.push(proprietes);
      return null;
    };
    render(
      <MenuActions
        libelle="Actions de l’attestation"
        Lien={Lien}
        actions={[
          {
            id: 'verifier',
            libelle: 'Voir la page de vérification',
            href: 'https://exemple.invalid/verifier/7K3F9Q',
            nouvelOnglet: true,
          },
        ]}
      />,
    );
    const lien = screen.getByRole('menuitem', {
      hidden: true,
      name: `Voir la page de vérification ${MENTION_NOUVEL_ONGLET}`,
    });
    expect(recus).toHaveLength(0);
    expect(lien.tagName).toBe('A');
    expect(lien).toHaveAttribute('target', '_blank');
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer');
    expect(texteFeuille('ai5d-hors-ecran')).toContain('.ai5d-hors-ecran');
  });

  it('avec un declencheur visible, le nom est ce qui est ecrit : aucun aria-label', () => {
    render(
      <MenuActions
        libelle="Menu du compte"
        declencheur={<span>Aïssatou Camara</span>}
        actions={[{ id: 'compte', libelle: 'Mon compte', href: '/accueil' }]}
      />,
    );
    const declencheur = screen.getByRole('button', { name: 'Aïssatou Camara' });
    expect(declencheur).not.toHaveAttribute('aria-label');
    expect(screen.getByRole('menu', { hidden: true })).toHaveAttribute(
      'aria-label',
      'Menu du compte',
    );
  });
});

describe('MenuActions : le clavier, sur la mecanique doublee', () => {
  it('fleche bas sur le declencheur ouvre sur le premier element', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    expect(montrer).toHaveBeenLastCalledWith(menu.id);
    expect(declencheur).toHaveAttribute('aria-expanded', 'true');
    expect(document.activeElement).toHaveTextContent('Corriger l’adresse');
  });

  it('fleche haut sur le declencheur ouvre sur le dernier element', () => {
    const { declencheur } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowUp' });
    expect(document.activeElement).toHaveTextContent('Retirer de la session');
  });

  it('les fleches bouclent, sautent le filet, et un seul element est dans la tabulation', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    const ordre: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      ordre.push(document.activeElement?.textContent ?? '');
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
    }
    expect(ordre).toEqual([
      'Corriger l’adresse',
      'Voir la fiche',
      'Bloquer',
      'Retirer de la session',
      'Corriger l’adresse',
    ]);
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toHaveTextContent('Retirer de la session');
    const tabulables = within(menu)
      .getAllByRole('menuitem', { hidden: true })
      .filter((element) => element.tabIndex === 0);
    expect(tabulables).toEqual([document.activeElement]);
  });

  it('Debut et Fin vont aux extremites', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement).toHaveTextContent('Retirer de la session');
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(document.activeElement).toHaveTextContent('Corriger l’adresse');
  });

  it('Echap referme et rend le focus au declencheur, sans se reposer sur le navigateur', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(cacher).toHaveBeenLastCalledWith(menu.id);
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(declencheur);
  });

  it('Tab referme et rend le focus au declencheur', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Tab' });
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(declencheur);
  });

  it('choisir un geste referme le menu et rend le focus AVANT d appeler onChoisir', async () => {
    const constat: Array<{ focus: Element | null; fermetures: number }> = [];
    const { declencheur } = rendre([
      {
        id: 'corriger',
        libelle: 'Corriger l’adresse',
        onChoisir: () =>
          constat.push({ focus: document.activeElement, fermetures: cacher.mock.calls.length }),
      },
    ]);
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    cacher.mockClear();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Corriger l’adresse' }));
    expect(constat).toEqual([{ focus: declencheur, fermetures: 1 }]);
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
  });

  it('sans ancre CSS, un defilement de la fenetre referme le menu plutot que de le laisser flotter', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    fireEvent.scroll(window);
    expect(cacher).toHaveBeenLastCalledWith(menu.id);
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('MenuActions : la feuille', () => {
  function feuille(): string {
    render(<MenuActions libelle="Actions" actions={ACTIONS} />);
    return texteFeuille('ai5d-menu-actions').replace(/\s+/g, ' ');
  }

  it('garde le survol aux pointeurs fins, sur la surface de survol', () => {
    const css = feuille();
    expect(css).toContain(
      "@media (hover: hover) { .ai5d-menu__element:not([aria-disabled='true']):hover { background: var(--surface-survol); } }",
    );
    const brut = texteFeuille('ai5d-menu-actions');
    expect(brut.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')).not.toContain(':hover');
  });

  it('pose l appui sans transition, et un anneau a l interieur', () => {
    const css = feuille();
    expect(css).toContain(
      ".ai5d-menu__element:not([aria-disabled='true']):active { background: var(--surface-selection); transition: none; }",
    );
    expect(css).toContain('outline-offset: -2px;');
    expect(css).toContain('.ai5d-menu__element[data-grave] { color: var(--erreur); }');
    expect(css).toContain(
      '.ai5d-menu__element[data-grave]:focus-visible { outline-color: var(--erreur); }',
    );
  });

  it('ne pose display que sous :popover-open, sans quoi un menu ferme resterait affiche', () => {
    const css = feuille();
    const base = css.slice(
      css.indexOf('.ai5d-menu__liste {'),
      css.indexOf('.ai5d-menu__liste:popover-open'),
    );
    expect(base).not.toContain('display');
    expect(css).toContain('.ai5d-menu__liste:popover-open { display: flex;');
  });

  it('se place par l ancre la ou le moteur la connait, et borne sa largeur en rem', () => {
    const css = feuille();
    expect(css).toContain('@supports (anchor-name: --a)');
    expect(css).toContain('position-area: block-end span-inline-start;');
    expect(css).toContain('min-inline-size: 12rem; max-inline-size: 20rem;');
  });

  it('ouvre en duree courte, et ne garde qu un fondu sous mouvement reduit', () => {
    const css = feuille();
    expect(css).toContain('animation: ai5d-menu-entree var(--duree-courte) var(--courbe-sortie);');
    const reduit = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduit).toContain('ai5d-menu-fondu');
    expect(reduit).not.toContain('transform');
  });

  it('se declare module client', () => {
    expect(
      readFileSync('noyau/composants/MenuActions.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(true);
  });
});
```

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T10
```

Attendu : trois lignes « rougit ». Sans `MenuActions.tsx`, le fichier ne se charge pas ; `onChoisir`
appelé avant le retour du focus fait rougir le test qui le constate ; des gestes graves qui ne sont
plus rangés à part en font rougir quatre.

- [ ] **Step 3 : écrire `noyau/composants/MenuActions.tsx`**

Trois points que le code tient et que la SPEC laissait implicites. Le menu ne pose `display` que sous
`:popover-open` : une règle d'auteur sur `.ai5d-menu__liste` battrait la règle du navigateur qui cache
un popover fermé. L'identifiant de `useId` est nettoyé avant de nommer l'ancre (Review Focus 4). Le
filet n'apparaît qu'entre des actions des deux sortes (écart E10).

```tsx
'use client';

import { Ellipsis } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode, ToggleEvent } from 'react';
import { Bouton } from './Bouton';
import { feuille } from './feuille';
import { Icone } from './Icone';
import type { ComposantLien } from './LiensRail';
import {
  CLASSE_HORS_ECRAN,
  ID_STYLE_HORS_ECRAN,
  MENTION_NOUVEL_ONGLET,
  STYLE_HORS_ECRAN,
  relSur,
} from './lien';

/**
 * Le menu des gestes d'une ligne, d'un objet, d'un compte.
 *
 * ── POURQUOI IL MONTE, EN v1.3.0 ────────────────────────────────────────────
 * La console du Portail en demande un par ligne de table ; le SDK `@ai5d/auth` en écrit un à la main
 * pour le menu de compte (`UserButton.tsx:100-139`), sans flèches, sans Échap, sans fermeture au
 * clic extérieur, large de 200 pixels. Deux produits, un besoin : décision 012.
 *
 * ── IL VIT DANS LA COUCHE SUPÉRIEURE ────────────────────────────────────────
 * `popover="auto"` : le menu sort de tout conteneur à défilement sans portail React, se referme au
 * clic extérieur et à Échap, et le navigateur rend le focus au déclencheur qui porte
 * `popovertarget`. Il se place par l'ancre CSS là où le moteur la connaît ; ailleurs, par une mesure
 * à l'ouverture, et il se referme au premier défilement plutôt que de flotter à une place fausse.
 *
 * ── LE CLAVIER EST CELUI DU MOTIF « BOUTON DE MENU » ────────────────────────
 * Flèches, Début, Fin, Échap et Tab. Un seul élément porte `tabindex="0"` à la fois. Choisir un geste
 * referme le menu et rend le focus au déclencheur AVANT d'appeler `onChoisir` : une boîte de
 * confirmation ouverte par le geste trouve le focus là, et l'y rendra en se fermant.
 *
 * ── LES GESTES QUI DÉFONT SONT RANGÉS À PART ────────────────────────────────
 * Après un filet, en `--erreur`, dans l'ordre reçu. Le libellé nomme le geste : la couleur n'est
 * jamais seule. Un menu sans action ne rend rien : un bouton qui n'ouvre rien est un piège.
 *
 * jsdom ne connaît ni `showPopover()` ni l'évènement `toggle` : le clavier se prouve au navigateur
 * (docs/preuves/1.3.0/menu-navigateurs.md), et les tests doublent l'API.
 */

interface ActionMenuCommune {
  /** Identifiant stable dans le menu. */
  id: string;
  /** Le verbe et son objet : « Corriger l’adresse ». */
  libelle: string;
  /** Un geste qui défait : rangé après un filet, écrit en `--erreur`. */
  grave?: boolean | undefined;
}

/** Une destination : l'élément du menu est un lien. */
export interface ActionMenuLien extends ActionMenuCommune {
  href: string;
  /** Un nouvel onglet : `<a target="_blank">` natif, `rel` complété, mention lue. */
  nouvelOnglet?: boolean | undefined;
  onChoisir?: undefined;
}

/** Un geste : l'élément du menu est un bouton. Le menu se referme avant l'appel. */
export interface ActionMenuGeste extends ActionMenuCommune {
  onChoisir: () => void;
  href?: undefined;
  nouvelOnglet?: undefined;
}

export type ActionMenu = ActionMenuLien | ActionMenuGeste;

export interface ProprietesMenuActions {
  /**
   * Le nom du menu : « Actions pour Aïssatou Camara ». Sans `declencheur`, c'est aussi le nom du
   * bouton qui l'ouvre.
   */
  libelle: string;
  /** Les actions, dans l'ordre voulu ; les graves sont rangées après les autres. Vide : rien n'est rendu. */
  actions: readonly ActionMenu[];
  /**
   * Le contenu visible du déclencheur, quand il a un nom visible (le menu de compte du SDK : l'avatar
   * et le nom). Absent : l'icône `Ellipsis` de 16 px, et `libelle` pour nom accessible.
   */
  declencheur?: ReactNode | undefined;
  /** Le lien du routeur du produit ; `a` par défaut. Ignoré pour un nouvel onglet. */
  Lien?: ComposantLien | undefined;
}

const ID_STYLE = 'ai5d-menu-actions';

/*
  La prose vit ici, jamais dans la chaine : un accent grave la terminerait.

  Le menu ne pose display que sous :popover-open. Une regle d auteur sur .ai5d-menu__liste battrait
  la regle du navigateur qui cache un popover ferme, et le menu resterait affiche.

  L anneau d un element est decale de -2 px, a l interieur : a l exterieur, le bord du menu le
  couperait. L ouverture reprend la duree et la courbe des dialogues, par leurs jetons de base : une
  ouverture n est pas un depart, et le role --mouvement-sortie ne lui revient pas.
*/
export const STYLE_MENU = `
.ai5d-menu { display: inline-flex; }
.ai5d-menu > .ai5d-bouton[aria-expanded='true'] { background: var(--surface-selection); }

.ai5d-menu__liste {
  box-sizing: border-box;
  margin: 0;
  inset: auto;
  min-inline-size: 12rem;
  max-inline-size: 20rem;
  padding: var(--espace-1);
  background: var(--surface-3);
  color: var(--texte);
  border: 1px solid var(--bordure);
  border-radius: var(--rayon-md);
  box-shadow: var(--elevation-3);
}
.ai5d-menu__liste:popover-open {
  display: flex;
  flex-direction: column;
  animation: ai5d-menu-entree var(--duree-courte) var(--courbe-sortie);
}
@keyframes ai5d-menu-entree {
  from { opacity: 0; transform: translateY(calc(var(--espace-1) * -1)); }
  to { opacity: 1; transform: none; }
}
@supports (anchor-name: --a) {
  .ai5d-menu__liste {
    position-area: block-end span-inline-start;
    position-try-fallbacks: flip-block, flip-inline;
    margin-block-start: var(--espace-1);
  }
}

.ai5d-menu__element {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  inline-size: 100%;
  min-block-size: var(--hauteur-controle);
  padding: 0 var(--espace-3);
  border: 0;
  border-radius: var(--rayon-sm);
  background: transparent;
  color: var(--texte);
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
  font-weight: var(--graisse-normale);
  line-height: var(--interligne-corps);
  text-align: start;
  text-decoration: none;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition: background var(--mouvement-retour);
}
@media (hover: hover) {
  .ai5d-menu__element:not([aria-disabled='true']):hover { background: var(--surface-survol); }
}
.ai5d-menu__element:focus-visible {
  background: var(--surface-survol);
  outline: 2px solid var(--action);
  outline-offset: -2px;
}
.ai5d-menu__element:not([aria-disabled='true']):active { background: var(--surface-selection); transition: none; }
.ai5d-menu__element[data-grave] { color: var(--erreur); }
.ai5d-menu__element[data-grave]:focus-visible { outline-color: var(--erreur); }

.ai5d-menu__filet { block-size: 1px; margin: var(--espace-1) 0; background: var(--bordure); }

@media (prefers-reduced-motion: reduce) {
  .ai5d-menu__liste:popover-open { animation: ai5d-menu-fondu var(--duree-courte) linear; }
  @keyframes ai5d-menu-fondu {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
`;

/** Vrai quand le moteur place le menu par l'ancre CSS ; faux dans jsdom et les moteurs qui ne la connaissent pas. */
function ancreConnue(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    ? CSS.supports('anchor-name: --a')
    : false;
}

/** Les actions dans l'ordre du menu : les autres, puis les graves, chacune dans l'ordre reçu. */
function ordonner(actions: readonly ActionMenu[]): { autres: ActionMenu[]; graves: ActionMenu[] } {
  return {
    autres: actions.filter((action) => action.grave !== true),
    graves: actions.filter((action) => action.grave === true),
  };
}

export function MenuActions({ libelle, actions, declencheur, Lien }: ProprietesMenuActions) {
  const brut = useId();
  // `useId` rend `_R_1_` en React 19.2, `:r1:` en 19.0 : l'identifiant nomme aussi une ancre CSS.
  const cle = brut.replace(/[^a-zA-Z0-9_-]/g, '');
  const idMenu = `ai5d-menu-${cle}`;
  const ancre = `--ai5d-menu-${cle}`;

  const racine = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const ouvertRef = useRef(false);
  const cibleOuverture = useRef<'premier' | 'dernier'>('premier');
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);

  const elements = () => [
    ...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
  ];
  const declencheurRendu = () =>
    racine.current?.querySelector<HTMLButtonElement>(':scope > button') ?? null;

  function allerA(index: number) {
    const liste = elements();
    if (liste.length === 0) return;
    const borne = ((index % liste.length) + liste.length) % liste.length;
    setActif(borne);
    liste[borne]?.focus({ preventScroll: true });
  }

  function fermer() {
    if (ouvertRef.current) menu.current?.hidePopover();
    declencheurRendu()?.focus();
  }

  function ouvrir(cible: 'premier' | 'dernier') {
    cibleOuverture.current = cible;
    if (ouvertRef.current) {
      allerA(cible === 'premier' ? 0 : elements().length - 1);
      return;
    }
    menu.current?.showPopover();
  }

  function surBascule(evenement: ToggleEvent<HTMLDivElement>) {
    const estOuvert = evenement.newState === 'open';
    ouvertRef.current = estOuvert;
    setOuvert(estOuvert);
    if (estOuvert) {
      allerA(cibleOuverture.current === 'premier' ? 0 : elements().length - 1);
    }
    cibleOuverture.current = 'premier';
  }

  function surToucheDeclencheur(evenement: KeyboardEvent<HTMLButtonElement>) {
    if (evenement.key === 'ArrowDown' || evenement.key === 'ArrowUp') {
      evenement.preventDefault();
      ouvrir(evenement.key === 'ArrowDown' ? 'premier' : 'dernier');
    }
  }

  function surToucheMenu(evenement: KeyboardEvent<HTMLDivElement>) {
    const dernier = elements().length - 1;
    switch (evenement.key) {
      case 'ArrowDown':
        evenement.preventDefault();
        allerA(actif + 1);
        break;
      case 'ArrowUp':
        evenement.preventDefault();
        allerA(actif - 1);
        break;
      case 'Home':
        evenement.preventDefault();
        allerA(0);
        break;
      case 'End':
        evenement.preventDefault();
        allerA(dernier);
        break;
      case 'Escape':
      case 'Tab':
        evenement.preventDefault();
        fermer();
        break;
      default:
        break;
    }
  }

  /*
    Sans ancre CSS, le menu se place une fois, a l ouverture, en coordonnees de la fenetre : sous le
    declencheur, aligne sur son bord de fin, au-dessus s il ne reste pas la place en bas. L ecart est
    lu dans le jeton --espace-1, jamais ecrit ici. Un defilement ou un redimensionnement le referme.
  */
  useEffect(() => {
    const liste = menu.current;
    const bouton = declencheurRendu();
    if (!ouvert || liste === null || bouton === null || ancreConnue()) return;

    const boite = bouton.getBoundingClientRect();
    const ecart = Number.parseFloat(getComputedStyle(liste).getPropertyValue('--espace-1')) || 0;
    const hauteur = liste.offsetHeight;
    const enBas =
      window.innerHeight - boite.bottom >= hauteur + ecart || boite.top < hauteur + ecart;
    liste.style.top = `${enBas ? boite.bottom + ecart : boite.top - hauteur - ecart}px`;
    liste.style.left = `${Math.max(0, boite.right - liste.offsetWidth)}px`;

    const refermer = () => {
      if (ouvertRef.current) liste.hidePopover();
    };
    window.addEventListener('scroll', refermer, { capture: true, passive: true });
    window.addEventListener('resize', refermer);
    return () => {
      window.removeEventListener('scroll', refermer, { capture: true });
      window.removeEventListener('resize', refermer);
    };
  }, [ouvert]);

  if (actions.length === 0) return null;

  const { autres, graves } = ordonner(actions);
  const ordre = [...autres, ...graves];

  function rendreAction(action: ActionMenu, index: number) {
    const communs = {
      role: 'menuitem',
      tabIndex: index === actif ? 0 : -1,
      className: 'ai5d-menu__element',
      'data-grave': action.grave === true ? '' : undefined,
    } as const;

    if (action.href === undefined) {
      return (
        <button
          key={action.id}
          type="button"
          {...communs}
          onClick={() => {
            fermer();
            action.onChoisir();
          }}
        >
          {action.libelle}
        </button>
      );
    }

    const nouvelOnglet = action.nouvelOnglet === true;
    const contenu = (
      <>
        {action.libelle}
        {nouvelOnglet ? (
          <span className={CLASSE_HORS_ECRAN}>{` ${MENTION_NOUVEL_ONGLET}`}</span>
        ) : null}
      </>
    );

    return Lien === undefined || nouvelOnglet ? (
      <a
        key={action.id}
        {...communs}
        href={action.href}
        target={nouvelOnglet ? '_blank' : undefined}
        rel={relSur(undefined, nouvelOnglet ? '_blank' : undefined)}
        onClick={() => fermer()}
      >
        {contenu}
      </a>
    ) : (
      <Lien key={action.id} {...communs} href={action.href} onClick={() => fermer()}>
        {contenu}
      </Lien>
    );
  }

  return (
    <>
      {feuille(ID_STYLE, STYLE_MENU)}
      {ordre.some((action) => action.nouvelOnglet === true)
        ? feuille(ID_STYLE_HORS_ECRAN, STYLE_HORS_ECRAN)
        : null}

      <span className="ai5d-menu" ref={racine}>
        <Bouton
          variante="discret"
          taille="sm"
          aria-haspopup="menu"
          aria-expanded={ouvert}
          aria-controls={idMenu}
          aria-label={declencheur === undefined ? libelle : undefined}
          popoverTarget={idMenu}
          onKeyDown={surToucheDeclencheur}
          style={{ anchorName: ancre }}
        >
          {declencheur ?? <Icone nom={Ellipsis} taille={16} />}
        </Bouton>

        <div
          ref={menu}
          id={idMenu}
          role="menu"
          aria-label={libelle}
          popover="auto"
          className="ai5d-menu__liste"
          style={{ positionAnchor: ancre }}
          onToggle={surBascule}
          onKeyDown={surToucheMenu}
        >
          {autres.map((action, index) => rendreAction(action, index))}
          {autres.length > 0 && graves.length > 0 ? (
            <div role="separator" className="ai5d-menu__filet" />
          ) : null}
          {graves.map((action, index) => rendreAction(action, autres.length + index))}
        </div>
      </span>
    </>
  );
}
```

- [ ] **Step 4 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/composants/menu-actions.test.tsx
```

Attendu, constaté au plan : 21 tests verts, sans avertissement de React.

- [ ] **Step 5 : cocher et commiter**

```bash
git add noyau/composants/MenuActions.tsx tests/composants/menu-actions.test.tsx tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Un menu d’actions qui se parcourt au clavier, se referme à côté, sort de tout conteneur et range à part les gestes qui défont
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 11 : `EnteteObjet`

SPEC §5.8, pièce 5 ; deuxième consommateur constaté dans Compte (`EnteteConsole.tsx:25-34`, tâche 1).
Un composant serveur : le fil, le titre en `h1` par `TitreSection`, l'état, l'action et le menu, les
métadonnées, le pouls, un filet.

**Files:**
- Create: `tests/composants/entete-objet.test.tsx`
- Create: `noyau/composants/EnteteObjet.tsx`

**Interfaces:**
- Consumes : `TitreSection` (`niveau={1}`, `taille="ecran"`), `Icone`, `ChevronRight`, `feuille`,
  `ComposantLien` ; dans le test, `Bouton`, `Chiffre` compact (tâche 9), `PastilleEtat`.
- Produces : `ElementFil`, `MetadonneeObjet`, `ProprietesEnteteObjet`, `EnteteObjet`,
  `STYLE_ENTETE_OBJET` (clé `ai5d-entete-objet`).

- [ ] **Step 1 : le test d'abord, `tests/composants/entete-objet.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { EnteteObjet } from '../../noyau/composants/EnteteObjet';
import { Bouton } from '../../noyau/composants/Bouton';
import { Chiffre } from '../../noyau/composants/Chiffre';
import { PastilleEtat } from '../../noyau/composants/PastilleEtat';
import type { ComposantLien } from '../../noyau/composants/LiensRail';
import { texteFeuille } from '../aides/feuille';

/**
 * `EnteteObjet` (SPEC 1.3.0, §5.8). Monté sur le constat de Compte, `EnteteConsole.tsx:25-34`.
 */

function rendre(Lien?: ComposantLien) {
  return render(
    <EnteteObjet
      fil={[
        { libelle: 'Sessions', href: '/admin/sessions' },
        { libelle: 'Prompt Engineering', href: '/admin/formations/prompt-engineering' },
      ]}
      titre="Cohorte n° 5"
      etat={<PastilleEtat ton="information">En cours</PastilleEtat>}
      metadonnees={[
        { icone: CalendarDays, texte: 'Du 13 au 15 octobre 2026, heure de Conakry' },
        { icone: MapPin, texte: 'Présentiel, Conakry' },
      ]}
      action={<Bouton variante="primaire">Clore la session</Bouton>}
      menu={<Bouton variante="discret">Actions de la session</Bouton>}
      indicateurs={<Chiffre compact valeur="212" libelle="inscriptions sur 237 personnes" />}
      {...(Lien === undefined ? {} : { Lien })}
    />,
  );
}

describe('EnteteObjet', () => {
  it('a un seul h1, le titre, rendu par TitreSection', () => {
    rendre();
    const titres = screen.getAllByRole('heading', { level: 1 });
    expect(titres).toHaveLength(1);
    expect(titres[0]).toHaveTextContent('Cohorte n° 5');
    expect(titres[0]?.style.fontFamily).toBe('var(--police-titre)');
  });

  it('porte un fil d Ariane nomme, en liste ordonnee, qui s arrete au parent', () => {
    rendre();
    const fil = screen.getByRole('navigation', { name: 'Fil d’Ariane' });
    expect(fil.querySelector('ol')).not.toBeNull();
    const liens = within(fil).getAllByRole('link');
    expect(liens.map((lien) => lien.textContent)).toEqual(['Sessions', 'Prompt Engineering']);
    expect(fil.querySelector('[aria-current]')).toBeNull();
    expect(within(fil).queryByText('Cohorte n° 5')).toBeNull();
    for (const chevron of fil.querySelectorAll('svg')) {
      expect(chevron).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('passe le fil par le lien du produit', () => {
    const recus: Array<ComponentProps<ComposantLien>> = [];
    const Lien: ComposantLien = (proprietes) => {
      recus.push(proprietes);
      const { children, ...reste } = proprietes;
      return <a {...reste}>{children}</a>;
    };
    rendre(Lien);
    expect(recus.map((recu) => recu.href)).toEqual([
      '/admin/sessions',
      '/admin/formations/prompt-engineering',
    ]);
  });

  it('range l etat apres le titre, puis l action et le menu a la fin de la meme rangee', () => {
    rendre();
    const titre = screen.getByRole('heading', { level: 1 });
    const rangee = titre.parentElement as HTMLElement;
    expect(rangee).toHaveClass('ai5d-entete-objet__tete');
    const enfants = [...rangee.children];
    expect(enfants[0]).toBe(titre);
    expect(enfants[1]).toHaveTextContent('En cours');
    const gestes = enfants[2] as HTMLElement;
    expect(gestes).toHaveClass('ai5d-entete-objet__gestes');
    expect(
      within(gestes)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Clore la session', 'Actions de la session']);
    const css = texteFeuille('ai5d-entete-objet').replace(/\s+/g, ' ');
    expect(css).toContain('.ai5d-entete-objet__tete { display: flex; flex-wrap: wrap;');
    expect(css).toContain('margin-inline-start: auto;');
  });

  it('pose ses metadonnees en liste, icones decoratives', () => {
    rendre();
    const [fil, liste] = screen.getAllByRole('list') as [HTMLElement, HTMLElement];
    expect(fil.tagName).toBe('OL');
    expect(liste.tagName).toBe('UL');
    const elements = within(liste).getAllByRole('listitem');
    expect(elements.map((element) => element.textContent)).toEqual([
      'Du 13 au 15 octobre 2026, heure de Conakry',
      'Présentiel, Conakry',
    ]);
    for (const icone of liste.querySelectorAll('svg')) {
      expect(icone).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('ferme l en-tete par un filet, et rend les indicateurs tels que le produit les passe', () => {
    const { container } = rendre();
    expect(container.querySelector('header')).toHaveClass('ai5d-entete-objet');
    expect(texteFeuille('ai5d-entete-objet')).toContain('border-bottom: 1px solid var(--bordure);');
    expect(screen.getByText('inscriptions sur 237 personnes')).toBeInTheDocument();
  });

  it('sans fil, sans metadonnees, sans gestes : rien de vide', () => {
    const { container } = render(<EnteteObjet titre="Orange Guinée" />);
    expect(container.querySelector('nav')).toBeNull();
    expect(container.querySelector('ul')).toBeNull();
    expect(container.querySelector('.ai5d-entete-objet__gestes')).toBeNull();
    expect(container.querySelector('.ai5d-entete-objet__indicateurs')).toBeNull();
  });

  it('reste rendable par un composant serveur', () => {
    expect(
      readFileSync('noyau/composants/EnteteObjet.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(false);
  });
});
```

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T11
```

Attendu : deux lignes « rougit » : le fichier absent, puis un fil sans nom.

- [ ] **Step 3 : écrire `noyau/composants/EnteteObjet.tsx`**

Le fil s'arrête au parent, sans `aria-current` : Compte terminait son fil par la page courante, sans
lien ; ici, c'est le titre qui la nomme, juste dessous (SPEC §5.8.2). La feuille est le premier enfant
de l'en-tête, pour que la racine rendue reste le `<header>`.

```tsx
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { feuille } from './feuille';
import { Icone } from './Icone';
import type { ComposantLien } from './LiensRail';
import { TitreSection } from './TitreSection';

/**
 * L'en-tête d'un objet : une session, un compte, une organisation. Identique sur tous ses onglets.
 *
 * ── POURQUOI IL MONTE, EN v1.3.0 ────────────────────────────────────────────
 * Compte écrit le sien dans sa console (`EnteteConsole.tsx:25-34`, relu le 28 septembre 2026) : un
 * titre, un fil d'Ariane nommé, une action unique à droite, rendu sur sept écrans. La console du
 * Portail en demande un pour ses sessions. Deux produits, un besoin : décision 012.
 *
 * ── CE QU'IL DIT, DANS L'ORDRE ──────────────────────────────────────────────
 * D'où l'on vient (le fil), ce qu'est l'objet (le titre, un seul `h1`), où il en est (l'état), ce qui
 * le fait avancer (une action, et un menu), ses faits (dates, lieu), puis son pouls (une rangée de
 * `Chiffre` compacts). Un filet le ferme, comme `EnteteRubrique`.
 *
 * ── LE FIL S'ARRÊTE AU PARENT ───────────────────────────────────────────────
 * Il ne répète jamais le titre : le dernier segment est un lien vers le parent, et aucun ne porte
 * `aria-current`. Compte terminait son fil par la page courante, sans lien ; ici, c'est le titre qui
 * la nomme, juste dessous.
 *
 * ── IL RESTE UN COMPOSANT SERVEUR ───────────────────────────────────────────
 * Aucun crochet. Les icônes des métadonnées et le lien du routeur arrivent en propriétés, comme pour
 * `EnteteRubrique` et `OngletsRubrique`.
 */

export interface ElementFil {
  libelle: string;
  href: string;
}

export interface MetadonneeObjet {
  icone: LucideIcon;
  texte: ReactNode;
}

export interface ProprietesEnteteObjet {
  /** Le chemin de retour, du plus large au plus proche. Il ne répète jamais le titre. */
  fil?: readonly ElementFil[] | undefined;
  /** Le nom de l'objet, en `h1`. */
  titre: string;
  /** Son état : une `PastilleEtat`, à côté du titre. */
  etat?: ReactNode | undefined;
  metadonnees?: readonly MetadonneeObjet[] | undefined;
  /** Le pouls : une rangée de `Chiffre` compacts. */
  indicateurs?: ReactNode | undefined;
  /** L'action qui fait avancer l'état. Une seule. */
  action?: ReactNode | undefined;
  /** Un `MenuActions`. */
  menu?: ReactNode | undefined;
  /** Le lien du routeur du produit, pour le fil ; `a` par défaut. */
  Lien?: ComposantLien | undefined;
  /** Le nom du fil pour les lecteurs d'écran. « Fil d’Ariane » par défaut. */
  etiquetteFil?: string | undefined;
}

const ID_STYLE = 'ai5d-entete-objet';

export const STYLE_ENTETE_OBJET = `
.ai5d-entete-objet {
  display: flex;
  flex-direction: column;
  gap: var(--espace-3);
  padding-bottom: var(--espace-6);
  border-bottom: 1px solid var(--bordure);
}
.ai5d-entete-objet__fil {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--espace-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.ai5d-entete-objet__fil li { display: inline-flex; align-items: center; gap: var(--espace-2); }
.ai5d-entete-objet__fil li > svg { color: var(--texte-faible); }
.ai5d-entete-objet__lien {
  border-radius: var(--rayon-sm);
  color: var(--action);
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
  text-decoration: none;
}
@media (hover: hover) {
  .ai5d-entete-objet__lien:hover { text-decoration: underline; text-underline-offset: 0.2em; }
}
.ai5d-entete-objet__lien:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }
.ai5d-entete-objet__lien:active { background: var(--surface-selection); transition: none; }

.ai5d-entete-objet__tete {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--espace-3);
}
.ai5d-entete-objet__gestes {
  display: flex;
  align-items: center;
  gap: var(--espace-2);
  margin-inline-start: auto;
}
.ai5d-entete-objet__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espace-4);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--texte-faible);
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
}
.ai5d-entete-objet__meta li { display: inline-flex; align-items: center; gap: var(--espace-2); }
`;

export function EnteteObjet({
  fil,
  titre,
  etat,
  metadonnees,
  indicateurs,
  action,
  menu,
  Lien,
  etiquetteFil = 'Fil d’Ariane',
}: ProprietesEnteteObjet) {
  const avecFil = fil !== undefined && fil.length > 0;
  const avecGestes = action !== undefined || menu !== undefined;

  return (
    <header className="ai5d-entete-objet">
      {feuille(ID_STYLE, STYLE_ENTETE_OBJET)}

      {avecFil ? (
        <nav aria-label={etiquetteFil}>
          <ol className="ai5d-entete-objet__fil">
            {fil.map((element) => (
              <li key={element.href}>
                {Lien === undefined ? (
                  <a className="ai5d-entete-objet__lien" href={element.href}>
                    {element.libelle}
                  </a>
                ) : (
                  <Lien className="ai5d-entete-objet__lien" href={element.href}>
                    {element.libelle}
                  </Lien>
                )}
                <Icone nom={ChevronRight} taille={16} />
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="ai5d-entete-objet__tete">
        <TitreSection niveau={1} taille="ecran">
          {titre}
        </TitreSection>
        {etat}
        {avecGestes ? (
          <div className="ai5d-entete-objet__gestes">
            {action}
            {menu}
          </div>
        ) : null}
      </div>

      {metadonnees === undefined || metadonnees.length === 0 ? null : (
        <ul role="list" className="ai5d-entete-objet__meta">
          {metadonnees.map((metadonnee, index) => (
            <li key={index}>
              <Icone nom={metadonnee.icone} taille={16} />
              <span>{metadonnee.texte}</span>
            </li>
          ))}
        </ul>
      )}

      {indicateurs === undefined ? null : (
        <div className="ai5d-entete-objet__indicateurs">{indicateurs}</div>
      )}
    </header>
  );
}
```

- [ ] **Step 4 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/composants/entete-objet.test.tsx tests/composants/titre-section.test.tsx
```

Attendu : les huit tests de l'en-tête verts ; ceux de `TitreSection` inchangés (son test vérifie que
`EnteteRubrique`, `GabaritAuth` et `Chiffre` ne l'emploient pas ; `EnteteObjet` l'emploie, et c'est
voulu).

- [ ] **Step 5 : cocher et commiter**

```bash
git add noyau/composants/EnteteObjet.tsx tests/composants/entete-objet.test.tsx tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Un en-tête d’objet qui dit d’où l’on vient, ce qu’est l’objet, où il en est, ce qui le fait avancer, et son pouls
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 12 : `Selecteur`

SPEC §5.9, pièce 13 pour ce seul champ ; deuxième consommateur constaté dans Compte
(`apps/compte/components/Selecteur.tsx:19-35`, tâche 1). L'API du Portail, élargie de `libelleMasque`
et `invite`. Un `<select>` natif qui partage la classe et la feuille de `Champ`.

**Files:**
- Create: `tests/composants/selecteur.test.tsx`
- Modify: `noyau/composants/Champ.tsx` (deux constantes exportées, la clé renommée)
- Create: `noyau/composants/Selecteur.tsx`

**Interfaces:**
- Consumes : `useId` ; `ID_STYLE_CHAMP`, `STYLE_CHAMP` de `Champ.tsx` ; `feuille`.
- Produces : `Champ.tsx` exporte `ID_STYLE_CHAMP = 'ai5d-champ'` et `STYLE_CHAMP` (forme `const`
  gardée, G10) ; `OptionSelecteur`, `ProprietesSelecteur`, `Selecteur`.

- [ ] **Step 1 : le test d'abord, `tests/composants/selecteur.test.tsx`**

Les cas du test du Portail (`tests/unites/champs.test.tsx`, blocs « les quatre champs » et
« comportements propres »), repris, et ce que Compte emploie.

```tsx
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Champ } from '../../noyau/composants/Champ';
import { Selecteur } from '../../noyau/composants/Selecteur';
import { texteFeuille } from '../aides/feuille';

/**
 * `Selecteur` (SPEC 1.3.0, §5.9). Les cas du test du Portail (`tests/unites/champs.test.tsx`),
 * repris, et ce que Compte emploie : le libellé masqué et l'invite.
 */

const rien = () => undefined;

function rendre(erreur?: string) {
  return render(
    <Selecteur
      libelle="Rôle"
      valeur="membre"
      onChange={rien}
      nom="role"
      aide="Le rôle décide de ce que la personne peut gérer."
      erreur={erreur}
      options={[
        { valeur: 'membre', libelle: 'Membre' },
        { valeur: 'administrateur', libelle: 'Administrateur' },
      ]}
    />,
  );
}

describe('Selecteur', () => {
  it('rend un select natif, lie a son libelle, qui rend la valeur choisie', () => {
    const changer = vi.fn();
    render(
      <Selecteur
        libelle="Rôle"
        valeur="membre"
        onChange={changer}
        nom="role"
        options={[
          { valeur: 'membre', libelle: 'Membre' },
          { valeur: 'administrateur', libelle: 'Administrateur' },
        ]}
      />,
    );
    const select = screen.getByLabelText('Rôle');
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveAttribute('name', 'role');
    fireEvent.change(select, { target: { value: 'administrateur' } });
    expect(changer).toHaveBeenCalledWith('administrateur');
  });

  it('aide reliee sans erreur ; erreur en alerte qui masque l aide, et n est plus citee', () => {
    const { unmount } = rendre();
    const controle = screen.getByLabelText('Rôle');
    expect(controle).not.toHaveAttribute('aria-invalid');
    expect(controle.getAttribute('aria-describedby')).toBe(
      screen.getByText('Le rôle décide de ce que la personne peut gérer.').id,
    );
    unmount();

    rendre('Choisissez un rôle.');
    const enErreur = screen.getByLabelText('Rôle');
    expect(enErreur).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Choisissez un rôle.');
    expect(screen.queryByText('Le rôle décide de ce que la personne peut gérer.')).toBeNull();
    expect(enErreur.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id);
  });

  it('range les options d un groupe dans leur optgroup, dans l ordre de leur premier', () => {
    const { container } = render(
      <Selecteur
        libelle="Fuseau horaire"
        valeur="Africa/Conakry"
        onChange={rien}
        nom="fuseau"
        options={[
          { valeur: 'Africa/Conakry', libelle: 'Conakry', groupe: 'Fréquents' },
          { valeur: 'UTC', libelle: 'Temps universel', groupe: 'Fréquents' },
          { valeur: 'Africa/Abidjan', libelle: 'Abidjan', groupe: 'Tous' },
        ]}
      />,
    );
    const groupes = [...container.querySelectorAll('optgroup')].map((groupe) => groupe.label);
    expect(groupes).toEqual(['Fréquents', 'Tous']);
    expect(container.querySelectorAll('optgroup')[0]?.querySelectorAll('option')).toHaveLength(2);
  });

  it('masque le libelle a l oeil sans le retirer de l arbre d accessibilite', () => {
    render(
      <Selecteur
        libelle="Rôle de Mamadou Diallo"
        libelleMasque
        valeur="membre"
        onChange={rien}
        nom="role"
        options={[{ valeur: 'membre', libelle: 'Membre' }]}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Rôle de Mamadou Diallo' });
    const libelle = document.querySelector(`label[for="${select.id}"]`) as HTMLElement;
    expect(libelle.style.position).toBe('absolute');
    expect(libelle.style.width).toBe('1px');
  });

  it('pose une invite vide et non choisissable avant le premier choix', () => {
    const { container } = render(
      <Selecteur
        libelle="Produit"
        invite="Choisissez un produit"
        valeur=""
        onChange={rien}
        nom="produit"
        options={[{ valeur: 'portail', libelle: 'AI5D Portail' }]}
      />,
    );
    const invite = container.querySelector('option') as HTMLOptionElement;
    expect(invite.value).toBe('');
    expect(invite.disabled).toBe(true);
    expect(invite).toHaveTextContent('Choisissez un produit');
  });

  it('marque l obligation et la desactivation', () => {
    render(
      <Selecteur
        libelle="Rôle"
        valeur="membre"
        onChange={rien}
        nom="role"
        obligatoire
        desactive
        options={[{ valeur: 'membre', libelle: 'Membre' }]}
      />,
    );
    const select = screen.getByLabelText('Rôle');
    expect(select).toHaveAttribute('aria-required', 'true');
    expect(select).toBeDisabled();
    expect(select.style.opacity).toBe('0.6');
  });

  it('partage la classe et la feuille de Champ : une seule feuille pour les deux', () => {
    render(
      <>
        <Champ libelle="Adresse" />
        <Selecteur
          libelle="Rôle"
          valeur="membre"
          onChange={rien}
          nom="role"
          options={[{ valeur: 'membre', libelle: 'Membre' }]}
        />
      </>,
    );
    expect(screen.getByLabelText('Rôle')).toHaveClass('ai5d-champ__entree');
    expect(screen.getByLabelText('Adresse')).toHaveClass('ai5d-champ__entree');
    expect(document.querySelectorAll('style[data-href~="ai5d-champ"]')).toHaveLength(1);
    expect(texteFeuille('ai5d-champ')).toContain('.ai5d-champ__entree:focus-visible');
    expect(screen.getByLabelText('Rôle').style.height).toBe('var(--hauteur-controle)');
    expect(screen.getByLabelText('Rôle').style.minHeight).toBe('var(--cible-tactile)');
  });

  it('se declare module client', () => {
    expect(readFileSync('noyau/composants/Selecteur.tsx', 'utf8').startsWith("'use client';")).toBe(
      true,
    );
  });
});
```

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T12
```

Attendu : deux lignes « rougit » : le fichier absent, puis une aide qui resterait affichée et citée
sous une erreur.

- [ ] **Step 3 : `noyau/composants/Champ.tsx`, la feuille partagée**

Remplacer `const ID_STYLE = 'ai5d-champ';` par :

```tsx
/** La clé de la feuille des champs, partagée avec `Selecteur` : une seule feuille pour les deux. */
export const ID_STYLE_CHAMP = 'ai5d-champ';
```

Ajouter `export` devant la déclaration `const STYLE_CHAMP` (le gabarit de texte ne bouge pas), et remplacer
`{feuille(ID_STYLE, STYLE_CHAMP)}` par `{feuille(ID_STYLE_CHAMP, STYLE_CHAMP)}`. `Champ.tsx` est un
module client, importé ici par un autre module client : la leçon « une constante lue par le serveur ne
vit pas dans un module client » ne s'applique pas, et l'index n'exporte pas ces deux constantes.

- [ ] **Step 4 : écrire `noyau/composants/Selecteur.tsx`**

L'estompage du désactivé est en ligne, sur le seul `<select>` (écart E7) ; l'aide n'est plus citée
quand une erreur la masque, comme dans le Portail.

```tsx
'use client';

/*
  `useId` est un crochet : la directive est obligatoire, comme pour `Champ` (tests/index.test.ts).
*/
import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ID_STYLE_CHAMP, STYLE_CHAMP } from './Champ';
import { feuille } from './feuille';

/**
 * Le menu déroulant du système, sur un `<select>` NATIF, jamais un menu dessiné.
 *
 * ── POURQUOI IL MONTE, EN v1.3.0 ────────────────────────────────────────────
 * Compte en écrit un (`apps/compte/components/Selecteur.tsx:19-35`, relu le 28 septembre 2026), rendu
 * sept fois ; le Portail en écrit un autre (`components/champs/Selecteur.tsx`). Deux produits, deux
 * copies qui divergeaient déjà : décision 012. L'API est celle du Portail, élargie de ce que Compte
 * emploie : `libelleMasque` pour une ligne de membre, `invite` avant le premier choix.
 *
 * ── UN SELECT NATIF ─────────────────────────────────────────────────────────
 * Le clavier, le lecteur d'écran et la liste plein écran d'un téléphone viennent avec lui.
 *
 * ── IL RÉAGIT COMME `Champ` ─────────────────────────────────────────────────
 * Même classe, même feuille (une seule, sous la même clé), mêmes états : un `<select>` posé sous un
 * `<input>` a la même bordure, le même survol et le même anneau. L'ossature d'accessibilité est celle
 * de `Champ` : libellé lié, `aria-describedby` vers l'erreur puis l'aide, erreur en `role="alert"`
 * sous le contrôle ; l'aide disparaît quand une erreur s'affiche, et n'est alors plus citée.
 */

export interface OptionSelecteur {
  valeur: string;
  libelle: string;
  /** Les options d'un même groupe se suivent dans un `<optgroup>`, dans l'ordre de leur premier. */
  groupe?: string | undefined;
}

export interface ProprietesSelecteur {
  libelle: string;
  valeur: string;
  onChange: (valeur: string) => void;
  options: readonly OptionSelecteur[];
  nom: string;
  aide?: ReactNode | undefined;
  erreur?: string | undefined;
  obligatoire?: boolean | undefined;
  id?: string | undefined;
  desactive?: boolean | undefined;
  /** Masqué à l'œil, jamais absent de l'arbre d'accessibilité (Compte, ligne de membre). */
  libelleMasque?: boolean | undefined;
  /** Première option vide, non choisissable une fois une valeur posée (Compte). */
  invite?: string | undefined;
}

/** Le texte hors écran, sans la classe : le libellé masqué reste lu, et la feuille de `Champ` suffit. */
const LIBELLE_MASQUE: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
};

const LIBELLE: CSSProperties = {
  fontFamily: 'var(--police-corps)',
  fontSize: 'var(--taille-sm)',
  fontWeight: 'var(--graisse-moyenne)',
  color: 'var(--texte)',
};

const MESSAGE: CSSProperties = { fontFamily: 'var(--police-corps)', fontSize: 'var(--taille-sm)' };

export function Selecteur({
  libelle,
  valeur,
  onChange,
  options,
  nom,
  aide,
  erreur,
  obligatoire = false,
  id,
  desactive = false,
  libelleMasque = false,
  invite,
}: ProprietesSelecteur) {
  const engendre = useId();
  const identifiant = id ?? `selecteur-${engendre}`;
  const idErreur = `${identifiant}-erreur`;
  const idAide = `${identifiant}-aide`;
  const enErreur = erreur !== undefined && erreur !== '';
  const avecAide = aide !== undefined && aide !== null && aide !== '' && !enErreur;
  const decritPar = [enErreur ? idErreur : null, avecAide ? idAide : null]
    .filter((partie): partie is string => partie !== null)
    .join(' ');

  const sansGroupe = options.filter((option) => option.groupe === undefined);
  const groupes = new Map<string, OptionSelecteur[]>();
  for (const option of options) {
    if (option.groupe === undefined) continue;
    groupes.set(option.groupe, [...(groupes.get(option.groupe) ?? []), option]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espace-2)' }}>
      {feuille(ID_STYLE_CHAMP, STYLE_CHAMP)}

      <label htmlFor={identifiant} style={libelleMasque ? LIBELLE_MASQUE : LIBELLE}>
        {libelle}
      </label>

      <select
        id={identifiant}
        name={nom}
        className="ai5d-champ__entree"
        value={valeur}
        disabled={desactive}
        onChange={(evenement) => onChange(evenement.target.value)}
        aria-invalid={enErreur || undefined}
        aria-required={obligatoire || undefined}
        aria-describedby={decritPar === '' ? undefined : decritPar}
        style={{
          width: '100%',
          height: 'var(--hauteur-controle)',
          minHeight: 'var(--cible-tactile)',
          paddingInline: 'var(--espace-4)',
          fontFamily: 'var(--police-corps)',
          fontSize: 'var(--taille-md)',
          borderRadius: 'var(--rayon-md)',
          // L'estompage du Portail, en ligne : la feuille de `Champ` ne connaît pas l'état désactivé,
          // et l'y ajouter changerait le rendu de tous les champs.
          opacity: desactive ? 0.6 : undefined,
          cursor: desactive ? 'not-allowed' : undefined,
        }}
      >
        {invite === undefined ? null : (
          <option value="" disabled>
            {invite}
          </option>
        )}
        {sansGroupe.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
        {[...groupes].map(([groupe, liste]) => (
          <optgroup key={groupe} label={groupe}>
            {liste.map((option) => (
              <option key={option.valeur} value={option.valeur}>
                {option.libelle}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {enErreur ? (
        <span id={idErreur} role="alert" style={{ ...MESSAGE, color: 'var(--erreur)' }}>
          {erreur}
        </span>
      ) : null}
      {avecAide ? (
        <span id={idAide} style={{ ...MESSAGE, color: 'var(--texte-faible)' }}>
          {aide}
        </span>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/composants/selecteur.test.tsx tests/composants/composants.test.tsx
```

Attendu : les huit tests du sélecteur verts, ceux de `Champ` inchangés.

- [ ] **Step 6 : cocher et commiter**

```bash
git add noyau/composants/Champ.tsx noyau/composants/Selecteur.tsx tests/composants/selecteur.test.tsx tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Un sélecteur natif aux jetons du système, qui partage la classe et la feuille du champ
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 13 : La réserve basse dans la feuille, et la décision 013

SPEC §5.10 et §0.7. **Condition** : la mesure « avant » de la tâche 1 montre qu'à 1 280 px
`--reserve-barre` vaut encore la hauteur de la barre. Sonde du plan : confirmée dans les deux coquilles,
visible dans `GabaritApp` seulement (écart E4). **Si la tâche 1 l'a infirmée**, cette tâche se réduit
à l'étape 9 : consigner le constat dans `reserve-basse.md`, et rien d'autre ne change.

**Files:**
- Modify: `tests/composants/coquille-rail.test.tsx` (le test de la réserve, un test ajouté, `sansFeuilles`)
- Modify: `tests/composants/mobile.test.tsx` (les trois tests de la réserve de `GabaritApp`)
- Modify: `noyau/composants/CoquilleRail.tsx` (import, en-tête, feuille, rendu)
- Modify: `noyau/composants/GabaritApp.tsx` (feuille, commentaire, rendu)
- Create: `docs/decisions/013-la-reserve-basse-vit-dans-la-feuille.md`

**Interfaces:**
- Consumes : `HAUTEUR_BARRE_ONGLETS`, `TABLETTE` (inchangés).
- Produces : `CoquilleRail` ne pose plus aucun style en ligne sur sa racine ; `GabaritApp` pose
  `data-barre` quand il a des onglets, et ne pose sur sa racine que le `style` du produit.

- [ ] **Step 1 : les tests d'abord, `tests/composants/coquille-rail.test.tsx`**

Remplacer le test « porte la reserve basse en mode complet seulement » (lignes 134 à 157) par :

```tsx
  it('porte la reserve basse en mode complet seulement, par la feuille (1.3.0, decision 013)', () => {
    const { container, rerender } = coquille();
    const racine = () => container.querySelector('[data-coquille="rail"]') as HTMLElement;
    expect(racine().style.getPropertyValue('--reserve-barre')).toBe('');
    expect(racine()).toHaveAttribute('data-mode', 'complet');
    expect(STYLE_COQUILLE_RAIL.replace(/\s+/g, ' ')).toContain(
      ".ai5d-coquille-rail[data-mode='complet'] { --reserve-barre: calc(var(--hauteur-barre-onglets) + var(--zone-sure-basse, 0px)); }",
    );

    rerender(
      <CoquilleRail
        produit="Compte"
        navigationRail={null}
        mode="bureau-seulement"
        rechargerAuRetour={false}
      >
        <p>Le contenu</p>
      </CoquilleRail>,
    );
    expect(racine()).toHaveAttribute('data-mode', 'bureau-seulement');
    expect(racine().style.getPropertyValue('--reserve-barre')).toBe('');
  });

  it('remet la reserve a zero au palier tablette, avec le meme selecteur, sans style en ligne', () => {
    /*
      Jusqu a la 1.2.0, la reserve etait posee en style en ligne : elle battait la regle de palier,
      et valait encore 56 px a 1 280 px (mesure du 28 septembre 2026). La remise a zero porte le
      selecteur de la reserve : plus faible, elle perdrait par la specificite.
    */
    const tablette = STYLE_COQUILLE_RAIL.slice(
      STYLE_COQUILLE_RAIL.indexOf('@media (min-width: 768px)'),
    ).replace(/\s+/g, ' ');
    expect(tablette).toContain(
      ".ai5d-coquille-rail[data-mode='complet'] { --reserve-barre: 0px; }",
    );
    expect(code(SOURCE)).not.toMatch(/'--reserve-barre'\s*:/);
  });
```

Puis remplacer la documentation et le corps de `sansFeuilles` (lignes 209 à 214) par :

```tsx
/**
 * Le HTML rendu, sans les feuilles et sans l attribut `style` de la racine : la feuille change en
 * 1.2.0, pas le balisage ; et la reserve basse quitte le style en ligne en 1.3.0 (decision 013).
 */
function sansFeuilles(conteneur: HTMLElement): string {
  const copie = conteneur.cloneNode(true) as HTMLElement;
  copie.querySelectorAll('style').forEach((feuille) => feuille.remove());
  copie.querySelector('[data-coquille="rail"]')?.removeAttribute('style');
  return copie.innerHTML;
}
```

La comparaison au HTML de la 1.1.0 garde tout, sauf l'attribut `style` de la racine, qui disparaît
(SPEC §5.10 : « attribut `style` excepté »).

- [ ] **Step 2 : les tests d'abord, `tests/composants/mobile.test.tsx`**

Remplacer les trois tests « reserve la hauteur de la barre plus la zone sure sous le contenu », « ne
reserve rien et ne rend aucune barre sans onglets » et « remet la reserve a zero au palier tablette, ou
la barre disparait » (lignes 135 à 171) par :

```tsx
  it('reserve la hauteur de la barre plus la zone sure sous le contenu', () => {
    // Sans cette reserve, le dernier element de la page se glisse SOUS la barre. Le
    // defaut ne se voit pas tant qu on teste sur des pages courtes.
    const { container } = render(
      <GabaritApp onglets={ONGLETS} actif="accueil">
        <p>Contenu</p>
      </GabaritApp>,
    );
    const racine = container.querySelector('[data-gabarit="app"]');
    expect(racine).toHaveAttribute('data-barre', '');
    expect(racine?.getAttribute('style') ?? '').not.toContain('--reserve-barre');
    expect(texteFeuille('ai5d-gabarit-app').replace(/\s+/g, ' ')).toContain(
      `.ai5d-app[data-barre] { --reserve-barre: calc(${HAUTEUR_BARRE_ONGLETS}px + var(--zone-sure-basse, 0px)); }`,
    );
    expect(texteFeuille('ai5d-gabarit-app')).toContain('var(--reserve-barre, 0px)');
  });

  it('ne reserve rien et ne rend aucune barre sans onglets', () => {
    const { container } = render(
      <GabaritApp produit="Compte">
        <p>Contenu</p>
      </GabaritApp>,
    );
    expect(screen.queryByRole('navigation')).toBeNull();
    const racine = container.querySelector('[data-gabarit="app"]');
    expect(racine).not.toHaveAttribute('data-barre');
    expect(racine?.getAttribute('style') ?? '').not.toContain('--reserve-barre');
  });

  it('remet la reserve a zero au palier tablette, ou la barre disparait', () => {
    render(
      <GabaritApp onglets={ONGLETS} actif="accueil">
        <p>Contenu</p>
      </GabaritApp>,
    );
    const feuilles = texteFeuille('ai5d-gabarit-app');
    expect(feuilles).toMatch(
      new RegExp(
        `@media \\(min-width: ${TABLETTE}px\\) \\{\\s*\\.ai5d-app\\[data-barre\\] \\{ --reserve-barre: 0px; \\}`,
      ),
    );
  });
```

- [ ] **Step 3 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T13
```

Attendu : deux lignes « rougit ». La première rejoue le brouillon du §5.10 de la SPEC (une remise à
zéro de sélecteur plus faible, écart E5), la seconde la même faute dans `GabaritApp`. Avant l'étape 4,
la réserve est encore en ligne et les deux fichiers rougissent.

- [ ] **Step 4 : `noyau/composants/CoquilleRail.tsx`**

Ligne 1 : `import type { CSSProperties, ReactNode } from 'react';` devient
`import type { ReactNode } from 'react';` (`CSSProperties` ne sert plus qu'à la réserve, qui s'en va).

Dans l'en-tête, après la phrase « élément d'une page longue passerait sous la barre basse, visible et
inatteignable. », ajouter :

```tsx
 *
 * Depuis la 1.3.0, elle vit dans la feuille et non plus en style en ligne : une déclaration en ligne
 * l'emporte sur toute règle de feuille, et la remise à zéro du palier tablette ne s'appliquait
 * jamais. Mesuré dans Chromium le 28 septembre 2026 : à 1 280 px, elle valait encore 56 px. Le
 * contenu ne le montrait pas, son rembourrage de palier la recouvrant ; `GabaritApp`, qui avait la
 * même forme, le montrait. Décision 013.
```

Dans `STYLE_COQUILLE_RAIL`, juste après la première règle `.ai5d-coquille-rail { min-height: 100dvh; background: var(--surface-1); }` :

```css
/* La reserve basse n existe qu en mode complet : sans barre basse, elle laisserait un vide. */
.ai5d-coquille-rail[data-mode='complet'] {
  --reserve-barre: calc(var(--hauteur-barre-onglets) + var(--zone-sure-basse, 0px));
}
```

Dans le palier tablette, remplacer :

```css
  /* La barre basse se masque toute seule au meme palier : c'est sa propre regle. */
  .ai5d-coquille-rail { --reserve-barre: 0px; }
```

par :

```css
  /* La barre basse se masque toute seule au meme palier : c'est sa propre regle. Meme selecteur
     que la reserve, sans quoi la remise a zero perdrait par la specificite. */
  .ai5d-coquille-rail[data-mode='complet'] { --reserve-barre: 0px; }
```

Dans `CoquilleRail`, supprimer les lignes 310 à 319 : le commentaire « La reserve basse n existe qu en
mode complet », la constante `styleRacine` et la ligne vide qui la suit ; puis la ligne
`style={styleRacine}` de la `div` racine.

- [ ] **Step 5 : `noyau/composants/GabaritApp.tsx`**

Dans `STYLE_APP`, juste après la règle `.ai5d-app { … background: var(--surface-1); }` :

```css
.ai5d-app[data-barre] {
  --reserve-barre: calc(${HAUTEUR_BARRE_ONGLETS}px + var(--zone-sure-basse, 0px));
}
```

Remplacer le bloc de palier que la tâche 2 y a posé :

```css
/* La barre basse disparait au palier tablette : sa reserve retombe a zero. */
@media (min-width: ${TABLETTE}px) {
  .ai5d-app { --reserve-barre: 0px; }
}
```

par :

```css
/* La barre basse disparait au palier tablette : sa reserve retombe a zero, meme selecteur. */
@media (min-width: ${TABLETTE}px) {
  .ai5d-app[data-barre] { --reserve-barre: 0px; }
}
```

Dans `GabaritApp`, remplacer le commentaire « La réserve basse est posée sur l'élément racine… » et la
constante `styleRacine` (lignes 102 à 115) par :

```tsx
  /*
    La réserve basse n'existe que s'il y a une barre, et elle retombe à zéro au palier tablette où la
    barre disparaît. Elle vit dans la feuille, sur `data-barre` : posée en style en ligne jusqu'à la
    1.2.0, elle battait la règle de palier, et le contenu gardait 56 px de vide en bas sur un bureau
    (mesuré dans Chromium le 28 septembre 2026). Décision 013.
  */
```

et `<div className={classes} style={styleRacine} data-gabarit="app">` par :

```tsx
      <div
        className={classes}
        style={style}
        data-gabarit="app"
        data-barre={avecBarre ? '' : undefined}
      >
```

`CSSProperties` reste importé : la propriété `style` de `ProprietesGabaritApp` l'emploie.

- [ ] **Step 6 : écrire `docs/decisions/013-la-reserve-basse-vit-dans-la-feuille.md`**

```markdown
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
```

- [ ] **Step 7 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/composants/coquille-rail.test.tsx tests/composants/mobile.test.tsx
```

Attendu, constaté au plan : 58 tests verts.

- [ ] **Step 8 : la mesure « après »**

Elle se fait à la tâche 18, sur le même banc, avec la même sonde : `reserveBarre` attendu à `0px` et
`paddingBottomContenu` à 48px à 1 280 px dans les deux coquilles, `styleEnLigne` à `null` ; inchangé à
390 px.

- [ ] **Step 9 : cocher et commiter**

```bash
git add noyau/composants/CoquilleRail.tsx noyau/composants/GabaritApp.tsx tests/composants/coquille-rail.test.tsx tests/composants/mobile.test.tsx docs/decisions/013-la-reserve-basse-vit-dans-la-feuille.md tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
La réserve basse quitte le style en ligne pour la feuille, et retombe enfin à zéro au palier tablette
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 14 : L'index

SPEC §3.12. Les trois composants et leurs types, `ProprietesEnteteRubrique`, `ProprietesChiffre` ;
`PRECEDENCE_FEUILLES` y est depuis la tâche 2. Quarante-deux composants.

**Files:**
- Modify: `tests/index.test.ts`
- Modify: `noyau/composants/index.ts`

**Interfaces:**
- Produces : l'index exporte `MenuActions`, `EnteteObjet`, `Selecteur`, les types `ActionMenu`,
  `ActionMenuGeste`, `ActionMenuLien`, `ProprietesMenuActions`, `ElementFil`, `MetadonneeObjet`,
  `ProprietesEnteteObjet`, `OptionSelecteur`, `ProprietesSelecteur`, `ProprietesEnteteRubrique`,
  `ProprietesChiffre`. Il n'exporte ni `feuille`, ni `STYLE_MENU`, `STYLE_CHIFFRE`,
  `STYLE_ENTETE_OBJET`, `ID_STYLE_CHAMP` ou `STYLE_CHAMP`.

- [ ] **Step 1 : les tests d'abord, `tests/index.test.ts`**

Dans `ATTENDUS`, ajouter `'EnteteObjet',` après `'EnteteCarte',`, `'MenuActions',` après `'Logotype',`,
et `'Selecteur',` avant `'SelecteurTheme',`. Renommer le premier test
`'exporte les quarante-deux composants du noyau'`.

Dans « exporte aussi les constantes que les consommateurs doivent pouvoir citer », après l'attente sur
`MENTION_NOUVEL_ONGLET`, ajouter :

```ts
    // Pour qu un produit compte les feuilles du systeme dans sa recette (decision 010).
    expect(composants.PRECEDENCE_FEUILLES).toBe('ai5d');
  });

  it('n exporte pas la fonction qui pose les feuilles : un produit pose les siennes sous sa precedence', () => {
    expect(composants).not.toHaveProperty('feuille');
```

(le `});` qui fermait le test ferme désormais le nouveau). Puis, à la fin du bloc
`describe('la frontiere serveur / client'`, avant son `});` :

```ts

  it('des trois composants de la 1.3.0, MenuActions et Selecteur sont des modules clients', () => {
    // SPEC 1.3.0, §5.0.4 : `EnteteObjet` se rend au serveur, icones et lien du produit compris.
    const client = (nom: string) =>
      readFileSync(`${DOSSIER}/${nom}.tsx`, 'utf8').startsWith("'use client';");
    expect(client('MenuActions')).toBe(true);
    expect(client('Selecteur')).toBe(true);
    expect(client('EnteteObjet')).toBe(false);
    for (const nom of ['Bandeau', 'EnteteRubrique', 'OngletsRubrique', 'Chiffre', 'Squelette']) {
      expect(client(nom), `${nom} ne doit pas devenir un module client`).toBe(false);
    }
  });
```

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T14
```

Attendu : « rougit » (deux tests : un `EnteteObjet` client serait refusé dans les deux sens). Avant
l'étape 3, « exporte les quarante-deux composants » et « n'oublie aucun fichier de composant »
rougissent : trois fichiers `.tsx` que l'index ne cite pas.

- [ ] **Step 3 : `noyau/composants/index.ts`**

Ligne 2 : `Les 39 composants de base du noyau.` devient `Les 42 composants de base du noyau.`

Après `export { Chiffre } from './Chiffre';` :

```ts
export type { ProprietesChiffre } from './Chiffre';
```

Après `export type { ProprietesChamp } from './Champ';` :

```ts

/** `Selecteur` est un module client, comme `Champ`, dont il partage la classe et la feuille. */
export { Selecteur } from './Selecteur';
export type { OptionSelecteur, ProprietesSelecteur } from './Selecteur';
```

Après `export { EnteteRubrique, TAILLE_CADRE_RUBRIQUE } from './EnteteRubrique';` :

```ts
export type { ProprietesEnteteRubrique } from './EnteteRubrique';

export { EnteteObjet } from './EnteteObjet';
export type { ElementFil, MetadonneeObjet, ProprietesEnteteObjet } from './EnteteObjet';
```

Avant `export { LigneLien } from './LigneLien';` :

```ts
export { MenuActions } from './MenuActions';
export type {
  ActionMenu,
  ActionMenuGeste,
  ActionMenuLien,
  ProprietesMenuActions,
} from './MenuActions';

```

- [ ] **Step 4 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/index.test.ts
```

Attendu, constaté au plan : 10 tests verts. `tests/documentation.test.ts` rougit encore sur le nombre
de composants : c'est la tâche 15 qui l'éteint.

- [ ] **Step 5 : cocher et commiter**

```bash
git add noyau/composants/index.ts tests/index.test.ts tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
L’index expose les trois composants de la 1.3.0, leurs types, et le type de l’en-tête de rubrique et du chiffre
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 15 : Les documents, le guide de montée et la décision 012, sans la version

SPEC §3.15, §12, §13, §18. `tests/documentation.test.ts` confronte le README et `NOYAU.md` au code : il
rougit depuis la tâche 10 (quarante-deux fichiers pour trente-neuf annoncés, une garde non citée). La
version reste `1.2.0` dans `package.json` et dans le README (G17) : la tâche 21 la pose.

**Files:**
- Modify: `CHANGELOG.md` (une entrée `1.3.0`, en tête, après le `---` de la ligne 8)
- Modify: `README.md` (compte des composants, familles, gardes, installation, documents)
- Modify: `noyau/NOYAU.md` (§1.2, §1.4, §2 bis, §3)
- Modify: `noyau/formulations.md` (trois sections en fin de fichier)
- Create: `docs/decisions/012-ce-que-la-console-demandait-et-ce-qui-reste-au-portail.md`

**Interfaces:**
- Consumes : `tests/documentation.test.ts` (inchangé) ; les constats de `docs/preuves/1.3.0/compte.md`.
- Produces : un README et un `NOYAU.md` qui annoncent 42 composants et sept gardes, et citent chaque
  composant et chaque garde par son nom.

- [ ] **Step 1 : le test, déjà écrit : `tests/documentation.test.ts`**

Aucun test nouveau : celui-ci lit les documents contre le code, et c'est lui qui dit quand ils sont
justes. Il échoue aujourd'hui sur quatre attentes, constatées au plan : le README annonce 39
composants, son badge dit 39, `EnteteObjet` manque à `NOYAU.md`, `verifierFeuilleUnique` manque au
README.

- [ ] **Step 2 : la commande qui le voit échouer (différée, tâche 17)**

```bash
node docs/preuves/1.3.0/mutations.mjs T15
```

Attendu : « rougit » : un README qui annoncerait encore trente-neuf composants.

- [ ] **Step 3 : l'entrée du journal, en tête de `CHANGELOG.md` (après le `---` de la ligne 8)**

````markdown
## 1.3.0 · 28 septembre 2026

Ce que la console du Portail demandait et qu'un deuxième produit partage, et le correctif d'un défaut
que tous les produits portaient : chaque instance d'un composant posait sa propre feuille. Aucune
valeur de jeton ne change : `tests/non-regression.test.ts` le prouve contre un instantané de la 1.2.0.

### Ce qui change à l'écran, sans une ligne de code dans le produit

1. **Une feuille par composant, quel que soit le nombre d'instances.** Les feuilles du système se
   hissent dans `<head>` : cinq cents boutons et un champ posaient 501 balises identiques, ils en
   posent une au serveur et deux au client (mesuré dans Chromium, `docs/preuves/1.3.0/feuilles.md`).
   Au serveur, toutes les feuilles du système tiennent dans une balise
   `<style data-precedence="ai5d">`. Décision 010.
2. **Le survol du rail** prend `--surface-survol` : en sombre, il creuse au lieu d'imiter la rubrique
   active ; au doigt, il ne reste plus collé après un toucher. Décision 011.
3. **Au-delà de 768 px, `GabaritApp` avec onglets s'arrête où son contenu s'arrête** : la réserve de la
   barre basse retombe enfin à zéro, 56 px de moins sous le contenu. `CoquilleRail` corrige la même
   faute sans changement visible. Décision 013.

### Ajouts

- `MenuActions` : un menu d'actions au clavier, dans la couche supérieure, les gestes graves à part.
- `EnteteObjet` : le fil, le titre, l'état, l'action et le menu, les faits, le pouls.
- `Selecteur` : un `<select>` natif qui partage la classe et la feuille de `Champ`.
- `Bandeau` : `onFermer`, `libelleFermer`, `ref`.
- `EnteteRubrique` : `action` ; son type est exporté, `ProprietesEnteteRubrique`.
- `OngletsRubrique` : `compteur` par onglet, `libelleCompteur`.
- `Chiffre` : forme `compact`, en lien avec `href` et `Lien` ; `ProprietesChiffre` exporté.
  `SqueletteIndicateurs` : `compact`.
- `--surface-survol`, et `PRECEDENCE_FEUILLES`.
- La garde `verifierFeuilleUnique`, la septième.

### Compatibilité

Aucune propriété retirée, aucune variante renommée. `ProprietesChiffre` devient une union : les appels
existants compilent tels quels, `cible` et `mise` gardant leur forme exacte.

Les feuilles ne sont plus dans le conteneur du composant mais dans `<head>`, sans `id`. Un test de
produit qui lisait une feuille du système dans son conteneur ou par son identifiant la lit désormais
par `style[data-href~="ai5d-…"]`. Une règle de classe d'un produit, hors couche et de même spécificité
qu'une règle du système, peut voir son ordre s'inverser ; les utilitaires de Tailwind 4, rangés dans
une couche, ne changent pas. Une politique de sécurité du contenu à nonce devrait fournir le nonce au
rendu de React ; aucun produit n'est dans ce cas.

La racine de `CoquilleRail` ne porte plus d'attribut `style` ; celle de `GabaritApp` porte
`data-barre` quand elle a des onglets, et `--reserve-barre` se lit dans la feuille.

### Guide de montée

#### Pour tout produit

1. Remplacer l'étiquette :
   `"@ai5d/design-system": "github:Kaaramo/ai5d-digital-design-system#v1.3.0"`, puis `pnpm install`.
2. Relancer sa vérification d'un bloc. Un test qui lit une feuille du système dans son conteneur la
   lit dans `document.head`.
3. Si le produit a des règles de classe hors couche qui visent les classes `ai5d-…`, les relire.
4. Regarder à l'écran les trois différences ci-dessus.

Aucune adoption n'est obligatoire.

#### AI5D Portail, de 1.2.0 à 1.3.0 (P10)

| Pièce de P10 §7.2 | Ce que la 1.3.0 livre | Ce que P10 écrit dans `components/` |
| ----------------- | --------------------- | ----------------------------------- |
| 1 `TableauDonnees` | `--surface-survol`, et `feuille` comme modèle | `TableauDonnees`, API de P10 §7.2, feuille sous la précédence `portail` |
| 2 `BarreActionsGroupees` | | Le composant, API de P10 |
| 3 `PucesFiltre`, `RechercheTable` | | Les deux ; le compte `attention` d'une puce garde son fond `--attention-fond` au survol |
| 4 `MenuActions` | Le composant ; chaque action est un lien **ou** un geste | Rien |
| 5 `EnteteObjet` | Le composant | Rien |
| 6 `EnteteRubrique`, `action` | L'emplacement | Rien |
| 7 Compteur d'onglet | Le compteur ; `libelleCompteur="à traiter"`, et ne passer le compteur qu'au-dessus de zéro | Rien |
| 8 `--surface-survol` | Le jeton, sur `--surface-2` et `--surface-3` seulement | Rien |
| 9 Injection unique | Le correctif | `components/champs/commun.tsx:90-92` sur le même mécanisme, précédence `portail` ; IP19 peut appeler `verifierFeuilleUnique` ; la recette de la table compte les clés de `data-href`, pas les balises |
| 10 `Annonce` | `Bandeau` qui se ferme | `RegionRetour` composé sur `Bandeau` : collée, remplacement, code d'adresse, focus |
| 11 `Chiffre` compact | La forme compacte et son squelette | La rangée, et le second lien de la rangée 2 du pouls |
| 12 `BarreEnregistrement` | | Le composant, API de P10 |
| 13 Champs | `Selecteur` | `CaseACocher`, `ChoixSegmente`, `ZoneTexte` |

`--largeur-lecture` n'existe pas : P10 lit `LARGEUR_LECTURE` (`lib/mesures.ts`). `ValeurCopiable` rend
toujours un `Bouton` `neutre` `md`. Les treize écarts entre le contrat de P10 et cette version sont au
§17 de la SPEC de la 1.3.0.

#### AI5D Compte, de 1.1.0 à 1.3.0

La montée traverse la 1.2.0 : son guide est plus bas. Relu au commit `1ef7ef2`.

| Ce que Compte fait aujourd'hui | Ce que la 1.3.0 permet | Obligatoire |
| ------------------------------ | ---------------------- | ----------- |
| `EnteteConsole.tsx:25-34`, un titre, un fil et une action écrits à la main, rendus sur sept écrans | `EnteteObjet`, ou `EnteteRubrique` avec `action` | Non |
| `Selecteur.tsx:19-35`, un `<select>` natif stylé en ligne, rendu sept fois | `Selecteur`, avec `libelleMasque` et `invite` | Non |
| `Annonce.tsx:18-20`, un `Bandeau` de réussite sans fermeture | `Bandeau` avec `onFermer` | Non |
| `app/admin/comptes/[id]/ActionsCompte.tsx:139`, `:143`, deux `Bouton` directs | `MenuActions`, si plusieurs gestes s'y rassemblent | Non |

#### Le SDK `@ai5d/auth`

Rien n'est requis : il déclare le système en dépendance de pair `*`. `UserButton.tsx:100-139` pourra
passer à `MenuActions` avec `declencheur` dans une version du SDK : le clavier, la fermeture au
toucher extérieur et une largeur en `rem` lui viendraient avec.

---
````

- [ ] **Step 4 : le README**

1. Le badge `composants-39` devient `composants-42`.
2. Le titre `## Les 39 composants` devient `## Les 42 composants`. Dans la table des familles :
   `**Saisie et action**` porte `` `Bouton` · `Champ` · `Selecteur` · `ValeurCopiable` `` ;
   `**Contenu**` gagne `` · `EnteteObjet` `` après `` `EnteteRubrique` `` ; `**Navigation**` gagne
   `` · `MenuActions` `` après `` `OngletsRubrique` ``. « Neuf familles » ne change pas.
3. Après le paragraphe `transpilePackages` de « Installation », ajouter :

   ```markdown
   Les composants posent leurs feuilles d'états dans le `<head>` du document, une fois chacune, quel
   que soit le nombre d'instances (React 19, `precedence="ai5d"`, décision 010). Un produit qui compte
   ses feuilles dans une recette lit `PRECEDENCE_FEUILLES`.
   ```

4. « Les gardes » : `Six vérifications livrées par le système` devient `Sept vérifications livrées par
   le système`, et la table gagne une ligne, après `verifierAucunEspacementEnDur` :

   ```markdown
   | `verifierFeuilleUnique`              | Qu'une feuille se pose à chaque instance, cinq cents fois dans une table |
   ```

   (Prettier réalignera la table à l'étape 8.)
5. Dans le schéma Mermaid, `6 vérifications distribuées` devient `7 vérifications distribuées` ; dans la
   structure du dépôt, `les 6 vérifications distribuées` devient `les 7 vérifications distribuées`.
6. « Documents » : « les 39 composants » devient « les 42 composants », et « le guide de montée vers
   `1.2.0` » devient « le guide de montée vers `1.3.0` ».

Le badge `version-1.2.0` et les deux commandes d'installation en `#v1.2.0` **ne changent pas** (G17).

- [ ] **Step 5 : `noyau/NOYAU.md`**

§1.2, dans la table des surfaces, après la ligne `--surface-chaude` :

```markdown
| `--surface-survol` | `var(--surface-chaude)` | `var(--surface-1)` | Survol sur `--surface-2` ou `--surface-3` |
```

et, sous la table, après le paragraphe « Le blanc pur durcit… » :

```markdown
**Le survol, depuis la 1.3.0.** `--surface-survol` est le survol d'un élément posé sur `--surface-2`
ou `--surface-3` : une ligne de table, un élément de menu, un lien du rail. En sombre, il creuse d'un
cran là où la sélection éclaire, et les deux ne se confondent plus. Il ne vaut pas pour un élément
posé à même la page, où il se confondrait avec elle en sombre : `LigneLien` garde ses règles.
Décision 011.
```

§1.4, après le premier paragraphe :

```markdown
**Une paire interdite.** Un texte en `--attention` ne se pose pas en texte nu sur une surface
survolée : 4,39 en clair. Il garde son fond `--attention-fond` (4,54). Le test en fait un témoin qui
doit rester sous 4,5.
```

§2 bis, après le paragraphe « Sous `prefers-reduced-motion`… » :

```markdown
Le menu d'actions s'ouvre en `var(--duree-courte) var(--courbe-sortie)`, comme les dialogues, par ces
jetons de base : une ouverture n'est pas un départ, et `--mouvement-sortie` ne lui revient pas.
```

§3 : le titre `## 3. Les 39 composants` devient `## 3. Les 42 composants`. Dans les tables :

```markdown
| `Selecteur`      | Un `<select>` natif, jamais un menu dessiné. Libellé lié, masqué au besoin sans quitter l'arbre d'accessibilité ; même classe et même feuille que `Champ` |
```

(dans « Saisie et action », entre `Champ` et `ValeurCopiable`) ;

```markdown
| `Bandeau`      | Une icône **et** un texte. `role="alert"` pour attention et erreur, `role="status"` pour le reste. Se ferme par `onFermer`, jamais de lui-même ; reçoit le focus par `ref` |
| `Chiffre`      | Un chiffre, son libellé, et sa cible quand le produit en fixe une. En `compact`, une ligne qui se lit comme une phrase, en lien vers la liste qu'elle compte |
```

(remplacent les lignes `Bandeau` et `Chiffre` des « États et signaux ») ;

```markdown
| `EnteteRubrique`   | Icône encadrée, titre `h1`, intention alignée sur le titre, filet ; une `action` à droite du titre, au-dessus du filet |
| `EnteteObjet`      | Le fil d'Ariane jusqu'au parent, un seul `h1`, l'état, l'action et le menu, les faits, le pouls, un filet |
```

(la première remplace la ligne `EnteteRubrique` de « Contenu », la seconde la suit) ;

```markdown
| `OngletsRubrique` | Les sous-pages d'une rubrique, deux à six. Des **liens**, jamais un `tablist` ; un fondu au bord qui cache un onglet, sans script ; un compteur par onglet, lu une fois |
| `MenuActions`     | Un menu d'actions dans la couche supérieure : flèches, Début, Fin, Échap, fermeture au clic extérieur, focus rendu ; les gestes graves après un filet |
```

(la première remplace la ligne `OngletsRubrique` de « Navigation », la seconde la suit) ;

```markdown
| `Squelette`        | La forme de ce qui arrive, jamais celle de ce qui est déjà là ; `SqueletteIndicateurs compact` pour une rangée de chiffres |
```

(remplace la ligne `Squelette` d'« Attente et session »). Puis, après le paragraphe « Les composants ne
dépendent d'aucun framework de style… » :

```markdown
**Une feuille par composant, depuis la 1.3.0.** Chaque feuille d'états passe par `feuille(id, css)`,
qui la pose une fois dans le `<head>` du document, quel que soit le nombre d'instances ; au serveur,
toutes les feuilles du système tiennent dans une balise `data-precedence="ai5d"`. La septième garde,
`verifierFeuilleUnique`, refuse toute balise qui se poserait à chaque instance. Décision 010.
```

- [ ] **Step 6 : `noyau/formulations.md`, trois sections en fin de fichier**

```markdown

## Menus

| Situation         | Formulation                                                      | La règle derrière                                                                                   |
| ----------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Nom d'un menu     | « Actions pour Aïssatou Camara », « Actions de la formation »    | L'objet est nommé ; jamais « Plus » ni « Options » seuls                                            |
| Action d'un menu  | « Corriger l’adresse », « Révoquer l’attestation »               | Un verbe suivi de son objet ; un geste qui défait se range après un filet, et son libellé le nomme |

Une action indisponible est absente du menu, jamais grisée ; un menu sans action n'est pas rendu.

## Retours

| Situation            | Formulation            | La règle derrière                                                              |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| Fermer un bandeau    | « Fermer ce message »  | Le bouton dit ce qu'il ferme ; le système ne ferme jamais un retour de lui-même |
| Nom d'un fil d'Ariane | « Fil d’Ariane »      | Le nom de la navigation, lu avant ses liens                                    |

## Compteurs

| Situation           | Formulation                    | La règle derrière                                                        |
| ------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| Compteur d'un onglet | « Participants, 25 à traiter » | Le libellé, le nombre, puis ce qu'il compte ; le nombre ne s'entend qu'une fois |
```

- [ ] **Step 7 : écrire `docs/decisions/012-ce-que-la-console-demandait-et-ce-qui-reste-au-portail.md`**

```markdown
# 012 · Ce que la console demandait, et ce qui reste au Portail

**Date :** 28 septembre 2026 · **Statut :** appliquée · **Version :** 1.3.0

## Contexte

La SPEC P10 du Portail demande treize pièces au système pour sa console (§7.2). La décision 009 dit
comment la règle du deuxième consommateur se lit : un composant nouveau monte quand un deuxième
produit en a le besoin, constaté dans son code ; une extension se justifie par le besoin d'un seul
produit ; un jeton ou une règle globale, par un correctif ou une nature transversale. La console du
Portail n'est pas un deuxième consommateur du Portail.

## Options

**A. Tout monter**, parce que la console est la plus grosse demande que le système ait reçue.
`TableauDonnees` écrit pour la seule console porterait ses choix (sélection de participations, adresse
tronquée, colonne collée) et serait à réécrire au premier usage de Compte. `GabaritPortail`, monté sans
consommateur, a été retiré en 1.0.0.

**B. La décision 009, pièce par pièce**, avec le SDK `@ai5d/auth` compté comme un consommateur, puisqu'il
construit ses composants sur ceux du système (décision 004).

## Décision

**B.**

| Monte | Nature | Deuxième consommateur |
| ----- | ------ | --------------------- |
| `MenuActions` | Composant | Le SDK : `UserButton.tsx:100-139` écrit un menu à la main |
| `EnteteObjet` | Composant | Compte : `EnteteConsole.tsx:25-34`, rendu dans sept fichiers (relu sur `1ef7ef2`) |
| `Selecteur` | Composant | Compte : `Selecteur.tsx:19-35`, rendu sept fois (relu sur `1ef7ef2`) |
| `Bandeau` qui se ferme | Extension | Suffit ; Compte rend déjà un `Bandeau` de réussite sans fermeture (`Annonce.tsx:18-20`). `Annonce` est lue comme une extension de `Bandeau`, non comme un composant |
| `EnteteRubrique`, `action` | Extension | Suffit ; `EnteteConsole.tsx:33` porte aussi une action unique |
| Compteur d'onglet, `Chiffre` compact | Extensions | Suffit |
| `--surface-survol` | Jeton, et correctif | `LiensRail` et `LigneLien` l'écrivaient à la main |
| Feuilles hissées | Correctif | Tous les produits |

Restent au Portail, avec l'API de P10 : `TableauDonnees`, `BarreActionsGroupees`, `PucesFiltre`,
`RechercheTable`, `BarreEnregistrement`, `CaseACocher`, `ChoixSegmente`, `ZoneTexte`, et la région de
retour (collée, remplacement, codes d'adresse, focus), composée sur `Bandeau`.

## Conséquences

- Aucune pièce restée au Portail n'est bloquante : aucune ne touche un composant du système ni ne
  déclare de jeton.
- Chacune monte le jour où Compte en montre le besoin, fichier et ligne. `TableauDonnees` le premier,
  si Compte remplace ses registres en lignes par une table.
- Les écarts entre le contrat de P10 et la 1.3.0 sont au §17 de la SPEC de la 1.3.0 : P10 s'y conforme.
```

- [ ] **Step 8 (génération) : formater**

```bash
pnpm exec prettier --write CHANGELOG.md README.md noyau/NOYAU.md noyau/formulations.md
grep -c '—' README.md   # doit afficher 0
```

- [ ] **Step 9 : la commande qui le voit passer (différée, tâche 17)**

```bash
CI=true GITHUB_ACTIONS=true pnpm exec vitest run tests/documentation.test.ts tests/jetons.test.ts
```

Attendu : tout vert, dont la règle de la durée longue relue mot pour mot dans `NOYAU.md` (aucune
retouche ne la touche).

- [ ] **Step 10 : cocher et commiter**

```bash
git add CHANGELOG.md README.md noyau/NOYAU.md noyau/formulations.md docs/decisions/012-ce-que-la-console-demandait-et-ce-qui-reste-au-portail.md tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Le journal de la 1.3.0 et son guide de montée, le README, le noyau et les formulations à quarante-deux composants et sept gardes, et la décision 012
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 16 : Les spécimens

SPEC §11.1. Une section par pièce, dans les quatre densités et les trois états de thème, avec les
vraies feuilles des composants : le menu posé ouvert, les compteurs à 390 px et en pleine largeur, les
bandeaux qui se ferment, l'en-tête de rubrique avec action, l'en-tête d'objet et son pouls, le
sélecteur sous un champ, une table factice sur `--surface-2` où une ligne survolée côtoie deux lignes
sélectionnées. Les deux apostrophes droites de la page sont corrigées (écart E18).

**Files:**
- Modify: `_build/generer-specimens.mjs`
- Modify (génération) : `specimens/composants.html`

**Interfaces:**
- Consumes : les constantes `STYLE_MENU`, `STYLE_CHIFFRE`, `STYLE_ENTETE_OBJET`, `STYLE_BANDEAU`,
  `STYLE_CHAMP`, lues par leur texte (G10) ; `styleBouton`, `styleTitre`, `POINTS_BOUTON`, `TONS` du
  générateur.
- Produces : les points d'accroche `data-specimen="menu"`, `compteurs-390`, `compteurs-large`,
  `entete-objet`, `pouls`, `selecteur`, `survol` ; la tâche 18 capture la page entière.

- [ ] **Step 1 : ce qui tient lieu de test**

Le générateur échoue sur une feuille qu'il ne trouve pas ou une interpolation qu'il ne sait pas
résoudre (« une interpolation inconnue fait échouer la generation »). La page se vérifie à l'étape 7 :
chaque point d'accroche présent, et aucun débordement à 320 px.

- [ ] **Step 2 : les deux apostrophes**

Ligne 75 : `la couleur ne fait que l'accompagner.` devient `la couleur ne fait que l’accompagner.`
Ligne 350 : `Inter compose l'interface et les textes longs.` devient `Inter compose l’interface et les
textes longs.`

- [ ] **Step 3 : les feuilles lues**

Dans `FEUILLES_DES_COMPOSANTS`, après `'noyau/composants/ValeurCopiable.tsx',`, ajouter :

```js
  'noyau/composants/Champ.tsx',
  'noyau/composants/Bandeau.tsx',
  'noyau/composants/Chiffre.tsx',
  'noyau/composants/MenuActions.tsx',
  'noyau/composants/EnteteObjet.tsx',
```

- [ ] **Step 4 : les pièces de la 1.3.0, juste avant `function planche(`**

```js
/*
  LES PIECES DE LA 1.3.0, AVEC LES VRAIES FEUILLES DES COMPOSANTS.

  Le balisage reproduit celui des composants ; les etats que le pointeur pose d ordinaire sont forces
  par `data-force`, pour la capture. Le menu est pose ouvert, hors de la couche superieure : une page
  statique ne l ouvre pas. Son comportement se prouve sur le banc d essai (docs/preuves/1.3.0/).
*/
const STYLE_PASTILLE_NEUTRE =
  'display: inline-flex; align-items: center; padding: 2px 10px; background: var(--surface-chaude); color: var(--texte-faible); font-family: var(--police-corps); font-size: var(--taille-xs); font-weight: var(--graisse-moyenne); line-height: 1.6; border-radius: var(--rayon-plein);';

/* Le style en ligne d un Bouton `sm`, recopie des formules de Bouton.tsx. */
function styleBoutonSm() {
  return `${styleBouton('calc(var(--hauteur-controle) - 8px)')} font-size: var(--taille-sm);`;
}

function declencheurMenu(nom) {
  return `<span class="ai5d-menu"><button type="button" class="ai5d-bouton" data-variante="discret" data-taille="sm" aria-haspopup="menu" aria-expanded="true" aria-label="Actions pour ${nom}" style="${styleBoutonSm()}"><span class="specimen-icone" aria-hidden="true"></span></button></span>`;
}

/* Deux gestes, un lien, un filet, un geste grave : l un survole, l autre porte le focus. */
function menuActions() {
  return `
      <div class="specimen-menu" data-specimen="menu">
        ${declencheurMenu('Aïssatou Camara')}
        <div class="ai5d-menu__liste specimen-menu__liste" role="menu" aria-label="Actions pour Aïssatou Camara">
          <button type="button" role="menuitem" tabindex="-1" class="ai5d-menu__element" data-force="survol">Corriger l’adresse</button>
          <a role="menuitem" tabindex="0" class="ai5d-menu__element" href="#" data-force="focus">Voir la fiche</a>
          <button type="button" role="menuitem" tabindex="-1" class="ai5d-menu__element">Renvoyer l’invitation</button>
          <div role="separator" class="ai5d-menu__filet"></div>
          <button type="button" role="menuitem" tabindex="-1" class="ai5d-menu__element" data-grave="">Retirer de la session</button>
        </div>
      </div>`;
}

const ONGLETS_SESSION = [
  ['Vue d’ensemble', undefined],
  ['Participants', 25],
  ['Invitations', 8],
  ['Ressources', 2],
  ['Attestations', undefined],
  ['Journal', undefined],
];

/* Six onglets, trois compteurs ; l onglet actif en porte un, qui reste neutre. */
function ongletsCompteurs() {
  const liens = ONGLETS_SESSION.map(([libelle, compteur], index) => {
    const actif = index === 1 ? ' aria-current="page"' : '';
    if (compteur === undefined) {
      return `<a class="ai5d-onglets-r__lien" href="#"${actif}><span>${libelle}</span></a>`;
    }
    return `<a class="ai5d-onglets-r__lien" href="#"${actif} aria-label="${libelle}, ${compteur} à traiter"><span>${libelle}</span><span class="ai5d-onglets-r__compteur" aria-hidden="true" data-ton="neutre" style="${STYLE_PASTILLE_NEUTRE}">${compteur}</span></a>`;
  }).join('');
  return `<nav class="ai5d-onglets-r" aria-label="Sous-pages de la session">${liens}</nav>`;
}

function rangeesCompteurs() {
  return `
      <div class="specimen-colonne-390" data-specimen="compteurs-390">${ongletsCompteurs()}</div>
      <div data-specimen="compteurs-large">${ongletsCompteurs()}</div>`;
}

/* Un bandeau de chaque ton, avec sa fermeture ; celui d attention porte le focus rendu. */
function bandeauxFermables() {
  return TONS.map(([ton, texte]) => {
    const role = ton === 'attention' || ton === 'erreur' ? 'alert' : 'status';
    const focus = ton === 'attention' ? ' data-force="focus" tabindex="-1"' : '';
    return `
      <div class="ai5d-bandeau bandeau ${ton}" role="${role}" data-ton="${ton}"${focus}>
        <span class="puce"></span>
        <div class="specimen-bandeau-corps"><b>${texte}</b><br />Le retour d’un geste, que la personne ferme quand elle l’a lu.</div>
        <button type="button" class="ai5d-bouton" data-variante="discret" data-taille="sm" aria-label="Fermer ce message" style="${styleBoutonSm()} align-self: flex-start;"><span class="specimen-icone" aria-hidden="true"></span></button>
      </div>`;
  }).join('');
}

/* L en-tete de rubrique et son action, recopie du style en ligne d EnteteRubrique.tsx. */
function enteteRubriqueAction() {
  return `
      <header style="display: flex; flex-direction: column; gap: var(--espace-2); padding-bottom: var(--espace-6); border-bottom: 1px solid var(--bordure);">
        <div style="display: flex; align-items: center; gap: var(--espace-4); flex-wrap: wrap;">
          <span aria-hidden="true" style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--rayon-md); background: var(--surface-1); border: 1px solid var(--bordure); color: var(--texte-fort);"><span class="specimen-icone"></span></span>
          <h1 style="margin: 0; font-family: var(--police-titre); font-size: var(--taille-2xl); font-weight: var(--graisse-normale); line-height: var(--interligne-titre); color: var(--texte-fort);">Formations</h1>
          <div style="margin-inline-start: auto;"><a class="ai5d-bouton" href="#" data-variante="primaire" data-taille="md" style="${styleBouton('var(--hauteur-controle)')}">Nouvelle formation${POINTS_BOUTON}</a></div>
        </div>
        <p style="margin: 0; margin-left: calc(40px + var(--espace-4)); font-family: var(--police-corps); font-size: var(--taille-sm); line-height: var(--interligne-corps); color: var(--texte-faible);">Les formations du catalogue, et leurs sessions.</p>
      </header>`;
}

/* Le pouls : trois Chiffre compacts, deux en lien, l un survole. */
function pouls() {
  return `
      <div class="specimen-pouls" data-specimen="pouls">
        <a class="ai5d-chiffre" data-compact="" href="#"><span class="ai5d-chiffre__valeur">212</span><span class="ai5d-chiffre__libelle">inscriptions sur 237 personnes</span></a>
        <a class="ai5d-chiffre" data-compact="" href="#" data-force="survol"><span class="ai5d-chiffre__valeur">8</span><span class="ai5d-chiffre__libelle">invitations non acceptées</span></a>
        <span class="ai5d-chiffre" data-compact=""><span class="ai5d-chiffre__valeur">15</span><span class="ai5d-chiffre__libelle">octobre, début de la délivrance</span></span>
      </div>`;
}

function enteteObjet() {
  return `
      <header class="ai5d-entete-objet" data-specimen="entete-objet">
        <nav aria-label="Fil d’Ariane"><ol class="ai5d-entete-objet__fil">
          <li><a class="ai5d-entete-objet__lien" href="#">Sessions</a><span class="specimen-chevron" aria-hidden="true">›</span></li>
          <li><a class="ai5d-entete-objet__lien" href="#">Prompt Engineering</a><span class="specimen-chevron" aria-hidden="true">›</span></li>
        </ol></nav>
        <div class="ai5d-entete-objet__tete">
          <h1 style="${styleTitre('var(--taille-2xl)')}">Cohorte n° 5</h1>
          <span class="pastille information">En cours</span>
          <div class="ai5d-entete-objet__gestes">
            <button type="button" class="ai5d-bouton" data-variante="primaire" data-taille="md" style="${styleBouton('var(--hauteur-controle)')}">Clore la session</button>
            ${declencheurMenu('la session')}
          </div>
        </div>
        <ul role="list" class="ai5d-entete-objet__meta">
          <li><span class="specimen-icone" aria-hidden="true"></span><span>Du 13 au 15 octobre 2026, heure de Conakry</span></li>
          <li><span class="specimen-icone" aria-hidden="true"></span><span>Présentiel, Conakry</span></li>
        </ul>
        <div class="ai5d-entete-objet__indicateurs">${pouls()}</div>
      </header>`;
}

const STYLE_ENTREE =
  'width: 100%; height: var(--hauteur-controle); min-height: var(--cible-tactile); font-family: var(--police-corps); font-size: var(--taille-md); border-radius: var(--rayon-md);';

/* Un Selecteur sous un Champ : meme classe, meme feuille, memes etats. */
function selecteurEtChamp() {
  return `
      <div class="specimen-champs" data-specimen="selecteur">
        <div class="specimen-champ"><label class="specimen-etiquette" for="specimen-adresse">Adresse</label><input id="specimen-adresse" class="ai5d-champ__entree" style="${STYLE_ENTREE} padding: 0 14px;" value="aissatou.camara@exemple.invalid" readonly /></div>
        <div class="specimen-champ"><label class="specimen-etiquette" for="specimen-role">Rôle</label><select id="specimen-role" class="ai5d-champ__entree" style="${STYLE_ENTREE} padding-inline: var(--espace-4);"><option>Membre</option><option>Administrateur</option></select></div>
        <div class="specimen-champ"><label class="specimen-etiquette" for="specimen-fuseau">Fuseau horaire, en erreur</label><select id="specimen-fuseau" class="ai5d-champ__entree" aria-invalid="true" style="${STYLE_ENTREE} padding-inline: var(--espace-4);"><option value="" disabled selected>Choisissez un fuseau</option></select><span class="message-erreur" role="alert">Choisissez un fuseau horaire.</span></div>
      </div>`;
}

/* Une table factice sur --surface-2 : une ligne survolee et deux lignes selectionnees, cote a cote. */
function tableSurvol() {
  const ligne = (nom, etat, attributs, coche) =>
    `<div class="specimen-table__ligne"${attributs}><input type="checkbox"${coche ? ' checked' : ''} aria-label="Sélectionner ${nom}" /><span>${nom}</span><span class="specimen-table__etat">${etat}</span></div>`;
  return `
      <div class="specimen-table" data-specimen="survol">
        ${ligne('Aïssatou Camara', 'Inscrite', '', false)}
        ${ligne('Mamadou Diallo', 'Survolée', ' data-force="survol"', false)}
        ${ligne('Fatoumata Bah', 'Sélectionnée', ' data-selectionnee=""', true)}
        ${ligne('Ibrahima Sow', 'Sélectionnée', ' data-selectionnee=""', true)}
      </div>`;
}
```

- [ ] **Step 5 : les pièces dans chaque planche**

Dans `planche`, juste avant le `</section>` final, après
`<div data-specimen="onglets-large">${onglets()}</div>`, insérer :

```js

    <div class="grille">
      <div class="colonne">
        <h3>Menu d’actions, ouvert</h3>
        ${menuActions()}

        <h3>Onglets avec compteurs</h3>
        ${rangeesCompteurs()}

        <h3>Bandeaux qui se ferment</h3>
        ${bandeauxFermables()}
      </div>

      <div class="colonne">
        <h3>En-tête de rubrique, avec son action</h3>
        ${enteteRubriqueAction()}

        <h3>En-tête d’objet</h3>
        ${enteteObjet()}

        <h3>Sélecteur et champ</h3>
        ${selecteurEtChamp()}

        <h3>Survol et sélection</h3>
        ${tableSurvol()}
      </div>
    </div>
```

- [ ] **Step 6 : les aides de la page et les états forcés**

Dans `STYLE_SPECIMENS`, remplacer la ligne
`/* Les etats que le pointeur pose d ordinaire, forces pour la capture. */` par :

```css
/* Les aides de la page, pour les pieces de la 1.3.0. */
.specimen-menu { display: flex; flex-direction: column; align-items: flex-end; max-width: 20rem; margin-bottom: 16px; }
.specimen-menu__liste.ai5d-menu__liste { position: static; display: flex; flex-direction: column; margin-block-start: var(--espace-1); }
.specimen-bandeau-corps { flex: 1; min-width: 0; color: var(--texte); }
.ai5d-bandeau.bandeau { align-items: flex-start; }
.specimen-pouls { display: flex; flex-wrap: wrap; gap: var(--espace-6); }
.specimen-champs { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
.specimen-champ { display: flex; flex-direction: column; gap: 6px; }
.specimen-etiquette { font-size: var(--taille-sm); font-weight: var(--graisse-moyenne); color: var(--texte); }
.specimen-table { background: var(--surface-2); border: 1px solid var(--bordure); border-radius: var(--rayon-md); overflow: hidden; }
.specimen-table__ligne { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--bordure); color: var(--texte-fort); font-size: var(--taille-sm); }
.specimen-table__ligne:last-child { border-bottom: 0; }
.specimen-table__etat { margin-left: auto; color: var(--texte-faible); }

/* Les etats que le pointeur pose d ordinaire, forces pour la capture. */
.ai5d-menu__element[data-force='survol'] { background: var(--surface-survol); }
.ai5d-menu__element[data-force='focus'] { background: var(--surface-survol); outline: 2px solid var(--action); outline-offset: -2px; }
.ai5d-bandeau[data-force='focus'] { outline: 2px solid var(--action); outline-offset: 2px; }
.ai5d-chiffre[data-force='survol'] .ai5d-chiffre__libelle { text-decoration: underline; text-underline-offset: 0.2em; }
.specimen-table__ligne[data-force='survol'] { background: var(--surface-survol); }
.specimen-table__ligne[data-selectionnee] { background: var(--surface-selection); }
```

Et, dans `main`, le message final devient
`'specimens/composants.html ecrit : 4 densites, 3 themes, les pieces de la 1.2.0 et de la 1.3.0 avec les feuilles des composants, aucun appel reseau.'`.

- [ ] **Step 7 (génération, puis mesure) : engendrer la page, formater le générateur, et la regarder**

```bash
pnpm exec prettier --write _build/generer-specimens.mjs
pnpm specimens
for accroche in menu compteurs-390 compteurs-large entete-objet pouls selecteur survol; do
  printf '%s : %s\n' "$accroche" "$(grep -c "data-specimen=\"$accroche\"" specimens/composants.html)"
done
grep -c "l'accompagner\|l'interface" specimens/composants.html
NODE_PATH="$(npm root -g)" node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 320, height: 800 }, isMobile: true, hasTouch: true })).newPage();
  await p.goto('file://' + process.cwd() + '/specimens/composants.html');
  console.log(await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth, visualViewport.offsetTop]));
  await b.close();
})();"
```

Attendu, constaté au plan : chaque accroche comptée **4** fois (une par densité) ; `0` apostrophe
droite ; à 320 px, `[ 320, 320, 0 ]` : la page ne déborde pas (leçon « Une page de preuve doit tenir au
plancher qu'elle prouve »). Puis ouvrir la page et la regarder, en clair et en sombre : le menu, ses
états forcés, la ligne survolée à côté des lignes sélectionnées. Un défaut vu se corrige ici.

- [ ] **Step 8 : cocher et commiter**

```bash
git add _build/generer-specimens.mjs specimens/composants.html tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
Les spécimens montrent les pièces de la 1.3.0 avec les vraies feuilles des composants, et ne portent plus d’apostrophe droite
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 17 : La vérification d'un seul bloc, et chaque test vu échouer

SPEC §4, étape 8 ; §10 ; §14, étape 1. **La première tâche qui lance des tests.** Jamais de `build`. Un
test rouge se corrige à la racine (`superpowers:systematic-debugging`) ; quand un test et le code se
contredisent, le résultat le plus solide gagne ; chaque correction se consigne dans `verification.md`.

**Files:**
- Create: `docs/preuves/1.3.0/mutations.mjs`, `mutations.md`
- Create: `docs/preuves/1.3.0/verification-brute.txt`, `verification.md`
- Modify: `tasks/todo.md`

**Interfaces:**
- Consumes : tout le lot ; les commandes « voir échouer » et « voir passer » des tâches 2 à 15.
- Produces : la preuve que chaque test posé par ce plan passe, et qu'il échouait sans son code.

- [ ] **Step 1 (génération) : régénérer les spécimens, au cas où une feuille aurait bougé depuis la tâche 16**

```bash
pnpm specimens
git status --short specimens
```

- [ ] **Step 2 : la vérification d'un seul bloc**

```bash
( CI=true GITHUB_ACTIONS=true pnpm typecheck && CI=true pnpm lint && CI=true pnpm format:check && CI=true GITHUB_ACTIONS=true pnpm test ) 2>&1 | tee docs/preuves/1.3.0/verification-brute.txt
echo "code de sortie : ${PIPESTATUS[0]}"
```

Attendu, sur le modèle de ce que le plan a constaté dans sa copie jetable : `tsc` muet, ESLint muet,
« All matched files use Prettier code style! », puis `Test Files 40 passed (40)` et
`Tests 830 passed | 1 skipped (831)` ; le test sauté est la dérive de la marque, dont la source n'est
pas sur ce poste (écart E14). Le code de sortie vaut `0`.

Si le bloc échoue : diagnostiquer chaque échec à sa cause, corriger, et **relancer le bloc entier**,
jusqu'au vert. Chaque échec de la première passe entre dans la table « Ce que la première passe a
trouvé » de `verification.md` (étape 5). Si une correction touche une feuille, relancer
`pnpm specimens`.

- [ ] **Step 3 : écrire `docs/preuves/1.3.0/mutations.mjs`**

```js
/**
 * Chaque test et chaque garde de la 1.3.0, vus echouer (SPEC 1.3.0, §10 ; lecon du depot : « avant de
 * fixer ce qu une garde tolere, la lancer telle quelle et lire ce qu elle trouve »).
 *
 * Le plan ecrit chaque test AVANT son implementation, et donne la commande qui le voit echouer ; elle
 * ne se lance qu a la tache 17, apres la verification d un bloc (regle de Karamo, « Le moment des
 * tests »). Chaque mutation remet l etat d AVANT la tache : un fichier retire, ou le texte de la 1.2.0
 * restitue. Le fichier est sauvegarde, mute, le test vise lance, et le fichier restaure dans tous les
 * cas. Une mutation qui ne fait rien rougir est un test qui ne garde rien.
 *
 *   node docs/preuves/1.3.0/mutations.mjs           toutes
 *   node docs/preuves/1.3.0/mutations.mjs T10       celles d une tache
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

const MUTATIONS = [
  {
    tache: 'T2',
    nom: 'le bouton pose de nouveau sa feuille a chaque instance, forme de la 1.2.0',
    fichier: 'noyau/composants/Bouton.tsx',
    avant: '{feuille(ID_STYLE, STYLE_BOUTON)}',
    apres: '<style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_BOUTON }} />',
    tests: ['tests/feuilles.test.tsx', 'gardes/gardes.test.ts'],
  },
  {
    tache: 'T2',
    nom: 'la fonction feuille n existe pas encore',
    fichier: 'noyau/composants/feuille.ts',
    retirer: true,
    tests: ['tests/feuilles.test.tsx'],
  },
  {
    tache: 'T3',
    nom: 'la garde accepte toute balise, precedence ou non',
    fichier: 'gardes/index.ts',
    avant: 'if (!/\\bprecedence\\s*=/.test(balise)) {',
    apres: 'if (false) {',
    tests: ['gardes/gardes.test.ts'],
  },
  {
    tache: 'T4',
    nom: 'le survol sombre retombe sur la selection, forme de la 1.2.0',
    fichier: 'noyau/jetons.css',
    avant: '  --surface-selection: var(--surface-3);\n  --surface-survol: var(--surface-1);',
    apres: '  --surface-selection: var(--surface-3);\n  --surface-survol: var(--surface-3);',
    tests: ['tests/jetons.test.ts'],
  },
  {
    tache: 'T4',
    nom: 'une valeur de jeton de la 1.2.0 change',
    fichier: 'noyau/jetons.css',
    avant: '  --surface-chaude: #f4efe7;',
    apres: '  --surface-chaude: #f4efe8;',
    tests: ['tests/non-regression.test.ts'],
  },
  {
    tache: 'T5',
    nom: 'le rail survole sur --surface-1, hors de la garde (hover: hover), forme de la 1.2.0',
    fichier: 'noyau/composants/LiensRail.tsx',
    avant:
      '@media (hover: hover) {\n  .ai5d-liens-rail__lien:hover { background: var(--surface-survol); color: var(--texte-fort); }\n}',
    apres: '.ai5d-liens-rail__lien:hover { background: var(--surface-1); color: var(--texte-fort); }',
    tests: ['tests/composants/liens-rail.test.tsx'],
  },
  {
    tache: 'T6',
    nom: 'le bandeau ne sait pas se fermer',
    fichier: 'noyau/composants/Bandeau.tsx',
    avant: '{onFermer === undefined ? null : (',
    apres: '{true ? null : (',
    tests: ['tests/composants/composants.test.tsx'],
  },
  {
    tache: 'T7',
    nom: 'la rangee du titre passe en flex-wrap meme sans action',
    fichier: 'noyau/composants/EnteteRubrique.tsx',
    avant: "...(action === undefined ? {} : { flexWrap: 'wrap' }),",
    apres: "flexWrap: 'wrap',",
    tests: ['tests/composants/entete-rubrique.test.tsx'],
  },
  {
    tache: 'T8',
    nom: 'l onglet avec compteur perd son nom « Participants, 25 a traiter »',
    fichier: 'noyau/composants/OngletsRubrique.tsx',
    avant: 'aria-label={nom}',
    apres: 'aria-label={undefined}',
    tous: true,
    tests: ['tests/composants/onglets-rubrique.test.tsx'],
  },
  {
    tache: 'T9',
    nom: 'Chiffre ignore compact, et rend la tuile',
    fichier: 'noyau/composants/Chiffre.tsx',
    avant: 'if (proprietes.compact === true) return <ChiffreCompact {...proprietes} />;',
    apres: '',
    tests: ['tests/composants/composants.test.tsx'],
  },
  {
    tache: 'T9',
    nom: 'le squelette compact rend des tuiles de 5rem',
    fichier: 'noyau/composants/Squelette.tsx',
    avant: '  if (compact) {',
    apres: '  if (compact && false) {',
    tests: ['tests/composants/composants.test.tsx'],
  },
  {
    tache: 'T10',
    nom: 'MenuActions n existe pas encore',
    fichier: 'noyau/composants/MenuActions.tsx',
    retirer: true,
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T10',
    nom: 'onChoisir est appele avant que le focus revienne au declencheur',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: '            fermer();\n            action.onChoisir();',
    apres: '            action.onChoisir();\n            fermer();',
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T10',
    nom: 'les gestes graves ne sont plus ranges a part',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: 'autres: actions.filter((action) => action.grave !== true),',
    apres: 'autres: [...actions],',
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T11',
    nom: 'EnteteObjet n existe pas encore',
    fichier: 'noyau/composants/EnteteObjet.tsx',
    retirer: true,
    tests: ['tests/composants/entete-objet.test.tsx'],
  },
  {
    tache: 'T11',
    nom: 'le fil d Ariane perd son nom',
    fichier: 'noyau/composants/EnteteObjet.tsx',
    avant: '<nav aria-label={etiquetteFil}>',
    apres: '<nav>',
    tests: ['tests/composants/entete-objet.test.tsx'],
  },
  {
    tache: 'T12',
    nom: 'Selecteur n existe pas encore',
    fichier: 'noyau/composants/Selecteur.tsx',
    retirer: true,
    tests: ['tests/composants/selecteur.test.tsx'],
  },
  {
    tache: 'T12',
    nom: 'l aide reste affichee et citee sous une erreur',
    fichier: 'noyau/composants/Selecteur.tsx',
    avant: "const avecAide = aide !== undefined && aide !== null && aide !== '' && !enErreur;",
    apres: "const avecAide = aide !== undefined && aide !== null && aide !== '';",
    tests: ['tests/composants/selecteur.test.tsx'],
  },
  {
    tache: 'T13',
    nom: 'la remise a zero de la coquille perd par la specificite, forme du brouillon de la SPEC',
    fichier: 'noyau/composants/CoquilleRail.tsx',
    avant: ".ai5d-coquille-rail[data-mode='complet'] { --reserve-barre: 0px; }",
    apres: '.ai5d-coquille-rail { --reserve-barre: 0px; }',
    tests: ['tests/composants/coquille-rail.test.tsx'],
  },
  {
    tache: 'T13',
    nom: 'la reserve du gabarit ne retombe plus a zero au palier tablette',
    fichier: 'noyau/composants/GabaritApp.tsx',
    avant: '.ai5d-app[data-barre] { --reserve-barre: 0px; }',
    apres: '.ai5d-app { --reserve-barre: 0px; }',
    tests: ['tests/composants/mobile.test.tsx'],
  },
  {
    tache: 'T14',
    nom: 'EnteteObjet devient un module client',
    fichier: 'noyau/composants/EnteteObjet.tsx',
    avant: "import { ChevronRight } from 'lucide-react';",
    apres: "'use client';\n\nimport { ChevronRight } from 'lucide-react';",
    tests: ['tests/index.test.ts'],
  },
  {
    tache: 'T15',
    nom: 'le README annonce encore trente-neuf composants',
    fichier: 'README.md',
    avant: '## Les 42 composants',
    apres: '## Les 39 composants',
    tests: ['tests/documentation.test.ts'],
  },
];

const demandee = process.argv[2];
const retenues = MUTATIONS.filter(({ tache }) => demandee === undefined || tache === demandee);
const lignes = [];
let sansEffet = 0;

for (const mutation of retenues) {
  const { tache, nom, fichier, tests } = mutation;
  const original = existsSync(fichier) ? readFileSync(fichier, 'utf8') : null;
  if (original === null || (!mutation.retirer && !original.includes(mutation.avant))) {
    lignes.push(`| ${tache} | ${nom} | mutation impossible : texte ou fichier absent (${fichier}) | ECHEC |`);
    sansEffet += 1;
    continue;
  }

  if (mutation.retirer) renameSync(fichier, `${fichier}.mute`);
  else
    writeFileSync(
      fichier,
      mutation.tous
        ? original.replaceAll(mutation.avant, mutation.apres)
        : original.replace(mutation.avant, mutation.apres),
    );

  let rouge = false;
  let sortie = '';
  try {
    sortie = execSync(`pnpm exec vitest run ${tests.join(' ')}`, {
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, CI: 'true', GITHUB_ACTIONS: 'true' },
    });
  } catch (erreur) {
    rouge = true;
    sortie = `${erreur.stdout ?? ''}${erreur.stderr ?? ''}`;
  } finally {
    if (mutation.retirer) renameSync(`${fichier}.mute`, fichier);
    else writeFileSync(fichier, original);
  }

  const propre = sortie.replace(/\u001b\[[0-9;]*m/g, '');
  const resume = [propre.match(/Test Files\s+[^\n]*/)?.[0], propre.match(/Tests\s+[^\n]*/)?.[0]]
    .filter((ligne) => ligne !== undefined)
    .map((ligne) => ligne.replace(/\s+/g, ' ').replaceAll('|', ',').trim())
    .join(' ; ');
  lignes.push(`| ${tache} | ${nom} | ${tests.join(', ')} · ${resume} | ${rouge ? 'rougit' : 'RESTE VERT'} |`);
  if (!rouge) sansEffet += 1;
}

console.log('| Tache | Mutation | Tests lances, et leur resume | Verdict |');
console.log('| ----- | -------- | ---------------------------- | ------- |');
for (const ligne of lignes) console.log(ligne);
console.log('');
console.log(
  sansEffet === 0
    ? `Les ${retenues.length} mutations ont rougi.`
    : `${sansEffet} mutation(s) sans effet ou impossibles.`,
);
const reste = execSync('git status --short -- noyau gardes README.md', { encoding: 'utf8' });
console.log(`Etat apres restauration : ${reste.trim() === '' ? 'aucun changement' : `\n${reste}`}`);
process.exitCode = sansEffet === 0 ? 0 : 1;
```

- [ ] **Step 4 : voir échouer chaque test posé par le lot**

````bash
{
  echo '# Chaque test et chaque garde de la 1.3.0, vus échouer'
  echo
  echo "Commit \`$(git rev-parse --short HEAD)\`. Commande : \`node docs/preuves/1.3.0/mutations.mjs\`."
  echo
  node docs/preuves/1.3.0/mutations.mjs 2>&1
} > docs/preuves/1.3.0/mutations.md
````

Attendu : vingt-deux lignes « rougit », de T2 à T15, puis « Les 22 mutations ont rougi. » et « Etat
apres restauration : aucun changement ». Une ligne « RESTE VERT » est un test qui ne garde rien : on le
renforce, on relance le bloc de l'étape 2, puis ce script. Une ligne « mutation impossible » dit que le
texte visé a changé depuis le plan : on met la mutation à jour sur le texte réel, sans l'affaiblir.

Les commandes « voir passer » des tâches 2 à 15 sont toutes contenues dans le bloc de l'étape 2 ; elles
restent écrites dans chaque tâche pour qu'on puisse relire une pièce seule.

- [ ] **Step 5 : écrire `docs/preuves/1.3.0/verification.md`**

```markdown
# 1.3.0 · La vérification du système

**Date :** {la date du jour de l'étape 2} · **Commit vérifié :** {le hash de l'étape 2}

## Les quatre commandes, d'un seul bloc

(la fin de `verification-brute.txt` recopiée : le résumé de chaque commande, le nombre de fichiers et
de tests de Vitest, et le code de sortie 0)

`GITHUB_ACTIONS=true` devant `typecheck` et `test` : `tests/marque.test.ts` lit la source de la marque
sur le poste de Karamo, et ne se saute que sous cette variable (plan, écart E14).

## Ce que la première passe a trouvé

| Échec | Cause | Réparation |
| ----- | ----- | ---------- |
(une ligne par échec de la première passe ; « Aucun » si elle est passée d'un coup)

## Chaque test vu échouer

Voir [`mutations.md`](mutations.md) : vingt-deux mutations, dont quatre qui retirent un fichier
nouveau (l'état d'avant son implémentation), et celle qui rejoue le brouillon du §5.10 de la SPEC.

## Ce que la vérification ne couvre pas

Le rendu : il se prouve dans [`feuilles.md`](feuilles.md), [`reserve-basse.md`](reserve-basse.md),
[`menu-navigateurs.md`](menu-navigateurs.md) et [`captures.md`](captures.md). La construction d'un
produit : le système livre du TypeScript non transpilé, et aucune construction n'a été lancée.
```

Les accolades se remplacent par les valeurs réelles, les parenthèses par les sorties recopiées ; aucune
ne reste dans le fichier commité.

- [ ] **Step 6 : le suivi et le commit**

Dans `tasks/todo.md`, remplacer la mention `· écrite, non testée` de T2 à T16 par `· vérifiée`, et
cocher T17 : `- [x] T17 · … · vérifiée, preuves dans docs/preuves/1.3.0/`.

```bash
git add docs/preuves/1.3.0 tasks/todo.md specimens/composants.html
git status --short
cat > .git/message-1.3.0.txt <<'MESSAGE'
La vérification de la 1.3.0 d’un seul bloc, et chacun de ses tests vu échouer sans son code
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

Si la vérification a demandé des corrections dans le code, elles entrent dans ce même commit, et la
phrase du message le dit (« … et les défauts qu'elle a trouvés, réparés »).

---

### Task 18 : La recette au navigateur, les mesures « après », les captures et les preuves

SPEC §4, étape 9 ; §11.2 ; §14, étape 2. Ce que jsdom ne calcule pas : le hissage réel, la réserve
basse, le menu dans la couche supérieure et au clavier, l'ancre CSS, le survol vu. Tout se fait sur le
banc d'essai (rendu par React) et sur les spécimens (écart E3).

**Files:**
- Modify: `docs/preuves/1.3.0/banc/pages.tsx` (réécrit en entier : les sections `menu` et `survol`)
- Create: `docs/preuves/1.3.0/sonde-menu.cjs`, `captures.cjs`
- Create (mesure) : `sonde-banc-apres.txt`, `survol-rail-apres-{clair,sombre}.png`, `menu-navigateurs.md`, `captures.md`, `specimens-{clair,sombre}-1280.png`, `specimens-clair-1024.png`, `specimens-doigt-clair-390.png`, `survol-{clair,sombre}.png`, `survol-{clair,sombre}-table.png`
- Modify: `docs/preuves/1.3.0/feuilles.md`, `reserve-basse.md` (la mesure « après », et sa lecture)
- Create: `docs/preuves/1.3.0/README.md`
- Modify: `tasks/lessons.md`, `tasks/todo.md`

**Interfaces:**
- Consumes : `banc.mjs`, `sonde-banc.cjs` (tâche 1) ; les points d'accroche des spécimens (tâche 16).
- Produces : le dossier de preuves que la tâche 21 montre à Karamo.

- [ ] **Step 1 : réécrire `docs/preuves/1.3.0/banc/pages.tsx`, avec le menu et le survol**

Les sections de la tâche 1 ne changent pas ; `menu` pose une table qui défile, un menu par ligne et un
dernier menu au bas de la page ; `survol` pose le rail à côté de la table. La table est celle du
Portail en miniature : sa feuille est celle du banc, sous la précédence `banc`, jamais celle du système.

```tsx
/**
 * Le banc d'essai de la 1.3.0 : les composants du système rendus par React, au serveur puis au
 * navigateur, comme un produit les rend.
 *
 * Les spécimens sont une page statique qui reproduit le balisage sans React : ils ne peuvent montrer
 * ni une feuille hissée, ni un style en ligne posé par un composant, ni un menu qui s'ouvre au
 * clavier (plan, écart E3). Construit par `docs/preuves/1.3.0/banc.mjs`, mesuré par
 * `sonde-banc.cjs`. Hors de `tsconfig.json`, d'ESLint et de Prettier, comme tout `docs/` : ce n'est
 * pas du code du produit, et il n'importe que ce que le produit importerait.
 */
import type { ReactNode } from 'react';
import { BookOpen, Home, Shield, User } from 'lucide-react';
import {
  Bouton,
  Champ,
  CoquilleRail,
  GabaritApp,
  LiensRail,
  MenuActions,
} from '../../../../noyau/composants';

export type Section =
  | 'feuilles'
  | 'feuilles-client'
  | 'reserve-coquille'
  | 'reserve-app'
  | 'rail'
  | 'menu'
  | 'survol';

export const SECTIONS: readonly Section[] = [
  'feuilles',
  'feuilles-client',
  'reserve-coquille',
  'reserve-app',
  'rail',
  'menu',
  'survol',
];

/** Cinq cents boutons et un champ : la table de la console, réduite à ce qui compte. */
function CinqCents() {
  return (
    <div data-banc="cinq-cents">
      {Array.from({ length: 500 }, (_, i) => (
        <Bouton key={i} variante="discret" taille="sm">
          {`Ligne ${i + 1}`}
        </Bouton>
      ))}
      <Champ libelle="Rechercher une personne" />
    </div>
  );
}

/** La coquille en mode complet, avec sa barre basse : la réserve se mesure à 390 et à 1 280 px. */
function ReserveCoquille() {
  return (
    <CoquilleRail
      produit="Portail"
      navigationRail={<nav aria-label="Rubriques">rail</nav>}
      navigationBarre={<nav aria-label="Barre">barre</nav>}
      rechargerAuRetour={false}
    >
      <p>Un contenu court.</p>
    </CoquilleRail>
  );
}

function ReserveApp() {
  return (
    <GabaritApp
      produit="Compte"
      onglets={[
        { id: 'accueil', libelle: 'Accueil', icone: Home },
        { id: 'profil', libelle: 'Profil', icone: User },
        { id: 'securite', libelle: 'Sécurité', icone: Shield },
      ]}
      actif="accueil"
    >
      <p>Un contenu court.</p>
    </GabaritApp>
  );
}

/** Le rail sur sa surface, la rubrique active et deux autres : le survol se capture ici. */
function Rail() {
  return (
    <div
      data-banc="rail"
      style={{
        width: '17.5rem',
        padding: 'var(--espace-4) var(--espace-3)',
        background: 'var(--surface-2)',
        borderRight: '1px solid var(--bordure)',
      }}
    >
      <LiensRail
        etiquette="Rubriques"
        actif="formations"
        rubriques={[
          { id: 'accueil', libelle: 'Accueil', icone: Home, href: '#accueil' },
          { id: 'formations', libelle: 'Formations', icone: BookOpen, href: '#formations' },
          { id: 'securite', libelle: 'Sécurité', icone: Shield, href: '#securite' },
        ]}
      />
    </div>
  );
}

const RIEN = () => undefined;

/** Le menu d'une ligne de la console : deux gestes, un lien, un geste grave. */
function Menu({ nom }: { nom: string }) {
  return (
    <MenuActions
      libelle={`Actions pour ${nom}`}
      actions={[
        { id: 'retirer', libelle: 'Retirer de la session', grave: true, onChoisir: RIEN },
        { id: 'corriger', libelle: 'Corriger l’adresse', onChoisir: RIEN },
        { id: 'fiche', libelle: 'Voir la fiche', href: '#fiche' },
        { id: 'renvoyer', libelle: 'Renvoyer l’invitation', onChoisir: RIEN },
      ]}
    />
  );
}

const PERSONNES = ['Aïssatou Camara', 'Mamadou Diallo', 'Fatoumata Bah', 'Ibrahima Sow'];

/*
  La table factice du Portail : ses lignes survolent sur --surface-survol et se selectionnent sur
  --surface-selection, comme le fera TableauDonnees (P10). La feuille est celle du banc, sous sa
  propre precedence : jamais celle du systeme.
*/
const STYLE_TABLE = `
.banc-table { max-height: 12rem; overflow: auto; background: var(--surface-2); border: 1px solid var(--bordure); border-radius: var(--rayon-md); }
.banc-ligne { display: flex; align-items: center; gap: var(--espace-3); padding: var(--espace-2) var(--espace-4); border-bottom: 1px solid var(--bordure); color: var(--texte-fort); }
.banc-ligne:hover { background: var(--surface-survol); }
.banc-ligne[data-selectionnee] { background: var(--surface-selection); }
.banc-ligne > span:first-of-type { flex: 1 1 auto; }
`;

/** Une table qui défile, un menu par ligne ; un dernier menu au bas de la page, pour le retournement. */
function Tableau({ basDePage }: { basDePage: boolean }) {
  return (
    <div data-banc="menu" style={{ padding: 'var(--espace-8)', maxWidth: '48rem' }}>
      <style href="banc-table" precedence="banc">
        {STYLE_TABLE}
      </style>
      <div className="banc-table" data-banc="table">
        {PERSONNES.map((nom, index) => (
          <div
            key={nom}
            className="banc-ligne"
            data-ligne={nom}
            data-selectionnee={index >= 2 ? '' : undefined}
          >
            <input type="checkbox" defaultChecked={index >= 2} aria-label={`Sélectionner ${nom}`} />
            <span>{nom}</span>
            <Menu nom={nom} />
          </div>
        ))}
      </div>
      {basDePage ? (
        <>
          <p style={{ height: '40rem' }}>Un espace qui pousse le dernier menu au bord de la fenêtre.</p>
          <div data-banc="bas" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Menu nom="Ibrahima Sow" />
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Le survol côte à côte : la table, un menu ouvert par la sonde, et le rail. */
function Survol() {
  return (
    <div data-banc="survol" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--espace-8)' }}>
      <Rail />
      <Tableau basDePage={false} />
    </div>
  );
}

export function Contenu({ section }: { section: Section }): ReactNode {
  if (section === 'feuilles' || section === 'feuilles-client') return <CinqCents />;
  if (section === 'reserve-coquille') return <ReserveCoquille />;
  if (section === 'reserve-app') return <ReserveApp />;
  if (section === 'menu') return <Tableau basDePage />;
  if (section === 'survol') return <Survol />;
  return <Rail />;
}

/** Le document entier, comme Next le rend : les feuilles hissées vont dans ce `<head>`. */
export function Page({ section }: { section: Section }) {
  return (
    <html lang="fr" data-densite="equilibre" data-section={section}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`Banc 1.3.0 · ${section}`}</title>
        <link rel="stylesheet" href="../../../../../noyau/ai5d.preset.css" />
      </head>
      <body
        style={{
          margin: 0,
          background: 'var(--surface-1)',
          color: 'var(--texte)',
          fontFamily: 'var(--police-corps)',
        }}
      >
        <div id="racine">{section === 'feuilles-client' ? null : <Contenu section={section} />}</div>
        <script src="client.js" />
      </body>
    </html>
  );
}
```

- [ ] **Step 2 (génération) : reconstruire le banc**

```bash
node docs/preuves/1.3.0/banc.mjs
```

Attendu, constaté au plan : `feuilles.html` 1 balise au serveur, `feuilles-client.html` 0,
`reserve-coquille.html` 1, `reserve-app.html` 1, `rail.html` 1, `menu.html` 2 et `survol.html` 2 (celle
du système et celle du banc).

- [ ] **Step 3 (mesure) : les feuilles, la réserve et le rail, après**

````bash
NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/sonde-banc.cjs apres > docs/preuves/1.3.0/sonde-banc-apres.txt 2>&1
{
  echo
  echo "## Après · 1.3.0 · commit \`$(git rev-parse --short HEAD)\`, $(date '+%d/%m/%Y %H:%M')"
  echo
  echo '```'
  sed -n '1p;/^## Feuilles/,/^## Réserve/p' docs/preuves/1.3.0/sonde-banc-apres.txt | sed '$d'
  echo '```'
} >> docs/preuves/1.3.0/feuilles.md
{
  echo
  echo "## Après · 1.3.0 · commit \`$(git rev-parse --short HEAD)\`, $(date '+%d/%m/%Y %H:%M')"
  echo
  echo '```'
  sed -n '1p;/^## Réserve/,/^## Le rail/p' docs/preuves/1.3.0/sonde-banc-apres.txt | sed '$d'
  echo '```'
} >> docs/preuves/1.3.0/reserve-basse.md
````

Attendu, constaté au plan :

| Mesure | Avant (tâche 1) | Après |
| ------ | --------------- | ----- |
| `feuilles`, rendu serveur puis hydratation | 501 balises dans `<body>`, 499 identifiants dupliqués | **1** balise dans `<head>`, `data-href` `"ai5d-bouton ai5d-champ"`, aucun identifiant |
| `feuilles-client` | 501 dans `<body>` | **2** dans `<head>`, `["ai5d-bouton","ai5d-champ"]` |
| Erreurs de console, hydratation comprise | aucune | aucune |
| `reserve-coquille` · 1 280 px | `calc(56px + 0px)`, style en ligne, contenu 48px | `0px`, `styleEnLigne` `null`, contenu 48px |
| `reserve-app` · 1 280 px | `calc(56px + 0px)`, contenu **104px** | `0px`, contenu **48px** |
| À 390 px, les deux | `calc(56px + 0px)`, 88px et 104px | inchangé |
| Rail survolé, sombre | « Sécurité » `rgb(23, 44, 59)`, comme l'actif | « Sécurité » `rgb(11, 22, 32)`, l'actif `rgb(23, 44, 59)` |
| Rail survolé, clair | `rgb(250, 247, 242)` | `rgb(244, 239, 231)` |

Ajouter à la main, sous chaque bloc « Après », une section `## Lecture` qui confronte les deux mesures,
et, dans `feuilles.md`, la phrase : « Au serveur, une balise pour tout le système : une recette de
produit compte les clés de `data-href`, pas les balises (SPEC P10 §15.5, écart 9 du §17). » Toute
différence avec le tableau est un défaut : il se corrige, et le bloc de la tâche 17 se relance.

- [ ] **Step 4 : écrire `docs/preuves/1.3.0/sonde-menu.cjs`**

```js
/**
 * Le menu d'actions au clavier et au pointeur, moteur par moteur (SPEC 1.3.0, §5.3, §11.2 ;
 * US-C03, US-C05). jsdom ne connaît ni `showPopover()`, ni la couche supérieure, ni l'ancre CSS : ce
 * qui suit est la seule preuve du comportement.
 *
 *   node docs/preuves/1.3.0/banc.mjs
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/sonde-menu.cjs
 *
 * Un moteur que Playwright n'a pas installé est écrit « non installé » : il va dans « Ce qui n'est pas
 * couvert ». WebKit de Playwright n'est pas Safari. Le repli sans ancre CSS est aussi joué dans
 * Chromium en retirant l'ancre (CSS.supports et position-area neutralisés) : c'est une simulation,
 * écrite comme telle.
 */
const pw = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const PAGE = pathToFileURL(resolve('docs/preuves/1.3.0/banc/genere/menu.html')).href;

/** Le menu ouvert, l'élément qui a le focus, et son rôle. */
function etat() {
  const ouvert = document.querySelector('.ai5d-menu__liste:popover-open');
  const actif = document.activeElement;
  return {
    ouvert: ouvert === null ? null : ouvert.getAttribute('aria-label'),
    focus: actif?.getAttribute('role') === 'menuitem' ? actif.textContent : (actif?.getAttribute('aria-label') ?? actif?.tagName),
  };
}

function position(selecteurDeclencheur) {
  const menu = document.querySelector('.ai5d-menu__liste:popover-open');
  const declencheur = document.querySelector(selecteurDeclencheur);
  if (menu === null || declencheur === null) return 'menu ferme';
  const m = menu.getBoundingClientRect();
  const d = declencheur.getBoundingClientRect();
  return {
    ecartSousDeclencheur: Math.round(m.top - d.bottom),
    ecartAuDessus: Math.round(d.top - m.bottom),
    bordsDeFinAlignes: Math.round(m.right) === Math.round(d.right),
    largeur: Math.round(m.width),
    dansLaFenetre: m.top >= 0 && m.bottom <= innerHeight && m.left >= 0 && m.right <= innerWidth,
  };
}

async function jouer(nom, options = {}) {
  let navigateur;
  try {
    navigateur = await pw[nom].launch();
  } catch {
    console.log(`\n== ${nom} : non installé sur ce poste, non couvert`);
    return;
  }
  const contexte = await navigateur.newContext({ viewport: { width: 1024, height: 700 } });
  if (options.sansAncre) {
    await contexte.addInitScript(() => {
      const vrai = CSS.supports.bind(CSS);
      CSS.supports = (...args) => (String(args[0]).includes('anchor') ? false : vrai(...args));
      document.addEventListener('DOMContentLoaded', () => {
        const neutre = document.createElement('style');
        neutre.textContent =
          '.ai5d-menu__liste { position-area: none !important; position-anchor: auto !important; margin-block-start: 0 !important; }';
        document.head.append(neutre);
      });
    });
  }
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('pageerror', (erreur) => erreurs.push(erreur.message));
  page.on('console', (message) => {
    if (message.type() === 'error') erreurs.push(message.text());
  });
  await page.goto(PAGE, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const titre = options.sansAncre ? `${nom}, repli sans ancre SIMULÉ` : nom;
  console.log(`\n== ${titre} ${navigateur.version()}`);
  console.log(`ancre CSS prise en charge : ${await page.evaluate(() => CSS.supports('anchor-name: --a'))}`);

  const constater = async (geste) => console.log(`${geste} : ${JSON.stringify(await page.evaluate(etat))}`);
  const premier = '[data-ligne="Aïssatou Camara"] .ai5d-bouton';

  await page.focus(premier);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  await constater('Entrée sur le déclencheur');
  console.log(`position : ${JSON.stringify(await page.evaluate(position, premier))}`);
  await page.keyboard.press('ArrowDown');
  await constater('Flèche bas');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await constater('Flèche bas deux fois, le filet sauté');
  await page.keyboard.press('ArrowDown');
  await constater('Flèche bas en fin de menu, la boucle');
  await page.keyboard.press('End');
  await constater('Fin');
  await page.keyboard.press('Home');
  await constater('Début');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await constater('Échap');
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(250);
  await constater('Flèche haut sur le déclencheur');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(150);
  await constater('Tab');

  await page.click(premier);
  await page.waitForTimeout(250);
  await constater('Clic sur le déclencheur');
  await page.mouse.click(5, 5);
  await page.waitForTimeout(250);
  await constater('Clic à côté');

  await page.locator('[data-banc="table"]').evaluate((table) => table.scrollBy(0, 40));
  await page.click('[data-ligne="Ibrahima Sow"] .ai5d-bouton');
  await page.waitForTimeout(250);
  console.log(
    `menu d'une ligne après défilement de la table : ${JSON.stringify(await page.evaluate(position, '[data-ligne="Ibrahima Sow"] .ai5d-bouton'))}`,
  );
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(300);
  await constater('Défilement de la page, menu ouvert');
  await page.keyboard.press('Escape');

  const bas = '[data-banc="bas"] .ai5d-bouton';
  await page.locator(bas).scrollIntoViewIfNeeded();
  await page.evaluate((s) => {
    const d = document.querySelector(s).getBoundingClientRect();
    window.scrollBy(0, d.bottom - innerHeight + 8);
  }, bas);
  await page.waitForTimeout(200);
  await page.click(bas);
  await page.waitForTimeout(250);
  console.log(`menu au bord bas de la fenêtre : ${JSON.stringify(await page.evaluate(position, bas))}`);

  console.log(`erreurs de console : ${erreurs.length === 0 ? 'aucune' : erreurs.join(' | ')}`);
  await navigateur.close();
}

(async () => {
  await jouer('chromium');
  await jouer('chromium', { sansAncre: true });
  await jouer('firefox');
  await jouer('webkit');
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
```

- [ ] **Step 5 (mesure) : le menu, moteur par moteur**

````bash
{
  echo '# Le menu d'"'"'actions, moteur par moteur'
  echo
  echo "Commit \`$(git rev-parse --short HEAD)\`, $(date '+%d/%m/%Y'). Banc d'essai, page \`menu\`, fenêtre de 1 024 x 700."
  echo
  echo '```'
  NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/sonde-menu.cjs 2>&1
  echo '```'
} > docs/preuves/1.3.0/menu-navigateurs.md
````

Attendu dans Chromium, constaté au plan (Chromium 141) : ancre prise en charge ; Entrée ouvre sur
« Corriger l’adresse » ; le menu 4 px sous le déclencheur, bords de fin alignés, 192 px (12rem), dans la
fenêtre ; flèche bas deux fois saute le filet jusqu'à « Retirer de la session » ; la boucle ; Fin et
Début ; Échap ferme et rend le focus au déclencheur ; flèche haut ouvre sur le dernier ; Tab ferme et
rend le focus ; un clic ouvre, un clic à côté ferme et laisse le focus au document ; le menu d'une
ligne de la table sort de la table qui défile ; un défilement de la page le laisse ouvert, collé à son
déclencheur ; au bord bas de la fenêtre, il s'ouvre **au-dessus**, 4 px au-dessus du déclencheur.
Dans le repli simulé : les mêmes gestes et les mêmes positions, mais le défilement **ferme** le menu.
Firefox et WebKit : « non installé » dans ce conteneur (écart E13).

Ajouter sous la sortie une table de lecture, une ligne par moteur et par geste de la SPEC §5.3.4, et
les phrases : « Safari : non constaté, faute d'appareil. » et, pour chaque moteur non installé,
« {moteur} : non constaté sur ce poste », ou le constat de Karamo s'il rejoue la sonde sur son poste
(Playwright 1.57 y avait les trois moteurs en 1.2.0).

- [ ] **Step 6 : écrire `docs/preuves/1.3.0/captures.cjs`**

```js
/**
 * Les captures de la 1.3.0 (SPEC 1.3.0, §11.2) : les spécimens en clair et en sombre, et le survol
 * rendu par React sur le banc d'essai, une ligne survolée à côté de deux lignes sélectionnées, un
 * menu ouvert dont un élément est survolé, le rail.
 *
 *   node _build/generer-specimens.mjs && node docs/preuves/1.3.0/banc.mjs
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/captures.cjs
 *
 * Chaque contexte « doigt » vérifie d'abord que `pointer: coarse` est vrai, et chaque contexte
 * « souris » qu'il est faux ; chaque page, qu'elle ne déborde pas (leçon de la 1.2.0).
 */
const { chromium } = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const DOSSIER = 'docs/preuves/1.3.0';
const SPECIMENS = pathToFileURL(resolve('specimens/composants.html')).href;
const SURVOL = pathToFileURL(resolve(`${DOSSIER}/banc/genere/survol.html`)).href;

const souris = (largeur) => ({ viewport: { width: largeur, height: 900 } });
const doigt = (largeur) => ({
  viewport: { width: largeur, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});

async function ouvrir(navigateur, adresse, options, theme, grossierAttendu) {
  const contexte = await navigateur.newContext(options);
  const page = await contexte.newPage();
  await page.goto(adresse, { waitUntil: 'load' });
  await page.evaluate((valeur) => document.documentElement.setAttribute('data-theme', valeur), theme);
  await page.waitForTimeout(400);
  const constat = await page.evaluate(() => ({
    grossier: matchMedia('(pointer: coarse)').matches,
    deborde: document.documentElement.scrollWidth > innerWidth,
  }));
  if (constat.grossier !== grossierAttendu) {
    throw new Error(`pointer: coarse vaut ${constat.grossier}, attendu ${grossierAttendu}`);
  }
  if (constat.deborde) throw new Error(`la page déborde à ${options.viewport.width} px`);
  return { contexte, page };
}

/** Le rapport de luminance de deux couleurs calculées : dit si un survol se voit à côté d'un autre fond. */
function rapport(a, b) {
  const lum = (rgb) => {
    const [r, g, v] = rgb.match(/\d+/g).slice(0, 3).map(Number).map((c) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * v;
  };
  const [claire, sombre] = [lum(a), lum(b)].sort((x, y) => y - x);
  return ((claire + 0.05) / (sombre + 0.05)).toFixed(2);
}

(async () => {
  const navigateur = await chromium.launch();
  console.log(`Captures de la 1.3.0 · Chromium ${navigateur.version()}`);

  console.log('\n== Spécimens, pleines pages');
  for (const [fichier, options, theme, grossier] of [
    ['specimens-clair-1280.png', souris(1280), 'light', false],
    ['specimens-sombre-1280.png', souris(1280), 'dark', false],
    ['specimens-clair-1024.png', souris(1024), 'light', false],
    ['specimens-doigt-clair-390.png', doigt(390), 'light', true],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, SPECIMENS, options, theme, grossier);
    await page.screenshot({ path: `${DOSSIER}/${fichier}`, fullPage: true });
    console.log(`  ${fichier} · pointer: coarse = ${grossier}, aucun débordement`);
    await contexte.close();
  }

  console.log('\n== Survol et sélection, rendus par React');
  for (const [fichier, theme] of [
    ['survol-clair.png', 'light'],
    ['survol-sombre.png', 'dark'],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, SURVOL, souris(1280), theme, false);
    await page.hover('[data-ligne="Mamadou Diallo"] > span');
    await page.waitForTimeout(250);
    const fonds = await page.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll('.banc-ligne')].map((ligne) => [
          ligne.dataset.ligne,
          getComputedStyle(ligne).backgroundColor,
        ]),
      ),
    );
    const survol = fonds['Mamadou Diallo'];
    const selection = fonds['Fatoumata Bah'];
    await page.screenshot({ path: `${DOSSIER}/${fichier.replace('.png', '-table.png')}` });
    await page.click('[data-ligne="Aïssatou Camara"] .ai5d-bouton');
    await page.waitForTimeout(250);
    await page.getByRole('menuitem', { name: 'Voir la fiche' }).hover();
    await page.waitForTimeout(250);
    const menu = await page.evaluate(() => {
      const liste = document.querySelector('.ai5d-menu__liste:popover-open');
      const survole = [...liste.querySelectorAll('[role="menuitem"]')].find(
        (element) => element.textContent === 'Voir la fiche',
      );
      return {
        fondDuMenu: getComputedStyle(liste).backgroundColor,
        elementSurvole: getComputedStyle(survole).backgroundColor,
      };
    });
    await page.screenshot({ path: `${DOSSIER}/${fichier}` });
    console.log(`  ${fichier}, et sa table seule`);
    console.log(`    ligne survolée ${survol}, lignes sélectionnées ${selection} : écart ${rapport(survol, selection)}`);
    console.log(
      `    menu ${menu.fondDuMenu}, élément survolé ${menu.elementSurvole} : écart ${rapport(menu.fondDuMenu, menu.elementSurvole)}`,
    );
    await contexte.close();
  }

  await navigateur.close();
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
```

- [ ] **Step 7 (mesure) : les captures, et les regarder**

````bash
{
  echo '# Captures de la 1.3.0'
  echo
  echo "Commit \`$(git rev-parse --short HEAD)\`. Commande : \`NODE_PATH=\"\$(npm root -g)\" node docs/preuves/1.3.0/captures.cjs\`."
  echo
  echo '```'
  NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/captures.cjs 2>&1
  echo '```'
} > docs/preuves/1.3.0/captures.md
````

Attendu, constaté au plan : quatre pleines pages sans débordement, `pointer: coarse` vrai au doigt et
faux à la souris ; en clair, ligne survolée `rgb(244, 239, 231)` et lignes sélectionnées
`rgb(234, 239, 255)`, écart 1.00 (même clarté, deux teintes : la case cochée porte l'état) ; en
sombre, `rgb(11, 22, 32)` et `rgb(23, 44, 59)`, écart **1.27** ; l'élément de menu survolé s'écarte du
fond du menu de 1.14 en clair et 1.27 en sombre.

Puis **regarder chaque capture**, en clair et en sombre : la ligne survolée se distingue-t-elle des
lignes sélectionnées ? l'élément de menu survolé du menu ? le rail, avant et après ? le compteur, le
pouls, le bandeau qui se ferme, l'en-tête d'objet dans les quatre densités ? Ce qui se voit s'écrit
sous la sortie, dans une section `## Ce que les captures montrent`. Un défaut vu se corrige, et les
étapes 2 à 7 se relancent. Ce sont ces captures que Karamo valide à la tâche 21 (points 2 et 3 du §0.9).

- [ ] **Step 8 : écrire `docs/preuves/1.3.0/README.md`**

```markdown
# Preuves · 1.3.0

> Sorties réelles, recopiées. Une classe présente dans le code ne prouve pas un rendu ; un test écrit
> ne prouve pas un test qui passe.

| Preuve | Fichier |
| ------ | ------- |
| La revérification de Compte, fichier et ligne | [`compte.md`](compte.md) |
| La vérification d'un bloc, et ce que sa première passe a trouvé | [`verification.md`](verification.md) |
| Chaque test vu échouer | [`mutations.md`](mutations.md) |
| Une feuille par composant, avant et après, au serveur, au client et dans Chromium | [`feuilles.md`](feuilles.md) |
| La réserve basse, avant et après | [`reserve-basse.md`](reserve-basse.md) |
| Le menu d'actions, moteur par moteur | [`menu-navigateurs.md`](menu-navigateurs.md) |
| Les captures, et ce qu'elles montrent | [`captures.md`](captures.md) |
| Le banc d'essai, rejouable | [`banc.mjs`](banc.mjs), [`banc/`](banc/) |

## Écarts avec la SPEC

Les dix-neuf écarts E1 à E19 du plan (`docs/superpowers/plans/2026-09-28-version-1-3-0-console.md`),
recopiés, et tout écart trouvé pendant l'exécution, avec son constat.

## Ce qui n'est pas couvert

- **Firefox et WebKit**, absents de ce poste ; **Safari**, faute d'appareil. Le menu, l'ancre CSS et le
  hissage n'y sont pas constatés. WebKit de Playwright n'est pas Safari.
- **Le repli sans ancre CSS dans un vrai moteur** : il n'est joué que simulé dans Chromium, et testé
  dans jsdom.
- **Un téléphone réel.** Le doigt est une émulation de Chromium, vérifiée par
  `matchMedia('(pointer: coarse)')` avant chaque capture.
- **L'ordre de la cascade face à une règle de classe hors couche d'un produit** : aucune n'a été
  trouvée dans le Portail ; la montée d'essai (`montee-portail.md`) le constate en partie.
- **Une page de la console rendue sur le poste**, et le compte de ses balises : s'il n'est pas fait à
  la tâche 20, il reste ici.
- **La construction d'un produit** : aucun `build` n'a été lancé.
```

Recopier sous « Écarts avec la SPEC » le tableau E1 à E19 du plan, et y ajouter les écarts nés de
l'exécution. Ajouter sous « Ce qui n'est pas couvert » toute preuve qui n'a pas pu se faire, avec sa
raison.

- [ ] **Step 9 : les leçons, dans `tasks/lessons.md`**

Ajouter en fin de fichier une section `## Version 1.3.0`, avec les leçons que l'exécution a
**confirmées** (les constats du plan ci-dessous), et toute autre payée pendant le lot, sur le modèle
des précédentes (le constat, puis la règle en gras) :

```markdown
## Version 1.3.0

### Un compte fait par recherche ne voit que ce qu'on cherche

La SPEC comptait trente-neuf lectures de feuille dans les tests, par `querySelector('style')` et
`getElementById`. Il y en avait cinquante-deux : treize passaient par `querySelector('#ai5d-…')`. L'une
d'elles, après le hissage, lisait `null`, et le test qui bouclait sur ses règles passait à vide.

**Un compte qui fonde une migration se refait avec toutes les formes de l'accès, et l'aide qui
remplace l'accès lève quand elle ne trouve rien.**

### Un élément sorti du flux ajoute une espace au nom d'un lien

Un texte hors écran (`position: absolute`) posé après un libellé donne « Participants , 25 à traiter » :
jsdom et Chromium traitent l'élément en bloc et insèrent une espace. Le test l'a montré ; l'arbre
d'accessibilité de Chromium l'a confirmé.

**Un nom accessible qui doit se lire d'une traite se pose en `aria-label`**, et commence par le libellé
visible.

### Une remise à zéro se déclare avec le sélecteur de ce qu'elle annule

La réserve basse était posée en style en ligne et remise à zéro par une feuille : la remise à zéro n'a
jamais agi. Le brouillon du correctif la remettait à zéro par un sélecteur plus faible que celui qui la
posait : elle n'aurait pas agi davantage.

**Une règle qui annule une déclaration porte au moins sa spécificité, et un test le vérifie par le
sélecteur, pas par la seule présence de la valeur.**
```

- [ ] **Step 10 : le suivi et le commit**

Dans `tasks/todo.md`, cocher T18 : `- [x] T18 · … · faite, preuves dans docs/preuves/1.3.0/`.

```bash
git add docs/preuves/1.3.0 tasks/todo.md tasks/lessons.md
git status --short
cat > .git/message-1.3.0.txt <<'MESSAGE'
La recette de la 1.3.0 au navigateur : une feuille par composant mesurée, la réserve basse corrigée, le menu au clavier, les captures du survol et ce qui n’est pas couvert
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 19 : La relecture du lot contre la SPEC

SPEC §4, étape 10. Un relecteur neuf, qui n'a pas écrit le code.

**Files:**
- Create: `docs/preuves/1.3.0/relecture.md`
- Modify: tout fichier que la relecture fait corriger ; `docs/preuves/1.3.0/README.md` (écarts)

**Interfaces:**
- Consumes : `git diff v1.2.0..HEAD`, la SPEC, les user stories, ce plan, `docs/preuves/1.3.0/`.
- Produces : la liste des constats, chacun corrigé ou consigné.

- [ ] **Step 1 : lancer la relecture**

Avec `superpowers:requesting-code-review`, confier au relecteur : le diff `v1.2.0..HEAD`, la SPEC et
les user stories, la table de couverture en fin de ce plan, et ces questions :

1. Chaque critère du §15 de la SPEC et de chaque user story a-t-il sa preuve, test ou mesure ?
2. G1 à G19 tiennent-elles sur tout le diff ? En particulier : aucune balise `<style>` hors de
   `feuille()` ; aucun `'use client'` ajouté hors de `MenuActions` et `Selecteur` ; aucun import de
   Next ; aucune dépendance ajoutée ; aucune couleur ni aucun espacement littéral.
3. Chaque chaîne qu'une personne lit respecte-t-elle la voix (G11) ?
4. `MenuActions` tient-il le motif « bouton de menu » (SPEC §5.3.4) dans le code, au-delà de ce que
   jsdom et Chromium ont constaté ?
5. Un produit à la 1.2.0, ou à la 1.1.0, qui monte compile-t-il sans changer une ligne ?

Et ces trois recherches, dont le résultat se recopie :

```bash
git diff v1.2.0..HEAD -- noyau densites gardes README.md CHANGELOG.md docs/decisions tasks | grep -n '^+.*—'
git diff v1.2.0..HEAD --name-only | xargs grep -lniE 'cl[a]ude|assist[a]nt|co-authored' || echo "aucune mention"
git log v1.2.0..HEAD --format=%B | grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with'
```

Attendu : aucune ligne ajoutée avec un tiret cadratin ; « aucune mention » ; `0`.

- [ ] **Step 2 : traiter chaque constat**

Écrire `docs/preuves/1.3.0/relecture.md` sur le modèle de `docs/preuves/1.2.0/relecture.md` (ce que le
relecteur a vérifié lui-même, les constats regradés par leur effet, leur traitement). Un constat juste
se corrige à la racine, et le bloc de la tâche 17 (étape 2) se relance en entier, puis
`mutations.mjs` ; la sonde et les captures de la tâche 18 se relancent si le constat touche une feuille
ou le menu. Un constat écarté s'écrit sous « Écarts avec la SPEC » du README des preuves, avec son
motif. Cocher T19 dans `tasks/todo.md`.

```bash
git add -A docs/preuves/1.3.0 tasks/todo.md noyau gardes tests _build specimens CHANGELOG.md README.md
git status --short
cat > .git/message-1.3.0.txt <<'MESSAGE'
La relecture de la 1.3.0 contre sa spécification, et le traitement de ses constats
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

---

### Task 20 : La montée d'essai dans le Portail, puis dans Compte et le SDK

SPEC §11.2, US-C02, US-C15. **Aucun commit dans un consommateur, aucune ligne changée** : chaque copie
est rendue à son état. La montée éprouve le code tel qu'il sera étiqueté : elle vient après la
relecture (écart E15). Aucun `pnpm install` ne tourne ailleurs pendant ce temps (un seul à la fois,
règle du Portail). Jamais de `build`.

Deux faits à savoir avant de commencer. Le paquet s'appelle `ai5d-design-system-1.2.0.tgz` : le
manifeste dit encore `1.2.0` (G17), mais son contenu est le lot ; l'invariant IP67 du Portail, qui
exige au moins `1.2.0`, passe donc. Et le Portail a des tests qui lisent **ses propres** feuilles dans
leur conteneur (`tests/unites/cadres.test.tsx:62`, `tests/unites/navigation-suivie.test.tsx:67`) : elles
ne bougent pas, puisque seules celles du système se hissent.

**Files:**
- Create: `docs/preuves/1.3.0/montee-portail.md`, `montee-compte.md`, `montee-sdk.md`
- Modify: `docs/preuves/1.3.0/README.md` (« Ce qui n'est pas couvert », si une montée n'a pas pu se faire)

**Interfaces:**
- Consumes : le lot, empaqueté par `pnpm pack` (champ `files` compris) ; le Portail au commit du jour ;
  Compte ; le SDK.
- Produces : les trois constats de montée, ou leur place dans « Ce qui n'est pas couvert ».

- [ ] **Step 1 : empaqueter le système, tel qu'une étiquette le livrerait**

```bash
SYSTEME=$(pwd)
MONTEE=$(mktemp -d)
pnpm pack --pack-destination "$MONTEE"
ls "$MONTEE"
tar -tzf "$MONTEE"/ai5d-design-system-1.2.0.tgz | grep -c "noyau/composants/MenuActions.tsx\|noyau/composants/feuille.ts\|gardes/index.ts"
```

Attendu : le paquet, et `3`.

- [ ] **Step 2 : le Portail, propre, sinon on s'arrête**

```bash
PORTAIL=/home/user/AI5D-Portail   # sur le poste de Karamo : F:\AI5D Portail (écart E1)
cd "$PORTAIL"
git status --short
git rev-parse --short HEAD
grep -n '"@ai5d/design-system"' package.json
```

Si `git status --short` n'est pas vide, ne rien toucher : la ligne va dans « Ce qui n'est pas
couvert ».

- [ ] **Step 3 : la montée, seule, et la vérification du Portail sans rien changer d'autre**

```bash
cd "$PORTAIL"
pnpm add "$MONTEE"/ai5d-design-system-1.2.0.tgz
grep -c "PRECEDENCE_FEUILLES" node_modules/@ai5d/design-system/noyau/composants/index.ts
CI=true pnpm typecheck 2>&1 | tee "$MONTEE/portail-typecheck.txt"; echo "code : ${PIPESTATUS[0]}"
CI=true pnpm lint 2>&1 | tee "$MONTEE/portail-lint.txt"; echo "code : ${PIPESTATUS[0]}"
CI=true pnpm format:check 2>&1 | tee "$MONTEE/portail-format.txt"; echo "code : ${PIPESTATUS[0]}"
CI=true pnpm test 2>&1 | tee "$MONTEE/portail-test.txt"; echo "code : ${PIPESTATUS[0]}"
```

Attendu : `1` (le lot est bien installé), puis quatre codes `0`. Si `format:check` ne relève que
`package.json` tel que `pnpm add` l'a réécrit, c'est la montée et non le lot : l'écrire comme tel.
Tout autre échec se recopie et se cherche à sa cause : un échec dû à la montée est un défaut de la
1.3.0, qui se corrige dans le système (le bloc de la tâche 17 se relance, puis cette tâche) ; un échec
qui existait avant se prouve en relançant la même commande sur le Portail rendu à son état.

- [ ] **Step 4 : la garde 7 sur les composants du Portail, pour P10**

```bash
cd "$SYSTEME"
node --input-type=module -e "import { decrire, verifierFeuilleUnique } from './gardes/index.ts'; console.log(decrire(verifierFeuilleUnique('$PORTAIL/components')));"
```

Attendu : les balises que le Portail pose encore à chaque instance, dont `components/champs/commun.tsx:91`
(constaté au plan : aussi `CadrePublic.tsx:58`, `Apparition.tsx:43`, `IndicateurNavigation.tsx:59`,
`participant/FeuilleAttestation.tsx:66`). Ce n'est pas un échec de la montée : c'est ce que P10
corrigera sous la précédence `portail` (SPEC §13.2, pièce 9). Le recopier.

- [ ] **Step 5 : une page de la console sur le poste, si Karamo la joue**

Sur son poste, où le Portail tourne contre le vrai Compte avec un compte de test : `pnpm dev`, ouvrir
une page de la console qui rend des `Bouton` et un `Champ` (le tableau de bord `/admin`, ou une liste),
puis dans la console du navigateur :

```js
[...document.querySelectorAll('style[data-precedence="ai5d"]')].map((s) => s.dataset.href)
```

Attendu : des clés `ai5d-…` sans doublon, une balise au rendu serveur. Sans cette recette, la ligne va
dans « Ce qui n'est pas couvert ».

- [ ] **Step 6 : le Portail rendu à son état**

```bash
cd "$PORTAIL"
git checkout -- package.json pnpm-lock.yaml
pnpm install --frozen-lockfile
git status --short
```

Attendu : aucune ligne. Puis écrire `docs/preuves/1.3.0/montee-portail.md` : le commit du Portail, la
version installée avant (`#v1.2.0`), la preuve que le lot était installé, les quatre sorties (fin de
sortie au moins, codes en entier), la garde 7 et sa lecture pour P10, la recette de l'étape 5 ou sa
place dans « Ce qui n'est pas couvert », et le `git status --short` final, vide.

- [ ] **Step 7 : Compte, de la 1.1.0 à la 1.3.0**

```bash
COMPTE=/home/user/ai5d-platform
cd "$COMPTE"
git status --short
git rev-parse --short HEAD
test -d node_modules || pnpm install --frozen-lockfile
pnpm --filter compte add "$MONTEE"/ai5d-design-system-1.2.0.tgz
CI=true pnpm typecheck 2>&1 | tee "$MONTEE/compte-typecheck.txt"; echo "code : ${PIPESTATUS[0]}"
CI=true pnpm lint 2>&1 | tee "$MONTEE/compte-lint.txt"; echo "code : ${PIPESTATUS[0]}"
CI=true pnpm test 2>&1 | tee "$MONTEE/compte-test.txt"; echo "code : ${PIPESTATUS[0]}"
git checkout -- apps/compte/package.json pnpm-lock.yaml
pnpm install --frozen-lockfile
git status --short
```

Compte n'a pas ses dépendances dans ce conteneur (écart E1) : si `pnpm install` échoue (réseau,
registre), s'arrêter, rendre la copie à son état, et écrire la montée de Compte dans « Ce qui n'est pas
couvert ». Sinon, `docs/preuves/1.3.0/montee-compte.md` sur le modèle de `docs/preuves/1.2.0/montee-compte.md`.

- [ ] **Step 8 : le SDK `@ai5d/auth`**

Le SDK n'a pas de copie de travail sur ce poste : celle du Portail (`node_modules/@ai5d/auth`) est une
installation, pas un dépôt. Si Karamo donne l'accès au dépôt `Kaaramo/ai5d-auth` :

```bash
git clone --branch v1.1.0 --depth 1 https://github.com/Kaaramo/ai5d-auth.git "$MONTEE/ai5d-auth"
cd "$MONTEE/ai5d-auth"
pnpm install --frozen-lockfile
pnpm add -D "$MONTEE"/ai5d-design-system-1.2.0.tgz
CI=true pnpm typecheck; echo "code : $?"
CI=true pnpm lint; echo "code : $?"
CI=true pnpm test; echo "code : $?"
```

La copie clonée se jette ensuite : aucun commit, aucune poussée. Écrire `docs/preuves/1.3.0/montee-sdk.md`
(le SDK déclare le système en pair `*` et en développement `#v1.0.1` : la montée traverse quatre
versions), ou la ligne « Ce qui n'est pas couvert » avec sa raison.

- [ ] **Step 9 : commiter les preuves de montée**

```bash
cd "$SYSTEME"
git add docs/preuves/1.3.0 tasks/todo.md
cat > .git/message-1.3.0.txt <<'MESSAGE'
La montée d’essai de la 1.3.0 dans le Portail, Compte et le SDK, sans une ligne changée chez eux
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
```

Si la montée a demandé une correction dans le système, elle entre dans ce commit, le bloc de la tâche
17 est relancé et vert, et la phrase du message le dit.

---

### Task 21 : La version 1.3.0 et l'étiquette, sur l'accord explicite de Karamo

SPEC §14. **Rien de cette tâche ne s'exécute sans l'accord explicite de Karamo, donné en réponse à la
question de l'étape 2.** Une étiquette arrive dans tous les produits qui la montent. Jamais de poussée
forcée ; une étiquette publiée ne se déplace jamais : un défaut trouvé après se corrige en `1.3.1`.

**Files:**
- Modify: `package.json` (`"version": "1.3.0"`)
- Modify: `README.md` (le badge, les deux commandes d'installation)
- Modify: `CHANGELOG.md` (la date de l'entrée, si elle n'est pas celle du jour)
- Modify (selon les décisions de Karamo) : `noyau/composants/LiensRail.tsx`, `tests/composants/liens-rail.test.tsx`, `CHANGELOG.md`, `docs/decisions/011-…`
- Modify: `tasks/todo.md`

**Interfaces:**
- Consumes : le dossier `docs/preuves/1.3.0/` complet et relu.
- Produces : la version `1.3.0` et l'étiquette annotée `v1.3.0` sur `origin`.

- [ ] **Step 1 : les vérifications d'avant poussée**

```bash
git status --short
git branch --show-current
git log v1.2.0..HEAD --format=%B | grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with'
git log v1.2.0..HEAD --format='%an <%ae>' | sort -u
git ls-files | grep -iE '(^|/)\.env|\.pem$|\.key$' || echo "aucun secret suivi"
```

Attendu : arbre propre, `version-1.3.0-console`, `0`, une seule identité, « aucun secret suivi ».

- [ ] **Step 2 : poser la question à Karamo, en nommant ce qui sera publié**

Lui présenter, simplement : les trois différences à l'écran du journal ; les ajouts ; les comptes de
balises avant et après ; la réserve basse avant et après ; le menu constaté dans Chromium, et les
moteurs non couverts ; les captures du survol en clair et en sombre, et du rail avant et après ; les
montées d'essai ; ce qui n'est pas couvert. Puis lui demander de trancher, un par un :

1. **Le survol sombre, `--surface-1`** (point 2 du §0.9) : validé sur les captures, ou une autre valeur,
   qui devra passer les mesures du §0.5 ?
2. **`LiensRail` au jeton** (point 3) : gardé sur les captures avant et après, ou retiré ?
3. **Le classement** (point 1) : la mineure `1.3.0`, tranchée le 28 septembre, confirmée ?
4. **Safari et les moteurs absents** : dispose-t-il d'un appareil, ou d'un poste où rejouer
   `sonde-menu.cjs`, avant l'étiquette ?
5. **La publication** : poser la version, fusionner `version-1.3.0-console` dans `main` en avance rapide,
   poser l'étiquette `v1.3.0` sur ce commit, et pousser `main` et l'étiquette.

Ne rien faire d'autre avant sa réponse.

- [ ] **Step 3, seulement si Karamo retire la migration du rail**

Dans `noyau/composants/LiensRail.tsx`, rendre à `STYLE_LIENS_RAIL` et à son commentaire le texte de la
1.2.0 (`git show v1.2.0:noyau/composants/LiensRail.tsx`), l'appel `feuille()` de la tâche 2 restant ;
retirer de `tests/composants/liens-rail.test.tsx` le bloc « LiensRail, le survol par jeton » ; retirer le
point 2 de « Ce qui change à l'écran » du journal ; dans la décision 011, la conséquence sur
`LiensRail` devient « `LiensRail` garde ses règles, sur décision de Karamo du {date} ». Consigner le
retrait sous « Écarts avec la SPEC » des preuves ; les captures `survol-rail-*` restent, comme preuve de
ce qui a été refusé. Relancer le bloc de la tâche 17 (étape 2), puis `mutations.mjs` sans la mutation
T5, retirée du script avec son motif.

- [ ] **Step 4, seulement si Karamo refuse la valeur sombre du survol**

S'arrêter : une autre valeur n'est pas un réglage de publication. Elle demande les mesures du §0.5 sur
les trois surfaces et les textes du §5.2.2, une décision 011 réécrite et de nouvelles captures. La
version attend ; le dire à Karamo en ces termes.

- [ ] **Step 5 : poser la version, dater, et relancer le bloc**

`package.json` : `"version": "1.3.0"`. `README.md` : le badge `version-1.2.0` devient `version-1.3.0`,
et les deux commandes d'installation passent de `#v1.2.0` à `#v1.3.0`. Si le jour n'est pas le 28
septembre 2026, corriger la date du titre de l'entrée `## 1.3.0 · …` du journal. Dans `tasks/todo.md`,
cocher T21 : `- [x] T21 · accord de Karamo le {date}, version 1.3.0, étiquette v1.3.0 posée et poussée`.

```bash
git add package.json README.md CHANGELOG.md tasks/todo.md noyau tests docs
cat > .git/message-1.3.0.txt <<'MESSAGE'
La 1.3.0, datée du jour de sa publication, sur l’accord de Karamo
MESSAGE
grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with' .git/message-1.3.0.txt
git commit -F .git/message-1.3.0.txt
( CI=true GITHUB_ACTIONS=true pnpm typecheck && CI=true pnpm lint && CI=true pnpm format:check && CI=true GITHUB_ACTIONS=true pnpm test ) 2>&1 | tail -n 15
```

Le bloc doit rendre le code de sortie 0 sur ce commit, qui sera celui de l'étiquette :
`tests/documentation.test.ts` confronte désormais `1.3.0` au badge, aux commandes et au journal. Rouge :
on corrige, on recommite, on relance ; l'étiquette attend.

- [ ] **Step 6 : la fusion, l'étiquette et la poussée**

```bash
git checkout main
git merge --ff-only version-1.3.0-console
git tag -a v1.3.0 -m "v1.3.0"
git push origin main
git push origin v1.3.0
git ls-remote --tags origin v1.3.0
gh run list --limit 1
```

Attendu : une fusion en avance rapide (le commit étiqueté est celui qui a été vérifié), l'étiquette
présente sur `origin`, et le dernier passage de l'intégration continue « Qualité » vert sur `main`. Si
la fusion n'est pas une avance rapide, s'arrêter et le dire à Karamo. Si l'intégration continue est
rouge, le dire aussitôt : l'étiquette ne se déplace pas, le défaut se corrige en `1.3.1`.

---

## Couverture de la SPEC

Chaque critère du §15, et la tâche qui le porte. Les critères des user stories qui ne s'y trouvent pas
mot pour mot suivent.

| Critère (SPEC §15) | Tâches |
| ------------------ | ------ |
| `EnteteConsole.tsx` et `Selecteur.tsx` de Compte revérifiés, fichier et ligne ; verdicts consignés | 1 (`compte.md`), plan (E12) |
| Comptes de balises « avant » et mesure de la réserve basse « avant » consignés | 1 |
| Aucun composant ne rend de `<style>` sans `href` ni `precedence` ; la garde le prouve et relève le cas construit | 2, 3, 17 (T2, T3) |
| Cinq cents `Bouton` : une feuille, au client comme au serveur, et dans Chromium | 2 (`feuilles.test.tsx`), 18 |
| Les constantes `STYLE_…` gardent nom et forme ; les spécimens se régénèrent | 2, 12 (G10), 16 |
| Décision 010 | 3 |
| `--surface-survol` dans les quatre blocs ; paires mesurées ; témoin `--attention` ; décision 011 | 4 |
| Captures survol et sélection côte à côte, clair et sombre ; validées par Karamo | 18, 21 |
| `LiensRail` migré et capturé avant et après | 1, 5, 18, 21 |
| `MenuActions` : clavier, focus rendu, graves après un filet, sortie de conteneur, dans les moteurs ; tests jsdom | 10, 18 (Chromium ; Firefox et WebKit non couverts, E13) |
| `Bandeau` se ferme, reçoit le focus, garde son rôle | 6 |
| `EnteteRubrique` sans action : HTML de la 1.2.0 ; avec, l'action au-dessus du filet | 4 (instantané), 7 |
| Compteur : nom « Participants, 25 à traiter », nombre tabulaire | 8 (E6) |
| `Chiffre` compact en lien et sans lien ; `SqueletteIndicateurs compact` | 9 |
| `EnteteObjet` et `Selecteur` livrés | 11, 12 |
| Réserve basse corrigée et mesurée | 1, 13, 18 |
| Vérification d'un bloc verte, sortie recopiée | 17 |
| Aucune dépendance ajoutée ; aucun composant existant client | 14 (`index.test.ts`), 17 (T14), 19 |
| Montées d'essai du Portail, de Compte et du SDK, constatées ou non couvertes | 20 |
| Nombre de composants et sept gardes dans l'index, le README et `NOYAU.md` ; version `1.3.0` | 14, 15, 21 |
| Décisions 010 à 013 ; `tasks/todo.md` coché ; leçons | 3, 4, 13, 15, 18 |
| Rapport « Ce qui n'est pas couvert » | 18, 20 |
| Messages de commit sans mention interdite | chaque tâche (G15), 19, 21 |
| Étiquette `v1.3.0` seulement après l'accord de Karamo | 21 |

User stories, en plus : l'entrée du journal dit la place des feuilles, l'absence d'`id` et la lecture
dans un test (US-C02 : tâche 15) ; le guide dit la règle de cascade (US-C02 : tâche 15) ; `declencheur`
sans `aria-label` et largeur bornée de 12 à 20rem (US-C05 : tâche 10, et 18 pour les 192 px mesurés) ;
44 px au doigt pour un élément de menu, par `--hauteur-controle` (US-C05 : tâche 10, feuille) ; le
guide propose au SDK l'adoption de `UserButton.tsx:100-139` (US-C05 : tâche 15) ; en clair, le survol
se distingue de la sélection par la teinte et la case cochée (US-C06 : tâches 16 et 18) ; l'action suit
le `h1` dans l'ordre du document (US-C07 : tâche 7) ; zéro affiché, rien sans compteur, hauteur de
44 px inchangée (US-C08 : tâche 8, et la feuille de la 1.2.0) ; libellé en `var(--action)`, souligné au
survol gardé, sans lien ni l'un ni l'autre (US-C09 : tâche 9) ; le système ne ferme jamais le bandeau
de lui-même (US-C10 : tâche 6) ; « Fil d’Ariane », `ol`, sans `aria-current`, par `Lien` (US-C11 :
tâche 11) ; `CaseACocher`, `ChoixSegmente` et `ZoneTexte` ne montent pas (US-C12 : décision 012) ;
sous 768 px rien ne change, HTML de la 1.1.0 sans pied à l'attribut `style` près (US-C13 : tâches 13 et
18) ; chaque pièce de P10 a son verdict, son motif et son deuxième consommateur (US-C14 : décision 012,
journal) ; aucune étiquette publiée déplacée (US-C15 : tâche 21).
