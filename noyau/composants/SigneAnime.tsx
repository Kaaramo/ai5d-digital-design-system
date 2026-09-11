import type { CSSProperties, ReactNode } from 'react';

/**
 * LA MARQUE, ENTOUREE DE DEUX ANNEAUX QUI TOURNENT EN SENS INVERSE.
 *
 * C est ce CONTRE-MOUVEMENT qui donne la profondeur : deux anneaux tournant du meme cote se lisent
 * comme un seul objet epais, et l ensemble devient un rond qui tourne de plus. Les durees sont
 * celles que l Academie a reglees a l usage : 1500 ms pour l anneau externe, 2000 ms pour l interne,
 * a l envers.
 *
 * ── LA MARQUE N EST PAS ECRITE ICI, ET C EST LE POINT ───────────────────────
 * Le systeme ne connait aucune marque de produit. Compte y met son embleme, un autre produit y
 * mettra le sien. Un composant qui coderait la marque obligerait a le forker au deuxieme produit,
 * et l ecosysteme aurait deux animations pour une seule idee.
 *
 * ── IL NE SERT PAS A FAIRE PATIENTER ────────────────────────────────────────
 * Il accompagne une attente qui existe deja. Une mise en scene qui fait patienter pour se faire
 * admirer est un peage : c est le produit qui doit etre rapide, pas l animation qui doit etre
 * belle.
 */

const ID_STYLE = 'ai5d-signe-anime';

export const STYLE_SIGNE = `
.ai5d-signe {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8rem;
  height: 8rem;
}
.ai5d-signe__anneau {
  position: absolute;
  border-radius: var(--rayon-plein);
  border: 1px solid var(--bordure);
}
.ai5d-signe__anneau--externe {
  inset: 0;
  border-top-color: var(--action);
  animation: ai5d-signe-rotation 1500ms linear infinite;
}
.ai5d-signe__anneau--interne {
  inset: var(--espace-2);
  border-bottom-color: var(--action-survol);
  animation: ai5d-signe-rotation 2000ms linear infinite reverse;
}
.ai5d-signe__marque {
  position: relative;
  display: flex;
  animation: ai5d-signe-entree 800ms var(--courbe-sortie) both;
}
@keyframes ai5d-signe-rotation {
  to { transform: rotate(360deg); }
}
@keyframes ai5d-signe-entree {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@media (min-width: 768px) {
  .ai5d-signe { width: 10rem; height: 10rem; }
}
@media (prefers-reduced-motion: reduce) {
  .ai5d-signe__anneau, .ai5d-signe__marque { animation: none; }
}
`;

export interface ProprietesSigneAnime {
  /** La marque du produit. Le systeme n en connait aucune : c est le produit qui la donne. */
  marque: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SigneAnime({ marque, className, style }: ProprietesSigneAnime) {
  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_SIGNE }} />
      <div
        className={className === undefined ? 'ai5d-signe' : `ai5d-signe ${className}`}
        style={style}
        data-signe="anime"
      >
        <span className="ai5d-signe__anneau ai5d-signe__anneau--externe" aria-hidden="true" />
        <span className="ai5d-signe__anneau ai5d-signe__anneau--interne" aria-hidden="true" />
        <span className="ai5d-signe__marque">{marque}</span>
      </div>
    </>
  );
}
