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

## Les trois fonctions `initiales`, comparées avant d'en garder une

**15 septembre 2026.** Trois fonctions calculaient des initiales : celle du système (`Avatar`), une
copie dans `UserButton` du SDK, et celle de Compte (`lib/identifiant.ts`). Avant de supprimer la copie
du SDK, les trois ont tourné sur la même table.

| Cas                                    | Nom                     | Système | SDK   | Compte     |
| -------------------------------------- | ----------------------- | ------- | ----- | ---------- |
| Accent                                 | « élodie Ömer »         | ÉÖ      | ÉÖ    | ÉÖ         |
| Accent décomposé (NFD)                 | « Élodie Martin »       | EM      | EM    | EM         |
| Particule                              | « Jean de La Fontaine » | JD      | JD    | JF         |
| Trait d'union                          | « Marie-Claire Dupont » | MD      | MD    | MC         |
| Prénom composé sans trait              | « Marie Claire Dupont » | MC      | MC    | MC         |
| Nom seul                               | « Awa »                 | A       | A     | AW         |
| Chaîne vide, ou espaces seuls          | « »                     | ?       | (1)   | vide       |
| Espaces multiples, espace insécable    | « Awa Ndiaye »          | AN      | AN    | AN         |
| Caractère hors du plan de base         | « 𝒜wa Ndiaye »          | cassé   | cassé | cassé      |
| Sans nom, adresse `contact@exemple.fr` | l'adresse               | C       | CE    | sans objet |

(1) Le SDK retombait sur l'adresse : « AN » pour `awa.ndiaye@exemple.fr`.

**Deux défauts réels, communs aux trois,** corrigés dans le système en `1.0.1` : l'accent décomposé
perdu, et le caractère hors du plan de base coupé en deux.

**Les écarts qui restent sont des choix, et ils se tranchent ainsi :**

- **Particule, trait d'union, nom seul : le système.** Une personne n'a pas de mot de liaison, l'en-tête
  d'`Avatar` l'écrit. « Jean-Pierre Martin » se reconnaît en JM ; « Awa » en A, et une deuxième lettre
  inventée n'est l'initiale de rien.
- **Nom vide : le repli sur l'adresse reste.** Le SDK passe l'adresse à `Avatar` quand le nom est vide
  ou absent. Le point d'interrogation ne sort que si les deux manquent.
- **Adresse sans nom : le système.** La copie du SDK coupait aussi sur `@` et `.`, et
  « contact@exemple.fr » donnait CE : une lettre du domaine, qui n'est l'initiale de personne. Une
  lettre juste vaut mieux que deux dont une fausse.
- **La fonction de Compte n'est pas un doublon.** Elle calcule les initiales d'une **organisation** : les
  mots courts y sont des liaisons, « Institut de la Vision » donne IV. C'est la règle que la prop
  `lettres` d'`Avatar` laisse à l'appelant. Elle reste dans Compte, pour les organisations seulement.
