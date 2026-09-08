# Journal des changements

Une entrée par changement de jeton ou de règle, avec sa raison.

**Le versionnement est sémantique, et un changement de valeur de jeton est majeur** : il
modifie le rendu de tous les produits qui consomment le système.

---

## 0.6.0 — 8 septembre 2026

Trois ajouts, aucun retrait, aucune valeur de jeton modifiée. Une mineure.

Ils viennent tous d'un même constat, fait à l'écran sur le portail Compte : deux rubriques
de réglages y empilaient quatre à cinq cartes, et la personne qui venait pour une chose en
lisait cinq. Le découpage en sous-pages demandait trois choses que le système n'avait pas.

### `OngletsRubrique` — et pourquoi `BarreOnglets` ne pouvait pas servir

Le système portait déjà un composant nommé « onglets ». C'est une barre **basse et fixe**,
`position: fixed; bottom: 0`, qui disparaît au palier tablette : la navigation d'une
coquille d'application mobile, posée là où le pouce arrive.

Rien de tout cela ne convient à des sous-pages de réglages, lues surtout sur un poste de
bureau. Le nom se ressemble, le rôle est opposé. Les deux fichiers le disent maintenant, et
l'index aussi : c'est la seule protection contre le prochain qui cherchera « les onglets ».

**Ce sont des liens, pas un `tablist`.** Le motif ARIA `tablist` promet des panneaux qui
apparaissent sans navigation, et un lecteur d'écran qui l'entend attend les flèches pour
circuler. Ici la page change vraiment : chaque onglet est une route rendue au serveur, qui
se met en signet et revient par le bouton Retour. On emploie donc `nav` et
`aria-current="page"`. Annoncer un `tablist` qui navigue serait une promesse fausse.

**L'état actif porte trois signaux à la fois** : la couleur d'action, la graisse
semi-grasse, et un trait de 2 px. Même règle que `BarreOnglets`, même raison : près d'un
homme sur douze ne distingue pas correctement le rouge du vert, et un trait de 2 px seul se
rate au balayage.

**Le débordement se voit.** Trois onglets de deux mots ne tiennent pas sur un téléphone de
390 px. Le conteneur défile, son ascenseur est masqué, et un dégradé de 24 px collé au bord
droit dit qu'il reste quelque chose derrière. Sans lui, personne ne devine qu'un troisième
onglet existe : la sous-page est perdue pour tous les téléphones, et aucun test ne peut le
voir.

**Le composant ne déduit pas l'onglet actif, il le reçoit.** Déduire le chemin courant
demanderait un routeur, donc une dépendance à un framework, dans un système qui n'en a
aucune.

### `Avatar` — la photo d'une personne, ou ses initiales

Le portail Compte portait un `DisqueInitiales` maison, qui ne savait faire que les
initiales. L'arrivée de la photo de profil aurait demandé un second composant, et deux
composants pour un même objet divergent à la première correction : l'un prend un liseré,
l'autre non, et personne ne le voit avant de les mettre côte à côte.

Ils sont ici les deux **états** d'une seule chose, et l'état par défaut est celui qui ne
dépend de rien.

**Une photo cassée retombe sur les initiales**, par `onError`. Une URL meurt de plusieurs
façons : objet supprimé, domaine de médias en panne, réseau d'entreprise qui filtre les
images distantes. Le repli garde un visage lisible là où l'absence laisserait un trou à la
place de quelqu'un.

**Les initiales prennent les deux PREMIERS mots**, jamais le premier et le dernier.
« Marie Claire Dupont » donne « MC » et non « MD » : c'est le prénom composé qui est le nom
d'usage, et l'inverse afficherait des initiales que la personne ne reconnaît pas comme les
siennes.

**Un nom vide rend un point d'interrogation**, jamais un disque vide, qui se lit comme un
défaut de chargement et fait chercher une panne qui n'existe pas.

La taille est un nombre libre et non une échelle contrainte, contrairement à `Icone`. Un
avatar se cale sur ce qui l'entoure : 32 px dans un en-tête, 40 px dans une ligne de liste,
96 px dans une carte de profil. Contraindre la liste obligerait à la rouvrir à chaque
nouvel emploi.

