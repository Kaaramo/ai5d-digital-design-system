import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icone } from './Icone';
import { TABLETTE } from '../paliers';

/**
 * La navigation basse d'une coquille d'application.
 *
 * Elle est en bas parce que le pouce y arrive. Sur un téléphone de six pouces tenu d'une
 * main, le coin haut droit demande de changer la prise ; le bas de l'écran, non. C'est la
 * seule raison, et elle suffit.
 *
 * Elle disparaît à partir du palier tablette : au-delà, l'appareil se tient à deux mains ou
 * se pose, et une barre basse gaspille une bande de 56 px sur toute la largeur.
 *
 * ── TROIS GARANTIES ─────────────────────────────────────────────────────────
 *
 * 1. Chaque onglet porte une icône ET un mot. Une rangée d'icônes seules oblige à
 *    apprendre un vocabulaire avant de pouvoir naviguer.
 *
 * 2. L'état actif ne passe pas que par la couleur. Il porte `aria-current`, il prend la
 *    couleur d'action, et il passe la graisse de son libellé de normale à semi-grasse.
 *    Les trois ensemble, ou l'information n'atteint pas tout le monde.
 *
 * 3. La zone sûre du bas est réservée. Sans elle, la barre passe SOUS la barre de gestes
 *    d'un iPhone : elle reste visible, et elle devient inatteignable. Le défaut ne se voit
 *    pas sur un émulateur de bureau.
 *
 * ── TROIS À CINQ ONGLETS ────────────────────────────────────────────────────
 * En dessous de trois, une barre ne sert à rien : deux liens tiennent dans l'en-tête.
 * Au-delà de cinq, chaque cible descend sous 70 px de large sur un téléphone de 390 px et
 * le libellé se coupe. Le sixième onglet devient « Plus ».
 *
 * Le composant ne tronque pas et ne lève pas : il rend fidèlement ce qu'on lui donne. La
 * règle est écrite ici et dans PALIERS.md, et c'est au produit de la tenir.
 */

export interface Onglet {
  /** Identifiant stable. C'est lui qui désigne l'onglet actif. */
  id: string;
  /** Le mot. Court, un seul, jamais une phrase. */
  libelle: string;
  /** Une icône Lucide, importée par le consommateur. */
  icone: LucideIcon;
  /** Fourni, l'onglet devient un lien. Absent, il devient un bouton. */
  href?: string;
}

export interface ProprietesBarreOnglets {
  /** Trois à cinq. Voir l'en-tête de ce fichier. */
  onglets: Onglet[];
  /** L'`id` de l'onglet courant. */
  actif: string;
  /** Appelé au choix d'un onglet sans `href`. */
  onChoisir?: (id: string) => void;
  /** Le nom de la navigation pour les lecteurs d'écran. */
  etiquette?: string;
  className?: string;
  style?: CSSProperties;
}

/** La hauteur de la barre, hors zone sûre. Le contenu doit la réserver sous lui. */
export const HAUTEUR_BARRE_ONGLETS = 56;

/** Les bornes du nombre d'onglets. Voir l'en-tête de ce fichier. */
export const ONGLETS_MIN = 3;
export const ONGLETS_MAX = 5;

const ID_STYLE = 'ai5d-barre-onglets';

/**
 * Les règles qui dépendent d'une requête média ne peuvent pas s'écrire en style en ligne.
 * On les injecte une fois, sous un identifiant stable, plutôt que d'imposer Tailwind au
 * consommateur.
 */
const STYLE_BARRE = `
.ai5d-onglets {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
  display: flex; align-items: stretch;
  background: var(--surface-2);
  border-top: 1px solid var(--bordure);
  padding-bottom: var(--zone-sure-basse, 0px);
  padding-left: var(--zone-sure-gauche, 0px);
  padding-right: var(--zone-sure-droite, 0px);
}
.ai5d-onglets__item {
  flex: 1 1 0; min-width: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px;
  height: ${HAUTEUR_BARRE_ONGLETS}px;
  min-height: var(--cible-tactile);
  padding: 0 4px;
  background: transparent; border: 0; cursor: pointer;
  color: var(--texte-faible);
  font-family: var(--police-corps);
  font-size: var(--taille-xs);
  font-weight: var(--graisse-normale);
  line-height: 1.1;
  text-decoration: none;
}
.ai5d-onglets__item[aria-current] {
  color: var(--action);
  font-weight: var(--graisse-semi);
}
.ai5d-onglets__mot {
  max-width: 100%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

@media (min-width: ${TABLETTE}px) {
  .ai5d-onglets { display: none; }
}
`;

export function BarreOnglets({
  onglets,
  actif,
  onChoisir,
  etiquette = 'Navigation principale',
  className,
  style,
}: ProprietesBarreOnglets) {
  const classes = className ? `ai5d-onglets ${className}` : 'ai5d-onglets';

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_BARRE }} />

      <nav className={classes} style={style} aria-label={etiquette} data-onglets={onglets.length}>
        {onglets.map((onglet) => {
          const courant = onglet.id === actif;

          /*
            L'icône reste décorative : le mot est juste en dessous, et le faire lire deux
            fois n'apporte rien. C'est la règle générale du système, appliquée ici.
          */
          const contenu = (
            <>
              <Icone nom={onglet.icone} taille={20} />
              <span className="ai5d-onglets__mot">{onglet.libelle}</span>
            </>
          );

          const communs = {
            className: 'ai5d-onglets__item',
            'aria-current': courant ? ('page' as const) : undefined,
            'data-onglet': onglet.id,
          };

          return onglet.href === undefined ? (
            <button
              key={onglet.id}
              type="button"
              onClick={() => onChoisir?.(onglet.id)}
              {...communs}
            >
              {contenu}
            </button>
          ) : (
            <a key={onglet.id} href={onglet.href} {...communs}>
              {contenu}
            </a>
          );
        })}
      </nav>
    </>
  );
}
