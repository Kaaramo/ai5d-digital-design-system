import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Carte } from './Carte';
import { Bouton } from './Bouton';
import type { VarianteBouton } from './Bouton';
import { Icone } from './Icone';
import { COMPACT } from '../paliers';

/**
 * Le motif « une carte, une action ».
 *
 * Une pastille d'icône, un titre, une description, et un bouton qui nomme sa destination.
 * C'est la brique de la page d'accueil d'une coquille d'application : sur un téléphone, on
 * empile ces cartes en une colonne plutôt que d'ouvrir une grille, parce qu'une grille à
 * deux colonnes sur 390 px donne des cibles de 150 px de large.
 *
 * ── LE BOUTON NOMME SA DESTINATION ──────────────────────────────────────────
 * « Mon profil », pas « Voir ». Sur une page qui empile quatre cartes, quatre boutons
 * « Voir » obligent à relire le titre au-dessus pour savoir où l'on va, et un lecteur
 * d'écran qui liste les boutons de la page en annonce quatre identiques.
 *
 * ── CE QUE CE COMPOSANT NE FAIT PAS ─────────────────────────────────────────
 * Il ne teinte pas son fond. Le motif dont il s'inspire donne une couleur à chaque section,
 * vert, bleu, jaune. Deux règles l'interdisent ici : la charte mère écrit que la
 * différenciation se fait par le nom et jamais par la couleur, et le vert et le jaune sont
 * des jetons sémantiques. Un fond vert décoratif, et « réussite » ne veut plus rien dire
 * nulle part ailleurs.
 *
 * ── UN SEUL PRIMAIRE PAR VUE ────────────────────────────────────────────────
 * La variante du bouton se règle en propriété. Le composant ne peut pas compter ses
 * voisins ; c'est au produit de tenir la règle, et elle est écrite dans la charte.
 */

export interface ProprietesCarteAction {
  /** Une icône Lucide. Décorative : le titre porte l'information. */
  icone: LucideIcon;
  titre: string;
  description?: string;
  /** Le libellé du bouton. Il nomme la destination. */
  action: string;
  /** Fourni, le bouton devient un lien. Absent, il appelle `onAction`. */
  href?: string;
  onAction?: () => void;
  /** Un seul `primaire` par vue. Voir l'en-tête de ce fichier. */
  variante?: VarianteBouton;
  className?: string;
  style?: CSSProperties;
}

/** Le diamètre de la pastille d'icône. Sous le plancher de 320 px : largeur fixe permise. */
export const TAILLE_PASTILLE_ICONE = 48;

const ID_STYLE = 'ai5d-carte-action';

const STYLE_CARTE = `
.ai5d-carte-action__pastille {
  display: flex; align-items: center; justify-content: center;
  width: ${TAILLE_PASTILLE_ICONE}px; height: ${TAILLE_PASTILLE_ICONE}px;
  border-radius: var(--rayon-plein);
  background: var(--surface-chaude);
  color: var(--texte-fort);
  margin-bottom: 16px;
}
.ai5d-carte-action__titre {
  margin: 0 0 6px;
  font-family: var(--police-corps);
  font-size: var(--taille-lg);
  font-weight: var(--graisse-semi);
  line-height: var(--interligne-titre);
  color: var(--texte-fort);
}
.ai5d-carte-action__texte {
  margin: 0 0 20px;
  font-size: var(--taille-sm);
  line-height: var(--interligne-corps);
  color: var(--texte-faible);
}
.ai5d-carte-action__action { display: block; }
.ai5d-carte-action__action > * { width: 100%; }

/* Au-dela du palier compact, le bouton reprend sa largeur naturelle : un bouton
   pleine largeur sur un ecran de 900 px n'aide plus personne a viser. */
@media (min-width: ${COMPACT}px) {
  .ai5d-carte-action__action > * { width: auto; }
}
`;

export function CarteAction({
  icone,
  titre,
  description,
  action,
  href,
  onAction,
  variante = 'secondaire',
  className,
  style,
}: ProprietesCarteAction) {
  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_CARTE }} />

      <Carte className={className} style={style} data-carte="action">
        <div className="ai5d-carte-action__pastille">
          <Icone nom={icone} taille={24} />
        </div>

        <h3 className="ai5d-carte-action__titre">{titre}</h3>

        {description === undefined ? null : (
          <p className="ai5d-carte-action__texte">{description}</p>
        )}

        <div className="ai5d-carte-action__action">
          {href === undefined ? (
            <Bouton variante={variante} onClick={onAction}>
              {action}
            </Bouton>
          ) : (
            /*
              Un lien qui a l'apparence d'un bouton reste un lien : il s'ouvre dans un
              nouvel onglet au clic du milieu, il se copie, et il s'annonce comme lien.
              Le rendre en <button> avec une navigation manuelle retirerait les trois.
            */
            <a
              href={href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'var(--cible-tactile)',
                height: 'var(--hauteur-controle)',
                padding: '0 20px',
                borderRadius: 'var(--rayon-md)',
                background: variante === 'primaire' ? 'var(--action)' : 'transparent',
                color: variante === 'primaire' ? 'var(--texte-sur-action)' : 'var(--action)',
                border: `1px solid ${variante === 'discret' ? 'transparent' : 'var(--action)'}`,
                fontFamily: 'var(--police-corps)',
                fontSize: 'var(--taille-md)',
                fontWeight: 'var(--graisse-semi)',
                lineHeight: 1,
                textDecoration: 'none',
              }}
            >
              {action}
            </a>
          )}
        </div>
      </Carte>
    </>
  );
}
