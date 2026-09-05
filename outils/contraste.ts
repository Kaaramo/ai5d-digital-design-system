/**
 * Calcul de contraste WCAG 2.1.
 *
 * Ce module ne connaît aucune couleur AI5D : il sait seulement calculer un ratio.
 * C'est ce qui lui permet de servir à la fois la garde des jetons et les projets
 * consommateurs, sans rien savoir de ce qu'ils mesurent.
 */

export type VerdictWcag = 'AAA' | 'AA' | 'AA-gros' | 'echec';

const HEXA = /^#([0-9a-fA-F]{6})$/;

/** Convertit un hexadécimal `#RRGGBB` en triplet 0-255. Lève si la forme est invalide. */
export function versRgb(hex: string): [number, number, number] {
  const correspondance = HEXA.exec(hex.trim());
  if (!correspondance) {
    throw new Error(`Couleur invalide : ${hex}. Forme attendue #RRGGBB.`);
  }
  const valeur = correspondance[1] as string;
  return [
    Number.parseInt(valeur.slice(0, 2), 16),
    Number.parseInt(valeur.slice(2, 4), 16),
    Number.parseInt(valeur.slice(4, 6), 16),
  ];
}

/** Linéarisation d'un canal sRGB, selon la formule WCAG. */
function canal(valeur: number): number {
  const c = valeur / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminance relative, entre 0 pour le noir et 1 pour le blanc. */
export function luminance(hex: string): number {
  const [rouge, vert, bleu] = versRgb(hex);
  return 0.2126 * canal(rouge) + 0.7152 * canal(vert) + 0.0722 * canal(bleu);
}

/** Ratio de contraste entre deux couleurs, entre 1 et 21. L'ordre est indifférent. */
export function ratioContraste(a: string, b: string): number {
  const luminanceA = luminance(a);
  const luminanceB = luminance(b);
  const haut = Math.max(luminanceA, luminanceB);
  const bas = Math.min(luminanceA, luminanceB);
  return (haut + 0.05) / (bas + 0.05);
}

/**
 * Verdict WCAG pour du texte.
 *
 * `AA-gros` ne vaut que pour du 18,66 px gras ou du 24 px. Un jeton de texte courant
 * qui ne dépasse pas ce palier est en défaut, quelle que soit l'impression visuelle.
 */
export function verdictWcag(ratio: number): VerdictWcag {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-gros';
  return 'echec';
}

/** Seuil de conformité pour du texte courant. Utilisé par les gardes. */
export const SEUIL_TEXTE_COURANT = 4.5;
