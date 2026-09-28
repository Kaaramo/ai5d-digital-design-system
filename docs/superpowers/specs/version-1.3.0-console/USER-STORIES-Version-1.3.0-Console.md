# USER STORIES · Version 1.3.0 : ce qui manque au système pour la console

**Projet :** AI5D Digital Design System (`@ai5d/design-system`) · **Date :** 28 septembre 2026
**Spécification compagnon :** [`SPEC-Version-1.3.0-Console.md`](SPEC-Version-1.3.0-Console.md)
**Codification :** US-C01 à US-C15, huit epics

---

## PRÉAMBULE : UN OPÉRATEUR, UNE PARTICIPANTE, ET TROIS PRODUITS

Un système de design a deux sortes d’utilisateurs, et ils ne se rencontrent jamais.

**Les premiers sont des produits.** Trois d’entre eux traversent ces histoires.

- **Karamo, qui intègre la console du Portail** (sprint P10). Il a demandé treize pièces au système.
  Il sait déjà que la règle du dépôt en refusera une partie : un composant monte quand un deuxième
  produit en a besoin, et la console n’est pas un deuxième produit, c’est le même. Ce qu’il veut, c’est
  une réponse nette pour chaque pièce, et, pour celles qui restent chez lui, la certitude qu’il les
  écrit une fois, sur les jetons, avec une API qui pourra monter.
- **Le SDK `@ai5d/auth`**, qui construit le menu de compte de chaque produit sur les composants du
  système. Son menu est écrit à la main : il ne se parcourt pas au clavier, ne se referme ni par Échap
  ni en touchant à côté, et sa largeur est en pixels. C’est lui, cette fois, le deuxième consommateur
  que la règle exige.
- **Compte**, le premier produit à avoir consommé le système. Son dépôt n’était pas ouvert quand ce
  document a été écrit : ce qu’on sait de lui vient de la SPEC P10, et se revérifie avant d’en tirer
  une conséquence.

**Les seconds sont des personnes**, qui ne sauront jamais qu’un système existe.

**Karamo, opérateur.** Le même Karamo, un autre métier : administrateur AI5D, au bureau, sur un écran
de 1 280 pixels, parfois de 1 024. Il tient trois sessions en parallèle. Mardi 13 octobre 2026, celle
qui l’occupe s’appelle « Prompt Engineering, Cohorte n° 5 » : 237 personnes, dont 212 inscrites,
25 jamais invitées, 8 invitations envoyées et non acceptées. Il travaille beaucoup au clavier. Le soir,
son écran est en thème sombre.

**Aïssatou Camara**, responsable de la relation client chez Orange Guinée, participante. Elle lit tout
sur un téléphone Android de 390 pixels, et, le week-end, sur une tablette. Elle ouvre de temps en
temps le menu de son compte AI5D, en haut d’un produit.

Ce que ni l’un ni l’autre ne sait, et que ce document raconte : sur la page des participants de la
console, chaque bouton de chaque ligne pose sa propre copie de la feuille de style des boutons. Cinq
cents lignes, deux boutons chacune : mille balises identiques, et mille fois le même identifiant dans
un document qui n’en admet qu’un. La version 1.3.0 commence par là.

---

## EPIC 1 : UNE FEUILLE PAR COMPOSANT, QUELLE QUE SOIT LA LONGUEUR DE LA PAGE

Chaque composant qui a des états pose sa feuille devant lui, à chaque rendu. Cet epic la pose une
fois par document, sans qu’un produit change une ligne.

---

### US-C01 : Une table de cinq cents lignes ne pose qu’une feuille par composant

**En tant que** Karamo, qui intègre la table des participants de la console,

**Je veux** qu’une page qui rend cinq cents boutons ne contienne qu’une feuille des boutons,

**Afin d’**avoir un HTML valide, et une page qui reste légère sur le réseau du bureau de Conakry,
qui n’est pas toujours bon.

**Référence SPEC :** §0.4, §5.1, §10

**Scénario :**

Avant d’écrire la table, Karamo compte. Il rend au serveur cinq cents boutons avec la `1.2.0` : cinq
cents balises `<style>` dans le HTML. Il recopie la sortie dans `docs/preuves/1.3.0/feuilles.md`.

