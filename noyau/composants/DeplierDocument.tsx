'use client';

import { useEffect } from 'react';
import { BUREAU } from '../paliers';

/** Le palier de la colonne double. Le meme que la feuille de `GabaritDocument`, par la meme constante. */
const REQUETE_BUREAU = `(min-width: ${BUREAU}px)`;

/** Les sections, et le sommaire, que la page laisse plier. */
function depliables(): HTMLDetailsElement[] {
  return [...document.querySelectorAll<HTMLDetailsElement>('details[data-depliable]')];
}

/** La section qui contient la cible de l ancre courante, ou rien. */
function sectionVisee(): HTMLDetailsElement | null {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (id.length === 0) return null;
  const cible = document.getElementById(id);
  return cible === null ? null : cible.closest<HTMLDetailsElement>('details[data-depliable]');
}

/**
 * Pose l etat VRAI des sections repliables d un document, et ne rend rien.
 *
 * ── POURQUOI UN MODULE CLIENT, ALORS QUE LA FEUILLE SUFFIT A L ECRAN ────────
 * Au-dessus de 1024 px, `::details-content` rend visible le contenu des sections servies
 * fermees. A l ecran, c est juste. Pour un lecteur d ecran, non : il annonce « replie » une
 * section qu on voit ouverte. Ce module pose `open` sur ordinateur, et l etat annonce redevient
 * celui qu on voit.
 *
 * Il couvre aussi un navigateur qui ignorerait `::details-content` : sans lui, les sections y
 * resteraient repliees sur ordinateur. Apres lui, elles s ouvrent.
 *
 * ── SUR TELEPHONE, IL N OUVRE QUE LA SECTION VISEE ──────────────────────────
 * Quelqu un qui suit un lien vers `/conditions#resiliation` doit arriver sur la clause ouverte,
 * pas sur un titre replie. Un fragment qui ne designe aucune section est ignore : ce module ne
 * navigue nulle part, il ouvre un element de la page, et rien d autre.
 *
 * ── UNE FERMETURE SUR ORDINATEUR EST ANNULEE ────────────────────────────────
 * Le titre y reste cliquable. Un clic basculerait `open` sans rien changer a l ecran, puisque la
 * feuille garde le contenu visible, et l etat annonce redeviendrait faux. On le rouvre.
 *
 * ── LE SEUL ECART ASSUME ────────────────────────────────────────────────────
 * Entre le premier affichage et l hydratation, sur ordinateur, les sections sont annoncees
 * « repliees » pendant quelques centaines de millisecondes. L autre voie - servir les sections
 * ouvertes et les replier sur telephone apres l hydratation - faisait apparaitre puis
 * s effondrer le texte sous les yeux.
 */
export function DeplierDocument() {
  useEffect(() => {
    const bureau = window.matchMedia(REQUETE_BUREAU);

    const appliquer = () => {
      if (bureau.matches) {
        for (const d of depliables()) d.open = true;
        return;
      }
      const visee = sectionVisee();
      if (visee !== null) visee.open = true;
    };

    const refermee = (evenement: Event) => {
      const d = evenement.target as HTMLDetailsElement;
      if (bureau.matches && !d.open) d.open = true;
    };

    appliquer();
    bureau.addEventListener('change', appliquer);
    window.addEventListener('hashchange', appliquer);
    const suivis = depliables();
    for (const d of suivis) d.addEventListener('toggle', refermee);

    return () => {
      bureau.removeEventListener('change', appliquer);
      window.removeEventListener('hashchange', appliquer);
      for (const d of suivis) d.removeEventListener('toggle', refermee);
    };
  }, []);

  return null;
}