### `Bouton`, variante `danger-contour`

La couleur porte l'avertissement, le contour lui retire le **poids**.

`danger` est un aplat rouge, et c'est ce qu'il faut au bout d'un parcours de suppression,
là où l'action destructrice est ce qu'on est venu faire. Ailleurs il est trop fort : sur un
écran de réglages qui porte déjà un bouton primaire, deux aplats de couleur se lisent comme
deux invitations d'égale force, celle qui protège et celle qui détruit.

Le portail Compte a fait ce constat au sprint 07 et s'est dessiné un contour à la main dans
sa zone de suppression. La console d'administration en a le même besoin sur trois écrans, et
la carte des méthodes de connexion sur un quatrième. **Un bouton de danger dessiné à la main
dans deux dépôts finit par avoir deux apparences.**

Le survol pose `--erreur-fond`, une teinte très pâle, et ne touche ni la bordure ni le
texte : un survol qui passerait à `--erreur` plein annulerait la variante. Comme `danger`,
elle ne compte pas dans la règle du bouton primaire.

### Compatibilité

Aucune propriété retirée, aucune valeur de jeton modifiée, aucun composant existant ne
change de rendu. `Bouton` gagne une valeur de `VarianteBouton` ; un consommateur qui
énumère exhaustivement ce type devra la traiter.

Le portail Compte supprimera son `DisqueInitiales` en consommant cette version. Aucun autre
produit ne l'employait.

---

## 0.5.1 — 8 septembre 2026

### Un bouton qui charge n'est pas un bouton indisponible

L'opacité de 0,6 s'appliquait aux deux états, `disabled` et `chargement`. Elle était sans
conséquence tant que le bouton en chargement gardait son libellé : le texte ne portait
aucune information neuve.

La 0.5.0 a changé cela. Le bouton porte désormais la **seule** information de l'écran
pendant l'attente, et mesure faite juste après :

| Contexte                              | Ratio    | AA 4,5 |
| ------------------------------------- | -------- | ------ |
| Clair, « Connexion en cours » à 60 %  | **1,95** | ❌     |
| Sombre, « Connexion en cours » à 60 % | **1,89** | ❌     |
| Clair, à pleine opacité               | **5,69** | ✅     |
| Sombre, à pleine opacité              | **5,45** | ✅     |

L'élément le plus important de l'écran en était le moins lisible.

**L'estompage reste pour `disabled`**, où il dit la vérité : cette action n'est pas
disponible. Le chargement garde sa pleine opacité, et son curseur passe à `progress` plutôt
qu'à `not-allowed` : on attend, on n'est pas refusé.

Le défaut n'a été trouvé ni par les types, ni par le linter, ni par les 324 tests. Il a
fallu regarder un bouton en train de charger, dans les deux thèmes.

### Compatibilité

Aucune propriété ajoutée ni retirée. Un bouton `disabled` se rend exactement comme avant ;
seul un bouton `chargement` change d'apparence, et dans le sens de la lisibilité.

---

## 0.5.0 — 8 septembre 2026

### L'état `chargement` disait « indisponible » là où il fallait dire « c'est parti »

Il estompait le bouton à 60 %, le désactivait, posait `aria-busy`, et rien d'autre. Le
libellé ne bougeait pas.

Mesuré sur l'écran d'inscription du portail Compte : entre le clic et la redirection, il se
passe la création du compte, l'écriture du journal d'audit, l'envoi d'un courriel et un
rendu de page. Trois secondes pendant lesquelles un bouton légèrement plus pâle est le seul
signal. La personne ne sait pas si elle doit attendre ou recliquer, et son second clic est
absorbé par `disabled` sans rien lui dire.

**Trois points animés**, dans l'esprit de l'indicateur qui dit qu'une personne est en train
d'écrire : ils montent et redescendent l'un après l'autre, cycle de 1200 ms, décalés de
160 ms. Le cycle est long volontairement. Une animation rapide sur un bouton pleine largeur
donne l'impression d'une urgence que l'attente n'a pas : le rôle de l'indicateur est de
rassurer, pas de presser.

