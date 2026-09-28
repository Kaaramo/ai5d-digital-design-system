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
| La relecture, ses constats, leur réparation ou leur report | [`relecture.md`](relecture.md) |
| La montée d'essai du Portail, de Compte et du SDK | [`montee-portail.md`](montee-portail.md), [`montee-compte.md`](montee-compte.md), [`montee-sdk.md`](montee-sdk.md) |

## Écarts avec la SPEC

Les dix-neuf écarts E1 à E19 du plan (`docs/superpowers/plans/2026-09-28-version-1-3-0-console.md`),
recopiés, et tout écart trouvé pendant l'exécution, avec son constat.

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
| E20 | §3.15 (README, « Les gardes ») | Constaté à l'exécution de la tâche 15 : la ligne de `verifierFeuilleUnique`, ajoutée après `verifierAucunEspacementEnDur`, devient la dernière de la table, et le paragraphe qui suit, « La dernière admet une liste de valeurs hors échelle », parlerait désormais de la garde 7, qui n'en admet aucune | Le paragraphe nomme sa garde, `verifierAucunEspacementEnDur` ; la table garde l'ordre du plan (tâche 15) |

| E21 | §5.3.2 : le menu « se place par l'ancre CSS là où le moteur la connaît » | Constaté après la relecture (M8), dans Chromium 141 : placé par l'ancre, un menu plus haut que la place disponible des deux côtés sortait de la fenêtre, borne ou non | `position-try-order: most-block-size` et une hauteur bornée à la zone de l'ancre. Écart assumé : avec l'ancre, un menu qui tiendrait dessous mais aurait plus de place dessus s'ouvre dessus ; le repli préfère dessous quand il tient |
| E22 | §11.2 : le repli sans ancre « simulé » | La simulation de la tâche 18 ne refusait que `anchor` à `CSS.supports` ; une fois la condition passée à `position-area` (I2), elle ne simulait plus rien | La sonde refuse `anchor` et `position-area` pour le repli, et joue une troisième passe, Chromium 125 à 128 (`anchor-name` connu, `position-area` inconnu) |
| E23 | §11.1 : les spécimens lisent les vraies feuilles | Le générateur ne résolvait que les constantes numériques exportées ; `STYLE_MENU` interpole désormais `CONDITION_ANCRE` | Le générateur résout aussi une chaîne écrite dans le fichier même, et échoue toujours sur une interpolation inconnue |

E20 est né de l'exécution (tâche 15), E21 à E23 de la relecture (tâche 19). La première vérification
d'un bloc est passée d'un coup, et chaque mesure du banc a rendu la valeur que le plan attendait.

## Ce qui n'est pas couvert

- **Firefox et WebKit**, absents de ce poste ; **Safari**, faute d'appareil. Le menu, l'ancre CSS et le
  hissage n'y sont pas constatés. WebKit de Playwright n'est pas Safari.
- **Le repli sans ancre CSS dans un vrai moteur** : il n'est joué que simulé dans Chromium (sans
  ancre, puis comme Chromium 125 à 128), et testé dans jsdom. Aucun Chromium 125 à 128 réel n'a été
  lancé.
- **Un moteur sans l'API `popover`** (Safari avant 17, Firefox avant 125) : le menu y resterait
  affiché dans la ligne, et Flèche bas lèverait `showPopover is not a function` (relecture, M9,
  reporté). Baseline 2024 ; aucun produit ne vise ces moteurs.
- **Un téléphone réel.** Le doigt est une émulation de Chromium, vérifiée par
  `matchMedia('(pointer: coarse)')` avant chaque capture.
- **L'ordre de la cascade face à une règle de classe hors couche d'un produit** : aucune n'a été
  trouvée dans le Portail ; le sens est sondé sous React 19.2.8 (relecture, M3), pas dans une page de
  Next rendue.
- **Une page de la console rendue sur le poste**, et le compte de ses balises (tâche 20, étape 5) :
  elle se joue sur le poste de Karamo, contre le vrai Compte ; elle n'a pas été jouée.
- **Le poids du flux RSC de Next** : un composant serveur rendu cinq cents fois y porterait peut-être
  cinq cents copies du texte de sa feuille. Non mesuré (relecture, hypothèse reportée).
- **Le dépôt du SDK** : la montée du SDK s'est faite sur son paquet livré, faute d'accès à
  `Kaaramo/ai5d-auth`.
- **La construction d'un produit** : aucun `build` n'a été lancé.
- **Trois gestes du menu non joués par la sonde** : la flèche bas sur le déclencheur, Maj+Tab dans le
  menu, et Entrée ou Espace sur un élément. Ils sont testés dans jsdom, et la relecture les a joués à
  la main dans Chromium 141, conformes ([`relecture.md`](relecture.md)) ; la sonde ne les rejoue pas.
- **La zone sûre basse d'un iPhone** : `env(safe-area-inset-bottom)` vaut zéro dans Chromium de bureau ;
  la réserve à 390 px est mesurée avec une zone sûre nulle.
