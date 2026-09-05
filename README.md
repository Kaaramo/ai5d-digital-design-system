# AI5D Digital Design System

> Le système de design **applicatif** de l'écosystème AI5D.
> La couche entre la marque institutionnelle et chaque produit.

La marque AI5D existe, elle est bonne, et **elle ne bouge pas**. Ce dépôt ne la remplace
pas : il dit ce qu'elle accorde à une **interface applicative**, par opposition à une page
de communication.

Sans ce document, chaque produit re-dérive la charte du produit précédent en réargumentant
les mêmes décisions pour un usage différent. L'Académie l'a fait la première. La Platform
l'a fait ensuite. Le Cercle et le Lab l'auraient fait à leur tour.

**Ce que reçoit un nouveau produit AI5D : ce dossier, et une seule ligne à écrire —**
le profil de densité qu'il adopte.

---

## Les deux registres

| | Institutionnel | Applicatif |
| --- | --- | --- |
| Où | Site, documents, slides, communication | Tous les produits |
| Autorité | `AI5D_Brand_2026` | **Ce dépôt** |
| Angles | 0 px partout | 4 / 10 / 16 px |
| Ombres | Aucune, jamais | Trois niveaux, neutralisés en sombre |
| Typographie | Inter seule | Fraunces + Inter + JetBrains Mono |
| Surfaces | Blanc pur | Papier tiède, et mode sombre complet |

Ce ne sont pas deux marques. C'est une marque et deux problèmes de design : on **visite**
un site trois minutes en position de jugement, on **habite** une application quarante
minutes d'affilée.

## Les quatre densités

Même ADN partout — palette, typographies, composants, iconographie, langage graphique.
Seule varie la densité fonctionnelle.

| Produit | Profil | Pourquoi |
| ------- | ------ | -------- |
| Académie | `aere` | Lecture, apprentissage, respiration |
| Compte | `equilibre` | Gestion, sécurité, paramètres |
| Cercle | `modere` | Communauté, interactions, flux |
| Lab | `compact` | Données, workflows, outils |

**La densité change l'espace entre les choses, jamais la taille du texte.** Et le plancher
tactile de 44 px prime sur les quatre profils, sur tout appareil tactile.

## Les trois couches

| Couche | Contenu | Change |
| ------ | ------- | ------ |
| `noyau/` | Jetons, typographie, composants de base, iconographie, voix, mode sombre | Presque jamais |
| `densites/` | Quatre profils, un tableau, aucune prose | Si un produit s'ajoute |
| `ecosysteme/` | Lockups produit, composants inter-produits, courriels, écrans système | Au rythme des produits |

Ce découpage n'est pas cosmétique. Les écarts constatés entre les chartes existantes
viennent de ce que le noyau et les libertés étaient mélangés dans un même document :
quand tout se discute, tout dérive.

## Adoption

```ts
import '@ai5d/design-system/noyau/jetons.css';
import '@ai5d/design-system/densites/profils.css';
import { ai5dPreset } from '@ai5d/design-system/preset';
```

```html
<html lang="fr" data-densite="equilibre">
```

## Les gardes

Trois tests livrés par le système, exécutés par chaque projet consommateur. Ils remplacent
la discipline humaine.

- `aucune-couleur-en-dur` — aucun `#RRGGBB` hors du fichier de jetons
- `aucun-jeton-de-marque-redefini` — aucun produit ne dérive `--encre`, `--action`, `--navy`
- `cible-tactile-minimale` — tout élément interactif ≥ 44 px sur écran tactile

Plus une quatrième, propre au système : le **contraste de chaque jeton sémantique est
recalculé à chaque build** contre ses surfaces déclarées, et le build échoue sous 4,5.

## État

**Cadrage validé, implémentation non commencée.**

| Document | Chemin |
| -------- | ------ |
| Spécification | [`docs/superpowers/specs/2026-09-05-ai5d-digital-design-system-design.md`](docs/superpowers/specs/2026-09-05-ai5d-digital-design-system-design.md) |
| Plan d'implémentation | à produire |

Le chantier est découpé en sept lots. Les trois premiers — polices et jetons, composants de
base, densités — forment un tout et débloquent les autres. Les quatre suivants attendent
leur consommateur : on ne construit une brique d'écosystème que quand un deuxième produit
la demande.

## Relation aux autres dépôts

```
AI5D_Brand_2026            la marque. Ne bouge pas. Registre institutionnel.
        │  invariants cités, jamais redéfinis
        ▼
ai5d-digital-design-system     ← ce dépôt. Registre applicatif.
        │
   ┌────┴─────┬──────────┬─────────┐
   ▼          ▼          ▼         ▼
Académie   Compte     Cercle     Lab
```

---
© AI5D · ai5d.technology · 2026
