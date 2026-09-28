'use client';

import { Ellipsis } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode, ToggleEvent } from 'react';
import { Bouton } from './Bouton';
import { feuille } from './feuille';
import { Icone } from './Icone';
import type { ComposantLien } from './LiensRail';
import {
  CLASSE_HORS_ECRAN,
  ID_STYLE_HORS_ECRAN,
  MENTION_NOUVEL_ONGLET,
  STYLE_HORS_ECRAN,
  relSur,
} from './lien';

/**
 * Le menu des gestes d'une ligne, d'un objet, d'un compte.
 *
 * ── POURQUOI IL MONTE, EN v1.3.0 ────────────────────────────────────────────
 * La console du Portail en demande un par ligne de table ; le SDK `@ai5d/auth` en écrit un à la main
 * pour le menu de compte (`UserButton.tsx:100-139`), sans flèches, sans Échap, sans fermeture au
 * clic extérieur, large de 200 pixels. Deux produits, un besoin : décision 012.
 *
 * ── IL VIT DANS LA COUCHE SUPÉRIEURE ────────────────────────────────────────
 * `popover="auto"` : le menu sort de tout conteneur à défilement sans portail React, se referme au
 * clic extérieur et à Échap, et le navigateur rend le focus au déclencheur qui porte
 * `popovertarget`. Il se place par l'ancre CSS là où le moteur la connaît ; ailleurs, par une mesure
 * à l'ouverture, et il se referme au premier défilement plutôt que de flotter à une place fausse.
 *
 * ── LE CLAVIER EST CELUI DU MOTIF « BOUTON DE MENU » ────────────────────────
 * Flèches, Début, Fin, Échap et Tab. Un seul élément porte `tabindex="0"` à la fois. Choisir un geste
 * referme le menu et rend le focus au déclencheur AVANT d'appeler `onChoisir` : une boîte de
 * confirmation ouverte par le geste trouve le focus là, et l'y rendra en se fermant.
 *
 * ── LES GESTES QUI DÉFONT SONT RANGÉS À PART ────────────────────────────────
 * Après un filet, en `--erreur`, dans l'ordre reçu. Le libellé nomme le geste : la couleur n'est
 * jamais seule. Un menu sans action ne rend rien : un bouton qui n'ouvre rien est un piège.
 *
 * jsdom ne connaît ni `showPopover()` ni l'évènement `toggle` : le clavier se prouve au navigateur
 * (docs/preuves/1.3.0/menu-navigateurs.md), et les tests doublent l'API.
 */

interface ActionMenuCommune {
  /** Identifiant stable dans le menu. */
  id: string;
  /** Le verbe et son objet : « Corriger l’adresse ». */
  libelle: string;
  /** Un geste qui défait : rangé après un filet, écrit en `--erreur`. */
  grave?: boolean | undefined;
}

/** Une destination : l'élément du menu est un lien. */
export interface ActionMenuLien extends ActionMenuCommune {
  href: string;
  /** Un nouvel onglet : `<a target="_blank">` natif, `rel` complété, mention lue. */
  nouvelOnglet?: boolean | undefined;
  onChoisir?: undefined;
}

/** Un geste : l'élément du menu est un bouton. Le menu se referme avant l'appel. */
export interface ActionMenuGeste extends ActionMenuCommune {
  onChoisir: () => void;
  href?: undefined;
  nouvelOnglet?: undefined;
}

export type ActionMenu = ActionMenuLien | ActionMenuGeste;

export interface ProprietesMenuActions {
  /**
   * Le nom du menu : « Actions pour Aïssatou Camara ». Sans `declencheur`, c'est aussi le nom du
   * bouton qui l'ouvre.
   */
  libelle: string;
  /** Les actions, dans l'ordre voulu ; les graves sont rangées après les autres. Vide : rien n'est rendu. */
  actions: readonly ActionMenu[];
  /**
   * Le contenu visible du déclencheur, quand il a un nom visible (le menu de compte du SDK : l'avatar
   * et le nom). Absent : l'icône `Ellipsis` de 16 px, et `libelle` pour nom accessible.
   */
  declencheur?: ReactNode | undefined;
  /** Le lien du routeur du produit ; `a` par défaut. Ignoré pour un nouvel onglet. */
  Lien?: ComposantLien | undefined;
}

