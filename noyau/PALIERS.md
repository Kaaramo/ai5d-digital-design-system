# Mobile d'abord

Tout ce qui est servi à un utilisateur se conçoit d'abord pour un téléphone. Les espaces
d'administration sont hors de cette règle, et c'est la seule exception.

**Fichiers exécutables :** [`paliers.ts`](paliers.ts) · [`paliers.css`](paliers.css) ·
[`composants/GabaritApp.tsx`](composants/GabaritApp.tsx) ·
[`composants/BarreOnglets.tsx`](composants/BarreOnglets.tsx)

---

## 1. Pourquoi le point de départ, et pas un palier

Un écran dessiné pour 1440 px puis rétréci garde les décisions du grand écran : une grille à
trois colonnes qui s'empile mal, une navigation horizontale qui déborde, des cibles calibrées
pour un curseur. Un écran dessiné pour 390 px puis élargi n'a que de la place en plus.

L'ordre n'est pas une préférence de méthode. Il décide de ce qui est possible ensuite.

---

## 2. Les paliers

| Constante          | Valeur  | Nature     | Ce qui s'y passe                                    |
| ------------------ | ------- | ---------- | --------------------------------------------------- |
| `PLANCHER`         | 320 px  | contrainte | Rien. Aucune mise en page n'a le droit d'y casser   |
| `REFERENCE_MOBILE` | 390 px  | contrainte | Rien. C'est la largeur sur laquelle on dessine      |
| `COMPACT`          | 640 px  | palier     | La marge de page passe de 16 à 24 px                |
| `TABLETTE`         | 768 px  | palier     | La barre d'onglets disparaît, la navigation remonte |
| `BUREAU`           | 1024 px | palier     | Deux colonnes deviennent possibles                  |
| `LARGE`            | 1280 px | palier     | Le contenu est plafonné à `--contenu-max` et centré |

**Deux des six ne sont pas des paliers.** Rien ne s'y déclenche. Les distinguer évite qu'on
écrive un jour `@media (min-width: 320px)`, qui ne voudrait rien dire.

**Pourquoi 640 et non 480.** Mesure faite sur `GabaritAuth` : le formulaire vaut 440 px, et
deux marges de 32 px en ajoutent 64. Il faut donc au moins 504 px avant d'élargir les marges.
640 est la valeur ronde immédiatement au-dessus, et c'est celle déjà en production.

**Pourquoi 1024 pour les deux colonnes.** À 768 px, un panneau à 45 % prend 345 px et laisse
423 px pour un formulaire annoncé à 440. Le calcul est le même que celui du chapitre 11 de la
charte, retrouvé ici indépendamment. `tests/paliers.test.ts` croise les deux valeurs et
échoue si l'une bouge sans l'autre.

### Écrire une requête média

Jamais à la main. `paliers.ts` rend la chaîne :

```ts
import { auDela, enDeca } from '@ai5d/design-system/paliers';

const regle = `
  @media ${auDela('tablette')} { .barre { display: none; } }
  @media ${enDeca('compact')}  { .bouton { width: 100%; } }
`;
```

`enDeca` borne à 0,02 px près pour ne pas recouvrir `auDela`. Deux requêtes qui se recouvrent
produisent une règle qui gagne par hasard, selon l'ordre d'écriture.

---

## 3. Les sept règles

### 1. Le pouce d'abord

L'action principale d'un écran vit dans le tiers bas, jamais en haut à droite. Sur un
téléphone de six pouces tenu d'une main, le coin haut droit demande de changer la prise.

### 2. La zone sûre se réserve, toujours

Tout élément fixé en bord d'écran ajoute `env(safe-area-inset-*)`. Sans cela, une barre
d'onglets passe **sous** la barre de gestes d'un iPhone : elle reste visible, et elle devient
inatteignable. Le défaut ne se voit pas sur un émulateur de bureau.

Le repli est obligatoire : `env(safe-area-inset-bottom, 0px)`. Sans lui, la valeur est vide
et la déclaration entière est ignorée.

### 3. `dvh`, jamais `vh`

La barre d'URL d'un navigateur mobile entre et sort du cadre pendant le défilement. `100vh`
vaut la hauteur **sans** elle : un écran calé dessus se fait couper au chargement, puis se
réajuste au premier geste. `100dvh` suit la hauteur réellement disponible.
`verifierHauteurDeVueDynamique` refuse `vh`.

### 4. Aucune largeur fixe au-delà du plancher

`max-width` et `min-width` sont la solution ; `width: 440px` est le problème.
`verifierAucuneLargeurFixe` refuse toute largeur chiffrée en pixels au-delà de 320.

### 5. Le survol n'apprend jamais rien

