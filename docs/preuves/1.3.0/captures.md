# Captures de la 1.3.0

Commit `33c2b6e`. Commande : `NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/captures.cjs`.

```
Captures de la 1.3.0 · Chromium 141.0.7390.37

== Spécimens, pleines pages
  specimens-clair-1280.png · pointer: coarse = false, aucun débordement
  specimens-sombre-1280.png · pointer: coarse = false, aucun débordement
  specimens-clair-1024.png · pointer: coarse = false, aucun débordement
  specimens-doigt-clair-390.png · pointer: coarse = true, aucun débordement

== Survol et sélection, rendus par React
  survol-clair.png, et sa table seule
    ligne survolée rgb(244, 239, 231), lignes sélectionnées rgb(234, 239, 255) : écart 1.00
    menu rgb(255, 255, 255), élément survolé rgb(244, 239, 231) : écart 1.14
  survol-sombre.png, et sa table seule
    ligne survolée rgb(11, 22, 32), lignes sélectionnées rgb(23, 44, 59) : écart 1.27
    menu rgb(23, 44, 59), élément survolé rgb(11, 22, 32) : écart 1.27
```

## Ce que les captures montrent

Regardées une à une le 28 septembre 2026, et, pour les spécimens au doigt (pleine page de 67 752 px
de haut, illisible en une image), pièce par pièce à 390 px dans la deuxième planche.

- **La table en sombre** (`survol-sombre-table.png`) : la ligne survolée, « Mamadou Diallo », creuse
  vers le fond de page (`rgb(11, 22, 32)`) ; la ligne sélectionnée, « Fatoumata Bah », s'éclaire
  (`rgb(23, 44, 59)`), case cochée. Les deux se distinguent sans hésiter (1,27).
- **La table en clair** (`survol-clair-table.png`) : survol chaud, sélection bleutée, de même clarté
  (1,00) : la teinte et la case cochée portent l'état. C'est le point 2 du §0.9 que Karamo valide.
- **Le menu ouvert** (`survol-clair.png`, `survol-sombre.png`) : il sort de la table, qui défile et
  n'en montre que trois lignes, et se pose sous son déclencheur, bords de fin alignés ; « Voir la
  fiche » survolé se détache du fond du menu (1,14 en clair, 1,27 en sombre) ; « Retirer de la
  session » est en `--erreur`, après un filet. La ligne qui porte le menu reste survolée pendant que
  le pointeur est dans son menu : le menu est un descendant de la ligne dans le document.
- **Le rail** : avant (`survol-rail-avant-sombre.png`), « Sécurité » survolé avait le fond de
  « Formations », l'active ; après (`survol-rail-apres-sombre.png`), il creuse, et l'active reste la
  seule éclairée. En clair, le survol passe de `--surface-1` à `--surface-chaude` : plus visible sur le
  rail blanc.
- **Les spécimens à 1 280 et 1 024 px**, en clair et en sombre : les pièces de la 1.3.0 dans les
  quatre densités ; aucune page ne déborde.
- **Au doigt, 390 px** : l'en-tête d'objet range l'action et le menu sur leur propre ligne, à droite,
  sous le titre et son état ; le pouls passe à une ligne par chiffre ; la rangée d'onglets à
  compteurs défile, sans débordement de page ; l'onglet actif garde sa pastille neutre.

Aucun défaut vu qui demande une correction.
