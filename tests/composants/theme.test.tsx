import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import {
  COOKIE_THEME,
  COULEURS_NAVIGATEUR,
  DUREE_COOKIE_THEME_S,
  LIBELLE_THEME,
  THEMES,
  attributTheme,
  estTheme,
  themeOuSysteme,
} from '../../noyau/theme';
import { COULEURS_NAVIGATEUR as COULEURS_DU_MODULE } from '../../noyau/couleurs-navigateur';
import { lireJetons } from '../../outils/jetons';
import {
  memoriserTheme,
  SelecteurTheme,
  STYLE_SELECTEUR_THEME,
} from '../../noyau/composants/SelecteurTheme';

/**
 * Le thème de l'interface, monté de Compte, et le sélecteur qui peut désormais le faire suivre la
 * personne d'un produit à l'autre.
 *
 * Le module de thème est PUR : ces tests l'importent seul, et s'il atteignait un framework ou une
 * base, l'import échouerait ici avant toute assertion.
 */

describe('le module de theme', () => {
  it('reconnait les trois valeurs, et refuse ce qui vient du reseau sans etre un theme', () => {
    for (const valeur of THEMES) expect(estTheme(valeur)).toBe(true);
    for (const valeur of ['dark', 'light', 'CLAIR', '', 'systeme ', null, undefined, 42, {}]) {
      expect(estTheme(valeur), String(valeur)).toBe(false);
    }
  });

  it('replie sur systeme, et JAMAIS sur clair', () => {
    // Un appareil en sombre dont le cookie a ete perdu doit retrouver le sombre, pas un ecran blanc.
    expect(themeOuSysteme('sombre')).toBe('sombre');
    expect(themeOuSysteme(undefined)).toBe('systeme');
    expect(themeOuSysteme('nimporte-quoi')).toBe('systeme');
  });

  it('traduit vers le vocabulaire des jetons, et ne rend RIEN pour systeme', () => {
    expect(attributTheme('clair')).toBe('light');
    expect(attributTheme('sombre')).toBe('dark');
    // `data-theme=""` satisferait `:root:not([data-theme='light'])` par accident.
    expect(attributTheme('systeme')).toBeUndefined();
  });

  it('garde le nom et la duree du cookie de Compte, pour lire les choix deja faits', () => {
    expect(COOKIE_THEME).toBe('ai5d-theme');
    expect(DUREE_COOKIE_THEME_S).toBe(60 * 60 * 24 * 365);
    expect(LIBELLE_THEME.systeme).toBe('Système');
  });

  it('n importe que couleurs-navigateur, pur lui aussi', () => {
    const sansCommentaires = (chemin: string) =>
      readFileSync(chemin, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');

    const theme = sansCommentaires('noyau/theme.ts');
    expect(theme).not.toMatch(/^\s*import /m);
    expect([...theme.matchAll(/from '([^']+)'/g)].map((m) => m[1])).toEqual([
      './couleurs-navigateur',
    ]);

    const couleurs = sansCommentaires('noyau/couleurs-navigateur.ts');
    expect(couleurs).not.toMatch(/^\s*import /m);
    expect(couleurs).not.toMatch(/\bfrom '/);
  });
});

describe('COULEURS_NAVIGATEUR, pour <meta name="theme-color"> (1.2.0)', () => {
  const CHEMIN = 'noyau/jetons.css';

  it('vaut --surface-1 dans chaque theme', () => {
    const clair = lireJetons(CHEMIN, ':root').get('--surface-1')?.toUpperCase();
    const sombre = lireJetons(CHEMIN, ":root[data-theme='dark']").get('--surface-1')?.toUpperCase();
    const sombreDuSysteme = lireJetons(CHEMIN, ":root:not([data-theme='light'])", {
      inclureRegleArobase: true,
    })
      .get('--surface-1')
      ?.toUpperCase();

    expect(COULEURS_NAVIGATEUR.clair).toBe(clair);
    expect(COULEURS_NAVIGATEUR.sombre).toBe(sombre);
    expect(COULEURS_NAVIGATEUR.sombre).toBe(sombreDuSysteme);
  });

  it('s importe par le module de theme, qui le reexporte sans le recopier', () => {
    expect(COULEURS_NAVIGATEUR).toBe(COULEURS_DU_MODULE);
  });
});

describe('memoriserTheme, l ecriture du cookie', () => {
  let ecritures: string[];

  beforeEach(() => {
    ecritures = [];
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => '',
      set: (valeur: string) => {
        ecritures.push(valeur);
      },
    });
  });

  afterEach(() => {
    // Rend a jsdom son propre accesseur, celui du prototype.
    Reflect.deleteProperty(document, 'cookie');
  });

  it('sans domaine, ecrit un seul cookie d hote', () => {
    memoriserTheme('sombre');
    expect(ecritures).toHaveLength(1);
    expect(ecritures[0]).toContain(`${COOKIE_THEME}=sombre`);
    expect(ecritures[0]).not.toContain('domain=');
    expect(ecritures[0]).toContain('samesite=lax');
  });

  it('avec un domaine, expire d abord le cookie d hote, puis ecrit celui du domaine', () => {
    /*
      Deux cookies du meme nom enverraient deux valeurs, dans un ordre que le serveur ne peut pas
      interpreter. L ORDRE compte : ecrire le domaine avant d expirer l hote laisserait un instant
      ou les deux coexistent, et une page chargee a cet instant lirait l ancien.
    */
    memoriserTheme('clair', '.ai5d.technology');

    expect(ecritures).toHaveLength(2);
    expect(ecritures[0]).toBe(`${COOKIE_THEME}=; path=/; max-age=0`);
    expect(ecritures[1]).toContain(`${COOKIE_THEME}=clair`);
    expect(ecritures[1]).toContain('domain=.ai5d.technology');
  });

  it('traite un domaine vide comme une absence de domaine', () => {
    memoriserTheme('systeme', '');
    expect(ecritures).toHaveLength(1);
    expect(ecritures[0]).not.toContain('domain=');
  });
});