Le lot fait passer chaque feuille par une seule fonction, `feuille(id, css)`, qui pose `href` et
`precedence`. Il refait le compte : au serveur, **une** balise, dont `data-href` vaut
`ai5d-bouton ai5d-champ` ; au client, une balise dans `<head>`, aucune dans le conteneur. Dans
Chromium, sur le spécimen, `document.querySelectorAll('style')` rend le même compte.

Il ouvre la console sur son poste, onglet Participants de la cohorte n° 5. Rien n’a bougé à l’écran.
Le document, lui, a perdu quelques centaines de balises.

Il pense : « La table peut grandir. La feuille, non. »

**Critères d’acceptation :**

- Aucun composant du système ne rend de `<style>` sans `href` ni `precedence` ; la garde `verifierFeuilleUnique` le prouve sur `noyau/composants/`
- Cinq cents `Bouton` rendus au client posent une seule feuille `ai5d-bouton`, dans `document.head`, aucune dans le conteneur
- `renderToString` de cinq cents `Bouton` et d’un `Champ` rend une seule balise `<style`, dont `data-href` liste les deux clés ; un sélecteur `>` y reste intact
- Les feuilles partagées (`ai5d-boite`, `ai5d-hors-ecran`, `ai5d-champ`) restent une seule feuille chacune
- La balise anonyme de `GabaritApp` n’existe plus
- Les constantes `STYLE_…` gardent leur nom et leur forme ; `pnpm specimens` régénère la page
- Le compte avant et après est consigné, au serveur, au client et dans Chromium ; décision 010 écrite

---

### US-C02 : Monter de version sans découvrir après coup où la feuille est passée

**En tant que** Compte, puis le Portail, installés en `v1.2.0`,

**Je veux** lire, avant de monter, que les feuilles du système ont quitté le conteneur de leur
composant, et ce que cela change pour mes tests et mes feuilles,

**Afin de** ne rien découvrir en production, ni dans une suite rouge sans explication.

**Référence SPEC :** §5.1.3, §5.1.7, §12, §13

**Scénario :**

Karamo ouvre le journal. En tête de l’entrée `1.3.0`, sous « Ce qui change à l’écran » : une feuille
par composant, dans `<head>`. Sous « Compatibilité » : la feuille n’a plus d’`id`, et un test qui la
lisait dans son conteneur la lit désormais par `style[data-href~="ai5d-…"]`.

Dans une copie de travail du Portail, il remplace le système par une installation locale de ce dépôt
et lance la vérification du Portail, sans changer une ligne. Deux tests du Portail lisent une feuille
dans leur conteneur ; ce sont les feuilles du Portail lui-même, qui n’ont pas bougé. La suite passe.
Il consigne la sortie dans `montee-portail.md`, puis rend la copie à son état. Il fait de même pour le
SDK, puis pour Compte, dont il a le dépôt.

Il relit la règle de cascade du §5.1.3 : les utilitaires de Tailwind vivent dans une couche et
perdent contre les feuilles du système quel que soit l’ordre ; seule une règle de classe hors couche,
de même spécificité, pourrait voir l’ordre s’inverser. Le Portail n’en a aucune.

Il pense : « Je sais ce qui a bougé, et pourquoi rien ne casse. »

**Critères d’acceptation :**

- L’entrée `1.3.0` du journal dit la nouvelle place des feuilles, l’absence d’`id` et la façon de les lire dans un test
- Les montées d’essai du Portail, du SDK et de Compte, sans changement de code, sont consignées avant l’étiquette, ou écrites comme non couvertes
- Pour le Portail, une page de la console rendue sur le poste et son compte de balises sont consignés
- Le guide de montée dit la règle de cascade et les deux cas où l’ordre compte
- Aucun composant existant ne prend `'use client'` ; aucune dépendance n’est ajoutée

---

## EPIC 2 : LE MENU D’UNE LIGNE

Une ligne de la console porte une action visible, celle que son état appelle ; les autres gestes
passent dans un menu. Ce menu doit se tenir au clavier comme à la souris, et ranger à part ce qui
défait. Le SDK a le même besoin, écrit à la main, pour le menu de compte.

---

### US-C03 : Ouvrir le menu d’une ligne, le parcourir aux flèches, le refermer par Échap

**En tant que** Karamo, opérateur, qui corrige des adresses au clavier,

**Je veux** ouvrir le menu d’une ligne, choisir une action aux flèches et à Entrée, et revenir où
j’étais si je renonce,

**Afin de** corriger une adresse sans reprendre la souris.

**Référence SPEC :** §5.3.2, §5.3.4, §8

