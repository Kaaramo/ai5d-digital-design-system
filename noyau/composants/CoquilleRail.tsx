import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Logotype } from './Logotype';
import { RechargeAuRetour } from './RechargeAuRetour';
import { BUREAU, TABLETTE } from '../paliers';

/**
 * La coquille de tout écran de produit qui porte une navigation de rubriques.
 *
 * ── D'OÙ ELLE VIENT ─────────────────────────────────────────────────────────
 * De Compte, qui en portait deux copies divergentes : `CoquillePortail` pour le compte de la
 * personne, `CoquilleConsole` pour l'administration. `GabaritPortail`, écrit dans le système
 * avant tout usage réel, avait une forme fausse (un en-tête horizontal au-dessus du rail) et n'a
 * jamais été employé. Le deuxième produit à demander un rail, AI5D Portail, est la condition que
 * Compte avait posée pour remonter sa version : elle est remplie.
 *
 * ── ELLE NE CONNAÎT NI LA SESSION, NI LES DROITS, NI LE ROUTEUR ─────────────
 * Aucun crochet, aucune directive, aucune dépendance à Next : elle se rend au serveur. La
 * navigation lui arrive en EMPLACEMENTS, des éléments déjà rendus par un module client du
 * produit avec `LiensRail` et `BarreOnglets`. C'est la seule pièce qui connaît le chemin, et elle
 * reste dans le produit.
 *
 * ── LES DEUX NAVIGATIONS SONT RENDUES, LA REQUÊTE MÉDIA EN MASQUE UNE ───────
 * Sous 768 px, la barre basse ; au-delà, le rail. Jamais les deux à l'écran. Les deux sont dans le
 * HTML et c'est le CSS qui choisit, plutôt qu'une mesure de fenêtre au montage : le rendu du
 * serveur ne saurait pas laquelle choisir, et l'écart d'hydratation ferait sauter l'écran.
 *
 * ── DEUX MODES ──────────────────────────────────────────────────────────────
 * `complet` : barre compacte et barre basse sous 768 px, rail au-delà. C'est le portail.
 *
 * `bureau-seulement` : sous 1024 px, `refus` remplace tout. C'est la console, que la charte
 * nomme comme la seule exception au palier téléphone. Rendre une version dégradée inviterait à
 * suspendre un compte depuis un téléphone dans un couloir, c'est-à-dire dans le contexte où l'on
 * se trompe de ligne. Le refus passe par le CSS, jamais par une mesure au montage : cette dernière
 * ferait apparaître la console une fraction de seconde sur un téléphone.
 *
 * ── LA RÉSERVE BASSE EST PORTÉE PAR LA COQUILLE ─────────────────────────────
 * `--reserve-barre` est réglé ici, sous 768 px, et remis à `0px` au-delà. Jamais par un écran : un
 * écran qui la porterait lui-même l'oublierait le jour où quelqu'un en ajoute un, et le dernier
 * élément d'une page longue passerait sous la barre basse, visible et inatteignable.
 *
 * ── LA GARDE DU RETOUR ARRIÈRE ──────────────────────────────────────────────
 * `RechargeAuRetour` est monté par défaut : toute coquille qui affiche une identité en a besoin, et
 * un produit qui devrait penser à le monter l'oublierait. Voir son en-tête.
 */

export interface Rubrique {
  /** L'identifiant, comparé à `actif`. */
  id: string;
  libelle: string;
  icone: LucideIcon;
  /**
   * L'adresse de la rubrique. **Requise** : une rubrique est une page, et une page a une adresse.
   * La rendre optionnelle autoriserait une navigation qui ne se copie pas, ne s'ouvre pas au clic
   * du milieu, et disparaît sans JavaScript.
   */
  href: string;
}

export interface ProprietesCoquilleRail {
  /** Le nom du produit, à côté du logotype : « Compte », « Portail ». */
  produit: string;
  /** Le rail, à partir de 768 px. Rendu par le module client du produit, avec `LiensRail`. */
  navigationRail: ReactNode;
  /** La barre basse, sous 768 px. Omise en mode `bureau-seulement`. */
  navigationBarre?: ReactNode | undefined;
  /** Le pied du rail : identité, thème, sortie. Fourni par le produit. */
  pied?: ReactNode | undefined;
  /** Les actions de la barre compacte du téléphone : disque d'initiales, sortie. */
  actionsBarre?: ReactNode | undefined;
  /** Une mention sous le logotype, ex. « Console d'administration ». */
  mention?: string | undefined;
  /** Un bandeau collé au haut de la colonne, de la largeur du contenu. */
  bandeau?: ReactNode | undefined;
  /** La largeur maximale de la colonne, en px. Le produit la calcule à partir du chemin. */
  largeurContenu?: number | undefined;
  /**
   * `complet` : barre compacte et barre basse sous 768 px, rail au-delà.
   * `bureau-seulement` : sous 1024 px, `refus` remplace tout.
   */
  mode?: 'complet' | 'bureau-seulement' | undefined;
  /** L'écran rendu sous 1024 px en mode `bureau-seulement`. Obligatoire dans ce mode. */
  refus?: ReactNode | undefined;
  /** Le profil de densité posé sur la coquille, ex. `compact` pour une console. */
  densite?: 'aere' | 'equilibre' | 'modere' | 'compact' | undefined;
  /** Monte `RechargeAuRetour`. Vrai par défaut : toute coquille qui affiche une identité en a besoin. */
  rechargerAuRetour?: boolean | undefined;
  children: ReactNode;
}