**Ils prennent `currentColor`, jamais un jeton.** Le primaire porte `--texte-sur-action`, le
`danger` porte `--texte-sur-erreur`, le `neutre` porte `--texte-fort`. Trois points figés
sur une seule de ces valeurs seraient faux sur deux boutons sur trois, et presque invisibles
sur l'un d'eux en mode sombre.

**`prefers-reduced-motion` supprime l'animation entièrement.** Les points restent affichés,
statiques, à pleine opacité. Ce n'est pas un repli dégradé : l'information n'est jamais
portée par l'animation, elle est portée par le libellé et par `aria-busy`. Les points sont
un renfort visuel, et un renfort qu'on peut retirer sans rien perdre.

### `Bouton` gagne `libelleChargement`

Optionnel. Absent, le bouton garde son libellé, exactement comme avant : **aucun produit
consommateur ne change de rendu en montant en 0.5.0.**

Présent, il remplace le libellé pendant le chargement, donc le **nom accessible** du
bouton. C'est ce qui compte : sans changement de libellé, un bouton en chargement s'annonce
exactement comme un bouton au repos, à `aria-busy` près, que tous les lecteurs n'annoncent
pas.

Le libellé nomme l'action, jamais l'attente. « Connexion en cours » et non « Veuillez
patienter » : le second ne dit rien que l'estompage ne disait déjà.

**L'argument historique contre le changement de libellé reste vrai, et c'est pourquoi la
propriété est optionnelle.** Il visait la LARGEUR : un bouton ajusté à son texte change de
taille quand le texte change, et la colonne saute. Sur un bouton `pleineLargeur`, le texte
se recentre sans rien déplacer.

### Compatibilité

Aucune valeur de jeton ne change. Aucune propriété n'est retirée, aucune variante n'est
renommée. Un produit qui reste en 0.4.0 continue de fonctionner ; un produit qui monte voit
ses boutons en chargement s'animer, sans rien changer à son code.

Huit tests neufs, dont un qui vérifie que le nom accessible bascule et un qui vérifie que
l'animation disparaît sous `prefers-reduced-motion`.

---

## 0.4.0 — 8 septembre 2026

### Le libellé du bouton primaire était illisible en mode sombre

Mesuré, pas ressenti. `--action` vaut #6B88FF en mode sombre, et `--texte-sur-action`
valait `--blanc` : **3,19**, sous le seuil AA de 4,5. Au survol, sur #8BA1FF : **2,43**. Le
seul geste qui devrait confirmer une action rendait son libellé moins lisible qu'au repos.

La garde du bloc clair mesurait ce couple depuis le premier jour. Celle du bloc sombre ne
le mesurait pas, et c'est le seul thème où il échouait. Une utilisatrice l'avait signalé
avec les mots dont elle disposait, « le bouton bleu est bizarre le soir » ; personne n'avait
su quoi en faire.

`--texte-sur-action` change désormais de rôle entre les deux thèmes, exactement comme
`--texte-sur-erreur` le fait depuis la v0.3.0, et pour la même raison. En sombre il vaut
l'encre : **5,45** au repos, **7,15** au survol.

**On n'a pas touché à `--action`.** L'assombrir pour y garder du blanc aurait cassé les
liens, les bordures et les icônes qui s'y appuient, et qui tiennent déjà 5,73 sur
`--surface-1` et 5,15 sur `--surface-2`. C'est le texte posé dessus qui était faux, pas le
bleu. Un test le fige : `--action` en sombre doit rester #6B88FF.

Quatre tests neufs mesurent les deux couples, au repos et au survol, dans les deux thèmes.

### Les états de survol, de focus et d'appui existent enfin

`Bouton` et `Champ` écrivaient leurs couleurs en **style en ligne**. Une pseudo-classe posée
dans une feuille perd toujours contre un attribut `style` : aucun `:hover` n'était possible,
et le jeton `--action-survol`, déclaré depuis la v0.1.0, **n'a jamais été employé nulle
part**.

