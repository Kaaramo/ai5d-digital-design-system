import type { CSSProperties } from 'react';

/**
 * L'emblème de compte AI5D.
 *
 * ── CE QU'IL EST, ET CE QU'IL N'EST PAS ─────────────────────────────────────
 * Ce n'est pas une seconde marque. C'est la déclinaison produit d'une marque existante,
 * comme « AI5D Compte » est la déclinaison du logotype.
 *
 * Le pentagone institutionnel devient la **tête** d'une silhouette ; un arc devient ses
 * **épaules**. La parenté avec l'écosystème se voit au premier coup d'œil, et la fonction
 * du produit se dit sans un mot : AI5D à hauteur d'une personne, ce qu'un portail de
 * comptes est exactement.
 *
 * Le chemin de la tête est celui de `ai5d-icon` du pack de marque, repris sans une
 * virgule. **Le pentagone ne se redresse pas, ne se recolore pas, ne se recadre pas** :
 * c'est l'interdit de la charte mère, chapitre 08, appliqué à sa reprise ici.
 *
 * ── POURQUOI LE CARTOUCHE EST BLEU ET NON ENCRE ─────────────────────────────
 * L'encre aurait été plus profonde. Elle disparaît sur les surfaces sombres du registre
 * applicatif : `--encre` vaut #051C2C et `--surface-1` en sombre vaut #0B1620, deux
 * valeurs que l'œil ne sépare pas. `--action` tient sur les deux thèmes, 5,69 sur le
 * papier tiède et 5,73 sur la surface sombre, et c'est aussi le fond du favicon
 * institutionnel : les deux marques restent de la même famille.
 *
 * La silhouette blanche sur le bleu du mode sombre mesure 3,19. C'est au-dessus du
 * plancher de 3,0 des éléments non textuels, et en dessous du 4,5 des textes. C'est
 * correct : c'est une forme, pas un mot, et le nom du produit est écrit à côté en toutes
 * lettres.
 *
 * ── DÉCORATIF PAR DÉFAUT ────────────────────────────────────────────────────
 * `aria-hidden`, exactement comme `Icone`. Une propriété `titre` le rend annonçable, pour
 * le jour où il apparaîtrait seul.
 */

export type VarianteEmbleme = 'badge' | 'nu';

/** Les cinq tailles de la charte, chapitre 08. Toute autre valeur est refusée par le type. */
export type TailleEmbleme = 16 | 20 | 24 | 32 | 72;

export interface ProprietesEmbleme {
  /**
   * `badge` porte le cartouche bleu. `nu` ne rend que la silhouette, en `currentColor`,
   * pour un fond déjà bleu ou encre où le cartouche ferait tache.
   */
  variante?: VarianteEmbleme | undefined;
  taille?: TailleEmbleme | undefined;
  /** Rend l'emblème accessible et lui donne ce nom. Sans lui, il est décoratif. */
  titre?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** La grille des logotypes institutionnels. Les deux marques se superposent sans recalcul. */
export const GRILLE_EMBLEME = 240;

/** Le rayon du cartouche : 22 % du côté, celui du favicon institutionnel. */
export const RAYON_CARTOUCHE = 53;

/** Le pentagone de `ai5d-icon`, repris sans modification. */
export const CHEMIN_TETE =
  'M 110.29 69.99 Q 120 62.94 129.71 69.99 L 170.29 99.48 Q 180 106.53 176.29 117.94 ' +
  'L 160.79 165.65 Q 157.08 177.06 145.08 177.06 L 94.92 177.06 Q 82.92 177.06 79.21 165.65 ' +
  'L 63.71 117.94 Q 60 106.53 69.71 99.48 Z';

/**
 * La tête, réduite à 62 % et remontée.
 *
 * Le vide qu'elle laisse au-dessus des épaules vaut 21 unités, soit 1,4 px à la taille de
 * l'onglet : à 16 px il ne subsiste que par l'anticrénelage, et c'est suffisant. La forme
 * extérieure suffit à la reconnaissance, ce qui a été vérifié en rendant l'emblème à 16,
 * 32 et 96 px avant de l'écrire.
 */
export const TRANSFORME_TETE = 'translate(120 82) scale(0.62) translate(-120 -120)';

/** Les épaules : un arc à coins adoucis, sommet à 134, base à 198, empan 58 à 182. */
export const CHEMIN_EPAULES =
  'M 120 134 C 87 134 61 157 58 188 C 57.4 194 61.5 198 67 198 L 173 198 ' +
  'C 178.5 198 182.6 194 182 188 C 179 157 153 134 120 134 Z';

export function Embleme({
  variante = 'badge',
  taille = 24,
  titre,
  className,
  style,
}: ProprietesEmbleme) {
  const decoratif = titre === undefined;
  const silhouette = variante === 'badge' ? 'var(--blanc)' : 'currentColor';

  return (
    <svg
      width={taille}
      height={taille}
      viewBox={`0 0 ${GRILLE_EMBLEME} ${GRILLE_EMBLEME}`}
      className={className}
      style={{ flexShrink: 0, display: 'block', ...style }}
      aria-hidden={decoratif ? true : undefined}
      role={decoratif ? undefined : 'img'}
      aria-label={titre}
      focusable="false"
    >
      {titre === undefined ? null : <title>{titre}</title>}

      {variante === 'badge' ? (
        <rect
          width={GRILLE_EMBLEME}
          height={GRILLE_EMBLEME}
          rx={RAYON_CARTOUCHE}
          ry={RAYON_CARTOUCHE}
          fill="var(--action)"
        />
      ) : null}

      <path d={CHEMIN_TETE} transform={TRANSFORME_TETE} fill={silhouette} />
      <path d={CHEMIN_EPAULES} fill={silhouette} />
    </svg>
  );
}
