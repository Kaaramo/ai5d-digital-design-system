# AI5D Digital Design System — suivi

> Un fichier, coché au fil de l'eau. Ce qui n'est pas coché n'est pas fait.

## Cadrage — 5 septembre 2026

- [x] Audit des trois sources : marque, Académie, Platform
- [x] Spécification validée — `docs/superpowers/specs/2026-09-05-…-design.md`
- [x] Plan d'implémentation des lots 1 à 3 — `docs/superpowers/plans/2026-09-05-…`
- [x] Dépôt Git, distant privé `Kaaramo/ai5d-digital-design-system`

## Lot 1 — Polices et jetons

- [x] Outillage : pnpm, TypeScript strict, Vitest, ESLint, Prettier
- [x] `outils/contraste.ts` — calcul WCAG, 18 tests
- [x] Polices : 3 fichiers woff2, 134 Ko, sous-ensemble latin, aucun appel réseau
- [x] `_build/synchroniser-marque.mjs` + garde d'intégrité contre la source
- [x] `noyau/jetons.css` — trois états de thème, `prefers-reduced-motion`
- [x] `outils/jetons.ts` — analyseur CSS à suivi de profondeur
- [x] Garde de contraste : 40 paires recalculées à chaque exécution
- [x] `noyau/ai5d.preset.css` — bloc `@theme` Tailwind v4

## Lot 3 — Densités

- [x] `densites/profils.css` — quatre profils, six variables
- [x] Plancher tactile en requête média, couvrant les profils futurs
- [x] 25 tests, dont la garde « aucune couleur, aucune police dans ce fichier »

## Lot 2 — Composants

- [x] Logotype, Bouton, Champ, Carte, Bandeau, Pastille, Icone, CarteAuth
- [x] `noyau/composants/index.ts` et sa garde de complétude
- [x] 45 tests de rendu et d'accessibilité
- [x] `specimens/composants.html` — 4 densités, 3 thèmes
- [x] Spécimens rendus et regardés, en clair et en sombre — captures dans `docs/preuves/`
- [x] **Défaut trouvé par le rendu** : `Logotype` figeait sa couleur et disparaissait en mode
      sombre. Il suit désormais `--texte-fort`
- [ ] **Non prouvé** : l'absence d'appel réseau au chargement n'a pas été vérifiée dans
      l'onglet Réseau d'un navigateur. Seul `polices.css` a été contrôlé
- [ ] **Non prouvé** : le rendu n'a été vu que sur Chrome, à une seule largeur

## Gardes et documents

- [x] Les trois gardes distribuables + 15 tests
- [x] `noyau/NOYAU.md`, `noyau/formulations.md`, `densites/DENSITES.md`
- [x] Deux décisions d'architecture
- [x] `CHANGELOG.md`, `README.md`

## Vérification — bloc unique

- [x] `pnpm typecheck` — 0 erreur
- [x] `pnpm lint` — 0 erreur, 0 avertissement
- [x] `pnpm format:check` — conforme
- [x] `pnpm test` — 187 tests, 10 fichiers, tous verts
- [x] Preuves consignées dans `docs/preuves/lots-1-3/`, captures comprises

## Reste à faire

### Décisions en attente

- [ ] Le `#5B7BFF` de la marque donne 3,58 sur son propre navy. Défaut de la marque
      institutionnelle, hors périmètre de ce chantier. Décider séparément
- [ ] La spec nomme encore `ai5d.preset.ts` ; la livraison est un `.css`. Corriger à la
      prochaine édition de la spec, pas au fil de l'eau

### Lots suivants, chacun attend son consommateur

- [ ] **L4** — traçage des 36 SVG, lockups `compte` et `cercle`, jeux par produit
- [ ] **L5** — les 5 composants inter-produits, les 5 écrans système → sprint 03 Platform
- [ ] **L6** — le gabarit de courriel → sprint 01 Platform
- [ ] **L7** — migration de l'Académie et correction de la spec Platform

### Effet rétroactif à traiter

- [ ] `ai5d-academie` : `--texte-faible` passe de `#6B7A85` à `#616F78`, et l'action en mode
      sombre de `#5B7BFF` à `#6B88FF`. Changements visibles nulle part, mais réels
- [ ] `AI5D Platform` : le `packages/ui` du sprint 00 doit **consommer** le système au lieu
      de recopier ses jetons. La spec du sprint 00 est à corriger sur ce point
