import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { TitreSection } from '../../noyau/composants/TitreSection';

/**
 * `TitreSection` (SPEC 1.2.0, §5.8). jsdom abandonne sans le dire certaines propriétés qu'il ne
 * connaît pas (leçon de la 1.0.0) : le style se lit sur l'élément React rendu par la fonction, et le
 * DOM ne sert qu'au niveau, aux attributs et à ce que jsdom sait lire.
 */

describe('TitreSection (1.2.0)', () => {
  it('rend le niveau demande', () => {
    for (const niveau of [1, 2, 3] as const) {
      const { unmount } = render(
        <TitreSection niveau={niveau} taille="section">
          Mes autres formations
        </TitreSection>,
      );
      expect(
        screen.getByRole('heading', { level: niveau, name: 'Mes autres formations' }),
      ).toBeInTheDocument();
      unmount();
    }
  });

  it('separe la taille du niveau : un h2 peut etre un titre de bloc', () => {
    const element = TitreSection({ niveau: 2, taille: 'bloc', children: 'Ressources' });
    expect(element.type).toBe('h2');
    expect(element.props.style.fontSize).toBe('var(--taille-lg)');
  });

  it('donne a chaque taille son jeton', () => {
    for (const [taille, jeton] of [
      ['ecran', 'var(--taille-2xl)'],
      ['section', 'var(--taille-xl)'],
      ['bloc', 'var(--taille-lg)'],
    ] as const) {
      expect(TitreSection({ niveau: 2, taille, children: 'Titre' }).props.style.fontSize).toBe(
        jeton,
      );
    }
  });

  it('compose en Fraunces 400, lettre et equilibre, sans marge, et ne tronque jamais', () => {
    const element = TitreSection({
      niveau: 1,
      taille: 'ecran',
      children: 'IA générative et relation client',
    });
    expect(element.props.style).toMatchObject({
      margin: 0,
      fontFamily: 'var(--police-titre)',
      fontWeight: 'var(--graisse-normale)',
      lineHeight: 'var(--interligne-titre)',
      letterSpacing: 'var(--lettrage-titre)',
      color: 'var(--texte-fort)',
      textWrap: 'balance',
      overflowWrap: 'break-word',
    });
  });

  it('laisse gagner le style du consommateur, et transmet id et aria', () => {
    render(
      <TitreSection
        niveau={2}
        taille="section"
        id="autres-formations"
        aria-describedby="aide"
        style={{ color: 'var(--texte-faible)' }}
      >
        Mes autres formations
      </TitreSection>,
    );
    const titre = screen.getByRole('heading', { level: 2 });
    expect(titre).toHaveAttribute('id', 'autres-formations');
    expect(titre).toHaveAttribute('aria-describedby', 'aide');
    expect(titre.style.color).toBe('var(--texte-faible)');
    expect(titre.style.fontFamily).toContain('--police-titre');
  });

  it('reste rendable par un composant serveur, et ne touche pas aux titres existants', () => {
    expect(
      readFileSync('noyau/composants/TitreSection.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(false);
    for (const fichier of ['EnteteRubrique', 'GabaritAuth', 'Chiffre']) {
      expect(readFileSync(`noyau/composants/${fichier}.tsx`, 'utf8')).not.toContain('TitreSection');
    }
  });
});
