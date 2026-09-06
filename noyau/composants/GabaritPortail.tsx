import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Logotype } from './Logotype';
import { Icone } from './Icone';
import { BarreOnglets, HAUTEUR_BARRE_ONGLETS } from './BarreOnglets';
import { HAUTEUR_ENTETE } from './GabaritApp';
import { LARGE, TABLETTE } from '../paliers';

/**
 * La coquille d'un portail de réglages : en-tête collant, rubriques, contenu.
 *
 * ── POURQUOI CE N'EST PAS `GabaritApp` ──────────────────────────────────────
 * `GabaritApp` fait disparaître sa navigation dès la tablette et laisse au produit le
 * soin de la remonter dans l'en-tête. C'est juste pour une application dont la navigation
 * est un choix de produit. Un portail de réglages n'a pas ce choix : la charte, chapitre
 * 07, prescrit un rail de rubriques de 280 px sur bureau, et elle le prescrit pour tout
 * l'écosystème. Écrire ce rail dans chaque produit produirait cinq rails divergents.
 *
 * ── LES DEUX NAVIGATIONS SONT LA MÊME LISTE ─────────────────────────────────
 * Sous 768 px, la barre basse. Au-delà, le rail. Jamais les deux à l'écran, jamais deux
 * listes différentes : elles se nourrissent du même tableau `rubriques`. Les deux sont
 * rendues dans le HTML et c'est la requête média qui en masque une, plutôt qu'une mesure
 * de fenêtre au montage : cette dernière produirait un écart d'hydratation, et le premier
 * rendu au serveur ne saurait pas laquelle choisir.
 *
 * ── LA MESURE QUI DÉCIDE DU RAIL ────────────────────────────────────────────
 * 240 px en tablette, 280 px à partir de 1280. La charte donne 280 pour le bureau et
 * reste muette entre 768 et 1279, où elle demande seulement « deux colonnes ». À 768 px,
 * un rail de 280 laisse 416 px de contenu ; un rail de 240 en laisse 456. C'est une
 * valeur mesurée dans un silence documenté, pas une invention.
 *
 * ── CE QUE LE GABARIT NE FAIT PAS ───────────────────────────────────────────
 * Il ne connaît ni la session, ni les droits, ni les produits. L'en-tête reçoit son
 * contenu de droite en propriété. Un gabarit qui lirait la session appartiendrait à la
 * couche écosystème, pas au noyau.
 */

export interface Rubrique {
  /** L'identifiant, comparé à `actif`. */
  id: string;
  libelle: string;
  icone: LucideIcon;
  /**
   * L'adresse de la rubrique. **Requise**, contrairement à `Onglet` où elle est
   * optionnelle : un onglet peut piloter un état local, une rubrique de portail est une
   * page, et une page a une adresse. La rendre optionnelle autoriserait une navigation
   * qui ne se copie pas, ne s'ouvre pas au clic du milieu, et disparaît sans JavaScript.
   */
  href: string;
}

