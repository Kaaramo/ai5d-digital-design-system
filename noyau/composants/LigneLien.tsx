import { ChevronRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Icone } from './Icone';
import type { ComposantLien } from './LiensRail';
import {
  CLASSE_HORS_ECRAN,
  ID_STYLE_HORS_ECRAN,
  MENTION_NOUVEL_ONGLET,
  STYLE_HORS_ECRAN,
  lienNatif,
  relSur,
} from './lien';

/**
 * Une ligne qui mène quelque part : une formation, une ressource, un replay.
 *
 * ── UNE LIGNE ENTIÈRE EST UNE CIBLE ─────────────────────────────────────────
 * Un seul élément interactif, le lien. On ne pose ni lien ni bouton dans `debut` ou `fin` : un lien
 * dans un lien est invalide, et deux cibles sur une même ligne se touchent au doigt. Une ligne qui ne
 * mène nulle part n'est pas un lien : le produit rend du texte, il n'y a donc pas d'état désactivé.
 *
 * ── ELLE RÉPOND DÈS L'APPUI ─────────────────────────────────────────────────
 * Sur un réseau lent, le pire n'est pas d'attendre : c'est de ne pas savoir si l'appui a été pris.
 * L'appui pose la surface de sélection sans transition, dans l'image suivante ; le relâchement repart
 * en `--mouvement-retour`. Puis, si le lien du produit suit le protocole d'attente de `lien.ts`, le
 * chevron cède la place à trois points.
 *
 * ── SA HAUTEUR EST CELLE DE LA DENSITÉ ──────────────────────────────────────
 * `min-height: var(--ligne-liste)` : c'est le premier composant du système qui lit ce jeton. 56 px en
 * `equilibre`, 40 px en `compact` à la souris, 44 px au moins au doigt.
 *
 * ── DEUX CAS SANS CHEVRON, ET SANS ROUTEUR ──────────────────────────────────
 * Un téléchargement et un lien sortant : un `<a>` natif, quel que soit le lien du produit, et aucun
 * chevron, qui promettrait une page. Le lien sortant reçoit `noopener noreferrer` et la mention lue du
 * nouvel onglet.
 *
 * Le survol change de jeton selon le thème, comme `LiensRail` : `--surface-chaude` se détache en
 * clair, `--surface-3` prend le relais en sombre, en attendant le jeton de survol de la 1.3.0.
 */

