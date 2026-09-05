# Mobile d'abord — plan d'implémentation

> **Pour les exécutants :** ce plan se déroule tâche par tâche. Les étapes sont des cases à
> cocher. Le cycle est celui du commanditaire : on écrit le code **et** ses tests, on marque
> « écrite, non testée », on commite. Une tâche finale lance la vérification d'un seul bloc.

**Objectif :** faire du téléphone le point de départ de tout écran servi à un utilisateur,
et non un palier d'adaptation ajouté après coup.

**Architecture :** trois ajouts au **noyau**, pas une quatrième couche. Les paliers ne
varient pas d'un produit à l'autre, contrairement aux densités : ils appartiennent donc à ce
qui ne bouge jamais. Un fichier de règles de base (`noyau/paliers.css`), un fichier de
constantes lisibles en TypeScript (`noyau/paliers.ts`), trois composants de coquille
d'application, et deux gardes distribuables de plus.

**Stack :** TypeScript strict, React 19, CSS natif (aucun framework de style), Vitest +
Testing Library + jsdom.

**Spec :** [`docs/superpowers/specs/2026-09-05-ai5d-digital-design-system-design.md`](../specs/2026-09-05-ai5d-digital-design-system-design.md)
et la charte de référence [`docs/charte/`](../../charte/). Ce plan **étend** la spec : elle
ne traitait pas le sujet, et c'est le manque que le commanditaire a relevé le
5 septembre 2026 à partir d'un portail concurrent rendu en coquille d'application mobile.

## Global Constraints

Recopiées de la spec et de la charte, elles s'appliquent à chaque tâche.

- Aucune couleur en dur. Toute valeur passe par une variable du noyau.
- Aucun jeton de marque redéfini.
- La densité change l'espace, jamais la taille du texte. Les paliers non plus.
- Le plancher tactile de 44 px prime sur tout.
- Aucune information portée par la seule couleur.
- Une icône ne remplace jamais un mot dans une information d'état.
- Aucune dépendance à un framework de style : les composants tiennent avec les seules
  variables CSS.
- Voix : vouvoiement, aucun tiret cadratin, ni emoji ni exclamation.
- Un changement de valeur de jeton est une version majeure. Un ajout de composant est
  mineur : cette livraison sera la **0.2.0**.

---

## Ce que le motif de référence apporte, et ce qu'on lui refuse

Le commanditaire a montré le portail de compte d'une autre entreprise, rendu sur téléphone.

**Ce qu'on reprend**, parce que c'est la bonne réponse au pouce et au petit écran :

| Élément | Pourquoi |
| ------- | -------- |
| Barre d'onglets fixée en bas | Le pouce atteint le bas de l'écran, pas le haut. Une navigation en haut d'un téléphone de 6 pouces demande de changer la prise en main |
| En-tête mince et collant | L'identité et la sortie de session restent atteignables sans remonter tout le défilement |
| Cartes empilées, une action par carte | Une colonne unique, pas de grille : la grille produit des cibles de 150 px de large |
| Icône en pastille, titre, description, bouton | Le bouton nomme sa destination, il ne dit pas « Voir » |

**Ce qu'on lui refuse**, et il faut l'écrire parce que la ressemblance sera tentante :

| Élément du motif | Décision AI5D | Raison |
| ---------------- | ------------- | ------ |
| Une couleur par section, vert / bleu / jaune | **Refusé** | La charte mère écrit que la différenciation se fait par le nom, jamais par la couleur. Et le budget chromatique plafonne le bleu et le vert réunis à un dixième de la surface |
| Fond de carte teinté | **Refusé** | Le vert et le jaune y deviennent décoratifs. Or ce sont des jetons sémantiques : un fond vert doit vouloir dire « réussite », sinon il ne veut plus rien dire nulle part |
| Boutons entièrement arrondis | **Refusé** | Le rayon de bouton du système vaut 10 px. Le rayon plein est réservé aux pastilles et aux avatars |
| Quatre onglets dont « Plus » | **Repris, et borné** | Trois à cinq onglets. Au-delà, le dernier devient « Plus » |

---

## Les paliers

Cinq valeurs, dont deux ne sont pas des points de bascule mais des contraintes.

