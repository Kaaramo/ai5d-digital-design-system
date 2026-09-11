import type { CSSProperties, ReactNode } from 'react';
import { SigneAnime } from './SigneAnime';

/**
 * LE SEUIL : CE QU ON VOIT ENTRE LA PORTE ET L ESPACE.
 *
 * Il s affiche apres une authentification reussie, le temps que la destination soit prete. Ce n est
 * pas un squelette : a ce moment-la, rien n a encore de forme, et une page en rectangles gris ne
 * dirait pas ce qui se passe. C est une porte qui s ouvre, et ca se montre autrement.
 *
 * ── IL NE SAIT PAS NAVIGUER, ET C EST VOULU ─────────────────────────────────
 * Le systeme ne depend pas de Next : aucun `useRouter`, aucune transition, aucun delai. Le produit
 * ecrit son module client, qui prefetche la destination, tient un plancher, part dans une
 * transition et pose un plafond ; il passe simplement `sortie` a vrai quand le depart est amorce.
 * C est la meme separation que pour la coquille a rail : le systeme rend, le produit pilote.
 *
 * ── LA PHRASE EST ANNONCEE, LA SIGNATURE NON ────────────────────────────────
 * `aria-live` sur la phrase : quelqu un qui n y voit rien a besoin de savoir qu on l emmene
 * quelque part. La signature, elle, est un ornement de marque : elle se tait.
 */

const ID_STYLE = 'ai5d-gabarit-seuil';

export const STYLE_SEUIL = `
.ai5d-seuil {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: var(--espace-4);
  background: var(--surface-1);
  transition:
    opacity var(--duree-moyenne) var(--courbe-sortie),
    transform var(--duree-moyenne) var(--courbe-sortie);
}
.ai5d-seuil[data-sortie] {
  opacity: 0;
  transform: scale(1.02);
}
.ai5d-seuil__phrase {
  margin: var(--espace-8) 0 0;
  font-family: var(--police-titre);
  font-size: var(--taille-xl);
  font-weight: var(--graisse-legere);
  color: var(--texte-fort);
  text-align: center;
  text-wrap: balance;
}
.ai5d-seuil__signature {
  position: absolute;
  bottom: var(--espace-12);
  margin: 0;
  padding: 0 var(--espace-4);
  font-family: var(--police-corps);
  font-size: var(--taille-xs);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--texte-faible);
  text-align: center;
}
@media (prefers-reduced-motion: reduce) {
  .ai5d-seuil { transition: none; }
}
`;

export interface ProprietesGabaritSeuil {
  /** La marque du produit dans lequel on entre. Le systeme n en connait aucune. */
  marque: ReactNode;
  /** Ce qui se prepare, en une phrase. Annoncee aux lecteurs d ecran. */
  phrase: string;
  /** La signature de la marque, en bas. Ornement : elle ne s annonce pas. */
  signature?: string;
  /** Vrai quand le depart est amorce : l ecran s efface. Le produit en decide. */
  sortie?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function GabaritSeuil({
  marque,
  phrase,
  signature,
  sortie = false,
  className,
  style,
}: ProprietesGabaritSeuil) {
  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_SEUIL }} />
      <div
        className={className === undefined ? 'ai5d-seuil' : `ai5d-seuil ${className}`}
        style={style}
        data-sortie={sortie ? '' : undefined}
        data-seuil="ecran"
      >
        <SigneAnime marque={marque} />

        <p className="ai5d-seuil__phrase" aria-live="polite">
          {phrase}
        </p>

        {signature === undefined ? null : (
          <p className="ai5d-seuil__signature" aria-hidden="true">
            {signature}
          </p>
        )}
      </div>
    </>
  );
}
