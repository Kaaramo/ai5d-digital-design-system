import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import {
  CONTENEUR_DEFINITIONS_DEUX_COLONNES,
  ListeDefinitions,
  type Definition,
} from '../../noyau/composants/ListeDefinitions';

const FAITS: Definition[] = [
  { libelle: 'Session', valeur: 'Orange Guinée · octobre 2026' },
  { libelle: 'Dates', valeur: 'Du 13 au 15 octobre 2026, présentiel' },
  { libelle: 'Numéro', valeur: 'AI5D-2026-7K3F9Q', mono: true },
];

function feuille(): string {
  return (document.getElementById('ai5d-definitions')?.innerHTML ?? '').replace(/\s+/g, ' ');
}

describe('ListeDefinitions (1.2.0)', () => {
  it('rend un dl, chaque libelle et sa valeur groupes dans un div', () => {
    const { container } = render(<ListeDefinitions elements={FAITS} />);
    const liste = container.querySelector('dl');
    expect(liste).not.toBeNull();
    const groupes = [...(liste?.querySelectorAll(':scope > div') ?? [])];
    expect(groupes).toHaveLength(3);
    for (const [index, groupe] of groupes.entries()) {
      expect(groupe.querySelector('dt')).toHaveTextContent(FAITS[index]?.libelle ?? '');
      expect(groupe.querySelector('dd')).toBeInTheDocument();
    }
  });

  it('marque la valeur mono, et elle seule', () => {
    const { container } = render(<ListeDefinitions elements={FAITS} />);
    const valeurs = container.querySelectorAll('dd');
    expect(valeurs[2]).toHaveAttribute('data-mono');
    expect(valeurs[0]).not.toHaveAttribute('data-mono');
    expect(feuille()).toContain(
      '.ai5d-definitions__element dd[data-mono] { font-family: var(--police-mono); font-weight: var(--graisse-moyenne); font-size: var(--taille-sm); }',
    );
  });

  it('ne passe a deux colonnes que sur demande, par requete de conteneur a 480 px', () => {
    const { container, rerender } = render(<ListeDefinitions elements={FAITS} />);
    expect(container.querySelector('.ai5d-definitions')).toHaveAttribute('data-colonnes', '1');
    rerender(<ListeDefinitions elements={FAITS} colonnes={2} />);
    expect(container.querySelector('.ai5d-definitions')).toHaveAttribute('data-colonnes', '2');

    expect(CONTENEUR_DEFINITIONS_DEUX_COLONNES).toBe(480);
    const css = feuille();
    expect(css).toContain('.ai5d-definitions { container-type: inline-size; }');
    expect(css).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(css).toContain(
      "@container (min-width: 480px) { .ai5d-definitions[data-colonnes='2'] .ai5d-definitions__liste { grid-template-columns: repeat(2, minmax(0, 1fr)); } }",
    );
    expect(css).not.toMatch(/@media \(min-width/);
  });

  it('libelle en texte faible et casse normale, valeur en texte fort, qui passe a la ligne', () => {
    render(<ListeDefinitions elements={FAITS} />);
    const css = feuille();
    expect(css).toContain(
      '.ai5d-definitions__element dt { font-family: var(--police-corps); font-size: var(--taille-xs); font-weight: var(--graisse-moyenne); line-height: 1.6; color: var(--texte-faible); }',
    );
    expect(css).toContain('color: var(--texte-fort);');
    expect(css).toContain('overflow-wrap: anywhere;');
    expect(css).not.toContain('text-transform');
  });

  it('reste rendable par un composant serveur', () => {
    expect(
      readFileSync('noyau/composants/ListeDefinitions.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(false);
  });
});
