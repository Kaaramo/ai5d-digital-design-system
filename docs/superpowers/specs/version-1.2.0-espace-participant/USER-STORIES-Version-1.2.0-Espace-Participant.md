# USER STORIES · Version 1.2.0 : ce qui manque au système pour l’espace participant

**Projet :** AI5D Digital Design System (`@ai5d/design-system`) · **Date :** 26 septembre 2026
**Spécification compagnon :** [`SPEC-Version-1.2.0-Espace-Participant.md`](SPEC-Version-1.2.0-Espace-Participant.md)
**Codification :** US-S01 à US-S17, neuf epics

---

## PRÉAMBULE : DEUX SORTES DE LECTEURS POUR UN MÊME SYSTÈME

Un système de design a deux sortes d’utilisateurs, et ils ne se rencontrent jamais.

**Les premiers sont des produits.** Ils installent le système, choisissent une densité, et ne
décident plus aucune couleur. Deux d’entre eux traversent ces histoires.

- **Karamo**, qui intègre le Portail. Il écrit la V2 de l’espace participant (sprint P09), puis celle
  de la console (P10). Il a relevé dans son propre code six familles de boutons faits à la main, huit
  copies d’un même titre en faux gras, une ligne cliquable sans état. Il ne veut plus rien écrire que
  le système devrait porter, et il ne veut pas non plus que le système porte ce que personne d’autre
  n’emploiera.
- **Compte**, le premier produit à avoir consommé le système. Son code garde la trace de chaque
  manque : un bouton qui navigue par un script parce que le `Bouton` du système ne sait pas être un
  lien, une copie qui échouait en silence, douze titres recopiés, une carte qui écrit « SANS ACCÈS »
  en texte faute d’un ton qui dise « rien à signaler ». C’est lui, le deuxième consommateur que la
  règle du système exige, et c’est aussi Karamo qui l’écrit.

**Les seconds sont des personnes**, qui ne sauront jamais qu’un système existe. Elles voient un bouton
qui répond ou qui ne répond pas.

**Aïssatou Camara** est responsable de la relation client chez Orange Guinée. Son entreprise envoie
vingt-cinq collaborateurs à « Claude pour les entreprises », trois jours de présentiel à Conakry, du
13 au 15 octobre 2026. Elle lit tout sur un téléphone Android de 390 pixels, dans des taxis, sur un
réseau qui passe de la 4G à presque rien au rond-point de Bambeto. Le soir, son téléphone est en
thème sombre.

Ce qu’Aïssatou ne sait pas, et que ce document raconte : depuis la toute première version du système,
sur son téléphone, chaque bouton de chaque produit AI5D mesure 44 pixels quelle que soit sa taille,
et le squelette d’un champ qui charge n’est qu’un trait de 21 pixels. Personne ne l’a vu, parce
qu’aucun test ne calcule une hauteur au doigt. La version 1.2.0 commence par là.

---

## EPIC 1 : AU DOIGT, TOUT TIENT

La densité promettait 48 pixels à la souris et au moins 44 au doigt. Au doigt, elle ne donnait rien.
Cet epic rend au téléphone ce que la charte lui promettait, et met le thème à portée du pouce.

---

### US-S01 : Toucher un contrôle à sa vraie hauteur

**En tant qu’**Aïssatou, qui tient son téléphone d’une main dans un taxi,

**Je veux** que les boutons, les champs et les lignes aient la hauteur que le produit a choisie,

**Afin de** viser sans me tromper, et de voir, pendant qu’une page charge, la forme de ce qui arrive.

**Référence SPEC :** §0.2, §5.1

**Scénario :**

Lundi 12 octobre, 7 h 50. Le taxi remonte la route du Niger. Aïssatou ouvre le Portail pour vérifier
l’heure du lendemain. Pendant une seconde, l’écran d’accueil se dessine en gris : un bloc pour
l’en-tête, un grand bloc pour la tête de sa formation, trois lignes. Avant la version 1.2.0, le
squelette d’un champ ou d’un bouton n’était qu’un trait fin, qu’on prenait pour un filet ; désormais,
chaque bloc a la hauteur exacte du bouton qui va le remplacer.

La tête arrive. « Voir ma formation » occupe toute la largeur, 48 pixels de haut ; en dessous,
« Ajouter à mon calendrier », 48 pixels aussi. Sous le titre « Mes autres formations », chaque ligne
fait 56 pixels. Le taxi freine ; son pouce tombe un peu bas, mais toujours dans le bouton.

Elle pense : « Je n’ai pas besoin de viser. »

Ce soir, chez elle, elle ouvrira AI5D Compte pour changer son mot de passe. Les champs y feront
48 pixels, eux aussi, sans que Compte ait changé une ligne : le correctif est dans le système.

**Critères d’acceptation :**

- Au doigt (`pointer: coarse`), en `equilibre`, `--hauteur-controle` vaut `48px` et `--ligne-liste` `56px` ; en `compact`, `44px` et `44px` ; en `aere`, `48px` et `64px` ; en `modere`, `44px` et `48px`
- À la souris, les quatre profils gardent exactement leurs valeurs de `1.1.0`
- Au doigt, en `equilibre`, un `Bouton` `sm` mesure 44 px, `md` 48 px, `lg` 56 px ; un `Champ` 48 px ; un bloc de `SqueletteFormulaire` 48 px ; une ligne de `min-height: var(--ligne-liste)` 56 px
- Aucune déclaration d’une feuille du système ne lit sa propre propriété ; un témoin construit sur la forme de `1.1.0` fait échouer le test
- `verifierPlancherTactile` accepte la feuille corrigée et refuse la forme de `1.1.0`, avec le message « se lit elle-meme » et la ligne fautive
- La mesure Chromium est consignée avant et après le correctif, dans les deux contextes, avec `matchMedia('(pointer: coarse)')` vérifié
- `DENSITES.md` montre la forme corrigée et explique pourquoi l’ancienne était invalide