Aucun test ne pouvait le voir, parce que rien n'était cassé. Il ne se passait simplement
rien, sur tous les boutons de tous les produits, depuis le premier jour.

Les couleurs sortent donc du style en ligne et passent dans une feuille injectée sous
identifiant stable, comme `GabaritAuth` le fait déjà. Le style en ligne garde ce qui dépend
des propriétés reçues : la hauteur selon la taille, la largeur pleine, le rembourrage du
champ selon son icône et sa commande. Un `style` passé par le consommateur gagne toujours,
comme avant.

Le focus est `:focus-visible` et non `:focus` : un anneau qui apparaît au clic de souris est
du bruit, un anneau qui n'apparaît pas au clavier est un mur. L'anneau d'un champ est décalé
d'un pixel et non de deux, parce qu'un champ a déjà une bordure visible. L'anneau d'un champ
en erreur est rouge, et il s'accroche à `aria-invalid` : l'état visuel et l'état annoncé ne
peuvent pas diverger.

L'appui déplace le bouton d'un pixel. Jamais un changement d'échelle : sur un bouton pleine
largeur de 440 px, un `scale` fait bouger toute la colonne. `prefers-reduced-motion` le
supprime.

Chaque règle de survol est gardée par `:not(:disabled)`, et un test le vérifie règle par
règle. Un bouton en chargement réagirait sinon à la souris tout en refusant le clic.

### `Bouton` gagne la variante `neutre`

Pour un bouton qui doit être visible sans revendiquer l'action. Le cas qui l'a fait naître
est la connexion par un fournisseur tiers : en `secondaire`, elle portait le bleu de
l'action dans son trait et dans son texte, et deux boutons pleine largeur cerclés de bleu se
disputaient l'œil sur le seul écran où il ne faut pas hésiter.

`neutre` porte le fond des surfaces, la bordure des champs, et le texte fort.

### `Embleme`, treizième composant du noyau

Le pentagone institutionnel devient la **tête** d'une silhouette, un arc devient ses
**épaules**. Ce n'est pas une seconde marque : c'est la déclinaison produit d'une marque
existante, comme « AI5D Compte » est celle du logotype.

Le cartouche est `--action` et non `--encre` : l'encre vaut #051C2C et `--surface-1` en
sombre vaut #0B1620, deux valeurs que l'œil ne sépare pas. Le bleu tient sur les deux
thèmes, et c'est aussi le fond du favicon institutionnel.

Deux variantes, `badge` et `nu`. Les cinq tailles de la charte, imposées par le type comme
pour `Icone`. Décoratif par défaut. Le pentagone est repris sans une virgule, et un test
l'interdit de modification.

### Compatibilité

Aucune propriété retirée, aucune variante renommée. Un produit qui reste en 0.3.1 continue
de fonctionner. Un produit qui monte ne change rien à son code, sauf s'il veut la variante
`neutre` ou l'emblème, et sauf qu'il verra sans rien demander ses boutons réagir au survol
et son mode sombre redevenir lisible.

---

## 0.3.1 — 6 septembre 2026

### L'échelle d'espacement existe enfin

Elle était promise par la charte, chapitre 07, qui énumère ses huit valeurs, et par le
contrat de jetons du portail, qui les documente depuis le premier jour. Elle n'avait
**jamais été implémentée**.

Tout `var(--espace-4)` écrit par un produit résolvait au vide, et le navigateur appliquait
zéro. Le défaut ne casse rien : la page s'affiche, simplement collée. Rien dans la console,
rien dans les tests, rien dans le typecheck.

Mesuré au navigateur sur le portail Compte, avant correction : le rail de rubriques n'avait
aucun rembourrage et débordait jusqu'au bord de la fenêtre, l'icône touchait son libellé,
et le nom de la personne touchait « Se déconnecter ». `GabaritPortail`, livré par ce
système en v0.3.0, était lui-même écrit avec ces jetons : il était donc cassé aussi.

Les huit valeurs sont celles de la charte, sans exception, à pas de 4 px. Elles ne changent
ni avec le thème ni avec la densité : la densité décrit l'espace entre les **sections**,
l'échelle décrit l'espace entre les **éléments**.

