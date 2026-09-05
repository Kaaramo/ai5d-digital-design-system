import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';

/**
 * La carte du registre applicatif.
 *
 * Son padding vient de `--padding-carte`, donc du profil de densité : c'est le second
 * point d'entrée de la densité dans les composants, après la hauteur de contrôle.
 *
 * Son élévation est interdite sur la vitrine et indispensable ici : elle pose la carte
 * au-dessus de la page et dit, sans un mot, où se trouve la chose à faire. En mode
 * sombre, `--elevation-2` vaut `none` et la hiérarchie passe par la clarté de la surface.
 *
 * Une carte cliquable rend un `<button>`, jamais une `<div>` avec un gestionnaire de
 * clic : sans cela, elle n'est ni atteignable au clavier ni annoncée comme actionnable.
 */

interface ProprietesCommunes {
  children?: ReactNode;
  /** Rend un bouton plutôt qu'une division, et ajoute un état de survol. */
  cliquable?: boolean;
  /** Retire l'élévation. Pour une carte posée dans une liste, où l'ombre ferait du bruit. */
  plate?: boolean;
}

export type ProprietesCarte = ProprietesCommunes &
  (
    | ({ cliquable: true } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>)
    | ({ cliquable?: false } & Omit<HTMLAttributes<HTMLDivElement>, 'children'>)
  );

export function Carte({ children, cliquable, plate = false, ...reste }: ProprietesCarte) {
  const style: CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: 'var(--padding-carte)',
    background: 'var(--surface-2)',
    color: 'var(--texte)',
    border: '1px solid var(--bordure)',
    borderRadius: 'var(--rayon-lg)',
    boxShadow: plate ? 'var(--elevation-0)' : 'var(--elevation-2)',
    fontFamily: 'var(--police-corps)',
    transition: `border-color var(--duree-courte) var(--courbe-entree)`,
  };

  if (cliquable) {
    const {
      className,
      style: styleFourni,
      ...autres
    } = reste as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        type="button"
        className={className}
        style={{ ...style, cursor: 'pointer', minHeight: 'var(--cible-tactile)', ...styleFourni }}
        data-cliquable="true"
        {...autres}
      >
        {children}
      </button>
    );
  }

  const { className, style: styleFourni, ...autres } = reste as HTMLAttributes<HTMLDivElement>;
  return (
    <div className={className} style={{ ...style, ...styleFourni }} {...autres}>
      {children}
    </div>
  );
}
