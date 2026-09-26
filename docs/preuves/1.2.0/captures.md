# Captures de la 1.2.0

Commit `c2f8c75`. Commande : `NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/captures.cjs`.

```
Captures de la 1.2.0 · Chromium 143.0.7499.4 · file:///C:/Users/ksthe/Documents/ai5d-design-system/specimens/composants.html

== Pleines pages
  specimens-souris-clair-1280.png · pointer: coarse = false
  specimens-souris-sombre-1280.png · pointer: coarse = false
  specimens-doigt-clair-390.png · pointer: coarse = true
  specimens-doigt-sombre-390.png · pointer: coarse = true

== Selecteur de theme
  doigt 390 : groupe 52 px de haut, segments 44x44, 44x44, 44x44
  souris 1280 : groupe 40 px de haut, segments 32x32, 32x32, 32x32
  specimens-doigt-clair-320.png
    groupe de 272 px, icones : none, none, none, none, none, none, none, none, none, none, none, none
  specimens-souris-clair-768.png
    groupe de 216 px, icones : none, none, none, none, none, none, none, none, none, none, none, none

== Onglets de rubrique
  onglets-debut-390.png
    masque : linear-gradient(to left, rgba(0, 0, 0, 0), rgb(5, 28, 44) 24px)
  onglets-milieu-390.png
    masque : linear-gradient(to right, rgba(0, 0, 0, 0), rgb(5, 28, 44) 24px, rgb(5, 28, 44) calc(100% - 24px), rgba(0, 0, 0, 0))
  onglets-fin-390.png
    masque : linear-gradient(to right, rgba(0, 0, 0, 0), rgb(5, 28, 44) 24px)
  rangee sans defilement impose, scrollLeft au chargement : 244
  onglets-1280.png
    masque, rien ne deborde : none

== Selection et curseur
  selection-clair.png
    light : curseur de saisie rgb(34, 81, 255)
  selection-sombre.png
    dark : curseur de saisie rgb(107, 136, 255)

== Le survol du bouton primaire en lien
  doigt : hover:hover = false, fond avant rgb(34, 81, 255), apres le toucher rgb(34, 81, 255)
  souris : fond au repos rgb(34, 81, 255), au survol rgb(27, 68, 219)
```

## Ce que les captures montrent

Toutes les mesures sont conformes à l'attendu du plan : au doigt, segments de 44 × 44 et groupe de
52 px ; à la souris, 32 × 32 et 40 px ; les trois masques du fondu, aucun à 1 280 px ; la rangée sans
défilement imposé amenée à 244 px sur l'onglet actif ; le curseur de saisie en `rgb(34, 81, 255)` en
clair et `rgb(107, 136, 255)` en sombre ; au doigt, `hover: hover` faux et le même fond avant et après
le toucher ; à la souris, un fond qui change au survol.

Regardées une à une :

- **La sélection** se lit sur les trois surfaces, en clair comme en sombre (`selection-clair.png`,
  `selection-sombre.png`) : texte blanc sur le bleu d'action en clair, encre sur le bleu clair en sombre.
- **Le sélecteur de thème** à 320 px n'écrit plus que les mots (groupe de 272 px, soit 17rem) ; dans
  216 px, de même. Les deux se lisent.
- **Les onglets** montrent le fondu du bon côté : à droite au début, des deux côtés au milieu, à gauche
  à la fin ; l'onglet actif est souligné ; le trait d'attente pulse sous l'onglet en attente.
- **La planche au doigt** (`specimens-doigt-*-390.png`) : titres, lignes au survol et à l'appui, pied
  compact avec son sélecteur, définitions en une colonne dans un conteneur de moins de 480 px, valeur
  copiable dans ses trois états.

**Deux défauts vus pendant cette relecture, corrigés au commit `c2f8c75`, puis tout relancé :**

1. **La page des spécimens débordait à 320 px** (414 px de large ; déjà 400 px en 1.1.0), par son
   propre en-tête de boutons de thème et ses colonnes de 320 px. En émulation mobile, Chromium élargit
   alors le viewport de mise en page et décale le viewport visuel (`offsetTop` de 248 px) : les captures
   d'élément tombaient ailleurs que sur leur cible. Aucune pièce du système n'était en cause ; la page
   de preuve devait tenir au plancher qu'elle prouve.
2. **`ValeurCopiable`, en colonne sous 24rem, laissait un vide de 180 px** entre le champ et son bouton :
   la base flexible du champ, `16rem`, pensée pour une largeur, devenait une hauteur. Défaut réel du
   composant, que ni jsdom ni les tests ne pouvaient voir. Corrigé dans sa feuille, avec un test qui a
   échoué d'abord ; au doigt, le bloc passe de 320 à 140 px.
