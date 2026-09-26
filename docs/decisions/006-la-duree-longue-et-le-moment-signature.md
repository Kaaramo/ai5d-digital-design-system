# 006 · La durée longue et le moment signature

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

La règle de `jetons.css` réservait `--duree-longue` (800 ms, 0 ms sous mouvement réduit) aux
confirmations qui engagent la sécurité du compte. Compte l'emploie ainsi
(`components/ConfirmationSecurite.tsx:36`, `DUREE_MS = 800`), et pour rien d'autre.

Le Portail a un moment d'une autre nature : la première ouverture d'une attestation délivrée, « la
feuille qui se pose » (SPEC P09, §5.9.3). Son contrat demandait pour lui un jeton `--duree-signature`.
Dans le même temps, les produits écrivaient leurs transitions en durée et courbe littérales : Compte
efface une ligne par `opacity 250ms ease-out` (`app/(portail)/organisations/[slug]/Gestion.tsx:51`).

## Options

**A. Un jeton `--duree-signature`, qui vaut `var(--duree-longue)`.** Deux noms pour une même valeur et
un même rôle : ils divergent à la première correction.

**B. Refuser le moment au Portail.** La délivrance de l'attestation est l'instant que ce produit existe
pour produire ; la traiter comme un survol serait faux.

**C. Réécrire la règle de la durée longue, et nommer les mouvements courants par leur rôle.**

## Décision

**C.** La règle, telle qu'elle figure dans `jetons.css` et `NOYAU.md` :

> La durée longue sert deux choses, et deux seulement : une confirmation qui engage la sécurité du compte, et le moment signature unique d’un produit, déclaré par son nom dans le DESIGN.md de ce produit. Jamais un ornement, jamais deux moments dans un même produit.

Trois jetons nomment un mouvement par ce qu'il fait : `--mouvement-retour` (un état répond),
`--mouvement-entree` (quelque chose arrive), `--mouvement-sortie` (quelque chose part).

## Conséquences

- Aucun jeton `--duree-signature`. Le Portail écrit `var(--duree-longue)` et déclare le moment dans
  son `DESIGN.md`.
- `--duree-survol`, que le contrat de P09 proposait de déprécier, n'a jamais existé dans ce dépôt.
- Les composants existants ne migrent pas vers les jetons de rôle dans ce lot : leurs paires actuelles
  changeraient d'un rien au survol, et personne ne l'a demandé. `LigneLien` et les états nouveaux des
  onglets les emploient.
- La primitive `Apparition` reste dans le Portail, faute de deuxième consommateur ; elle s'écrit sur
  `--mouvement-entree`.