**Scénario :**

Mardi 13 octobre, 9 h 20. Une personne a mal écrit son adresse. Karamo tape son nom dans la recherche
de la table, descend à la ligne, tabule jusqu’au bouton à trois points. Son lecteur d’écran, qu’il
fait tourner ce matin pour la recette, annonce « Actions pour Aïssatou Camara, bouton de menu,
réduit ».

Il appuie sur Entrée. Le menu s’ouvre sous le bouton, au-dessus de la table, sans être coupé par le
bord de celle-ci, qui défile à 1 024 pixels. Le focus est déjà sur « Corriger l’adresse ». Flèche bas :
le focus saute le filet et arrive sur « Retirer de la session », en rouge. Il se ravise : Échap. Le
menu se referme, le focus est revenu sur les trois points de la même ligne.

Il rouvre, choisit « Corriger l’adresse » par Entrée. Le menu se referme, le focus revient au
déclencheur, puis la boîte de confirmation s’ouvre. Quand il l’aura fermée, le focus reviendra là, sur
la ligne qu’il traitait.

Il pense : « Je n’ai pas eu à chercher mon curseur. »

**Critères d’acceptation :**

- Le déclencheur porte `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` et, sans `declencheur`, `aria-label` égal à `libelle`
- Entrée, Espace et flèche bas ouvrent sur le premier élément ; flèche haut sur le dernier
- Dans le menu, les flèches bouclent et sautent le filet ; Début et Fin vont aux extrémités ; un seul élément porte `tabindex="0"`
- Échap et Tab referment et rendent le focus au déclencheur ; le composant gère Échap lui-même
- Choisir un geste referme le menu, rend le focus, **puis** appelle `onChoisir`
- Le menu vit dans la couche supérieure (`popover="auto"`) : aucun conteneur à défilement ne le coupe
- Le comportement au clavier et au clic extérieur est constaté dans Chromium, Firefox et WebKit, et consigné ; les tests jsdom doublent `showPopover` et le disent en tête de fichier

---

### US-C04 : Les gestes qui défont sont rangés à part

**En tant que** Karamo, opérateur, devant une liste d’attestations délivrées,

**Je veux** que « Révoquer » soit séparé des autres gestes par un filet, en rouge, et toujours en bas,

**Afin de** ne pas révoquer une attestation en visant « Voir la page de vérification ».

**Référence SPEC :** §5.3.3, §5.3.5

**Scénario :**

Vendredi 16 octobre, 18 h. Karamo vérifie une attestation délivrée le matin. Il ouvre le menu de la
ligne : « Voir la page de vérification » en premier, un filet fin, puis « Révoquer » en rouge. Il
clique sur le premier : la page publique s’ouvre dans un nouvel onglet. Son lecteur d’écran avait dit
« (s’ouvre dans un nouvel onglet) » avant qu’il clique.

Sur une ligne encore à délivrer, le menu ne porte que « Bloquer » : aucun filet, puisqu’aucun geste
grave ne suit. Sur une ligne d’accès retiré, il n’y a pas de bouton à trois points du tout : un menu
vide serait un bouton qui n’ouvre rien.

Il pense : « Le rouge est toujours au même endroit. »

**Critères d’acceptation :**

- Les actions non graves suivent l’ordre reçu ; les graves viennent après, dans l’ordre reçu, précédées d’un `role="separator"`
- Aucun filet quand aucune action n’est grave ; rien n’est rendu quand il n’y a aucune action
- Un geste grave est en `var(--erreur)` et son anneau de focus aussi ; son libellé nomme le geste, la couleur n’est jamais seule
- Une action en lien passe par `Lien` ; un nouvel onglet est un `<a target="_blank">` natif, `rel="noopener noreferrer"`, avec la mention hors écran
- Une action est un lien **ou** un geste, jamais les deux (union de types)

---

### US-C05 : Le menu de compte se referme quand on touche à côté

**En tant qu’**Aïssatou, sur son téléphone, puis le SDK `@ai5d/auth`, qui écrit ce menu,

**Je veux** que le menu de mon compte se referme quand je touche ailleurs, et qu’il ne déborde pas de
l’écran,

**Afin de** ne pas rester devant un menu ouvert qui cache la page.

**Référence SPEC :** §0.6 (n° 4), §5.3.8, §13.4

**Scénario :**

