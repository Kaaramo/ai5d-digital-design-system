import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import {
  COOKIE_THEME,
  DUREE_COOKIE_THEME_S,
  LIBELLE_THEME,
  THEMES,
  attributTheme,
  estTheme,
  themeOuSysteme,
} from '../../noyau/theme';
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

  it('n importe rien', () => {
    const code = readFileSync('noyau/theme.ts', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/^\s*import /m);
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
