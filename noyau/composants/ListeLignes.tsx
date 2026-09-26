import { Children, isValidElement } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * La liste qui range des `LigneLien`, avec un filet entre chaque.
 *
 * `role="list"` n'est pas redondant : sans puces, Safari retire la sémantique de liste, et VoiceOver
 * n'annonce plus « liste, trois éléments ».
 *
 * Chaque enfant rendu prend son propre `<li>` ; un enfant absent (`null`, `false`) n'en prend aucun,
 * pour qu'une ligne conditionnelle ne laisse pas un filet orphelin. Un fragment compte pour un enfant :
 * on passe les lignes une par une.
 *
 * `bordsExterieurs` à faux fait ce que Compte faisait à la main avec la propriété `dernier` de
 * `LigneCompte` : aucun filet au-dessus de la première ligne ni sous la dernière.
 */

export interface ProprietesListeLignes {
  /** Des `LigneLien`, une par destination. Chaque enfant est posé dans son propre `<li>`. */
  children: ReactNode;
  /** Le nom de la liste pour les lecteurs d'écran, quand aucun titre visible ne la précède. */
  etiquette?: string | undefined;
  /** Un filet au-dessus de la première ligne et sous la dernière. Vrai par défaut. */
  bordsExterieurs?: boolean | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

const ID_STYLE = 'ai5d-liste-lignes';

export const STYLE_LISTE_LIGNES = `
.ai5d-liste-lignes { list-style: none; margin: 0; padding: 0; }
.ai5d-liste-lignes > li + li { border-top: 1px solid var(--bordure); }
.ai5d-liste-lignes[data-bords] { border-top: 1px solid var(--bordure); border-bottom: 1px solid var(--bordure); }
`;

export function ListeLignes({
  children,
  etiquette,
  bordsExterieurs = true,
  className,
  style,
}: ProprietesListeLignes) {
  const lignes = Children.toArray(children);

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_LISTE_LIGNES }} />

      <ul
        role="list"
        aria-label={etiquette}
        className={className === undefined ? 'ai5d-liste-lignes' : `ai5d-liste-lignes ${className}`}
        data-bords={bordsExterieurs ? '' : undefined}
        style={style}
      >
        {lignes.map((ligne, index) => (
          <li key={isValidElement(ligne) && ligne.key !== null ? ligne.key : index}>{ligne}</li>
        ))}
      </ul>
    </>
  );
}