Elles sont aussi mises en correspondance Tailwind, `--spacing-1` à `--spacing-16`.

Onze tests les gardent, dont un qui vérifie le pas de quatre.

---

## 0.3.0 — 6 septembre 2026

### `GabaritPortail`, la coquille des écrans de réglages

Demandé par le portail Compte, sprint 02. La charte, chapitre 07, prescrit un rail de
rubriques de 280 px sur bureau. `GabaritApp` ne peut pas le porter : il fait disparaître
sa navigation dès la tablette et laisse au produit le soin de la remonter dans l'en-tête,
ce qui est juste pour une application dont la navigation est un choix de produit. Un
portail de réglages n'a pas ce choix.

Écrire ce rail dans le portail Compte aurait suffi une fois. Le jour où l'Académie voudra
le même réglage, il existerait en deux exemplaires, et ils divergeraient à la première
correction.

**Trois paliers.** Sous 768 px, la barre basse de `BarreOnglets`, inchangée. Entre 768 et
1279 px, un rail de 240 px. À partir de 1280 px, un rail de 280 px et un contenu plafonné
à `--contenu-max`.

Le 240 est une mesure, pas une prescription : la charte donne 280 pour le bureau et reste
muette en tablette, où elle demande seulement « deux colonnes ». À 768 px, un rail de 280
laisse 416 px de contenu ; un rail de 240 en laisse 456.

**Les deux navigations sont la même liste**, rendues toutes les deux dans le HTML, et
c'est la requête média qui en masque une. Choisir au montage en mesurant la fenêtre
produirait un écart d'hydratation, et le rendu au serveur ne saurait pas laquelle servir.

`display: none` et non une classe visuelle : c'est ce qui retire la navigation masquée de
l'arbre d'accessibilité. Sans cela, un lecteur d'écran annoncerait six rubriques au lieu
de trois. Un test le garde.

`Rubrique.href` est **requis**, là où `Onglet.href` est optionnel. Un onglet peut piloter
un état local ; une rubrique de portail est une page, et une page a une adresse.

### `Bouton` gagne la variante `danger`

Pour les actions destructrices : suppression de compte, révocation, retrait d'un membre.

**Elle ne compte pas comme un bouton primaire** dans la règle « un seul par vue ». Une
action destructrice et une action d'avancement ne se disputent pas le même regard : l'une
est ce qu'on est venu faire, l'autre ce qu'on veut être sûr de ne pas faire par mégarde.
Les gardes des produits qui comptent les boutons primaires doivent l'exclure ; le
`data-variante="danger"` du marquage le leur permet.

### Deux jetons nouveaux, et une mesure qui les justifie

`--texte-sur-erreur` et `--erreur-survol`, dans les quatre blocs de thème.

Le premier n'est pas `--texte-sur-action` déguisé, et la différence est mesurée : en mode
sombre, `--erreur` vaut `#F27063`, un rouge clair, et du blanc dessus donne **2,89**, sous
le seuil AA. L'encre y donne **6,02**. Le jeton change donc de rôle entre les deux modes,
comme `--action`, et pour la même raison. Un test de contraste le garde dans les deux
modes : remplacer `--texte-sur-erreur` par `--texte-sur-action` le fait échouer.

`--erreur-survol` assombrit en clair et éclaircit en sombre, comme `--action-survol`. Un
survol qui éclaircirait en mode clair ferait paraître le bouton désactivé au passage de
la souris.

---

## 0.2.2 — 6 septembre 2026

### `Champ` accepte une icône et une commande

Demandé par le portail Compte, en revue de ses écrans d'authentification. La comparaison
avec l'Académie a montré deux manques, et les deux tenaient au composant, pas à l'écran.

**Une icône décorative, à gauche dans le cadre**, en 20 px : la charte, chapitre 08,
attribue cette taille aux boutons et aux champs. Elle se reconnaît avant d'être lue, ce qui aide au balayage
d'un formulaire ; un champ nu se lit comme une boîte vide. Elle porte `aria-hidden` et
n'est jamais focalisable : un lecteur d'écran n'a que le libellé, et le libellé doit
suffire.