Samedi 17 octobre, 11 h. Aïssatou ouvre un produit AI5D sur son téléphone et touche son nom en haut
de l’écran, pour vérifier ses accès. Le menu s’ouvre : « Mon compte », « Mes accès », « Se
déconnecter ». Elle change d’avis et touche la page, à côté. Aujourd’hui, avec le menu écrit à la main
dans le SDK, rien ne se passe : le menu reste ouvert jusqu’à ce qu’elle retouche son nom.

Quand le SDK aura adopté `MenuActions`, dans une version à lui, le menu se refermera au premier
toucher extérieur, se parcourra au clavier sur un ordinateur, et sa largeur suivra le texte, bornée
en `rem` et non en pixels.

Ce lot ne touche pas le SDK. Il livre le composant qui le permet, avec la propriété `declencheur`
qu’un menu de compte demande : un nom visible, l’avatar à côté, et aucun `aria-label` qui ferait
entendre autre chose que ce qui est écrit.

**Critères d’acceptation :**

- `MenuActions` accepte `declencheur` : le contenu visible devient le nom du bouton, sans `aria-label`
- Un toucher ou un clic hors du menu le referme, par la fermeture légère de `popover="auto"`, constatée au navigateur
- La largeur du menu est bornée en `rem` (12 à 20) ; le texte passe à la ligne, jamais tronqué
- Au doigt, chaque élément mesure au moins 44 px (`--hauteur-controle` relevée au plancher)
- Le guide de montée propose au SDK l’adoption de `UserButton.tsx:100-139`, sans l’imposer ; la montée d’essai du SDK est consignée

---

## EPIC 3 : LE SURVOL NE MENT PLUS

Le survol n’avait pas de jeton. Deux composants l’écrivaient à la main, et en sombre il valait
exactement l’appui et la sélection. Cet epic lui donne un nom, une valeur par thème, et une portée
écrite.

---

### US-C06 : Distinguer une ligne survolée d’une ligne sélectionnée, en sombre

**En tant que** Karamo, opérateur, le soir, en thème sombre,

**Je veux** que la ligne sous ma souris ne ressemble pas aux lignes que j’ai cochées,

**Afin de** savoir, avant de cliquer, ce que la barre d’actions groupées va toucher.

**Référence SPEC :** §0.5, §5.2, §6

**Scénario :**

Mardi 13 octobre, 21 h 30. Karamo a coché trois personnes dans la table des participants, qui ont pris
le fond de sélection. Il passe la souris sur une quatrième ligne. Avec un survol en `--surface-3`, elle
aurait pris exactement le même fond que les trois autres ; il aurait fallu regarder la case pour savoir.
Désormais, la ligne survolée se creuse d’un cran, vers le fond de la page, pendant que les lignes
sélectionnées restent éclairées.

Dans le menu d’une ligne, posé sur `--surface-3`, l’élément survolé se creuse de la même façon ; avec
l’ancien survol, il aurait été invisible.

En clair, le lendemain matin, le survol prend la surface chaude. Il ne se distingue de la sélection
que par la teinte, chaude contre bleutée : c’est la case cochée qui porte l’état, et elle le porte
dans les deux thèmes.

Karamo regarde les captures côte à côte et valide la valeur sombre. Il accepte aussi, sur ses
captures avant et après, que le rail de tous les produits passe au même jeton.

**Critères d’acceptation :**

- `--surface-survol` vaut `var(--surface-chaude)` en clair et `var(--surface-1)` en sombre, dans les quatre blocs de thème
- Sa portée est écrite : un élément posé sur `--surface-2` ou `--surface-3` ; `LigneLien`, posée aussi à même la page, garde ses règles
- La garde de contraste mesure les textes du §5.2.2 sur le jeton ; `--attention` en clair (4,39) y est un témoin qui doit rester sous 4,5, et `NOYAU.md` interdit la paire
- Aucune valeur de jeton existante ne change (instantané de `1.2.0`)
- Captures d’une ligne survolée et d’une ligne sélectionnée côte à côte, d’un menu survolé et du rail, en clair et en sombre ; validées par Karamo
- `LiensRail` migré, ou laissé tel quel, selon la décision de Karamo ; décision 011 écrite

---

## EPIC 4 : L’EN-TÊTE DIT OÙ L’ON EST, ET CE QUI ATTEND

Un en-tête de rubrique qui porte son action sans couper son filet, et des onglets qui comptent le
travail en attente. L’en-tête d’objet, qui dépend d’un constat dans Compte, est à l’epic 7.

