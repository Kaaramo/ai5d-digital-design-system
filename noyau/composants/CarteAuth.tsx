import type { CSSProperties, ReactNode } from 'react';
import { Logotype } from './Logotype';

/**
 * Le gabarit des écrans d'authentification.
 *
 * Sa largeur est bloquée à 420 px, à TOUTES les tailles d'écran, y compris au-delà de
 * 1280 px. Ce n'est pas une contrainte de mise en page qu'on aurait oublié de lever :
 * ce qui est demandé sur ces écrans est court, et une carte étroite le dit mieux qu'une
 * phrase rassurante. Une carte qui s'élargirait sur un grand écran ferait paraître la
 * demande plus lourde qu'elle n'est.
 *
 * Le logotype en tête n'est pas décoratif non plus. La personne doit savoir à qui elle
 * confie son mot de passe : une page d'authentification sans marque reconnaissable est
 * la définition d'un écran d'hameçonnage.
 */

export interface ProprietesCarteAuth {
  /** Le titre de l'écran. Rendu en `<h1>` : c'est le titre de la page. */
  titre: string;
  /** Le nom du produit, affiché à côté du logotype. « Compte », « Académie ». */
  produit?: string;
  /** Une phrase sous le titre. Optionnelle, et courte. */
  introduction?: ReactNode;
  children?: ReactNode;
  /** Liens de sortie, sous la carte. Jamais dedans : ils ne sont pas l'action. */
  pied?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** La largeur de la carte. Voir l'en-tête : elle ne s'élargit jamais. */
export const LARGEUR_CARTE_AUTH = 'min(420px, 100% - 32px)';

export function CarteAuth({
  titre,
  produit,
  introduction,
  children,
  pied,
  className,
  style,
}: ProprietesCarteAuth) {
  const stylePage: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '16px',
    background: 'var(--surface-1)',
    fontFamily: 'var(--police-corps)',
    ...style,
  };

  const styleCarte: CSSProperties = {
    width: LARGEUR_CARTE_AUTH,
    maxWidth: LARGEUR_CARTE_AUTH,
    padding: 'var(--padding-carte)',
    background: 'var(--surface-2)',
    border: '1px solid var(--bordure)',
    borderRadius: 'var(--rayon-lg)',
    boxShadow: 'var(--elevation-2)',
  };

  return (
    <div className={className} style={stylePage} data-gabarit="carte-auth">
      <div style={styleCarte}>
        <Logotype produit={produit} taille={22} style={{ marginBottom: '24px' }} />

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--police-titre)',
            fontSize: 'var(--taille-xl)',
            fontWeight: 'var(--graisse-normale)',
            lineHeight: 'var(--interligne-titre)',
            letterSpacing: 'var(--lettrage-titre)',
            color: 'var(--texte-fort)',
          }}
        >
          {titre}
        </h1>

        {introduction ? (
          <p
            style={{
              margin: '12px 0 0',
              fontSize: 'var(--taille-sm)',
              lineHeight: 'var(--interligne-corps)',
              color: 'var(--texte-faible)',
            }}
          >
            {introduction}
          </p>
        ) : null}

        {children ? <div style={{ marginTop: '24px' }}>{children}</div> : null}
      </div>

      {pied ? (
        <div
          style={{
            width: LARGEUR_CARTE_AUTH,
            textAlign: 'center',
            fontSize: 'var(--taille-sm)',
            color: 'var(--texte-faible)',
          }}
        >
          {pied}
        </div>
      ) : null}
    </div>
  );
}
