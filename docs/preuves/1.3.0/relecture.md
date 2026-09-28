# La relecture de la 1.3.0

Le 28 septembre 2026, par un relecteur neuf, qui n'avait écrit aucune ligne du lot, sur
`origin/main..bef1823` (vingt et un commits), la SPEC, les user stories, le plan et les preuves. Il a
lu sans rien modifier, et joué ses sondes, ses mutations et une montée d'essai du Portail dans des
copies hors du dépôt.

**Verdict du relecteur : aucun constat critique ; quatre constats importants, à corriger avant
l'étiquette `v1.3.0` ; quatorze mineurs. La mineure `1.3.0` est défendable**, à condition que le
journal dise précisément ce qu'un produit verra rougir.

**Après traitement : les quatre importants et dix mineurs sont réparés, chacun avec un test vu échouer
ou une mutation qui rougit ; quatre mineurs, une hypothèse et un faux positif sont reportés, avec leur
motif.**

## Ce que le relecteur a vérifié lui-même

- Le bloc du système relancé sur `bef1823` : `tsc` muet, ESLint muet, Prettier conforme,
  `Test Files 40 passed (40)`, `Tests 830 passed | 1 skipped (831)`.
- Une montée d'essai du Portail (`ad843ea`, copie hors dépôt) : typecheck à 0, 3 152 tests verts ; les
  trois échecs venaient de la copie elle-même (références `file:` refusées par IP08, `git ls-files`
  sans `.git`). Aucun avertissement de React.
- La garde 7 sur le Portail : les cinq feuilles que le plan attendait, aucune dans `app/`.
- L'hydratation des pièces nouvelles dans Chromium 141 (document entier par `renderToString`, puis
  `hydrateRoot`) : une balise `<style>` dans `<head>`, aucune dans `<body>`, aucune erreur ni
  avertissement de console ; les noms calculés par CDP ; les trois gestes du menu que la recette
  n'avait pas joués (flèche bas sur le déclencheur, Maj+Tab, Espace et Entrée sur un élément).
- L'ordre des feuilles face au produit, sondé sous React 19.2.8 (voir M3).
- Les recherches de la tâche 19 (voir plus bas), et G1 à G19 sur tout le diff. Seule entorse à
  §5.0.2 : l'estompage en ligne de `Selecteur` (E7, consigné).

## Les tests vus échouer avant leur code

Les tests des réparations ont été écrits avant elles, puis lancés sur le code de `bef1823` :

```
$ CI=true GITHUB_ACTIONS=true pnpm exec vitest run gardes/gardes.test.ts tests/composants/menu-actions.test.tsx tests/composants/selecteur.test.tsx tests/feuilles.test.tsx tests/composants/composants.test.tsx tests/composants/entete-objet.test.tsx
 FAIL  tests/composants/composants.test.tsx > Chiffre compact (1.3.0) > se lit comme une phrase, sans carte, en chiffres tabulaires
 FAIL  tests/composants/entete-objet.test.tsx > EnteteObjet > porte un fil d Ariane nomme, en liste ordonnee, qui s arrete au parent
 FAIL  tests/composants/menu-actions.test.tsx > MenuActions : le clavier, sur la mecanique doublee > un defilement dans le menu lui-meme ne le referme pas : un long menu defile
 FAIL  tests/composants/menu-actions.test.tsx > MenuActions : le clavier, sur la mecanique doublee > se place par la mesure quand le moteur connait anchor-name mais pas position-area
 FAIL  tests/composants/menu-actions.test.tsx > MenuActions : la feuille > se place par l ancre la ou le moteur connait position-area, et borne sa largeur en rem
 FAIL  tests/composants/menu-actions.test.tsx > MenuActions : la feuille > borne sa hauteur a la fenetre et defile au-dela
 FAIL  tests/composants/selecteur.test.tsx > Selecteur > s aligne sur Champ : meme ecart sous le libelle, meme retrait du texte
 FAIL  gardes/gardes.test.ts > garde 7 - une feuille par composant, une fois par document > releve une balise posee a chaque rendu, avec son message et sa ligne
 FAIL  gardes/gardes.test.ts > garde 7 - une feuille par composant, une fois par document > releve une feuille qui porte precedence sans href : React ne la hisse ni ne la deduplique
 FAIL  gardes/gardes.test.ts > garde 7 - une feuille par composant, une fois par document > releve un href litteral qui contient une espace, que React refuse de hisser
 Test Files  5 failed | 1 passed (6)
      Tests  10 failed | 223 passed (233)
```

