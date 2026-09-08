import { useId } from 'react';
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { EPAISSEUR_TRAIT } from './Icone';

/**
 * Le champ de saisie du registre applicatif.
 *
 * Trois garanties d'accessibilité, non négociables :
 *
 *  - le libellé est TOUJOURS lié à l'entrée par `htmlFor` et `id`. Un identifiant est
 *    engendré si aucun n'est fourni ;
 *  - l'aide et le message d'erreur sont reliés par `aria-describedby` ;
 *  - l'erreur n'est JAMAIS portée par la seule couleur. Elle pose `aria-invalid`, elle
 *    change la bordure, et elle affiche un texte. Près d'un homme sur douze ne
 *    distinguerait pas la bordure rouge de la bordure grise.
 */

/**
 * La taille de l'icône dans un champ, et la largeur qu'elle réserve à sa gauche.
 *
 * 20 px, et ce n'est pas un choix : la charte, chapitre 08, fixe cinq tailles et attribue
 * explicitement le 20 aux « boutons, champs ». Le 16 est pour les métadonnées en ligne,
 * le 24 pour la navigation.
 */
export const TAILLE_ICONE_CHAMP = 20;
const RETRAIT = 14;
const ESPACE_ICONE = RETRAIT + TAILLE_ICONE_CHAMP + 10;

const ID_STYLE = 'ai5d-champ';

/**
 * Les couleurs et les états, hors du style en ligne, pour la même raison que dans
 * `Bouton` : une pseudo-classe ne peut pas battre un attribut `style`. Avant la v0.4.0, un
 * champ ne montrait ni son survol ni son focus autrement que par l'anneau par défaut du
 * navigateur, que la remise à zéro de Tailwind rend discret.
 *
 * L'anneau de focus d'un champ est décalé de **1 px** et non de 2 comme celui d'un bouton :
 * le champ a une bordure visible, et un décalage de 2 px laisse un liseré de fond entre les
 * deux, ce qui donne un halo flou.
 *
 * L'anneau d'un champ en erreur est **rouge**. Un anneau bleu sur une bordure rouge dirait
 * deux choses contradictoires au même endroit.
 *
 * Les règles s'accrochent à `aria-invalid`, que le composant pose déjà : l'état visuel et
 * l'état annoncé ne peuvent donc pas diverger.
 */
const STYLE_CHAMP = `
.ai5d-champ__entree {
  background: var(--surface-2);
  color: var(--texte-fort);
  border: 1px solid var(--bordure-forte);
  transition: border-color var(--duree-courte) var(--courbe-entree);
}
.ai5d-champ__entree:hover:not(:disabled) { border-color: var(--texte-faible); }
.ai5d-champ__entree:focus-visible {
  border-color: var(--action);
  outline: 2px solid var(--action);
  outline-offset: 1px;
}
.ai5d-champ__entree[aria-invalid='true'],
.ai5d-champ__entree[aria-invalid='true']:hover:not(:disabled) {
  border-color: var(--erreur);
}
.ai5d-champ__entree[aria-invalid='true']:focus-visible {
  border-color: var(--erreur);
  outline-color: var(--erreur);
}
`;

export interface ProprietesChamp extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
  /** Le libellé visible. Obligatoire : un champ sans libellé n'est pas accessible. */
  libelle: string;
  /**
   * Une icône posée dans le champ, à gauche du texte saisi.
   *
   * Elle est **décorative** : `aria-hidden`, jamais focalisable, et elle ne remplace
   * jamais le libellé. Une forme se reconnaît avant d'être lue, ce qui aide au balayage
   * d'un formulaire ; mais un lecteur d'écran, lui, n'a que le libellé, et il doit
   * suffire.
   *
   * **Le choix de l'icône n'est pas libre.** La charte, chapitre 08, attribue une icône
   * Lucide à chaque fonction, et deux se ressemblent sans dire la même chose : `shield`
   * est la sécurité et le mot de passe, `lock` est le verrouillage et l'accès refusé.
   *
   * Ce composant n'impose rien : c'est la table de fonctions du produit qui décide, et un
   * produit peut s'écarter de la charte à condition de consigner l'écart. Le portail
   * Compte l'a fait le 8 septembre 2026, pour poser un cadenas sur son champ de mot de
   * passe : l'argument du refus annoncé est théorique là où l'usage est universel.
   */
  icone?: LucideIcon | undefined;
  /**
   * Une commande propre au champ, posée à droite DANS le cadre.
   *
   * L'usage qui l'a fait naître est la bascule « Afficher / Masquer » d'un mot de passe.
   * Posée hors du composant, elle se retrouvait sur la ligne du libellé et se lisait
   * comme un second libellé. Ici, elle est visiblement rattachée au champ.
   */
  commande?: ReactNode | undefined;
  /** Texte d'aide, affiché sous le champ tant qu'il n'y a pas d'erreur. */
  aide?: ReactNode | undefined;
  /** Message d'erreur. Sa présence bascule le champ en état d'erreur. */
  erreur?: ReactNode | undefined;
}

