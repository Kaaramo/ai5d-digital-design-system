import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import {
  CONTENEUR_DEUX_COLONNES,
  CONTENEUR_TROIS_COLONNES,
  GrilleCartes,
} from '../../noyau/composants';

function styleInjecte(id: string): string {
  const balise = document.getElementById(id);
  expect(balise, `la feuille ${id} n est pas injectee`).not.toBeNull();
  return balise?.innerHTML ?? '';
}

describe('GrilleCartes', () => {
  it('rend ses enfants dans une piste unique', () => {
    const { container } = render(
      <GrilleCartes>
        <p>une</p>
        <p>deux</p>
      </GrilleCartes>,
    );
    const pistes = container.querySelectorAll('.ai5d-grille-cartes__pistes');
    expect(pistes).toHaveLength(1);
    expect(pistes[0]?.children).toHaveLength(2);
  });

  it('declare son propre contexte de conteneur, sans quoi la requete ne matche jamais', () => {
    /*
      C est le point qui fait tout le composant. Une requete `@container` qui ne trouve
      aucun ancetre declare `container-type` ne se declenche JAMAIS : la grille resterait
      sur une colonne partout, en silence, sans erreur ni avertissement.
    */
    render(<GrilleCartes>x</GrilleCartes>);
    const css = styleInjecte('ai5d-grille-cartes');
    expect(css).toContain('container-type: inline-size');
    expect(css).toContain(`@container (min-width: ${CONTENEUR_DEUX_COLONNES}px)`);
  });

  it('interroge son CONTENEUR et jamais la fenetre', () => {
    // Une requete media ne sait pas qu un rail de 280 px mange la largeur.
    render(<GrilleCartes>x</GrilleCartes>);
    expect(styleInjecte('ai5d-grille-cartes')).not.toContain('@media');
  });

  it('n ouvre la troisieme colonne que sur demande', () => {
    const { container: deux } = render(<GrilleCartes>x</GrilleCartes>);
    expect(deux.querySelector('.ai5d-grille-cartes--trois')).toBeNull();

    const { container: trois } = render(<GrilleCartes colonnes={3}>x</GrilleCartes>);
    expect(trois.querySelector('.ai5d-grille-cartes--trois')).not.toBeNull();
    expect(styleInjecte('ai5d-grille-cartes')).toContain(
      `@container (min-width: ${CONTENEUR_TROIS_COLONNES}px)`,
    );
  });

  it('ne porte aucun role ARIA : une grille de cartes n est pas un tableau', () => {
    const { container } = render(<GrilleCartes>x</GrilleCartes>);
    expect(container.querySelector('[role]')).toBeNull();
  });

  it('accepte une classe et un style sans perdre les siens', () => {
    const { container } = render(
      <GrilleCartes className="mienne" style={{ marginTop: '8px' }}>
        x
      </GrilleCartes>,
    );
    const racine = container.querySelector('.ai5d-grille-cartes');
    expect(racine?.className).toContain('mienne');
    expect(racine?.className).toContain('ai5d-grille-cartes');
    expect(racine?.getAttribute('style')).toContain('margin-top');
  });

  it("n'ecrit aucune couleur en dur ni aucune largeur figee", () => {
    const source = readFileSync('noyau/composants/GrilleCartes.tsx', 'utf8');
    const declarations = source
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('*') && !l.trimStart().startsWith('//'))
      .join('\n');
    expect(declarations).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    // `min-width` est la solution, pas le probleme ; `width: 560px` en serait un.
    expect(declarations).not.toMatch(/(?:^|[^-\w])width\s*:\s*['"]?\d+px/m);
  });

  it('emploie l echelle d espacement du systeme, jamais une valeur libre', () => {
    render(<GrilleCartes>x</GrilleCartes>);
    expect(styleInjecte('ai5d-grille-cartes')).toContain('gap: var(--espace-6)');
  });
});
