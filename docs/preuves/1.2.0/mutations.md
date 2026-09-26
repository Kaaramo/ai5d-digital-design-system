# Chaque garde nouvelle, vue échouer

Commit `dd720c5`. Commande : `node docs/preuves/1.2.0/mutations.mjs`.

| Mutation | Tests lances, et leur resume | Verdict |
| -------- | ---------------------------- | ------- |
| M1 · le plancher relit sa propre propriete, forme de la 1.1.0 | gardes/gardes.test.ts, tests/cycles.test.ts, tests/densites.test.ts, tests/non-regression.test.ts · Tests  15 failed | 106 passed (121) | rougit |
| M2 · une valeur de jeton de la 1.1.0 change | tests/non-regression.test.ts · Tests  1 failed | 14 passed (15) | rougit |
| M3 · un jeton de mouvement pointe vers une duree inexistante | tests/jetons.test.ts · Tests  2 failed | 99 passed (101) | rougit |
| M4 · un lien sortant perd noreferrer | tests/composants/bouton-lien.test.tsx, tests/composants/ligne-lien.test.tsx · Tests  4 failed | 45 passed (49) | rougit |
| M5 · OngletsRubrique devient un module client | tests/index.test.ts, tests/composants/onglets-rubrique.test.tsx · Tests  2 failed | 26 passed (28) | rougit |
| M6 · l export du logotype pointe dans le vide | tests/exports.test.ts · Tests  2 failed | 2 passed (4) | rougit |
| M7 · la couleur du navigateur derive de --surface-1 | tests/composants/theme.test.tsx · Tests  1 failed | 19 passed (20) | rougit |
| M8 · la copie avale son echec | tests/composants/valeur-copiable.test.tsx · Tests  2 failed | 11 passed (13) | rougit |
| M9 · la ligne perd sa hauteur de densite | tests/composants/ligne-lien.test.tsx · Tests  1 failed | 12 passed (13) | rougit |
| M10 · un survol de bouton sort de la garde (hover: hover) | tests/composants/bouton-lien.test.tsx · Tests  1 failed | 35 passed (36) | rougit |
| M11 · la coquille ne se declare plus avec un pied | tests/composants/coquille-rail.test.tsx · Tests  2 failed | 23 passed (25) | rougit |
| M12 · le ton neutre se colore en information | tests/composants/composants.test.tsx · Tests  1 failed | 92 passed (93) | rougit |
| M13 · la garde distribuee exige de nouveau la forme fautive | gardes/gardes.test.ts · Tests  5 failed | 37 passed (42) | rougit |

Toutes les mutations ont rougi.
Fichiers du produit apres restauration : aucun changement