Les tests qui gardent un code déjà juste (M1 : la fermeture au clic d'un lien ; I3 : la feuille du
`Selecteur` seul et les pièces nouvelles de `feuilles.test.tsx` ; M2 : le `>` intact) passaient sur
`bef1823` : ils se prouvent par une mutation qui remet le défaut, et chacune rougit
([`mutations.md`](mutations.md), tâche `T19`). Celle de I3 est exactement celle que la relecture avait
vue rester verte (« `Selecteur.tsx:106` retiré, 8 tests sur 8 verts ») : elle fait maintenant rougir
`selecteur.test.tsx` et `feuilles.test.tsx`.

## Les constats et leur traitement

### Importants

| # | Constat | Effet | Traitement | Commit |
| - | ------- | ----- | ---------- | ------ |
| I1 | La garde 7 n'exigeait que `precedence`, pas `href` ; un `href` à espace passait | Une recette de P10 aurait vu la garde verte et cinq cents feuilles dans la page : React ne hisse ni ne déduplique une balise sans `href`, et refuse un `href` à espace | **Réparé.** La garde exige `href` **et** `precedence` dans la balise ouvrante comme dans `createElement`, et relève un `href` littéral qui contient une espace, avec son propre message. Deux tests, vus échouer ; deux mutations ; le message, la SPEC §5.1.5, le journal et la décision 010 disent la règle | `3dd2f78`, `4f5e4c4` |
| I2 | La détection de l'ancre testait `anchor-name`, la feuille s'appuie sur `position-area` | Dans Chromium 125 à 128, `@supports` passait, `position-area` était ignoré, la mesure ne tournait pas : le menu s'ouvrait en haut à gauche de la fenêtre | **Réparé.** Une seule chaîne, `CONDITION_ANCRE = 'position-area: block-end'`, sert à la feuille (`@supports`) et à `ancreConnue()` : elles ne peuvent plus diverger. Un test double `CSS.supports` comme ces moteurs et exige que la mesure tourne ; deux mutations. Joué dans Chromium 141 en simulant ces moteurs : placé 4 px sous le déclencheur, bords alignés ([`menu-navigateurs.md`](menu-navigateurs.md)) | `ed2a6e1` |
| I3 | « Partage la classe et la feuille de Champ » passait à vide ; `feuilles.test.tsx` ne listait aucune pièce nouvelle | Un `Selecteur` seul sur sa page (la ligne de membre de Compte) pouvait perdre bordure, survol et anneau sans qu'un test le dise | **Réparé.** Le `Selecteur` est rendu seul au serveur et son `data-href` lu (`ai5d-champ`, une balise) ; `Bandeau` refermable, `Chiffre` compact, `EnteteObjet`, `MenuActions` et `Selecteur` seul entrent au tableau `CAS` ; la mutation de la relecture rougit désormais | `e453878` |
| I4 | Le guide de montée de Compte ne disait pas les trois tests qui rougissent | Compte aurait monté, compilé, puis vu sa vérification échouer sans que le journal l'annonce | **Réparé.** Le guide nomme `coquille.test.tsx:107`, `coquille-document.test.tsx:185` et `:192`, avec leur réécriture, et `socle.test.ts:82` qui suit la montée des étiquettes (`package.json:53` et `apps/compte/package.json:11`, que `socle.test.ts:99` veut égales). Les réécritures ont été jouées dans une copie de Compte : 105 tests verts ([`montee-compte.md`](montee-compte.md)) | `4f5e4c4`, et le commit des preuves |

