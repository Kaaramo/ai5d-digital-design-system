import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'react';
import { MenuActions, type ActionMenu } from '../../noyau/composants/MenuActions';
import type { ComposantLien } from '../../noyau/composants/LiensRail';
import { MENTION_NOUVEL_ONGLET } from '../../noyau/composants/lien';
import { texteFeuille } from '../aides/feuille';

/**
 * `MenuActions` (SPEC 1.3.0, §5.3).
 *
 * CE QUE CE FICHIER NE PROUVE PAS. jsdom 25 n'implémente ni `showPopover()`, ni `hidePopover()`, ni
 * l'évènement `toggle`, ni la couche supérieure, ni la fermeture au clic extérieur, ni Échap côté
 * navigateur, ni l'ancre CSS. Les tests doublent les deux méthodes et émettent `toggle` à la main,
 * comme le ferait le navigateur : ils prouvent la structure, l'ordre, le focus que le composant pose
 * lui-même et sa feuille. Le reste se constate dans Chromium (docs/preuves/1.3.0/menu-navigateurs.md).
 */

const ouverts = new WeakSet<HTMLElement>();
const montrer = vi.fn();
const cacher = vi.fn();
const originaux = {
  show: HTMLElement.prototype.showPopover,
  hide: HTMLElement.prototype.hidePopover,
};

/** Ce que fait le navigateur : l'état change, puis `toggle` est émis sur l'élément. */
function emettre(element: HTMLElement, etat: 'open' | 'closed') {
  const evenement = new Event('toggle');
  Object.defineProperty(evenement, 'newState', { value: etat });
  Object.defineProperty(evenement, 'oldState', { value: etat === 'open' ? 'closed' : 'open' });
  element.dispatchEvent(evenement);
}

beforeAll(() => {
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    montrer(this.id);
    if (ouverts.has(this)) return;
    ouverts.add(this);
    emettre(this, 'open');
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    cacher(this.id);
    if (!ouverts.has(this)) return;
    ouverts.delete(this);
    emettre(this, 'closed');
  };
});

afterAll(() => {
  HTMLElement.prototype.showPopover = originaux.show;
  HTMLElement.prototype.hidePopover = originaux.hide;
});

const corriger = vi.fn();
const bloquer = vi.fn();
const retirer = vi.fn();

const ACTIONS: ActionMenu[] = [
  { id: 'retirer', libelle: 'Retirer de la session', grave: true, onChoisir: retirer },
  { id: 'corriger', libelle: 'Corriger l’adresse', onChoisir: corriger },
  { id: 'fiche', libelle: 'Voir la fiche', href: '/admin/personnes/7K3F9Q' },
  { id: 'bloquer', libelle: 'Bloquer', onChoisir: bloquer },
];

function rendre(actions: readonly ActionMenu[] = ACTIONS) {
  const rendu = render(<MenuActions libelle="Actions pour Aïssatou Camara" actions={actions} />);
  const declencheur = screen.getByRole('button', { name: 'Actions pour Aïssatou Camara' });
  const menu = screen.getByRole('menu', { hidden: true });
  return { ...rendu, declencheur, menu };
}

function libelles(menu: HTMLElement): string[] {
  return within(menu)
    .getAllByRole('menuitem', { hidden: true })
    .map((element) => element.textContent ?? '');
}