| Constante | Valeur | Nature | Ce qu'elle veut dire |
| --------- | ------ | ------ | -------------------- |
| `PLANCHER` | 320 px | contrainte | Aucune mise en page ne casse en dessous. Ce n'est pas un palier : rien ne s'y déclenche |
| `REFERENCE_MOBILE` | 390 px | contrainte | La largeur sur laquelle on dessine en premier |
| `COMPACT` | 640 px | palier | Les marges de page passent de 16 à 24 px |
| `TABLETTE` | 768 px | palier | La barre d'onglets disparaît au profit de la navigation d'en-tête |
| `BUREAU` | 1024 px | palier | Deux colonnes deviennent possibles. C'est déjà la bascule de `GabaritAuth` |
| `LARGE` | 1280 px | palier | Le contenu est plafonné et centré |

**640 et non 480.** Mesure faite sur `GabaritAuth` : le formulaire vaut 440 px et les marges
de 32 px en ajoutent 64. Il faut donc au moins 504 px pour passer aux marges larges. 640 est
la valeur ronde immédiatement au-dessus, et c'est celle qui est déjà en production.

---

## Structure des fichiers

| Fichier | Responsabilité |
| ------- | -------------- |
| `noyau/paliers.ts` | **Créer.** Les six constantes, le type `Palier`, la fonction `auDela` |
| `noyau/paliers.css` | **Créer.** Les variables de marge et de barre, les zones sûres, les deux règles universelles |
| `noyau/PALIERS.md` | **Créer.** La doctrine, les paliers, les sept règles, ce que le motif de référence apporte et ce qu'on lui refuse |
| `noyau/composants/BarreOnglets.tsx` | **Créer.** La navigation basse |
| `noyau/composants/GabaritApp.tsx` | **Créer.** La coquille : en-tête, contenu, barre d'onglets |
| `noyau/composants/CarteAction.tsx` | **Créer.** Le motif « icône, titre, description, action » |
| `noyau/composants/index.ts` | **Modifier.** Trois exports de plus, et leurs constantes |
| `noyau/ai5d.preset.css` | **Modifier.** Importer `paliers.css` |
| `gardes/index.ts` | **Modifier.** Deux gardes de plus |
| `package.json` | **Modifier.** Version 0.2.0, exports `./paliers` et `./noyau/paliers.css` |
| `noyau/NOYAU.md` | **Modifier.** Section paliers, et correction de la ligne périmée sur `CarteAuth` |
| `CHANGELOG.md` | **Modifier.** Entrée 0.2.0 |
| `README.md` | **Modifier.** Le mobile dans la présentation |
| `tests/paliers.test.ts` | **Créer.** |
| `tests/composants/mobile.test.tsx` | **Créer.** |
| `tests/index.test.ts` | **Modifier.** Onze composants, pas huit |
| `tests/preset.test.ts` | **Modifier.** La chaîne d'import compte un maillon de plus |
| `gardes/gardes.test.ts` | **Modifier.** Les deux nouvelles gardes |
| `docs/charte/source/charte.html` | **Modifier.** Chapitre 12, deux pages |
| `docs/charte/source/generer-docx.py` | **Modifier.** Le même chapitre |

---

## Tâche 1 — Les paliers

**Fichiers :**

- Créer : `noyau/paliers.ts`, `noyau/paliers.css`, `noyau/PALIERS.md`
- Modifier : `noyau/ai5d.preset.css`, `package.json`
- Test : `tests/paliers.test.ts`

**Interfaces :**

- Consomme : rien.
- Produit : `PLANCHER`, `REFERENCE_MOBILE`, `COMPACT`, `TABLETTE`, `BUREAU`, `LARGE`,
  `PALIERS`, `type Palier`, `auDela(palier: Palier): string`.
  Les variables CSS `--marge-page`, `--hauteur-barre-onglets`, `--zone-sure-basse`,
  `--zone-sure-haute`.

- [ ] **Étape 1 : écrire `noyau/paliers.ts`**

Les constantes, avec dans l'en-tête la raison de chaque valeur. `auDela` rend une chaîne de
requête média, pour que personne ne réécrive `(min-width: 768px)` à la main.

- [ ] **Étape 2 : écrire `noyau/paliers.css`**