---

### US-C07 : Poser l’action d’une rubrique à droite de son titre

**En tant que** Karamo, qui intègre le registre des formations,

**Je veux** passer « Nouvelle formation » à l’en-tête de la rubrique et la voir à droite du titre,

**Afin qu’**elle ne soit plus posée dans une rangée qui coupe le filet de l’en-tête.

**Référence SPEC :** §5.5

**Scénario :**

Dans la V1, le bouton « Nouvelle formation » vivait dans une rangée à côté de l’en-tête, et le filet
s’arrêtait sous le titre. Karamo écrit
`<EnteteRubrique icone={BookOpen} titre="Formations" intention="…" action={<Bouton href="/admin/formations/nouvelle" Lien={Link}>Nouvelle formation</Bouton>} />`.

À 1 280 pixels, le bouton est sur la rangée du titre, à droite ; l’intention dessous ; le filet sous
le tout, d’un bord à l’autre. À 1 024 pixels, avec un titre plus long, le bouton passe sous le titre,
toujours au-dessus du filet.

Dans l’espace participant, où aucune rubrique ne passe d’action, le HTML est celui de la 1.2.0, au
caractère près.

**Critères d’acceptation :**

- `EnteteRubrique` accepte `action` ; son type est exporté, `ProprietesEnteteRubrique`
- Avec `action`, la rangée du titre passe en `flex-wrap` et l’action se range à sa fin ; le filet reste sous l’en-tête entier
- Sans `action`, le HTML est celui de la 1.2.0 (instantané `EnteteRubrique-1.2.0`)
- L’action suit le `h1` dans l’ordre du document

---

### US-C08 : Voir sur un onglet le nombre de choses qui m’y attendent

**En tant que** Karamo, opérateur, qui arrive sur une session,

**Je veux** lire sur l’onglet Participants qu’il y reste 25 personnes à traiter, et sur Ressources
que deux supports attendent leur publication,

**Afin d’**aller droit à l’onglet où il reste un geste.

**Référence SPEC :** §5.6

**Scénario :**

Lundi 12 octobre, veille de la cohorte n° 5. Sous l’en-tête de la session, six onglets sans icône.
Sur « Participants », une petite pastille grise : 25. Sur « Ressources », 2 : deux supports déposés,
pas encore publiés. Les autres onglets n’en portent pas : il n’y reste rien à faire. Le vendredi
suivant, la session terminée, c’est « Attestations » qui portera son compteur.

Son lecteur d’écran lit « Participants, 25 à traiter, lien ». Il ne lit pas « 25 » deux fois. Sur
l’onglet actif, la pastille reste grise : l’onglet actif se dit déjà par sa couleur, sa graisse et
son trait.

**Critères d’acceptation :**

- Chaque onglet accepte `compteur` ; le composant accepte `libelleCompteur`, le même pour tous les onglets
- Le compteur est une `Pastille` `neutre`, `aria-hidden`, en chiffres tabulaires, formatée par `Intl.NumberFormat('fr-FR')`
- Le nom accessible est « {libelle}, {nombre} {libelleCompteur} » ; sans `libelleCompteur`, « {libelle}, {nombre} »
- Zéro s’affiche quand il est passé ; rien ne s’affiche sans compteur
- La hauteur de l’onglet reste 44 px ; le débordement et le fondu de la 1.2.0 s’appliquent

---

## EPIC 5 : LES CHIFFRES SE LISENT EN PHRASE

---

### US-C09 : Lire le pouls d’une session en trois phrases qui mènent à la liste filtrée

**En tant que** Karamo, opérateur,

**Je veux** lire sous l’en-tête d’une session « 212 inscriptions sur 237 personnes », « 8 invitations
non acceptées », « Délivrance à partir du 15 octobre », chacune menant à la liste qu’elle compte,

**Afin de** savoir où en est la session sans ouvrir ses onglets.

**Référence SPEC :** §5.7

**Scénario :**

Le pouls tient sur une ligne à 1 280 pixels. Chaque indicateur est un chiffre en Fraunces, à la
taille d’un titre de bloc, suivi de son libellé en Inter, sur la même ligne de base : il se lit comme
une phrase, pas comme une tuile. Le libellé est bleu : c’est un lien. Au survol, il se souligne. Karamo
clique sur « 8 invitations non acceptées » : la table s’ouvre, filtrée.