/**
 * La largeur du rail entre 768 et 1023 px.
 *
 * La charte, chapitre 07, prescrit 280 px pour un rail sur bureau et reste muette en dessous. À
 * 768 px, un rail de 280 laisse 488 px de contenu ; un rail de 240 en laisse 528. C'est une valeur
 * mesurée dans un silence documenté. Déclarée UNE fois, ici, et importée partout ailleurs.
 */
export const LARGEUR_RAIL_TABLETTE = 240;

/**
 * La largeur du rail à partir de 1024 px. Charte, chapitre 07.
 *
 * Compte est passé par 264 px, au motif que les 16 px économisés iraient au contenu. Le contenu est
 * plafonné et centré : ils allaient au vide, et ils manquaient au pied du rail, où le nom se
 * coupait. La valeur de la charte était la bonne.
 */
export const LARGEUR_RAIL_BUREAU = 280;

const ID_STYLE = 'ai5d-coquille-rail';

/**
 * Les règles qui dépendent d'une requête média ne s'écrivent pas en style en ligne. On les injecte
 * une fois, sous un identifiant stable, plutôt que d'imposer Tailwind au consommateur.
 *
 * Deux paliers seulement : `TABLETTE` (768), où le rail remplace la barre basse, et `BUREAU`
 * (1024), où il s'élargit et où le mode `bureau-seulement` cesse de refuser.
 */
export const STYLE_COQUILLE_RAIL = `
.ai5d-coquille-rail {
  min-height: 100dvh;
  background: var(--surface-1);
}
.ai5d-coquille-rail__refus { display: none; }
.ai5d-coquille-rail__cadre {
  display: flex; align-items: flex-start;
  min-height: 100dvh;
}
.ai5d-coquille-rail__rail { display: none; }
.ai5d-coquille-rail__principal {
  flex: 1 1 auto; min-width: 0; width: 100%;
  display: flex; flex-direction: column;
  min-height: 100dvh;
}

/* La barre compacte du telephone. Elle disparait des que le rail apparait. */
.ai5d-coquille-rail__barre {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; justify-content: space-between; gap: var(--espace-3);
  height: calc(var(--hauteur-entete) + var(--zone-sure-haute, 0px));
  padding: var(--zone-sure-haute, 0px) var(--marge-page) 0;
  background: var(--surface-2);
  border-bottom: 1px solid var(--bordure);
}
.ai5d-coquille-rail__barre-actions {
  display: flex; align-items: center; gap: var(--espace-2);
}

.ai5d-coquille-rail__contenu {
  flex: 1 1 auto;
  width: 100%;
  padding: var(--espace-8) var(--marge-page);
  padding-bottom: calc(var(--espace-8) + var(--reserve-barre, 0px));
}
/* La largeur maximale est posee en style en ligne : elle depend de la page. */
.ai5d-coquille-rail__colonne {
  width: 100%;
  margin-inline: auto;
  display: flex; flex-direction: column;
}
.ai5d-coquille-rail__bandeau { margin-bottom: var(--espace-6); }

/* LE RAIL. Il reste colle au bord gauche et ne se centre jamais avec le contenu. */
.ai5d-coquille-rail__marque {
  display: flex; flex-direction: column; gap: var(--espace-1);
  padding: var(--espace-8) var(--espace-4) var(--espace-6);
}
.ai5d-coquille-rail__mention {
  font-family: var(--police-corps); font-size: var(--taille-sm);
  color: var(--texte-faible);
}
.ai5d-coquille-rail__nav {
  flex: 1 1 auto; min-height: 0; overflow-y: auto;
  padding: 0 var(--espace-3);
}
.ai5d-coquille-rail__pied {
  flex: 0 0 auto;
  padding: var(--espace-4) var(--espace-3);
  border-top: 1px solid var(--bordure);
}

@media (min-width: ${TABLETTE}px) {
  /* La barre basse se masque toute seule au meme palier : c'est sa propre regle. */
  .ai5d-coquille-rail { --reserve-barre: 0px; }
  .ai5d-coquille-rail[data-mode='complet'] .ai5d-coquille-rail__barre { display: none; }

  .ai5d-coquille-rail__rail {
    display: flex; flex-direction: column;
    position: sticky; top: 0; align-self: flex-start;
    height: 100dvh;
    flex: 0 0 ${LARGEUR_RAIL_TABLETTE}px; width: ${LARGEUR_RAIL_TABLETTE}px;
    background: var(--surface-2);
    border-right: 1px solid var(--bordure);
  }

  .ai5d-coquille-rail__contenu { padding: var(--espace-12) var(--espace-8); }
}

@media (min-width: ${BUREAU}px) {
  .ai5d-coquille-rail__rail {
    flex-basis: ${LARGEUR_RAIL_BUREAU}px;
    width: ${LARGEUR_RAIL_BUREAU}px;
  }
}

/* LE MODE BUREAU SEULEMENT. Sous 1024 px, le refus remplace tout. */
.ai5d-coquille-rail[data-mode='bureau-seulement'] .ai5d-coquille-rail__refus {
  display: flex; flex-direction: column; gap: var(--espace-4);
  align-items: flex-start; justify-content: center;
  min-height: 100dvh;
  padding: var(--espace-8) var(--marge-page);
}
.ai5d-coquille-rail[data-mode='bureau-seulement'] .ai5d-coquille-rail__cadre { display: none; }
@media (min-width: ${BUREAU}px) {
  .ai5d-coquille-rail[data-mode='bureau-seulement'] .ai5d-coquille-rail__refus { display: none; }
  .ai5d-coquille-rail[data-mode='bureau-seulement'] .ai5d-coquille-rail__cadre { display: flex; }
}

/*
  LE LIEN D EVITEMENT.

  Premier element focalisable du document. Sans lui, quelqu un qui navigue a la tabulation
  traverse le logotype, toutes les rubriques et le pied du rail AVANT d atteindre ce qu il est venu
  faire, a chaque page.

  Il sort de l ecran par une TRANSLATION. Pas par display:none, qui le rendrait non focalisable.
  Et plus par un decalage de -9999 px, comme dans Compte : c est un espacement en dur, et la garde
  du systeme le refuse a raison, puisqu une translation fait la meme chose sans mesure inventee.
*/
.ai5d-coquille-rail__evitement {
  position: absolute; top: 0; left: 0; z-index: 50;
  transform: translateY(-200%);
  padding: var(--espace-3) var(--espace-4);
  background: var(--surface-2);
  border: 1px solid var(--bordure);
  border-radius: var(--rayon-md);
  color: var(--action);
  font-family: var(--police-corps); font-size: var(--taille-sm);
  font-weight: var(--graisse-semi);
  text-decoration: none;
}
.ai5d-coquille-rail__evitement:focus {
  top: var(--espace-4); left: var(--espace-4);
  transform: none;
}
.ai5d-coquille-rail__evitement:focus-visible {
  outline: 2px solid var(--action);
  outline-offset: 2px;
}
`;

