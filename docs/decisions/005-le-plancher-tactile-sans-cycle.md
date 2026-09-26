# 005 · Le plancher tactile sans cycle

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

Depuis la 0.1.0, `densites/profils.css` relevait les deux hauteurs de densité sous
`@media (pointer: coarse)` en écrivant `--hauteur-controle: max(var(--hauteur-controle), 44px)`, et de
même pour `--ligne-liste`. La propriété se lisait elle-même.

Pour le navigateur, une propriété personnalisée qui dépend d'elle-même est invalide au moment du
calcul. Elle ne vaut ni l'ancienne valeur ni 44 px : elle ne vaut rien. Mesuré dans Chromium le
26 septembre 2026, profil `equilibre` : à la souris, 48 px et 56 px ; au doigt, deux valeurs vides, un
élément de hauteur `var(--hauteur-controle)` à 21 px, une ligne à 18 px. `Bouton` et `Champ` étaient
rattrapés par leur hauteur minimale de 44 px : sur téléphone, toutes leurs tailles valaient 44 px.

Le défaut a vécu neuf versions parce que tout le protégeait. `tests/densites.test.ts` exigeait la
forme fautive au caractère près ; `verifierPlancherTactile`, distribuée aux produits, relevait une
infraction si elle manquait ; et jsdom ne calcule aucune propriété personnalisée.

## Options

**A. Relever la hauteur dans chaque composant.** Chaque produit qui lit `--hauteur-controle` dans ses
propres écrans resterait cassé, et la règle unique de la charte deviendrait une règle par composant.

**B. Une troisième propriété lue par les composants**, `--hauteur-controle-tactile`. Tous les
composants et tous les produits changeraient de variable : une rupture pour corriger une feuille.

**C. Séparer la source de la valeur.** Chaque profil déclare `--hauteur-controle-profil` et
`--ligne-liste-profil` ; un bloc générique calcule `--hauteur-controle` et `--ligne-liste` depuis la
source ; le plancher relève la source, jamais la propriété qu'il écrit.

## Décision

**C.** Les deux propriétés que lisent les composants gardent leur nom et leur valeur déclarée ; seule
leur forme change. Au doigt, elles valent enfin ce que `DENSITES.md` documente depuis la 0.1.0.

## Conséquences

- `profils.css` déclare huit propriétés au lieu de six.
- Un profil ajouté plus tard déclare ses deux sources **avant** le bloc générique.
- `verifierPlancherTactile` exige la forme corrigée et refuse toute déclaration qui se lit elle-même,
  n'importe où dans la feuille, avec sa vraie ligne. Un produit qui la lance sur la feuille installée
  passe en 1.2.0.
- Trois preuves, parce qu'aucune ne suffit seule : un test de forme sur toutes les feuilles du système
  (`tests/cycles.test.ts`), un test de valeur effective par un résolveur (`tests/densites.test.ts`), et
  la mesure dans Chromium, avant et après, dans `docs/preuves/1.2.0/plancher-tactile.md`.
- Au doigt, en `equilibre`, un bouton `md` passe de 44 à 48 px, un `lg` de 44 à 56 px, un champ de 44
  à 48 px. C'est le premier point de « Ce qui change à l'écran » dans le journal de la 1.2.0.