Sur le tableau de bord, une rangée de six indicateurs du même dessin ; ceux qui ne mènent nulle part
ne sont ni bleus ni soulignés au survol : ils ne promettent pas un déplacement. Pendant la seconde où
la page charge, six blocs gris d’une ligne, à la forme de la rangée, et non six tuiles de cinq
centimètres qui promettraient autre chose.

**Critères d’acceptation :**

- `Chiffre` accepte `compact` ; en compact, `href` et `Lien` ; `cible` et `mise` restent à la tuile (union de types) ; les appels existants compilent
- La valeur est en `var(--police-titre)`, `var(--taille-lg)`, graisse normale, chiffres tabulaires ; le libellé en Inter `var(--taille-sm)`
- En lien : libellé en `var(--action)`, souligné au survol (gardé par `(hover: hover)`), anneau de focus, appui sans transition ; sans lien : ni l’un ni l’autre
- `SqueletteIndicateurs` accepte `compact` et rend une rangée de blocs d’une ligne ; sans `compact`, la forme de la 1.2.0

---

## EPIC 6 : LE RETOUR D’UN GESTE

---

### US-C10 : Fermer un retour quand je l’ai lu, et y être ramené quand le bouton que je tenais disparaît

**En tant que** Karamo, opérateur,

**Je veux** un bandeau de retour qui porte une action, qui se ferme quand je l’ai lu, et qui reçoit le
focus quand l’élément que je tenais disparaît,

**Afin de** ne jamais perdre le fil de mon geste.

**Référence SPEC :** §0.6 (n° 10), §5.4

**Scénario :**

Karamo sélectionne les 25 personnes à inviter et appuie sur « Inviter les 25 personnes jamais
invitées » dans la barre d’actions groupées. L’envoi part. La barre disparaît avec la sélection, et le
bouton qu’il avait sous le focus avec elle. Le focus passe au bandeau vert, en haut de la table :
« 23 invitations envoyées. 2 ne sont pas parties… », avec « Voir les 2 envois échoués » à droite, puis
une croix. Son lecteur d’écran l’annonce, parce que le ton `attention` pose `role="alert"`.

Le bandeau lui-même est celui du système. Ce qui l’accroche en haut de la colonne pendant le
défilement, ce qui le remplace au geste suivant et ce qui y ramène le focus, c’est la région de
retour du Portail : des règles de la console, que le système ne connaît pas.

Il clique sur la croix, nommée « Fermer ce message ». Le Portail retire le bandeau.

**Critères d’acceptation :**

- `Bandeau` accepte `onFermer`, `libelleFermer` (« Fermer ce message » par défaut) et `ref`
- Le bouton de fermeture n’existe qu’avec `onFermer` : `Bouton` `discret` `sm`, icône `X` de 16 px, après l’action
- `ref` et `tabIndex={-1}` sont transmis à la racine ; un anneau `:focus-visible` de 2 px en `var(--action)` s’y dessine
- Le rôle suit le ton, inchangé ; le système ne ferme jamais le bandeau de lui-même
- Sans `onFermer`, le rendu visuel est celui de la 1.2.0

---

## EPIC 7 : CE QUI MONTE SOUS CONDITION, ET CE QUI RESTE AU PORTAIL

Deux pièces montent si Compte en confirme le besoin, fichier et ligne ; un correctif passe si la
mesure le confirme ; tout le reste demeure au Portail, avec l’API que P10 a proposée.

---

### US-C11 : Un en-tête qui dit l’objet, son état, sa suite et son pouls

**En tant que** Karamo, opérateur, sur n’importe quel onglet d’une session,

**Je veux** un en-tête identique partout : le chemin de retour, le nom de la session, sa phase, ses
dates et son lieu, l’action qui la fait avancer, son menu, et son pouls,

**Afin de** ne pas recomposer l’état de la session onglet par onglet.

**Référence SPEC :** §0.6 (n° 5), §5.8

**Scénario :**

Avant d’écrire une ligne, Karamo ouvre `apps/compte/components/EnteteConsole.tsx` dans Compte, et
cite la ligne où l’en-tête pose son fil et son action unique. Le constat est là : `EnteteObjet` monte.
S’il ne l’avait pas été, le composant se serait écrit dans le Portail avec la même API, et la ligne de
ce document l’aurait dit.