---

### US-S02 : Régler le thème depuis le téléphone

**En tant qu’**Aïssatou, le soir, dans le noir,

**Je veux** trouver le choix du thème sur mon téléphone, avec des mots et des cibles assez grandes,

**Afin de** lire sans éblouissement, et sans attendre d’être devant un ordinateur.

**Référence SPEC :** §5.5, §5.6

**Scénario :**

Dimanche 11 octobre, 22 h 10. La chambre est éteinte. Le téléphone d’Aïssatou est en sombre, et le
Portail le suit. Mais elle veut du sombre même quand elle passera son téléphone en clair demain au
bureau, pour ce seul site.

Sur un ordinateur, le choix du thème est au pied du rail, sous son nom. Sur son téléphone, il n’y a
pas de rail. Elle fait défiler l’accueil jusqu’en bas. Sous la dernière section, un filet, puis le mot
« Thème » et trois segments côte à côte, qui occupent toute la largeur : « Clair », « Sombre »,
« Système », chacun avec son icône. Chaque segment fait 44 pixels de haut. En dessous,
« Confidentialité » et « Mentions légales ». Rien de tout cela ne passe sous la barre d’onglets : la
page s’arrête juste au-dessus.

Elle touche « Sombre ». Le segment se teinte à l’instant et son mot passe en semi-gras. La page ne se
recharge pas.

Elle pense : « Au moins, je n’ai pas eu à chercher avec une loupe. »

**Critères d’acceptation :**

- `CoquilleRail` accepte `piedContenu` et `piedCompact`, rendus dans un `<footer>` placé après `<main>`
- `piedCompact` n’apparaît que sous 768 px, en mode `complet`, et disparaît de l’arbre d’accessibilité au-delà (`display: none`)
- Quand un pied existe, la réserve de la barre basse passe sous le pied : son dernier élément reste atteignable
- Sans `piedContenu` ni `piedCompact`, la coquille rend le HTML de `1.1.0`
- Au doigt, chaque segment de `SelecteurTheme` mesure au moins 44 × 44 px ; le groupe 52 px de haut ; à la souris, rien ne change
- Avec `libellesVisibles`, les segments montrent « Clair », « Sombre », « Système », occupent toute la largeur, et n’ont plus d’`aria-label` ni de `title`
- Sous 17rem de largeur disponible, l’icône se retire et le mot reste ; captures à 320 px et dans un pied de 216 px
- Le segment coché porte `var(--surface-selection)`, `var(--action)` et la graisse semi-grasse

---

## EPIC 2 : UN LIEN A L’AIR D’UN BOUTON, ET SE CONDUIT COMME UN LIEN

Le `Bouton` du système ne savait être qu’un `<button>`. Pour mener quelque part avec son apparence,
chaque produit a fait autrement : un lien stylé à la main, sans survol ni focus, ou un bouton qui
navigue par un script. Cet epic donne une seule réponse aux deux produits.

---

### US-S03 : Rendre un lien avec l’apparence et les états d’un bouton

**En tant que** Karamo, qui réécrit la tête d’état de l’accueil du Portail,

**Je veux** poser une adresse sur un `Bouton` et obtenir un vrai lien, avec les variantes, la hauteur
et les états du bouton,

**Afin de** supprimer les six familles de liens stylés à la main, sans que la navigation, le
téléchargement ou le nouvel onglet se comportent mal.

**Référence SPEC :** §5.0.3, §5.2

**Scénario :**

Karamo ouvre `TeteMoment.tsx`. Il écrit :

```tsx
<Bouton href={`/formations/${id}`} Lien={LienSuivi} pleineLargeur>Voir ma formation</Bouton>
<Bouton variante="neutre" href={`/api/sessions/${id}/calendrier.ics`} download Lien={LienSuivi}>
  Ajouter à mon calendrier
</Bouton>
<Bouton variante="discret" href={lien} target="_blank">Rejoindre la session</Bouton>
```

Dans le navigateur, il inspecte. Le premier est un `<a>` rendu par son `LienSuivi`, avec la classe
`ai5d-bouton`, `data-variante="primaire"` et la hauteur de 48 pixels. Le deuxième est un `<a download>`
natif : le système a ignoré `LienSuivi`, parce qu’un routeur client ne télécharge pas un fichier. Le
troisième est un `<a target="_blank" rel="noopener noreferrer">`, et son nom, pour un lecteur d’écran,
se termine par « (s’ouvre dans un nouvel onglet) ».

Il passe la souris : le primaire fonce en `var(--action-survol)`. Il appuie : le bouton descend d’un
pixel. Il tabule : l’anneau bleu de 2 pixels. Il clique « Voir ma formation » du milieu de la souris :
un onglet s’ouvre, ce qu’un `<button>` n’avait jamais permis.

Il désactive le premier pour voir : plus de `href`, `role="link"`, `aria-disabled="true"`, 60 %
d’opacité, et la tabulation le saute.

Il pense : « Plus un seul bouton écrit à la main dans le Portail. »

**Critères d’acceptation :**

- Sans `href`, `Bouton` rend le même HTML qu’en `1.1.0`
- Avec `href`, `Bouton` rend le `Lien` du produit, ou un `<a>` s’il est absent, avec `className`, `style`, `data-variante` et `data-taille`
- Avec `download`, ou avec `target="_blank"`, le lien est un `<a>` natif, même si `Lien` est fourni
- `target="_blank"` complète `rel` par `noopener noreferrer`, sans doublon, et ajoute la mention hors écran « (s’ouvre dans un nouvel onglet) »
- `disabled` ou `chargement` avec `href` : aucun `href` rendu, `aria-disabled="true"` ; en chargement, `aria-busy="true"`, pleine opacité, trois points
- `type` n’est jamais transmis à un lien
- `ComposantLien` accepte tous les attributs d’un `<a>` ; `Link` de Next reste assignable
- Les survols sont gardés par `@media (hover: hover)` et par `:not([aria-disabled='true'])`

