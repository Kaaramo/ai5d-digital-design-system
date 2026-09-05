import { useId } from 'react';
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

/**
 * Le champ de saisie du registre applicatif.
 *
 * Trois garanties d'accessibilité, non négociables :
 *
 *  - le libellé est TOUJOURS lié à l'entrée par `htmlFor` et `id`. Un identifiant est
 *    engendré si aucun n'est fourni ;
 *  - l'aide et le message d'erreur sont reliés par `aria-describedby` ;
 *  - l'erreur n'est JAMAIS portée par la seule couleur. Elle pose `aria-invalid`, elle
 *    change la bordure, et elle affiche un texte. Près d'un homme sur douze ne
 *    distinguerait pas la bordure rouge de la bordure grise.
 */

export interface ProprietesChamp extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
  /** Le libellé visible. Obligatoire : un champ sans libellé n'est pas accessible. */
  libelle: string;
  /** Texte d'aide, affiché sous le champ tant qu'il n'y a pas d'erreur. */
  aide?: ReactNode;
  /** Message d'erreur. Sa présence bascule le champ en état d'erreur. */
  erreur?: ReactNode;
}

export function Champ({ libelle, aide, erreur, id, className, style, ...reste }: ProprietesChamp) {
  const identifiantEngendre = useId();
  const identifiant = id ?? `champ-${identifiantEngendre}`;
  const identifiantAide = `${identifiant}-aide`;
  const identifiantErreur = `${identifiant}-erreur`;

  const enErreur = erreur !== undefined && erreur !== null && erreur !== '';

  const decritPar = [enErreur ? identifiantErreur : null, aide ? identifiantAide : null]
    .filter(Boolean)
    .join(' ');

  const styleEntree: CSSProperties = {
    width: '100%',
    height: 'var(--hauteur-controle)',
    minHeight: 'var(--cible-tactile)',
    padding: '0 14px',
    background: 'var(--surface-2)',
    color: 'var(--texte-fort)',
    fontFamily: 'var(--police-corps)',
    fontSize: 'var(--taille-md)',
    border: `1px solid ${enErreur ? 'var(--erreur)' : 'var(--bordure-forte)'}`,
    borderRadius: 'var(--rayon-md)',
    transition: `border-color var(--duree-courte) var(--courbe-entree)`,
    ...style,
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={identifiant}
        style={{
          fontFamily: 'var(--police-corps)',
          fontSize: 'var(--taille-sm)',
          fontWeight: 'var(--graisse-moyenne)',
          color: 'var(--texte)',
        }}
      >
        {libelle}
      </label>

      <input
        id={identifiant}
        style={styleEntree}
        aria-invalid={enErreur || undefined}
        aria-describedby={decritPar === '' ? undefined : decritPar}
        {...reste}
      />

      {enErreur ? (
        <span
          id={identifiantErreur}
          role="alert"
          style={{
            fontFamily: 'var(--police-corps)',
            fontSize: 'var(--taille-sm)',
            color: 'var(--erreur)',
          }}
        >
          {erreur}
        </span>
      ) : null}

      {aide && !enErreur ? (
        <span
          id={identifiantAide}
          style={{
            fontFamily: 'var(--police-corps)',
            fontSize: 'var(--taille-sm)',
            color: 'var(--texte-faible)',
          }}
        >
          {aide}
        </span>
      ) : null}
    </div>
  );
}
