import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Check } from 'lucide-react';
import { Icone } from '../../noyau/composants/Icone';
import { ValeurCopiable } from '../../noyau/composants/ValeurCopiable';
import { DUREE_SUCCES_COPIE_MS } from '../../noyau/composants/copie';

/**
 * `ValeurCopiable` (SPEC 1.2.0, §5.12). Le presse-papiers est simulé : jsdom n'en a pas. Ce qui se
 * garde ici est ce que Compte a payé : un échec qui se dit, et ne se fait jamais passer pour un succès.
 */

const ADRESSE = 'https://portail.ai5d.technology/badge/7K3F9Q';
const ECHEC = 'Sélectionnez l’adresse ci-dessus pour la copier.';

function pressePapiers(writeText: (valeur: string) => Promise<void>): void {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
}

function rendre() {
  return render(
    <ValeurCopiable
      valeur={ADRESSE}
      libelle="Adresse de votre badge"
      messageEchec={ECHEC}
      libelleBouton="Copier le lien"
      libelleSucces="Lien copié"
    />,
  );
}

async function cliquer(nom: string): Promise<void> {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: nom }));
    await Promise.resolve();
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('ValeurCopiable (1.2.0)', () => {
  it('affiche la valeur en clair, dans un champ en lecture seule, lie a son libelle', () => {
    rendre();
    const champ = screen.getByLabelText('Adresse de votre badge');
    expect(champ).toHaveValue(ADRESSE);
    expect(champ).toHaveAttribute('readonly');
    expect(champ).toHaveAttribute('spellcheck', 'false');
    expect(champ).toHaveAttribute('autocomplete', 'off');
  });

  it('compose la valeur en chasse fixe, a 16 px : sous 16 px, iOS agrandit la page au focus', () => {
    rendre();
    const champ = screen.getByLabelText('Adresse de votre badge');
    expect(champ.style.fontFamily).toContain('--police-mono');
    expect(champ.style.fontSize).toContain('--taille-md');
  });

  it('sans chasse fixe, garde la police du champ, jamais celle du navigateur', () => {
    render(<ValeurCopiable valeur={ADRESSE} libelle="Adresse" messageEchec={ECHEC} mono={false} />);
    expect(screen.getByLabelText('Adresse').style.fontFamily).toContain('--police-corps');
  });

  it('prend Copier et Copie comme libelles par defaut', async () => {
    pressePapiers(vi.fn().mockResolvedValue(undefined));
    render(
      <ValeurCopiable
        valeur="cle-de-demonstration"
        libelle="Clé"
        messageEchec="Sélectionnez la clé ci-dessus pour la copier."
      />,
    );
    await cliquer('Copier');
    expect(screen.getByRole('button', { name: 'Copié' })).toBeInTheDocument();
  });

  it('succes : copie, dit Lien copie avec une coche, l annonce, puis revient au repos a 2 000 ms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    pressePapiers(writeText);
    const { container } = rendre();
    await cliquer('Copier le lien');

    expect(writeText).toHaveBeenCalledWith(ADRESSE);
    const bouton = screen.getByRole('button', { name: 'Lien copié' });
    const coche = render(<Icone nom={Check} taille={16} />).container.querySelector('svg');
    expect(bouton.querySelector('svg')?.innerHTML).toBe(coche?.innerHTML);
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Lien copié');

    expect(DUREE_SUCCES_COPIE_MS).toBe(2000);
    act(() => {
      vi.advanceTimersByTime(DUREE_SUCCES_COPIE_MS - 1);
    });
    expect(screen.getByRole('button', { name: 'Lien copié' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('button', { name: 'Copier le lien' })).toBeInTheDocument();
  });

  it('un second clic relance la minuterie', async () => {
    pressePapiers(vi.fn().mockResolvedValue(undefined));
    rendre();
    await cliquer('Copier le lien');
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    await cliquer('Lien copié');
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole('button', { name: 'Lien copié' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('button', { name: 'Copier le lien' })).toBeInTheDocument();
  });

  it('echec : ne dit jamais copie, selectionne toute la valeur, affiche et annonce le geste', async () => {
    pressePapiers(vi.fn().mockRejectedValue(new Error('refus du navigateur')));
    const { container } = rendre();
    await cliquer('Copier le lien');

    const champ = screen.getByLabelText<HTMLInputElement>('Adresse de votre badge');
    expect(champ).toHaveFocus();
    expect(champ.selectionStart).toBe(0);
    expect(champ.selectionEnd).toBe(ADRESSE.length);
    expect(screen.getByText(ECHEC)).toBeVisible();
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(ECHEC);
    expect(screen.queryByRole('button', { name: 'Lien copié' })).toBeNull();
  });

  it('echoue aussi quand le presse-papiers manque, sur une page non securisee', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    rendre();
    await cliquer('Copier le lien');
    expect(screen.getByLabelText('Adresse de votre badge')).toHaveFocus();
    expect(screen.getByText(ECHEC)).toBeInTheDocument();
  });

  it('nettoie sa minuterie au demontage', async () => {
    pressePapiers(vi.fn().mockResolvedValue(undefined));
    const { unmount } = rendre();
    await cliquer('Copier le lien');
    const nettoyage = vi.spyOn(globalThis, 'clearTimeout');
    unmount();
    expect(nettoyage).toHaveBeenCalled();
    nettoyage.mockRestore();
  });

  it('empile champ et bouton sous 24rem de conteneur, et ne connait aucun palier', () => {
    rendre();
    const css = (document.getElementById('ai5d-valeur-copiable')?.innerHTML ?? '').replace(
      /\s+/g,
      ' ',
    );
    expect(css).toContain('.ai5d-copiable { container-type: inline-size;');
    expect(css).toContain('@container (max-width: 24rem)');
    expect(css).toContain('flex: 1 1 16rem;');
    expect(css).not.toMatch(/@media \(min-width/);
  });

  it('occupe la largeur de son parent, meme dans une colonne centree', () => {
    // Relecture de la 1.2.0 : un conteneur interroge tombait a 0 px dans une colonne flex centree.
    rendre();
    const css = (document.getElementById('ai5d-valeur-copiable')?.innerHTML ?? '').replace(
      /\s+/g,
      ' ',
    );
    expect(css).toContain('.ai5d-copiable { container-type: inline-size; inline-size: 100%;');
  });

  it('empile sans vide : en colonne, la base du champ redevient sa hauteur naturelle', () => {
    /*
      Vu a la capture au doigt, le 26 septembre 2026 : en colonne, `flex: 1 1 16rem`, pense pour une
      largeur, devenait une HAUTEUR de 256 px, et un grand vide separait le champ de son bouton. jsdom
      ne calcule aucune mise en page : la regle se garde ici par sa forme, et la capture la montre.
    */
    rendre();
    const css = (document.getElementById('ai5d-valeur-copiable')?.innerHTML ?? '').replace(
      /\s+/g,
      ' ',
    );
    const pile = css.slice(css.indexOf('@container (max-width: 24rem)'));
    expect(pile).toContain('.ai5d-copiable__rangee .ai5d-copiable__champ { flex: 0 0 auto; }');
  });

  it('se declare module client, et sa duree vit dans un module pur', () => {
    expect(
      readFileSync('noyau/composants/ValeurCopiable.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(true);
    expect(readFileSync('noyau/composants/copie.ts', 'utf8')).not.toContain("'use client'");
  });
});
