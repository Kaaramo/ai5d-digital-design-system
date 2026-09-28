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
