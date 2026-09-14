import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';

/**
 * LA DOCUMENTATION NE PEUT PLUS MENTIR.
 *
 * En 0.8.1, le README annonçait la version 0.8.0, « 192 tests », onze composants dans son schéma et
 * dix-neuf dans son titre, cinq gardes au lieu de six, et une couche `ecosysteme/` qui n'a jamais
 * existé. `NOYAU.md` en annonçait douze. Il y en avait trente-quatre.
 *
 * Chacun de ces nombres était juste le jour où il a été écrit. Un nombre écrit à la main vieillit ;
 * un nombre lu vieillit avec son sujet. Cette garde lit les sujets, et confronte les documents.
 */

const VERSION = (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version;
const README = readFileSync('README.md', 'utf8');
const NOYAU = readFileSync('noyau/NOYAU.md', 'utf8');
const INDEX = readFileSync('noyau/composants/index.ts', 'utf8');

/** Les composants, lus dans le dossier : un fichier `.tsx` est un composant. */
const COMPOSANTS = readdirSync('noyau/composants')
  .filter((fichier) => fichier.endsWith('.tsx'))
  .map((fichier) => fichier.replace('.tsx', ''))
  .sort();

/** Les nombres de composants qu'un texte annonce, en chiffres : « 34 composants ». */
function nombresAnnonces(texte: string): number[] {
  return [...texte.matchAll(/\b(\d+) composants\b/g)].map((m) => Number(m[1]));
}

describe('la version', () => {
  it('le README installe la version du manifeste', () => {
    expect(README).toContain(`#v${VERSION}`);
  });

  it('le README ne cite aucune autre version a installer', () => {
    // Une commande d installation perimee de cinq versions a vecu dans ce README.
    const citees = [...README.matchAll(/#v(\d+\.\d+\.\d+)/g)].map((m) => m[1]);
    expect(new Set(citees)).toEqual(new Set([VERSION]));
  });

  it('le badge de version dit la version du manifeste', () => {
    const badges = [...README.matchAll(/badge\/version-(\d+\.\d+\.\d+)-/g)].map((m) => m[1]);
    expect(badges.length, 'le README n a plus de badge de version').toBeGreaterThan(0);
    for (const badge of badges) expect(badge).toBe(VERSION);
  });

  it('le journal des changements a une entree pour la version du manifeste', () => {
    expect(readFileSync('CHANGELOG.md', 'utf8')).toMatch(
      new RegExp(`^## ${VERSION.replace(/\./g, '\\.')} `, 'm'),
    );
  });
});

describe('le nombre de composants', () => {
  it('README, NOYAU et index annoncent le nombre de fichiers, et aucun autre', () => {
    for (const [nom, texte] of [
      ['README.md', README],
      ['noyau/NOYAU.md', NOYAU],
      ['noyau/composants/index.ts', INDEX],
    ] as const) {
      const annonces = nombresAnnonces(texte);
      expect(annonces.length, `${nom} n annonce aucun nombre de composants`).toBeGreaterThan(0);
      for (const nombre of annonces) {
        expect(
          nombre,
          `${nom} annonce ${nombre} composants, le dossier en compte ${COMPOSANTS.length}`,
        ).toBe(COMPOSANTS.length);
      }
    }
  });

  it('le badge du README dit le meme nombre', () => {
    expect(README).toContain(`badge/composants-${COMPOSANTS.length}-`);
  });

  it('chaque composant est documente par son nom dans NOYAU et dans le README', () => {
    for (const composant of COMPOSANTS) {
      expect(NOYAU, `${composant} manque a NOYAU.md`).toContain(`\`${composant}\``);
      expect(README, `${composant} manque au README`).toContain(`\`${composant}\``);
    }
  });
});

describe('ce que le README ne doit plus affirmer', () => {
  it('ne cite aucun nombre de tests : il vieillit a chaque commit', () => {
    expect(README).not.toMatch(/\b\d+\s+tests\b/);
    expect(README).not.toMatch(/badge\/tests-/);
  });

  it('ne decrit plus une couche ecosysteme dans ce depot', () => {
    // Elle vit dans `@ai5d/auth/react`, decision 004.
    expect(README).not.toContain('ecosysteme/');
    expect(README).toContain('@ai5d/auth/react');
  });

  it('annonce autant de gardes que le module en exporte', () => {
    const gardes = [
      ...readFileSync('gardes/index.ts', 'utf8').matchAll(/^export function (verifier\w+)/gm),
    ].map((m) => m[1] ?? '');
    for (const garde of gardes)
      expect(README, `${garde} manque au README`).toContain(`\`${garde}\``);
  });

  it('ne porte aucun tiret cadratin', () => {
    // Regle du commanditaire pour tout texte produit.
    // Ecrit en echappement : la source de cette garde ne doit pas contenir le caractere qu elle refuse.
    expect(README).not.toContain('\u2014');
  });
});