### Mineurs réparés

| # | Constat | Traitement | Commit |
| - | ------- | ---------- | ------ |
| M1 | `fermer()` au clic d'un lien du menu n'était gardé par aucun test | Un test : clic sur un lien, en `<a>` natif puis par le lien du produit ; `hidePopover` appelé, `aria-expanded="false"`, focus au déclencheur. Mutation : les deux `onClick` retirés, il rougit | `ed2a6e1` |
| M2 | Le titre annonçait un `>` intact, la chaîne n'en portait pas | Le titre dit ce que le test prouve (un sélecteur descendant) ; un test nouveau rend `MenuActions` au serveur et exige `.ai5d-menu > .ai5d-bouton[aria-expanded='true']`, sans `&gt;` | `e453878` |
| M3 | « Peut voir son ordre s'inverser » restait vague | Le sens mesuré, dans le journal et la décision 010 : sous Next, la feuille du système reste après celles du produit (en production ; en développement, une feuille de page découverte après un composant du système passe après lui) ; hors de Next ou en rendu client seul, elle est insérée en tête de `<head>`. Et le conseil à P10 : une précédence se range selon l'ordre de découverte, jamais selon son nom | `4f5e4c4` |
| M4 | Les décisions 010 et 012 s'ouvraient sur un bloc de code jamais refermé | La première ligne retirée des deux fichiers ; aucune clôture ne reste | `4f5e4c4` |
| M5 | Le fil d'`EnteteObjet`, en `list-style: none`, sans `role="list"` | `role="list"` sur l'`<ol>` ; un test, vu échouer ; les spécimens suivent | `0108a0b`, `6db360a` |
| M6 | `Chiffre` compact collait valeur et libellé : « 212inscriptions » | Une espace entre les deux ; en flex, elle n'est pas rendue et l'écart reste `--espace-2`. Le test lit « 212 inscriptions sur 237 personnes » et a été vu échouer ; les spécimens suivent | `0108a0b`, `6db360a` |
| M7 | `Selecteur` ne s'alignait pas sur `Champ` (8 px contre 6 px sous le libellé, 16 px contre 14 px de retrait) | La SPEC ne dit pas l'inverse : `Champ` exporte `ECART_LIBELLE_CHAMP` et `RETRAIT_CHAMP`, que `Selecteur` reprend. Un test compare les deux rendus, vu échouer. L'estompage désactivé reste en ligne (E7), justifié en commentaire : l'ajouter à la feuille changerait tous les champs d'un produit | `e453878` |
| M8 | Aucun `max-block-size` ; un défilement dans le menu l'aurait refermé | Hauteur bornée à la fenêtre (`calc(100dvh - var(--espace-8))`) et `overflow-y: auto` ; le défilement du menu lui-même ne le referme plus. Sans ancre, la mesure prend le côté le plus grand quand aucun ne suffit et s'y borne. Avec l'ancre, la mesure dans Chromium a montré qu'un menu plus haut que la place des deux côtés sortait encore de la fenêtre : `position-try-order: most-block-size` et une hauteur bornée à la zone de l'ancre l'y ramènent. Trois tests vus échouer, trois mutations. `useLayoutEffect` n'a pas été repris : non demandé ici, et l'image de décalage n'a pas été mesurée | `ed2a6e1`, `6db360a` |
| M12 | Boucles de tests sans compte minimal | `expect(….length).toBeGreaterThan(0)` avant chacune des trois boucles signalées | `0108a0b` |
| M13 | SPEC §5.1.4 : « Compte : non revérifié » | Revérifié : `apps/compte/middleware.ts:126` pose `style-src 'self' 'unsafe-inline'` ; la SPEC le dit, et rien ne change pour Compte | `4f5e4c4` |

## Reportés, avec leur motif

