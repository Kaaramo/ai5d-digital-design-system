# Le menu d'actions, moteur par moteur

Commit `33c2b6e`, 28/09/2026. Banc d'essai, page `menu`, fenêtre de 1 024 x 700.

```

== chromium 141.0.7390.37
ancre CSS prise en charge : true
Entrée sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
position : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Flèche bas : {"ouvert":"Actions pour Aïssatou Camara","focus":"Voir la fiche"}
Flèche bas deux fois, le filet sauté : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Flèche bas en fin de menu, la boucle : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Fin : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Début : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Échap : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Flèche haut sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Tab : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Clic sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Clic à côté : {"ouvert":null,"focus":"BODY"}
menu d'une ligne après défilement de la table : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Défilement de la page, menu ouvert : {"ouvert":"Actions pour Ibrahima Sow","focus":"Corriger l’adresse"}
menu au bord bas de la fenêtre : {"ecartSousDeclencheur":-259,"ecartAuDessus":4,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
erreurs de console : aucune

== chromium, repli sans ancre SIMULÉ 141.0.7390.37
ancre CSS prise en charge : false
Entrée sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
position : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Flèche bas : {"ouvert":"Actions pour Aïssatou Camara","focus":"Voir la fiche"}
Flèche bas deux fois, le filet sauté : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Flèche bas en fin de menu, la boucle : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Fin : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Début : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Échap : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Flèche haut sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Tab : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Clic sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Clic à côté : {"ouvert":null,"focus":"BODY"}
menu d'une ligne après défilement de la table : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Défilement de la page, menu ouvert : {"ouvert":null,"focus":"Actions pour Ibrahima Sow"}
menu au bord bas de la fenêtre : {"ecartSousDeclencheur":-259,"ecartAuDessus":4,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
erreurs de console : aucune

== firefox : non installé sur ce poste, non couvert

== webkit : non installé sur ce poste, non couvert
```

## Lecture, geste par geste (SPEC §5.3.4)

| Geste | Attendu | Chromium 141 | Chromium 141, repli sans ancre simulé | Firefox | WebKit |
| ----- | ------- | ------------ | ------------------------------------- | ------- | ------ |
| Entrée sur le déclencheur | Ouvre ; premier élément | Ouvert, focus « Corriger l’adresse » | Idem | Non constaté sur ce poste | Non constaté sur ce poste |
| Clic sur le déclencheur | Ouvre ; premier élément | Ouvert, focus « Corriger l’adresse » | Idem | Non constaté | Non constaté |
| Flèche haut sur le déclencheur | Ouvre ; dernier élément | Ouvert, focus « Retirer de la session » | Idem | Non constaté | Non constaté |
| Flèche bas sur le déclencheur | Ouvre ; premier élément | Non joué au navigateur (jsdom seulement) | Non joué | Non constaté | Non constaté |
| Flèche bas dans le menu | Suivant ; le filet est sauté | « Voir la fiche », puis « Retirer de la session » après « Renvoyer l’invitation » | Idem | Non constaté | Non constaté |
| Flèche bas en fin de menu | Boucle | Retour à « Corriger l’adresse » | Idem | Non constaté | Non constaté |
| Début, Fin | Premier, dernier | « Corriger l’adresse », « Retirer de la session » | Idem | Non constaté | Non constaté |
| Échap | Referme ; focus au déclencheur | Fermé, focus sur « Actions pour Aïssatou Camara » | Idem | Non constaté | Non constaté |
| Tab | Referme ; focus au déclencheur | Fermé, focus sur le déclencheur | Idem | Non constaté | Non constaté |
| Maj+Tab | Referme ; focus au déclencheur | Non joué au navigateur | Non joué | Non constaté | Non constaté |
| Entrée ou Espace sur un élément | Referme, focus au déclencheur, puis `onChoisir` | Non joué au navigateur (jsdom : l’ordre focus puis `onChoisir` est testé au clic) | Non joué | Non constaté | Non constaté |
| Clic à côté | Referme ; le focus reste où la personne l’a posé | Fermé, focus au document (`BODY`) | Idem | Non constaté | Non constaté |
| Placement | Sous le déclencheur, bords de fin alignés, dans la fenêtre | 4 px dessous, bords alignés, 192 px (12rem), dans la fenêtre | Idem, par la mesure à l’ouverture | Non constaté | Non constaté |
| Menu d’une ligne d’une table qui défile | Sort de la table | 4 px sous son déclencheur, dans la fenêtre | Idem | Non constaté | Non constaté |
| Défilement de la page, menu ouvert | Avec l’ancre : suit ; sans : se referme | Reste ouvert (« Actions pour Ibrahima Sow ») | **Se referme**, focus au déclencheur | Non constaté | Non constaté |
| Au bord bas de la fenêtre | S’ouvre au-dessus | 4 px au-dessus du déclencheur, dans la fenêtre | Idem | Non constaté | Non constaté |
| Erreurs de console | Aucune | Aucune | Aucune | Non constaté | Non constaté |

Safari : non constaté, faute d’appareil. Firefox : non constaté sur ce poste (Playwright 1.56.1 n’y a
installé que Chromium). WebKit : non constaté sur ce poste ; WebKit de Playwright n’est pas Safari.
Karamo peut rejouer la sonde sur son poste, où Playwright 1.57 avait les trois moteurs en 1.2.0.

## Après la relecture : Chromium 125 à 128, et un menu plus haut que la fenêtre

Relecture de la 1.3.0, constats I2 et M8. Commit `6db360a`, 28/09/2026. Même commande ; la sonde joue
désormais une troisième passe, qui simule Chromium 125 à 128 : `CSS.supports` rend vrai pour
`anchor-name` et faux pour `position-area`, et `position-area` est neutralisé dans la feuille, comme
ces moteurs l'ignorent. Elle ouvre enfin le premier menu dans une fenêtre de 180 px de haut, puis fait
défiler le menu lui-même.

