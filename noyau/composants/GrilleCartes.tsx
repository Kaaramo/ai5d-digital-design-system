import type { CSSProperties, ReactNode } from 'react';

/**
 * La grille qui apparie des cartes courtes.
 *
 * ── ELLE SE RÈGLE SUR SON CONTENEUR, ET C'EST LA SEULE FAÇON CORRECTE ───────
 * Une requête média interroge la FENÊTRE. Elle ne sait pas qu'un rail de 280 px mange la
 * largeur : à 768 px de fenêtre, la colonne de contenu d'un portail ne vaut que 464 px, et
 * deux cartes y feraient 216 px chacune. La grille déclare donc son propre contexte de
 * conteneur et interroge cette largeur-là.
 *
 * Le seuil est mesuré : deux cartes de 260 px plus un écart de 24 px font 544 px. 560 est
 * la valeur ronde immédiatement au-dessus.
 *
 * Un navigateur qui ne connaîtrait pas les requêtes de conteneur rend UNE colonne, ce qui
 * est la mise en page du téléphone : correcte partout, simplement pas optimale sur grand
 * écran. Une dégradation qui appauvrit ne casse rien.
 *
 * ── ELLE NE PORTE AUCUN RÔLE ARIA ───────────────────────────────────────────
 * Une grille de cartes n'est ni un tableau, ni une liste d'onglets. Lui poser `role="grid"`
 * ferait annoncer des lignes et des cellules qui n'existent pas, et changerait les touches
 * attendues au clavier.
 *
 * ── LES CARTES S'ÉTIRENT À LA MÊME HAUTEUR ──────────────────────────────────
 * C'est le comportement par défaut d'une grille, et il est voulu : deux cartes d'une même
 * rangée qui ne finissent pas à la même ligne donnent une page qui paraît bâclée. Le
 * contenu, lui, reste calé en haut de sa carte.
 */

export interface ProprietesGrilleCartes {
  /** Le nombre maximal de colonnes une fois la place disponible. Deux par défaut. */
  colonnes?: 2 | 3 | undefined;
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** La largeur de conteneur à partir de laquelle deux colonnes tiennent. Mesurée. */
export const CONTENEUR_DEUX_COLONNES = 560;

/** Trois colonnes, quand `colonnes` vaut 3. Trois cartes de 280 plus deux écarts de 24. */
export const CONTENEUR_TROIS_COLONNES = 900;

const ID_STYLE = 'ai5d-grille-cartes';

const STYLE_GRILLE = `
.ai5d-grille-cartes { container-type: inline-size; }
.ai5d-grille-cartes__pistes {
  display: grid;
  gap: var(--espace-6);
  grid-template-columns: minmax(0, 1fr);
}
@container (min-width: ${CONTENEUR_DEUX_COLONNES}px) {
  .ai5d-grille-cartes__pistes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container (min-width: ${CONTENEUR_TROIS_COLONNES}px) {
  .ai5d-grille-cartes--trois > .ai5d-grille-cartes__pistes {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
`;

export function GrilleCartes({ colonnes = 2, children, className, style }: ProprietesGrilleCartes) {
  const classes = [
    'ai5d-grille-cartes',
    colonnes === 3 ? 'ai5d-grille-cartes--trois' : null,
    className,
  ]
    .filter((c): c is string => typeof c === 'string' && c.length > 0)
    .join(' ');

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_GRILLE }} />

      <div className={classes} style={style} data-grille="cartes">
        <div className="ai5d-grille-cartes__pistes">{children}</div>
      </div>
    </>
  );
}
