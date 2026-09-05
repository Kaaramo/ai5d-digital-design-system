import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const SOURCE = 'C:/Users/ksthe/Documents/AI5D_Brand_2026/tokens.css';
const marque = readFileSync('noyau/marque.css', 'utf8');

/** Correspondance nom local vers nom amont, identique a celle du script de synchronisation. */
const CORRESPONDANCE: Array<[string, string]> = [
  ['--marque-encre', '--ai5d-ink'],
  ['--marque-navy', '--ai5d-navy'],
  ['--marque-action', '--ai5d-blue'],
  ['--marque-action-survol', '--ai5d-blue-hover'],
  ['--marque-action-clair', '--ai5d-blue-light'],
  ['--marque-blanc', '--ai5d-white'],
];

function valeur(css: string, nom: string): string | null {
  const correspondance = new RegExp(`${nom}\\s*:\\s*(#[0-9A-Fa-f]{6})\\s*;`).exec(css);
  return correspondance ? (correspondance[1] as string).toUpperCase() : null;
}

describe('jetons de marque - forme', () => {
  it('declare exactement six jetons, la liste est fermee', () => {
    const declares = marque.match(/^\s*--[a-z-]+:/gm) ?? [];
    expect(declares.length).toBe(6);
  });

  it('prefixe tous ses jetons par --marque-, ce qui les rend intouchables', () => {
    for (const declaration of marque.match(/^\s*(--[a-z-]+):/gm) ?? []) {
      expect(declaration.trim()).toMatch(/^--marque-/);
    }
  });

  it('porte son en-tete de provenance et son empreinte', () => {
    expect(marque).toContain('GENERE par _build/synchroniser-marque.mjs');
    expect(marque).toContain(SOURCE);
    expect(marque).toMatch(/Empreinte : sha256\(16\) [0-9a-f]{16}/);
  });

  it('nomme le jeton amont en regard de chaque jeton local', () => {
    for (const [, amont] of CORRESPONDANCE) {
      expect(marque, `${amont} n'est pas trace`).toContain(amont);
    }
  });
});

describe("jetons de marque - garde d'integrite", () => {
  it("n'a pas derive de la source", () => {
    const source = readFileSync(SOURCE, 'utf8');
    for (const [local, amont] of CORRESPONDANCE) {
      const localeValeur = valeur(marque, local);
      const amontValeur = valeur(source, amont);
      expect(localeValeur, `${local} absent de marque.css`).not.toBeNull();
      expect(amontValeur, `${amont} absent de la source de marque`).not.toBeNull();
      expect(localeValeur, `${local} a derive de ${amont}. Relancer : pnpm marque`).toBe(
        amontValeur,
      );
    }
  });

  it('reproduit les valeurs de marque connues et non negociables', () => {
    expect(valeur(marque, '--marque-encre')).toBe('#051C2C');
    expect(valeur(marque, '--marque-navy')).toBe('#042A76');
    expect(valeur(marque, '--marque-action')).toBe('#2251FF');
    expect(valeur(marque, '--marque-action-survol')).toBe('#1B44DB');
    expect(valeur(marque, '--marque-action-clair')).toBe('#5B7BFF');
    expect(valeur(marque, '--marque-blanc')).toBe('#FFFFFF');
  });
});