---

### US-S04 : Quitter le script qui imitait un lien

**En tant que** Compte, dont la page introuvable porte « Revenir au portail »,

**Je veux** remplacer mon composant client qui navigue par `window.location.assign` par un `Bouton`
avec une adresse,

**Afin qu’**un retour fonctionne sans JavaScript, s’ouvre dans un onglet, et que ma page reste
entièrement rendue au serveur.

**Référence SPEC :** §0.5 (n° 1), §5.2, §13.3

**Scénario :**

Dans Compte, `RetourPortail.tsx` existe pour une seule raison, écrite dans son en-tête : « le `Bouton`
du système est un `<button>`, et il lui faut un gestionnaire de clic ». C’est un composant client
minuscule, qui rend la page introuvable dépendante d’un script pour sa seule sortie. `LienInvalide.tsx`
fait la même chose, et le SDK, dans `AccesRefuse`, aussi.

Karamo monte Compte à `v1.2.0`. Sans rien changer, la vérification passe : aucun appel ne casse. Puis
il remplace le composant par une ligne dans la page :

```tsx
<Bouton href="/" pleineLargeur>Revenir au portail</Bouton>
```

Il supprime `RetourPortail.tsx`. La page redevient statique. Il désactive JavaScript dans le
navigateur et clique : la racine s’ouvre, et la redirection de Compte fait le reste, comme avant.

Il pense : « Un fichier de moins, et un bouton qui marche même quand le script ne charge pas. »

**Critères d’acceptation :**

- Un produit à `v1.1.0` qui monte à `v1.2.0` compile sans changer de code (aucun consommateur n’étend `ProprietesBouton` ni n’énumère `TonSemantique`, constaté)
- `<Bouton href="/">` est rendable par un composant serveur : `Bouton` ne déclare pas `'use client'`
- Le lien fonctionne sans JavaScript et au clic du milieu
- Le guide de montée nomme `RetourPortail.tsx:24`, `LienInvalide.tsx:56` et `AccesRefuse.tsx:126-131` comme candidats, sans les rendre obligatoires

---

## EPIC 3 : LA NAVIGATION RÉPOND DÈS L’APPUI

Sur un réseau lent, le pire n’est pas d’attendre : c’est de ne pas savoir si l’appui a été pris. Cet
epic donne aux lignes et aux onglets un état pressé immédiat, puis un état d’attente, et laisse les
onglets changer sans recharger toute la page.

---

### US-S05 : Voir une ligne réagir dès que je la touche

**En tant qu’**Aïssatou, au rond-point de Bambeto, quand le réseau tombe à presque rien,

**Je veux** voir une ligne changer d’aspect dès que mon doigt la touche, puis montrer qu’elle attend,

**Afin de** ne pas la toucher une deuxième fois en croyant que rien ne s’est passé.

**Référence SPEC :** §5.0.4, §5.9, §5.10

**Scénario :**

Mardi 13 octobre, 8 h 05, premier jour de la formation. Le taxi est arrêté au rond-point. L’icône du
réseau affiche une seule barre. Aïssatou veut relire le support envoyé la veille. Dans « Mes
ressources », trois lignes séparées par des filets fins. Elle touche « Support du jour 1 ».

Dans l’image qui suit, la ligne entière se teinte d’un bleu très pâle. Elle lève le doigt : la teinte
s’efface en un clin d’œil, et au bout de la ligne, le chevron a laissé place à trois petits points qui
montent et descendent l’un après l’autre. Deux secondes et demie plus tard, la page de ressources
arrive.

Elle remarque que les lignes de fichiers ne portent pas de chevron, mais « PDF · 2,4 Mo » sous leur
titre : elle sait ce qu’elle va télécharger avant de toucher.

Elle pense : « Il a compris, je n’ai qu’à attendre. »

**Critères d’acceptation :**