Aucune couleur. Trois choses seulement : les variables de marge par palier, les hauteurs et
zones sûres de la barre d'onglets, et les deux règles universelles — `text-size-adjust` pour
qu'iOS n'agrandisse pas le texte en paysage, et `max-width: 100%` sur les médias pour qu'une
image ne pousse pas la page hors de l'écran.

**Ce qu'on n'y met pas :** `overflow-x: hidden`. Il masquerait un débordement au lieu de le
révéler, et c'est exactement l'inverse de ce que le système fait ailleurs.

- [ ] **Étape 3 : brancher le préréglage et le paquet**

`@import './paliers.css'` dans `ai5d.preset.css`, après les jetons et avant les densités.
Ajouter les exports `./paliers` et `./noyau/paliers.css` au `package.json`, et passer la
version à `0.2.0`.

- [ ] **Étape 4 : écrire `noyau/PALIERS.md`**

La doctrine, le tableau des paliers avec la justification du 640, les sept règles, et les
deux tableaux « ce qu'on reprend » et « ce qu'on refuse ».

- [ ] **Étape 5 : écrire `tests/paliers.test.ts`**

```ts
it('ordonne les paliers strictement', () => {
  expect(PLANCHER).toBeLessThan(REFERENCE_MOBILE);
  expect(REFERENCE_MOBILE).toBeLessThan(COMPACT);
  expect(COMPACT).toBeLessThan(TABLETTE);
  expect(TABLETTE).toBeLessThan(BUREAU);
  expect(BUREAU).toBeLessThan(LARGE);
});

it('laisse passer le formulaire de GabaritAuth avant d elargir les marges', () => {
  // 440 px de formulaire plus deux marges de 32 px
  expect(COMPACT).toBeGreaterThanOrEqual(LARGEUR_FORMULAIRE + 64);
});

it('aligne la bascule deux colonnes sur le palier bureau', () => {
  expect(BASCULE_DEUX_COLONNES).toBe(BUREAU);
});

it('n ecrit ni couleur ni taille de police dans paliers.css', () => {
  expect(css).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
  expect(css).not.toMatch(/font-size/);
});

it('reserve la zone sure du bas', () => {
  expect(css).toContain('env(safe-area-inset-bottom');
});
```

- [ ] **Étape 6 : marquer « écrite, non testée » et commiter**

```bash
git add noyau/paliers.ts noyau/paliers.css noyau/PALIERS.md noyau/ai5d.preset.css package.json tests/paliers.test.ts
git commit -m "Paliers : le mobile devient le point de depart, pas un palier d adaptation"
```

---

## Tâche 2 — La barre d'onglets

**Fichiers :**

- Créer : `noyau/composants/BarreOnglets.tsx`
- Test : `tests/composants/mobile.test.tsx`

**Interfaces :**

- Consomme : `TABLETTE` de `noyau/paliers.ts`, `Icone` du noyau.
- Produit : `BarreOnglets`, `type Onglet`, `type ProprietesBarreOnglets`,
  `HAUTEUR_BARRE_ONGLETS = 56`, `ONGLETS_MIN = 3`, `ONGLETS_MAX = 5`.

- [ ] **Étape 1 : écrire le composant**

```ts
export interface Onglet {
  id: string;
  libelle: string;
  icone: LucideIcon;
  href?: string;
}
```

Rendu : un `<nav>` avec `aria-label`, une liste d'éléments qui sont des `<a>` quand `href`
est fourni et des `<button>` sinon. L'onglet actif porte `aria-current="page"`.

**Trois garanties non négociables :**

1. **Chaque onglet porte une icône et un mot.** Jamais l'icône seule.
2. **L'état actif ne passe pas que par la couleur.** Il change aussi la graisse du libellé,
   de normale à semi-grasse.
3. **La zone sûre du bas est réservée.** Sans elle, la barre passe sous la barre de gestes
   d'un iPhone, et le dernier onglet devient inatteignable.

Elle disparaît à partir de `TABLETTE` : au-delà, la navigation remonte dans l'en-tête.

- [ ] **Étape 2 : écrire les tests**

```tsx
it('rend un onglet par entree, avec son icone ET son mot', () => { … });
it('marque l onglet actif par aria-current', () => { … });
it('ne signale pas l etat actif par la seule couleur', () => {
  // la graisse du libelle actif differe de celle des autres
});
it('respecte le plancher tactile sur chaque onglet', () => { … });
it('reserve la zone sure du bas', () => { … });
it('disparait a partir du palier tablette', () => { … });
it('rend des liens quand href est fourni, des boutons sinon', () => { … });
it("n'ecrit aucune couleur en dur", () => { … });
```

