'use client';

import { useEffect, useRef } from 'react';

/**
 * LA MÉCANIQUE COMMUNE DES DEUX BOÎTES : UN `<dialog>` NATIF, OUVERT EN MODALE.
 *
 * ── POURQUOI ELLES N ÉTAIENT PAS DANS LE SYSTÈME, ET POURQUOI ELLES Y SONT ──
 * Dans Compte, `BoiteConfirmation` le disait elle-même : « un composant de dialogue livré par un
 * système de design sans pile, sans piège de focus et sans Échap serait un mensonge sur ce qu'il
 * garantit ». Elle était une `div` posée par-dessus la page, qu'on traversait à la tabulation et
 * qu'Échap ne fermait pas.
 *
 * L'élément natif donne les trois d'un coup. `showModal()` rend le reste du document inerte, donc
 * la tabulation ne quitte pas la boîte ; Échap émet `cancel` ; le navigateur gère la pile. La
 * boîte peut donc monter, parce qu'elle garantit enfin ce qu'un dialogue promet.
 *
 * ── ELLE S OUVRE AU MONTAGE, ET NON PAR UNE PROPRIÉTÉ `ouverte` ─────────────
 * Les produits montent la boîte seulement quand elle doit se voir : `{aFermer ? <Boite … /> :
 * null}`. La SPEC exige que les propriétés publiques restent celles de Compte, et Compte n'avait
 * pas de propriété `ouverte`. Le dialogue s'ouvre donc au montage et se ferme au démontage : c'est
 * le produit qui décide, exactement comme avant.
 *
 * ── LE FOCUS REVIENT D OÙ IL VENAIT ─────────────────────────────────────────
 * L'élément actif est retenu avant l'ouverture et retrouve le focus au démontage. Sans cela, après
 * une confirmation, le focus tombe sur le `body` et quelqu'un qui navigue au clavier repart du
 * haut de la page.
 */

export const ID_STYLE_BOITE = 'ai5d-boite';

/**
 * Le voile est le `::backdrop` natif, en `--encre` avec une opacité. L'apparition est courte, et
 * disparaît sous mouvement réduit. La largeur maximale reste propre à chaque boîte, en style en
 * ligne, comme dans Compte.
 */
export const STYLE_BOITE = `
.ai5d-boite {
  box-sizing: border-box;
  width: calc(100% - 2 * var(--marge-page));
  padding: var(--espace-6);
  border: 0;
  border-radius: var(--rayon-lg);
  background: var(--surface-3);
  color: var(--texte);
  box-shadow: var(--elevation-3);
}
.ai5d-boite::backdrop {
  background: var(--encre);
  opacity: 0.4;
}
.ai5d-boite[open] {
  animation: ai5d-boite-entree var(--duree-courte) var(--courbe-sortie);
}
@keyframes ai5d-boite-entree {
  from { opacity: 0; transform: translateY(var(--espace-2)); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ai5d-boite[open] { animation: none; }
}
`;

/**
 * Ouvre le dialogue au montage, pose le focus initial, et le rend au démontage.
 *
 * @param cibleFocus Le sélecteur de l'élément qui reçoit le focus à l'ouverture. Jamais l'action
 *   grave : un Entrée tapé trop vite la déclencherait.
 */
export function useDialogueModal(cibleFocus: string) {
  const reference = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const boite = reference.current;
    if (boite === null) return;

    const origine = document.activeElement;
    if (!boite.open) boite.showModal();

    /*
      Le focus est posé EXPLICITEMENT. `showModal()` le donne au premier élément focalisable, et
      la propriété `autoFocus` de React ne pose pas l'attribut HTML que le navigateur lirait :
      dans une confirmation qui porte un champ, le focus irait au champ plutôt qu'à « Annuler ».
    */
    boite.querySelector<HTMLElement>(cibleFocus)?.focus();

    return () => {
      if (boite.open) boite.close();
      if (origine instanceof HTMLElement) origine.focus();
    };
  }, [cibleFocus]);

  return reference;
}
