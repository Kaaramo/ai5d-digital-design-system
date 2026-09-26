# Les densités

Même ADN partout : palette, typographies, composants, iconographie, bordures, langage
graphique. **Seule varie la densité fonctionnelle.**

**Fichier exécutable :** [`profils.css`](profils.css)

## Le tableau

|                     | AÉRÉ · Académie | ÉQUILIBRÉ · Compte | MODÉRÉ · Cercle | COMPACT · Lab |
| ------------------- | --------------- | ------------------ | --------------- | ------------- |
| Rythme de section   | 64 px           | 48 px              | 40 px           | 32 px         |
| Padding de carte    | 32 px           | 24 px              | 20 px           | 16 px         |
| Hauteur de contrôle | 48 px           | 48 px              | 44 px           | 40 px         |
| Ligne de liste      | 64 px           | 56 px              | 48 px           | 40 px         |
| Interligne du corps | 1,6             | 1,55               | 1,5             | 1,45          |
| Largeur de contenu  | 1120 px         | 1120 px            | 1280 px         | pleine        |

| Produit  | Profil      | Pourquoi                                    |
| -------- | ----------- | ------------------------------------------- |
| Académie | `aere`      | Lecture, apprentissage, respiration         |
| Compte   | `equilibre` | Gestion, sécurité, paramètres               |
| Cercle   | `modere`    | Communauté, interactions, flux              |
| Lab      | `compact`   | Données, workflows, outils, expérimentation |

## Les deux règles

### 1. La densité change l'espace entre les choses, jamais la taille du texte

Ne varient jamais : les couleurs, les polices, les tailles de texte, les rayons,
l'élévation, l'épaisseur des icônes, les significations sémantiques. Un produit qui a
besoin de changer l'un de ces éléments a un problème que la densité ne résout pas.

Sans cette règle, le profil compact devient illisible en six mois. C'est la pente naturelle
de tout profil dense, et elle ne se corrige pas par la vigilance : `tests/densites.test.ts`
échoue si une couleur, une famille ou une taille de police apparaît dans `profils.css`.

### 2. Le plancher tactile de 44 px prime sur les quatre profils

Le Lab descend à 40 px sur un écran de bureau avec une souris. Jamais sur un téléphone :
une cible de 40 px y produit des erreurs de saisie que l'utilisateur attribue à
l'application, jamais à son doigt.

La règle s'exprime une seule fois, en requête média ; elle n'est donc pas négociable écran par
écran. Elle relève la **source** de chaque hauteur, jamais la propriété qu'elle écrit :

```css
/* Chaque profil déclare ses deux sources. */
[data-densite='compact'] {
  --hauteur-controle-profil: 40px;
  --ligne-liste-profil: 40px;
}

/* La valeur que lisent les composants, calculée une fois. */
:root,
[data-densite] {
  --hauteur-controle: var(--hauteur-controle-profil);
  --ligne-liste: var(--ligne-liste-profil);
}

/* Le plancher, sur la source. */
@media (pointer: coarse) {
  :root,
  [data-densite] {
    --hauteur-controle: max(var(--hauteur-controle-profil), 44px);
    --ligne-liste: max(var(--ligne-liste-profil), 44px);
  }
}
```

**Pourquoi l'ancienne forme ne valait rien.** Jusqu'à la 1.1.0, le bloc écrivait
`--hauteur-controle: max(var(--hauteur-controle), 44px)`. Une propriété personnalisée qui se lit
elle-même est invalide au moment du calcul : elle ne vaut ni l'ancienne valeur ni 44 px, elle ne vaut
rien, et la hauteur tombe à celle du contenu. Sur tout écran tactile, chaque bouton valait 44 px
quelle que soit sa taille, et le squelette d'un champ 21 px. Le test et la garde exigeaient cette
forme ; ils la refusent depuis la 1.2.0. Décision
[005](../docs/decisions/005-le-plancher-tactile-sans-cycle.md).

Les valeurs effectives, celles que `tests/densites.test.ts` calcule à chaque exécution et que
`docs/preuves/1.2.0/plancher-tactile.md` mesure dans Chromium :

|                  | AÉRÉ  | ÉQUILIBRÉ | MODÉRÉ | COMPACT |
| ---------------- | ----- | --------- | ------ | ------- |
| Contrôle, souris | 48 px | 48 px     | 44 px  | 40 px   |
| Contrôle, doigt  | 48 px | 48 px     | 44 px  | 44 px   |
| Ligne, souris    | 64 px | 56 px     | 48 px  | 40 px   |
| Ligne, doigt     | 64 px | 56 px     | 48 px  | 44 px   |

Le sélecteur générique `[data-densite]` couvre aussi les profils qu'on ajouterait plus tard
et que personne n'aurait pensé à vérifier.

## Adoption

Une ligne, sur l'élément racine du produit :

```html
<html lang="fr" data-densite="equilibre"></html>
```

C'est toute l'adoption. Les composants du noyau lisent `--hauteur-controle`, `--ligne-liste` et
`--padding-carte` sans savoir quel profil est actif.

## Ajouter un profil

Autorisé quand un produit ne rentre dans aucun des quatre, avec démonstration à l'appui.
Un profil s'ajoute dans `profils.css`, **avant** le bloc générique et le bloc
`@media (pointer: coarse)`. Il déclare ses deux sources, `--hauteur-controle-profil` et
`--ligne-liste-profil`, et jamais `--hauteur-controle` ni `--ligne-liste` : ce sont les valeurs
calculées. Un profil déclaré après le plancher le remplacerait, et le test vérifie cet ordre.