Sur la session : « Sessions › Prompt Engineering », en bleu, petit, au-dessus ; le titre « Cohorte
n° 5 » en Fraunces, la pastille « En cours » à côté, et, au bout de la rangée, le bouton à trois
points des « Actions de la session ». Dessous, les dates « Du 13 au 15 octobre 2026, heure de
Conakry » et « Présentiel, Conakry », chacune avec son icône. Puis le pouls. Un filet ferme le tout.

**Critères d’acceptation :**

- La revérification dans Compte est consignée, fichier et ligne ; le composant monte, ou sort du lot avec son motif
- Un seul `h1`, rendu par `TitreSection` ; le fil est une `nav` nommée « Fil d’Ariane » avec un `ol`, sans `aria-current`, par `Lien`
- L’état suit le titre ; l’action et le menu se rangent à la fin de la même rangée, et passent dessous quand elle ne les tient plus
- Les métadonnées sont une liste ; leurs icônes de 16 px sont décoratives
- Un filet `--bordure` ferme l’en-tête

---

### US-C12 : Un sélecteur natif aux jetons du système

**En tant que** Compte, qui écrit son propre sélecteur,

**Je veux** un `Selecteur` du système, natif, qui réagit comme `Champ`,

**Afin de** cesser d’écrire un sélecteur par produit, avec des états qui divergent.

**Référence SPEC :** §0.6 (n° 13), §5.9

**Scénario :**

Au plan, Karamo ouvre `apps/compte/components/Selecteur.tsx` et cite sa ligne. Le besoin est
constaté : le `Selecteur` du Portail monte, avec son API inchangée. Posé sous un `Champ`, il a la
même bordure, le même survol, le même anneau, et une seule feuille pour les deux. Sur un téléphone, il
ouvre la liste native du système d’exploitation.

S’il ne l’avait pas constaté, le sélecteur serait resté dans le Portail, et ce document l’aurait dit.
Les trois autres champs du Portail, eux, restent chez lui : aucun autre produit n’en a montré le
besoin.

**Critères d’acceptation :**

- La revérification dans Compte est consignée ; `Selecteur` monte ou sort du lot, avec son motif
- S’il monte : un `<select>` natif, API du Portail inchangée, `aria-describedby` vers l’erreur puis l’aide, erreur en `role="alert"`, classe `ai5d-champ__entree`, feuille `ai5d-champ` partagée avec `Champ`, `'use client'`
- `CaseACocher`, `ChoixSegmente` et `ZoneTexte` ne montent pas ; le §16 le dit

---

### US-C13 : Que la page s’arrête où le contenu s’arrête

**En tant qu’**Aïssatou, sur sa tablette, le week-end,

**Je veux** que la dernière section de la page ne soit pas suivie d’une bande vide de la hauteur d’une
barre qui n’est plus là,

**Afin de** ne pas faire défiler un vide pour rien.

**Référence SPEC :** §0.7, §5.10

**Scénario :**

En relisant les feuilles pour les hisser, le lot a vu que la coquille pose la réserve de la barre
basse en style en ligne, puis tente de la remettre à zéro au palier tablette par une règle de
feuille, qui perd toujours contre le style en ligne. Au-delà de 768 pixels, la barre basse disparaît,
mais sa réserve resterait.

Avant de corriger quoi que ce soit, Karamo mesure, dans Chromium, à 1 280 pixels : la valeur calculée
de la réserve et le rembourrage bas du contenu. Si la réserve vaut encore la hauteur de la barre, le
correctif passe dans la feuille, et la mesure « après » est consignée. Si elle vaut zéro, le constat
était faux ; il est consigné comme tel, et rien ne change.

**Critères d’acceptation :**

- La mesure « avant » est consignée, à 390 et à 1 280 px, dans `reserve-basse.md`
- Si elle confirme le constat : aucune `--reserve-barre` en style en ligne dans `CoquilleRail` ni `GabaritApp` ; la réserve est posée par la feuille et remise à zéro au palier tablette ; mesure « après » consignée ; décision 013
- Sous 768 px, rien ne change ; sans pied, `CoquilleRail` garde le HTML de la 1.1.0, attribut `style` excepté
- Si la mesure infirme le constat, il est consigné, et le lot n’y touche pas

---

### US-C14 : Savoir ce qui reste au Portail, et avec quelle API

**En tant que** Karamo, qui intègre la console,

**Je veux** une réponse pour chacune des treize pièces demandées : monte, monte sous condition, ou
reste chez moi, avec le motif et l’API,