**Une commande, à droite dans le cadre.** L'usage qui l'a fait naître est la bascule
« Afficher / Masquer » d'un mot de passe. Posée hors du composant par le portail, elle
atterrissait sur la ligne du libellé et se lisait comme un second libellé. Rattachée au
cadre, elle dit visiblement à quel champ elle appartient.

Le rembourrage s'ouvre du côté concerné, sans quoi le texte saisi passerait dessous dès
qu'il est long.

### La garde des couleurs prenait une entité HTML pour une couleur

`&#8239;` est l'espace fine insécable, celle que la typographie française exige avant un
point d'interrogation. Le motif `#[0-9a-fA-F]{3,8}` y voyait la couleur `#8239` et refusait
un écran parfaitement conforme.

Trouvé dans le portail Compte, sur la ligne « Mot de passe oublié&#8239;? ». Le motif exige
désormais que le croisillon ne soit pas précédé d'une esperluette. Deux tests encadrent la
correction : l'entité passe, et un hexadécimal écrit après un `&&` est toujours relevé, pour
que la porte ne s'ouvre pas plus large que nécessaire.

**Rétrocompatible, et c'est vérifié plutôt qu'affirmé.** Un `Champ` sans icône ni commande
garde ses 14 px de chaque côté, et un test le mesure : aucun formulaire existant ne bouge.

---

## 0.2.1 — 5 septembre 2026

### Le paquet ne compilait pas chez un consommateur strict

Trouvé en consommant le système pour de vrai, dans le portail Compte. Le paquet livre du
TypeScript brut : il doit donc compiler sous les réglages de ses **consommateurs**, pas
seulement sous les siens.

Le portail active `exactOptionalPropertyTypes`. Sous ce drapeau, `produit?: string`
signifie « absent OU une chaîne », jamais « chaîne ou `undefined` ». Passer une valeur
potentiellement absente devient une erreur de type, et **quatre composants refusaient de
compiler** : `GabaritApp`, `GabaritAuth`, et par ricochet `Logotype` et `BarreOnglets`.

```
error TS2375: Type '{ produit: string | undefined; taille: number; }' is not
assignable to type 'ProprietesLogotype' with 'exactOptionalPropertyTypes: true'.
```

**Correction.** Les 43 propriétés optionnelles des onze composants acceptent désormais
`undefined` explicitement. Cela ne change rien pour un consommateur qui n'active pas le
drapeau, et cela débloque celui qui l'active.

**Et le drapeau est activé dans le dépôt lui-même**, avec `noImplicitOverride`. Sans cela,
le défaut ne se serait revu qu'au prochain consommateur strict, six mois plus tard.

**La leçon.** Un paquet qui livre des sources doit se compiler sous les réglages les plus
stricts qu'il accepte de servir. Le tester sous les siens ne prouve rien, et c'est
exactement ce que la 0.2.0 faisait.

### Preuves

`pnpm typecheck`, `pnpm lint`, `pnpm format:check` et **248 tests** : tous verts après
correction.

---

## 0.2.0 — 5 septembre 2026

### Mobile d'abord

Le sujet manquait entièrement, et c'est le commanditaire qui l'a relevé, à partir du portail
de compte d'une autre entreprise rendu sur téléphone. La responsivité n'était traitée nulle
part comme une doctrine : elle existait à l'intérieur de `GabaritAuth`, sous forme de trois
requêtes média écrites pour cet écran-là.

**Ce qui entre :**

| Ajout                           | Ce qu'il apporte                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `noyau/paliers.ts`              | Six constantes, dont deux sont des contraintes et non des points de bascule, et deux fonctions |
| `noyau/paliers.css`             | Marges de page, zones sûres, et les deux règles universelles du rendu mobile                   |
| `noyau/PALIERS.md`              | La doctrine, les sept règles, la coquille d'application                                        |
| `GabaritApp`                    | La coquille : en-tête collant, contenu défilant, barre d'onglets                               |
| `BarreOnglets`                  | La navigation basse, trois à cinq onglets                                                      |
| `CarteAction`                   | Le motif « une carte, une action »                                                             |
| `verifierAucuneLargeurFixe`     | Refuse toute largeur figée au-delà du plancher de 320 px                                       |
| `verifierHauteurDeVueDynamique` | Refuse `vh` et exige `dvh`                                                                     |

