import type { CSSProperties, ReactNode } from 'react';
import { Logotype } from './Logotype';
import { BarreOnglets, HAUTEUR_BARRE_ONGLETS } from './BarreOnglets';
import type { Onglet } from './BarreOnglets';
import { BUREAU, TABLETTE } from '../paliers';

/**
 * La coquille d'application : en-tête collant, contenu défilant, barre d'onglets.
 *
 * C'est le gabarit de tout ce qui est servi à un utilisateur une fois connecté. Les espaces
 * d'administration n'en relèvent pas : un tableau de bord d'admin se conçoit pour un écran
 * large, et le prétendre mobile coûterait sans servir personne.
 *
 * ── LA MESURE QUI DÉCIDE DE TOUT ────────────────────────────────────────────
 * Le contenu réserve sous lui la hauteur de la barre plus la zone sûre. Sans cette réserve,
 * le dernier élément de la page se glisse SOUS la barre d'onglets. Le défaut ne se voit pas
 * tant qu'on teste sur des pages courtes, et il apparaît le jour où quelqu'un ajoute une
 * ligne. C'est pour cela que la réserve est portée par le gabarit et non par chaque écran.
 *
 * ── CE QUI CHANGE AUX PALIERS ───────────────────────────────────────────────
 * À partir de la tablette, la barre d'onglets disparaît et la réserve tombe à zéro : la
 * navigation remonte dans l'en-tête, où le consommateur la place lui-même.
 * À partir du bureau, le contenu est plafonné à `--contenu-max` et centré, plutôt que de
 * s'étirer sur toute la largeur d'un écran de 27 pouces.
 *
 * ── CE QUE LE GABARIT NE FAIT PAS ───────────────────────────────────────────
 * Il ne connaît ni la session, ni les droits, ni les produits. L'en-tête reçoit son contenu
 * de droite en propriété : c'est le produit qui décide d'y mettre un avatar, un sélecteur
 * d'organisation ou rien. Un gabarit qui lirait la session appartiendrait à la couche
 * écosystème, pas au noyau.
 */

export interface ProprietesGabaritApp {
  /** Le nom du produit, à côté du logotype. « Compte », « Académie », « Lab ». */
  produit?: string;
  /** Le contenu de droite de l'en-tête : avatar, menu, sélecteur. Fourni par le produit. */
  actions?: ReactNode;
  /** Trois à cinq onglets. Absents, aucune barre n'est rendue et rien n'est réservé. */
  onglets?: Onglet[];
  /** L'`id` de l'onglet courant. Requis dès qu'il y a des onglets. */
  actif?: string;
  onChoisir?: (id: string) => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** La hauteur de l'en-tête collant. */
export const HAUTEUR_ENTETE = 56;

const ID_STYLE = 'ai5d-gabarit-app';

const STYLE_APP = `
.ai5d-app {
  display: flex; flex-direction: column;
  min-height: 100dvh;
  background: var(--surface-1);
}
.ai5d-app__entete {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  height: calc(${HAUTEUR_ENTETE}px + var(--zone-sure-haute, 0px));
  padding: var(--zone-sure-haute, 0px) var(--marge-page) 0;
  background: var(--surface-2);
  border-bottom: 1px solid var(--bordure);
}
.ai5d-app__actions { display: flex; align-items: center; gap: 8px; }
.ai5d-app__contenu {
  flex: 1 1 auto; min-width: 0;
  width: 100%;
  padding: var(--rythme-section) var(--marge-page);
  padding-bottom: calc(var(--rythme-section) + var(--reserve-barre, 0px));
}

@media (min-width: ${BUREAU}px) {
  .ai5d-app__contenu {
    max-width: var(--contenu-max);
    margin-inline: auto;
  }
}
`;

export function GabaritApp({
  produit,
  actions,
  onglets,
  actif,
  onChoisir,
  children,
  className,
  style,
}: ProprietesGabaritApp) {
  const avecBarre = onglets !== undefined && onglets.length > 0;
  const classes = className ? `ai5d-app ${className}` : 'ai5d-app';

  /*
    La réserve basse est posée sur l'élément racine, en variable, pour deux raisons.
    Elle n'existe que s'il y a une barre, et elle doit retomber à zéro au palier tablette
    où la barre disparaît. Une variable réglée ici et lue par le contenu tient les deux
    cas sans dupliquer la mesure.
  */
  const styleRacine: CSSProperties = {
    ...(avecBarre
      ? ({
          '--reserve-barre': `calc(${HAUTEUR_BARRE_ONGLETS}px + var(--zone-sure-basse, 0px))`,
        } as CSSProperties)
      : {}),
    ...style,
  };

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_APP }} />
      {avecBarre ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `@media (min-width: ${TABLETTE}px) { .ai5d-app { --reserve-barre: 0px; } }`,
          }}
        />
      ) : null}

      <div className={classes} style={styleRacine} data-gabarit="app">
        <header className="ai5d-app__entete">
          <Logotype produit={produit} taille={20} />
          {actions === undefined ? null : <div className="ai5d-app__actions">{actions}</div>}
        </header>

        <main className="ai5d-app__contenu">{children}</main>

        {avecBarre ? (
          <BarreOnglets onglets={onglets} actif={actif ?? ''} onChoisir={onChoisir} />
        ) : null}
      </div>
    </>
  );
}