**Afin d’**écrire les replis une fois, sur les jetons, montables le jour où Compte en aura besoin.

**Référence SPEC :** §0.6, §13.2, §16, §17

**Scénario :**

Karamo lit le tableau du §0.6. La table de données, la barre d’actions groupées, les puces de filtre
et la recherche de table, la barre d’enregistrement, et trois des quatre champs restent au Portail :
aucun autre produit n’en a montré le besoin. La plus grosse pièce, la table, reste chez lui ; il
relit le motif : une table écrite pour la seule console porterait les choix de la console.

Il ouvre le §17 : treize écarts, chacun avec sa conséquence pour P10. Il lira `LARGEUR_LECTURE` au
lieu de `--largeur-lecture` ; il écrira `RegionRetour` sur `Bandeau` ; il comptera, dans la recette
de la table de cinq cents lignes, les clés de `data-href` plutôt que les balises ; il donnera au compte
« Envoi échoué » son fond d’attention.

Il pense : « Rien ne m’est refusé sans raison, et rien ne monte pour rien. »

**Critères d’acceptation :**

- Chaque pièce de P10 §7.2 a son verdict, son motif et son deuxième consommateur, constaté ou non
- Chaque pièce qui reste au Portail garde l’API proposée par P10, et le §13.2 dit ce que P10 écrit
- Chaque écart avec le contrat de P10 a sa conséquence pour P10 (§17)
- Aucune pièce restée au Portail n’est bloquante : aucune ne touche un composant du système ni ne déclare de jeton
- La décision 012 consigne la lecture de la décision 009 appliquée à ce contrat

---

## EPIC 8 : UNE VERSION QUI SE PROUVE AVANT DE SE PUBLIER

---

### US-C15 : Prouver la version au navigateur et à l’essai avant d’en poser l’étiquette

**En tant que** Karamo, qui publiera `v1.3.0` pour tous les produits,

**Je veux** des comptes de balises avant et après, le menu constaté dans trois moteurs, des captures
en clair et en sombre, trois montées d’essai, une vérification verte, et que l’étiquette ne se pose
qu’avec mon accord,

**Afin de** ne publier à tous les produits que ce qui a été vu.

**Référence SPEC :** §10, §11, §14, §15

**Scénario :**

À la fin du lot, Karamo lance la vérification d’un seul bloc et la recopie. Il ouvre le spécimen dans
Chromium, Firefox et WebKit : le menu s’ouvre au clavier, se referme par Échap et au clic extérieur,
se retourne vers le haut en bas de fenêtre. Il note ce que chaque moteur fait de la position par ancre.
Il prend les captures du survol, du compteur, du pouls, du bandeau. Il écrit ce qui n’est pas couvert :
Safari sur appareil, un téléphone réel.

Puis vient la question, posée en nommant ce qui sera publié : les changements à l’écran, les ajouts,
les deux pièces montées ou sorties après la revérification, la mineure proposée. Karamo tranche les
points ouverts et répond oui. L’étiquette `v1.3.0` est posée sur le commit vérifié, et poussée.

Il pense : « Je sais ce que chaque produit recevra, parce que je l’ai vu. »

**Critères d’acceptation :**

- Les preuves du §11.2 existent dans `docs/preuves/1.3.0/`, dont « Ce qui n’est pas couvert »
- `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test` est vert d’un seul bloc, sortie recopiée ; aucun `build`
- Chaque garde et chaque test nouveau a été vu échouer une fois sur un cas construit
- `CHANGELOG.md`, `README.md` et `NOYAU.md` disent `1.3.0`, le nombre de composants et sept gardes ; la garde documentaire le confirme
- Les points ouverts de la SPEC (§0.9) sont tranchés par Karamo avant l’étiquette
- L’étiquette `v1.3.0` n’est posée et poussée qu’après son accord explicite ; aucune étiquette publiée n’est déplacée
- Aucun commit, aucune description, aucun fichier ne porte de co-auteur ni de mention d’outillage

---

**Note :** les pièces qui restent au Portail (`TableauDonnees`, `BarreActionsGroupees`,
`PucesFiltre`, `RechercheTable`, `BarreEnregistrement`, trois champs) se racontent dans les user
stories du sprint P10, qui les écrit. Elles monteront dans une version ultérieure, avec leur propre
paire SPEC et user stories, le jour où un deuxième produit en montrera le besoin.