**Pourquoi une version mineure et non majeure.** Aucune valeur de jeton ne change. Les
variables ajoutées sont nouvelles, et un produit qui ne les lit pas rend exactement comme
avant. La règle du versionnement sévère ne s'applique qu'aux valeurs existantes.

### Ce qu'on refuse au motif de référence

La ressemblance sera tentante, donc elle est écrite.

| Élément du motif                   | Décision             | Raison                                                                                                    |
| ---------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------- |
| Une couleur par section            | **Refusé**           | La charte mère écrit que la différenciation se fait par le nom, jamais par la couleur                     |
| Fond de carte teinté vert ou jaune | **Refusé**           | Ce sont des jetons sémantiques. Un fond vert décoratif, et « réussite » ne veut plus rien dire nulle part |
| Boutons entièrement arrondis       | **Refusé**           | Le rayon de bouton vaut 10 px. Le rayon plein est réservé aux pastilles et aux avatars                    |
| Quatre onglets dont « Plus »       | **Repris, et borné** | Trois à cinq                                                                                              |

### Corrigé

`NOYAU.md` annonçait encore `CarteAuth` avec une largeur bloquée à 420 px, alors que le
composant s'appelle `GabaritAuth` depuis la 0.1.1 et tient sur deux colonnes. La ligne était
périmée depuis la livraison précédente.

### Preuves

`pnpm typecheck`, `pnpm lint`, `pnpm format:check` et `pnpm test` passent. **248 tests, 12
fichiers**, dont 14 sur les paliers, 28 sur les trois nouveaux composants et 28 sur les
gardes.

**Ce qui n'est pas prouvé, et il faut le dire :** jsdom n'évalue pas les requêtes média. Les
tests lisent les règles CSS injectées par les composants, ils prouvent donc que la règle est
**écrite**, pas que la barre d'onglets disparaît réellement à 768 px. Cela se vérifie à
l'écran, et nulle part ailleurs. Aucun rendu sur un téléphone réel n'a été fait.

---

## 0.1.1 — 5 septembre 2026

### `CarteAuth` remplacé par `GabaritAuth`

La carte centrée de 420 px était une invention de ce système. L'Académie, elle, a en
production un gabarit en **deux colonnes** dont chaque valeur est mesurée — et c'est
celui-là que le commanditaire a validé.

|              | Avant                | Après                                                                         |
| ------------ | -------------------- | ----------------------------------------------------------------------------- |
| Sous 1024 px | Carte centrée 420 px | Colonne unique, formulaire à 440 px, logotype centré au-dessus                |
| Au-delà      | Carte centrée 420 px | Deux colonnes : formulaire à gauche, panneau d'encre à 45 % plafonné à 560 px |
| Panneau      | —                    | Logotype et une phrase. Ni photo, ni illustration, ni filet, ni forme animée  |

**Trois mesures reprises telles quelles**, parce qu'elles valent plus que le code :

- La bascule est à **1024 px et non 768**. À 768 px, le panneau prend 345 px et laisse
  423 px pour un formulaire annoncé à 440 px : l'écran de réinitialisation débordait de
  14 px.
- `min-width: 0` sur la colonne du formulaire n'est pas décoratif. Sans lui, une colonne
  flexible refuse de descendre sous la largeur intrinsèque de son contenu et pousse le
  panneau hors de l'écran — c'est la cause exacte du débordement.
- Le logotype mobile est à 20 px et non 18. À 18 px, le verrouillage complet mesurait 19 px
  de haut, sous le plancher de 28 px de la charte. Pas plus haut non plus : à 30 px la
  signature réclame 250 px et se casse en deux lignes à 320 px.

Le panneau a porté trois preuves. Elles ont été retirées : elles promettaient un contenu
qu'un écran de connexion n'a pas à vendre. On y arrive déjà décidé.

### Corrigé

