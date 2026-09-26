# La relecture de la 1.2.0

Le 26 septembre 2026, par un relecteur neuf, qui n'avait écrit aucune ligne du lot, sur le diff
`v1.1.0..e6f4a3f`, la SPEC, les user stories, le plan et les preuves.

**Verdict du relecteur : publiable avec retouches.** Aucun constat critique ni important. Neuf
constats mineurs.

## Ce que le relecteur a vérifié lui-même

- `CI=true pnpm typecheck` à 0 et `CI=true pnpm test` à 709 tests sur 709, relancés sur HEAD.
- **La correction du type de lien (`64a893a`) est juste et complète.** Compilée avec les vrais types de
  Next 16.3.5 et le `@types/react` du Portail, sous ses options (`exactOptionalPropertyTypes`
  compris) : `Lien={Link}` compile dans `LiensRail`, `BarreOnglets`, `GabaritDocument`,
  `OngletsRubrique`, `LigneLien` et `Bouton`. Les seules clés communes à une ancre et à `LinkProps`
  sont `href`, `onClick`, `onMouseEnter` et `onTouchStart`, et les quatre sont traitées.
- **Le Portail compile entier contre les sources de la 1.2.0**, depuis la 1.0.1 : `app`,
  `components`, `lib`, `pdf`, `emails`, `proxy.ts`, `scripts`, `tests`, et le SDK `@ai5d/auth` par
  transitivité, zéro erreur.
- **L'état d'attente mesuré dans Chromium**, sur le spécimen : points du bouton en attente en `flex`
  (au repos `none`) ; points de la ligne en attente en `flex`, chevron en `none` ; trait de l'onglet en
  attente à une opacité de 0,46 pendant l'animation.
- G1 à G19 tenues sur tout le diff ; la voix tenue dans toutes les chaînes d'interface nouvelles.

## Constats, regradés par leur effet

Les constats sont classés par ce qu'une personne ou un produit subirait, et non par le silence de la
SPEC.

| # | Constat | Effet | Traitement |
| - | ------- | ----- | ---------- |
| 1 | La garde du plancher ne retirait les commentaires que dans la recherche des cycles | Une garde distribuée aux produits laissait passer un plancher cassé si un commentaire citait la bonne forme | **Corrigé** (`dd720c5`) : toute la garde lit la feuille sans ses commentaires ; deux tests, vus échouer |
| 4 | Un lien désactivé transmettait `tabIndex`, `onKeyDown`, `onPointerDown`, `onClickCapture` | Un lien annoncé « indisponible » restait atteignable au clavier, et ses gestionnaires se déclenchaient | **Corrigé** (`dd720c5`) : `tabIndex` et tout gestionnaire `on…` écartés dans la branche inerte ; un test, vu échouer |
| 6 | `ListeDefinitions` et `ValeurCopiable` posent `container-type: inline-size` sans largeur propre | Dans une colonne flex centrée (un état vide, un seuil), le composant tombait à 0 px : il disparaissait | **Corrigé** (`dd720c5`) : `inline-size: 100%` ; deux tests, vus échouer ; mesuré dans Chromium, 0 → 600 px dans une colonne de 600 px |
| 2 | `declarationsAutoReferentes` lit ligne par ligne : une déclaration sur deux lignes n'est pas relevée | Cas d'écriture rare ; la forme fautive connue est relevée | Différé |
| 3 | Le commentaire de `ComposantLien` dit que le système ne transmet jamais `onMouseEnter` ; `Bouton` le transmet par `...reste` | Aucun : `Link` l'accepte | Différé |
| 5 | `ListeLignes` rend un `<li>` et son filet quand un enfant rend `null`, `0` ou `''` | Un filet orphelin | Différé |
| 7 | `CoquilleRail` avec `data-pied='compact'` réduit de 16 px la marge basse au-delà de 768 px, où le pied est masqué | 16 px de moins en bas de page sur bureau | Différé |
| 8 | La formulation « Sélectionnez {…} ci-dessus pour la copier » ne s'accorde qu'au féminin | À adapter pour un nom masculin | Différé |
| 9 | Une apostrophe droite dans la page des spécimens (« l'accompagner »), héritée de la 1.1.0 | Page de travail, pas un produit | Différé |

Le bloc de vérification a été relancé en entier après les corrections (714 tests), puis les mutations.
La montée de Compte n'a pas été rejouée après `dd720c5` : ce commit ne change aucun type public, et la
vérification des types du système passe.

## Jugements que le relecteur a écartés

Les feuilles répétées à chaque instance (reportées à la 1.3.0 par la SPEC) ; les survols non gardés de
`LiensRail`, `BarreOnglets` et `GabaritDocument` (inchangés depuis la 1.1.0) ; les cycles indirects entre
propriétés ; la transition de l'appui du bouton (rendu de la 1.1.0 exigé à l'identique) ; les chemins
locaux cités dans les documents de ce dépôt public ; le poids des captures (renvoyé à Karamo) ; un
`aria-label` qui efface la mention du nouvel onglet ; la zone d'appui de `LigneLien` ; les messages de
la garde sans accents. `GrilleCartes` porte le même motif de largeur que le constat 6 depuis la 1.1.0 :
hors de ce lot.

## Recommandation retenue pour le Portail

Une garde de type chez un consommateur qui a Next : un invariant du sprint P09 qui écrit
`const lien: ComposantLien = Link`, pour qu'une évolution de Next se voie dans le Portail, et pas
seulement dans la réplique du système.