- [ ] **Étape 3 : marquer « écrite, non testée » et commiter**

---

## Tâche 3 — La coquille d'application

**Fichiers :**

- Créer : `noyau/composants/GabaritApp.tsx`
- Test : `tests/composants/mobile.test.tsx` (même fichier, section suivante)

**Interfaces :**

- Consomme : `BarreOnglets`, `Onglet`, `HAUTEUR_BARRE_ONGLETS`, `Logotype`, les paliers.
- Produit : `GabaritApp`, `ProprietesGabaritApp`, `HAUTEUR_ENTETE = 56`.

- [ ] **Étape 1 : écrire le composant**

Trois zones : un `<header>` collant qui porte le logotype et les actions de droite, un
`<main>` défilant, et la barre d'onglets.

**La mesure qui compte :** `<main>` réserve en bas
`HAUTEUR_BARRE_ONGLETS + env(safe-area-inset-bottom)`. Sans cette réserve, le dernier
élément de la page se glisse **sous** la barre et devient inatteignable, ce qui ne se voit
pas tant qu'on teste sur des pages courtes.

À partir de `BUREAU`, le contenu est plafonné à `--contenu-max` et centré. La réserve basse
tombe à zéro, puisque la barre a disparu au palier précédent.

- [ ] **Étape 2 : écrire les tests**

```tsx
it('rend les trois reperes de structure : banner, main, navigation', () => { … });
it('reserve la hauteur de la barre sous le contenu', () => { … });
it('ne reserve rien quand il n y a pas d onglets', () => { … });
it('plafonne le contenu au palier bureau', () => { … });
it('porte le logotype et le nom du produit', () => { … });
```

- [ ] **Étape 3 : commiter**

---

## Tâche 4 — La carte d'action

**Fichiers :**

- Créer : `noyau/composants/CarteAction.tsx`
- Test : `tests/composants/mobile.test.tsx`

**Interfaces :**

- Consomme : `Carte`, `Bouton`, `Icone`.
- Produit : `CarteAction`, `ProprietesCarteAction`, `TAILLE_PASTILLE_ICONE = 48`.

- [ ] **Étape 1 : écrire le composant**

Pastille circulaire de 48 px en `--surface-chaude`, icône de 24, titre en H3, description en
`--texte-faible`, bouton dont le libellé **nomme sa destination**.

Le bouton occupe toute la largeur sous `COMPACT`, et sa largeur naturelle au-delà : sur un
téléphone, un bouton de 120 px aligné à gauche laisse le pouce viser.

Une seule variante primaire par vue. Le composant ne peut pas le vérifier tout seul ; il
prend `variante` en propriété et le documente.

- [ ] **Étape 2 : écrire les tests**

```tsx
it('rend la pastille, le titre, la description et l action', () => { … });
it('donne une icone decorative, jamais porteuse de l information', () => { … });
it('rend le bouton pleine largeur sous le palier compact', () => { … });
it("n'ecrit aucune couleur en dur", () => { … });
```

- [ ] **Étape 3 : brancher l'index et commiter**

`noyau/composants/index.ts` exporte les trois composants, leurs types et leurs constantes.
`tests/index.test.ts` passe de huit à onze composants attendus.

---

## Tâche 5 — Les deux gardes

**Fichiers :**

- Modifier : `gardes/index.ts`, `gardes/gardes.test.ts`

**Interfaces :**

- Produit : `verifierAucuneLargeurFixe(racine, options)`,
  `verifierHauteurDeVueDynamique(racine, options)`.

- [ ] **Étape 1 : écrire les gardes**

`verifierAucuneLargeurFixe` refuse toute déclaration `width` chiffrée en pixels au-delà du
plancher de 320 px. `max-width` et `min-width` sont légitimes et ne sont pas examinés : ce
sont eux qui rendent une mise en page souple.

`verifierHauteurDeVueDynamique` refuse `vh` et exige `dvh`. Sur un téléphone, la barre
d'URL du navigateur entre et sort du cadre pendant le défilement ; `100vh` vaut la hauteur
**sans** elle, si bien qu'un écran calé sur `100vh` se fait couper au chargement et se
réajuste au premier geste.