const ID_STYLE = 'ai5d-menu-actions';

/*
  La condition teste la propriete que la regle emploie, position-area, et non anchor-name : Chromium
  125 a 128 connaissent anchor-name mais ecrivent inset-area (renomme en 129). Tester anchor-name y
  ignorait position-area et coupait la mesure de repli : le menu s ouvrait en (0, 0), sonde dans
  Chromium 141 (relecture de la 1.3.0, constat I2). La feuille et ancreConnue() lisent cette chaine.
*/
const CONDITION_ANCRE = 'position-area: block-end';

/*
  La prose vit ici, jamais dans la chaine : un accent grave la terminerait.

  Le menu ne pose display que sous :popover-open. Une regle d auteur sur .ai5d-menu__liste battrait
  la regle du navigateur qui cache un popover ferme, et le menu resterait affiche.

  La hauteur est bornee a la fenetre, et le menu defile au-dela : un long menu pres du bord ne sort
  plus de l ecran (relecture de la 1.3.0, constat M8).

  L anneau d un element est decale de -2 px, a l interieur : a l exterieur, le bord du menu le
  couperait. L ouverture reprend la duree et la courbe des dialogues, par leurs jetons de base : une
  ouverture n est pas un depart, et le role --mouvement-sortie ne lui revient pas.
*/
export const STYLE_MENU = `
.ai5d-menu { display: inline-flex; }
.ai5d-menu > .ai5d-bouton[aria-expanded='true'] { background: var(--surface-selection); }

.ai5d-menu__liste {
  box-sizing: border-box;
  margin: 0;
  inset: auto;
  min-inline-size: 12rem;
  max-inline-size: 20rem;
  max-block-size: calc(100dvh - var(--espace-8));
  overflow-y: auto;
  padding: var(--espace-1);
  background: var(--surface-3);
  color: var(--texte);
  border: 1px solid var(--bordure);
  border-radius: var(--rayon-md);
  box-shadow: var(--elevation-3);
}
.ai5d-menu__liste:popover-open {
  display: flex;
  flex-direction: column;
  animation: ai5d-menu-entree var(--duree-courte) var(--courbe-sortie);
}
@keyframes ai5d-menu-entree {
  from { opacity: 0; transform: translateY(calc(var(--espace-1) * -1)); }
  to { opacity: 1; transform: none; }
}
@supports (${CONDITION_ANCRE}) {
  .ai5d-menu__liste {
    position-area: block-end span-inline-start;
    position-try-fallbacks: flip-block, flip-inline;
    margin-block-start: var(--espace-1);
  }
}

.ai5d-menu__element {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  inline-size: 100%;
  min-block-size: var(--hauteur-controle);
  padding: 0 var(--espace-3);
  border: 0;
  border-radius: var(--rayon-sm);
  background: transparent;
  color: var(--texte);
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
  font-weight: var(--graisse-normale);
  line-height: var(--interligne-corps);
  text-align: start;
  text-decoration: none;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition: background var(--mouvement-retour);
}
@media (hover: hover) {
  .ai5d-menu__element:not([aria-disabled='true']):hover { background: var(--surface-survol); }
}
.ai5d-menu__element:focus-visible {
  background: var(--surface-survol);
  outline: 2px solid var(--action);
  outline-offset: -2px;
}
.ai5d-menu__element:not([aria-disabled='true']):active { background: var(--surface-selection); transition: none; }
.ai5d-menu__element[data-grave] { color: var(--erreur); }
.ai5d-menu__element[data-grave]:focus-visible { outline-color: var(--erreur); }

.ai5d-menu__filet { block-size: 1px; margin: var(--espace-1) 0; background: var(--bordure); }

@media (prefers-reduced-motion: reduce) {
  .ai5d-menu__liste:popover-open { animation: ai5d-menu-fondu var(--duree-courte) linear; }
  @keyframes ai5d-menu-fondu {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
`;

