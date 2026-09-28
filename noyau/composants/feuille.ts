/**
 * La feuille d'un composant, posée une fois par document (SPEC 1.3.0, §5.1 ; décision 010).
 *
 * Module pur : ni JSX, ni directive. Il s'importe d'un composant serveur comme d'un module client, et
 * il n'est pas un `.tsx`, qui compterait comme un composant (`tests/index.test.ts`).
 *
 * ── POURQUOI ────────────────────────────────────────────────────────────────
 * Jusqu'à la 1.2.0, chaque instance rendait sa balise `<style id>` devant elle : cinq cents boutons,
 * cinq cents feuilles identiques et cinq cents fois le même identifiant, dans le HTML transmis comme
 * dans le document (mesuré le 28 septembre 2026). React 19 hisse dans `<head>`, et déduplique par
 * `href`, toute balise `<style>` qui porte `href` et `precedence` ; au serveur, il réunit les feuilles
 * d'une même précédence dans une seule balise.
 *
 * Le texte passe en enfant, jamais par `dangerouslySetInnerHTML` : c'est la forme que React documente
 * pour une feuille hissée, et le rendu serveur n'échappe que `<style` et `</style`.
 */
import { createElement, type ReactElement } from 'react';

/**
 * Le groupe de toutes les feuilles du système. Exporté par l'index, pour qu'un produit compte les
 * feuilles du système dans sa recette ; `feuille` ne l'est pas : un produit pose ses propres feuilles
 * sous SA précédence, jamais sous celle-ci.
 */
export const PRECEDENCE_FEUILLES = 'ai5d';

/**
 * La feuille d'un composant, posée une fois par document quel que soit le nombre d'instances.
 * `id` est la clé de déduplication : `ai5d-bouton`, `ai5d-champ`… Jamais d'espace : React le refuse,
 * et l'hydratation échouerait.
 */
export function feuille(id: string, css: string): ReactElement {
  return createElement('style', { href: id, precedence: PRECEDENCE_FEUILLES }, css);
}
