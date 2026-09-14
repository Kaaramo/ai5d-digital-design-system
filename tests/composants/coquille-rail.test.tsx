import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import {
  CoquilleRail,
  LARGEUR_RAIL_BUREAU,
  LARGEUR_RAIL_TABLETTE,
  STYLE_COQUILLE_RAIL,
} from '../../noyau/composants/CoquilleRail';

/**
 * La coquille à rail : ce qu'elle rend, et ce qu'elle refuse de savoir.
 *
 * jsdom ne résout pas les requêtes média : le refus sous 1024 px, le rail qui remplace la barre
 * basse et les deux largeurs se vérifient sur la feuille, puis au navigateur à la tâche 16.
 */

const SOURCE = readFileSync('noyau/composants/CoquilleRail.tsx', 'utf8');

function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function coquille(proprietes: Partial<Parameters<typeof CoquilleRail>[0]> = {}) {
  return render(
    <CoquilleRail
      produit="Compte"
      navigationRail={<nav aria-label="Rubriques">rail</nav>}
      navigationBarre={<nav aria-label="Barre">barre</nav>}
      pied={<span>pied</span>}
      rechargerAuRetour={false}
      {...proprietes}
    >
      <p>Le contenu</p>
    </CoquilleRail>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('CoquilleRail, les deux modes', () => {
  it('se declare, en mode complet par defaut', () => {
    const { container } = coquille();
    const racine = container.querySelector('[data-coquille="rail"]');
    expect(racine).toHaveAttribute('data-mode', 'complet');
  });

  it('en mode complet, rend la barre compacte et la barre basse, et aucun refus', () => {
    const { container } = coquille({ actionsBarre: <button type="button">Sortie</button> });
    expect(container.querySelector('.ai5d-coquille-rail__barre')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Barre' })).toBeInTheDocument();
    expect(container.querySelector('.ai5d-coquille-rail__refus')).not.toBeInTheDocument();
  });

  it('en mode bureau seulement, rend le refus, et ni barre compacte ni barre basse', () => {
    const { container } = coquille({
      mode: 'bureau-seulement',
      refus: <p>La console demande un écran de bureau.</p>,
    });

    expect(container.querySelector('[data-coquille="rail"]')).toHaveAttribute(
      'data-mode',
      'bureau-seulement',
    );
    expect(screen.getByText('La console demande un écran de bureau.')).toBeInTheDocument();
    expect(container.querySelector('.ai5d-coquille-rail__barre')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Barre' })).not.toBeInTheDocument();
  });

  it('refuse par le CSS sous 1024 px, jamais par une mesure au montage', () => {
    // Une mesure ferait apparaitre la console une fraction de seconde sur un telephone.
    const palier = STYLE_COQUILLE_RAIL.slice(
      STYLE_COQUILLE_RAIL.lastIndexOf('@media (min-width: 1024px)'),
    );
    expect(palier).toMatch(/bureau-seulement'\] \.ai5d-coquille-rail__refus \{ display: none; \}/);
    expect(palier).toMatch(/bureau-seulement'\] \.ai5d-coquille-rail__cadre \{ display: flex; \}/);
    expect(code(SOURCE)).not.toMatch(/matchMedia|innerWidth/);
  });

  it('pose la densite quand elle est donnee', () => {
    const { container } = coquille({ densite: 'compact' });
    expect(container.querySelector('[data-coquille="rail"]')).toHaveAttribute(
      'data-densite',
      'compact',
    );
  });
});

describe('CoquilleRail, la structure', () => {
  it('fait du lien d evitement le premier element focalisable', () => {
    const { container } = coquille({ actionsBarre: <button type="button">Sortie</button> });
    const focalisables = container.querySelectorAll('a[href], button, input, [tabindex]');
    expect(focalisables[0]).toHaveTextContent('Aller au contenu');
    expect(focalisables[0]).toHaveAttribute('href', '#contenu');
    expect(container.querySelector('#contenu')).toBeInTheDocument();
  });

  it('sort le lien d evitement par une translation, pas par un decalage en pixels', () => {
    // display:none le rendrait non focalisable ; -9999px est un espacement en dur.
    expect(STYLE_COQUILLE_RAIL).toMatch(/__evitement \{[^}]*transform: translateY\(-200%\)/);
    expect(STYLE_COQUILLE_RAIL).not.toContain('-9999px');
  });

  it('rend la mention sous le logotype, et le bandeau en tete de colonne', () => {
    coquille({ mention: 'Console d’administration', bandeau: <p>Vos actions sont consignées.</p> });
    expect(screen.getByText('Console d’administration')).toBeInTheDocument();

    const bandeau = screen.getByText('Vos actions sont consignées.');
    const colonne = bandeau.closest('.ai5d-coquille-rail__colonne');
    expect(colonne?.firstElementChild).toContainElement(bandeau);
  });

  it('pose la largeur de la colonne en style en ligne, et seulement si elle est donnee', () => {
    const { container, rerender } = coquille({ largeurContenu: 960 });
    expect(container.querySelector('.ai5d-coquille-rail__colonne')).toHaveStyle({
      maxWidth: '960px',
    });

    rerender(
      <CoquilleRail produit="Compte" navigationRail={null} rechargerAuRetour={false}>
        <p>Le contenu</p>
      </CoquilleRail>,
    );
    // React laisse un `style=""` vide apres un nouveau rendu : c est la PROPRIETE qui compte.
    expect(
      (container.querySelector('.ai5d-coquille-rail__colonne') as HTMLElement).style.maxWidth,
    ).toBe('');
  });

  it('porte la reserve basse en mode complet seulement', () => {
    const { container, rerender } = coquille();
    expect(
      (container.querySelector('[data-coquille="rail"]') as HTMLElement).style.getPropertyValue(
        '--reserve-barre',
      ),
    ).toContain('--hauteur-barre-onglets');

    rerender(
      <CoquilleRail
        produit="Compte"
        navigationRail={null}
        mode="bureau-seulement"
        rechargerAuRetour={false}
      >
        <p>Le contenu</p>
      </CoquilleRail>,
    );
    expect(
      (container.querySelector('[data-coquille="rail"]') as HTMLElement).style.getPropertyValue(
        '--reserve-barre',
      ),
    ).toBe('');
  });

  it('declare ses deux largeurs une fois, et les emploie aux deux paliers', () => {
    expect(LARGEUR_RAIL_TABLETTE).toBe(240);
    expect(LARGEUR_RAIL_BUREAU).toBe(280);
    expect(STYLE_COQUILLE_RAIL).toContain(`width: ${LARGEUR_RAIL_TABLETTE}px`);
    expect(STYLE_COQUILLE_RAIL).toContain(`width: ${LARGEUR_RAIL_BUREAU}px`);
    expect(STYLE_COQUILLE_RAIL).toContain('@media (min-width: 768px)');
    expect(STYLE_COQUILLE_RAIL).toContain('@media (min-width: 1024px)');
  });
});

describe('CoquilleRail, la garde du retour arriere', () => {
  function simulerRetourArriere() {
    const recharger = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload: recharger });
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      { type: 'back_forward' } as unknown as PerformanceEntry,
    ]);
    return recharger;
  }

  it('monte RechargeAuRetour par defaut', () => {
    const recharger = simulerRetourArriere();
    render(
      <CoquilleRail produit="Compte" navigationRail={null}>
        <p>Le contenu</p>
      </CoquilleRail>,
    );
    expect(recharger).toHaveBeenCalledTimes(1);
  });

  it('ne le monte pas quand le produit le refuse', () => {
    const recharger = simulerRetourArriere();
    render(
      <CoquilleRail produit="Compte" navigationRail={null} rechargerAuRetour={false}>
        <p>Le contenu</p>
      </CoquilleRail>,
    );
    expect(recharger).not.toHaveBeenCalled();
  });
});

describe('CoquilleRail, ce qu elle refuse de savoir', () => {
  it('ne depend ni de Next, ni d aucun crochet, ni d aucune directive', () => {
    const utile = code(SOURCE);
    expect(utile).not.toContain("'use client'");
    expect(utile).not.toContain("from 'next/");
    expect(utile).not.toMatch(/\buse[A-Z]\w*\(/);
  });
});