describe('MenuActions : la structure', () => {
  it('lie le declencheur au menu par aria et par popovertarget', () => {
    const { declencheur, menu } = rendre();
    expect(declencheur).toHaveAttribute('aria-haspopup', 'menu');
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
    expect(declencheur).toHaveAttribute('aria-controls', menu.id);
    expect(declencheur).toHaveAttribute('popovertarget', menu.id);
    expect(declencheur).toHaveAttribute('data-variante', 'discret');
    expect(declencheur).toHaveAttribute('data-taille', 'sm');
    expect(menu).toHaveAttribute('popover', 'auto');
    expect(menu).toHaveAttribute('aria-label', 'Actions pour Aïssatou Camara');
    expect(menu.id).toMatch(/^ai5d-menu-[a-zA-Z0-9_-]+$/);
  });

  it('range les gestes graves apres un filet, chacun dans l ordre recu', () => {
    const { menu } = rendre();
    expect(libelles(menu)).toEqual([
      'Corriger l’adresse',
      'Voir la fiche',
      'Bloquer',
      'Retirer de la session',
    ]);
    const enfants = [...menu.children].map((enfant) => enfant.getAttribute('role'));
    expect(enfants).toEqual(['menuitem', 'menuitem', 'menuitem', 'separator', 'menuitem']);
    expect(within(menu).getByText('Retirer de la session')).toHaveAttribute('data-grave', '');
  });

  it('ne pose aucun filet quand aucune action n est grave', () => {
    const { menu } = rendre([{ id: 'bloquer', libelle: 'Bloquer', onChoisir: bloquer }]);
    expect(menu.querySelector('[role="separator"]')).toBeNull();
  });

  it('ne rend rien, ni declencheur ni menu, sans action', () => {
    const { container } = render(
      <MenuActions libelle="Actions pour Aïssatou Camara" actions={[]} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('passe un lien interne par le lien du produit', () => {
    const recus: Array<ComponentProps<ComposantLien>> = [];
    const Lien: ComposantLien = (proprietes) => {
      recus.push(proprietes);
      const { children, ...reste } = proprietes;
      return (
        <a data-lien-produit="" {...reste}>
          {children}
        </a>
      );
    };
    render(<MenuActions libelle="Actions de la formation" actions={ACTIONS} Lien={Lien} />);
    expect(recus.map((recu) => recu.href)).toEqual(['/admin/personnes/7K3F9Q']);
    expect(recus[0]?.role).toBe('menuitem');
  });

  it('ouvre un nouvel onglet par un a natif, rel complete et mention lue', () => {
    const recus: unknown[] = [];
    const Lien: ComposantLien = (proprietes) => {
      recus.push(proprietes);
      return null;
    };
    render(
      <MenuActions
        libelle="Actions de l’attestation"
        Lien={Lien}
        actions={[
          {
            id: 'verifier',
            libelle: 'Voir la page de vérification',
            href: 'https://exemple.invalid/verifier/7K3F9Q',
            nouvelOnglet: true,
          },
        ]}
      />,
    );
    const lien = screen.getByRole('menuitem', {
      hidden: true,
      name: `Voir la page de vérification ${MENTION_NOUVEL_ONGLET}`,
    });
    expect(recus).toHaveLength(0);
    expect(lien.tagName).toBe('A');
    expect(lien).toHaveAttribute('target', '_blank');
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer');
    expect(texteFeuille('ai5d-hors-ecran')).toContain('.ai5d-hors-ecran');
  });

  it('avec un declencheur visible, le nom est ce qui est ecrit : aucun aria-label', () => {
    render(
      <MenuActions
        libelle="Menu du compte"
        declencheur={<span>Aïssatou Camara</span>}
        actions={[{ id: 'compte', libelle: 'Mon compte', href: '/accueil' }]}
      />,
    );
    const declencheur = screen.getByRole('button', { name: 'Aïssatou Camara' });
    expect(declencheur).not.toHaveAttribute('aria-label');
    expect(screen.getByRole('menu', { hidden: true })).toHaveAttribute(
      'aria-label',
      'Menu du compte',
    );
  });
});

describe('MenuActions : le clavier, sur la mecanique doublee', () => {
  it('fleche bas sur le declencheur ouvre sur le premier element', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    expect(montrer).toHaveBeenLastCalledWith(menu.id);
    expect(declencheur).toHaveAttribute('aria-expanded', 'true');
    expect(document.activeElement).toHaveTextContent('Corriger l’adresse');
  });

  it('fleche haut sur le declencheur ouvre sur le dernier element', () => {
    const { declencheur } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowUp' });
    expect(document.activeElement).toHaveTextContent('Retirer de la session');
  });

  it('les fleches bouclent, sautent le filet, et un seul element est dans la tabulation', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    const ordre: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      ordre.push(document.activeElement?.textContent ?? '');
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
    }
    expect(ordre).toEqual([
      'Corriger l’adresse',
      'Voir la fiche',
      'Bloquer',
      'Retirer de la session',
      'Corriger l’adresse',
    ]);
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toHaveTextContent('Retirer de la session');
    const tabulables = within(menu)
      .getAllByRole('menuitem', { hidden: true })
      .filter((element) => element.tabIndex === 0);
    expect(tabulables).toEqual([document.activeElement]);
  });

  it('Debut et Fin vont aux extremites', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement).toHaveTextContent('Retirer de la session');
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(document.activeElement).toHaveTextContent('Corriger l’adresse');
  });

  it('Echap referme et rend le focus au declencheur, sans se reposer sur le navigateur', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(cacher).toHaveBeenLastCalledWith(menu.id);
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(declencheur);
  });

  it('Tab referme et rend le focus au declencheur', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Tab' });
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(declencheur);
  });

  it('choisir un geste referme le menu et rend le focus AVANT d appeler onChoisir', async () => {
    const constat: Array<{ focus: Element | null; fermetures: number }> = [];
    const { declencheur } = rendre([
      {
        id: 'corriger',
        libelle: 'Corriger l’adresse',
        onChoisir: () =>
          constat.push({ focus: document.activeElement, fermetures: cacher.mock.calls.length }),
      },
    ]);
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    cacher.mockClear();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Corriger l’adresse' }));
    expect(constat).toEqual([{ focus: declencheur, fermetures: 1 }]);
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
  });

  it('sans ancre CSS, un defilement de la fenetre referme le menu plutot que de le laisser flotter', () => {
    const { declencheur, menu } = rendre();
    fireEvent.keyDown(declencheur, { key: 'ArrowDown' });
    fireEvent.scroll(window);
    expect(cacher).toHaveBeenLastCalledWith(menu.id);
    expect(declencheur).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('MenuActions : la feuille', () => {
  function feuille(): string {
    render(<MenuActions libelle="Actions" actions={ACTIONS} />);
    return texteFeuille('ai5d-menu-actions').replace(/\s+/g, ' ');
  }

  it('garde le survol aux pointeurs fins, sur la surface de survol', () => {
    const css = feuille();
    expect(css).toContain(
      "@media (hover: hover) { .ai5d-menu__element:not([aria-disabled='true']):hover { background: var(--surface-survol); } }",
    );
    const brut = texteFeuille('ai5d-menu-actions');
    expect(brut.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')).not.toContain(':hover');
  });

  it('pose l appui sans transition, et un anneau a l interieur', () => {
    const css = feuille();
    expect(css).toContain(
      ".ai5d-menu__element:not([aria-disabled='true']):active { background: var(--surface-selection); transition: none; }",
    );
    expect(css).toContain('outline-offset: -2px;');
    expect(css).toContain('.ai5d-menu__element[data-grave] { color: var(--erreur); }');
    expect(css).toContain(
      '.ai5d-menu__element[data-grave]:focus-visible { outline-color: var(--erreur); }',
    );
  });

  it('ne pose display que sous :popover-open, sans quoi un menu ferme resterait affiche', () => {
    const css = feuille();
    const base = css.slice(
      css.indexOf('.ai5d-menu__liste {'),
      css.indexOf('.ai5d-menu__liste:popover-open'),
    );
    expect(base).not.toContain('display');
    expect(css).toContain('.ai5d-menu__liste:popover-open { display: flex;');
  });

  it('se place par l ancre la ou le moteur la connait, et borne sa largeur en rem', () => {
    const css = feuille();
    expect(css).toContain('@supports (anchor-name: --a)');
    expect(css).toContain('position-area: block-end span-inline-start;');
    expect(css).toContain('min-inline-size: 12rem; max-inline-size: 20rem;');
  });

  it('ouvre en duree courte, et ne garde qu un fondu sous mouvement reduit', () => {
    const css = feuille();
    expect(css).toContain('animation: ai5d-menu-entree var(--duree-courte) var(--courbe-sortie);');
    const reduit = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduit).toContain('ai5d-menu-fondu');
    expect(reduit).not.toContain('transform');
  });

  it('se declare module client', () => {
    expect(
      readFileSync('noyau/composants/MenuActions.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(true);
  });
});
