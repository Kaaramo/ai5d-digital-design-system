import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * L'iconographie du registre applicatif.
 *
 * Lucide, style contour, épaisseur **1,75** — contre 1,5 dans le registre
 * institutionnel. La différence de 0,25 px se justifie sur un écran de téléphone, où
 * un trait de 1,5 disparaît. Jamais d'icône remplie.
 *
 * Par défaut, une icône est **décorative** : elle est masquée aux lecteurs d'écran.
 * Ce n'est pas de la négligence, c'est la règle : une icône ne remplace jamais un mot
 * dans une information d'état, elle l'accompagne. Un cadenas seul ne dit pas quelle
 * licence manque, ni à qui la demander.
 *
 * Quand l'icône porte réellement l'information — et cela devrait être rare —, on lui
 * donne un `titre`, qui la rend visible aux lecteurs d'écran.
 */

/** Les cinq tailles du système. Toute autre valeur est refusée par le type. */
export type TailleIcone = 16 | 20 | 24 | 32 | 72;

export interface ProprietesIcone {
  /** Un composant d'icône Lucide, importé par le consommateur. */
  nom: LucideIcon;
  taille?: TailleIcone;
  /** Rend l'icône accessible et lui donne ce nom. Sans lui, elle est décorative. */
  titre?: string;
  /** Par défaut, l'icône prend la couleur du texte qui l'entoure. */
  couleur?: string;
  className?: string;
  style?: CSSProperties;
}

/** L'épaisseur de trait du registre applicatif. Voir l'en-tête de ce fichier. */
export const EPAISSEUR_TRAIT = 1.75;

export function Icone({
  nom: Composant,
  taille = 20,
  titre,
  couleur,
  className,
  style,
}: ProprietesIcone) {
  const decorative = titre === undefined;

  return (
    <Composant
      size={taille}
      strokeWidth={EPAISSEUR_TRAIT}
      color={couleur ?? 'currentColor'}
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={titre}
      focusable="false"
    />
  );
}
