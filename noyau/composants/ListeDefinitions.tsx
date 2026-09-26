import type { CSSProperties, ReactNode } from 'react';

/**
 * Des faits, en libellés et valeurs alignés : la fiche d'une attestation, d'un compte, d'une session.
 *
 * ── UN `<dl>`, ET CHAQUE PAIRE DANS UN `<div>` ──────────────────────────────
 * Le HTML permet de grouper un `<dt>` et son `<dd>` dans un `<div>`, et c'est ce qui garde la paire
 * ensemble dans la grille. Un lecteur d'écran annonce une liste de définitions.
 *
 * ── LA BASCULE INTERROGE LE CONTENEUR, PAS LA FENÊTRE ───────────────────────
 * Comme `GrilleCartes`. Le contrat de P09 disait « deux colonnes dès 640 px » de fenêtre ; une fiche
 * de 36rem dans le Portail en offre 528 à 640 px, au-delà de 480, donc deux colonnes comme P09 le veut.
 * Mais une fiche de console dans une colonne étroite recevrait deux colonnes de 150 px avec une
 * requête de fenêtre. Sans requêtes de conteneur, une colonne : la mise en page du téléphone, correcte
 * partout.
 *
 * Aucun état, aucune directive. Deuxième consommateur : la fiche d'un compte dans la console de
 * Compte, écrite à la main (`app/admin/comptes/[id]/page.tsx:83-110`).
 */

export interface Definition {
  libelle: string;
  valeur: ReactNode;
  /** La valeur en JetBrains Mono : un numéro, un identifiant. */
  mono?: boolean | undefined;
}

export interface ProprietesListeDefinitions {
  elements: Definition[];
  /** `2` : deux colonnes dès que la liste dispose de 480 px. `1` par défaut. */
  colonnes?: 1 | 2 | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** La largeur, en px, à partir de laquelle une liste à deux colonnes les affiche. */
export const CONTENEUR_DEFINITIONS_DEUX_COLONNES = 480;

const ID_STYLE = 'ai5d-definitions';

export const STYLE_DEFINITIONS = `
.ai5d-definitions { container-type: inline-size; inline-size: 100%; }
.ai5d-definitions__liste {
  display: grid; grid-template-columns: minmax(0, 1fr);
  row-gap: var(--espace-4); column-gap: var(--espace-6);
  margin: 0;
}
.ai5d-definitions__element { min-width: 0; }
.ai5d-definitions__element dt {
  font-family: var(--police-corps); font-size: var(--taille-xs);
  font-weight: var(--graisse-moyenne); line-height: 1.6;
  color: var(--texte-faible);
}
.ai5d-definitions__element dd {
  margin: 0;
  font-family: var(--police-corps); font-size: var(--taille-md);
  font-weight: var(--graisse-normale); line-height: var(--interligne-corps);
  color: var(--texte-fort);
  overflow-wrap: anywhere;
}
.ai5d-definitions__element dd[data-mono] {
  font-family: var(--police-mono); font-weight: var(--graisse-moyenne); font-size: var(--taille-sm);
}
@container (min-width: ${CONTENEUR_DEFINITIONS_DEUX_COLONNES}px) {
  .ai5d-definitions[data-colonnes='2'] .ai5d-definitions__liste {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
`;

export function ListeDefinitions({
  elements,
  colonnes = 1,
  className,
  style,
}: ProprietesListeDefinitions) {
  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_DEFINITIONS }} />

      <div
        className={className === undefined ? 'ai5d-definitions' : `ai5d-definitions ${className}`}
        data-colonnes={colonnes}
        style={style}
      >
        <dl className="ai5d-definitions__liste">
          {elements.map((element, index) => (
            <div key={`${index}-${element.libelle}`} className="ai5d-definitions__element">
              <dt>{element.libelle}</dt>
              <dd data-mono={element.mono === true ? '' : undefined}>{element.valeur}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