- Le panneau écrivait `color: #fff`. La garde `aucune-couleur-en-dur` l'a relevé avant le
  premier commit ; c'est `var(--blanc)`.

### Empaquetage

- Ajout du champ `files` au `package.json`. Le paquet livrait ses tests, ses spécifications,
  ses spécimens et sa tuyauterie de build à chaque consommateur. Il ne livre plus que
  `noyau`, `densites`, `gardes`, `outils`, le journal et le README.

192 tests.

---

## 0.1.0 — 5 septembre 2026

Première livraison. Noyau, densités et gardes — lots 1 à 3.

### Jetons corrigés par rapport à la charte AI5D Académie

Ces trois valeurs diffèrent de celles en production à l'Académie. Chacune corrige un défaut
de contraste mesuré, non une préférence.

| Jeton                     | Avant     | Après     | Raison                                                                                                                                                                                                                 |
| ------------------------- | --------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--texte-faible` clair    | `#6B7A85` | `#616F78` | Échouait sur les trois surfaces claires : 4,14 sur le papier, 4,42 sur le blanc. Tient désormais à 4,85 / 5,18 / 4,53. Teinte et saturation conservées, seule la luminosité baisse                                     |
| `--reussite-fond` sombre  | `#10312A` | `#103029` | Le vert de réussite y donnait 4,45, sous le seuil                                                                                                                                                                      |
| `--action` en mode sombre | `#5B7BFF` | `#6B88FF` | `#5B7BFF` donne 4,47 sur une carte sombre et 3,92 sur un menu : les liens sur carte échouaient. Le jeton de marque `--action-clair` reste intact et importé ; c'est un nouveau jeton applicatif, `--action-sur-sombre` |

### Jetons ajoutés

| Jeton                    | Rôle                                                            |
| ------------------------ | --------------------------------------------------------------- |
| `--action-sur-sombre`    | L'action sur les surfaces sombres que la marque n'a jamais eues |
| `--info` · `--info-fond` | Le registre d'information, absent des chartes dérivées          |
| `--cible-tactile`        | Le plancher tactile, cité par les composants                    |

### Signalé, non corrigé — hors périmètre

Le `--ai5d-blue-light #5B7BFF` de la marque institutionnelle donne **3,58 sur son propre
navy `#042A76`**, alors que la charte mère le déclare pour « liens et accents sur fond
encre/navy ». Sur l'encre il tient (4,73) ; sur le navy, non. La marque ne bouge pas dans ce
chantier — décision D1 — mais le défaut mérite une décision séparée.

### Ce qui est livré

- **Polices** : Fraunces, Inter, JetBrains Mono en woff2, sous-ensemble latin, servies en
  local. Trois fichiers, 134 Ko — Inter et Fraunces sont variables, un fichier porte toute
  leur plage de graisses.
- **Jetons** : marque aliasée, surfaces, texte, sémantiques, typographie, géométrie,
  élévation, mouvement. Trois états de thème, `prefers-reduced-motion` compris.
- **Préréglage Tailwind v4** en bloc `@theme`, qui ne fait que pointer vers les jetons.
- **Huit composants** : Logotype, Bouton, Champ, Carte, Bandeau, Pastille, Icone, CarteAuth.
- **Quatre profils de densité** et le plancher tactile.
- **Trois gardes distribuables** plus la garde de contraste, qui recalcule 44 paires à
  chaque exécution.
- **187 tests**, types, lint et format au vert.

### Corrigé après rendu réel

`Logotype` figeait sa couleur sur `--encre` et obligeait le consommateur à basculer la
variante à la main. Sur une page qui change de thème, le logotype disparaissait en mode
sombre. Le défaut suit désormais `--texte-fort` ; `encre` et `blanc` restent disponibles
pour un fond dont la clarté ne dépend pas du thème.

### Ce qui n'est pas livré

Les lockups produit et la remédiation des 36 SVG (lot 4), les cinq composants
inter-produits et les cinq écrans système (lot 5), le gabarit de courriel (lot 6), la
migration de l'Académie et de la Platform (lot 7). Chacun attend son consommateur.