export interface ProprietesGabaritPortail {
  /** Le nom du produit, à côté du logotype. « Compte », « Académie », « Lab ». */
  produit?: string | undefined;
  /** Le contenu de droite de l'en-tête : avatar, menu. Fourni par le produit. */
  actions?: ReactNode | undefined;
  /** Trois à cinq rubriques, mêmes bornes que `BarreOnglets`. */
  rubriques: Rubrique[];
  /** L'`id` de la rubrique courante. Une valeur inconnue n'en active aucune. */
  actif: string;
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** La largeur du rail entre 768 et 1279 px. Voir l'en-tête de ce fichier. */
export const LARGEUR_RAIL_TABLETTE = 240;

/** La largeur du rail à partir de 1280 px. Charte, chapitre 07. */
export const LARGEUR_RAIL_BUREAU = 280;

const ID_STYLE = 'ai5d-gabarit-portail';

/**
 * Les règles qui dépendent d'une requête média ne peuvent pas s'écrire en style en ligne.
 * On les injecte une fois, sous un identifiant stable, plutôt que d'imposer Tailwind au
 * consommateur. Même technique que `BarreOnglets` et `GabaritApp`.
 */
const STYLE_PORTAIL = `
.ai5d-portail {
  display: flex; flex-direction: column;
  min-height: 100dvh;
  background: var(--surface-1);
}
.ai5d-portail__entete {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  height: calc(${HAUTEUR_ENTETE}px + var(--zone-sure-haute, 0px));
  padding: var(--zone-sure-haute, 0px) var(--marge-page) 0;
  background: var(--surface-2);
  border-bottom: 1px solid var(--bordure);
}
.ai5d-portail__corps {
  flex: 1 1 auto;
  display: flex; align-items: flex-start;
  width: 100%;
}
.ai5d-portail__rail { display: none; }
.ai5d-portail__contenu {
  flex: 1 1 auto; min-width: 0; width: 100%;
  padding: var(--rythme-section) var(--marge-page);
  padding-bottom: calc(var(--rythme-section) + var(--reserve-barre, 0px));
}

@media (min-width: ${TABLETTE}px) {
  /* La barre basse, elle, se masque toute seule au meme palier : c'est sa propre regle,
     et la dupliquer ici creerait deux endroits ou changer le palier. */
  .ai5d-portail { --reserve-barre: 0px; }
  .ai5d-portail__rail {
    display: flex; flex-direction: column; gap: 2px;
    position: sticky; top: calc(${HAUTEUR_ENTETE}px + var(--zone-sure-haute, 0px));
    flex: 0 0 ${LARGEUR_RAIL_TABLETTE}px; width: ${LARGEUR_RAIL_TABLETTE}px;
    padding: var(--espace-6) var(--espace-3);
  }
  .ai5d-portail__lien {
    display: flex; align-items: center; gap: var(--espace-3);
    min-height: var(--cible-tactile);
    padding: var(--espace-3) var(--espace-4);
    border-radius: var(--rayon-md);
    color: var(--texte);
    font-family: var(--police-corps); font-size: var(--taille-sm);
    text-decoration: none;
    transition: background var(--duree-courte) var(--courbe-sortie),
                color var(--duree-courte) var(--courbe-sortie);
  }
  .ai5d-portail__lien:hover { background: var(--surface-2); }
  .ai5d-portail__lien[aria-current='page'] {
    background: var(--surface-2);
    color: var(--action);
    font-weight: var(--graisse-semi);
  }
  .ai5d-portail__contenu { max-width: var(--contenu-max); }
}

@media (min-width: ${LARGE}px) {
  .ai5d-portail__rail {
    flex-basis: ${LARGEUR_RAIL_BUREAU}px;
    width: ${LARGEUR_RAIL_BUREAU}px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-portail__lien { transition: none; }
}
`;

export function GabaritPortail({
  produit,
  actions,
  rubriques,
  actif,
  children,
  className,
  style,
}: ProprietesGabaritPortail) {
  const classes = className ? `ai5d-portail ${className}` : 'ai5d-portail';

  /*
    La réserve basse est portée par le gabarit, en variable, et jamais par les écrans.
    C'est la leçon écrite dans `GabaritApp` : un écran qui la porterait lui-même
    l'oublierait le jour où quelqu'un ajoute une ligne, et le défaut ne se voit que sur
    les pages longues. La requête média du palier tablette la remet à zéro, là où la
    barre disparaît.
  */
  const styleRacine: CSSProperties = {
    ...({
      '--reserve-barre': `calc(${HAUTEUR_BARRE_ONGLETS}px + var(--zone-sure-basse, 0px))`,
    } as CSSProperties),
    ...style,
  };

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_PORTAIL }} />

      <div className={classes} style={styleRacine} data-gabarit="portail">
        <header className="ai5d-portail__entete">
          <Logotype produit={produit} taille={20} />
          {actions === undefined ? null : <div>{actions}</div>}
        </header>

        <div className="ai5d-portail__corps">
          <nav className="ai5d-portail__rail" aria-label="Rubriques du compte">
            {rubriques.map((rubrique) => (
              <a
                key={rubrique.id}
                href={rubrique.href}
                className="ai5d-portail__lien"
                aria-current={rubrique.id === actif ? 'page' : undefined}
                data-rubrique={rubrique.id}
              >
                {/*
                  L'icône reste décorative : le mot est juste à côté, et le faire lire
                  deux fois n'apporte rien. C'est la règle générale du système.
                */}
                <Icone nom={rubrique.icone} taille={20} />
                <span>{rubrique.libelle}</span>
              </a>
            ))}
          </nav>

          <main className="ai5d-portail__contenu">{children}</main>
        </div>

        <BarreOnglets
          onglets={rubriques.map((rubrique) => ({
            id: rubrique.id,
            libelle: rubrique.libelle,
            icone: rubrique.icone,
            href: rubrique.href,
          }))}
          actif={actif}
          etiquette="Rubriques du compte"
        />
      </div>
    </>
  );
}