- [ ] **Étape 2 : écrire les tests, y compris sur le dépôt lui-même**

```ts
it('accepte max-width et min-width, qui sont la solution et non le probleme', () => { … });
it('refuse une largeur fixe au-dela du plancher', () => { … });
it('tolere une largeur fixe sous le plancher : une icone, une pastille', () => { … });
it('refuse 100vh et accepte 100dvh', () => { … });
it('le systeme de design passe ses propres nouvelles gardes', () => { … });
```

- [ ] **Étape 3 : commiter**

---

## Tâche 6 — La documentation

**Fichiers :**

- Modifier : `noyau/NOYAU.md`, `CHANGELOG.md`, `README.md`

- [ ] **Étape 1 : `NOYAU.md`**

Nouvelle section « Les paliers », et **correction de la ligne périmée** du tableau des
composants : elle annonce encore `CarteAuth` avec une largeur bloquée à 420 px, alors que le
composant s'appelle `GabaritAuth` depuis la 0.1.1 et tient sur deux colonnes. Le tableau
passe à onze lignes.

- [ ] **Étape 2 : `CHANGELOG.md`**

Entrée 0.2.0 : ce qui est ajouté, ce qui est refusé du motif de référence, et pourquoi c'est
une version mineure et non majeure — aucune valeur de jeton ne change.

- [ ] **Étape 3 : `README.md`**

Le mobile entre dans la présentation du système et dans le tableau des gardes.

- [ ] **Étape 4 : commiter**

---

## Tâche 7 — La charte de référence

**Fichiers :**

- Modifier : `docs/charte/source/charte.html`, `docs/charte/source/generer-docx.py`
- Regénérer : le PDF et le DOCX

- [ ] **Étape 1 : écrire le chapitre 12, « Mobile d'abord »**

Deux pages. La première porte la doctrine, les paliers et les sept règles. La seconde porte
la coquille d'application, reproduite à l'échelle comme le gabarit d'authentification l'est
au chapitre 11, plus le tableau de ce qu'on refuse au motif de référence.

Les chapitres 12 à 15 deviennent 13 à 16. Le sommaire passe de quinze à seize lignes, et son
titre avec.

- [ ] **Étape 2 : imprimer, contrôler, regarder**

```bash
python "$HOME/.claude/skills/document-premium/scripts/imprimer.py" charte.html ../AI5D_Digital_Design_System_Charte.pdf
```

Puis le contrôle géométrique mot par mot : aucun texte ni aplat ne franchit le filet de pied
de page ni les marges latérales. Puis le rendu des pages en image, et les regarder.

- [ ] **Étape 3 : regénérer le DOCX**

- [ ] **Étape 4 : commiter**

---

## Tâche 8 — La vérification, d'un seul bloc

- [ ] **Étape 1 : les trois commandes**

```bash
pnpm typecheck
pnpm lint
pnpm test
```

- [ ] **Étape 2 : corriger ce qui échoue, puis relancer jusqu'au vert**

- [ ] **Étape 3 : consigner les preuves**

La sortie réelle des trois commandes, recopiée, pas résumée. Et la liste honnête de ce qui
n'est pas couvert : jsdom ne rend pas les requêtes média, il ne peut donc pas prouver que la
barre d'onglets disparaît réellement à 768 px. Le test lit la règle CSS injectée ; c'est une
preuve de la règle, pas du rendu. Le rendu se vérifie à l'écran.

- [ ] **Étape 4 : commiter et pousser**

---

## Ce que ce plan ne fait pas

| Hors périmètre | Raison |
| -------------- | ------ |
| Les espaces d'administration | Le commanditaire les a explicitement exclus. Un tableau de bord d'admin se conçoit pour un écran large, et le prétendre mobile coûterait sans servir personne |
| La navigation latérale de bureau | Elle appartient à la couche écosystème : elle lit les droits pour savoir quoi afficher |
| Les gestes tactiles, balayage et tiré pour rafraîchir | Ils ne sont pas un besoin constaté. Écrits maintenant, ils figeraient une hypothèse |
| Une application native ou une PWA | Autre chantier, autre spec |