export function CoquilleRail({
  produit,
  navigationRail,
  navigationBarre,
  pied,
  actionsBarre,
  mention,
  bandeau,
  largeurContenu,
  mode = 'complet',
  refus,
  densite,
  rechargerAuRetour = true,
  children,
}: ProprietesCoquilleRail) {
  const complet = mode === 'complet';

  /*
    La reserve basse n existe qu en mode complet : en mode bureau-seulement il n y a pas de barre
    basse, et reserver sa hauteur laisserait un vide sous chaque page.
  */
  const styleRacine: CSSProperties | undefined = complet
    ? ({
        '--reserve-barre': 'calc(var(--hauteur-barre-onglets) + var(--zone-sure-basse, 0px))',
      } as CSSProperties)
    : undefined;

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_COQUILLE_RAIL }} />

      {rechargerAuRetour ? <RechargeAuRetour /> : null}

      <div
        className="ai5d-coquille-rail"
        style={styleRacine}
        data-coquille="rail"
        data-mode={mode}
        data-densite={densite}
      >
        {complet ? null : <div className="ai5d-coquille-rail__refus">{refus}</div>}

        <div className="ai5d-coquille-rail__cadre">
          <a href="#contenu" className="ai5d-coquille-rail__evitement">
            Aller au contenu
          </a>

          <div className="ai5d-coquille-rail__rail">
            {/*
              LA MARQUE, EN BLOC, SANS FILET SOUS ELLE.

              Un rail n a pas d en-tete. Le filet que portait la premiere version de Compte etait
              le reste d un en-tete horizontal supprime la veille.
            */}
            <div className="ai5d-coquille-rail__marque">
              <Logotype produit={produit} taille={20} />
              {mention === undefined ? null : (
                <span className="ai5d-coquille-rail__mention">{mention}</span>
              )}
            </div>

            <div className="ai5d-coquille-rail__nav">{navigationRail}</div>

            {pied === undefined ? null : <div className="ai5d-coquille-rail__pied">{pied}</div>}
          </div>

          <div className="ai5d-coquille-rail__principal">
            {complet ? (
              <header className="ai5d-coquille-rail__barre">
                <Logotype produit={produit} taille={18} />
                {actionsBarre === undefined ? null : (
                  <div className="ai5d-coquille-rail__barre-actions">{actionsBarre}</div>
                )}
              </header>
            ) : null}

            <main id="contenu" className="ai5d-coquille-rail__contenu">
              <div
                className="ai5d-coquille-rail__colonne"
                style={
                  largeurContenu === undefined ? undefined : { maxWidth: `${largeurContenu}px` }
                }
              >
                {bandeau === undefined ? null : (
                  <div className="ai5d-coquille-rail__bandeau">{bandeau}</div>
                )}
                {children}
              </div>
            </main>
          </div>

          {complet ? navigationBarre : null}
        </div>
      </div>
    </>
  );
}
