# 1.0.0 · La vérification du système

**Date :** 14 septembre 2026 · **Sprint 17 de Compte, tâche 9**

## Les quatre commandes, d'un seul bloc

```
typecheck=0
lint=0
format=0
Test Files  25 passed (25)
     Tests  496 passed (496)
```

En `0.8.1` : 18 fichiers, 404 tests.

## Ce que la première passe a trouvé

La vérification ne s'est pas passée d'un coup, et c'est ce qu'elle est là pour faire. Cinq tests
rouges à la première passe, dont un seul défaut réel.

| Échec                                               | Cause                                                                                              | Réparation                                          |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Garde d'espacement sur `Bandeau.tsx`                | **Un défaut réel.** Un `gap: '12px'` que l'inventaire de la tâche 1 n'avait pas relevé              | Converti en `var(--espace-3)`, aucun pixel ne bouge |
| Frontière client sur `BoiteConfirmation`            | La garde ne reconnaissait que les crochets de React, pas `useDialogueModal`                        | Tout `use` suivi d'une capitale est un crochet      |
| Frontière client sur `SelecteurTheme`               | `useState<Theme>(` : le paramètre de type échappait au motif, depuis toujours                      | Le motif admet un paramètre de type                 |
| Largeur de colonne et réserve basse de la coquille  | React laisse un `style=""` vide après un nouveau rendu ; le test cherchait l'absence d'attribut    | Le test lit la propriété, pas l'attribut            |
| Le point de `PastilleEtat`                          | Le jsdom du système abandonne `background: currentColor` sans le dire                              | Le test lit la source                               |

La garde de frontière a dû cesser de lire les commentaires en même temps : avec un motif élargi, le
commentaire de `CoquilleRail` qui explique pourquoi elle **ne** lit **pas** `usePathname()` suffisait à
la déclarer cliente.

## Chaque garde neuve, vue échouer

| Mutation                                                  | Ce qui rougit                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------------- |
| M1 · un `gap: 12px` dans `Carte`                          | La garde d'espacement, 1 test                                           |
| M2 · le README installe `#v0.9.0`                         | La garde documentaire, 2 tests : la version, et l'unicité de la version |
| M3 · `NOYAU.md` annonce 33 composants                     | La garde documentaire, 1 test                                           |
| M4 · `--surface-selection` retiré du bloc sombre système | La garde du jeton, 1 test, qui nomme le bloc                            |
| M5 · `LiensRail` n'émet plus `aria-current`               | Son test, 1 test                                                        |
| M6 · `import Link from 'next/link'` dans `Chiffre`        | La garde d'indépendance, 1 test                                         |

Chaque mutation a été jouée par un script qui sauvegarde le fichier, le modifie, lance le test visé et
restaure. Après les six, `git status` ne montrait que les quatre fichiers réparés ci-dessus.

## Ce que la vérification ne couvre pas

**Le rendu.** Aucun composant n'a été vu dans un navigateur à cette étape. La coquille, les dialogues
au clavier, le panneau sombre et le document sur ordinateur se prouvent à la tâche 16, dans Compte,
par la comparaison des captures avant et après.

**La construction d'un produit.** Le système livre du TypeScript non transpilé ; il ne se construit
que dans un produit, et aucune construction n'a été lancée.

**`lucide-react` 1.46.** Le système est vérifié contre la version résolue par sa plage, 1.46 ; Compte
est installé en 1.41. Toutes les icônes importées par le système existent dans les deux.
