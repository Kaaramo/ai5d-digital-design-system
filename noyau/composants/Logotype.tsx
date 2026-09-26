import type { CSSProperties, HTMLAttributes } from 'react';
import { LOGOTYPE, nomLogotype } from '../logotype';

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
 *
 * Par défaut, les lettres suivent `--texte-fort` : le logotype se retourne donc tout seul
 * avec le thème. Le défaut n'était pas celui-là au départ — il fallait choisir `encre` ou
 * `blanc` à la main — et un rendu en mode sombre l'a montré : sur une page qui bascule de
 * thème, personne ne pense à basculer aussi la variante, et le logotype disparaît. Les
 * deux variantes explicites restent utiles pour un fond de couleur fixe, un bandeau encre
 * en thème clair par exemple.
 *
 * Depuis la 1.2.0, la composition vient de `noyau/logotype.ts`, la recette que suivent aussi le PDF,
 * l'image de partage et le courriel : les morceaux, l'inclinaison du « 5 », l'échelle et l'écart du
 * nom du produit. Le rendu ne change pas d'un pixel ; la recette et le composant ne peuvent plus
 * diverger.
 */

export type VarianteLogotype = 'auto' | 'encre' | 'blanc';

export interface ProprietesLogotype extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * `auto` suit le thème par `--texte-fort`, et c'est le bon choix presque partout.
   * `encre` et `blanc` forcent la couleur, pour un fond dont la clarté ne dépend pas
   * du thème.
   */
  variante?: VarianteLogotype | undefined;
  /** Le nom du produit, affiché après le logotype. « Compte », « Académie », « Lab ». */
  produit?: string | undefined;
  /** Taille du logotype en pixels. Le label suit proportionnellement. */
  taille?: number | undefined;
}

export function Logotype({
  variante = 'auto',
  produit,
  taille = 24,
  className,
  style,
  ...reste
}: ProprietesLogotype) {
  const COULEURS: Record<VarianteLogotype, string> = {
    auto: 'var(--texte-fort)',
    encre: 'var(--encre)',
    blanc: 'var(--blanc)',
  };
  const couleurLettres = COULEURS[variante];

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

  const styleCinq: CSSProperties = {
    ...styleLettres,
    // Le geste de la marque. Il ne sort jamais du logotype, et le logotype
    // ne sort jamais sans lui.
    color: 'var(--action)',
    display: 'inline-block',
    transform: `rotate(${LOGOTYPE.inclinaisonCinqDeg}deg)`,
  };

  return (
    <span
      className={className}
      style={styleRacine}
      role="img"
      aria-label={nomLogotype(produit)}
      {...reste}
    >
      {LOGOTYPE.morceaux.map((morceau) => (
        <span
          key={morceau.texte}
          aria-hidden="true"
          style={morceau.role === 'cinq' ? styleCinq : styleLettres}
        >
          {morceau.texte}
        </span>
      ))}
      {produit ? (
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--police-titre)',
            fontWeight: 'var(--graisse-legere)',
            fontSize: `${Math.round(taille * LOGOTYPE.produit.echelle)}px`,
            color: couleurLettres,
            marginLeft: `${Math.round(taille * LOGOTYPE.produit.ecartEm)}px`,
          }}
        >
          {produit}
        </span>
      ) : null}
    </span>
  );
}