export function Champ({
  libelle,
  icone: Icone,
  commande,
  aide,
  erreur,
  id,
  className,
  style,
  ...reste
}: ProprietesChamp) {
  const identifiantEngendre = useId();
  const identifiant = id ?? `champ-${identifiantEngendre}`;
  const identifiantAide = `${identifiant}-aide`;
  const identifiantErreur = `${identifiant}-erreur`;

  const enErreur = erreur !== undefined && erreur !== null && erreur !== '';

  const decritPar = [enErreur ? identifiantErreur : null, aide ? identifiantAide : null]
    .filter(Boolean)
    .join(' ');

  const styleEntree: CSSProperties = {
    width: '100%',
    height: 'var(--hauteur-controle)',
    minHeight: 'var(--cible-tactile)',
    // Le rembourrage s'ouvre à gauche pour l'icône et à droite pour la commande. Sans
    // cela, le texte saisi passerait dessous et deviendrait illisible dès qu'il est long.
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: Icone === undefined ? `${RETRAIT}px` : `${ESPACE_ICONE}px`,
    paddingRight: commande === undefined ? `${RETRAIT}px` : `${ESPACE_ICONE + 40}px`,
    fontFamily: 'var(--police-corps)',
    fontSize: 'var(--taille-md)',
    borderRadius: 'var(--rayon-md)',
    ...style,
  };

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_CHAMP }} />

      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          htmlFor={identifiant}
          style={{
            fontFamily: 'var(--police-corps)',
            fontSize: 'var(--taille-sm)',
            fontWeight: 'var(--graisse-moyenne)',
            color: 'var(--texte)',
          }}
        >
          {libelle}
        </label>

        {/*
          Le cadre relatif ne sert qu'à porter l'icône et la commande. Il n'existe que si
          l'une des deux est demandée : un champ nu garde exactement la structure qu'il
          avait avant, ce qui évite de changer le rendu de tous les formulaires existants.
        */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {Icone === undefined ? null : (
            <Icone
              aria-hidden="true"
              focusable="false"
              size={TAILLE_ICONE_CHAMP}
              strokeWidth={EPAISSEUR_TRAIT}
              color={enErreur ? 'var(--erreur)' : 'var(--texte-faible)'}
              style={{
                position: 'absolute',
                left: `${RETRAIT}px`,
                pointerEvents: 'none',
                flexShrink: 0,
              }}
            />
          )}

          <input
            id={identifiant}
            className="ai5d-champ__entree"
            style={styleEntree}
            aria-invalid={enErreur || undefined}
            aria-describedby={decritPar === '' ? undefined : decritPar}
            {...reste}
          />

          {commande === undefined ? null : (
            <span
              style={{
                position: 'absolute',
                right: `${RETRAIT}px`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {commande}
            </span>
          )}
        </div>

        {enErreur ? (
          <span
            id={identifiantErreur}
            role="alert"
            style={{
              fontFamily: 'var(--police-corps)',
              fontSize: 'var(--taille-sm)',
              color: 'var(--erreur)',
            }}
          >
            {erreur}
          </span>
        ) : null}

        {aide && !enErreur ? (
          <span
            id={identifiantAide}
            style={{
              fontFamily: 'var(--police-corps)',
              fontSize: 'var(--taille-sm)',
              color: 'var(--texte-faible)',
            }}
          >
            {aide}
          </span>
        ) : null}
      </div>
    </>
  );
}
