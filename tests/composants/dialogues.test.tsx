import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { BoiteConfirmation } from '../../noyau/composants/BoiteConfirmation';
import { BoiteMotif } from '../../noyau/composants/BoiteMotif';

/**
 * Les deux boîtes, sur `<dialog>` natif.
 *
 * ── CE QUE JSDOM NE FAIT PAS ────────────────────────────────────────────────
 * jsdom 25 n'implémente pas `showModal()`, ni l'inertie du document, ni l'Échap qui émet `cancel`.
 * Ces tests simulent donc `showModal` et `close` au strict minimum, et vérifient la STRUCTURE :
 * l'élément, le rôle, l'ordre des boutons, le focus initial, le motif hors bornes, et qu'une
 * annulation ne déclenche jamais l'action.
 *
 * Le comportement réel au clavier (la tabulation qui reste dans la boîte, Échap qui ferme, le focus
 * rendu) est prouvé au navigateur à la tâche 16 du sprint 17. Ces tests ne le remplacent pas.
 */

beforeAll(() => {
  // Le strict minimum : ouvrir et fermer. Aucune inertie, aucun clavier, rien de plus.
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BoiteConfirmation', () => {
  function boite(proprietes: Partial<Parameters<typeof BoiteConfirmation>[0]> = {}) {
    const onAnnuler = vi.fn();
    const onConfirmer = vi.fn();
    const rendu = render(
      <BoiteConfirmation
        phrase="Cet appareil sera déconnecté immédiatement."
        action="Fermer la session"
        enCours={false}
        onAnnuler={onAnnuler}
        onConfirmer={onConfirmer}
        {...proprietes}
      />,
    );
    return { ...rendu, onAnnuler, onConfirmer };
  }

  it('est un dialogue natif, ouvert, annonce comme une alerte', () => {
    const { container } = boite();
    const dialogue = container.querySelector('dialog');

    expect(dialogue).not.toBeNull();
    expect(dialogue).toHaveAttribute('open');
    expect(dialogue).toHaveAttribute('role', 'alertdialog');
    expect(dialogue).toHaveAttribute('aria-label', 'Fermer la session');
  });

  it('pose « Annuler » avant l action, et l action en ton danger par defaut', () => {
    boite();
    const boutons = screen.getAllByRole('button');
    expect(boutons.map((b) => b.textContent)).toEqual(['Annuler', 'Fermer la session']);
    expect(boutons[1]).toHaveAttribute('data-variante', 'danger');
  });

  it('donne le focus a « Annuler », jamais a l action grave', () => {
    // Un Entree tape par reflexe dans la seconde qui suit l ouverture ne doit rien supprimer.
    boite({ children: <input aria-label="Un choix" /> });
    expect(screen.getByRole('button', { name: 'Annuler' })).toHaveFocus();
  });

  it('annule sans agir quand le dialogue emet cancel, comme sur Echap', () => {
    const { container, onAnnuler, onConfirmer } = boite();
    const annulation = new Event('cancel', { cancelable: true });

    fireEvent(container.querySelector('dialog') as HTMLDialogElement, annulation);

    expect(onAnnuler).toHaveBeenCalledTimes(1);
    expect(onConfirmer).not.toHaveBeenCalled();
    // La fermeture native est empechee : c est le produit qui demonte la boite.
    expect(annulation.defaultPrevented).toBe(true);
  });

  it('rend le focus a l element qui l a ouverte', () => {
    const declencheur = document.createElement('button');
    document.body.append(declencheur);
    declencheur.focus();

    const { unmount } = boite();
    expect(declencheur).not.toHaveFocus();

    unmount();
    expect(declencheur).toHaveFocus();
    declencheur.remove();
  });
});

describe('BoiteMotif', () => {
  function boite(longueurMinimale = 5) {
    const onAnnuler = vi.fn();
    const onValider = vi.fn();
    const rendu = render(
      <BoiteMotif
        phrase="Suspendre ce compte ?"
        consequence="Ses 3 sessions ouvertes seront fermées immédiatement."
        libelleChamp="Motif de la suspension"
        action="Suspendre"
        longueurMinimale={longueurMinimale}
        enCours={false}
        onAnnuler={onAnnuler}
        onValider={onValider}
      />,
    );
    return { ...rendu, onAnnuler, onValider };
  }

  it('est un dialogue natif, et donne le focus au champ', () => {
    const { container } = boite();
    expect(container.querySelector('dialog')).toHaveAttribute('role', 'alertdialog');
    expect(screen.getByLabelText('Motif de la suspension')).toHaveFocus();
  });

  it('n offre pas l action tant que le motif est hors bornes, puis la fait apparaitre', () => {
    const { onValider } = boite(5);
    const champ = screen.getByLabelText('Motif de la suspension');

    fireEvent.change(champ, { target: { value: 'abc' } });
    // Absent, et non grise : un bouton grise se lit comme un refus du systeme.
    expect(screen.queryByRole('button', { name: 'Suspendre' })).not.toBeInTheDocument();

    fireEvent.change(champ, { target: { value: '  Fraude avérée  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Suspendre' }));
    expect(onValider).toHaveBeenCalledWith('Fraude avérée');
  });

  it('ne compte pas les espaces de bord dans la longueur du motif', () => {
    boite(5);
    fireEvent.change(screen.getByLabelText('Motif de la suspension'), {
      target: { value: '   ab   ' },
    });
    expect(screen.queryByRole('button', { name: 'Suspendre' })).not.toBeInTheDocument();
  });

  it('annule sans valider quand le dialogue emet cancel', () => {
    const { container, onAnnuler, onValider } = boite();
    fireEvent.change(screen.getByLabelText('Motif de la suspension'), {
      target: { value: 'Un motif suffisant' },
    });

    fireEvent(
      container.querySelector('dialog') as HTMLDialogElement,
      new Event('cancel', { cancelable: true }),
    );

    expect(onAnnuler).toHaveBeenCalledTimes(1);
    expect(onValider).not.toHaveBeenCalled();
  });
});

describe('les dialogues, ce qu ils ne font pas', () => {
  it('ne ferment pas au clic sur le voile : aucun gestionnaire n y est pose', () => {
    for (const fichier of ['BoiteConfirmation.tsx', 'BoiteMotif.tsx']) {
      const source = readFileSync(`noyau/composants/${fichier}`, 'utf8');
      expect(source, fichier).not.toMatch(/<dialog[^>]*onClick/);
    }
  });

  it('renoncent a l apparition sous mouvement reduit', () => {
    const source = readFileSync('noyau/composants/dialogue.ts', 'utf8');
    expect(source).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*animation: none/);
  });
});
