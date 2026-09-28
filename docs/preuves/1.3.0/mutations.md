# Chaque test et chaque garde de la 1.3.0, vus échouer

Commit `fdf2fc3`. Commande : `node docs/preuves/1.3.0/mutations.mjs`.

| Tache | Mutation | Tests lances, et leur resume | Verdict |
| ----- | -------- | ---------------------------- | ------- |
| T2 | le bouton pose de nouveau sa feuille a chaque instance, forme de la 1.2.0 | tests/feuilles.test.tsx, gardes/gardes.test.ts · Test Files 2 failed (2) ; Tests 8 failed , 67 passed (75) | rougit |
| T2 | la fonction feuille n existe pas encore | tests/feuilles.test.tsx · Test Files 1 failed (1) ; Tests no tests | rougit |
| T3 | la garde accepte toute balise, precedence ou non | gardes/gardes.test.ts · Test Files 1 failed (1) ; Tests 3 failed , 46 passed (49) | rougit |
| T4 | le survol sombre retombe sur la selection, forme de la 1.2.0 | tests/jetons.test.ts · Test Files 1 failed (1) ; Tests 2 failed , 107 passed (109) | rougit |
| T4 | une valeur de jeton de la 1.2.0 change | tests/non-regression.test.ts · Test Files 1 failed (1) ; Tests 2 failed , 18 passed (20) | rougit |
| T5 | le rail survole sur --surface-1, hors de la garde (hover: hover), forme de la 1.2.0 | tests/composants/liens-rail.test.tsx · Test Files 1 failed (1) ; Tests 1 failed , 11 passed (12) | rougit |
| T6 | le bandeau ne sait pas se fermer | tests/composants/composants.test.tsx · Test Files 1 failed (1) ; Tests 3 failed , 103 passed (106) | rougit |
| T7 | la rangee du titre passe en flex-wrap meme sans action | tests/composants/entete-rubrique.test.tsx · Test Files 1 failed (1) ; Tests 2 failed , 3 passed (5) | rougit |
| T8 | l onglet avec compteur perd son nom « Participants, 25 a traiter » | tests/composants/onglets-rubrique.test.tsx · Test Files 1 failed (1) ; Tests 5 failed , 21 passed (26) | rougit |
| T9 | Chiffre ignore compact, et rend la tuile | tests/composants/composants.test.tsx · Test Files 1 failed (1) ; Tests 4 failed , 102 passed (106) | rougit |
| T9 | le squelette compact rend des tuiles de 5rem | tests/composants/composants.test.tsx · Test Files 1 failed (1) ; Tests 1 failed , 105 passed (106) | rougit |
| T10 | MenuActions n existe pas encore | tests/composants/menu-actions.test.tsx · Test Files 1 failed (1) ; Tests no tests | rougit |
| T10 | onChoisir est appele avant que le focus revienne au declencheur | tests/composants/menu-actions.test.tsx · Test Files 1 failed (1) ; Tests 1 failed , 20 passed (21) | rougit |
| T10 | les gestes graves ne sont plus ranges a part | tests/composants/menu-actions.test.tsx · Test Files 1 failed (1) ; Tests 4 failed , 17 passed (21) | rougit |
| T11 | EnteteObjet n existe pas encore | tests/composants/entete-objet.test.tsx · Test Files 1 failed (1) ; Tests no tests | rougit |
| T11 | le fil d Ariane perd son nom | tests/composants/entete-objet.test.tsx · Test Files 1 failed (1) ; Tests 1 failed , 7 passed (8) | rougit |
| T12 | Selecteur n existe pas encore | tests/composants/selecteur.test.tsx · Test Files 1 failed (1) ; Tests no tests | rougit |
| T12 | l aide reste affichee et citee sous une erreur | tests/composants/selecteur.test.tsx · Test Files 1 failed (1) ; Tests 1 failed , 7 passed (8) | rougit |
| T13 | la remise a zero de la coquille perd par la specificite, forme du brouillon de la SPEC | tests/composants/coquille-rail.test.tsx · Test Files 1 failed (1) ; Tests 1 failed , 25 passed (26) | rougit |
| T13 | la reserve du gabarit ne retombe plus a zero au palier tablette | tests/composants/mobile.test.tsx · Test Files 1 failed (1) ; Tests 1 failed , 31 passed (32) | rougit |
| T14 | EnteteObjet devient un module client | tests/index.test.ts · Test Files 1 failed (1) ; Tests 2 failed , 8 passed (10) | rougit |
| T15 | le README annonce encore trente-neuf composants | tests/documentation.test.ts · Test Files 1 failed (1) ; Tests 1 failed , 10 passed (11) | rougit |

Les 22 mutations ont rougi.
Etat apres restauration : aucun changement
