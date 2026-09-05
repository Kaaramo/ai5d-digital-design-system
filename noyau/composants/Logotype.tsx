import type { CSSProperties, HTMLAttributes } from 'react';

/**
 * Le logotype AI5D, avec un label de produit optionnel.
 *
 * Le « 5 » est incliné à -5 degrés et bleu, dans toutes les variantes et sur tous les
 * fonds. C'est un interdit de la charte mère, chapitre 08 : ne jamais le redresser, ne
 * jamais le recolorer. La variante `blanc` ne change donc que « AI » et « D ».
 *
 * Le label de produit suit en Fraunces léger : « AI5D Compte », « AI5D Académie ».
 * C'est la doctrine de sous-marque de l'écosystème — la différenciation se fait par le
 * nom, jamais par la couleur.
 */

export type VarianteLogotype = 'encre' | 'blanc';

export interface ProprietesLogotype extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** `encre` sur fond clair, `blanc` sur fond sombre. */
  variante?: VarianteLogotype;
  /** Le nom du produit, affiché après le logotype. « Compte », « Académie », « Lab ». */
  produit?: string;
  /** Taille du logotype en pixels. Le label suit proportionnellement. */
  taille?: number;
}

export function Logotype({
  variante = 'encre',
  produit,
  taille = 24,
  className,
  style,
  ...reste
}: ProprietesLogotype) {
  const couleurLettres = variante === 'blanc' ? 'var(--blanc)' : 'var(--encre)';

  const styleRacine: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'baseline',
    fontFamily: 'var(--police-corps)',
    fontSize: `${taille}px`,
    lineHeight: 1,
    ...style,
  };

  const styleLettres: CSSProperties = {
    fontWeight: 'var(--graisse-forte)',
    letterSpacing: 'var(--lettrage-marque)',
    color: couleurLettres,
  };

  return (
    <span
      className={className}
      style={styleRacine}
      role="img"
      aria-label={produit ? `AI5D ${produit}` : 'AI5D'}
      {...reste}
    >
      <span aria-hidden="true" style={styleLettres}>
        AI
      </span>
      <span
        aria-hidden="true"
        style={{
          ...styleLettres,
          // Le geste de la marque. Il ne sort jamais du logotype, et le logotype
          // ne sort jamais sans lui.
          color: 'var(--action)',
          display: 'inline-block',
          transform: 'rotate(-5deg)',
        }}
      >
        5
      </span>
      <span aria-hidden="true" style={styleLettres}>
        D
      </span>
      {produit ? (
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--police-titre)',
            fontWeight: 'var(--graisse-legere)',
            fontSize: `${Math.round(taille * 0.92)}px`,
            color: couleurLettres,
            marginLeft: `${Math.round(taille * 0.42)}px`,
          }}
        >
          {produit}
        </span>
      ) : null}
    </span>
  );
}
