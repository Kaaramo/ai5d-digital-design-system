import type { ButtonHTMLAttributes, CSSProperties } from 'react';

/**
 * Le bouton du registre applicatif.
 *
 * Sa hauteur vient de `--hauteur-controle`, c'est-à-dire du profil de densité : c'est
 * par ici que la densité entre dans les composants. Sur un appareil tactile, le plancher
 * de 44 px s'applique automatiquement, sans que ce fichier ait à le savoir.
 *
 * Un seul bouton primaire par vue. C'est une règle de la charte, pas une préférence :
 * deux actions bleues sur un même écran, et l'œil ne sait plus laquelle est la sortie.
 *
 * ── LA VARIANTE `danger` NE COMPTE PAS DANS CETTE RÈGLE ──────────────────────
 * Une action destructrice et une action d'avancement ne se disputent pas le même regard :
 * l'une est ce qu'on est venu faire, l'autre est ce qu'on veut être sûr de ne pas faire
 * par mégarde. Un écran de suppression porte donc légitimement un `primaire` et un
 * `danger`. Les gardes des produits qui comptent les boutons primaires doivent l'exclure.
 *
 * Elle porte `--texte-sur-erreur` et non `--texte-sur-action` : en mode sombre, `--erreur`
 * vaut un rouge clair, et du blanc dessus tombe à 2,89. Voir la note dans `jetons.css`.
 */

export type VarianteBouton = 'primaire' | 'secondaire' | 'discret' | 'danger';
export type TailleBouton = 'sm' | 'md' | 'lg';

export interface ProprietesBouton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBouton | undefined;
  taille?: TailleBouton | undefined;
  /** Le bouton reste lisible et garde son libellé : la mise en page ne saute pas. */
  chargement?: boolean | undefined;
  /** Occupe toute la largeur disponible. Le registre `CarteAuth` s'en sert. */
  pleineLargeur?: boolean | undefined;
}

const HAUTEURS: Record<TailleBouton, string> = {
  sm: 'calc(var(--hauteur-controle) - 8px)',
  md: 'var(--hauteur-controle)',
  lg: 'calc(var(--hauteur-controle) + 8px)',
};

const TAILLES_TEXTE: Record<TailleBouton, string> = {
  sm: 'var(--taille-sm)',
  md: 'var(--taille-md)',
  lg: 'var(--taille-md)',
};

function styleVariante(variante: VarianteBouton): CSSProperties {
  if (variante === 'primaire') {
    return {
      background: 'var(--action)',
      color: 'var(--texte-sur-action)',
      border: '1px solid var(--action)',
    };
  }
  if (variante === 'secondaire') {
    return {
      background: 'transparent',
      color: 'var(--action)',
      border: '1px solid var(--action)',
    };
  }
  if (variante === 'danger') {
    return {
      background: 'var(--erreur)',
      color: 'var(--texte-sur-erreur)',
      border: '1px solid var(--erreur)',
    };
  }
  return {
    background: 'transparent',
    color: 'var(--action)',
    border: '1px solid transparent',
  };
}

export function Bouton({
  variante = 'primaire',
  taille = 'md',
  chargement = false,
  pleineLargeur = false,
  disabled,
  className,
  style,
  children,
  type = 'button',
  ...reste
}: ProprietesBouton) {
  const inactif = disabled === true || chargement;

  const styleBouton: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: HAUTEURS[taille],
    // Le plancher tactile s'applique deja sur --hauteur-controle ; on le rappelle
    // ici pour la taille sm, qui soustrait 8 px.
    minHeight: 'var(--cible-tactile)',
    minWidth: 'var(--cible-tactile)',
    padding: '0 20px',
    width: pleineLargeur ? '100%' : undefined,
    fontFamily: 'var(--police-corps)',
    fontSize: TAILLES_TEXTE[taille],
    fontWeight: 'var(--graisse-semi)',
    lineHeight: 1,
    borderRadius: 'var(--rayon-md)',
    cursor: inactif ? 'not-allowed' : 'pointer',
    opacity: inactif ? 0.6 : 1,
    transition: `background var(--duree-courte) var(--courbe-entree),
                 border-color var(--duree-courte) var(--courbe-entree),
                 opacity var(--duree-courte) var(--courbe-entree)`,
    ...styleVariante(variante),
    ...style,
  };

  return (
    <button
      type={type}
      className={className}
      style={styleBouton}
      disabled={inactif}
      aria-busy={chargement || undefined}
      data-variante={variante}
      data-taille={taille}
      {...reste}
    >
      {children}
    </button>
  );
}