| # | Constat | Motif du report |
| - | ------- | --------------- |
| M9 | Sans l'API `popover` (Safari avant 17, Firefox avant 125), le menu reste affiché dans la ligne et Flèche bas lève `showPopover is not a function` | Baseline 2024 ; aucun produit ne vise ces moteurs. Consigné dans « Ce qui n'est pas couvert » du README des preuves. Un garde `typeof HTMLElement.prototype.showPopover` se pèsera le jour où un produit en aura besoin |
| M10 | `EnteteObjet` et `EnteteRubrique` posent chacun un `h1` ; rien ne dit qu'ils s'excluent | Aucun produit ne les compose encore ; la règle (un écran porte l'un ou l'autre) touche `NOYAU.md` et le contrat de P10, et se pose avec P10, qui rend `EnteteObjet` sous la rubrique Formations |
| M11 | Cibles de 57 x 17 px (lien du fil) et 112 x 22 px (`Chiffre` en lien) | Elles passent par l'exception d'espacement de WCAG 2.5.8 ; changer leur hauteur sous `(pointer: coarse)` change le rendu au doigt et demande une capture ; à trancher avec la recette de P10 |
| M14 | Le nom accessible d'un onglet à compteur est formaté par `Intl` au serveur puis au client | Risque non constaté : même CLDR dans Node et Chromium, aucune erreur d'hydratation au banc. À reprendre si un moteur le montre |
| Hypothèse | Le poids du flux RSC de Next : un composant serveur rendu cinq cents fois y porterait peut-être cinq cents copies du texte de sa feuille | Non mesuré : il faut une page de Next rendue, ce que ni ce dépôt ni la montée d'essai ne font. Le journal ne promet aucun HTML plus léger au-delà de ce que `feuilles.md` mesure ; la mesure se fera sur le poste, avec la page de la console (tâche 20, étape 5) |
| Faux positif | La deuxième recherche de la tâche 19 ne rend pas « aucune mention » | Elle relève `docs/superpowers/plans/2026-09-28-version-1-3-0-console.md`, qui cite le motif `co-authored` dans ses propres commandes de contrôle (26 lignes, par exemple `:88`, `:774`). Aucun autre fichier du diff ; aucun message de commit |

## Les recherches de la tâche 19, relancées sur `6db360a`

```
$ export LC_ALL=C.UTF-8
$ git diff v1.2.0..HEAD -- noyau densites gardes README.md CHANGELOG.md docs/decisions tasks specimens _build | grep -cP '^\+.*[\x{2014}\x{2013}]'
0
$ git diff v1.2.0..HEAD --name-only | xargs grep -lniE 'cl[a]ude|assist[a]nt|co-authored' || echo "aucune mention"
docs/superpowers/plans/2026-09-28-version-1-3-0-console.md
$ git log v1.2.0..HEAD --format=%B | grep -icE 'co-authored|cl[a]ude|assist[a]nt|generat[e]d with'
0
$ git log v1.2.0..HEAD --format='%an <%ae>' | sort -u
Kaaramo <contactkaramo@gmail.com>
```

Sans `LC_ALL=C.UTF-8`, la classe `[—–]` de la commande du plan compare des octets : l'apostrophe
typographique partage les siens avec le tiret, et la recherche rend quatorze fausses lignes. Aucun
emoji dans les lignes ajoutées ; les seuls `!` sont des négations de code.

## Le numéro de version

Mineure, comme le relecteur l'a jugée : aucune valeur de jeton ne change, aucune propriété n'est
retirée, aucun composant ne change de côté. Les réparations n'ajoutent que deux constantes internes à
`Champ.tsx` (`ECART_LIBELLE_CHAMP`, `RETRAIT_CHAMP`), non exportées par l'index. La condition du
relecteur est remplie : le journal dit ce que Compte verra rougir, et dans quel sens l'ordre des
feuilles peut changer.

## Ce que cette relecture ne couvre pas

Firefox, WebKit et Safari ; une page de la console rendue sur le poste ; le poids du flux RSC ; la
construction d'un produit. Les montées d'essai sont dans [`montee-portail.md`](montee-portail.md),
[`montee-compte.md`](montee-compte.md) et [`montee-sdk.md`](montee-sdk.md).
