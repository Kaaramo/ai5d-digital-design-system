import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

/**
 * Le titre d'une section, écrit une fois pour tous les produits.
 *
 * ── LE NIVEAU ET LA TAILLE SONT DEUX CHOSES ─────────────────────────────────
 * Le niveau est le plan du document : `h1`, `h2` ou `h3`, un seul `h1` par page. La taille est
 * l'écran : `ecran`, `section`, `bloc`. Les deux sont obligatoires et séparés, et c'est ce qui empêche
 * de choisir un `h3` pour sa taille.
 *
 * ── POURQUOI IL MONTE, EN v1.2.0 ────────────────────────────────────────────
 * Compte écrivait douze titres en Fraunces à la main, aux trois mêmes tailles, et deux d'entre eux
 * avaient déjà perdu le lettrage. Le Portail en avait huit copies sans graisse : le navigateur
 * appliquait le gras par défaut d'un titre à une Fraunces chargée en 400, un faux gras épaissi à la
 * volée. Ici, la graisse est toujours `--graisse-normale`.
 *
 * Aucun état, donc aucune feuille : un style en ligne, et le `style` du consommateur gagne.
 * `EnteteRubrique`, `GabaritAuth` et `Chiffre` gardent leur titre propre : les faire passer par ici
 * ajouterait le lettrage à des titres en production, un changement de rendu que personne n'a demandé.
 */

export type NiveauTitre = 1 | 2 | 3;
export type TailleTitre = 'ecran' | 'section' | 'bloc';

export interface ProprietesTitreSection extends Omit<
  HTMLAttributes<HTMLHeadingElement>,
  'children'
> {
  /** Le niveau dans le plan du document : `h1`, `h2` ou `h3`. Un seul `h1` par page. */
  niveau: NiveauTitre;
  /** La taille à l'écran, indépendante du niveau : un `h2` peut être un titre de bloc. */
  taille: TailleTitre;
  children: ReactNode;
}

const TAILLES: Record<TailleTitre, string> = {
  ecran: 'var(--taille-2xl)',
  section: 'var(--taille-xl)',
  bloc: 'var(--taille-lg)',
};

const BALISES = { 1: 'h1', 2: 'h2', 3: 'h3' } as const;

export function TitreSection({
  niveau,
  taille,
  children,
  style,
  ...reste
}: ProprietesTitreSection) {
  const Balise = BALISES[niveau];

  const styleTitre: CSSProperties = {
    margin: 0,
    fontFamily: 'var(--police-titre)',
    fontWeight: 'var(--graisse-normale)',
    fontSize: TAILLES[taille],
    lineHeight: 'var(--interligne-titre)',
    letterSpacing: 'var(--lettrage-titre)',
    color: 'var(--texte-fort)',
    // Un intitulé long passe à la ligne en lignes équilibrées, jamais tronqué.
    textWrap: 'balance',
    overflowWrap: 'break-word',
    ...style,
  };

  return (
    <Balise style={styleTitre} {...reste}>
      {children}
    </Balise>
  );
}
