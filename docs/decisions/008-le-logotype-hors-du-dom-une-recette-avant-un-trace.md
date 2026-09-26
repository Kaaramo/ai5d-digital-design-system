# 008 · Le logotype hors du DOM : une recette avant un tracé

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

Dans une page, `Logotype` compose « AI5D » en Inter 700, le « 5 » bleu et incliné de -5 degrés, dans
toutes les variantes : c'est un interdit de la charte mère que de le redresser ou de le recolorer.

Hors du DOM, chaque produit recomposait le logotype à sa façon. Le Portail l'écrit en Fraunces bleu
dans son PDF d'attestation et ses images de partage (SPEC P09, §0.3) ; Compte l'écrit d'un bloc en
Fraunces à l'encre dans l'en-tête de ses courriels (`emails/Coquille.tsx:44-53`). Ni l'un ni l'autre
n'incline le « 5 ». Le contrat de P09 demandait `TRACE_LOGOTYPE` : les lettres tracées en chemins
depuis Inter 700.

## Options

**A. Le tracé vectoriel, `TRACE_LOGOTYPE`.** Aucun deuxième consommateur (Compte ne produit ni PDF ni
image de partage), et il demande un outillage de polices que ce dépôt n'a pas.

**B. La recette, `LOGOTYPE`.** Les morceaux, leur rôle, la famille, la graisse, le lettrage,
l'inclinaison du « 5 », l'échelle et l'écart du nom du produit. Aucune couleur : chaque format porte
les siennes dans le fichier que son produit leur réserve. Le composant la lit.

**C. Rien.** Chaque produit continue de recomposer, et de trahir.

## Décision

**B**, exportée par `@ai5d/design-system/logotype`. Le repli que P09 prévoyait (Inter 700, « 5 »
pivoté, §5.22.2 de sa SPEC) devient la voie normale.

## Conséquences

- `Logotype.tsx` lit la recette : son rendu ne change pas d'un pixel, et un test le garde.
- Un client de messagerie qui ignore `transform` redresse le « 5 ». La limite est écrite dans le
  module ; le bleu, lui, passe partout.
- Le tracé appartient au lot L4, remédiation des logotypes (`tasks/todo.md`), et montera avec son
  deuxième consommateur.
