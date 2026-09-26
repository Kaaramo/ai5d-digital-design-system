# SPEC · Version 1.2.0 : ce qui manque au système pour l’espace participant

| | |
| - | - |
| **Projet** | AI5D Digital Design System, paquet `@ai5d/design-system` |
| **Dépôt** | `Kaaramo/ai5d-digital-design-system`, **public** ; dossier local `F:\ai5d-digital-design-system` |
| **Version publiée par ce lot** | `1.2.0`, étiquette `v1.2.0` |
| **Nom de ce lot dans les documents du Portail** | « Système 1.1 » (SPEC P09 §0.2 et §7, SPEC P10 §7.1) |
| **Priorité** | Haute. Le correctif du plancher tactile touche tous les produits sur téléphone ; P09 ne commence pas son code sans cette version |
| **Dépend de** | `v1.1.0`, publiée le 25 septembre 2026 (commit `b1067c1`) |
| **Suivi de** | La montée du Portail à `v1.2.0` (P09), puis le lot que le Portail appelle « Système 1.2 », qui publiera `1.3.0` pour la console (P10) |
| **Responsable** | Karamo Sylla |
| **Document compagnon** | [`USER-STORIES-Version-1.2.0-Espace-Participant.md`](USER-STORIES-Version-1.2.0-Espace-Participant.md) |
| **Date** | 26 septembre 2026 |

---

## 0. Constats et décisions, avant toute spécification

Ce lot ajoute au système ce que la V2 de l’espace participant du Portail lui demande (SPEC P09 §7,
quinze éléments), et corrige au passage un défaut que tous les produits portent sur téléphone. Les
constats ci-dessous ont été faits le 26 septembre 2026, en machine : sur ce dépôt au commit
`b1067c1` (`v1.1.0`), sur le Portail au commit `ea1225f`, sur Compte (`ai5d-platform`) au commit
`1ef7ef2`, et sur le SDK `@ai5d/auth` 1.1.0 tel qu’il est installé dans le Portail. Ce qui est
constaté est écrit comme un fait ; ce qui reste à trancher est au §0.8.

Ce dépôt est **public**. Rien de ce lot n’y dépose de donnée personnelle, de clé ni d’adresse réelle :
les exemples emploient les personnes fictives du PRD du Portail.

### 0.1 Le numéro : `v1.1.0` existe déjà, le lot publie `1.2.0`

**`v1.1.0` existe déjà** (25 septembre 2026, commit `b1067c1`) : `erreur` dans `BoiteMotif` et
`BoiteConfirmation`, et `color-scheme` qui suit le thème avec `accent-color` à `--action`. Le lot
publie donc la **1.2.0**. L’élément n° 5 du contrat de P09 est **en partie livré** : il reste
`::selection`, `caret-color`, `scrollbar-color` et l’export `COULEURS_NAVIGATEUR`. La console du
Portail publiera la 1.3.0 plus tard.

Correspondance des noms, à garder en tête en lisant les documents du Portail :

| Nom dans le Portail | Version publiée ici | Contenu |
| ------------------- | ------------------- | ------- |
| (aucun) | `1.1.0`, publiée | L’erreur dans les boîtes de dialogue, le schéma de couleur du navigateur |
| « Système 1.1 » | **`1.2.0`, ce lot** | Le contrat de P09 §7, tel que ce document le retient (§0.5) |
| « Système 1.2 » | `1.3.0`, lot suivant | Le contrat de P10 §7.2 (table de données, menus, injection unique des feuilles…) |

### 0.2 Le plancher tactile est cassé sur tout écran tactile

**Le plancher tactile est cassé sur tout écran tactile** (élément n° 6 du contrat), mesuré dans
Chromium avec les vrais `noyau/jetons.css` et `densites/profils.css`, profil `equilibre` : à la
souris, `--hauteur-controle` vaut `48px` et `--ligne-liste` `56px` (élément de 48 px et 56 px) ; en
émulation tactile (`pointer: coarse`, 390 px), les deux variables sont **vides** (invalides, cycle de
`densites/profils.css:79-80`), un élément de hauteur `var(--hauteur-controle)` tombe à **21 px** et
une ligne de `min-height: var(--ligne-liste)` à **18 px**. `Bouton` et `Champ` sont rattrapés par
`min-height: var(--cible-tactile)` (44 px) : sur téléphone, **toutes leurs tailles (`sm`, `md`,
`lg`) valent 44 px**, et le profil perd ses 48 px. Les squelettes de contrôle (`Squelette.tsx:325`,
`:328`) s’effondrent. Tous les produits AI5D sont touchés sur téléphone : c’est un correctif du
système, prioritaire dans le lot.

La cause se lit en une ligne. Sous `@media (pointer: coarse)`, la feuille écrit
`--hauteur-controle: max(var(--hauteur-controle), 44px)` : la propriété se lit elle-même. Pour le
navigateur, une propriété personnalisée qui dépend d’elle-même est **invalide au moment du calcul** ;
elle ne vaut ni l’ancienne valeur ni 44 px, elle ne vaut rien.

Deux constats de plus, qui expliquent que le défaut ait survécu depuis la 0.1.0 :

- **Le test l’exige.** `tests/densites.test.ts:135-138` vérifie que le bloc contient littéralement
  `max(var(--hauteur-controle), 44px)`. La forme fautive est celle que le test protège.
- **La garde distribuée aux produits l’exige aussi.** `verifierPlancherTactile`
  (`gardes/index.ts:183-184`) relève une infraction si cette même chaîne est **absente**. Un produit
  qui corrigerait la feuille chez lui ferait échouer sa propre intégration continue.

jsdom ne calcule pas les propriétés personnalisées : aucun test de rendu du dépôt ne pouvait voir la
hauteur tomber. Le §5.1 dit comment le correctif se prouve quand même.

### 0.3 Où en sont les consommateurs

| Consommateur | Version installée | Où |
| ------------ | ----------------- | -- |
| AI5D Portail | `v1.0.1` | `package.json:26` du Portail. Il n’a pas monté à `1.1.0` |
| AI5D Compte | `v1.1.0` | `apps/compte/package.json:11` |
| SDK `@ai5d/auth` 1.1.0 | dépendance de pair `*`, de développement `v1.0.1` | `package.json:31` et `:37` du SDK installé |

Le Portail montera donc de `v1.0.1` à `v1.2.0` en une fois : le guide de montée (§13) reprend aussi
ce que `1.1.0` change.

### 0.4 La règle du deuxième consommateur, et comment ce lot la lit

Le README l’écrit : « un composant monte dans le système quand un deuxième produit en a besoin, pas
avant ». Le contrat de P09 mêle des objets de trois natures, et la règle ne s’applique pas à tous de
la même façon. Ce lot la lit ainsi, et la décision 009 (§3) le consigne :

| Nature | Ce qui la justifie | Précédents dans ce dépôt |
| ------ | ------------------ | ------------------------ |
| **Composant nouveau** | Un **deuxième produit** qui en a le besoin, constaté dans son code. Sinon, il reste dans le produit qui l’a demandé, écrit sur les jetons avec l’API proposée (décision 030 du Portail), et monte le jour où le deuxième arrive | `GabaritPortail`, monté sans consommateur et retiré en `1.0.0` ; `CoquilleRail`, montée quand le Portail a demandé un rail |
| **Extension d’un composant déjà partagé** (une propriété, une valeur de type) | Le besoin d’un produit suffit, parce que le composant est déjà commun et que l’ajout est rétrocompatible. Le constat dans Compte, quand il existe, est écrit | `Champ` avec icône et commande (0.2.2), `danger-contour` (0.6.0), l’état de `CarteAction` (0.7.0), `erreur` des boîtes (1.1.0) : chacun demandé par un seul produit |
| **Jeton ou règle globale de feuille** | Un **correctif** d’un défaut du système, ou une règle **transversale** par nature (typographie, mouvement, navigateur), qui vaut pour tout produit qui l’emploie | `--espace-*` (0.3.1), `--surface-selection` (1.0.0), `color-scheme` (1.1.0) |

**La console du Portail n’est pas un deuxième consommateur.** Le contrat de P09 la cite pour les
éléments n° 2, 10 et 11 ; c’est le même produit. Elle compte pour savoir si une pièce convient à la
densité `compact` (§5, chaque composant le dit), pas pour la faire monter.

### 0.5 Le contrat de P09, élément par élément

Pour chacun des quinze éléments de SPEC P09 §7 : le verdict de ce lot, le deuxième consommateur
**constaté** dans le code (fichier et ligne), ou « non constaté », et ce que le lot en fait. Les
chemins de Compte sont relatifs à `ai5d-platform` ; ceux du SDK, à `node_modules/@ai5d/auth` dans le
Portail.

| # | Élément | Verdict | Deuxième consommateur, constaté en machine | Ce que le lot en fait |
| - | ------- | ------- | ------------------------------------------ | --------------------- |
| 1 | `Bouton` rendu en lien | **Retenu** (extension) | **Constaté deux fois.** Compte : `apps/compte/components/RetourPortail.tsx:24` et `LienInvalide.tsx:56` naviguent par `window.location.assign` depuis un `Bouton`, parce que « le `Bouton` du système est un `<button>` » (`RetourPortail.tsx:18-19`). SDK : `src/react/AccesRefuse.tsx:126-131`, même contournement, même motif écrit | §5.2 |
| 2 | Ton `neutre` | **Retenu** (extension) | **Constaté.** `apps/compte/components/CarteProduit.tsx:26-28` et `apps/compte/lib/acces-libelles.ts:17-21` : « `TonSemantique` du système n’a aucune valeur qui dise “rien à signaler” » ; Compte rend « SANS ACCÈS » en texte faute de ton | §5.3 |
| 3 | `OngletsRubrique` relié au routeur | **Retenu** (extension), deux mécanismes précisés | **Constaté pour le lien.** `apps/compte/components/OngletsPortail.tsx:95-99` rend `OngletsRubrique` sans composant de lien (`app/(portail)/profil/layout.tsx:48`, `app/(portail)/securite/(onglets)/layout.tsx:56`) : chaque sous-page de Compte recharge le document. Six onglets : non constaté dans Compte | §5.4. Le fondu et l’onglet actif amené dans la vue passent par le CSS, sans directive client (§17, écarts 3 et 4) |
| 4 | `CoquilleRail`, deux pieds | **Retenu** (extension) | **`piedCompact` constaté** : dans Compte, `SelecteurTheme` n’est rendu que dans le pied du rail (`apps/compte/components/PiedDuRail.tsx:106`), invisible sous 768 px ; la barre compacte ne porte que le disque et la sortie (`CoquillePortail.tsx:67-72`). **`piedContenu` non constaté** : Compte a décidé de ne porter aucun lien légal dans son portail (`PiedDuRail.tsx:112-122`, sa décision 030) | §5.5 |
| 5 | Surfaces du navigateur | **En partie livré en 1.1.0.** Reste : `caret-color` **retenu** ; `::selection` **retenu, autres jetons** ; `scrollbar-color` **retiré** ; `COULEURS_NAVIGATEUR` **retenu** | Non constaté : Compte n’exporte ni `viewport` ni `generateViewport` (`apps/compte/app/layout.tsx`, aucune occurrence). Justification : règle transversale, et seule forme qu’une couleur de thème peut prendre dans `<meta name="theme-color">`, qu’aucun produit n’a le droit d’écrire | §5.7 ; motifs des deux écarts au §0.6 |
| 6 | Plancher tactile sans cycle | **Retenu, correctif prioritaire** | Tous les produits. Compte pose `data-densite="equilibre"` (`apps/compte/app/layout.tsx:45`) et emploie `Bouton` et `Champ` partout | §5.1, premier du lot |
| 7 | Largeurs de lecture | `--mesure-texte` **retenu** (jeton typographique transversal) ; `--largeur-lecture` **retiré** | Non constaté pour les deux valeurs. Compte borne ses phrases courtes à `46ch` (`app/(portail)/organisations/page.tsx:226`, `:249` ; `components/SurDemande.tsx:72`) et ses écrans hors coquille à 440 px par `GabaritAuth` : aucune colonne de `36rem` | §5.14 ; repli de `--largeur-lecture` au §17 |
| 8 | Mouvement par rôle | `--mouvement-retour`, `-entree`, `-sortie` **retenus** ; règle de `--duree-longue` **réécrite** ; `--duree-signature` **retiré** ; `--duree-survol` **sans objet** ; primitive `Apparition` **retirée** | **Constaté pour les jetons** : Compte écrit la durée et la courbe à la main (`app/(portail)/organisations/[slug]/Gestion.tsx:51`, `opacity 250ms ease-out` littéral ; `components/BasculeMotDePasse.tsx:71` ; `components/Deconnexion.tsx:74`). **Non constaté pour `Apparition`** | §5.14 ; décision 006 |
| 9 | `TitreSection` | **Retenu** (composant nouveau) | **Constaté.** Douze titres en Fraunces écrits à la main dans Compte (`grep -rn "police-titre"` dans `apps/compte/app` et `components`), aux trois mêmes tailles : `components/EnteteEcran.tsx:65` (h1, `--taille-2xl`), `LienInvalide.tsx:33` et `app/invitation/[id]/Decision.tsx:90` (h1, `--taille-xl`), `app/(portail)/organisations/page.tsx:214` (h2, `--taille-xl`), `components/CarteProduit.tsx:136` (h3, `--taille-lg`). Les copies ont déjà divergé : certaines portent le lettrage, d’autres non | §5.8 |
| 10 | `LigneLien` et `ListeLignes` | **Retenus** (composants nouveaux) | **Constaté.** `apps/compte/components/LigneCompte.tsx:24-34` : une ligne entière en `Link`, stylée en ligne, sans survol, sans focus, sans appui ; sa propriété `dernier` (`:22`, `:31`) retire le filet de la dernière ligne, ce que `ListeLignes` fait seule | §5.9, §5.10 |
| 11 | `ListeDefinitions` | **Retenu** (composant nouveau) | **Constaté.** `apps/compte/app/admin/comptes/[id]/page.tsx:83-110` : un `<dl>` écrit à la main, libellés en classe maison | §5.11 |
| 12 | `ValeurCopiable` | **Retenu** (composant nouveau) | **Constaté.** `apps/compte/components/CopierValeur.tsx:16`, employé par `app/admin/cles/GestionCles.tsx:133` et `app/admin/webhooks/GestionReceptions.tsx:202` | §5.12 |
| 13 | Logotype hors du DOM | **Retenu sous une autre forme** : la recette `LOGOTYPE` ; le tracé `TRACE_LOGOTYPE` **repoussé** | **Constaté pour la recette.** `apps/compte/emails/Coquille.tsx:44-53` écrit « AI5D » d’un bloc, en Fraunces, à l’encre : ni « 5 » bleu, ni « 5 » incliné. **Non constaté pour le tracé** : Compte ne produit ni PDF ni image de partage | §5.13 ; tracé au lot L4 (§16) |
| 14 | `IndicateurNavigation` | **Retiré** | Non constaté. Compte ne suit aucune navigation en cours (aucun `useLinkStatus`) et s’appuie sur ses `loading.tsx` (vingt dans `app/`). Le comportement de `useLinkStatus` n’est pas encore constaté non plus (SPEC P09 §0.9, point 2) | Reste dans le Portail, API de P09 inchangée (§17) |
| 15 | `SelecteurTheme` | **Retenu** : cibles de 44 px au doigt (**correctif**) ; `libellesVisibles` (extension) | **Constaté pour la cible** : même composant, mêmes 32 px dans Compte (`SelecteurTheme.tsx:60`). `libellesVisibles` : non constaté dans Compte, dont le sélecteur vit dans le rail | §5.6 |

Bilan : **onze éléments retenus en tout ou partie, deux retirés (n° 14 et la primitive `Apparition`
du n° 8), un repoussé (le tracé du n° 13)**, et quatre sous-éléments écartés avec leur mesure
(`scrollbar-color`, `--largeur-lecture`, `--duree-signature`, `--duree-survol`).

### 0.6 Ce que la lecture du code a montré en plus

