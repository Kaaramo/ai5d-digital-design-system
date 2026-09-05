# Journal des changements

Une entrée par changement de jeton ou de règle, avec sa raison.

**Le versionnement est sémantique, et un changement de valeur de jeton est majeur** : il
modifie le rendu de tous les produits qui consomment le système.

---

## 0.1.0 — 5 septembre 2026

Première livraison. Noyau, densités et gardes — lots 1 à 3.

### Jetons corrigés par rapport à la charte AI5D Académie

Ces trois valeurs diffèrent de celles en production à l'Académie. Chacune corrige un défaut
de contraste mesuré, non une préférence.

| Jeton                     | Avant     | Après     | Raison                                                                                                                                                                                                                 |
| ------------------------- | --------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--texte-faible` clair    | `#6B7A85` | `#616F78` | Échouait sur les trois surfaces claires : 4,14 sur le papier, 4,42 sur le blanc. Tient désormais à 4,85 / 5,18 / 4,53. Teinte et saturation conservées, seule la luminosité baisse                                     |
| `--reussite-fond` sombre  | `#10312A` | `#103029` | Le vert de réussite y donnait 4,45, sous le seuil                                                                                                                                                                      |
| `--action` en mode sombre | `#5B7BFF` | `#6B88FF` | `#5B7BFF` donne 4,47 sur une carte sombre et 3,92 sur un menu : les liens sur carte échouaient. Le jeton de marque `--action-clair` reste intact et importé ; c'est un nouveau jeton applicatif, `--action-sur-sombre` |

### Jetons ajoutés

| Jeton                    | Rôle                                                            |
| ------------------------ | --------------------------------------------------------------- |
| `--action-sur-sombre`    | L'action sur les surfaces sombres que la marque n'a jamais eues |
| `--info` · `--info-fond` | Le registre d'information, absent des chartes dérivées          |
| `--cible-tactile`        | Le plancher tactile, cité par les composants                    |

### Signalé, non corrigé — hors périmètre

Le `--ai5d-blue-light #5B7BFF` de la marque institutionnelle donne **3,58 sur son propre
navy `#042A76`**, alors que la charte mère le déclare pour « liens et accents sur fond
encre/navy ». Sur l'encre il tient (4,73) ; sur le navy, non. La marque ne bouge pas dans ce
chantier — décision D1 — mais le défaut mérite une décision séparée.

### Ce qui est livré

- **Polices** : Fraunces, Inter, JetBrains Mono en woff2, sous-ensemble latin, servies en
  local. Trois fichiers, 134 Ko — Inter et Fraunces sont variables, un fichier porte toute
  leur plage de graisses.
- **Jetons** : marque aliasée, surfaces, texte, sémantiques, typographie, géométrie,
  élévation, mouvement. Trois états de thème, `prefers-reduced-motion` compris.
- **Préréglage Tailwind v4** en bloc `@theme`, qui ne fait que pointer vers les jetons.
- **Huit composants** : Logotype, Bouton, Champ, Carte, Bandeau, Pastille, Icone, CarteAuth.
- **Quatre profils de densité** et le plancher tactile.
- **Trois gardes distribuables** plus la garde de contraste, qui recalcule 44 paires à
  chaque exécution.
- **187 tests**, types, lint et format au vert.

### Corrigé après rendu réel

`Logotype` figeait sa couleur sur `--encre` et obligeait le consommateur à basculer la
variante à la main. Sur une page qui change de thème, le logotype disparaissait en mode
sombre. Le défaut suit désormais `--texte-fort` ; `encre` et `blanc` restent disponibles
pour un fond dont la clarté ne dépend pas du thème.

### Ce qui n'est pas livré

Les lockups produit et la remédiation des 36 SVG (lot 4), les cinq composants
inter-produits et les cinq écrans système (lot 5), le gabarit de courriel (lot 6), la
migration de l'Académie et de la Platform (lot 7). Chacun attend son consommateur.
