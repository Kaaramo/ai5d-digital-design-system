import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bouton } from './Bouton';
import { feuille } from './feuille';
import { Icone } from './Icone';
import type { TonSemantique } from './Pastille';

/**
 * Le bandeau — une information d'état, sur toute la largeur.
 *
 * Chaque ton porte **une icône et un texte**, jamais la couleur seule. Et le rôle ARIA
 * suit le ton : `status` pour ce qui informe, `alert` pour ce qui demande une réaction.
 * Un lecteur d'écran annonce alors la chose au bon moment — un `alert` interrompt, un
 * `status` attend une pause.
 *
 * Le ton `neutre` (v1.2.0) dit « rien à signaler » : icône `Info`, `role="status"`, contour et titre
 * en texte faible, corps en `--texte`. Le contour suit la règle des quatre autres tons, la couleur du
 * ton : en `--bordure-forte`, le bandeau ne se détacherait pas du papier (1,49).
 *
 * ── IL SE FERME, ET IL REÇOIT LE FOCUS, EN v1.3.0 ───────────────────────────
 * Avec `onFermer`, un bouton « Fermer ce message » suit l'action ; c'est le produit qui retire le
 * bandeau, jamais le système de lui-même. Avec `ref` et `tabIndex={-1}`, le produit peut y ramener le
 * focus quand l'élément qui l'avait disparaît : un anneau `:focus-visible` s'y dessine. La console du
 * Portail compose sa région de retour dessus ; Compte rendait déjà un `Bandeau` de réussite sans
 * fermeture (`Annonce.tsx:18-20`). Une extension, pas un composant : décision 012.
 */

export interface ProprietesBandeau extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ton?: TonSemantique | undefined;
  /** Le titre du bandeau. Court, et il nomme la conséquence. */
  titre?: string | undefined;
  children: ReactNode;
  /** Une action unique, à droite. Un bandeau qui propose deux sorties n'en propose aucune. */
  action?: ReactNode | undefined;
  /**
   * Présent : un bouton de fermeture, après l'action. Le produit retire le bandeau ; le système ne le
   * fait pas disparaître de lui-même, et ne le ferme jamais seul.
   */
  onFermer?: (() => void) | undefined;
  /** Le nom du bouton de fermeture. « Fermer ce message » par défaut. */
  libelleFermer?: string | undefined;
  /** Pour y ramener le focus quand l'élément qui l'avait disparaît. Avec `tabIndex={-1}`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

const ID_STYLE = 'ai5d-bandeau';

/** Le seul état du bandeau qui ne s'écrit pas en ligne : l'anneau, quand le produit y porte le focus. */
const STYLE_BANDEAU = `
.ai5d-bandeau:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }
`;

const ICONES: Record<TonSemantique, LucideIcon> = {
  information: Info,
  reussite: CheckCircle2,
  attention: AlertTriangle,
  erreur: XCircle,
  neutre: Info,
};

const COULEURS: Record<TonSemantique, { texte: string; fond: string }> = {
  information: { texte: 'var(--info)', fond: 'var(--info-fond)' },
  reussite: { texte: 'var(--reussite)', fond: 'var(--reussite-fond)' },
  attention: { texte: 'var(--attention)', fond: 'var(--attention-fond)' },
  erreur: { texte: 'var(--erreur)', fond: 'var(--erreur-fond)' },
  neutre: { texte: 'var(--texte-faible)', fond: 'var(--surface-chaude)' },
};

/** `alert` interrompt le lecteur d'écran ; `status` attend. Le ton décide. */
const ROLES: Record<TonSemantique, 'status' | 'alert'> = {
  information: 'status',
  reussite: 'status',
  attention: 'alert',
  erreur: 'alert',
  neutre: 'status',
};

export function Bandeau({
  ton = 'information',
  titre,
  children,
  action,
  onFermer,
  libelleFermer = 'Fermer ce message',
  className,
  style,
  ...reste
}: ProprietesBandeau) {
  const couleurs = COULEURS[ton];

  const styleBandeau: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--espace-3)',
    padding: '14px var(--espace-4)',
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
    <div
      className={className === undefined ? 'ai5d-bandeau' : `ai5d-bandeau ${className}`}
      style={styleBandeau}
      role={ROLES[ton]}
      data-ton={ton}
      {...reste}
    >
      {/* Hissée dans le head par React : la racine reste le bandeau, pour qui lit ses propriétés. */}
      {feuille(ID_STYLE, STYLE_BANDEAU)}
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

      {onFermer === undefined ? null : (
        <Bouton
          variante="discret"
          taille="sm"
          aria-label={libelleFermer}
          onClick={onFermer}
          style={{ alignSelf: 'flex-start' }}
        >
          <Icone nom={X} taille={16} />
        </Bouton>
      )}
    </div>
  );
}
