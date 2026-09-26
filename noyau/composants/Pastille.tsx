import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

/**
 * La pastille — un état, en version compacte.
 *
 * Elle contient toujours du texte. Une pastille de couleur sans mot ne dit rien à qui
 * ne distingue pas les couleurs, et rien du tout à qui la découvre.
 *
 * ── LE TON `neutre`, EN v1.2.0 ──────────────────────────────────────────────
 * Il dit « rien à signaler » : un état au repos, qui ne demande aucun geste et n'annonce aucune
 * réussite (« Inscription confirmée », « Formation terminée », « Sans accès »). Il ne dit jamais un
 * état qui attend un geste, c'est `attention`, ni un échec, c'est `erreur`. Texte faible sur surface
 * chaude : 4,53 en clair, 5,79 en sombre, mesurés par la garde de contraste. En sombre, le fond ne se
 * détache pas d'une carte ; c'est le mot qui porte l'état, comme partout dans le système.
 */

export type TonSemantique = 'information' | 'reussite' | 'attention' | 'erreur' | 'neutre';

export interface ProprietesPastille extends HTMLAttributes<HTMLSpanElement> {
  ton?: TonSemantique | undefined;
  children: ReactNode;
}

const COULEURS: Record<TonSemantique, { texte: string; fond: string }> = {
  information: { texte: 'var(--info)', fond: 'var(--info-fond)' },
  reussite: { texte: 'var(--reussite)', fond: 'var(--reussite-fond)' },
  attention: { texte: 'var(--attention)', fond: 'var(--attention-fond)' },
  erreur: { texte: 'var(--erreur)', fond: 'var(--erreur-fond)' },
  neutre: { texte: 'var(--texte-faible)', fond: 'var(--surface-chaude)' },
};

export function Pastille({
  ton = 'information',
  children,
  className,
  style,
  ...reste
}: ProprietesPastille) {
  const couleurs = COULEURS[ton];

  const stylePastille: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    background: couleurs.fond,
    color: couleurs.texte,
    fontFamily: 'var(--police-corps)',
    fontSize: 'var(--taille-xs)',
    fontWeight: 'var(--graisse-moyenne)',
    lineHeight: 1.6,
    borderRadius: 'var(--rayon-plein)',
    ...style,
  };

  return (
    <span className={className} style={stylePastille} data-ton={ton} {...reste}>
      {children}
    </span>
  );
}
