import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { lireJetons } from '../outils/jetons';

const CHEMIN = 'noyau/ai5d.preset.css';
const preset = readFileSync(CHEMIN, 'utf8');
const bloc = /@theme\s*\{([\s\S]*?)\n\}/.exec(preset)?.[1] ?? '';

const declarations = [...bloc.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(
  ([, nom, valeur]) => ({ nom: nom as string, valeur: (valeur as string).trim() }),
);

/** Les jetons reellement disponibles, toutes sources confondues. */
const disponibles = new Set([
  ...lireJetons('noyau/marque.css', ':root').keys(),
  ...lireJetons('noyau/jetons.css', ':root').keys(),
  ...lireJetons('noyau/paliers.css', ':root').keys(),
  ...lireJetons('densites/profils.css', ':root').keys(),
]);

describe('prereglage - chaine d import', () => {
  it('tire les polices, les jetons et les densites', () => {
    expect(preset).toContain("@import './polices/polices.css'");
    expect(preset).toContain("@import './jetons.css'");
    expect(preset).toContain("@import './paliers.css'");
    expect(preset).toContain("@import '../densites/profils.css'");
  });

  it('importe les polices en premier, avant tout usage', () => {
    expect(preset.indexOf("polices.css'")).toBeLessThan(preset.indexOf("jetons.css'"));
  });
});

describe('prereglage - bloc @theme', () => {
  it('existe et n est pas vide', () => {
    expect(bloc.trim().length).toBeGreaterThan(0);
    expect(declarations.length).toBeGreaterThan(30);
  });

  it('ne contient aucune valeur en dur - contrainte C2', () => {
    expect(bloc).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    expect(bloc).not.toMatch(/\brgba?\(/);
    expect(bloc).not.toMatch(/\b\d+px\b/);
  });

  it('ne fait que pointer vers des jetons, sans exception', () => {
    for (const { nom, valeur } of declarations) {
      expect(valeur, `${nom} ne pointe pas vers un jeton`).toMatch(/^var\(--[a-z0-9-]+\)$/);
    }
  });

  it('ne pointe que vers des jetons qui existent reellement', () => {
    for (const { nom, valeur } of declarations) {
      const cible = /^var\((--[a-z0-9-]+)\)$/.exec(valeur)?.[1] as string;
      expect(disponibles, `${nom} pointe vers ${cible}, qui n'est declare nulle part`).toContain(
        cible,
      );
    }
  });

  it('respecte les espaces de noms de Tailwind v4', () => {
    const prefixesAutorises = [
      '--color-',
      '--font-',
      '--text-',
      '--font-weight-',
      '--leading-',
      '--tracking-',
      '--radius-',
      '--shadow-',
      '--ease-',
      '--spacing-',
      '--container-',
    ];
    for (const { nom } of declarations) {
      expect(
        prefixesAutorises.some((prefixe) => nom.startsWith(prefixe)),
        `${nom} n'appartient a aucun espace de noms Tailwind`,
      ).toBe(true);
    }
  });

  it('expose les familles indispensables', () => {
    const noms = declarations.map((d) => d.nom);
    for (const attendu of [
      '--color-action',
      '--color-surface-1',
      '--color-texte-faible',
      '--color-reussite',
      '--font-titre',
      '--font-corps',
      '--radius-md',
      '--shadow-2',
      '--spacing-carte',
      '--spacing-controle',
    ]) {
      expect(noms, `${attendu} n'est pas expose a Tailwind`).toContain(attendu);
    }
  });

  it('expose les variables de densite, pour qu aucune valeur ne soit codee en dur', () => {
    const noms = declarations.map((d) => d.nom);
    for (const attendu of [
      '--spacing-section',
      '--spacing-carte',
      '--spacing-controle',
      '--spacing-ligne',
      '--container-contenu',
    ]) {
      expect(noms, `${attendu} manquant`).toContain(attendu);
    }
  });

  it('ne declare pas deux fois le meme nom', () => {
    const noms = declarations.map((d) => d.nom);
    expect(new Set(noms).size, 'un nom est declare deux fois').toBe(noms.length);
  });
});
