import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icone } from './Icone';
import type { TonSemantique } from './Pastille';

/**
 * Le bandeau — une information d'état, sur toute la largeur.
 *
 * Chaque ton porte **une icône et un texte**, jamais la couleur seule. Et le rôle ARIA
 * suit le ton : `status` pour ce qui informe, `alert` pour ce qui demande une réaction.
 * Un lecteur d'écran annonce alors la chose au bon moment — un `alert` interrompt, un
 * `status` attend une pause.
 */

export interface ProprietesBandeau extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ton?: TonSemantique | undefined;
  /** Le titre du bandeau. Court, et il nomme la conséquence. */
  titre?: string | undefined;
  children: ReactNode;
  /** Une action unique, à droite. Un bandeau qui propose deux sorties n'en propose aucune. */
  action?: ReactNode | undefined;
}

const ICONES: Record<TonSemantique, LucideIcon> = {
  information: Info,
  reussite: CheckCircle2,
  attention: AlertTriangle,
  erreur: XCircle,
};

const COULEURS: Record<TonSemantique, { texte: string; fond: string }> = {
  information: { texte: 'var(--info)', fond: 'var(--info-fond)' },
  reussite: { texte: 'var(--reussite)', fond: 'var(--reussite-fond)' },
  attention: { texte: 'var(--attention)', fond: 'var(--attention-fond)' },
  erreur: { texte: 'var(--erreur)', fond: 'var(--erreur-fond)' },
};

/** `alert` interrompt le lecteur d'écran ; `status` attend. Le ton décide. */
const ROLES: Record<TonSemantique, 'status' | 'alert'> = {
  information: 'status',
  reussite: 'status',
  attention: 'alert',
  erreur: 'alert',
};

export function Bandeau({
  ton = 'information',
  titre,
  children,
  action,
  className,
  style,
  ...reste
}: ProprietesBandeau) {
  const couleurs = COULEURS[ton];

  const styleBandeau: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    background: couleurs.fond,
    color: 'var(--texte)',
    border: `1px solid ${couleurs.texte}`,
    borderRadius: 'var(--rayon-md)',
    fontFamily: 'var(--police-corps)',
    fontSize: 'var(--taille-sm)',
    lineHeight: 'var(--interligne-corps)',
    ...style,
  };

  return (
    <div className={className} style={styleBandeau} role={ROLES[ton]} data-ton={ton} {...reste}>
      <Icone nom={ICONES[ton]} taille={20} couleur={couleurs.texte} style={{ marginTop: '1px' }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {titre ? (
          <div
            style={{
              fontWeight: 'var(--graisse-semi)',
              color: couleurs.texte,
              marginBottom: '2px',
            }}
          >
            {titre}
          </div>
        ) : null}
        <div>{children}</div>
      </div>

      {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
    </div>
  );
}