describe('SelecteurTheme', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    Reflect.deleteProperty(document, 'cookie');
  });

  it('est un groupe radio de trois choix nommes, parti du theme recu', () => {
    render(<SelecteurTheme theme="sombre" />);
    expect(screen.getByRole('radiogroup', { name: 'Thème de l’interface' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Sombre' })).toHaveAttribute('aria-checked', 'true');
  });

  it('pose l attribut sur html au clic, et le retire pour systeme', () => {
    render(<SelecteurTheme theme="systeme" />);

    fireEvent.click(screen.getByRole('radio', { name: 'Sombre' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    fireEvent.click(screen.getByRole('radio', { name: 'Système' }));
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('transmet son domaine a l ecriture du cookie', () => {
    const ecritures: string[] = [];
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => '',
      set: (valeur: string) => ecritures.push(valeur),
    });

    render(<SelecteurTheme theme="systeme" domaine=".ai5d.technology" />);
    fireEvent.click(screen.getByRole('radio', { name: 'Clair' }));

    expect(ecritures.at(-1)).toContain('domain=.ai5d.technology');
  });

  it('pose le segment actif sur le jeton de selection, dans les deux themes', () => {
    expect(STYLE_SELECTEUR_THEME).toMatch(/\[aria-checked='true'\]\s*\{[^}]*--surface-selection/);
    expect(STYLE_SELECTEUR_THEME).not.toContain('--info-fond');
  });
});

describe('SelecteurTheme au doigt, et en libelles (1.2.0)', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  const css = STYLE_SELECTEUR_THEME.replace(/\s+/g, ' ');

  it('donne a chaque segment 44 px au doigt, et rien de plus a la souris', () => {
    expect(css).toContain(
      '@media (pointer: coarse) { .ai5d-theme__segment { min-width: var(--cible-tactile); min-height: var(--cible-tactile); } }',
    );
    expect(css).toContain('width: 32px; height: 32px;');
  });

  it('garde le survol aux pointeurs fins, et pose l appui sans transition', () => {
    expect(
      STYLE_SELECTEUR_THEME.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, ''),
    ).not.toContain(':hover');
    expect(css).toContain(
      '.ai5d-theme__segment:active { background: var(--surface-selection); transition: none; }',
    );
  });

  it('en libelles, ecrit les trois mots, et le nom visible est le nom accessible', () => {
    render(<SelecteurTheme theme="sombre" libellesVisibles />);
    const groupe = screen.getByRole('radiogroup', { name: 'Thème de l’interface' });
    expect(groupe).toHaveAttribute('data-libelles');

    const segments = screen.getAllByRole('radio');
    expect(segments.map((segment) => segment.textContent)).toEqual(['Clair', 'Sombre', 'Système']);
    for (const segment of segments) {
      expect(segment).not.toHaveAttribute('aria-label');
      expect(segment).not.toHaveAttribute('title');
    }
    expect(screen.getByRole('radio', { name: 'Sombre' })).toHaveAttribute('aria-checked', 'true');
  });

  it('en icones, garde le nom par aria-label et title, comme en 1.1.0', () => {
    render(<SelecteurTheme theme="clair" />);
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('data-libelles');
    for (const segment of screen.getAllByRole('radio')) {
      expect(segment).toHaveAttribute('aria-label');
      expect(segment).toHaveAttribute('title');
    }
  });

  it('occupe toute la largeur, retire l icone sous 17rem, et graisse le segment coche', () => {
    expect(css).toContain(
      '.ai5d-theme[data-libelles] { display: flex; width: 100%; container-type: inline-size; }',
    );
    expect(css).toContain(
      '@container (max-width: 17rem) { .ai5d-theme[data-libelles] .ai5d-theme__icone { display: none; } }',
    );
    expect(css).toContain(
      ".ai5d-theme[data-libelles] .ai5d-theme__segment[aria-checked='true'] { font-weight: var(--graisse-semi); }",
    );
  });

  it('pose la classe de l icone en mode libelles, pour la requete de conteneur', () => {
    const { container } = render(<SelecteurTheme theme="systeme" libellesVisibles />);
    expect(container.querySelectorAll('svg.ai5d-theme__icone')).toHaveLength(3);
  });
});