Avant la réparation, cette troisième passe n'existait pas ; la relecture l'a jouée à la main dans
Chromium 141 en retirant `position-area` : le menu s'ouvrait en `{"x":0,"y":0}`. La première sonde
après `ed2a6e1`, lancée avec la simulation d'origine (qui ne refusait que `anchor`), montrait le même
défaut sous la condition corrigée (écart de -85 px sous le déclencheur, bords non alignés) : la
simulation refuse désormais aussi `position-area`, et la troisième passe joue le cas de la relecture.

```
== chromium 141.0.7390.37
anchor-name pris en charge : true ; position-area : true
Entrée sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
position : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Flèche bas : {"ouvert":"Actions pour Aïssatou Camara","focus":"Voir la fiche"}
Flèche bas deux fois, le filet sauté : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Flèche bas en fin de menu, la boucle : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Fin : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Début : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Échap : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Flèche haut sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Tab : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Clic sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Clic à côté : {"ouvert":null,"focus":"BODY"}
menu d'une ligne après défilement de la table : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Défilement de la page, menu ouvert : {"ouvert":"Actions pour Ibrahima Sow","focus":"Corriger l’adresse"}
menu au bord bas de la fenêtre : {"ecartSousDeclencheur":-259,"ecartAuDessus":4,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
menu plus haut que la fenêtre (180 px) : {"hauteur":148,"fenetre":180,"contenu":208,"defile":true,"dansLaFenetre":false}
Défilement dans le menu : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
erreurs de console : aucune

== chromium, repli sans ancre SIMULÉ 141.0.7390.37
anchor-name pris en charge : false ; position-area : false
Entrée sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
position : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Flèche bas : {"ouvert":"Actions pour Aïssatou Camara","focus":"Voir la fiche"}
Flèche bas deux fois, le filet sauté : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Flèche bas en fin de menu, la boucle : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Fin : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Début : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Échap : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Flèche haut sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Tab : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Clic sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Clic à côté : {"ouvert":null,"focus":"BODY"}
menu d'une ligne après défilement de la table : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Défilement de la page, menu ouvert : {"ouvert":null,"focus":"Actions pour Ibrahima Sow"}
menu au bord bas de la fenêtre : {"ecartSousDeclencheur":-259,"ecartAuDessus":4,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
menu plus haut que la fenêtre (180 px) : {"hauteur":91,"fenetre":180,"contenu":208,"defile":true,"dansLaFenetre":true}
Défilement dans le menu : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
erreurs de console : aucune

== chromium, Chromium 125 à 128 SIMULÉ (anchor-name connu, position-area inconnu) 141.0.7390.37
anchor-name pris en charge : true ; position-area : false
Entrée sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
position : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Flèche bas : {"ouvert":"Actions pour Aïssatou Camara","focus":"Voir la fiche"}
Flèche bas deux fois, le filet sauté : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Flèche bas en fin de menu, la boucle : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Fin : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Début : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Échap : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Flèche haut sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Retirer de la session"}
Tab : {"ouvert":null,"focus":"Actions pour Aïssatou Camara"}
Clic sur le déclencheur : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
Clic à côté : {"ouvert":null,"focus":"BODY"}
menu d'une ligne après défilement de la table : {"ecartSousDeclencheur":4,"ecartAuDessus":-259,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
Défilement de la page, menu ouvert : {"ouvert":null,"focus":"Actions pour Ibrahima Sow"}
menu au bord bas de la fenêtre : {"ecartSousDeclencheur":-259,"ecartAuDessus":4,"bordsDeFinAlignes":true,"largeur":192,"dansLaFenetre":true}
menu plus haut que la fenêtre (180 px) : {"hauteur":91,"fenetre":180,"contenu":208,"defile":true,"dansLaFenetre":true}
Défilement dans le menu : {"ouvert":"Actions pour Aïssatou Camara","focus":"Corriger l’adresse"}
erreurs de console : aucune

== firefox : non installé sur ce poste, non couvert

== webkit : non installé sur ce poste, non couvert
```

| Constat | Chromium 141, ancre | Repli sans ancre simulé | Chromium 125 à 128 simulé |
| ------- | ------------------- | ----------------------- | ------------------------- |
| Placement à l'ouverture | 4 px sous le déclencheur, bords alignés | Idem, par la mesure | **Idem, par la mesure** : le repli tourne, le menu n'est plus en (0, 0) |
| Au bord bas | 4 px au-dessus | Idem | Idem |
| Menu de 208 px dans une fenêtre de 180 px | 91 px, dans la fenêtre, défile | 91 px, dans la fenêtre, défile | 91 px, dans la fenêtre, défile |
| Défilement dans le menu | Reste ouvert | Reste ouvert | Reste ouvert |
| Défilement de la page | Suit son déclencheur | Se referme | Se referme |
| Erreurs de console | Aucune | Aucune | Aucune |

Placé par l'ancre, le menu prenait d'abord 148 px (la borne de la fenêtre) et sortait de la fenêtre : `{"hauteur":148,"fenetre":180,"contenu":208,"defile":true,"dansLaFenetre":false}`
(sonde sur `ed2a6e1`). `position-try-order: most-block-size` et une hauteur bornée à la zone
de l'ancre l'ont ramené dans la fenêtre ; les placements ordinaires n'ont pas bougé. Écart : avec
l'ancre, un menu qui tiendrait dessous mais aurait plus de place dessus s'ouvre dessus ; le repli
préfère toujours dessous quand il tient.