- `LigneLien` rend un seul élément interactif, de hauteur minimale `var(--ligne-liste)` (56 px en `equilibre`)
- L’appui pose `var(--surface-selection)` (#EAEFFF, #172C3B) sans transition ; le relâchement repart en `var(--mouvement-retour)`
- Au survol, pointeur fin seulement : `var(--surface-chaude)` (#F4EFE7) en clair, `var(--surface-3)` (#172C3B) en sombre
- Quand la ligne ou l’un de ses descendants porte `data-en-attente`, le chevron se retire et trois points le remplacent ; sous mouvement réduit, les points sont fixes
- Avec `download` ou `externe`, aucun chevron, et un `<a>` natif ; `externe` ajoute `rel="noopener noreferrer"` et la mention du nouvel onglet
- `metaMono` rend la méta en JetBrains Mono ; `titreEnTitre`, le titre en Fraunces 400 `var(--taille-lg)`
- `ListeLignes` rend `<ul role="list">`, un `<li>` par ligne, des filets `var(--bordure)` entre elles, et au-dessus et en dessous si `bordsExterieurs` n’est pas faux
- Les contrastes de la description sur les fonds d’état (4,51 et 5,00 à l’appui, 4,53 et 5,00 au survol) sont dans la garde

---

### US-S06 : Passer d’un onglet à l’autre sans recharger, et voir ceux qui dépassent

**En tant qu’**Aïssatou, sur la page de sa session,

**Je veux** changer d’onglet sans que toute la page se redessine, et voir qu’il reste des onglets au
bord de l’écran,

**Afin de** trouver « Attestation » sur un écran de 390 pixels, et de ne pas attendre à chaque geste.

**Référence SPEC :** §5.4

**Scénario :**

Lundi 19 octobre, 12 h 30, pause déjeuner. Sa formation est terminée depuis quatre jours. Sur la page
de la session, sous le titre, une rangée d’onglets : « Vue d’ensemble », « Annonces »,
« Ressources », et le début d’un quatrième, qui s’efface doucement vers le bord droit. Ce fondu lui
dit qu’il y en a d’autres. Elle fait glisser la rangée du pouce : « Replays », « Attestation »,
« Badge » apparaissent, et le fondu passe au bord gauche, là où « Vue d’ensemble » est sorti.

Elle touche « Attestation ». L’onglet se teinte un instant ; un trait gris clair pulse sous son nom.
Le titre, les onglets et la barre du bas ne bougent pas : seul le contenu change. Une seconde plus
tard, le trait devient le trait bleu de l’onglet actif.

Le soir, l’équipe AI5D délivre les attestations. Elle reçoit le courriel, touche « Voir mon
attestation », et arrive directement sur le cinquième onglet : la rangée est déjà défilée, et
« Attestation » est visible, en bleu, au lieu d’être caché à droite.

Le lendemain, au bureau, elle rouvre la même page sur son ordinateur de 1 280 pixels. Les six onglets
tiennent sur une ligne, et aucun fondu ne coupe le filet.

Elle pense : « Là, au moins, rien ne se cache. »

**Critères d’acceptation :**

- `OngletsRubrique` accepte `Lien` et le passe à chaque onglet ; sans lui, un `<a>`
- Six onglets se rendent ; `ONGLETS_RUBRIQUE_MIN` vaut 2 et `ONGLETS_RUBRIQUE_MAX` 6, exportés
- Le fondu n’existe que par la frise de défilement, sous `@supports (animation-timeline: scroll())` : à droite au début, aux deux bords au milieu, à gauche à la fin, et nulle part quand rien ne déborde (capture à 1 280 px)
- Aucun élément de voile n’est rendu dans le DOM
- L’onglet actif porte `scroll-initial-target: nearest` sous `@supports` ; le rembourrage de défilement le garde hors du fondu
- L’appui pose `var(--surface-selection)` sans transition ; en attente, un trait `var(--bordure-forte)` pulse (1 200 ms), fixe sous mouvement réduit ; l’onglet actif n’affiche pas de trait d’attente
- `OngletsRubrique` ne déclare pas `'use client'`
- Sans prise en charge des deux mécanismes, le rendu est celui de `1.1.0`, et le rapport de preuves le dit navigateur par navigateur

---

## EPIC 4 : L’ÉTAT SE DIT SANS COULEUR TROMPEUSE

Le vert veut dire « réussi », le bleu « à faire ». Un état qui ne dit ni l’un ni l’autre n’avait pas
de couleur à lui. Cet epic lui en donne une, et range les faits d’une preuve en colonnes lisibles.

---

### US-S07 : Lire un état au repos sans le prendre pour une réussite

**En tant qu’**Aïssatou, qui regarde où en est sa formation, puis **en tant que** Compte, qui affiche
un produit sans accès,

**Je veux** qu’un état au repos s’écrive dans un ton qui ne dit ni réussite, ni erreur, ni invitation
à cliquer,

**Afin de** ne pas confondre « inscrite » avec « réussi », et de garder le vert pour la preuve.

**Référence SPEC :** §0.5 (n° 2), §5.3

**Scénario :**

Samedi 26 septembre, 19 h 50. Aïssatou vient de rejoindre sa formation. En tête de l’accueil, une
petite pastille précédée d’un point : « Inscription confirmée », en gris chaud sur un fond de papier
à peine plus foncé. Rien de vert. Le 13 octobre, la même pastille dira « Formation en cours », en
bleu. Le 19, sur la page de vérification, et là seulement, elle verra du vert : « Attestation
valide ».

Elle pense : « Le vert, c’est quand j’ai mon attestation. »

Dans Compte, la carte d’un produit sans accès écrivait « SANS ACCÈS » en texte, parce qu’aucun ton ne
disait « rien à signaler » et que le bleu aurait invité à cliquer sur une carte qui ne mène nulle
part. Avec le ton `neutre`, Compte a désormais le choix ; sa charte dit « des lignes, pas des
badges », et la décision reste la sienne.

**Critères d’acceptation :**

- `TonSemantique` accepte `'neutre'`
- `Pastille` et `PastilleEtat` en `neutre` : texte `var(--texte-faible)` (#616F78, #8D9AA5) sur `var(--surface-chaude)` (#F4EFE7, #171F26), contraste 4,53 en clair et 5,79 en sombre, mesuré par la garde
- `Bandeau` en `neutre` : icône `Info`, `role="status"`, contour `var(--texte-faible)`, titre en texte faible, corps `var(--texte)`
- `CarteAction` accepte un état `neutre` sans changement de code
- Le ton porte toujours un mot : le composant n’existe pas sans texte
- `NOYAU.md` dit quand employer `neutre`, et quand ne jamais l’employer (un état qui attend un geste est `attention`)

---

### US-S08 : Lire les faits d’une preuve en libellés et valeurs alignés

**En tant qu’**Aïssatou, qui vérifie la page de son attestation avant de l’envoyer à un recruteur,

**Je veux** lire la session, les dates, l’organisation, la date d’émission, l’émetteur et le numéro
comme des paires alignées,

**Afin de** voir d’un coup d’œil ce que le recruteur verra, et de repérer une erreur s’il y en a une.

**Référence SPEC :** §0.5 (n° 11), §5.11

**Scénario :**

Mardi 20 octobre, 9 h 15, à son bureau. Aïssatou ouvre sa page de vérification sur l’ordinateur. Sous
son nom, les faits sont rangés en deux colonnes : en petites lettres grises, « Session », puis en
dessous, plus grand, « Orange Guinée · octobre 2026 » ; à côté, « Dates », puis « Du 13 au 15 octobre
2026, présentiel ». Plus bas, « Numéro », et « AI5D-2026-7K3F9Q » en chasse fixe, chaque caractère
bien distinct.

Le soir, elle rouvre la même page sur son téléphone : une seule colonne, chaque libellé au-dessus de
sa valeur, rien de coupé.

Elle pense : « Tout est là, et je n’ai pas à chercher. »

Dans la console de Compte, la fiche d’un compte range ses propres faits (« Adresse »,
« Identifiant », « Compte créé ») avec le même composant, au lieu d’un `<dl>` écrit à la main.

**Critères d’acceptation :**

- `ListeDefinitions` rend un `<dl>`, chaque `<dt>` et son `<dd>` groupés dans un `<div>`
- Libellé : Inter 500, `var(--taille-xs)`, `var(--texte-faible)`, casse normale ; valeur : Inter 400, `var(--taille-md)`, `var(--texte-fort)`
- `mono` rend la valeur en JetBrains Mono 500, `var(--taille-sm)`
- `colonnes={2}` passe à deux colonnes quand la liste dispose de 480 px (requête de conteneur), et reste sur une colonne sinon, y compris sans prise en charge des requêtes de conteneur
- Une valeur longue passe à la ligne, jamais hors de la colonne

---

## EPIC 5 : LES TITRES ET LE TEXTE SE TIENNENT

Un titre recopié dix fois finit par avoir dix apparences ; un paragraphe sans mesure finit par courir
sur toute la largeur d’un écran de bureau. Cet epic écrit le titre une fois, et nomme la mesure.

---

### US-S09 : Écrire un titre de section par un seul composant

**En tant que** Karamo, qui trouve huit copies d’un même `h2` dans l’accueil du Portail, puis **en
tant que** Compte, qui en porte douze,

**Je veux** écrire un titre en choisissant son niveau et sa taille, et rien d’autre,

**Afin que** tous les titres des produits AI5D aient la même police, la même graisse, le même lettrage.

**Référence SPEC :** §0.5 (n° 9), §5.8

**Scénario :**

Karamo relit `app/(connecte)/page.tsx`. Huit fois le même bloc : `fontFamily: 'var(--police-titre)'`,
une taille, parfois un interligne, et aucune graisse, si bien que le navigateur applique le gras par
défaut d’un `h2` à une Fraunces qui n’a pas été chargée en gras : un faux gras, épaissi à la main par
le navigateur. Dans Compte, douze copies du même geste, et deux d’entre elles ont oublié le lettrage.

Il écrit :

```tsx
<TitreSection niveau={2} taille="section">Mes autres formations</TitreSection>
```

À l’écran : Fraunces, graisse 400, 22 pixels, légèrement resserrée. Un intitulé de formation trop long
pour 320 pixels passe à la ligne en deux lignes équilibrées, sans jamais être tronqué. Il écrit plus
loin un titre de bloc, `niveau={3} taille="bloc"`, et un titre d’écran hors coquille, `niveau={1}
taille="ecran"`.

Il pense : « Le niveau, c’est le plan du document ; la taille, c’est l’écran. Je ne mélange plus les
deux. »

**Critères d’acceptation :**

- `TitreSection` rend `h1`, `h2` ou `h3` selon `niveau`, obligatoire
- `taille` : `ecran` `var(--taille-2xl)`, `section` `var(--taille-xl)`, `bloc` `var(--taille-lg)`
- Fraunces, `var(--graisse-normale)`, `var(--interligne-titre)`, `var(--lettrage-titre)`, `var(--texte-fort)`, marge nulle, `text-wrap: balance`, `overflow-wrap: break-word`
- Un `style` du consommateur gagne ; `id` passe
- Aucune directive client
- `EnteteRubrique`, `GabaritAuth` et `Chiffre` ne changent pas de rendu dans cette version

---

### US-S10 : Lire un texte long en lignes de longueur raisonnable

**En tant qu’**Aïssatou, qui relit le programme de sa formation sur l’ordinateur du bureau,

**Je veux** que les lignes du texte s’arrêtent à une longueur confortable,

**Afin de** ne pas perdre le début de la ligne suivante.

**Référence SPEC :** §0.5 (n° 7), §5.14.1

**Scénario :**

Vendredi 9 octobre, 16 h 40. Sur un écran de 1 280 pixels, Aïssatou lit le programme du premier jour.
Les lignes s’arrêtent vers soixante-cinq signes, même si la colonne est plus large. Son œil revient à
gauche sans chercher. Sur son téléphone, rien ne change : la ligne est déjà plus courte que la mesure.

Elle pense : « Ça se lit comme un livre, pas comme un tableau. »

**Critères d’acceptation :**

- `--mesure-texte` vaut `65ch`, dans le bloc `:root` de `jetons.css`, et ne varie ni avec le thème ni avec la densité
- Son commentaire dit qu’elle borne un **texte courant long**, pas une colonne entière
- Aucune valeur existante ne change (instantané de `1.1.0`)
- `--largeur-lecture` n’est pas ajouté ; le motif est écrit dans la SPEC

---

## EPIC 6 : LE MOUVEMENT A UN RÔLE

Une durée écrite à la main est une durée qui divergera. Cet epic nomme les mouvements par ce qu’ils
font, et dit quand une durée longue a le droit d’exister.

---

### US-S11 : Écrire une transition par son rôle

**En tant que** Karamo, qui écrit les transitions de la V2, puis **en tant que** Compte, qui a écrit
`opacity 250ms ease-out` à la main,

**Je veux** écrire « un état répond », « quelque chose arrive », « quelque chose part » plutôt qu’une
durée et une courbe,

**Afin que** tous les survols et toutes les entrées des produits AI5D aient le même tempo, et changent
ensemble le jour où il changera.

**Référence SPEC :** §0.5 (n° 8), §5.14.2

**Scénario :**

Karamo écrit la feuille d’un bandeau qui arrive après l’acceptation d’une invitation :
`transition: opacity var(--mouvement-entree)`. Il relit la feuille de `LigneLien` dans le système :
`background var(--mouvement-retour)`. Il active « Réduire les animations » dans les réglages de son
ordinateur : les deux durées tombent à 100 ms d’elles-mêmes, et le déplacement vertical de son bandeau
disparaît, parce que sa feuille le supprime sous `prefers-reduced-motion`.

Dans Compte, la ligne d’un membre retiré s’efface par `opacity 250ms ease-out`, écrit en toutes
lettres dans `Gestion.tsx`. Elle pourra écrire `var(--mouvement-sortie)`.

Il pense : « Je nomme ce que fait le mouvement ; le système décide combien de temps il dure. »

**Critères d’acceptation :**

- `--mouvement-retour` vaut `var(--duree-courte) var(--courbe-sortie)`, `--mouvement-entree` `var(--duree-moyenne) var(--courbe-entree)`, `--mouvement-sortie` `var(--duree-courte) var(--courbe-sortie)`
- Les trois ne pointent que vers des durées et des courbes existantes (test)
- Sous `prefers-reduced-motion`, leurs durées valent 100 ms par le bloc existant
- Les composants existants ne sont pas migrés : aucun rendu ne change
- `LigneLien` et les états nouveaux des onglets emploient `var(--mouvement-retour)`

---

### US-S12 : Donner au moment signature le droit de durer

**En tant que** Karamo, qui veut que la délivrance d’une attestation se remarque,

**Je veux** employer la durée longue pour un moment unique de mon produit, déclaré,

**Afin de** marquer ce moment sans enfreindre la règle qui réserve la durée longue, et sans en faire un
ornement.

**Référence SPEC :** §5.14.3

**Scénario :**

La règle du système disait : la durée longue est réservée aux confirmations qui engagent la sécurité du
compte. Compte l’emploie ainsi, pour quatre confirmations et pas une de plus. Le Portail a un moment
d’une autre nature : la première fois qu’Aïssatou ouvre son attestation, la feuille « se pose ».

Karamo lit la règle réécrite dans `jetons.css` : la durée longue sert aussi « le moment signature
unique d’un produit, déclaré par son nom dans le `DESIGN.md` de ce produit ». Il déclare « la feuille
qui se pose » dans le `DESIGN.md` du Portail, et écrit `var(--duree-longue)` : 800 ms.

Le 19 octobre au soir, Aïssatou ouvre l’onglet Attestation. La feuille glisse de huit pixels et
s’installe, en un peu moins d’une seconde. Sa collègue Kadiatou, qui a activé « Supprimer les
animations » sur son téléphone, ouvre la sienne : la feuille est simplement là, à sa place.

Il pense : « Un moment, un seul, et il a le droit de prendre son temps. »

**Critères d’acceptation :**

- Le commentaire de `--duree-longue` dans `jetons.css` et `NOYAU.md` portent la règle réécrite, mot pour mot
- La décision 006 écrit l’option écartée (un jeton `--duree-signature`) et pourquoi
- Aucun jeton `--duree-signature` n’existe
- Sous mouvement réduit, `--duree-longue` vaut `0ms` (inchangé)

---

## EPIC 7 : LE NAVIGATEUR ET LE PRESSE-PAPIERS SUIVENT

Ce que le navigateur dessine lui-même (la barre d’adresse, la sélection, le curseur) et ce qu’il
refuse parfois de faire (copier) échappaient au système. Cet epic les ramène dans le thème, et donne à
la copie une issue quand elle échoue.

---

### US-S13 : Voir le navigateur suivre le thème jusque dans la sélection

**En tant qu’**Aïssatou, qui lit le soir en thème sombre,

**Je veux** que la barre d’adresse de mon téléphone, le curseur de saisie et le texte que je
sélectionne suivent le thème,

**Afin de** ne pas voir surgir une bande blanche, et de voir ce que j’ai sélectionné.

**Référence SPEC :** §0.5 (n° 5), §5.7

**Scénario :**

Mardi 20 octobre, 21 h 40, en sombre. En haut de l’écran, la barre d’adresse du navigateur a la
couleur du papier sombre du Portail, et non un blanc qui éblouit : le Portail lui a donné
`COULEURS_NAVIGATEUR.sombre`, une valeur que le système porte parce qu’aucun produit n’a le droit
d’écrire une couleur.

Elle appuie longuement sur son numéro d’attestation, dans la fiche sombre. Le numéro se surligne en
bleu clair, les caractères passent à l’encre : lisible, et visible sur la carte. Avec l’ancienne
proposition, un bleu nuit sur une carte nuit, elle n’aurait rien vu se surligner.

Sur la page « Vérifier une attestation », elle touche le champ du numéro : le curseur clignote en
bleu.

Elle pense : « Même le surlignage est à leurs couleurs. »

**Critères d’acceptation :**

- `::selection` : fond `var(--action)` (#2251FF, #6B88FF), texte `var(--texte-sur-action)` (#FFFFFF, #051C2C)
- `caret-color: var(--action)` sur `:root`
- `color-scheme` et `accent-color` restent ceux de `1.1.0`
- Aucun `scrollbar-color` n’est posé
- `COULEURS_NAVIGATEUR` s’importe par `@ai5d/design-system/theme` et égale `--surface-1` en clair (#FAF7F2) et en sombre (#0B1620), vérifié par un test
- `noyau/couleurs-navigateur.ts` est la seule exception nominale ajoutée à la garde des couleurs du dépôt
- Captures de la sélection sur `--surface-1`, `--surface-2` et `--surface-3`, en clair et en sombre

---

### US-S14 : Copier l’adresse de mon badge, ou la sélectionner si la copie échoue

**En tant qu’**Aïssatou, qui veut envoyer l’adresse de son badge à une collègue,

**Je veux** la copier d’un geste, et, si mon téléphone refuse, la trouver déjà sélectionnée,

**Afin de** la partager dans tous les cas, sans croire à tort qu’elle est copiée.

**Référence SPEC :** §0.5 (n° 12), §5.12

**Scénario :**

Mercredi 14 octobre, 13 h 10. Dans l’onglet Badge, sous l’aperçu, un champ en chasse fixe porte
l’adresse publique de son badge, en clair. À côté, un bouton « Copier le lien ». Elle le touche. Le
bouton dit « Lien copié », avec une coche, pendant deux secondes, puis redevient « Copier le lien ».
Elle colle l’adresse dans WhatsApp.

Le lendemain, elle ouvre le Portail depuis le navigateur intégré d’une application, qui refuse l’accès
au presse-papiers. Elle touche « Copier le lien ». Aucune coche : le champ prend le focus, toute
l’adresse se sélectionne, et sous le champ s’affiche « Sélectionnez l’adresse ci-dessus pour la
copier. ». Elle utilise le menu « Copier » de son téléphone.

Elle pense : « Au moins, il ne m’a pas fait croire que c’était fait. »

Dans la console de Compte, une clé produit s’affiche une seule fois ; le même composant la montre et la
copie, avec « Sélectionnez la clé ci-dessus pour la copier. » en cas d’échec.

**Critères d’acceptation :**

- `ValeurCopiable` affiche la valeur dans un `Champ` en lecture seule, en JetBrains Mono à 16 px par défaut (pas de zoom au focus sur iOS)
- Succès : libellé `libelleSucces` (« Copié » par défaut) et icône `Check` pendant 2 000 ms, annonce polie
- Échec (promesse rejetée ou presse-papiers absent) : focus sur le champ, toute la valeur sélectionnée, `messageEchec` visible et annoncé
- `messageEchec` est obligatoire ; « Copier » et « Copié » sont les libellés par défaut
- La minuterie est nettoyée au démontage
- Le composant déclare `'use client'`
- `noyau/formulations.md` porte la formulation de référence « Sélectionnez {ce qu’il faut copier} ci-dessus pour la copier. »

---

## EPIC 8 : LA MARQUE HORS DE L’ÉCRAN

Dans le DOM, le logotype est un composant, et le « 5 » y est toujours bleu et incliné. Dans un PDF,
une image de partage ou un courriel, chaque produit l’a recomposé à sa façon, et chacun l’a trahi. Cet
epic écrit la recette une fois.

---

### US-S15 : Composer le logotype hors de l’écran, selon la marque

**En tant que** Karamo, qui redessine le PDF de l’attestation et les images de partage, puis **en tant
que** Compte, dont les courriels écrivent « AI5D » en Fraunces,

**Je veux** lire la composition du logotype dans le système : ses morceaux, leur rôle, la police,
l’inclinaison du « 5 »,

**Afin que** le « 5 » reste bleu et incliné dans un document ou une image, comme à l’écran.

**Référence SPEC :** §0.5 (n° 13), §5.13

**Scénario :**

Karamo ouvre `pdf/Logotype.tsx` dans le Portail. Il importe `LOGOTYPE` de
`@ai5d/design-system/logotype`. Trois morceaux : « AI » et « D » de rôle `lettres`, « 5 » de rôle
`cinq`. Il associe `lettres` à l’encre de son `pdf/jetons.ts` et `cinq` au bleu d’action, compose en
Inter 700, et fait pivoter le « 5 » de `LOGOTYPE.inclinaisonCinqDeg` autour de son centre. Le module ne
contient aucune couleur : les couleurs restent dans le fichier que le Portail leur réserve.

Le 19 octobre, Aïssatou télécharge son PDF. En haut à gauche : « AI5D », le « 5 » bleu et penché, comme
sur le Portail. Le recruteur qui l’imprimera en noir et blanc verra un « 5 » gris et penché, pas un
mot en serif.

Dans Compte, l’en-tête des courriels suit la même recette. Dans Gmail, le « 5 » est bleu et penché ;
dans Outlook de bureau, qui ignore les transformations, il est bleu et droit. La limite est écrite
dans le module, et ce n’est pas au système de la lever.

Il pense : « La recette est au même endroit que le composant. Ils ne peuvent plus diverger. »

**Critères d’acceptation :**

- `@ai5d/design-system/logotype` exporte `LOGOTYPE` et `nomLogotype`, depuis `noyau/logotype.ts`, module pur
- `LOGOTYPE` : trois morceaux dans l’ordre « AI », « 5 », « D », rôles `lettres`, `cinq`, `lettres` ; Inter 700 ; lettrage -0.02 em ; inclinaison -5 degrés ; nom de produit en Fraunces 300, échelle 0,92, écart 0,42 em
- Le module ne contient aucune couleur, ni valeur ni nom de jeton
- `Logotype.tsx` lit `LOGOTYPE` et se rend exactement comme en `1.1.0`
- `LOGOTYPE.lettrageEm` égale `--lettrage-marque` (test)
- Le champ `exports` de `package.json` porte `./logotype`, et un test vérifie que chaque chemin exporté existe
- Le tracé vectoriel n’est pas livré ; la SPEC dit pourquoi et où il ira

---

## EPIC 9 : UNE VERSION QUI SE PROUVE AVANT DE SE PUBLIER

Une étiquette du système arrive dans tous les produits qui la montent. Cet epic dit ce qu’il faut avoir
vu avant de la poser, et ce qu’un produit doit savoir en montant.

---

### US-S16 : Prouver la version au navigateur avant d’en poser l’étiquette

**En tant que** Karamo, qui publiera `v1.2.0` pour tous les produits,

**Je veux** une mesure dans un vrai navigateur, des captures à la souris et au doigt, une vérification
verte, et que l’étiquette ne se pose qu’avec mon accord,

**Afin de** ne publier à tous les produits que ce qui a été vu.

**Référence SPEC :** §5.1.4, §10, §11, §14

**Scénario :**

Avant la première ligne du correctif, Karamo lance la mesure dans Chromium, sur le spécimen. À la
souris : `48px`, `56px`. Au doigt, après avoir vérifié que `pointer: coarse` est vrai : deux valeurs
vides, un bloc de 21 pixels, une ligne de 18. Il recopie la sortie telle quelle dans
`docs/preuves/1.2.0/plancher-tactile.md`.

À la fin du lot, la même mesure rend `48px`, `56px`, des blocs de 48 et 56 pixels. Il lance la
vérification d’un seul bloc ; elle passe, et il la recopie. Il prend les captures des spécimens en clair
et en sombre, à la souris et au doigt, les onglets aux trois positions de défilement, la sélection sur
les trois surfaces. Il écrit ce qui n’est pas couvert : Safari, faute d’appareil ; le fondu et l’onglet
initial hors de Chromium, s’ils n’ont pas été constatés.

Puis vient la question, posée en nommant ce qui sera publié : les cinq différences à l’écran, les
ajouts, la mineure proposée. Karamo tranche le classement, valide la sélection bleue sur les captures,
et répond oui. L’étiquette `v1.2.0` est posée sur le commit vérifié, et poussée.

Il pense : « Je sais ce que chaque produit recevra, parce que je l’ai vu. »

**Critères d’acceptation :**

- La mesure du plancher est consignée avant et après, sortie brute, deux contextes, quatre profils
- Les captures du §11.2 de la SPEC existent dans `docs/preuves/1.2.0/`
- `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test` est vert d’un seul bloc, sortie recopiée ; aucun `build`
- Le rapport porte « Ce qui n’est pas couvert »
- `CHANGELOG.md`, `README.md` et `NOYAU.md` disent `1.2.0` et trente-neuf composants ; la garde documentaire le confirme
- Les points ouverts de la SPEC (§0.8) sont tranchés par Karamo avant l’étiquette
- L’étiquette `v1.2.0` n’est posée et poussée qu’après son accord explicite ; aucune étiquette publiée n’est déplacée
- Aucun commit, aucune description, aucun fichier ne porte de co-auteur ni de mention d’outillage

---

### US-S17 : Monter de version en sachant ce qui change à l’écran

**En tant que** Compte, installé en `v1.1.0`,

**Je veux** lire, avant de monter, ce qui change à l’écran sans que j’écrive une ligne, et ce que je
peux adopter si je le veux,

**Afin de** ne rien découvrir en production.

**Référence SPEC :** §12, §13

**Scénario :**

Karamo ouvre le journal des changements du système. En tête de l’entrée `1.2.0`, cinq lignes sous
« Ce qui change à l’écran, sans une ligne de code dans le produit » : la hauteur au doigt, la
sélection, le sélecteur de thème au doigt, le survol qui ne colle plus, le fondu des onglets. Puis les
ajouts, tous facultatifs.

Il remplace l’étiquette dans `apps/compte/package.json`, installe, lance la vérification de Compte :
elle passe, sans une ligne changée. Il ouvre Compte sur son téléphone : les boutons de la page de
connexion font 48 pixels, là où ils en faisaient 44 depuis toujours. Sur une tablette, dans le pied du
rail, les segments du thème sont plus grands. Rien d’autre n’a bougé : la coquille, sans pied, rend le
même HTML.

Il garde le tableau de la SPEC (§13.3) pour les sprints suivants de Compte : `RetourPortail`,
`CopierValeur`, `LigneCompte`, les douze titres.

Il pense : « Cinq différences, toutes annoncées, et aucune ne casse quoi que ce soit. »

**Critères d’acceptation :**

- L’entrée `1.2.0` du journal commence par « Ce qui change à l’écran », cinq points, puis les ajouts, la règle réécrite et la compatibilité
- Un produit à `v1.1.0` monte sans changer de code : typecheck, lint et tests de Compte verts après la seule montée, constatés avant l’étiquette sur une installation locale du système, sans commit dans Compte, et consignés dans `docs/preuves/1.2.0/montee-compte.md` (sinon écrits comme non couverts)
- La garde `verifierPlancherTactile`, lancée par un produit sur la feuille installée, passe
- Le guide de montée donne le geste commun, puis ce qui concerne le Portail (depuis `v1.0.1`), Compte (depuis `v1.1.0`) et le SDK
- Chaque adoption proposée à Compte cite le fichier et la ligne qu’elle remplacerait

---

**Note :** les pièces que la console du Portail demandera ensuite (table de données, menus d’actions,
compteur des onglets, injection unique des feuilles, `--surface-survol`) relèvent de la version `1.3.0`
et de sa propre paire SPEC et user stories. Elles ne sont pas racontées ici.