| Constat | Où | Conséquence |
| ------- | -- | ----------- |
| `::selection` sur `--info-fond`, comme le propose P09, **disparaît sur une carte sombre** : `--info-fond` (#14203A) contre `--surface-2` (#11212D) mesure **1,01** | calcul WCAG, §6 | La sélection prend `--action` et `--texte-sur-action` (§5.7), mesurés partout |
| `scrollbar-color: var(--bordure-forte) transparent` donnerait un pouce de défilement à **1,49** sur `--surface-1` en clair ; et `color-scheme`, livré en 1.1.0, assombrit déjà les barres de défilement | calcul WCAG ; `CHANGELOG.md`, 1.1.0 | `scrollbar-color` retiré |
| `--duree-survol` n’existe pas dans le système | `grep -rn "duree-survol"` : aucune occurrence | Rien à déprécier |
| Le voile de débordement d’`OngletsRubrique` a été **retiré en 0.6.3** parce qu’il se dessinait aussi là où rien ne débordait, et qu’une mesure au montage aurait fait du composant un module client | `CHANGELOG.md`, 0.6.3 ; `OngletsRubrique.tsx:34-49` | Le fondu revient, mais conditionné par le navigateur lui-même (frise de défilement), sans script : §5.4, décision 007 |
| `OngletsRubrique` sans directive peut être rendu par un composant serveur, avec des icônes qui sont des fonctions. Lui ajouter `'use client'` pour un `scrollIntoView` ferait tomber tout appelant serveur, comme `Avatar` en 0.6.2 | `CHANGELOG.md`, 0.6.2 ; `tests/index.test.ts:161-191` | L’onglet actif est amené dans la vue par le CSS (`scroll-initial-target`), pas par un effet |
| `ComposantLien` n’accepte que `href`, `className`, `aria-current` et `children` | `LiensRail.tsx:42-47` | Un bouton en lien a besoin de `style`, `target`, `rel`, des attributs `data-*` : le type s’élargit (§5.0.3) |
| Aucun consommateur n’étend `ProprietesBouton` ni n’énumère `TonSemantique` dans un `Record` | `grep` dans Compte, le Portail et le SDK : seule `CoquilleALaMesure.tsx:34` de Compte dérive un type de propriétés, celui de `CoquilleRail` | Changer `ProprietesBouton` en union et ajouter `neutre` ne casse aucun appel constaté |
| `NOYAU.md:79` annonce « 44 paires » de contraste ; `tests/jetons.test.ts` en mesure **49** (21 en clair, 22 en sombre, 6 couples de boutons) | `NOYAU.md:79`, `tests/jetons.test.ts:109-248` | Le nombre écrit à la main a vieilli : il est retiré du document (leçon « Un nombre écrit à la main dans une documentation vieillit ») |
| `--texte-faible` sur `--surface-selection` mesure **4,51** en clair : la paire tient, de peu | calcul WCAG, §6 | La paire entre dans la garde : le jour où l’un des deux jetons bouge, la suite le dit |
| `--ligne-liste` n’est lue par aucun composant du système ; seul le préréglage l’expose (`--spacing-ligne`, `ai5d.preset.css:119`) | `grep -rn "ligne-liste"` | `LigneLien` en devient le premier lecteur (§5.9) |
| En mode `libellesVisibles`, trois segments « Clair », « Sombre », « Système » avec icône demandent environ 240 px ; le pied du rail en offre 216 à 768 px (rail de 240 px moins 24 px de rembourrage) | estimation sur Inter 14 px, à prouver en capture | Les icônes se retirent sous 17rem de largeur disponible (§5.6) |

### 0.7 Ce que le lot ne change pas

- **Aucune valeur de jeton existante.** Une garde le prouve contre un instantané de `1.1.0` (§6).
- **Aucune propriété retirée, aucune variante renommée.** Deux types s’élargissent (`TonSemantique`,
  `ComposantLien`), un devient une union (`ProprietesBouton`) ; les appels constatés compilent tels
  quels (§0.6).
- **Aucune dépendance ajoutée** au `package.json`, ni de production ni de développement. Les icônes
  nouvelles viennent de `lucide-react`, déjà en pair.
- **Aucun cadriciel.** Aucun composant n’importe Next ; le lien du routeur arrive toujours en
  propriété.
- **`noyau/marque.css`** et les six jetons de marque ne bougent pas.
- **Aucun composant existant ne passe côté client.** Les deux composants nouveaux qui ont un état
  (`ValeurCopiable`) déclarent `'use client'` ; tous les autres restent rendables par un composant
  serveur.

### 0.8 Ce qui reste ouvert, et qui le tranche

1. **Le classement de la version.** Au doigt, le correctif change le rendu de tous les produits
   (boutons `md` de 44 à 48 px en `equilibre`, `lg` de 44 à 56 px). Aucune valeur déclarée ne change :
   c’est la valeur que `DENSITES.md` documente qui devient enfin vraie. **Proposition : mineure,
   `1.2.0`**, avec la liste « Ce qui change à l’écran » en tête de l’entrée du journal, comme en
   `1.0.0`. **Karamo tranche** au moment de l’étiquette (§14) ; s’il juge le changement majeur, le lot
   publie `2.0.0` sans rien changer d’autre.
2. **La sélection de texte en bleu d’action** (§5.7) change la sélection dans tous les produits.
   Karamo la valide sur les captures en clair et en sombre, ou la retire avant l’étiquette.
3. **`animation-timeline: scroll()` et `scroll-initial-target`** (§5.4) : leur prise en charge dans
   Chromium, Firefox et Safari se constate au plan, dans le navigateur. Sans eux, le repli est le
   comportement de `1.1.0`, et il est écrit.
4. **Safari** ne se recette que si Karamo dispose d’un appareil ; sinon, c’est une ligne « non
   couvert » du rapport de preuves.
5. **La publication de l’étiquette `v1.2.0`** demande l’accord explicite de Karamo (§14).

---

## 1. Objectif

Donner au système ce qu’un deuxième produit lui demande pour qu’une interface se tienne au doigt, sur
un réseau lent, en clair comme en sombre : un plancher tactile qui fonctionne enfin sur téléphone, un
lien qui a l’apparence et les états d’un bouton, des onglets et des lignes qui répondent dès l’appui
sans recharger le document, un ton qui dit « rien à signaler » sans se colorer en réussite, un titre
et une ligne de définition écrits une fois pour tous les produits, une valeur qui se copie ou se
sélectionne, des jetons qui nomment la mesure d’un texte et le rôle d’un mouvement, un navigateur qui
suit le thème jusque dans la sélection, et une recette du logotype que le PDF, l’image de partage et
le courriel peuvent suivre. Sans changer une seule valeur de jeton, et sans qu’un produit qui monte
de version ait à réécrire un appel.

Le lot ne se déclare pas terminé sur une suite verte : il se prouve par une mesure dans un vrai
navigateur, au doigt et à la souris, et par des captures des spécimens en clair et en sombre (§11).

---

## 2. User Stories (résumé)

Le détail narratif est dans le document compagnon
[`USER-STORIES-Version-1.2.0-Espace-Participant.md`](USER-STORIES-Version-1.2.0-Espace-Participant.md) :
dix-sept stories, neuf epics. Deux sortes de personas : les **produits** qui consomment le système
(Karamo qui intègre le Portail, puis Compte), et la **personne** qui utilise ces produits
(Aïssatou Camara, participante sur téléphone).

| # | En tant que | Je veux | Afin de |
| - | ----------- | ------- | ------- |
| US-S01 | Aïssatou, sur son téléphone | des boutons, des champs et des lignes à leur vraie hauteur | viser sans me tromper et voir une attente à la forme de ce qui arrive |
| US-S02 | Aïssatou, le soir sur son téléphone | régler le thème sans ouvrir un ordinateur | lire sans éblouissement |
| US-S03 | Karamo, qui intègre le Portail | rendre un lien avec l’apparence et les états d’un bouton | ne plus écrire un seul bouton à la main |
| US-S04 | Compte | quitter `window.location.assign` pour un vrai lien | qu’un retour s’ouvre dans un onglet, se copie et fonctionne sans script |
| US-S05 | Aïssatou, sur un réseau lent | voir une ligne réagir dès que je la touche | ne pas toucher deux fois |
| US-S06 | Aïssatou, dans sa session | passer d’un onglet à l’autre sans recharger la page, et voir ceux qui dépassent | trouver l’onglet Attestation sur un écran étroit |
| US-S07 | Aïssatou, puis Compte | lire un état au repos dans un ton qui ne dit ni réussite ni invitation | ne pas confondre « inscrite » et « réussi » |
| US-S08 | Aïssatou, qui vérifie sa page de preuve | lire les faits d’une attestation en libellés et valeurs alignés | voir d’un coup d’œil ce qu’un recruteur verra |
| US-S09 | Karamo, puis Compte | écrire un titre de section par un seul composant | que les titres ne divergent plus d’un écran à l’autre |
| US-S10 | Aïssatou, sur un ordinateur | lire un programme en lignes de longueur raisonnable | ne pas perdre la ligne suivante |
| US-S11 | Karamo, puis Compte | écrire une transition par son rôle | que tous les survols et toutes les entrées aient le même tempo |
| US-S12 | Karamo | donner à la délivrance de l’attestation une durée longue, déclarée | marquer le moment sans en faire un ornement |
| US-S13 | Aïssatou, en thème sombre | que la barre d’adresse, le curseur et la sélection suivent le thème | ne pas voir une bande blanche ni perdre sa sélection |
| US-S14 | Aïssatou | copier l’adresse de mon badge, ou la sélectionner si la copie échoue | la partager dans tous les cas |
| US-S15 | Karamo, puis Compte | composer le logotype dans un PDF ou un courriel selon la marque | que le « 5 » reste bleu et incliné hors de l’écran |
| US-S16 | Karamo | une version prouvée au navigateur avant d’en poser l’étiquette | ne publier à tous les produits que ce qui a été vu |
| US-S17 | Compte | monter de version en sachant ce qui change à l’écran | ne rien découvrir en production |

---

## 3. Livrables

| # | Livrable | Fichiers | Nature |
| - | -------- | -------- | ------ |
| 3.1 | Plancher tactile sans cycle | `densites/profils.css`, `densites/DENSITES.md`, `gardes/index.ts` (`verifierPlancherTactile`) | Correctif |
| 3.2 | Règles globales du navigateur | `noyau/jetons.css` (`caret-color`, `::selection`) | Feuille |
| 3.3 | Couleurs du navigateur | `noyau/couleurs-navigateur.ts` (nouveau), `noyau/theme.ts` (réexport) | Code |
| 3.4 | Jetons de mesure et de mouvement | `noyau/jetons.css` (`--mesure-texte`, `--mouvement-retour`, `--mouvement-entree`, `--mouvement-sortie` ; règle de `--duree-longue` réécrite dans le commentaire) | Jetons |
| 3.5 | Outils communs aux liens | `noyau/composants/lien.ts` (nouveau, module sans JSX) ; `noyau/composants/LiensRail.tsx` (`ComposantLien` élargi) | Code |
| 3.6 | `Bouton` en lien | `noyau/composants/Bouton.tsx` | Extension |
| 3.7 | Ton `neutre` | `noyau/composants/Pastille.tsx`, `PastilleEtat.tsx`, `Bandeau.tsx` | Extension |
| 3.8 | `OngletsRubrique` relié au routeur | `noyau/composants/OngletsRubrique.tsx` | Extension |
| 3.9 | Deux pieds de coquille | `noyau/composants/CoquilleRail.tsx` | Extension |
| 3.10 | Sélecteur de thème au doigt | `noyau/composants/SelecteurTheme.tsx` | Correctif et extension |
| 3.11 | Composants nouveaux | `noyau/composants/TitreSection.tsx`, `LigneLien.tsx`, `ListeLignes.tsx`, `ListeDefinitions.tsx`, `ValeurCopiable.tsx` | Composants |
| 3.12 | Recette du logotype | `noyau/logotype.ts` (nouveau), `noyau/composants/Logotype.tsx` (la lit), `package.json` (export `./logotype`) | Code |
| 3.13 | Index | `noyau/composants/index.ts` : cinq composants et leurs types, `ATTRIBUT_EN_ATTENTE`, `MENTION_NOUVEL_ONGLET`, `ONGLETS_RUBRIQUE_MIN`, `ONGLETS_RUBRIQUE_MAX`, `CONTENEUR_DEFINITIONS_DEUX_COLONNES`, `DUREE_SUCCES_COPIE_MS` | Code |
| 3.14 | Tests et gardes | §10 | Tests |
| 3.15 | Spécimens | `_build/generer-specimens.mjs`, `specimens/composants.html` régénéré | Preuve visuelle |
| 3.16 | Documents | `noyau/NOYAU.md` (trente-neuf composants, ton neutre, mesure, mouvement, nombre de paires retiré), `README.md` (version, badge, trente-neuf, tableau des familles), `noyau/formulations.md` (copie, nouvel onglet), `noyau/PALIERS.md` (règle 6 corrigée), `CHANGELOG.md` (§12) | Documents |
| 3.17 | Décisions | `docs/decisions/005-le-plancher-tactile-sans-cycle.md`, `006-la-duree-longue-et-le-moment-signature.md`, `007-le-fondu-des-onglets-revient-mesure-par-le-navigateur.md`, `008-le-logotype-hors-du-dom-une-recette-avant-un-trace.md`, `009-ce-qui-monte-et-ce-qui-s-etend.md` | Documents |
| 3.18 | Version | `package.json` (`"version": "1.2.0"`) | Manifeste |
| 3.19 | Preuves | `docs/preuves/1.2.0/` : mesure du plancher avant et après, captures, vérification, ce qui n’est pas couvert | Preuves |
| 3.20 | Suivi | `docs/superpowers/plans/2026-09-26-version-1-2-0-espace-participant.md` (le plan), `tasks/todo.md` (une section 1.2.0), `tasks/lessons.md` (les leçons du lot) | Suivi |

---

## 4. Ordre des travaux

L’ordre n’est pas indifférent : le correctif passe d’abord, parce que tout ce qui suit se mesure au
doigt et qu’on ne mesure rien sur une hauteur invalide. Les tests s’écrivent **avec** le code de
chaque tâche, marqués « écrite, non testée » ; la vérification se lance d’un seul bloc à la fin.

```
0. Plan              superpowers:writing-plans, couple SPEC et user stories déclaré dans **Spec:**
                     · tasks/todo.md · mesure « avant » du plancher dans Chromium, consignée
1. Plancher          profils.css sans cycle · garde verifierPlancherTactile · tests de forme et
                     de valeur effective · DENSITES.md · décision 005
2. Jetons, feuille   --mesure-texte, --mouvement-* · règle de --duree-longue (décision 006)
                     · caret-color, ::selection · COULEURS_NAVIGATEUR · instantané 1.1.0 · paires
3. Liens             lien.ts · ComposantLien élargi · Bouton en lien
4. Extensions        ton neutre · OngletsRubrique (décision 007) · CoquilleRail · SelecteurTheme
5. Composants        TitreSection · LigneLien · ListeLignes · ListeDefinitions · ValeurCopiable
6. Logotype          noyau/logotype.ts · Logotype.tsx la lit · export ./logotype (décision 008)
7. Documents         NOYAU · README · formulations · PALIERS · décision 009 · CHANGELOG
8. Spécimens         pnpm specimens
9. Vérification      pnpm typecheck && pnpm lint && pnpm format:check && pnpm test, d’un seul bloc
10. Preuves          mesure « après » du plancher · captures souris et doigt, clair et sombre
                     · docs/preuves/1.2.0/ · ce qui n’est pas couvert
11. Revue            relecture du lot contre ce document, écarts consignés
12. Étiquette        accord explicite de Karamo, puis v1.2.0 et poussée (§14)
```

Chaque tâche du plan donne un commit, en français, dont le message passe la recherche des mentions
interdites que la règle des commits de Karamo impose (aucun co-auteur, aucune mention d’outillage),
avec un résultat nul. Aucune poussée sans accord.

---

## 5. Comportements attendus, composant par composant

### 5.0 Règles communes à tout le lot

#### 5.0.1 Les jetons employés, et leur valeur pour la lecture

Aucune couleur ni aucun espacement littéral dans un composant (gardes 1 et 6). Les valeurs entre
parenthèses sont celles du thème clair puis du thème sombre.

| Jeton | Valeur (clair, sombre) | Emploi dans ce lot |
| ----- | ---------------------- | ------------------ |
| `var(--surface-1)` | #FAF7F2, #0B1620 | Papier ; valeurs de `COULEURS_NAVIGATEUR` |
| `var(--surface-2)` | #FFFFFF, #11212D | Champ de `ValeurCopiable`, bouton neutre |
| `var(--surface-3)` | #FFFFFF, #172C3B | Survol d’une `LigneLien` en sombre |
| `var(--surface-chaude)` | #F4EFE7, #171F26 | Fond du ton `neutre` ; survol d’une `LigneLien` en clair |
| `var(--surface-selection)` | #EAEFFF, #172C3B | Appui d’une `LigneLien` et d’un onglet |
| `var(--bordure)` | #E7E0D6, #22323F | Filets de `ListeLignes`, du pied de contenu, des onglets |
| `var(--bordure-forte)` | #D5CCBE, #2E4252 | Trait d’un onglet en attente, contour du bouton neutre |
| `var(--texte-fort)` | #051C2C, #F2F5F7 | Titres, valeurs de définition, titre d’une ligne |
| `var(--texte)` | #2B3A45, #C9D4DC | Corps d’un bandeau |
| `var(--texte-faible)` | #616F78, #8D9AA5 | Ton `neutre`, libellés de définition, description et méta d’une ligne, chevron |
| `var(--action)` | #2251FF, #6B88FF | Anneau de focus, fond de la sélection de texte, curseur de saisie, onglet actif |
| `var(--texte-sur-action)` | #FFFFFF, #051C2C | Texte sélectionné |
| `var(--info)`, `var(--info-fond)` | #2251FF sur #EAEFFF, #6B88FF sur #14203A | Ton `information`, inchangé |

Espacements : `--espace-1` 4 px, `-2` 8 px, `-3` 12 px, `-4` 16 px, `-6` 24 px, `-8` 32 px, `-12`
48 px, `-16` 64 px. **Il n’existe pas de `--espace-5`.** Rayons : `--rayon-sm` 4 px, `--rayon-md`
10 px, `--rayon-plein`. Cible : `--cible-tactile` 44 px.

#### 5.0.2 Les feuilles injectées

Chaque composant qui a des états injecte sa feuille sous un identifiant stable (`ai5d-…`), comme
aujourd’hui ; toute classe porte le préfixe `ai5d-`. Les couleurs et les états vivent dans la feuille,
jamais en style en ligne : une pseudo-classe ne bat pas un attribut `style` (leçon de la 0.4.0).

Quatre règles, tenues par toutes les feuilles nouvelles ou modifiées :

1. **Le survol est gardé par `@media (hover: hover)`** et par `:not(:disabled)` ou
   `:not([aria-disabled='true'])`. Au doigt, `:hover` se déclenche après la pression et reste collé
   jusqu’au geste suivant (`PALIERS.md`, règle 5) : un bouton touché gardait sa couleur de survol.
2. **Le focus est `:focus-visible`**, anneau de 2 px en `var(--action)` (#2251FF, #6B88FF), décalé de
   2 px (1 px sur un champ), rouge sur un contrôle de danger.
3. **L’appui est immédiat.** `:active` pose son état sans transition, et le relâchement repart en
   `var(--mouvement-retour)`. L’état pressé paraît donc dans l’image suivante, moins de 100 ms après
   l’appui (exigence de SPEC P09 §0.8).
4. **Toute feuille qui déclare `@keyframes` contient `@media (prefers-reduced-motion: reduce)`**, et
   le mouvement réduit supprime, il ne ralentit pas.

#### 5.0.3 Le composant de lien du produit

`ComposantLien` (`LiensRail.tsx:42`) s’élargit : il accepte tous les attributs d’un `<a>`.

```ts
// noyau/composants/LiensRail.tsx
import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

/**
 * Le composant de lien du produit. Celui de Next convient tel quel.
 *
 * Il reçoit TOUS les attributs d’un `<a>`, et il doit les transmettre : un bouton en lien lui
 * passe `style`, `target`, `rel`, `aria-*` et `data-*`, et les perdre rendrait un lien sans
 * hauteur ni variante.
 */
export type ComposantLien = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }
>;
```

Rétrocompatibilité : un composant qui acceptait l’ancien type étroit reste assignable au nouveau
(les propriétés d’un composant sont contravariantes) ; `Link` de Next accepte déjà tous ces
attributs, et Compte le passe tel quel (`apps/compte/components/NavigationRubriques.tsx:59`, `:71`).
Le guide de montée (§13) le dit à tout produit qui aurait écrit son propre enveloppeur.

**Deux cas où le lien du routeur n’est jamais employé**, même fourni, décidés une fois dans
`noyau/composants/lien.ts` et appliqués par `Bouton`, `LigneLien` et `OngletsRubrique` :

| Cas | Rendu | Pourquoi |
| --- | ----- | -------- |
| `download` présent | `<a href download>` natif | Un routeur client ne télécharge pas : il naviguerait vers le fichier (IP61 du Portail) |
| `target="_blank"` | `<a href target="_blank">` natif, `rel` complété | Un nouvel onglet charge un document entier de toute façon |

```ts
// noyau/composants/lien.ts : module pur, sans JSX, sans directive

/** L’attribut qui dit qu’une navigation part de ce lien et n’a pas encore abouti. */
export const ATTRIBUT_EN_ATTENTE = 'data-en-attente';

/** Lu par les lecteurs d’écran après le libellé d’un lien qui ouvre un nouvel onglet. */
export const MENTION_NOUVEL_ONGLET = '(s’ouvre dans un nouvel onglet)';

/** `noopener` et `noreferrer` ajoutés à ce que le produit a passé, sans doublon. */
export function relSur(rel: string | undefined, target: string | undefined): string | undefined;

/** Vrai quand le lien doit être un `<a>` natif, quel que soit le lien du produit. */
export function lienNatif(options: { download?: unknown; target?: string | undefined }): boolean;

/** La classe qui retire un texte de l’écran sans le retirer de l’arbre d’accessibilité. */
export const CLASSE_HORS_ECRAN = 'ai5d-hors-ecran';
export const STYLE_HORS_ECRAN: string;
```

`STYLE_HORS_ECRAN` vaut exactement :

```css
.ai5d-hors-ecran {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
```

Le `1px` est une valeur hors échelle, nommée dans la liste d’exceptions de
`verifierAucunEspacementEnDur` pour `noyau/composants/lien.ts`, comme la garde le prévoit.

#### 5.0.4 Le protocole d’attente

Le système ne connaît pas le routeur ; il ne sait donc pas quand une navigation est en cours. Il
offre une convention, que le lien du produit suit :

> **Un lien est « en attente » quand il porte `data-en-attente`, ou quand il contient un élément qui
> le porte.**

La seconde forme existe parce que, sous Next, l’état d’un `Link` ne se lit que dans un de ses
descendants (`useLinkStatus`) : l’enfant rend `<span data-en-attente="" hidden />`, et la feuille du
système le voit par `:has()`. Le sélecteur écrit une fois dans chaque feuille concernée :

```css
.ai5d-…:is([data-en-attente], :has([data-en-attente])) { … }
```

Ce que chaque composant en fait : `Bouton` en lien et `LigneLien` montrent les trois points de
chargement du bouton (1 200 ms, décalés de 160 ms) ; `OngletsRubrique` fait pulser un trait bas en
`var(--bordure-forte)` (#D5CCBE, #2E4252). **Le système ne pose pas `aria-busy` sur un lien en
attente** : il ne voit que le CSS. L’annonce d’une navigation en cours appartient à l’indicateur du
produit (élément n° 14, resté dans le Portail).

#### 5.0.5 La voix

Tout texte cité entre guillemets s’affiche mot pour mot. Vouvoiement, apostrophe typographique `’`,
aucun tiret cadratin, aucun emoji, aucun point d’exclamation ; un refus nomme qui peut lever le
blocage. Les formulations nouvelles entrent dans `noyau/formulations.md` (§5.12, §5.2).

#### 5.0.6 La frontière serveur et client

| Composant | Directive | Pourquoi |
| --------- | --------- | -------- |
| `Bouton`, `Pastille`, `PastilleEtat`, `Bandeau`, `OngletsRubrique`, `CoquilleRail`, `TitreSection`, `LigneLien`, `ListeLignes`, `ListeDefinitions`, `Logotype` | aucune | Aucun crochet. Rendables par un composant serveur, avec des icônes et un lien du routeur en propriétés |
| `SelecteurTheme`, `ValeurCopiable` | `'use client'` | `useState` ; `SelecteurTheme` l’a déjà |

La garde `tests/index.test.ts:161-191` le tient dans les deux sens.

---

### 5.1 Le plancher tactile sans cycle

`densites/profils.css`. **Correctif**, premier du lot. Décision 005.

#### 5.1.1 La feuille

Chaque profil déclare la **source** de ses deux hauteurs ; la valeur que lisent les composants est
calculée une fois, dans un bloc générique, puis relevée au plancher sous `(pointer: coarse)`. Aucune
propriété ne se lit plus elle-même.

```css
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

/* La valeur que lisent les composants, recalculée sur tout élément qui porte un profil. */
:root,
[data-densite] {
  --hauteur-controle: var(--hauteur-controle-profil);
  --ligne-liste: var(--ligne-liste-profil);
}

/* Le plancher tactile. Il lit la SOURCE, jamais la propriété qu’il écrit. */
@media (pointer: coarse) {
  :root,
  [data-densite] {
    --hauteur-controle: max(var(--hauteur-controle-profil), 44px);
    --ligne-liste: max(var(--ligne-liste-profil), 44px);
  }
}
```

Le commentaire d’en-tête du plancher dit pourquoi, en termes que le prochain lecteur comprend : une
propriété personnalisée qui se lit elle-même est invalide au calcul, et la hauteur tombe à celle du
contenu. Le `44px` reste littéral, comme aujourd’hui : `profils.css` s’importe seul (export
`./densites/profils.css`), et `var(--cible-tactile)` y serait vide sans `jetons.css`.

Le bloc générique et le bloc du plancher emploient le sélecteur `[data-densite]`, qui couvre aussi un
profil qu’on ajouterait plus tard. Un profil nouveau déclare `--hauteur-controle-profil` et
`--ligne-liste-profil`, **avant** le bloc générique (`DENSITES.md`, « Ajouter un profil », mis à
jour).

#### 5.1.2 Les valeurs effectives

La valeur **déclarée** de chaque profil ne change pas ; sa **forme** change. Au doigt, la valeur
effective passe d’invalide à celle que `DENSITES.md` documente depuis la 0.1.0.

| Profil | `--hauteur-controle`, souris | au doigt, avant | au doigt, après | `--ligne-liste`, souris | au doigt, avant | au doigt, après |
| ------ | ---------------------------- | --------------- | --------------- | ----------------------- | --------------- | --------------- |
| `aere` | 48 px | invalide | 48 px | 64 px | invalide | 64 px |
| `equilibre` | 48 px | invalide | 48 px | 56 px | invalide | 56 px |
| `modere` | 44 px | invalide | 44 px | 48 px | invalide | 48 px |
| `compact` | 40 px | invalide | **44 px** | 40 px | invalide | **44 px** |

Ce que la personne voit au doigt, en `equilibre` :

| Élément | Avant (mesuré, 390 px) | Après (attendu, à mesurer) |
| ------- | ---------------------- | -------------------------- |
| `Bouton` `sm` | 44 px (plancher de `min-height`) | 44 px (`calc(48px - 8px)` relevé par `min-height`) |
| `Bouton` `md` | 44 px | **48 px** |
| `Bouton` `lg` | 44 px | **56 px** |
| `Champ` | 44 px | **48 px** |
| `CarteAction`, bouton | 44 px | **48 px** |
| `SqueletteFormulaire`, contrôle | **21 px** | **48 px** |
| Ligne de `min-height: var(--ligne-liste)` | **18 px** | **56 px** |

#### 5.1.3 La garde distribuée

`verifierPlancherTactile(cheminProfils)` change de ce qu’elle exige, et **refuse désormais la forme
fautive** :

| Condition | Infraction relevée (`extrait`) |
| --------- | ------------------------------ |
| Pas de `@media (pointer: coarse)` | `requete @media (pointer: coarse) absente` (inchangé) |
| Le bloc ne contient pas `max(var(--hauteur-controle-profil), 44px)` | `--hauteur-controle n'est pas releve a 44px sur pointeur grossier` |
| Le bloc ne contient pas `max(var(--ligne-liste-profil), 44px)` | `--ligne-liste n'est pas releve a 44px sur pointeur grossier` |
| Une déclaration `--x: …var(--x)…` n’importe où dans la feuille | `--x se lit elle-meme : la valeur est invalide au calcul, et la hauteur tombe a celle du contenu` |

La ligne rapportée est la vraie ligne de la déclaration fautive (aujourd’hui la garde rapporte
toujours `1`). Un produit qui lance la garde sur la feuille installée du système passe en `1.2.0` ;
il échouait sur rien en `1.1.0`, puisque la garde exigeait le défaut.

#### 5.1.4 Comment le correctif se prouve, puisque jsdom ne calcule rien

Trois preuves, de nature différente, parce qu’aucune ne suffit seule :

1. **La forme de la feuille** (test, à chaque exécution). `tests/cycles.test.ts` lit toutes les
   feuilles du système (`noyau/jetons.css`, `noyau/paliers.css`, `densites/profils.css`,
   `noyau/ai5d.preset.css`) et les feuilles injectées des composants (le texte des constantes `STYLE_…`
   de `noyau/composants/*.tsx` et `*.ts`), et **échoue sur toute déclaration qui lit sa propre
   propriété**, directement (`--x: …var(--x)…`). Un test témoin écrit la forme de la `1.1.0` dans un
   fichier temporaire et vérifie qu’elle est relevée.
2. **La valeur effective** (test, à chaque exécution). `tests/densites.test.ts` reçoit un résolveur
   de quelques lignes : il découpe la feuille avec `decouperBlocs` (`outils/jetons.ts`, qui suit déjà
   les blocs imbriqués dans `@media`), applique pour chaque profil le bloc `:root`, le bloc du profil,
   le bloc générique, puis, pour le doigt, le bloc `(pointer: coarse)` ; il substitue les `var()` et
   évalue `max()` en pixels. Il vérifie le tableau du §5.1.2, ligne par ligne, et qu’aucune valeur ne
   se résout en « invalide ».
3. **La mesure dans un vrai moteur** (preuve consignée, avant et après). Dans Chromium, avec le
   spécimen du dépôt (`specimens/composants.html`, qui importe les vraies feuilles par le préréglage),
   deux contextes : souris (`1280 × 800`) et doigt (`hasTouch: true`, `isMobile: true`, 390 px de
   large). Le script vérifie d’abord `matchMedia('(pointer: coarse)').matches` (faux, puis vrai),
   puis relève, pour chacun des quatre profils : `getComputedStyle(document.documentElement)` de
   `--hauteur-controle` et `--ligne-liste`, et `getBoundingClientRect().height` d’un bouton `sm`,
   `md`, `lg`, d’un champ, d’un bloc de `height: var(--hauteur-controle)` et d’un bloc de
   `min-height: var(--ligne-liste)`. La sortie brute, avant correctif puis après, est recopiée dans
   `docs/preuves/1.2.0/plancher-tactile.md`. Le script vit dans la preuve (il n’ajoute aucune
   dépendance au dépôt) ; il se lance par l’outil de navigateur du poste.

#### 5.1.5 Les quatre densités, les paliers, l’accessibilité

Le correctif ne touche que la hauteur au doigt. Il ne dépend d’aucun palier : un ordinateur tactile
de 1 280 px à pointeur principal grossier reçoit le plancher, un téléphone avec souris ne le reçoit
pas, comme avant. Il rend au critère WCAG 2.5.8 (cible minimale) ce que la charte promettait.

---

### 5.2 `Bouton` rendu en lien

`noyau/composants/Bouton.tsx`, sans directive. **Extension** ; deuxième consommateur constaté (§0.5,
n° 1).

#### 5.2.1 API

```ts
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import type { ComposantLien } from './LiensRail';

export type VarianteBouton =
  | 'primaire' | 'secondaire' | 'neutre' | 'discret' | 'danger' | 'danger-contour';
export type TailleBouton = 'sm' | 'md' | 'lg';

interface ProprietesCommunesBouton {
  variante?: VarianteBouton | undefined;
  taille?: TailleBouton | undefined;
  /** Le bouton reste lisible et garde son libellé : la mise en page ne saute pas. */
  chargement?: boolean | undefined;
  /** Le libellé pendant le chargement. Il nomme l’action, jamais l’attente. */
  libelleChargement?: string | undefined;
  /** Occupe toute la largeur disponible. */
  pleineLargeur?: boolean | undefined;
}

/** Le bouton d’action : un `<button>`. Inchangé. */
export interface ProprietesBoutonAction
  extends ProprietesCommunesBouton,
    ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
}

/** Le bouton qui mène quelque part : un lien, avec l’apparence et les états d’un bouton. */
export interface ProprietesBoutonLien
  extends ProprietesCommunesBouton,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** L’adresse. Sa présence fait du bouton un lien. */
  href: string;
  /** Le lien du routeur du produit ; `a` par défaut. Ignoré avec `download` ou `target="_blank"`. */
  Lien?: ComposantLien | undefined;
  /** Rend un lien inerte : ni adresse, ni focus, et il le dit. */
  disabled?: boolean | undefined;
}

export type ProprietesBouton = ProprietesBoutonAction | ProprietesBoutonLien;
```

`ProprietesBoutonAction` et `ProprietesBoutonLien` sont exportés par l’index. Un appel sans `href`
compile et se rend exactement comme en `1.1.0`.

#### 5.2.2 Rendu

| Propriétés reçues | Élément rendu | Attributs posés par le système |
| ----------------- | ------------- | ------------------------------ |
| sans `href` | `<button>` | Inchangé : `type="button"` par défaut, `disabled`, `aria-busy`, `data-variante`, `data-taille` |
| `href` et `disabled` | `<a>` **sans `href`** | `role="link"`, `aria-disabled="true"`, `data-variante`, `data-taille` ; opacité 0,6, curseur `not-allowed`. Hors de l’ordre de tabulation, comme un bouton désactivé |
| `href` et `chargement` | `<a>` **sans `href`** | `aria-busy="true"`, `aria-disabled="true"` ; libellé de chargement s’il est fourni, trois points ; **pleine opacité**, curseur `progress` (règle de la 0.5.1) |
| `href` et `download` | `<a href download>` natif | `download` transmis tel quel (booléen ou nom de fichier) |
| `href` et `target="_blank"` | `<a href target="_blank">` natif | `rel` = celui du produit plus `noopener noreferrer` ; `<span class="ai5d-hors-ecran">(s’ouvre dans un nouvel onglet)</span>` après le libellé |
| `href` | `Lien` du produit, ou `<a href>` | `className="ai5d-bouton …"`, `style` (hauteur, largeur, curseur), `data-variante`, `data-taille`, et tout attribut reçu ; `type` n’est jamais transmis à un lien |

La feuille (`STYLE_BOUTON`) sert les deux éléments. Elle gagne, pour le lien :

```css
.ai5d-bouton { text-decoration: none; }
.ai5d-bouton:is([data-en-attente], :has([data-en-attente])) .ai5d-bouton__points--attente {
  display: inline-flex;
}
.ai5d-bouton__points--attente { display: none; }
```

Un bouton en lien rend toujours ses trois points d’attente, masqués (`aria-hidden="true"`), et le
protocole du §5.0.4 les montre. Un `<button>` ne les rend pas : il a `chargement`.

#### 5.2.3 États

Mêmes états qu’un `<button>`, mêmes jetons ; seuls changent les sélecteurs de garde.

| État | Primaire | Neutre | Discret | Sélecteur |
| ---- | -------- | ------ | ------- | --------- |
| Repos | Aplat `var(--action)` (#2251FF, #6B88FF), libellé `var(--texte-sur-action)` (#FFFFFF, #051C2C), Inter 600 | Fond `var(--surface-2)` (#FFFFFF, #11212D), texte `var(--texte-fort)`, contour `var(--bordure-forte)` (#D5CCBE, #2E4252) | Texte `var(--action)`, sans contour | `.ai5d-bouton[data-variante=…]` |
| Survol, pointeur fin | `var(--action-survol)` (#1B44DB, #8BA1FF) | `var(--surface-chaude)` (#F4EFE7, #171F26), contour `var(--texte-faible)` | `var(--info-fond)` (#EAEFFF, #14203A) | `@media (hover: hover)`, `:not(:disabled):not([aria-disabled='true']):hover` |
| Focus clavier | Anneau 2 px `var(--action)`, décalé de 2 px | idem | idem | `:focus-visible` |
| Appui | `translateY(1px)`, jamais une échelle | idem | idem | `:not(:disabled):not([aria-disabled='true']):active` |
| En attente de navigation (lien) | Trois points en `currentColor`, libellé conservé | idem | idem | §5.0.4 |
| Chargement | Trois points, `libelleChargement` | idem | idem | `aria-busy` |
| Désactivé | Opacité 0,6 | idem | idem | `:disabled`, `[aria-disabled='true']:not([aria-busy])` |
| Visité (lien) | Aucun changement | idem | idem | La couleur vient de la variante |

Les variantes `secondaire`, `danger` et `danger-contour` suivent leur ligne actuelle.

**La garde `@media (hover: hover)` s’applique aussi aux `<button>`** : c’est la seule différence de
rendu pour un bouton d’action, et elle n’existe qu’au doigt (§12, « Ce qui change à l’écran »).

#### 5.2.4 Densités, paliers, clair et sombre

Hauteur `HAUTEURS[taille]` sur `var(--hauteur-controle)`, `min-height: var(--cible-tactile)` : un lien
a exactement la hauteur d’un bouton, dans les quatre profils (aéré 48 px, équilibré 48 px, modéré
44 px, compact 40 px à la souris ; 44 px au moins au doigt, §5.1.2). Aucune requête de palier :
`pleineLargeur` décide de la largeur. En sombre, le libellé primaire passe à l’encre, comme pour un
bouton.

#### 5.2.5 Accessibilité

Un lien s’annonce comme un lien, parce qu’il en est un : il s’ouvre au clic du milieu, se copie, et
fonctionne sans JavaScript. Le nom accessible est le libellé, suivi de la mention du nouvel onglet
quand il y a lieu. Un lien désactivé s’annonce « lien, indisponible » et ne prend pas le focus.

---

### 5.3 Le ton `neutre`

`noyau/composants/Pastille.tsx`, `PastilleEtat.tsx`, `Bandeau.tsx`. **Extension** ; deuxième
consommateur constaté (§0.5, n° 2).

```ts
export type TonSemantique = 'information' | 'reussite' | 'attention' | 'erreur' | 'neutre';
```

**Ce qu’il dit** : « rien à signaler ». Un état au repos, qui ne demande aucun geste et n’annonce
aucune réussite : « Inscription confirmée », « Formation terminée », « Sans accès »,
« Remplacée ». **Ce qu’il ne dit jamais** : un état qui attend un geste (c’est `attention`) ou un
échec (c’est `erreur`). La règle entre dans `NOYAU.md` §1.3.

| Composant | Rendu du ton `neutre` |
| --------- | --------------------- |
| `Pastille` | Texte `var(--texte-faible)` (#616F78, #8D9AA5) sur `var(--surface-chaude)` (#F4EFE7, #171F26) ; mêmes rayon, taille et graisse que les autres tons |
| `PastilleEtat` | Idem, le point de 6 px en `currentColor`, donc en texte faible |
| `Bandeau` | Icône `Info` (lucide, 20 px) en `var(--texte-faible)` ; fond `var(--surface-chaude)` ; **contour 1 px `var(--texte-faible)`** ; titre Inter 600 en `var(--texte-faible)` ; corps `var(--texte)` (#2B3A45, #C9D4DC) ; `role="status"` |
| `CarteAction` | Accepte `etat.ton = 'neutre'` sans changement de code (elle rend une `Pastille`) |

**Le contour du bandeau suit la règle des quatre autres tons** : il prend la couleur du ton. Le
contrat de P09 proposait `var(--bordure-forte)` ; mesuré, `--bordure-forte` ne se détache du papier
qu’à 1,49 et le fond chaud qu’à 1,07 : le bandeau ne se distinguerait plus de la page. En
`--texte-faible`, le contour tient 4,85 sur `--surface-1`.

Contrastes (garde, §10) : texte faible sur surface chaude, **4,53** en clair, **5,79** en sombre ;
corps sur surface chaude, 10,23 et 11,06. En sombre, le fond de la pastille (#171F26) ne se détache
pas d’une carte (#11212D, 1,01) : c’est le mot, et le point, qui portent l’état, comme partout ailleurs
dans le système.

Densités et paliers : aucun effet, comme les autres tons.

---

### 5.4 `OngletsRubrique` relié au routeur

`noyau/composants/OngletsRubrique.tsx`, sans directive. **Extension**. Décision 007.

#### 5.4.1 API

```ts
export interface OngletRubrique {
  id: string;
  libelle: string;
  href: string;
  icone?: LucideIcon | undefined;
}

export interface ProprietesOngletsRubrique {
  /** Deux à six. En dessous de deux, il n’y a rien à choisir. */
  onglets: OngletRubrique[];
  /** L’`id` de l’onglet courant. Un identifiant inconnu n’en marque aucun. */
  actif: string;
  /** Le nom de la navigation pour les lecteurs d’écran. */
  etiquette?: string | undefined;
  /** Le lien du routeur du produit ; `a` par défaut. Avec lui, changer d’onglet ne recharge pas le document. */
  Lien?: ComposantLien | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export const ONGLETS_RUBRIQUE_MIN = 2;
export const ONGLETS_RUBRIQUE_MAX = 6;
```

**La borne passe de cinq à six.** Une session à distance du Portail a six sous-pages (vue d’ensemble,
annonces, ressources, replays, attestation, badge) ; fusionner le badge et l’attestation confondrait
deux objets que le PRD du Portail interdit de confondre. Comme `BarreOnglets`, le composant ne lève
pas au-delà : la borne est écrite, exportée et testée.

#### 5.4.2 Rendu

Chaque onglet est rendu par `Lien`, ou par un `<a>` s’il est absent, avec la classe
`ai5d-onglets-r__lien` et `aria-current="page"` sur l’actif (jamais `aria-current="false"`, règle
inchangée). Hauteur `HAUTEUR_ONGLETS` (44 px), inchangée.

**Le débordement se voit par un fondu, et seulement quand il y a débordement.** C’est le navigateur
qui mesure, par la frise de défilement du conteneur ; le composant ne mesure rien et reste sans
directive :

```css
@supports (animation-timeline: scroll()) {
  .ai5d-onglets-r {
    animation: ai5d-onglets-fondu linear both;
    animation-timeline: scroll(self inline);
  }
  /* Le masque ne lit que l’opacité : la teinte choisie n’apparaît jamais. */
  @keyframes ai5d-onglets-fondu {
    0% {
      mask-image: linear-gradient(to left, transparent, var(--encre) var(--espace-6));
    }
    1%, 99% {
      mask-image: linear-gradient(to right, transparent, var(--encre) var(--espace-6),
        var(--encre) calc(100% - var(--espace-6)), transparent);
    }
    100% {
      mask-image: linear-gradient(to right, transparent, var(--encre) var(--espace-6));
    }
  }
}
```

| Situation | Ce que la personne voit |
| --------- | ----------------------- |
| Rien ne déborde (bureau, ou trois onglets courts) | Aucun fondu : la frise de défilement est inactive quand le conteneur ne défile pas, et l’animation ne s’applique pas. C’est ce qui répond au défaut de la 0.6.3 |
| Déborde, défilé au début | Fondu de 24 px au bord droit seulement |
| Déborde, défilé au milieu | Fondu aux deux bords |
| Déborde, défilé à la fin | Fondu au bord gauche seulement |
| Navigateur sans `animation-timeline` | Aucun fondu ; le dernier onglet coupé net par le bord reste le signal, comme en 0.6.3 |

**L’onglet actif est amené dans la vue au premier affichage**, par le CSS :

```css
.ai5d-onglets-r { scroll-padding-inline: var(--espace-6); }
@supports (scroll-initial-target: nearest) {
  .ai5d-onglets-r__lien[aria-current='page'] { scroll-initial-target: nearest; }
}
```

Le rembourrage de défilement garde l’onglet actif hors du fondu. Sans prise en charge, rien ne se
passe ; la personne qui arrive sur la cinquième sous-page d’un téléphone voit le fondu, qui lui dit
qu’il reste des onglets. Une navigation cliente ne remonte pas le composant : l’onglet touché est déjà
dans la vue.

#### 5.4.3 États

| État | Rendu | Sélecteur |
| ---- | ----- | --------- |
| Repos | Inter 400 `var(--taille-sm)`, `var(--texte-faible)` (#616F78, #8D9AA5), trait bas transparent | `.ai5d-onglets-r__lien` |
| Survol, pointeur fin | `var(--texte-fort)` (#051C2C, #F2F5F7) | `@media (hover: hover)` |
| Appui | Fond `var(--surface-selection)` (#EAEFFF, #172C3B), rayon `var(--rayon-sm)`, sans transition | `:active` |
| Focus clavier | Anneau 2 px `var(--action)`, décalé de 2 px, rayon `var(--rayon-sm)` | `:focus-visible` (inchangé) |
| Actif | `var(--action)` (#2251FF, #6B88FF), Inter 600, trait bas de 2 px `var(--action)`, `aria-current="page"` | inchangé |
| En attente | Un trait bas de 2 px en `var(--bordure-forte)` (#D5CCBE, #2E4252), dessiné par `::after`, qui pulse de 0,4 à 1 d’opacité en 1 200 ms, aller et retour ; sous mouvement réduit, fixe à 1 | §5.0.4 |
| Actif et en attente | L’actif l’emporte : aucun trait d’attente | `[aria-current='page']` |

#### 5.4.4 Densités, paliers, clair et sombre, accessibilité

Hauteur fixe de 44 px dans les quatre profils : c’est la cible tactile, et la densité ne la
renégocie pas. Écart entre onglets `var(--espace-6)`, inchangé. Sans palier : le conteneur défile dès
que la place manque, et la console du Portail, qui ne passe pas d’icônes, tient ses six libellés plus
loin. Le fondu est un masque, pas une couleur : il ne change pas entre les thèmes. Des liens, jamais un
`tablist` (règle inchangée) ; l’état actif passe par trois signaux.

---

### 5.5 `CoquilleRail`, deux pieds

`noyau/composants/CoquilleRail.tsx`, sans directive. **Extension**.

#### 5.5.1 API

```ts
export interface ProprietesCoquilleRail {
  // … propriétés existantes, inchangées …
  /**
   * Le pied de contenu, à toutes les largeurs : rendu dans un `<footer>` APRÈS `<main>`, pour que
   * le repère `contentinfo` existe. Liens légaux, mentions.
   */
  piedContenu?: ReactNode | undefined;
  /**
   * Ce que le pied de contenu porte en plus sous 768 px, au-dessus de `piedContenu` : ce que le
   * pied du rail offre au-delà, et que le téléphone perdrait sans lui. Le thème, d’abord.
   * Ignoré en mode `bureau-seulement`.
   */
  piedCompact?: ReactNode | undefined;
}
```

#### 5.5.2 Structure

```
.ai5d-coquille-rail  [data-pied="complet" | "compact"]
└── .ai5d-coquille-rail__cadre
    ├── lien d’évitement, rail (inchangés)
    ├── .ai5d-coquille-rail__principal
    │   ├── <header> barre compacte (inchangée)
    │   ├── <main id="contenu"> … </main>
    │   └── <footer class="ai5d-coquille-rail__pied-contenu">
    │       └── .ai5d-coquille-rail__colonne (même largeur maximale que le contenu)
    │           ├── .ai5d-coquille-rail__pied-compact   (sous 768 px, mode complet)
    │           └── piedContenu
    └── barre basse (inchangée)
```

Le `<footer>` n’est rendu que si l’un des deux pieds est fourni. `data-pied` vaut `complet` si
`piedContenu` est fourni, `compact` si seul `piedCompact` l’est.

```css
.ai5d-coquille-rail[data-pied] .ai5d-coquille-rail__contenu { padding-bottom: var(--espace-8); }
.ai5d-coquille-rail__pied-contenu {
  padding: var(--espace-6) var(--marge-page) calc(var(--espace-6) + var(--reserve-barre, 0px));
  border-top: 1px solid var(--bordure);
}
.ai5d-coquille-rail__pied-compact {
  display: flex; flex-direction: column; gap: var(--espace-2);
  margin-bottom: var(--espace-4);
}
@media (min-width: 768px) {
  .ai5d-coquille-rail__pied-compact { display: none; }
  .ai5d-coquille-rail[data-pied='compact'] .ai5d-coquille-rail__pied-contenu { display: none; }
  .ai5d-coquille-rail__pied-contenu { padding: var(--espace-6) var(--espace-8); }
}
```

**La réserve basse passe au pied quand il existe** : sous 768 px, c’est lui le dernier élément de la
page, et c’est lui qui ne doit pas se glisser sous la barre basse. Sans pied, le contenu garde sa
réserve, exactement comme en `1.1.0` : Compte, qui ne passe ni l’un ni l’autre, ne voit aucune
différence.

`display: none` et non une classe visuelle pour le pied compact au-delà de 768 px : c’est ce qui
retire le sélecteur de thème en double de l’arbre d’accessibilité, puisque le rail porte le sien (même
raison que les deux navigations, décision 003).

#### 5.5.3 Densités, paliers, clair et sombre, accessibilité

| Palier | Pied compact | Pied de contenu |
| ------ | ------------ | --------------- |
| Moins de 768 px | Affiché, au-dessus | Marge de page (16 px, 24 px dès 640 px), réserve basse en dessous |
| 768 px et plus | Masqué | Rembourrage `var(--espace-8)` de chaque côté, comme le contenu |

Aucune valeur de densité : le pied est une zone d’espacement fixe, comme la barre compacte. Filet
`var(--bordure)` (#E7E0D6, #22323F) ; fond hérité de la coquille, `var(--surface-1)`. Un seul
`contentinfo`, hors de `<main>`, à toutes les largeurs. Le système n’écrit aucun texte dans ces pieds :
« Thème » et les liens légaux sont ceux du produit.

---

### 5.6 `SelecteurTheme` au doigt, libellés visibles

`noyau/composants/SelecteurTheme.tsx`, `'use client'` (inchangé). **Correctif** pour la cible,
**extension** pour les libellés.

#### 5.6.1 API

```ts
export interface ProprietesSelecteurTheme {
  theme: Theme;
  domaine?: string | undefined;
  /**
   * Écrit « Clair », « Sombre », « Système » à côté de l’icône, et occupe toute la largeur
   * disponible. Faux par défaut : le pied du rail de Compte garde ses icônes.
   */
  libellesVisibles?: boolean | undefined;
}
```

#### 5.6.2 La cible au doigt

Les segments font 32 px (`SelecteurTheme.tsx:60`), sous le plancher de la charte. Le commentaire qui
justifiait la mesure (« on vise le groupe ») ne tient pas : chaque segment est une cible distincte, et
le groupe lui-même ne fait que 40 px. **Au doigt, chaque segment fait 44 px au moins**, et le groupe
52 px (44 plus 3 px de rembourrage de chaque côté plus le filet). À la souris, rien ne change :

```css
@media (pointer: coarse) {
  .ai5d-theme__segment { min-width: var(--cible-tactile); min-height: var(--cible-tactile); }
}
```

#### 5.6.3 Les libellés visibles

`data-libelles` sur le groupe quand la propriété est vraie.

```css
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
@container (max-width: 17rem) {
  .ai5d-theme[data-libelles] .ai5d-theme__icone { display: none; }
}
```

Le libellé est `LIBELLE_THEME[valeur]` : « Clair », « Sombre », « Système ». Sous 17rem de largeur
disponible (le pied du rail de 240 px, par exemple), l’icône se retire et le mot reste : un mot seul
se lit, une icône seule s’apprend. L’estimation du §0.6 se prouve par capture à 320 px (pied compact)
et à 768 px (pied du rail).

#### 5.6.4 États

| État | Rendu |
| ---- | ----- |
| Repos | Texte et icône `var(--texte-faible)` (#616F78, #8D9AA5) |
| Survol, pointeur fin | Fond `var(--surface-1)`, texte `var(--texte-fort)` (inchangé, gardé par `@media (hover: hover)`) |
| Coché | Fond `var(--surface-selection)` (#EAEFFF, #172C3B), texte `var(--action)` (inchangé) ; en mode libellés, graisse `var(--graisse-semi)` en plus : la couleur ne porte pas l’état seule |
| Focus clavier | Anneau 2 px `var(--action)` (inchangé) |
| Appui | Fond `var(--surface-selection)`, sans transition |

#### 5.6.5 Accessibilité

`role="radiogroup"`, « Thème de l’interface » (inchangé). En mode libellés, le nom visible **est** le
nom accessible : `aria-label` et `title` ne sont plus posés sur les segments, pour qu’un logiciel de
commande vocale qui entend « Sombre » trouve « Sombre ». En mode icônes, ils restent.

Densités : aucune, la cible tactile prime. Paliers : aucun, le conteneur décide des icônes.

---

### 5.7 Les surfaces du navigateur

`noyau/jetons.css`, `noyau/couleurs-navigateur.ts`, `noyau/theme.ts`. **Règles transversales.**
`color-scheme` et `accent-color` sont déjà livrés en `1.1.0` et ne bougent pas.

#### 5.7.1 Le curseur et la sélection

```css
:root {
  /* … color-scheme et accent-color, inchangés … */
  caret-color: var(--action);
}

::selection {
  background: var(--action);
  color: var(--texte-sur-action);
}
```

| Choix | Mesure | Décision |
| ----- | ------ | -------- |
| Fond `var(--info-fond)` et texte `var(--texte-fort)` (contrat de P09) | `--info-fond` sur `--surface-2` : 1,15 en clair, **1,01 en sombre** : une sélection sur une carte sombre ne se voit pas | Écarté |
| Fond `var(--action)` (#2251FF, #6B88FF) et texte `var(--texte-sur-action)` (#FFFFFF, #051C2C) | Texte sélectionné 5,69 en clair, 5,45 en sombre ; la zone sélectionnée se détache de toutes les surfaces à 4,51 au moins | **Retenu** |

La sélection prend donc exactement les couleurs du bouton primaire : la seule paire du système dont la
lisibilité est mesurée dans les deux thèmes, au repos comme au survol. Le curseur de saisie prend
`--action`, qui tient 5,15 au moins sur les champs. `scrollbar-color` n’est pas posé : §0.6.

#### 5.7.2 `COULEURS_NAVIGATEUR`

```ts
// noyau/couleurs-navigateur.ts : module pur, sans import

/**
 * Les deux seules couleurs du système écrites hors d’une feuille.
 *
 * `<meta name="theme-color">` colore la barre d’adresse d’un navigateur de téléphone, et n’accepte
 * pas de variable CSS. Sans cet export, chaque produit devrait écrire une valeur hexadécimale, ce que
 * `verifierAucuneCouleurEnDur` lui interdit, à raison.
 *
 * Elles valent `--surface-1` dans chaque thème ; `tests/theme.test.ts` les confronte à `jetons.css`.
 */
export const COULEURS_NAVIGATEUR = {
  clair: '#FAF7F2',
  sombre: '#0B1620',
} as const;
```

`noyau/theme.ts` le réexporte : il s’importe par `@ai5d/design-system/theme`, comme le reste du thème,
depuis un module sans directive, lisible par un gabarit serveur (leçon « Une constante lue par le
serveur ne vit pas dans un module client »). L’en-tête de `theme.ts` (« Il n’importe rien ») devient
« Il n’importe que `couleurs-navigateur.ts`, pur lui aussi ».

`noyau/couleurs-navigateur.ts` entre dans la liste d’exceptions de la garde des couleurs **du dépôt**
(`gardes/gardes.test.ts:26-36`), par son nom. Un produit n’a rien à excepter : la garde ignore
`node_modules`.

Emploi dans un produit, tel que P09 l’écrit (SPEC P09 §5.1.4) :

```ts
import { COULEURS_NAVIGATEUR } from '@ai5d/design-system/theme';
// themeColor: COULEURS_NAVIGATEUR.clair, ou un couple par `prefers-color-scheme` pour « système »
```

---

### 5.8 `TitreSection`

`noyau/composants/TitreSection.tsx`, sans directive. **Composant nouveau** ; deuxième consommateur
constaté (§0.5, n° 9).

#### 5.8.1 API

```ts
import type { HTMLAttributes, ReactNode } from 'react';

export type NiveauTitre = 1 | 2 | 3;
export type TailleTitre = 'ecran' | 'section' | 'bloc';

export interface ProprietesTitreSection
  extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
  /** Le niveau dans le plan du document : `h1`, `h2` ou `h3`. Un seul `h1` par page. */
  niveau: NiveauTitre;
  /** La taille à l’écran, indépendante du niveau : un `h2` peut être un titre de bloc. */
  taille: TailleTitre;
  children: ReactNode;
}
```

#### 5.8.2 Rendu

`<h1>`, `<h2>` ou `<h3>` selon `niveau`, en style en ligne (aucun état, donc aucune feuille) :

| Propriété | Valeur |
| --------- | ------ |
| Police | `var(--police-titre)`, Fraunces |
| Graisse | `var(--graisse-normale)` (400). Jamais de graisse de navigateur : plus de faux gras |
| Taille | `ecran` : `var(--taille-2xl)` (30 px) ; `section` : `var(--taille-xl)` (22 px) ; `bloc` : `var(--taille-lg)` (18 px) |
| Interligne | `var(--interligne-titre)` (1.2) |
| Lettrage | `var(--lettrage-titre)` (-0.01em) |
| Couleur | `var(--texte-fort)` (#051C2C, #F2F5F7) |
| Marge | 0 : l’espace appartient à la page |
| Coupure | `text-wrap: balance` ; `overflow-wrap: break-word` : un intitulé long passe à la ligne, jamais tronqué |

Un `style` passé par le consommateur gagne, comme partout (Compte grise un titre de carte inactive).
`id` et les attributs `aria-*` passent.

#### 5.8.3 Densités, paliers, clair et sombre, accessibilité

La densité ne touche jamais la taille du texte : aucune. Aucun palier : les tailles sont celles de la
charte à toutes les largeurs. En sombre, seul `--texte-fort` change. Le niveau est une propriété
**obligatoire**, séparée de la taille : c’est ce qui empêche de choisir un `h3` pour sa taille.

`EnteteRubrique`, `GabaritAuth` et `Chiffre` gardent leur titre propre dans ce lot : les faire passer
par `TitreSection` ajouterait le lettrage à des titres en production, donc un changement de rendu que
personne n’a demandé (§16).

---

### 5.9 `LigneLien`

`noyau/composants/LigneLien.tsx`, sans directive. **Composant nouveau** ; deuxième consommateur
constaté (§0.5, n° 10).

#### 5.9.1 API

```ts
import type { CSSProperties, ReactNode } from 'react';
import type { ComposantLien } from './LiensRail';

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
  /** Ce qui précède le texte : une icône, un avatar, une pastille d’état. */
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
```

#### 5.9.2 Rendu

```
<Lien class="ai5d-ligne" href>                       ← ou <a> natif si download ou externe
  <span class="ai5d-ligne__debut">debut</span>        ← si fourni
  <span class="ai5d-ligne__corps">
    <span class="ai5d-ligne__titre">titre</span>
    <span class="ai5d-ligne__description">description</span>   ← si fournie
    <span class="ai5d-ligne__meta" data-mono>meta</span>        ← si fournie
  </span>
  <span class="ai5d-ligne__fin">fin, ou chevron</span>
  <span class="ai5d-ligne__attente" aria-hidden="true">· · ·</span>   ← masqué hors attente
  <span class="ai5d-hors-ecran">(s’ouvre dans un nouvel onglet)</span> ← si externe
</Lien>
```

| Élément | Style |
| ------- | ----- |
| Ligne | `display: flex; align-items: center; gap: var(--espace-3)` ; `min-height: var(--ligne-liste)` ; rembourrage `var(--espace-3)` ; `margin-inline: calc(var(--espace-3) * -1)` pour que le texte s’aligne sur les titres de la page ; rayon `var(--rayon-md)` ; `text-decoration: none` ; `color: inherit` |
| Début et fin | `flex: 0 0 auto` |
| Corps | `flex: 1 1 auto; min-width: 0` ; colonne, écart 2 px hors échelle (nommé dans les exceptions de la garde 6) |
| Titre | Inter 500, `var(--taille-md)` (16 px), `var(--texte-fort)` ; avec `titreEnTitre`, Fraunces 400, `var(--taille-lg)` (18 px), `var(--interligne-titre)` ; `overflow-wrap: anywhere` |
| Description | Inter 400, `var(--taille-sm)` (14 px), `var(--texte-faible)` |
| Méta | Inter 400, `var(--taille-sm)`, `var(--texte-faible)` ; avec `metaMono`, `var(--police-mono)` 500 |
| Chevron | `ChevronRight` de lucide, 20 px, `var(--texte-faible)`, décoratif |

#### 5.9.3 États

| État | Rendu | Sélecteur |
| ---- | ----- | --------- |
| Repos | Fond transparent | `.ai5d-ligne` |
| Survol, pointeur fin | Fond `var(--surface-chaude)` (#F4EFE7) en clair, `var(--surface-3)` (#172C3B) en sombre ; transition `background var(--mouvement-retour)` | `@media (hover: hover)` ; le sombre par les deux blocs de sélecteurs du thème, comme `LiensRail` le fait, en attendant `--surface-survol` (lot 1.3.0) |
| Focus clavier | Anneau 2 px `var(--action)`, décalé de 2 px, rayon `var(--rayon-md)` | `:focus-visible` |
| Appui | Fond `var(--surface-selection)` (#EAEFFF, #172C3B), **sans transition** | `:active` |
| En attente | Le chevron se retire, trois points en `var(--texte-faible)` le remplacent (1 200 ms, décalés de 160 ms) ; sous mouvement réduit, points fixes | §5.0.4 |
| Visitée | Aucun changement | |
| Désactivée | N’existe pas : une ligne qui ne mène nulle part n’est pas un lien, le produit rend du texte | |

Contrastes sur les fonds d’état (garde, §10) : titre sur surface de sélection 15,13 et 13,14 ;
description sur surface de sélection **4,51** et 5,00 ; sur surface chaude 4,53 ; sur surface 3 en
sombre 5,00.

#### 5.9.4 Densités

`min-height: var(--ligne-liste)` : c’est le premier composant du système qui lit ce jeton.

| Profil | Souris | Doigt |
| ------ | ------ | ----- |
| `aere` | 64 px | 64 px |
| `equilibre` | 56 px | 56 px |
| `modere` | 48 px | 48 px |
| `compact` | 40 px | 44 px |

#### 5.9.5 Paliers, accessibilité

Aucune requête de palier : le texte passe à la ligne, début et fin gardent leur taille ; à 320 px, une
ligne avec icône et chevron laisse 224 px au texte (288 px de colonne, moins l’icône, le chevron et
leurs deux écarts). Le nom accessible est le texte de la ligne, dans
l’ordre du document (début, titre, description, méta) ; le chevron et les points sont décoratifs. Une
ligne entière est **une** cible : on ne pose pas de lien ni de bouton dans `debut` ou `fin` (un lien
dans un lien est invalide) ; le composant le dit dans son en-tête et un test vérifie qu’il ne rend
qu’un seul élément interactif.

Convient à la console (`compact`, 40 px à la souris) ; Compte remplace `LigneCompte` (§13).

---

### 5.10 `ListeLignes`

`noyau/composants/ListeLignes.tsx`, sans directive. **Composant nouveau** ; deuxième consommateur
constaté (§0.5, n° 10).

```ts
export interface ProprietesListeLignes {
  /** Des `LigneLien`, une par destination. Chaque enfant est posé dans son propre `<li>`. */
  children: ReactNode;
  /** Le nom de la liste pour les lecteurs d’écran, quand aucun titre visible ne la précède. */
  etiquette?: string | undefined;
  /** Un filet au-dessus de la première ligne et sous la dernière. Vrai par défaut. */
  bordsExterieurs?: boolean | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}
```

Rendu : `<ul role="list" class="ai5d-liste-lignes">`, `list-style: none`, marge et rembourrage nuls ;
chaque enfant non nul dans un `<li>`. `role="list"` n’est pas redondant : sans puces, Safari retire
la sémantique de liste, et VoiceOver n’annonce plus « liste, trois éléments ».

| Filets | Règle |
| ------ | ----- |
| Entre deux lignes | `li + li { border-top: 1px solid var(--bordure); }` (#E7E0D6, #22323F) |
| `bordsExterieurs` vrai | En plus, filet au-dessus de la première et sous la dernière |
| `bordsExterieurs` faux | Rien d’autre : c’est ce que Compte fait à la main avec `dernier` |

Aucune densité, aucun palier, aucun état propre : les états sont ceux des lignes.

---

### 5.11 `ListeDefinitions`

`noyau/composants/ListeDefinitions.tsx`, sans directive. **Composant nouveau** ; deuxième consommateur
constaté (§0.5, n° 11).

#### 5.11.1 API

```ts
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
```

#### 5.11.2 Rendu

```
<div class="ai5d-definitions" data-colonnes="2">      ← contexte de conteneur
  <dl class="ai5d-definitions__liste">
    <div class="ai5d-definitions__element">
      <dt>Session</dt>
      <dd>Orange Guinée · octobre 2026</dd>
    </div>
    …
  </dl>
</div>
```

Un `<div>` qui groupe un `<dt>` et son `<dd>` est permis par le HTML et garde la paire ensemble dans
la grille.

| Élément | Style |
| ------- | ----- |
| Liste | Grille d’une colonne ; écart de rangée `var(--espace-4)`, de colonne `var(--espace-6)` ; marge nulle |
| Deux colonnes | `@container (min-width: 480px)` et `data-colonnes="2"` : `grid-template-columns: repeat(2, minmax(0, 1fr))` |
| Libellé `dt` | Inter 500, `var(--taille-xs)` (12 px), `var(--texte-faible)` (#616F78, #8D9AA5), interligne 1.6, casse normale |
| Valeur `dd` | Inter 400, `var(--taille-md)` (16 px), `var(--texte-fort)` (#051C2C, #F2F5F7), `var(--interligne-corps)`, marge nulle, `overflow-wrap: anywhere` |
| Valeur `mono` | `var(--police-mono)` 500, `var(--taille-sm)` (14 px) |

**La bascule interroge le conteneur, pas la fenêtre**, comme `GrilleCartes` (0.7.0). Le contrat de
P09 disait « deux colonnes dès 640 px » de fenêtre ; une fiche de 36rem dans le Portail en offre 528
à 640 px (au-delà de 480, donc deux colonnes, comme P09 le veut), mais une fiche de la console dans
une colonne étroite recevrait deux colonnes de 150 px avec une requête de fenêtre. Sans requêtes de
conteneur, une colonne : la mise en page du téléphone, correcte partout.

#### 5.11.3 Densités, clair et sombre, accessibilité

Aucune valeur de densité : les écarts sont ceux de l’échelle, entre éléments. En sombre, seuls les
jetons de texte changent. Un `<dl>` s’annonce comme une liste de définitions ; l’ordre de lecture est
celui des éléments, rangée par rangée.

---

### 5.12 `ValeurCopiable`

`noyau/composants/ValeurCopiable.tsx`, `'use client'`. **Composant nouveau** ; deuxième consommateur
constaté (§0.5, n° 12).

#### 5.12.1 API

```ts
export interface ProprietesValeurCopiable {
  /** La valeur, affichée en clair dans un champ en lecture seule. */
  valeur: string;
  /** Le libellé du champ. */
  libelle: string;
  /** Ce qu’on lit quand la copie échoue : il nomme le geste manuel. Obligatoire. */
  messageEchec: string;
  /** « Copier » par défaut. */
  libelleBouton?: string | undefined;
  /** « Copié » par défaut ; affiché pendant `DUREE_SUCCES_COPIE_MS`. */
  libelleSucces?: string | undefined;
  /** La valeur en JetBrains Mono. Vrai par défaut. */
  mono?: boolean | undefined;
}

export const DUREE_SUCCES_COPIE_MS = 2000;
```

`messageEchec` est obligatoire parce qu’il nomme ce que la personne doit sélectionner : « l’adresse »,
« la clé ». Une phrase générique ne le pourrait pas.

#### 5.12.2 Rendu

Un `Champ` du système (libellé lié, `readOnly`, `spellCheck={false}`, `autoComplete="off"`), un
`Bouton` `neutre` à sa droite avec l’icône `Copy` (16 px), et une région `aria-live="polite"` sous
les deux.

| Élément | Détail |
| ------- | ------ |
| Champ | Valeur en `var(--police-mono)` 500 si `mono`, **à 16 px** (`var(--taille-md)`) : sous 16 px, un téléphone iOS agrandit la page au focus du champ ; la sélection de toute la valeur au focus |
| Bouton | `Bouton variante="neutre"`, libellé `libelleBouton`, icône `Copy` ; pendant le succès, libellé `libelleSucces` et icône `Check` |
| Région d’annonce | Succès : `libelleSucces`, hors écran (le bouton le montre déjà) ; échec : `messageEchec`, visible, Inter 400 `var(--taille-sm)` `var(--texte-faible)` |
| Disposition | `display: flex; flex-wrap: wrap; gap: var(--espace-2)` ; champ `flex: 1 1 16rem` ; contexte de conteneur : sous 24rem, champ et bouton empilés, bouton pleine largeur |

#### 5.12.3 États

| État | Déclencheur | Rendu | Durée |
| ---- | ----------- | ----- | ----- |
| Repos | | Bouton « Copier », icône `Copy` | |
| Succès | `navigator.clipboard.writeText` résolu | Bouton « Copié », icône `Check` ; annonce « Copié » | `DUREE_SUCCES_COPIE_MS` (2 000 ms), puis repos ; un second clic relance la minuterie |
| Échec | Promesse rejetée, ou `navigator.clipboard` absent (page non sécurisée) | Le champ reçoit le focus et **toute sa valeur est sélectionnée** ; `messageEchec` s’affiche et s’annonce | Jusqu’à la prochaine tentative réussie |
| Focus, survol, appui | | Ceux du `Champ` et du `Bouton` | |

**L’échec n’est jamais avalé** : c’est le défaut que Compte a payé (sprint 19, constat K6 :
`writeText(…).catch(() => undefined)` laissait croire la clé copiée). La minuterie est nettoyée au
démontage.

Textes exacts par défaut : « Copier », « Copié ». Formulation de référence ajoutée à
`noyau/formulations.md`, section « États techniques » : « Copie impossible » :
« Sélectionnez {ce qu’il faut copier} ci-dessus pour la copier. », avec la règle « on nomme le geste
manuel, et la valeur reste visible ». Exemples : Portail, « Sélectionnez l’adresse ci-dessus pour la
copier. » ; Compte, « Sélectionnez la clé ci-dessus pour la copier. ».

#### 5.12.4 Densités, paliers, clair et sombre, accessibilité

Hauteurs du champ et du bouton sur `var(--hauteur-controle)` (48 px en `equilibre`, 40 px en
`compact` à la souris, 44 px au moins au doigt). Aucune requête de palier : le conteneur décide. Clair
et sombre suivent le `Champ` et le `Bouton`. Le libellé du champ est toujours présent ; l’annonce est
polie, jamais une alerte : une copie n’interrompt personne.

---

### 5.13 La recette du logotype hors du DOM

`noyau/logotype.ts`, exporté par `@ai5d/design-system/logotype`. Module pur, sans JSX, sans
directive, sans couleur. Décision 008.

#### 5.13.1 Ce que le contrat demandait, et ce que le lot livre

P09 demandait `TRACE_LOGOTYPE` : les lettres tracées en chemins depuis Inter 700. Le tracé n’a pas de
deuxième consommateur (Compte ne produit ni PDF ni image de partage), il demande un outillage de
polices que le dépôt n’a pas, et il appartient au lot L4 (remédiation des logotypes, `tasks/todo.md`).
Ce que deux produits font **déjà mal**, en revanche, c’est composer le logotype hors du DOM : le
Portail écrit « AI5D » en Fraunces bleu dans son PDF et ses images de partage (SPEC P09 §0.3), Compte
écrit « AI5D » en Fraunces à l’encre dans l’en-tête de ses courriels (`emails/Coquille.tsx:44-53`). Le
lot livre donc la **recette**, que le DOM, le PDF, l’image de partage et le courriel suivent ; le
repli de P09 (§5.22.2 de sa SPEC) devient la voie normale.

#### 5.13.2 API

```ts
// noyau/logotype.ts

/** Le rôle d’un morceau : le consommateur l’associe à SES jetons. Aucune couleur ici. */
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
  /** Le « 5 » s’incline de -5 degrés autour de son centre, dans toutes les variantes. */
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
export function nomLogotype(produit?: string): string;
```

Le consommateur associe `lettres` à son encre (`texte-fort` à l’écran, l’encre sur papier) et `cinq`
à son bleu d’action. **Aucune valeur de couleur dans ce module** : un PDF et un courriel portent leurs
couleurs dans les deux fichiers que leur produit réserve à cela (`pdf/jetons.ts`, `emails/jetons.ts`
dans le Portail).

`Logotype.tsx` lit `LOGOTYPE` : `rotate(${LOGOTYPE.inclinaisonCinqDeg}deg)`, l’échelle et l’écart du
nom du produit (aujourd’hui `0.92` et `0.42` écrits dans `Logotype.tsx:100-102`). Le rendu du
composant ne change pas d’un pixel ; la recette et le composant ne peuvent plus diverger. Le lettrage
reste `var(--lettrage-marque)` dans le composant, et un test vérifie que `LOGOTYPE.lettrageEm` vaut
`--lettrage-marque`.

#### 5.13.3 Les limites, écrites

Un client de messagerie qui ignore `transform` (Outlook de bureau, notamment) redresse le « 5 » :
aucune recette n’y peut rien, et la décision du Portail d’écrire le logotype en texte dans ses
courriels l’accepte (SPEC P09, points de vigilance). Le module le dit dans son en-tête. Le bleu, lui,
passe partout.

`package.json`, champ `exports` : `"./logotype": "./noyau/logotype.ts"`. `files` inchangé (`noyau`
y est).

---

### 5.14 La mesure d’un texte, le rôle d’un mouvement, la durée longue

`noyau/jetons.css`, bloc `:root`. **Jetons transversaux.** Aucun ne varie avec le thème ni la
densité.

#### 5.14.1 `--mesure-texte`

```css
/* La longueur de ligne d’un texte courant long : programme, annonce, politique. Au-delà de
   soixante-cinq signes, l’œil perd le début de la ligne suivante. Ce n’est pas une largeur de
   colonne : une phrase courte d’en-tête garde sa propre borne. */
--mesure-texte: 65ch;
```

Il s’emploie en `max-width: var(--mesure-texte)` sur un bloc de texte, jamais sur une colonne entière.
`ch` se calcule sur la police de l’élément : 65 signes en Inter 16 px font environ 520 px. Compte
garde ses `46ch` de phrases courtes, qui sont une autre mesure (§13).

#### 5.14.2 Les trois jetons de mouvement

```css
/* Un mouvement se nomme par son RÔLE. La durée et la courbe qu’il porte peuvent changer sans
   qu’un seul appel change. */
--mouvement-retour: var(--duree-courte) var(--courbe-sortie);   /* un état répond : survol, appui relâché */
--mouvement-entree: var(--duree-moyenne) var(--courbe-entree);  /* quelque chose arrive */
--mouvement-sortie: var(--duree-courte) var(--courbe-sortie);   /* quelque chose part */
```

| Jeton | Valeur | Sous mouvement réduit | Emploi |
| ----- | ------ | --------------------- | ------ |
| `--mouvement-retour` | 150 ms, `cubic-bezier(0.4, 0, 1, 1)` | 100 ms (par `--duree-courte`) | Survol et relâchement de `LigneLien`, onglets, bouton de copie |
| `--mouvement-entree` | 250 ms, `cubic-bezier(0.16, 1, 0.3, 1)` | 100 ms (par `--duree-moyenne`) | Une entrée dans un produit (un bandeau qui arrive, la tête d’état du Portail) |
| `--mouvement-sortie` | 150 ms, `cubic-bezier(0.4, 0, 1, 1)` | 100 ms | Une ligne qui part (la sortie que Compte écrit en `250ms ease-out`) |

Emploi : `transition: background var(--mouvement-retour), color var(--mouvement-retour);`. Sous
mouvement réduit, les durées tombent à 100 ms d’elles-mêmes (bloc existant de `jetons.css`) ; ce qui
**se déplace** (`transform`) reste à la charge de chaque feuille, qui le supprime (§5.0.2, règle 4).

`retour` et `sortie` valent la même chose aujourd’hui : ils ne disent pas la même chose, et c’est le
rôle qui est nommé. Les composants existants ne sont **pas** migrés vers ces jetons dans ce lot : leurs
paires actuelles (`Bouton` passe ses couleurs sur la courbe d’entrée) changeraient d’un rien au
survol, et personne ne l’a demandé (§16).

#### 5.14.3 La règle de la durée longue

Le commentaire de `jetons.css:177-180` et `NOYAU.md` réécrivent la règle de `--duree-longue`
(800 ms, 0 ms sous mouvement réduit). Décision 006 :

> La durée longue sert deux choses, et deux seulement : une confirmation qui engage la sécurité du
> compte, et **le moment signature unique d’un produit, déclaré par son nom dans le `DESIGN.md` de ce
> produit**. Jamais un ornement, jamais deux moments dans un même produit.

Compte emploie déjà la première (`components/ConfirmationSecurite.tsx:36`, `DUREE_MS = 800`) ; le
Portail déclare la seconde (la feuille d’attestation qui se pose, SPEC P09 §5.9.3). **Aucun jeton
`--duree-signature` n’est ajouté** : il vaudrait `--duree-longue`, et deux noms pour une même valeur
et un même rôle divergent à la première correction. Le Portail emploie `var(--duree-longue)`.

---

## 6. Jetons ajoutés, et la preuve qu’aucune valeur ne change

### 6.1 Ce qui s’ajoute

| Fichier | Nom | Valeur | Nature |
| ------- | --- | ------ | ------ |
| `densites/profils.css` | `--hauteur-controle-profil` | 48, 48, 44, 40 px selon le profil | Source de densité (§5.1) |
| `densites/profils.css` | `--ligne-liste-profil` | 64, 56, 48, 40 px | Source de densité |
| `noyau/jetons.css` | `--mesure-texte` | `65ch` | Jeton typographique |
| `noyau/jetons.css` | `--mouvement-retour` | `var(--duree-courte) var(--courbe-sortie)` | Jeton de mouvement |
| `noyau/jetons.css` | `--mouvement-entree` | `var(--duree-moyenne) var(--courbe-entree)` | Jeton de mouvement |
| `noyau/jetons.css` | `--mouvement-sortie` | `var(--duree-courte) var(--courbe-sortie)` | Jeton de mouvement |
| `noyau/jetons.css` | `caret-color` sur `:root`, règle `::selection` | §5.7.1 | Règles globales, pas des jetons |
| `noyau/couleurs-navigateur.ts` | `COULEURS_NAVIGATEUR` | `{ clair: '#FAF7F2', sombre: '#0B1620' }` | Export TypeScript, valeurs de `--surface-1` |

`densites/profils.css` déclare donc **huit** propriétés au lieu de six ; les six que les composants
lisent sont inchangées dans leur nom et dans leur valeur déclarée. `tests/densites.test.ts`
(« ne déclare que les six variables autorisées ») devient « les huit », avec la raison.

### 6.2 La preuve qu’aucune valeur existante ne change

Un changement de valeur de jeton est **majeur** (`CHANGELOG.md`, en tête). La preuve ne s’affirme
pas, elle s’exécute :

- **`tests/instantanes/jetons-1.1.0.json`** : l’instantané de `1.1.0`, engendré une fois au début du
  lot à partir des fichiers de l’étiquette (`git show v1.1.0:noyau/jetons.css`, et de même pour
  `paliers.css`, `profils.css`, `marque.css`), puis versionné. Il porte, bloc par bloc (`:root`, les
  deux blocs sombres, le bloc clair explicite, les quatre profils, `paliers.css` et ses paliers), le
  nom et la valeur de chaque propriété.
- **`tests/non-regression.test.ts`** : pour chaque propriété de l’instantané, la valeur **effective**
  en `1.2.0` dans le même bloc est identique. Pour `--hauteur-controle` et `--ligne-liste`, la valeur
  effective se lit par le résolveur du §5.1.4 à la souris ; au doigt, l’instantané porte « invalide »,
  et le test vérifie qu’elle devient la valeur du profil relevée au plancher, ce qui est l’objet du
  correctif. Une propriété de l’instantané absente de `1.2.0` fait échouer le test.
- Le test ne lit jamais Git : l’intégration continue clone sans étiquettes.

### 6.3 La garde de contraste

`tests/jetons.test.ts` mesure aujourd’hui 49 couples (§0.6). Le lot en ajoute **huit**, chacun nommé
par le rôle qui l’impose :

| Thème | Premier plan | Fond | Ratio | Rôle |
| ----- | ------------ | ---- | ----- | ---- |
| clair | `--texte-fort` | `--surface-selection` | 15,13 | Titre d’une ligne ou d’un onglet à l’appui |
| clair | `--texte-faible` | `--surface-selection` | **4,51** | Description d’une ligne à l’appui |
| clair | `--action` | `--surface-selection` | 4,96 | Onglet actif, segment coché |
| sombre | `--texte-faible` | `--surface-chaude` | 5,79 | Ton `neutre` |
| sombre | `--texte` | `--surface-chaude` | 11,06 | Corps d’un bandeau `neutre` |
| sombre | `--texte-fort` | `--surface-selection` | 13,14 | Appui en sombre |
| sombre | `--texte-faible` | `--surface-selection` | 5,00 | Appui en sombre |
| sombre | `--action` | `--surface-selection` | **4,51** | Onglet actif en sombre |

Les couples de la sélection de texte (`--texte-sur-action` sur `--action`) et du ton neutre en clair
(`--texte-faible` sur `--surface-chaude`) sont déjà mesurés : aucun doublon. Total : **57**. `NOYAU.md`
§1.4 cesse d’écrire un nombre et renvoie au test.

---

## 7. Animations

Toute durée passe par un jeton ; toute feuille qui déclare `@keyframes` contient
`prefers-reduced-motion`.

| Élément | Propriété | Durée | Courbe | Sous `prefers-reduced-motion` |
| ------- | --------- | ----- | ------ | ----------------------------- |
| `LigneLien`, survol | `background` | 150 ms (`--mouvement-retour`) | `--courbe-sortie` | 100 ms |
| `LigneLien`, appui | `background` | 0 ms à l’appui, 150 ms au relâchement | `--courbe-sortie` | Identique |
| Onglet, survol | `color` | 150 ms (`--duree-courte`, inchangé) | `--courbe-entree`, inchangé | Aucune |
| Onglet, appui | `background` | 0 ms | aucune | Identique |
| Onglet en attente | Opacité d’un trait `::after`, 0,4 à 1 | 1 200 ms, aller et retour, infini | `ease-in-out`, comme les points du bouton | Trait fixe, opacité 1 |
| Fondu des onglets | `mask-image`, lié au défilement | Aucune durée : suit la position | linéaire | Inchangé (un masque ne bouge pas de lui-même) |
| Onglet actif au premier affichage | Position de défilement initiale | 0 ms | aucune | Identique |
| Points d’attente (`Bouton` en lien, `LigneLien`) | Ceux du bouton : opacité et `translateY(-3px)` | 1 200 ms, décalés de 160 ms | `ease-in-out` | Points fixes, opacité 1 |
| `Bouton`, appui | `translateY(1px)` | 150 ms | `--courbe-sortie` | Aucun déplacement (inchangé) |
| `ValeurCopiable`, succès | Icône `Copy` remplacée par `Check`, libellé remplacé | Remplacement immédiat ; retour au repos après 2 000 ms | aucune | Identique |
| `SelecteurTheme` | Inchangé | | | |
| Plancher, pieds, titres, définitions, ton neutre | Aucun mouvement | | | |

**Refusés** : l’animation d’une largeur ou d’une hauteur, la mise à l’échelle d’un bouton, une entrée
en cascade, le rebond. La primitive `Apparition` n’entre pas dans ce lot (§0.5, n° 8).

---

## 8. Accessibilité

| Exigence | Où |
| -------- | -- |
| Cible de 44 px au doigt, partout | §5.1 (plancher), §5.6 (sélecteur de thème) ; critère WCAG 2.5.8 |
| Un lien s’annonce comme un lien, un bouton comme un bouton | §5.2 ; un lien désactivé : « lien, indisponible », hors tabulation |
| Nouvel onglet annoncé | « (s’ouvre dans un nouvel onglet) », hors écran, sur tout lien sortant du système |
| Couleur jamais seule | Ton `neutre` avec mot ; segment coché avec graisse ; onglet actif avec trois signaux |
| Focus visible | Anneau 2 px `var(--action)` sur toute ligne, tout onglet, tout segment, tout lien-bouton |
| Nom visible égal au nom accessible | `SelecteurTheme` en mode libellés (§5.6.5) |
| Repères | Un seul `contentinfo`, hors de `<main>` (§5.5) |
| Listes | `role="list"` sur `ListeLignes` ; `<dl>` sur `ListeDefinitions` |
| Annonces | `ValeurCopiable` : région polie ; aucune alerte |
| Mouvement | §7, colonne « réduit » |
| Zoom | À 200 %, aucun composant du lot ne crée de défilement horizontal de la page : les onglets défilent dans leur propre cadre |

---

## 9. Sécurité

Le système ne connaît ni la session, ni les droits, ni le réseau. Ce que le lot touche près d’une
frontière :

| Sujet | Mesure |
| ----- | ------ |
| Liens sortants | `noopener noreferrer` ajouté par le système à tout `target="_blank"` de `Bouton` et `LigneLien`, en plus de ce que le produit passe |
| Presse-papiers | Écriture seulement, sur un geste de la personne ; aucune lecture ; échec dit et jamais avalé |
| Téléchargement | `<a download>` natif, jamais par un routeur client |
| Politique de sécurité du contenu | Aucun script en ligne ajouté ; les feuilles injectées suivent le mécanisme existant ; aucune requête réseau, aucune police distante |
| Données | Aucune donnée personnelle dans le dépôt public : exemples fictifs du PRD du Portail |

---

## 10. Tests et gardes

Les tests s’écrivent avec le code de chaque tâche ; ils ne sont lancés qu’à la vérification finale.

| Fichier | Ce qu’il tient |
| ------- | -------------- |
| `tests/cycles.test.ts` (nouveau) | Aucune déclaration ne lit sa propre propriété, dans les quatre feuilles et dans les feuilles injectées ; un témoin construit sur la forme de `1.1.0` est relevé |
| `tests/densites.test.ts` | Huit propriétés, les sources par profil aux valeurs du tableau, le bloc générique, le plancher sur les sources ; le résolveur des valeurs effectives à la souris et au doigt (§5.1.2) ; le plancher déclaré après le dernier profil (inchangé) |
| `gardes/gardes.test.ts` | `verifierPlancherTactile` valide la feuille du dépôt ; relève la forme de `1.1.0` avec le message « se lit elle-meme » et la bonne ligne ; relève une source oubliée ; exceptions du dépôt : `noyau/couleurs-navigateur.ts` ajouté, et le `1px` de `lien.ts` et le `2px` de `LigneLien.tsx` nommés hors échelle |
| `tests/non-regression.test.ts` (nouveau) et `tests/instantanes/jetons-1.1.0.json` | §6.2 |
| `tests/jetons.test.ts` | Les huit couples du §6.3 ; `--mesure-texte` vaut `65ch` ; les trois jetons de mouvement ne pointent que vers des durées et des courbes existantes ; `caret-color` et `::selection` présents ; `color-scheme` et `accent-color` inchangés |
| `tests/composants/theme.test.tsx` | `COULEURS_NAVIGATEUR.clair` égale `--surface-1` du bloc `:root`, `.sombre` celle du bloc `[data-theme='dark']` ; réexport par `noyau/theme.ts` ; `SelecteurTheme` avec `libellesVisibles` rend les trois mots, sans `aria-label` ; règle `(pointer: coarse)` à 44 px dans la feuille ; requête de conteneur à 17rem |
| `tests/composants/bouton-lien.test.tsx` (nouveau) | Les six lignes du tableau du §5.2.2 : élément rendu, attributs, absence de `href` inactif, `rel` complété sans doublon, mention du nouvel onglet, `Lien` ignoré avec `download` et `target="_blank"`, `type` jamais transmis ; un `Lien` factice reçoit `style`, `data-variante`, `className` ; survols gardés par `(hover: hover)` et `aria-disabled` ; un appel sans `href` rend le même HTML qu’en `1.1.0` |
| `tests/composants/composants.test.tsx` | `Pastille`, `PastilleEtat`, `Bandeau` en `neutre` : jetons, icône `Info`, `role="status"`, contour en texte faible ; `CarteAction` accepte `neutre` |
| `tests/composants/onglets-rubrique.test.tsx` | Six onglets rendus ; `Lien` employé pour chacun ; constantes `ONGLETS_RUBRIQUE_MIN` et `_MAX` ; la feuille porte `@supports (animation-timeline: scroll())`, `scroll(self inline)`, les trois images de masque, `scroll-initial-target` sous `@supports`, le sélecteur d’attente par `:has()`, `prefers-reduced-motion`. Le test « ne pose aucun voile » (`:118`) change de libellé et d’objet : **aucun élément** de voile n’est rendu dans le DOM, et le fondu n’existe que dans la frise (décision 007) |
| `tests/composants/coquille-rail.test.tsx` | `<footer>` après `<main>` si un pied est fourni, absent sinon ; `data-pied` ; pied compact ignoré en `bureau-seulement` ; la réserve basse passe au pied (feuille) ; sans pied, le HTML de `1.1.0` |
| `tests/composants/titre-section.test.tsx` (nouveau) | Niveau rendu, tailles, graisse 400, lettrage, `text-wrap`, marge nulle, `style` qui gagne |
| `tests/composants/ligne-lien.test.tsx` (nouveau) | Structure, chevron par défaut et absent avec `download` et `externe`, `metaMono`, `titreEnTitre`, un seul élément interactif, mention du nouvel onglet, `min-height: var(--ligne-liste)` dans la feuille, survol gardé, appui sans transition, attente par `:has()` |
| `tests/composants/liste-lignes.test.tsx` (nouveau) | `ul[role=list]`, un `li` par enfant non nul, filets selon `bordsExterieurs`, `aria-label` |
| `tests/composants/liste-definitions.test.tsx` (nouveau) | `dl` et paires groupées, `mono`, requête de conteneur à 480 px seulement si `colonnes={2}` |
| `tests/composants/valeur-copiable.test.tsx` (nouveau) | Succès : libellé et icône changent, annonce, retour au repos après 2 000 ms (minuteries factices), minuterie nettoyée au démontage ; échec (promesse rejetée, puis presse-papiers absent) : focus et sélection de toute la valeur, message visible et annoncé ; libellés par défaut |
| `tests/logotype.test.ts` (nouveau) | `LOGOTYPE` : trois morceaux dans l’ordre, `cinq` au milieu, inclinaison -5, `lettrageEm` égal à `--lettrage-marque`, aucune couleur (ni `#`, ni `rgb`, ni nom de jeton) ; `nomLogotype` ; `Logotype.tsx` importe `LOGOTYPE` et n’écrit plus `0.92`, `0.42` ni `-5deg` en dur |
| `tests/index.test.ts` | Trente-neuf composants (`ATTENDUS` + `TitreSection`, `LigneLien`, `ListeLignes`, `ListeDefinitions`, `ValeurCopiable`) ; constantes exportées ; `ValeurCopiable` déclare `'use client'`, les quatre autres non |
| `tests/documentation.test.ts` | Inchangé dans son code : il confrontera `1.2.0` et trente-neuf composants au README et à `NOYAU.md`, et l’entrée `## 1.2.0 ` du journal |
| `tests/exports.test.ts` (nouveau) | Chaque chemin du champ `exports` de `package.json` existe, dont `./logotype` |

**Chaque garde nouvelle est vue échouer une fois** sur un cas construit, avant d’être considérée comme
posée (leçon du dépôt : « Avant de fixer ce qu’une garde tolère, la lancer telle quelle et lire ce
qu’elle trouve »).

La vérification, d’un seul bloc, à la fin :

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test
```

Le dépôt n’a pas de `build`. `pnpm install` se lance une fois, avant le plan, si `node_modules` manque.

---

## 11. Spécimens et preuves

### 11.1 Spécimens

`_build/generer-specimens.mjs` reçoit une section par pièce du lot, dans les quatre densités et les
trois états de thème, comme les autres : le ton `neutre` à côté des quatre tons ; un bouton en lien
dans chaque variante, dont un désactivé et un en attente (`data-en-attente` posé à la main) ; six
onglets dans une colonne de 390 px, défilés au début, au milieu et à la fin ; une coquille avec les
deux pieds ; le sélecteur de thème en icônes et en libellés, à 288 px et à 216 px ; les trois tailles
de `TitreSection` ; une `ListeLignes` de trois `LigneLien` (chevron, téléchargement, lien sortant),
dont une au survol et une à l’appui ; une `ListeDefinitions` à une et à deux colonnes ; une
`ValeurCopiable` au repos, en succès et en échec ; un bloc de `height: var(--hauteur-controle)` et un
bloc de `min-height: var(--ligne-liste)` par profil, pour la mesure. `pnpm specimens` régénère
`specimens/composants.html`.

### 11.2 Preuves, dans `docs/preuves/1.2.0/`

| Fichier | Contenu |
| ------- | ------- |
| `plancher-tactile.md` | La mesure du §5.1.4, sortie brute, **avant** (sur `1.1.0`) puis **après**, dans les deux contextes, les quatre profils |
| `specimens-souris-clair-1280.png`, `specimens-souris-sombre-1280.png` | Spécimens à la souris |
| `specimens-doigt-clair-390.png`, `specimens-doigt-sombre-390.png` | Spécimens au doigt (`hasTouch`, `isMobile`), `matchMedia('(pointer: coarse)')` vérifié vrai avant la capture |
| `specimens-doigt-clair-320.png`, `specimens-souris-clair-768.png` | Le sélecteur de thème en libellés à 320 px et dans un pied de 216 px |
| `onglets-{debut,milieu,fin}-390.png` | Le fondu aux trois positions ; et la même rangée à 1 280 px, sans fondu |
| `selection-{clair,sombre}.png` | Un texte sélectionné sur `--surface-1`, `--surface-2` et `--surface-3` |
| `verification.md` | La sortie recopiée de la vérification d’un bloc |
| `montee-compte.md` | Avant l’étiquette : dans une copie de travail de Compte, le système remplacé par une installation locale de ce dépôt, puis `typecheck`, `lint` et `test` de Compte lancés **sans changer une ligne de Compte**, sortie recopiée ; la copie est ensuite rendue à son état, aucun commit dans Compte. Sans cette recette, la ligne va dans « Ce qui n’est pas couvert » |
| `README.md` | Ce qui est prouvé, et une section **« Ce qui n’est pas couvert »** : au moins Safari sans appareil, un téléphone réel, `scroll-initial-target` et `animation-timeline` hors Chromium si non constatés, le rendu dans un client de messagerie (la recette n’y est pas employée par le système) |

---

## 12. L’entrée du journal des changements

À écrire en tête de `CHANGELOG.md`, date du jour de la publication. Brouillon, dans la voix du
journal :

```markdown
## 1.2.0 · {date de publication}

Ce que l’espace participant du Portail demandait, et le correctif d’un défaut que tous les produits
portaient sur téléphone. Aucune valeur de jeton ne change.

### Ce qui change à l’écran, sans une ligne de code dans le produit

1. **Au doigt, les contrôles retrouvent leur hauteur.** `--hauteur-controle` et `--ligne-liste` se
   lisaient elles-mêmes sous `(pointer: coarse)` et devenaient invalides : sur téléphone, tous les
   boutons valaient 44 px et un squelette de champ 21 px. En `equilibre`, un bouton `md` refait 48 px,
   un `lg` 56 px, un champ 48 px. Le test et la garde exigeaient la forme fautive ; ils la refusent.
2. **La sélection de texte** prend les couleurs du bouton primaire, et le curseur de saisie le bleu
   d’action.
3. **Au doigt, le sélecteur de thème** a des segments de 44 px.
4. **Au doigt, un bouton touché** ne garde plus sa couleur de survol.
5. **Les onglets de rubrique** montrent un fondu au bord qui cache un onglet, et seulement là ; l’onglet
   actif est amené dans la vue au premier affichage, là où le navigateur le sait.

### Ajouts

- `Bouton` rendu en lien : `href`, `Lien`, `download`, `target`. `ComposantLien` accepte tous les
  attributs d’un lien.
- Le ton `neutre` : « rien à signaler », pour `Pastille`, `PastilleEtat`, `Bandeau`.
- `OngletsRubrique` : `Lien`, jusqu’à six onglets, l’état d’attente.
- `CoquilleRail` : `piedContenu` et `piedCompact`.
- `SelecteurTheme` : `libellesVisibles`.
- Cinq composants : `TitreSection`, `LigneLien`, `ListeLignes`, `ListeDefinitions`, `ValeurCopiable`.
- `--mesure-texte`, `--mouvement-retour`, `--mouvement-entree`, `--mouvement-sortie`.
- `COULEURS_NAVIGATEUR` par `@ai5d/design-system/theme` ; `LOGOTYPE` par
  `@ai5d/design-system/logotype`.

### Règle réécrite

La durée longue sert aussi le moment signature unique d’un produit, déclaré dans son `DESIGN.md`.
Décision 006.

### Compatibilité

Aucune propriété retirée. `ProprietesBouton` devient une union, `TonSemantique` gagne une valeur :
un produit qui étend le premier ou énumère le second dans un `Record` devra le traiter ; aucun ne le
fait dans Compte, le Portail ou le SDK. Un composant de lien écrit par un produit doit transmettre
tous les attributs qu’il reçoit.
```

---

## 13. Guide de montée pour un produit

### 13.1 Le geste, pour tout produit

1. Remplacer l’étiquette dans le manifeste : `"@ai5d/design-system": "github:Kaaramo/ai5d-digital-design-system#v1.2.0"`, puis `pnpm install`.
2. Si le produit a écrit son propre composant de lien pour `LiensRail` ou `BarreOnglets`, vérifier
   qu’il transmet **tous** les attributs reçus au `<a>` (`...reste`) ; `Link` de Next le fait déjà.
3. Relancer sa vérification d’un bloc : la garde `verifierPlancherTactile`, si le produit la lance
   sur la feuille installée, passe désormais.
4. Regarder à l’écran, au doigt, les cinq différences du §12 : c’est tout ce qui change sans code.

Aucune adoption n’est obligatoire : chaque ajout est facultatif.

### 13.2 AI5D Portail, de `v1.0.1` à `v1.2.0`

En plus du §13.1, la montée traverse `1.1.0` : `BoiteMotif` et `BoiteConfirmation` acceptent
`erreur`, et le schéma de couleur du navigateur suit le thème (contrôles natifs sombres en sombre).
Tout le reste est ce que P09 consomme ; les écarts entre son contrat et ce lot sont au §17.

### 13.3 AI5D Compte, de `v1.1.0` à `v1.2.0`

| Ce que Compte fait aujourd’hui | Ce que `1.2.0` permet | Obligatoire |
| ------------------------------ | --------------------- | ----------- |
| `RetourPortail.tsx:24` et `LienInvalide.tsx:56` naviguent par `window.location.assign` depuis un `<button>` | `<Bouton href="/" pleineLargeur>Revenir au portail</Bouton>` : un composant serveur de plus, un vrai lien | Non |
| `OngletsPortail.tsx:95` rend les onglets sans lien du routeur : chaque sous-page recharge le document | `Lien={Link}` | Non |
| « SANS ACCÈS » en texte, faute de ton (`CarteProduit.tsx:26`) | Ton `neutre` ; l’arbitrage « des lignes, pas des badges » de sa charte reste le sien | Non |
| Douze titres en Fraunces écrits à la main | `TitreSection` ; les copies disparaissent | Non |
| `LigneCompte` en `Link` stylé en ligne, sans états | `LigneLien` dans une `ListeLignes bordsExterieurs={false}` | Non |
| `<dl>` de la fiche de compte écrit à la main | `ListeDefinitions` | Non |
| `CopierValeur` | `ValeurCopiable`, avec `messageEchec` « Sélectionnez la clé ci-dessus pour la copier. » | Non |
| « AI5D » en Fraunces à l’encre dans l’en-tête des courriels | Composer selon `LOGOTYPE` dans `emails/jetons.ts` : « AI » et « D » en Inter 700 à l’encre, « 5 » en bleu d’action | Non |
| Le thème est inatteignable sous 768 px | `piedCompact` avec `SelecteurTheme libellesVisibles` | Non |
| Transitions écrites à la main (`Gestion.tsx:51`) | `--mouvement-sortie` | Non |

### 13.4 Le SDK `@ai5d/auth`

Rien n’est requis : il déclare le système en dépendance de pair `*`. `AccesRefuse.tsx:126-131` pourra
passer à `Bouton href` dans une version du SDK, qui montera alors sa dépendance de développement.

---

## 14. La publication

**La publication de l’étiquette `v1.2.0` demande l’accord explicite de Karamo.** Elle touche tous les
produits : le jour où l’un d’eux remplace son étiquette, il reçoit tout ce que le §12 dit.

Dans cet ordre, et jamais autrement :

1. Vérification d’un bloc verte, sortie recopiée dans `docs/preuves/1.2.0/verification.md`.
2. Mesure du plancher après correctif et captures consignées ; « Ce qui n’est pas couvert » écrit.
3. `CHANGELOG.md`, `README.md` (version, badge, commandes d’installation en `#v1.2.0`), `NOYAU.md` à
   jour : `tests/documentation.test.ts` le confronte.
4. Les trois points du §0.8 tranchés par Karamo : classement (mineure ou majeure), sélection de texte,
   constats des navigateurs.
5. **Accord explicite de Karamo**, demandé en nommant ce qui sera publié.
6. Étiquette `v1.2.0` sur le commit vérifié, poussée de `main` et de l’étiquette. Jamais de poussée
   forcée ; une étiquette publiée ne se déplace jamais : un défaut trouvé après se corrige en `1.2.1`.

Aucun message de commit, aucune description, aucun fichier ne porte de co-auteur ni de mention
d’outillage (règles globales de Karamo, qui valent pour ce dépôt, qui n’a pas de règles propres).

---

## 15. Critères d’acceptation

**Plancher tactile**

- [ ] Aucune déclaration d’une feuille du système ne lit sa propre propriété (`tests/cycles.test.ts`, témoin relevé)
- [ ] Les valeurs effectives du §5.1.2 sont vérifiées par le résolveur, à la souris et au doigt, pour les quatre profils
- [ ] `verifierPlancherTactile` accepte la feuille du dépôt et refuse la forme de `1.1.0` avec son message et sa ligne
- [ ] Mesure Chromium consignée avant et après : au doigt, en `equilibre`, `--hauteur-controle` vaut `48px`, `--ligne-liste` `56px`, un bouton `lg` 56 px, un champ 48 px, un squelette de contrôle 48 px ; en `compact`, 44 px
- [ ] `DENSITES.md` et `PALIERS.md` montrent la forme corrigée ; décision 005 écrite

**Liens et navigation**

- [ ] `Bouton` avec `href` rend un lien avec les classes, la hauteur et les états d’un bouton ; sans `href`, le HTML de `1.1.0`
- [ ] Un lien désactivé ou en chargement n’a pas de `href` ; un lien sortant a `rel="noopener noreferrer"` et la mention lue
- [ ] `download` et `target="_blank"` n’emploient jamais le lien du routeur
- [ ] `OngletsRubrique` accepte six onglets et un `Lien` ; sur la capture à 390 px, le fondu apparaît au bord qui cache un onglet, et sur celle à 1 280 px, aucun fondu
- [ ] Un lien qui contient `[data-en-attente]` montre son état d’attente (spécimen)
- [ ] Au doigt, un bouton touché ne garde pas sa couleur de survol

**États et contenus**

- [ ] Le ton `neutre` existe dans `Pastille`, `PastilleEtat`, `Bandeau`, avec les jetons et le contour du §5.3
- [ ] `TitreSection`, `LigneLien`, `ListeLignes`, `ListeDefinitions`, `ValeurCopiable` sont exportés, documentés dans `NOYAU.md` et le README, et rendus dans les spécimens
- [ ] `LigneLien` a `min-height: var(--ligne-liste)`, un appui visible sans transition, et un seul élément interactif
- [ ] `ListeDefinitions` passe à deux colonnes par requête de conteneur à 480 px
- [ ] `ValeurCopiable` : l’échec sélectionne toute la valeur et affiche le message ; le succès revient au repos après 2 000 ms

**Coquille et navigateur**

- [ ] `CoquilleRail` rend un `<footer>` après `<main>` quand un pied est fourni, et le HTML de `1.1.0` sinon
- [ ] Le sélecteur de thème a des segments de 44 px au doigt ; en libellés, il tient à 320 px et dans un pied de 216 px (captures)
- [ ] La sélection de texte est lisible sur les trois surfaces, en clair et en sombre (captures) ; le curseur de saisie est bleu
- [ ] `COULEURS_NAVIGATEUR` s’importe par `@ai5d/design-system/theme` et égale `--surface-1` dans les deux thèmes

**Jetons et marque**

- [ ] `--mesure-texte` et les trois jetons de mouvement existent ; aucun jeton `--duree-signature` ; règle de la durée longue réécrite, décision 006
- [ ] L’instantané de `1.1.0` est versionné et `tests/non-regression.test.ts` passe : aucune valeur existante ne change
- [ ] La garde de contraste mesure 57 couples, tous au-dessus de 4,5
- [ ] `LOGOTYPE` s’importe par `@ai5d/design-system/logotype`, sans couleur ; `Logotype.tsx` le lit et se rend comme avant

**Qualité et publication**

- [ ] `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test` vert d’un seul bloc, sortie recopiée
- [ ] Aucune dépendance ajoutée ; aucun composant existant ne prend `'use client'`
- [ ] La montée de Compte sans changement de code est constatée (`montee-compte.md`), ou écrite comme non couverte
- [ ] Trente-neuf composants dans l’index, le README et `NOYAU.md` ; version `1.2.0` partout où la garde documentaire la cherche
- [ ] Décisions 005 à 009 écrites ; `tasks/todo.md` coché ; leçons consignées
- [ ] Le rapport de preuves porte « Ce qui n’est pas couvert »
- [ ] Chaque message de commit passe la recherche des mentions interdites avec un résultat nul
- [ ] L’étiquette `v1.2.0` n’est posée qu’après l’accord explicite de Karamo

---

## 16. Hors périmètre

| Élément | Motif | Prévu en |
| ------- | ----- | -------- |
| `IndicateurNavigation` | Aucun deuxième consommateur constaté ; `useLinkStatus` pas encore constaté (P09 §0.9) | Dans le Portail, API de P09 ; monte au deuxième consommateur |
| Primitive `Apparition` | Aucun deuxième consommateur | Dans le Portail, sur `--mouvement-entree` |
| `--largeur-lecture` (`36rem`) | Une largeur de colonne propre aux écrans hors coquille du Portail ; Compte en a une autre (440 px) | Constante TypeScript du Portail (§17) |
| Tracé vectoriel du logotype (`TRACE_LOGOTYPE`) | Aucun deuxième consommateur ; outillage de polices absent | Lot L4, remédiation des logotypes |
| `scrollbar-color` | Redondant avec `color-scheme` (1.1.0) ; pouce à 1,49 | Aucun |
| `--duree-signature` | Doublon de `--duree-longue` | Aucun |
| Migration des composants existants vers les jetons de mouvement et vers `TitreSection` | Changement de rendu non demandé | À la demande d’un produit |
| `--surface-survol` | Demandé par P10 ; `LigneLien` écrit ses deux blocs de thème en attendant | `1.3.0` |
| Injection unique des feuilles (une balise par composant) | Demandé par P10 §7.2, pièce 9 ; concerne tous les composants | `1.3.0` |
| Compteur des onglets, table de données, menus d’actions, en-tête d’objet | Contrat de P10 §7.2 | `1.3.0` |
| `BarreProgression`, façade de replay | Restent dans le Portail (SPEC P09 §7) | Au deuxième consommateur |

---

## 17. Écarts avec le contrat de P09, et ce que P09 et P10 doivent relire

Le contrat de P09 dit que le lot « peut préciser une signature, pas retirer un besoin sans le dire ».
Voici chaque écart, et sa conséquence pour le Portail.

| # | Contrat de P09 | Ce lot | Motif | Conséquence pour le Portail |
| - | -------------- | ------ | ----- | --------------------------- |
| 1 | Étiquette `v1.1.0` | **`v1.2.0`** | `v1.1.0` existe déjà (§0.1) | P09 épingle `#v1.2.0` ; IP67 vérifie `>= 1.2.0` ; ses documents disent « Système 1.1 » pour ce lot |
| 2 | `::selection` en `--info-fond` et `--texte-fort` | `--action` et `--texte-sur-action` | 1,01 sur une carte sombre (§5.7.1) | Aucun code ; captures de la sélection |
| 3 | `scrollbar-color` | Non posé | Redondant, 1,49 (§0.6) | IP67 ne le cherche pas |
| 4 | Fondu « sur le bord qui cache un onglet » | Oui, par la frise de défilement, sous `@supports` | Sans script, sans directive (décision 007) | Sans prise en charge, pas de fondu : critère « un fondu signale ceux qui débordent » à constater par navigateur |
| 5 | Onglet actif amené dans la vue par `scrollIntoView` | Par `scroll-initial-target`, sous `@supports` | `OngletsRubrique` reste rendable par un composant serveur (§0.6) | Idem |
| 6 | Style `[data-en-attente]` sur le lien appuyé | Protocole : l’attribut sur le lien **ou sur un descendant** (`:has()`) | `useLinkStatus` ne se lit que dans un descendant du `Link` | `LienSuivi` rend son marqueur dans le lien |
| 7 | Bouton et ligne en attente avec `aria-busy="true"` (P09 §5.0.3) | Le système ne pose pas `aria-busy` sur un lien en attente | Il ne voit que le CSS | L’annonce passe par l’indicateur du Portail |
| 8 | `--largeur-lecture` | Retiré | Pas de deuxième consommateur (§0.5, n° 7) | Constante TypeScript unique du Portail, dans `lib/` (hors de la portée d’IP63, qui vise `app/` et `components/`) ; P10 §7.1 la disait « bloquante » : la constante sert aussi la console, même produit |
| 9 | `--duree-signature` | Retiré ; règle de `--duree-longue` réécrite | Doublon (§5.14.3) | La feuille qui se pose emploie `var(--duree-longue)` ; `DESIGN.md` déclare le moment |
| 10 | `--duree-survol` déprécié | Sans objet | N’existe pas (§0.6) | Aucun |
| 11 | `Apparition` | Retirée | Pas de deuxième consommateur | Écrite dans `components/`, API de P09, sur `--mouvement-entree` |
| 12 | `IndicateurNavigation` | Retiré | Pas de deuxième consommateur | Écrit dans `components/`, API de P09 ; IP67 ne cherche plus cet export |
| 13 | `TRACE_LOGOTYPE` par `@ai5d/design-system/logotype` | `LOGOTYPE`, la recette, par le même chemin | §5.13 | `pdf/Logotype.tsx` suit la voie que P09 appelait « repli » (Inter 700, « 5 » pivoté), en lisant la recette |
| 14 | Contour du bandeau `neutre` en `--bordure-forte` | En `--texte-faible` | Le bandeau ne se détacherait pas du papier (§5.3) | Aucun code |
| 15 | `ListeDefinitions` en deux colonnes « dès 640 px » | Dès 480 px de **conteneur** | Convient aussi aux colonnes étroites de la console | À 640 px de fenêtre, la fiche de 36rem passe bien à deux colonnes |
| 16 | `SelecteurTheme` en libellés | Oui, et l’icône se retire sous 17rem | Le pied du rail n’offre que 216 px (§0.6) | Captures à 768 px |
| 17 | `ValeurCopiable`, valeur en `--taille-sm` (P09 §5.0.2, identifiants) | `--taille-md` dans le champ | Un champ sous 16 px fait zoomer iOS au focus | Aucun code |

**IP67 du Portail**, à réécrire au plan de P09 : il cherche `>= 1.2.0`, `color-scheme`,
`--mesure-texte`, `--hauteur-controle-profil`, le ton `neutre`, les exports `TitreSection`,
`LigneLien`, `ListeDefinitions`, `COULEURS_NAVIGATEUR` et `LOGOTYPE` ; il ne cherche plus
`--largeur-lecture` ni `IndicateurNavigation`.

**Pour P10** (§7.1 de sa SPEC), les neuf pièces qu’elle emploie : n° 1, 2, 3, 9, 10, 11, 12 livrées
telles qu’elle les attend, en densité `compact` comprise ; n° 7 réduite à `--mesure-texte` (la mesure
des formulaires passe par la constante du Portail) ; n° 8 livrée pour les trois jetons.

---

## 18. Références

- **Le besoin** : `F:\AI5D Portail\docs\sprints\sprint-p09-v2-espace-participant\SPEC-SprintP09-V2-Espace-Participant.md`,
  §0.3, §0.8, §0.9, §5.0.3, §5.1, §5.4.2, §5.9.3, §5.10, §5.16, §5.19, §5.22.2, **§7**, §8 ;
  `F:\AI5D Portail\DESIGN.md` ; `F:\AI5D Portail\docs\sprints\sprint-p10-v2-console\SPEC-SprintP10-V2-Console.md`,
  §0.3, §0.6, §0.9, §0.11, **§7.1**, §7.2
- **Le deuxième consommateur** : `C:\Users\ksthe\Documents\ai5d-platform`, commit `1ef7ef2`, fichiers
  cités au §0.5 ; SDK `@ai5d/auth` 1.1.0, `src/react/AccesRefuse.tsx`
- **Ce dépôt** : `README.md` (« Trois règles qui ne se voient pas dans le code »), `CHANGELOG.md`
  (1.1.0, 1.0.0, 0.6.3, 0.6.2, 0.5.1, 0.4.0), `noyau/NOYAU.md`, `noyau/PALIERS.md`,
  `noyau/formulations.md`, `densites/DENSITES.md`, `docs/decisions/001` à `004`,
  `docs/superpowers/specs/2026-09-05-ai5d-digital-design-system-design.md` (§6.2, §11),
  `tasks/todo.md`, `tasks/lessons.md`
- **Code lu** : `noyau/composants/Bouton.tsx`, `Pastille.tsx`, `PastilleEtat.tsx`, `Bandeau.tsx`,
  `OngletsRubrique.tsx`, `CoquilleRail.tsx`, `SelecteurTheme.tsx`, `Logotype.tsx`, `LiensRail.tsx`,
  `Squelette.tsx`, `index.ts` ; `noyau/jetons.css`, `noyau/theme.ts`, `noyau/paliers.css`,
  `densites/profils.css`, `outils/jetons.ts`, `gardes/index.ts`, `package.json` ;
  `tests/densites.test.ts`, `tests/jetons.test.ts`, `tests/index.test.ts`,
  `tests/documentation.test.ts`, `gardes/gardes.test.ts`
- **Méthode** : skill `ia5d-product-suite:spec-stories`, modèles 07 et 08 ; règles globales de
  Karamo (cycle, moment des tests, commits)
- **User Stories** : [`USER-STORIES-Version-1.2.0-Espace-Participant.md`](USER-STORIES-Version-1.2.0-Espace-Participant.md)