/** Vrai quand le moteur place le menu par l'ancre CSS ; faux dans jsdom et les moteurs qui ne la connaissent pas. */
function ancreConnue(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    ? CSS.supports(CONDITION_ANCRE)
    : false;
}

/** Les actions dans l'ordre du menu : les autres, puis les graves, chacune dans l'ordre reçu. */
function ordonner(actions: readonly ActionMenu[]): { autres: ActionMenu[]; graves: ActionMenu[] } {
  return {
    autres: actions.filter((action) => action.grave !== true),
    graves: actions.filter((action) => action.grave === true),
  };
}

export function MenuActions({ libelle, actions, declencheur, Lien }: ProprietesMenuActions) {
  const brut = useId();
  // `useId` rend `_R_1_` en React 19.2, `:r1:` en 19.0 : l'identifiant nomme aussi une ancre CSS.
  const cle = brut.replace(/[^a-zA-Z0-9_-]/g, '');
  const idMenu = `ai5d-menu-${cle}`;
  const ancre = `--ai5d-menu-${cle}`;

  const racine = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const ouvertRef = useRef(false);
  const cibleOuverture = useRef<'premier' | 'dernier'>('premier');
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);

  const elements = () => [
    ...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
  ];
  const declencheurRendu = () =>
    racine.current?.querySelector<HTMLButtonElement>(':scope > button') ?? null;

  function allerA(index: number) {
    const liste = elements();
    if (liste.length === 0) return;
    const borne = ((index % liste.length) + liste.length) % liste.length;
    setActif(borne);
    liste[borne]?.focus({ preventScroll: true });
  }

  function fermer() {
    if (ouvertRef.current) menu.current?.hidePopover();
    declencheurRendu()?.focus();
  }

  function ouvrir(cible: 'premier' | 'dernier') {
    cibleOuverture.current = cible;
    if (ouvertRef.current) {
      allerA(cible === 'premier' ? 0 : elements().length - 1);
      return;
    }
    menu.current?.showPopover();
  }

  function surBascule(evenement: ToggleEvent<HTMLDivElement>) {
    const estOuvert = evenement.newState === 'open';
    ouvertRef.current = estOuvert;
    setOuvert(estOuvert);
    if (estOuvert) {
      allerA(cibleOuverture.current === 'premier' ? 0 : elements().length - 1);
    }
    cibleOuverture.current = 'premier';
  }

  function surToucheDeclencheur(evenement: KeyboardEvent<HTMLButtonElement>) {
    if (evenement.key === 'ArrowDown' || evenement.key === 'ArrowUp') {
      evenement.preventDefault();
      ouvrir(evenement.key === 'ArrowDown' ? 'premier' : 'dernier');
    }
  }

  function surToucheMenu(evenement: KeyboardEvent<HTMLDivElement>) {
    const dernier = elements().length - 1;
    switch (evenement.key) {
      case 'ArrowDown':
        evenement.preventDefault();
        allerA(actif + 1);
        break;
      case 'ArrowUp':
        evenement.preventDefault();
        allerA(actif - 1);
        break;
      case 'Home':
        evenement.preventDefault();
        allerA(0);
        break;
      case 'End':
        evenement.preventDefault();
        allerA(dernier);
        break;
      case 'Escape':
      case 'Tab':
        evenement.preventDefault();
        fermer();
        break;
      default:
        break;
    }
  }

  /*
    Sans ancre CSS, le menu se place une fois, a l ouverture, en coordonnees de la fenetre : sous le
    declencheur, aligne sur son bord de fin, au-dessus s il ne reste pas la place en bas. L ecart est
    lu dans le jeton --espace-1, jamais ecrit ici. Un defilement ou un redimensionnement le referme,
    sauf le defilement du menu lui-meme : un long menu defile sans se refermer sous le doigt.
  */
  useEffect(() => {
    const liste = menu.current;
    const bouton = declencheurRendu();
    if (!ouvert || liste === null || bouton === null || ancreConnue()) return;

    const boite = bouton.getBoundingClientRect();
    const ecart = Number.parseFloat(getComputedStyle(liste).getPropertyValue('--espace-1')) || 0;
    liste.style.maxBlockSize = '';
    const hauteur = liste.offsetHeight;
    const enBas = window.innerHeight - boite.bottom - ecart;
    const enHaut = boite.top - ecart;
    // Quand aucun cote n a la place, le menu prend le plus grand, s y borne et defile.
    const enDessous = enBas >= hauteur || enBas >= enHaut;
    const place = Math.max(0, enDessous ? enBas : enHaut);
    if (hauteur > place) liste.style.maxBlockSize = `${place}px`;
    const rendue = Math.min(hauteur, place);
    liste.style.top = `${enDessous ? boite.bottom + ecart : boite.top - rendue - ecart}px`;
    liste.style.left = `${Math.max(0, boite.right - liste.offsetWidth)}px`;

    const refermer = (evenement: Event) => {
      if (evenement.target instanceof Node && liste.contains(evenement.target)) return;
      if (ouvertRef.current) liste.hidePopover();
    };
    window.addEventListener('scroll', refermer, { capture: true, passive: true });
    window.addEventListener('resize', refermer);
    return () => {
      window.removeEventListener('scroll', refermer, { capture: true });
      window.removeEventListener('resize', refermer);
    };
  }, [ouvert]);

  if (actions.length === 0) return null;

  const { autres, graves } = ordonner(actions);
  const ordre = [...autres, ...graves];

  function rendreAction(action: ActionMenu, index: number) {
    const communs = {
      role: 'menuitem',
      tabIndex: index === actif ? 0 : -1,
      className: 'ai5d-menu__element',
      'data-grave': action.grave === true ? '' : undefined,
    } as const;

    if (action.href === undefined) {
      return (
        <button
          key={action.id}
          type="button"
          {...communs}
          onClick={() => {
            fermer();
            action.onChoisir();
          }}
        >
          {action.libelle}
        </button>
      );
    }

    const nouvelOnglet = action.nouvelOnglet === true;
    const contenu = (
      <>
        {action.libelle}
        {nouvelOnglet ? (
          <span className={CLASSE_HORS_ECRAN}>{` ${MENTION_NOUVEL_ONGLET}`}</span>
        ) : null}
      </>
    );

    return Lien === undefined || nouvelOnglet ? (
      <a
        key={action.id}
        {...communs}
        href={action.href}
        target={nouvelOnglet ? '_blank' : undefined}
        rel={relSur(undefined, nouvelOnglet ? '_blank' : undefined)}
        onClick={() => fermer()}
      >
        {contenu}
      </a>
    ) : (
      <Lien key={action.id} {...communs} href={action.href} onClick={() => fermer()}>
        {contenu}
      </Lien>
    );
  }

  return (
    <>
      {feuille(ID_STYLE, STYLE_MENU)}
      {ordre.some((action) => action.nouvelOnglet === true)
        ? feuille(ID_STYLE_HORS_ECRAN, STYLE_HORS_ECRAN)
        : null}

      <span className="ai5d-menu" ref={racine}>
        <Bouton
          variante="discret"
          taille="sm"
          aria-haspopup="menu"
          aria-expanded={ouvert}
          aria-controls={idMenu}
          aria-label={declencheur === undefined ? libelle : undefined}
          popoverTarget={idMenu}
          onKeyDown={surToucheDeclencheur}
          style={{ anchorName: ancre }}
        >
          {declencheur ?? <Icone nom={Ellipsis} taille={16} />}
        </Bouton>

        <div
          ref={menu}
          id={idMenu}
          role="menu"
          aria-label={libelle}
          popover="auto"
          className="ai5d-menu__liste"
          style={{ positionAnchor: ancre }}
          onToggle={surBascule}
          onKeyDown={surToucheMenu}
        >
          {autres.map((action, index) => rendreAction(action, index))}
          {autres.length > 0 && graves.length > 0 ? (
            <div role="separator" className="ai5d-menu__filet" />
          ) : null}
          {graves.map((action, index) => rendreAction(action, autres.length + index))}
        </div>
      </span>
    </>
  );
}