export interface ProprietesLigneLien {
  href: string;
  /** Le nom de la destination. Une ligne, deux au plus. */
  titre: string;
  /** Ce qui distingue cette ligne des autres : une référence, une date. */
  description?: ReactNode | undefined;
  /** Un fait court : « PDF · 2,4 Mo », un numéro. */
  meta?: ReactNode | undefined;
  /** La méta en JetBrains Mono : un identifiant, un numéro. */
  metaMono?: boolean | undefined;
  /** Ce qui précède le texte : une icône, un avatar, une pastille d'état. */
  debut?: ReactNode | undefined;
  /** Ce qui suit le texte. Par défaut un chevron ; aucun avec `download` ou `externe`. */
  fin?: ReactNode | undefined;
  /** Le titre en Fraunces 400, `--taille-lg` : pour une ligne qui nomme une formation. */
  titreEnTitre?: boolean | undefined;
  /** Le lien du routeur du produit ; `a` par défaut. */
  Lien?: ComposantLien | undefined;
  /** Un téléchargement : `<a download>` natif, sans chevron. */
  download?: boolean | string | undefined;
  /** Un lien sortant : nouvel onglet, `rel="noopener noreferrer"`, mention lue, sans chevron. */
  externe?: boolean | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

const ID_STYLE = 'ai5d-ligne-lien';

/*
  L ecart de 2 px entre le titre et sa description est hors echelle, et nomme comme tel dans les
  exceptions de la garde d espacement : une ligne, pas deux paragraphes.
*/
export const STYLE_LIGNE_LIEN = `
.ai5d-ligne {
  display: flex; align-items: center; gap: var(--espace-3);
  min-height: var(--ligne-liste);
  padding: var(--espace-3);
  margin-inline: calc(var(--espace-3) * -1);
  border-radius: var(--rayon-md);
  color: inherit;
  text-decoration: none;
  transition: background var(--mouvement-retour);
}
.ai5d-ligne__debut,
.ai5d-ligne__fin { flex: 0 0 auto; display: inline-flex; align-items: center; }
.ai5d-ligne__corps {
  flex: 1 1 auto; min-width: 0;
  display: flex; flex-direction: column; gap: 2px;
}
.ai5d-ligne__titre {
  font-family: var(--police-corps); font-size: var(--taille-md);
  font-weight: var(--graisse-moyenne); color: var(--texte-fort);
  overflow-wrap: anywhere;
}
.ai5d-ligne__titre[data-en-titre] {
  font-family: var(--police-titre); font-size: var(--taille-lg);
  font-weight: var(--graisse-normale); line-height: var(--interligne-titre);
}
.ai5d-ligne__description,
.ai5d-ligne__meta {
  font-family: var(--police-corps); font-size: var(--taille-sm);
  font-weight: var(--graisse-normale); color: var(--texte-faible);
}
.ai5d-ligne__meta[data-mono] { font-family: var(--police-mono); font-weight: var(--graisse-moyenne); }
.ai5d-ligne__fin { color: var(--texte-faible); }

@media (hover: hover) {
  .ai5d-ligne:hover { background: var(--surface-chaude); }
  :root[data-theme='dark'] .ai5d-ligne:hover { background: var(--surface-3); }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .ai5d-ligne:hover { background: var(--surface-3); }
  }
}
.ai5d-ligne:active { background: var(--surface-selection); transition: none; }
.ai5d-ligne:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }

.ai5d-ligne__attente { display: none; align-items: center; gap: var(--espace-1); color: var(--texte-faible); }
.ai5d-ligne:is([data-en-attente], :has([data-en-attente])) .ai5d-ligne__attente { display: inline-flex; }
.ai5d-ligne:is([data-en-attente], :has([data-en-attente])) .ai5d-ligne__fin { display: none; }
.ai5d-ligne__point {
  width: 4px; height: 4px;
  border-radius: var(--rayon-plein);
  background: currentColor;
  opacity: 0.35;
  animation: ai5d-ligne-point 1200ms infinite ease-in-out;
}
.ai5d-ligne__point:nth-child(2) { animation-delay: 160ms; }
.ai5d-ligne__point:nth-child(3) { animation-delay: 320ms; }
@keyframes ai5d-ligne-point {
  0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-ligne__point { animation: none; opacity: 1; }
}
`;

/** Les trois points de l'attente, décoratifs et masqués hors attente. */
function PointsDAttente() {
  return (
    <span className="ai5d-ligne__attente" aria-hidden="true">
      <span className="ai5d-ligne__point" />
      <span className="ai5d-ligne__point" />
      <span className="ai5d-ligne__point" />
    </span>
  );
}

export function LigneLien({
  href,
  titre,
  description,
  meta,
  metaMono = false,
  debut,
  fin,
  titreEnTitre = false,
  Lien,
  download,
  externe = false,
  className,
  style,
}: ProprietesLigneLien) {
  const target = externe ? '_blank' : undefined;
  const sansChevron = lienNatif({ download, target });
  const finRendue =
    fin !== undefined ? fin : sansChevron ? null : <Icone nom={ChevronRight} taille={20} />;
  const classe = className === undefined ? 'ai5d-ligne' : `ai5d-ligne ${className}`;

  const contenu = (
    <>
      {debut === undefined ? null : <span className="ai5d-ligne__debut">{debut}</span>}
      <span className="ai5d-ligne__corps">
        <span className="ai5d-ligne__titre" data-en-titre={titreEnTitre ? '' : undefined}>
          {titre}
        </span>
        {description === undefined ? null : (
          <span className="ai5d-ligne__description">{description}</span>
        )}
        {meta === undefined ? null : (
          <span className="ai5d-ligne__meta" data-mono={metaMono ? '' : undefined}>
            {meta}
          </span>
        )}
      </span>
      {finRendue === null ? null : <span className="ai5d-ligne__fin">{finRendue}</span>}
      <PointsDAttente />
      {externe ? <span className={CLASSE_HORS_ECRAN}>{` ${MENTION_NOUVEL_ONGLET}`}</span> : null}
    </>
  );

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_LIGNE_LIEN }} />
      {externe ? (
        <style id={ID_STYLE_HORS_ECRAN} dangerouslySetInnerHTML={{ __html: STYLE_HORS_ECRAN }} />
      ) : null}

      {Lien === undefined || sansChevron ? (
        <a
          href={href}
          download={download}
          target={target}
          rel={relSur(undefined, target)}
          className={classe}
          style={style}
        >
          {contenu}
        </a>
      ) : (
        <Lien href={href} className={classe} style={style}>
          {contenu}
        </Lien>
      )}
    </>
  );
}
