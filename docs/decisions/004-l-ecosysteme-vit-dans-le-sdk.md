# 004 · La couche écosystème vit dans le SDK, pas dans le système

**Date :** 14 septembre 2026 · **Statut :** appliquée · **Version :** 1.0.0

## Contexte

La spécification fondatrice du 5 septembre 2026 prévoyait trois couches dans ce dépôt : `noyau/`,
`densites/`, et `ecosysteme/`, qui aurait porté les composants inter-produits (menu de compte,
sélecteur d'organisation, accès refusé) et les écrans système.

Le README l'a décrite pendant des mois, schéma compris. Le dossier n'a jamais existé.

Entre-temps, ces composants ont été écrits, et ailleurs : `UserButton`, `OrganizationSwitcher` et
`AccesRefuse` vivent dans le SDK `@ai5d/auth`, sous `@ai5d/auth/react`.

## Pourquoi ils sont là, et pourquoi c'est juste

Ces composants **lisent la session et les droits**. Un menu de compte affiche qui est connecté ; un
sélecteur d'organisation liste celles de la personne ; un accès refusé nomme qui peut lever le blocage.
Aucun n'a de sens sans l'identité.

Le système de design, lui, ne connaît ni la session, ni les droits, ni les produits : c'est la règle
qui permet à `CoquilleRail` de se rendre dans un test sans monter une base, et à n'importe quel produit
de l'employer. Mettre dans ce dépôt des composants qui lisent la session l'obligerait à dépendre du SDK,
et le SDK dépend déjà de lui. La dépendance tournerait en rond.

## Options

**A. Créer `ecosysteme/` ici, comme prévu,** et y déplacer les composants du SDK. Le système dépendrait
alors du client d'authentification, et un produit qui ne veut que des boutons installerait un client
d'identité.

**B. Laisser les composants dans le SDK, et le dire.** Le SDK les construit sur les composants du
système (`Avatar`, `Pastille`, `Bouton`) et les expose sous `@ai5d/auth/react`.

## Décision

**B.** La couche écosystème vit dans `@ai5d/auth/react`. Le sens de la dépendance est unique : le SDK
dépend du système, jamais l'inverse.

La spécification fondatrice n'est pas réécrite. Une note en tête renvoie à cette décision : le texte
d'origine dit ce qu'on pensait le 5 septembre, et c'est une information qu'on garde.

## Conséquences

- Le README ne décrit plus de couche `ecosysteme/`, et une garde documentaire le vérifie.
- La règle du deuxième consommateur vaut dans les deux dépôts : un composant qui ne lit pas l'identité
  monte ici quand un deuxième produit en a besoin ; un composant qui la lit monte dans le SDK.
- `UserButton` et `OrganizationSwitcher` recopiaient un disque d'initiales et des styles en ligne. Ils
  passent sur `Avatar` et `Pastille` du système avec la version `1.1.0` du SDK.
