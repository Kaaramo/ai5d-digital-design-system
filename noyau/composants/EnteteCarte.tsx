import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icone } from './Icone';

/**
 * L en-tete d une carte du portail : une icone encadree, un titre, une description.
 *
 * ── POURQUOI IL REMPLACE `CarteTitre` ───────────────────────────────────────
 * Douze cartes commencaient par un `h2` nu. Rien ne distinguait « Mot de passe » de
 * « Supprimer votre compte » avant d en avoir lu le corps, et l oeil qui parcourt la page
 * ne trouvait aucun point d accroche entre deux blocs de texte gris. Une rubrique de
 * cinq cartes se lisait comme un seul paragraphe long.
 *
 * ── LA DESCRIPTION REMONTE DANS L EN-TETE ───────────────────────────────────
 * Elle etait le premier paragraphe du corps, ce qui la mettait au meme niveau
 * typographique que le contenu qu elle annonce. Ici elle est sous le titre, en
 * `--texte-faible`, et le corps commence a ce qui se fait plutot qu a ce qui s explique.
 *
 * ── LA SURFACE DES PASTILLES EST `--surface-1`, ET C EST UNE MESURE ─────────
 * Mesure faite au navigateur, en ecart de clarte L*, contre la surface qui les porte
 * (`--surface-2`). Le ratio de contraste WCAG ne sert a rien entre deux surfaces
 * voisines : il tasse tout entre 1,0 et 1,2 et ne distingue pas le visible de l invisible.
 *
 *              theme clair    theme sombre
 *   surface-3      0,00           5,05        invisible en CLAIR
 *   surface-chaude 5,37           0,64        invisible en SOMBRE
 *   info-fond      5,50           0,59        invisible en SOMBRE
 *   surface-1      2,67           5,17        presente des DEUX cotes
 *   bordure       10,53           8,03        presente des DEUX cotes
 *
 * AUCUN jeton de surface du systeme ne se detache de `--surface-2` dans les deux themes.
 * `--surface-1` est le seul dont l ecart n est nul nulle part, et il reste faible en
 * clair : c est le FILET `--bordure` qui porte la separation, la teinte ne fait que
 * l appuyer.
 *
 * Ce trou appartient au systeme de design. Il a ete releve dans Compte ; le jeton de selection
 * du sprint 17 en ferme la part qui touchait la navigation, pas celle d un cadre d icone.
 *
 * ── LE TON `danger` EST RARE, ET C EST SA FORCE ─────────────────────────────
 * Il passe le cadre en `--erreur-fond` et l icone en `--erreur`. Une seule carte par
 * rubrique le porte, celle dont l action ne se defait pas. Deux icones rouges sur un
 * meme ecran et la couleur ne signale plus rien.
 *
 * ── `h2` ET NON `h3` ────────────────────────────────────────────────────────
 * Le `h1` de la rubrique est juste au-dessus, et un lecteur d ecran qui parcourt les
 * titres doit trouver les cartes au niveau immediatement inferieur.
 *
 * ── L ICONE RESTE DECORATIVE ────────────────────────────────────────────────
 * Le titre est a cote d elle, en toutes lettres. La faire annoncer par un lecteur
 * d ecran ferait entendre deux fois la meme chose.
 */

export type TonEnteteCarte = 'neutre' | 'danger';

const CADRES: Record<TonEnteteCarte, { fond: string; bordure: string; icone: string }> = {
  neutre: {
    fond: 'var(--surface-1)',
    bordure: 'var(--bordure)',
    icone: 'var(--texte-fort)',
  },
  danger: {
    fond: 'var(--erreur-fond)',
    bordure: 'var(--erreur-fond)',
    icone: 'var(--erreur)',
  },
};

export function EnteteCarte({
  icone,
  titre,
  description,
  ton = 'neutre',
  droite,
}: {
  icone: LucideIcon;
  titre: string;
  description?: string | undefined;
  ton?: TonEnteteCarte | undefined;
  /**
   * L emplacement a la suite du titre : une pastille d etat, jamais une action.
   *
   * Une action ici serait au-dessus de la ligne de flottaison de la carte, avant meme sa
   * description : on la declencherait sans avoir lu ce qu elle fait.
   */
  droite?: ReactNode | undefined;
}) {
  const cadre = CADRES[ton];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--espace-4)',
        marginBottom: 'var(--espace-6)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--rayon-md)',
          background: cadre.fond,
          border: `1px solid ${cadre.bordure}`,
          color: cadre.icone,
        }}
      >
        <Icone nom={icone} taille={20} />
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
        {/*
          L EMPLACEMENT DE DROITE EST DANS LE FLUX DU TITRE, PAS EN COLONNE A PART.

          Mesure faite au navigateur sur un ecran de 390 px : en colonne separee, la
          pastille prenait sa largeur sur le texte, et « Un mot de passe volé suffit à
          entrer. Un code à six chiffres change cela. » se repliait sur quatre lignes de
          135 px. Une description qui explique pourquoi activer une protection ne se lit
          pas en colonne de trois mots.

          Dans le flux, `flexWrap` la fait passer sous le titre quand la place manque, et
          elle reste alignee sur la colonne de texte plutot que de deriver a droite.
        */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--espace-3)',
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--police-corps)',
              fontSize: 'var(--taille-md)',
              fontWeight: 'var(--graisse-semi)',
              lineHeight: 'var(--interligne-titre)',
              color: 'var(--texte-fort)',
            }}
          >
            {titre}
          </h2>

          {droite}
        </div>

        {description === undefined ? null : (
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--police-corps)',
              fontSize: 'var(--taille-sm)',
              lineHeight: 'var(--interligne-corps)',
              color: 'var(--texte-faible)',
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