`:hover` existe au doigt, mais il se déclenche après la pression et reste collé jusqu'au
geste suivant. Une information qui n'apparaît qu'au survol n'existe pas sur téléphone.

### 6. Le plancher tactile prime

44 px, déjà garanti par [`../densites/profils.css`](../densites/profils.css) sous
`@media (pointer: coarse)`. Les paliers ne le renégocient pas.

### 7. Une colonne, sous `COMPACT`

Deux colonnes sur 390 px donnent des cibles de 150 px de large. On empile. Une grille n'entre
qu'à partir de `TABLETTE`.

---

## 4. La coquille d'application

Trois zones, et une mesure qui décide de tout.

```
┌─────────────────────────────┐
│  en-tête collant, 56 px     │   logotype + actions de compte
├─────────────────────────────┤
│                             │
│  contenu défilant           │   marge de page, une colonne
│                             │
│  ⟨réserve basse⟩            │   hauteur de barre + zone sûre
├─────────────────────────────┤
│  barre d'onglets, 56 px     │   3 à 5 onglets, icône ET mot
│  ⟨zone sûre⟩                │
└─────────────────────────────┘
```

**La mesure qui décide de tout, c'est la réserve basse.** Le contenu réserve sous lui
`--hauteur-barre-onglets + --zone-sure-basse`. Sans elle, le dernier élément de la page se
glisse sous la barre. Le défaut ne se voit pas tant qu'on teste sur des pages courtes, et il
apparaît le jour où quelqu'un ajoute une ligne.

À partir de `TABLETTE`, la barre disparaît et la réserve tombe à zéro. À partir de `BUREAU`,
le contenu est plafonné à `--contenu-max` et centré.

### La barre d'onglets

**Trois à cinq onglets.** En dessous de trois, une barre ne sert à rien : deux liens tiennent
dans l'en-tête. Au-delà de cinq, chaque cible descend sous 70 px de large sur un téléphone de
390 px, et le libellé se coupe. Le sixième onglet devient « Plus ».

**Chaque onglet porte une icône et un mot.** C'est la règle générale du système, et elle vaut
d'autant plus ici : une rangée d'icônes seules oblige à apprendre un vocabulaire avant de
pouvoir naviguer.

**L'état actif ne passe pas que par la couleur.** Il porte `aria-current="page"`, il prend la
couleur d'action, et il passe la graisse de son libellé de normale à semi-grasse. Les trois
ensemble, ou l'information n'atteint pas tout le monde.

---

## 5. Ce qu'on a repris du motif de référence, et ce qu'on lui refuse

Le motif vient d'un portail de compte concurrent, rendu sur téléphone.

**Repris**, parce que c'est la bonne réponse au pouce et au petit écran :

| Élément                                       | Pourquoi                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| Barre d'onglets fixée en bas                  | Le pouce atteint le bas de l'écran, pas le haut                               |
| En-tête mince et collant                      | L'identité et la sortie restent atteignables sans remonter tout le défilement |
| Cartes empilées, une action par carte         | Une colonne, pas de grille : la grille produit des cibles de 150 px           |
| Icône en pastille, titre, description, action | Le bouton nomme sa destination. Il ne dit pas « Voir »                        |

**Refusé**, et il faut l'écrire parce que la ressemblance sera tentante :

| Élément du motif                   | Décision             | Raison                                                                                                                                 |
| ---------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Une couleur par section            | **Refusé**           | La charte mère écrit que la différenciation se fait par le nom, jamais par la couleur. Et le budget plafonne bleu et vert à un dixième |
| Fond de carte teinté vert ou jaune | **Refusé**           | Ce sont des jetons sémantiques. Un fond vert décoratif, et « réussite » ne veut plus rien dire nulle part                              |
| Boutons entièrement arrondis       | **Refusé**           | Le rayon de bouton vaut 10 px. Le rayon plein est réservé aux pastilles et aux avatars                                                 |
| Quatre onglets dont « Plus »       | **Repris, et borné** | Trois à cinq. Au-delà, le dernier devient « Plus »                                                                                     |

---

## 6. Ce que les gardes ne peuvent pas prouver

Elles lisent des fichiers, pas des écrans rendus. `verifierAucuneLargeurFixe` attrape une
largeur figée ; elle ne dira jamais qu'un tableau à sept colonnes est illisible sur 390 px.

Et `tests/composants/mobile.test.tsx` lit les règles CSS injectées par les composants, sans
les appliquer : jsdom n'évalue pas les requêtes média. Le test prouve donc que la règle est
**écrite**, pas que la barre disparaît réellement à 768 px. Cela se vérifie à l'écran, et
nulle part ailleurs.
